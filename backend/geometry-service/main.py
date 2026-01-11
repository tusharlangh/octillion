from flask import Flask, request, jsonify
import fitz
import requests
import io
from functools import lru_cache
import hashlib
from datetime import datetime, timedelta
from sentence_transformers import CrossEncoder
from dotenv import load_dotenv
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()


app = Flask(__name__)

model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")
PDF_CACHE = {}
CACHE_TTL = timedelta(minutes=10)

def get_cached_pdf(url):
    # Strip query parameters to get a stable S3 path for caching
    stable_url = url.split('?')[0]
    url_hash = hashlib.md5(stable_url.encode()).hexdigest()
    
    if url_hash in PDF_CACHE:
        cached_data, timestamp = PDF_CACHE[url_hash]
        if datetime.now() - timestamp < CACHE_TTL:
            cached_data.seek(0)
            return cached_data
        else:
            del PDF_CACHE[url_hash]
    
    print(f"Downloading PDF: {stable_url}")
    resp = requests.get(url, stream=True)
    resp.raise_for_status()
    pdf_bytes = io.BytesIO(resp.content)
    
    PDF_CACHE[url_hash] = (pdf_bytes, datetime.now())
    return pdf_bytes


@app.route("/geometry_v2/batch", methods=["POST"])
def geometry_v2_batch():
    import time
    request_start = time.time()
    
    try:
        from geometry_extractor import get_doc_id
        from geometry_persistence import get_batch_page_geometry_from_redis, get_page_geometry
        
        data = request.get_json()
        
        file_name = data.get("file_name")
        presigned_url = data.get("url")
        pages_data = data.get("pages")

        if not presigned_url or not isinstance(pages_data, list) or len(pages_data) == 0:
            return jsonify({"error": "Missing parameters"}), 400

        pdf_bytes = get_cached_pdf(presigned_url)
        pdf_bytes.seek(0)
        pdf_content = pdf_bytes.read()
        
        doc_id = get_doc_id(pdf_content)
        print(f"\n{file_name}: {len(pages_data)} pages | doc_id={doc_id[:8]}")

        page_indices = []
        page_data_map = {}
        for page_data in pages_data:
            page_input = page_data.get("page")
            if page_input is None:
                continue
                
            if isinstance(page_input, str) and page_input.lower().startswith("p"):
                page_index = int(page_input[1:]) - 1
            else:
                page_index = int(page_input) - 1
            
            page_indices.append(page_index)
            page_data_map[page_index] = page_data

        geom_start = time.time()
        cached_geometries = get_batch_page_geometry_from_redis(doc_id, page_indices)
        geometry_batch_time = (time.time() - geom_start) * 1000

        all_results = []
        
        missing_indices = [idx for idx in page_indices if not cached_geometries.get(idx)]
        if missing_indices:
            print(f"{len(missing_indices)} cache misses - computing in parallel")
            def compute_one(idx):
                return idx, get_page_geometry(doc_id, idx, pdf_content)
            
            with ThreadPoolExecutor(max_workers=min(len(missing_indices), 10)) as executor:
                futures = [executor.submit(compute_one, idx) for idx in missing_indices]
                for future in as_completed(futures):
                    idx, geom = future.result()
                    cached_geometries[idx] = geom

        for page_index in page_indices:
            page_data = page_data_map[page_index]
            page_input = page_data.get("page")
            terms = page_data.get("terms")

            if not isinstance(terms, list):
                continue

            page_geometry = cached_geometries.get(page_index)
            if not page_geometry:
                continue
            
            words_by_text = {}
            for word in page_geometry.words:
                text_lower = word.text.lower()
                if text_lower not in words_by_text:
                    words_by_text[text_lower] = []
                words_by_text[text_lower].append({
                    "x": word.x,
                    "y": word.y,
                    "x1": word.x + word.w,
                    "y1": word.y + word.h,
                    "text": text_lower
                })

            page_results = []

            for term_entry in terms:
                term = term_entry.get("term")
                matches = term_entry.get("matches", [])

                rects = []

                for match in matches:
                    bbox = match.get("bbox")
                    surface = match.get("surface", "").lower()
                    base = match.get("base", "").lower()

                    if not isinstance(bbox, list) or len(bbox) != 4:
                        continue

                    if surface in words_by_text:
                        for word_geom in words_by_text[surface]:
                            line_x0, line_y0, line_x1, line_y1 = bbox
                            word_x0, word_y0 = word_geom["x"], word_geom["y"]
                            word_x1, word_y1 = word_geom["x1"], word_geom["y1"]
                            
                            if not (word_x1 < line_x0 or word_x0 > line_x1 or 
                                    word_y1 < line_y0 or word_y0 > line_y1):
                                rects.append({
                                    "x": word_x0,
                                    "y": word_y0,
                                    "width": word_x1 - word_x0,
                                    "height": word_y1 - word_y0,
                                    "surface": surface,
                                    "base": base
                                })

                page_results.append({
                    "term": term,
                    "rects": rects,
                    "total": len(rects),
                })

            all_results.append({
                "page": page_input,
                "results": page_results
            })

        total_time = (time.time() - request_start) * 1000
        total_compute = sum(page_results_meta.get('compute', 0) for page_results_meta in all_results if isinstance(page_results_meta, dict))
        print(f"Request: {total_time:.0f}ms | Batch Redis: {geometry_batch_time:.0f}ms | Compute: {total_compute:.0f}ms\n")
        
        return jsonify({
            "file_name": file_name,
            "results": all_results
        })

    except Exception as e:
        print(f"Error processing geometry_v2_batch: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/precompute_geometry", methods=["POST"])
def precompute_geometry():
    try:
        data = request.get_json()
        presigned_url = data.get("url")
        
        if not presigned_url:
            return jsonify({"error": "Missing url parameter"}), 400
        
        threading.Thread(
            target=_precompute_all_pages,
            args=(presigned_url,),
            daemon=True
        ).start()
        
        return jsonify({"status": "queued"})
        
    except Exception as e:
        print(f"Error in precompute_geometry: {e}")
        return jsonify({"error": str(e)}), 500


def _precompute_all_pages(presigned_url):
    try:
        from geometry_extractor import get_doc_id
        from geometry_persistence import get_page_geometry
        
        pdf_bytes = get_cached_pdf(presigned_url)
        pdf_bytes.seek(0)
        pdf_content = pdf_bytes.read()
        doc_id = get_doc_id(pdf_content)
        
        pdf_bytes_io = io.BytesIO(pdf_content)
        doc = fitz.open(stream=pdf_bytes_io, filetype="pdf")
        total_pages = len(doc)
        doc.close()
        
        print(f"Starting pre-computation: {doc_id} ({total_pages} pages)")
        
        def compute_page(page_index):
            try:
                get_page_geometry(doc_id, page_index, pdf_content)
                return page_index, True
            except Exception as e:
                print(f"Failed to compute page {page_index}: {e}")
                return page_index, False
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(compute_page, i) for i in range(total_pages)]
            completed = 0
            for future in as_completed(futures):
                page_idx, success = future.result()
                if success:
                    completed += 1
        
        print(f"Pre-computation complete: {doc_id} ({completed}/{total_pages} pages)")
        
    except Exception as e:
        print(f"Pre-computation failed: {e}")
        import traceback
        traceback.print_exc()



@app.route("/parse_to_json", methods=["POST"])
def generate_canonical_json():
    data = request.get_json(silent=True) or {}
    fileName = data.get("file_name")
    presigned_url = data.get("url")

    if not presigned_url:
        return jsonify({"error": "Missing url"}), 400

    try:
        pdf_bytes = get_cached_pdf(presigned_url)
        pdf_bytes.seek(0)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except requests.RequestException as e:
        return jsonify({"error": "Failed to fetch PDF", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to open PDF", "details": str(e)}), 400

    canonical = {
        "metadata": doc.metadata,
        "page_count": doc.page_count,
        "pages": []
    }

    for page_index, page in enumerate(doc, start=1):
        page_dict = page.get_text("dict")

        page_data = {
            "page_number": page_index,
            "width": page.rect.width,
            "height": page.rect.height,
            "blocks": [],
            "file_name": fileName
        }

        for block in page_dict.get("blocks", []):
            if block["type"] == 0:
                lines = []

                for line in block.get("lines", []):
                    spans = [
                        {
                            "text": span["text"],
                            "bbox": span["bbox"],
                            "size": round(span["size"], 2),
                            "font": span["font"],
                        }
                        for span in line.get("spans", [])
                        if span.get("text")
                    ]

                    if spans:
                        lines.append({
                            "bbox": line["bbox"],
                            "spans": spans
                        })

                if lines:
                    page_data["blocks"].append({
                        "type": "text",
                        "bbox": block["bbox"],
                        "lines": lines
                    })

            elif block["type"] == 1:
                page_data["blocks"].append({
                    "type": "image",
                    "bbox": block["bbox"]
                })

        canonical["pages"].append(page_data)

    doc.close()
    return jsonify(canonical)


@app.route("/sentence_level_ranking", methods=["POST"])
def sentence_level_ranking():
    data = request.get_json()
    
    query = data.get("query")
    passages = data.get("passages")

    if not query or not passages:
        return jsonify({"error": "Missing query or passages"}), 400

    model_input = [[query, passage] for passage in passages]
    
    scores = model.predict(model_input)

    return jsonify(scores.tolist())


if __name__ == "__main__":
    app.run(debug=True, port=8000)

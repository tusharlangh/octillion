from flask import Flask, request, jsonify
import fitz
import requests
import io
from functools import lru_cache
import hashlib
from datetime import datetime, timedelta
from sentence_transformers import CrossEncoder


app = Flask(__name__)

model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")
PDF_CACHE = {}
CACHE_TTL = timedelta(minutes=10)

def get_cached_pdf(url):
    url_hash = hashlib.md5(url.encode()).hexdigest()
    
    if url_hash in PDF_CACHE:
        cached_data, timestamp = PDF_CACHE[url_hash]
        if datetime.now() - timestamp < CACHE_TTL:
            return cached_data
        else:
            del PDF_CACHE[url_hash]
    
    resp = requests.get(url, stream=True)
    resp.raise_for_status()
    pdf_bytes = io.BytesIO(resp.content)
    
    PDF_CACHE[url_hash] = (pdf_bytes, datetime.now())
    
    return pdf_bytes


@app.route("/geometry_v2/batch", methods=["POST"])
def geometry_v2_batch():
    try:
        data = request.get_json()
        
        file_name = data.get("file_name")
        presigned_url = data.get("url")
        pages_data = data.get("pages")

        if not presigned_url or not isinstance(pages_data, list) or len(pages_data) == 0:
            return jsonify({"error": "Missing parameters"}), 400

        pdf_bytes = get_cached_pdf(presigned_url)
        pdf_bytes.seek(0)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        all_results = []

        for page_data in pages_data:
            page_input = page_data.get("page")
            terms = page_data.get("terms")

            if page_input is None or not isinstance(terms, list):
                continue

            if isinstance(page_input, str) and page_input.lower().startswith("p"):
                page_index = int(page_input[1:]) - 1
            else:
                page_index = int(page_input) - 1

            if page_index < 0 or page_index >= len(doc):
                continue

            page = doc[page_index]
            page_rect = page.rect

            words = page.get_text("words")
            words_by_rect = [
                {
                    "rect": fitz.Rect(w[:4]),
                    "text": w[4].lower(),
                    "raw": w
                }
                for w in words
            ]

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

                    row_rect = fitz.Rect(*bbox) & page_rect
                    if row_rect.is_empty:
                        continue

                    for w in words_by_rect:
                        if not w["rect"].intersects(row_rect):
                            continue

                        if w["text"] == surface:
                            x0, y0, x1, y1 = w["raw"][:4]
                            rects.append({
                                "x": x0,
                                "y": y0,
                                "width": x1 - x0,
                                "height": y1 - y0,
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

        doc.close()

        return jsonify({
            "file_name": file_name,
            "results": all_results
        })

    except Exception as e:
        print(f"Error processing geometry_v2_batch: {e}")
        return jsonify({"error": str(e)}), 500


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

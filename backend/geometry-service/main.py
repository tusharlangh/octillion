from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import requests
import io

app = Flask(__name__)

@app.route("/geometry_v2", methods=["POST"])
def geometry_v2():
    try:
        data = request.get_json()
        fileName = data.get("file_name")
        presigned_url = data.get("url")
        query = data.get("query")
        bboxes = data.get("bboxes")
        matches = data.get("matches")
        page_input = data.get("page")

        print(bboxes)
        print("length ", len(bboxes))

        if (
            not presigned_url or
            not query or
            not isinstance(bboxes, list) or
            not isinstance(matches, list) or
            page_input is None
        ):
            return jsonify({
                "error": "Missing parameters (url, query, bboxes[], matches[], page)"
            }), 400

        if isinstance(page_input, str) and page_input.lower().startswith("p"):
            page_index = int(page_input[1:]) - 1
        else:
            page_index = int(page_input) - 1

        resp = requests.get(presigned_url, stream=True)
        resp.raise_for_status()

        pdf_bytes = io.BytesIO(resp.content)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if page_index < 0 or page_index >= len(doc):
            return jsonify({"error": "Page number out of range"}), 400

        page = doc[page_index]
        page_rect = page.rect

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

            words = page.get_text("words", clip=row_rect)

            for w in words:
                x0, y0, x1, y1, text = w[:5]
                text_lower = text.lower()

                if text_lower == surface:
                    rects.append({
                        "x": x0,
                        "y": y0,
                        "width": x1 - x0,
                        "height": y1 - y0,
                        "surface": text,
                        "base": base
                    })

        doc.close()

        return jsonify({
            "file_name": fileName,
            "page": page_input,
            "query": query,
            "rects": rects,
            "total": len(rects)
        })

    except Exception as e:
        print(f"Error processing geometry_v2: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/parse_to_json", methods=["POST"])
def generate_canonical_json():
    data = request.get_json(silent=True) or {}
    fileName = data.get("file_name")
    presigned_url = data.get("url")

    if not presigned_url:
        return jsonify({"error": "Missing url"}), 400

    try:
        resp = requests.get(presigned_url)
        resp.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": "Failed to fetch PDF", "details": str(e)}), 400

    doc = fitz.open(stream=resp.content, filetype="pdf")

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


if __name__ == "__main__":

    app.run(debug=True, port=8000)

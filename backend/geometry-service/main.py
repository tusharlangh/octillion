"""
import fitz
import boto3
from io import BytesIO

s3 = boto3.client("s3")

def handler(event, context):
    bucket = event["bucket"]
    key = event["key"]
    page_no = event["page"]
    query = event["query"]

    pdf_bytes = s3.get_object(Bucket=bucket, Key=key)["Body"].read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc[page_no - 1]

    results = page.search_for(query)
    w, h = page.rect.width, page.rect.height
    rects = [{"l": r.x0/w*100, "t": r.y0/h*100, "w": r.width/w*100, "h": r.height/h*100} for r in results]

    doc.close()
    return {"page": page_no, "rects": rects}
"""


from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import requests

app = Flask(__name__)

@app.route("/geometry", methods=["POST"])
def geometry():
    data = request.get_json()
    presigned_url = data.get("url")
    query = data.get("query")

    if not presigned_url or not query:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        resp = requests.get(presigned_url)
        resp.raise_for_status()
        pdf_bytes = resp.content

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        result = []

        for page_index in range(len(doc)):
            page = doc[page_index]
            words = page.get_text("words")  # [x0, y0, x1, y1, word, block_no, line_no, word_no]

            rects = []
            for w in words:
                x0, y0, x1, y1, word = w[:5]
                if word.lower() == query.lower():  # exact match
                    rects.append({
                        "x": x0,
                        "y": y0,
                        "width": x1 - x0,
                        "height": y1 - y0
                    })

            if rects:
                result.append({
                    "page": page_index,
                    "rects": rects,
                    "total": len(rects)
                })

        doc.close()
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/parse_to_json", methods=["POST"])
def generate_canonical_json():
    data = request.get_json()
    presigned_url = data.get("url")

    if not presigned_url:
        return jsonify({"error": "Missing parameters"}), 400

    resp = requests.get(presigned_url)
    resp.raise_for_status()
    pdf_bytes = resp.content

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    canonical_data = {
        "metadata": doc.metadata,
        "page_count": doc.page_count,
        "pages": []
    }
    for page_num, page in enumerate(doc):
        text_dict = page.get_text("dict")
    
        page_width = page.rect.width
        page_height = page.rect.height
        
        blocks = []
        for block in text_dict.get("blocks", []):
            if block["type"] == 0:
                clean_lines = []
                for line in block["lines"]:
                    clean_spans = []
                    for span in line["spans"]:
                        clean_spans.append({
                            "text": span["text"],
                            "bbox": span["bbox"],  
                            "size": round(span["size"], 2),
                            "font": span["font"],
                        })
                    
                    if clean_spans:
                        clean_lines.append({
                            "bbox": line["bbox"],
                            "spans": clean_spans,
                        })
                if clean_lines:
                    blocks.append({
                        "type": "text",
                        "bbox": block["bbox"],
                        "lines": clean_lines
                    })
            elif block["type"] == 1:
                blocks.append({
                    "type": "image",
                    "bbox": block["bbox"]
                })
        canonical_data["pages"].append({
            "page_number": page_num + 1, 
            "width": page_width,
            "height": page_height,
            "blocks": blocks
        })
    
    doc.close()
    return canonical_data

if __name__ == "__main__":
    app.run(debug=True, port=8000)

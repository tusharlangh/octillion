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
    """
    Returns exact word coordinates for a given search term.
    """
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

if __name__ == "__main__":
    app.run(debug=True, port=8000)

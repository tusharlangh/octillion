import fitz  # PyMuPDF


def generate_canonical_json(pdf_path):
    doc = fitz.open(pdf_path)
    
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
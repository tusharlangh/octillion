import hashlib
import fitz
from geometry_schema import PageGeometry, GeometryWord

def get_doc_id(pdf_bytes):
    return hashlib.sha256(pdf_bytes).hexdigest()[:16]


def compute_page_geometry(doc, page_index):
    if page_index < 0 or page_index >= len(doc):
        raise IndexError(f"Page index {page_index} out of range [0, {len(doc)-1}]")
    
    page = doc[page_index]
    page_rect = page.rect
    raw_words = page.get_text("words")
    
    words = []
    for w in raw_words:
        x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
        words.append(GeometryWord(
            text=text,
            x=x0,
            y=y0,
            w=x1 - x0,
            h=y1 - y0
        ))
    
    return PageGeometry(
        page=page_index + 1,
        width=page_rect.width,
        height=page_rect.height,
        words=words
    )
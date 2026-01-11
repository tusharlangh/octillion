import io
import fitz
from concurrent.futures import ThreadPoolExecutor, as_completed
from geometry_schema import PageGeometry, SCHEMA_VERSION
from geometry_extractor import get_doc_id, compute_page_geometry
from geometry_cache import (
    get_redis_client,
    GEOMETRY_REDIS_TTL
)


def _get_redis_key(doc_id, page_index):
    return f"geometry:{SCHEMA_VERSION}:{doc_id}:{page_index}"


def get_batch_page_geometry_from_redis(doc_id, page_indices):
    redis = get_redis_client()
    if not redis or not page_indices:
        return {idx: None for idx in page_indices}
    
    def fetch_one(page_idx):
        try:
            key = _get_redis_key(doc_id, page_idx)
            data = redis.get(key)
            
            if data:
                if isinstance(data, str):
                    data = data.encode('utf-8')
                return page_idx, PageGeometry.from_json(data, compressed=False)
            return page_idx, None
        except Exception as e:
            print(f"Redis get failed for page {page_idx}: {e}")
            return page_idx, None
    
    try:
        geometries = {}
        
        with ThreadPoolExecutor(max_workers=min(len(page_indices), 20)) as executor:
            futures = {executor.submit(fetch_one, idx): idx for idx in page_indices}
            
            for future in as_completed(futures):
                page_idx, geometry = future.result()
                geometries[page_idx] = geometry
        
        hits = sum(1 for g in geometries.values() if g is not None)
        print(f"Redis parallel: {hits}/{len(page_indices)} hits")
        return geometries
        
    except Exception as e:
        print(f"Redis parallel fetch failed: {e}")
        import traceback
        traceback.print_exc()
        return {idx: None for idx in page_indices}


def get_page_geometry_from_redis(doc_id, page_index):
    redis = get_redis_client()
    if not redis:
        return None
    
    try:
        key = _get_redis_key(doc_id, page_index)
        data = redis.get(key)
        
        if data:
            if isinstance(data, str):
                data = data.encode('utf-8')
            return PageGeometry.from_json(data, compressed=False)
        
    except Exception as e:
        print(f"Redis get failed: {e}")
    
    return None


def save_page_geometry_to_redis(doc_id, page_index, geometry):
    redis = get_redis_client()
    if not redis:
        return
    
    try:
        key = _get_redis_key(doc_id, page_index)
        data = geometry.to_json(compress=False)
        data_str = data.decode('utf-8')
        redis.setex(key, GEOMETRY_REDIS_TTL, data_str)
        
    except Exception as e:
        print(f"Redis set failed: {e}")


def get_page_geometry(doc_id, page_index, pdf_bytes):
    geometry = get_page_geometry_from_redis(doc_id, page_index)
    if geometry:
        print(f"✓ Redis hit: {doc_id} page {page_index}")
        return geometry
    
    print(f"Cache miss - computing: {doc_id} page {page_index}")
    pdf_bytes_io = io.BytesIO(pdf_bytes)
    doc = fitz.open(stream=pdf_bytes_io, filetype="pdf")
    
    try:
        geometry = compute_page_geometry(doc, page_index)
    finally:
        doc.close()
    
    save_page_geometry_to_redis(doc_id, page_index, geometry)
    
    return geometry
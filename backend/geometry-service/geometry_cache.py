import os
from upstash_redis import Redis
from dotenv import load_dotenv

load_dotenv()

UPSTASH_REDIS_URL = os.getenv("UPSTASH_REDIS_URL")
UPSTASH_REDIS_TOKEN = os.getenv("UPSTASH_REDIS_TOKEN")

GEOMETRY_REDIS_TTL = int(os.getenv("GEOMETRY_REDIS_TTL", "3600"))

_redis_client = None


def get_redis_client():
    global _redis_client
    
    if _redis_client:
        return _redis_client
    
    if not UPSTASH_REDIS_URL or not UPSTASH_REDIS_TOKEN:
        print("Warning: Upstash Redis not configured")
        return None
    
    try:
        _redis_client = Redis(url=UPSTASH_REDIS_URL, token=UPSTASH_REDIS_TOKEN)
        _redis_client.ping()
        print(f"Upstash Redis connected: {UPSTASH_REDIS_URL}")
        return _redis_client
    except Exception as e:
        print(f"Upstash Redis connection failed: {e}")
        _redis_client = None
        return None
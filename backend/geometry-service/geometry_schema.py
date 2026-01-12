from dataclasses import dataclass, asdict
import json
import gzip

SCHEMA_VERSION = "v1"


@dataclass
class GeometryWord:
    text: str
    x: float
    y: float
    w: float
    h: float


@dataclass
class PageGeometry:
    page: int
    width: float
    height: float
    words: list
    
    def to_json(self, compress=False):
        data = {
            "page": self.page,
            "width": self.width,
            "height": self.height,
            "words": [asdict(w) for w in self.words]
        }
        json_str = json.dumps(data, separators=(',', ':'))
        json_bytes = json_str.encode('utf-8')
        
        if compress:
            return gzip.compress(json_bytes)
        return json_bytes
    
    @staticmethod
    def from_json(data, compressed=False):
        if compressed:
            data = gzip.decompress(data)
        
        obj = json.loads(data.decode('utf-8'))
        words = [GeometryWord(**w) for w in obj["words"]]
        
        return PageGeometry(
            page=obj["page"],
            width=obj["width"],
            height=obj["height"],
            words=words
        )
import base64
import os
from typing import Any, Dict, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Regional Language Multimodal AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    image: Optional[str] = None
    language: str = "hi"


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"status": "ok", "service": "regional-language-ai"}


@app.post("/predict")
def predict(payload: PredictRequest) -> Dict[str, Any]:
    image = payload.image or ""
    language = payload.language or "hi"

    # Demo response that matches the frontend contract.
    response = {
        "text": "नमस्ते",
        "translation": "Hello",
        "audio": "",
        "emoji": "👋",
        "gesture": "hello",
        "confidence": 0.96,
        "language": language,
        "image_received": bool(image),
    }

    if image:
        try:
            # basic validation to ensure the payload is a base64 data URL
            if image.startswith("data:image"):
                _, _, data = image.partition(",")
                if data:
                    decoded = base64.b64decode(data)
                    response["ImageSizeBytes"] = len(decoded)
        except Exception:
            pass

    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend_server:app", host="0.0.0.0", port=8000, reload=False)

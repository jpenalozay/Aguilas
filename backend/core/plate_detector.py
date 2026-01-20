
import asyncio
import cv2
import numpy as np
import pytesseract
import re
import os
from typing import Dict, Any, Tuple
from inference_sdk import InferenceHTTPClient

# Configuración Roboflow
API_URL = "https://serverless.roboflow.com"
API_KEY = "Xekc75ienOgW1yGih9US"
MODEL_ID = "deteccion-de-placas-peruanas-ybiq9/2"

# initialize client once
client = InferenceHTTPClient(api_url=API_URL, api_key=API_KEY)

def extract_plate_text_sync(img: np.ndarray, bbox: Tuple[int, int, int, int]) -> Tuple[str, float]:
    """
    Synchronous OCR logic using Tesseract.
    """
    x, y, w, h = bbox
    # Ensure coordinates are within image bounds
    height, width = img.shape[:2]
    x1, y1 = max(0, int(x - w/2)), max(0, int(y - h/2))
    x2, y2 = min(width, int(x + w/2)), min(height, int(y + h/2))
    
    padding = 10
    x1, y1 = max(0, x1 - padding), max(0, y1 - padding)
    x2, y2 = min(width, x2 + padding), min(height, y2 + padding)
    
    plate_img = img[y1:y2, x1:x2]
    if plate_img.size == 0: return "", 0.0
    
    # Image Preprocessing
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    scale = 4.0
    gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-'
    try:
        text = pytesseract.image_to_string(binary, config=custom_config).strip().upper()
        # Cleaning
        text = re.sub(r'[^A-Z0-9-]', '', text)
        if len(text) >= 4:
            if '-' not in text and len(text) >= 6: text = text[:3] + '-' + text[3:6]
            return text, 0.85
    except Exception as e:
        print(f"OCR Error: {e}")
        pass
    return "", 0.0

def run_roboflow_inference_sync(img: np.ndarray) -> Any:
    """
    Synchronous wrapper for Roboflow inference. 
    Writes temp file because SDK might perform better or require file path in some versions.
    """
    temp_filename = f"temp_{os.getpid()}_{np.random.randint(0,10000)}.jpg"
    cv2.imwrite(temp_filename, img)
    try:
        result = client.infer(temp_filename, model_id=MODEL_ID)
        return result
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

async def detect_plate_real(frame_bytes: bytes) -> Dict[str, Any]:
    """
    Real implementation of plate detection using Roboflow + Tesseract.
    Returns: {"found": bool, "plate": str, "coords": str}
    """
    try:
        loop = asyncio.get_event_loop()
        
        # Decode image
        nparr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"found": False, "plate": "0", "coords": "0"}

        # Run Inference in Thread
        result = await loop.run_in_executor(None, run_roboflow_inference_sync, img)
        
        if 'predictions' in result and result['predictions']:
            best_p = result['predictions'][0]
            bbox = (best_p['x'], best_p['y'], best_p['width'], best_p['height'])
            
            # Run OCR in Thread
            plate_text, confidence = await loop.run_in_executor(None, extract_plate_text_sync, img, bbox)
            
            if plate_text:
                coords = f"{int(best_p['x'])},{int(best_p['y'])}"
                return {
                    "found": True,
                    "plate": plate_text,
                    "coords": coords,
                    "confidence": confidence
                }

    except Exception as e:
        print(f"Error in detect_plate_real: {e}")
    
    return {"found": False, "plate": "0", "coords": "0"}

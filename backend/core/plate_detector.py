
import asyncio
import cv2
import numpy as np
import os
import easyocr
import logging
from typing import Dict, Any, Tuple
from inference_sdk import InferenceHTTPClient

# Suppress EasyOCR Logs (if any)
logging.getLogger("easyocr").setLevel(logging.ERROR)

# Configuración Roboflow
API_URL = "https://serverless.roboflow.com"
API_KEY = "Xekc75ienOgW1yGih9US"
MODEL_ID = "deteccion-de-placas-peruanas-ybiq9/2"

# Initialize Roboflow Client
client = InferenceHTTPClient(api_url=API_URL, api_key=API_KEY)

# Initialize EasyOCR (Global Singleton)
# 'en' covers text. gpu=False by default to be safe, but True if available.
# We will disable gpu explicitely to avoid CUDA vs CPU issues unless user has setup.
# Actually, let's let EasyOCR decide (default is True if available).
reader = easyocr.Reader(['en'], gpu=True, verbose=False)

def run_easy_ocr_sync(img: np.ndarray) -> Tuple[str, float]:
    """
    Synchronous EasyOCR inference.
    """
    try:
        # EasyOCR expects RGB or BGR. 
        # readtext returns a list of tuples: (bbox, text, prob)
        result = reader.readtext(img)
        
        # Check if any text detected
        if not result:
            return "", 0.0
            
        # Select the best result (highest confidence or longest string?)
        # For plates, usually the single main text block.
        best_text = ""
        best_conf = 0.0
        
        for (bbox, text, prob) in result:
            if prob > best_conf:
                best_conf = prob
                best_text = text
                
        # Clean text
        import re
        clean_text = re.sub(r'[^A-Z0-9-]', '', best_text.upper())
        
        if len(clean_text) >= 3:
             # Basic formatting for Peru-style if needed
             if '-' not in clean_text and len(clean_text) == 6:
                 clean_text = clean_text[:3] + '-' + clean_text[3:]
                 
             return clean_text, best_conf

    except Exception as e:
        print(f"EasyOCR Error: {e}")
    
    return "", 0.0

def run_roboflow_inference_sync(img: np.ndarray) -> Any:
    """
    Synchronous wrapper for Roboflow inference. 
    """
    temp_filename = f"temp_{os.getpid()}_{np.random.randint(0,10000)}.jpg"
    try:
        cv2.imwrite(temp_filename, img)
        result = client.infer(temp_filename, model_id=MODEL_ID)
        return result
    except Exception as e:
        print(f"Roboflow Error: {e}")
        return {}
    finally:
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except: pass

async def detect_plate_real(frame_bytes: bytes) -> Dict[str, Any]:
    """
    Real implementation using Roboflow (Detection) + EasyOCR (Recognition).
    """
    try:
        loop = asyncio.get_event_loop()
        
        # Decode image
        nparr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"found": False, "plate": "0", "coords": "0"}

        # 1. Run Detection (Roboflow)
        result = await loop.run_in_executor(None, run_roboflow_inference_sync, img)
        
        if result and 'predictions' in result and result['predictions']:
            best_p = result['predictions'][0]
            
            # Extract coordinates
            x, y, w, h = best_p['x'], best_p['y'], best_p['width'], best_p['height']
            height, width = img.shape[:2]
            
            # Safe Crop with padding
            pad = 5
            x1 = max(0, int(x - w/2) - pad)
            y1 = max(0, int(y - h/2) - pad)
            x2 = min(width, int(x + w/2) + pad)
            y2 = min(height, int(y + h/2) + pad)
            
            plate_crop = img[y1:y2, x1:x2]
            
            if plate_crop.size > 0:
                # 2. Run Recognition (EasyOCR)
                # Run in thread executor
                plate_text, confidence = await loop.run_in_executor(None, run_easy_ocr_sync, plate_crop)
                
                if plate_text:
                    coords = f"{int(x)},{int(y)}"
                    return {
                        "found": True,
                        "plate": plate_text,
                        "coords": coords,
                        "confidence": float(confidence),
                        "ocr_backend": "EasyOCR"
                    }

    except Exception as e:
        print(f"Error in detect_plate_real: {e}")
    
    return {"found": False, "plate": "0", "coords": "0"}

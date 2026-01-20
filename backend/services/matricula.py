import asyncio
import json
import os
import cv2
import numpy as np
import pytesseract
import re
from typing import Dict, Union, List, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile
from pydantic import BaseModel
from inference_sdk import InferenceHTTPClient

app = FastAPI(title="Sistema de Detección en Tiempo Real")

# Configuración Roboflow (Extraída de inference_test.py)
API_URL = "https://serverless.roboflow.com"
API_KEY = "Xekc75ienOgW1yGih9US"
MODEL_ID = "deteccion-de-placas-peruanas-ybiq9/2"

client = InferenceHTTPClient(api_url=API_URL, api_key=API_KEY)

# --- Modelos de Datos para la Respuesta ---

class DetectionResult(BaseModel):
    vehicle: Union[Dict[str, Any], int]
    plate: Union[Dict[str, Any], int]
    weapon: Union[Dict[str, Any], int]

# --- Funciones de Detección (Simuladas) ---

async def detect_vehicle(frame_bytes: bytes) -> Union[Dict[str, Any], int]:
    """
    Simula la detección de vehículos.
    """
    # En un entorno real, aquí se llamaría al modelo (ej. YOLO)
    await asyncio.sleep(0.01)  # Simular latencia de procesamiento
    
    # Simulación: Detección positiva 50% de las veces
    import random
    if random.random() > 0.5:
        return {
            "type": "SUV",
            "coords": [100, 150, 400, 450]
        }
    return 0

def extract_plate_text_sync(img, bbox):
    """Lógica de OCR extraída de inference_test.py ejecutada de forma sincrónica."""
    x, y, w, h = bbox
    x1, y1 = max(0, int(x - w/2)), max(0, int(y - h/2))
    x2, y2 = min(img.shape[1], int(x + w/2)), min(img.shape[0], int(y + h/2))
    
    padding = 10
    x1, y1 = max(0, x1 - padding), max(0, y1 - padding)
    x2, y2 = min(img.shape[1], x2 + padding), min(img.shape[0], y2 + padding)
    
    plate_img = img[y1:y2, x1:x2]
    if plate_img.size == 0: return "", 0.0
    
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
        text = re.sub(r'[^A-Z0-9-]', '', text)
        if len(text) >= 4:
            if '-' not in text and len(text) >= 6: text = text[:3] + '-' + text[3:6]
            return text, 0.85
    except: pass
    return "", 0.0

async def detect_plate(frame_bytes: bytes) -> Union[Dict[str, Any], int]:
    """
    Detección de placas usando Roboflow y Tesseract de forma asíncrona.
    """
    try:
        # Convertir bytes a imagen OpenCV
        nparr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Inferencia Roboflow (ejecutada en hilo separado para no bloquear)
        # Guardamos temporalmente para el SDK que prefiere archivos o numpy
        temp_filename = f"temp_{asyncio.get_event_loop().time()}.jpg"
        cv2.imwrite(temp_filename, img)
        
        result = await asyncio.to_thread(client.infer, temp_filename, model_id=MODEL_ID)
        os.remove(temp_filename)
        
        if 'predictions' in result and result['predictions']:
            best_p = result['predictions'][0] # Tomamos la mejor detección
            bbox = (best_p['x'], best_p['y'], best_p['width'], best_p['height'])
            
            # OCR (ejecutado en hilo separado)
            plate_text, confidence = await asyncio.to_thread(extract_plate_text_sync, img, bbox)
            
            return {
                "id": plate_text if plate_text else "No detectada",
                "confidence": best_p['confidence'],
                "coords": [int(best_p['x']-best_p['width']/2), int(best_p['y']-best_p['height']/2), 
                           int(best_p['x']+best_p['width']/2), int(best_p['y']+best_p['height']/2)]
            }
    except Exception as e:
        print(f"Error en detect_plate real: {e}")
    
    return 0

async def detect_weapon(frame_bytes: bytes) -> Union[Dict[str, Any], int]:
    """
    Simula la detección de armas.
    """
    await asyncio.sleep(0.01)
    
    import random
    if random.random() > 0.9: # Baja probabilidad de armas
        return {
            "type": "Pistol",
            "coords": [50, 50, 80, 80]
        }
    return 0

# --- Componente de Respuesta / Orquestador ---

async def process_frame_parallel(frame_bytes: bytes) -> Dict[str, Any]:
    """
    Envía el fotograma a las 3 funciones en paralelo y consolida el resultado.
    """
    # Ejecutamos las tres funciones de forma paralela
    results = await asyncio.gather(
        detect_vehicle(frame_bytes),
        detect_plate(frame_bytes),
        detect_weapon(frame_bytes)
    )
    
    # Consolidamos en el formato JSON solicitado
    response = {
        "vehicle": results[0],
        "plate": results[1],
        "weapon": results[2]
    }
    return response

# --- Endpoints ---

@app.post("/analyze")
async def analyze_frame_bytes(file: bytes = File(...)):
    """
    Endpoint HTTP solicitado para análisis de un solo fotograma.
    """
    result = await process_frame_parallel(file)
    return result

@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    """
    Endpoint de WebSocket para procesamiento de video en tiempo real.
    Garantiza el procesamiento secuencial: recibe un frame, lo procesa, responde, 
    y recién ahí queda listo para recibir el siguiente.
    """
    await websocket.accept()
    print("Cliente conectado vía WebSocket")
    
    try:
        while True:
            # Recibimos el fotograma en formato bytes
            # El backend espera aquí (await) asegurando la secuencialidad
            frame_bytes = await websocket.receive_bytes()
            
            # Procesamos el fotograma (las detecciones internas son paralelas)
            detection_json = await process_frame_parallel(frame_bytes)
            
            # Imprimir coordenadas en consola para verificación
            if detection_json["plate"] != 0:
                coords = detection_json["plate"]["coords"]
                print(f"[BACKEND] Placa DETECTADA: {detection_json['plate']['id']} en Coordenadas: {coords}")
            
            # Enviamos la respuesta consolidada al frontend
            await websocket.send_json(detection_json)
            
    except WebSocketDisconnect:
        print("Cliente desconectado")
    except Exception as e:
        print(f"Error en el socket: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    # Ejecutar en el puerto 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)


import React from 'react';

export const LOCATIONS = [
  'Av. Salaverry / Av. San Felipe',
  'Parque Próceres de la Independencia',
  'Jr. Huamachuco / Av. Brasil',
  'Plaza San José',
  'Av. Faustino Sánchez Carrión'
];

export const PYTHON_CORE_CODE = `
# ==============================================================================
# EAGLE EYE LIMA - BACKEND DE ALTA VELOCIDAD (BYTES RAW)
# Optimización: Binario Puro para mínima latencia en procesamiento de video.
# ==============================================================================

from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
from ultralytics import YOLO
import io

app = FastAPI()

# Inicialización del modelo en GPU (si está disponible)
model = YOLO('yolov8x.pt') 

@app.post("/analyze_frame_bytes")
async def analyze_frame_bytes(file: bytes = File(...)):
    """
    Recibe el fotograma directamente en BYTES.
    Evita el costo computacional de decodificar Base64.
    """
    try:
        # 1. Convertir BYTES raw a formato de imagen OpenCV (In-memory)
        # No guardamos en disco, procesamos directamente desde el buffer
        nparr = np.frombuffer(file, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"error": "Formato de imagen inválido"}

        # 2. Inferencia de IA (Detección de Vehículos y Armas)
        results = model.predict(frame, conf=0.45, verbose=False)
        
        detections = []
        for r in results:
            for box in r.boxes:
                # Extraemos coordenadas de la 'Caja' (Bounding Box)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                label = model.names[int(box.cls[0])]
                confidence = float(box.conf[0])

                # 3. Lógica de Negocio: Detección de Placas si es un vehículo
                plate_data = None
                if label in ["car", "motorcycle", "truck"]:
                    # Aquí llamarías a tu sub-modelo de OCR (ej: PaddleOCR)
                    # plate_data = ocr_model.read(frame[int(y1):int(y2), int(x1):int(x2)])
                    pass

                detections.append({
                    "type": label.upper(),
                    "confidence": round(confidence, 2),
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "critical": label in ["weapon", "pistol", "knife"]
                })

        # 4. Respuesta síncrona inmediata
        return {
            "detections": detections,
            "count": len(detections),
            "engine": "YOLOv8-X-Core"
        }

    except Exception as e:
        return {"error": str(e)}

# NOTA PARA EL FRONTEND:
# Para enviar bytes desde el navegador usarías:
# const blob = await canvas.toBlob(b => fetch('/analyze_frame_bytes', {body: b, method: 'POST'}));
`;

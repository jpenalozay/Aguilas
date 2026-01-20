
import asyncio
import os
import sys

# Add backend to path to import core modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.plate_detector import detect_plate_real

async def test_image():
    # Path to the user's test image
    image_path = r"c:\Users\jlpy\Documents\Proyectos\Aguilas\images\placa_prueba_1.png"
    
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    print(f"Loading image from {image_path}...")
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    print("Sending to Plate Detector (Roboflow + Tesseract)...")
    
    # DEBUG: Run raw inference to see what Roboflow says
    from core.plate_detector import run_roboflow_inference_sync
    import cv2
    import numpy as np
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    print("\n--- RAW ROBOFLOW RESPONSE ---")
    raw_result = run_roboflow_inference_sync(img)
    print(raw_result)
    print("-----------------------------\n")

    try:
        result = await detect_plate_real(image_bytes)
        print("\n--- RESULTADO DE LA PRUEBA ---")
        print(f"Encontrada: {result['found']}")
        print(f"Placa: {result['plate']}")
        print(f"Coordenadas: {result['coords']}")
        print(f"Confianza: {result.get('confidence', 'N/A')}")
        print("------------------------------\n")
        
        if result['found']:
            print("SUCCESS: El modelo funciona y reconoció la placa.")
        else:
            print("WARNING: El modelo funcionó pero no encontró placa (o la imagen es difícil).")
            
    except Exception as e:
        print(f"ERROR CRÍTICO: {e}")

if __name__ == "__main__":
    asyncio.run(test_image())


"""
Frame Analysis Module
Implements the 3 parallel detection functions.
Refactored to support direct bytes input and real plate detection.
"""
import asyncio
import random
import base64
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any
from core.plate_detector import detect_plate_real

# Thread pool for CPU-intensive tasks
executor = ThreadPoolExecutor(max_workers=3)

def detect_vehicle_attributes(frame_bytes: bytes) -> Dict[str, Any]:
    # Mock implementation
    if random.random() > 0.6:
        vehicle_types = ["AUTO", "MOTO", "BUS", "TRUCK", "CAMIONETA"]
        return {
            "found": True,
            "type": random.choice(vehicle_types),
            "coords": f"{random.randint(50, 500)},{random.randint(50, 300)}"
        }
    return {"found": False, "type": "0", "coords": "0"}

def detect_weapon_threat(frame_bytes: bytes) -> Dict[str, Any]:
    # Mock implementation
    if random.random() > 0.95:
        weapon_types = ["PISTOLA", "RIFLE", "ARMA_CORTA"]
        return {
            "found": True,
            "weapon_type": random.choice(weapon_types),
            "coords": f"{random.randint(200, 400)},{random.randint(100, 300)}"
        }
    return {"found": False, "weapon_type": "0", "coords": "0"}

async def analyze_frame_bytes(frame_bytes: bytes) -> Dict[str, Any]:
    """
    Main orchestrator function (Bytes Input).
    """
    try:
        loop = asyncio.get_event_loop()
        
        # Parallel Execution
        # 1. Vehicle (Mock) - runs in thread
        vehicle_task = loop.run_in_executor(executor, detect_vehicle_attributes, frame_bytes)
        
        # 2. Plate (REAL) - is already async/threaded internally
        plate_task = detect_plate_real(frame_bytes)
        
        # 3. Weapon (Mock) - runs in thread
        weapon_task = loop.run_in_executor(executor, detect_weapon_threat, frame_bytes)
        
        # Wait for all
        vehicle_result, plate_result, weapon_result = await asyncio.gather(
            vehicle_task, plate_task, weapon_task
        )
        
        return {
            "status": "success",
            "detections": {
                "vehicle": vehicle_result,
                "plate": plate_result,
                "weapon": weapon_result
            },
            "timestamp": loop.time()
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        return {
            "status": "error",
            "message": str(e),
            "detections": {}
        }

async def analyze_frame(frame_data_b64: str) -> Dict[str, Any]:
    """
    Legacy wrapper for Base64 input (if needed).
    """
    if ',' in frame_data_b64:
        frame_data_b64 = frame_data_b64.split(',')[1]
    image_bytes = base64.b64decode(frame_data_b64)
    return await analyze_frame_bytes(image_bytes)

"""
Frame Analysis Module
Implements the 3 parallel detection functions for vehicle, license plate, and weapon detection.
"""
import asyncio
import random
import base64
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any
import io
from PIL import Image

# Thread pool for CPU-intensive tasks
executor = ThreadPoolExecutor(max_workers=3)


def detect_vehicle_attributes(frame_data: bytes) -> Dict[str, Any]:
    """
    Detects vehicle type and location in the frame.
    
    Args:
        frame_data: Raw image bytes
        
    Returns:
        {
            "found": bool,
            "type": str,  # "AUTO", "MOTO", "BUS", "TRUCK"
            "coords": str  # "x,y" format
        }
    """
    # Mock implementation - randomly detect vehicles
    # In production, this would use YOLO or similar CV model
    
    if random.random() > 0.6:  # 40% chance of detection
        vehicle_types = ["AUTO", "MOTO", "BUS", "TRUCK", "CAMIONETA"]
        return {
            "found": True,
            "type": random.choice(vehicle_types),
            "coords": f"{random.randint(50, 500)},{random.randint(50, 300)}"
        }
    else:
        return {"found": False, "type": "0", "coords": "0"}


def detect_license_plate(frame_data: bytes) -> Dict[str, Any]:
    """
    Detects license plate and extracts plate number.
    
    Args:
        frame_data: Raw image bytes
        
    Returns:
        {
            "found": bool,
            "plate": str,  # Plate number or "0"
            "coords": str  # "x,y" format
        }
    """
    # Mock implementation - randomly generate plates
    # In production, this would use OCR (Tesseract/EasyOCR) + plate detection
    
    if random.random() > 0.7:  # 30% chance of detection
        plate_prefixes = ["BKA", "LMA", "P0X", "Z9I", "AXE", "C4T"]
        plate_number = f"{random.choice(plate_prefixes)}-{random.randint(100, 999)}"
        return {
            "found": True,
            "plate": plate_number,
            "coords": f"{random.randint(100, 400)},{random.randint(150, 250)}"
        }
    else:
        return {"found": False, "plate": "0", "coords": "0"}


def detect_weapon_threat(frame_data: bytes) -> Dict[str, Any]:
    """
    Detects weapons (firearms) in the frame.
    
    Args:
        frame_data: Raw image bytes
        
    Returns:
        {
            "found": bool,
            "weapon_type": str,  # "PISTOLA", "RIFLE", etc.
            "coords": str  # "x,y" format
        }
    """
    # Mock implementation - rarely detect weapons
    # In production, this would use specialized weapon detection model
    
    if random.random() > 0.95:  # 5% chance - should be rare
        weapon_types = ["PISTOLA", "RIFLE", "ARMA_CORTA", "ARMA_LARGA"]
        return {
            "found": True,
            "weapon_type": random.choice(weapon_types),
            "coords": f"{random.randint(200, 400)},{random.randint(100, 300)}"
        }
    else:
        return {"found": False, "weapon_type": "0", "coords": "0"}


async def analyze_frame(frame_data: str) -> Dict[str, Any]:
    """
    Main orchestrator function that runs all 3 detection functions in parallel.
    
    Args:
        frame_data: Base64 encoded image data
        
    Returns:
        Combined detection results from all 3 analyzers
    """
    loop = asyncio.get_event_loop()
    
    try:
        # Decode base64 to bytes
        image_bytes = base64.b64decode(frame_data.split(',')[1] if ',' in frame_data else frame_data)
        
        # Run all 3 detection functions in parallel using thread pool
        vehicle_task = loop.run_in_executor(executor, detect_vehicle_attributes, image_bytes)
        plate_task = loop.run_in_executor(executor, detect_license_plate, image_bytes)
        weapon_task = loop.run_in_executor(executor, detect_weapon_threat, image_bytes)
        
        # Wait for all tasks to complete
        vehicle_result, plate_result, weapon_result = await asyncio.gather(
            vehicle_task, plate_task, weapon_task
        )
        
        # Combine results
        return {
            "status": "success",
            "detections": {
                "vehicle": vehicle_result,
                "plate": plate_result,
                "weapon": weapon_result
            },
            "timestamp": asyncio.get_event_loop().time()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "detections": {
                "vehicle": {"found": False, "type": "0", "coords": "0"},
                "plate": {"found": False, "plate": "0", "coords": "0"},
                "weapon": {"found": False, "weapon_type": "0", "coords": "0"}
            }
        }

# Eagle-Eye Backend (Python/FastAPI)

Backend service for the Eagle-Eye surveillance system implementing real-time video frame analysis.

## Architecture

- **Framework**: FastAPI with native WebSocket support
- **Parallel Processing**: 3 concurrent detection functions per frame
- **Protocol**: WebSocket at `ws://localhost:8000/ws/stream`

## Features

### Core Detection Functions
1. **Vehicle Detection** (`detect_vehicle_attributes`)
   - Detects vehicle type (AUTO, MOTO, BUS, TRUCK)
   - Returns coordinates
   
2. **License Plate Recognition** (`detect_license_plate`)
   - Extracts plate numbers
   - Returns coordinates
   
3. **Weapon Detection** (`detect_weapon_threat`)
   - Detects firearms
   - Returns weapon type and coordinates

### Parallel Execution
All 3 functions run simultaneously using `asyncio.gather()` with ThreadPoolExecutor to prevent blocking the event loop.

## Installation

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

## WebSocket Protocol

### Client → Server
```json
{
  "frame": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### Server → Client
```json
{
  "status": "success",
  "detections": {
    "vehicle": {
      "found": true,
      "type": "AUTO",
      "coords": "250,180"
    },
    "plate": {
      "found": true,
      "plate": "BKA-902",
      "coords": "280,195"
    },
    "weapon": {
      "found": false,
      "weapon_type": "0",
      "coords": "0"
    }
  },
  "timestamp": 1705619234.567
}
```

## API Endpoints

- `GET /`: Health check
- `WS /ws/stream`: WebSocket endpoint for frame streaming

## Development Notes

Currently using **mock detection** with random outputs. To implement real CV:

1. **Vehicle Detection**: Integrate YOLOv8 or similar object detection model
2. **Plate Recognition**: Add OCR (Tesseract/EasyOCR) + plate detection model
3. **Weapon Detection**: Train/use specialized firearm detection model

Replace the mock logic in `core/analyzer.py` with actual model inference.

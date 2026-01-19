"""
Eagle-Eye Backend - FastAPI WebSocket Server
Handles real-time video frame analysis via WebSocket connections.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Set
import json
import logging
from core.analyzer import analyze_frame

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Eagle-Eye Backend", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    """Manages active WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_json(self, websocket: WebSocket, data: dict):
        await websocket.send_json(data)


manager = ConnectionManager()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "Eagle-Eye Backend",
        "status": "online",
        "version": "1.0.0",
        "active_connections": len(manager.active_connections)
    }


@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time frame processing.
    
    Protocol:
    - Client sends: {"frame": "base64_encoded_image"}
    - Server responds: {"status": "success", "detections": {...}}
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive frame data from client
            data = await websocket.receive_text()
            
            try:
                payload = json.loads(data)
                frame_data = payload.get("frame")
                
                if not frame_data:
                    await manager.send_json(websocket, {
                        "status": "error",
                        "message": "No frame data provided"
                    })
                    continue
                
                # Process frame with parallel detection
                result = await analyze_frame(frame_data)
                
                # Send results back to client
                await manager.send_json(websocket, result)
                
            except json.JSONDecodeError:
                await manager.send_json(websocket, {
                    "status": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error processing frame: {str(e)}")
                await manager.send_json(websocket, {
                    "status": "error",
                    "message": str(e)
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket disconnected normally")
    except Exception as e:
        manager.disconnect(websocket)
        logger.error(f"WebSocket error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

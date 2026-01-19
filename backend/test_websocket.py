"""
WebSocket Test Client for Eagle-Eye Backend
Tests frame processing and parallel execution.
"""
import asyncio
import websockets
import json
import base64

# Simple 1x1 pixel PNG in base64 (minimal test image)
TEST_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

async def test_websocket():
    uri = "ws://localhost:8000/ws/stream"
    
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Connected successfully!")
            
            # Send test frame
            payload = {
                "frame": f"data:image/png;base64,{TEST_IMAGE}"
            }
            
            print("\nSending test frame...")
            await websocket.send(json.dumps(payload))
            
            # Receive response
            response = await websocket.recv()
            result = json.loads(response)
            
            print("\n✓ Response received:")
            print(json.dumps(result, indent=2))
            
            # Validate structure
            assert result["status"] == "success", "Status should be success"
            assert "detections" in result, "Should have detections"
            assert "vehicle" in result["detections"], "Should have vehicle detection"
            assert "plate" in result["detections"], "Should have plate detection"
            assert "weapon" in result["detections"], "Should have weapon detection"
            
            print("\n✓ All validations passed!")
            
            # Test multiple frames
            print("\nSending 5 more frames to test parallel processing...")
            for i in range(5):
                await websocket.send(json.dumps(payload))
                response = await websocket.recv()
                result = json.loads(response)
                print(f"  Frame {i+1}: {result['status']}")
            
            print("\n✓ WebSocket test completed successfully!")
            
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_websocket())

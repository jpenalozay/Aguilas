
"""
WebRTC Video Track for Eagle-Eye.
Intercepts video frames, runs parallel analysis, and sends results via DataChannel.
"""
from aiortc import MediaStreamTrack
from av import VideoFrame
import asyncio
import cv2
from typing import Optional
from core.analyzer import analyze_frame_bytes
import json
import logging

logger = logging.getLogger(__name__)

class DetectionStreamTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """
    kind = "video"

    def __init__(self, track, data_channel=None):
        super().__init__()  # don't forget this!
        self.track = track
        self.data_channel = data_channel
        self.executor = None # We will use the centralized one in analyzer

    async def recv(self):
        # 1. Get frame from the source (client webcam)
        frame = await self.track.recv()
        
        # 2. Convert to format suitable for OpenCV/Analyzer
        img = frame.to_ndarray(format="bgr24")
        
        # 3. Trigger Parallel Analysis (Fire and Forget or Await?)
        # For real-time 30fps, strictly awaiting might introduce lag if processing > 33ms.
        # But user wants "wait for response of 3 to send next frame" logic or similar.
        # WebRTC recv() expects a frame return.
        
        # We will dispatch the analysis asynchronously.
        # To avoid blocking the video render, we run analysis in background task,
        # but since user wants the result for *this* frame, let's await it.
        # If it's too slow, the video will stutter (backpressure).
        
        try:
            # Encode to bytes for our analyzer (which expects bytes or base64 usually, 
            # let's adapt analyzer to take numpy or bytes. Current analyzer takes base64 str)
            # Optimization: Let's pass bytes to match existing contract or refactor analyzer.
            # Refactoring analyzer to accept bytes is better.
            
            is_success, buffer = cv2.imencode(".jpg", img)
            if is_success:
                frame_bytes = buffer.tobytes()
                
                # RUN ANALYSIS
                result = await analyze_frame_bytes(frame_bytes)
                
                # SEND RESULT VIA DATA CHANNEL
                if self.data_channel and self.data_channel.readyState == "open":
                    try:
                        self.data_channel.send(json.dumps(result))
                    except Exception as e:
                        logger.error(f"DataChannel send error: {e}")

        except Exception as e:
            logger.error(f"Frame processing error: {e}")

        # 4. Return the frame (unmodified) to be displayed or just consumed
        # We rebuild a VideoFrame to pass it along the pipeline if needed
        new_frame = VideoFrame.from_ndarray(img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame


"""
Eagle-Eye Backend - FastAPI WebRTC Server
"""
import os
import json
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from aiortc import RTCPeerConnection, RTCSessionDescription
from core.webrtc_track import DetectionStreamTrack

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Eagle-Eye WebRTC Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global peer connections (in production usage, manage strictly)
pcs = set()

@app.get("/")
async def root():
    return {"status": "online", "mode": "WebRTC"}

@app.post("/offer")
async def offer(request: Request):
    """
    WebRTC Signaling Endpoint.
    Client sends SDP Offer -> Server responds with SDP Answer.
    """
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    # Note: We create a data channel handle here? 
    # Usually client creates DataChannel. We handle the event.
    data_channel_ref = {"channel": None}

    @pc.on("datachannel")
    def on_datachannel(channel):
        logger.info(f"DataChannel received: {channel.label}")
        data_channel_ref["channel"] = channel
        
        @channel.on("message")
        def on_message(message):
            # Client can send config/commands here
            pass

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logger.info(f"Connection state: {pc.connectionState}")
        if pc.connectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        logger.info(f"Track received: {track.kind}")
        if track.kind == "video":
            # Hijack the track!
            # We wrap the incoming track with our processing track
            # And add it back to the PeerConnection to be sent back (Loopback)
            # OR just consume it. User request implies we process it. 
            # If client displays local video, we don't need to send it back.
            # But let's create the processor track and consume it.
            
            local_video = DetectionStreamTrack(
                track=track, 
                data_channel=data_channel_ref["channel"] # Might be None if not established yet
            )
            # We "add" it to PC so the loop runs, even if we don't send it back?
            # aiortc usually needs a consumer.
            # If we act as a server that just analyzes, we can use Blackhole or just iterate recv()
            
            # Hack: Add it as a sender so aiortc drives the pump
            pc.addTrack(local_video)

            # Important: Update the data channel ref inside the track 
            # because data channel might open AFTER track negotiation?
            # Actually, standard is: Signal -> Connect -> DTLS -> DataChannel/Media.
            
            @local_video.track.on("ended")
            async def on_ended():
                logger.info("Track ended")

    # Handle the offer
    await pc.setRemoteDescription(offer)

    # Create answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

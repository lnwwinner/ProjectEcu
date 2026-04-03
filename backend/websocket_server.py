from fastapi import FastAPI, WebSocket
from core.data_collector import collect_all
from core.obd_connection import OBDConnection
from config import *
import asyncio

app = FastAPI()
conn = OBDConnection(SERIAL_PORT, BAUDRATE, TIMEOUT)
conn.initialize()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = collect_all(conn)
        await websocket.send_json(data)
        await asyncio.sleep(1)

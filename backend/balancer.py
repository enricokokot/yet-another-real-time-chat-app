from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from contextlib import asynccontextmanager
import aiohttp
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(start_checking_for_workers())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:8173",
    "http://localhost:8081",
    "http://localhost:8134",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ports = []

@app.get("/connect")
async def connect():
    global ports
    if ports:
        return ports[round(random.random() * (len(ports) - 1))]
    else:
        return None

@app.post("/worker/{port_number}")
async def connect_worker(port_number):
    global ports
    if int(port_number) not in ports:
        ports.append(int(port_number))
    return int(port_number)

@app.delete("/worker/{port_number}")
async def diconnect_worker(port_number):
    global ports
    ports = [port for port in ports if port != int(port_number)]
    return int(port_number)

async def start_checking_for_workers():
    global ports
    while True:
        for port_number in ports:
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(f"http://127.0.0.1:{str(port_number)}") as response:
                        result = await response.json()
                except aiohttp.ClientConnectorError as err:
                    await diconnect_worker(port_number)
        # print(f"Pass completed. Current status: {ports}")
        await asyncio.sleep(1)


import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80)
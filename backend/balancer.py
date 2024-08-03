from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

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
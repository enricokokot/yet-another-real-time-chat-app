from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8173",
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ports = [81, 82]

@app.get("/connect")
async def connect():
    return ports[round(random.random())]

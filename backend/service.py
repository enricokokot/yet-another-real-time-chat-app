from fastapi import FastAPI

app = FastAPI()

ports = {}

@app.post("/port/{portId}/{userId}")
async def add_user(portId, userId):
    ports[userId] = int(portId)

@app.get("/user/{userId}")
async def get_user(userId):
    if int(userId) == 0:
        return ports
    try:
        return ports[userId]
    except:
        return 0

@app.delete("/user/{userId}")
async def remove_user(userId):
    ports.pop(userId, None)

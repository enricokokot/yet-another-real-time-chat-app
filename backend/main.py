from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import json

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserInfo(BaseModel):
    username: str
    password: str

class NewUserInfo(BaseModel):
    username: str
    password: str
    passwordAgain: str

class UserInDb(BaseModel):
    username: str
    password: str
    friends: list[str]

class UserOutDb(BaseModel):
    username: str
    friends: list[str]

class MessageInfo(BaseModel):
    fromId: str
    toId: str
    content: str

class Message(BaseModel):
    fromId: str
    toId: str
    content: str
    timestamp: str

users = {}
messages = []
active_connections = {}

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/login")
async def login(userInfo: UserInfo):
    if userInfo.username in users.keys():
        if userInfo.password == users[userInfo.username].password:
            returned_user = UserOutDb(username=users[userInfo.username].username,
                                      friends=users[userInfo.username].friends)
            return {
                "message": "Login successful.",
                "user": returned_user,
                }
        else:
            return {"message": "Login failed, incorrect password."}
    return {"message": "Login failed, user doesn't exist."}
        
@app.post("/signin")
async def signin(userInfo: NewUserInfo):
    if userInfo.password != userInfo.passwordAgain:
        return {"message": "Passwords are not equal!"}
    if userInfo.username in users.keys():
        return {"message": "User already exists!"}
    new_user = UserInDb(username=userInfo.username, password=userInfo.password, friends=[])
    users[userInfo.username] = new_user
    return {
        "message": "User successfully created.",
        "user": new_user,
        }

@app.get("/user/{userId}")
async def get_users(userId):
    if users == {}:
        return []
    if userId == "undefined":
        return [user for user in users]
    return users[userId].friends

@app.post("/user/{requestUserId}/{responseUserId}")
async def add_friend(requestUserId, responseUserId):
    if requestUserId == "undefined" or responseUserId == "undefined":
        return {"message": "Request failed, need both user ids."}

    requestUser = users[requestUserId]
    responseUser = users[responseUserId]

    if responseUserId in requestUser.friends:
        return {"message": "User already added as friend"}    
    requestUser.friends.append(responseUserId)

    if requestUserId in responseUser.friends:
        return {"message": "User already added as friend"}    
    responseUser.friends.append(requestUserId)

    incoming_user = UserOutDb(username=requestUser.username, friends=requestUser.friends)

    return {"message": "User added as friend",
            "user": incoming_user}

@app.delete("/user/{requestUserId}/{responseUserId}")
async def remove_friend(requestUserId, responseUserId):
    if requestUserId == "undefined" or responseUserId == "undefined":
        return {"message": "Request failed, need both user ids."}

    requestUser = users[requestUserId]
    responseUser = users[responseUserId]

    if responseUserId in requestUser.friends:
        requestUser.friends.remove(responseUserId)
    if requestUserId in responseUser.friends:        
        responseUser.friends.remove(requestUserId)

    incoming_user = UserOutDb(username=requestUser.username, friends=requestUser.friends)

    return {"message": "User removed as friend",
            "user": incoming_user}

@app.post("/message")
async def send_message(message: MessageInfo):
    new_message = Message(fromId=message.fromId,
                          toId=message.toId,
                          content=message.content,
                          timestamp=str(datetime.now()))
    messages.append(new_message)
    return {"message": "Message successfully sent"}

@app.get("/message/{fromId}/{toId}")
async def get_chat(fromId, toId):
    if fromId == "undefined" or toId == "undefined":
        return {"message": "Request failed, need both user ids."}
    
    chat = [message for message in list(reversed(messages)) if ((message.fromId == fromId and message.toId == toId) or (message.fromId == toId and message.toId == fromId))]
    return {"message": "Chat successfully found",
            "data": chat}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            loaded_data = json.loads(data)
            if loaded_data["type"] == "connection":
                    active_connections[loaded_data["data"]["user"]] = websocket
            if loaded_data["type"] == "message":
                if loaded_data["data"]["toId"] in active_connections.keys():
                    message = loaded_data["data"]["content"]
                    await active_connections[loaded_data["data"]["toId"]].send_text(message)
    except:
        for key, value in active_connections.items():
            if value == websocket:
                active_connections.pop(key, None)
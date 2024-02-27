from fastapi import FastAPI, WebSocket, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import json
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from jose import JWTError, jwt
import aiohttp
import uvicorn

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
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

class NewUserInfo(UserInfo):
    passwordAgain: str

class UserInDb(UserInfo):
    friends: list[str]

class CleanUser(BaseModel):
    username: str
    friends: list[str]

class UserOutDb(BaseModel):
    username: str
    hashed_password: str
    friends: list[str]

class MessageInfo(BaseModel):
    fromId: str
    toId: str
    content: str

class Message(MessageInfo):
    timestamp: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class UserOnLogin(BaseModel):
    username: str
    friends: list[str]
    token: Token

def hash_password(password: str):
    return pwd_context.hash(password)

users = {}
messages = []
unsent_messages = []
active_connections = {}

@app.get("/")
async def root():
    return {"message": "Hello World"}

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserOutDb(username=user_dict.username, hashed_password=user_dict.password, friends=user_dict.friends)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(users, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/login")
async def login(userInfo: UserInfo):
    if userInfo.username in users.keys():
        if verify_password(userInfo.password, users[userInfo.username].password):
            returned_user = CleanUser(username=users[userInfo.username].username,
                                      friends=users[userInfo.username].friends)
            payload = {"username": userInfo.username, "password": userInfo.password}
            async with aiohttp.ClientSession() as session:
                async with session.post('http://127.0.0.1:8010/token', data=payload) as response:
                    token = await response.json()
                    return {
                        "message": "Login successful.",
                        "user": returned_user,
                        "token": token
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
    new_user = UserInDb(username=userInfo.username, password=hash_password(userInfo.password), friends=[])
    users[userInfo.username] = new_user
    new_user_for_outside = CleanUser(username=new_user.username, friends=new_user.friends)
    payload = {"username": userInfo.username, "password": userInfo.password}
    async with aiohttp.ClientSession() as session:
        async with session.post('http://127.0.0.1:8010/token', data=payload) as response:
            token = await response.json()
            return {
                "message": "User successfully created.",
                "user": new_user_for_outside,
                "token": token,
                }

@app.get("/user/{userId}")
async def get_users(the_user: Annotated[UserOutDb, Depends(get_current_user)], userId):
    the_user_id = the_user.username
    if users == {}:
        return []
    if userId == "undefined":
        return [user for user in users]
    return users[the_user_id].friends

@app.post("/user/{requestUserId}/{responseUserId}")
async def add_friend(requestUserId: Annotated[UserOutDb, Depends(get_current_user)], responseUserId):
    requestUserId = requestUserId.username
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

    incoming_user = CleanUser(username=requestUser.username, friends=requestUser.friends)

    return {"message": "User added as friend",
            "user": incoming_user}

@app.delete("/user/{requestUserId}/{responseUserId}")
async def remove_friend(requestUserId: Annotated[UserOutDb, Depends(get_current_user)], responseUserId):
    requestUserId = requestUserId.username
    if requestUserId == "undefined" or responseUserId == "undefined":
        return {"message": "Request failed, need both user ids."}

    requestUser = users[requestUserId]
    responseUser = users[responseUserId]

    if responseUserId in requestUser.friends:
        requestUser.friends.remove(responseUserId)
    if requestUserId in responseUser.friends:        
        responseUser.friends.remove(requestUserId)

    incoming_user = CleanUser(username=requestUser.username, friends=requestUser.friends)

    return {"message": "User removed as friend",
            "user": incoming_user}

@app.post("/message")
async def send_message(user: Annotated[UserOutDb, Depends(get_current_user)], message: MessageInfo):
    new_message = Message(fromId=user.username,
                          toId=message.toId,
                          content=message.content,
                          timestamp=str(datetime.now()))
    messages.append(new_message)
    return {"message": "Message successfully sent"}

@app.get("/message/{fromId}/{toId}")
async def get_chat(fromId: Annotated[UserOutDb, Depends(get_current_user)], toId):
    if fromId == "undefined" or toId == "undefined":
        return {"message": "Request failed, need both user ids."}
    
    fromId = fromId.username
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
                    for message in list(unsent_messages):
                        if message["data"]["toId"] == loaded_data["data"]["user"]:
                            await websocket.send_text(json.dumps(message))
                            unsent_messages.remove(message)
            if loaded_data["type"] == "message":
                if loaded_data["data"]["toId"] in active_connections.keys():
                    await active_connections[loaded_data["data"]["toId"]].send_text(json.dumps(loaded_data))
                else:
                    unsent_messages.append(loaded_data)
    except:
        for key, value in dict(active_connections).items():
            if value == websocket:
                active_connections.pop(key, None)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    user = authenticate_user(users, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)
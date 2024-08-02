from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
import aiohttp
import json
import sys

import db.crud as crud, db.models as models, db.schemas as schemas
from db.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
port_number = 81

if "--port" in sys.argv:
    port_index = sys.argv.index("--port") + 1
    if port_index < len(sys.argv):
        port_number = int(sys.argv[port_index])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
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
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


@app.post("/user/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)


@app.get("/user/", response_model=list[schemas.User])
def read_users(the_user: Annotated[schemas.User, Depends(get_current_user)], skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/user/{user_id}", response_model=schemas.User)
def read_user(the_user: Annotated[schemas.User, Depends(get_current_user)], user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.post("/user/{requestUserId}/{responseUserId}")
async def add_friend(the_user: Annotated[schemas.User, Depends(get_current_user)], requestUserId, responseUserId, db: Session = Depends(get_db)):
    requestUser = crud.get_user_by_username(db, username=requestUserId)
    responseUser = crud.get_user_by_username(db, username=responseUserId)
    if requestUser is None or responseUser is None:
        raise HTTPException(status_code=404, detail="User not found")
    newUser = crud.create_friendship(db, requestUser, responseUser)
    return newUser


@app.delete("/user/{requestUserId}/{responseUserId}")
async def remove_friend(the_user: Annotated[schemas.User, Depends(get_current_user)], requestUserId, responseUserId, db: Session = Depends(get_db)):
    requestUser = crud.get_user_by_username(db, username=requestUserId)
    responseUser = crud.get_user_by_username(db, username=responseUserId)
    if requestUser is None or responseUser is None:
        raise HTTPException(status_code=404, detail="User not found")
    newUser = crud.delete_friendship(db, requestUser, responseUser)
    return newUser


@app.post("/old-message/")
async def create_message(the_user: Annotated[schemas.User, Depends(get_current_user)], message: schemas.MessageCreate, db: Session = Depends(get_db)):
    from_user = crud.get_user(db, user_id=message.fromId)
    to_user = crud.get_user(db, user_id=message.toId)
    if from_user is None or to_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if from_user == to_user:
        raise HTTPException(status_code=400, detail="Cannot send message to self")
    return crud.create_message(db=db, message=message)


@app.get("/chat/{chat_id}", response_model=schemas.Chat)
async def read_chat(the_user: Annotated[schemas.User, Depends(get_current_user)], chat_id: int, db: Session = Depends(get_db)):
    chat = crud.get_chat(db, chat_id=chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@app.post("/chat/", response_model=schemas.Chat)
async def create_chat(the_user: Annotated[schemas.User, Depends(get_current_user)], chat: schemas.ChatCreate, db: Session = Depends(get_db)):
    if len(chat.users) < 2:
        raise HTTPException(status_code=400, detail="Chat must have at least 2 users")
    if the_user.id not in chat.users:
        raise HTTPException(status_code=400, detail="User creating chat not in chat")
    chats_restrutured = {chat.id: [user.id for user in chat.users] for chat in the_user.chats}
    for local_id, local_chat in chats_restrutured.items():
        if local_chat == sorted(chat.users):
            # raise HTTPException(status_code=400, detail="Chat already exists", chat_id=local_id)
            return crud.get_chat(db, chat_id=local_id)
    for user_id in chat.users:
        if crud.get_user(db, user_id=user_id) is None:
            raise HTTPException(status_code=404, detail="User not found")
    return crud.create_chat(db=db, participants=chat.users)


@app.get("/message/")
async def read_messages(the_user: Annotated[schemas.User, Depends(get_current_user)], db: Session = Depends(get_db)):
    return crud.get_messages(db)


@app.get("/old-message/{fromId}/{toId}")
async def read_messages_from_chat(the_user: Annotated[schemas.User, Depends(get_current_user)], fromId, toId, db: Session = Depends(get_db), skip: int = 0, limit: int = 1000):
    from_user = crud.get_user_by_username(db, username=fromId)
    to_user = crud.get_user_by_username(db, username=toId)
    if from_user is None or to_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if from_user == to_user:
        raise HTTPException(status_code=400, detail="Cannot send message to self")
    return crud.get_messages_from_chat(db, from_user.id, to_user.id, skip, limit)


@app.post("/message/")
async def create_message(the_user: Annotated[schemas.User, Depends(get_current_user)], message: schemas.MessageCreate, db: Session = Depends(get_db)):
    from_user = crud.get_user(db, user_id=message.fromId)
    if isinstance(message.toId, list):
        if len(message.toId) == 1 and message.toId[0] == from_user.id:
            raise HTTPException(status_code=400, detail="Cannot send message to self")
        ids_in_chats = {chat.id: sorted([user.id for user in chat.users]) for chat in from_user.chats}
        if sorted([message.fromId] + message.toId) in ids_in_chats.values():
            chat_id = list(ids_in_chats.values()).index(sorted([message.fromId] + message.toId)) + 1
            to_chat = crud.get_chat(db, chat_id)
        else:
            to_chat = crud.create_chat(db, participants=[message.fromId]+message.toId)
    else:
        to_chat = crud.get_chat(db, chat_id=message.toId)
    if from_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if to_chat is None:
        raise HTTPException(status_code=404, detail="Chat not found")
    created_message = {**message.dict(), "toId": to_chat.id}
    return crud.create_message(db=db, message=created_message)


@app.get("/message/{chat_id}")
async def read_messages_from_chat(the_user: Annotated[schemas.User, Depends(get_current_user)], chat_id, db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    to_chat = crud.get_chat(db, chat_id=chat_id)
    if to_chat is None:
        raise HTTPException(status_code=404, detail="Chat not found")
    return crud.get_messages_from_chat(db, to_chat, skip, limit)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
) -> schemas.Token:
    user = authenticate_user(form_data.username, form_data.password, db)
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
    return schemas.Token(access_token=access_token, token_type="bearer")


@app.post("/signin")
async def signin(userInfo: schemas.NewUserInfo):
    global port_number
    if userInfo.password != userInfo.passwordAgain:
        return {"message": "Passwords are not equal!"}
    payload = {"username": userInfo.username, "password": userInfo.password}

    async with aiohttp.ClientSession() as session:
        async with session.post(f'http://127.0.0.1:{port_number}/user/', json=payload) as response:
            new_user = await response.json()

    return {"message": "User successfully created.", "user": new_user}



@app.post("/login")
async def login(userInfo: schemas.UserInfo):
    global port_number
    payload = {"username": userInfo.username, "password": userInfo.password}
    async with aiohttp.ClientSession() as session:
        async with session.post(f'http://127.0.0.1:{port_number}/token', data=payload) as response:
            token = await response.json()
            return {
                "message": "Login successful.",
                "token": token
                }


active_connections = {}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    global port_number
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            loaded_data = json.loads(data)
            if loaded_data["type"] == "connection":
                    user_id = loaded_data["data"]["user"]
                    active_connections[user_id] = websocket
                    crud.update_user_activity(db, user_id)
                    try:
                        async with aiohttp.ClientSession() as session:
                            async with session.post(f'http://127.0.0.1:83/port/{int(port_number)}/{int(user_id)}') as response:
                                await response.text()
                    except Exception as e:
                        print(e)
                    all_unreads = crud.get_unread_messages_of_user(db, user_id)
                    db_user = crud.get_user(db, user_id=user_id)
                    user_chat_ids = [chat.id for chat in db_user.chats]
                    for unread_message in all_unreads:
                        if unread_message.toId in user_chat_ids and unread_message.fromId != user_id:
                            sent_message = {
                                "type": "message",
                                "data": {
                                    "id": unread_message.id,
                                    "fromId": unread_message.fromId,
                                    "toId": unread_message.toId,
                                    "content": unread_message.content,
                                    "timestamp": unread_message.timestamp,
                                }
                            }
                            await websocket.send_text(json.dumps(sent_message))
                            crud.delete_unread_message(db, unread_message.id, user_id)

            if loaded_data["type"] == "message":
                user_id = loaded_data["data"]["fromId"]
                chat_id = loaded_data["data"]["toId"]
                crud.update_user_activity(db, user_id)
                db_chat = crud.get_chat(db, chat_id)
                users_in_chat = [user.id for user in db_chat.users if user_id != user.id]
                actual_last_message_id = 0
                try:
                    last_message = crud.get_messages(db, 0, 1)
                    actual_last_message = last_message[0]
                    actual_last_message_id = actual_last_message.id
                except:
                    pass
                for user_in_chat in users_in_chat:
                    if user_in_chat in active_connections.keys():
                        await active_connections[user_in_chat].send_text(json.dumps(loaded_data))
                    else:
                        async with aiohttp.ClientSession() as session_first:
                            async with session_first.get(f'http://127.0.0.1:83/user/{user_in_chat}') as response:
                                port_no = await response.text()
                                if int(port_no):
                                    async with aiohttp.ClientSession() as session_second:
                                        async with session_second.ws_connect(f'http://127.0.0.1:{int(port_no)}/ws') as ws:
                                            loaded_data["type"] = "pass"
                                            loaded_data["passTo"] = user_in_chat
                                            await ws.send_json(loaded_data)
                                else:
                                    crud.create_unread_message(db, actual_last_message_id + 1, user_in_chat)
                
            elif loaded_data["type"] == "pass":
                pass_to = loaded_data["passTo"]
                if pass_to in active_connections.keys():
                        await active_connections[pass_to].send_text(json.dumps(loaded_data))
                else:
                    try:
                        last_message = crud.get_messages(db, 0, 1)
                        actual_last_message = last_message[0]
                        crud.create_unread_message(db, actual_last_message.id + 1, pass_to)
                    except:
                        crud.create_unread_message(db, 1, pass_to)

    except:
        for key, value in dict(active_connections).items():
            if value == websocket:
                active_connections.pop(key, None)
                crud.update_user_activity(db, key)
                async with aiohttp.ClientSession() as session:
                    async with session.delete(f'http://127.0.0.1:83/user/{key}') as response:
                        await response.text()



import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=81)
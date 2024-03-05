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

import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

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


@app.post("/message/")
async def create_message(the_user: Annotated[schemas.User, Depends(get_current_user)], message: schemas.MessageCreate, db: Session = Depends(get_db)):
    from_user = crud.get_user(db, user_id=message.fromId)
    to_user = crud.get_user(db, user_id=message.toId)
    if from_user is None or to_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if from_user == to_user:
        raise HTTPException(status_code=400, detail="Cannot send message to self")
    return crud.create_message(db=db, message=message)


@app.get("/message/")
async def read_messages(the_user: Annotated[schemas.User, Depends(get_current_user)], db: Session = Depends(get_db)):
    return crud.get_messages(db)


@app.get("/message/{fromId}/{toId}")
async def read_messages_from_chat(the_user: Annotated[schemas.User, Depends(get_current_user)], fromId, toId, db: Session = Depends(get_db)):
    from_user = crud.get_user_by_username(db, username=fromId)
    to_user = crud.get_user_by_username(db, username=toId)
    if from_user is None or to_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if from_user == to_user:
        raise HTTPException(status_code=400, detail="Cannot send message to self")
    return crud.get_messages_from_chat(db, from_user.id, to_user.id)


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
    if userInfo.password != userInfo.passwordAgain:
        return {"message": "Passwords are not equal!"}
    payload = {"username": userInfo.username, "password": userInfo.password}

    async with aiohttp.ClientSession() as session:
        async with session.post('http://127.0.0.1:8010/user/', json=payload) as response:
            new_user = await response.json()

    return {"message": "User successfully created.", "user": new_user}



@app.post("/login")
async def login(userInfo: schemas.UserInfo):
    payload = {"username": userInfo.username, "password": userInfo.password}
    async with aiohttp.ClientSession() as session:
        async with session.post('http://127.0.0.1:8010/token', data=payload) as response:
            token = await response.json()
            return {
                "message": "Login successful.",
                "token": token
                }


active_connections = {}
unsent_messages = []


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


import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)
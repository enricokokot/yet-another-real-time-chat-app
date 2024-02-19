from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

users = {}

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

    requestUser.friends.append(responseUserId)
    responseUser.friends.append(requestUserId)

    incoming_user = UserOutDb(username=requestUser.username, friends=requestUser.friends)

    return {"message": "User added as friend",
            "user": incoming_user}

@app.delete("/user/{requestUserId}/{responseUserId}")
async def add_friend(requestUserId, responseUserId):
    if requestUserId == "undefined" or responseUserId == "undefined":
        return {"message": "Request failed, need both user ids."}

    requestUser = users[requestUserId]
    responseUser = users[responseUserId]

    requestUser.friends.remove(responseUserId)
    responseUser.friends.remove(requestUserId)

    incoming_user = UserOutDb(username=requestUser.username, friends=requestUser.friends)

    return {"message": "User removed as friend",
            "user": incoming_user}
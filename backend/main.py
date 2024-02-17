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

class User(BaseModel):
    username: str

users = {}

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/login")
async def login(userInfo: UserInfo):
    if userInfo.username in users.keys():
        if userInfo.password == users[userInfo.username]:
            return {
                "message": "Login successful.",
                "user": User(username=userInfo.username),
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
    users[userInfo.username] = userInfo.password
    return {
        "message": "User successfully created.",
        "user": User(username=userInfo.username),
        }

@app.get("/user/{userId}")
async def getUsers(userId):
    print(userId)
    return [user for user in users]
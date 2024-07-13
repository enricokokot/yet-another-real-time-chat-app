from pydantic import BaseModel, Field
from typing import List


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class UserFriend(UserBase):
    id: int

    class Config:
        orm_mode = True


class ChatCreate(BaseModel):
    users: List[int] = Field(default_factory=list)


class Chat(BaseModel):
    id: int
    users: List[UserFriend] = Field(default_factory=list)

    class Config:
        orm_mode = True


class User(UserBase):
    id: int
    lastActive: int
    friends: List[UserFriend] = Field(default_factory=list)
    chats: List[Chat] = Field(default_factory=list)

    class Config:
        orm_mode = True


class MessageBase(BaseModel):
    fromId: int
    toId: int
    content: str


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    timestamp: str

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserInfo(BaseModel):
    username: str
    password: str


class NewUserInfo(UserInfo):
    passwordAgain: str


class UnreadMessage(BaseModel):
    message_id: int
    user_id: int

    class Config:
        orm_mode = True

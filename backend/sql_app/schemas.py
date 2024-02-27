from pydantic import BaseModel


class MessageBase(BaseModel):
    fromId: str
    toId: str
    content: str


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    timestamp: str

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    friends: list[str] = []

    class Config:
        orm_mode = True


class FriendshipBase(BaseModel):
    userOne: str
    userTwo: str


class FriendshipCreate(FriendshipBase):
    pass


class Friendship(FriendshipBase):
    id: int

    class Config:
        orm_mode = True
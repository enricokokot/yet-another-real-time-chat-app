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


class User(UserBase):
    id: int
    friends: List[UserFriend] = Field(default_factory=list)

    class Config:
        orm_mode = True

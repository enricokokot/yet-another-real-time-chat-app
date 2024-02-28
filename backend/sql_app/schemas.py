from pydantic import BaseModel
from typing import List


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    friends: List[UserBase] = []

    class Config:
        orm_mode = True

from sqlalchemy import Column, Integer, String, ForeignKey

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    fromId = Column(String, index=True)
    toId = Column(String, index=True)
    content = Column(String)
    timestamp = Column(String)


class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True)
    userOne = Column(String, ForeignKey("users.id"))
    userTwo = Column(String, ForeignKey("users.id"))
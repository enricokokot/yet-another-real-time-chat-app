from sqlalchemy import Column, Integer, String, ForeignKey, Table

from db.database import Base
from sqlalchemy.orm import relationship


friendship_association = Table('friendship', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('friend_id', Integer, ForeignKey('users.id'))
)


chats_users = Table('chats_users', Base.metadata,
    Column('chat_id', Integer, ForeignKey('chats.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    lastActive = Column(Integer)

    friends = relationship(
        "User",
        secondary=friendship_association,
        primaryjoin=id==friendship_association.c.user_id,
        secondaryjoin=id==friendship_association.c.friend_id,
        backref="users"
    )

    chats = relationship("Chat", secondary=chats_users, back_populates="users")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    fromId = Column(Integer, ForeignKey('users.id'))
    toId = Column(Integer, ForeignKey('chats.id'))
    content = Column(String)
    timestamp = Column(String)

    from_user = relationship("User", foreign_keys=[fromId])
    chat = relationship("Chat", foreign_keys=[toId], back_populates="messages")

class UnreadMessage(Base):
    __tablename__ = "unread"

    message_id = Column(Integer, ForeignKey('messages.id'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)
    users = relationship("User", secondary=chats_users, back_populates="chats")
    messages = relationship("Message", back_populates="chat")

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime
from sqlalchemy import or_, and_

import db.models as models, db.schemas as schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = hash_password(user.password)
    db_user = models.User(username=user.username, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_friendship(db: Session, requestUser: models.User, responseUser: models.User):
    if requestUser == responseUser:
        return requestUser
    if responseUser not in requestUser.friends:
        requestUser.friends.append(responseUser)
    if requestUser not in responseUser.friends:
        responseUser.friends.append(requestUser)
    db.commit()
    db.refresh(requestUser)
    db.refresh(responseUser)
    return requestUser

def delete_friendship(db: Session, requestUser: models.User, responseUser: models.User):
    if responseUser in requestUser.friends:
        requestUser.friends.remove(responseUser)
    if requestUser in responseUser.friends:
        responseUser.friends.remove(requestUser)
    db.commit()
    db.refresh(requestUser)
    db.refresh(responseUser)
    return requestUser


def create_message(db: Session, message: schemas.MessageCreate):
    chat = db.query(models.Chat).filter(models.Chat.id == message["toId"]).first()
    chat.messages.append(models.Message(**message, timestamp=str(datetime.now())))
    db.commit()
    db.refresh(chat)
    return chat.messages[-1]


def get_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Message).order_by(models.Message.id.desc()).offset(skip).limit(limit).all()


def get_messages_from_chat(db: Session, to_chat: int, skip: int, limit: int):
    return db.query(models.Message).filter(models.Message.toId == to_chat.id).order_by(models.Message.timestamp.desc()).offset(skip).limit(limit).all()


def create_unread_message(db: Session, message_id: int, user_id: int):
    db_unread_message = models.UnreadMessage(message_id=message_id, user_id=user_id)
    db.add(db_unread_message)
    db.commit()
    db.refresh(db_unread_message)
    return db_unread_message


def get_unread_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Message).join(models.UnreadMessage).offset(skip).limit(limit).all()


def delete_unread_message(db: Session, message_id: int, user_id: int):
    db.query(models.UnreadMessage).filter(models.UnreadMessage.message_id == message_id).filter(models.UnreadMessage.user_id == user_id).delete()
    db.commit()
    return message_id


def create_chat(db: Session, participants: list[int]):
    db_participants = db.query(models.User).filter(models.User.id.in_(participants)).all()
    db_chat = models.Chat(users=db_participants)
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)

    for participant_id in participants:
        participant = db.query(models.User).get(participant_id)
        if participant:
            participant.chats.append(db_chat)
            db.commit()

    return db_chat


def get_chats(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Chat).offset(skip).limit(limit).all()


def get_chat(db: Session, chat_id: int):
    return db.query(models.Chat).filter(models.Chat.id == chat_id).first()


def delete_chat(db: Session, chat_id: int):
    db.query(models.Chat).filter(models.Chat.id == chat_id).delete()
    db.commit()
    return chat_id


def hash_password(password: str):
    return pwd_context.hash(password)
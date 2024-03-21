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
    db_message = models.Message(**message.dict(), timestamp=str(datetime.now()))
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Message).order_by(models.Message.id.desc()).offset(skip).limit(limit).all()


def get_messages_from_chat(db: Session, fromId: int, toId: int, skip: int, limit: int):
    return db.query(models.Message).filter(
        or_(
            and_(models.Message.fromId == fromId, models.Message.toId == toId),
            and_(models.Message.fromId == toId, models.Message.toId == fromId)
        )
    ).order_by(models.Message.timestamp.desc()).offset(skip).limit(limit).all()


def create_unread_message(db: Session, message_id: int):
    db_unread_message = models.UnreadMessage(message_id=message_id)
    db.add(db_unread_message)
    db.commit()
    db.refresh(db_unread_message)
    return db_unread_message


def get_unread_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Message).join(models.UnreadMessage).offset(skip).limit(limit).all()


def delete_unread_message(db: Session, message_id: int):
    db.query(models.UnreadMessage).filter(models.UnreadMessage.message_id == message_id).delete()
    db.commit()
    return message_id


def hash_password(password: str):
    return pwd_context.hash(password)
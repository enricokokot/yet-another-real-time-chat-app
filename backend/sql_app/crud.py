from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models, schemas

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


def get_friendships(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Friendship).offset(skip).limit(limit).all()


def create_friendship(db: Session, requestUserId: int, responseUserId: int):
    db_friendship = models.Friendship(userOne=requestUserId, userTwo=responseUserId)
    db.add(db_friendship)
    db.commit()
    db.refresh(db_friendship)
    return db_friendship


def get_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Message).offset(skip).limit(limit).all()


def create_message(db: Session, message: schemas.Message, user_id: int):
    db_message = models.Message(**message.dict(), owner_id=user_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def hash_password(password: str):
    return pwd_context.hash(password)
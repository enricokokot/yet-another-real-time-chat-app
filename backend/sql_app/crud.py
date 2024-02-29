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


def hash_password(password: str):
    return pwd_context.hash(password)
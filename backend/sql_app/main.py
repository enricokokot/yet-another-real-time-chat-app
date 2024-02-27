from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/user/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Usename already registered")
    return crud.create_user(db=db, user=user)


@app.get("/user/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/user/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.get("/friendship/", response_model=list[schemas.Friendship])
def read_friendships(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_friendships(db, skip=skip, limit=limit)
    return users


@app.post("/user/{requestUserId}/{responseUserId}")
def create_friendship(
    requestUserId=int, responseUserId=int, db: Session = Depends(get_db)
):
    return crud.create_friendship(db=db, requestUserId=requestUserId, responseUserId=responseUserId)


@app.get("/message/", response_model=list[schemas.Message])
def read_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    messages = crud.get_messages(db, skip=skip, limit=limit)
    return messages

import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)
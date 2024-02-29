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
        raise HTTPException(status_code=400, detail="Username already registered")
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


@app.post("/user/{requestUserId}/{responseUserId}")
async def add_friend(requestUserId, responseUserId, db: Session = Depends(get_db)):
    requestUser = crud.get_user_by_username(db, username=requestUserId)
    responseUser = crud.get_user_by_username(db, username=responseUserId)
    if requestUser is None or responseUser is None:
        raise HTTPException(status_code=404, detail="User not found")
    newUser = crud.create_friendship(db, requestUser, responseUser)
    return newUser


@app.delete("/user/{requestUserId}/{responseUserId}")
async def remove_friend(requestUserId, responseUserId, db: Session = Depends(get_db)):
    requestUser = crud.get_user_by_username(db, username=requestUserId)
    responseUser = crud.get_user_by_username(db, username=responseUserId)
    if requestUser is None or responseUser is None:
        raise HTTPException(status_code=404, detail="User not found")
    newUser = crud.delete_friendship(db, requestUser, responseUser)
    return newUser


@app.post("/message/")
async def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    from_user = crud.get_user(db, user_id=message.fromId)
    to_user = crud.get_user(db, user_id=message.toId)
    if from_user is None or to_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if from_user == to_user:
        raise HTTPException(status_code=400, detail="Cannot send message to self")
    return crud.create_message(db=db, message=message)


@app.get("/message/")
async def read_messages(db: Session = Depends(get_db)):
    return crud.get_messages(db)


@app.get("/message/{fromId}/{toId}")
async def read_messages_from_chat(fromId, toId, db: Session = Depends(get_db)):
    from_user = crud.get_user_by_username(db, username=fromId)
    to_user = crud.get_user_by_username(db, username=toId)
    if from_user is None or to_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if from_user == to_user:
        raise HTTPException(status_code=400, detail="Cannot send message to self")
    return crud.get_messages_from_chat(db, from_user.id, to_user.id)


import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)
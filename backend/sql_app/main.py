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


import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)
from sqlalchemy import Column, Integer, String, ForeignKey, Table

from database import Base
from sqlalchemy.orm import relationship


friendship_association = Table('friendship', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('friend_id', Integer, ForeignKey('users.id'))
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

    friends = relationship(
        "User",
        secondary=friendship_association,
        primaryjoin=id==friendship_association.c.user_id,
        secondaryjoin=id==friendship_association.c.friend_id,
        backref="users"
    )
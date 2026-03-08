"""
User persistence: get or create from Google userinfo.
"""
from sqlalchemy.orm import Session

from models.user import User

def get_or_create_user(db: Session, *, google_sub: str, email: str, name: str = "", picture: str = "") -> User:
    """Return existing user by google_sub or create one. Updates email/name/picture if existing."""
    user = db.query(User).filter(User.google_sub == google_sub).first()
    if user:
        user.email = email
        user.name = name
        user.picture = picture
        db.commit()
        db.refresh(user)
        return user
    user = User(google_sub=google_sub, email=email, name=name, picture=picture)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

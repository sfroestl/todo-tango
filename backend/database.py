"""
Database engine and session. SQLite for dev; swap URL for Postgres in production.
Tests set DATABASE_URL=sqlite:///:memory: for isolation.
"""
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# SQLite file in backend directory; use DATABASE_URL env for override (e.g. postgres or :memory:)
DB_PATH = Path(__file__).resolve().parent / "todo_tango.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite for sync use with FastAPI
    echo=False,  # Set True for SQL logging
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Session:
    """Dependency: yield a DB session, close after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

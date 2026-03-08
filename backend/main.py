from pathlib import Path
from dotenv import load_dotenv

# Load .env, then .env.local (local overrides for credentials)
load_dotenv()
load_dotenv(Path(__file__).resolve().parent / ".env.local", override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth import router as auth_router
from api.todolists import router as todolists_router
from database import Base, engine
# Importing models to ensure all SQLAlchemy models are registered with the Base metadata
# This is necessary so that Base.metadata.create_all can create the corresponding tables.
import models  # noqa: F401

app = FastAPI(title="Hello World API")


@app.on_event("startup")
def on_startup():
    """Create DB tables if they do not exist."""
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(todolists_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/hello")
def hello():
    return {"message": "Hello from the Python brain"}

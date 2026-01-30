from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.todolists import router as todolists_router

app = FastAPI(title="Hello World API")
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

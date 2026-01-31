# Hello World Full-Stack App

A minimal full-stack app with a **Python FastAPI** backend and a **Vite + React** frontend. The frontend uses TanStack Query to fetch a message from the backend and Tailwind CSS for styling.

## Project structure

- **`/backend`** — FastAPI app with a single `GET /hello` endpoint
- **`/frontend`** — Vite + React app with TanStack Query and Tailwind

## Prerequisites

- **Python 3.9+** (for the backend)
- **Node.js 18+** (for the frontend; Node 20+ recommended for Vite 7)

## Running the app

From the project root you can use:

- **`./run-backend.sh`** — starts the backend (run from `backend/` with `uvicorn main:app --reload`). Ensure you have a venv and dependencies installed first.
- **`./run-frontend.sh`** — starts the frontend dev server (run from `frontend/` with `npm run dev`). Run `npm install` in `frontend/` first if needed.

### 1. Backend (Python FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at **http://localhost:8000**. You can check the docs at http://localhost:8000/docs.

### 2. Frontend (Vite + React)

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

The frontend is configured to proxy `/api` to the backend at `http://localhost:8000`, so the React app calls `/api/hello` and receives the JSON `{ "message": "Hello from the Python brain" }`.

## Summary

- **Backend**: `GET /hello` returns `{ "message": "Hello from the Python brain" }`.
- **Frontend**: A `HelloMessage` component uses TanStack Query’s `useQuery` to fetch that message and display it with Tailwind styling.
- Start the backend first, then the frontend, and open http://localhost:5173 to see the message.

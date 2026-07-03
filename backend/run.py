import uvicorn
import os

if __name__ == "__main__":
    # Ensure uvicorn runs app/main.py
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

import uvicorn
from app.db.session import SessionLocal, create_tables
from app.db.init_db import init_db

def init() -> None:
    create_tables()  # Create all tables first
    db = SessionLocal()
    init_db(db)

def main() -> None:
    init()
    uvicorn.run("app.main:app", host="127.0.0.1", port=8080, reload=True)

if __name__ == "__main__":
    main() 
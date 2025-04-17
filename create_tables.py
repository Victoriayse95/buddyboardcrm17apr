from app.db.session import Base, engine
from app.db.models import User  # Import all models here

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

if __name__ == "__main__":
    create_tables() 
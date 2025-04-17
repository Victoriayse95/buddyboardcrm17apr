from sqlalchemy.orm import Session
from app.db.models import User, UserRole
from app.core.security import get_password_hash
from datetime import datetime

def init_db(db: Session) -> None:
    # Create admin user if it doesn't exist
    admin = db.query(User).filter(User.email == "admin@buddyboard.com").first()
    if not admin:
        admin = User(
            email="admin@buddyboard.com",
            hashed_password=get_password_hash("admin123"),  # Change this in production
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("Admin user created successfully")
    else:
        print("Admin user already exists") 
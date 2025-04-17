from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Notification
from app.schemas.models import Notification as NotificationSchema, NotificationCreate
from app.api.api_v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NotificationSchema])
def read_notifications(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve notifications for the current user.
    """
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return notifications

@router.post("/", response_model=NotificationSchema)
def create_notification(
    *,
    db: Session = Depends(get_db),
    notification_in: NotificationCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new notification.
    """
    notification = Notification(**notification_in.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.get("/{notification_id}", response_model=NotificationSchema)
def read_notification(
    *,
    db: Session = Depends(get_db),
    notification_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get notification by ID.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification

@router.put("/{notification_id}/read", response_model=NotificationSchema)
def mark_notification_read(
    *,
    db: Session = Depends(get_db),
    notification_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Mark notification as read.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.get("/unread/", response_model=List[NotificationSchema])
def read_unread_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all unread notifications for the current user.
    """
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).all()
    return notifications

@router.delete("/{notification_id}", response_model=NotificationSchema)
def delete_notification(
    *,
    db: Session = Depends(get_db),
    notification_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete notification.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    return notification 
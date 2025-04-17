from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.session import get_db
from app.db.models import User, Task, Service
from app.schemas.models import Task as TaskSchema, TaskCreate
from app.api.api_v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskSchema])
def read_tasks(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve tasks.
    """
    tasks = db.query(Task).offset(skip).limit(limit).all()
    return tasks

@router.post("/", response_model=TaskSchema)
def create_task(
    *,
    db: Session = Depends(get_db),
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new task.
    """
    # Verify service exists
    service = db.query(Service).filter(Service.id == task_in.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    task = Task(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{task_id}", response_model=TaskSchema)
def read_task(
    *,
    db: Session = Depends(get_db),
    task_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get task by ID.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    *,
    db: Session = Depends(get_db),
    task_id: int,
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update task.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Verify service exists
    service = db.query(Service).filter(Service.id == task_in.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    for field, value in task_in.model_dump().items():
        setattr(task, field, value)
    
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", response_model=TaskSchema)
def delete_task(
    *,
    db: Session = Depends(get_db),
    task_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete task.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    return task

@router.get("/pending/", response_model=List[TaskSchema])
def read_pending_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all pending tasks.
    """
    tasks = db.query(Task).filter(Task.is_completed == False).all()
    return tasks

@router.put("/{task_id}/complete", response_model=TaskSchema)
def complete_task(
    *,
    db: Session = Depends(get_db),
    task_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Mark task as completed.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.is_completed = True
    db.add(task)
    db.commit()
    db.refresh(task)
    return task 
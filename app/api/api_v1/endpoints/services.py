from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.session import get_db
from app.db.models import User, Service, Customer, ServiceProvider
from app.schemas.models import Service as ServiceSchema, ServiceCreate
from app.api.api_v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ServiceSchema])
def read_services(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve services.
    """
    services = db.query(Service).offset(skip).limit(limit).all()
    return services

@router.post("/", response_model=ServiceSchema)
def create_service(
    *,
    db: Session = Depends(get_db),
    service_in: ServiceCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new service.
    """
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == service_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Verify service provider exists
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == service_in.service_provider_id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider not found"
        )
    
    service = Service(**service_in.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.get("/{service_id}", response_model=ServiceSchema)
def read_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get service by ID.
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service

@router.put("/{service_id}", response_model=ServiceSchema)
def update_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    service_in: ServiceCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update service.
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == service_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Verify service provider exists
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == service_in.service_provider_id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider not found"
        )
    
    for field, value in service_in.model_dump().items():
        setattr(service, field, value)
    
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{service_id}", response_model=ServiceSchema)
def delete_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete service.
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    db.delete(service)
    db.commit()
    return service

@router.get("/upcoming/", response_model=List[ServiceSchema])
def read_upcoming_services(
    db: Session = Depends(get_db),
    days: int = 3,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get upcoming services within specified days.
    """
    today = datetime.utcnow()
    end_date = today + timedelta(days=days)
    
    services = db.query(Service).filter(
        Service.start_date >= today,
        Service.start_date <= end_date
    ).all()
    return services 
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Customer
from app.schemas.models import Customer as CustomerSchema, CustomerCreate
from app.api.api_v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CustomerSchema])
def read_customers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve customers.
    """
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=CustomerSchema)
def create_customer(
    *,
    db: Session = Depends(get_db),
    customer_in: CustomerCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new customer.
    """
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerSchema)
def read_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get customer by ID.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer

@router.put("/{customer_id}", response_model=CustomerSchema)
def update_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    customer_in: CustomerCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update customer.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    for field, value in customer_in.model_dump().items():
        setattr(customer, field, value)
    
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}", response_model=CustomerSchema)
def delete_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete customer.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    db.delete(customer)
    db.commit()
    return customer 
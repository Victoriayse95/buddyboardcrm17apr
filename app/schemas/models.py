from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .base import TimestampModel

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class User(UserBase, TimestampModel):
    id: int
    is_active: bool
    role: str

    class Config:
        from_attributes = True

# Customer schemas
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase, TimestampModel):
    id: int

    class Config:
        from_attributes = True

# Service Provider schemas
class ServiceProviderBase(BaseModel):
    name: str
    email: EmailStr
    phone: str

class ServiceProviderCreate(ServiceProviderBase):
    pass

class ServiceProvider(ServiceProviderBase, TimestampModel):
    id: int

    class Config:
        from_attributes = True

# Service schemas
class ServiceBase(BaseModel):
    customer_id: int
    service_provider_id: int
    service_type: str
    start_date: datetime
    end_date: datetime
    start_time: datetime
    end_time: datetime
    total_price: float
    notes: Optional[str] = None
    handled_by: str

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase, TimestampModel):
    id: int

    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    service_id: int
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    due_date: datetime

class TaskCreate(TaskBase):
    pass

class Task(TaskBase, TimestampModel):
    id: int

    class Config:
        from_attributes = True

# Notification schemas
class NotificationBase(BaseModel):
    user_id: int
    title: str
    message: str
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 
from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, users, customers, services, tasks, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"]) 
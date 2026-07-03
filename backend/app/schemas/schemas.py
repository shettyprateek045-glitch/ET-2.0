from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "Engineer"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    location: Optional[str] = None
    capacity_mw: Optional[float] = 100.0
    budget_million: Optional[float] = 150.0
    budget_used: Optional[float] = 0.0
    status: Optional[str] = "Active"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    ai_health_score: Optional[float] = 95.0

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RFIBase(BaseModel):
    project_id: int
    title: str
    question: str
    response: Optional[str] = None
    status: Optional[str] = "Open"
    asked_by: Optional[str] = None
    answered_by: Optional[str] = None

class RFICreate(RFIBase):
    pass

class RFIResponse(RFIBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QualityIssueBase(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Open"
    severity: Optional[str] = "Medium"
    reported_by: Optional[str] = None
    assigned_to: Optional[str] = None

class QualityIssueCreate(QualityIssueBase):
    pass

class QualityIssueResponse(QualityIssueBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    project_id: int
    po_number: str
    item_name: str
    quantity: Optional[int] = 1
    cost: float
    supplier_name: str
    status: Optional[str] = "Pending"
    tracking_status: Optional[str] = "In Production"
    supplier_risk: Optional[str] = "Low"
    delivery_date: Optional[datetime] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderResponse(PurchaseOrderBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CommissioningItemBase(BaseModel):
    project_id: int
    system_name: str
    component_name: str
    status: Optional[str] = "NotStarted"
    tester_name: Optional[str] = None
    test_date: Optional[datetime] = None

class CommissioningItemCreate(CommissioningItemBase):
    pass

class CommissioningItemSign(BaseModel):
    signature_data: str
    tester_name: str

class CommissioningItemResponse(CommissioningItemBase):
    id: int
    signature_data: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentMetadataResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    filename: str
    file_path: str
    doc_type: str
    version: int
    approved_status: str
    uploaded_by: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    session_id: str
    query: str
    language: Optional[str] = "English"

class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    timestamp: datetime

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="Engineer") # Admin, Project Manager, Engineer, Contractor, Client
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    location = Column(String, nullable=True)
    capacity_mw = Column(Float, default=100.0) # Data centre capacity
    budget_million = Column(Float, default=150.0)
    budget_used = Column(Float, default=0.0)
    status = Column(String, default="Active") # Planned, Active, Completed, Delayed
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    ai_health_score = Column(Float, default=95.0) # AI calculated health score (0-100)
    created_at = Column(DateTime, default=datetime.utcnow)

    rfis = relationship("RFI", back_populates="project", cascade="all, delete-orphan")
    quality_issues = relationship("QualityIssue", back_populates="project", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="project", cascade="all, delete-orphan")
    commissioning_items = relationship("CommissioningItem", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("DocumentMetadata", back_populates="project", cascade="all, delete-orphan")

class RFI(Base):
    __tablename__ = "rfis"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    status = Column(String, default="Open") # Open, Closed
    asked_by = Column(String, nullable=True)
    answered_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="rfis")

class QualityIssue(Base):
    __tablename__ = "quality_issues"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="Open") # Open, UnderReview, Resolved
    severity = Column(String, default="Medium") # Low, Medium, High, Critical
    reported_by = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="quality_issues")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    po_number = Column(String, unique=True, index=True, nullable=False)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    cost = Column(Float, nullable=False)
    supplier_name = Column(String, nullable=False)
    status = Column(String, default="Pending") # Pending, Approved, Shipped, Delivered
    tracking_status = Column(String, default="In Production") # In Production, In Transit, Customs Clearance, Delivered
    supplier_risk = Column(String, default="Low") # Low, Medium, High
    delivery_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="purchase_orders")

class CommissioningItem(Base):
    __tablename__ = "commissioning_items"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    system_name = Column(String, nullable=False) # e.g. HVAC, Electrical, UPS, Fire Suppression
    component_name = Column(String, nullable=False) # e.g. Generator 1, Chiller A
    status = Column(String, default="NotStarted") # NotStarted, InProgress, Tested, Certified
    tester_name = Column(String, nullable=True)
    signature_data = Column(Text, nullable=True) # Data URL representation of signature drawing
    test_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="commissioning_items")

class DocumentMetadata(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    doc_type = Column(String, default="Specification") # Specification, Contract, Drawing, RFI, VendorSubmittal, etc.
    ocr_text = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    approved_status = Column(String, default="Pending") # Pending, Approved, Rejected
    uploaded_by = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="documents")

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    session_id = Column(String, index=True, nullable=False)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    sources = Column(Text, nullable=True) # JSON or Comma-separated citations
    timestamp = Column(DateTime, default=datetime.utcnow)

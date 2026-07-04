from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import RFI, Project
from app.schemas.schemas import RFICreate, RFIResponse
from app.routers.auth import get_current_user, check_role
from app.models.models import User
from typing import List
from datetime import datetime

router = APIRouter(prefix="/rfis", tags=["rfis"])

@router.get("/project/{project_id}", response_model=List[RFIResponse])
def get_project_rfis(project_id: int, db: Session = Depends(get_db)):
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
    return db.query(RFI).filter(RFI.project_id == project_id).order_by(RFI.created_at.desc()).all()

@router.post("/", response_model=RFIResponse)
def create_rfi(rfi_in: RFICreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == rfi_in.project_id).first()
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
    
    # Enforce role check: Contractor or Engineer or PM or Admin can submit RFIs
    if current_user.role not in ["Admin", "Project Manager", "Engineer", "Contractor"]:
         raise HTTPException(status_code=403, detail="Unauthorized to create RFI")

    new_rfi = RFI(
         project_id=rfi_in.project_id,
         title=rfi_in.title,
         question=rfi_in.question,
         status="Open",
         asked_by=current_user.full_name or current_user.email
    )
    db.add(new_rfi)
    db.commit()
    db.refresh(new_rfi)
    return new_rfi

@router.put("/{rfi_id}/respond", response_model=RFIResponse)
def respond_rfi(rfi_id: int, rfi_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rfi = db.query(RFI).filter(RFI.id == rfi_id).first()
    if not rfi:
         raise HTTPException(status_code=404, detail="RFI not found")
    
    # Enforce role check: Only PM or Admin or Engineer can answer RFIs
    if current_user.role not in ["Admin", "Project Manager", "Engineer"]:
         raise HTTPException(status_code=403, detail="Unauthorized to answer RFI")

    response_text = rfi_data.get("response")
    if not response_text:
         raise HTTPException(status_code=400, detail="Response text is required")
         
    rfi.response = response_text
    rfi.status = "Closed"
    rfi.answered_by = current_user.full_name or current_user.email
    db.commit()
    db.refresh(rfi)
    return rfi

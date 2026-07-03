from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CommissioningItem
from app.schemas.schemas import CommissioningItemCreate, CommissioningItemResponse, CommissioningItemSign
from app.services.ai_service import AIService
from typing import List
from datetime import datetime

router = APIRouter(prefix="/commissioning", tags=["commissioning"])

@router.get("/", response_model=List[CommissioningItemResponse])
def get_commissioning_items(db: Session = Depends(get_db)):
    return db.query(CommissioningItem).all()

@router.post("/", response_model=CommissioningItemResponse)
def create_commissioning_item(item_in: CommissioningItemCreate, db: Session = Depends(get_db)):
    new_item = CommissioningItem(**item_in.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}/sign", response_model=CommissioningItemResponse)
def sign_commissioning_item(item_id: int, sign_in: CommissioningItemSign, db: Session = Depends(get_db)):
    item = db.query(CommissioningItem).filter(CommissioningItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Commissioning item not found")
    item.signature_data = sign_in.signature_data
    item.tester_name = sign_in.tester_name
    item.status = "Certified"
    item.test_date = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item

@router.get("/copilot-check")
def run_copilot_audit():
    """Runs Commissioning Quality Assurance Copilot audit."""
    checks = AIService.commissioning_copilot()
    return {
        "status": "Check complete",
        "alerts": checks
    }

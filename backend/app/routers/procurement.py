from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import PurchaseOrder
from app.schemas.schemas import PurchaseOrderCreate, PurchaseOrderResponse
from app.services.ai_service import AIService
from typing import List

router = APIRouter(prefix="/procurement", tags=["procurement"])

@router.get("/", response_model=List[PurchaseOrderResponse])
def get_purchase_orders(db: Session = Depends(get_db)):
    return db.query(PurchaseOrder).all()

@router.post("/", response_model=PurchaseOrderResponse)
def create_purchase_order(po_in: PurchaseOrderCreate, db: Session = Depends(get_db)):
    new_po = PurchaseOrder(**po_in.model_dump())
    db.add(new_po)
    db.commit()
    db.refresh(new_po)
    return new_po

@router.get("/supplier-risk-assessment")
def get_supplier_risk_assessment():
    """Runs supply chain intelligence risk scanning."""
    risks = AIService.supply_chain_risk_agent()
    return {
        "status": "Scanning Complete",
        "timestamp": "2026-07-03T16:18:51Z",
        "risks": risks
    }

@router.put("/{po_id}/update-status")
def update_po_status(po_id: int, status: str, tracking_status: str, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    po.status = status
    po.tracking_status = tracking_status
    db.commit()
    return {"message": "Purchase order updated successfully", "id": po_id}

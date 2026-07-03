from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Project, RFI, QualityIssue, PurchaseOrder, CommissioningItem
from app.schemas.schemas import ProjectCreate, ProjectResponse
from typing import List, Dict, Any

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.post("/", response_model=ProjectResponse)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    new_proj = Project(**project_in.model_dump())
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    return new_proj

@router.get("/dashboard-kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    """Fetch aggregated KPIs for the Microsoft Azure style EPC Dashboard."""
    projects = db.query(Project).all()
    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status == "Active")
    completed_projects = sum(1 for p in projects if p.status == "Completed")
    delayed_projects = sum(1 for p in projects if p.status == "Delayed")
    
    total_budget = sum(p.budget_million for p in projects)
    total_spent = sum(p.budget_used for p in projects)
    avg_health = sum(p.ai_health_score for p in projects) / total_projects if total_projects > 0 else 100.0
    
    # Query count of open items
    open_rfis = db.query(RFI).filter(RFI.status == "Open").count()
    open_issues = db.query(QualityIssue).filter(QualityIssue.status == "Open").count()
    
    # High risk supplier counting
    high_risk_suppliers = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_risk == "High").count()
    
    return {
        "totalProjects": total_projects,
        "activeProjects": active_projects,
        "completedProjects": completed_projects,
        "delayedProjects": delayed_projects,
        "openRFIs": open_rfis,
        "openQualityIssues": open_issues,
        "totalBudgetMillion": total_budget,
        "budgetUsedMillion": total_spent,
        "aiHealthScore": round(avg_health, 1),
        "supplierRiskCount": high_risk_suppliers
    }

@router.get("/dashboard-charts")
def get_dashboard_charts(db: Session = Depends(get_db)):
    """Return historical and aggregated data for recharts plots."""
    # Monthly cost vs budget trend data
    monthly_trend = [
        {"name": "Jan", "Budget": 20, "Spent": 15, "RFIs": 5},
        {"name": "Feb", "Budget": 40, "Spent": 32, "RFIs": 8},
        {"name": "Mar", "Budget": 60, "Spent": 51, "RFIs": 12},
        {"name": "Apr", "Budget": 85, "Spent": 78, "RFIs": 19},
        {"name": "May", "Budget": 110, "Spent": 98, "RFIs": 15},
        {"name": "Jun", "Budget": 150, "Spent": 135, "RFIs": 10}
    ]
    
    # Risk Heatmap: Category by Severity matrix
    risk_heatmap = [
        {"category": "Engineering", "Low": 8, "Medium": 4, "High": 1, "Critical": 0},
        {"category": "Procurement", "Low": 3, "Medium": 7, "High": 5, "Critical": 2},
        {"category": "Construction", "Low": 12, "Medium": 15, "High": 3, "Critical": 1},
        {"category": "Commissioning", "Low": 5, "Medium": 2, "High": 1, "Critical": 0}
    ]
    
    # Project progress tracker
    projects = db.query(Project).all()
    project_progress = []
    for p in projects:
        # Calculate completion percent based on commissioning or static estimate
        total_items = db.query(CommissioningItem).filter(CommissioningItem.project_id == p.id).count()
        tested_items = db.query(CommissioningItem).filter(
            CommissioningItem.project_id == p.id,
            CommissioningItem.status.in_(["Tested", "Certified"])
        ).count()
        
        progress = int((tested_items / total_items) * 100) if total_items > 0 else (75 if p.status == "Active" else (100 if p.status == "Completed" else 45))
        project_progress.append({
            "id": p.id,
            "name": p.name,
            "progress": progress,
            "status": p.status,
            "health": p.ai_health_score
        })
        
    return {
        "monthlyTrend": monthly_trend,
        "riskHeatmap": risk_heatmap,
        "projectProgress": project_progress
    }

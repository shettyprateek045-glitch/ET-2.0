from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.models import User, Project, RFI, QualityIssue, PurchaseOrder, CommissioningItem, DocumentMetadata, Notification
from app.routers import auth, projects, documents, procurement, quality, commissioning, ai, reports, rfis
from datetime import datetime, timedelta
import hashlib

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend services for DataCentre AI EPC Platform",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(procurement.router, prefix=settings.API_V1_STR)
app.include_router(quality.router, prefix=settings.API_V1_STR)
app.include_router(commissioning.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(rfis.router, prefix=settings.API_V1_STR)


# Seed Database
def seed_database():
    db = SessionLocal()
    try:
        # Check if users already seeded
        if db.query(User).count() > 0:
            return
            
        print("Seeding database with demo EPC datasets...")
        # 1. Users
        def hash_pw(pw): return hashlib.sha256(pw.encode()).hexdigest()
        
        users = [
            User(email="admin@datacentre.ai", hashed_password=hash_pw("admin123"), full_name="Sarah Connor", role="Admin"),
            User(email="pm@datacentre.ai", hashed_password=hash_pw("pm123"), full_name="David Vance", role="Project Manager"),
            User(email="engineer@datacentre.ai", hashed_password=hash_pw("eng123"), full_name="Alex Mercer", role="Engineer"),
            User(email="contractor@datacentre.ai", hashed_password=hash_pw("con123"), full_name="Marcus Aurelius", role="Contractor"),
            User(email="client@datacentre.ai", hashed_password=hash_pw("client123"), full_name="Bill Gates", role="Client")
        ]
        db.add_all(users)
        db.commit()
        
        # 2. Projects
        projects = [
            Project(name="Project Dublin Hyperscale DC-1", location="Dublin, Ireland", capacity_mw=120.0, budget_million=180.0, budget_used=135.2, status="Active", ai_health_score=94.5, start_date=datetime.now() - timedelta(days=200), end_date=datetime.now() + timedelta(days=150)),
            Project(name="Project Frankfurt Edge DC-5", location="Frankfurt, Germany", capacity_mw=45.0, budget_million=75.0, budget_used=72.0, status="Delayed", ai_health_score=78.2, start_date=datetime.now() - timedelta(days=300), end_date=datetime.now() + timedelta(days=20)),
            Project(name="Singapore Green Hybrid DC-3", location="Singapore", capacity_mw=80.0, budget_million=120.0, budget_used=24.5, status="Active", ai_health_score=96.1, start_date=datetime.now() - timedelta(days=30), end_date=datetime.now() + timedelta(days=400)),
            Project(name="Virginia Colocation Hub", location="Ashburn, VA, USA", capacity_mw=250.0, budget_million=320.0, budget_used=320.0, status="Completed", ai_health_score=98.0, start_date=datetime.now() - timedelta(days=450), end_date=datetime.now() - timedelta(days=10))
        ]
        db.add_all(projects)
        db.commit()
        
        # Retrieve ids
        p1 = projects[0].id
        p2 = projects[1].id
        p3 = projects[2].id
        
        # 3. RFIs
        rfis = [
            RFI(project_id=p1, title="Generator Belly Tank Containment Dike", question="Does section 4.2.1 require a separate concrete containment dike around the double-walled steel belly tanks?", response="Yes. Although the belly tanks are double-walled, local environmental permits require an additional 110% capacity concrete dike in this specific aquifer zone.", status="Closed", asked_by="Marcus Aurelius", answered_by="Sarah Connor"),
            RFI(project_id=p1, title="UPS Busway Copper vs Aluminum", question="Can we substitute the copper feeder busway with aluminum to save lead time?", response=None, status="Open", asked_by="Marcus Aurelius", answered_by=None),
            RFI(project_id=p2, title="MV Transformer Clearance Layout", question="Is the clearance in front of MV transformer room B compliant with NEC 110.26?", response="Checked drawings: The clearance is 32 inches, which is non-compliant. We must modify the layout door orientation to outward-opening to satisfy the 36-inch clearance constraint.", status="Closed", asked_by="Alex Mercer", answered_by="David Vance")
        ]
        db.add_all(rfis)
        
        # 4. Quality Issues (NCRs)
        issues = [
            QualityIssue(project_id=p1, title="Lithium-Ion UPS Ventilation Rating", description="HVAC ventilation design specifies 8 ACH in UPS rooms, but thermal safety guidelines demand minimum 10 ACH.", status="Open", severity="High", reported_by="Sarah Connor", assigned_to="Alex Mercer"),
            QualityIssue(project_id=p2, title="Foundation Micro-cracks on Pad 3", description="Post-pour inspections identified fine micro-cracks on Chiller Pad 3. Cores tested at 4,800 psi, which meets specification; issue is aesthetic but needs sealing.", status="UnderReview", severity="Medium", reported_by="Alex Mercer", assigned_to="Marcus Aurelius"),
            QualityIssue(project_id=p1, title="Chilled Water Joint Leaks", description="Pressure testing on piping loop A revealed pinhole leaks at joint welding J-402.", status="Resolved", severity="Critical", reported_by="Marcus Aurelius", assigned_to="Alex Mercer")
        ]
        db.add_all(issues)
        
        # 5. Purchase Orders (Procurement)
        pos = [
            PurchaseOrder(project_id=p1, po_number="PO-2026-001", item_name="Caterpillar 2MW Diesel Generator", quantity=6, cost=4200000.0, supplier_name="Apex Power Systems Ltd", status="Approved", tracking_status="In Production", supplier_risk="Medium", delivery_date=datetime.now() + timedelta(days=60)),
            PurchaseOrder(project_id=p2, po_number="PO-2026-002", item_name="York 500-Ton Centrifugal Chiller", quantity=4, cost=1850000.0, supplier_name="Boreas Cooling Systems", status="Shipped", tracking_status="In Transit", supplier_risk="High", delivery_date=datetime.now() + timedelta(days=24)),
            PurchaseOrder(project_id=p1, po_number="PO-2026-003", item_name="Eaton 500kVA Lithium-Ion UPS Systems", quantity=8, cost=2400000.0, supplier_name="Eaton Corp", status="Delivered", tracking_status="Delivered", supplier_risk="Low", delivery_date=datetime.now() - timedelta(days=15))
        ]
        db.add_all(pos)
        
        # 6. Commissioning Checklists
        comm_items = [
            CommissioningItem(project_id=p1, system_name="Electrical", component_name="UPS Rack A-1 Static Switch Test", status="Tested", tester_name="Alex Mercer", test_date=datetime.now() - timedelta(days=5)),
            CommissioningItem(project_id=p1, system_name="HVAC", component_name="Chiller-1 Water Loop Balance", status="InProgress", tester_name="Alex Mercer"),
            CommissioningItem(project_id=p1, system_name="Fire Safety", component_name="Pre-action Valve Solenoid Release", status="NotStarted"),
            CommissioningItem(project_id=p2, system_name="Electrical", component_name="Generator G-1 Governor Calibrations", status="Tested", tester_name="Marcus Aurelius", test_date=datetime.now() - timedelta(days=2)),
            CommissioningItem(project_id=p2, system_name="Electrical", component_name="Generator G-2 Governor Calibrations", status="NotStarted")
        ]
        db.add_all(comm_items)
        
        # 7. Document Metadatas
        docs = [
            DocumentMetadata(project_id=p1, filename="General_Specifications_Electrical_Subsystems.pdf", file_path="./uploads/General_Specifications_Electrical_Subsystems.pdf", doc_type="Specification", version=1, approved_status="Approved", uploaded_by="Sarah Connor"),
            DocumentMetadata(project_id=p1, filename="RFI-104_Response_Fuel_System_Redesign.pdf", file_path="./uploads/RFI-104_Response_Fuel_System_Redesign.pdf", doc_type="RFI", version=1, approved_status="Approved", uploaded_by="David Vance"),
            DocumentMetadata(project_id=p2, filename="Drawing_DC-ME-302_Mechanical_Piping_Details.dwg", file_path="./uploads/Drawing_DC-ME-302_Mechanical_Piping_Details.dwg", doc_type="Drawing", version=2, approved_status="Pending", uploaded_by="Marcus Aurelius")
        ]
        db.add_all(docs)
        
        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

seed_database()

@app.get("/")
def read_root():
    return {"message": "DataCentre AI EPC Intelligence Platform APIs Online."}

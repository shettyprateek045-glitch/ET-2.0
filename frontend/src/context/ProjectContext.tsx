"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Project {
  id: number;
  name: string;
  location: string;
  capacity_mw: number;
  budget_million: number;
  budget_used: number;
  status: 'Active' | 'Delayed' | 'Completed' | 'Planned';
  ai_health_score: number;
  start_date: string;
  end_date: string;
}

export interface RFI {
  id: number;
  project_id: number;
  title: string;
  question: string;
  response?: string;
  status: 'Open' | 'Closed';
  asked_by: string;
  answered_by?: string;
  created_at: string;
}

export interface QualityIssue {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: 'Open' | 'UnderReview' | 'Resolved';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reported_by: string;
  assigned_to: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: number;
  project_id: number;
  po_number: string;
  item_name: string;
  quantity: number;
  cost: number;
  supplier_name: string;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered';
  tracking_status: string;
  supplier_risk: 'Low' | 'Medium' | 'High';
  delivery_date: string;
}

export interface CommissioningItem {
  id: number;
  project_id: number;
  system_name: string;
  component_name: string;
  status: 'NotStarted' | 'InProgress' | 'Tested' | 'Certified';
  tester_name?: string;
  signature_data?: string;
  test_date?: string;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (proj: Project) => void;
  rfis: RFI[];
  qualityIssues: QualityIssue[];
  purchaseOrders: PurchaseOrder[];
  commissioningItems: CommissioningItem[];
  kpis: any;
  chartData: any;
  loading: boolean;
  refreshData: () => Promise<void>;
  createProject: (proj: Partial<Project>) => Promise<void>;
  addRFI: (rfi: Partial<RFI>) => Promise<void>;
  addQualityIssue: (issue: Partial<QualityIssue>) => Promise<void>;
  addPurchaseOrder: (po: Partial<PurchaseOrder>) => Promise<void>;
  signCommissioning: (itemId: number, tester: string, signature: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Standalone Mock Data fallbacks
const MOCK_PROJECTS: Project[] = [
  { id: 1, name: "Project Dublin Hyperscale DC-1", location: "Dublin, Ireland", capacity_mw: 120, budget_million: 180, budget_used: 135.2, status: "Active", ai_health_score: 94.5, start_date: "2025-11-15", end_date: "2026-11-20" },
  { id: 2, name: "Project Frankfurt Edge DC-5", location: "Frankfurt, Germany", capacity_mw: 45, budget_million: 75, budget_used: 72.0, status: "Delayed", ai_health_score: 78.2, start_date: "2025-08-01", end_date: "2026-07-22" },
  { id: 3, name: "Singapore Green Hybrid DC-3", location: "Singapore", capacity_mw: 80, budget_million: 120, budget_used: 24.5, status: "Active", ai_health_score: 96.1, start_date: "2026-06-01", end_date: "2027-08-15" },
  { id: 4, name: "Virginia Colocation Hub", location: "Ashburn, VA, USA", capacity_mw: 250, budget_million: 320, budget_used: 320, status: "Completed", ai_health_score: 98.0, start_date: "2025-04-10", end_date: "2026-06-25" }
];

const MOCK_RFIS: RFI[] = [
  { id: 1, project_id: 1, title: "Generator Belly Tank Containment Dike", question: "Does section 4.2.1 require a separate concrete containment dike around the double-walled steel belly tanks?", response: "Yes. Although the belly tanks are double-walled, local environmental permits require an additional 110% capacity concrete dike in this specific aquifer zone.", status: "Closed", asked_by: "Marcus Aurelius", answered_by: "Sarah Connor", created_at: "2026-06-15" },
  { id: 2, project_id: 1, title: "UPS Busway Copper vs Aluminum", question: "Can we substitute the copper feeder busway with aluminum to save lead time?", status: "Open", asked_by: "Marcus Aurelius", created_at: "2026-07-02" },
  { id: 3, project_id: 2, title: "MV Transformer Clearance Layout", question: "Is the clearance in front of MV transformer room B compliant with NEC 110.26?", response: "Checked drawings: The clearance is 32 inches, which is non-compliant. We must modify the layout door orientation to outward-opening to satisfy the 36-inch clearance constraint.", status: "Closed", asked_by: "Alex Mercer", answered_by: "David Vance", created_at: "2026-05-18" }
];

const MOCK_QUALITY: QualityIssue[] = [
  { id: 1, project_id: 1, title: "Lithium-Ion UPS Ventilation Rating", description: "HVAC ventilation design specifies 8 ACH in UPS rooms, but thermal safety guidelines demand minimum 10 ACH.", status: "Open", severity: "High", reported_by: "Sarah Connor", assigned_to: "Alex Mercer", created_at: "2026-06-28" },
  { id: 2, project_id: 2, title: "Foundation Micro-cracks on Pad 3", description: "Post-pour inspections identified fine micro-cracks on Chiller Pad 3. Cores tested at 4,800 psi, which meets specification; issue is aesthetic but needs sealing.", status: "UnderReview", severity: "Medium", reported_by: "Alex Mercer", assigned_to: "Marcus Aurelius", created_at: "2026-07-01" },
  { id: 3, project_id: 1, title: "Chilled Water Joint Welds Leaks", description: "Pressure testing on piping loop A revealed pinhole leaks at joint welding J-402.", status: "Resolved", severity: "Critical", reported_by: "Marcus Aurelius", assigned_to: "Alex Mercer", created_at: "2026-05-10" }
];

const MOCK_POS: PurchaseOrder[] = [
  { id: 1, project_id: 1, po_number: "PO-2026-001", item_name: "Caterpillar 2MW Diesel Generator", quantity: 6, cost: 4200000, supplier_name: "Apex Power Systems Ltd", status: "Approved", tracking_status: "In Production", supplier_risk: "Medium", delivery_date: "2026-09-01" },
  { id: 2, project_id: 2, po_number: "PO-2026-002", item_name: "York 500-Ton Centrifugal Chiller", quantity: 4, cost: 1850000, supplier_name: "Boreas Cooling Systems", status: "Shipped", tracking_status: "In Transit", supplier_risk: "High", delivery_date: "2026-07-27" },
  { id: 3, project_id: 1, po_number: "PO-2026-003", item_name: "Eaton 500kVA Lithium-Ion UPS Systems", quantity: 8, cost: 2400000, supplier_name: "Eaton Corp", status: "Delivered", tracking_status: "Delivered", supplier_risk: "Low", delivery_date: "2026-06-18" }
];

const MOCK_COMMISSIONING: CommissioningItem[] = [
  { id: 1, project_id: 1, system_name: "Electrical", component_name: "UPS Rack A-1 Static Switch Test", status: "Tested", tester_name: "Alex Mercer", test_date: "2026-06-28" },
  { id: 2, project_id: 1, system_name: "HVAC", component_name: "Chiller-1 Water Loop Balance", status: "InProgress", tester_name: "Alex Mercer" },
  { id: 3, project_id: 1, system_name: "Fire Safety", component_name: "Pre-action Valve Solenoid Release", status: "NotStarted" },
  { id: 4, project_id: 2, system_name: "Electrical", component_name: "Generator G-1 Governor Calibrations", status: "Tested", tester_name: "Marcus Aurelius", test_date: "2026-07-01" },
  { id: 5, project_id: 2, system_name: "Electrical", component_name: "Generator G-2 Governor Calibrations", status: "NotStarted" }
];

const MOCK_KPIS = {
  totalProjects: 4, activeProjects: 2, completedProjects: 1, delayedProjects: 1,
  openRFIs: 1, openQualityIssues: 2, totalBudgetMillion: 695, budgetUsedMillion: 551.7,
  aiHealthScore: 91.7, supplierRiskCount: 1
};

const MOCK_CHARTS = {
  monthlyTrend: [
    { name: "Jan", Budget: 20, Spent: 15, RFIs: 5 },
    { name: "Feb", Budget: 40, Spent: 32, RFIs: 8 },
    { name: "Mar", Budget: 60, Spent: 51, RFIs: 12 },
    { name: "Apr", Budget: 85, Spent: 78, RFIs: 19 },
    { name: "May", Budget: 110, Spent: 98, RFIs: 15 },
    { name: "Jun", Budget: 150, Spent: 135, RFIs: 10 }
  ],
  riskHeatmap: [
    { category: "Engineering", Low: 8, Medium: 4, High: 1, Critical: 0 },
    { category: "Procurement", Low: 3, Medium: 7, High: 5, Critical: 2 },
    { category: "Construction", Low: 12, Medium: 15, High: 3, Critical: 1 },
    { category: "Commissioning", Low: 5, Medium: 2, High: 1, Critical: 0 }
  ],
  projectProgress: [
    { id: 1, name: "Project Dublin Hyperscale DC-1", progress: 66, status: "Active", health: 94.5 },
    { id: 2, name: "Project Frankfurt Edge DC-5", progress: 50, status: "Delayed", health: 78.2 },
    { id: 3, name: "Singapore Green Hybrid DC-3", progress: 5, status: "Active", health: 96.1 },
    { id: 4, name: "Virginia Colocation Hub", progress: 100, status: "Completed", health: 98.0 }
  ]
};

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProject, setActiveProjectState] = useState<Project | null>(MOCK_PROJECTS[0]);
  const [rfis, setRfis] = useState<RFI[]>(MOCK_RFIS);
  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>(MOCK_QUALITY);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_POS);
  const [commissioningItems, setCommissioningItems] = useState<CommissioningItem[]>(MOCK_COMMISSIONING);
  const [kpis, setKpis] = useState<any>(MOCK_KPIS);
  const [chartData, setChartData] = useState<any>(MOCK_CHARTS);
  const [loading, setLoading] = useState(true);

  const setActiveProject = (proj: Project) => {
    setActiveProjectState(proj);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const projRes = await fetch('http://127.0.0.1:8000/api/v1/projects/');
      const kpisRes = await fetch('http://127.0.0.1:8000/api/v1/projects/dashboard-kpis');
      const chartsRes = await fetch('http://127.0.0.1:8000/api/v1/projects/dashboard-charts');
      
      const rfiRes = await fetch('http://127.0.0.1:8000/api/v1/ai/agents/project-knowledge-rfi?query=rfi');
      const poRes = await fetch('http://127.0.0.1:8000/api/v1/procurement/');
      const ncrRes = await fetch('http://127.0.0.1:8000/api/v1/quality/');
      const comRes = await fetch('http://127.0.0.1:8000/api/v1/commissioning/');

      if (projRes.ok) {
        const projs = await projRes.json();
        setProjects(projs);
        if (projs.length > 0) setActiveProjectState(projs[0]);
      }
      if (kpisRes.ok) setKpis(await kpisRes.json());
      if (chartsRes.ok) setChartData(await chartsRes.json());
      if (poRes.ok) setPurchaseOrders(await poRes.json());
      if (ncrRes.ok) setQualityIssues(await ncrRes.json());
      if (comRes.ok) setCommissioningItems(await comRes.json());
    } catch (e) {
      console.warn("FastAPI backend connection offline. Rendering local high-fidelity mock datasets.");
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const createProject = async (proj: Partial<Project>) => {
    const newProj: Project = {
      id: projects.length + 1,
      name: proj.name || "Untitled Project",
      location: proj.location || "TBD",
      capacity_mw: proj.capacity_mw || 50,
      budget_million: proj.budget_million || 100,
      budget_used: 0,
      status: 'Active',
      ai_health_score: 95.0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    };
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      });
      if (res.ok) {
        refreshData();
        return;
      }
    } catch (e) {
      console.warn("Backend offline. Simulating local project registration.");
    }

    const updated = [...projects, newProj];
    setProjects(updated);
    setActiveProjectState(newProj);
    // Update local KPIs
    setKpis((prev: any) => ({
      ...prev,
      totalProjects: prev.totalProjects + 1,
      activeProjects: prev.activeProjects + 1,
      totalBudgetMillion: prev.totalBudgetMillion + newProj.budget_million
    }));
  };

  const addRFI = async (rfi: Partial<RFI>) => {
    const newRFI: RFI = {
      id: rfis.length + 1,
      project_id: activeProject?.id || 1,
      title: rfi.title || "Untitled RFI",
      question: rfi.question || "",
      status: 'Open',
      asked_by: user?.full_name || "Engineer",
      created_at: new Date().toISOString().split('T')[0]
    };
    
    setRfis([newRFI, ...rfis]);
    setKpis((prev: any) => ({ ...prev, openRFIs: prev.openRFIs + 1 }));
  };

  const addQualityIssue = async (issue: Partial<QualityIssue>) => {
    const newIssue: QualityIssue = {
      id: qualityIssues.length + 1,
      project_id: activeProject?.id || 1,
      title: issue.title || "Untitled Defect",
      description: issue.description || "",
      status: 'Open',
      severity: issue.severity || 'Medium',
      reported_by: user?.full_name || "Inspector",
      assigned_to: issue.assigned_to || "Alex Mercer",
      created_at: new Date().toISOString().split('T')[0]
    };
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/quality/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue)
      });
      if (res.ok) {
        refreshData();
        return;
      }
    } catch (e) {}

    setQualityIssues([newIssue, ...qualityIssues]);
    setKpis((prev: any) => ({ ...prev, openQualityIssues: prev.openQualityIssues + 1 }));
  };

  const addPurchaseOrder = async (po: Partial<PurchaseOrder>) => {
    const newPO: PurchaseOrder = {
      id: purchaseOrders.length + 1,
      project_id: activeProject?.id || 1,
      po_number: po.po_number || `PO-2026-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      item_name: po.item_name || "",
      quantity: po.quantity || 1,
      cost: po.cost || 0,
      supplier_name: po.supplier_name || "",
      status: 'Pending',
      tracking_status: 'In Production',
      supplier_risk: po.supplier_risk || 'Low',
      delivery_date: po.delivery_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/procurement/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPO)
      });
      if (res.ok) {
        refreshData();
        return;
      }
    } catch (e) {}

    setPurchaseOrders([newPO, ...purchaseOrders]);
  };

  const signCommissioning = async (itemId: number, tester: string, signature: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/commissioning/${itemId}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tester_name: tester, signature_data: signature })
      });
      if (res.ok) {
        refreshData();
        return;
      }
    } catch (e) {}

    const updated = commissioningItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'Certified' as const,
          tester_name: tester,
          signature_data: signature,
          test_date: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    setCommissioningItems(updated);
  };

  return (
    <ProjectContext.Provider value={{
      projects, activeProject, setActiveProject, rfis, qualityIssues, purchaseOrders, commissioningItems,
      kpis, chartData, loading, refreshData, createProject, addRFI, addQualityIssue, addPurchaseOrder, signCommissioning
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

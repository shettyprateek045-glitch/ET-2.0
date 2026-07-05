"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Project {
  id: number;
  name: string;
  location: string;
  capacity_mw: number;
  capacityMw?: number;
  budget_million: number;
  budgetMillion?: number;
  budget_used: number;
  budgetUsed?: number;
  status: 'Active' | 'Delayed' | 'Completed' | 'Planned';
  ai_health_score: number;
  aiHealthScore?: number;
  start_date: string;
  startDate?: string;
  end_date: string;
  endDate?: string;
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

export interface DocumentMetadata {
  id: number;
  project_id: number;
  filename: string;
  file_path: string;
  doc_type: string;
  version: number;
  approved_status: 'Pending' | 'Approved' | 'Rejected';
  uploaded_by: string;
  uploaded_at: string;
  status?: string;
}

export interface AppNotification {
  id: number;
  project_id: number;
  message: string;
  type: 'info' | 'delay' | 'quality';
  is_read: boolean;
  created_at: string;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (proj: Project) => void;
  rfis: RFI[];
  qualityIssues: QualityIssue[];
  purchaseOrders: PurchaseOrder[];
  commissioningItems: CommissioningItem[];
  documents: DocumentMetadata[];
  notifications: AppNotification[];
  kpis: any;
  chartData: any;
  loading: boolean;
  refreshData: (silent?: boolean) => Promise<void>;
  createProject: (proj: Partial<Project>) => Promise<void>;
  editProject: (projId: number, proj: Partial<Project>) => Promise<void>;
  deleteProject: (projId: number) => Promise<void>;
  addRFI: (rfi: Partial<RFI>) => Promise<void>;
  respondRFI: (rfiId: number, responseText: string) => Promise<void>;
  addQualityIssue: (issue: Partial<QualityIssue>) => Promise<void>;
  resolveQualityIssue: (issueId: number, status: 'Open' | 'UnderReview' | 'Resolved') => Promise<void>;
  addPurchaseOrder: (po: Partial<PurchaseOrder>) => Promise<void>;
  updatePurchaseOrderStatus: (poId: number, status: string, tracking: string) => Promise<void>;
  signCommissioning: (itemId: number, tester: string, signature: string) => Promise<void>;
  uploadDocument: (file: File, docType: string) => Promise<boolean>;
  approveDocument: (docId: number, status: 'Approved' | 'Rejected' | 'Pending') => Promise<void>;
  fetchDocumentSummary: (docId: number) => Promise<string>;
  markNotificationRead: (notifId: number) => Promise<void>;
  users: any[];
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: number, role: string, is_active: boolean) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Fallbacks if backend is offline
const MOCK_PROJECTS: Project[] = [
  { id: 1, name: "Project Dublin Hyperscale DC-1", location: "Dublin, Ireland", capacity_mw: 120, budget_million: 180, budget_used: 135.2, status: "Active", ai_health_score: 94.5, start_date: "2025-11-15", end_date: "2026-11-20" },
  { id: 2, name: "Project Frankfurt Edge DC-5", location: "Frankfurt, Germany", capacity_mw: 45, budget_million: 75, budget_used: 72.0, status: "Delayed", ai_health_score: 78.2, start_date: "2025-08-01", end_date: "2026-07-22" },
  { id: 3, name: "Singapore Green Hybrid DC-3", location: "Singapore", capacity_mw: 80, budget_million: 120, budget_used: 24.5, status: "Active", ai_health_score: 96.1, start_date: "2026-06-01", end_date: "2027-08-15" },
  { id: 4, name: "Virginia Colocation Hub", location: "Ashburn, VA, USA", capacity_mw: 250, budget_million: 320, budget_used: 320, status: "Completed", ai_health_score: 98.0, start_date: "2025-04-10", end_date: "2026-06-25" }
];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProject, setActiveProjectState] = useState<Project | null>(MOCK_PROJECTS[0]);
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [commissioningItems, setCommissioningItems] = useState<CommissioningItem[]>([]);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Helper fetch with JWT
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {})
    } as any;
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    // Only set Content-Type if it's not a FormData upload
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(url, { ...options, headers });
  };

  const setActiveProject = (proj: Project) => {
    setActiveProjectState(proj);
  };

  const refreshData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fire all main requests in parallel for faster initial load
      const [projRes, kpisRes, chartsRes, poRes, ncrRes, comRes, docRes] = await Promise.all([
        authFetch('http://127.0.0.1:8000/api/v1/projects/'),
        authFetch('http://127.0.0.1:8000/api/v1/projects/dashboard-kpis'),
        authFetch('http://127.0.0.1:8000/api/v1/projects/dashboard-charts'),
        authFetch('http://127.0.0.1:8000/api/v1/procurement/'),
        authFetch('http://127.0.0.1:8000/api/v1/quality/'),
        authFetch('http://127.0.0.1:8000/api/v1/commissioning/'),
        authFetch('http://127.0.0.1:8000/api/v1/documents/')
      ]);

      if (projRes.ok) {
        const projs = await projRes.json();
        setProjects(projs);
        if (projs.length > 0) {
          // Keep active project selected if it still exists
          const currentActive = activeProject ? projs.find((p: any) => Number(p.id) === Number(activeProject.id)) : null;
          setActiveProjectState(currentActive || projs[0]);
        }
      }
      if (kpisRes.ok) setKpis(await kpisRes.json());
      if (chartsRes.ok) setChartData(await chartsRes.json());
      if (poRes.ok) {
        const pos = await poRes.json();
        setPurchaseOrders(activeProject ? pos.filter((p: any) => Number(p.project_id) === Number(activeProject.id)) : pos);
      }
      if (ncrRes.ok) {
        const ncrs = await ncrRes.json();
        setQualityIssues(activeProject ? ncrs.filter((n: any) => Number(n.project_id) === Number(activeProject.id)) : ncrs);
      }
      if (comRes.ok) {
        const coms = await comRes.json();
        setCommissioningItems(activeProject ? coms.filter((c: any) => Number(c.project_id) === Number(activeProject.id)) : coms);
      }
      if (docRes.ok) {
        const docs = await docRes.json();
        setDocuments(activeProject ? docs.filter((d: any) => Number(d.project_id) === Number(activeProject.id)) : docs);
      }

      // Fetch RFIs and notifications concurrently
      if (activeProject) {
        const [rfiRes, notifRes] = await Promise.all([
          authFetch(`http://127.0.0.1:8000/api/v1/rfis/project/${activeProject.id}`),
          authFetch(`http://127.0.0.1:8000/api/v1/projects/${activeProject.id}/notifications`)
        ]);
        if (rfiRes.ok) setRfis(await rfiRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
      
      // Admin user fetch
      if (user?.role === 'Admin') await fetchUsers();
    } catch (e) {
      console.warn("FastAPI backend connection offline. Rendering local fallbacks.");
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user, activeProject?.id]);

  const createProject = async (proj: Partial<Project>) => {
    const newProj = {
      name: proj.name || "Untitled Project",
      location: proj.location || "TBD",
      capacity_mw: proj.capacity_mw || 100.0,
      budget_million: proj.budget_million || 150.0,
      budget_used: 0.0,
      status: proj.status || 'Active',
      ai_health_score: 95.0,
      start_date: proj.start_date ? new Date(proj.start_date).toISOString() : new Date().toISOString(),
      end_date: proj.end_date ? new Date(proj.end_date).toISOString() : new Date(Date.now() + 365*24*60*60*1000).toISOString()
    };
    
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/v1/projects/', {
        method: 'POST',
        body: JSON.stringify(newProj)
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const editProject = async (projId: number, proj: Partial<Project>) => {
    const editProj = {
      name: proj.name,
      location: proj.location,
      capacity_mw: proj.capacity_mw,
      budget_million: proj.budget_million,
      budget_used: proj.budget_used,
      status: proj.status,
      ai_health_score: proj.ai_health_score || activeProject?.ai_health_score || 95.0,
      start_date: proj.start_date ? new Date(proj.start_date).toISOString() : activeProject?.start_date,
      end_date: proj.end_date ? new Date(proj.end_date).toISOString() : activeProject?.end_date
    };
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/projects/${projId}`, {
        method: 'PUT',
        body: JSON.stringify(editProj)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("Edit project failed", e);
    }
  };

  const deleteProject = async (projId: number) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/projects/${projId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Change active project to another one before complete reload
        const remaining = projects.filter(p => p.id !== projId);
        if (remaining.length > 0) setActiveProjectState(remaining[0]);
        await refreshData();
      }
    } catch (e) {
      console.error("Delete project failed", e);
    }
  };

  const addRFI = async (rfi: Partial<RFI>) => {
    if (!activeProject) return;
    const newRFI = {
      project_id: activeProject.id,
      title: rfi.title || "Untitled RFI",
      question: rfi.question || ""
    };
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/v1/rfis/', {
        method: 'POST',
        body: JSON.stringify(newRFI)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("RFI submit failed", e);
    }
  };

  const respondRFI = async (rfiId: number, responseText: string) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/rfis/${rfiId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ response: responseText })
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("RFI answer failed", e);
    }
  };

  const addQualityIssue = async (issue: Partial<QualityIssue>) => {
    if (!activeProject) return;
    const newIssue = {
      project_id: activeProject.id,
      title: issue.title || "Untitled Defect",
      description: issue.description || "",
      severity: issue.severity || 'Medium',
      assigned_to: issue.assigned_to || "Alex Mercer",
      status: 'Open'
    };
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/v1/quality/', {
        method: 'POST',
        body: JSON.stringify(newIssue)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("NCR submit failed", e);
    }
  };

  const resolveQualityIssue = async (issueId: number, status: 'Open' | 'UnderReview' | 'Resolved') => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/quality/${issueId}/resolve?status=${status}`, {
        method: 'PUT'
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("NCR update failed", e);
    }
  };

  const addPurchaseOrder = async (po: Partial<PurchaseOrder>) => {
    if (!activeProject) return;
    const newPO = {
      project_id: activeProject.id,
      po_number: po.po_number || `PO-2026-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      item_name: po.item_name || "",
      quantity: po.quantity || 1,
      cost: po.cost || 0,
      supplier_name: po.supplier_name || "",
      supplier_risk: po.supplier_risk || 'Low',
      status: 'Pending',
      tracking_status: 'In Production',
      delivery_date: po.delivery_date ? new Date(po.delivery_date).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString()
    };
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/v1/procurement/', {
        method: 'POST',
        body: JSON.stringify(newPO)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("PO create failed", e);
    }
  };

  const updatePurchaseOrderStatus = async (poId: number, status: string, tracking: string) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/procurement/${poId}/update-status?status=${status}&tracking_status=${encodeURIComponent(tracking)}`, {
        method: 'PUT'
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("PO tracking update failed", e);
    }
  };

  const signCommissioning = async (itemId: number, tester: string, signature: string) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/commissioning/${itemId}/sign`, {
        method: 'PUT',
        body: JSON.stringify({ tester_name: tester, signature_data: signature })
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("Commission signoff failed", e);
    }
  };

  const uploadDocument = async (file: File, docType: string): Promise<boolean> => {
    if (!activeProject) return false;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", activeProject.id.toString());
    formData.append("doc_type", docType);
    formData.append("uploaded_by", user?.full_name || "Engineer");

    try {
      const res = await authFetch('http://127.0.0.1:8000/api/v1/documents/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (e) {
      console.error("Upload document failed", e);
    }
    return false;
  };

  const approveDocument = async (docId: number, status: 'Approved' | 'Rejected' | 'Pending') => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/documents/${docId}/approve?status=${status}`, {
        method: 'PUT'
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("Approve document failed", e);
    }
  };

  const fetchDocumentSummary = async (docId: number): Promise<string> => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/documents/${docId}/summary`);
      if (res.ok) {
        const data = await res.json();
        return data.summary;
      }
    } catch (e) {
      console.error("Get document summary failed", e);
    }
    return "Failed to load summary. Is the backend offline?";
  };

  const markNotificationRead = async (notifId: number) => {
    if (!activeProject) return;
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/projects/${activeProject.id}/notifications/${notifId}/read`, {
        method: 'PUT'
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error("Read notification failed", e);
    }
  };

  // Admin User Management
  const fetchUsers = async () => {
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/v1/auth/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error("Fetch users failed", e);
    }
  };

  const updateUserRole = async (userId: number, role: string, is_active: boolean) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/auth/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role, is_active })
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error("Update user role failed", e);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/v1/auth/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error("Delete user failed", e);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects, activeProject, setActiveProject, rfis, qualityIssues, purchaseOrders, commissioningItems,
      documents, notifications, kpis, chartData, loading, refreshData, createProject, editProject, deleteProject,
      addRFI, respondRFI, addQualityIssue, resolveQualityIssue, addPurchaseOrder, updatePurchaseOrderStatus,
      signCommissioning, uploadDocument, approveDocument, fetchDocumentSummary, markNotificationRead,
      users, fetchUsers, updateUserRole, deleteUser
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

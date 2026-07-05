"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useProjects, Project, RFI, QualityIssue, PurchaseOrder, DocumentMetadata } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  Layers, Shield, Clock, Cpu, Activity, FileText, Play, CheckCircle2, AlertTriangle, 
  Loader2, Plus, Edit2, Trash2, Upload, Check, X, FileSpreadsheet, Download, Info, ShieldAlert, UserCheck
} from 'lucide-react';
import Modal from '../../components/Modal';
import KPICard from '../../components/KPICard';
import ChartCard from '../../components/ChartCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    projects, activeProject, setActiveProject, rfis, qualityIssues, purchaseOrders, commissioningItems,
    documents, notifications, kpis, chartData, loading, refreshData, createProject, editProject, deleteProject,
    addRFI, respondRFI, addQualityIssue, resolveQualityIssue, addPurchaseOrder, updatePurchaseOrderStatus,
    uploadDocument, approveDocument, fetchDocumentSummary, markNotificationRead,
    users, updateUserRole, deleteUser
  } = useProjects();

  const [activeTab, setActiveTab] = useState('overview'); // overview, documents, rfi-ncr, procurement, admin
  
  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit'>('create');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState({ filename: '', text: '', loading: false });
  
  // Forms state
  const [projectForm, setProjectForm] = useState({ name: '', location: '', capacity_mw: 100, budget_million: 150, status: 'Active' as any });
  const [rfiForm, setRfiForm] = useState({ title: '', question: '' });
  const [rfiAnswer, setRfiAnswer] = useState<{ [id: number]: string }>({});
  const [ncrForm, setNcrForm] = useState({ title: '', description: '', severity: 'Medium' as any, assigned_to: 'Alex Mercer' });
  const [poForm, setPoForm] = useState({ po_number: '', item_name: '', quantity: 1, cost: 100000, supplier_name: '', supplier_risk: 'Low' as any });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState('Specification');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Polling project data silently every 5 seconds for real-time shipment & commissioning updates
    const interval = setInterval(() => {
      refreshData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Auto-sync search queries
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreateProject = () => {
    setProjectModalMode('create');
    setProjectForm({ name: '', location: '', capacity_mw: 120, budget_million: 180, status: 'Active' });
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = () => {
    if (!activeProject) return;
    setProjectModalMode('edit');
    setProjectForm({
      name: activeProject.name,
      location: activeProject.location,
      capacity_mw: activeProject.capacity_mw,
      budget_million: activeProject.budget_million,
      status: activeProject.status
    });
    setProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectModalMode === 'create') {
      await createProject(projectForm);
    } else if (projectModalMode === 'edit' && activeProject) {
      await editProject(activeProject.id, projectForm);
    }
    setProjectModalOpen(false);
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    if (confirm(`Are you sure you want to delete project: "${activeProject.name}"? This action cannot be undone.`)) {
      await deleteProject(activeProject.id);
    }
  };

  const handleRfiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRFI(rfiForm);
    setRfiForm({ title: '', question: '' });
  };

  const handleRfiRespondSubmit = async (rfiId: number) => {
    const text = rfiAnswer[rfiId];
    if (!text) return;
    await respondRFI(rfiId, text);
    setRfiAnswer(prev => ({ ...prev, [rfiId]: '' }));
  };

  const handleNcrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addQualityIssue(ncrForm);
    setNcrForm({ title: '', description: '', severity: 'Medium', assigned_to: 'Alex Mercer' });
  };

  const handlePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPurchaseOrder(poForm);
    setPoForm({ po_number: '', item_name: '', quantity: 1, cost: 100000, supplier_name: '', supplier_risk: 'Low' });
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload");
      return;
    }
    // Validation
    const validExtensions = ['.pdf', '.docx', '.xlsx', '.xls', '.csv'];
    const filename = uploadFile.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => filename.endsWith(ext));
    if (!isValidExtension) {
      setUploadError("Invalid file type. Supported: PDF, DOCX, Excel, CSV");
      return;
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit");
      return;
    }

    setUploadError('');
    setIsUploading(true);
    const success = await uploadDocument(uploadFile, uploadDocType);
    setIsUploading(false);
    if (success) {
      setUploadFile(null);
      // Reset input element
      const fileInput = document.getElementById('dashboard-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
      setUploadError("Upload failed. Verify server connection.");
    }
  };

  const handleViewSummary = async (doc: DocumentMetadata) => {
    setSelectedSummary({ filename: doc.filename, text: '', loading: true });
    setSummaryModalOpen(true);
    const summaryText = await fetchDocumentSummary(doc.id);
    setSelectedSummary({ filename: doc.filename, text: summaryText, loading: false });
  };

  const handleExportData = (reportType: string, fileFormat: string) => {
    window.open(`http://127.0.0.1:8000/api/v1/reports/export?report_type=${reportType}&file_format=${fileFormat}`, '_blank');
  };

  if (loading || !kpis) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-purple-100/50 rounded-lg w-1/3" />
        <div className="h-4 bg-purple-50/50 rounded-lg w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-purple-50/20 rounded-2xl border border-purple-100/10" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-purple-50/20 rounded-2xl border border-purple-100/10" />
          <div className="h-80 bg-purple-50/20 rounded-2xl border border-purple-100/10" />
        </div>
      </div>
    );
  }

  const activeProjectBudgetStr = activeProject 
    ? `$${activeProject.budget_used.toFixed(1)}M / $${activeProject.budget_million.toFixed(1)}M`
    : '-';

  return (
    <div className="space-y-6 text-purple-950">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-purple-900">
              {activeProject ? activeProject.name : "Select Project"}
            </h2>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs font-bold">
            Health Index: {activeProject ? activeProject.ai_health_score : kpis.aiHealthScore}%
          </span>
          
          {user?.role && (
            <span className="px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-teal-650" /> {user.role} Profile
            </span>
          )}

          {/* Edit / Delete actions for authorized roles */}
          {activeProject && (user?.role === 'Admin' || user?.role === 'Project Manager') && (
            <button 
              onClick={handleOpenEditProject}
              className="p-2 text-purple-700 hover:text-purple-900 bg-purple-50 border border-purple-200 hover:border-purple-300 rounded-lg cursor-pointer transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {activeProject && user?.role === 'Admin' && (
            <button 
              onClick={handleDeleteProject}
              className="p-2 text-red-650 hover:text-red-800 bg-red-50 border border-red-200 hover:border-red-300 rounded-lg cursor-pointer transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Create Project Button */}
          {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
            <button
              onClick={handleOpenCreateProject}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-purple-200 overflow-x-auto gap-2 scrollbar-none">
        {[
          { id: 'overview', name: 'Overview', icon: Layers },
          { id: 'documents', name: 'Document Ingestion', icon: Upload },
          { id: 'rfi-ncr', name: 'RFIs & Defects', icon: ShieldAlert },
          { id: 'procurement', name: 'Procurement POs', icon: Cpu },
          ...(user?.role === 'Admin' ? [{ id: 'admin', name: 'Admin Panel', icon: UserCheck }] : [])
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-5 font-bold text-sm border-b-2 cursor-pointer transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                isSelected 
                  ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl' 
                  : 'border-transparent text-purple-900/60 hover:text-purple-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab content */}
      <div className="space-y-6">

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <KPICard 
                title="Total Projects" 
                value={kpis.totalProjects} 
                icon={Layers} 
                colorClass="text-purple-700 bg-purple-100" 
              />
              <KPICard 
                title="Active Projects" 
                value={kpis.activeProjects} 
                icon={CheckCircle2} 
                colorClass="text-green-700 bg-green-100" 
              />
              <KPICard 
                title="Budget Consumed" 
                value={activeProjectBudgetStr} 
                icon={Activity} 
                colorClass="text-cyan-700 bg-cyan-100" 
                subtitle={`${activeProject ? activeProject.name : 'Project'} expended status`}
              />
              <KPICard 
                title="Open RFIs" 
                value={kpis.openRFIs} 
                icon={FileText} 
                colorClass="text-amber-700 bg-amber-100" 
              />
              <KPICard 
                title="Alert Risks" 
                value={kpis.supplierRiskCount} 
                icon={AlertTriangle} 
                colorClass="text-rose-700 bg-rose-100" 
              />
            </div>

            {/* Charts */}
            {chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Cost Burn Rate" subtitle="Budget Projection vs Cumulative Expended Cost ($M)">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" vertical={false} />
                        <XAxis dataKey="name" stroke="#7e22ce" fontSize={12} />
                        <YAxis stroke="#7e22ce" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e9d5ff', borderRadius: '12px' }} />
                        <Area type="monotone" name="Budget Limit" dataKey="Budget" stroke="#c084fc" fill="rgba(192,132,252,0.06)" strokeWidth={2} />
                        <Area type="monotone" name="Actual Cost" dataKey="Spent" stroke="#7c3aed" fill="rgba(124,58,237,0.12)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="NCR Defect Matrix" subtitle="Volume of quality issues by severity level">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.riskHeatmap} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" horizontal={false} />
                        <XAxis type="number" stroke="#7e22ce" />
                        <YAxis dataKey="category" type="category" stroke="#7e22ce" width={100} fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e9d5ff', borderRadius: '12px' }} />
                        <Bar dataKey="Low" name="Low Severity" stackId="a" fill="#10b981" />
                        <Bar dataKey="Medium" name="Medium Severity" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="High" name="High Severity" stackId="a" fill="#f43f5e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Project Profile" subtitle="Active project specification & status">
                  <div className="h-72 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Project Name</span>
                        <span className="text-sm font-bold text-purple-950">{activeProject ? activeProject.name : 'Select a project'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Location</span>
                          <span className="text-sm font-semibold text-purple-900">{activeProject ? activeProject.location : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Capacity</span>
                          <span className="text-sm font-semibold text-purple-900">{activeProject ? `${activeProject.capacity_mw || activeProject.capacityMw} MW` : 'N/A'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Status</span>
                        {activeProject && (
                          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            activeProject.status === 'Active' || activeProject.status === 'Completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {activeProject.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-800">AI Health Index</span>
                      <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
                        {activeProject ? activeProject.ai_health_score : 'N/A'}%
                      </span>
                    </div>
                  </div>
                </ChartCard>
              </div>
            )}

            {/* Reports Export Section */}
            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-purple-900 uppercase tracking-wide">EPC Report Center</h3>
                <span className="text-[10px] text-purple-500 font-mono">EXPORT LEDGERS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { type: 'projects', label: 'Projects Audit Ledger' },
                  { type: 'quality', label: 'Quality Issues (NCR)' },
                  { type: 'procurement', label: 'Purchase Ledger & Shipping' },
                  { type: 'commissioning', label: 'Commissioning Records' }
                ].map((item) => (
                  <div key={item.type} className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex flex-col justify-between h-32">
                    <span className="text-xs font-bold text-purple-900 leading-normal">{item.label}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportData(item.type, 'pdf')}
                        className="flex-1 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                      <button
                        onClick={() => handleExportData(item.type, 'xlsx')}
                        className="flex-1 py-1.5 bg-green-700 hover:bg-green-800 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Excel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Document Ingestion */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Upload Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-1.5">
                  <Upload className="w-5 h-5 text-purple-700" /> Ingest Documents
                </h3>
                <p className="text-xs text-purple-650 leading-relaxed mb-6">
                  Upload project specifications, drawing files, or spreadsheets. Extracted OCR text will feed the semantic RAG chatbot.
                </p>

                <form onSubmit={handleFileUploadSubmit} className="space-y-4">
                  {uploadError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-lg font-medium">
                      {uploadError}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-2">Select file *</label>
                    <input
                      id="dashboard-file-upload"
                      type="file"
                      required
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-purple-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-2">Document Type</label>
                    <select
                      value={uploadDocType}
                      onChange={(e) => setUploadDocType(e.target.value)}
                      className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600"
                    >
                      <option value="Specification">Technical Specification</option>
                      <option value="Drawing">Engineering Drawing</option>
                      <option value="RFI">RFI Documentation</option>
                      <option value="VendorSubmittal">Vendor Submittal</option>
                      <option value="Contract">Project Contract</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/10"
                  >
                    {isUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting & Extracting OCR...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload Document</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Uploaded List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-purple-800">Uploaded Document Ledger</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-purple-100 text-purple-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5">File Name</th>
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5">Ver</th>
                      <th className="py-2.5">Uploaded By</th>
                      <th className="py-2.5">Approval</th>
                      <th className="py-2.5">Ingestion</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <tr key={doc.id} className="border-b border-purple-50/50 hover:bg-purple-50/30 transition-colors">
                          <td className="py-3 font-semibold text-purple-900 max-w-[200px] truncate" title={doc.filename}>{doc.filename}</td>
                          <td className="py-3 text-purple-650">{doc.doc_type}</td>
                          <td className="py-3 text-purple-500">v{doc.version}</td>
                          <td className="py-3 text-purple-650">{doc.uploaded_by}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              doc.approved_status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                              doc.approved_status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                              {doc.approved_status}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                              doc.status === 'complete' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              doc.status === 'processing' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {doc.status || 'pending'}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleViewSummary(doc)}
                              className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-semibold text-[10px] transition cursor-pointer"
                            >
                              Summary
                            </button>
                            
                            {/* Role based approvals */}
                            {(user?.role === 'Admin' || user?.role === 'Project Manager') && doc.approved_status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => approveDocument(doc.id, 'Approved')}
                                  className="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition cursor-pointer"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => approveDocument(doc.id, 'Rejected')}
                                  className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition cursor-pointer"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-purple-400">
                          No documents uploaded for this project yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: RFIs & Defects */}
        {activeTab === 'rfi-ncr' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: RFI Board */}
            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-purple-100 pb-3">
                <h3 className="font-bold text-md text-purple-900">RFI Board (Request for Information)</h3>
                <span className="text-[10px] text-purple-500 font-mono">PERSISTED DB CLARIFICATIONS</span>
              </div>

              {/* Submit RFI (Engineer/Contractor/PM) */}
              {(user?.role !== 'Client') && (
                <form onSubmit={handleRfiSubmit} className="p-4 bg-purple-50 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">Submit Technical Clarification (RFI)</span>
                  <input
                    type="text"
                    required
                    placeholder="RFI Title (e.g. UPS Busway substitution)"
                    value={rfiForm.title}
                    onChange={e => setRfiForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                  />
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter details of engineering query..."
                    value={rfiForm.question}
                    onChange={e => setRfiForm(p => ({ ...p, question: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 resize-none text-purple-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-xl transition cursor-pointer"
                  >
                    File Engineering RFI
                  </button>
                </form>
              )}

              {/* RFIs List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {rfis.length > 0 ? (
                  rfis.map((rfi) => (
                    <div key={rfi.id} className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-purple-900">{rfi.title}</h4>
                          <span className="text-[9px] text-purple-500">Asked by: {rfi.asked_by} · {rfi.created_at ? new Date(rfi.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          rfi.status === 'Closed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {rfi.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-purple-850 leading-relaxed bg-white/40 p-2.5 rounded-lg border border-purple-100/50">
                        {rfi.question}
                      </p>

                      {/* Respond field for PM / Admin / Engineer */}
                      {rfi.status === 'Open' && (user?.role === 'Admin' || user?.role === 'Project Manager' || user?.role === 'Engineer') ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type resolution answer..."
                            value={rfiAnswer[rfi.id] || ''}
                            onChange={e => setRfiAnswer(prev => ({ ...prev, [rfi.id]: e.target.value }))}
                            className="flex-1 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                          />
                          <button
                            onClick={() => handleRfiRespondSubmit(rfi.id)}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Answer
                          </button>
                        </div>
                      ) : rfi.response ? (
                        <p className="text-xs text-purple-700 font-medium pl-3 border-l-2 border-green-500">
                          <span className="font-bold text-purple-900">Answer ({rfi.answered_by}):</span> {rfi.response}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-purple-400 text-center py-6">No RFIs submitted for this project.</p>
                )}
              </div>
            </div>

            {/* Right: Quality Issues / Defects (NCR) */}
            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-purple-100 pb-3">
                <h3 className="font-bold text-md text-purple-900">Quality NCR Log (Non-Conformance)</h3>
                <span className="text-[10px] text-purple-500 font-mono">QUALITY DEFECT CONTROL</span>
              </div>

              {/* Report NCR (Engineer/PM/Admin) */}
              {(user?.role === 'Admin' || user?.role === 'Project Manager' || user?.role === 'Engineer') && (
                <form onSubmit={handleNcrSubmit} className="p-4 bg-purple-50 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">Log Quality Violation (NCR)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Title (e.g. Micro-cracks pad 3)"
                      value={ncrForm.title}
                      onChange={e => setNcrForm(p => ({ ...p, title: e.target.value }))}
                      className="px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                    />
                    <select
                      value={ncrForm.severity}
                      onChange={e => setNcrForm(p => ({ ...p, severity: e.target.value }))}
                      className="px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900 cursor-pointer"
                    >
                      <option value="Low">Low Severity</option>
                      <option value="Medium">Medium Severity</option>
                      <option value="High">High Severity</option>
                      <option value="Critical">Critical Path Severity</option>
                    </select>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide inspection observations and details..."
                    value={ncrForm.description}
                    onChange={e => setNcrForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 resize-none text-purple-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-xl transition cursor-pointer"
                  >
                    Submit Defect Report
                  </button>
                </form>
              )}

              {/* NCR List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {qualityIssues.length > 0 ? (
                  qualityIssues.map((issue) => (
                    <div key={issue.id} className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-purple-900">{issue.title}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              issue.severity === 'Critical' ? 'bg-red-500 text-white' :
                              issue.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                              issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {issue.severity}
                            </span>
                          </div>
                          <span className="text-[9px] text-purple-500">Reported by: {issue.reported_by} · Assigned: {issue.assigned_to}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            issue.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                            issue.status === 'UnderReview' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-purple-850 bg-white/40 p-2.5 rounded-lg border border-purple-100/50">
                        {issue.description}
                      </p>

                      {/* Actions for Engineer/PM/Admin */}
                      {issue.status !== 'Resolved' && (user?.role === 'Admin' || user?.role === 'Project Manager' || user?.role === 'Engineer') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => resolveQualityIssue(issue.id, 'Resolved')}
                            className="px-2.5 py-1 bg-green-700 hover:bg-green-800 text-white font-bold text-[9px] rounded cursor-pointer"
                          >
                            Resolve NCR
                          </button>
                          {issue.status === 'Open' && (
                            <button
                              onClick={() => resolveQualityIssue(issue.id, 'UnderReview')}
                              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-850 text-white font-bold text-[9px] rounded cursor-pointer"
                            >
                              Mark Under Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-purple-400 text-center py-6">No Quality NCR issues reported.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Procurement & POs */}
        {activeTab === 'procurement' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left PO Create */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-purple-700" /> New Purchase Order
              </h3>
              <p className="text-xs text-purple-650 leading-relaxed mb-4">
                Record new long-lead equipment procurement. Registered items automatically feed logistics dashboards.
              </p>

              {/* Submit PO (PM/Admin) */}
              {(user?.role === 'Admin' || user?.role === 'Project Manager') ? (
                <form onSubmit={handlePoSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="PO Number (e.g. PO-2026-04)"
                      value={poForm.po_number}
                      onChange={e => setPoForm(p => ({ ...p, po_number: e.target.value }))}
                      className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                    />
                    <select
                      value={poForm.supplier_risk}
                      onChange={e => setPoForm(p => ({ ...p, supplier_risk: e.target.value }))}
                      className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900 cursor-pointer"
                    >
                      <option value="Low">Low Risk Supplier</option>
                      <option value="Medium">Medium Risk Supplier</option>
                      <option value="High">High Risk Supplier</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Equipment Item Name (e.g. York Chiller)"
                    value={poForm.item_name}
                    onChange={e => setPoForm(p => ({ ...p, item_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      placeholder="Qty"
                      value={poForm.quantity}
                      onChange={e => setPoForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Total Cost ($)"
                      value={poForm.cost}
                      onChange={e => setPoForm(p => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Supplier Name (e.g. Boreas Systems)"
                    value={poForm.supplier_name}
                    onChange={e => setPoForm(p => ({ ...p, supplier_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-900"
                  />

                  <button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all"
                  >
                    Register Purchase Order
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-250 text-amber-700 text-xs rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Purchasing registers are locked. Project Manager credentials required to generate equipment line items.</span>
                </div>
              )}
            </div>

            {/* Right PO Ledger */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-purple-800">Equipment Procurement & Logistical Status</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-purple-100 text-purple-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5">PO Number</th>
                      <th className="py-2.5">Equipment Description</th>
                      <th className="py-2.5">Qty</th>
                      <th className="py-2.5">Cost</th>
                      <th className="py-2.5">Supplier</th>
                      <th className="py-2.5">Supplier Risk</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.length > 0 ? (
                      purchaseOrders.map((po) => (
                        <tr key={po.id} className="border-b border-purple-50/50 hover:bg-purple-50/30 transition-colors">
                          <td className="py-3 font-semibold text-purple-900">{po.po_number}</td>
                          <td className="py-3 text-purple-800 font-medium">{po.item_name}</td>
                          <td className="py-3 text-purple-500">{po.quantity}</td>
                          <td className="py-3 text-purple-650">${(po.cost / 1000).toFixed(0)}k</td>
                          <td className="py-3 text-purple-650">{po.supplier_name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              po.supplier_risk === 'High' ? 'bg-red-100 text-red-700' :
                              po.supplier_risk === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {po.supplier_risk}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="space-y-0.5">
                              <span className="font-bold text-purple-900 block">{po.status}</span>
                              <span className="text-[9px] text-purple-500">{po.tracking_status}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            {/* Actions for Admin / PM */}
                            {(user?.role === 'Admin' || user?.role === 'Project Manager') ? (
                              <select
                                value={po.status}
                                onChange={(e) => {
                                  const statusVal = e.target.value;
                                  let trackVal = po.tracking_status;
                                  if (statusVal === 'Shipped') trackVal = 'In Transit';
                                  else if (statusVal === 'Delivered') trackVal = 'Delivered to Site';
                                  updatePurchaseOrderStatus(po.id, statusVal, trackVal);
                                }}
                                className="px-1.5 py-1 bg-purple-50 border border-purple-200 rounded text-[10px] text-purple-900 focus:outline-none cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            ) : (
                              <span className="text-[10px] text-purple-400">Locked</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-purple-400">
                          No procurement purchase orders for this project.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Admin Panel */}
        {activeTab === 'admin' && user?.role === 'Admin' && (
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-purple-100 pb-3">
              <h3 className="font-bold text-lg text-purple-900">User Access Management Controls</h3>
              <span className="text-xs text-red-650 font-bold uppercase tracking-wider">Root Admin console</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-purple-100 text-purple-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5">User Email</th>
                    <th className="py-2.5">Full Name</th>
                    <th className="py-2.5">Role Profile</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Created At</th>
                    <th className="py-2.5 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-purple-50/50 hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 text-purple-950 font-semibold">{u.email}</td>
                        <td className="py-3 text-purple-800 font-medium">{u.full_name || 'N/A'}</td>
                        <td className="py-3">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value, u.is_active)}
                            className="px-2 py-1 bg-purple-50 border border-purple-200 rounded text-xs text-purple-950 focus:outline-none cursor-pointer"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Engineer">Engineer</option>
                            <option value="Contractor">Contractor</option>
                            <option value="Client">Client</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => updateUserRole(u.id, u.role, !u.is_active)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              u.is_active 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-red-100 text-red-700 border-red-200'
                            }`}
                          >
                            {u.is_active ? 'Active' : 'Banned'}
                          </button>
                        </td>
                        <td className="py-3 text-purple-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown Date'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Revoke all workspace access credentials for ${u.email}?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1 text-red-650 hover:bg-red-50 hover:text-red-800 rounded transition cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-purple-400">
                        No registered workspace user profiles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Project Create / Edit Modal */}
      <Modal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} title={projectModalMode === 'create' ? 'Create New Project' : 'Edit Project Details'}>
        <form onSubmit={handleProjectSubmit} className="space-y-4 p-2 text-purple-900">
          <div>
            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1.5">Project Name</label>
            <input
              type="text"
              required
              value={projectForm.name}
              onChange={e => setProjectForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Dublin DC-3 Hyperscale"
              className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-xl text-xs text-purple-950 focus:outline-none focus:border-purple-600"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1.5">Location</label>
            <input
              type="text"
              required
              value={projectForm.location}
              onChange={e => setProjectForm(p => ({ ...p, location: e.target.value }))}
              placeholder="Dublin, Ireland"
              className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-xl text-xs text-purple-950 focus:outline-none focus:border-purple-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1.5">Capacity (MW)</label>
              <input
                type="number"
                required
                value={projectForm.capacity_mw}
                onChange={e => setProjectForm(p => ({ ...p, capacity_mw: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-xl text-xs text-purple-950 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1.5">Budget ($M)</label>
              <input
                type="number"
                required
                value={projectForm.budget_million}
                onChange={e => setProjectForm(p => ({ ...p, budget_million: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-xl text-xs text-purple-950 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1.5">Project Status</label>
            <select
              value={projectForm.status}
              onChange={e => setProjectForm(p => ({ ...p, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-xl text-xs text-purple-950 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Delayed">Delayed</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all mt-4"
          >
            {projectModalMode === 'create' ? 'Create Project' : 'Save Modifications'}
          </button>
        </form>
      </Modal>

      {/* Summary View Modal */}
      <Modal isOpen={summaryModalOpen} onClose={() => setSummaryModalOpen(false)} title="AI Document Summary Details">
        <div className="p-2 space-y-4 text-purple-900">
          <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2">Analyzing: {selectedSummary.filename}</h4>
          {selectedSummary.loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-purple-700">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs">Generating AI Summary report...</span>
            </div>
          ) : (
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-xs leading-relaxed max-h-[350px] overflow-y-auto whitespace-pre-wrap pr-1 custom-scrollbar text-purple-950 font-medium">
              {selectedSummary.text}
            </div>
          )}
          <button
            onClick={() => setSummaryModalOpen(false)}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md"
          >
            Close summary ledger
          </button>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, Upload, Search, CheckCircle2, XCircle, Clock, 
  Eye, FileUp, Folder, File, ChevronRight, Loader2, Sparkles 
} from 'lucide-react';
import Modal from '../../components/Modal';
import { TableSkeleton } from '../../components/LoadingSkeleton';

interface Document {
  id: number;
  filename: string;
  doc_type: string;
  approved_status: 'Approved' | 'Rejected' | 'Pending';
  version: number;
  uploaded_by: string;
  uploaded_at: string;
  ocr_text?: string;
}

export default function DocumentManagementPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticResult, setSemanticResult] = useState<any>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/documents/');
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (e) {
      // Local fallback
      setDocuments([
        { id: 1, filename: "General_Specifications_Electrical_Subsystems.pdf", doc_type: "Specification", approved_status: "Approved", version: 1, uploaded_by: "Sarah Connor", uploaded_at: "2026-07-01T10:00:00Z", ocr_text: "SECTION 26 32 13 - ENGINE GENERATORS. Provide complete standby engine generator sets. Comply with EPA Tier 4 emission standards. Fuel tanks must feature double-wall steel construction providing 110% containment." },
        { id: 2, filename: "RFI-104_Response_Fuel_System_Redesign.pdf", doc_type: "RFI", approved_status: "Approved", version: 1, uploaded_by: "David Vance", uploaded_at: "2026-07-02T14:30:00Z", ocr_text: "RFI-104 response: Dual-walled steel belly tanks with leak detection satisfy the secondary containment requirements of Section 4.2.1." },
        { id: 3, filename: "Drawing_DC-ME-302_Mechanical_Piping_Details.dwg", doc_type: "Drawing", approved_status: "Pending", version: 2, uploaded_by: "Marcus Aurelius", uploaded_at: "2026-07-03T09:15:00Z", ocr_text: "SHEET NO: DC-ME-302. MECHANICAL PIPING DETAILS. N+2 piping loops meet the Tier III design topology." }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSemanticLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/documents/search/semantic?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        setSemanticResult(await res.json());
      }
    } catch (e) {
      setSemanticResult({
        answer: "Based on local references: Double-walled belly tanks satisfy section 4.2.1 specifications.",
        sources: ["RFI-104_Response_Fuel_System_Redesign.pdf"]
      });
    }
    setSemanticLoading(false);
  };

  const handleApprove = async (docId: number, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/documents/${docId}/approve?status=${status}`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchDocs();
      }
    } catch (e) {
      // Local fallback update
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, approved_status: status } : d));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', '1');
    formData.append('doc_type', 'Specification');
    formData.append('uploaded_by', user?.full_name || 'Inspector');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/documents/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchDocs();
      }
    } catch (e) {
      // Simulate local upload additions
      setTimeout(() => {
        const newDoc: Document = {
          id: documents.length + 1,
          filename: file.name,
          doc_type: 'Specification',
          approved_status: 'Pending',
          version: 1,
          uploaded_by: user?.full_name || 'Inspector',
          uploaded_at: new Date().toISOString(),
          ocr_text: "Successfully parsed document via simulated OCR loop."
        };
        setDocuments(prev => [newDoc, ...prev]);
        setUploadLoading(false);
      }, 1000);
      return;
    }
    setUploadLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Document Intelligence Ledger</h2>
          <p className="text-sm text-secondary">Host drawings, check specifications, and parse files via OCR compliance</p>
        </div>
      </div>

      {/* Semantic Search Panel */}
      <div className="glass p-6 rounded-2xl border border-border">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" /> RAG Semantic Search
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query design parameters across all project contracts and drawings..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
            />
          </div>
          <button 
            type="submit" 
            disabled={semanticLoading}
            className="bg-primary hover:bg-primary-hover px-5 rounded-xl font-bold text-white text-sm transition-all"
          >
            {semanticLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Query"}
          </button>
        </form>

        {semanticResult && (
          <div className="mt-4 p-4 bg-slate-950 border border-border/80 rounded-xl space-y-2 text-xs">
            <p className="font-bold text-slate-200">AI Context Response:</p>
            <p className="text-slate-400 leading-relaxed">{semanticResult.answer}</p>
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
              <span className="text-[10px] text-secondary font-bold mr-2 uppercase">Sources Cited:</span>
              {semanticResult.sources?.map((s: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload area & file structure grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag and Drop Uploader */}
        <div className="glass p-6 rounded-2xl border border-border flex flex-col justify-center items-center text-center relative hover:border-primary/50 transition-colors group">
          <input 
            type="file" 
            onChange={handleFileUpload} 
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploadLoading}
          />
          {uploadLoading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm font-bold">Uploading & Running OCR...</p>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Upload Construction Documents</p>
                <p className="text-xs text-secondary mt-1 max-w-[200px] mx-auto leading-relaxed">Accepts PDF, DOCX, Excel, CAD drawings, specifications, contracts.</p>
              </div>
            </div>
          )}
        </div>

        {/* Directory/File List */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm">Drawings & Technical Specifications List</h3>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">Active Ledger</span>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-secondary font-medium">
                    <th className="pb-3">Filename</th>
                    <th className="pb-3">Doc Type</th>
                    <th className="pb-3">Version</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate max-w-[180px]">{doc.filename}</span>
                      </td>
                      <td className="py-3">{doc.doc_type}</td>
                      <td className="py-3 font-bold">v{doc.version}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                          doc.approved_status === 'Approved' ? 'bg-green-500/10 text-green-500' : doc.approved_status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {doc.approved_status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1 hover:bg-white/5 rounded text-secondary hover:text-foreground"
                          title="View OCR"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {doc.approved_status === 'Pending' && (user?.role === 'Admin' || user?.role === 'Project Manager') && (
                          <>
                            <button 
                              onClick={() => handleApprove(doc.id, 'Approved')}
                              className="p-1 hover:bg-green-500/10 rounded text-green-500"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleApprove(doc.id, 'Rejected')}
                              className="p-1 hover:bg-red-500/10 rounded text-red-500"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* OCR Preview Modal */}
      {selectedDoc && (
        <Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title={`OCR Parser Ledger: ${selectedDoc.filename}`}>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-3 border border-border rounded-xl">
              <div>
                <p className="font-bold text-slate-200">Metadata:</p>
                <p className="text-slate-400 mt-1">Uploaded by: {selectedDoc.uploaded_by}</p>
                <p className="text-slate-400">Date: {new Date(selectedDoc.uploaded_at).toLocaleString()}</p>
              </div>
              <span className="font-bold text-primary">Version {selectedDoc.version}</span>
            </div>

            <div>
              <p className="font-bold text-slate-200 mb-2">Extracted OCR Layout Text:</p>
              <div className="bg-slate-950 p-4 border border-border rounded-xl text-slate-400 font-mono h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {selectedDoc.ocr_text || "Processing OCR text vectors..."}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

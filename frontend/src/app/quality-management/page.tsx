"use client";

import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import Modal from '../../components/Modal';
import { ShieldCheck, Plus, CheckCircle, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

export default function QualityManagementPage() {
  const { qualityIssues, addQualityIssue, refreshData } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [assignee, setAssignee] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;
    
    await addQualityIssue({
      title,
      description: desc,
      severity,
      assigned_to: assignee || "Alex Mercer"
    });

    setTitle('');
    setDesc('');
    setSeverity('Medium');
    setAssignee('');
    setIsModalOpen(false);
  };

  const handleResolve = async (issueId: number) => {
    setResolvingId(issueId);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/quality/${issueId}/resolve?status=Resolved`, {
        method: 'PUT'
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      // Local mock fallback update
      // Handled inside ProjectContext fallback if implemented
    }
    setResolvingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quality Assurance & NCR Ledger</h2>
          <p className="text-sm text-secondary">Manage site inspections, Non-Conformance Reports, and corrective plans</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover py-2 px-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Log NCR Discrepancy
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">
              {qualityIssues.filter(i => i.status === 'Open').length}
            </p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Active NCRs</p>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">
              {qualityIssues.filter(i => i.status === 'UnderReview').length}
            </p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Under Review</p>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">
              {qualityIssues.filter(i => i.status === 'Resolved').length}
            </p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Resolved Issues</p>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">94%</p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Compliance Index</p>
          </div>
        </div>
      </div>

      {/* Main NCR Table */}
      <div className="glass rounded-2xl p-6 border border-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-sm">Site NCR Ledger</h3>
          <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">Active Ledger</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-secondary font-medium">
                <th className="pb-3">NCR Defect ID</th>
                <th className="pb-3">Title / Description</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned To</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {qualityIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-primary">NCR-2026-{String(issue.id).padStart(3, '0')}</td>
                  <td className="py-3 max-w-xs">
                    <p className="font-bold text-foreground truncate">{issue.title}</p>
                    <p className="text-secondary text-[11px] truncate mt-0.5">{issue.description}</p>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                      issue.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : issue.severity === 'High' ? 'bg-orange-500/10 text-orange-500' : issue.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] ${
                      issue.status === 'Resolved' ? 'bg-green-500/10 text-green-500' : issue.status === 'UnderReview' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-slate-300">{issue.assigned_to}</td>
                  <td className="py-3 text-right">
                    {issue.status !== 'Resolved' ? (
                      <button
                        onClick={() => handleResolve(issue.id)}
                        disabled={resolvingId === issue.id}
                        className="px-2.5 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors text-[10px]"
                      >
                        {resolvingId === issue.id ? "Resolving..." : "Clear Issue"}
                      </button>
                    ) : (
                      <span className="text-[10px] text-green-400 font-bold flex items-center justify-end gap-1"><CheckCircle className="w-3.5 h-3.5" /> Audited</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Quality Non-Conformance Report">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">NCR Defect Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lithium-Ion UPS Ventilation Rating"
              className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detailed Discrepancy Description</label>
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Provide exact details, locations, references, and regulatory clauses violated..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Severity Rating</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Assigned Engineer</label>
              <input
                type="text"
                required
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary-hover font-bold rounded-xl text-white shadow-lg transition-all mt-4"
          >
            Create Quality Incident Record
          </button>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { useProjects, Project } from '../../context/ProjectContext';
import Modal from '../../components/Modal';
import { FolderPlus, MapPin, Cpu, Wallet, ShieldCheck, Filter, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const { projects, createProject, activeProject, setActiveProject, loading } = useProjects();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Delayed' | 'Completed' | 'Planned'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [budget, setBudget] = useState(150);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;
    
    await createProject({
      name,
      location,
      capacity_mw: capacity,
      budget_million: budget
    });

    // Reset Form
    setName('');
    setLocation('');
    setCapacity(100);
    setBudget(150);
    setIsModalOpen(false);
  };

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Portfolio Ledger</h2>
          <p className="text-sm text-secondary">Manage and track data centre facilities assets worldwide</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover py-2 px-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <FolderPlus className="w-5 h-5" /> Initialize New Project
        </button>
      </div>

      {/* Filter and Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-border/60">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-secondary mr-2" />
          {(['All', 'Active', 'Delayed', 'Completed', 'Planned'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                filter === opt 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'border-border bg-transparent text-secondary hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="text-xs text-secondary font-medium">
          Showing <span className="font-bold text-foreground">{filteredProjects.length}</span> of {projects.length} facilities
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p) => {
          const isSelected = activeProject?.id === p.id;
          const pct = p.budget_million > 0 ? ((p.budget_used / p.budget_million) * 100).toFixed(0) : '0';
          
          return (
            <div 
              key={p.id} 
              className={`glass rounded-2xl p-6 border transition-all duration-300 relative flex flex-col justify-between hover:shadow-lg ${
                isSelected ? 'border-primary shadow-[0_0_20px_rgba(2,132,199,0.15)] ring-1 ring-primary/30' : 'border-border hover:border-border/80'
              }`}
            >
              {/* Top Banner details */}
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : p.status === 'Delayed' ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-500'
                }`}>
                  {p.status}
                </span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">{p.ai_health_score}% AI Health</span>
                </div>
              </div>

              {/* Title & Location */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">{p.name}</h3>
                <p className="text-xs text-secondary flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {p.location}</p>
              </div>

              {/* Facility Details */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40 mb-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-secondary shrink-0" />
                  <div>
                    <p className="text-[10px] text-secondary font-medium">Capacity</p>
                    <p className="text-sm font-bold">{p.capacity_mw} MW</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4.5 h-4.5 text-secondary shrink-0" />
                  <div>
                    <p className="text-[10px] text-secondary font-medium">Spent / Budget</p>
                    <p className="text-sm font-bold">${p.budget_used}M / ${p.budget_million}M</p>
                  </div>
                </div>
              </div>

              {/* Cost Progress Indicator */}
              <div className="mb-6 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-secondary">Expended Budget Ratio</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${parseFloat(pct) > 90 ? 'bg-rose-500' : 'bg-primary'}`} 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setActiveProject(p)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-border hover:bg-border/80 text-foreground'
                }`}
              >
                {isSelected ? 'Active Workspace' : 'Set Active Workspace'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initialize Hyperscale Construction Track">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Project Track Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Frankfurt Edge DC-5"
              className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Facility Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Frankfurt, Germany"
              className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Power Capacity (MW)</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Target Budget ($M)</label>
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary-hover font-bold rounded-xl text-white shadow-lg transition-all mt-4"
          >
            Create Facility Log
          </button>
        </form>
      </Modal>
    </div>
  );
}

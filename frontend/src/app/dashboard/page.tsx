"use client";

import React from 'react';
import KPICard from '../../components/KPICard';
import ChartCard from '../../components/ChartCard';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import { 
  FolderKanban, CheckSquare, Clock, AlertTriangle, HelpCircle, 
  Wallet, ShieldCheck, TrendingUp, Calendar, ArrowRight, Activity 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const kpis = {
    totalProjects: 14,
    activeProjects: 8,
    aiHealthScore: 94.5,
    totalBudgetMillion: 120.0,
    budgetUsedMillion: 78.4,
    openRFIs: 4,
    supplierRiskCount: 2
  };

  const chartData = {
    monthlyTrend: [
      { name: 'Jan', Budget: 10, Spent: 8, RFIs: 2 },
      { name: 'Feb', Budget: 25, Spent: 20, RFIs: 4 },
      { name: 'Mar', Budget: 45, Spent: 38, RFIs: 7 },
      { name: 'Apr', Budget: 70, Spent: 62, RFIs: 12 },
      { name: 'May', Budget: 95, Spent: 78, RFIs: 5 }
    ],
    riskHeatmap: [
      { category: 'Structural', Low: 4, Medium: 2, High: 1, Critical: 0 },
      { category: 'Electrical', Low: 2, Medium: 3, High: 2, Critical: 1 },
      { category: 'Mechanical', Low: 5, Medium: 1, High: 0, Critical: 0 }
    ],
    projectProgress: [
      { id: 1, name: 'Dublin Hyperscale DC-1', progress: 85, health: 92, status: 'On Track' },
      { id: 2, name: 'Frankfurt Expansion', progress: 42, health: 78, status: 'Delayed' },
      { id: 3, name: 'London Modular Site', progress: 18, health: 95, status: 'On Track' }
    ]
  };

  const budgetStr = `$${(kpis.totalBudgetMillion).toFixed(1)}M`;
  const spentStr = `$${(kpis.budgetUsedMillion).toFixed(1)}M`;
  const budgetPercent = ((kpis.budgetUsedMillion / kpis.totalBudgetMillion) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Project Dashboard</h2>
          <p className="text-sm text-slate-400">Project Dublin Hyperscale DC-1 Status overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-500 font-bold block mb-1">Total Projects</span>
          <span className="text-2xl font-extrabold text-white">{kpis.totalProjects}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-500 font-bold block mb-1">AI Health Score</span>
          <span className="text-2xl font-extrabold text-emerald-400">{kpis.aiHealthScore}%</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-500 font-bold block mb-1">Budget Expended</span>
          <span className="text-2xl font-extrabold text-cyan-400">{spentStr}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-500 font-bold block mb-1">Open RFIs</span>
          <span className="text-2xl font-extrabold text-amber-400">{kpis.openRFIs}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-500 font-bold block mb-1">Alert Risks</span>
          <span className="text-2xl font-extrabold text-rose-400">{kpis.supplierRiskCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-350 mb-6 uppercase">Cost Burn Rate</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                <Area type="monotone" dataKey="Budget" stroke="#64748b" fill="rgba(100,116,139,0.1)" />
                <Area type="monotone" dataKey="Spent" stroke="#0ea5e9" fill="rgba(14,165,233,0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-350 mb-6 uppercase">NCR Risk Matrix</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.riskHeatmap} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                <Bar dataKey="Low" stackId="a" fill="#10b981" />
                <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                <Bar dataKey="High" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

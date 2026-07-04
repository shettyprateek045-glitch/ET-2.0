"use client";

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const KPI_DATA = {
  totalProjects: 14,
  activeProjects: 8,
  aiHealthScore: 94.5,
  totalBudgetMillion: 120.0,
  budgetUsedMillion: 78.4,
  openRFIs: 4,
  supplierRiskCount: 2,
};

const CHART_DATA = {
  monthlyTrend: [
    { name: 'Jan', Budget: 10, Spent: 8, RFIs: 2 },
    { name: 'Feb', Budget: 25, Spent: 20, RFIs: 4 },
    { name: 'Mar', Budget: 45, Spent: 38, RFIs: 7 },
    { name: 'Apr', Budget: 70, Spent: 62, RFIs: 12 },
    { name: 'May', Budget: 95, Spent: 78, RFIs: 5 },
  ],
  riskHeatmap: [
    { category: 'Structural', Low: 4, Medium: 2, High: 1 },
    { category: 'Electrical', Low: 2, Medium: 3, High: 2 },
    { category: 'Mechanical', Low: 5, Medium: 1, High: 0 },
  ],
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<typeof KPI_DATA | null>(null);
  const [chartData, setChartData] = useState<typeof CHART_DATA | null>(null);

  useEffect(() => {
    // Simulate a ~700ms data fetch then populate
    const timer = setTimeout(() => {
      setKpis(KPI_DATA);
      setChartData(CHART_DATA);
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const spentStr = kpis ? `$${kpis.budgetUsedMillion.toFixed(1)}M` : '-';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-purple-100 rounded-lg w-1/3" />
        <div className="h-4 bg-purple-50 rounded-lg w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-purple-50 rounded-2xl border border-purple-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-purple-50 rounded-2xl border border-purple-100" />
          <div className="h-80 bg-purple-50 rounded-2xl border border-purple-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-purple-900">Project Dashboard</h2>
          <p className="text-sm text-purple-600">Project Dublin Hyperscale DC-1 – Status overview.</p>
        </div>
        <span className="px-3 py-1 bg-green-100 border border-green-300 text-green-700 rounded-full text-xs font-semibold">
          AI Health: {kpis!.aiHealthScore}%
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Projects', value: kpis!.totalProjects, color: 'text-purple-900' },
          { label: 'Active Projects', value: kpis!.activeProjects, color: 'text-purple-700' },
          { label: 'Budget Expended', value: spentStr, color: 'text-cyan-700' },
          { label: 'Open RFIs', value: kpis!.openRFIs, color: 'text-amber-600' },
          { label: 'Alert Risks', value: kpis!.supplierRiskCount, color: 'text-rose-600' },
        ].map((card) => (
          <div key={card.label} className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
            <span className="text-xs text-purple-400 font-bold block mb-1">{card.label}</span>
            <span className={`text-2xl font-extrabold ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Burn Rate */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-purple-100 shadow-sm">
          <h3 className="text-sm font-semibold text-purple-400 mb-6 uppercase tracking-wider">Cost Burn Rate</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData!.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" vertical={false} />
                <XAxis dataKey="name" stroke="#9333ea" fontSize={12} />
                <YAxis stroke="#9333ea" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e9d5ff' }} />
                <Area type="monotone" dataKey="Budget" stroke="#c084fc" fill="rgba(192,132,252,0.1)" />
                <Area type="monotone" dataKey="Spent" stroke="#7c3aed" fill="rgba(124,58,237,0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NCR Risk Matrix */}
        <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm">
          <h3 className="text-sm font-semibold text-purple-400 mb-6 uppercase tracking-wider">NCR Risk Matrix</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData!.riskHeatmap} layout="vertical">
                <XAxis type="number" stroke="#9333ea" />
                <YAxis dataKey="category" type="category" stroke="#9333ea" width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e9d5ff' }} />
                <Bar dataKey="Low" stackId="a" fill="#10b981" />
                <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                <Bar dataKey="High" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm">
        <h3 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wider">Project Progress</h3>
        <div className="space-y-4">
          {[
            { name: 'Dublin Hyperscale DC-1', progress: 85, status: 'On Track', color: 'bg-purple-500' },
            { name: 'Frankfurt Expansion', progress: 42, status: 'Delayed', color: 'bg-amber-500' },
            { name: 'London Modular Site', progress: 18, status: 'On Track', color: 'bg-cyan-500' },
          ].map((proj) => (
            <div key={proj.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-purple-900">{proj.name}</span>
                <span className="text-purple-500">{proj.progress}% · {proj.status}</span>
              </div>
              <div className="h-2 w-full bg-purple-50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${proj.color}`} style={{ width: `${proj.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
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
  const { kpis, chartData, loading, activeProject, refreshData } = useProjects();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass h-[300px] p-6 rounded-2xl"><TableSkeleton /></div>
          <div className="glass h-[300px] p-6 rounded-2xl"><TableSkeleton /></div>
        </div>
      </div>
    );
  }

  // Format budget metrics
  const budgetStr = `$${(kpis?.totalBudgetMillion || 0).toFixed(1)}M`;
  const spentStr = `$${(kpis?.budgetUsedMillion || 0).toFixed(1)}M`;
  const budgetPercent = kpis?.totalBudgetMillion > 0 ? ((kpis?.budgetUsedMillion / kpis?.totalBudgetMillion) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h2>
          <p className="text-sm text-secondary">{currentDate}</p>
        </div>
        <button 
          onClick={refreshData}
          className="text-xs font-semibold px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2"
        >
          <Activity className="w-4 h-4 animate-pulse" /> Reload Live Feed
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <KPICard title="Total Projects" value={kpis?.totalProjects || 0} icon={FolderKanban} colorClass="text-sky-400 bg-sky-500/10" subtitle={`${kpis?.activeProjects || 0} Active builds`} />
        <KPICard title="AI Health Score" value={`${kpis?.aiHealthScore || 0}%`} icon={ShieldCheck} colorClass="text-emerald-400 bg-emerald-500/10" subtitle="Platform risk status" />
        <KPICard title="Budget Expended" value={spentStr} icon={Wallet} colorClass="text-teal-400 bg-teal-500/10" subtitle={`${budgetPercent}% of ${budgetStr}`} />
        <KPICard title="Open RFIs" value={kpis?.openRFIs || 0} icon={HelpCircle} colorClass="text-indigo-400 bg-indigo-500/10" subtitle="Needs engineering response" />
        <KPICard title="Supplier Alert Risks" value={kpis?.supplierRiskCount || 0} icon={AlertTriangle} colorClass="text-rose-400 bg-rose-500/10" subtitle="Vendor bottlenecks found" />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project budget vs spent trend */}
        <div className="lg:col-span-2">
          <ChartCard title="Project Cost Burn Rate Trend" subtitle="Monthly aggregated spending forecast vs budget ceilings ($M)">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#334155" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Budget" stroke="#64748b" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="Spent" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Risk Heatmap Summary */}
        <div>
          <ChartCard title="NCR Risk Categorization Matrix" subtitle="Issue frequency grouped by severity scale">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData?.riskHeatmap || []} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend iconType="circle" fontSize={10} wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Low" stackId="a" fill="#2dd4bf" />
                <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                <Bar dataKey="High" stackId="a" fill="#f97316" />
                <Bar dataKey="Critical" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Progress & Feeds grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project progress table */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Active Build Tracks</h3>
            <Link href="/projects" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-secondary font-medium">
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Risk Level</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(chartData?.projectProgress || []).map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-semibold">{p.name}</td>
                    <td className="py-4 w-44">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        <span className="font-bold text-xs">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.health >= 90 ? 'bg-green-500/10 text-green-500' : p.health >= 80 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {p.health >= 90 ? 'Stable' : p.health >= 80 ? 'Moderate' : 'High Risk'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : p.status === 'Delayed' ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed & calendar placeholder */}
        <div className="glass rounded-2xl p-6 border border-border flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Activity Log</h3>
              <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">Realtime Feed</span>
            </div>
            <div className="space-y-4">
              {[
                { time: "10 mins ago", title: "New RFI-105 Filed", text: "Marcus Aurelius requested UPS Busway submittal details.", type: "rfi" },
                { time: "2 hrs ago", title: "Quality Issue Resolved", text: "Chilled Water Joint leaks on Joint welding J-402 cleared.", type: "quality" },
                { time: "1 day ago", title: "Material Shipped", text: "York Centrifugal Chillers (PO-002) cleared Rotterdam.", type: "procurement" }
              ].map((act, idx) => (
                <div key={idx} className="flex gap-4 items-start pb-4 border-b border-border/40 last:border-0 last:pb-0">
                  <div className={`w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    act.type === 'rfi' ? 'bg-indigo-500/10 text-indigo-400' : act.type === 'quality' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {act.type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-sm font-bold text-foreground">{act.title}</h4>
                      <span className="text-[9px] text-secondary whitespace-nowrap">{act.time}</span>
                    </div>
                    <p className="text-xs text-secondary mt-1 leading-relaxed">{act.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border flex justify-between items-center text-xs text-secondary font-medium">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Next Milestone: 22 Jul</span>
            <span className="text-primary hover:underline cursor-pointer">Milestone Board</span>
          </div>
        </div>
      </div>
    </div>
  );
}

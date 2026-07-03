"use client";

import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import ChartCard from '../../components/ChartCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, HelpCircle, Activity } from 'lucide-react';

const PIE_COLORS = ['#38bdf8', '#0ea5e9', '#0d9488', '#2dd4bf'];

export default function AnalyticsPage() {
  const { chartData, kpis } = useProjects();

  // Pie chart data
  const pieData = [
    { name: 'Electrical Subsystems', value: 45 },
    { name: 'Mechanical & HVAC', value: 30 },
    { name: 'Structural Foundations', value: 15 },
    { name: 'Safety & Commissioning', value: 10 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Executive Analytics & Forecasting</h2>
        <p className="text-sm text-secondary">Review predictive construction trends, budget burns, and project milestones</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">+12.4%</p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Milestone acceleration velocity</p>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">-8%</p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Material lead-time latency</p>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">{kpis?.aiHealthScore || 92}%</p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Predictive project health score</p>
          </div>
        </div>
      </div>

      {/* Grid for graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line graph */}
        <ChartCard title="Cumulative Cash Burn Forecast" subtitle="Burn rate projection compared to budget allocation ($M)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Legend iconType="circle" fontSize={10} />
              <Line type="monotone" dataKey="Budget" stroke="#64748b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Spent" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Graph */}
        <ChartCard title="Material Cost Distribution Breakdown" subtitle="Relative values spent by core engineering components">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 h-full">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend block */}
            <div className="space-y-2 text-xs shrink-0">
              {pieData.map((d, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index] }}></span>
                  <span className="text-slate-300 font-medium">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Predictive Analytics */}
      <div className="glass p-6 rounded-2xl border border-border">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" /> AI Forecast Engine Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-slate-950 border border-border/80 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200">Milestone Acceleration Forecast</h4>
            <p className="text-slate-400 leading-relaxed">
              Based on recent progress in electrical systems testing at Dublin, the AI projects a <span className="text-green-400 font-semibold">12-day milestone acceleration</span> on the generator installation track if copper feeder busway availability continues to stabilize.
            </p>
          </div>
          <div className="p-4 bg-slate-950 border border-border/80 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200">Critical Supply Backlog Risk</h4>
            <p className="text-slate-400 leading-relaxed">
              Logistical constraints on scroll chillers remain elevated. If manufacturing slot allocations at Boreas Cooling systems do not improve within 14 days, rigging schedules for Frankfurt Pad B will suffer a cascade latency of <span className="text-red-400 font-semibold">up to 24 days</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder icon helper
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

"use client";

import React from 'react';
import { Activity, ShieldAlert, Cpu, Heart } from 'lucide-react';

export default function MonitoringPage() {
  const metrics = [
    { label: "BIM Parsing Accuracy", value: "99.8%", status: "Nominal", icon: Cpu },
    { label: "Predictive API Latency", value: "124ms", status: "Nominal", icon: Activity },
    { label: "Risk Event Triggers", value: "0 Active", status: "Nominal", icon: ShieldAlert },
    { label: "Agent Coordination Health", value: "99.2%", status: "Optimal", icon: Heart },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Telemetry & Monitoring</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Monitoring active computing modules and data pipeline validation health metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {metrics.map((metric, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{metric.label}</span>
              <metric.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-xs text-green-400 font-medium mt-1">● {metric.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

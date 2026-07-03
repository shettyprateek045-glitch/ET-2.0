"use client";

import React from 'react';
import { Bot, Shield, Clock, Globe, ClipboardCheck, Search } from 'lucide-react';

export default function AgentsPage() {
  const agents = [
    { title: "Specification Compliance Agent", desc: "Checks BIM models against NEC, ASHRAE guidelines.", icon: Shield },
    { title: "Predictive Schedule Risk Engine", desc: "Forecasts project delays using AI timeline analytics.", icon: Clock },
    { title: "Supply Chain Tracker", desc: "Provides real-time visibility for long lead equipment.", icon: Globe },
    { title: "Commissioning QA Copilot", desc: "Verifies test protocols, checklist statuses, and schedules.", icon: ClipboardCheck },
    { title: "Knowledge RAG Intelligence", desc: "Finds answers within structural contracts, RFIs, and specs.", icon: Search },
    { title: "AI Insights Advisor", desc: "Synthesizes data inputs to formulate optimization suggestions.", icon: Bot }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">AI Agents</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Autonomous intelligence models designed to orchestrate complex data centre construction workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {agents.map((agent, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between h-[200px]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                <agent.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-md leading-snug">{agent.title}</h3>
            </div>
            <p className="text-slate-400 text-sm mt-3 flex-1">{agent.desc}</p>
            <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition">
              Deploy Agent
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

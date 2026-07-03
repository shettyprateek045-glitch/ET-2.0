"use client";

import React, { useState } from 'react';
import { Bot, Shield, Clock, Cpu, Activity, FileText, Play, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAgentsPage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const AGENTS = [
    {
      id: 0,
      name: "Specification & Quality Compliance Agent",
      desc: "Scans project specs, guidelines, and engineering layouts to identify code deviations, regulatory non-compliances, and material discrepancies.",
      icon: Shield,
      placeholder: "Paste specifications text or reference drawing section here to audit...",
      endpoint: "http://127.0.0.1:8000/api/v1/quality/compliance-check?document_text=",
      fallbackData: [
        { clause: "Sec 4.2.1: Generator Fuel Supply Layout", status: "Non-Compliant", details: "The design specifies a single 10,000-gallon belly tank without secondary containment, violating EPA Tier 4 requirements.", remediation: "Redesign with dual-walled tanks or implement a concrete containment dike." },
        { clause: "Sec 8.1.3: Chilled Water Piping Redundancy", status: "Compliant", details: "N+2 piping loops meet the Tier III design topology requested by the client.", remediation: "None" }
      ]
    },
    {
      id: 1,
      name: "Predictive Schedule Risk Engine",
      desc: "Calculates milestone bottleneck probability based on historical shipping schedules, local crane leasing availabilities, and submittal turnaround times.",
      icon: Clock,
      placeholder: "Trigger audit loop to predict upcoming construction delays...",
      endpoint: "http://127.0.0.1:8000/api/v1/ai/agents/schedule-risk",
      fallbackData: [
        { activity: "HVAC Chiller Delivery & Rigging", original_date: "2026-09-15", predicted_delay_days: 24, probability: 85, impact: "Critical Path", reasons: "Global shipping backlog on scroll chillers, crane rental availability in Dublin." }
      ]
    },
    {
      id: 2,
      name: "Supply Chain Visibility & Risk Agent",
      desc: "Performs continuous credit health checks, lead-time variance parsing, and logistical monitoring across critical switchgear and cooling block manufacturers.",
      icon: Cpu,
      placeholder: "Analyze critical vendor supplier stability...",
      endpoint: "http://127.0.0.1:8000/api/v1/procurement/supplier-risk-assessment",
      fallbackData: [
        { supplier: "Apex Switchgear Ltd", risk_level: "High", components: "MV Switchgear panels", financial_stability: "Weak (recent credit downgrade to BB-)" }
      ]
    },
    {
      id: 3,
      name: "Commissioning Quality Assurance Copilot",
      desc: "Ingests electrical load-test readings, backup transition switch timings, and heat run records to isolate commissioning failures.",
      icon: Activity,
      placeholder: "Run diagnostics checklist verification...",
      endpoint: "http://127.0.0.1:8000/api/v1/commissioning/copilot-check",
      fallbackData: [
        { system: "UPS System A", check: "Load bank testing (100% load step)", status: "Failed", observation: "Voltage transient sag exceeded 12% on step load change." }
      ]
    },
    {
      id: 4,
      name: "Project Knowledge & RFI Intelligence Agent",
      desc: "Harnesses Retrieval-Augmented Generation (RAG) to scan contracts, meeting notes, drawings, and submittals, providing citation-backed RFI solutions.",
      icon: FileText,
      placeholder: "Enter construction or design query (e.g. concrete curing length, copper busway)...",
      endpoint: "http://127.0.0.1:8000/api/v1/ai/agents/project-knowledge-rfi?query=",
      fallbackData: {
        answer: "Meeting Minutes from June 12 state that foundation pour for Generator Pad 3 achieved 3,500 psi compressive strength at day 7. Total curing period must be 28 days before placing heavy equipment.",
        sources: ["Meeting_Minutes_2026-06-12.docx"]
      }
    }
  ];

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    const agent = AGENTS[activeTab];
    const url = agent.id === 0 || agent.id === 4 
      ? `${agent.endpoint}${encodeURIComponent(inputVal)}` 
      : agent.endpoint;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResult(agent.id === 0 ? data.results : (agent.id === 1 ? data : (agent.id === 2 ? data.risks : (agent.id === 3 ? data.alerts : data))));
      } else {
        throw new Error();
      }
    } catch (e) {
      // Mock Fallback
      setTimeout(() => {
        setResult(agent.fallbackData);
        setLoading(false);
      }, 1000);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI EPC Agents Command Suite</h2>
        <p className="text-sm text-secondary">Execute five specialized analysis algorithms to resolve project risks</p>
      </div>

      {/* Agents Selection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {AGENTS.map((a) => {
          const Icon = a.icon;
          const isSelected = activeTab === a.id;
          return (
            <button
              key={a.id}
              onClick={() => {
                setActiveTab(a.id);
                setInputVal('');
                setResult(null);
              }}
              className={`glass p-5 rounded-2xl border text-left flex flex-col justify-between h-[150px] transition-all hover:scale-[1.02] ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className={`p-2 rounded-lg w-fit ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-secondary'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-foreground mt-4 leading-snug">{a.name}</h4>
            </button>
          );
        })}
      </div>

      {/* Workspace panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Input Console */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-border flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">{AGENTS[activeTab].name}</h3>
            </div>
            <p className="text-xs text-secondary leading-relaxed mb-6">{AGENTS[activeTab].desc}</p>
            
            {/* Input textarea */}
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={AGENTS[activeTab].placeholder}
              className="w-full bg-slate-950 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white h-36 resize-none"
            />
          </div>

          <button
            onClick={handleRun}
            disabled={loading}
            className="w-fit mt-6 bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching analysis vectors...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run Intelligence Agent
              </>
            )}
          </button>
        </div>

        {/* Right Output Ledger */}
        <div className="glass p-6 rounded-2xl border border-border min-h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm">Intelligence Report</h3>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">Logs</span>
          </div>

          {result ? (
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-2 custom-scrollbar text-xs">
              {activeTab === 4 ? (
                // RAG Agent response formatting
                <div className="space-y-4 leading-relaxed">
                  <div className="p-3 bg-slate-950 border border-border rounded-xl">
                    <p className="font-bold text-slate-200 mb-1">Answer Summary:</p>
                    <p className="text-slate-400">{result.answer}</p>
                  </div>
                  {result.sources && (
                    <div>
                      <p className="font-bold text-secondary uppercase text-[10px] mb-1">References:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.sources.map((s: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Table / Audit response formatting
                result.map((r: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-border rounded-xl space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-200">{r.clause || r.activity || r.supplier || r.system}</h4>
                      {r.status && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          r.status === 'Compliant' || r.status === 'Passed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>{r.status}</span>
                      )}
                      {r.risk_level && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[9px] font-bold">{r.risk_level} Risk</span>
                      )}
                    </div>
                    
                    <p className="text-slate-400 leading-normal">{r.details || r.reasons || r.components || r.observation}</p>
                    {(r.remediation || r.mitigation || r.solution) && (
                      <p className="text-primary mt-2 pt-2 border-t border-border/50">
                        <span className="font-bold text-slate-300">Action Plan:</span> {r.remediation || r.mitigation || r.solution}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-secondary">
              <Bot className="w-10 h-10 stroke-[1.5] mb-2 opacity-50" />
              <p className="text-xs">Select agent, enter parameters, and execute to compile system logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

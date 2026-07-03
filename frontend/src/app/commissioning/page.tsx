"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import Modal from '../../components/Modal';
import { ClipboardCheck, ShieldCheck, PenTool, Sparkles, Activity, FileText, CheckCircle } from 'lucide-react';

export default function CommissioningPage() {
  const { commissioningItems, signCommissioning } = useProjects();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [testerName, setTesterName] = useState('');
  const [copilotReports, setCopilotReports] = useState<any>(null);
  const [runningCopilot, setRunningCopilot] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async () => {
    if (!selectedItemId || !testerName) return;
    const canvas = canvasRef.current;
    const sigData = canvas ? canvas.toDataURL() : 'simulated-signature-data';
    
    await signCommissioning(selectedItemId, testerName, sigData);
    setTesterName('');
    setSelectedItemId(null);
  };

  const handleRunCopilot = async () => {
    setRunningCopilot(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/commissioning/copilot-check');
      if (res.ok) {
        const data = await res.json();
        setCopilotReports(data.alerts);
      }
    } catch (e) {
      setCopilotReports([
        { system: "UPS System A", check: "Load bank testing (100% load step)", status: "Failed", observation: "Voltage transient sag exceeded 12% on step load change, recovery time was 180ms.", solution: "Adjust governor parameters on generator control modules and recalibrate UPS bypass." }
      ]);
    }
    setRunningCopilot(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Systems Commissioning & Verification</h2>
          <p className="text-sm text-secondary">Execute testing procedures, document checklist inspections, and sign certificates</p>
        </div>
      </div>

      {/* Main checklist and copilot grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Checklists */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm">Testing Procedures List</h3>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">Commissioning checklist</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-secondary font-medium">
                  <th className="pb-3">Commissioning Item ID</th>
                  <th className="pb-3">Subsystem</th>
                  <th className="pb-3">Component Component Name</th>
                  <th className="pb-3">Testing status</th>
                  <th className="pb-3">Tester</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissioningItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-primary">COMM-ITEM-{String(item.id).padStart(3, '0')}</td>
                    <td className="py-3 font-bold">{item.system_name}</td>
                    <td className="py-3 text-slate-300">{item.component_name}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                        item.status === 'Certified' ? 'bg-green-500/10 text-green-500' : item.status === 'Tested' ? 'bg-indigo-500/10 text-indigo-500' : item.status === 'InProgress' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{item.tester_name || "Unassigned"}</td>
                    <td className="py-3 text-right">
                      {item.status !== 'Certified' ? (
                        <button
                          onClick={() => setSelectedItemId(item.id)}
                          className="px-2.5 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors text-[10px] flex items-center gap-1.5 ml-auto"
                        >
                          <PenTool className="w-3.5 h-3.5" /> Sign Checklist
                        </button>
                      ) : (
                        <span className="text-[10px] text-green-400 font-bold flex items-center justify-end gap-1"><CheckCircle className="w-3.5 h-3.5" /> Sign-off Validated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Copilot Audit Log */}
        <div className="glass p-6 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> QA Commissioning Copilot
              </h3>
              <button
                onClick={handleRunCopilot}
                disabled={runningCopilot}
                className="text-[10px] font-bold px-2 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-lg transition-colors"
              >
                {runningCopilot ? "Running..." : "Run Audit"}
              </button>
            </div>

            {copilotReports ? (
              <div className="space-y-4 text-xs">
                {copilotReports.map((alert: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-border rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-200">{alert.system}</h4>
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[9px] font-bold">{alert.status}</span>
                    </div>
                    <p className="text-slate-400">Task: {alert.check}</p>
                    <p className="text-slate-400 leading-normal">Details: {alert.observation}</p>
                    <p className="text-primary pt-2 border-t border-border/50"><span className="font-bold text-slate-300">Action Plan:</span> {alert.solution}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-secondary py-12">
                <Activity className="w-10 h-10 stroke-[1.5] mb-2 opacity-50" />
                <p className="text-xs">Run QA commissioning loop audits to evaluate electrical step performance readings.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Capture Modal */}
      {selectedItemId !== null && (
        <Modal isOpen={selectedItemId !== null} onClose={() => setSelectedItemId(null)} title="Sign-off testing checklist item">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tester / Engineer Full Name</label>
              <input
                type="text"
                required
                value={testerName}
                onChange={(e) => setTesterName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Draw Signature</label>
              <div className="bg-slate-950 border border-border rounded-xl p-1">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full bg-slate-950 rounded-xl cursor-crosshair h-32"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-4">
              <button 
                type="button" 
                onClick={clearCanvas}
                className="px-4 py-2.5 bg-slate-900 border border-border hover:bg-slate-800 text-foreground font-semibold rounded-xl text-xs transition-colors"
              >
                Clear Drawing
              </button>
              <button 
                type="button" 
                onClick={handleSign}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-lg transition-all"
              >
                Confirm Certification
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

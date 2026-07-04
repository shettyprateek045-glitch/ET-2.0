"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Shield, Cpu, Activity, Clock, FileText, ArrowRight,
  ShieldCheck, Globe, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const AGENTS = [
  {
    id: 'compliance',
    name: 'Specification & Quality Compliance Agent',
    icon: Shield,
    shortDesc: 'Checks BIM models and submittals against NEC, ASHRAE, and site standards.',
    bullets: [
      'Automated drawing parsing (PDF to CAD structure extraction)',
      'NEC, ASHRAE, and local code verification compliance check',
      'Real-time design deviation alerting for engineering review'
    ]
  },
  {
    id: 'schedule',
    name: 'Predictive Schedule Risk Engine',
    icon: Clock,
    shortDesc: 'Forecasts project delays by analyzing lead times, weather, and contractor schedules.',
    bullets: [
      'Critical-path timeline risk assessment',
      'Lead-time warning alarms for long-lead gear (chillers, transformers)',
      'Weather impact simulations (wind-shear limits on crane operations)'
    ]
  },
  {
    id: 'logistics',
    name: 'Supply Chain Visibility & Risk Agent',
    icon: Globe,
    shortDesc: 'Geospatial tracking of critical infrastructure across global suppliers.',
    bullets: [
      'Geospatial live map plotting and ETA updates',
      'Supplier financial risk and shipping backlog tracking',
      'Custom alerts for transport delays'
    ]
  },
  {
    id: 'commissioning',
    name: 'Commissioning Quality Assurance Copilot',
    icon: ShieldCheck,
    shortDesc: 'Guides test sequences and captures certifications for TIA-942/BICSI standard compliance.',
    bullets: [
      'Standardized checklists for electrical, mechanical, and safety systems',
      'Step-by-step TIA-942 and BICSI compliance wizard',
      'Digital signature and tester sign-off logs'
    ]
  },
  {
    id: 'rag',
    name: 'Project Knowledge & RFI Intelligence Agent',
    icon: Search,
    shortDesc: 'RAG search over engineering documents to answer questions with citations.',
    bullets: [
      'Vector database search (RAG) over all project documentation',
      'Semantic Q&A engine with source document links and citations',
      'RFI template auto-filler using historical logs'
    ]
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particles Canvas Effect
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles: any[] = [];
    for(let i=0; i<60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5
      });
    }
    
    let animationFrameId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(120, 119, 198, 0.2)';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden px-6 py-12 max-w-7xl mx-auto">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 pt-8">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
            </span>
            <span>v3.5 Real-Time AI Orchestration</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-purple-950 leading-tight">
            Real-Time AI <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 font-extrabold">
              EPC Intelligence
            </span><br/>
            Platform
          </h1>
          
          <p className="text-base sm:text-lg text-purple-800/90 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            An enterprise cognitive ecosystem that consolidates BIM compliance, engineering submittals, supply chain tracking, predictive schedule analytics, and commissioning logs into unified, agentic execution templates.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            {user ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => router.push('/platform')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="px-6 py-3 bg-purple-50 border border-purple-200 hover:border-purple-300 text-purple-900 font-semibold rounded-lg transition-all cursor-pointer hover:bg-purple-100/80"
                >
                  Log In to Workspace
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Interactive Telemetry Display Card */}
        <div className="w-full max-w-md shrink-0 flex items-center justify-center relative z-10">
          <div className="glass rounded-3xl p-6 border border-purple-200/50 shadow-2xl relative overflow-hidden w-full space-y-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between border-b border-purple-200/20 pb-3">
              <span className="text-xs font-mono text-purple-750">SYSTEM HEALTH</span>
              <span className="text-xs text-purple-500 font-bold">NODE: DUB-1</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                <Bot className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <h4 className="text-purple-950 font-bold text-lg">AI Coordinator Active</h4>
                <p className="text-xs text-purple-600 font-medium">Continuous Audit Stream</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-800">BIM Verification Index</span>
                <span className="text-purple-700 font-bold">99.8% Nominal</span>
              </div>
              <div className="h-2.5 w-full bg-purple-100 rounded-full overflow-hidden border border-purple-200">
                <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-[99.8%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Strip */}
      <section className="relative z-10 glass rounded-3xl p-8 border border-purple-200/50 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-purple-200/20 mt-16 shadow-lg">
        {[
          { val: '15,000+', label: 'Equipment Line Items Tracked', desc: 'Real-time telemetry and PO status integration' },
          { val: '67%', label: 'Fewer Schedule Overruns', desc: 'Predictive bottleneck warning alerts' },
          { val: '200+', label: 'Contractors Coordinated', desc: 'Collaborative task and RFI assignments' }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left px-4 space-y-1.5 pt-6 md:pt-0 first:pt-0">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 font-extrabold">{item.val}</span>
            <span className="text-sm font-bold text-purple-950 tracking-wide">{item.label}</span>
            <span className="text-xs text-purple-700">{item.desc}</span>
          </div>
        ))}
      </section>

      {/* Meet the AI Agents preview cards */}
      <section className="relative z-10 space-y-8 mt-24">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-purple-950">Cognitive AI Agents</h2>
          <p className="text-sm text-purple-700 font-medium">Explore our five specialized agents. Click any card to launch their deep-dive command consoles.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <div 
                key={agent.id}
                onClick={() => router.push('/ai-agents')}
                className="glass p-6 rounded-2xl border border-purple-200/50 flex flex-col justify-between hover:border-purple-500/50 hover:bg-white transition-all duration-300 cursor-pointer shadow-sm group"
              >
                <div>
                  <div className="p-3 bg-purple-100 text-purple-750 rounded-xl w-fit group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-purple-900 text-md mt-4 group-hover:text-purple-700 transition-colors">{agent.name}</h3>
                  <p className="text-purple-800 text-xs mt-2.5 leading-relaxed">{agent.shortDesc}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-purple-200/20 flex items-center justify-between text-[10px] font-mono text-purple-700 font-bold uppercase tracking-wider">
                  <span>Launch Agent Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-purple-750" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

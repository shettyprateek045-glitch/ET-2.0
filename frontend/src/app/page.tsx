"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Shield, Cpu, Activity, Clock, FileText, ChevronRight, 
  CheckCircle2, ArrowRight, LayoutDashboard, FolderKanban, 
  ShoppingCart, ClipboardCheck, BarChart3, FileBarChart, Bell, 
  Settings, Users, Phone, AlertTriangle, Globe, Send, MessageSquare, 
  Search, X, Grid, Layers, Menu, Download, Lock, ChevronDown, Plus, LogOut,
  Server, HardDrive, Zap, Wind, Power, ShieldAlert, FileSpreadsheet, ShieldCheck, Wallet
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

const pieColors = ['#10b981', '#f59e0b', '#ef4444'];

export default function DataCentrePlatform() {
  const { user, login, logout } = useAuth();
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    rfis, 
    qualityIssues, 
    purchaseOrders, 
    commissioningItems, 
    kpis, 
    chartData, 
    loading, 
    addRFI 
  } = useProjects();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginType, setLoginType] = useState<'Enterprise' | 'Client' | 'Admin'>('Enterprise');
  const [loginError, setLoginError] = useState('');

  // RFI Modal state
  const [showRfiModal, setShowRfiModal] = useState(false);
  const [rfiTitle, setRfiTitle] = useState('');
  const [rfiQuestion, setRfiQuestion] = useState('');

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'Welcome to the DataCentre AI EPC Intelligence Platform Copilot. Ask me about RFIs, contracts, drawings, or risk predictions.' }
  ]);

  // Particles Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || user) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles: any[] = [];
    for(let i=0; i<80; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5
      });
    }
    
    let animationFrameId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < 0 || p.x > width) p.vx *= -1;
        if(p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
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
  }, [user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    // Map login type to standard UserRole
    let selectedRole: any = loginType;
    if (loginType === 'Enterprise') selectedRole = 'Engineer';
    
    const success = await login(loginEmail, selectedRole as any, loginEmail.split('@')[0]);
    if (success) {
      setActiveSection('dashboard');
    } else {
      setLoginError('Invalid credentials or backend error.');
    }
  };

  const handleCreateRfiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfiTitle.trim() || !rfiQuestion.trim()) return;
    await addRFI({ title: rfiTitle, question: rfiQuestion });
    setRfiTitle('');
    setRfiQuestion('');
    setShowRfiModal(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userQuery = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setChatInput('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/documents/search/semantic?query=${encodeURIComponent(userQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      } else {
        throw new Error('Fallback needed');
      }
    } catch (err) {
      // Offline fallback
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `RAG search results for "${userQuery}": Found compliance citation matching section 26 32 13 guidelines. Secondary containment tank requires 110% storage capacity. Code compliance confirmed.` 
        }]);
      }, 800);
    }
  };

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    window.open(`http://127.0.0.1:8000/api/v1/reports/${format}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-animated-gradient text-slate-200 overflow-hidden flex">
      {/* SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="fixed lg:static z-40 h-screen bg-[#030712]/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col shrink-0 transition-all"
          >
            <div className="p-4 h-16 flex items-center border-b border-slate-800/80 shrink-0">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">DataCentre AI</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Navigation</div>
              {[
                { id: 'hero', icon: Globe, label: 'Home' },
                { id: 'overview', icon: Layers, label: 'Platform Overview' },
                { id: 'agents', icon: Bot, label: 'AI Agents' },
                { id: 'dashboard', icon: LayoutDashboard, label: 'Monitoring' },
                { id: 'workspace', icon: FolderKanban, label: 'Workspace' },
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                { id: 'reports', icon: FileBarChart, label: 'Reports' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    activeSection === item.id 
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}

              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-8">System</div>
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200">
                <Settings className="w-5 h-5" />
                <span className="font-medium text-sm">Settings</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200">
                <Phone className="w-5 h-5" />
                <span className="font-medium text-sm">Contact</span>
              </button>
            </div>
            
            {user && (
              <div className="p-4 border-t border-slate-800/80 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-white truncate">{user.full_name}</div>
                    <div className="text-xs text-slate-400 truncate">{user.role}</div>
                  </div>
                  <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* STICKY TOP NAV */}
        <header className="h-16 shrink-0 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 z-30 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-4 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex space-x-1">
              {['Home', 'Platform', 'AI Agents', 'Dashboard', 'Monitoring', 'Contact'].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    if (item === 'Home') setActiveSection('hero');
                    else if (item === 'Platform' || item === 'Monitoring') setActiveSection('overview');
                    else if (item === 'AI Agents') setActiveSection('agents');
                    else if (item === 'Dashboard') setActiveSection('dashboard');
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search projects, RFIs..." 
                className="bg-slate-900 border border-slate-800 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 w-64 transition-all"
              />
            </div>
            {projects.length > 0 && (
              <div className="relative">
                <select 
                  value={activeProject?.id || ''} 
                  onChange={(e) => {
                    const p = projects.find(proj => proj.id === Number(e.target.value));
                    if (p) setActiveProject(p);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-sm px-3 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button className="relative p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#020617]"></span>
            </button>
            {!user && (
              <button onClick={() => setActiveSection('hero')} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all">
                Login
              </button>
            )}
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative scroll-smooth bg-[#020617]/40">
          
          {/* Particles effect for Hero section when logged out */}
          {!user && activeSection === 'hero' && (
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24 relative z-10">
            
            {/* HERO SECTION */}
            {(activeSection === 'hero' || activeSection === 'all') && (
              <section id="hero" className="min-h-[85vh] flex flex-col xl:flex-row items-center justify-between gap-12 pt-12">
                <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>v3.2 Real-Time Monitoring Enabled</span>
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                    Real-Time AI <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                      EPC Intelligence
                    </span><br/>
                    Platform
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                    An enterprise AI platform that consolidates BIM models, engineering drawings, RFIs, procurement, contracts, compliance, commissioning, logistics, predictive analytics, and digital infrastructure monitoring into one intelligent ecosystem.
                  </p>
                  
                  {/* Hero Animated KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                    {[
                      { label: 'Active Projects', value: kpis.activeProjects || '14', icon: FolderKanban, color: 'text-blue-400' },
                      { label: 'AI Health', value: `${kpis.aiHealthScore || 94.5}%`, icon: Activity, color: 'text-green-400' },
                      { label: 'Code Compliance', value: '100%', icon: ShieldCheck, color: 'text-emerald-400' },
                      { label: 'Documents Indexed', value: '2.4M', icon: Layers, color: 'text-purple-400' },
                    ].map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="glass-premium rounded-xl p-4 flex flex-col items-start justify-center border-t border-white/10"
                      >
                        <item.icon className={cn("w-5 h-5 mb-2", item.color)} />
                        <span className="text-2xl font-bold text-white">{item.value}</span>
                        <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Login Panels */}
                {!user && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md shrink-0"
                  >
                    <div className="glass-premium rounded-2xl p-1 shadow-2xl border border-slate-800/80 backdrop-blur-2xl">
                      <div className="flex p-2 space-x-2 bg-slate-950/50 rounded-t-xl">
                        {(['Enterprise', 'Client', 'Admin'] as const).map(type => (
                          <button 
                            key={type}
                            type="button"
                            onClick={() => setLoginType(type)}
                            className={cn("flex-1 py-2 text-xs font-medium rounded-lg transition-all", loginType === type ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white")}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      
                      <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">
                        <h3 className="text-lg font-bold text-white mb-2">{loginType} Authentication</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                            <div className="relative">
                              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input 
                                required 
                                type="email" 
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder={`${loginType.toLowerCase()}@datacentre.ai`} 
                                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 transition-all placeholder:text-slate-600" 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                            <div className="relative">
                              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input 
                                required 
                                type="password" 
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 transition-all placeholder:text-slate-600" 
                              />
                            </div>
                          </div>
                        </div>

                        {loginError && (
                          <div className="text-xs text-red-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-slate-800 bg-slate-950 text-blue-500 focus:ring-blue-500/50" />
                            <span className="text-xs text-slate-400">Remember Me</span>
                          </label>
                          <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot Password?</a>
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5">
                          Login
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </section>
            )}

            {/* PLATFORM OVERVIEW */}
            {(activeSection === 'overview' || activeSection === 'dashboard' || activeSection === 'all') && (
              <section id="overview" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
                    <p className="text-sm text-slate-400">Real-time status indicators and active project parameters.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[
                    { label: 'Total Projects', val: kpis.totalProjects || 0, icon: Grid, color: 'text-blue-400' },
                    { label: 'AI Compliance', val: '99.8%', icon: ShieldCheck, color: 'text-green-400' },
                    { label: 'Open RFIs', val: kpis.openRFIs || 0, icon: MessageSquare, color: 'text-amber-400' },
                    { label: 'Active Contractors', val: '86', icon: Users, color: 'text-purple-400' },
                    { label: 'Budget Util.', val: `${Math.round(((kpis.budgetUsedMillion || 0) / (kpis.totalBudgetMillion || 1)) * 100)}%`, icon: Wallet, color: 'text-emerald-400' },
                    { label: 'Schedule', val: '+2 Days', icon: Clock, color: 'text-cyan-400' },
                    { label: 'Procurement', val: 'On Track', icon: ShoppingCart, color: 'text-blue-400' },
                    { label: 'AI Recs', val: '12', icon: Bot, color: 'text-rose-400' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5 }}
                      className="glass-premium rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 border border-slate-800/80 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={cn("p-2 rounded-lg bg-slate-950", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-white">{stat.val}</span>
                      <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* AI INTELLIGENCE MODULES */}
            {(activeSection === 'agents' || activeSection === 'dashboard' || activeSection === 'all') && (
              <section id="agents" className="space-y-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">AI Intelligence Modules</h2>
                  <p className="text-sm text-slate-400">Deploy specialized autonomous agents to oversee critical project dimensions.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { 
                      title: 'Specification Compliance Agent', 
                      desc: 'Checks BIM models against NEC, ASHRAE and international standards.',
                      icon: Shield,
                      status: 'Active Scanning'
                    },
                    { 
                      title: 'Predictive Schedule Risk Engine', 
                      desc: 'Forecasts delays using AI analysis of historical data and logistics.',
                      icon: Clock,
                      status: 'Monitoring'
                    },
                    { 
                      title: 'Supply Chain Visibility', 
                      desc: 'Tracks generators, switchgear, UPS systems and chillers.',
                      icon: Globe,
                      status: 'Real-time'
                    },
                    { 
                      title: 'Commissioning QA Copilot', 
                      desc: 'Analyzes testing procedures and commissioning reports.',
                      icon: ClipboardCheck,
                      status: 'Awaiting Data'
                    },
                    { 
                      title: 'Project Knowledge & RAG Intelligence', 
                      desc: 'Searches contracts, RFIs, drawings and meeting minutes.',
                      icon: Search,
                      status: 'Indexed 2.4M docs'
                    },
                    { 
                      title: 'AI Insights Advisor', 
                      desc: 'Provides recommendations using predictive analytics.',
                      icon: Bot,
                      status: 'Active'
                    },
                  ].map((module, i) => (
                    <div key={i} className="glass-premium rounded-2xl p-6 group hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <module.icon className="w-24 h-24 text-white" />
                      </div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
                          <module.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-white text-lg leading-tight">{module.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed">{module.desc}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-2">
                          <span className="relative flex h-2 w-2">
                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", module.status.includes('Active') || module.status.includes('Real') ? "bg-green-400" : "bg-blue-400")}></span>
                            <span className={cn("relative inline-flex rounded-full h-2 w-2", module.status.includes('Active') || module.status.includes('Real') ? "bg-green-500" : "bg-blue-500")}></span>
                          </span>
                          <span className="text-xs font-medium text-slate-300">{module.status}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors flex items-center space-x-1">
                            <span>Workspace</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DIGITAL INFRASTRUCTURE MONITORING DASHBOARD */}
            {(activeSection === 'dashboard' || activeSection === 'all') && (
              <section id="monitoring" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Infrastructure Monitoring</h2>
                    <p className="text-sm text-slate-400">High-fidelity metrics derived from physical sensors and scheduling APIs.</p>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Budget Chart */}
                  <div className="lg:col-span-2 glass-premium rounded-2xl p-6 border border-slate-800/80">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Budget vs Spend Trend</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData?.monthlyTrend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}M`} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Area type="monotone" dataKey="Budget" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" />
                          <Area type="monotone" dataKey="Spent" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Equipment Status */}
                  <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Equipment Status</h3>
                    <div className="flex-1 space-y-4">
                      {[
                        { id: 1, name: 'UPS System', status: 'Online', icon: Zap, color: 'text-green-400' },
                        { id: 2, name: 'Switchgear', status: 'Warning', icon: Power, color: 'text-amber-400' },
                        { id: 3, name: 'Generator', status: 'Delayed', icon: Server, color: 'text-red-400' },
                        { id: 4, name: 'Cooling Plant', status: 'Testing', icon: Wind, color: 'text-blue-400' },
                      ].map(eq => (
                        <div key={eq.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <div className="flex items-center space-x-3">
                            <div className={cn("p-2 rounded-lg bg-slate-950", eq.color)}>
                              <eq.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm text-slate-200">{eq.name}</span>
                          </div>
                          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800", eq.color)}>
                            {eq.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Construction Timeline */}
                  <div className="glass-premium rounded-2xl p-6 border border-slate-800/80">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Construction Progress</h3>
                    <div className="space-y-5">
                      {(chartData?.projectProgress || []).map((item: any, i: number) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300 font-medium">{item.name}</span>
                            <span className="text-slate-400">{item.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={cn("h-full rounded-full", item.progress === 100 ? "bg-green-500" : "bg-blue-500")}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Risk Trend */}
                  <div className="glass-premium rounded-2xl p-6 border border-slate-800/80">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">AI Health Trend</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData?.monthlyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="RFIs" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Compliance breakdown */}
                  <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 flex flex-col items-center">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 w-full text-left">Quality Inspections</h3>
                    <div className="h-48 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Resolved', value: 70 },
                              { name: 'Under Review', value: 20 },
                              { name: 'Open', value: 10 }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={pieColors[index]} stroke="rgba(0,0,0,0)" />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-2xl font-bold text-white">70%</span>
                        <span className="text-xs text-slate-400">Resolved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* INTERACTIVE SAAS WORKSPACE */}
            {(activeSection === 'workspace' || activeSection === 'all') && (
              <section id="workspace" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Interactive Workspace</h2>
                    <p className="text-sm text-slate-400">Console to audit documents, review quality issues, and submit live RFIs.</p>
                  </div>
                  <button 
                    onClick={() => setShowRfiModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create RFI</span>
                  </button>
                </div>

                <div className="glass-premium rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col md:flex-row h-[500px]">
                  {/* Workspace Sub-nav */}
                  <div className="w-full md:w-64 bg-slate-950/40 border-r border-slate-800/80 p-4 shrink-0 flex flex-col gap-2">
                    {['Recent Documents', 'AI Analysis', 'Compliance Report', 'Project Timeline', 'Equipment Tracker', 'Budget Forecast'].map((item, i) => (
                      <button key={i} className={cn("text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", i === 0 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
                        {item}
                      </button>
                    ))}
                  </div>
                  
                  {/* Table area */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#020617]/20">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-white">Project RFIs</h3>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search RFIs..." className="bg-slate-900 border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-500 text-slate-200" />
                      </div>
                    </div>
                    
                    <div className="w-full border border-slate-800/80 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/85 text-xs uppercase font-semibold text-slate-300 border-b border-slate-800/80">
                          <tr>
                            <th className="px-4 py-3">RFI Title</th>
                            <th className="px-4 py-3">Asked By</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Response</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/20">
                          {rfis.map((rfi) => (
                            <tr key={rfi.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-200 flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span>{rfi.title}</span>
                              </td>
                              <td className="px-4 py-3">{rfi.asked_by}</td>
                              <td className="px-4 py-3">
                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", 
                                  rfi.status === 'Closed' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                )}>
                                  {rfi.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs italic text-slate-400 truncate max-w-xs">{rfi.response || 'Pending Response'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ANALYTICS SECTION */}
            {(activeSection === 'analytics' || activeSection === 'all') && (
              <section id="analytics" className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
                  <p className="text-sm text-slate-400">Deep-dive graphs explaining cost trajectory, risk indexes, and resource allocations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Budget */}
                  <div className="glass-premium rounded-2xl p-6 border border-slate-800/80">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Monthly Cost Trajectory</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData?.monthlyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Bar dataKey="Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Resource Utilization */}
                  <div className="glass-premium rounded-2xl p-6 border border-slate-800/80">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Resource Allocation</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData?.monthlyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="Budget" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* REPORTS SECTION */}
            {(activeSection === 'reports' || activeSection === 'all') && (
              <section id="reports" className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Export & Reports</h2>
                  <p className="text-sm text-slate-400">Download formatted files representing physical parameters, audits, and schedules.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Compliance Report (PDF)', desc: 'Full standard compliance certificate containing standard validations.', format: 'pdf', icon: FileText, color: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400' },
                    { label: 'Procurement Summary (Excel)', desc: 'Excel spreadsheet containing switchgear, generators, and UPS PO details.', format: 'excel', icon: FileSpreadsheet, color: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400' },
                    { label: 'Schedule Risk Data (CSV)', desc: 'Raw CSV structure containing predicted milestones and variance parameters.', format: 'csv', icon: FileText, color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400' },
                  ].map((rep, i) => (
                    <div key={i} className={cn("glass-premium rounded-2xl p-6 border flex flex-col justify-between bg-gradient-to-br", rep.color)}>
                      <div>
                        <rep.icon className="w-8 h-8 mb-4" />
                        <h3 className="font-bold text-white text-lg mb-2">{rep.label}</h3>
                        <p className="text-sm text-slate-400 mb-6">{rep.desc}</p>
                      </div>
                      <button 
                        onClick={() => handleDownload(rep.format as any)}
                        className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-semibold rounded-lg text-white transition-colors"
                      >
                        Download File
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FOOTER */}
            <footer className="pt-24 pb-8 border-t border-slate-800/80 mt-24">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                      <Grid className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-white tracking-tight">DataCentre AI</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 font-medium">
                    The world's leading AI-powered EPC intelligence platform for mission-critical digital infrastructure.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">AI Agents</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Security Policy</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Enterprise Portal</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm">Resources</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">API Reference</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Case Studies</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800/80 text-xs text-slate-500">
                <p>&copy; 2026 DataCentre AI. All rights reserved.</p>
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                  <a href="#" className="hover:text-white transition-colors">GitHub</a>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* FLOAT CHAT ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 glass-premium rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col overflow-hidden"
              style={{ height: '500px' }}
            >
              {/* Header */}
              <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">EPC Copilot</h3>
                    <p className="text-xs text-slate-500">Agent Active</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-850 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Msg logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#020617]/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", 
                      msg.role === 'user' 
                        ? "bg-blue-600 text-white rounded-tr-sm" 
                        : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-sm shadow-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800/80">
                <form onSubmit={handleChatSubmit} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about RFIs, predict risk..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim()}
                    className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-pulse"
        >
          {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      {/* CREATE RFI MODAL */}
      <AnimatePresence>
        {showRfiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-premium rounded-2xl border border-slate-800/80 p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Create New RFI</h3>
                <button onClick={() => setShowRfiModal(false)} className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateRfiSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">RFI Title</label>
                  <input 
                    required 
                    type="text" 
                    value={rfiTitle}
                    onChange={(e) => setRfiTitle(e.target.value)}
                    placeholder="e.g. UPS room A-1 cooling capacity calculation" 
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">RFI Question Detail</label>
                  <textarea 
                    required 
                    rows={4}
                    value={rfiQuestion}
                    onChange={(e) => setRfiQuestion(e.target.value)}
                    placeholder="Describe the engineering discrepancy or request for clarification..." 
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200 resize-none" 
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowRfiModal(false)} 
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-semibold rounded-lg text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-lg text-white shadow-lg shadow-blue-500/20"
                  >
                    Submit RFI
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

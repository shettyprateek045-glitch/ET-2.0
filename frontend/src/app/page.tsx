"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Shield, Cpu, Activity, Clock, FileText, ChevronRight, 
  CheckCircle2, ArrowRight, LayoutDashboard, FolderKanban, 
  ShoppingCart, ClipboardCheck, BarChart3, FileBarChart, Bell, 
  Settings, Users, Phone, AlertTriangle, Globe, Send, MessageSquare, 
  Search, X, Grid, Layers, Menu, Download, Lock, ChevronDown, Plus, LogOut,
  Server, HardDrive, Zap, Wind, Power, ShieldAlert, FileSpreadsheet, ShieldCheck, Wallet, Compass
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

const pieColors = ['#10b981', '#f59e0b', '#ef4444'];

const AGENTS = [
  {
    id: 1,
    name: 'Specification & Quality Compliance Agent',
    icon: Shield,
    shortDesc: 'Checks BIM models and submittals against NEC, ASHRAE, and site standards.',
    longDesc: 'Automates parsing of engineering drawings, PDFs, and BIM metadata against international codes and site regulations to flag compliance deviations before construction.',
    bullets: [
      'Automated drawing parsing (PDF to CAD structure extraction)',
      'NEC, ASHRAE, and local code verification compliance check',
      'Real-time design deviation alerting for engineering review',
      'Auto-generation of non-compliance reports (NCRs)'
    ]
  },
  {
    id: 2,
    name: 'Predictive Schedule Risk Engine',
    icon: Clock,
    shortDesc: 'Forecasts project delays by analyzing lead times, weather, and contractor schedules.',
    longDesc: 'Utilizes multi-agent simulation of critical-path items, weather feeds, and supply chains to predict project completion dates and suggest schedule optimizations.',
    bullets: [
      'Critical-path timeline risk assessment',
      'Lead-time warning alarms for long-lead gear (chillers, transformers)',
      'Weather impact simulations (wind-shear limits on crane operations)',
      'Automated schedule mitigation action recommendations'
    ]
  },
  {
    id: 3,
    name: 'Supply Chain Visibility & Risk Agent',
    icon: Globe,
    shortDesc: 'Geospatial tracking of critical infrastructure across global suppliers.',
    longDesc: 'Integrates IoT trackers and carrier schedules to display active shipments of generators, switchgear, UPS systems, and cooling towers, flagging supplier risk index.',
    bullets: [
      'Geospatial live map plotting and ETA updates',
      'Supplier financial risk and shipping backlog tracking',
      'Custom alerts for transport delays',
      'Interactive transit route monitoring'
    ]
  },
  {
    id: 4,
    name: 'Commissioning Quality Assurance Copilot',
    icon: ClipboardCheck,
    shortDesc: 'Guides test sequences and captures certifications for TIA-942/BICSI standard compliance.',
    longDesc: 'Digitizes the TIA-942/BICSI/Uptime Tier level testing processes, offering guided test sequences for field engineers and secure electronic sign-off panels.',
    bullets: [
      'Standardized checklists for electrical, mechanical, and safety systems',
      'Step-by-step TIA-942 and BICSI compliance wizard',
      'Digital signature and tester sign-off logs',
      'Automated commissioning certificate generation'
    ]
  },
  {
    id: 5,
    name: 'Project Knowledge & RFI Intelligence Agent',
    icon: Search,
    shortDesc: 'RAG search over engineering documents to answer questions with citations.',
    longDesc: 'A semantic search assistant that answers complex contractor questions by indexing contracts, submittals, RFIs, and meeting minutes, providing direct document references.',
    bullets: [
      'Vector database search (RAG) over all project documentation',
      'Semantic Q&A engine with source document links and citations',
      'RFI template auto-filler using historical logs',
      'Multi-language support for international crew'
    ]
  }
];

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
    loading: contextLoading, 
    addRFI 
  } = useProjects();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('hero'); // 'hero', 'platform', 'agents', 'dashboard', 'monitoring', 'contact'
  
  // Custom Modals / Layout State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  
  // Login Form states
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

  // AI Agent Tab & Demo States
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  
  // Demo 1: Compliance
  const [complianceFile, setComplianceFile] = useState<string | null>(null);
  const [complianceChecking, setComplianceChecking] = useState(false);
  const [complianceResult, setComplianceResult] = useState<any | null>(null);
  
  // Demo 2: Schedule Risk
  const [selectedSchedulePhase, setSelectedSchedulePhase] = useState('Piling Foundations');
  const [scheduleRiskCalculating, setScheduleRiskCalculating] = useState(false);
  const [scheduleRiskResult, setScheduleRiskResult] = useState<any | null>(null);
  
  // Demo 3: Supply Chain
  const [supplySearchTerm, setSupplySearchTerm] = useState('UPS');
  const [supplyTrackingResult, setSupplyTrackingResult] = useState<any | null>(null);
  
  // Demo 4: Commissioning
  const [commChecklist, setCommChecklist] = useState([
    { id: 1, name: 'TIA-942 Electrical redundancy test', status: 'Pending' },
    { id: 2, name: 'BICSI Cabling structural verification', status: 'Pending' },
    { id: 3, name: 'Uptime Tier III cooling verification', status: 'Pending' }
  ]);
  const [commRunningId, setCommRunningId] = useState<number | null>(null);
  const [commSignerName, setCommSignerName] = useState('');
  const [commSignature, setCommSignature] = useState('');
  const [commSuccessMsg, setCommSuccessMsg] = useState('');
  
  // Demo 5: RFI Chat
  const [rfiChatQuery, setRfiChatQuery] = useState('');
  const [rfiChatLoading, setRfiChatLoading] = useState(false);
  const [rfiChatResponse, setRfiChatResponse] = useState<string | null>(null);
  const [rfiChatCitation, setRfiChatCitation] = useState<string | null>(null);

  // Live Shipments state (simulated real-time tracking)
  const [liveShipments, setLiveShipments] = useState([
    { id: 1, name: 'Caterpillar 2MW Diesel Generator', status: 'On-Time', progress: 42, speed: '62 km/h', location: 'Atlantic Ocean Transit', eta: '6 days' },
    { id: 2, name: 'York 500-Ton Centrifugal Chiller', status: 'At-Risk', progress: 85, speed: '12 km/h', location: 'Approaching Port of Dublin', eta: '1 day' },
    { id: 3, name: 'Eaton 500kVA Lithium-Ion UPS Systems', status: 'Delayed', progress: 12, speed: '0 km/h', location: 'Customs Warehouse Frankfurt', eta: '4 days' }
  ]);
  
  // Live alerts feed state
  const [liveAlerts, setLiveAlerts] = useState<string[]>([
    'System Alert: Rain forecast in Dublin may affect open foundation concrete cure on Pad 4.',
    'Logistics Monitor: UPS shipment has entered regional transit.',
    'QMS Compliance: Specification audit complete on switchgear layout. 0 severe warnings.'
  ]);

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactErrors, setContactErrors] = useState<any>({});
  const [contactSuccess, setContactSuccess] = useState(false);

  // Notifications bell contents
  const mockAlerts = [
    { id: 1, text: "UPS shipment delayed 4 days — Vendor: XYZ Power", type: "error" },
    { id: 2, text: "Specification variance flagged on Level 2 Cable Tray Layout", type: "warning" },
    { id: 3, text: "Concrete pour quality check pending at Pad 5", type: "info" }
  ];

  // Particles Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Section Loader effect
  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    
    // Auth Guard
    if ((sectionId === 'dashboard' || sectionId === 'monitoring') && !user) {
      setShowLoginModal(true);
      return;
    }
    
    setSectionLoading(true);
    setActiveSection(sectionId);
    setTimeout(() => {
      setSectionLoading(false);
    }, 1000); // 1-second shimmer loading effect
  };

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

  // Interval timer for live equipment shipment simulated telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveShipments(prev => {
        return prev.map(s => {
          if (s.id === 2) {
            // increment progress or jitter speed/eta slightly
            const deltaProgress = Math.random() > 0.4 ? 1 : 0;
            const newProgress = Math.min(s.progress + deltaProgress, 100);
            return {
              ...s,
              progress: newProgress,
              speed: newProgress === 100 ? '0 km/h' : `${Math.floor(Math.random() * 5 + 10)} km/h`,
              status: newProgress === 100 ? 'On-Time' : 'At-Risk',
              location: newProgress === 100 ? 'Delivered to Site Pad A' : 'Navigating Dublin Outer Bay'
            };
          }
          if (s.id === 1) {
            const deltaProgress = Math.random() > 0.5 ? 1 : 0;
            return {
              ...s,
              progress: Math.min(s.progress + deltaProgress, 95),
              speed: `${Math.floor(60 + (Math.random() * 6 - 3))} km/h`
            };
          }
          return s;
        });
      });

      // append a live alert occasionally
      if (Math.random() > 0.8) {
        const testAlerts = [
          `Dynamic Update: Generator ETA recalculated to ${Math.floor(Math.random() * 3 + 4)} days.`,
          `Sensor Update: Ambient temp at Dublin Pad 3 matches concrete cure tolerances.`,
          `System Log: RAG agent completed daily indexing of meeting minutes.`
        ];
        const randomAlert = testAlerts[Math.floor(Math.random() * testAlerts.length)];
        setLiveAlerts(prev => [randomAlert, ...prev.slice(0, 4)]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    let selectedRole: any = loginType;
    if (loginType === 'Enterprise') selectedRole = 'Engineer';
    
    const success = await login(loginEmail, selectedRole as any, loginEmail.split('@')[0]);
    if (success) {
      setShowLoginModal(false);
      handleNavClick('dashboard');
    } else {
      setLoginError('Invalid credentials or authentication error.');
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

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `RAG scan complete for "${userQuery}": Found compliance citation matching section 26 32 13 guidelines. Secondary containment tank requires 110% storage capacity. Structural concrete pad must support 4,500 psi loading.` 
      }]);
    }, 800);
  };

  // Demo 1: Compliance checker trigger
  const runComplianceCheck = (fileName: string) => {
    setComplianceFile(fileName);
    setComplianceChecking(true);
    setComplianceResult(null);
    setTimeout(() => {
      setComplianceChecking(false);
      setComplianceResult({
        status: 'Failed Specification Audit',
        issues: [
          { code: 'NEC 110.26', severity: 'Critical', detail: 'Minimum working space depth in front of MCC B is only 30 inches. Spec sheet calls for 36 inches minimum.' },
          { code: 'ASHRAE 90.4', severity: 'Warning', detail: 'Chilled water supply pipe thermal insulation thickness is 0.75" instead of 1.0" specified in project handbook.' }
        ]
      });
    }, 1500);
  };

  // Demo 2: Schedule delay trigger
  const runScheduleRisk = () => {
    setScheduleRiskCalculating(true);
    setScheduleRiskResult(null);
    setTimeout(() => {
      setScheduleRiskCalculating(false);
      let prob = 15;
      let notes = '';
      let mitigation = '';
      if (selectedSchedulePhase === 'Piling Foundations') {
        prob = 45;
        notes = 'High risk: Impending high-rainfall trend in regional zone may compromise soil consolidation rates.';
        mitigation = 'Deploy extra sheet-piling barriers and run pump sets continuously to keep water table below level.';
      } else if (selectedSchedulePhase === 'AHU Rigging') {
        prob = 32;
        notes = 'Medium risk: Seasonal wind speeds are approaching critical safety margins for high-crane assemblies.';
        mitigation = 'Coordinate dual crane setup or pre-book reserve morning slots when wind shear index is historically lowest.';
      } else if (selectedSchedulePhase === 'Commissioning') {
        prob = 18;
        notes = 'Low risk: Generator loads certified, but testing logs for TIA-942 compliance are awaiting review.';
        mitigation = 'Pre-schedule a QA coordinator checkout to log digital sign-off logs prior to major load step tests.';
      } else {
        prob = 22;
        notes = 'Low risk: Steel suppliers have shipped structures; logistics risk is localized to transport bottlenecks.';
        mitigation = 'Monitor truck tracking logs via Geospatial Visibility suite to optimize unloading times.';
      }
      setScheduleRiskResult({ probability: prob, notes, mitigation });
    }, 1000);
  };

  // Demo 3: Supply Chain Lookup
  const runSupplySearch = () => {
    let result = null;
    const cleanSearch = supplySearchTerm.toLowerCase();
    if (cleanSearch.includes('ups')) {
      result = {
        item: 'Eaton 500kVA Lithium-Ion UPS Systems',
        risk: 'Low',
        location: 'Customs Warehouse Frankfurt',
        eta: '4 days',
        shipmentNo: 'PO-2026-003',
        sensorTemp: '21.5°C (Stable)'
      };
    } else if (cleanSearch.includes('chiller') || cleanSearch.includes('cooling')) {
      result = {
        item: 'York 500-Ton Centrifugal Chiller',
        risk: 'High',
        location: 'Port of Dublin Customs Bay',
        eta: '1 day',
        shipmentNo: 'PO-2026-002',
        sensorTemp: '18.2°C (Vibration Normal)'
      };
    } else if (cleanSearch.includes('generator') || cleanSearch.includes('power')) {
      result = {
        item: 'Caterpillar 2MW Diesel Generator',
        risk: 'Medium',
        location: 'North Atlantic Route 4',
        eta: '6 days',
        shipmentNo: 'PO-2026-001',
        sensorTemp: '12.0°C (Ocean Air Cooling)'
      };
    } else {
      result = {
        item: `Generic Hardware - ${supplySearchTerm}`,
        risk: 'Medium',
        location: 'Central Logistics Depot',
        eta: '8 days',
        shipmentNo: 'PO-2026-099',
        sensorTemp: 'N/A'
      };
    }
    setSupplyTrackingResult(result);
  };

  // Demo 4: Run Commissioning Check
  const runCommissioningTest = (id: number) => {
    setCommRunningId(id);
    setTimeout(() => {
      setCommChecklist(prev => prev.map(item => item.id === id ? { ...item, status: 'Verified' } : item));
      setCommRunningId(null);
    }, 1200);
  };

  const handleCommissioningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSignerName || !commSignature) {
      setCommSuccessMsg("Error: Tester Name and Signature are required for sign-off.");
      return;
    }
    setCommSuccessMsg(`Commissioning certificate signed off by ${commSignerName}! Log registered on chain.`);
    setTimeout(() => setCommSuccessMsg(''), 4000);
  };

  // Demo 5: Ask RAG RFI Question
  const runRAGQuery = (questionText: string) => {
    setRfiChatQuery(questionText);
    setRfiChatLoading(true);
    setRfiChatResponse(null);
    setRfiChatCitation(null);
    setTimeout(() => {
      setRfiChatLoading(false);
      if (questionText.toLowerCase().includes('tank') || questionText.toLowerCase().includes('containment')) {
        setRfiChatResponse('Belly tanks require secondary concrete dikes of 110% volume capacity. Although tanks are double-walled, local Dublin environmental directive aquifer zone requires concrete block containment.');
        setRfiChatCitation('Specification Document: Section 23 11 13 - Facility Fuel Piping System (Page 14, Paragraph 4.2.1)');
      } else if (questionText.toLowerCase().includes('clearance') || questionText.toLowerCase().includes('transformer')) {
        setRfiChatResponse('The clearance path in front of MV transformer room B is currently 32 inches, violating NEC 110.26. Outward door hinges must be adjusted or room expanded to meet the 36-inch criteria.');
        setRfiChatCitation('National Electrical Code (NEC) Section 110.26(A)(1) Working Spaces');
      } else {
        setRfiChatResponse('Search indexed 2.4 million documents. Found similar RFI #104 context. Aluminum substitutes require approval from lead electrical design agent and are subject to 20% size load adjustments.');
        setRfiChatCitation('Project Guidelines Ref: Section 26 05 13 (Electrical Wiring Handbook)');
      }
    }, 1200);
  };

  // Contact Form Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};
    if (!contactName.trim()) errors.name = "Name is required";
    if (!contactEmail.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      errors.email = "Please enter a valid email address";
    }
    if (!contactCompany.trim()) errors.company = "Company is required";
    if (!contactMessage.trim()) errors.message = "Message is required";

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setContactErrors({});
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactCompany('');
    setContactMessage('');
  };

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    window.open(`http://127.0.0.1:8000/api/v1/reports/${format}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-animated-gradient text-slate-200 overflow-hidden flex font-sans">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* MOBILE NAVIGATION MENU (HAMBURGER EXPANDED) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-16 left-0 right-0 z-40 bg-slate-950/95 border-b border-slate-800/80 lg:hidden py-4 px-6 flex flex-col space-y-3"
            >
              {[
                { id: 'hero', label: 'Home' },
                { id: 'platform', label: 'Platform Overview' },
                { id: 'agents', label: 'AI Agents' },
                { id: 'dashboard', label: 'Dashboard Portal' },
                { id: 'monitoring', label: 'Real-Time Monitoring' },
                { id: 'contact', label: 'Contact Support' }
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "text-left py-2 px-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
                    activeSection === item.id 
                      ? "text-blue-400 bg-blue-500/10 border border-blue-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLLABLE VIEWPORT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative scroll-smooth bg-transparent">
          
          {/* Particles effect for Hero section when logged out */}
          {!user && activeSection === 'hero' && (
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            
            {/* Shimmer Skeleton Loading State */}
            {sectionLoading ? (
              <div className="space-y-8 animate-pulse py-12">
                <div className="h-8 bg-slate-800 rounded-lg w-1/3 shimmer"></div>
                <div className="h-4 bg-slate-800 rounded-lg w-1/2 shimmer"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                  <div className="h-48 bg-slate-800/40 rounded-2xl border border-slate-800 shimmer"></div>
                  <div className="h-48 bg-slate-800/40 rounded-2xl border border-slate-800 shimmer"></div>
                  <div className="h-48 bg-slate-800/40 rounded-2xl border border-slate-800 shimmer"></div>
                </div>
                <div className="h-64 bg-slate-800/20 rounded-2xl border border-slate-800 shimmer"></div>
              </div>
            ) : (
              <>
                
                {/* 1. HOME SECTION */}
                {activeSection === 'hero' && (
                  <div className="space-y-24">
                    <section id="hero" className="min-h-[70vh] flex flex-col xl:flex-row items-center justify-between gap-12 pt-8">
                      <div className="flex-1 space-y-8 text-center xl:text-left">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          <span>v3.2 Real-Time Monitoring Enabled</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                          Real-Time AI <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            EPC Intelligence
                          </span><br/>
                          Platform
                        </h1>
                        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mx-auto xl:mx-0">
                          An enterprise AI platform that consolidates BIM models, engineering drawings, RFIs, procurement, contracts, compliance, commissioning, logistics, predictive analytics, and digital infrastructure monitoring into one intelligent ecosystem.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 justify-center xl:justify-start">
                          <button 
                            onClick={() => handleNavClick('platform')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                          >
                            <span>Explore Platform</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          {!user && (
                            <button 
                              onClick={() => setShowLoginModal(true)}
                              className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-semibold rounded-lg transition-all cursor-pointer"
                            >
                              Log In to Workspace
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Interactive Display Badge */}
                      <div className="w-full max-w-md shrink-0 flex items-center justify-center">
                        <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 shadow-2xl relative overflow-hidden w-full space-y-6">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs font-mono text-cyan-400">TELEMETRY SCORE</span>
                            <span className="text-xs text-slate-500">REF: DUB-1</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                              <Bot className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-lg">AI Co-ordinator Active</h4>
                              <p className="text-xs text-slate-400">Project Dublin Hyperscale DC-1</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-400">Compliance Auditing</span>
                              <span className="text-cyan-400">99.8% Perfect</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full w-[99.8%]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Stat Strip */}
                    <section className="glass-premium rounded-2xl p-8 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
                      {[
                        { val: '15,000+', label: 'Equipment Line Items Tracked', desc: 'Real-time telemetry and PO status integration' },
                        { val: '67%', label: 'Fewer Schedule Overruns', desc: 'Predictive bottleneck warning system' },
                        { val: '200+', label: 'Contractors Coordinated', desc: 'Collaborative task and RFI assignments' }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left px-4 space-y-1">
                          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{item.val}</span>
                          <span className="text-sm font-bold text-white tracking-wide">{item.label}</span>
                          <span className="text-xs text-slate-400">{item.desc}</span>
                        </div>
                      ))}
                    </section>

                    {/* Preview grid of the 5 AI agents */}
                    <section className="space-y-6">
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white">Meet the AI Agents</h2>
                        <p className="text-sm text-slate-400">Click any card to explore their deep-dive functionality on the Agents page.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AGENTS.slice(0, 5).map((agent, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleNavClick('agents')}
                            className="glass-premium rounded-xl p-5 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                          >
                            <div className="space-y-4">
                              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg w-fit border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                <agent.icon className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-400 transition-colors">{agent.name}</h3>
                              <p className="text-xs text-slate-400 leading-relaxed">{agent.shortDesc}</p>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold mt-4">
                              <span>Learn & Interact</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* 2. PLATFORM OVERVIEW SECTION */}
                {activeSection === 'platform' && (
                  <div className="space-y-16">
                    <div className="border-b border-slate-800 pb-5">
                      <h1 className="text-3xl font-extrabold text-white">Platform Overview</h1>
                      <p className="text-sm text-slate-400">Next-generation orchestration for data centre Design, Procurement, and Construction.</p>
                    </div>

                    {/* Core Product Architecture Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                      {[
                        { step: '01', title: 'Data Ingestion Layer', desc: 'Consolidates engineering drawings (PDF/CAD), BIM metadata, contracts, procurement PO lists, schedules, and field inspection reports.' },
                        { step: '02', title: 'AI Agent Processing Layer', desc: 'Deploy specialized autonomous agents to process rules, run vector-based RAG searches, compute crane safety limitations, and forecast paths.' },
                        { step: '03', title: 'Enterprise Integration Layer', desc: 'Exposes actionable telemetry panels, downloads PDF certifications, writes database changes, and updates third-party ERP dashboards.' }
                      ].map((arch, i) => (
                        <div key={i} className="glass-premium rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-4 relative overflow-hidden">
                          <span className="absolute top-2 right-4 text-7xl font-extrabold text-slate-800/20 font-mono">{arch.step}</span>
                          <div>
                            <h3 className="font-bold text-white text-lg tracking-wide mb-2">{arch.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{arch.desc}</p>
                          </div>
                          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 w-1/3 rounded-full" />
                        </div>
                      ))}
                    </div>

                    {/* Data Flow Diagram (SVG and Styled Layout) */}
                    <div className="glass-premium rounded-2xl p-6 border border-slate-800/80">
                      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Unified EPC Intelligence Data Flow</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
                        
                        {/* Data Sources */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Raw Input Channels</h4>
                          {[
                            { name: 'BIM Models & CAD Drawings', icon: FileText, color: 'text-purple-400' },
                            { name: 'Supply Chain Shipping Invoices', icon: ShoppingCart, color: 'text-blue-400' },
                            { name: 'P6/Contractor Milestones', icon: Clock, color: 'text-emerald-400' },
                          ].map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3 text-left">
                              <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                              <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                            </div>
                          ))}
                        </div>

                        {/* Flow Arrows / SVG Line */}
                        <div className="hidden md:flex flex-col items-center justify-center h-full relative">
                          <div className="w-full flex items-center justify-center mb-6">
                            <span className="text-[10px] font-mono text-cyan-400 animate-pulse uppercase tracking-widest bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/10">INTEGRATING</span>
                          </div>
                          <svg className="w-full h-12" viewBox="0 0 100 20" fill="none">
                            <line x1="0" y1="10" x2="100" y2="10" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
                            <circle cx="50" cy="10" r="4" fill="#06b6d4" className="animate-ping" />
                          </svg>
                        </div>

                        {/* Intelligence Layer */}
                        <div className="p-5 bg-gradient-to-br from-blue-950/20 to-cyan-950/20 border border-blue-500/20 rounded-2xl flex flex-col items-center space-y-4">
                          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/30 text-blue-400">
                            <Bot className="w-8 h-8 animate-pulse" />
                          </div>
                          <h4 className="font-bold text-white text-sm">DataCentre AI Brain</h4>
                          <p className="text-xs text-slate-400 leading-normal">
                            Ingested records are vectorized, cached, and analyzed to auto-fill RFIs, audit standard compliance, and run scheduler calculations.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Technologies feature tiles */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">Suggested Core Technologies</h2>
                        <p className="text-sm text-slate-400">The underlying capabilities that fuel our digital infrastructure monitoring.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: 'Agentic Multi-Agent Systems', desc: 'Autonomous loops that assign tasks, verify spec checklists, and alert managers when tolerances diverge.' },
                          { title: 'RAG Over Technical Documents', desc: 'Semantic search indexing 1000+ page building codes and generator parameters to return cited answers.' },
                          { title: 'Computer Vision Layout Audits', desc: 'Auto-scan engineering layout plan sheets to detect spacing conflicts or code violations.' },
                          { title: 'Geospatial Shipping Monitors', desc: 'Tracks cargo carrier positions and matches real-time weather to calculate crane limits.' },
                          { title: 'Commissioning QMS Integration', desc: 'Guides test procedures step-by-step to capture sign-offs and auto-generate compliance logs.' },
                          { title: 'Predictive Analytics Engine', desc: 'Deep-learning timeline models predicting potential milestone bottleneck delays weeks in advance.' }
                        ].map((tech, idx) => (
                          <div key={idx} className="glass-premium rounded-xl p-5 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/30 transition-all duration-300">
                            <h4 className="font-bold text-white text-sm mb-2">{tech.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{tech.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. AI AGENTS SECTION */}
                {activeSection === 'agents' && (
                  <div className="space-y-12">
                    <div className="border-b border-slate-800 pb-5">
                      <h1 className="text-3xl font-extrabold text-white">AI Intelligence Modules</h1>
                      <p className="text-sm text-slate-400">Deploy and interact with dedicated agents guarding specific project dimensions.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Card Grid */}
                      <div className="lg:col-span-1 space-y-4">
                        {AGENTS.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            className={cn(
                              "w-full text-left p-5 rounded-2xl transition-all duration-200 border flex items-start gap-4 cursor-pointer",
                              selectedAgent === agent.id 
                                ? "bg-gradient-to-r from-blue-950/20 to-cyan-950/20 border-cyan-500/40 shadow-lg shadow-cyan-500/5 text-white"
                                : "glass-premium border-slate-800/80 text-slate-300 hover:border-slate-700"
                            )}
                          >
                            <div className={cn("p-2.5 rounded-lg border", selectedAgent === agent.id ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-slate-900 border-slate-800 text-slate-400")}>
                              <agent.icon className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-sm leading-tight">{agent.name}</h3>
                              <span className="text-[11px] text-slate-400 font-medium block">Click to open interactive demo</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right: Expandable/Interactive Detail View */}
                      <div className="lg:col-span-2">
                        {selectedAgent ? (
                          <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 space-y-6 relative min-h-[500px]">
                            {/* Selected Agent Data */}
                            {(() => {
                              const activeObj = AGENTS.find(a => a.id === selectedAgent)!;
                              return (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
                                      <activeObj.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h2 className="text-xl font-bold text-white leading-tight">{activeObj.name}</h2>
                                      <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">AGENT STATUS: READY</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Functional Overview</h4>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{activeObj.longDesc}</p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Capabilities list */}
                                    <div className="space-y-3">
                                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Capabilities</h4>
                                      <ul className="space-y-2">
                                        {activeObj.bullets.map((bullet, index) => (
                                          <li key={index} className="flex items-start gap-2 text-xs text-slate-400">
                                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            <span>{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* MOCK INTERACTIVE DEMO CONTAINER */}
                                    <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col justify-between space-y-4">
                                      <div>
                                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Live Interactive Demo</h4>
                                        
                                        {/* Demo 1: Compliance Scanner */}
                                        {selectedAgent === 1 && (
                                          <div className="space-y-3">
                                            <p className="text-[11px] text-slate-400 leading-normal">
                                              Select a drawing sheet or submittal to run standard design code audit.
                                            </p>
                                            
                                            <div className="flex gap-2">
                                              <button 
                                                onClick={() => runComplianceCheck('MCC_Room_Layout_v2.pdf')}
                                                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-white cursor-pointer"
                                              >
                                                MCC_Room_Layout_v2.pdf
                                              </button>
                                              <button 
                                                onClick={() => runComplianceCheck('HVAC_Spec_Section_23.pdf')}
                                                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-white cursor-pointer"
                                              >
                                                HVAC_Spec_Section_23.pdf
                                              </button>
                                            </div>

                                            {complianceChecking && (
                                              <div className="flex items-center gap-2 text-xs text-cyan-400">
                                                <Activity className="w-4 h-4 animate-spin" />
                                                <span>Auditing code compliance...</span>
                                              </div>
                                            )}

                                            {complianceResult && (
                                              <div className="space-y-2 p-3 bg-red-950/10 border border-red-500/20 rounded-lg">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                                                  <AlertTriangle className="w-3.5 h-3.5" />
                                                  <span>{complianceResult.status}</span>
                                                </div>
                                                <div className="space-y-1">
                                                  {complianceResult.issues.map((iss: any, idx: number) => (
                                                    <div key={idx} className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-900 pt-1">
                                                      <strong className="text-slate-300">{iss.code}:</strong> {iss.detail}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Demo 2: Schedule Delay Calculator */}
                                        {selectedAgent === 2 && (
                                          <div className="space-y-3">
                                            <p className="text-[11px] text-slate-400 leading-normal">
                                              Select a path phase to compute potential delay probability.
                                            </p>
                                            
                                            <div className="flex gap-2">
                                              <select 
                                                value={selectedSchedulePhase} 
                                                onChange={(e) => setSelectedSchedulePhase(e.target.value)}
                                                className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 text-slate-300 focus:outline-none"
                                              >
                                                <option value="Piling Foundations">Piling Foundations</option>
                                                <option value="AHU Rigging">AHU Rigging</option>
                                                <option value="Commissioning">Commissioning</option>
                                              </select>
                                              <button 
                                                onClick={runScheduleRisk}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white cursor-pointer"
                                              >
                                                Forecast Risk
                                              </button>
                                            </div>

                                            {scheduleRiskCalculating && (
                                              <div className="flex items-center gap-2 text-xs text-cyan-400">
                                                <Activity className="w-4 h-4 animate-spin" />
                                                <span>Running Monte Carlo forecast...</span>
                                              </div>
                                            )}

                                            {scheduleRiskResult && (
                                              <div className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                                                <div className="flex justify-between items-center text-xs">
                                                  <span className="text-slate-400">Delay Prob:</span>
                                                  <span className={cn("font-bold", scheduleRiskResult.probability > 30 ? "text-red-400" : "text-emerald-400")}>
                                                    {scheduleRiskResult.probability}%
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-800 pt-1">
                                                  <strong className="text-slate-300">Observation:</strong> {scheduleRiskResult.notes}
                                                </p>
                                                <p className="text-[10px] text-cyan-400 leading-relaxed">
                                                  <strong className="text-slate-300">Mitigation:</strong> {scheduleRiskResult.mitigation}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Demo 3: Supply Chain Search */}
                                        {selectedAgent === 3 && (
                                          <div className="space-y-3">
                                            <p className="text-[11px] text-slate-400 leading-normal">
                                              Query tracking status for key infrastructure gear (UPS, Generator, Chiller).
                                            </p>
                                            
                                            <div className="flex gap-2">
                                              <input 
                                                type="text" 
                                                value={supplySearchTerm}
                                                onChange={(e) => setSupplySearchTerm(e.target.value)}
                                                placeholder="e.g. UPS" 
                                                className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 text-slate-300 focus:outline-none w-28"
                                              />
                                              <button 
                                                onClick={runSupplySearch}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white cursor-pointer"
                                              >
                                                Query IoT
                                              </button>
                                            </div>

                                            {supplyTrackingResult && (
                                              <div className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                                                <div><strong className="text-slate-300">Item:</strong> <span className="text-slate-400">{supplyTrackingResult.item}</span></div>
                                                <div className="flex justify-between border-t border-slate-800 pt-1">
                                                  <span className="text-slate-400">Risk Factor:</span>
                                                  <span className={cn("font-bold", supplyTrackingResult.risk === 'High' ? "text-red-400" : "text-emerald-400")}>{supplyTrackingResult.risk}</span>
                                                </div>
                                                <div className="border-t border-slate-800 pt-1"><strong className="text-slate-300">Pos:</strong> <span className="text-slate-400">{supplyTrackingResult.location}</span></div>
                                                <div className="flex justify-between border-t border-slate-800 pt-1">
                                                  <span className="text-slate-400">ETA:</span>
                                                  <span className="text-cyan-400 font-medium">{supplyTrackingResult.eta}</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Demo 4: Commissioning Wizard & Sign-off */}
                                        {selectedAgent === 4 && (
                                          <div className="space-y-4">
                                            <p className="text-[11px] text-slate-400 leading-normal">
                                              Guide and certify field test sequences.
                                            </p>
                                            
                                            <div className="space-y-2">
                                              {commChecklist.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-900/60 border border-slate-855 rounded-lg">
                                                  <span className="text-[10px] text-slate-300">{item.name}</span>
                                                  {item.status === 'Verified' ? (
                                                    <span className="text-[10px] font-bold text-emerald-400">Verified</span>
                                                  ) : commRunningId === item.id ? (
                                                    <span className="text-[10px] text-cyan-400 animate-pulse">Testing...</span>
                                                  ) : (
                                                    <button 
                                                      onClick={() => runCommissioningTest(item.id)}
                                                      className="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded cursor-pointer"
                                                    >
                                                      Run Check
                                                    </button>
                                                  )}
                                                </div>
                                              ))}
                                            </div>

                                            <form onSubmit={handleCommissioningSubmit} className="space-y-2 border-t border-slate-800 pt-3">
                                              <div className="flex gap-2">
                                                <input 
                                                  required 
                                                  type="text" 
                                                  value={commSignerName}
                                                  onChange={(e) => setCommSignerName(e.target.value)}
                                                  placeholder="Tester Name" 
                                                  className="bg-slate-900 border border-slate-800 rounded-lg text-[10px] px-2 py-1.5 text-slate-300 focus:outline-none w-1/2"
                                                />
                                                <input 
                                                  required 
                                                  type="text" 
                                                  value={commSignature}
                                                  onChange={(e) => setCommSignature(e.target.value)}
                                                  placeholder="Digital Signature" 
                                                  className="bg-slate-900 border border-slate-800 rounded-lg text-[10px] px-2 py-1.5 text-slate-300 focus:outline-none w-1/2"
                                                />
                                              </div>
                                              <button 
                                                type="submit"
                                                className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold text-white cursor-pointer"
                                              >
                                                Sign Off Commissioning
                                              </button>
                                            </form>

                                            {commSuccessMsg && (
                                              <p className={cn("text-[10px] font-semibold text-center mt-2", commSuccessMsg.includes('Error') ? 'text-red-400' : 'text-emerald-400')}>
                                                {commSuccessMsg}
                                              </p>
                                            )}
                                          </div>
                                        )}

                                        {/* Demo 5: RFI Chat */}
                                        {selectedAgent === 5 && (
                                          <div className="space-y-3">
                                            <p className="text-[11px] text-slate-400 leading-normal">
                                              Submit contractor queries to vector database.
                                            </p>
                                            
                                            <div className="flex gap-1.5 flex-wrap">
                                              <button 
                                                onClick={() => runRAGQuery('Capacity requirements for generator belly tanks')}
                                                className="text-[9px] bg-slate-900 hover:bg-slate-850 px-2 py-1 rounded text-slate-300 border border-slate-800 text-left cursor-pointer"
                                              >
                                                "Generator belly tank capacity"
                                              </button>
                                              <button 
                                                onClick={() => runRAGQuery('What is the code clearance in front of MV transformer?')}
                                                className="text-[9px] bg-slate-900 hover:bg-slate-850 px-2 py-1 rounded text-slate-300 border border-slate-800 text-left cursor-pointer"
                                              >
                                                "NEC clearance MV transformer"
                                              </button>
                                            </div>

                                            <div className="flex gap-1.5 mt-2">
                                              <input 
                                                type="text" 
                                                value={rfiChatQuery}
                                                onChange={(e) => setRfiChatQuery(e.target.value)}
                                                placeholder="Ask compliance queries..." 
                                                className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-2 py-1.5 text-slate-300 focus:outline-none flex-1"
                                              />
                                              <button 
                                                onClick={() => runRAGQuery(rfiChatQuery)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white cursor-pointer"
                                              >
                                                Search
                                              </button>
                                            </div>

                                            {rfiChatLoading && (
                                              <div className="flex items-center gap-2 text-xs text-cyan-400">
                                                <Activity className="w-4 h-4 animate-spin" />
                                                <span>Running semantic lookup...</span>
                                              </div>
                                            )}

                                            {rfiChatResponse && (
                                              <div className="space-y-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px]">
                                                <p className="text-slate-300 leading-normal">{rfiChatResponse}</p>
                                                {rfiChatCitation && (
                                                  <p className="text-[10px] text-cyan-400 italic border-t border-slate-800 pt-1">
                                                    {rfiChatCitation}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <span className="text-[9px] text-slate-500 block text-right font-mono">EPC COGNITIVE RUNTIME</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4 min-h-[500px]">
                            <Bot className="w-16 h-16 text-slate-500 animate-bounce" />
                            <h3 className="font-bold text-white text-lg">Interactive Agent Sandboxes</h3>
                            <p className="text-xs text-slate-400 max-w-sm">
                              Select an AI Agent module from the left panel to read specifications, audit operational models, and access live functional demos.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DASHBOARD SECTION (AUTH GUARDED) */}
                {activeSection === 'dashboard' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-5">
                      <div>
                        <h1 className="text-3xl font-extrabold text-white">Project Dublin Telemetry</h1>
                        <p className="text-sm text-slate-400">Active design-to-commissioning status indicators.</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                        Overall Health: {kpis.aiHealthScore}%
                      </span>
                    </div>

                    {/* Milestone Progress Bars */}
                    <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 space-y-6">
                      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Critical Path Phase Timeline</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { name: 'Engineering & Layout Review', progress: 100, color: 'bg-green-500' },
                          { name: 'Procurement (Long Lead Gear)', progress: 85, color: 'bg-blue-500' },
                          { name: 'Pad & Foundation Civil Works', progress: 70, color: 'bg-blue-500' },
                          { name: 'Mechanical & Power Fitout', progress: 42, color: 'bg-cyan-500' },
                          { name: 'Commissioning & Certification', progress: 18, color: 'bg-cyan-500' }
                        ].map((milestone, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs sm:text-sm font-medium">
                              <span className="text-slate-300">{milestone.name}</span>
                              <span className="text-slate-400">{milestone.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", milestone.color)} style={{ width: `${milestone.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Open RFIs', value: '4', icon: MessageSquare, color: 'text-amber-400' },
                        { label: 'Non-Conformance Issues (NCR)', value: '2', icon: ShieldAlert, color: 'text-red-400' },
                        { label: 'At-Risk Supply Shipments', value: '1', icon: ShoppingCart, color: 'text-rose-400' },
                        { label: 'Commissioning Runs Completed', value: '12 / 48', icon: ClipboardCheck, color: 'text-emerald-400' }
                      ].map((card, i) => (
                        <div key={i} className="glass-premium rounded-xl p-5 border border-slate-800/80 flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-lg text-slate-400">
                            <card.icon className={cn("w-6 h-6", card.color)} />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-white block">{card.value}</span>
                            <span className="text-xs text-slate-400 font-medium">{card.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recharts chart: Schedule Risk Trend */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 glass-premium rounded-2xl p-6 border border-slate-800/80">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Schedule Risk Trend (8 Weeks)</h3>
                        <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { name: 'Week 1', RiskFactor: 15, RFIs: 2 },
                              { name: 'Week 2', RiskFactor: 18, RFIs: 3 },
                              { name: 'Week 3', RiskFactor: 28, RFIs: 8 },
                              { name: 'Week 4', RiskFactor: 35, RFIs: 12 },
                              { name: 'Week 5', RiskFactor: 42, RFIs: 15 },
                              { name: 'Week 6', RiskFactor: 30, RFIs: 9 },
                              { name: 'Week 7', RiskFactor: 22, RFIs: 5 },
                              { name: 'Week 8', RiskFactor: 18, RFIs: 4 }
                            ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                              <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
                              <Area type="monotone" dataKey="RiskFactor" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRisk)" name="Risk Index" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Action items from AI advisor */}
                      <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">AI Advisor Actions</h3>
                        
                        <div className="flex-1 space-y-4">
                          <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Urgent</span>
                            <p className="text-xs text-slate-300 font-semibold leading-normal">Resolve NEC clearance violation at MCC B layout.</p>
                          </div>
                          
                          <div className="p-3 bg-amber-950/10 border border-amber-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Warning</span>
                            <p className="text-xs text-slate-300 font-semibold leading-normal">York Chiller PO is entering Dublin customs. Verify unloading space.</p>
                          </div>

                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task</span>
                            <p className="text-xs text-slate-300 font-semibold leading-normal">Assign Cabling structural checkout to Alex Mercer.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MONITORING SECTION (AUTH GUARDED & LIVE FEEDING) */}
                {activeSection === 'monitoring' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-5">
                      <div>
                        <h1 className="text-3xl font-extrabold text-white">Real-Time Telemetry</h1>
                        <p className="text-sm text-slate-400">Live-updating supplier shipments and active commissioning tests.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">FEED ACTIVE</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Shipments list */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 space-y-5">
                          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Critical Equipment Supply Shipments</h3>
                          
                          <div className="space-y-4">
                            {liveShipments.map((shipment) => (
                              <div key={shipment.id} className="p-4 bg-slate-900/60 border border-slate-855 rounded-xl space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                      <Server className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h4 className="text-xs sm:text-sm font-bold text-white leading-normal">{shipment.name}</h4>
                                      <span className="text-[10px] text-slate-500 block">Loc: {shipment.location}</span>
                                    </div>
                                  </div>
                                  <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                    shipment.status === 'On-Time' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    shipment.status === 'At-Risk' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                  )}>
                                    {shipment.status}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Transit Progress</span>
                                    <span>{shipment.progress}% completed (ETA: {shipment.eta})</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-955 rounded-full overflow-hidden">
                                    <div className={cn(
                                      "h-full rounded-full",
                                      shipment.status === 'On-Time' ? 'bg-green-500' :
                                      shipment.status === 'At-Risk' ? 'bg-amber-500' : 'bg-red-500'
                                    )} style={{ width: `${shipment.progress}%` }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Live Alerts scrolling feed & active tests list */}
                      <div className="space-y-6">
                        
                        {/* Live alert scrolling */}
                        <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between h-80">
                          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Event Streams</h3>
                          
                          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
                            {liveAlerts.map((alert, index) => (
                              <div key={index} className="text-[11px] text-slate-400 leading-relaxed border-l-2 border-cyan-500/60 pl-2.5">
                                {alert}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Commissioning checkouts */}
                        <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 space-y-4">
                          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Active Commissioning Loops</h3>
                          
                          <div className="space-y-3">
                            {commissioningItems.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-900/60 border border-slate-855 rounded-xl">
                                <div>
                                  <span className="text-[11px] font-bold text-slate-200 block">{item.component_name}</span>
                                  <span className="text-[9px] text-slate-500">{item.system_name} System</span>
                                </div>
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-bold border",
                                  item.status === 'Tested' || item.status === 'Certified' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  item.status === 'InProgress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                  'bg-slate-955 text-slate-500 border-slate-800'
                                )}>
                                  {item.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CONTACT SECTION */}
                {activeSection === 'contact' && (
                  <div className="space-y-12">
                    <div className="border-b border-slate-800 pb-5">
                      <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
                      <p className="text-sm text-slate-400">Reach out to our engineering support coordinator team.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: contact info */}
                      <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 space-y-6">
                        <div>
                          <h3 className="font-bold text-white text-base mb-2">Corporate Headquarters</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            DataCentre AI Technologies Ltd<br/>
                            Level 4, Grand Canal Quay<br/>
                            Dublin 2, Ireland
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-base mb-2">Technical Assistance</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Email: support@datacentre.ai<br/>
                            Phone: +353 (1) 402-9900<br/>
                            Hours: 24/7 Enterprise Tier support
                          </p>
                        </div>
                      </div>

                      {/* Right: Contact Form */}
                      <div className="lg:col-span-2">
                        <div className="glass-premium rounded-2xl p-6 border border-slate-800/80 relative">
                          <form onSubmit={handleContactSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                                <input 
                                  type="text" 
                                  value={contactName}
                                  onChange={(e) => setContactName(e.target.value)}
                                  placeholder="Jane Doe" 
                                  className={cn(
                                    "w-full bg-slate-900 border text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200 transition-all",
                                    contactErrors.name ? "border-red-500" : "border-slate-800"
                                  )}
                                />
                                {contactErrors.name && (
                                  <span className="text-[10px] text-red-400 block mt-1">{contactErrors.name}</span>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                                <input 
                                  type="text" 
                                  value={contactEmail}
                                  onChange={(e) => setContactEmail(e.target.value)}
                                  placeholder="jane@company.com" 
                                  className={cn(
                                    "w-full bg-slate-900 border text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200 transition-all",
                                    contactErrors.email ? "border-red-500" : "border-slate-800"
                                  )}
                                />
                                {contactErrors.email && (
                                  <span className="text-[10px] text-red-400 block mt-1">{contactErrors.email}</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company Name</label>
                              <input 
                                type="text" 
                                value={contactCompany}
                                onChange={(e) => setContactCompany(e.target.value)}
                                placeholder="Apex Construction Inc" 
                                className={cn(
                                  "w-full bg-slate-900 border text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200 transition-all",
                                  contactErrors.company ? "border-red-500" : "border-slate-800"
                                )}
                              />
                              {contactErrors.company && (
                                <span className="text-[10px] text-red-400 block mt-1">{contactErrors.company}</span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Message detail</label>
                              <textarea 
                                rows={5}
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder="How can we assist your technical planning teams?" 
                                className={cn(
                                  "w-full bg-slate-900 border text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200 transition-all resize-none",
                                  contactErrors.message ? "border-red-500" : "border-slate-800"
                                )}
                              />
                              {contactErrors.message && (
                                <span className="text-[10px] text-red-400 block mt-1">{contactErrors.message}</span>
                              )}
                            </div>

                            <button 
                              type="submit"
                              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                            >
                              Submit Ticket
                            </button>
                          </form>

                          {/* Contact Success Overlay Modal */}
                          <AnimatePresence>
                            {contactSuccess && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#020617]/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-4"
                              >
                                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                                <h3 className="text-xl font-bold text-white">Ticket Submitted Successfully!</h3>
                                <p className="text-xs text-slate-400 max-w-sm">
                                  Thank you for contacting support. An engineering coordinator has been assigned to your ticket and will respond via email shortly.
                                </p>
                                <button 
                                  onClick={() => setContactSuccess(false)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                                >
                                  Close
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. REPORTS & EXPORT SECTION (ADDITIONAL WORKSPACE FROM ORIGINAL SIDEBAR) */}
                {activeSection === 'reports' && (
                  <section id="reports" className="space-y-6">
                    <div className="border-b border-slate-800 pb-5">
                      <h2 className="text-2xl font-bold text-white">Export & Reports</h2>
                      <p className="text-sm text-slate-400">Download formatted files representing physical parameters, audits, and schedules.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Compliance Report (PDF)', desc: 'Full standard compliance certificate containing standard validations.', format: 'pdf', icon: FileSpreadsheet, color: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400' },
                        { label: 'Procurement Summary (Excel)', desc: 'Excel spreadsheet containing switchgear, generators, and UPS PO details.', format: 'excel', icon: FileSpreadsheet, color: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400' },
                        { label: 'Schedule Risk Data (CSV)', desc: 'Raw CSV structure containing predicted milestones and variance parameters.', format: 'csv', icon: FileText, color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400' },
                      ].map((rep, i) => (
                        <div key={i} className={cn("glass-premium rounded-2xl p-6 border flex flex-col justify-between bg-gradient-to-br", rep.color)}>
                          <div>
                            <rep.icon className="w-8 h-8 mb-4" />
                            <h3 className="font-bold text-white text-base mb-2">{rep.label}</h3>
                            <p className="text-xs text-slate-400 mb-6">{rep.desc}</p>
                          </div>
                          <button 
                            onClick={() => handleDownload(rep.format as any)}
                            className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer"
                          >
                            Download File
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* FOOTER */}
                <footer className="pt-20 pb-8 border-t border-slate-850 mt-20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                          <Grid className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-sm text-white tracking-tight">DataCentre AI</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        The world's leading AI-powered EPC intelligence platform for mission-critical digital infrastructure.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Platform</h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">AI Agents</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Security Policy</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Resources</h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">API Reference</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Case Studies</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Company</h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-855 text-[10px] text-slate-500">
                    <p>&copy; 2026 DataCentre AI. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                      <a href="#" className="hover:text-white transition-colors">Twitter</a>
                      <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                      <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                  </div>
                </footer>
                
              </>
            )}

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
              className="absolute bottom-16 right-0 w-80 sm:w-96 glass-premium rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col overflow-hidden bg-slate-950/95"
              style={{ height: '480px' }}
            >
              {/* Header */}
              <div className="bg-slate-950 border-b border-slate-800/80 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs sm:text-sm">EPC Copilot</h3>
                    <p className="text-[10px] text-slate-500">Agent Active</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-850 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Msg logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#020617]/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed", 
                      msg.role === 'user' 
                        ? "bg-blue-600 text-white rounded-tr-sm" 
                        : "bg-slate-955 text-slate-200 border border-slate-800 rounded-tl-sm shadow-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="p-3 bg-slate-955 border-t border-slate-800/80">
                <form onSubmit={handleChatSubmit} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about RFIs, compliance rules..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim()}
                    className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {chatOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* MODAL: MOCK AUTHENTICATION MODAL */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-premium rounded-2xl border border-slate-850 p-6 shadow-2xl space-y-4 relative bg-slate-950/95"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">EPC Portal Login</h3>
                <p className="text-xs text-slate-400">Log in to view secure telemetry and QMS records.</p>
              </div>

              <div className="flex p-1 space-x-1 bg-slate-900 rounded-lg border border-slate-850">
                {(['Enterprise', 'Client', 'Admin'] as const).map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => {
                      setLoginType(type);
                      setLoginEmail(type === 'Enterprise' ? 'engineer@datacentre.ai' : type === 'Client' ? 'client@datacentre.ai' : 'admin@datacentre.ai');
                    }}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                      loginType === type ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="engineer@datacentre.ai"
                      className="w-full bg-slate-900 border border-slate-800 text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Password</label>
                    <input 
                      required 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-900 border border-slate-800 text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 text-slate-200" 
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-[10px] text-red-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 cursor-pointer"
                >
                  Authenticate Session
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple Calendar component fallback or mock definitions since we only need the icon.
function Calendar(props: any) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

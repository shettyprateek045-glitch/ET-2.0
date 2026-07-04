"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useProjects, PurchaseOrder, CommissioningItem } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Server, Activity, ShieldAlert, Cpu, Heart, Check, Clock, User, Award, CheckSquare, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '../../components/Modal';

export default function MonitoringPage() {
  const { user } = useAuth();
  const { purchaseOrders, commissioningItems, signCommissioning, refreshData } = useProjects();
  
  const [liveAlerts, setLiveAlerts] = useState<string[]>([
    'System Alert: Rain forecast in Dublin may affect open foundation concrete cure on Pad 4.',
    'Logistics Monitor: UPS shipment has entered regional transit.',
    'QMS Compliance: Specification audit complete on switchgear layout. 0 severe warnings.'
  ]);

  // Signoff modal states
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CommissioningItem | null>(null);
  const [testerName, setTesterName] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [signError, setSignError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate live shipments by mapping purchase orders
  const liveShipments = purchaseOrders.map(po => {
    let progress = 10;
    if (po.status === 'Approved') progress = 35;
    else if (po.status === 'Shipped') progress = 75;
    else if (po.status === 'Delivered') progress = 100;

    let status = 'On-Time';
    if (po.supplier_risk === 'High' && po.status !== 'Delivered') {
      status = 'At-Risk';
    }
    if (po.tracking_status.toLowerCase().includes('delayed') || po.tracking_status.toLowerCase().includes('backlog')) {
      status = 'Delayed';
    }

    let speed = '0 km/h';
    if (po.status === 'Shipped') speed = '58 km/h';
    else if (po.status === 'Approved') speed = '0 km/h (Factory FAT)';

    let eta = 'N/A';
    if (po.delivery_date) {
      const diff = new Date(po.delivery_date).getTime() - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      eta = days > 0 ? `${days} days` : 'Delivered';
    }

    return {
      id: po.id,
      name: po.item_name,
      status: status,
      progress: progress,
      speed: speed,
      location: po.tracking_status,
      eta: eta
    };
  });

  useEffect(() => {
    // Generate scrolling feed events periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const testAlerts = [
          `Dynamic Update: Equipment ETA recalculated for active transport systems.`,
          `Sensor Update: Ambient temp at Dublin Pad 3 matches concrete cure tolerances.`,
          `System Log: RAG agent completed daily indexing of specification documents.`,
          `Logistics Monitor: Customs clearance achieved for UPS lithium battery systems.`
        ];
        const randomAlert = testAlerts[Math.floor(Math.random() * testAlerts.length)];
        setLiveAlerts(prev => [randomAlert, ...prev.slice(0, 4)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenSignModal = (item: CommissioningItem) => {
    setActiveItem(item);
    setTesterName(user?.full_name || '');
    setSignatureText('');
    setSignError('');
    setSignModalOpen(true);
  };

  const handleSignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testerName || !signatureText) {
      setSignError("All authorization fields are required");
      return;
    }
    if (!activeItem) return;

    setIsSubmitting(true);
    await signCommissioning(activeItem.id, testerName, signatureText);
    setIsSubmitting(false);
    setSignModalOpen(false);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 text-purple-950">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-purple-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-purple-900">Real-Time Telemetry</h1>
          <p className="text-sm text-purple-600">Live-updating supplier shipments and active commissioning checklists.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono text-green-700 uppercase tracking-widest font-semibold">FEED ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Shipments list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-5">
            <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Critical Equipment Supply Shipments</h3>
            
            <div className="space-y-4">
              {liveShipments.length > 0 ? (
                liveShipments.map((shipment) => (
                  <div key={shipment.id} className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-3 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-purple-900 leading-normal">{shipment.name}</h4>
                          <span className="text-[10px] text-purple-500 block">Loc: {shipment.location}</span>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        shipment.status === 'On-Time' ? 'bg-green-100 text-green-700 border-green-200' :
                        shipment.status === 'At-Risk' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      )}>
                        {shipment.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-purple-600 font-medium">
                        <span>Transit Progress - {shipment.speed}</span>
                        <span>{shipment.progress}% completed (ETA: {shipment.eta})</span>
                      </div>
                      <div className="h-2 w-full bg-purple-200 rounded-full overflow-hidden">
                        <div className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          shipment.status === 'On-Time' ? 'bg-green-500' :
                          shipment.status === 'At-Risk' ? 'bg-amber-500' : 'bg-red-500'
                        )} style={{ width: `${shipment.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-purple-400 text-center py-8">No equipment tracking shipments registered. Create a purchase order to initialize tracking.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Event scrolling & Commissioning items */}
        <div className="space-y-6">
          
          {/* Scrolling Alerts feed */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between h-80">
            <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-4">Event Streams</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
              {liveAlerts.map((alert, index) => (
                <div key={index} className="text-xs text-purple-700 leading-relaxed border-l-2 border-cyan-500 pl-3 py-1 bg-cyan-50/50 rounded-r-md">
                  {alert}
                </div>
              ))}
            </div>
          </div>

          {/* Commissioning Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Active Commissioning Loops</h3>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {commissioningItems.length > 0 ? (
                commissioningItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-purple-50 border border-purple-100 rounded-xl gap-2">
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">{item.component_name}</span>
                      <span className="text-[10px] text-purple-650">{item.system_name} Subsystem</span>
                      {item.status === 'Certified' && item.tester_name && (
                        <span className="text-[9px] text-green-650 block mt-0.5 font-medium">Certified by {item.tester_name}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
                        item.status === 'Certified' ? 'bg-green-100 text-green-700 border-green-200' :
                        item.status === 'Tested' ? 'bg-green-50 text-green-650 border-green-200' :
                        item.status === 'InProgress' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      )}>
                        {item.status}
                      </span>
                      
                      {/* Sign off for Engineers / PMs / Admins */}
                      {item.status !== 'Certified' && (user?.role === 'Admin' || user?.role === 'Project Manager' || user?.role === 'Engineer') && (
                        <button
                          onClick={() => handleOpenSignModal(item)}
                          className="px-2 py-0.5 bg-purple-750 hover:bg-purple-850 text-white text-[9px] font-bold rounded cursor-pointer transition-colors"
                        >
                          Sign Cert
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-purple-400 text-center py-6">No commissioning checklist items loaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Authorization Modal */}
      <Modal isOpen={signModalOpen} onClose={() => setSignModalOpen(false)} title="Sign Commissioning Certificate">
        <form onSubmit={handleSignSubmit} className="space-y-4 p-2 text-purple-900">
          <div className="flex items-start gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
            <Award className="w-5 h-5 text-purple-750 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-purple-900">Subsystem Commissioning sign-off</h4>
              <p className="text-[10px] text-purple-650 leading-relaxed mt-0.5">
                Signing off: {activeItem?.component_name} ({activeItem?.system_name}). Confirming functional verification compliant with TIA-942 engineering standards.
              </p>
            </div>
          </div>

          {signError && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-lg font-medium">
              {signError}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1.5">Tester Name (Authorized Engineer)</label>
            <input
              type="text"
              required
              placeholder="Sarah Connor"
              value={testerName}
              onChange={e => setTesterName(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-950 font-semibold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1.5">Digital Signature (Draw or Type initials)</label>
            <input
              type="text"
              required
              placeholder="S. Connor, P.Eng"
              value={signatureText}
              onChange={e => setSignatureText(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-xl text-xs focus:outline-none focus:border-purple-600 text-purple-950 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-750 hover:bg-purple-850 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...</>
            ) : (
              <><Award className="w-4 h-4" /> Authorize Certification</>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}

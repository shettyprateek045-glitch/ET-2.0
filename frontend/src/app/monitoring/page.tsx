"use client";

import React, { useState, useEffect } from 'react';
import { Server, Activity, ShieldAlert, Cpu, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MonitoringPage() {
  const [liveShipments, setLiveShipments] = useState([
    { id: 1, name: 'Caterpillar 2MW Diesel Generator', status: 'On-Time', progress: 42, speed: '62 km/h', location: 'Atlantic Ocean Transit', eta: '6 days' },
    { id: 2, name: 'York 500-Ton Centrifugal Chiller', status: 'At-Risk', progress: 85, speed: '12 km/h', location: 'Approaching Port of Dublin', eta: '1 day' },
    { id: 3, name: 'Eaton 500kVA Lithium-Ion UPS Systems', status: 'Delayed', progress: 12, speed: '0 km/h', location: 'Customs Warehouse Frankfurt', eta: '4 days' }
  ]);

  const [liveAlerts, setLiveAlerts] = useState<string[]>([
    'System Alert: Rain forecast in Dublin may affect open foundation concrete cure on Pad 4.',
    'Logistics Monitor: UPS shipment has entered regional transit.',
    'QMS Compliance: Specification audit complete on switchgear layout. 0 severe warnings.'
  ]);

  const commissioningItems = [
    { id: 1, component_name: 'Generator 1', system_name: 'Power', status: 'InProgress' },
    { id: 2, component_name: 'Chiller Loop A', system_name: 'Cooling', status: 'Tested' },
    { id: 3, component_name: 'UPS Battery Bank', system_name: 'Power', status: 'Pending' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveShipments(prev => {
        return prev.map(s => {
          if (s.id === 2) {
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

      if (Math.random() > 0.6) {
        const testAlerts = [
          `Dynamic Update: Generator ETA recalculated to ${Math.floor(Math.random() * 3 + 4)} days.`,
          `Sensor Update: Ambient temp at Dublin Pad 3 matches concrete cure tolerances.`,
          `System Log: RAG agent completed daily indexing of meeting minutes.`,
          `Logistics Monitor: Customs clearance achieved for UPS systems.`
        ];
        const randomAlert = testAlerts[Math.floor(Math.random() * testAlerts.length)];
        setLiveAlerts(prev => [randomAlert, ...prev.slice(0, 4)]);
      }
    }, 3000); // 3 seconds for visibly fast updates

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-purple-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-purple-900">Real-Time Telemetry</h1>
          <p className="text-sm text-purple-600">Live-updating supplier shipments and active commissioning tests.</p>
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
              {liveShipments.map((shipment) => (
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
                    <div className="flex justify-between text-[10px] text-purple-600">
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
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Alerts scrolling feed & active tests list */}
        <div className="space-y-6">
          
          {/* Live alert scrolling */}
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

          {/* Commissioning checkouts */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Active Commissioning Loops</h3>
            
            <div className="space-y-3">
              {commissioningItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">{item.component_name}</span>
                    <span className="text-[10px] text-purple-600">{item.system_name} System</span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold border",
                    item.status === 'Tested' || item.status === 'Certified' ? 'bg-green-100 text-green-700 border-green-200' :
                    item.status === 'InProgress' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                    'bg-slate-100 text-slate-500 border-slate-200'
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
  );
}

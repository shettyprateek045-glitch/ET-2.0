"use client";

import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertNotification {
  id: number;
  time: string;
  title: string;
  text: string;
  type: 'critical' | 'warning' | 'info';
  unread: boolean;
}

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  useEffect(() => {
    setAlerts([
      { id: 1, time: "10 mins ago", title: "New RFI-105 Filed", text: "Marcus Aurelius requested copper feeder busway submittal details for Project Dublin DC-1.", type: "info", unread: true },
      { id: 2, time: "2 hrs ago", title: "Chiller Rigging Milestone Risk", text: "Predictive engine flagged an 85% probability of 24-day delay on York Centrifugal Chiller delivery.", type: "warning", unread: true },
      { id: 3, time: "4 hrs ago", title: "Lithium-Ion UPS Ventilation Rating NCR", text: "Sarah Connor reported HVAC ventilation rating of 8 ACH in UPS room A, violating design standards.", type: "critical", unread: false },
      { id: 4, time: "1 day ago", title: "Commissioning test verified", text: "Alex Mercer completed Load Step test on UPS static switch Rack A-1 successfully.", type: "info", unread: false }
    ]);
  }, []);

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, unread: false })));
  };

  const handleClearAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Alerts & Notifications</h2>
          <p className="text-sm text-secondary">Verify real-time alerts concerning material shipments, NCRs, and RFI filings</p>
        </div>
        {alerts.some(a => a.unread) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/25 transition-all"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-900/30 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300">System Notification Stream</span>
          <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">
            {alerts.filter(a => a.unread).length} New Alerts
          </span>
        </div>

        <div className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {alerts.length > 0 ? (
              alerts.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 flex gap-4 items-start hover:bg-white/5 transition-colors relative ${a.unread ? 'bg-primary/[0.02]' : ''}`}
                >
                  {/* Left accent strip for unread */}
                  {a.unread && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></span>}

                  <div className={`p-2 rounded-xl shrink-0 ${
                    a.type === 'critical' ? 'bg-red-500/10 text-red-500' : a.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500'
                  }`}>
                    {a.type === 'critical' ? <AlertCircle className="w-4 h-4" /> : a.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-bold text-slate-200">{a.title}</h4>
                      <span className="text-[10px] text-secondary whitespace-nowrap">{a.time}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{a.text}</p>
                  </div>

                  <button
                    onClick={() => handleClearAlert(a.id)}
                    className="p-1 hover:bg-red-500/10 rounded text-secondary hover:text-red-500 transition-colors shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-secondary text-xs flex flex-col items-center gap-2">
                <Bell className="w-10 h-10 opacity-30 stroke-[1.5]" />
                <p>All clear. No unresolved alerts in active stream.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

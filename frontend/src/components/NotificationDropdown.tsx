"use client";

import React from 'react';
import { Bell, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function NotificationDropdown() {
  const notifications = [
    { title: "New compliance citation matching code guidelines.", type: "citation", icon: ShieldCheck, color: "text-green-400" },
    { title: "Material Delayed: York Chillers PO-002 delayed in transit.", type: "delay", icon: AlertTriangle, color: "text-amber-400" },
  ];

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white/90 border border-purple-100 rounded-xl shadow-2xl z-50 p-4 text-left">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-200">
        <span className="text-sm font-bold text-purple-900">Notifications</span>
        <Bell className="w-4 h-4 text-purple-600" />
      </div>
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className="flex space-x-3 items-start hover:bg-white/30 p-2 rounded-lg transition">
            <n.icon className={`w-5 h-5 shrink-0 ${n.color}`} />
            <p className="text-xs text-purple-600 leading-snug">{n.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

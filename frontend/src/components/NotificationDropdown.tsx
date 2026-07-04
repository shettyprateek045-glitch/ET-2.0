"use client";

import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { Bell, ShieldCheck, AlertTriangle, Eye, Check } from 'lucide-react';

export default function NotificationDropdown() {
  const { notifications, markNotificationRead } = useProjects();
  
  // Only display unread notifications
  const unread = notifications.filter(n => !n.is_read);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-purple-100 rounded-xl shadow-2xl z-50 p-4 text-left">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-100">
        <span className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
          Notifications 
          {unread.length > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
              {unread.length}
            </span>
          )}
        </span>
        <Bell className="w-4 h-4 text-purple-700" />
      </div>
      
      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {unread.length > 0 ? (
          unread.map((n) => {
            const Icon = n.type === 'delay' ? AlertTriangle : ShieldCheck;
            const color = n.type === 'delay' ? 'text-amber-500' : 'text-purple-600';
            return (
              <div 
                key={n.id} 
                onClick={() => markNotificationRead(n.id)}
                className="flex gap-2.5 items-start hover:bg-purple-50 p-2 rounded-lg transition cursor-pointer group"
                title="Mark as read"
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] text-purple-900 leading-snug font-medium group-hover:text-purple-700">{n.message}</p>
                  <span className="text-[9px] text-purple-400 block">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <button className="text-purple-300 group-hover:text-purple-650 p-0.5 rounded hover:bg-purple-100 transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-purple-450 flex flex-col items-center justify-center gap-1.5">
            <ShieldCheck className="w-8 h-8 text-purple-300 stroke-[1.5]" />
            <span>No unread alert notifications.</span>
          </div>
        )}
      </div>
    </div>
  );
}

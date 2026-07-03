"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, Bot, FileText, ShoppingCart, 
  CheckCircle, ClipboardCheck, BarChart3, FileBarChart, Bell, 
  Settings, Users, Phone, User
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'AI Agents', href: '/ai-agents', icon: Bot },
  { name: 'Documents', href: '/document-management', icon: FileText },
  { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
  { name: 'Quality', href: '/quality-management', icon: CheckCircle },
  { name: 'Commissioning', href: '/commissioning', icon: ClipboardCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

const ADMIN_ITEMS = [
  { name: 'Admin Panel', href: '/admin', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null; // Don't show sidebar on landing or auth pages
  }

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-fg hidden md:flex flex-col h-screen border-r border-border transition-all duration-300">
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="font-bold text-white tracking-tighter">DC</span>
          </div>
          <span className="font-semibold text-lg tracking-tight truncate">DataCentre AI</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className="px-4 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Main Menu</div>
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_12px_rgba(2,132,199,0.2)]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-8 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">System</div>
        <nav className="space-y-1 px-2 mb-8">
          {ADMIN_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

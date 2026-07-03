"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeProject, projects, setActiveProject, kpis } = useProjects();
  const [profileOpen, setProfileOpen] = useState(false);

  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null;
  }

  // Format pathname for title
  const title = pathname.split('/')[1] || 'Dashboard';
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');

  return (
    <header className="h-16 border-b border-border bg-card-bg/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight">{formattedTitle}</h1>
        <div className="hidden md:flex items-center ml-8 text-sm text-secondary">
          <span className="mr-2">Active Project:</span>
          <select 
            className="bg-transparent border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium max-w-[200px] truncate"
            value={activeProject?.id || ''}
            onChange={(e) => {
              const proj = projects.find(p => p.id === parseInt(e.target.value));
              if (proj) setActiveProject(proj);
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-background text-foreground">{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input 
            type="text" 
            placeholder="Search projects, RFIs, assets..." 
            className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all focus:w-72"
          />
        </div>

        <Link href="/notifications" className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-secondary" />
          {kpis?.openQualityIssues > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
          )}
        </Link>

        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              {user?.full_name?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-sm font-semibold">{user?.full_name || 'Guest'}</span>
              <span className="text-xs text-secondary">{user?.role || 'Viewer'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-secondary ml-1" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-border rounded-lg shadow-xl py-1 glass z-50">
              <div className="px-4 py-2 border-b border-border/50 mb-1">
                <p className="text-sm font-medium truncate">{user?.email || 'Not logged in'}</p>
              </div>
              <Link href="/profile" className="flex items-center px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                <UserIcon className="w-4 h-4 mr-2" /> Profile
              </Link>
              <button 
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

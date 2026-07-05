"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ProjectSwitcher from './ProjectSwitcher';
import { useProjects } from '../context/ProjectContext';
import { Menu, X, LogOut, User } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Platform', href: '/platform' },
  { name: 'AI Agents', href: '/ai-agents' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Monitoring', href: '/monitoring' },
  { name: 'Contact', href: '/contact' },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeProject } = useProjects();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMobileNav = (href: string) => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative z-50 bg-white border-b border-purple-100 shadow-md">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-extrabold text-purple-700 tracking-wider hover:text-purple-600 transition-colors">
            DataCentre AI
          </Link>
          
          {/* Desktop Primary Nav */}
          <nav className="hidden lg:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-semibold text-purple-900 hover:text-purple-600 transition-colors duration-200 ${
                  pathname === item.href ? 'text-purple-600 border-b-2 border-purple-600' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex items-center space-x-6">

          <div className="flex items-center space-x-4">
            <ProjectSwitcher />
            

            
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-purple-800 hover:text-purple-600 cursor-pointer p-1.5 rounded-full hover:bg-purple-50 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifOpen && <NotificationDropdown />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-1.5 text-xs text-purple-900 font-semibold">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1 text-purple-600 hover:text-red-600 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm transition cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="lg:hidden flex items-center space-x-3">
          <ProjectSwitcher />


          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-purple-900 hover:text-purple-600 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-purple-100 shadow-inner px-6 py-4 flex flex-col space-y-4">
          <div className="flex flex-col space-y-2.5">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Main Menu</span>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleMobileNav(item.href)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === item.href 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'text-purple-900 hover:bg-purple-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>



          <div className="flex items-center justify-between pt-4 border-t border-purple-100 gap-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setNotifOpen(!notifOpen);
              }}
              className="relative flex items-center justify-center p-2 text-purple-800 bg-purple-50 rounded-lg w-12 h-12"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifOpen && <NotificationDropdown />}
            </button>

            {user ? (
              <div className="flex-1 flex items-center justify-between bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">
                <span className="text-xs text-purple-900 font-semibold truncate max-w-[150px]">{user.full_name}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-red-650 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm text-center text-sm cursor-pointer"
              >
                Login Workspace
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

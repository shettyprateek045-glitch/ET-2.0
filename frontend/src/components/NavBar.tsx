import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';
import NotificationDropdown from './NotificationDropdown';
import ProjectSwitcher from './ProjectSwitcher';

const navItems = [
  { name: 'Home', href: '/home' },
  { name: 'Platform', href: '/platform' },
  { name: 'AI Agents', href: '/agents' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Monitoring', href: '/monitoring' },
  { name: 'Contact', href: '/contact' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/90 border-b border-purple-100 shadow-md">
      <div className="text-2xl font-extrabold text-purple-700 tracking-wider">
        DataCentre AI
      </div>
      <nav className="flex space-x-6">
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
      <nav className="flex space-x-6 ml-4">
        {['Platform','AI Agents','Call Support','Other'].map((label)=>(
          <Link key={label} href={`/${label.toLowerCase().replace(' ','-')}`} className={`font-medium text-purple-800 hover:text-purple-600 transition-colors ${pathname.includes(label.toLowerCase()) ? 'underline' : ''}`}>{label}</Link>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        <ProjectSwitcher />
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative text-purple-800 hover:text-purple-600"
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
        <button
          onClick={() => setLoginOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm transition"
        >
          Login
        </button>
        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      </div>
    </header>
  );
}

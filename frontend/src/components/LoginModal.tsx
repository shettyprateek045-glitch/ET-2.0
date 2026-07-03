"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, X, AlertTriangle } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'Enterprise' | 'Client' | 'Admin'>('Enterprise');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let role: 'Admin' | 'Client' | 'Engineer' = 'Engineer';
    if (loginType === 'Admin') role = 'Admin';
    if (loginType === 'Client') role = 'Client';

    const success = await login(email, role, email.split('@')[0]);
    if (success) {
      onClose();
    } else {
      setError('Login authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white/90 border border-purple-100 rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-purple-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex p-2 space-x-2 bg-white/30 rounded-lg mb-6">
          {(['Enterprise', 'Client', 'Admin'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setLoginType(type)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                loginType === type ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 hover:text-purple-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-purple-900 mb-2">{loginType} Authentication</h3>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white/80 border border-purple-200 text-sm rounded-lg px-3 py-2 text-purple-900 focus:outline-none focus:border-purple-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/80 border border-purple-200 text-sm rounded-lg pl-9 pr-3 py-2 text-purple-900 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-semibold rounded-lg shadow-lg transition-all">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

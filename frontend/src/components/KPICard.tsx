import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  colorClass?: string;
}

export default function KPICard({ title, value, icon: Icon, trend, subtitle, colorClass = "text-primary bg-primary/10" }: KPICardProps) {
  return (
    <div className="glass p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-foreground mb-1 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-secondary">{title}</p>
        {subtitle && <p className="text-xs text-secondary/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

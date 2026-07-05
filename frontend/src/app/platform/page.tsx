"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldCheck, Cpu, Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PlatformPage() {
  const features = [
    { 
      title: "BIM Compliance", 
      desc: "Integrates with Autodesk BIM 360 to verify standards live.", 
      icon: Layers,
      tabIndex: 0 
    },
    { 
      title: "Smart Scheduling", 
      desc: "AI-powered timeline forecasting and delay mitigations.", 
      icon: Clock,
      tabIndex: 1 
    },
    { 
      title: "Quality Control", 
      desc: "Automated NCR detection and workflow routing.", 
      icon: ShieldCheck,
      tabIndex: 3 
    },
    { 
      title: "Infrastructure Metrics", 
      desc: "Sensor networks monitoring physical cooling and UPS health.", 
      icon: Activity,
      tabIndex: 2 
    },
  ];

  return (
    <div className="space-y-12 p-6 lg:p-12 relative z-10 max-w-7xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-purple-950">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">DataCentre AI Platform</span>
        </h1>
        <p className="text-purple-800 max-w-2xl mx-auto font-medium">
          Deploying autonomous agents to streamline design, procurement, and site execution parameters. Click any console below to launch the agent sandbox.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <Link key={i} href={`/ai-agents?tab=${f.tabIndex}`} className="block group">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-2xl border border-purple-200/50 hover:border-purple-500/50 hover:bg-white transition-all duration-300 cursor-pointer h-full flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="p-3 bg-purple-100 text-purple-750 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform duration-350">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-purple-900 mb-2 group-hover:text-purple-700 transition-colors">{f.title}</h3>
                <p className="text-purple-800 text-sm leading-relaxed">{f.desc}</p>
              </div>
              <div className="mt-6 text-xs font-mono font-bold text-purple-700 group-hover:text-purple-655 flex items-center justify-between uppercase tracking-wider">
                <span>OPEN SANDBOX CONSOLE</span>
                <span>→</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

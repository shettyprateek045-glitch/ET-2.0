"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldCheck, Cpu, Activity, Clock, FileText } from 'lucide-react';

export default function PlatformPage() {
  const features = [
    { title: "BIM Compliance", desc: "Integrates with Autodesk BIM 360 to verify standards live.", icon: Layers },
    { title: "Smart Scheduling", desc: "AI-powered timeline forecasting and delay mitigations.", icon: Clock },
    { title: "Quality Control", desc: "Automated NCR detection and workflow routing.", icon: ShieldCheck },
    { title: "Infrastructure Metrics", desc: "Sensor networks monitoring physical cooling and UPS health.", icon: Activity },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">DataCentre AI Platform</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Deploying autonomous agents to streamline design, procurement, and site execution parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md"
          >
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-4">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

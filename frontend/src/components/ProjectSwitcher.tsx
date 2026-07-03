"use client";

import React from 'react';
import { useProjects } from '../context/ProjectContext';

export default function ProjectSwitcher() {
  const { projects, activeProject, setActiveProject } = useProjects();

  if (!projects || projects.length === 0) return null;

  return (
    <select
      value={activeProject?.id || ''}
      onChange={(e) => {
        const p = projects.find(proj => proj.id === Number(e.target.value));
        if (p) setActiveProject(p);
      }}
      className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-3 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
    >
      {projects.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}

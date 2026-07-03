"use client";

import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Loader2, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('projects');
  const [fileFormat, setFileFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setDownloading(true);

    const url = `http://127.0.0.1:8000/api/v1/reports/export?report_type=${reportType}&file_format=${fileFormat}`;
    
    // Simulate latency before triggering file download
    setTimeout(() => {
      window.location.href = url;
      setDownloading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Report Exporter</h2>
        <p className="text-sm text-secondary">Configure templates and download CSV, Excel, or PDF audit logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-border flex flex-col justify-between min-h-[300px]">
          <form onSubmit={handleExport} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Report Content Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white cursor-pointer"
                >
                  <option value="projects">Projects General Ledger</option>
                  <option value="quality">Quality & NCR Incidents</option>
                  <option value="procurement">Purchase Orders & Shipments</option>
                  <option value="commissioning">Commissioning Systems Checklist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Export File Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {['pdf', 'xlsx', 'csv'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFileFormat(fmt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all uppercase flex items-center justify-center gap-1.5 ${
                        fileFormat === fmt 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'border-border bg-transparent text-secondary hover:text-foreground'
                      }`}
                    >
                      {fmt === 'pdf' ? <FileText className="w-3.5 h-3.5" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={downloading}
              className="w-fit bg-primary hover:bg-primary-hover px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 disabled:opacity-50 mt-6"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Compiling Document...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Audited Ledger
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="glass p-6 rounded-2xl border border-border flex flex-col justify-between text-xs">
          <div>
            <h3 className="font-bold text-sm mb-4">Export Log Notes</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                <p>PDF downloads contain a formalized layout complete with header margins, styling, and data rows.</p>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                <p>Excel downloads parse tables into standard spreadsheets supporting pivot-table analyses.</p>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                <p>Ensure your active workspace project selection is verified before executing compiled ledger downloads.</p>
              </li>
            </ul>
          </div>
          
          <div className="pt-6 mt-6 border-t border-border flex justify-between items-center text-[10px] text-secondary font-medium">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Archive updated: Today</span>
            <span className="hover:underline cursor-pointer">Archive ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}

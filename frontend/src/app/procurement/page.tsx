"use client";

import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import Modal from '../../components/Modal';
import { ShoppingBag, Truck, AlertTriangle, UserCheck, Plus, Play, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProcurementPage() {
  const { purchaseOrders, addPurchaseOrder } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  // Form State
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState(10000);
  const [supplier, setSupplier] = useState('');
  const [risk, setRisk] = useState<'Low' | 'Medium' | 'High'>('Low');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !supplier) return;
    
    await addPurchaseOrder({
      item_name: itemName,
      quantity: qty,
      cost,
      supplier_name: supplier,
      supplier_risk: risk
    });

    setItemName('');
    setQty(1);
    setCost(10000);
    setSupplier('');
    setRisk('Low');
    setIsModalOpen(false);
  };

  const handleScanRisk = async () => {
    setScanning(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/procurement/supplier-risk-assessment');
      if (res.ok) {
        const data = await res.json();
        setRiskAssessment(data.risks);
      }
    } catch (e) {
      setRiskAssessment([
        { supplier: "Apex Switchgear Ltd", risk_level: "High", components: "Medium Voltage Switchgear panels", financial_stability: "Weak (recent credit downgrade to BB-)", delivery_reliability: "68% on-time rate over past 6 months", mitigation: "Establish contact with backup suppliers (Schneider/Eaton) and hold 15% progress payment." },
        { supplier: "Boreas Cooling Systems", risk_level: "Medium", components: "Computer Room Air Handlers (CRAHs)", financial_stability: "Stable", delivery_reliability: "89% on-time rate", mitigation: "Approve alternative material usage or pre-purchase copper billets." }
      ]);
    }
    setScanning(false);
  };

  // Prepare chart data for cost per supplier
  const chartData = purchaseOrders.map(po => ({
    name: po.item_name.substring(0, 15),
    Cost: po.cost / 1000
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Procurement & Material Management</h2>
          <p className="text-sm text-secondary">Verify supply chain workflows, purchase orders, and supplier risk factors</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover py-2 px-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">{purchaseOrders.length}</p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Purchase Orders logged</p>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">
              {purchaseOrders.filter(po => po.status === 'Shipped' || po.status === 'Delivered').length}
            </p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Material orders dispatched</p>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold">
              {purchaseOrders.filter(po => po.supplier_risk === 'High').length}
            </p>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">High Risk Vendors flagged</p>
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PO Table */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm">Active Material Procurement Ledger</h3>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">Active Ledger</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-secondary font-medium">
                  <th className="pb-3">PO Number</th>
                  <th className="pb-3">Item Name</th>
                  <th className="pb-3">Supplier</th>
                  <th className="pb-3">Risk Level</th>
                  <th className="pb-3">Tracking State</th>
                  <th className="pb-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-primary">{po.po_number}</td>
                    <td className="py-3 font-medium">{po.item_name}</td>
                    <td className="py-3">{po.supplier_name}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        po.supplier_risk === 'High' ? 'bg-red-500/10 text-red-500' : po.supplier_risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {po.supplier_risk}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-slate-300 font-medium">{po.tracking_status}</span>
                    </td>
                    <td className="py-3 text-right font-bold">${po.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Analysis Graph */}
        <div className="glass rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm">Material Cost Metrics</h3>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">Cost ($K)</span>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
              <YAxis stroke="#64748b" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="Cost" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier risk scout */}
      <div className="glass p-6 rounded-2xl border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" /> Supply Chain Visibility & Risk Agent
          </h3>
          <button
            onClick={handleScanRisk}
            disabled={scanning}
            className="text-xs font-bold px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-xl transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> {scanning ? "Scanning..." : "Execute Risk Scan"}
          </button>
        </div>

        {riskAssessment ? (
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            {riskAssessment.map((vendor: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-950 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-200">{vendor.supplier}</h4>
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[9px] font-bold">{vendor.risk_level} Risk</span>
                </div>
                <p className="text-slate-400">Component: <span className="font-semibold text-slate-300">{vendor.components}</span></p>
                <p className="text-slate-400">Financial stability: {vendor.financial_stability}</p>
                <p className="text-slate-400">Logistics latency: {vendor.delivery_reliability || "No data"}</p>
                <p className="text-primary pt-2 border-t border-border/50"><span className="font-bold text-slate-300">Remediation:</span> {vendor.mitigation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-secondary">Execute the risk assessment loop to run diagnostics on raw material shipments.</p>
        )}
      </div>

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Facility Purchase Order">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Item Name / Specification</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. York 500-Ton Centrifugal Chiller"
              className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Supplier Vendor Name</label>
            <input
              type="text"
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Boreas Cooling Systems"
              className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Quantity</label>
              <input
                type="number"
                required
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Total Value ($)</label>
              <input
                type="number"
                required
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Logistical Risk Level</label>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-white cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary-hover font-bold rounded-xl text-white shadow-lg transition-all mt-4"
          >
            Create Purchase Order
          </button>
        </form>
      </Modal>
    </div>
  );
}

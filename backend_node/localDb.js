const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, 'db.json');

let dbData = {
  users: [],
  projects: [],
  rfis: [],
  qualityissues: [],
  purchaseorders: [],
  commissioningitems: [],
  documents: [],
  notifications: [],
  logs: []
};

// Initial Seed Data matching server.js structure
const seedUsers = [
  { _id: 'u1', id: 1, email: 'admin@datacentre.ai', password: 'admin123', fullName: 'Sarah Connor', role: 'Admin', isActive: true },
  { _id: 'u2', id: 2, email: 'pm@datacentre.ai', password: 'pm123', fullName: 'David Vance', role: 'Project Manager', isActive: true },
  { _id: 'u3', id: 3, email: 'engineer@datacentre.ai', password: 'eng123', fullName: 'Alex Mercer', role: 'Engineer', isActive: true },
  { _id: 'u4', id: 4, email: 'contractor@datacentre.ai', password: 'con123', fullName: 'Marcus Aurelius', role: 'Contractor', isActive: true },
  { _id: 'u5', id: 5, email: 'client@datacentre.ai', password: 'client123', fullName: 'Bill Gates', role: 'Client', isActive: true }
];

const seedProjects = [
  { _id: 'p1', id: 1, name: 'Project Dublin Hyperscale DC-1', location: 'Dublin, Ireland', capacity_mw: 120.0, budget_million: 180.0, budget_used: 135.2, status: 'Active', ai_health_score: 94.5, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString() },
  { _id: 'p2', id: 2, name: 'Project Frankfurt Edge DC-5', location: 'Frankfurt, Germany', capacity_mw: 45.0, budget_million: 75.0, budget_used: 72.0, status: 'Delayed', ai_health_score: 78.2, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 200*24*60*60*1000).toISOString() },
  { _id: 'p3', id: 3, name: 'Singapore Green Hybrid DC-3', location: 'Singapore', capacity_mw: 80.0, budget_million: 120.0, budget_used: 24.5, status: 'Active', ai_health_score: 96.1, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 400*24*60*60*1000).toISOString() },
  { _id: 'p4', id: 4, name: 'Virginia Colocation Hub', location: 'Ashburn, VA, USA', capacity_mw: 250.0, budget_million: 320.0, budget_used: 320.0, status: 'Completed', ai_health_score: 98.0, start_date: new Date().toISOString(), end_date: new Date().toISOString() }
];

const seedRfis = [
  { _id: 'r1', id: 1, project_id: 1, title: 'Generator Belly Tank Containment Dike', question: 'Does section 4.2.1 require a separate containment dike around belly tanks?', response: 'Yes. Local permits require an additional 110% capacity concrete dike.', status: 'Closed', asked_by: 'Marcus Aurelius', answered_by: 'Sarah Connor', created_at: new Date().toISOString() },
  { _id: 'r2', id: 2, project_id: 1, title: 'UPS Busway Copper vs Aluminum', question: 'Can we substitute copper feeder busways with aluminum to save lead time?', status: 'Open', asked_by: 'Marcus Aurelius', created_at: new Date().toISOString() }
];

const seedQualityIssues = [
  { _id: 'q1', id: 1, project_id: 1, title: 'Lithium-Ion UPS Ventilation Rating', description: 'HVAC specifies 8 ACH but standards require 10 ACH.', status: 'Open', severity: 'High', reported_by: 'Sarah Connor', assigned_to: 'Alex Mercer', created_at: new Date().toISOString() },
  { _id: 'q2', id: 2, project_id: 2, title: 'Foundation Micro-cracks on Pad 3', description: 'Cracks found on pad, tested compliant but needs sealant.', status: 'UnderReview', severity: 'Medium', reported_by: 'Alex Mercer', assigned_to: 'Marcus Aurelius', created_at: new Date().toISOString() }
];

const seedPurchaseOrders = [
  { _id: 'po1', id: 1, project_id: 1, po_number: 'PO-2026-001', item_name: 'Caterpillar 2MW Diesel Generator', quantity: 6, cost: 4200000.0, supplier_name: 'Apex Power Systems Ltd', status: 'Approved', tracking_status: 'In Production', supplier_risk: 'Medium', delivery_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 'po2', id: 2, project_id: 2, po_number: 'PO-2026-002', item_name: 'York 500-Ton Centrifugal Chiller', quantity: 4, cost: 1850000.0, supplier_name: 'Boreas Cooling Systems', status: 'Shipped', tracking_status: 'In Transit', supplier_risk: 'High', delivery_date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString() }
];

const seedCommissioning = [
  { _id: 'c1', id: 1, project_id: 1, system_name: 'Electrical', component_name: 'UPS Rack A-1 Static Switch Test', status: 'Tested', tester_name: 'Alex Mercer', test_date: new Date().toISOString() },
  { _id: 'c2', id: 2, project_id: 1, system_name: 'HVAC', component_name: 'Chiller-1 Water Loop Balance', status: 'InProgress', tester_name: 'Alex Mercer' }
];

const seedDocuments = [
  { 
    _id: 'd1', 
    id: 1, 
    project_id: 1, 
    filename: 'General_Specifications_Electrical_Subsystems.pdf', 
    filePath: './uploads/General_Specifications_Electrical_Subsystems.pdf', 
    doc_type: 'Specification', 
    version: 1, 
    approved_status: 'Approved', 
    uploaded_by: 'Sarah Connor', 
    uploaded_at: new Date().toISOString(),
    ocrText: 'SECTION 26 32 13 - Standby generator sets. Double-walled tank with 110% containment.' 
  }
];

function loadDb() {
  if (fs.existsSync(dbFilePath)) {
    try {
      dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    } catch (e) {
      console.error("Error reading db.json, using defaults", e);
      resetToSeeds();
    }
  } else {
    resetToSeeds();
  }
}

function resetToSeeds() {
  dbData = {
    users: [...seedUsers],
    projects: [...seedProjects],
    rfis: [...seedRfis],
    qualityissues: [...seedQualityIssues],
    purchaseorders: [...seedPurchaseOrders],
    commissioningitems: [...seedCommissioning],
    documents: [...seedDocuments],
    notifications: [],
    logs: []
  };
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to write to db.json", e);
  }
}

loadDb();

class LocalCollection {
  constructor(name) {
    this.name = name;
  }

  async find(query = {}) {
    let list = dbData[this.name] || [];
    return list.filter(item => {
      for (let k in query) {
        let qVal = query[k];
        let iVal = item[k];

        // Normalise object ID comparisons
        if (qVal && typeof qVal === 'object' && qVal.toString) qVal = qVal.toString();
        if (iVal && typeof iVal === 'object' && iVal.toString) iVal = iVal.toString();

        if (iVal != qVal) return false;
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const res = await this.find(query);
    return res[0] || null;
  }

  async findById(id) {
    let list = dbData[this.name] || [];
    return list.find(i => i._id === id || i._id == id || i.id === id || i.id === Number(id)) || null;
  }

  async create(data) {
    if (Array.isArray(data)) {
      const docs = data.map(d => ({
        _id: Math.random().toString(36).substring(2, 9),
        id: (dbData[this.name].length + 1),
        ...d
      }));
      dbData[this.name].push(...docs);
      saveDb();
      return docs;
    }
    const doc = {
      _id: Math.random().toString(36).substring(2, 9),
      id: (dbData[this.name].length + 1),
      ...data
    };
    dbData[this.name].push(doc);
    saveDb();
    return doc;
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    let item = await this.findById(id);
    if (item) {
      Object.assign(item, update);
      saveDb();
    }
    return item;
  }

  async findOneAndUpdate(query, update, options = {}) {
    let item = await this.findOne(query);
    if (item) {
      Object.assign(item, update);
      saveDb();
    }
    return item;
  }

  async findByIdAndDelete(id) {
    const index = dbData[this.name].findIndex(i => i._id === id || i._id == id || i.id === id || i.id === Number(id));
    if (index !== -1) {
      const removed = dbData[this.name].splice(index, 1)[0];
      saveDb();
      return removed;
    }
    return null;
  }
}

module.exports = {
  dbData,
  User: new LocalCollection('users'),
  Project: new LocalCollection('projects'),
  RFI: new LocalCollection('rfis'),
  QualityIssue: new LocalCollection('qualityissues'),
  PurchaseOrder: new LocalCollection('purchaseorders'),
  CommissioningItem: new LocalCollection('commissioningitems'),
  Document: new LocalCollection('documents'),
  Notification: new LocalCollection('notifications'),
  Log: new LocalCollection('logs'),
  saveDb
};

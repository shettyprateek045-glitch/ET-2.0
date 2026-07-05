const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'datacentre_secret_key_12345';
const MONGO_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/datacentre_ai';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure Uploads Directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// ---------------- MongoDB / Mongoose Schemas ----------------

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Project Manager', 'Engineer', 'Contractor', 'Client'], default: 'Engineer' }
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacityMw: { type: Number, required: true },
  budgetMillion: { type: Number, required: true },
  budgetUsed: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Delayed', 'Completed', 'Planned'], default: 'Active' },
  aiHealthScore: { type: Number, default: 95.0 }
});

const RFISchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  question: { type: String, required: true },
  response: { type: String, default: null },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  askedBy: { type: String, required: true },
  answeredBy: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const QualityIssueSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'UnderReview', 'Resolved'], default: 'Open' },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  reportedBy: { type: String, required: true },
  assignedTo: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const PurchaseOrderSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  poNumber: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
  supplierName: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Shipped', 'Delivered'], default: 'Pending' },
  trackingStatus: { type: String, default: 'In Production' },
  supplierRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  deliveryDate: { type: Date }
});

const CommissioningItemSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  systemName: { type: String, required: true },
  componentName: { type: String, required: true },
  status: { type: String, enum: ['NotStarted', 'InProgress', 'Tested', 'Certified'], default: 'NotStarted' },
  testerName: { type: String },
  signatureData: { type: String },
  testDate: { type: Date }
});

const DocumentSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  docType: { type: String, default: 'Specification' },
  version: { type: Number, default: 1 },
  approvedStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  uploadedBy: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  ocrText: { type: String, default: '' }
});

const NotificationSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'delay', 'quality'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Setup schema models
mongoose.model('User', UserSchema);
mongoose.model('Project', ProjectSchema);
mongoose.model('RFI', RFISchema);
mongoose.model('QualityIssue', QualityIssueSchema);
mongoose.model('PurchaseOrder', PurchaseOrderSchema);
mongoose.model('CommissioningItem', CommissioningItemSchema);
mongoose.model('Document', DocumentSchema);
mongoose.model('Notification', NotificationSchema);

// Define variables for models
let User, Project, RFI, QualityIssue, PurchaseOrder, CommissioningItem, Document, Notification;

// ---------------- Database Seeding Helper ----------------

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('Seeding initial MongoDB dataset...');
    
    // Seed Users
    const users = await User.create([
      { email: 'admin@datacentre.ai', password: 'admin123', fullName: 'Sarah Connor', role: 'Admin' },
      { email: 'pm@datacentre.ai', password: 'pm123', fullName: 'David Vance', role: 'Project Manager' },
      { email: 'engineer@datacentre.ai', password: 'eng123', fullName: 'Alex Mercer', role: 'Engineer' },
      { email: 'contractor@datacentre.ai', password: 'con123', fullName: 'Marcus Aurelius', role: 'Contractor' },
      { email: 'client@datacentre.ai', password: 'client123', fullName: 'Bill Gates', role: 'Client' }
    ]);

    // Seed Projects
    const projects = await Project.create([
      { name: 'Project Dublin Hyperscale DC-1', location: 'Dublin, Ireland', capacityMw: 120.0, budgetMillion: 180.0, budgetUsed: 135.2, status: 'Active', aiHealthScore: 94.5 },
      { name: 'Project Frankfurt Edge DC-5', location: 'Frankfurt, Germany', capacityMw: 45.0, budgetMillion: 75.0, budgetUsed: 72.0, status: 'Delayed', aiHealthScore: 78.2 },
      { name: 'Singapore Green Hybrid DC-3', location: 'Singapore', capacityMw: 80.0, budgetMillion: 120.0, budgetUsed: 24.5, status: 'Active', aiHealthScore: 96.1 },
      { name: 'Virginia Colocation Hub', location: 'Ashburn, VA, USA', capacityMw: 250.0, budgetMillion: 320.0, budgetUsed: 320.0, status: 'Completed', aiHealthScore: 98.0 }
    ]);

    const p1 = projects[0]._id.toString();
    const p2 = projects[1]._id.toString();

    // Seed RFIs
    await RFI.create([
      { projectId: p1, project_id: p1, title: 'Generator Belly Tank Containment Dike', question: 'Does section 4.2.1 require a separate containment dike around belly tanks?', response: 'Yes. Local permits require an additional 110% capacity concrete dike.', status: 'Closed', askedBy: 'Marcus Aurelius', asked_by: 'Marcus Aurelius', answeredBy: 'Sarah Connor', answered_by: 'Sarah Connor' },
      { projectId: p1, project_id: p1, title: 'UPS Busway Copper vs Aluminum', question: 'Can we substitute copper feeder busways with aluminum to save lead time?', status: 'Open', askedBy: 'Marcus Aurelius', asked_by: 'Marcus Aurelius' }
    ]);

    // Seed Quality Issues
    await QualityIssue.create([
      { projectId: p1, project_id: p1, title: 'Lithium-Ion UPS Ventilation Rating', description: 'HVAC specifies 8 ACH but standards require 10 ACH.', status: 'Open', severity: 'High', reportedBy: 'Sarah Connor', reported_by: 'Sarah Connor', assignedTo: 'Alex Mercer', assigned_to: 'Alex Mercer' },
      { projectId: p2, project_id: p2, title: 'Foundation Micro-cracks on Pad 3', description: 'Cracks found on pad, tested compliant but needs sealant.', status: 'UnderReview', severity: 'Medium', reportedBy: 'Alex Mercer', reported_by: 'Alex Mercer', assignedTo: 'Marcus Aurelius', assigned_to: 'Marcus Aurelius' }
    ]);

    // Seed Purchase Orders
    await PurchaseOrder.create([
      { projectId: p1, project_id: p1, poNumber: 'PO-2026-001', po_number: 'PO-2026-001', itemName: 'Caterpillar 2MW Diesel Generator', item_name: 'Caterpillar 2MW Diesel Generator', quantity: 6, cost: 4200000.0, supplierName: 'Apex Power Systems Ltd', supplier_name: 'Apex Power Systems Ltd', status: 'Approved', trackingStatus: 'In Production', tracking_status: 'In Production', supplierRisk: 'Medium', supplier_risk: 'Medium', deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { projectId: p2, project_id: p2, poNumber: 'PO-2026-002', po_number: 'PO-2026-002', itemName: 'York 500-Ton Centrifugal Chiller', item_name: 'York 500-Ton Centrifugal Chiller', quantity: 4, cost: 1850000.0, supplierName: 'Boreas Cooling Systems', supplier_name: 'Boreas Cooling Systems', status: 'Shipped', trackingStatus: 'In Transit', tracking_status: 'In Transit', supplierRisk: 'High', supplier_risk: 'High', deliveryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000) }
    ]);

    // Seed Commissioning
    await CommissioningItem.create([
      { projectId: p1, project_id: p1, systemName: 'Electrical', system_name: 'Electrical', componentName: 'UPS Rack A-1 Static Switch Test', component_name: 'UPS Rack A-1 Static Switch Test', status: 'Tested', testerName: 'Alex Mercer', tester_name: 'Alex Mercer', testDate: new Date() },
      { projectId: p1, project_id: p1, systemName: 'HVAC', system_name: 'HVAC', componentName: 'Chiller-1 Water Loop Balance', component_name: 'Chiller-1 Water Loop Balance', status: 'InProgress', testerName: 'Alex Mercer', tester_name: 'Alex Mercer' }
    ]);

    // Seed Documents
    await Document.create([
      { projectId: p1, project_id: p1, filename: 'General_Specifications_Electrical_Subsystems.pdf', filePath: './uploads/General_Specifications_Electrical_Subsystems.pdf', docType: 'Specification', doc_type: 'Specification', version: 1, approvedStatus: 'Approved', approved_status: 'Approved', uploadedBy: 'Sarah Connor', uploaded_by: 'Sarah Connor', ocrText: 'SECTION 26 32 13 - Standby generator sets. Double-walled tank with 110% containment.' }
    ]);

    // Seed Notifications
    await Notification.create([
      { projectId: p1, project_id: p1, message: 'System Alert: Rain forecast in Dublin may affect open foundation concrete cure on Pad 4.', type: 'delay', isRead: false, is_read: false },
      { projectId: p1, project_id: p1, message: 'Logistics Monitor: UPS shipment has entered regional transit.', type: 'info', isRead: false, is_read: false },
      { projectId: p1, project_id: p1, message: 'QMS Compliance: Specification audit complete on switchgear layout. 0 severe warnings.', type: 'quality', isRead: false, is_read: false }
    ]);

    console.log('MongoDB Seeding complete.');
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  }
}

// ---------------- REST APIs ----------------

// Permissive JWT token decoder (doesn't block if token is missing/expired, just populates req.user)
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } else {
    req.user = null;
    next();
  }
};

// 1. Auth Endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      // Create test user automatically to facilitate testing
      const defaultName = email.split('@')[0];
      user = await User.create({
        email,
        password: password || 'mockpassword',
        fullName: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        role: 'Engineer'
      });
    }
    const token = jwt.sign({ id: user._id, role: user.role, full_name: user.fullName }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      id: user._id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/auth/signup', async (req, res) => {
  const { email, password, full_name, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ email, password, fullName: full_name, role });
    res.json({ id: user._id, email: user.email, full_name: user.fullName, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/auth/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(u => ({
      id: u._id,
      email: u.email,
      full_name: u.fullName,
      role: u.role,
      is_active: true
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/auth/users/:userId/role', async (req, res) => {
  const { role } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/v1/auth/users/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Projects & Dashboard APIs
app.get('/api/v1/projects/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects.map(p => ({
      id: p._id,
      name: p.name,
      location: p.location,
      capacity_mw: p.capacityMw !== undefined ? p.capacityMw : p.capacity_mw,
      budget_million: p.budgetMillion !== undefined ? p.budgetMillion : p.budget_million,
      budget_used: p.budgetUsed !== undefined ? p.budgetUsed : p.budget_used,
      status: p.status,
      ai_health_score: p.aiHealthScore !== undefined ? p.aiHealthScore : p.ai_health_score
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/projects/', async (req, res) => {
  const { name, location, capacity_mw, budget_million } = req.body;
  try {
    const project = await Project.create({
      name,
      location,
      capacityMw: capacity_mw,
      capacity_mw,
      budgetMillion: budget_million,
      budget_million,
      budgetUsed: 0,
      budget_used: 0,
      status: 'Active',
      aiHealthScore: 95.0,
      ai_health_score: 95.0
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/projects/:id', async (req, res) => {
  const { name, location, capacity_mw, budget_million, budget_used, status, ai_health_score } = req.body;
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, {
      name,
      location,
      capacityMw: capacity_mw,
      capacity_mw,
      budgetMillion: budget_million,
      budget_million,
      budgetUsed: budget_used,
      budget_used,
      status,
      aiHealthScore: ai_health_score,
      ai_health_score
    }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/v1/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/projects/dashboard-kpis', async (req, res) => {
  try {
    const totalProj = await Project.countDocuments();
    const activeProj = await Project.countDocuments({ status: 'Active' });
    const delayProj = await Project.countDocuments({ status: 'Delayed' });
    const completedProj = await Project.countDocuments({ status: 'Completed' });
    
    const projects = await Project.find();
    const totalBudget = projects.reduce((acc, p) => acc + (p.budgetMillion || p.budget_million || 0), 0);
    const spentBudget = projects.reduce((acc, p) => acc + (p.budgetUsed || p.budget_used || 0), 0);
    
    const rfiCount = await RFI.countDocuments({ status: 'Open' });
    const qualityCount = await QualityIssue.countDocuments({ status: 'Open' });
    const supplierRiskCount = await PurchaseOrder.countDocuments({ supplierRisk: 'High' });

    res.json({
      totalProjects: totalProj,
      activeProjects: activeProj,
      completedProjects: completedProj,
      delayedProjects: delayProj,
      totalBudgetMillion: totalBudget,
      budgetUsedMillion: spentBudget,
      openRFIs: rfiCount,
      openQualityIssues: qualityCount,
      supplierRiskCount: supplierRiskCount,
      aiHealthScore: 94.5
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/projects/dashboard-charts', async (req, res) => {
  res.json({
    monthlyTrend: [
      { name: 'Jan', Budget: 80, Spent: 45 },
      { name: 'Feb', Budget: 110, Spent: 68 },
      { name: 'Mar', Budget: 140, Spent: 95 },
      { name: 'Apr', Budget: 160, Spent: 120 },
      { name: 'May', Budget: 180, Spent: 135 },
      { name: 'Jun', Budget: 210, Spent: 160 }
    ],
    riskHeatmap: [
      { category: 'Foundation', Low: 2, Medium: 3, High: 1, Critical: 0 },
      { category: 'Electrical', Low: 1, Medium: 4, High: 2, Critical: 1 },
      { category: 'HVAC Piping', Low: 4, Medium: 2, High: 0, Critical: 0 }
    ],
    projectProgress: [
      { id: 1, name: 'Project Dublin DC-1', progress: 75, health: 94.5, status: 'Active' },
      { id: 2, name: 'Project Frankfurt DC-5', progress: 95, health: 78.2, status: 'Delayed' }
    ]
  });
});

app.get('/api/v1/projects/:projectId/notifications', async (req, res) => {
  try {
    const notifs = await Notification.find({ projectId: req.params.projectId });
    res.json(notifs.map(n => ({
      id: n._id,
      project_id: n.projectId !== undefined ? n.projectId : n.project_id,
      message: n.message,
      type: n.type,
      is_read: n.isRead !== undefined ? n.isRead : n.is_read,
      created_at: n.createdAt !== undefined ? n.createdAt : n.created_at
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/projects/:projectId/notifications/:notifId/read', async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.notifId, {
      isRead: true,
      is_read: true
    }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Document Endpoints
const upload = multer({ dest: 'uploads/' });

app.get('/api/v1/documents/', async (req, res) => {
  try {
    const docs = await Document.find();
    res.json(docs.map(d => ({
      id: d._id,
      filename: d.filename,
      project_id: d.projectId !== undefined ? d.projectId : d.project_id,
      doc_type: d.docType !== undefined ? d.docType : d.doc_type,
      approved_status: d.approvedStatus !== undefined ? d.approvedStatus : d.approved_status,
      version: d.version,
      uploaded_by: d.uploadedBy !== undefined ? d.uploadedBy : d.uploaded_by,
      uploaded_at: d.uploadedAt !== undefined ? d.uploadedAt : d.uploaded_at,
      ocr_text: d.ocrText
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const doc = await Document.create({
      projectId: req.body.project_id,
      project_id: req.body.project_id,
      filename: req.file.originalname,
      filePath: req.file.path,
      docType: req.body.doc_type || 'Specification',
      doc_type: req.body.doc_type || 'Specification',
      version: 1,
      approvedStatus: 'Pending',
      approved_status: 'Pending',
      uploadedBy: req.body.uploaded_by || 'System',
      uploaded_by: req.body.uploaded_by || 'System',
      uploadedAt: new Date(),
      uploaded_at: new Date().toISOString(),
      ocrText: 'Parsed document text via OCR simulation: STANDBY DIESEL GENERATORS. Comply with EPA Tier 4 parameters. Containment tank must hold 110% capacity.',
      status: 'processing'
    });
    // Simulate async processing
    setTimeout(async () => {
      await Document.findByIdAndUpdate(doc.id, { status: 'complete' });
    }, 2000);
    await Notification.create({
      projectId: req.body.project_id,
      project_id: req.body.project_id,
      message: `New specification document uploaded: ${req.file.originalname}`,
      type: 'info',
      isRead: false,
      is_read: false
    });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/documents/:docId/approve', async (req, res) => {
  const { status } = req.query;
  try {
    const doc = await Document.findByIdAndUpdate(req.params.docId, {
      approvedStatus: status,
      approved_status: status
    }, { new: true });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/documents/:docId/summary', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    
    const summary = `Cognitive summary of "${doc.filename}": Contains engineering guidelines regarding building codes. Specifically section 26-32-13, highlighting installation specs and diesel engine exhaust emissions standards compliance. Vector index returns 99.8% compliance level.`;
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/documents/search/semantic', async (req, res) => {
  const query = req.query.query || '';
  res.json({
    answer: `RAG search for "${query}": Found compliance citation matching section 26 32 13 guidelines. Secondary containment tank requires 110% storage capacity.`,
    sources: ['General_Specifications_Electrical_Subsystems.pdf']
  });
});

// 4. Procurement
app.get('/api/v1/procurement/', async (req, res) => {
  try {
    const pos = await PurchaseOrder.find();
    res.json(pos.map(po => ({
      id: po._id,
      project_id: po.projectId !== undefined ? po.projectId : po.project_id,
      po_number: po.poNumber !== undefined ? po.poNumber : po.po_number,
      item_name: po.itemName !== undefined ? po.itemName : po.item_name,
      quantity: po.quantity,
      cost: po.cost,
      supplier_name: po.supplierName !== undefined ? po.supplierName : po.supplier_name,
      status: po.status,
      tracking_status: po.trackingStatus !== undefined ? po.trackingStatus : po.tracking_status,
      supplier_risk: po.supplierRisk !== undefined ? po.supplierRisk : po.supplier_risk,
      delivery_date: po.deliveryDate !== undefined ? po.deliveryDate : po.delivery_date
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/procurement/', async (req, res) => {
  const { project_id, po_number, item_name, quantity, cost, supplier_name, supplier_risk } = req.body;
  try {
    const po = await PurchaseOrder.create({
      projectId: project_id,
      project_id,
      poNumber: po_number,
      po_number,
      itemName: item_name,
      item_name,
      quantity,
      cost,
      supplierName: supplier_name,
      supplier_name,
      status: 'Pending',
      trackingStatus: 'In Production',
      tracking_status: 'In Production',
      supplierRisk: supplier_risk || 'Low',
      supplier_risk: supplier_risk || 'Low',
      deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/procurement/:poId/update-status', async (req, res) => {
  const { status, tracking_status } = req.query;
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.poId, {
      status,
      trackingStatus: tracking_status,
      tracking_status
    }, { new: true });
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/procurement/supplier-risk-assessment', async (req, res) => {
  try {
    const pos = await PurchaseOrder.find();
    const risks = pos.map(po => ({
      supplier: po.supplierName || po.supplier_name,
      risk_level: po.supplierRisk || po.supplier_risk,
      components: po.itemName || po.item_name,
      financial_stability: (po.supplierRisk || po.supplier_risk) === 'High' ? 'Weak (recent credit downgrade to BB-)' : 'Stable'
    }));
    addAgentLog(2, { action: 'Assess supplier logistics risk', result: `${risks.length} supplier credit scans finished` });
    res.json({ risks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Quality NCR
app.get('/api/v1/quality/', async (req, res) => {
  try {
    const issues = await QualityIssue.find();
    res.json(issues.map(i => ({
      id: i._id,
      project_id: i.projectId !== undefined ? i.projectId : i.project_id,
      title: i.title,
      description: i.description,
      status: i.status,
      severity: i.severity,
      reported_by: i.reportedBy !== undefined ? i.reportedBy : i.reported_by,
      assigned_to: i.assignedTo !== undefined ? i.assignedTo : i.assigned_to,
      created_at: i.createdAt !== undefined ? i.createdAt : i.created_at
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/quality/', authenticateJWT, async (req, res) => {
  const { project_id, title, description, severity, assigned_to } = req.body;
  try {
    const reportedBy = req.user ? req.user.full_name : 'Engineer';
    const issue = await QualityIssue.create({
      projectId: project_id,
      project_id,
      title,
      description,
      severity,
      assignedTo: assigned_to,
      assigned_to,
      reportedBy,
      reported_by: reportedBy,
      status: 'Open'
    });
    
    // Create notification about quality issue
    await Notification.create({
      projectId: project_id,
      project_id,
      message: `New Quality NCR logged: ${title}`,
      type: 'quality',
      isRead: false,
      is_read: false
    });

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/quality/:issueId/resolve', async (req, res) => {
  const { status } = req.query;
  try {
    const issue = await QualityIssue.findByIdAndUpdate(req.params.issueId, { status }, { new: true });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/quality/compliance-check', async (req, res) => {
  const text = req.query.document_text || '';
  let results = [];
  
  if (text.toLowerCase().includes('tank') || text.toLowerCase().includes('generator')) {
    results.push({
      clause: "Sec 4.2.1: Generator Fuel Supply Layout",
      status: "Non-Compliant",
      details: "The design specifies a single 10,000-gallon belly tank without secondary containment, violating EPA Tier 4 requirements.",
      remediation: "Redesign with dual-walled tanks or implement a concrete containment dike."
    });
  }
  if (text.toLowerCase().includes('chiller') || text.toLowerCase().includes('water')) {
    results.push({
      clause: "Sec 8.1.3: Chilled Water Piping Redundancy",
      status: "Compliant",
      details: "N+2 piping loops meet the Tier III design topology requested by the client.",
      remediation: "None"
    });
  }

  if (results.length === 0) {
    results = [
      {
        clause: "Standard Design Specification Audit",
        status: "Compliant",
        details: "The submitted specs match local regulations and BICSI design standard tolerances.",
        remediation: "None"
      }
    ];
  }

  addAgentLog(0, { action: 'Run compliance scan', result: `${results.length} compliance records scanned` });
  res.json({ results });
});

// 6. Commissioning Checklist
app.get('/api/v1/commissioning/', async (req, res) => {
  try {
    const items = await CommissioningItem.find();
    res.json(items.map(c => ({
      id: c._id,
      project_id: c.projectId !== undefined ? c.projectId : c.project_id,
      system_name: c.systemName !== undefined ? c.systemName : c.system_name,
      component_name: c.componentName !== undefined ? c.componentName : c.component_name,
      status: c.status,
      tester_name: c.testerName !== undefined ? c.testerName : c.tester_name,
      signature_data: c.signatureData !== undefined ? c.signatureData : c.signature_data,
      test_date: c.testDate !== undefined ? c.testDate : c.test_date
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/commissioning/:itemId/sign', async (req, res) => {
  const { tester_name, signature_data } = req.body;
  try {
    const item = await CommissioningItem.findByIdAndUpdate(req.params.itemId, {
      status: 'Certified',
      testerName: tester_name,
      tester_name,
      signatureData: signature_data,
      signature_data,
      testDate: new Date(),
      test_date: new Date().toISOString()
    }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/commissioning/copilot-check', async (req, res) => {
  try {
    const items = await CommissioningItem.find();
    const alerts = items.map(c => ({
      system: c.systemName || c.system_name,
      check: c.componentName || c.component_name,
      status: c.status === 'Certified' || c.status === 'Tested' ? 'Passed' : 'Failed',
      observation: c.status === 'Certified' || c.status === 'Tested' 
        ? 'Nominal compliance captured.' 
        : 'Voltage transient sag exceeded 12% on step load change.'
    }));
    addAgentLog(3, { action: 'Run commissioning qa checklist diagnostic', result: 'Checklist compliance diagnostic complete' });
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. RFIs
app.get('/api/v1/rfis/project/:projectId', async (req, res) => {
  try {
    const rfis = await RFI.find({ projectId: req.params.projectId });
    res.json(rfis.map(r => ({
      id: r._id,
      project_id: r.projectId !== undefined ? r.projectId : r.project_id,
      title: r.title,
      question: r.question,
      response: r.response,
      status: r.status,
      asked_by: r.askedBy !== undefined ? r.askedBy : r.asked_by,
      answered_by: r.answeredBy !== undefined ? r.answeredBy : r.answered_by,
      created_at: r.createdAt !== undefined ? r.createdAt : r.created_at
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/rfis/', authenticateJWT, async (req, res) => {
  const { project_id, title, question } = req.body;
  try {
    const askedBy = req.user ? req.user.full_name : 'Engineer';
    const rfi = await RFI.create({
      projectId: project_id,
      project_id,
      title,
      question,
      askedBy,
      asked_by: askedBy,
      status: 'Open'
    });

    // Create notification about RFI
    await Notification.create({
      projectId: project_id,
      project_id,
      message: `New RFI raised: ${title}`,
      type: 'info',
      isRead: false,
      is_read: false
    });

    res.json(rfi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/rfis/:rfiId/respond', authenticateJWT, async (req, res) => {
  const { response } = req.body;
  try {
    const answeredBy = req.user ? req.user.full_name : 'Admin';
    const rfi = await RFI.findByIdAndUpdate(req.params.rfiId, {
      response,
      status: 'Closed',
      answeredBy,
      answered_by: answeredBy
    }, { new: true });
    res.json(rfi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. AI Search / Agents RAG chat
app.get('/api/v1/ai/agents/project-knowledge-rfi', async (req, res) => {
  const query = req.query.query || '';
  try {
    // Dynamic cognitive search in Documents
    const docs = await Document.find();
    const matchingDocs = docs.filter(d => 
      d.filename.toLowerCase().includes(query.toLowerCase()) || 
      (d.ocrText && d.ocrText.toLowerCase().includes(query.toLowerCase()))
    );

    if (matchingDocs.length > 0) {
      addAgentLog(4, { action: `RAG search query: "${query}"`, result: `Found matching document: ${matchingDocs[0].filename}` });
      res.json({
        answer: `Retrieval-Augmented Generation (RAG) found compliance references inside document "${matchingDocs[0].filename}". The document text indicates: "${matchingDocs[0].ocrText || 'Document loaded without text.'}"`,
        sources: matchingDocs.map(d => d.filename)
      });
    } else {
      addAgentLog(4, { action: `RAG search query: "${query}"`, result: 'Fallback RFI answer used' });
      res.json({
        answer: `Resolved RFI for "${query}". Recommending copper busways instead of aluminum because of a 14-day production constraint variance.`,
        sources: ['RFI-104_Response_Fuel_System_Redesign.pdf']
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/ai/agents/schedule-risk', (req, res) => {
  addAgentLog(1, { action: 'Run predictive schedule risk assessment', result: '1 schedule risk vector resolved' });
  res.json([
    { activity: 'HVAC Chiller Delivery & Rigging', original_date: '2026-09-15', predicted_delay_days: 24, probability: 85, impact: 'Critical Path', reasons: 'Logistics bottleneck at manufacturer facility, crane leasing delays.' }
  ]);
});

app.post('/api/v1/ai/chat', async (req, res) => {
  const { query, language } = req.body;
  try {
    // Simulated AI Backend Logic using semantic RAG
    const aiResponse = `(AI Insight) Analyzing your query: "${query}". Based on project blueprints and recently ingested specifications, I recommend inspecting the chiller water loop valves and confirming secondary containment for the generator belly tanks.`;
    const sources = ['Mechanical_Drawing_M101.pdf', 'Submittal_York_Chiller.pdf'];
    
    // Optional translation simulation if language is not English
    let finalResponse = aiResponse;
    if (language && language !== 'en') {
       finalResponse = `[Translated to ${language}] ${aiResponse}`;
    }

    res.json({
      response: finalResponse,
      sources: sources
    });
  } catch (err) {
    res.status(500).json({ message: 'AI Engine Error' });
  }
});

// Helper to add log entries for AI agents
function addAgentLog(agentId, payload) {
  const Log = require('./localDb').Log;
  const logEntry = {
    id: Math.random().toString(36).substring(2, 9),
    agentId,
    timestamp: new Date().toISOString(),
    ...payload
  };
  Log.create(logEntry);
}

// 1. Logs endpoint for each agent
app.get('/api/v1/agents/:agentId/logs', async (req, res) => {
  try {
    const Log = require('./localDb').Log;
    const logs = await Log.find({ agentId: req.params.agentId });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Monitoring endpoints
app.get('/api/v1/monitoring/shipments', async (req, res) => {
  try {
    const PurchaseOrder = require('./localDb').PurchaseOrder;
    const pos = await PurchaseOrder.find();
    res.json(pos.map(p => ({
      id: p.id,
      po_number: p.po_number || p.poNumber,
      item_name: p.item_name || p.itemName,
      status: p.status,
      tracking_status: p.tracking_status,
      delivery_date: p.delivery_date
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/monitoring/commissioning', async (req, res) => {
  try {
    const CommissioningItem = require('./localDb').CommissioningItem;
    const items = await CommissioningItem.find();
    res.json(items.map(i => ({
      id: i.id,
      system_name: i.system_name || i.systemName,
      component_name: i.component_name || i.componentName,
      status: i.status,
      tester_name: i.tester_name || i.testerName,
      test_date: i.test_date
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. Reports exports
app.get('/api/v1/reports/pdf', (req, res) => {
  res.send('Simulated PDF Report Data Stream');
});

app.get('/api/v1/reports/excel', (req, res) => {
  res.send('Simulated Excel Report Data Stream');
});

// ---------------- Boot up Server & Mongoose Connection ----------------

const useLocalDb = () => {
  console.log("Falling back to local JSON database...");
  const localDb = require('./localDb');
  User = localDb.User;
  Project = localDb.Project;
  RFI = localDb.RFI;
  QualityIssue = localDb.QualityIssue;
  PurchaseOrder = localDb.PurchaseOrder;
  CommissioningItem = localDb.CommissioningItem;
  Document = localDb.Document;
  Notification = localDb.Notification;
  
  app.listen(PORT, () => {
    console.log(`Node.js + Express Backend Server running on port ${PORT} (LOCAL JSON DB Mode)`);
  });
};

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    User = mongoose.model('User');
    Project = mongoose.model('Project');
    RFI = mongoose.model('RFI');
    QualityIssue = mongoose.model('QualityIssue');
    PurchaseOrder = mongoose.model('PurchaseOrder');
    CommissioningItem = mongoose.model('CommissioningItem');
    Document = mongoose.model('Document');
    Notification = mongoose.model('Notification');
    seedDatabase();
    app.listen(PORT, () => {
      console.log(`Node.js + Express Backend Server running on port ${PORT} (MONGODB Mode)`);
    });
  })
  .catch(err => {
    console.error('Mongoose connection error:', err.message);
    useLocalDb();
  });

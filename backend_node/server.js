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
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  question: { type: String, required: true },
  response: { type: String, default: null },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  askedBy: { type: String, required: true },
  answeredBy: { type: String, default: null }
});

const QualityIssueSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'UnderReview', 'Resolved'], default: 'Open' },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  reportedBy: { type: String, required: true },
  assignedTo: { type: String }
});

const PurchaseOrderSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
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
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  systemName: { type: String, required: true },
  componentName: { type: String, required: true },
  status: { type: String, enum: ['NotStarted', 'InProgress', 'Tested', 'Failed'], default: 'NotStarted' },
  testerName: { type: String },
  testDate: { type: Date }
});

const DocumentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  docType: { type: String, default: 'Specification' },
  version: { type: Number, default: 1 },
  approvedStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  uploadedBy: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  ocrText: { type: String, default: '' }
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const RFI = mongoose.model('RFI', RFISchema);
const QualityIssue = mongoose.model('QualityIssue', QualityIssueSchema);
const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
const CommissioningItem = mongoose.model('CommissioningItem', CommissioningItemSchema);
const Document = mongoose.model('Document', DocumentSchema);

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

    const p1 = projects[0]._id;
    const p2 = projects[1]._id;

    // Seed RFIs
    await RFI.create([
      { projectId: p1, title: 'Generator Belly Tank Containment Dike', question: 'Does section 4.2.1 require a separate containment dike around belly tanks?', response: 'Yes. Local permits require an additional 110% capacity concrete dike.', status: 'Closed', askedBy: 'Marcus Aurelius', answeredBy: 'Sarah Connor' },
      { projectId: p1, title: 'UPS Busway Copper vs Aluminum', question: 'Can we substitute copper feeder busways with aluminum to save lead time?', status: 'Open', askedBy: 'Marcus Aurelius' }
    ]);

    // Seed Quality Issues
    await QualityIssue.create([
      { projectId: p1, title: 'Lithium-Ion UPS Ventilation Rating', description: 'HVAC specifies 8 ACH but standards require 10 ACH.', status: 'Open', severity: 'High', reportedBy: 'Sarah Connor', assignedTo: 'Alex Mercer' },
      { projectId: p2, title: 'Foundation Micro-cracks on Pad 3', description: 'Cracks found on pad, tested compliant but needs sealant.', status: 'UnderReview', severity: 'Medium', reportedBy: 'Alex Mercer', assignedTo: 'Marcus Aurelius' }
    ]);

    // Seed Purchase Orders
    await PurchaseOrder.create([
      { projectId: p1, poNumber: 'PO-2026-001', itemName: 'Caterpillar 2MW Diesel Generator', quantity: 6, cost: 4200000.0, supplierName: 'Apex Power Systems Ltd', status: 'Approved', trackingStatus: 'In Production', supplierRisk: 'Medium', deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { projectId: p2, poNumber: 'PO-2026-002', itemName: 'York 500-Ton Centrifugal Chiller', quantity: 4, cost: 1850000.0, supplierName: 'Boreas Cooling Systems', status: 'Shipped', trackingStatus: 'In Transit', supplierRisk: 'High', deliveryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000) }
    ]);

    // Seed Commissioning
    await CommissioningItem.create([
      { projectId: p1, systemName: 'Electrical', componentName: 'UPS Rack A-1 Static Switch Test', status: 'Tested', testerName: 'Alex Mercer', testDate: new Date() },
      { projectId: p1, systemName: 'HVAC', componentName: 'Chiller-1 Water Loop Balance', status: 'InProgress', testerName: 'Alex Mercer' }
    ]);

    // Seed Documents
    await Document.create([
      { projectId: p1, filename: 'General_Specifications_Electrical_Subsystems.pdf', filePath: './uploads/General_Specifications_Electrical_Subsystems.pdf', docType: 'Specification', version: 1, approvedStatus: 'Approved', uploadedBy: 'Sarah Connor', ocrText: 'SECTION 26 32 13 - Standby generator sets. Double-walled tank with 110% containment.' }
    ]);

    console.log('MongoDB Seeding complete.');
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  }
}

// ---------------- REST APIs ----------------

// 1. Auth Endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
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

// 2. Projects & Dashboard APIs
app.get('/api/v1/projects/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects.map(p => ({
      id: p._id,
      name: p.name,
      location: p.location,
      capacity_mw: p.capacityMw,
      budget_million: p.budgetMillion,
      budget_used: p.budgetUsed,
      status: p.status,
      ai_health_score: p.aiHealthScore
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/projects/', async (req, res) => {
  const { name, location, capacity_mw, budget_million } = req.body;
  try {
    const project = await Project.create({ name, location, capacityMw: capacity_mw, budgetMillion: budget_million });
    res.json(project);
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
    const totalBudget = projects.reduce((acc, p) => acc + p.budgetMillion, 0);
    const spentBudget = projects.reduce((acc, p) => acc + p.budgetUsed, 0);
    
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

// 3. Document Endpoints
const upload = multer({ dest: 'uploads/' });

app.get('/api/v1/documents/', async (req, res) => {
  try {
    const docs = await Document.find();
    res.json(docs.map(d => ({
      id: d._id,
      filename: d.filename,
      doc_type: d.docType,
      approved_status: d.approvedStatus,
      version: d.version,
      uploaded_by: d.uploadedBy,
      uploaded_at: d.uploadedAt,
      ocr_text: d.ocrText
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const doc = await Document.create({
      filename: req.file.originalname,
      filePath: req.file.path,
      docType: req.body.doc_type || 'Specification',
      uploadedBy: req.body.uploaded_by || 'System',
      ocrText: 'Parsed document text via OCR simulation: STANDBY DIESEL GENERATORS. Comply with EPA Tier 4 parameters.'
    });
    res.json(doc);
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
    res.json(pos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Quality NCR
app.get('/api/v1/quality/', async (req, res) => {
  try {
    const issues = await QualityIssue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Commissioning Checklist
app.get('/api/v1/commissioning/', async (req, res) => {
  try {
    const items = await CommissioningItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. AI Search / Agents RAG chat
app.get('/api/v1/ai/agents/project-knowledge-rfi', (req, res) => {
  const query = req.query.query || '';
  res.json({
    answer: `Resolved RFI for "${query}". Recommending copper busways instead of aluminum because of a 14-day production constraint variance.`,
    sources: ['RFI-104_Response_Fuel_System_Redesign.pdf']
  });
});

app.get('/api/v1/ai/agents/schedule-risk', (req, res) => {
  res.json([
    { activity: 'HVAC Chiller Delivery', original_date: '2026-09-15', predicted_delay_days: 24, probability: 85, impact: 'Critical Path', reasons: 'Logistics bottlenecks' }
  ]);
});

// 8. Reports exports
app.get('/api/v1/reports/pdf', (req, res) => {
  res.send('Simulated PDF Report Data Stream');
});

app.get('/api/v1/reports/excel', (req, res) => {
  res.send('Simulated Excel Report Data Stream');
});

// ---------------- Boot up Server & Mongoose Connection ----------------

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    seedDatabase();
    app.listen(PORT, () => {
      console.log(`Node.js + Express Backend Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Mongoose connection error:', err);
  });

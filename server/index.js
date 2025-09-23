import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment. Set it in server/.env');
}

// Mongo connection
async function connectMongo() {
  try {
    await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB || 'citybeatflow' });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Mongo connection error:', err.message);
  }
}
connectMongo();

// Email transporter (nodemailer) - configured via environment variables
let mailer = null;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || 'no-reply@citybeatflow.example';

if (smtpHost && smtpPort && smtpUser && smtpPass) {
  try {
    mailer = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    // verify transporter
    mailer.verify().then(() => console.log('SMTP transporter ready')).catch((e) => console.warn('SMTP verify failed:', e.message));
  } catch (e) {
    console.warn('Failed to initialize mailer:', e.message);
    mailer = null;
  }
} else {
  console.log('SMTP not fully configured, emails will be skipped. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS to enable.');
}

async function sendEmail(to, subject, text, html) {
  if (!mailer) {
    console.log(`Email skipped (no SMTP): to=${to}, subject=${subject}`);
    return false;
  }
  try {
    await mailer.sendMail({
      from: smtpFrom,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err && err.message ? err.message : err);
    return false;
  }
}

// Schemas
const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'ngo', 'admin'], default: 'citizen' },
    organization: { type: String },
  },
  { timestamps: true }
);
const IssueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'other' },
    status: { type: String, enum: ['pending', 'in-progress', 'resolved', 'rejected', 'claimed', 'community-in-progress', 'solved'], default: 'pending' },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      address: { type: String, default: '' },
    },
    reportedBy: { type: String, default: 'anonymous' },
    reporterEmail: { type: String, index: true },
    reportedAt: { type: Date, default: Date.now },
    verificationCount: { type: Number, default: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    attachments: [{ url: String, filename: String, contentType: String }],
    statusHistory: [{ status: String, date: Date, by: String }],
    updates: [{ text: String, date: Date, by: String }],
    claimedByNGO: { type: String, default: '' }, // NGO name/id
    claimStatus: { type: String, enum: ['none', 'claimed', 'community-in-progress', 'solved'], default: 'none' },
    claimUpdates: [{ update: String, date: Date, ngo: String }],
    escalated: { type: Boolean, default: false }, // For reports not processed in 10 days
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  },
  { timestamps: true }
);

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  ngo: { type: String, required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  date: { type: Date, required: true },
  volunteers: [{ name: String, email: String }],
  wishlist: [{ item: String, quantity: Number, donated: Number }],
});

const NGOSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profile: { type: String },
  impactStats: {
    issuesClaimed: { type: Number, default: 0 },
    issuesSolved: { type: Number, default: 0 },
    volunteerHours: { type: Number, default: 0 },
    resourcesRaised: { type: Number, default: 0 },
  },
  followers: [{ email: String }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

const ProfileSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    email: { type: String, index: true },
    phone: { type: String, default: '' },
    gender: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    notifyByEmail: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
const Issue = mongoose.model('Issue', IssueSchema);
const Profile = mongoose.model('Profile', ProfileSchema);
const Event = mongoose.model('Event', EventSchema);
const NGO = mongoose.model('NGO', NGOSchema);

// Routes
app.get('/health', (_req, res) => res.json({ ok: true }));

// Make sure uploads directory exists and serve it statically
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const upload = multer({ dest: uploadsDir });

// Auth
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password, role, organization, rolePasscode } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email and password are required' });
    }
    const normalizedRole = ['citizen', 'ngo', 'admin'].includes(role) ? role : 'citizen';
    // Enforce role passcode only for NGO/Admin at SIGNUP
    if ((normalizedRole === 'ngo' && rolePasscode !== 'NGO25') || (normalizedRole === 'admin' && rolePasscode !== 'ADMIN25')) {
      return res.status(403).json({ error: 'Invalid role passcode' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash, role: normalizedRole, organization });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- NGO specific auth (separate route for NGOs) ---
app.post('/api/ngo/auth/signup', async (req, res) => {
  try {
    const { name, email, password, profile, rolePasscode } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });
    // simple passcode check to prevent casual signups
    if (rolePasscode !== 'NGO25') return res.status(403).json({ error: 'Invalid NGO passcode' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName: name, email, passwordHash, role: 'ngo', organization: name });
    const ngo = await NGO.create({ name, email, profile: profile || '', impactStats: { issuesClaimed: 0, issuesSolved: 0, volunteerHours: 0, resourcesRaised: 0 } });
    const token = jwt.sign({ sub: user._id.toString(), role: 'ngo' }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.status(201).json({ token, ngo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'NGO signup failed' });
  }
});

app.post('/api/ngo/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const user = await User.findOne({ email });
    if (!user || user.role !== 'ngo') return res.status(401).json({ error: 'Invalid NGO credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid NGO credentials' });
    const ngo = await NGO.findOne({ email });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ token, ngo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'NGO login failed' });
  }
});

// Issues

// Get issues by role
app.get('/api/issues', async (req, res) => {
  const reporter = req.query.reporter?.toString();
  const claimedByNGO = req.query.claimedByNGO?.toString();
  let query = {};
  if (reporter) query = { reporterEmail: reporter };
  if (claimedByNGO) query = { claimedByNGO };
  const issues = await Issue.find(query).sort({ createdAt: -1 });
  res.json(issues);
});

// Get single issue by id
app.get('/api/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// Escalate reports not processed in 10 days
app.get('/api/issues/escalated', async (_req, res) => {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const escalated = await Issue.find({ status: 'pending', reportedAt: { $lte: tenDaysAgo } });
  res.json(escalated);
});

// Claim issue (NGO)
app.post('/api/issues/:id/claim', async (req, res) => {
  const { id } = req.params;
  const { ngo } = req.body;
  const issue = await Issue.findByIdAndUpdate(id, { claimedByNGO: ngo, claimStatus: 'claimed', status: 'community-in-progress' }, { new: true });
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  // notify reporter if email present
  if (issue.reporterEmail) {
    try {
      const profile = await Profile.findOne({ email: issue.reporterEmail });
      if (!profile || profile.notifyByEmail !== false) {
        const subject = `Your report "${issue.title}" was adopted by ${ngo}`;
        const text = `Good news — ${ngo} has adopted your report titled: ${issue.title}. The organization will follow up and update progress.`;
        sendEmail(issue.reporterEmail, subject, text, `<p>${text}</p>`).catch(() => {});
      } else {
        console.log(`Skipping email to ${issue.reporterEmail} because notifyByEmail is false`);
      }
    } catch (e) {
      // do not block the response for email errors
      console.warn('Error checking profile for notify preference:', e && e.message ? e.message : e);
    }
  }
  res.json(issue);
});

// NGO claim via NGO route - increments NGO stats and records status history
app.post('/api/ngo/issues/:id/claim', async (req, res) => {
  const { id } = req.params;
  const { ngoEmail } = req.body;
  const ngo = await NGO.findOne({ email: ngoEmail });
  if (!ngo) return res.status(404).json({ error: 'NGO not found' });
  const issue = await Issue.findById(id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  issue.claimedByNGO = ngo.name;
  issue.claimStatus = 'claimed';
  issue.status = 'community-in-progress';
  issue.statusHistory = issue.statusHistory || [];
  issue.statusHistory.push({ status: issue.status, date: new Date(), by: ngo.name });
  await issue.save();
  ngo.impactStats.issuesClaimed = (ngo.impactStats.issuesClaimed || 0) + 1;
  await ngo.save();
  res.json(issue);
});

// NGO posts updates to an issue (visible to reporter and verifiers)
app.post('/api/ngo/issues/:id/update', async (req, res) => {
  const { id } = req.params;
  const { ngoEmail, text, status } = req.body || {};
  const ngo = await NGO.findOne({ email: ngoEmail });
  const issue = await Issue.findById(id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  const updateObj = { text: text || '', date: new Date(), by: ngo ? ngo.name : (ngoEmail || 'ngo') };
  issue.updates = issue.updates || [];
  issue.updates.push(updateObj);
  if (status) {
    issue.statusHistory = issue.statusHistory || [];
    issue.statusHistory.push({ status, date: new Date(), by: ngo ? ngo.name : (ngoEmail || 'ngo') });
    issue.status = status;
    if (status === 'solved' || status === 'resolved') {
      // increment NGO solved counter
      if (ngo) {
        ngo.impactStats.issuesSolved = (ngo.impactStats.issuesSolved || 0) + 1;
        await ngo.save();
      }
    }
  }
  await issue.save();
  // notify reporter about NGO update if they opted in
  if (issue.reporterEmail) {
    try {
      const profile = await Profile.findOne({ email: issue.reporterEmail });
      if (!profile || profile.notifyByEmail !== false) {
        const subject = `Update on your report: ${issue.title}`;
        const bodyText = `${updateObj.by} posted an update: ${updateObj.text || '(status change)'}${status ? '\nNew status: ' + status : ''}`;
        sendEmail(issue.reporterEmail, subject, bodyText, `<p>${bodyText.replace(/\n/g, '<br/>')}</p>`).catch(() => {});
      } else {
        console.log(`Skipping NGO update email to ${issue.reporterEmail} because notifyByEmail is false`);
      }
    } catch (e) {
      console.warn('Error checking profile for notify preference:', e && e.message ? e.message : e);
    }
  }
  res.json(issue);
});

// Add claim update (NGO)
app.post('/api/issues/:id/claim-update', async (req, res) => {
  const { id } = req.params;
  const { update, ngo } = req.body;
  const issue = await Issue.findByIdAndUpdate(id, { $push: { claimUpdates: { update, date: new Date(), ngo } } }, { new: true });
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue);
});

// Admin/NGO update status
app.put('/api/issues/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const issue = await Issue.findByIdAndUpdate(id, { status }, { new: true });
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  // add to status history
  try {
    issue.statusHistory = issue.statusHistory || [];
    issue.statusHistory.push({ status, date: new Date(), by: 'admin' });
    await issue.save();
  } catch (e) {
    // ignore
  }
  // email reporter
  if (issue.reporterEmail) {
    try {
      const profile = await Profile.findOne({ email: issue.reporterEmail });
      if (!profile || profile.notifyByEmail !== false) {
        const subject = `Status update for your report: ${issue.title}`;
        const text = `The status of your report "${issue.title}" has changed to: ${status}`;
        sendEmail(issue.reporterEmail, subject, text, `<p>${text}</p>`).catch(() => {});
      } else {
        console.log(`Skipping status-change email to ${issue.reporterEmail} because notifyByEmail is false`);
      }
    } catch (e) {
      console.warn('Error checking profile for notify preference:', e && e.message ? e.message : e);
    }
  }
  res.json(issue);
});
// Create event (NGO)
app.post('/api/events', async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

// Get events (by NGO or all)
app.get('/api/events', async (req, res) => {
  const ngo = req.query.ngo?.toString();
  const query = ngo ? { ngo } : {};
  const events = await Event.find(query);
  res.json(events);
});

// Volunteer signup
app.post('/api/events/:id/volunteer', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const event = await Event.findByIdAndUpdate(id, { $push: { volunteers: { name, email } } }, { new: true });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// Wishlist donation
app.post('/api/events/:id/donate', async (req, res) => {
  const { id } = req.params;
  const { item, quantity } = req.body;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const wishlistItem = event.wishlist.find(w => w.item === item);
  if (wishlistItem) wishlistItem.donated += quantity;
  await event.save();
  res.json(event);
});
// Get NGO public profile
app.get('/api/ngos/:email', async (req, res) => {
  const ngo = await NGO.findOne({ email: req.params.email }).populate('events');
  if (!ngo) return res.status(404).json({ error: 'NGO not found' });
  res.json(ngo);
});

// Follow NGO
app.post('/api/ngos/:email/follow', async (req, res) => {
  const ngo = await NGO.findOneAndUpdate({ email: req.params.email }, { $push: { followers: { email: req.body.email } } }, { new: true });
  if (!ngo) return res.status(404).json({ error: 'NGO not found' });
  res.json(ngo);
});

// Add wishlist item to an event
app.post('/api/events/:id/wishlist', async (req, res) => {
  const { id } = req.params;
  const { item, quantity } = req.body || {};
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  event.wishlist = event.wishlist || [];
  event.wishlist.push({ item, quantity: quantity || 1, donated: 0 });
  await event.save();
  res.json(event);
});

// Donate to a specific wishlist item by name
app.post('/api/events/:id/donate-item', async (req, res) => {
  const { id } = req.params;
  const { item, quantity } = req.body || {};
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const wishlistItem = event.wishlist.find(w => w.item === item);
  if (!wishlistItem) return res.status(404).json({ error: 'Wishlist item not found' });
  wishlistItem.donated = (wishlistItem.donated || 0) + (quantity || 1);
  await event.save();
  res.json(event);
});

// NGO impact stats (public)
app.get('/api/ngos/:email/stats', async (req, res) => {
  const ngo = await NGO.findOne({ email: req.params.email });
  if (!ngo) return res.status(404).json({ error: 'NGO not found' });
  // Return stored impactStats and compute any additional aggregates if needed
  res.json({ impactStats: ngo.impactStats, followers: (ngo.followers || []).length });
});

app.post('/api/issues', async (req, res) => {
  const body = req.body || {};
  const createPayload = {
    title: body.title,
    description: body.description,
    category: body.category || 'other',
    status: body.status || 'pending',
    location: body.location || { lat: 0, lng: 0, address: '' },
    reportedBy: body.reportedBy || 'anonymous',
    reporterEmail: body.reporterEmail || undefined,
    reportedAt: body.reportedAt || new Date(),
    verificationCount: body.verificationCount || 0,
    priority: body.priority || 'medium',
    attachments: body.attachments || [],
    statusHistory: body.statusHistory || [],
    updates: body.updates || [],
  };
  const issue = await Issue.create(createPayload);
  res.status(201).json(issue);
});

// Issue update: status/progress changes
app.put('/api/issues/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body || {};
  const issue = await Issue.findByIdAndUpdate(id, update, { new: true });
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue);
});

// Upload attachment for an issue (multipart/form-data)
app.post('/api/issues/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file is required' });
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const fileUrl = `/uploads/${file.filename}`;
    issue.attachments = issue.attachments || [];
    issue.attachments.push({ url: fileUrl, filename: file.originalname, contentType: file.mimetype });
    await issue.save();
    res.json(issue);
  } catch (e) {
    console.error('Upload failed', e && e.message ? e.message : e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Add an update (progress/status) to an issue with audit
app.post('/api/issues/:id/add-update', async (req, res) => {
  const { id } = req.params;
  const { text, status, by } = req.body || {};
  const updateObj = { text: text || '', date: new Date(), by: by || 'system' };
  const statusEntry = status ? { status, date: new Date(), by: by || 'system' } : null;

  const issue = await Issue.findById(id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.updates = issue.updates || [];
  issue.updates.push(updateObj);
  if (statusEntry) {
    issue.statusHistory = issue.statusHistory || [];
    issue.statusHistory.push(statusEntry);
    issue.status = status;
  }

  await issue.save();
  // notify reporter if present
  if (issue.reporterEmail) {
    try {
      const profile = await Profile.findOne({ email: issue.reporterEmail });
      if (!profile || profile.notifyByEmail !== false) {
        const subject = `Update on your report: ${issue.title}`;
        const text = `${updateObj.by} posted: ${updateObj.text}`;
        sendEmail(issue.reporterEmail, subject, text, `<p>${text}</p>`).catch(() => {});
      } else {
        console.log(`Skipping add-update email to ${issue.reporterEmail} because notifyByEmail is false`);
      }
    } catch (e) {
      console.warn('Error checking profile for notify preference:', e && e.message ? e.message : e);
    }
  }
  res.json(issue);
});

// Escalate a specific issue (mark escalated)
app.post('/api/issues/:id/escalate', async (req, res) => {
  const { id } = req.params;
  const issue = await Issue.findByIdAndUpdate(id, { escalated: true }, { new: true });
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue);
});

// Stats endpoint
app.get('/api/stats', async (_req, res) => {
  const total = await Issue.countDocuments();
  const pending = await Issue.countDocuments({ status: 'pending' });
  const inProgress = await Issue.countDocuments({ status: 'in-progress' });
  const resolved = await Issue.countDocuments({ status: 'resolved' });
  res.json({ total, pending, inProgress, resolved });
});

// Profiles
app.get('/api/profile', async (req, res) => {
  const email = req.query.email?.toString();
  if (!email) return res.status(400).json({ error: 'email is required' });
  let profile = await Profile.findOne({ email });
  if (!profile) {
    // Seed profile from User if available
    const user = await User.findOne({ email });
    if (user) {
      profile = await Profile.create({ fullName: user.fullName || '', email: user.email, notifyByEmail: true });
    }
  }
  res.json(profile || null);
});

app.post('/api/profile', async (req, res) => {
  const body = req.body || {};
  if (!body.email) return res.status(400).json({ error: 'email is required' });
  // Ensure notifyByEmail is boolean (default true)
  if (typeof body.notifyByEmail === 'undefined') body.notifyByEmail = true;
  const profile = await Profile.findOneAndUpdate({ email: body.email }, body, { new: true, upsert: true });
  res.json(profile);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});



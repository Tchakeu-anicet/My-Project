import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { buildRoleAwareReply, buildGeminiRequestPayload, extractGeminiReply, buildGeminiHealthResponse } from './chatbotHelpers.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 25000);
const CAMPAY_BASE_URL = (process.env.CAMPAY_BASE_URL || 'https://sandbox.campay.net').replace(/\/$/, '');
const CAMPAY_API_KEY = process.env.CAMPAY_API_KEY || '';
const CAMPAY_API_SECRET = process.env.CAMPAY_API_SECRET || '';
const CAMPAY_CLIENT_ID = process.env.CAMPAY_CLIENT_ID || '';
const CAMPAY_CLIENT_SECRET = process.env.CAMPAY_CLIENT_SECRET || '';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const WS_PORT = Number(process.env.WS_PORT || 3002);
const channelClients = new Map();

const broadcastToChannel = (channelId, payload) => {
  const clients = channelClients.get(channelId) || new Set();
  Array.from(clients).forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(payload));
    }
  });
};

const persistMessage = (message) => {
  const db = readDb();
  db.messages = Array.isArray(db.messages) ? db.messages : [];
  db.messages.push(message);
  writeDb(db);

  const channelIndex = (db.messages || []).findIndex((item) => item.channelId === message.channelId);
  if (channelIndex !== -1) {
    const channel = db.messages[channelIndex];
    if (channel) {
      // no-op: message persistence is already handled above
    }
  }

  const channels = Array.isArray(db.channels) ? db.channels : [];
  if (Array.isArray(channels)) {
    const nextChannels = channels.map((channel) => {
      if (channel.id === message.channelId) {
        return {
          ...channel,
          lastMessage: message.text,
          updatedAt: message.createdAt,
        };
      }
      return channel;
    });

    db.channels = nextChannels;
    writeDb(db);
  }

  return message;
};

const defaultDb = () => ({
  users: [],
  jobs: [],
  applications: [],
  savedJobs: [],
  notifications: [],
  messages: [],
  reports: [],
  reviews: [],
  bookings: [],
});

const ensureDataFile = () => {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDb(), null, 2));
  }
};

const readDb = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...defaultDb(), ...parsed } : defaultDb();
  } catch {
    return defaultDb();
  }
};

const writeDb = (db) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
};

const createDefaultSeekerProfile = () => ({
  enabled: true,
  completed: false,
  jobCategories: [],
  workTypes: [],
  customJobCategories: [],
});

const createDefaultRecruiterProfile = () => ({
  enabled: false,
  completed: false,
  workerCategories: [],
  customWorkerCategories: [],
  verificationStatus: 'not_started',
});

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, emailVerificationCode, passwordResetCode, ...safeUser } = user;
  return safeUser;
};

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const sendEmailCode = (email, purpose, code) => {
  console.log(`[EMAIL:${purpose}] to=${email} code=${code}`);
  return {
    ok: true,
    delivery: 'console-log',
    email,
    purpose,
    code,
  };
};

const normalizePhone = (value) => {
  const raw = String(value || '').replace(/\s+/g, '').replace(/[^\d+]/g, '');
  if (!raw) return '';
  if (raw.startsWith('+237')) return raw;
  if (raw.startsWith('237')) return `+${raw}`;
  if (raw.startsWith('0')) return `+237${raw.slice(1)}`;
  return raw.startsWith('+') ? raw : `+${raw}`;
};

const createAdminUser = () => ({
  id: 'user-admin-001',
  fullName: 'System Admin',
  email: 'admin@jobfind.com',
  password: 'admin123',
  gender: 'Male',
  phone: '+237600000000',
  city: 'Douala',
  role: 'admin',
  accountStatus: 'ACTIVE',
  isPremium: true,
  emailVerified: true,
  seekerProfile: createDefaultSeekerProfile(),
  recruiterProfile: createDefaultRecruiterProfile(),
  adminProfile: {
    adminID: 'ADM-001',
    department: 'Platform Operations',
    permissions: ['MANAGE_USERS', 'MANAGE_JOBS', 'MANAGE_REPORTS', 'MONITOR_PLATFORM'],
  },
  workplace: {
    id: 'workplace-admin',
    type: 'admin',
    name: 'Admin Control Center',
    description: 'Platform management & analytics',
    createdAt: new Date().toISOString(),
    active: true,
  },
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const seedInitialData = () => {
  const db = readDb();

  if (!db.users.some((user) => user.email && user.email.toLowerCase() === 'admin@jobfind.com')) {
    db.users.push(createAdminUser());
  }

  if (!db.jobs.length) {
    db.jobs.push(
      {
        id: 'job-001',
        jobTitle: 'Senior Frontend Developer',
        companyName: 'JobFind Labs',
        location: 'Douala',
        description: 'Build modern user interfaces for recruitment and job discovery experiences.',
        salary: 320000,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        employmentType: 'Full-time',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        requirements: 'React, TypeScript, UI design, teamwork',
        recruiterId: 'user-admin-001',
        category: 'Technology',
        featured: true,
      },
      {
        id: 'job-002',
        jobTitle: 'Community Outreach Assistant',
        companyName: 'CivicWorks',
        location: 'Yaoundé',
        description: 'Support community engagement and assist with outreach campaigns for social services.',
        salary: 160000,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        employmentType: 'Contract',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
        requirements: 'Strong communication, field outreach, reporting',
        recruiterId: 'user-admin-001',
        category: 'Community & Social',
        featured: false,
      },
      {
        id: 'job-003',
        jobTitle: 'Household Caregiver',
        companyName: 'Private Family Household',
        location: 'Bafoussam',
        description: 'Provide practical support to a household with daily care, organization and companionship.',
        salary: 120000,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        employmentType: 'Part-time',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
        requirements: 'Empathy, reliability, household support experience',
        recruiterId: 'user-admin-001',
        category: 'Household Services',
        featured: false,
      }
    );
  }

  writeDb(db);
};

seedInitialData();

const buildCampayCandidates = (payload) => {
  const base = CAMPAY_BASE_URL;
  const reference = payload.reference || `JOBFIND-${Date.now()}`;
  const phone = normalizePhone(payload.phone);

  return [
    `${base}/api/v1/collect`,
    `${base}/api/v1/transactions/collect`,
    `${base}/api/v1/payments/collect`,
    `${base}/api/v1/transaction/collect`,
  ].map((url) => ({
    url,
    body: {
      ...payload,
      reference,
      phone,
      currency: payload.currency || 'XAF',
      amount: Number(payload.amount || 0),
      description: payload.description || 'JobFind Premium Subscription',
    },
  }));
};

const makeCampayRequest = async (payload) => {
  const candidates = buildCampayCandidates(payload);
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const authHeaders = [];
  if (CAMPAY_API_KEY) authHeaders.push({ Authorization: `Bearer ${CAMPAY_API_KEY}` });
  if (CAMPAY_CLIENT_ID && CAMPAY_CLIENT_SECRET) {
    authHeaders.push({
      Authorization: `Basic ${Buffer.from(`${CAMPAY_CLIENT_ID}:${CAMPAY_CLIENT_SECRET}`).toString('base64')}`,
    });
  }
  if (CAMPAY_API_SECRET) {
    authHeaders.push({
      'x-api-key': CAMPAY_API_KEY || CAMPAY_API_SECRET,
      Authorization: `Bearer ${CAMPAY_API_SECRET}`,
    });
  }

  let lastError = null;

  for (const candidate of candidates) {
    for (const authHeader of authHeaders.length ? authHeaders : [{}]) {
      try {
        const response = await fetch(candidate.url, {
          method: 'POST',
          headers: {
            ...headers,
            ...authHeader,
          },
          body: JSON.stringify(candidate.body),
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          return { ok: true, status: 'SUCCESS', data, reference: candidate.body.reference };
        }

        lastError = data?.error || data?.message || `Campay request failed with status ${response.status}`;
      } catch (error) {
        lastError = error?.message || 'Campay request failed';
      }
    }
  }

  return {
    ok: false,
    status: 'ERROR',
    message: lastError || 'Unable to initiate Campay payment',
  };
};

const createFallbackReply = (query, userRole = 'visitor', userName = 'Guest') => {
  return buildRoleAwareReply(query, userRole, userName);
};

app.get('/api/health', (_req, res) => {
  res.json(buildGeminiHealthResponse(GEMINI_MODEL));
});

app.get('/api/db', (_req, res) => {
  res.json(readDb());
});

app.get('/api/test-gemini', async (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      ok: false,
      message: 'Missing GEMINI_API_KEY. Add it to the backend environment before testing the live AI.',
      provider: 'gemini',
      model: GEMINI_MODEL,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Reply with: Gemini API is responding correctly.' }],
          }],
        }),
      }
    );

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Gemini test failed');
    }

    const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || 'Gemini responded successfully.';

    return res.json({
      ok: true,
      message: 'Gemini API is responding correctly.',
      provider: 'gemini',
      model: GEMINI_MODEL,
      answer,
    });
  } catch (error) {
    console.error('Gemini test endpoint error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Gemini API did not respond successfully.',
      provider: 'gemini',
      model: GEMINI_MODEL,
      error: error.message,
    });
  }
});

app.get('/api/test-campay', async (_req, res) => {
  const hasKeys = Boolean(CAMPAY_API_KEY || CAMPAY_CLIENT_ID || CAMPAY_API_SECRET);

  if (!hasKeys) {
    return res.status(200).json({
      ok: false,
      message: 'Missing Campay credentials. Add your CAMPAY_API_KEY or CAMPAY_CLIENT_ID/CAMPAY_CLIENT_SECRET before testing the live payment API.',
      provider: 'campay',
    });
  }

  try {
    const payload = {
      amount: 100,
      phone: '+237670000000',
      currency: 'XAF',
      reference: `JOBFIND-TEST-${Date.now()}`,
      description: 'Campay connectivity test',
      operator: 'MTN',
    };

    const result = await makeCampayRequest(payload);

    return res.json({
      ok: result.ok,
      provider: 'campay',
      message: result.ok ? 'Campay API responded successfully.' : result.message,
      reference: result.reference,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      provider: 'campay',
      message: 'Campay test failed.',
      error: error.message,
    });
  }
});

app.post('/api/campay/create-payment', async (req, res) => {
  try {
    const { amount, phone, operator = 'MTN', planName, reference, userId } = req.body || {};
    const cleanAmount = Number(amount || 0);
    const cleanPhone = normalizePhone(phone);

    if (!cleanAmount || cleanAmount <= 0 || !cleanPhone) {
      return res.status(400).json({ ok: false, message: 'Valid amount and phone number are required.' });
    }

    const fullReference = reference || `JOBFIND-${(planName || 'PREMIUM').replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
    const result = await makeCampayRequest({
      amount: cleanAmount,
      phone: cleanPhone,
      operator,
      currency: 'XAF',
      reference: fullReference,
      description: planName ? `${planName} purchase` : 'JobFind Premium Subscription',
    });

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        message: result.message || 'Campay payment initiation failed.',
        provider: 'campay',
      });
    }

    const db = readDb();
    if (userId) {
      const userIndex = db.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        db.users[userIndex].subscription = {
          id: `sub-${Date.now()}`,
          plan: 'PREMIUM',
          planName: planName || 'Premium',
          status: 'PENDING',
          amount: cleanAmount,
          currency: 'XAF',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          campayPhone: cleanPhone,
          reference: fullReference,
          increasedVisibility: true,
        };
        db.users[userIndex].isPremium = true;
        db.users[userIndex].updatedAt = new Date().toISOString();
        writeDb(db);
      }
    }

    return res.json({
      ok: true,
      message: 'Campay payment request accepted.',
      provider: 'campay',
      reference: fullReference,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      provider: 'campay',
      message: 'Campay backend error.',
      error: error.message,
    });
  }
});

app.post('/api/campay/confirm-payment', (req, res) => {
  try {
    const { userId, reference, status = 'SUCCESS' } = req.body || {};
    const db = readDb();

    const userIndex = db.users.findIndex((user) => user.id === userId || user.subscription?.reference === reference);

    if (userIndex === -1) {
      return res.status(404).json({ ok: false, message: 'User or payment reference not found.' });
    }

    const current = db.users[userIndex];
    const nextStatus = status === 'SUCCESS' ? 'ACTIVE' : 'PENDING';

    db.users[userIndex].subscription = {
      ...(current.subscription || {
        id: `sub-${Date.now()}`,
        plan: 'PREMIUM',
        amount: current.subscription?.amount || 0,
        currency: current.subscription?.currency || 'XAF',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      plan: 'PREMIUM',
      planName: current.subscription?.planName || 'Premium',
      status: nextStatus,
      amount: current.subscription?.amount || 0,
      currency: current.subscription?.currency || 'XAF',
      reference: reference || current.subscription?.reference || `JOBFIND-${Date.now()}`,
      campayPhone: current.subscription?.campayPhone || '',
      increasedVisibility: true,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date().toISOString(),
    };
    db.users[userIndex].isPremium = nextStatus === 'ACTIVE';
    db.users[userIndex].updatedAt = new Date().toISOString();
    writeDb(db);

    return res.json({
      ok: true,
      status: nextStatus,
      message: 'Payment status updated successfully.',
      user: sanitizeUser(db.users[userIndex]),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Failed to confirm payment.', error: error.message });
  }
});

app.post('/api/campay/webhook', (req, res) => {
  try {
    const { reference, status, userId } = req.body || {};
    const db = readDb();
    const userIndex = db.users.findIndex((user) => user.id === userId || user.subscription?.reference === reference);

    if (userIndex === -1) {
      return res.status(404).json({ ok: false, message: 'Payment reference not found.' });
    }

    const finalStatus = status === 'SUCCESS' ? 'ACTIVE' : 'PENDING';
    const current = db.users[userIndex];

    db.users[userIndex].subscription = {
      ...(current.subscription || {}),
      status: finalStatus,
      reference: reference || current.subscription?.reference || `JOBFIND-${Date.now()}`,
      increasedVisibility: finalStatus === 'ACTIVE',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users[userIndex].isPremium = finalStatus === 'ACTIVE';
    db.users[userIndex].updatedAt = new Date().toISOString();
    writeDb(db);

    return res.json({ ok: true, message: 'Webhook processed successfully.', reference: reference || current.subscription?.reference });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Webhook processing failed.', error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { query, userRole, userName, conversation = [] } = req.body || {};
    const cleanQuery = String(query || '').trim();

    if (!cleanQuery) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        reply: createFallbackReply(cleanQuery, userRole, userName),
        status: 'fallback',
        provider: 'gemini',
        model: GEMINI_MODEL,
      });
    }

    const payload = buildGeminiRequestPayload({
      query: cleanQuery,
      userRole: userRole ?? 'visitor',
      userName: userName ?? 'Guest',
      conversation,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      }
    );

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Gemini request failed');
    }

    const reply = extractGeminiReply(data);

    return res.json({
      reply,
      status: 'ok',
      provider: 'gemini',
      model: GEMINI_MODEL,
    });
  } catch (error) {
    console.error('Gemini chat error:', error);

    return res.status(500).json({
      reply: 'The AI assistant is temporarily unavailable. Please try again in a moment.',
      status: 'error',
      provider: 'gemini',
      model: GEMINI_MODEL,
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const db = readDb();
  const body = req.body || {};
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const role = body.role === 'recruiter' ? 'recruiter' : 'seeker';

  if (!fullName || !email || !password) {
    return res.status(400).json({ ok: false, message: 'Full name, email and password are required.' });
  }

  if (db.users.some((user) => user.email && user.email.toLowerCase() === email)) {
    return res.status(409).json({ ok: false, message: 'An account with this email already exists.' });
  }

  const verificationCode = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const newUser = {
    id: randomUUID(),
    fullName,
    email,
    password,
    gender: body.gender === 'Female' ? 'Female' : 'Male',
    phone: normalizePhone(body.phone || ''),
    city: String(body.city || 'Douala'),
    role,
    accountStatus: 'ACTIVE',
    isPremium: Boolean(body.isPremium),
    emailVerified: false,
    emailVerificationToken: `verify-${randomUUID()}`,
    emailVerificationCode: verificationCode,
    emailVerificationExpiresAt: expiresAt,
    passwordResetCode: undefined,
    passwordResetExpiresAt: undefined,
    seekerProfile: role === 'seeker' ? { ...createDefaultSeekerProfile(), ...(body.seekerProfile || {}) } : createDefaultSeekerProfile(),
    recruiterProfile: role === 'recruiter' ? { ...createDefaultRecruiterProfile(), ...(body.recruiterProfile || {}) } : createDefaultRecruiterProfile(),
    onboardingCompleted: Boolean(body.onboardingCompleted),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const emailResult = sendEmailCode(email, 'account-verification', verificationCode);

  return res.status(201).json({
    ok: true,
    user: sanitizeUser(newUser),
    verificationCode: emailResult.code,
    message: 'Account created successfully. A verification code has been sent to your email.',
  });
});

app.post('/api/auth/request-verification-code', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email is required.' });
  }

  const user = db.users.find((candidate) => candidate.email && candidate.email.toLowerCase() === email);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'No account was found for this email.' });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  user.emailVerificationCode = code;
  user.emailVerificationExpiresAt = expiresAt;
  user.updatedAt = new Date().toISOString();
  writeDb(db);

  const emailResult = sendEmailCode(email, 'account-verification', code);

  return res.json({ ok: true, verificationCode: emailResult.code, message: 'A new verification code has been sent to your email.' });
});

app.post('/api/auth/verify-email-code', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();

  if (!email || !code) {
    return res.status(400).json({ ok: false, message: 'Email and verification code are required.' });
  }

  const user = db.users.find((candidate) => candidate.email && candidate.email.toLowerCase() === email);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Account not found.' });
  }

  const expiresAt = user.emailVerificationExpiresAt ? new Date(user.emailVerificationExpiresAt).getTime() : null;
  if (expiresAt && Date.now() > expiresAt) {
    return res.status(400).json({ ok: false, message: 'This verification code has expired.' });
  }

  if (user.emailVerificationCode !== code) {
    return res.status(400).json({ ok: false, message: 'The verification code is invalid.' });
  }

  user.emailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json({ ok: true, message: 'Email verified successfully. You can now sign in.' });
});

app.get('/api/auth/verify-email', (req, res) => {
  const db = readDb();
  const token = String(req.query.token || '').trim();

  if (!token) {
    return res.status(400).json({ ok: false, message: 'Verification token is missing.' });
  }

  const userIndex = db.users.findIndex((user) => user.emailVerificationToken === token);

  if (userIndex === -1) {
    return res.status(400).json({ ok: false, message: 'This verification link is invalid or has expired.' });
  }

  const user = db.users[userIndex];
  const expiresAt = user.emailVerificationExpiresAt ? new Date(user.emailVerificationExpiresAt).getTime() : null;

  if (expiresAt && Date.now() > expiresAt) {
    return res.status(400).json({ ok: false, message: 'This verification link has expired.' });
  }

  db.users[userIndex] = {
    ...user,
    emailVerified: true,
    emailVerificationToken: undefined,
    emailVerificationExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);

  return res.json({ ok: true, message: 'Email verified successfully.' });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email is required.' });
  }

  const user = db.users.find((candidate) => candidate.email && candidate.email.toLowerCase() === email);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'No account was found for this email.' });
  }

  const resetCode = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  user.passwordResetCode = resetCode;
  user.passwordResetExpiresAt = expiresAt;
  user.updatedAt = new Date().toISOString();
  writeDb(db);

  const emailResult = sendEmailCode(email, 'password-reset', resetCode);

  return res.json({ ok: true, resetCode: emailResult.code, message: 'A password reset code has been sent to your email.' });
});

app.post('/api/auth/reset-password', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();
  const password = String(req.body?.password || '');

  if (!email || !code || !password) {
    return res.status(400).json({ ok: false, message: 'Email, reset code and a new password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters long.' });
  }

  const user = db.users.find((candidate) => candidate.email && candidate.email.toLowerCase() === email);
  if (!user) {
    return res.status(404).json({ ok: false, message: 'Account not found.' });
  }

  const expiresAt = user.passwordResetExpiresAt ? new Date(user.passwordResetExpiresAt).getTime() : null;
  if (expiresAt && Date.now() > expiresAt) {
    return res.status(400).json({ ok: false, message: 'This reset code has expired.' });
  }

  if (user.passwordResetCode !== code) {
    return res.status(400).json({ ok: false, message: 'The reset code is invalid.' });
  }

  user.password = password;
  user.passwordResetCode = undefined;
  user.passwordResetExpiresAt = undefined;
  user.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json({ ok: true, message: 'Your password has been reset successfully.' });
});

app.post('/api/auth/login', (req, res) => {
  const db = readDb();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required.' });
  }

  const user = db.users.find((candidate) => candidate.email && candidate.email.toLowerCase() === email && candidate.password === password);
  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  if (user.accountStatus !== 'ACTIVE') {
    return res.status(403).json({ ok: false, message: 'This account is not active.' });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ ok: false, message: 'Please verify your email before signing in.' });
  }

  return res.json({ ok: true, user: sanitizeUser(user) });
});

app.get('/api/auth/users', (_req, res) => {
  const db = readDb();
  return res.json({ ok: true, users: db.users.map((user) => sanitizeUser(user)) });
});

app.get('/api/auth/user/:id', (req, res) => {
  const db = readDb();
  const found = db.users.find((user) => user.id === req.params.id);
  if (!found) return res.status(404).json({ ok: false, message: 'User not found.' });
  return res.json({ ok: true, user: sanitizeUser(found) });
});

app.put('/api/auth/user/:id', (req, res) => {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === req.params.id);
  if (index === -1) return res.status(404).json({ ok: false, message: 'User not found.' });

  const current = db.users[index];
  const nextUser = {
    ...current,
    ...req.body,
    id: current.id,
    email: String(req.body.email || current.email).trim().toLowerCase(),
    phone: normalizePhone(req.body.phone || current.phone || ''),
    updatedAt: new Date().toISOString(),
  };

  db.users[index] = nextUser;
  writeDb(db);
  return res.json({ ok: true, user: sanitizeUser(nextUser) });
});

app.put('/api/users/:id/subscription', (req, res) => {
  const db = readDb();
  const userIndex = db.users.findIndex((user) => user.id === req.params.id);
  if (userIndex === -1) return res.status(404).json({ ok: false, message: 'User not found.' });

  const subscription = {
    status: 'ACTIVE',
    planName: req.body.planName || 'Basic Premium',
    amount: Number(req.body.amount || 0),
    currency: req.body.currency || 'XAF',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    campayPhone: normalizePhone(req.body.phone || ''),
    reference: req.body.reference || `CAMPAY-TX-${Date.now()}`,
    increasedVisibility: true,
  };

  db.users[userIndex].subscription = subscription;
  db.users[userIndex].isPremium = true;
  db.users[userIndex].updatedAt = new Date().toISOString();
  writeDb(db);
  return res.json({ ok: true, user: sanitizeUser(db.users[userIndex]) });
});

app.get('/api/jobs', (req, res) => {
  const db = readDb();
  const { category, search, location } = req.query;
  let jobs = [...db.jobs];

  if (category) jobs = jobs.filter((job) => String(job.category || '').toLowerCase().includes(String(category).toLowerCase()));
  if (location) jobs = jobs.filter((job) => String(job.location || '').toLowerCase().includes(String(location).toLowerCase()));
  if (search) jobs = jobs.filter((job) => `${job.jobTitle} ${job.description} ${job.companyName}`.toLowerCase().includes(String(search).toLowerCase()));

  jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ ok: true, jobs });
});

app.get('/api/jobs/:id', (req, res) => {
  const db = readDb();
  const job = db.jobs.find((entry) => entry.id === req.params.id);
  if (!job) return res.status(404).json({ ok: false, message: 'Job not found.' });
  return res.json({ ok: true, job });
});

app.get('/api/jobs/recruiter/:recruiterId', (req, res) => {
  const db = readDb();
  const jobs = db.jobs.filter((job) => job.recruiterId === req.params.recruiterId);
  return res.json({ ok: true, jobs });
});

app.post('/api/jobs', (req, res) => {
  const db = readDb();
  const payload = req.body || {};

  const newJob = {
    id: payload.id || `job-${Date.now()}`,
    jobTitle: payload.jobTitle || 'Untitled position',
    companyName: payload.companyName || 'Company',
    location: payload.location || 'Remote',
    description: payload.description || '',
    salary: Number(payload.salary || 0),
    status: payload.status || 'OPEN',
    createdAt: new Date().toISOString(),
    employmentType: payload.employmentType || 'Full-time',
    deadline: payload.deadline || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    requirements: payload.requirements || '',
    recruiterId: payload.recruiterId || 'user-admin-001',
    category: payload.category || 'General',
    featured: Boolean(payload.featured),
  };

  db.jobs.unshift(newJob);
  writeDb(db);
  return res.status(201).json({ ok: true, job: newJob });
});

app.put('/api/jobs/:id', (req, res) => {
  const db = readDb();
  const index = db.jobs.findIndex((job) => job.id === req.params.id);
  if (index === -1) return res.status(404).json({ ok: false, message: 'Job not found.' });

  db.jobs[index] = { ...db.jobs[index], ...req.body, updatedAt: new Date().toISOString() };
  writeDb(db);
  return res.json({ ok: true, job: db.jobs[index] });
});

app.delete('/api/jobs/:id', (req, res) => {
  const db = readDb();
  const before = db.jobs.length;
  db.jobs = db.jobs.filter((job) => job.id !== req.params.id);
  if (db.jobs.length === before) return res.status(404).json({ ok: false, message: 'Job not found.' });
  writeDb(db);
  return res.json({ ok: true, message: 'Job deleted successfully.' });
});

app.get('/api/applications', (req, res) => {
  const db = readDb();
  const { seekerId, jobId } = req.query;
  let applications = [...db.applications];

  if (seekerId) applications = applications.filter((application) => application.seekerId === String(seekerId));
  if (jobId) applications = applications.filter((application) => application.jobId === String(jobId));

  return res.json({ ok: true, applications });
});

app.post('/api/applications', (req, res) => {
  const db = readDb();
  const payload = req.body || {};
  const seekerId = String(payload.seekerId || '');
  const jobId = String(payload.jobId || '');

  if (!seekerId || !jobId) return res.status(400).json({ ok: false, message: 'Seeker and job are required.' });

  const existing = db.applications.some((application) => application.seekerId === seekerId && application.jobId === jobId);
  if (existing) return res.status(409).json({ ok: false, message: 'You already applied for this job.' });

  const application = {
    id: payload.id || `application-${Date.now()}`,
    applicationID: payload.applicationID || `application-${Date.now()}`,
    jobId,
    jobTitle: payload.jobTitle || '',
    companyName: payload.companyName || '',
    seekerId,
    seekerName: payload.seekerName || '',
    appliedDate: new Date().toISOString(),
    coverLetter: payload.coverLetter || '',
    status: payload.status || 'PENDING',
    lastUpdated: new Date().toISOString(),
    resumeUrl: payload.resumeUrl || '',
    resumeFileName: payload.resumeFileName || '',
    notes: payload.notes || '',
  };

  db.applications.unshift(application);
  writeDb(db);
  return res.status(201).json({ ok: true, application });
});

app.put('/api/applications/:id/status', (req, res) => {
  const db = readDb();
  const index = db.applications.findIndex((application) => application.id === req.params.id || application.applicationID === req.params.id);
  if (index === -1) return res.status(404).json({ ok: false, message: 'Application not found.' });

  db.applications[index].status = req.body.status || db.applications[index].status;
  db.applications[index].lastUpdated = new Date().toISOString();
  writeDb(db);
  return res.json({ ok: true, application: db.applications[index] });
});

app.delete('/api/applications/:id', (req, res) => {
  const db = readDb();
  const count = db.applications.length;
  db.applications = db.applications.filter((application) => application.id !== req.params.id && application.applicationID !== req.params.id);
  if (db.applications.length === count) return res.status(404).json({ ok: false, message: 'Application not found.' });
  writeDb(db);
  return res.json({ ok: true, message: 'Application deleted.' });
});

app.get('/api/saved/:userId', (req, res) => {
  const db = readDb();
  const savedIds = db.savedJobs.filter((item) => item.userId === req.params.userId).map((item) => item.jobId);
  return res.json({ ok: true, savedJobIds: savedIds });
});

app.post('/api/saved', (req, res) => {
  const db = readDb();
  const { userId, jobId } = req.body || {};

  if (!userId || !jobId) return res.status(400).json({ ok: false, message: 'userId and jobId are required.' });

  const existing = db.savedJobs.some((item) => item.userId === userId && item.jobId === jobId);
  if (existing) return res.json({ ok: true, message: 'Job already saved.', savedJobIds: db.savedJobs.filter((item) => item.userId === userId).map((item) => item.jobId) });

  db.savedJobs.push({ id: randomUUID(), userId, jobId, savedAt: new Date().toISOString() });
  writeDb(db);
  return res.status(201).json({ ok: true, savedJobIds: db.savedJobs.filter((item) => item.userId === userId).map((item) => item.jobId) });
});

app.delete('/api/saved/:userId/:jobId', (req, res) => {
  const db = readDb();
  const before = db.savedJobs.length;
  db.savedJobs = db.savedJobs.filter((item) => !(item.userId === req.params.userId && item.jobId === req.params.jobId));
  if (db.savedJobs.length === before) return res.status(404).json({ ok: false, message: 'Saved job not found.' });
  writeDb(db);
  return res.json({ ok: true, message: 'Saved job removed.' });
});

app.get('/api/notifications/:userId', (req, res) => {
  const db = readDb();
  const notifications = db.notifications.filter((item) => item.recipientId === req.params.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ ok: true, notifications });
});

app.post('/api/notifications', (req, res) => {
  const db = readDb();
  const notification = {
    id: req.body.id || randomUUID(),
    notificationID: req.body.notificationID || randomUUID(),
    recipientId: req.body.recipientId || '',
    title: req.body.title || 'Notification',
    message: req.body.message || '',
    type: req.body.type || 'system',
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  db.notifications.unshift(notification);
  writeDb(db);
  return res.status(201).json({ ok: true, notification });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const db = readDb();
  const item = db.notifications.find((notification) => notification.id === req.params.id || notification.notificationID === req.params.id);
  if (!item) return res.status(404).json({ ok: false, message: 'Notification not found.' });
  item.isRead = true;
  writeDb(db);
  return res.json({ ok: true, notification: item });
});

app.get('/api/messages/:userId', (req, res) => {
  const db = readDb();
  const messages = db.messages.filter((item) => item.receiverID === req.params.userId || item.senderID === req.params.userId).sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  return res.json({ ok: true, messages });
});

app.get('/api/channels/:userId', (req, res) => {
  const db = readDb();
  const channels = (db.channels || []).filter((channel) => channel.seekerId === req.params.userId || channel.recruiterId === req.params.userId);
  return res.json({ ok: true, channels });
});

app.post('/api/messages', (req, res) => {
  const db = readDb();
  const message = {
    id: req.body.id || randomUUID(),
    messageID: req.body.messageID || randomUUID(),
    senderID: req.body.senderID || '',
    senderName: req.body.senderName || 'User',
    receiverID: req.body.receiverID || '',
    subject: req.body.subject || 'Message',
    content: req.body.content || '',
    sentAt: new Date().toISOString(),
    isRead: false,
  };

  db.messages.push(message);
  writeDb(db);
  return res.status(201).json({ ok: true, message });
});

app.get('/api/reports', (_req, res) => {
  const db = readDb();
  return res.json({ ok: true, reports: db.reports });
});

app.post('/api/reports', (req, res) => {
  const db = readDb();
  const report = {
    reportId: req.body.reportId || randomUUID(),
    reporterId: req.body.reporterId || '',
    reporterName: req.body.reporterName || 'Reporter',
    itemType: req.body.itemType || 'job',
    itemId: req.body.itemId || '',
    itemTitle: req.body.itemTitle || 'Item',
    reason: req.body.reason || '',
    reportedAt: new Date().toISOString(),
    status: 'PENDING',
  };

  db.reports.push(report);
  writeDb(db);
  return res.status(201).json({ ok: true, report });
});

app.get('/api/reviews', (_req, res) => {
  const db = readDb();
  return res.json({ ok: true, reviews: db.reviews });
});

app.post('/api/reviews', (req, res) => {
  const db = readDb();
  const review = {
    id: req.body.id || randomUUID(),
    reviewerId: req.body.reviewerId || '',
    targetId: req.body.targetId || '',
    rating: Number(req.body.rating || 5),
    comment: req.body.comment || '',
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(review);
  writeDb(db);
  return res.status(201).json({ ok: true, review });
});

app.get('/api/bookings', (_req, res) => {
  const db = readDb();
  return res.json({ ok: true, bookings: db.bookings });
});

app.post('/api/bookings', (req, res) => {
  const db = readDb();
  const booking = {
    id: req.body.id || randomUUID(),
    serviceId: req.body.serviceId || '',
    customerId: req.body.customerId || '',
    providerId: req.body.providerId || '',
    status: req.body.status || 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(booking);
  writeDb(db);
  return res.status(201).json({ ok: true, booking });
});

const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (socket) => {
  socket.on('message', (rawPayload) => {
    try {
      const payload = JSON.parse(rawPayload.toString());

      if (payload?.type === 'join-channel') {
        const room = payload.channelId;
        if (!room) return;

        const currentClients = channelClients.get(room) || new Set();
        currentClients.add(socket);
        channelClients.set(room, currentClients);
        return;
      }

      if (payload?.type === 'chat:message') {
        const { channelId, senderId, senderName, text } = payload;
        const cleanedText = String(text || '').trim();

        if (!channelId || !senderId || !cleanedText) return;

        const message = {
          id: payload.message?.id || `msg-${Date.now()}`,
          channelId,
          senderId,
          senderName: senderName || 'User',
          text: cleanedText,
          createdAt: payload.message?.createdAt || new Date().toISOString(),
        };

        const db = readDb();
        db.messages = Array.isArray(db.messages) ? db.messages : [];
        db.messages.push(message);
        writeDb(db);

        broadcastToChannel(channelId, {
          type: 'chat:message',
          channelId,
          message,
        });
      }
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('close', () => {
    for (const [channelId, clients] of channelClients.entries()) {
      if (clients.has(socket)) {
        clients.delete(socket);
        if (clients.size === 0) {
          channelClients.delete(channelId);
        }
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`JobFind backend listening on http://localhost:${PORT}`);
  console.log(`JobFind chat socket listening on ws://localhost:${WS_PORT}`);
});

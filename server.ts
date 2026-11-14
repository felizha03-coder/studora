import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const STORE_PATH = path.join(__dirname, '.studora-store.json');

interface StoredUser {
  email: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface PersistedDB {
  users: Record<string, StoredUser>;
  workspaces: Record<string, unknown>;
}

const memoryDB: PersistedDB = {
  users: {},
  workspaces: {},
};

function loadDB(): PersistedDB {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as PersistedDB;
      return {
        users: parsed.users || {},
        workspaces: parsed.workspaces || {},
      };
    }
  } catch {
    // Fallback to memoryDB if filesystem read fails
  }
  return memoryDB;
}

function saveDB(db: PersistedDB): void {
  memoryDB.users = db.users;
  memoryDB.workspaces = db.workspaces;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Ignore write error in restricted sandboxes; memoryDB still preserves state
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'studora-api', timestamp: new Date().toISOString() });
  });

  // Register Student Account
  app.post('/api/auth/register', (req, res) => {
    const { email, password, fullName } = req.body || {};
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDB();
    if (db.users[normalizedEmail]) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(String(password), salt);
    db.users[normalizedEmail] = {
      email: normalizedEmail,
      fullName: String(fullName).trim(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };
    saveDB(db);
    return res.status(201).json({
      user: { email: normalizedEmail, fullName: String(fullName).trim() },
    });
  });

  // Login Student Account
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDB();
    const user = db.users[normalizedEmail];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const checkHash = hashPassword(String(password), user.salt);
    if (checkHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    return res.json({
      user: { email: user.email, fullName: user.fullName },
    });
  });

  // Forgot Password Reset
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email, newPassword } = req.body || {};
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDB();
    const user = db.users[normalizedEmail];
    if (!user) {
      return res.status(404).json({ error: 'No registered student account found for that email.' });
    }
    const salt = crypto.randomBytes(16).toString('hex');
    user.salt = salt;
    user.passwordHash = hashPassword(String(newPassword), salt);
    saveDB(db);
    return res.json({ ok: true, message: 'Password updated successfully.' });
  });

  // Load Workspace Snapshot
  app.get('/api/workspace', (req, res) => {
    const email = String(req.query.email || 'demo@studora.ac.id').trim().toLowerCase();
    const db = loadDB();
    const workspace = db.workspaces[email] || null;
    res.json({ workspace });
  });

  // Save Workspace Snapshot
  app.put('/api/workspace', (req, res) => {
    const { email, workspace } = req.body || {};
    if (!email || !workspace) {
      return res.status(400).json({ error: 'Email and workspace payload are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDB();
    db.workspaces[normalizedEmail] = workspace;
    saveDB(db);
    res.json({ ok: true, savedAt: new Date().toISOString() });
  });

  // Mount Vite dev middleware or serve static build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STUDORA server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

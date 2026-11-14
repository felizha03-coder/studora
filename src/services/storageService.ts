import { createInitialWorkspace } from '../data/studoraDemoData';
import { AuthSession, StudoraWorkspace } from '../types/studora';

const SESSION_KEY = 'studora_session_v3';
const USERS_LOCAL_KEY = 'studora_local_users_v3';
const WORKSPACE_PREFIX = 'studora_ws_v3_';

export const DEMO_EMAIL = 'feliz@studora.ac.id';

interface LocalAuthRecord {
  email: string;
  fullName: string;
  password: string;
}

function getLocalUsers(): Record<string, LocalAuthRecord> {
  try {
    const raw = localStorage.getItem(USERS_LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalAuthRecord>) : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users: Record<string, LocalAuthRecord>): void {
  try {
    localStorage.setItem(USERS_LOCAL_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage quota issues
  }
}

export function getSavedSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function setSavedSession(session: AuthSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore
  }
}

export function createDemoSession(): AuthSession {
  const session: AuthSession = {
    email: DEMO_EMAIL,
    fullName: 'Feliz',
    isDemo: true,
    loggedInAt: new Date().toISOString(),
  };
  setSavedSession(session);
  return session;
}

export async function loginStudent(email: string, password: string): Promise<{ ok: boolean; session?: AuthSession; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Demo quick credential support
  if (normalizedEmail === DEMO_EMAIL && password === 'studora123') {
    return { ok: true, session: createDemoSession() };
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
    if (res.ok) {
      const data = await res.json();
      const session: AuthSession = {
        email: data.user.email,
        fullName: data.user.fullName,
        isDemo: false,
        loggedInAt: new Date().toISOString(),
      };
      setSavedSession(session);
      return { ok: true, session };
    }
    if (res.status === 401) {
      // Check localStorage fallback if user registered offline
      const localUsers = getLocalUsers();
      const local = localUsers[normalizedEmail];
      if (local && local.password === password) {
        const session: AuthSession = {
          email: local.email,
          fullName: local.fullName,
          isDemo: false,
          loggedInAt: new Date().toISOString(),
        };
        setSavedSession(session);
        return { ok: true, session };
      }
      const errData = await res.json().catch(() => ({}));
      return { ok: false, error: errData.error || 'Invalid email or password.' };
    }
  } catch {
    // Fallback to localStorage auth when server is unavailable
  }

  const localUsers = getLocalUsers();
  const local = localUsers[normalizedEmail];
  if (local && local.password === password) {
    const session: AuthSession = {
      email: local.email,
      fullName: local.fullName,
      isDemo: false,
      loggedInAt: new Date().toISOString(),
    };
    setSavedSession(session);
    return { ok: true, session };
  }
  return { ok: false, error: 'Invalid email or password.' };
}

export async function registerStudent(
  fullName: string,
  email: string,
  password: string
): Promise<{ ok: boolean; session?: AuthSession; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: cleanName, email: normalizedEmail, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || 'Registration failed.' };
    }
  } catch {
    // Offline fallback
    const users = getLocalUsers();
    if (users[normalizedEmail]) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
  }

  const users = getLocalUsers();
  users[normalizedEmail] = { email: normalizedEmail, fullName: cleanName, password };
  saveLocalUsers(users);

  const initialWs = createInitialWorkspace({
    fullName: cleanName,
    email: normalizedEmail,
  });
  await saveWorkspace(normalizedEmail, initialWs);

  const session: AuthSession = {
    email: normalizedEmail,
    fullName: cleanName,
    isDemo: false,
    loggedInAt: new Date().toISOString(),
  };
  setSavedSession(session);
  return { ok: true, session };
}

export async function resetStudentPassword(
  email: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, newPassword }),
    });
    if (res.ok) {
      const users = getLocalUsers();
      if (users[normalizedEmail]) {
        users[normalizedEmail].password = newPassword;
        saveLocalUsers(users);
      }
      return { ok: true };
    }
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error || 'Account not found.' };
  } catch {
    const users = getLocalUsers();
    if (!users[normalizedEmail]) {
      return { ok: false, error: 'No registered account found for that email.' };
    }
    users[normalizedEmail].password = newPassword;
    saveLocalUsers(users);
    return { ok: true };
  }
}

const CURRENT_SCHEMA_VERSION = 3;

function readLocalWorkspace(key: string): StudoraWorkspace | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudoraWorkspace;
    if (parsed && parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeLocalWorkspace(key: string, workspace: StudoraWorkspace): void {
  try {
    localStorage.setItem(key, JSON.stringify(workspace));
  } catch {
    // Ignore storage quota or restricted iframe errors
  }
}

export async function loadWorkspace(email: string, fallbackName?: string): Promise<StudoraWorkspace> {
  const key = `${WORKSPACE_PREFIX}${email.toLowerCase()}`;
  const localWs = readLocalWorkspace(key);

  let serverWs: StudoraWorkspace | null = null;
  try {
    const res = await fetch(`/api/workspace?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.workspace && data.workspace.schemaVersion === CURRENT_SCHEMA_VERSION) {
        serverWs = data.workspace as StudoraWorkspace;
      }
    }
  } catch {
    // Offline or server unavailable; fall back to localWs
  }

  if (localWs && serverWs) {
    const localTime = Date.parse(localWs.updatedAt || '') || 0;
    const serverTime = Date.parse(serverWs.updatedAt || '') || 0;
    if (serverTime > localTime) {
      writeLocalWorkspace(key, serverWs);
      return serverWs;
    }
    if (localTime > serverTime) {
      void pushWorkspaceToServer(email, localWs);
    }
    return localWs;
  }

  if (serverWs) {
    writeLocalWorkspace(key, serverWs);
    return serverWs;
  }

  if (localWs) {
    void pushWorkspaceToServer(email, localWs);
    return localWs;
  }

  const seeded: StudoraWorkspace = {
    ...createInitialWorkspace(
      email === DEMO_EMAIL ? undefined : { email, fullName: fallbackName || 'Student' }
    ),
    updatedAt: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
  writeLocalWorkspace(key, seeded);
  void pushWorkspaceToServer(email, seeded);
  return seeded;
}

let latestSaveSeq = 0;

async function pushWorkspaceToServer(email: string, workspace: StudoraWorkspace): Promise<boolean> {
  const seq = ++latestSaveSeq;
  try {
    const res = await fetch('/api/workspace', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, workspace }),
      keepalive: true,
    });
    return res.ok && seq <= latestSaveSeq;
  } catch {
    return false;
  }
}

export async function saveWorkspace(email: string, workspace: StudoraWorkspace): Promise<void> {
  const key = `${WORKSPACE_PREFIX}${email.toLowerCase()}`;
  const stamped: StudoraWorkspace = {
    ...workspace,
    updatedAt: workspace.updatedAt || new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
  writeLocalWorkspace(key, stamped);
  await pushWorkspaceToServer(email, stamped);
}


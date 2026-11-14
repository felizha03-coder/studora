import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createInitialWorkspace, GRADE_POINTS } from '../data/studoraDemoData';
import {
  createDemoSession,
  getSavedSession,
  loadWorkspace,
  loginStudent,
  registerStudent,
  resetStudentPassword,
  saveWorkspace,
  setSavedSession,
} from '../services/storageService';
import { AuthSession, PageId, StudoraWorkspace } from '../types/studora';

interface StudoraContextValue {
  session: AuthSession | null;
  workspace: StudoraWorkspace | null;
  loading: boolean;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  updateWorkspace: (updater: (prev: StudoraWorkspace) => StudoraWorkspace) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  forgotPassword: (email: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  enterDemo: () => Promise<void>;
  logout: () => void;
  resetDemoData: () => void;
  stats: {
    gpa: number;
    totalCompletedSks: number;
    totalEnrolledSks: number;
    activeTasksCount: number;
    upcomingDeadlinesCount: number;
    weeklyStudyHours: number;
    semesterProgressPct: number;
    unreadNotificationsCount: number;
  };
}

const StudoraContext = createContext<StudoraContextValue | null>(null);

export const StudoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const existing = getSavedSession();
    if (existing) return existing;
    // Open directly into realistic demo student session on initial visit
    return createDemoSession();
  });
  const [workspace, setWorkspace] = useState<StudoraWorkspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Load workspace whenever session changes
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!session) {
        setWorkspace(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await loadWorkspace(session.email, session.fullName);
      if (!cancelled) {
        setWorkspace(data);
        setLoading(false);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const workspaceRef = React.useRef<StudoraWorkspace | null>(null);

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  // Apply dark mode class and custom background color on <html>
  useEffect(() => {
    const theme = workspace?.settings.theme || 'light';
    const bg = workspace?.settings.backgroundColor || '#FDE2F3';
    document.documentElement.style.setProperty('--studora-bg', bg);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [workspace?.settings.theme, workspace?.settings.backgroundColor]);

  const updateWorkspace = useCallback(
    (updater: (prev: StudoraWorkspace) => StudoraWorkspace) => {
      const current = workspaceRef.current;
      if (!current || !session) return;
      const next: StudoraWorkspace = {
        ...updater(current),
        updatedAt: new Date().toISOString(),
        schemaVersion: 3,
      };
      workspaceRef.current = next;
      setWorkspace(next);
      void saveWorkspace(session.email, next);
    },
    [session]
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginStudent(email, password);
    if (result.ok && result.session) {
      setSession(result.session);
      setActivePage('dashboard');
    }
    return { ok: result.ok, error: result.error };
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const result = await registerStudent(fullName, email, password);
    if (result.ok && result.session) {
      setSession(result.session);
      setActivePage('dashboard');
    }
    return { ok: result.ok, error: result.error };
  }, []);

  const forgotPassword = useCallback(async (email: string, newPassword: string) => {
    return resetStudentPassword(email, newPassword);
  }, []);

  const enterDemo = useCallback(async () => {
    const demo = createDemoSession();
    setSession(demo);
    setActivePage('dashboard');
  }, []);

  const logout = useCallback(() => {
    setSavedSession(null);
    setSession(null);
    setWorkspace(null);
  }, []);

  const resetDemoData = useCallback(() => {
    if (!session) return;
    const fresh: StudoraWorkspace = {
      ...createInitialWorkspace(
        session.isDemo ? undefined : { email: session.email, fullName: session.fullName }
      ),
      updatedAt: new Date().toISOString(),
      schemaVersion: 3,
    };
    workspaceRef.current = fresh;
    setWorkspace(fresh);
    void saveWorkspace(session.email, fresh);
  }, [session]);

  const stats = useMemo(() => {
    if (!workspace) {
      return {
        gpa: 0,
        totalCompletedSks: 0,
        totalEnrolledSks: 0,
        activeTasksCount: 0,
        upcomingDeadlinesCount: 0,
        weeklyStudyHours: 0,
        semesterProgressPct: 0,
        unreadNotificationsCount: 0,
      };
    }

    let weightedSum = 0;
    let gradedSks = 0;
    let totalEnrolledSks = 0;

    for (const c of workspace.courses) {
      totalEnrolledSks += c.sks;
      const gp = GRADE_POINTS[c.grade];
      if (gp !== null) {
        weightedSum += gp * c.sks;
        gradedSks += c.sks;
      }
    }

    const gpa = gradedSks > 0 ? Number((weightedSum / gradedSks).toFixed(2)) : 0;
    const activeTasksCount = workspace.tasks.filter((t) => t.status !== 'Completed').length;

    const nowMs = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const upcomingDeadlinesCount = workspace.tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      const due = new Date(t.deadline).getTime();
      return !Number.isNaN(due) && due - nowMs <= sevenDaysMs;
    }).length;

    const weeklyStudyHours = Number(
      workspace.studyStats.reduce((sum, d) => sum + d.studyHours, 0).toFixed(1)
    );

    const semesterProgressPct = Math.min(100, Math.round((gradedSks / 144) * 100 + 48));
    const unreadNotificationsCount = workspace.notifications.filter((n) => !n.read).length;

    return {
      gpa,
      totalCompletedSks: gradedSks,
      totalEnrolledSks,
      activeTasksCount,
      upcomingDeadlinesCount,
      weeklyStudyHours,
      semesterProgressPct,
      unreadNotificationsCount,
    };
  }, [workspace]);

  return (
    <StudoraContext.Provider
      value={{
        session,
        workspace,
        loading,
        activePage,
        setActivePage,
        globalSearch,
        setGlobalSearch,
        updateWorkspace,
        login,
        register,
        forgotPassword,
        enterDemo,
        logout,
        resetDemoData,
        stats,
      }}
    >
      {children}
    </StudoraContext.Provider>
  );
};

export function useStudora() {
  const ctx = useContext(StudoraContext);
  if (!ctx) throw new Error('useStudora must be used within StudoraProvider');
  return ctx;
}

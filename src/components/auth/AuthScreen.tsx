import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, Mail, Sparkles, User } from 'lucide-react';
import { StudoraLogo } from '../StudoraLogo';
import { NeoButton, NeoCard } from '../ui/NeoComponents';
import { useToast } from '../ui/ToastProvider';
import { useStudora } from '../../context/StudoraContext';
import { HERO_ILLUSTRATION_URL } from '../../data/studoraDemoData';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthScreen: React.FC = () => {
  const { login, register, forgotPassword, enterDemo } = useStudora();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('feliz@studora.ac.id');
  const [password, setPassword] = useState('studora123');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Please enter both email and password.');
          return;
        }
        const res = await login(email, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Login failed.');
          return;
        }
        showToast('Welcome back to STUDORA!', 'success');
      } else if (mode === 'register') {
        if (fullName.trim().length < 2) {
          setErrorMsg('Full name must be at least 2 characters.');
          return;
        }
        if (!email.includes('@')) {
          setErrorMsg('Please enter a valid student email address.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          return;
        }
        const res = await register(fullName, email, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Could not register account.');
          return;
        }
        showToast('Student account created! Workspace initialized.', 'success');
      } else {
        if (!email.includes('@') || newPassword.length < 6) {
          setErrorMsg('Enter your registered email and a new password (min 6 chars).');
          return;
        }
        const res = await forgotPassword(email, newPassword);
        if (!res.ok) {
          setErrorMsg(res.error || 'Could not reset password.');
          return;
        }
        showToast('Password updated! You can now sign in.', 'success');
        setPassword(newPassword);
        setMode('login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-studora-canvas flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Brand Showcase Column */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-6 flex flex-col justify-between neo-card bg-[#C4B5FD] p-6 sm:p-8 text-[#171717]"
        >
          <div>
            <StudoraLogo size={46} subtitle="Smart Student Productivity Platform" />
            <h1 className="font-display text-3xl sm:text-4xl leading-tight mt-6 text-balance">
              Study Smarter. Code Better. Grow Further.
            </h1>
            <p className="font-body text-sm sm:text-base mt-3 text-[#171717]/85 max-w-md leading-relaxed">
              Your unified command center for university courses, GPA planning, kanban sprints, live coding labs, career roadmaps, and campus finances.
            </p>
          </div>

          <div className="mt-6 rounded-[18px] border-2 border-[#171717] overflow-hidden bg-[#FFF9F0] shadow-[4px_4px_0px_#171717]">
            <img
              src={HERO_ILLUSTRATION_URL}
              alt="IT student coding on laptop with floating pixel blocks"
              className="w-full h-56 sm:h-64 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-label">
            <span>12 Modules</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Coding Lab</span>
            <span aria-hidden="true">·</span>
            <span>Full-Stack Sync</span>
          </div>
        </motion.div>

        {/* Auth Form Column */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="lg:col-span-6"
        >
          <NeoCard tone="white" padding="lg" className="h-full flex flex-col justify-between">
            <div>
              {/* Mode Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-[14px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#14141A]">
                {(['login', 'register', 'forgot'] as AuthMode[]).map((tab) => {
                  const active = mode === tab;
                  const label =
                    tab === 'login' ? 'Sign In' : tab === 'register' ? 'Register' : 'Reset';
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setMode(tab);
                        setErrorMsg('');
                      }}
                      className={`py-2 px-3 rounded-[10px] font-label text-xs transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#FFE69A] text-[#171717] border-2 border-[#171717] shadow-[2px_2px_0px_#171717]'
                          : 'text-[#171717]/70 dark:text-white/70 hover:text-[#171717] dark:hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <h2 className="font-display text-2xl">
                  {mode === 'login'
                    ? 'Student Sign In'
                    : mode === 'register'
                    ? 'Create Student Account'
                    : 'Reset Password'}
                </h2>
                <p className="font-body text-sm opacity-75 mt-1">
                  {mode === 'login'
                    ? 'Access your courses, tasks, code library, and analytics.'
                    : mode === 'register'
                    ? 'Start with pre-configured IT curriculum templates.'
                    : 'Enter your registered email to set a new password.'}
                </p>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-[12px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717] font-body text-sm font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block font-label text-xs mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Feliz"
                        className="neo-input w-full pl-10 pr-4 py-2.5 bg-[#FFF9F0] dark:bg-[#14141A] font-body text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-label text-xs mb-1.5">Student Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.ac.id"
                      className="neo-input w-full pl-10 pr-4 py-2.5 bg-[#FFF9F0] dark:bg-[#14141A] font-body text-sm"
                    />
                  </div>
                </div>

                {mode !== 'forgot' ? (
                  <div>
                    <label className="block font-label text-xs mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="neo-input w-full pl-10 pr-4 py-2.5 bg-[#FFF9F0] dark:bg-[#14141A] font-body text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-label text-xs mb-1.5">New Password</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="neo-input w-full pl-10 pr-4 py-2.5 bg-[#FFF9F0] dark:bg-[#14141A] font-body text-sm"
                      />
                    </div>
                  </div>
                )}

                <NeoButton
                  type="submit"
                  tone="mint"
                  size="lg"
                  disabled={submitting}
                  className="w-full mt-2"
                >
                  <span>
                    {submitting
                      ? 'Processing...'
                      : mode === 'login'
                      ? 'Sign In to Workspace'
                      : mode === 'register'
                      ? 'Create Account'
                      : 'Update Password'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </NeoButton>
              </form>
            </div>

            <div className="mt-6 pt-5 border-t-2 border-[#171717]/15 dark:border-white/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-label text-xs">Instant Demo Access</p>
                  <p className="font-body text-xs opacity-70 mt-0.5">
                    Explore Feliz&apos;s Semester 5 Informatics workspace.
                  </p>
                </div>
                <NeoButton
                  tone="yellow"
                  size="md"
                  onClick={() => {
                    void enterDemo();
                    showToast('Entered Demo Student Workspace', 'info');
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Demo</span>
                </NeoButton>
              </div>
            </div>
          </NeoCard>
        </motion.div>
      </div>
    </div>
  );
};

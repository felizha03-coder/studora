import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Code2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Moon,
  Palette,
  Search,
  Settings,
  StickyNote,
  Sun,
  Wallet,
  X,
} from 'lucide-react';
import { useStudora } from '../../context/StudoraContext';
import { BACKGROUND_PRESETS } from '../../data/studoraDemoData';
import { PageId } from '../../types/studora';
import { StudoraLogo } from '../StudoraLogo';
import { useToast } from '../ui/ToastProvider';

interface NavItem {
  id: PageId;
  labelEn: string;
  labelId: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelEn: 'Dashboard', labelId: 'Beranda', icon: LayoutDashboard, accent: 'bg-[#A78BFA]' },
  { id: 'academic', labelEn: 'Academic', labelId: 'Akademik', icon: BookOpen, accent: 'bg-[#B9F5C8]' },
  { id: 'schedule', labelEn: 'Schedule', labelId: 'Jadwal', icon: CalendarDays, accent: 'bg-[#FFE69A]' },
  { id: 'tasks', labelEn: 'Task Manager', labelId: 'Tugas', icon: CheckSquare, accent: 'bg-[#FFC98B]' },
  { id: 'coding', labelEn: 'Coding Lab', labelId: 'Lab Coding', icon: Code2, accent: 'bg-[#C4B5FD]' },
  { id: 'roadmap', labelEn: 'Learning Roadmap', labelId: 'Roadmap', icon: Map, accent: 'bg-[#F5A9DD]' },
  { id: 'projects', labelEn: 'Projects', labelId: 'Proyek', icon: FolderKanban, accent: 'bg-[#B9F5C8]' },
  { id: 'finance', labelEn: 'Finance', labelId: 'Keuangan', icon: Wallet, accent: 'bg-[#FFE69A]' },
  { id: 'notes', labelEn: 'Notes', labelId: 'Catatan', icon: StickyNote, accent: 'bg-[#FFC98B]' },
  { id: 'analytics', labelEn: 'Analytics', labelId: 'Analitik', icon: BarChart3, accent: 'bg-[#A78BFA]' },
  { id: 'notifications', labelEn: 'Notifications', labelId: 'Notifikasi', icon: Bell, accent: 'bg-[#F5A9DD]' },
  { id: 'settings', labelEn: 'Settings', labelId: 'Pengaturan', icon: Settings, accent: 'bg-[#C4B5FD]' },
];

const MOBILE_BOTTOM_TABS: PageId[] = ['dashboard', 'tasks', 'coding', 'notes', 'academic'];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    workspace,
    activePage,
    setActivePage,
    globalSearch,
    setGlobalSearch,
    updateWorkspace,
    logout,
    stats,
  } = useStudora();
  const { showToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const lang = workspace?.settings.language || 'en';
  const theme = workspace?.settings.theme || 'light';
  const currentBg = workspace?.settings.backgroundColor || '#FDE2F3';

  const quickSearchResults = useMemo(() => {
    if (!workspace || !globalSearch.trim()) return [];
    const q = globalSearch.toLowerCase();
    const results: { title: string; type: string; page: PageId }[] = [];

    workspace.courses.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) {
        results.push({ title: `${c.code} · ${c.name}`, type: 'Course', page: 'academic' });
      }
    });
    workspace.tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)) {
        results.push({ title: t.title, type: 'Task', page: 'tasks' });
      }
    });
    workspace.notes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        results.push({ title: n.title, type: 'Note', page: 'notes' });
      }
    });
    workspace.snippets.forEach((s) => {
      if (s.title.toLowerCase().includes(q) || s.language.toLowerCase().includes(q)) {
        results.push({ title: `${s.title} (${s.language})`, type: 'Snippet', page: 'coding' });
      }
    });
    workspace.projects.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
        results.push({ title: p.title, type: 'Project', page: 'projects' });
      }
    });

    return results.slice(0, 6);
  }, [workspace, globalSearch]);

  if (!workspace) return null;

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    updateWorkspace((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: nextTheme },
    }));
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Pastel Light'} theme`, 'info');
  };

  const activeNavObj = NAV_ITEMS.find((n) => n.id === activePage) || NAV_ITEMS[0];

  const renderSidebarLinks = (onAfterSelect?: () => void) => (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        const label = lang === 'id' ? item.labelId : item.labelEn;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActivePage(item.id);
              onAfterSelect?.();
            }}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-[12px] text-left transition-all cursor-pointer ${
              isActive
                ? `${item.accent} text-[#171717] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] dark:border-[#2E2E38] dark:shadow-[3px_3px_0px_#000]`
                : 'text-[#171717]/80 dark:text-white/80 hover:bg-[#171717]/5 dark:hover:bg-white/10 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-label text-[11px] font-bold truncate whitespace-nowrap">
                {label}
              </span>
            </div>
            {item.id === 'notifications' && stats.unreadNotificationsCount > 0 && (
              <span className="font-stat text-[11px] font-bold px-1.5 py-0.5 rounded-md border border-[#171717] bg-[#FFE69A] text-[#171717]">
                {stats.unreadNotificationsCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-studora-canvas text-[#171717] dark:text-[#F5F3EE] flex">
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[264px] lg:fixed lg:inset-y-0 lg:left-0 z-30 bg-white dark:bg-[#181820] border-r-[2.5px] border-[#171717] dark:border-[#2E2E38]">
        <div className="p-4 border-b-2 border-[#171717]/15 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActivePage('dashboard')}
            className="cursor-pointer text-left"
          >
            <StudoraLogo size={38} subtitle="Study · Code · Grow" />
          </button>
        </div>

        {renderSidebarLinks()}

        {/* Sidebar Bottom Profile Card */}
        <div className="p-3 border-t-2 border-[#171717]/15 dark:border-white/10">
          <div className="p-3 rounded-[16px] border-2 border-[#171717] dark:border-[#2E2E38] bg-[#FFE69A] dark:bg-[#23232E] shadow-[3px_3px_0px_#171717] dark:shadow-[3px_3px_0px_#000] text-[#171717] dark:text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={workspace.profile.avatarUrl}
                alt={workspace.profile.fullName}
                className="w-10 h-10 rounded-[10px] border-2 border-[#171717] object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="font-label text-[11px] font-bold truncate">
                  {workspace.profile.fullName}
                </p>
                <p className="font-body text-[11px] opacity-75 truncate">
                  Sem {workspace.profile.semester} · {workspace.profile.major}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePage('settings')}
                className="flex-1 py-1.5 px-2 rounded-[9px] border-2 border-[#171717] bg-white text-[#171717] font-body text-xs font-bold hover:bg-[#B9F5C8] transition-colors cursor-pointer whitespace-nowrap"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  showToast('Signed out of STUDORA', 'info');
                }}
                aria-label="Logout"
                className="py-1.5 px-2.5 rounded-[9px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717] hover:opacity-90 transition-opacity cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[264px] flex flex-col min-w-0 pb-20 lg:pb-6">
        {/* Topbar */}
        <header
          style={theme === 'light' ? { backgroundColor: currentBg } : undefined}
          className="sticky top-0 z-20 dark:bg-[#121216]/95 backdrop-blur-sm border-b-[2.5px] border-[#171717] dark:border-[#2E2E38] px-4 sm:px-6 py-3 transition-colors duration-200"
        >
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
            {/* Left: Mobile Hamburger + Current Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden neo-btn w-10 h-10 flex items-center justify-center bg-[#FFE69A] text-[#171717] shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <p className="font-label text-[10px] uppercase tracking-wider opacity-60 hidden sm:block">
                  STUDORA WORKSPACE
                </p>
                <h1 className="font-display text-base sm:text-xl truncate">
                  {lang === 'id' ? activeNavObj.labelId : activeNavObj.labelEn}
                </h1>
              </div>
            </div>

            {/* Center: Global Search Input */}
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="text"
                value={globalSearch}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Search courses, tasks, notes, code..."
                className="neo-input w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1E1E26] font-body text-sm"
              />
              {searchOpen && quickSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 neo-card bg-white dark:bg-[#1E1E26] p-2 z-50">
                  {quickSearchResults.map((res, idx) => (
                    <button
                      key={`${res.page}-${idx}`}
                      type="button"
                      onMouseDown={() => {
                        setActivePage(res.page);
                        setGlobalSearch('');
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-[10px] hover:bg-[#FFE69A] hover:text-[#171717] text-left transition-colors cursor-pointer"
                    >
                      <span className="font-body text-sm font-medium truncate">{res.title}</span>
                      <span className="font-label text-[10px] opacity-70 shrink-0">{res.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Background Color Picker, Theme Switch, Notifications, Profile */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Background Color Customizer */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBgPickerOpen((v) => !v)}
                  aria-label="Ubah warna background"
                  title="Ubah warna background"
                  style={{ backgroundColor: currentBg }}
                  className="neo-btn w-10 h-10 flex items-center justify-center text-[#171717]"
                >
                  <Palette className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {bgPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 mt-2 w-64 neo-card bg-white dark:bg-[#1E1E26] p-3.5 z-50"
                    >
                      <div className="flex items-center justify-between pb-2 border-b-2 border-[#171717]/15 dark:border-white/15">
                        <span className="font-label text-[11px] font-bold">Background Color</span>
                        <span className="font-stat text-[11px] font-bold uppercase opacity-75">
                          {currentBg}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {BACKGROUND_PRESETS.map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            title={preset.name}
                            aria-label={`Set background to ${preset.name}`}
                            onClick={() => {
                              updateWorkspace((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  theme: 'light',
                                  backgroundColor: preset.hex,
                                },
                              }));
                              showToast(`Background diubah ke ${preset.name}`, 'info');
                            }}
                            style={{ backgroundColor: preset.hex }}
                            className={`h-9 rounded-[10px] border-2 border-[#171717] cursor-pointer transition-transform hover:scale-105 ${
                              currentBg.toLowerCase() === preset.hex.toLowerCase()
                                ? 'ring-2 ring-[#171717] ring-offset-1'
                                : ''
                            }`}
                          />
                        ))}

                        <label
                          title="Pilih warna bebas"
                          className="h-9 rounded-[10px] border-2 border-[#171717] bg-white flex items-center justify-center cursor-pointer text-[10px] font-label font-bold text-[#171717] overflow-hidden relative"
                        >
                          <span>+</span>
                          <input
                            type="color"
                            value={currentBg}
                            onChange={(e) =>
                              updateWorkspace((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  theme: 'light',
                                  backgroundColor: e.target.value,
                                },
                              }))
                            }
                            aria-label="Custom background color picker"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle color theme"
                className="neo-btn w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1E1E26] text-[#171717] dark:text-white"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Notification Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen((v) => !v)}
                  aria-label="Notifications"
                  className="neo-btn w-10 h-10 flex items-center justify-center bg-[#F5A9DD] text-[#171717] relative"
                >
                  <Bell className="w-4 h-4" />
                  {stats.unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full border-2 border-[#171717] bg-[#FFE69A] text-[#171717] font-stat text-[11px] font-bold flex items-center justify-center">
                      {stats.unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 mt-2 w-80 neo-card bg-white dark:bg-[#1E1E26] p-3 z-50"
                    >
                      <div className="flex items-center justify-between pb-2 border-b-2 border-[#171717]/15 dark:border-white/15">
                        <span className="font-label text-xs font-bold">Notifications</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            setActivePage('notifications');
                          }}
                          className="font-body text-xs font-bold underline cursor-pointer"
                        >
                          View All
                        </button>
                      </div>
                      <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                        {workspace.notifications.slice(0, 4).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              updateWorkspace((prev) => ({
                                ...prev,
                                notifications: prev.notifications.map((x) =>
                                  x.id === n.id ? { ...x, read: true } : x
                                ),
                              }));
                              setNotifDropdownOpen(false);
                              if (n.targetPage) setActivePage(n.targetPage);
                            }}
                            className={`w-full text-left p-2.5 rounded-[12px] border-2 border-[#171717]/15 dark:border-white/10 transition-colors cursor-pointer ${
                              n.read
                                ? 'bg-transparent opacity-75 hover:opacity-100'
                                : 'bg-[#FFF9F0] dark:bg-[#2A2A36]'
                            }`}
                          >
                            <p className="font-body text-xs font-bold truncate">{n.title}</p>
                            <p className="font-body text-[11px] opacity-75 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('settings')}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-[14px] border-2 border-[#171717] dark:border-[#2E2E38] bg-[#B9F5C8] text-[#171717] shadow-[3px_3px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <img
                  src={workspace.profile.avatarUrl}
                  alt={workspace.profile.fullName}
                  className="w-8 h-8 rounded-[9px] border-2 border-[#171717] object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-label text-[11px] font-bold hidden sm:inline whitespace-nowrap">
                  {workspace.profile.fullName.split(' ')[0]}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#171717]/60"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-72 max-w-[85vw] bg-white dark:bg-[#181820] border-r-[2.5px] border-[#171717] flex flex-col h-full"
            >
              <div className="p-4 flex items-center justify-between border-b-2 border-[#171717]/15 dark:border-white/10">
                <StudoraLogo size={34} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="neo-btn w-9 h-9 flex items-center justify-center bg-[#F5A9DD] text-[#171717]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderSidebarLinks(() => setMobileMenuOpen(false))}
              <div className="p-3 border-t-2 border-[#171717]/15 dark:border-white/10 flex items-center justify-between gap-2">
                <span className="font-body text-xs font-bold truncate">
                  {workspace.profile.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="neo-btn px-3 py-1.5 bg-[#F5A9DD] text-[#171717] text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation (Compact, Touch-Friendly) */}
      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-[#181820] border-t-[2.5px] border-[#171717] dark:border-[#2E2E38] px-2 py-1.5 flex items-center justify-around"
      >
        {MOBILE_BOTTOM_TABS.map((pageId) => {
          const item = NAV_ITEMS.find((n) => n.id === pageId)!;
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-[10px] min-h-[44px] transition-colors cursor-pointer ${
                isActive
                  ? `${item.accent} text-[#171717] border-2 border-[#171717]`
                  : 'text-[#171717]/70 dark:text-white/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-body text-[10px] font-bold mt-0.5 whitespace-nowrap">
                {lang === 'id' ? item.labelId.split(' ')[0] : item.labelEn.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

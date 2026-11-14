import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  FolderKanban,
  GraduationCap,
  RefreshCw,
  StickyNote,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudora } from '../context/StudoraContext';
import { HERO_ILLUSTRATION_URL, MOTIVATION_QUOTES } from '../data/studoraDemoData';
import { NeoButton, NeoCard } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

export const DashboardPage: React.FC = () => {
  const { workspace, stats, setActivePage, updateWorkspace } = useStudora();
  const { showToast } = useToast();
  const [quoteIdx, setQuoteIdx] = useState(0);

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    const isId = workspace?.settings.language === 'id';
    if (hr < 12) return isId ? 'Selamat Pagi' : 'Good Morning';
    if (hr < 17) return isId ? 'Selamat Siang' : 'Good Afternoon';
    return isId ? 'Selamat Malam' : 'Good Evening';
  }, [workspace?.settings.language]);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  if (!workspace) return null;

  const todayIso = new Date().toISOString().split('T')[0];
  const todaySchedule = workspace.schedule
    .filter((s) => s.date === todayIso)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingDeadlines = workspace.tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);

  const totalIncome = workspace.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = workspace.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const toggleQuickTaskDone = (taskId: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'Completed' } : t
      ),
    }));
    showToast('Task marked as Completed!', 'success');
  };

  const statCards = [
    {
      label: 'Total Subjects',
      value: `${workspace.courses.length}`,
      sub: `${stats.totalEnrolledSks} SKS total`,
      tone: 'lavender' as const,
      icon: BookOpen,
      target: 'academic' as const,
    },
    {
      label: 'Active Tasks',
      value: `${stats.activeTasksCount}`,
      sub: 'Pending sprint items',
      tone: 'peach' as const,
      icon: Target,
      target: 'tasks' as const,
    },
    {
      label: 'Deadlines (7d)',
      value: `${stats.upcomingDeadlinesCount}`,
      sub: 'Due this week',
      tone: 'pink' as const,
      icon: Clock,
      target: 'tasks' as const,
    },
    {
      label: 'Current GPA',
      value: stats.gpa.toFixed(2),
      sub: `${stats.totalCompletedSks} graded SKS`,
      tone: 'mint' as const,
      icon: GraduationCap,
      target: 'academic' as const,
    },
    {
      label: 'Study Hours',
      value: `${stats.weeklyStudyHours}h`,
      sub: 'Logged this week',
      tone: 'yellow' as const,
      icon: TrendingUp,
      target: 'analytics' as const,
    },
    {
      label: 'Semester Progress',
      value: `${stats.semesterProgressPct}%`,
      sub: `Semester ${workspace.profile.semester}`,
      tone: 'purple' as const,
      icon: CalendarDays,
      target: 'academic' as const,
    },
  ];

  const currentQuote = MOTIVATION_QUOTES[quoteIdx % MOTIVATION_QUOTES.length];

  return (
    <div className="space-y-6">
      {/* Hero Greeting Banner with 2D Cartoon Programmer Illustration */}
      <NeoCard tone="lavender" padding="lg" className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="font-label text-xs uppercase tracking-wider text-[#171717]/80">
              {formattedDate} · Semester {workspace.profile.semester}
            </p>
            <h2 className="font-display text-2xl sm:text-4xl text-[#171717] leading-tight text-balance">
              {greeting}, {workspace.profile.fullName.split(' ')[0]}!
            </h2>
            <p className="font-body text-sm sm:text-base text-[#171717]/85 max-w-xl leading-relaxed">
              Study Smarter. Code Better. Grow Further. You have{' '}
              <span className="font-bold">{todaySchedule.length} classes</span> scheduled today and{' '}
              <span className="font-bold">{stats.activeTasksCount} active tasks</span> in your queue.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <NeoButton tone="yellow" onClick={() => setActivePage('tasks')}>
                <span>Open Task Board</span>
                <ArrowRight className="w-4 h-4" />
              </NeoButton>
              <NeoButton tone="mint" onClick={() => setActivePage('coding')}>
                <span>Launch Coding Lab</span>
              </NeoButton>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[18px] border-[2.5px] border-[#171717] bg-[#FFF9F0] shadow-[4px_4px_0px_#171717] overflow-hidden">
              <img
                src={HERO_ILLUSTRATION_URL}
                alt="2D cartoon illustration of IT student programmer coding"
                className="w-full h-52 sm:h-60 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </NeoCard>

      {/* 6 Statistics Cards */}
      <section aria-label="Key student statistics" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <NeoCard
              key={card.label}
              tone={card.tone}
              interactive
              padding="sm"
              onClick={() => setActivePage(card.target)}
              className="flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-[10px] font-bold uppercase tracking-tight">
                  {card.label}
                </span>
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <div className="mt-3">
                <p className="font-stat text-2xl sm:text-3xl font-bold tracking-tight">
                  {card.value}
                </p>
                <p className="font-body text-xs opacity-75 mt-0.5 truncate">{card.sub}</p>
              </div>
            </NeoCard>
          );
        })}
      </section>

      {/* Main Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Widget 1: Today's Schedule */}
        <NeoCard tone="white" className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-[#171717]/10 dark:border-white/10">
              <h3 className="font-label text-xs sm:text-sm font-bold">Today&apos;s Schedule</h3>
              <button
                type="button"
                onClick={() => setActivePage('schedule')}
                className="font-body text-xs font-bold underline cursor-pointer"
              >
                Full Calendar
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {todaySchedule.length === 0 ? (
                <p className="font-body text-sm opacity-70 py-6 text-center">
                  No classes scheduled for today. Great time for deep coding!
                </p>
              ) : (
                todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-[14px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#242430] flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-body text-sm font-bold truncate">{item.title}</p>
                      <p className="font-body text-xs opacity-75 mt-0.5 truncate">
                        {item.location} · {item.category}
                      </p>
                    </div>
                    <span className="font-stat text-xs font-bold px-2 py-1 rounded-md border border-[#171717] bg-[#FFE69A] text-[#171717] shrink-0">
                      {item.startTime}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </NeoCard>

        {/* Widget 3: Weekly Productivity Chart */}
        <NeoCard tone="white" className="lg:col-span-7">
          <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-[#171717]/10 dark:border-white/10">
            <div>
              <h3 className="font-label text-xs sm:text-sm font-bold">Weekly Productivity</h3>
              <p className="font-body text-xs opacity-70 mt-0.5">
                Study hours vs focused coding sessions
              </p>
            </div>
            <NeoButton size="sm" tone="yellow" onClick={() => setActivePage('analytics')}>
              Analytics
            </NeoButton>
          </div>
          <div className="h-60 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workspace.studyStats} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,23,23,0.12)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '2px solid #171717',
                    boxShadow: '3px 3px 0px #171717',
                    backgroundColor: '#FFF9F0',
                    color: '#171717',
                  }}
                />
                <Bar dataKey="studyHours" name="Study (hrs)" fill="#A78BFA" stroke="#171717" strokeWidth={2} radius={[6, 6, 0, 0]} />
                <Bar dataKey="codingHours" name="Coding (hrs)" fill="#B9F5C8" stroke="#171717" strokeWidth={2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>

        {/* Widget 2: Upcoming Deadlines */}
        <NeoCard tone="white" className="lg:col-span-6">
          <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-[#171717]/10 dark:border-white/10">
            <h3 className="font-label text-xs sm:text-sm font-bold">Upcoming Deadlines</h3>
            <button
              type="button"
              onClick={() => setActivePage('tasks')}
              className="font-body text-xs font-bold underline cursor-pointer"
            >
              Manage Tasks
            </button>
          </div>
          <div className="mt-4 space-y-2.5">
            {upcomingDeadlines.length === 0 ? (
              <p className="font-body text-sm opacity-70 py-4 text-center">
                All tasks completed! Nice work.
              </p>
            ) : (
              upcomingDeadlines.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-[14px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#242430] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleQuickTaskDone(t.id)}
                      aria-label={`Mark ${t.title} complete`}
                      className="w-6 h-6 rounded-[7px] border-2 border-[#171717] bg-white hover:bg-[#B9F5C8] flex items-center justify-center shrink-0 cursor-pointer text-[#171717]"
                    >
                      <Check className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                    </button>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-bold truncate">{t.title}</p>
                      <p className="font-body text-xs opacity-70 truncate">
                        {t.subject} · {t.priority}
                      </p>
                    </div>
                  </div>
                  <span className="font-stat text-xs font-bold shrink-0">{t.deadline}</span>
                </div>
              ))
            )}
          </div>
        </NeoCard>

        {/* Widget 4: Learning Progress */}
        <NeoCard tone="mint" className="lg:col-span-6">
          <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-[#171717]/15">
            <h3 className="font-label text-xs sm:text-sm font-bold">Learning Roadmap Progress</h3>
            <button
              type="button"
              onClick={() => setActivePage('roadmap')}
              className="font-body text-xs font-bold underline cursor-pointer"
            >
              Explore All 8 Tracks
            </button>
          </div>
          <div className="mt-4 space-y-3.5">
            {workspace.roadmaps.slice(0, 4).map((rm) => {
              const done = rm.steps.filter((s) => s.completed).length;
              const pct = Math.round((done / rm.steps.length) * 100);
              return (
                <div key={rm.id}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="font-body">{rm.title}</span>
                    <span className="font-stat">
                      {done}/{rm.steps.length} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3.5 rounded-full border-2 border-[#171717] bg-white overflow-hidden">
                    <div
                      className="h-full bg-[#A78BFA] border-r-2 border-[#171717] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </NeoCard>

        {/* Widget 5: Recent Projects */}
        <NeoCard tone="white" className="lg:col-span-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              <h3 className="font-label text-xs sm:text-sm font-bold">Recent Projects</h3>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('projects')}
              className="font-body text-xs font-bold underline cursor-pointer"
            >
              All
            </button>
          </div>
          <div className="mt-3 space-y-2.5">
            {workspace.projects.slice(0, 3).map((p) => {
              const done = p.tasks.filter((t) => t.done).length;
              const pct = p.tasks.length > 0 ? Math.round((done / p.tasks.length) * 100) : 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePage('projects')}
                  className="w-full text-left p-3 rounded-[14px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#242430] hover:bg-[#FFE69A] hover:text-[#171717] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body text-sm font-bold truncate">{p.title}</p>
                    <span className="font-stat text-xs font-bold">{pct}%</span>
                  </div>
                  <p className="font-body text-xs opacity-70 mt-0.5">
                    {p.category} · Due {p.deadline}
                  </p>
                </button>
              );
            })}
          </div>
        </NeoCard>

        {/* Widget 6: Recent Notes */}
        <NeoCard tone="white" className="lg:col-span-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              <h3 className="font-label text-xs sm:text-sm font-bold">Recent Notes</h3>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('notes')}
              className="font-body text-xs font-bold underline cursor-pointer"
            >
              Notes
            </button>
          </div>
          <div className="mt-3 space-y-2.5">
            {workspace.notes.slice(0, 3).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActivePage('notes')}
                className="w-full text-left p-3 rounded-[14px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#242430] hover:bg-[#C4B5FD] hover:text-[#171717] transition-colors cursor-pointer"
              >
                <p className="font-body text-sm font-bold truncate">{n.title}</p>
                <p className="font-body text-xs opacity-70 mt-0.5 truncate">
                  {n.category} · Updated {n.updatedAt}
                </p>
              </button>
            ))}
          </div>
        </NeoCard>

        {/* Widget 7 & 8: Finance Overview + Daily Motivation */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <NeoCard tone="yellow" className="flex-1">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#171717]/15">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <h3 className="font-label text-xs font-bold">Finance Overview</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('finance')}
                className="font-body text-xs font-bold underline cursor-pointer"
              >
                Ledger
              </button>
            </div>
            <div className="mt-3">
              <p className="font-body text-xs opacity-75">Current Balance</p>
              <p className="font-stat text-2xl font-bold mt-0.5">{formatIDR(balance)}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-body">
                <div className="p-2 rounded-[10px] border-2 border-[#171717] bg-[#B9F5C8]">
                  <span className="block opacity-75">Income</span>
                  <span className="font-stat font-bold">{formatIDR(totalIncome)}</span>
                </div>
                <div className="p-2 rounded-[10px] border-2 border-[#171717] bg-[#F5A9DD]">
                  <span className="block opacity-75">Expense</span>
                  <span className="font-stat font-bold">{formatIDR(totalExpense)}</span>
                </div>
              </div>
            </div>
          </NeoCard>

          <NeoCard tone="peach">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-label text-xs font-bold">Daily Motivation</h3>
              <button
                type="button"
                onClick={() => setQuoteIdx((i) => i + 1)}
                aria-label="Next motivation quote"
                className="p-1.5 rounded-[8px] border-2 border-[#171717] bg-white hover:bg-[#FFE69A] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-body text-sm font-medium mt-2.5 leading-snug">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <p className="font-label text-[10px] opacity-75 mt-2">— {currentQuote.author}</p>
          </NeoCard>
        </div>
      </div>
    </div>
  );
};

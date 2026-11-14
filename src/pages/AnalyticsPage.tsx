import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudora } from '../context/StudoraContext';
import { GRADE_POINTS } from '../data/studoraDemoData';
import { NeoButton, NeoCard } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

const CODING_HEATMAP = [
  1, 3, 2, 4, 2, 1, 0,
  2, 4, 3, 4, 3, 2, 1,
  3, 2, 4, 4, 3, 1, 2,
  4, 3, 4, 2, 3, 4, 3,
];

export const AnalyticsPage: React.FC = () => {
  const { workspace, stats } = useStudora();
  const { showToast } = useToast();
  const [range, setRange] = useState<'week' | 'month'>('week');

  const monthlyTrend = useMemo(
    () => [
      { week: 'Week 1', productivity: 72, studyHours: 24 },
      { week: 'Week 2', productivity: 79, studyHours: 28 },
      { week: 'Week 3', productivity: 84, studyHours: 31 },
      { week: 'Week 4', productivity: 91, studyHours: Math.round(stats.weeklyStudyHours) },
    ],
    [stats.weeklyStudyHours]
  );

  const semesterGpaSeries = useMemo(() => {
    const courses = workspace?.courses || [];
    const bySem: Record<number, { pts: number; sks: number }> = {};
    courses.forEach((c) => {
      const gp = GRADE_POINTS[c.grade];
      if (gp !== null) {
        if (!bySem[c.semester]) bySem[c.semester] = { pts: 0, sks: 0 };
        bySem[c.semester].pts += gp * c.sks;
        bySem[c.semester].sks += c.sks;
      }
    });
    return Object.entries(bySem)
      .map(([sem, val]) => ({
        semester: `Sem ${sem}`,
        gpa: Number((val.pts / val.sks).toFixed(2)),
      }))
      .sort((a, b) => a.semester.localeCompare(b.semester));
  }, [workspace?.courses]);

  const roadmapSeries = useMemo(() => {
    return (workspace?.roadmaps || []).map((rm) => {
      const done = rm.steps.filter((s) => s.completed).length;
      return {
        name: rm.title.replace(' Developer', '').replace(' Designer', ''),
        progress: Math.round((done / rm.steps.length) * 100),
      };
    });
  }, [workspace?.roadmaps]);

  if (!workspace) return null;

  const taskStatusSeries = [
    { name: 'Completed', value: workspace.tasks.filter((t) => t.status === 'Completed').length, fill: '#B9F5C8' },
    { name: 'In Progress', value: workspace.tasks.filter((t) => t.status === 'In Progress').length, fill: '#A78BFA' },
    { name: 'Review', value: workspace.tasks.filter((t) => t.status === 'Review').length, fill: '#FFC98B' },
    { name: 'To Do', value: workspace.tasks.filter((t) => t.status === 'To Do').length, fill: '#FFE69A' },
  ];

  const totalTasks = workspace.tasks.length || 1;
  const completionRate = Math.round(
    (workspace.tasks.filter((t) => t.status === 'Completed').length / totalTasks) * 100
  );

  const projectProgressSeries = workspace.projects.map((p) => {
    const done = p.tasks.filter((t) => t.done).length;
    return {
      name: p.title.split(' ').slice(0, 2).join(' '),
      pct: p.tasks.length > 0 ? Math.round((done / p.tasks.length) * 100) : 0,
    };
  });

  const totalIncome = workspace.transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = workspace.transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const exportCsvReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Student', workspace.profile.fullName],
      ['Current GPA', stats.gpa.toFixed(2)],
      ['Weekly Study Hours', String(stats.weeklyStudyHours)],
      ['Task Completion Rate', `${completionRate}%`],
      ['Total Snippets', String(workspace.snippets.length)],
      ['Total Income (IDR)', String(totalIncome)],
      ['Total Expense (IDR)', String(totalExpense)],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studora-analytics-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported analytics CSV report!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <NeoCard tone="white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Productivity & Academic Analytics</h2>
            <p className="font-body text-xs opacity-75">
              Live telemetry computed across courses, tasks, coding lab, roadmaps, and finances.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NeoButton
              size="sm"
              tone={range === 'week' ? 'yellow' : 'white'}
              onClick={() => setRange('week')}
            >
              Weekly
            </NeoButton>
            <NeoButton
              size="sm"
              tone={range === 'month' ? 'yellow' : 'white'}
              onClick={() => setRange('month')}
            >
              Monthly
            </NeoButton>
            <NeoButton size="sm" tone="mint" onClick={exportCsvReport}>
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </NeoButton>
          </div>
        </div>
      </NeoCard>

      {/* Row 1: Weekly Study Hours + Monthly Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NeoCard tone="white">
          <h3 className="font-label text-sm font-bold">
            {range === 'week' ? 'Weekly Study & Coding Hours' : 'Monthly Study Hours Trend'}
          </h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {range === 'week' ? (
                <BarChart data={workspace.studyStats} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,23,23,0.12)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                  <Tooltip />
                  <Bar dataKey="studyHours" name="Study hrs" fill="#A78BFA" stroke="#171717" strokeWidth={2} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="codingHours" name="Coding hrs" fill="#FFE69A" stroke="#171717" strokeWidth={2} radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,23,23,0.12)" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="studyHours" name="Study hrs" fill="#C4B5FD" stroke="#171717" strokeWidth={2.5} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </NeoCard>

        <NeoCard tone="white">
          <h3 className="font-label text-sm font-bold">Monthly Productivity Score Trend</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,23,23,0.12)" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  name="Productivity %"
                  stroke="#171717"
                  strokeWidth={3}
                  dot={{ fill: '#B9F5C8', stroke: '#171717', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>
      </div>

      {/* Row 2: Task Completion + Academic GPA Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NeoCard tone="white">
          <div className="flex items-center justify-between">
            <h3 className="font-label text-sm font-bold">Task Completion Rate</h3>
            <span className="font-stat text-lg font-bold px-2.5 py-0.5 rounded-[8px] border-2 border-[#171717] bg-[#B9F5C8] text-[#171717]">
              {completionRate}%
            </span>
          </div>
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusSeries}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={82}
                  stroke="#171717"
                  strokeWidth={2}
                >
                  {taskStatusSeries.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-body font-semibold">
            {taskStatusSeries.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-[#171717]" style={{ backgroundColor: item.fill }} />
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </NeoCard>

        <NeoCard tone="white">
          <div className="flex items-center justify-between">
            <h3 className="font-label text-sm font-bold">Academic Performance (GPA by Semester)</h3>
            <span className="font-stat text-lg font-bold px-2.5 py-0.5 rounded-[8px] border-2 border-[#171717] bg-[#FFE69A] text-[#171717]">
              {stats.gpa.toFixed(2)} IPK
            </span>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterGpaSeries} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,23,23,0.12)" />
                <XAxis dataKey="semester" tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <YAxis domain={[2.5, 4.0]} tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  name="Semester GPA"
                  stroke="#A78BFA"
                  strokeWidth={3}
                  dot={{ fill: '#FFE69A', stroke: '#171717', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>
      </div>

      {/* Row 3: Coding Activity + Learning Progress + Project Progress & Financial Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <NeoCard tone="lavender" className="lg:col-span-4">
          <h3 className="font-label text-sm font-bold">Coding Activity (28 Days)</h3>
          <p className="font-body text-xs opacity-80 mt-1">
            {workspace.snippets.length} saved snippets · Daily commit & lab streak
          </p>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {CODING_HEATMAP.map((lvl, idx) => {
              const color =
                lvl === 0
                  ? 'bg-white'
                  : lvl === 1
                  ? 'bg-[#FFE69A]'
                  : lvl === 2
                  ? 'bg-[#FFC98B]'
                  : lvl === 3
                  ? 'bg-[#B9F5C8]'
                  : 'bg-[#171717]';
              return (
                <div
                  key={idx}
                  title={`Day ${idx + 1}: ${lvl} coding sessions`}
                  className={`h-7 rounded-[7px] border-2 border-[#171717] ${color}`}
                />
              );
            })}
          </div>
        </NeoCard>

        <NeoCard tone="white" className="lg:col-span-4">
          <h3 className="font-label text-sm font-bold">Learning Roadmap Progress</h3>
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roadmapSeries} layout="vertical" margin={{ top: 4, right: 12, left: 24, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="progress" fill="#B9F5C8" stroke="#171717" strokeWidth={1.5} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>

        <NeoCard tone="yellow" className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-label text-sm font-bold">Projects & Financial Snapshot</h3>
            <div className="mt-3 space-y-2.5">
              {projectProgressSeries.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{p.name}</span>
                    <span className="font-stat">{p.pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full border border-[#171717] bg-white overflow-hidden">
                    <div className="h-full bg-[#A78BFA]" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-[#171717]/15 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-[10px] border-2 border-[#171717] bg-[#B9F5C8]">
              <span className="block opacity-75">Net Cashflow</span>
              <span className="font-stat font-bold">
                Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-2.5 rounded-[10px] border-2 border-[#171717] bg-[#F5A9DD]">
              <span className="block opacity-75">Savings Ratio</span>
              <span className="font-stat font-bold">
                {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
              </span>
            </div>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};

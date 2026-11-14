import React, { useMemo, useState } from 'react';
import { Award, BookOpen, Calculator, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudora } from '../context/StudoraContext';
import { GRADE_POINTS } from '../data/studoraDemoData';
import { Course, CourseStatus, GradeLetter, PastelTone } from '../types/studora';
import { EmptyState, NeoButton, NeoCard, NeoModal } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

const GRADES: GradeLetter[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E', 'In Progress'];
const STATUSES: CourseStatus[] = ['Active', 'Completed', 'Retake'];
const TONES: PastelTone[] = ['lavender', 'mint', 'peach', 'pink', 'yellow', 'purple'];

export const AcademicPage: React.FC = () => {
  const { workspace, stats, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // What-If GPA Simulator state
  const [simNewSks, setSimNewSks] = useState(18);
  const [simTargetGpa, setSimTargetGpa] = useState(3.85);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [sks, setSks] = useState(3);
  const [semester, setSemester] = useState(5);
  const [grade, setGrade] = useState<GradeLetter>('In Progress');
  const [status, setStatus] = useState<CourseStatus>('Active');
  const [tone, setTone] = useState<PastelTone>('lavender');

  const courses = workspace?.courses || [];

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        if (semesterFilter !== 'all' && c.semester !== Number(semesterFilter)) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.lecturer.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.semester - a.semester || a.code.localeCompare(b.code));
  }, [courses, semesterFilter, search]);

  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { A: 0, 'A-': 0, 'B+': 0, B: 0, 'C+/C': 0, Active: 0 };
    courses.forEach((c) => {
      if (c.grade === 'A') counts['A'] += 1;
      else if (c.grade === 'A-') counts['A-'] += 1;
      else if (c.grade === 'B+') counts['B+'] += 1;
      else if (c.grade === 'B') counts['B'] += 1;
      else if (c.grade === 'In Progress') counts['Active'] += 1;
      else counts['C+/C'] += 1;
    });
    const colors = ['#B9F5C8', '#A78BFA', '#FFE69A', '#FFC98B', '#F5A9DD', '#C4B5FD'];
    return Object.entries(counts).map(([label, count], idx) => ({
      label,
      count,
      fill: colors[idx % colors.length],
    }));
  }, [courses]);

  const semesterIps = useMemo(() => {
    const targetSem = semesterFilter === 'all' ? workspace?.profile.semester || 5 : Number(semesterFilter);
    const semCourses = courses.filter((c) => c.semester === targetSem);
    let weighted = 0;
    let total = 0;
    semCourses.forEach((c) => {
      const gp = GRADE_POINTS[c.grade];
      if (gp !== null) {
        weighted += gp * c.sks;
        total += c.sks;
      }
    });
    return {
      semester: targetSem,
      ips: total > 0 ? (weighted / total).toFixed(2) : '—',
      sks: semCourses.reduce((s, c) => s + c.sks, 0),
    };
  }, [courses, semesterFilter, workspace?.profile.semester]);

  const projectedIpk = useMemo(() => {
    const curPoints = stats.gpa * stats.totalCompletedSks;
    const totalCredits = stats.totalCompletedSks + simNewSks;
    if (totalCredits === 0) return '0.00';
    return ((curPoints + simTargetGpa * simNewSks) / totalCredits).toFixed(2);
  }, [stats.gpa, stats.totalCompletedSks, simNewSks, simTargetGpa]);

  if (!workspace) return null;

  const openAddModal = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    setLecturer('');
    setSks(3);
    setSemester(workspace.profile.semester);
    setGrade('In Progress');
    setStatus('Active');
    setTone('mint');
    setModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setCode(c.code);
    setName(c.name);
    setLecturer(c.lecturer);
    setSks(c.sks);
    setSemester(c.semester);
    setGrade(c.grade);
    setStatus(c.status);
    setTone(c.tone);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !lecturer.trim()) {
      showToast('Course code, name, and lecturer are required.', 'error');
      return;
    }

    if (editingCourse) {
      updateWorkspace((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === editingCourse.id
            ? { ...c, code: code.trim(), name: name.trim(), lecturer: lecturer.trim(), sks, semester, grade, status, tone }
            : c
        ),
      }));
      showToast(`Updated ${code.trim()} successfully`, 'success');
    } else {
      const created: Course = {
        id: `c-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        lecturer: lecturer.trim(),
        sks,
        semester,
        grade,
        status,
        tone,
      };
      updateWorkspace((prev) => ({
        ...prev,
        courses: [created, ...prev.courses],
      }));
      showToast(`Added course ${created.code}`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (course: Course) => {
    updateWorkspace((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== course.id),
    }));
    showToast(`Removed ${course.code}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NeoCard tone="mint">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold">Cumulative IPK</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="font-stat text-4xl font-bold mt-2">{stats.gpa.toFixed(2)}</p>
          <p className="font-body text-xs opacity-80 mt-1">Out of 4.00 scale · Cum Laude pace</p>
        </NeoCard>

        <NeoCard tone="lavender">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold">Semester {semesterIps.semester} IPS</span>
            <Calculator className="w-4 h-4" />
          </div>
          <p className="font-stat text-4xl font-bold mt-2">{semesterIps.ips}</p>
          <p className="font-body text-xs opacity-80 mt-1">{semesterIps.sks} SKS in selected semester</p>
        </NeoCard>

        <NeoCard tone="yellow">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold">Total SKS</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="font-stat text-4xl font-bold mt-2">
            {stats.totalEnrolledSks} <span className="text-lg font-medium opacity-70">/ 144</span>
          </p>
          <p className="font-body text-xs opacity-80 mt-1">{stats.totalCompletedSks} SKS graded</p>
        </NeoCard>

        <NeoCard tone="peach">
          <span className="font-label text-xs font-bold">Degree Progress</span>
          <p className="font-stat text-4xl font-bold mt-2">{stats.semesterProgressPct}%</p>
          <div className="mt-2 h-3 rounded-full border-2 border-[#171717] bg-white overflow-hidden">
            <div
              className="h-full bg-[#A78BFA]"
              style={{ width: `${stats.semesterProgressPct}%` }}
            />
          </div>
        </NeoCard>
      </div>

      {/* GPA Simulator + Grade Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <NeoCard tone="white" className="lg:col-span-5">
          <h3 className="font-label text-sm font-bold">What-If IPK Calculator</h3>
          <p className="font-body text-xs opacity-75 mt-1">
            Simulate next semester SKS and target IPS to forecast cumulative IPK.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Planned Next SKS</span>
                <span className="font-stat">{simNewSks} SKS</span>
              </div>
              <input
                type="range"
                min={6}
                max={24}
                value={simNewSks}
                onChange={(e) => setSimNewSks(Number(e.target.value))}
                className="w-full accent-[#A78BFA] cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Target Semester GPA (IPS)</span>
                <span className="font-stat">{simTargetGpa.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={4.0}
                step={0.05}
                value={simTargetGpa}
                onChange={(e) => setSimTargetGpa(Number(e.target.value))}
                className="w-full accent-[#171717] cursor-pointer"
              />
            </div>
            <div className="p-4 rounded-[14px] border-2 border-[#171717] bg-[#FFE69A] text-[#171717] flex items-center justify-between">
              <span className="font-label text-xs font-bold">Projected Cumulative IPK</span>
              <span className="font-stat text-2xl font-bold">{projectedIpk}</span>
            </div>
          </div>
        </NeoCard>

        <NeoCard tone="white" className="lg:col-span-7">
          <h3 className="font-label text-sm font-bold">Grade Distribution</h3>
          <p className="font-body text-xs opacity-75 mt-1">
            Breakdown across all enrolled & completed courses
          </p>
          <div className="h-52 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,23,23,0.12)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '2px solid #171717',
                    boxShadow: '3px 3px 0px #171717',
                    backgroundColor: '#FFF9F0',
                    color: '#171717',
                  }}
                />
                <Bar dataKey="count" name="Courses" stroke="#171717" strokeWidth={2} radius={[8, 8, 0, 0]}>
                  {gradeDistribution.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>
      </div>

      {/* Course Management Toolbar + Transcript Table */}
      <NeoCard tone="white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#171717]/15 dark:border-white/15">
          <div>
            <h3 className="font-display text-xl">Courses & Transcript</h3>
            <p className="font-body text-xs opacity-75">
              Add, edit, or grade subjects to keep your GPA accurate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search course or lecturer..."
                className="neo-input pl-9 pr-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A]"
              />
            </div>

            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              aria-label="Filter by semester"
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] font-body font-semibold cursor-pointer"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>

            <NeoButton tone="mint" onClick={openAddModal}>
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </NeoButton>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No matching courses"
              description="Try clearing your search filter or add a new subject to your academic record."
              actionLabel="Add Course"
              onAction={openAddModal}
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[740px]">
              <thead>
                <tr className="border-b-2 border-[#171717] dark:border-white/20 font-label text-[11px] uppercase">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Lecturer</th>
                  <th className="py-3 px-3 text-center">Sem</th>
                  <th className="py-3 px-3 text-center">SKS</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]/15 dark:divide-white/10 font-body text-sm">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF9F0] dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-stat font-bold">{c.code}</td>
                    <td className="py-3 px-3 font-semibold">{c.name}</td>
                    <td className="py-3 px-3 opacity-80">{c.lecturer}</td>
                    <td className="py-3 px-3 text-center font-stat">{c.semester}</td>
                    <td className="py-3 px-3 text-center font-stat font-bold">{c.sks}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block min-w-[36px] px-2 py-0.5 rounded-[8px] border-2 border-[#171717] bg-[#FFE69A] text-[#171717] font-stat font-bold text-xs">
                        {c.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-body text-xs font-bold">
                        {c.status === 'Completed' ? '● Completed' : c.status === 'Active' ? '◐ Active' : '▲ Retake'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          aria-label={`Edit ${c.code}`}
                          className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#C4B5FD] text-[#171717] hover:opacity-85 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          aria-label={`Delete ${c.code}`}
                          className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717] hover:opacity-85 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NeoCard>

      {/* Course Add/Edit Modal */}
      <NeoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? `Edit Course ${editingCourse.code}` : 'Add New Course'}
        subtitle="Enter course credits, semester, and current grade."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-xs mb-1">Course Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. IF509"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Course Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Distributed Systems"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Lecturer</label>
            <input
              type="text"
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              placeholder="e.g. Dr. Hendra Wijaya, M.T."
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">SKS</label>
              <input
                type="number"
                min={1}
                max={6}
                value={sks}
                onChange={(e) => setSks(Number(e.target.value))}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Semester</label>
              <input
                type="number"
                min={1}
                max={14}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLetter)}
                className="neo-input w-full px-2.5 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                className="neo-input w-full px-2.5 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label text-xs mb-1.5">Card Accent Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 rounded-[10px] border-2 border-[#171717] text-xs font-bold capitalize cursor-pointer ${
                    tone === t ? 'ring-2 ring-[#171717] ring-offset-2' : 'opacity-70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <NeoButton tone="white" onClick={() => setModalOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" tone="mint">
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};

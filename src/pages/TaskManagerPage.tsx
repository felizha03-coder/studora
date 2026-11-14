import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckSquare,
  Edit3,
  Kanban,
  List,
  Paperclip,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import { StudentTask, TaskChecklistItem, TaskPriority, TaskStatus } from '../types/studora';
import { EmptyState, NeoButton, NeoCard, NeoModal } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

type TaskViewMode = 'kanban' | 'list' | 'calendar';

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Completed'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_TONE: Record<TaskStatus, 'yellow' | 'lavender' | 'peach' | 'mint'> = {
  'To Do': 'yellow',
  'In Progress': 'lavender',
  Review: 'peach',
  Completed: 'mint',
};

const PRIORITY_BG: Record<TaskPriority, string> = {
  Low: 'bg-[#B9F5C8] text-[#171717]',
  Medium: 'bg-[#FFE69A] text-[#171717]',
  High: 'bg-[#FFC98B] text-[#171717]',
  Urgent: 'bg-[#F5A9DD] text-[#171717]',
};

export const TaskManagerPage: React.FC = () => {
  const { workspace, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<TaskViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority'>('deadline');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(() => new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [subject, setSubject] = useState('');
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [newCheckText, setNewCheckText] = useState('');
  const [attachmentsText, setAttachmentsText] = useState('');

  const tasks = workspace?.tasks || [];
  const todayIso = new Date().toISOString().split('T')[0];

  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.subject));
    workspace?.courses.forEach((c) => set.add(`${c.code} · ${c.name.split(' ').slice(0, 2).join(' ')}`));
    return Array.from(set);
  }, [tasks, workspace?.courses]);

  const taskStats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const overdue = tasks.filter((t) => t.status !== 'Completed' && t.deadline < todayIso).length;
    const upcoming = tasks.filter((t) => t.status !== 'Completed' && t.deadline >= todayIso).length;
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    return { total: tasks.length, completed, overdue, upcoming, rate };
  }, [tasks, todayIso]);

  const filteredTasks = useMemo(() => {
    const prioWeight: Record<TaskPriority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    return tasks
      .filter((t) => {
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (subjectFilter !== 'all' && t.subject !== subjectFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'priority') return prioWeight[a.priority] - prioWeight[b.priority];
        return a.deadline.localeCompare(b.deadline);
      });
  }, [tasks, priorityFilter, subjectFilter, search, sortBy]);

  if (!workspace) return null;

  const openAdd = (presetStatus: TaskStatus = 'To Do') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDeadline(todayIso);
    setPriority('Medium');
    setStatus(presetStatus);
    setSubject(subjectsList[0] || 'General');
    setChecklist([]);
    setNewCheckText('');
    setAttachmentsText('');
    setModalOpen(true);
  };

  const openEdit = (t: StudentTask) => {
    setEditingTask(t);
    setTitle(t.title);
    setDescription(t.description);
    setDeadline(t.deadline);
    setPriority(t.priority);
    setStatus(t.status);
    setSubject(t.subject);
    setChecklist(t.checklist);
    setNewCheckText('');
    setAttachmentsText(t.attachments.join(', '));
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Task title is required.', 'error');
      return;
    }

    const attachments = attachmentsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingTask) {
      updateWorkspace((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: title.trim(),
                description: description.trim(),
                deadline,
                priority,
                status,
                subject: subject.trim() || 'General',
                checklist,
                attachments,
              }
            : t
        ),
      }));
      showToast('Task updated!', 'success');
    } else {
      const created: StudentTask = {
        id: `t-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        deadline,
        priority,
        status,
        subject: subject.trim() || 'General',
        checklist,
        attachments,
        createdAt: todayIso,
      };
      updateWorkspace((prev) => ({
        ...prev,
        tasks: [created, ...prev.tasks],
      }));
      showToast('Task created!', 'success');
    }
    setModalOpen(false);
  };

  const deleteTask = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    showToast('Task deleted', 'info');
  };

  const moveTaskStatus = (id: string, nextStatus: TaskStatus) => {
    updateWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)),
    }));
    showToast(`Moved to ${nextStatus}`, 'success');
  };

  const toggleSubtask = (taskId: string, itemId: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
        };
      }),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Task Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NeoCard tone="lavender" padding="sm">
          <span className="font-label text-[10px] uppercase font-bold">Total Tasks</span>
          <p className="font-stat text-3xl font-bold mt-1">{taskStats.total}</p>
          <p className="font-body text-xs opacity-75 mt-0.5">{taskStats.rate}% completion rate</p>
        </NeoCard>
        <NeoCard tone="yellow" padding="sm">
          <span className="font-label text-[10px] uppercase font-bold">Upcoming Deadlines</span>
          <p className="font-stat text-3xl font-bold mt-1">{taskStats.upcoming}</p>
          <p className="font-body text-xs opacity-75 mt-0.5">Scheduled ahead</p>
        </NeoCard>
        <NeoCard tone="pink" padding="sm">
          <div className="flex items-center justify-between">
            <span className="font-label text-[10px] uppercase font-bold">Overdue</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="font-stat text-3xl font-bold mt-1">{taskStats.overdue}</p>
          <p className="font-body text-xs opacity-75 mt-0.5">Needs attention</p>
        </NeoCard>
        <NeoCard tone="mint" padding="sm">
          <div className="flex items-center justify-between">
            <span className="font-label text-[10px] uppercase font-bold">Completed</span>
            <CheckSquare className="w-4 h-4" />
          </div>
          <p className="font-stat text-3xl font-bold mt-1">{taskStats.completed}</p>
          <p className="font-body text-xs opacity-75 mt-0.5">Shipped tasks</p>
        </NeoCard>
      </div>

      {/* Filter & View Toolbar */}
      <NeoCard tone="white">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <NeoButton
              size="sm"
              tone={viewMode === 'kanban' ? 'yellow' : 'white'}
              onClick={() => setViewMode('kanban')}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban</span>
            </NeoButton>
            <NeoButton
              size="sm"
              tone={viewMode === 'list' ? 'yellow' : 'white'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </NeoButton>
            <NeoButton
              size="sm"
              tone={viewMode === 'calendar' ? 'yellow' : 'white'}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Calendar</span>
            </NeoButton>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="neo-input pl-9 pr-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A]"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter priority"
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] cursor-pointer"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter subject"
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] max-w-[180px] cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'deadline' | 'priority')}
              aria-label="Sort tasks"
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] cursor-pointer"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="priority">Sort: Priority</option>
            </select>
            <NeoButton tone="mint" onClick={() => openAdd()}>
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </NeoButton>
          </div>
        </div>
      </NeoCard>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {STATUSES.map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div key={colStatus} className="space-y-3">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-[14px] border-2 border-[#171717] bg-white dark:bg-[#1E1E26] shadow-[3px_3px_0px_#171717]">
                  <div className="flex items-center gap-2">
                    <span className="font-label text-xs font-bold">{colStatus}</span>
                    <span className="font-stat text-xs font-bold px-2 py-0.5 rounded-md border border-[#171717] bg-[#FFE69A] text-[#171717]">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAdd(colStatus)}
                    aria-label={`Add task to ${colStatus}`}
                    className="w-7 h-7 rounded-[8px] border-2 border-[#171717] bg-[#B9F5C8] text-[#171717] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {colTasks.length === 0 ? (
                  <div className="p-5 rounded-[16px] border-2 border-dashed border-[#171717]/30 dark:border-white/20 text-center font-body text-xs opacity-65">
                    No tasks in {colStatus}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const doneChecks = task.checklist.filter((c) => c.done).length;
                    const pct =
                      task.checklist.length > 0
                        ? Math.round((doneChecks / task.checklist.length) * 100)
                        : task.status === 'Completed'
                        ? 100
                        : 0;
                    const isOverdue = task.status !== 'Completed' && task.deadline < todayIso;

                    return (
                      <NeoCard key={task.id} tone={STATUS_TONE[colStatus]} padding="sm">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                          <span className={`px-2 py-0.5 rounded-md border border-[#171717] ${PRIORITY_BG[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`font-stat ${isOverdue ? 'underline font-extrabold' : ''}`}>
                            {isOverdue ? `Overdue · ${task.deadline}` : task.deadline}
                          </span>
                        </div>

                        <h4 className="font-body text-sm font-bold mt-2.5 leading-snug">
                          {task.title}
                        </h4>
                        <p className="font-body text-xs opacity-80 mt-1">{task.subject}</p>

                        {task.checklist.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {task.checklist.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleSubtask(task.id, item.id)}
                                className="w-full flex items-center gap-2 text-left text-xs cursor-pointer"
                              >
                                <span
                                  className={`w-4 h-4 rounded border border-[#171717] flex items-center justify-center shrink-0 ${
                                    item.done ? 'bg-[#171717] text-white' : 'bg-white'
                                  }`}
                                >
                                  {item.done && <Check className="w-3 h-3" />}
                                </span>
                                <span className={item.done ? 'line-through opacity-60' : ''}>
                                  {item.text}
                                </span>
                              </button>
                            ))}
                            <div className="h-2 rounded-full border border-[#171717] bg-white overflow-hidden mt-1.5">
                              <div className="h-full bg-[#171717]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}

                        {task.attachments.length > 0 && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold opacity-80">
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate">{task.attachments.join(', ')}</span>
                          </div>
                        )}

                        <div className="mt-3 pt-2.5 border-t border-[#171717]/20 flex items-center justify-between gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                            aria-label="Move task status"
                            className="px-2 py-1 rounded-[8px] border-2 border-[#171717] bg-white text-[#171717] text-[11px] font-bold cursor-pointer"
                          >
                            {STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(task)}
                              aria-label="Edit task"
                              className="p-1.5 rounded-[8px] border-2 border-[#171717] bg-white text-[#171717] cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              aria-label="Delete task"
                              className="p-1.5 rounded-[8px] border-2 border-[#171717] bg-white text-[#171717] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </NeoCard>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <NeoCard tone="white">
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No matching tasks"
              description="Adjust your search or filters, or create a new assignment task."
              actionLabel="Create Task"
              onAction={() => openAdd()}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b-2 border-[#171717] font-label text-[11px] uppercase">
                    <th className="py-3 px-3">Task</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/15 font-body text-sm">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FFF9F0] dark:hover:bg-white/5">
                      <td className="py-3 px-3 font-bold">{t.title}</td>
                      <td className="py-3 px-3 opacity-80">{t.subject}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded border border-[#171717] text-xs font-bold ${PRIORITY_BG[t.priority]}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-stat font-semibold">{t.deadline}</td>
                      <td className="py-3 px-3">
                        <select
                          value={t.status}
                          onChange={(e) => moveTaskStatus(t.id, e.target.value as TaskStatus)}
                          className="px-2 py-1 rounded-[8px] border-2 border-[#171717] bg-white text-[#171717] text-xs font-bold cursor-pointer"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            className="p-1.5 rounded-[8px] border-2 border-[#171717] bg-[#C4B5FD] text-[#171717] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(t.id)}
                            className="p-1.5 rounded-[8px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717] cursor-pointer"
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
      )}

      {/* CALENDAR VIEW (Grouped by Deadline) */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No tasks scheduled"
                description="Create a task with a deadline to plot it on the deadline calendar."
                actionLabel="Create Task"
                onAction={() => openAdd()}
              />
            </div>
          ) : (
            filteredTasks.map((t) => (
              <NeoCard key={t.id} tone={STATUS_TONE[t.status]} interactive onClick={() => openEdit(t)}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="font-stat px-2 py-0.5 rounded border border-[#171717] bg-white text-[#171717]">
                    {t.deadline}
                  </span>
                  <span>{t.status}</span>
                </div>
                <h4 className="font-display text-base mt-3">{t.title}</h4>
                <p className="font-body text-xs opacity-80 mt-1 line-clamp-2">{t.description}</p>
                <p className="font-label text-[10px] mt-3 opacity-75">{t.subject}</p>
              </NeoCard>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Task Modal */}
      <NeoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        subtitle="Track deadlines, priorities, subtasks, and attachments."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-label text-xs mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Graph BFS Traversal"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task scope and acceptance criteria..."
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Subject Category</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                list="studora-subjects"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
              <datalist id="studora-subjects">
                {subjectsList.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checklist Editor */}
          <div>
            <label className="block font-label text-xs mb-1">Subtask Checklist</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
                placeholder="Add subtask step..."
                className="neo-input flex-1 px-3 py-1.5 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
              <NeoButton
                size="sm"
                tone="yellow"
                onClick={() => {
                  if (!newCheckText.trim()) return;
                  setChecklist((prev) => [
                    ...prev,
                    { id: `tc-${Date.now()}`, text: newCheckText.trim(), done: false },
                  ]);
                  setNewCheckText('');
                }}
              >
                Add
              </NeoButton>
            </div>
            {checklist.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-[10px] border border-[#171717]/20 bg-[#FFF9F0] dark:bg-[#14141A] text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() =>
                          setChecklist((prev) =>
                            prev.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c))
                          )
                        }
                      />
                      <span>{item.text}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setChecklist((prev) => prev.filter((c) => c.id !== item.id))}
                      className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Attachments (comma-separated filenames)</label>
            <input
              type="text"
              value={attachmentsText}
              onChange={(e) => setAttachmentsText(e.target.value)}
              placeholder="e.g. specs.pdf, schema.sql"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <NeoButton tone="white" onClick={() => setModalOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" tone="mint">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};

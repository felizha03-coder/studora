import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Edit3,
  FolderOpen,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import { PROJECT_AI_COVER_URL, PROJECT_WEB_COVER_URL } from '../data/studoraDemoData';
import { PastelTone, ProjectCategory, StudentProject } from '../types/studora';
import { EmptyState, NeoButton, NeoCard, NeoModal } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

const CATEGORIES: ProjectCategory[] = [
  'Website',
  'Mobile App',
  'UI/UX Design',
  'Database',
  'AI Project',
  'Academic Project',
];

const STATUSES: StudentProject['status'][] = ['Planning', 'Active', 'Review', 'Shipped'];

export const ProjectsPage: React.FC = () => {
  const { workspace, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<StudentProject | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Website');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<StudentProject['status']>('Active');
  const [tone, setTone] = useState<PastelTone>('mint');
  const [notes, setNotes] = useState('');
  const [attachmentsText, setAttachmentsText] = useState('');

  // Quick Task add inside Detail Modal
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const projects = workspace?.projects || [];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (catFilter !== 'all' && p.category !== catFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [projects, catFilter, search]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  if (!workspace) return null;

  const openAdd = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('Website');
    setDescription('');
    setDeadline(new Date().toISOString().split('T')[0]);
    setStatus('Active');
    setTone('mint');
    setNotes('');
    setAttachmentsText('');
    setModalOpen(true);
  };

  const openEdit = (p: StudentProject) => {
    setEditingProject(p);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setDeadline(p.deadline);
    setStatus(p.status);
    setTone(p.tone);
    setNotes(p.notes);
    setAttachmentsText(p.attachments.join(', '));
    setModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Project title is required.', 'error');
      return;
    }

    const attachments = attachmentsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const coverImage =
      category === 'AI Project'
        ? PROJECT_AI_COVER_URL
        : category === 'Website'
        ? PROJECT_WEB_COVER_URL
        : undefined;

    if (editingProject) {
      updateWorkspace((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                title: title.trim(),
                category,
                description: description.trim(),
                deadline,
                status,
                tone,
                notes: notes.trim(),
                attachments,
                coverImage: p.coverImage || coverImage,
              }
            : p
        ),
      }));
      showToast('Project updated!', 'success');
    } else {
      const created: StudentProject = {
        id: `prj-${Date.now()}`,
        title: title.trim(),
        category,
        description: description.trim(),
        deadline,
        status,
        tone,
        coverImage,
        notes: notes.trim(),
        attachments,
        members: [
          {
            id: `m-${Date.now()}`,
            name: workspace.profile.fullName,
            role: 'Project Lead',
            initials: workspace.profile.fullName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
          },
        ],
        tasks: [
          {
            id: `pt-${Date.now()}`,
            title: 'Initialize repository & project spec',
            assignee: workspace.profile.fullName,
            done: false,
          },
        ],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            title: 'Kickoff & Architecture Plan',
            date: new Date().toISOString().split('T')[0],
            completed: true,
          },
        ],
      };
      updateWorkspace((prev) => ({
        ...prev,
        projects: [created, ...prev.projects],
      }));
      showToast('Project created!', 'success');
    }
    setModalOpen(false);
  };

  const deleteProject = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
    if (selectedProjectId === id) setSelectedProjectId(null);
    showToast('Project deleted', 'info');
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
            }
          : p
      ),
    }));
  };

  const addTaskToProject = (projectId: string) => {
    if (!newTaskTitle.trim()) return;
    updateWorkspace((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  id: `pt-${Date.now()}`,
                  title: newTaskTitle.trim(),
                  assignee: newTaskAssignee.trim() || workspace.profile.fullName,
                  done: false,
                },
              ],
            }
          : p
      ),
    }));
    setNewTaskTitle('');
    setNewTaskAssignee('');
    showToast('Added project task', 'success');
  };

  const addMemberToProject = (projectId: string) => {
    if (!newMemberName.trim()) return;
    const initials = newMemberName
      .trim()
      .split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    updateWorkspace((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              members: [
                ...p.members,
                {
                  id: `m-${Date.now()}`,
                  name: newMemberName.trim(),
                  role: newMemberRole.trim() || 'Contributor',
                  initials,
                },
              ],
            }
          : p
      ),
    }));
    setNewMemberName('');
    setNewMemberRole('');
    showToast('Team member added!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <NeoCard tone="white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <NeoButton
              size="sm"
              tone={catFilter === 'all' ? 'yellow' : 'white'}
              onClick={() => setCatFilter('all')}
            >
              All Categories
            </NeoButton>
            {CATEGORIES.map((cat) => (
              <NeoButton
                key={cat}
                size="sm"
                tone={catFilter === cat ? 'yellow' : 'white'}
                onClick={() => setCatFilter(cat)}
              >
                {cat}
              </NeoButton>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="neo-input pl-9 pr-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A]"
              />
            </div>
            <NeoButton tone="mint" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </NeoButton>
          </div>
        </div>
      </NeoCard>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Start tracking a website, mobile app, database, or AI project with your team."
          actionLabel="Create Project"
          onAction={openAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => {
            const doneCount = project.tasks.filter((t) => t.done).length;
            const progress =
              project.tasks.length > 0 ? Math.round((doneCount / project.tasks.length) * 100) : 0;

            return (
              <NeoCard key={project.id} tone="white" className="flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Cover Banner */}
                  {project.coverImage ? (
                    <div className="h-44 rounded-[14px] border-2 border-[#171717] overflow-hidden mb-4 bg-[#FFF9F0]">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-32 rounded-[14px] border-2 border-[#171717] mb-4 bg-[#FFE69A] flex items-center justify-center text-[#171717]">
                      <FolderOpen className="w-10 h-10" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className="font-label text-[10px] uppercase px-2.5 py-1 rounded-[8px] border-2 border-[#171717] bg-[#C4B5FD] text-[#171717]">
                      {project.category}
                    </span>
                    <span className="font-stat">{project.status}</span>
                  </div>

                  <h3 className="font-display text-xl mt-3">{project.title}</h3>
                  <p className="font-body text-sm opacity-80 mt-1.5 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Task Completion ({doneCount}/{project.tasks.length})</span>
                      <span className="font-stat">{progress}%</span>
                    </div>
                    <div className="h-3.5 rounded-full border-2 border-[#171717] bg-[#FFF9F0] overflow-hidden">
                      <div
                        className="h-full bg-[#B9F5C8] border-r-2 border-[#171717]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t-2 border-[#171717]/15 dark:border-white/15 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs font-body font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project.members.length} members
                    </span>
                    <span className="inline-flex items-center gap-1 font-stat">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.deadline}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <NeoButton
                      size="sm"
                      tone="yellow"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      Open Workspace
                    </NeoButton>
                    <button
                      type="button"
                      onClick={() => openEdit(project)}
                      aria-label={`Edit ${project.title}`}
                      className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#C4B5FD] text-[#171717] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProject(project.id)}
                      aria-label={`Delete ${project.title}`}
                      className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </NeoCard>
            );
          })}
        </div>
      )}

      {/* Project Workspace Detail Modal */}
      <NeoModal
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProjectId(null)}
        title={selectedProject?.title || 'Project Details'}
        subtitle={
          selectedProject
            ? `${selectedProject.category} · Deadline ${selectedProject.deadline}`
            : ''
        }
        maxWidth="max-w-3xl"
      >
        {selectedProject && (
          <div className="space-y-6">
            <p className="font-body text-sm leading-relaxed">{selectedProject.description}</p>

            {/* Team Members */}
            <div>
              <h4 className="font-label text-xs font-bold uppercase mb-2">Team Members</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedProject.members.map((m) => (
                  <div
                    key={m.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] border-2 border-[#171717] bg-[#FFF9F0] text-[#171717] text-xs font-bold"
                  >
                    <span className="w-6 h-6 rounded-md bg-[#A78BFA] border border-[#171717] flex items-center justify-center font-stat">
                      {m.initials}
                    </span>
                    <span>
                      {m.name} · <span className="opacity-70">{m.role}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Teammate name..."
                  className="neo-input px-3 py-1.5 text-xs bg-[#FFF9F0] dark:bg-[#14141A]"
                />
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="Role (e.g. Backend)"
                  className="neo-input px-3 py-1.5 text-xs bg-[#FFF9F0] dark:bg-[#14141A]"
                />
                <NeoButton size="sm" tone="lavender" onClick={() => addMemberToProject(selectedProject.id)}>
                  Add Member
                </NeoButton>
              </div>
            </div>

            {/* Task Distribution */}
            <div>
              <h4 className="font-label text-xs font-bold uppercase mb-2">Task Distribution</h4>
              <div className="space-y-2 mb-3">
                {selectedProject.tasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleProjectTask(selectedProject.id, t.id)}
                    className="w-full flex items-center justify-between gap-3 p-2.5 rounded-[12px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#242430] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded border-2 border-[#171717] flex items-center justify-center ${
                          t.done ? 'bg-[#B9F5C8] text-[#171717]' : 'bg-white'
                        }`}
                      >
                        {t.done && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span className={`font-body text-sm font-semibold ${t.done ? 'line-through opacity-60' : ''}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="font-body text-xs opacity-75 shrink-0">{t.assignee}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New deliverable task..."
                  className="neo-input flex-1 px-3 py-1.5 text-xs bg-[#FFF9F0] dark:bg-[#14141A]"
                />
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  placeholder="Assignee..."
                  className="neo-input px-3 py-1.5 text-xs bg-[#FFF9F0] dark:bg-[#14141A]"
                />
                <NeoButton size="sm" tone="mint" onClick={() => addTaskToProject(selectedProject.id)}>
                  Add Task
                </NeoButton>
              </div>
            </div>

            {/* Project Timeline & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-[14px] border-2 border-[#171717] bg-[#FFE69A] text-[#171717]">
                <h4 className="font-label text-xs font-bold uppercase mb-2">Timeline Milestones</h4>
                <div className="space-y-2 text-xs font-body">
                  {selectedProject.timeline.map((m) => (
                    <div key={m.id} className="flex justify-between font-semibold">
                      <span>{m.completed ? '●' : '○'} {m.title}</span>
                      <span className="font-stat">{m.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-[14px] border-2 border-[#171717] bg-[#C4B5FD] text-[#171717]">
                <h4 className="font-label text-xs font-bold uppercase mb-2">Notes & Attachments</h4>
                <p className="font-body text-xs leading-relaxed">
                  {selectedProject.notes || 'No project notes added yet.'}
                </p>
                {selectedProject.attachments.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{selectedProject.attachments.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </NeoModal>

      {/* Create / Edit Project Modal */}
      <NeoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create Project'}
        subtitle="Organize team projects, academic capstones, or personal apps."
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentProject['status'])}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Project Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Attachments (comma-separated)</label>
            <input
              type="text"
              value={attachmentsText}
              onChange={(e) => setAttachmentsText(e.target.value)}
              placeholder="e.g. wireframe.fig, api-docs.yaml"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <NeoButton tone="white" onClick={() => setModalOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" tone="mint">
              {editingProject ? 'Save Project' : 'Create Project'}
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};

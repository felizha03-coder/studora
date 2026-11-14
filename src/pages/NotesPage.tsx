import React, { useMemo, useState } from 'react';
import {
  Bold,
  Check,
  Code,
  Edit3,
  Heart,
  List,
  Pin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import { NoteCategory, NoteChecklistItem, PastelTone, StudentNote } from '../types/studora';
import { EmptyState, NeoButton, NeoCard, NeoModal } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

const CATEGORIES: NoteCategory[] = ['Lecture Notes', 'Programming', 'Personal', 'Projects', 'Ideas'];
const TONES: PastelTone[] = ['lavender', 'mint', 'yellow', 'peach', 'pink'];

export const NotesPage: React.FC = () => {
  const { workspace, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [onlyFavs, setOnlyFavs] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudentNote | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Lecture Notes');
  const [content, setContent] = useState('');
  const [codeBlock, setCodeBlock] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('TypeScript');
  const [checklist, setChecklist] = useState<NoteChecklistItem[]>([]);
  const [newCheckText, setNewCheckText] = useState('');
  const [tone, setTone] = useState<PastelTone>('lavender');

  const notes = workspace?.notes || [];

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (catFilter !== 'all' && n.category !== catFilter) return false;
        if (onlyFavs && !n.favorite) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.codeBlock || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, catFilter, onlyFavs, search]);

  if (!workspace) return null;

  const openAdd = () => {
    setEditingNote(null);
    setTitle('');
    setCategory('Lecture Notes');
    setContent('');
    setCodeBlock('');
    setCodeLanguage('TypeScript');
    setChecklist([]);
    setNewCheckText('');
    setTone('yellow');
    setModalOpen(true);
  };

  const openEdit = (n: StudentNote) => {
    setEditingNote(n);
    setTitle(n.title);
    setCategory(n.category);
    setContent(n.content);
    setCodeBlock(n.codeBlock || '');
    setCodeLanguage(n.codeLanguage || 'TypeScript');
    setChecklist(n.checklist);
    setNewCheckText('');
    setTone(n.tone);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Note title is required.', 'error');
      return;
    }
    const todayIso = new Date().toISOString().split('T')[0];

    if (editingNote) {
      updateWorkspace((prev) => ({
        ...prev,
        notes: prev.notes.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title: title.trim(),
                category,
                content: content.trim(),
                codeBlock: codeBlock.trim() || undefined,
                codeLanguage: codeBlock.trim() ? codeLanguage : undefined,
                checklist,
                tone,
                updatedAt: todayIso,
              }
            : n
        ),
      }));
      showToast('Note updated!', 'success');
    } else {
      const created: StudentNote = {
        id: `n-${Date.now()}`,
        title: title.trim(),
        category,
        content: content.trim(),
        codeBlock: codeBlock.trim() || undefined,
        codeLanguage: codeBlock.trim() ? codeLanguage : undefined,
        checklist,
        pinned: false,
        favorite: false,
        tone,
        updatedAt: todayIso,
      };
      updateWorkspace((prev) => ({
        ...prev,
        notes: [created, ...prev.notes],
      }));
      showToast('Note created!', 'success');
    }
    setModalOpen(false);
  };

  const togglePin = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  };

  const toggleFavorite = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)),
    }));
  };

  const toggleNoteCheck = (noteId: string, itemId: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              checklist: n.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
            }
          : n
      ),
    }));
  };

  const deleteNote = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    showToast('Note deleted', 'info');
  };

  const appendFormatting = (snippet: string) => {
    setContent((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <NeoCard tone="white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <NeoButton
              size="sm"
              tone={catFilter === 'all' ? 'yellow' : 'white'}
              onClick={() => setCatFilter('all')}
            >
              All Notes
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
            <NeoButton
              size="sm"
              tone={onlyFavs ? 'pink' : 'white'}
              onClick={() => setOnlyFavs((v) => !v)}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavs ? 'fill-[#171717]' : ''}`} />
              <span>Favorites</span>
            </NeoButton>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes & code..."
                className="neo-input pl-9 pr-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A]"
              />
            </div>
            <NeoButton tone="mint" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </NeoButton>
          </div>
        </div>
      </NeoCard>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          title="No notes match your filter"
          description="Capture lecture summaries, algorithms, code blocks, and project ideas."
          actionLabel="Create Note"
          onAction={openAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {filteredNotes.map((note) => (
            <NeoCard key={note.id} tone={note.tone} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-[#171717] bg-white text-[#171717]">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      aria-label="Pin note"
                      className={`p-1.5 rounded-[8px] border border-[#171717] cursor-pointer ${
                        note.pinned ? 'bg-[#171717] text-white' : 'bg-white text-[#171717]'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(note.id)}
                      aria-label="Favorite note"
                      className="p-1.5 rounded-[8px] border border-[#171717] bg-white text-[#171717] cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${note.favorite ? 'fill-[#F5A9DD]' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-lg mt-3 leading-snug">{note.title}</h3>
                <p className="font-body text-sm mt-2 whitespace-pre-line leading-relaxed">
                  {note.content}
                </p>

                {note.codeBlock && (
                  <div className="mt-3 rounded-[12px] border-2 border-[#171717] bg-[#14141A] text-[#B9F5C8] p-3 font-code text-xs overflow-x-auto">
                    <div className="text-[10px] text-white/50 mb-1">
                      {note.codeLanguage || 'Code'}
                    </div>
                    <pre className="whitespace-pre">{note.codeBlock}</pre>
                  </div>
                )}

                {note.checklist.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {note.checklist.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleNoteCheck(note.id, item.id)}
                        className="w-full flex items-center gap-2 text-left text-xs font-semibold cursor-pointer"
                      >
                        <span
                          className={`w-4 h-4 rounded border border-[#171717] flex items-center justify-center shrink-0 ${
                            item.done ? 'bg-[#171717] text-white' : 'bg-white text-[#171717]'
                          }`}
                        >
                          {item.done && <Check className="w-3 h-3" />}
                        </span>
                        <span className={item.done ? 'line-through opacity-60' : ''}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#171717]/20 flex items-center justify-between">
                <span className="font-stat text-xs opacity-75">Updated {note.updatedAt}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(note)}
                    aria-label="Edit note"
                    className="p-1.5 rounded-[8px] border-2 border-[#171717] bg-white text-[#171717] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    aria-label="Delete note"
                    className="p-1.5 rounded-[8px] border-2 border-[#171717] bg-white text-[#171717] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </NeoCard>
          ))}
        </div>
      )}

      {/* Create / Edit Note Modal */}
      <NeoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create Note'}
        subtitle="Combine rich lecture text, code blocks, and actionable checklists."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-label text-xs mb-1">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dynamic Programming Patterns"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
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

          {/* Rich Text Formatting Helper Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label text-xs">Content</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => appendFormatting('**Key Takeaway:** ')}
                  className="px-2 py-1 rounded border border-[#171717] bg-[#FFE69A] text-[#171717] text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Bold className="w-3 h-3" /> Bold
                </button>
                <button
                  type="button"
                  onClick={() => appendFormatting('• ')}
                  className="px-2 py-1 rounded border border-[#171717] bg-[#B9F5C8] text-[#171717] text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <List className="w-3 h-3" /> Bullet
                </button>
                <button
                  type="button"
                  onClick={() => setCodeBlock((prev) => prev || '// Write code snippet here')}
                  className="px-2 py-1 rounded border border-[#171717] bg-[#C4B5FD] text-[#171717] text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Code className="w-3 h-3" /> Code Block
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write lecture notes, architecture thoughts, or exam summaries..."
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label text-xs">Code Block (optional)</label>
              <input
                type="text"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                placeholder="Language"
                className="neo-input px-2 py-0.5 text-xs bg-[#FFF9F0] dark:bg-[#14141A] w-28"
              />
            </div>
            <textarea
              rows={3}
              value={codeBlock}
              onChange={(e) => setCodeBlock(e.target.value)}
              placeholder="Paste SQL, Python, TypeScript, or terminal commands..."
              className="neo-input w-full px-3 py-2 bg-[#14141A] text-[#B9F5C8] font-code text-xs"
            />
          </div>

          {/* Checklist Builder */}
          <div>
            <label className="block font-label text-xs mb-1">Checklist</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
                placeholder="Add action item..."
                className="neo-input flex-1 px-3 py-1.5 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
              <NeoButton
                size="sm"
                tone="yellow"
                onClick={() => {
                  if (!newCheckText.trim()) return;
                  setChecklist((prev) => [
                    ...prev,
                    { id: `nc-${Date.now()}`, text: newCheckText.trim(), done: false },
                  ]);
                  setNewCheckText('');
                }}
              >
                Add
              </NeoButton>
            </div>
            {checklist.length > 0 && (
              <div className="mt-2 space-y-1">
                {checklist.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs px-2 py-1 rounded border border-[#171717]/20">
                    <span>{c.text}</span>
                    <button
                      type="button"
                      onClick={() => setChecklist((prev) => prev.filter((x) => x.id !== c.id))}
                      className="font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Note Color</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 rounded-[10px] border-2 border-[#171717] text-xs font-bold capitalize cursor-pointer ${
                    tone === t ? 'ring-2 ring-[#171717]' : 'opacity-70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <NeoButton tone="white" onClick={() => setModalOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" tone="mint">
              {editingNote ? 'Save Note' : 'Create Note'}
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};

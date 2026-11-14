import React, { useMemo, useState } from 'react';
import { Bell, BellOff, ChevronLeft, ChevronRight, Clock, Edit3, MapPin, Plus, Trash2 } from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import { ScheduleCategory, ScheduleEvent } from '../types/studora';
import { EmptyState, NeoButton, NeoCard, NeoModal } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

const CATEGORY_COLORS: Record<ScheduleCategory, string> = {
  Lecture: 'bg-[#C4B5FD] text-[#171717]',
  Lab: 'bg-[#B9F5C8] text-[#171717]',
  Exam: 'bg-[#F5A9DD] text-[#171717]',
  'Campus Event': 'bg-[#FFE69A] text-[#171717]',
};

const CATEGORIES: ScheduleCategory[] = ['Lecture', 'Lab', 'Exam', 'Campus Event'];

export const SchedulePage: React.FC = () => {
  const { workspace, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('weekly');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('Lecture');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [instructor, setInstructor] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');

  const events = workspace?.schedule || [];

  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => categoryFilter === 'all' || ev.category === categoryFilter)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [events, categoryFilter]);

  const weekDates = useMemo(() => {
    const base = new Date(selectedDate + 'T00:00:00');
    const dayIdx = base.getDay();
    const mondayOffset = dayIdx === 0 ? -6 : 1 - dayIdx;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, [selectedDate]);

  const monthCells = useMemo(() => {
    const base = new Date(selectedDate + 'T00:00:00');
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (string | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push(iso);
    }
    return {
      monthLabel: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [selectedDate]);

  if (!workspace) return null;

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const openAdd = (presetDate?: string) => {
    setEditingEvent(null);
    setTitle('');
    setCourseCode('');
    setCategory('Lecture');
    setDate(presetDate || selectedDate);
    setStartTime('09:00');
    setEndTime('11:00');
    setLocation('');
    setInstructor('');
    setReminderEnabled(true);
    setNotes('');
    setModalOpen(true);
  };

  const openEdit = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setCourseCode(ev.courseCode || '');
    setCategory(ev.category);
    setDate(ev.date);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime);
    setLocation(ev.location);
    setInstructor(ev.instructor || '');
    setReminderEnabled(ev.reminderEnabled);
    setNotes(ev.notes || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      showToast('Event title and room location are required.', 'error');
      return;
    }

    if (editingEvent) {
      updateWorkspace((prev) => ({
        ...prev,
        schedule: prev.schedule.map((item) =>
          item.id === editingEvent.id
            ? {
                ...item,
                title: title.trim(),
                courseCode: courseCode.trim() || undefined,
                category,
                date,
                startTime,
                endTime,
                location: location.trim(),
                instructor: instructor.trim() || undefined,
                reminderEnabled,
                notes: notes.trim() || undefined,
              }
            : item
        ),
      }));
      showToast('Schedule updated!', 'success');
    } else {
      const created: ScheduleEvent = {
        id: `sch-${Date.now()}`,
        title: title.trim(),
        courseCode: courseCode.trim() || undefined,
        category,
        date,
        startTime,
        endTime,
        location: location.trim(),
        instructor: instructor.trim() || undefined,
        reminderEnabled,
        notes: notes.trim() || undefined,
      };
      updateWorkspace((prev) => ({
        ...prev,
        schedule: [...prev.schedule, created],
      }));
      showToast('New schedule added!', 'success');
    }
    setModalOpen(false);
  };

  const toggleReminder = (ev: ScheduleEvent) => {
    updateWorkspace((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s) =>
        s.id === ev.id ? { ...s, reminderEnabled: !s.reminderEnabled } : s
      ),
    }));
    showToast(
      ev.reminderEnabled ? `Reminder muted for ${ev.title}` : `Reminder enabled for ${ev.title}`,
      'info'
    );
  };

  const deleteEvent = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((s) => s.id !== id),
    }));
    showToast('Schedule item removed', 'info');
  };

  const dayEvents = filteredEvents.filter((e) => e.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <NeoCard tone="white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['daily', 'weekly', 'monthly'] as CalendarViewMode[]).map((mode) => (
              <NeoButton
                key={mode}
                size="sm"
                tone={viewMode === mode ? 'yellow' : 'white'}
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode} View
              </NeoButton>
            ))}

            <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
              <button
                type="button"
                onClick={() => shiftDate(viewMode === 'monthly' ? -30 : viewMode === 'weekly' ? -7 : -1)}
                aria-label="Previous date range"
                className="neo-btn w-9 h-9 flex items-center justify-center bg-white dark:bg-[#23232D]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="neo-input px-3 py-1.5 text-sm font-stat font-bold bg-[#FFF9F0] dark:bg-[#14141A]"
              />
              <button
                type="button"
                onClick={() => shiftDate(viewMode === 'monthly' ? 30 : viewMode === 'weekly' ? 7 : 1)}
                aria-label="Next date range"
                className="neo-btn w-9 h-9 flex items-center justify-center bg-white dark:bg-[#23232D]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by schedule category"
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] font-body font-semibold cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <NeoButton tone="mint" onClick={() => openAdd()}>
              <Plus className="w-4 h-4" />
              <span>Add Schedule</span>
            </NeoButton>
          </div>
        </div>

        {/* Category Legend */}
        <div className="mt-4 pt-3 border-t-2 border-[#171717]/10 dark:border-white/10 flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter((prev) => (prev === cat ? 'all' : cat))}
              className={`px-3 py-1 rounded-[10px] border-2 border-[#171717] text-xs font-bold cursor-pointer transition-transform ${CATEGORY_COLORS[cat]} ${
                categoryFilter === cat ? 'ring-2 ring-[#171717]' : 'opacity-85 hover:opacity-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </NeoCard>

      {/* DAILY VIEW */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <span className="font-stat text-sm font-bold">{dayEvents.length} events</span>
          </div>
          {dayEvents.length === 0 ? (
            <EmptyState
              title="No classes or events today"
              description="Schedule a lecture, lab session, exam reminder, or study block for this date."
              actionLabel="Add Event"
              onAction={() => openAdd(selectedDate)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayEvents.map((ev) => (
                <NeoCard key={ev.id} className={CATEGORY_COLORS[ev.category]}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-label text-[10px] font-bold uppercase">
                        {ev.category} {ev.courseCode ? `· ${ev.courseCode}` : ''}
                      </p>
                      <h3 className="font-display text-lg mt-1">{ev.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleReminder(ev)}
                        aria-label="Toggle reminder"
                        className="p-2 rounded-[9px] border-2 border-[#171717] bg-white cursor-pointer"
                      >
                        {ev.reminderEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5 opacity-50" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(ev)}
                        aria-label="Edit schedule"
                        className="p-2 rounded-[9px] border-2 border-[#171717] bg-white cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEvent(ev.id)}
                        aria-label="Delete schedule"
                        className="p-2 rounded-[9px] border-2 border-[#171717] bg-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-body font-semibold">
                    <span className="inline-flex items-center gap-1 font-stat">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.startTime} – {ev.endTime}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {ev.location}
                    </span>
                  </div>
                  {ev.notes && <p className="font-body text-xs mt-2.5 opacity-85">{ev.notes}</p>}
                </NeoCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WEEKLY VIEW */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          {weekDates.map((iso) => {
            const dObj = new Date(iso + 'T00:00:00');
            const isSelected = iso === selectedDate;
            const list = filteredEvents.filter((e) => e.date === iso);
            return (
              <NeoCard
                key={iso}
                tone={isSelected ? 'yellow' : 'white'}
                padding="sm"
                className="flex flex-col min-h-[220px]"
              >
                <div className="flex items-center justify-between pb-2 border-b-2 border-[#171717]/15 dark:border-white/15">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(iso)}
                    className="text-left cursor-pointer"
                  >
                    <p className="font-label text-[10px] uppercase opacity-75">
                      {dObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="font-stat text-lg font-bold">{dObj.getDate()}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAdd(iso)}
                    aria-label={`Add event on ${iso}`}
                    className="w-7 h-7 rounded-[8px] border-2 border-[#171717] bg-[#FFF9F0] text-[#171717] flex items-center justify-center hover:bg-[#B9F5C8] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 space-y-2 flex-1">
                  {list.length === 0 ? (
                    <p className="font-body text-[11px] opacity-55 italic pt-2">Free day</p>
                  ) : (
                    list.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => openEdit(ev)}
                        className={`p-2 rounded-[10px] border-2 border-[#171717] cursor-pointer hover:opacity-90 ${CATEGORY_COLORS[ev.category]}`}
                      >
                        <p className="font-stat text-[10px] font-bold">
                          {ev.startTime}–{ev.endTime}
                        </p>
                        <p className="font-body text-xs font-bold leading-tight mt-0.5 line-clamp-2">
                          {ev.title}
                        </p>
                        <p className="font-body text-[10px] opacity-80 truncate mt-0.5">
                          {ev.location}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </NeoCard>
            );
          })}
        </div>
      )}

      {/* MONTHLY VIEW */}
      {viewMode === 'monthly' && (
        <NeoCard tone="white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">{monthCells.monthLabel}</h2>
            <span className="font-body text-xs opacity-70">Click any date to inspect or add event</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center font-label text-[10px] pb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthCells.cells.map((iso, idx) => {
              if (!iso) return <div key={`empty-${idx}`} className="min-h-[76px]" />;
              const dayEventsCount = filteredEvents.filter((e) => e.date === iso);
              const isSelected = iso === selectedDate;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setSelectedDate(iso);
                    setViewMode('daily');
                  }}
                  className={`min-h-[82px] p-2 rounded-[12px] border-2 border-[#171717] text-left flex flex-col justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#FFE69A] text-[#171717]'
                      : 'bg-[#FFF9F0] dark:bg-[#23232E] hover:bg-[#C4B5FD] hover:text-[#171717]'
                  }`}
                >
                  <span className="font-stat text-xs font-bold">{Number(iso.split('-')[2])}</span>
                  <div className="space-y-1 w-full">
                    {dayEventsCount.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate border border-[#171717] ${CATEGORY_COLORS[ev.category]}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEventsCount.length > 2 && (
                      <span className="font-stat text-[10px] font-bold">
                        +{dayEventsCount.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </NeoCard>
      )}

      {/* Modal */}
      <NeoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? 'Edit Schedule Item' : 'Add Schedule Item'}
        subtitle="Set class time, room location, category, and reminder."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-label text-xs mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Praktikum Basis Data"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScheduleCategory)}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">End</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Location / Room</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Labtek V R.302"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Course Code (optional)</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. IF501"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Materials or reminders to bring..."
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#A78BFA]"
            />
            <span className="font-body text-sm font-semibold">Enable reminder alert</span>
          </label>

          <div className="flex justify-between items-center pt-2">
            {editingEvent ? (
              <NeoButton
                tone="pink"
                onClick={() => {
                  deleteEvent(editingEvent.id);
                  setModalOpen(false);
                }}
              >
                Delete
              </NeoButton>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <NeoButton tone="white" onClick={() => setModalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton type="submit" tone="mint">
                {editingEvent ? 'Save Changes' : 'Save Schedule'}
              </NeoButton>
            </div>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};

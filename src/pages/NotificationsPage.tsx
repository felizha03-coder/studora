import React, { useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import { NotificationPreferences, NotificationType } from '../types/studora';
import { EmptyState, NeoButton, NeoCard } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

const TYPES: NotificationType[] = [
  'Deadline Reminders',
  'Class Reminders',
  'Exam Reminders',
  'Project Updates',
  'Learning Reminders',
  'System Notifications',
];

const PREF_LABELS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'deadlineReminders', label: 'Deadline Reminders' },
  { key: 'classReminders', label: 'Class Reminders' },
  { key: 'examReminders', label: 'Exam Reminders' },
  { key: 'projectUpdates', label: 'Project Updates' },
  { key: 'learningReminders', label: 'Learning Reminders' },
  { key: 'systemNotifications', label: 'System Notifications' },
];

export const NotificationsPage: React.FC = () => {
  const { workspace, updateWorkspace, setActivePage } = useStudora();
  const { showToast } = useToast();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const notifications = workspace?.notifications || [];

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (unreadOnly && n.read) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, typeFilter, unreadOnly]);

  if (!workspace) return null;

  const markRead = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllRead = () => {
    updateWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    showToast('All notifications marked as read', 'success');
  };

  const deleteNotification = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
    showToast('Notification deleted', 'info');
  };

  const togglePref = (key: keyof NotificationPreferences) => {
    updateWorkspace((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings.notifications,
          [key]: !prev.settings.notifications[key],
        },
      },
    }));
    showToast('Notification preference updated', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Feed */}
      <div className="lg:col-span-8 space-y-4">
        <NeoCard tone="white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter notification type"
                className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] cursor-pointer"
              >
                <option value="all">All Notification Types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <NeoButton
                size="sm"
                tone={unreadOnly ? 'yellow' : 'white'}
                onClick={() => setUnreadOnly((v) => !v)}
              >
                Unread Only
              </NeoButton>
            </div>

            <NeoButton size="sm" tone="mint" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </NeoButton>
          </div>
        </NeoCard>

        {filtered.length === 0 ? (
          <EmptyState
            title="Inbox Clear"
            description="No notifications match your active filters right now."
            actionLabel="Show All"
            onAction={() => {
              setTypeFilter('all');
              setUnreadOnly(false);
            }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <NeoCard
                key={n.id}
                tone={n.read ? 'white' : 'yellow'}
                padding="sm"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-[12px] border-2 border-[#171717] bg-[#C4B5FD] text-[#171717] shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="font-label uppercase opacity-75">{n.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-stat opacity-70">{n.timestamp}</span>
                      {!n.read && (
                        <span className="px-1.5 py-0.5 rounded border border-[#171717] bg-[#B9F5C8] text-[#171717] text-[10px]">
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="font-body text-sm font-bold mt-1">{n.title}</h3>
                    <p className="font-body text-xs opacity-85 mt-0.5">{n.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.targetPage && (
                    <NeoButton
                      size="sm"
                      tone="white"
                      onClick={() => {
                        markRead(n.id);
                        setActivePage(n.targetPage!);
                      }}
                    >
                      Open
                    </NeoButton>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      aria-label="Mark as read"
                      className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#B9F5C8] text-[#171717] cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(n.id)}
                    aria-label="Delete notification"
                    className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </NeoCard>
            ))}
          </div>
        )}
      </div>

      {/* Preferences Sidebar */}
      <NeoCard tone="lavender" className="lg:col-span-4">
        <h3 className="font-label text-sm font-bold">Notification Preferences</h3>
        <p className="font-body text-xs opacity-80 mt-1">
          Control which reminders appear in your STUDORA alert center.
        </p>
        <div className="mt-4 space-y-2.5">
          {PREF_LABELS.map((item) => {
            const checked = workspace.settings.notifications[item.key];
            return (
              <label
                key={item.key}
                className="flex items-center justify-between gap-3 p-3 rounded-[12px] border-2 border-[#171717] bg-white text-[#171717] cursor-pointer"
              >
                <span className="font-body text-xs font-bold">{item.label}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePref(item.key)}
                  className="w-4 h-4 accent-[#171717]"
                />
              </label>
            );
          })}
        </div>
      </NeoCard>
    </div>
  );
};

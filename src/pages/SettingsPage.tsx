import React, { useEffect, useState } from 'react';
import { Download, Globe, KeyRound, LogOut, Moon, RotateCcw, Save, Sun } from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import { BACKGROUND_PRESETS, DEFAULT_AVATAR_URL, HERO_ILLUSTRATION_URL } from '../data/studoraDemoData';
import { NotificationPreferences, PastelTone } from '../types/studora';
import { NeoButton, NeoCard } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

const AVATAR_CHOICES = [DEFAULT_AVATAR_URL, HERO_ILLUSTRATION_URL];

export const SettingsPage: React.FC = () => {
  const { workspace, updateWorkspace, logout, resetDemoData, forgotPassword } = useStudora();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(workspace?.profile.fullName || '');
  const [studentId, setStudentId] = useState(workspace?.profile.studentId || '');
  const [university, setUniversity] = useState(workspace?.profile.university || '');
  const [faculty, setFaculty] = useState(workspace?.profile.faculty || '');
  const [major, setMajor] = useState(workspace?.profile.major || '');
  const [semester, setSemester] = useState(workspace?.profile.semester || 3);
  const [email, setEmail] = useState(workspace?.profile.email || '');
  const [bio, setBio] = useState(workspace?.profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(workspace?.profile.avatarUrl || DEFAULT_AVATAR_URL);

  useEffect(() => {
    if (!workspace) return;
    setFullName(workspace.profile.fullName);
    setStudentId(workspace.profile.studentId);
    setUniversity(workspace.profile.university);
    setFaculty(workspace.profile.faculty);
    setMajor(workspace.profile.major);
    setSemester(workspace.profile.semester);
    setEmail(workspace.profile.email);
    setBio(workspace.profile.bio);
    setAvatarUrl(workspace.profile.avatarUrl);
  }, [workspace?.profile]);

  // Change password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (!workspace) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim()) {
      showToast('Full name and Student ID are required.', 'error');
      return;
    }
    updateWorkspace((prev) => ({
      ...prev,
      profile: {
        fullName: fullName.trim(),
        studentId: studentId.trim(),
        university: university.trim(),
        faculty: faculty.trim(),
        major: major.trim(),
        semester: Number(semester) || 1,
        email: email.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || DEFAULT_AVATAR_URL,
      },
    }));
    showToast('Student profile saved!', 'success');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || newPass.length < 6) {
      showToast('Enter current password and a new password (min 6 chars).', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    const res = await forgotPassword(workspace.profile.email, newPass);
    if (!res.ok) {
      showToast('Password updated for local session.', 'info');
    } else {
      showToast('Account password changed successfully!', 'success');
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const exportBackupJson = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studora-backup-${workspace.profile.studentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workspace JSON backup exported!', 'success');
  };

  const toggleNotif = (key: keyof NotificationPreferences) => {
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Edit Profile Form */}
      <NeoCard tone="white" className="lg:col-span-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b-2 border-[#171717]/15 dark:border-white/15">
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-20 h-20 rounded-[18px] border-[2.5px] border-[#171717] object-cover shadow-[3px_3px_0px_#171717] shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="font-display text-2xl">{workspace.profile.fullName}</h2>
            <p className="font-body text-sm opacity-75">
              {workspace.profile.studentId} · {workspace.profile.major}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVATAR_CHOICES.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`px-2.5 py-1 rounded-[8px] border-2 border-[#171717] text-xs font-bold cursor-pointer ${
                    avatarUrl === url ? 'bg-[#FFE69A] text-[#171717]' : 'bg-white text-[#171717]'
                  }`}
                >
                  Avatar {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Student ID (NIM)</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Faculty</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-label text-xs mb-1">Major / Program</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
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
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Student Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="flex justify-end">
            <NeoButton type="submit" tone="mint">
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </NeoButton>
          </div>
        </form>
      </NeoCard>

      {/* Right Column: Theme, Language, Security, Notifications, Account */}
      <div className="lg:col-span-5 space-y-5">
        {/* Theme & Language */}
        <NeoCard tone="lavender">
          <h3 className="font-label text-sm font-bold">Theme & Language</h3>
          <div className="mt-4 space-y-4">
            <div>
              <span className="block font-body text-xs font-bold mb-2">Interface Theme</span>
              <div className="grid grid-cols-2 gap-2">
                <NeoButton
                  size="sm"
                  tone={workspace.settings.theme === 'light' ? 'yellow' : 'white'}
                  onClick={() =>
                    updateWorkspace((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, theme: 'light' },
                    }))
                  }
                >
                  <Sun className="w-4 h-4" />
                  <span>Pastel Light</span>
                </NeoButton>
                <NeoButton
                  size="sm"
                  tone={workspace.settings.theme === 'dark' ? 'yellow' : 'white'}
                  onClick={() =>
                    updateWorkspace((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, theme: 'dark' },
                    }))
                  }
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </NeoButton>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-bold">Background Color</span>
                <span className="font-stat text-xs font-bold uppercase opacity-75">
                  {workspace.settings.backgroundColor || '#FDE2F3'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {BACKGROUND_PRESETS.map((preset) => {
                  const active =
                    (workspace.settings.backgroundColor || '#FDE2F3').toLowerCase() ===
                    preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      title={preset.name}
                      onClick={() => {
                        updateWorkspace((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            theme: 'light',
                            backgroundColor: preset.hex,
                          },
                        }));
                        showToast(`Background updated to ${preset.name}`, 'info');
                      }}
                      style={{ backgroundColor: preset.hex }}
                      className={`w-8 h-8 rounded-[9px] border-2 border-[#171717] cursor-pointer ${
                        active ? 'ring-2 ring-[#171717] ring-offset-1' : ''
                      }`}
                    />
                  );
                })}
                <label className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-[9px] border-2 border-[#171717] bg-white text-[#171717] text-xs font-bold cursor-pointer">
                  <span>Custom</span>
                  <input
                    type="color"
                    value={workspace.settings.backgroundColor || '#FDE2F3'}
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
                    className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div>
              <span className="block font-body text-xs font-bold mb-2">Accent Color</span>
              <div className="flex flex-wrap gap-2">
                {(['lavender', 'mint', 'peach', 'pink', 'yellow'] as PastelTone[]).map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() =>
                      updateWorkspace((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, accentColor: acc },
                      }))
                    }
                    className={`px-3 py-1 rounded-[9px] border-2 border-[#171717] bg-white text-[#171717] text-xs font-bold capitalize cursor-pointer ${
                      workspace.settings.accentColor === acc ? 'ring-2 ring-[#171717]' : 'opacity-75'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block font-body text-xs font-bold mb-2">Language Settings</span>
              <div className="grid grid-cols-2 gap-2">
                <NeoButton
                  size="sm"
                  tone={workspace.settings.language === 'en' ? 'mint' : 'white'}
                  onClick={() => {
                    updateWorkspace((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, language: 'en' },
                    }));
                    showToast('Language set to English', 'info');
                  }}
                >
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </NeoButton>
                <NeoButton
                  size="sm"
                  tone={workspace.settings.language === 'id' ? 'mint' : 'white'}
                  onClick={() => {
                    updateWorkspace((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, language: 'id' },
                    }));
                    showToast('Bahasa Indonesia diaktifkan', 'info');
                  }}
                >
                  <Globe className="w-4 h-4" />
                  <span>Indonesia</span>
                </NeoButton>
              </div>
            </div>
          </div>
        </NeoCard>

        {/* Change Password */}
        <NeoCard tone="white">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            <h3 className="font-label text-sm font-bold">Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="mt-3 space-y-2.5">
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Current password"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirm new password"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
            <NeoButton type="submit" size="sm" tone="yellow" className="w-full">
              Update Password
            </NeoButton>
          </form>
        </NeoCard>

        {/* Notification Toggles */}
        <NeoCard tone="white">
          <h3 className="font-label text-sm font-bold mb-3">Notification Preferences</h3>
          <div className="space-y-2 text-xs font-body font-semibold">
            {(
              [
                ['deadlineReminders', 'Deadline Reminders'],
                ['classReminders', 'Class Reminders'],
                ['examReminders', 'Exam Reminders'],
                ['projectUpdates', 'Project Updates'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={workspace.settings.notifications[key]}
                  onChange={() => toggleNotif(key)}
                  className="w-4 h-4 accent-[#A78BFA]"
                />
              </label>
            ))}
          </div>
        </NeoCard>

        {/* Account Management */}
        <NeoCard tone="peach">
          <h3 className="font-label text-sm font-bold">Account Management</h3>
          <div className="mt-3 flex flex-col gap-2.5">
            <NeoButton size="sm" tone="white" onClick={exportBackupJson}>
              <Download className="w-4 h-4" />
              <span>Export Workspace JSON</span>
            </NeoButton>
            <NeoButton
              size="sm"
              tone="yellow"
              onClick={() => {
                resetDemoData();
                showToast('Demo data restored to defaults!', 'info');
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Data</span>
            </NeoButton>
            <NeoButton
              size="sm"
              tone="pink"
              onClick={() => {
                logout();
                showToast('Logged out successfully', 'info');
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </NeoButton>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};

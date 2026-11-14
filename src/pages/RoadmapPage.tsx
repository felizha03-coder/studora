import React, { useMemo, useState } from 'react';
import { Award, Check, ExternalLink, Layers, Sparkles, Star } from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import { NeoButton, NeoCard } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

export const RoadmapPage: React.FC = () => {
  const { workspace, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [selectedTrackId, setSelectedTrackId] = useState<string>('rm-fe');
  const [tierFilter, setTierFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const roadmaps = workspace?.roadmaps || [];

  const gamification = useMemo(() => {
    let earnedXp = 0;
    let totalSteps = 0;
    let doneSteps = 0;
    const unlockedBadges: string[] = [];

    roadmaps.forEach((track) => {
      let trackDone = 0;
      track.steps.forEach((s) => {
        totalSteps += 1;
        if (s.completed) {
          earnedXp += s.xp;
          doneSteps += 1;
          trackDone += 1;
        }
      });
      if (trackDone >= 2) unlockedBadges.push(track.badgeName);
    });

    const level = Math.floor(earnedXp / 400) + 1;
    const levelXpProgress = Math.round(((earnedXp % 400) / 400) * 100);
    return { earnedXp, totalSteps, doneSteps, level, levelXpProgress, unlockedBadges };
  }, [roadmaps]);

  if (!workspace) return null;

  const activeTrack = roadmaps.find((r) => r.id === selectedTrackId) || roadmaps[0];
  const trackDoneCount = activeTrack.steps.filter((s) => s.completed).length;
  const trackPct = Math.round((trackDoneCount / activeTrack.steps.length) * 100);

  const toggleStep = (trackId: string, stepId: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      roadmaps: prev.roadmaps.map((track) => {
        if (track.id !== trackId) return track;
        return {
          ...track,
          steps: track.steps.map((st) => {
            if (st.id !== stepId) return st;
            const nextState = !st.completed;
            showToast(
              nextState ? `Completed "${st.title}" (+${st.xp} XP)` : `Unchecked "${st.title}"`,
              nextState ? 'success' : 'info'
            );
            return { ...st, completed: nextState };
          }),
        };
      }),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Student Level, XP & Achievement Badges Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <NeoCard tone="lavender" className="lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold uppercase">Developer Rank</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="font-display text-3xl">Level {gamification.level}</span>
            <span className="font-stat text-sm font-bold">{gamification.earnedXp} XP Total</span>
          </div>
          <div className="mt-3 h-4 rounded-full border-2 border-[#171717] bg-white overflow-hidden">
            <div
              className="h-full bg-[#FFE69A] border-r-2 border-[#171717] transition-all duration-300"
              style={{ width: `${gamification.levelXpProgress}%` }}
            />
          </div>
          <p className="font-body text-xs mt-2 opacity-85">
            {gamification.doneSteps} of {gamification.totalSteps} career milestones completed
          </p>
        </NeoCard>

        <NeoCard tone="yellow" className="lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-label text-xs font-bold uppercase">Unlocked Achievement Badges</h2>
            <Award className="w-4 h-4" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {gamification.unlockedBadges.length === 0 ? (
              <p className="font-body text-xs opacity-75">
                Complete at least 2 modules in any track to unlock its specialty badge!
              </p>
            ) : (
              gamification.unlockedBadges.map((badge) => (
                <div
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border-2 border-[#171717] bg-[#B9F5C8] text-[#171717] font-body text-xs font-bold shadow-[2px_2px_0px_#171717]"
                >
                  <Star className="w-3.5 h-3.5 fill-[#FFE69A]" />
                  <span>{badge}</span>
                </div>
              ))
            )}
          </div>
        </NeoCard>
      </div>

      {/* 8 Track Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roadmaps.map((track) => {
          const done = track.steps.filter((s) => s.completed).length;
          const pct = Math.round((done / track.steps.length) * 100);
          const active = track.id === activeTrack.id;
          return (
            <NeoCard
              key={track.id}
              tone={active ? track.tone : 'white'}
              interactive
              padding="sm"
              onClick={() => setSelectedTrackId(track.id)}
              className={active ? 'ring-2 ring-[#171717]' : ''}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-stat text-xs font-bold">{pct}%</span>
                <Layers className="w-3.5 h-3.5 opacity-70" />
              </div>
              <h3 className="font-label text-xs font-bold mt-2 leading-snug">{track.title}</h3>
              <div className="mt-2 h-2 rounded-full border border-[#171717] bg-white overflow-hidden">
                <div className="h-full bg-[#171717]" style={{ width: `${pct}%` }} />
              </div>
            </NeoCard>
          );
        })}
      </div>

      {/* Selected Roadmap Detailed Curriculum */}
      <NeoCard tone="white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#171717]/15 dark:border-white/15">
          <div>
            <span className="font-label text-[10px] uppercase opacity-70">
              Badge Reward · {activeTrack.badgeName}
            </span>
            <h2 className="font-display text-2xl mt-1">{activeTrack.title}</h2>
            <p className="font-body text-sm opacity-75 mt-1">{activeTrack.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((tier) => (
              <NeoButton
                key={tier}
                size="sm"
                tone={tierFilter === tier ? 'yellow' : 'white'}
                onClick={() => setTierFilter(tier)}
              >
                {tier}
              </NeoButton>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-bold mb-4">
          <span>
            Track Progress: {trackDoneCount} of {activeTrack.steps.length} milestones
          </span>
          <span className="font-stat">{trackPct}% Complete</span>
        </div>

        <div className="space-y-3">
          {activeTrack.steps
            .filter((s) => tierFilter === 'All' || s.tier === tierFilter)
            .map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-[16px] border-2 border-[#171717] transition-colors ${
                  step.completed
                    ? 'bg-[#B9F5C8] text-[#171717]'
                    : 'bg-[#FFF9F0] dark:bg-[#242430]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStep(activeTrack.id, step.id)}
                      aria-label={`Toggle ${step.title}`}
                      className={`mt-0.5 w-6 h-6 rounded-[8px] border-2 border-[#171717] flex items-center justify-center shrink-0 cursor-pointer ${
                        step.completed ? 'bg-[#171717] text-white' : 'bg-white text-[#171717]'
                      }`}
                    >
                      {step.completed && <Check className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-label text-[10px] font-bold px-2 py-0.5 rounded border border-[#171717] bg-[#FFE69A] text-[#171717]">
                          {step.tier}
                        </span>
                        <span className="font-stat text-xs font-bold">+{step.xp} XP</span>
                      </div>
                      <h4 className="font-display text-base mt-1.5">{step.title}</h4>
                      <p className="font-body text-sm opacity-85 mt-1">{step.description}</p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-body">
                        <span className="font-bold">Materials:</span>
                        <span>{step.materials.join(' · ')}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={step.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="neo-btn px-3 py-1.5 bg-white text-[#171717] text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Study Guide</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
        </div>
      </NeoCard>
    </div>
  );
};

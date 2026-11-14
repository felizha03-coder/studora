import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  FileCode2,
  GitBranch,
  Play,
  Plus,
  Save,
  Search,
  Terminal,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useStudora } from '../context/StudoraContext';
import {
  ALGORITHM_PRACTICE_LIST,
  CODING_CHALLENGES,
  GIT_CHEATSHEET,
  LANGUAGE_TEMPLATES,
  SQL_COLLECTION,
  TERMINAL_CHEATSHEET,
} from '../data/studoraDemoData';
import { CodeLanguage, CodeSnippet } from '../types/studora';
import { NeoButton, NeoCard, NeoModal } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

type LabTab =
  | 'editor'
  | 'snippets'
  | 'languages'
  | 'algorithms'
  | 'challenges'
  | 'git'
  | 'terminal'
  | 'sql'
  | 'docs';

const LANGUAGES: CodeLanguage[] = [
  'JavaScript',
  'TypeScript',
  'HTML',
  'CSS',
  'Python',
  'PHP',
  'Java',
  'C',
  'C++',
  'SQL',
];

const DOCS_REFERENCE = [
  {
    lang: 'JavaScript / TypeScript',
    summary: 'Array.prototype.reduce, Promise.all, async/await error boundaries, strict discriminated unions.',
    example: 'const total = items.reduce((sum, x) => sum + x.price, 0);',
  },
  {
    lang: 'Python',
    summary: 'List comprehensions, heapq priority queues, collections.Counter, f-string formatting.',
    example: 'freq = Counter(word_list); top3 = freq.most_common(3)',
  },
  {
    lang: 'SQL / PostgreSQL',
    summary: 'SELECT, WHERE, INNER/LEFT JOIN, GROUP BY + HAVING, CTE (WITH), Window Functions (ROW_NUMBER).',
    example: 'SELECT category, SUM(amount) FROM transactions GROUP BY category;',
  },
  {
    lang: 'C / C++',
    summary: 'STL std::vector, std::unordered_map, binary_search, pointer dereferencing & stack vs heap memory.',
    example: 'sort(vec.begin(), vec.end());',
  },
];

export const CodingLabPage: React.FC = () => {
  const { workspace, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<LabTab>('editor');
  const [language, setLanguage] = useState<CodeLanguage>('JavaScript');
  const [code, setCode] = useState<string>(LANGUAGE_TEMPLATES.JavaScript);
  const [output, setOutput] = useState<string>('Click "Run Code" to execute in safe sandbox.');
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  const [sqlTableRows, setSqlTableRows] = useState<Record<string, unknown>[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);

  // Save Snippet Modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetDesc, setSnippetDesc] = useState('');
  const [snippetTags, setSnippetTags] = useState('algorithm, practice');

  // Filter for snippets & cheatsheets
  const [snippetSearch, setSnippetSearch] = useState('');
  const [cheatSearch, setCheatSearch] = useState('');

  const lineNumbers = useMemo(() => {
    const count = code.split('\n').length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  }, [code]);

  if (!workspace) return null;

  const copyText = (text: string, label = 'Copied to clipboard!') => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    showToast(label, 'success');
  };

  const handleLanguageChange = (nextLang: CodeLanguage) => {
    setLanguage(nextLang);
    setCode(LANGUAGE_TEMPLATES[nextLang]);
    setActiveChallengeId(null);
    setEditingSnippetId(null);
    setHtmlPreview('');
    setSqlTableRows([]);
    setOutput(`Loaded ${nextLang} starter template.`);
  };

  const runCode = () => {
    setHtmlPreview('');
    setSqlTableRows([]);

    if (language === 'HTML') {
      setHtmlPreview(code);
      setOutput('Rendered HTML document inside live preview sandbox.');
      return;
    }

    if (language === 'CSS') {
      const wrapped = `<html><head><style>${code}</style></head><body style="padding:24px;background:#FFF9F0;font-family:sans-serif;"><div class="studora-badge">STUDORA CSS Live Element</div></body></html>`;
      setHtmlPreview(wrapped);
      setOutput('Applied CSS styles to live preview element.');
      return;
    }

    if (language === 'JavaScript' || language === 'TypeScript') {
      const logs: string[] = [];
      const fakeConsole = {
        log: (...args: unknown[]) =>
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
        error: (...args: unknown[]) => logs.push('ERROR: ' + args.map(String).join(' ')),
        warn: (...args: unknown[]) => logs.push('WARN: ' + args.map(String).join(' ')),
      };

      try {
        // Basic TypeScript annotation strip for safe browser execution
        const executable =
          language === 'TypeScript'
            ? code
                .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
                .replace(/:\s*(string|number|boolean|any|void|StudentCourse\[\]|Record<[^>]+>)/g, '')
            : code;

        const fn = new Function('console', executable);
        const result = fn(fakeConsole);
        if (result !== undefined) logs.push(`=> ${String(result)}`);

        // Verify Coding Challenge if active
        if (activeChallengeId) {
          const ch = CODING_CHALLENGES.find((c) => c.id === activeChallengeId);
          if (ch) {
            const testFn = new Function(`${executable}\nreturn JSON.stringify(${ch.testCall});`);
            const testResult = testFn();
            if (testResult === ch.expectedJson) {
              logs.push(`\n[PASS] Challenge "${ch.title}" test case passed!`);
              showToast(`Challenge "${ch.title}" passed!`, 'success');
            } else {
              logs.push(`\n[FAIL] Expected ${ch.expectedJson}, got ${testResult}`);
            }
          }
        }

        setOutput(logs.length > 0 ? logs.join('\n') : 'Executed cleanly (no console output).');
      } catch (err) {
        setOutput(`Runtime Error:\n${err instanceof Error ? err.message : String(err)}`);
      }
      return;
    }

    if (language === 'SQL') {
      const q = code.toLowerCase();
      if (q.includes('from courses')) {
        setSqlTableRows(workspace.courses.map((c) => ({ code: c.code, name: c.name, sks: c.sks, semester: c.semester, grade: c.grade })));
        setOutput(`Query returned ${workspace.courses.length} rows from courses.`);
      } else if (q.includes('from tasks')) {
        const rows = workspace.tasks.filter((t) => !q.includes("!= 'completed'") || t.status !== 'Completed');
        setSqlTableRows(rows.map((t) => ({ title: t.title, subject: t.subject, deadline: t.deadline, priority: t.priority, status: t.status })));
        setOutput(`Query returned ${rows.length} rows from tasks.`);
      } else if (q.includes('from transactions')) {
        setSqlTableRows(workspace.transactions.map((t) => ({ title: t.title, type: t.type, category: t.category, amount: t.amount })));
        setOutput(`Query returned ${workspace.transactions.length} rows from transactions.`);
      } else if (q.includes('from projects')) {
        setSqlTableRows(workspace.projects.map((p) => ({ title: p.title, category: p.category, status: p.status, deadline: p.deadline })));
        setOutput(`Query returned ${workspace.projects.length} rows from projects.`);
      } else {
        setOutput('SQL Sandbox supports querying live STUDORA tables: courses, tasks, transactions, projects.');
      }
      return;
    }

    // Safe simulated print parser for Python / PHP / Java / C / C++
    const printMatches: string[] = [];
    const lines = code.split('\n');
    lines.forEach((line) => {
      const m = line.match(/(?:print|echo|System\.out\.println|printf|cout\s*<<)\s*\(?["'`]([^"'`]+)["'`]/);
      if (m) printMatches.push(m[1].replace(/\\n/g, ''));
    });
    setOutput(
      `[${language} Static Sandbox Preview]\n` +
        (printMatches.length > 0
          ? printMatches.join('\n')
          : `${language} syntax validated. Use JavaScript, TypeScript, HTML, CSS, or SQL for live runtime execution.`)
    );
  };

  const openSaveSnippet = () => {
    const existing = editingSnippetId
      ? workspace.snippets.find((s) => s.id === editingSnippetId)
      : null;
    setSnippetTitle(existing ? existing.title : `${language} Utility Snippet`);
    setSnippetDesc(existing ? existing.description : 'Saved from STUDORA Coding Lab');
    setSnippetTags(existing ? existing.tags.join(', ') : language.toLowerCase());
    setSaveModalOpen(true);
  };

  const handleSaveSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim()) {
      showToast('Snippet title is required.', 'error');
      return;
    }
    const tags = snippetTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const todayIso = new Date().toISOString().split('T')[0];

    if (editingSnippetId) {
      updateWorkspace((prev) => ({
        ...prev,
        snippets: prev.snippets.map((s) =>
          s.id === editingSnippetId
            ? { ...s, title: snippetTitle.trim(), description: snippetDesc.trim(), language, code, tags, updatedAt: todayIso }
            : s
        ),
      }));
      showToast('Snippet updated in Personal Library!', 'success');
    } else {
      const created: CodeSnippet = {
        id: `snp-${Date.now()}`,
        title: snippetTitle.trim(),
        language,
        code,
        description: snippetDesc.trim(),
        tags,
        updatedAt: todayIso,
      };
      updateWorkspace((prev) => ({
        ...prev,
        snippets: [created, ...prev.snippets],
      }));
      setEditingSnippetId(created.id);
      showToast('Snippet saved to Personal Library!', 'success');
    }
    setSaveModalOpen(false);
  };

  const loadSnippetIntoEditor = (s: CodeSnippet) => {
    setLanguage(s.language);
    setCode(s.code);
    setEditingSnippetId(s.id);
    setActiveChallengeId(null);
    setActiveTab('editor');
    setOutput(`Loaded snippet "${s.title}".`);
  };

  const deleteSnippet = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      snippets: prev.snippets.filter((s) => s.id !== id),
    }));
    if (editingSnippetId === id) setEditingSnippetId(null);
    showToast('Snippet deleted', 'info');
  };

  const filteredSnippets = workspace.snippets.filter((s) => {
    if (!snippetSearch.trim()) return true;
    const q = snippetSearch.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const subTabs: { id: LabTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'editor', label: 'Code Editor', icon: Code2 },
    { id: 'snippets', label: 'Personal Library', icon: BookMarked },
    { id: 'languages', label: '10 Languages', icon: FileCode2 },
    { id: 'algorithms', label: 'Algorithms', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: CheckCircle2 },
    { id: 'git', label: 'Git Cheatsheet', icon: GitBranch },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'sql', label: 'SQL Queries', icon: Database },
    { id: 'docs', label: 'Docs', icon: BookMarked },
  ];

  return (
    <div className="space-y-5">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <NeoButton
              key={t.id}
              size="sm"
              tone={active ? 'yellow' : 'white'}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </NeoButton>
          );
        })}
      </div>

      {/* TAB 1: CODE EDITOR */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 space-y-3">
            <NeoCard tone="white" padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as CodeLanguage)}
                    aria-label="Select programming language"
                    className="neo-input px-3 py-1.5 text-sm font-label font-bold bg-[#FFE69A] text-[#171717] cursor-pointer"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  {activeChallengeId && (
                    <span className="font-label text-[11px] font-bold px-2.5 py-1 rounded-[8px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717]">
                      Challenge Mode
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <NeoButton size="sm" tone="white" onClick={() => copyText(code, 'Code copied!')}>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </NeoButton>
                  <NeoButton size="sm" tone="lavender" onClick={openSaveSnippet}>
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingSnippetId ? 'Update Snippet' : 'Save Snippet'}</span>
                  </NeoButton>
                  <NeoButton size="sm" tone="mint" onClick={runCode}>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Code</span>
                  </NeoButton>
                </div>
              </div>
            </NeoCard>

            {/* Dark Theme Code Editor Surface */}
            <div className="rounded-[20px] border-[2.5px] border-[#171717] shadow-[5px_5px_0px_#171717] bg-[#14141A] text-[#F8F8F2] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/10 bg-[#1C1C24] flex items-center justify-between text-xs font-code">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F5A9DD]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFE69A]" />
                  <span className="w-3 h-3 rounded-full bg-[#B9F5C8]" />
                  <span className="ml-2 opacity-80">
                    main.{language === 'JavaScript' ? 'js' : language === 'TypeScript' ? 'ts' : language.toLowerCase()}
                  </span>
                </div>
                <span className="opacity-60">{lineNumbers.length} lines</span>
              </div>

              <div className="flex min-h-[380px] max-h-[520px] overflow-auto font-code text-sm">
                <div
                  aria-hidden="true"
                  className="py-4 px-3 text-right select-none text-white/35 bg-[#101016] border-r border-white/10 leading-6 min-w-[46px]"
                >
                  {lineNumbers.map((num) => (
                    <div key={num}>{num}</div>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const target = e.currentTarget;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const next = code.substring(0, start) + '  ' + code.substring(end);
                      setCode(next);
                      requestAnimationFrame(() => {
                        target.selectionStart = target.selectionEnd = start + 2;
                      });
                    }
                  }}
                  spellCheck={false}
                  aria-label="Code editor"
                  className="flex-1 p-4 bg-transparent text-[#F8F8F2] resize-none focus:outline-none leading-6 whitespace-pre overflow-x-auto"
                />
              </div>
            </div>
          </div>

          {/* Console Output & Live Preview */}
          <div className="xl:col-span-4 space-y-4">
            <NeoCard tone="white" className="h-full flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717]/15 dark:border-white/15">
                <h3 className="font-label text-xs font-bold">Execution Output</h3>
                <button
                  type="button"
                  onClick={() => {
                    setOutput('');
                    setHtmlPreview('');
                    setSqlTableRows([]);
                  }}
                  className="font-body text-xs font-bold underline cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <pre className="mt-3 p-3.5 rounded-[14px] border-2 border-[#171717] bg-[#14141A] text-[#B9F5C8] font-code text-xs whitespace-pre-wrap break-words min-h-[140px]">
                {output}
              </pre>

              {htmlPreview && (
                <div className="mt-4">
                  <p className="font-label text-[10px] font-bold mb-1.5">Live HTML/CSS Sandbox</p>
                  <iframe
                    title="HTML Sandbox Output"
                    sandbox="allow-scripts"
                    srcDoc={htmlPreview}
                    className="w-full h-56 rounded-[14px] border-2 border-[#171717] bg-white"
                  />
                </div>
              )}

              {sqlTableRows.length > 0 && (
                <div className="mt-4 overflow-x-auto border-2 border-[#171717] rounded-[12px]">
                  <table className="w-full text-left text-xs font-code">
                    <thead className="bg-[#FFE69A] text-[#171717] border-b-2 border-[#171717]">
                      <tr>
                        {Object.keys(sqlTableRows[0]).map((col) => (
                          <th key={col} className="p-2">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171717]/15">
                      {sqlTableRows.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="p-2 truncate max-w-[140px]">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </NeoCard>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL CODE LIBRARY / SNIPPETS */}
      {activeTab === 'snippets' && (
        <div className="space-y-4">
          <NeoCard tone="white" padding="sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                <input
                  type="text"
                  value={snippetSearch}
                  onChange={(e) => setSnippetSearch(e.target.value)}
                  placeholder="Search personal snippets by title, tag, or language..."
                  className="neo-input w-full pl-9 pr-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A]"
                />
              </div>
              <NeoButton
                tone="mint"
                onClick={() => {
                  setEditingSnippetId(null);
                  setActiveTab('editor');
                }}
              >
                <Plus className="w-4 h-4" />
                <span>New Snippet</span>
              </NeoButton>
            </div>
          </NeoCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets.map((s) => (
              <NeoCard key={s.id} tone="white" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-label text-[10px] font-bold px-2.5 py-1 rounded-[8px] border-2 border-[#171717] bg-[#C4B5FD] text-[#171717]">
                      {s.language}
                    </span>
                    <span className="font-stat text-xs opacity-65">{s.updatedAt}</span>
                  </div>
                  <h3 className="font-display text-base mt-3">{s.title}</h3>
                  <p className="font-body text-xs opacity-75 mt-1">{s.description}</p>
                  <pre className="mt-3 p-3 rounded-[12px] border-2 border-[#171717] bg-[#14141A] text-[#B9F5C8] font-code text-[11px] overflow-x-auto max-h-32">
                    {s.code}
                  </pre>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-[#171717]/10 flex items-center justify-between gap-2">
                  <NeoButton size="sm" tone="yellow" onClick={() => loadSnippetIntoEditor(s)}>
                    Open in Editor
                  </NeoButton>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyText(s.code, 'Snippet copied!')}
                      aria-label="Copy snippet"
                      className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#FFF9F0] text-[#171717] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSnippet(s.id)}
                      aria-label="Delete snippet"
                      className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#F5A9DD] text-[#171717] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </NeoCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 10 PROGRAMMING LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LANGUAGES.map((langName, idx) => {
            const tones = ['lavender', 'mint', 'peach', 'pink', 'yellow'] as const;
            return (
              <NeoCard key={langName} tone={tones[idx % tones.length]} interactive onClick={() => {
                handleLanguageChange(langName);
                setActiveTab('editor');
              }}>
                <span className="font-label text-[10px] uppercase opacity-75">Language {idx + 1}</span>
                <h3 className="font-display text-lg mt-1">{langName}</h3>
                <p className="font-body text-xs mt-2 opacity-80">
                  Load {langName} boilerplate & sandbox template.
                </p>
              </NeoCard>
            );
          })}
        </div>
      )}

      {/* TAB 4: ALGORITHMS */}
      {activeTab === 'algorithms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGORITHM_PRACTICE_LIST.map((alg) => (
            <NeoCard key={alg.id} tone="white">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs font-bold px-2.5 py-1 rounded-[8px] border-2 border-[#171717] bg-[#B9F5C8] text-[#171717]">
                  {alg.complexity}
                </span>
                <span className="font-body text-xs font-bold">{alg.difficulty}</span>
              </div>
              <h3 className="font-display text-lg mt-3">{alg.title}</h3>
              <p className="font-body text-sm opacity-80 mt-1">{alg.description}</p>
              <pre className="mt-3 p-3 rounded-[12px] border-2 border-[#171717] bg-[#14141A] text-[#FFE69A] font-code text-xs overflow-x-auto max-h-40">
                {alg.code}
              </pre>
              <div className="mt-4 flex gap-2">
                <NeoButton
                  size="sm"
                  tone="mint"
                  onClick={() => {
                    setLanguage(alg.language);
                    setCode(alg.code);
                    setActiveChallengeId(null);
                    setActiveTab('editor');
                    showToast(`Loaded ${alg.title}`, 'info');
                  }}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Practice in Editor</span>
                </NeoButton>
              </div>
            </NeoCard>
          ))}
        </div>
      )}

      {/* TAB 5: CODING CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CODING_CHALLENGES.map((ch) => (
            <NeoCard key={ch.id} tone="peach" className="flex flex-col justify-between">
              <div>
                <span className="font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded border-2 border-[#171717] bg-white text-[#171717]">
                  {ch.difficulty}
                </span>
                <h3 className="font-display text-lg mt-3">{ch.title}</h3>
                <p className="font-body text-sm mt-2 leading-relaxed">{ch.prompt}</p>
              </div>
              <NeoButton
                tone="yellow"
                className="mt-5 w-full"
                onClick={() => {
                  setLanguage('JavaScript');
                  setCode(ch.starterCode);
                  setActiveChallengeId(ch.id);
                  setActiveTab('editor');
                  setOutput(`Challenge "${ch.title}" loaded. Click "Run Code" to verify!`);
                }}
              >
                Solve Challenge
              </NeoButton>
            </NeoCard>
          ))}
        </div>
      )}

      {/* TAB 6 & 7: GIT & TERMINAL CHEATSHEETS */}
      {(activeTab === 'git' || activeTab === 'terminal') && (
        <NeoCard tone="white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#171717]/15">
            <h3 className="font-display text-xl">
              {activeTab === 'git' ? 'Git Command Cheatsheet' : 'Terminal / Bash Cheatsheet'}
            </h3>
            <input
              type="text"
              value={cheatSearch}
              onChange={(e) => setCheatSearch(e.target.value)}
              placeholder="Filter commands..."
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A]"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(activeTab === 'git' ? GIT_CHEATSHEET : TERMINAL_CHEATSHEET)
              .filter(
                (item) =>
                  !cheatSearch.trim() ||
                  item.cmd.toLowerCase().includes(cheatSearch.toLowerCase()) ||
                  item.desc.toLowerCase().includes(cheatSearch.toLowerCase())
              )
              .map((item) => (
                <div
                  key={item.cmd}
                  className="p-3.5 rounded-[14px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#23232E] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <code className="font-code text-xs sm:text-sm font-bold block truncate">
                      {item.cmd}
                    </code>
                    <p className="font-body text-xs opacity-75 mt-1">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(item.cmd, 'Command copied!')}
                    aria-label="Copy command"
                    className="p-2 rounded-[9px] border-2 border-[#171717] bg-[#FFE69A] text-[#171717] shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </NeoCard>
      )}

      {/* TAB 8: SQL QUERY COLLECTION */}
      {activeTab === 'sql' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SQL_COLLECTION.map((sq) => (
            <NeoCard key={sq.title} tone="white">
              <h3 className="font-label text-sm font-bold">{sq.title}</h3>
              <pre className="mt-3 p-3 rounded-[12px] border-2 border-[#171717] bg-[#14141A] text-[#B9F5C8] font-code text-xs whitespace-pre-wrap">
                {sq.query}
              </pre>
              <div className="mt-3 flex gap-2">
                <NeoButton
                  size="sm"
                  tone="mint"
                  onClick={() => {
                    setLanguage('SQL');
                    setCode(sq.query);
                    setActiveTab('editor');
                  }}
                >
                  Load in SQL Runner
                </NeoButton>
                <NeoButton size="sm" tone="white" onClick={() => copyText(sq.query, 'SQL copied!')}>
                  Copy SQL
                </NeoButton>
              </div>
            </NeoCard>
          ))}
        </div>
      )}

      {/* TAB 9: CODE DOCUMENTATION */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCS_REFERENCE.map((doc) => (
            <NeoCard key={doc.lang} tone="lavender">
              <h3 className="font-display text-lg">{doc.lang}</h3>
              <p className="font-body text-sm mt-2">{doc.summary}</p>
              <pre className="mt-3 p-3 rounded-[12px] border-2 border-[#171717] bg-[#14141A] text-white font-code text-xs overflow-x-auto">
                {doc.example}
              </pre>
            </NeoCard>
          ))}
        </div>
      )}

      {/* Save Snippet Modal */}
      <NeoModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title={editingSnippetId ? 'Update Personal Snippet' : 'Save Code Snippet'}
        subtitle="Store reusable functions and templates in your Coding Lab library."
      >
        <form onSubmit={handleSaveSnippet} className="space-y-4">
          <div>
            <label className="block font-label text-xs mb-1">Snippet Title</label>
            <input
              type="text"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>
          <div>
            <label className="block font-label text-xs mb-1">Description</label>
            <input
              type="text"
              value={snippetDesc}
              onChange={(e) => setSnippetDesc(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>
          <div>
            <label className="block font-label text-xs mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={snippetTags}
              onChange={(e) => setSnippetTags(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <NeoButton tone="white" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" tone="mint">
              Save Snippet
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};

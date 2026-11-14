import {
  CodeLanguage,
  GradeLetter,
  StudoraWorkspace,
} from '../types/studora';

export const GRADE_POINTS: Record<GradeLetter, number | null> = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  D: 1.0,
  E: 0.0,
  'In Progress': null,
};

export const HERO_ILLUSTRATION_URL = '/src/assets/images/hero_coder_student_1794639985336.jpg';
export const DEFAULT_AVATAR_URL = '/src/assets/images/avatar_student_profile_1794639985193.jpg';
export const PROJECT_WEB_COVER_URL = '/src/assets/images/project_web_cover_1794639986376.jpg';
export const PROJECT_AI_COVER_URL = '/src/assets/images/project_ai_cover_1794639986174.jpg';

export const BACKGROUND_PRESETS = [
  { name: 'Pastel Pink', hex: '#FDE2F3' },
  { name: 'Warm Cream', hex: '#FFF9F0' },
  { name: 'Mint Pastel', hex: '#DCFCE7' },
  { name: 'Lavender', hex: '#EDE9FE' },
  { name: 'Soft Peach', hex: '#FFEDD5' },
  { name: 'Butter Yellow', hex: '#FEF9C3' },
  { name: 'Sky Blue', hex: '#E0F2FE' },
];

const today = new Date();
const fmtDate = (offsetDays: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Map Monday (0) .. Friday (4) of the active week so uploaded Senin-Kamis timetable displays immediately
const weekDayDate = (offsetFromMonday: number): string => {
  const d = new Date(today);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset + offsetFromMonday);
  return d.toISOString().split('T')[0];
};

export const LANGUAGE_TEMPLATES: Record<CodeLanguage, string> = {
  JavaScript: `// Quick Sort & Student GPA Analyzer
const scores = [88, 94, 79, 96, 85];

function averageScore(list) {
  const sum = list.reduce((acc, n) => acc + n, 0);
  return (sum / list.length).toFixed(2);
}

console.log("Scores:", scores);
console.log("Average:", averageScore(scores));
console.log("Top Score:", Math.max(...scores));`,
  TypeScript: `interface StudentCourse {
  code: string;
  credits: number;
  gradePoint: number;
}

const transcript: StudentCourse[] = [
  { code: "IF301", credits: 4, gradePoint: 4.0 },
  { code: "IF305", credits: 3, gradePoint: 3.7 },
  { code: "IF308", credits: 3, gradePoint: 4.0 },
];

const totalSks = transcript.reduce((s, c) => s + c.credits, 0);
const weighted = transcript.reduce((s, c) => s + c.credits * c.gradePoint, 0);
console.log("Semester GPA:", (weighted / totalSks).toFixed(2));`,
  HTML: `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #FFF9F0;
      padding: 24px;
      color: #171717;
    }
    .card {
      background: #B9F5C8;
      border: 3px solid #171717;
      border-radius: 16px;
      box-shadow: 5px 5px 0 #171717;
      padding: 20px;
      max-width: 360px;
    }
    button {
      margin-top: 12px;
      background: #FFE69A;
      border: 2px solid #171717;
      padding: 8px 14px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>STUDORA HTML Sandbox</h2>
    <p>Build interactive widgets right inside your Coding Lab.</p>
    <button onclick="this.textContent = 'Clicked! Ready to ship'">Test Interaction</button>
  </div>
</body>
</html>`,
  CSS: `.studora-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #A78BFA;
  color: #171717;
  font-weight: 700;
  border: 2.5px solid #171717;
  border-radius: 14px;
  box-shadow: 4px 4px 0px #171717;
  transition: transform 140ms ease;
}

.studora-badge:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #171717;
}`,
  Python: `# Dijkstra Shortest Path - Graph Lab
def greet_developer(name, streak):
    print(f"Hello {name}! Current coding streak: {streak} days")
    squares = [x ** 2 for x in range(1, 6)]
    print("Complexity checkpoints:", squares)

greet_developer("Feliz", 14)`,
  PHP: `<?php
$courses = ["Algorithms", "Database Systems", "Web Engineering"];
foreach ($courses as $index => $course) {
    echo ($index + 1) . ". " . $course . "\\n";
}
echo "Semester 5 Active Courses: " . count($courses);
?>`,
  Java: `public class StudoraRunner {
    public static void main(String[] args) {
        String student = "Feliz";
        int credits = 21;
        System.out.println("Student: " + student);
        System.out.println("Enrolled Credits: " + credits + " SKS");
    }
}`,
  C: `#include <stdio.h>

int main() {
    int nodes = 6;
    printf("Binary Tree Max Nodes at Depth 2: %d\\n", 1 << 2);
    printf("Total Graph Nodes: %d\\n", nodes);
    return 0;
}`,
  'C++': `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> dp = {0, 1, 1, 2, 3, 5, 8};
    cout << "Fibonacci DP[6] = " << dp[6] << endl;
    return 0;
}`,
  SQL: `-- Query active courses & credits from STUDORA Academic DB
SELECT code, name, sks, grade
FROM courses
WHERE semester = 5
ORDER BY sks DESC;`,
};

export const ALGORITHM_PRACTICE_LIST = [
  {
    id: 'alg-1',
    title: 'Binary Search',
    difficulty: 'Easy',
    complexity: 'O(log n)',
    language: 'JavaScript' as CodeLanguage,
    description: 'Efficiently locate a target index in a sorted array by halving the search interval.',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const nums = [3, 8, 12, 19, 24, 31, 45];
console.log("Index of 24:", binarySearch(nums, 24));
console.log("Index of 15:", binarySearch(nums, 15));`,
  },
  {
    id: 'alg-2',
    title: 'Quick Sort',
    difficulty: 'Medium',
    complexity: 'O(n log n)',
    language: 'JavaScript' as CodeLanguage,
    description: 'Divide-and-conquer sorting algorithm partitioning around a pivot element.',
    code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log("Sorted:", quickSort([42, 17, 8, 99, 23, 5, 64]));`,
  },
  {
    id: 'alg-3',
    title: 'Breadth-First Search (BFS)',
    difficulty: 'Medium',
    complexity: 'O(V + E)',
    language: 'JavaScript' as CodeLanguage,
    description: 'Level-by-level graph traversal using a FIFO queue.',
    code: `const graph = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["F"],
  D: [],
  E: ["F"],
  F: []
};

function bfs(start) {
  const queue = [start];
  const visited = new Set([start]);
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}

console.log("BFS Order:", bfs("A").join(" -> "));`,
  },
  {
    id: 'alg-4',
    title: 'Dynamic Programming: Coin Change',
    difficulty: 'Hard',
    complexity: 'O(amount * coins)',
    language: 'JavaScript' as CodeLanguage,
    description: 'Find the minimum number of coins required to reach a target amount.',
    code: `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (a - coin >= 0) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log("Min coins for 11:", coinChange([1, 2, 5], 11));`,
  },
];

export const CODING_CHALLENGES = [
  {
    id: 'chal-1',
    title: 'Two Sum Indices',
    difficulty: 'Easy',
    prompt: 'Write `solve(nums, target)` that returns the two indices `[i, j]` whose values add up to `target`.',
    starterCode: `function solve(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

console.log("Test 1:", JSON.stringify(solve([2, 7, 11, 15], 9)));`,
    testCall: 'solve([2, 7, 11, 15], 9)',
    expectedJson: '[0,1]',
  },
  {
    id: 'chal-2',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    prompt: 'Write `solve(s)` returning `true` if brackets `()[]{}` are balanced, otherwise `false`.',
    starterCode: `function solve(s) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch);
    else if (stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
}

console.log("Test ({[]}):", solve("({[]})"));`,
    testCall: 'solve("({[]})") && !solve("([)]")',
    expectedJson: 'true',
  },
  {
    id: 'chal-3',
    title: 'Palindrome Sanitizer',
    difficulty: 'Easy',
    prompt: 'Write `solve(str)` checking if alphanumeric characters read the same forwards and backwards.',
    starterCode: `function solve(str) {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}

console.log("Test:", solve("Race a car"), solve("A man, a plan, a canal: Panama"));`,
    testCall: 'solve("A man, a plan, a canal: Panama")',
    expectedJson: 'true',
  },
];

export const GIT_CHEATSHEET = [
  { cmd: 'git init', desc: 'Initialize a new local Git repository' },
  { cmd: 'git clone <url>', desc: 'Clone remote repository to local folder' },
  { cmd: 'git status', desc: 'Inspect modified and staged files' },
  { cmd: 'git checkout -b feat/auth', desc: 'Create and switch to a new feature branch' },
  { cmd: 'git add . && git commit -m "feat: add auth"', desc: 'Stage all changes and commit with message' },
  { cmd: 'git pull --rebase origin main', desc: 'Sync local branch cleanly on top of main' },
  { cmd: 'git push -u origin feat/auth', desc: 'Push branch and set upstream tracking' },
  { cmd: 'git log --oneline --graph -n 10', desc: 'Compact visual commit tree' },
  { cmd: 'git stash push -m "wip"', desc: 'Temporarily shelve uncommitted changes' },
  { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit while keeping staged edits' },
];

export const TERMINAL_CHEATSHEET = [
  { cmd: 'ls -la', desc: 'List all files including hidden dotfiles and permissions' },
  { cmd: 'mkdir -p src/components/ui', desc: 'Recursively create nested directories' },
  { cmd: 'grep -rn "useState" src/', desc: 'Search recursively for symbol occurrences' },
  { cmd: 'lsof -i :3000', desc: 'Check which process is listening on port 3000' },
  { cmd: 'chmod +x deploy.sh', desc: 'Grant execute permission to shell script' },
  { cmd: 'curl -s http://localhost:3000/api/health', desc: 'Test REST API endpoint response quickly' },
  { cmd: 'du -sh * | sort -hr', desc: 'Inspect folder sizes sorted largest first' },
  { cmd: 'tar -czvf backup.tar.gz src/', desc: 'Compress project folder into gzipped archive' },
];

export const SQL_COLLECTION = [
  {
    title: 'Active Semester Courses',
    query: `SELECT code, name, sks, grade FROM courses WHERE semester = 5 ORDER BY sks DESC;`,
  },
  {
    title: 'High Priority Pending Tasks',
    query: `SELECT title, subject, deadline, priority FROM tasks WHERE status != 'Completed' ORDER BY deadline ASC;`,
  },
  {
    title: 'Expenses by Category Summary',
    query: `SELECT category, COUNT(*) AS count, SUM(amount) AS total FROM transactions WHERE type = 'expense' GROUP BY category;`,
  },
  {
    title: 'Active Student Projects',
    query: `SELECT title, category, status, deadline FROM projects ORDER BY deadline ASC;`,
  },
];

export const MOTIVATION_QUOTES = [
  {
    quote: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    quote: 'Consistency beats intensity. One clean commit every day compounds faster than weekend marathons.',
    author: 'STUDORA Study Habit',
  },
  {
    quote: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
  },
  {
    quote: 'Debug your habits the same way you debug your stack trace: isolate, observe, fix, verify.',
    author: 'IT Student Playbook',
  },
  {
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
  },
];

export const createInitialWorkspace = (customProfile?: Partial<StudoraWorkspace['profile']>): StudoraWorkspace => ({
  profile: {
    fullName: customProfile?.fullName || 'Feliz',
    studentId: customProfile?.studentId || '2205110482',
    university: customProfile?.university || 'Institut Teknologi Nusantara',
    faculty: customProfile?.faculty || 'Fakultas Teknik Elektro & Informatika',
    major: customProfile?.major || 'S1 Teknologi Informasi',
    semester: customProfile?.semester || 3,
    email: customProfile?.email || 'feliz@studora.ac.id',
    bio: customProfile?.bio || 'Full-stack learner, algorithms enthusiast, and campus hackathon builder focused on scalable TypeScript web systems.',
    avatarUrl: customProfile?.avatarUrl || DEFAULT_AVATAR_URL,
  },
  courses: [
    {
      id: 'c-1',
      code: 'TIF101',
      name: 'Dasar Pemrograman & Logika',
      lecturer: 'Dr. Hendra Wijaya, M.T.',
      sks: 4,
      semester: 1,
      grade: 'A',
      status: 'Completed',
      tone: 'mint',
    },
    {
      id: 'c-2',
      code: 'TIF202',
      name: 'Struktur Data & Algoritma',
      lecturer: 'Dr. Budi Santoso, M.Kom.',
      sks: 4,
      semester: 2,
      grade: 'A',
      status: 'Completed',
      tone: 'lavender',
    },
    {
      id: 'c-3',
      code: 'MKWU03',
      name: 'Kemuhammadiyahan',
      lecturer: 'Dosen Pengampu MKWU',
      sks: 2,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'yellow',
    },
    {
      id: 'c-4',
      code: 'TIF301',
      name: 'English Specific Purposes',
      lecturer: 'Dosen Pengampu ESP',
      sks: 2,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'peach',
    },
    {
      id: 'c-5',
      code: 'TIF302',
      name: 'Human-Computer Interaction (HCI)',
      lecturer: 'Dosen Pengampu HCI',
      sks: 3,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'pink',
    },
    {
      id: 'c-6',
      code: 'TIF303',
      name: 'Administrasi Sistem',
      lecturer: 'Dosen Pengampu LabJar',
      sks: 3,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'mint',
    },
    {
      id: 'c-7',
      code: 'TIF304',
      name: 'Basis Data',
      lecturer: 'Dosen Pengampu Basis Data',
      sks: 3,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'lavender',
    },
    {
      id: 'c-8',
      code: 'TIF305',
      name: 'Etika Profesi',
      lecturer: 'Dosen Pengampu Etika Profesi',
      sks: 2,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'yellow',
    },
    {
      id: 'c-9',
      code: 'TIF306',
      name: 'Jaringan Komputer Lanjut',
      lecturer: 'Dosen Pengampu LabJar',
      sks: 3,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'mint',
    },
    {
      id: 'c-10',
      code: 'TIF307',
      name: 'Organisasi & Arsitektur Komputer',
      lecturer: 'Dosen Pengampu OAK',
      sks: 3,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'peach',
    },
    {
      id: 'c-11',
      code: 'TIF308',
      name: 'Probabilitas & Statistika',
      lecturer: 'Dosen Pengampu Probstat',
      sks: 3,
      semester: 3,
      grade: 'In Progress',
      status: 'Active',
      tone: 'pink',
    },
  ],
  schedule: [
    // SENIN (Monday)
    {
      id: 'sch-senin-0',
      title: 'Apel / Rapat Karyawan',
      category: 'Campus Event',
      date: weekDayDate(0),
      startTime: '07:00',
      endTime: '08:40',
      location: 'Kampus Utama',
      reminderEnabled: false,
      notes: 'TIF Gasal TA.2627 · Agenda Senin pagi.',
    },
    {
      id: 'sch-senin-1',
      title: 'Kemuhammadiyahan (MKWU)',
      courseCode: 'MKWU03',
      category: 'Lecture',
      date: weekDayDate(0),
      startTime: '09:10',
      endTime: '11:40',
      location: 'Aula 1 / Theater',
      reminderEnabled: true,
      notes: 'Semester 3 · MKWU (setelah Sholat Dhuha 08.40–09.10).',
    },
    {
      id: 'sch-senin-2',
      title: 'English Specific Purposes',
      courseCode: 'TIF301',
      category: 'Lecture',
      date: weekDayDate(0),
      startTime: '12:40',
      endTime: '14:20',
      location: 'D202',
      reminderEnabled: true,
      notes: 'Semester 3 · MK Inti Prodi (setelah Sholat Dhuhur 11.40–12.40).',
    },
    {
      id: 'sch-senin-3',
      title: 'HCI (Human-Computer Interaction)',
      courseCode: 'TIF302',
      category: 'Lecture',
      date: weekDayDate(0),
      startTime: '14:20',
      endTime: '17:10',
      location: 'D202',
      reminderEnabled: true,
      notes: 'Semester 3 · Jeda Sholat \'Asyar pukul 15.10–15.30.',
    },
    // SELASA (Tuesday)
    {
      id: 'sch-selasa-1',
      title: 'Administrasi Sistem',
      courseCode: 'TIF303',
      category: 'Lab',
      date: weekDayDate(1),
      startTime: '07:50',
      endTime: '11:40',
      location: 'LabJar / D103',
      reminderEnabled: true,
      notes: 'Semester 3 · Praktikum LabJar (jeda Sholat Dhuha 08.40–09.10).',
    },
    {
      id: 'sch-selasa-2',
      title: 'Basis Data',
      courseCode: 'TIF304',
      category: 'Lab',
      date: weekDayDate(1),
      startTime: '12:40',
      endTime: '16:20',
      location: 'Lab Komp / D104',
      reminderEnabled: true,
      notes: 'Semester 3 · MK Inti Prodi (jeda Sholat \'Asyar 15.10–15.30).',
    },
    // RABU (Wednesday)
    {
      id: 'sch-rabu-1',
      title: 'Etika Profesi',
      courseCode: 'TIF305',
      category: 'Lecture',
      date: weekDayDate(2),
      startTime: '07:00',
      endTime: '08:40',
      location: 'D202 · IM P-1',
      reminderEnabled: true,
      notes: 'Semester 3 · MK Inti Prodi.',
    },
    {
      id: 'sch-rabu-2',
      title: 'Jaringan Komputer Lanjut',
      courseCode: 'TIF306',
      category: 'Lab',
      date: weekDayDate(2),
      startTime: '09:10',
      endTime: '13:30',
      location: 'Lab Jar / D103',
      reminderEnabled: true,
      notes: 'Semester 3 · Praktikum LabJar (jeda Sholat Dhuhur 11.40–12.40).',
    },
    // KAMIS (Thursday)
    {
      id: 'sch-kamis-1',
      title: 'Organisasi & Arsitektur Komputer',
      courseCode: 'TIF307',
      category: 'Lecture',
      date: weekDayDate(3),
      startTime: '07:00',
      endTime: '08:40',
      location: 'Prodi TIF',
      reminderEnabled: true,
      notes: 'Semester 3 · MK Inti Prodi.',
    },
    {
      id: 'sch-kamis-2',
      title: 'Probabilitas & Statistika',
      courseCode: 'TIF308',
      category: 'Lecture',
      date: weekDayDate(3),
      startTime: '09:10',
      endTime: '10:50',
      location: 'Gedung D',
      reminderEnabled: true,
      notes: 'Semester 3 · MK Inti Prodi (setelah Sholat Dhuha 08.40–09.10).',
    },
  ],
  tasks: [
    {
      id: 't-1',
      title: 'Build REST API Authentication & JWT Middleware',
      description: 'Implement register, login, refresh token, and protected student routes with Express + Zod validation.',
      deadline: fmtDate(2),
      priority: 'Urgent',
      status: 'In Progress',
      subject: 'IF501 · Web Full-Stack',
      checklist: [
        { id: 'tc-1', text: 'Design user schema & password hashing', done: true },
        { id: 'tc-2', text: 'Write auth middleware', done: true },
        { id: 'tc-3', text: 'Write integration tests', done: false },
      ],
      attachments: ['auth-spec-v2.pdf', 'postman-collection.json'],
      createdAt: fmtDate(-3),
    },
    {
      id: 't-2',
      title: 'Prepare AES & RSA Cryptography Lab Report',
      description: 'Compare encryption latency across 128-bit and 256-bit keys and submit PDF report.',
      deadline: fmtDate(1),
      priority: 'High',
      status: 'Review',
      subject: 'IF507 · Keamanan Jaringan',
      checklist: [
        { id: 'tc-4', text: 'Run Python benchmark script', done: true },
        { id: 'tc-5', text: 'Plot latency chart', done: true },
        { id: 'tc-6', text: 'Proofread final PDF', done: false },
      ],
      attachments: ['crypto-benchmark.ipynb'],
      createdAt: fmtDate(-5),
    },
    {
      id: 't-3',
      title: 'Train Decision Tree Classifier on Student Dataset',
      description: 'Tune max_depth hyperparameter and evaluate precision/recall confusion matrix.',
      deadline: fmtDate(5),
      priority: 'Medium',
      status: 'To Do',
      subject: 'IF504 · Kecerdasan Buatan',
      checklist: [
        { id: 'tc-7', text: 'Clean missing columns', done: true },
        { id: 'tc-8', text: 'Split train/test 80/20', done: false },
        { id: 'tc-9', text: 'Export evaluation metrics', done: false },
      ],
      attachments: ['dataset_v3.csv'],
      createdAt: fmtDate(-2),
    },
    {
      id: 't-4',
      title: 'Refactor ER Diagram for Campus Library DB',
      description: 'Normalize tables up to 3NF and add composite indexes for book loan queries.',
      deadline: fmtDate(-1),
      priority: 'High',
      status: 'To Do',
      subject: 'IF208 · Basis Data',
      checklist: [
        { id: 'tc-10', text: 'Identify transitive dependencies', done: false },
        { id: 'tc-11', text: 'Generate SQL migration', done: false },
      ],
      attachments: ['erd-draft.png'],
      createdAt: fmtDate(-6),
    },
    {
      id: 't-5',
      title: 'Push Responsive Dashboard Component Library',
      description: 'Create reusable Pastel Neobrutalism cards, modals, and chart wrappers.',
      deadline: fmtDate(4),
      priority: 'Medium',
      status: 'Completed',
      subject: 'IF501 · Web Full-Stack',
      checklist: [
        { id: 'tc-12', text: 'Build NeoCard & NeoButton', done: true },
        { id: 'tc-13', text: 'Verify mobile breakpoint', done: true },
      ],
      attachments: ['ui-tokens.md'],
      createdAt: fmtDate(-7),
    },
  ],
  snippets: [
    {
      id: 'snp-1',
      title: 'Debounce Search Hook (React + TS)',
      language: 'TypeScript',
      description: 'Prevent excessive filtering or API calls while typing in search inputs.',
      tags: ['react', 'hooks', 'performance'],
      updatedAt: fmtDate(-1),
      isFavorite: true,
      code: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}`,
    },
    {
      id: 'snp-2',
      title: 'Dijkstra Priority Queue Skeleton',
      language: 'Python',
      description: 'Shortest path graph solver using heapq.',
      tags: ['algorithms', 'graph'],
      updatedAt: fmtDate(-2),
      isFavorite: true,
      code: `import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        cost, u = heapq.heappop(pq)
        if cost > dist[u]:
            continue
        for v, weight in graph[u]:
            if cost + weight < dist[v]:
                dist[v] = cost + weight
                heapq.heappush(pq, (dist[v], v))
    return dist

print("Dijkstra module ready")`,
    },
    {
      id: 'snp-3',
      title: 'Student GPA Weighted Query',
      language: 'SQL',
      description: 'Calculate cumulative GPA directly in PostgreSQL.',
      tags: ['sql', 'postgres', 'academic'],
      updatedAt: fmtDate(-4),
      isFavorite: false,
      code: `SELECT
  student_id,
  ROUND(SUM(credits * grade_point)::numeric / SUM(credits), 2) AS gpa
FROM enrollments
GROUP BY student_id;`,
    },
  ],
  roadmaps: [
    {
      id: 'rm-fe',
      title: 'Frontend Developer',
      subtitle: 'HTML, CSS, Modern React, TypeScript & Performance',
      tone: 'lavender',
      badgeName: 'Pixel Architect',
      steps: [
        {
          id: 'fe-1',
          title: 'Semantic HTML5 & Accessibility (ARIA)',
          tier: 'Beginner',
          description: 'Master landmarks, forms, keyboard focus management, and semantic document structure.',
          materials: ['MDN Accessibility Guide', 'HTML5 Landmarks Cheatsheet'],
          resourceUrl: 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility',
          xp: 100,
          completed: true,
        },
        {
          id: 'fe-2',
          title: 'CSS Grid, Flexbox & Responsive Design',
          tier: 'Beginner',
          description: 'Build adaptive layouts across desktop, tablet, and mobile viewports cleanly.',
          materials: ['Flexbox Froggy', 'CSS Grid Complete Guide'],
          resourceUrl: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
          xp: 120,
          completed: true,
        },
        {
          id: 'fe-3',
          title: 'React Hooks, State Patterns & TypeScript',
          tier: 'Intermediate',
          description: 'Typed components, custom hooks, derived state, and clean data flow.',
          materials: ['React Official Docs', 'TypeScript Handbook'],
          resourceUrl: 'https://react.dev/learn',
          xp: 180,
          completed: true,
        },
        {
          id: 'fe-4',
          title: 'Framer Motion, Bundle Optimization & Testing',
          tier: 'Advanced',
          description: 'Micro-interactions, code splitting, and end-to-end UI verification.',
          materials: ['Motion Docs', 'Vitest Testing Guide'],
          resourceUrl: 'https://www.framer.com/motion/',
          xp: 240,
          completed: false,
        },
      ],
    },
    {
      id: 'rm-be',
      title: 'Backend Developer',
      subtitle: 'APIs, PostgreSQL, Auth, Caching & System Design',
      tone: 'mint',
      badgeName: 'API Guardian',
      steps: [
        {
          id: 'be-1',
          title: 'HTTP Fundamentals & RESTful API Design',
          tier: 'Beginner',
          description: 'Status codes, idempotency, headers, and clean JSON contracts.',
          materials: ['REST API Design Best Practices'],
          resourceUrl: 'https://restfulapi.net/',
          xp: 100,
          completed: true,
        },
        {
          id: 'be-2',
          title: 'Node.js, Express & Relational SQL Modeling',
          tier: 'Intermediate',
          description: 'Database normalization, indexing, joins, and parameterized queries.',
          materials: ['PostgreSQL Tutorial', 'Express Middleware Guide'],
          resourceUrl: 'https://www.postgresql.org/docs/',
          xp: 180,
          completed: true,
        },
        {
          id: 'be-3',
          title: 'JWT Auth, Rate Limiting & Redis Caching',
          tier: 'Advanced',
          description: 'Secure session lifecycles, RBAC authorization, and low-latency caching.',
          materials: ['OWASP API Security Top 10'],
          resourceUrl: 'https://owasp.org/www-project-api-security/',
          xp: 250,
          completed: false,
        },
      ],
    },
    {
      id: 'rm-fs',
      title: 'Full Stack Developer',
      subtitle: 'End-to-End Product Engineering from DB to UI',
      tone: 'peach',
      badgeName: 'Stack Polyglot',
      steps: [
        {
          id: 'fs-1',
          title: 'Monorepo / Client-Server Architecture',
          tier: 'Beginner',
          description: 'Shared TypeScript DTOs, environment config, and local dev proxies.',
          materials: ['Vite Full-Stack Integration'],
          resourceUrl: 'https://vitejs.dev/guide/backend-integration.html',
          xp: 120,
          completed: true,
        },
        {
          id: 'fs-2',
          title: 'Supabase / PostgreSQL + Real-Time Sync',
          tier: 'Intermediate',
          description: 'Row Level Security, storage buckets, and optimistic UI updates.',
          materials: ['Supabase Docs'],
          resourceUrl: 'https://supabase.com/docs',
          xp: 200,
          completed: false,
        },
        {
          id: 'fs-3',
          title: 'Docker Containers & CI/CD Deployment',
          tier: 'Advanced',
          description: 'Multi-stage Docker builds, GitHub Actions, and zero-downtime releases.',
          materials: ['Docker Curriculum'],
          resourceUrl: 'https://docker-curriculum.com/',
          xp: 260,
          completed: false,
        },
      ],
    },
    {
      id: 'rm-ux',
      title: 'UI/UX Designer',
      subtitle: 'Design Systems, Wireframing, Figma & Usability',
      tone: 'pink',
      badgeName: 'Craft Designer',
      steps: [
        {
          id: 'ux-1',
          title: 'Visual Hierarchy, Typography & Color Contrast',
          tier: 'Beginner',
          description: 'WCAG AA legibility, spacing scales, and grid discipline.',
          materials: ['Refactoring UI Principles'],
          resourceUrl: 'https://web.dev/accessible/',
          xp: 100,
          completed: true,
        },
        {
          id: 'ux-2',
          title: 'Component Tokens & Interactive Prototyping',
          tier: 'Intermediate',
          description: 'Reusable design tokens, state matrices, and micro-copy.',
          materials: ['Figma Auto-Layout Guide'],
          resourceUrl: 'https://help.figma.com/',
          xp: 160,
          completed: false,
        },
        {
          id: 'ux-3',
          title: 'Usability Testing & Heuristic Evaluation',
          tier: 'Advanced',
          description: 'Task completion metrics, user interviews, and iterative refinement.',
          materials: ['Nielsen Norman 10 Heuristics'],
          resourceUrl: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
          xp: 220,
          completed: false,
        },
      ],
    },
    {
      id: 'rm-da',
      title: 'Data Analyst',
      subtitle: 'SQL Analytics, Python Pandas, Visualization & KPIs',
      tone: 'yellow',
      badgeName: 'Insight Miner',
      steps: [
        {
          id: 'da-1',
          title: 'Advanced SQL Window Functions & CTEs',
          tier: 'Beginner',
          description: 'Aggregate cohorts, rolling averages, and ranking queries.',
          materials: ['Mode SQL Analytics Tutorial'],
          resourceUrl: 'https://mode.com/sql-tutorial/',
          xp: 120,
          completed: true,
        },
        {
          id: 'da-2',
          title: 'Data Cleaning with Python Pandas & NumPy',
          tier: 'Intermediate',
          description: 'Impute missing values, reshape dataframes, and detect outliers.',
          materials: ['Kaggle Pandas Course'],
          resourceUrl: 'https://www.kaggle.com/learn/pandas',
          xp: 180,
          completed: false,
        },
        {
          id: 'da-3',
          title: 'Executive Dashboards & Storytelling with Data',
          tier: 'Advanced',
          description: 'Choose high-signal charts and eliminate visual clutter.',
          materials: ['Storytelling with Data'],
          resourceUrl: 'https://www.storytellingwithdata.com/',
          xp: 220,
          completed: false,
        },
      ],
    },
    {
      id: 'rm-sec',
      title: 'Cybersecurity',
      subtitle: 'Networking, AppSec, Cryptography & Pentesting',
      tone: 'purple',
      badgeName: 'Cyber Sentinel',
      steps: [
        {
          id: 'sec-1',
          title: 'TCP/IP, DNS & Linux Hardening',
          tier: 'Beginner',
          description: 'Packet analysis, firewall rules, and least-privilege permissions.',
          materials: ['OverTheWire Bandit'],
          resourceUrl: 'https://overthewire.org/wargames/bandit/',
          xp: 130,
          completed: true,
        },
        {
          id: 'sec-2',
          title: 'OWASP Top 10 & Web Exploitation Defense',
          tier: 'Intermediate',
          description: 'Prevent SQLi, XSS, CSRF, SSRF, and broken access control.',
          materials: ['PortSwigger Web Security Academy'],
          resourceUrl: 'https://portswigger.net/web-security',
          xp: 200,
          completed: false,
        },
        {
          id: 'sec-3',
          title: 'Applied Cryptography & PKI Infrastructure',
          tier: 'Advanced',
          description: 'TLS handshakes, asymmetric signatures, and secure key rotation.',
          materials: ['Cryptohack'],
          resourceUrl: 'https://cryptohack.org/',
          xp: 260,
          completed: false,
        },
      ],
    },
    {
      id: 'rm-mob',
      title: 'Mobile Developer',
      subtitle: 'React Native, Flutter, Offline Sync & Native APIs',
      tone: 'mint',
      badgeName: 'Pocket Builder',
      steps: [
        {
          id: 'mob-1',
          title: 'Mobile Navigation & Touch Ergonomics',
          tier: 'Beginner',
          description: 'Stack/tab navigators, safe areas, and gesture feedback.',
          materials: ['Expo Router Guide'],
          resourceUrl: 'https://docs.expo.dev/',
          xp: 110,
          completed: false,
        },
        {
          id: 'mob-2',
          title: 'Offline-First SQLite & Async Storage',
          tier: 'Intermediate',
          description: 'Local cache persistence and background synchronization.',
          materials: ['React Native Storage Patterns'],
          resourceUrl: 'https://reactnative.dev/',
          xp: 170,
          completed: false,
        },
        {
          id: 'mob-3',
          title: '60fps Animations & App Store Release',
          tier: 'Advanced',
          description: 'Reanimated worklets, profiling, and signed builds.',
          materials: ['Reanimated Docs'],
          resourceUrl: 'https://docs.swmansion.com/react-native-reanimated/',
          xp: 240,
          completed: false,
        },
      ],
    },
    {
      id: 'rm-ai',
      title: 'AI & Machine Learning',
      subtitle: 'Linear Algebra, PyTorch, NLP & Applied LLMs',
      tone: 'pink',
      badgeName: 'Neural Explorer',
      steps: [
        {
          id: 'ai-1',
          title: 'Supervised Learning & Scikit-Learn Pipelines',
          tier: 'Beginner',
          description: 'Regression, classification trees, cross-validation, and F1 scores.',
          materials: ['Andrew Ng ML Specialization'],
          resourceUrl: 'https://scikit-learn.org/stable/user_guide.html',
          xp: 140,
          completed: true,
        },
        {
          id: 'ai-2',
          title: 'Deep Learning & PyTorch Neural Networks',
          tier: 'Intermediate',
          description: 'Backpropagation, CNNs, Adam optimizer, and GPU batching.',
          materials: ['PyTorch 60 Minute Blitz'],
          resourceUrl: 'https://pytorch.org/tutorials/',
          xp: 210,
          completed: false,
        },
        {
          id: 'ai-3',
          title: 'Transformers, RAG & Model Evaluation',
          tier: 'Advanced',
          description: 'Embeddings, vector retrieval, prompt evals, and latency budgets.',
          materials: ['Hugging Face NLP Course'],
          resourceUrl: 'https://huggingface.co/learn/nlp-course/',
          xp: 280,
          completed: false,
        },
      ],
    },
  ],
  projects: [
    {
      id: 'prj-1',
      title: 'STUDORA Campus Portal',
      category: 'Website',
      description: 'Full-stack student academic portal built with React, TypeScript, Express, and Pastel Neobrutalism UI.',
      deadline: fmtDate(14),
      coverImage: PROJECT_WEB_COVER_URL,
      tone: 'mint',
      status: 'Active',
      members: [
        { id: 'm-1', name: 'Feliz', role: 'Full-Stack Lead', initials: 'FZ' },
        { id: 'm-2', name: 'Alya Kusuma', role: 'UI/UX Designer', initials: 'AK' },
        { id: 'm-3', name: 'Bagas Putra', role: 'Backend Dev', initials: 'BP' },
      ],
      tasks: [
        { id: 'pt-1', title: 'Setup Vite + Express full-stack server', assignee: 'Feliz', done: true },
        { id: 'pt-2', title: 'Design Neobrutalism token system', assignee: 'Alya Kusuma', done: true },
        { id: 'pt-3', title: 'Integrate interactive Recharts analytics', assignee: 'Feliz', done: true },
        { id: 'pt-4', title: 'Add PostgreSQL migration script', assignee: 'Bagas Putra', done: false },
      ],
      timeline: [
        { id: 'tl-1', title: 'UI Architecture Approved', date: fmtDate(-10), completed: true },
        { id: 'tl-2', title: 'Core CRUD Modules Live', date: fmtDate(-2), completed: true },
        { id: 'tl-3', title: 'User Acceptance Demo', date: fmtDate(10), completed: false },
      ],
      attachments: ['architecture-diagram.svg', 'sprint-2-backlog.md'],
      notes: 'Focus on zero-latency local persistence and crisp mobile navigation.',
    },
    {
      id: 'prj-2',
      title: 'NeuralNote Smart Summarizer',
      category: 'AI Project',
      description: 'Lecture transcript classifier and keyword extractor helping IT students review algorithms faster.',
      deadline: fmtDate(22),
      coverImage: PROJECT_AI_COVER_URL,
      tone: 'pink',
      status: 'Active',
      members: [
        { id: 'm-4', name: 'Feliz', role: 'ML Engineer', initials: 'FZ' },
        { id: 'm-5', name: 'Citra Dewi', role: 'Data Curator', initials: 'CD' },
      ],
      tasks: [
        { id: 'pt-5', title: 'Collect 200 informatics lecture slides', assignee: 'Citra Dewi', done: true },
        { id: 'pt-6', title: 'Train TF-IDF + Logistic Classifier', assignee: 'Feliz', done: true },
        { id: 'pt-7', title: 'Benchmark inference speed', assignee: 'Feliz', done: false },
      ],
      timeline: [
        { id: 'tl-4', title: 'Dataset Cleaned', date: fmtDate(-6), completed: true },
        { id: 'tl-5', title: 'Model v1 Accuracy > 88%', date: fmtDate(7), completed: false },
      ],
      attachments: ['model-metrics.csv'],
      notes: 'Current validation F1 score sits at 0.86; testing bi-gram features next.',
    },
    {
      id: 'prj-3',
      title: 'Campus Shuttle Live Tracker',
      category: 'Mobile App',
      description: 'Cross-platform mobile app showing real-time campus bus arrival ETAs and seat capacity.',
      deadline: fmtDate(30),
      tone: 'yellow',
      status: 'Planning',
      members: [
        { id: 'm-6', name: 'Feliz', role: 'Mobile Dev', initials: 'FZ' },
        { id: 'm-7', name: 'Kevin Tan', role: 'IoT Telemetry', initials: 'KT' },
      ],
      tasks: [
        { id: 'pt-8', title: 'Define GPS WebSocket payload', assignee: 'Kevin Tan', done: true },
        { id: 'pt-9', title: 'Build route stop list UI', assignee: 'Feliz', done: false },
      ],
      timeline: [
        { id: 'tl-6', title: 'Hardware Telemetry Test', date: fmtDate(5), completed: false },
      ],
      attachments: ['bus-stops.geojson'],
      notes: 'Need offline stop timetable fallback when signal drops inside basement.',
    },
    {
      id: 'prj-4',
      title: 'Academic Grading & Transcript Engine',
      category: 'Database',
      description: 'Normalized PostgreSQL database schema and stored procedures for university SKS & IPK calculation.',
      deadline: fmtDate(7),
      tone: 'lavender',
      status: 'Review',
      members: [
        { id: 'm-8', name: 'Feliz', role: 'DB Architect', initials: 'FZ' },
      ],
      tasks: [
        { id: 'pt-10', title: 'Create 3NF ERD schema', assignee: 'Feliz', done: true },
        { id: 'pt-11', title: 'Write GPA trigger functions', assignee: 'Feliz', done: true },
        { id: 'pt-12', title: 'Prepare final presentation slides', assignee: 'Feliz', done: false },
      ],
      timeline: [
        { id: 'tl-7', title: 'Schema Peer Review', date: fmtDate(-1), completed: true },
        { id: 'tl-8', title: 'Final Submission', date: fmtDate(7), completed: false },
      ],
      attachments: ['schema-3nf.sql'],
      notes: 'Passed all constraint checks with zero anomalous updates.',
    },
  ],
  monthlyBudget: 2500000,
  transactions: [
    {
      id: 'fin-1',
      title: 'Monthly Parent Allowance',
      amount: 2200000,
      type: 'income',
      category: 'Allowance',
      date: fmtDate(-12),
      note: 'November living & campus budget',
    },
    {
      id: 'fin-2',
      title: 'Freelance Landing Page Build',
      amount: 1350000,
      type: 'income',
      category: 'Freelance',
      date: fmtDate(-6),
      note: 'React + Tailwind client deliverable',
    },
    {
      id: 'fin-3',
      title: 'Kantin Kampus & Coffee',
      amount: 145000,
      type: 'expense',
      category: 'Food',
      date: fmtDate(-2),
      note: 'Weekly lunch + late-night coding espresso',
    },
    {
      id: 'fin-4',
      title: 'Fiber Internet & Mobile Data',
      amount: 240000,
      type: 'expense',
      category: 'Internet',
      date: fmtDate(-8),
      note: 'Monthly 100Mbps student plan',
    },
    {
      id: 'fin-5',
      title: 'Algorithm & System Design E-Book',
      amount: 185000,
      type: 'expense',
      category: 'Education',
      date: fmtDate(-5),
      note: 'Designing Data-Intensive Applications study notes',
    },
    {
      id: 'fin-6',
      title: 'Commuter Train & Ride Share',
      amount: 95000,
      type: 'expense',
      category: 'Transportation',
      date: fmtDate(-3),
    },
    {
      id: 'fin-7',
      title: 'Cloud VPS Hosting + Domain',
      amount: 165000,
      type: 'expense',
      category: 'Shopping',
      date: fmtDate(-4),
      note: 'Student sandbox server',
    },
    {
      id: 'fin-8',
      title: 'Weekend Cinema & Hangout',
      amount: 110000,
      type: 'expense',
      category: 'Entertainment',
      date: fmtDate(-1),
    },
  ],
  financialGoals: [
    {
      id: 'fg-1',
      title: 'Mechanical Keyboard Keychron',
      targetAmount: 1600000,
      currentAmount: 1150000,
      deadline: fmtDate(45),
      tone: 'lavender',
    },
    {
      id: 'fg-2',
      title: 'Emergency Student Fund',
      targetAmount: 5000000,
      currentAmount: 3250000,
      deadline: fmtDate(120),
      tone: 'mint',
    },
    {
      id: 'fg-3',
      title: 'AWS Cloud Certification Exam',
      targetAmount: 1800000,
      currentAmount: 900000,
      deadline: fmtDate(60),
      tone: 'yellow',
    },
  ],
  notes: [
    {
      id: 'n-1',
      title: 'Big-O Complexity Cheat Notes (IF202)',
      category: 'Lecture Notes',
      content:
        'Always analyze worst-case vs amortized time complexity. Hash tables give O(1) average lookup, while balanced BSTs (AVL / Red-Black) guarantee O(log n) even under adversarial keys.',
      codeBlock: `// Binary Search: O(log n) time, O(1) space\nwhile (lo <= hi) {\n  const mid = lo + ((hi - lo) >> 1);\n}`,
      codeLanguage: 'TypeScript',
      checklist: [
        { id: 'nc-1', text: 'Review Master Theorem Case 2', done: true },
        { id: 'nc-2', text: 'Practice 5 DP memoization problems', done: false },
      ],
      pinned: true,
      favorite: true,
      tone: 'lavender',
      updatedAt: fmtDate(0),
    },
    {
      id: 'n-2',
      title: 'PostgreSQL Indexing Rules of Thumb',
      category: 'Programming',
      content:
        'Use B-Tree indexes for equality and range queries. For composite indexes (a, b), column order matters—place the highest-selectivity or equality column first.',
      codeBlock: `CREATE INDEX idx_tasks_status_deadline\nON tasks (status, deadline ASC);`,
      codeLanguage: 'SQL',
      checklist: [
        { id: 'nc-3', text: 'Run EXPLAIN ANALYZE on slow join', done: true },
      ],
      pinned: true,
      favorite: false,
      tone: 'mint',
      updatedAt: fmtDate(-1),
    },
    {
      id: 'n-3',
      title: 'Hackathon App Ideas — Campus Edition',
      category: 'Ideas',
      content:
        '1. Peer code-review matcher for freshman CS labs.\n2. Crowdsourced quiet study seat availability map in the central library.\n3. Automated syllabus-to-calendar ICS generator.',
      checklist: [
        { id: 'nc-4', text: 'Validate idea #2 with 10 classmates', done: false },
      ],
      pinned: false,
      favorite: true,
      tone: 'yellow',
      updatedAt: fmtDate(-2),
    },
    {
      id: 'n-4',
      title: 'Sprint 3 Action Items — STUDORA Portal',
      category: 'Projects',
      content:
        'Verify contrast ratios on Pastel Pink and Soft Yellow badges, ensure mobile bottom bar stays ergonomic, and test local persistence across browser reloads.',
      checklist: [
        { id: 'nc-5', text: 'Audit dark mode card borders', done: true },
        { id: 'nc-6', text: 'Test CSV export on Analytics', done: true },
      ],
      pinned: false,
      favorite: false,
      tone: 'peach',
      updatedAt: fmtDate(-3),
    },
    {
      id: 'n-5',
      title: 'Weekly Deep Work Routine',
      category: 'Personal',
      content:
        'Two 90-minute focus blocks before noon with phone in Focus mode. Reserve late afternoon for campus organization syncs and code reviews.',
      checklist: [],
      pinned: false,
      favorite: false,
      tone: 'pink',
      updatedAt: fmtDate(-5),
    },
  ],
  notifications: [
    {
      id: 'not-1',
      title: 'Quiz Kriptografi Simetris Tomorrow',
      message: 'IF507 quiz starts at 09:00 in Aula Barat R.104. Review AES block modes tonight.',
      type: 'Exam Reminders',
      timestamp: '15m ago',
      read: false,
      targetPage: 'schedule',
    },
    {
      id: 'not-2',
      title: 'Deadline Approaching: AES Lab Report',
      message: 'Due tomorrow! 2 of 3 checklist items completed.',
      type: 'Deadline Reminders',
      timestamp: '1h ago',
      read: false,
      targetPage: 'tasks',
    },
    {
      id: 'not-3',
      title: 'Class Starting Soon: Praktikum ML',
      message: 'Lab AI & Data Science · Lt. 2 at 13:00 today.',
      type: 'Class Reminders',
      timestamp: '3h ago',
      read: false,
      targetPage: 'schedule',
    },
    {
      id: 'not-4',
      title: 'Alya pushed UI Tokens to STUDORA Portal',
      message: 'Project progress reached 75%. Review sprint notes.',
      type: 'Project Updates',
      timestamp: 'Yesterday',
      read: true,
      targetPage: 'projects',
    },
    {
      id: 'not-5',
      title: '14-Day Coding Streak Unlocked',
      message: 'You completed 3 Frontend Developer roadmap milestones this week.',
      type: 'Learning Reminders',
      timestamp: '2d ago',
      read: true,
      targetPage: 'roadmap',
    },
    {
      id: 'not-6',
      title: 'Workspace Sync Active',
      message: 'Your data automatically persists across sessions with full-stack backup.',
      type: 'System Notifications',
      timestamp: '3d ago',
      read: true,
      targetPage: 'settings',
    },
  ],
  studyStats: [
    { day: 'Mon', studyHours: 4.5, codingHours: 2.5, tasksCompleted: 3 },
    { day: 'Tue', studyHours: 5.2, codingHours: 3.1, tasksCompleted: 4 },
    { day: 'Wed', studyHours: 3.8, codingHours: 2.0, tasksCompleted: 2 },
    { day: 'Thu', studyHours: 6.0, codingHours: 4.2, tasksCompleted: 5 },
    { day: 'Fri', studyHours: 4.9, codingHours: 3.4, tasksCompleted: 3 },
    { day: 'Sat', studyHours: 3.2, codingHours: 2.8, tasksCompleted: 2 },
    { day: 'Sun', studyHours: 2.6, codingHours: 1.9, tasksCompleted: 1 },
  ],
  settings: {
    theme: 'light',
    backgroundColor: '#FDE2F3',
    accentColor: 'pink',
    language: 'en',
    notifications: {
      deadlineReminders: true,
      classReminders: true,
      examReminders: true,
      projectUpdates: true,
      learningReminders: true,
      systemNotifications: true,
    },
  },
});

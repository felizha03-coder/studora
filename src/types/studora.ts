export type PageId =
  | 'dashboard'
  | 'academic'
  | 'schedule'
  | 'tasks'
  | 'coding'
  | 'roadmap'
  | 'projects'
  | 'finance'
  | 'notes'
  | 'analytics'
  | 'notifications'
  | 'settings';

export type PastelTone = 'lavender' | 'purple' | 'peach' | 'mint' | 'pink' | 'yellow' | 'white';

export type GradeLetter = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E' | 'In Progress';

export type CourseStatus = 'Active' | 'Completed' | 'Retake';

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  sks: number;
  semester: number;
  grade: GradeLetter;
  status: CourseStatus;
  tone: PastelTone;
}

export type ScheduleCategory = 'Lecture' | 'Lab' | 'Exam' | 'Campus Event';

export interface ScheduleEvent {
  id: string;
  title: string;
  courseCode?: string;
  category: ScheduleCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  instructor?: string;
  reminderEnabled: boolean;
  notes?: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface StudentTask {
  id: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  subject: string;
  checklist: TaskChecklistItem[];
  attachments: string[];
  createdAt: string;
}

export type CodeLanguage =
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'Python'
  | 'PHP'
  | 'Java'
  | 'C'
  | 'C++'
  | 'SQL'
  | 'TypeScript';

export interface CodeSnippet {
  id: string;
  title: string;
  language: CodeLanguage;
  code: string;
  description: string;
  tags: string[];
  updatedAt: string;
  isFavorite?: boolean;
}

export interface RoadmapStep {
  id: string;
  title: string;
  tier: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  materials: string[];
  resourceUrl: string;
  xp: number;
  completed: boolean;
}

export interface RoadmapTrack {
  id: string;
  title: string;
  subtitle: string;
  tone: PastelTone;
  badgeName: string;
  steps: RoadmapStep[];
}

export type ProjectCategory =
  | 'Website'
  | 'Mobile App'
  | 'UI/UX Design'
  | 'Database'
  | 'AI Project'
  | 'Academic Project';

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  assignee: string;
  done: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface StudentProject {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  deadline: string;
  coverImage?: string;
  tone: PastelTone;
  members: ProjectMember[];
  tasks: ProjectTaskItem[];
  timeline: ProjectMilestone[];
  attachments: string[];
  notes: string;
  status: 'Planning' | 'Active' | 'Review' | 'Shipped';
}

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Education'
  | 'Entertainment'
  | 'Shopping'
  | 'Internet'
  | 'Other';

export interface FinanceTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: ExpenseCategory | 'Allowance' | 'Freelance' | 'Scholarship';
  date: string;
  note?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  tone: PastelTone;
}

export type NoteCategory = 'Lecture Notes' | 'Programming' | 'Personal' | 'Projects' | 'Ideas';

export interface NoteChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface StudentNote {
  id: string;
  title: string;
  category: NoteCategory;
  content: string;
  codeBlock?: string;
  codeLanguage?: string;
  checklist: NoteChecklistItem[];
  pinned: boolean;
  favorite: boolean;
  tone: PastelTone;
  updatedAt: string;
}

export type NotificationType =
  | 'Deadline Reminders'
  | 'Class Reminders'
  | 'Exam Reminders'
  | 'Project Updates'
  | 'Learning Reminders'
  | 'System Notifications';

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  targetPage?: PageId;
}

export interface NotificationPreferences {
  deadlineReminders: boolean;
  classReminders: boolean;
  examReminders: boolean;
  projectUpdates: boolean;
  learningReminders: boolean;
  systemNotifications: boolean;
}

export interface StudentProfile {
  fullName: string;
  studentId: string;
  university: string;
  faculty: string;
  major: string;
  semester: number;
  email: string;
  bio: string;
  avatarUrl: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  backgroundColor: string;
  accentColor: PastelTone;
  language: 'en' | 'id';
  notifications: NotificationPreferences;
}

export interface StudyDayStat {
  day: string;
  studyHours: number;
  codingHours: number;
  tasksCompleted: number;
}

export interface StudoraWorkspace {
  profile: StudentProfile;
  courses: Course[];
  schedule: ScheduleEvent[];
  tasks: StudentTask[];
  snippets: CodeSnippet[];
  roadmaps: RoadmapTrack[];
  projects: StudentProject[];
  transactions: FinanceTransaction[];
  financialGoals: FinancialGoal[];
  monthlyBudget: number;
  notes: StudentNote[];
  notifications: StudentNotification[];
  studyStats: StudyDayStat[];
  settings: AppSettings;
  updatedAt?: string;
  schemaVersion?: number;
}

export interface AuthSession {
  email: string;
  fullName: string;
  isDemo: boolean;
  loggedInAt: string;
}

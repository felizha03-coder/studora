import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudora } from '../context/StudoraContext';
import { ExpenseCategory, FinanceTransaction, FinancialGoal } from '../types/studora';
import { EmptyState, NeoButton, NeoCard, NeoModal } from '../components/ui/NeoComponents';
import { useToast } from '../components/ui/ToastProvider';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Education',
  'Entertainment',
  'Shopping',
  'Internet',
  'Other',
];

const INCOME_CATEGORIES = ['Allowance', 'Freelance', 'Scholarship'] as const;

const CHART_COLORS = ['#A78BFA', '#B9F5C8', '#FFE69A', '#FFC98B', '#F5A9DD', '#C4B5FD', '#93C5FD'];

export const FinancePage: React.FC = () => {
  const { workspace, updateWorkspace } = useStudora();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');

  // Transaction Modal
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState<FinanceTransaction['category']>('Food');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txNote, setTxNote] = useState('');

  // Goal Modal
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalDeadline, setGoalDeadline] = useState(() => new Date().toISOString().split('T')[0]);

  const transactions = workspace?.transactions || [];
  const goals = workspace?.financialGoals || [];
  const monthlyBudget = workspace?.monthlyBudget || 2500000;

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const balance = income - expenses;
    const budgetUsedPct = Math.min(100, Math.round((expenses / monthlyBudget) * 100));
    return { income, expenses, totalSavings, balance, budgetUsedPct };
  }, [transactions, goals, monthlyBudget]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [transactions]);

  const incomeVsExpenseData = useMemo(
    () => [
      { label: 'Income', amount: summary.income, fill: '#B9F5C8' },
      { label: 'Expenses', amount: summary.expenses, fill: '#F5A9DD' },
      { label: 'Savings', amount: summary.totalSavings, fill: '#FFE69A' },
    ],
    [summary]
  );

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (catFilter !== 'all' && t.category !== catFilter) return false;
        if (!search.trim()) return true;
        return (
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, catFilter, search]);

  if (!workspace) return null;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(txAmount);
    if (!txTitle.trim() || Number.isNaN(numeric) || numeric <= 0) {
      showToast('Enter a valid transaction title and positive amount.', 'error');
      return;
    }

    const created: FinanceTransaction = {
      id: `fin-${Date.now()}`,
      title: txTitle.trim(),
      amount: numeric,
      type: txType,
      category: txCategory,
      date: txDate,
      note: txNote.trim() || undefined,
    };

    updateWorkspace((prev) => ({
      ...prev,
      transactions: [created, ...prev.transactions],
    }));
    showToast(`${txType === 'income' ? 'Income' : 'Expense'} recorded!`, 'success');
    setTxModalOpen(false);
    setTxTitle('');
    setTxAmount('');
    setTxNote('');
  };

  const deleteTransaction = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    showToast('Transaction removed', 'info');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(goalTarget);
    const current = Number(goalCurrent) || 0;
    if (!goalTitle.trim() || Number.isNaN(target) || target <= 0) {
      showToast('Enter a goal title and positive target amount.', 'error');
      return;
    }
    const created: FinancialGoal = {
      id: `fg-${Date.now()}`,
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline: goalDeadline,
      tone: 'lavender',
    };
    updateWorkspace((prev) => ({
      ...prev,
      financialGoals: [...prev.financialGoals, created],
    }));
    showToast('Savings goal added!', 'success');
    setGoalModalOpen(false);
    setGoalTitle('');
    setGoalTarget('');
  };

  const depositToGoal = (goalId: string, amount = 100000) => {
    updateWorkspace((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
          : g
      ),
    }));
    showToast(`Added ${formatIDR(amount)} to savings goal!`, 'success');
  };

  const deleteGoal = (goalId: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.filter((g) => g.id !== goalId),
    }));
    showToast('Goal removed', 'info');
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NeoCard tone="yellow">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold">Total Balance</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="font-stat text-2xl sm:text-3xl font-bold mt-2">{formatIDR(summary.balance)}</p>
          <p className="font-body text-xs opacity-75 mt-1">Available student cashflow</p>
        </NeoCard>

        <NeoCard tone="mint">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold">Total Income</span>
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <p className="font-stat text-2xl sm:text-3xl font-bold mt-2">{formatIDR(summary.income)}</p>
          <p className="font-body text-xs opacity-75 mt-1">Allowance & freelance</p>
        </NeoCard>

        <NeoCard tone="pink">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold">Expenses</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <p className="font-stat text-2xl sm:text-3xl font-bold mt-2">{formatIDR(summary.expenses)}</p>
          <p className="font-body text-xs opacity-75 mt-1">
            {summary.budgetUsedPct}% of {formatIDR(monthlyBudget)} budget
          </p>
        </NeoCard>

        <NeoCard tone="lavender">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-bold">Total Savings</span>
            <PiggyBank className="w-4 h-4" />
          </div>
          <p className="font-stat text-2xl sm:text-3xl font-bold mt-2">{formatIDR(summary.totalSavings)}</p>
          <p className="font-body text-xs opacity-75 mt-1">{goals.length} active financial goals</p>
        </NeoCard>
      </div>

      {/* Budget Progress + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <NeoCard tone="white" className="lg:col-span-6">
          <h3 className="font-label text-sm font-bold">Expense Breakdown</h3>
          <p className="font-body text-xs opacity-75 mt-0.5">
            Distribution across student spending categories
          </p>
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={84}
                  stroke="#171717"
                  strokeWidth={2}
                >
                  {expenseByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatIDR(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center text-xs font-body font-semibold">
            {expenseByCategory.map((e) => (
              <span key={e.name} className="inline-flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded border border-[#171717]"
                  style={{ backgroundColor: e.fill }}
                />
                {e.name}
              </span>
            ))}
          </div>
        </NeoCard>

        <NeoCard tone="white" className="lg:col-span-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-label text-sm font-bold">Monthly Financial Report</h3>
              <p className="font-body text-xs opacity-75 mt-0.5">Income, Expenses, and Savings comparison</p>
            </div>
            <div className="text-right">
              <span className="font-label text-[10px] uppercase opacity-70 block">Monthly Cap</span>
              <input
                type="number"
                step={100000}
                value={monthlyBudget}
                onChange={(e) =>
                  updateWorkspace((prev) => ({
                    ...prev,
                    monthlyBudget: Math.max(500000, Number(e.target.value) || 500000),
                  }))
                }
                aria-label="Monthly budget cap"
                className="neo-input w-32 px-2 py-1 text-xs font-stat font-bold text-right bg-[#FFF9F0] dark:bg-[#14141A]"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Monthly Budget Usage</span>
              <span className="font-stat">{summary.budgetUsedPct}%</span>
            </div>
            <div className="h-3.5 rounded-full border-2 border-[#171717] bg-[#FFF9F0] overflow-hidden">
              <div
                className={`h-full border-r-2 border-[#171717] ${
                  summary.budgetUsedPct > 85 ? 'bg-[#F5A9DD]' : 'bg-[#B9F5C8]'
                }`}
                style={{ width: `${summary.budgetUsedPct}%` }}
              />
            </div>
          </div>

          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,23,23,0.12)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} />
                <YAxis hide />
                <Tooltip formatter={(v) => formatIDR(Number(v))} />
                <Bar dataKey="amount" stroke="#171717" strokeWidth={2} radius={[8, 8, 0, 0]}>
                  {incomeVsExpenseData.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>
      </div>

      {/* Savings Goals Tracker */}
      <NeoCard tone="white">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#171717]/15 dark:border-white/15">
          <div>
            <h3 className="font-display text-xl">Financial & Saving Goals</h3>
            <p className="font-body text-xs opacity-75">Track gear upgrades, certifications, and emergency savings.</p>
          </div>
          <NeoButton size="sm" tone="lavender" onClick={() => setGoalModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </NeoButton>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <NeoCard key={g.id} tone={g.tone} padding="sm">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-body text-sm font-bold">{g.title}</h4>
                  <button
                    type="button"
                    onClick={() => deleteGoal(g.id)}
                    aria-label={`Delete ${g.title}`}
                    className="p-1 rounded border border-[#171717] bg-white text-[#171717] cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="font-stat text-lg font-bold mt-2">
                  {formatIDR(g.currentAmount)}
                </p>
                <p className="font-body text-xs opacity-75">
                  of {formatIDR(g.targetAmount)} ({pct}%) · Target {g.deadline}
                </p>
                <div className="mt-2.5 h-3 rounded-full border-2 border-[#171717] bg-white overflow-hidden">
                  <div className="h-full bg-[#171717]" style={{ width: `${pct}%` }} />
                </div>
                <NeoButton
                  size="sm"
                  tone="white"
                  className="mt-3 w-full"
                  onClick={() => depositToGoal(g.id, 100000)}
                >
                  + Deposit Rp 100.000
                </NeoButton>
              </NeoCard>
            );
          })}
        </div>
      </NeoCard>

      {/* Transaction History */}
      <NeoCard tone="white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b-2 border-[#171717]/15 dark:border-white/15">
          <h3 className="font-display text-xl">Transaction History</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="neo-input pl-9 pr-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A]"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="neo-input px-3 py-2 text-sm bg-[#FFF9F0] dark:bg-[#14141A] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <NeoButton tone="mint" onClick={() => setTxModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </NeoButton>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No matching transactions"
              description="Record an income entry or expense to start tracking your student budget."
              actionLabel="Add Transaction"
              onAction={() => setTxModalOpen(true)}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-[14px] border-2 border-[#171717] bg-[#FFF9F0] dark:bg-[#23232E] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-body text-sm font-bold truncate">{tx.title}</p>
                  <p className="font-body text-xs opacity-75">
                    {tx.category} · {tx.date} {tx.note ? `· ${tx.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span
                    className={`font-stat text-sm font-bold px-2.5 py-1 rounded-[8px] border-2 border-[#171717] ${
                      tx.type === 'income'
                        ? 'bg-[#B9F5C8] text-[#171717]'
                        : 'bg-[#F5A9DD] text-[#171717]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTransaction(tx.id)}
                    aria-label={`Delete ${tx.title}`}
                    className="p-2 rounded-[9px] border-2 border-[#171717] bg-white text-[#171717] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeoCard>

      {/* Add Transaction Modal */}
      <NeoModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        title="Record Transaction"
        subtitle="Log an expense or income stream."
      >
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <NeoButton
              tone={txType === 'expense' ? 'pink' : 'white'}
              onClick={() => {
                setTxType('expense');
                setTxCategory('Food');
              }}
            >
              Expense
            </NeoButton>
            <NeoButton
              tone={txType === 'income' ? 'mint' : 'white'}
              onClick={() => {
                setTxType('income');
                setTxCategory('Allowance');
              }}
            >
              Income
            </NeoButton>
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Title</label>
            <input
              type="text"
              value={txTitle}
              onChange={(e) => setTxTitle(e.target.value)}
              placeholder="e.g. Lunch at Campus Cafeteria"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Amount (IDR)</label>
              <input
                type="number"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="50000"
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Category</label>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value as FinanceTransaction['category'])}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
              >
                {(txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Date</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
          </div>

          <div>
            <label className="block font-label text-xs mb-1">Note (optional)</label>
            <input
              type="text"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <NeoButton tone="white" onClick={() => setTxModalOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" tone="mint">
              Save Transaction
            </NeoButton>
          </div>
        </form>
      </NeoModal>

      {/* Add Savings Goal Modal */}
      <NeoModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title="New Saving Goal"
        subtitle="Save towards hardware, certifications, or emergency funds."
      >
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="block font-label text-xs mb-1">Goal Title</label>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Second Monitor for Coding"
              className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-label text-xs mb-1">Target (IDR)</label>
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Initial Saved</label>
              <input
                type="number"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
            <div>
              <label className="block font-label text-xs mb-1">Target Date</label>
              <input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="neo-input w-full px-3 py-2 bg-[#FFF9F0] dark:bg-[#14141A] text-sm font-stat"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <NeoButton tone="white" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" tone="lavender">
              Create Goal
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};

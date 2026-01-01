
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { TransactionsView } from './components/TransactionsView';
import { ExpensesView } from './components/ExpensesView';
import { AIInsights } from './components/AIInsights';
import { Transaction, Client, Expense } from './types';

const STORAGE_KEY = 'bzk_finance_storage_v1';

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Tech Solutions Ltd', cnpj: '12.345.678/0001-90', email: 'billing@techsol.com', recurringValue: 2500, status: 'active', nextBillingDate: '2023-12-05' },
  { id: '2', name: 'Design Studio X', cnpj: '98.765.432/0001-11', email: 'hello@dsx.io', recurringValue: 1200, status: 'active', nextBillingDate: '2023-12-10' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Assinatura Software SaaS', amount: 150.00, type: 'expense', date: '2024-01-01', category: 'Software', isPaid: true },
  { id: 't2', description: 'Recebimento Tech Solutions', amount: 2500.00, type: 'income', date: '2024-01-05', category: 'Serviços', isPaid: true },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', description: 'Salários Equipe', amount: 8500, category: 'Salários', dueDate: '2024-01-05', isRecurring: true },
];

const DEFAULT_CATEGORIES = ['Salários', 'Impostos', 'Software', 'Infraestrutura', 'Marketing', 'Outros'];

const App: React.FC = () => {
  // Carregamento inicial do LocalStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao carregar dados salvos", e);
    }
    return null;
  };

  const savedData = loadSavedData();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'transactions' | 'expenses'>('dashboard');
  const [clients, setClients] = useState<Client[]>(savedData?.clients || INITIAL_CLIENTS);
  const [expenses, setExpenses] = useState<Expense[]>(savedData?.expenses || INITIAL_EXPENSES);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(savedData?.categories || DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(savedData?.transactions || INITIAL_TRANSACTIONS);
  const [lastSaved, setLastSaved] = useState<string>('');

  const [dateFilter, setDateFilter] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split('T')[0] 
  });

  // Efeito de persistência: Salva sempre que algo mudar
  useEffect(() => {
    const dataToSave = {
      clients,
      expenses,
      categories: expenseCategories,
      transactions
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    setLastSaved(new Date().toLocaleTimeString());
  }, [clients, expenses, expenseCategories, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= dateFilter.start && t.date <= dateFilter.end);
  }, [transactions, dateFilter]);

  const stats = useMemo(() => {
    const incomeTxs = filteredTransactions.filter(t => t.type === 'income');
    const expenseTxs = filteredTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTxs.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenseTxs.reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalReceived = incomeTxs
      .filter(t => t.isPaid)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalToReceive = incomeTxs
      .filter(t => !t.isPaid)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const activeClientsValue = clients
      .filter(c => c.status === 'active')
      .reduce((acc, curr) => acc + curr.recurringValue, 0);
    
    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      activeRecurring: activeClientsValue,
      totalReceived,
      totalToReceive
    };
  }, [filteredTransactions, clients]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 lg:ml-64 transition-all duration-300">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {activeTab === 'dashboard' ? 'Painel Geral' : activeTab === 'clients' ? 'Meus Clientes' : activeTab === 'expenses' ? 'Despesas da Agência' : 'Transações'}
              </h1>
              {lastSaved && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  SALVO {lastSaved}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm">Controle financeiro e recorrência em tempo real.</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
            <input 
              type="date" 
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({...prev, start: e.target.value}))}
            />
            <span className="text-slate-400 font-medium">→</span>
            <input 
              type="date" 
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({...prev, end: e.target.value}))}
            />
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <DashboardView stats={stats} transactions={filteredTransactions} />
            <AIInsights transactions={filteredTransactions} clients={clients} />
          </div>
        )}
        {activeTab === 'clients' && (
          <ClientsView clients={clients} setClients={setClients} setTransactions={setTransactions} />
        )}
        {activeTab === 'expenses' && (
          <ExpensesView 
            expenses={expenses} 
            setExpenses={setExpenses} 
            setTransactions={setTransactions}
            categories={expenseCategories}
            setCategories={setExpenseCategories}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionsView transactions={transactions} setTransactions={setTransactions} />
        )}
      </main>
    </div>
  );
};

export default App;

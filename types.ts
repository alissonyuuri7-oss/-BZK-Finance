
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
  isPaid: boolean;
}

export interface Client {
  id: string;
  name: string;
  cnpj?: string;
  email: string;
  recurringValue: number;
  status: 'active' | 'inactive';
  nextBillingDate: string;
  artCount?: number;
  videoCount?: number;
  hasPaidTraffic?: boolean;
  observations?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  isRecurring: boolean;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  activeRecurring: number;
  totalReceived: number;
  totalToReceive: number;
}

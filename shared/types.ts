// Shared types for frontend and backend

// Authentication
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export type UserRole = 'admin' | 'accountant' | 'manager' | 'user';

// Financial Dashboard
export interface KpiData {
  title: string;
  value: string;
  change: number;
  changeText: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Transaction Types
export interface TransactionSummary {
  id: number;
  transactionNumber: string;
  description: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// AI Insights
export interface AiInsightData {
  type: 'anomaly' | 'prediction' | 'recommendation' | 'optimization';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  ctaText: string;
  ctaLink: string;
  iconBgClass: string;
  iconColorClass: string;
}

// Finance Types
export interface LedgerEntrySummary {
  id: number;
  entryNumber: string;
  description: string;
  accountName: string;
  debit: number;
  credit: number;
  date: string;
}

export interface InvoiceSummary {
  id: number;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  type: 'accounts_receivable' | 'accounts_payable';
}

export interface AccountSummary {
  id: number;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
}

// Financial Report Types
export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  reportType: string;
  accountIds?: number[];
}

export interface FinancialReportData {
  title: string;
  subtitle?: string;
  data: any; // Specific to report type
  summary?: {
    label: string;
    value: number;
  }[];
}

// Exchange Rate Types
export interface ExchangeRateData {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  date: string;
}

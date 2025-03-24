import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import {
  KpiData,
  ChartData,
  AiInsightData,
  TransactionSummary,
  InvoiceSummary,
  LedgerEntrySummary,
  AccountSummary,
  ReportFilter,
  FinancialReportData
} from "@shared/types";
import { 
  Transaction, 
  Invoice, 
  LedgerEntry, 
  Account,
  InsertTransaction,
  InsertInvoice,
  InsertLedgerEntry,
  InsertAccount
} from "@shared/schema";

export function useFinance() {
  // Dashboard KPIs
  const useKpis = () => {
    return useQuery({
      queryKey: ['/api/dashboard/kpis'],
      queryFn: () => api.get<KpiData[]>('/dashboard/kpis')
    });
  };

  // Revenue Chart Data
  const useRevenueChart = () => {
    return useQuery({
      queryKey: ['/api/dashboard/chart/revenue'],
      queryFn: () => api.get<ChartData>('/dashboard/chart/revenue')
    });
  };

  // Expense Categories Chart Data
  const useExpenseCategoriesChart = () => {
    return useQuery({
      queryKey: ['/api/dashboard/chart/expenses'],
      queryFn: () => api.get<ChartData>('/dashboard/chart/expenses')
    });
  };

  // AI Insights
  const useAiInsights = () => {
    return useQuery({
      queryKey: ['/api/dashboard/ai-insights'],
      queryFn: () => api.get<AiInsightData[]>('/dashboard/ai-insights')
    });
  };

  // Mark AI Insight as read
  const useMarkAiInsightAsRead = () => {
    return useMutation({
      mutationFn: (insightId: number) => 
        api.put<void>(`/dashboard/ai-insights/${insightId}/read`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/ai-insights'] });
      }
    });
  };

  // Transactions
  const useTransactions = (limit?: number) => {
    return useQuery({
      queryKey: ['/api/transactions', { limit }],
      queryFn: () => api.get<Transaction[]>('/transactions', { params: { limit } })
    });
  };

  const useTransactionById = (id: number) => {
    return useQuery({
      queryKey: ['/api/transactions', id],
      queryFn: () => api.get<Transaction>(`/transactions/${id}`),
      enabled: !!id
    });
  };

  const useCreateTransaction = () => {
    return useMutation({
      mutationFn: (data: InsertTransaction) => 
        api.post<Transaction>('/transactions', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/kpis'] });
      }
    });
  };

  const useUpdateTransaction = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number, data: Partial<Transaction> }) => 
        api.put<Transaction>(`/transactions/${id}`, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/transactions', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/kpis'] });
      }
    });
  };

  // Invoices
  const useInvoices = (type?: string, status?: string, limit?: number) => {
    return useQuery({
      queryKey: ['/api/invoices', { type, status, limit }],
      queryFn: () => api.get<Invoice[]>('/invoices', { params: { type, status, limit } })
    });
  };

  const useInvoiceById = (id: number) => {
    return useQuery({
      queryKey: ['/api/invoices', id],
      queryFn: () => api.get<Invoice>(`/invoices/${id}`),
      enabled: !!id
    });
  };

  const useCreateInvoice = () => {
    return useMutation({
      mutationFn: (data: InsertInvoice) => 
        api.post<Invoice>('/invoices', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/kpis'] });
      }
    });
  };

  const useUpdateInvoice = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number, data: Partial<Invoice> }) => 
        api.put<Invoice>(`/invoices/${id}`, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
        queryClient.invalidateQueries({ queryKey: ['/api/invoices', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/kpis'] });
      }
    });
  };

  // Ledger Entries
  const useLedgerEntries = (accountName?: string, limit?: number) => {
    return useQuery({
      queryKey: ['/api/ledger', { accountName, limit }],
      queryFn: () => api.get<LedgerEntry[]>('/ledger', { params: { accountName, limit } })
    });
  };

  const useLedgerEntryById = (id: number) => {
    return useQuery({
      queryKey: ['/api/ledger', id],
      queryFn: () => api.get<LedgerEntry>(`/ledger/${id}`),
      enabled: !!id
    });
  };

  const useCreateLedgerEntry = () => {
    return useMutation({
      mutationFn: (data: InsertLedgerEntry) => 
        api.post<LedgerEntry>('/ledger', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/ledger'] });
        queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/kpis'] });
      }
    });
  };

  // Accounts
  const useAccounts = (type?: string) => {
    return useQuery({
      queryKey: ['/api/accounts', { type }],
      queryFn: () => api.get<Account[]>('/accounts', { params: { type } })
    });
  };

  const useAccountById = (id: number) => {
    return useQuery({
      queryKey: ['/api/accounts', id],
      queryFn: () => api.get<Account>(`/accounts/${id}`),
      enabled: !!id
    });
  };

  const useCreateAccount = () => {
    return useMutation({
      mutationFn: (data: InsertAccount) => 
        api.post<Account>('/accounts', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      }
    });
  };

  const useUpdateAccount = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number, data: Partial<Account> }) => 
        api.put<Account>(`/accounts/${id}`, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/accounts', variables.id] });
      }
    });
  };

  // Financial Reports
  const useCashFlowReport = (startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: ['/api/reports/cash-flow', { startDate, endDate }],
      queryFn: () => api.get<FinancialReportData>('/reports/cash-flow', { params: { startDate, endDate } })
    });
  };

  const useIncomeStatementReport = () => {
    return useQuery({
      queryKey: ['/api/reports/income-statement'],
      queryFn: () => api.get<FinancialReportData>('/reports/income-statement')
    });
  };

  const useBalanceSheetReport = () => {
    return useQuery({
      queryKey: ['/api/reports/balance-sheet'],
      queryFn: () => api.get<FinancialReportData>('/reports/balance-sheet')
    });
  };

  // Return all hooks
  return {
    // Dashboard
    useKpis,
    useRevenueChart,
    useExpenseCategoriesChart,
    useAiInsights,
    useMarkAiInsightAsRead,
    
    // Transactions
    useTransactions,
    useTransactionById,
    useCreateTransaction,
    useUpdateTransaction,
    
    // Invoices
    useInvoices,
    useInvoiceById,
    useCreateInvoice,
    useUpdateInvoice,
    
    // Ledger
    useLedgerEntries,
    useLedgerEntryById,
    useCreateLedgerEntry,
    
    // Accounts
    useAccounts,
    useAccountById,
    useCreateAccount,
    useUpdateAccount,
    
    // Reports
    useCashFlowReport,
    useIncomeStatementReport,
    useBalanceSheetReport
  };
}

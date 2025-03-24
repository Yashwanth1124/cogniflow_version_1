import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import { storage } from "../storage";
import { z } from "zod";
import {
  insertTransactionSchema,
  insertInvoiceSchema,
  insertLedgerEntrySchema,
  insertAccountSchema,
  insertExchangeRateSchema,
} from "@shared/schema";
import { KpiData, ChartData, AiInsightData } from "@shared/types";
import { aiService } from "../services/ai.service";

export const financeController = {
  async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await Transaction.find()
        .sort({ date: -1 })
        .limit(10);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },

  async createTransaction(req: Request, res: Response) {
    try {
      const transaction = new Transaction({
        ...req.body,
        createdBy: req.user?.id
      });
      await transaction.save();
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to create transaction" });
    }
  },

  async getTransactionById(req: Request, res: Response) {
    try {
      const transaction = await Transaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  },

  async updateTransaction(req: Request, res: Response) {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  },

  async getFinancialKpis(req: Request, res: Response) {
    try {
      const transactions = await Transaction.find();
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      res.json([
        { title: "Cash Flow", value: `$${income - expenses}`, trend: "up" },
        { title: "Revenue", value: `$${income}`, trend: "up" },
        { title: "Expenses", value: `$${expenses}`, trend: "down" }
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KPIs" });
    }
  },

  getRevenueChartData: async (req: Request, res: Response) => {
    res.json({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        label: "Revenue",
        data: [65, 59, 80, 81, 56, 55],
      }]
    });
  },

  getExpenseCategoriesChartData: async (req: Request, res: Response) => {
    res.json({
      labels: ["Materials", "Labor", "Overhead", "Marketing", "R&D"],
      datasets: [{
        data: [30, 25, 20, 15, 10],
      }]
    });
  },
  
  getExpenseCategoriesChartData: async (req: Request, res: Response) => {
    try {
      // Simulated expense categories distribution
      const chartData: ChartData = {
        labels: ["Materials", "Labor", "Equipment", "Other"],
        datasets: [
          {
            label: "Expenses by Category",
            data: [45, 30, 15, 10],
            backgroundColor: [
              "rgba(59, 130, 246, 0.7)",
              "rgba(139, 92, 246, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)"
            ],
            borderWidth: 1
          }
        ]
      };

      return res.status(200).json(chartData);
    } catch (error) {
      console.error("Error fetching expense categories chart data:", error);
      return res.status(500).json({ error: "Failed to fetch expense categories chart data" });
    }
  },

  getAiInsights: async (req: Request, res: Response) => {
    try {
      // Get AI insights from storage
      const insights = await storage.getAiInsights();

      // Transform to the expected format
      const formattedInsights: AiInsightData[] = insights.map(insight => {
        // Determine icon and style based on type
        let iconBgClass = "bg-purple-100 dark:bg-purple-900/20";
        let iconColorClass = "text-purple-600 dark:text-purple-300";

        if (insight.type === "prediction") {
          iconBgClass = "bg-green-100 dark:bg-green-900/20";
          iconColorClass = "text-green-600 dark:text-green-300";
        } else if (insight.type === "recommendation") {
          iconBgClass = "bg-blue-100 dark:bg-blue-900/20";
          iconColorClass = "text-blue-600 dark:text-blue-300";
        } else if (insight.type === "optimization") {
          iconBgClass = "bg-amber-100 dark:bg-amber-900/20";
          iconColorClass = "text-amber-600 dark:text-amber-300";
        }

        return {
          type: insight.type as any,
          title: insight.title,
          description: insight.description,
          severity: insight.severity as any,
          ctaText: "View details", // Default CTA
          ctaLink: `/insights/${insight.id}`,
          iconBgClass,
          iconColorClass
        };
      });

      return res.status(200).json(formattedInsights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      return res.status(500).json({ error: "Failed to fetch AI insights" });
    }
  },

  markAiInsightAsRead: async (req: Request, res: Response) => {
    try {
      const insightId = parseInt(req.params.id);

      if (isNaN(insightId)) {
        return res.status(400).json({ error: "Invalid insight ID" });
      }

      const insight = await storage.getAiInsight(insightId);

      if (!insight) {
        return res.status(404).json({ error: "Insight not found" });
      }

      const updatedInsight = await storage.updateAiInsight(insightId, { isRead: true });

      return res.status(200).json(updatedInsight);
    } catch (error) {
      console.error("Error marking insight as read:", error);
      return res.status(500).json({ error: "Failed to mark insight as read" });
    }
  },


  getInvoices: async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const invoices = await storage.getInvoices(type, status, limit);

      return res.status(200).json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
  },

  getInvoiceById: async (req: Request, res: Response) => {
    try {
      const invoiceId = parseInt(req.params.id);

      if (isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const invoice = await storage.getInvoice(invoiceId);

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      return res.status(200).json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({ error: "Failed to fetch invoice" });
    }
  },

  createInvoice: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertInvoiceSchema.parse(req.body);

      // Set created by to current user
      const userId = (req as any).user?.id;
      validatedData.createdBy = userId;

      // Create invoice
      const invoice = await storage.createInvoice(validatedData);

      // Log audit trail
      await storage.createAuditLog({
        userId,
        action: "CREATE",
        entityType: "invoice",
        entityId: invoice.id,
        details: { invoiceNumber: invoice.invoiceNumber }
      });

      return res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      console.error("Error creating invoice:", error);
      return res.status(500).json({ error: "Failed to create invoice" });
    }
  },

  updateInvoice: async (req: Request, res: Response) => {
    try {
      const invoiceId = parseInt(req.params.id);

      if (isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      // Get existing invoice
      const existingInvoice = await storage.getInvoice(invoiceId);

      if (!existingInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Validate request body (partial update)
      const validatedData = insertInvoiceSchema.partial().parse(req.body);

      // Update invoice
      const updatedInvoice = await storage.updateInvoice(invoiceId, validatedData);

      // Log audit trail
      const userId = (req as any).user?.id;
      await storage.createAuditLog({
        userId,
        action: "UPDATE",
        entityType: "invoice",
        entityId: invoiceId,
        details: { changes: validatedData }
      });

      return res.status(200).json(updatedInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      console.error("Error updating invoice:", error);
      return res.status(500).json({ error: "Failed to update invoice" });
    }
  },

  getLedgerEntries: async (req: Request, res: Response) => {
    try {
      const accountName = req.query.accountName as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const entries = await storage.getLedgerEntries(accountName, limit);

      return res.status(200).json(entries);
    } catch (error) {
      console.error("Error fetching ledger entries:", error);
      return res.status(500).json({ error: "Failed to fetch ledger entries" });
    }
  },

  getLedgerEntryById: async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);

      if (isNaN(entryId)) {
        return res.status(400).json({ error: "Invalid ledger entry ID" });
      }

      const entry = await storage.getLedgerEntry(entryId);

      if (!entry) {
        return res.status(404).json({ error: "Ledger entry not found" });
      }

      return res.status(200).json(entry);
    } catch (error) {
      console.error("Error fetching ledger entry:", error);
      return res.status(500).json({ error: "Failed to fetch ledger entry" });
    }
  },

  createLedgerEntry: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertLedgerEntrySchema.parse(req.body);

      // Set created by to current user
      const userId = (req as any).user?.id;
      validatedData.createdBy = userId;

      // Create ledger entry
      const entry = await storage.createLedgerEntry(validatedData);

      // Log audit trail
      await storage.createAuditLog({
        userId,
        action: "CREATE",
        entityType: "ledger_entry",
        entityId: entry.id,
        details: { entryNumber: entry.entryNumber }
      });

      // Update account balance if necessary
      if (validatedData.accountName) {
        const account = await storage.getAccountByName(validatedData.accountName);

        if (account) {
          // Calculate new balance (debit increases asset/expense, credit increases liability/equity/revenue)
          let balanceChange = 0;

          if (account.type === "asset" || account.type === "expense") {
            balanceChange = Number(validatedData.debit || 0) - Number(validatedData.credit || 0);
          } else {
            balanceChange = Number(validatedData.credit || 0) - Number(validatedData.debit || 0);
          }

          const newBalance = Number(account.balance) + balanceChange;

          await storage.updateAccount(account.id, { balance: newBalance });
        }
      }

      return res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      console.error("Error creating ledger entry:", error);
      return res.status(500).json({ error: "Failed to create ledger entry" });
    }
  },

  getAccounts: async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;

      const accounts = await storage.getAccounts(type);

      return res.status(200).json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      return res.status(500).json({ error: "Failed to fetch accounts" });
    }
  },

  getAccountById: async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);

      if (isNaN(accountId)) {
        return res.status(400).json({ error: "Invalid account ID" });
      }

      const account = await storage.getAccount(accountId);

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      return res.status(200).json(account);
    } catch (error) {
      console.error("Error fetching account:", error);
      return res.status(500).json({ error: "Failed to fetch account" });
    }
  },

  createAccount: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertAccountSchema.parse(req.body);

      // Check if account name already exists
      const existingAccount = await storage.getAccountByName(validatedData.name);

      if (existingAccount) {
        return res.status(400).json({ error: "Account with this name already exists" });
      }

      // Create account
      const account = await storage.createAccount(validatedData);

      // Log audit trail
      const userId = (req as any).user?.id;
      await storage.createAuditLog({
        userId,
        action: "CREATE",
        entityType: "account",
        entityId: account.id,
        details: { name: account.name, type: account.type }
      });

      return res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      console.error("Error creating account:", error);
      return res.status(500).json({ error: "Failed to create account" });
    }
  },

  updateAccount: async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);

      if (isNaN(accountId)) {
        return res.status(400).json({ error: "Invalid account ID" });
      }

      // Get existing account
      const existingAccount = await storage.getAccount(accountId);

      if (!existingAccount) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Validate request body (partial update)
      const validatedData = insertAccountSchema.partial().parse(req.body);

      // If name is changing, check if it already exists
      if (validatedData.name && validatedData.name !== existingAccount.name) {
        const nameExists = await storage.getAccountByName(validatedData.name);

        if (nameExists) {
          return res.status(400).json({ error: "Account with this name already exists" });
        }
      }

      // Update account
      const updatedAccount = await storage.updateAccount(accountId, validatedData);

      // Log audit trail
      const userId = (req as any).user?.id;
      await storage.createAuditLog({
        userId,
        action: "UPDATE",
        entityType: "account",
        entityId: accountId,
        details: { changes: validatedData }
      });

      return res.status(200).json(updatedAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      console.error("Error updating account:", error);
      return res.status(500).json({ error: "Failed to update account" });
    }
  },

  getExchangeRates: async (req: Request, res: Response) => {
    try {
      const baseCurrency = req.query.baseCurrency as string;
      const targetCurrency = req.query.targetCurrency as string;

      if (baseCurrency && targetCurrency) {
        const rate = await storage.getExchangeRate(baseCurrency, targetCurrency);

        if (!rate) {
          return res.status(404).json({ error: "Exchange rate not found" });
        }

        return res.status(200).json(rate);
      }

      // For demo, return some sample exchange rates
      return res.status(200).json([
        { baseCurrency: "USD", targetCurrency: "EUR", rate: 0.92, date: new Date() },
        { baseCurrency: "USD", targetCurrency: "GBP", rate: 0.78, date: new Date() },
        { baseCurrency: "USD", targetCurrency: "CAD", rate: 1.35, date: new Date() }
      ]);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      return res.status(500).json({ error: "Failed to fetch exchange rates" });
    }
  },

  createExchangeRate: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertExchangeRateSchema.parse(req.body);

      // Create exchange rate
      const rate = await storage.createExchangeRate(validatedData);

      // Log audit trail
      const userId = (req as any).user?.id;
      await storage.createAuditLog({
        userId,
        action: "CREATE",
        entityType: "exchange_rate",
        entityId: rate.id,
        details: { baseCurrency: rate.baseCurrency, targetCurrency: rate.targetCurrency, rate: rate.rate }
      });

      return res.status(201).json(rate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      console.error("Error creating exchange rate:", error);
      return res.status(500).json({ error: "Failed to create exchange rate" });
    }
  },

  getCashFlowReport: async (req: Request, res: Response) => {
    try {
      // Get transactions for cash flow calculation
      const transactions = await storage.getTransactions();

      // In a real app, you would filter by date range from query params
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 6));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      // Filter transactions by date
      const filteredTransactions = transactions.filter(tx =>
        tx.date >= startDate && tx.date <= endDate
      );

      // Calculate cash inflows and outflows
      let inflows = 0;
      let outflows = 0;

      filteredTransactions.forEach(tx => {
        if (tx.type === "income") {
          inflows += Number(tx.amount);
        } else if (tx.type === "expense") {
          outflows += Number(tx.amount);
        }
      });

      // Calculate net cash flow
      const netCashFlow = inflows - outflows;

      // Generate monthly data
      const monthlyData = [
        { month: "Jan", inflow: 95000, outflow: 62000 },
        { month: "Feb", inflow: 105000, outflow: 58000 },
        { month: "Mar", inflow: 110000, outflow: 72000 },
        { month: "Apr", inflow: 118000, outflow: 68000 },
        { month: "May", inflow: 122000, outflow: 75000 },
        { month: "Jun", inflow: 130000, outflow: 80000 }
      ];

      // Return report data
      return res.status(200).json({
        title: "Cash Flow Report",
        subtitle: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        summary: [
          { label: "Total Inflows", value: inflows },
          { label: "Total Outflows", value: outflows },
          { label: "Net Cash Flow", value: netCashFlow }
        ],
        data: monthlyData
      });
    } catch (error) {
      console.error("Error generating cash flow report:", error);
      return res.status(500).json({ error: "Failed to generate cash flow report" });
    }
  },

  getIncomeStatementReport: async (req: Request, res: Response) => {
    try {
      // Get revenue and expense accounts
      const revenueAccount = await storage.getAccountByName("Revenue");
      const expensesAccount = await storage.getAccountByName("Expenses");

      // Calculate net income
      const revenue = Number(revenueAccount?.balance || 0);
      const expenses = Number(expensesAccount?.balance || 0);
      const netIncome = revenue - expenses;

      // Generate category breakdown
      const revenueBreakdown = [
        { category: "Services Revenue", amount: revenue * 0.65 },
        { category: "Product Sales", amount: revenue * 0.35 }
      ];

      const expenseBreakdown = [
        { category: "Materials", amount: expenses * 0.45 },
        { category: "Labor", amount: expenses * 0.3 },
        { category: "Equipment", amount: expenses * 0.15 },
        { category: "Other", amount: expenses * 0.1 }
      ];

      // Return report data
      return res.status(200).json({
        title: "Income Statement",
        subtitle: "Current Fiscal Year",
        summary: [
          { label: "Total Revenue", value: revenue },
          { label: "Total Expenses", value: expenses },
          { label: "Net Income", value: netIncome }
        ],
        data: {
          revenueBreakdown,
          expenseBreakdown
        }
      });
    } catch (error) {
      console.error("Error generating income statement:", error);
      return res.status(500).json({ error: "Failed to generate income statement" });
    }
  },

  getBalanceSheetReport: async (req: Request, res: Response) => {
    try {
      // Get all accounts
      const accounts = await storage.getAccounts();

      // Calculate assets, liabilities, and equity
      let totalAssets = 0;
      let totalLiabilities = 0;
      let totalEquity = 0;

      accounts.forEach(account => {
        const balance = Number(account.balance);

        if (account.type === "asset") {
          totalAssets += balance;
        } else if (account.type === "liability") {
          totalLiabilities += balance;
        } else if (account.type === "equity") {
          totalEquity += balance;
        }
      });

      // Generate account breakdown
      const assetAccounts = accounts
        .filter(account => account.type === "asset")
        .map(account => ({
          name: account.name,
          balance: Number(account.balance)
        }));

      const liabilityAccounts = accounts
        .filter(account => account.type === "liability")
        .map(account => ({
          name: account.name,
          balance: Number(account.balance)
        }));

      const equityAccounts = accounts
        .filter(account => account.type === "equity")
        .map(account => ({
          name: account.name,
          balance: Number(account.balance)
        }));

      // Return report data
      return res.status(200).json({
        title: "Balance Sheet",
        subtitle: "As of " + new Date().toLocaleDateString(),
        summary: [
          { label: "Total Assets", value: totalAssets },
          { label: "Total Liabilities", value: totalLiabilities },
          { label: "Total Equity", value: totalEquity }
        ],
        data: {
          assetAccounts,
          liabilityAccounts,
          equityAccounts
        }
      });
    } catch (error) {
      console.error("Error generating balance sheet:", error);
      return res.status(500).json({ error: "Failed to generate balance sheet" });
    }
  },

  getAuditLogs: async (req: Request, res: Response) => {
    try {
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId ? parseInt(req.query.entityId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const logs = await storage.getAuditLogs(entityType, entityId, limit);

      return res.status(200).json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  }
};
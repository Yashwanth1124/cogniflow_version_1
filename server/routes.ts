import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authController } from "./controllers/auth.controller";
import { financeController } from "./controllers/finance.controller";
import { authenticateJWT, authorizeRoles } from "./middleware/auth.middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Cogniflow ERP API is running" });
  });

  // Auth routes
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/user", authenticateJWT, authController.getCurrentUser);

  // Dashboard routes
  app.get("/api/dashboard/kpis", authenticateJWT, financeController.getFinancialKpis);
  app.get("/api/dashboard/chart/revenue", authenticateJWT, financeController.getRevenueChartData);
  app.get("/api/dashboard/chart/expenses", authenticateJWT, financeController.getExpenseCategoriesChartData);
  app.get("/api/dashboard/ai-insights", authenticateJWT, financeController.getAiInsights);
  app.put("/api/dashboard/ai-insights/:id/read", authenticateJWT, financeController.markAiInsightAsRead);

  // Transaction routes
  app.get("/api/transactions", authenticateJWT, financeController.getTransactions);
  app.get("/api/transactions/:id", authenticateJWT, financeController.getTransactionById);
  app.post("/api/transactions", authenticateJWT, authorizeRoles(["admin", "accountant"]), financeController.createTransaction);
  app.put("/api/transactions/:id", authenticateJWT, authorizeRoles(["admin", "accountant"]), financeController.updateTransaction);

  // Invoice routes
  app.get("/api/invoices", authenticateJWT, financeController.getInvoices);
  app.get("/api/invoices/:id", authenticateJWT, financeController.getInvoiceById);
  app.post("/api/invoices", authenticateJWT, authorizeRoles(["admin", "accountant"]), financeController.createInvoice);
  app.put("/api/invoices/:id", authenticateJWT, authorizeRoles(["admin", "accountant"]), financeController.updateInvoice);

  // General Ledger routes
  app.get("/api/ledger", authenticateJWT, financeController.getLedgerEntries);
  app.get("/api/ledger/:id", authenticateJWT, financeController.getLedgerEntryById);
  app.post("/api/ledger", authenticateJWT, authorizeRoles(["admin", "accountant"]), financeController.createLedgerEntry);

  // Account routes
  app.get("/api/accounts", authenticateJWT, financeController.getAccounts);
  app.get("/api/accounts/:id", authenticateJWT, financeController.getAccountById);
  app.post("/api/accounts", authenticateJWT, authorizeRoles(["admin"]), financeController.createAccount);
  app.put("/api/accounts/:id", authenticateJWT, authorizeRoles(["admin", "accountant"]), financeController.updateAccount);

  // Currency/Exchange rate routes
  app.get("/api/exchange-rates", authenticateJWT, financeController.getExchangeRates);
  app.post("/api/exchange-rates", authenticateJWT, authorizeRoles(["admin", "accountant"]), financeController.createExchangeRate);

  // Reports routes
  app.get("/api/reports/cash-flow", authenticateJWT, financeController.getCashFlowReport);
  app.get("/api/reports/income-statement", authenticateJWT, financeController.getIncomeStatementReport);
  app.get("/api/reports/balance-sheet", authenticateJWT, financeController.getBalanceSheetReport);

  // Audit log routes
  app.get("/api/audit-logs", authenticateJWT, authorizeRoles(["admin"]), financeController.getAuditLogs);

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: {
        message: err.message || "An unexpected error occurred",
        status: err.status || 500
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

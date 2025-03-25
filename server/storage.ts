import { 
  User, InsertUser, 
  Transaction, InsertTransaction,
  Invoice, InsertInvoice,
  LedgerEntry, InsertLedgerEntry,
  Account, InsertAccount,
  ExchangeRate, InsertExchangeRate,
  AuditLog, InsertAuditLog,
  AiInsight, InsertAiInsight
} from "@shared/schema";

// Storage interface for all database operations
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByNumber(number: string): Promise<Transaction | undefined>;
  getTransactions(limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;

  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(number: string): Promise<Invoice | undefined>;
  getInvoices(type?: string, status?: string, limit?: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined>;

  // Ledger entries
  getLedgerEntry(id: number): Promise<LedgerEntry | undefined>;
  getLedgerEntries(accountName?: string, limit?: number): Promise<LedgerEntry[]>;
  createLedgerEntry(entry: InsertLedgerEntry): Promise<LedgerEntry>;

  // Accounts
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByName(name: string): Promise<Account | undefined>;
  getAccounts(type?: string): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<Account>): Promise<Account | undefined>;

  // Exchange rates
  getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined>;
  createExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;

  // Audit logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entityType?: string, entityId?: number, limit?: number): Promise<AuditLog[]>;

  // AI insights
  getAiInsight(id: number): Promise<AiInsight | undefined>;
  getAiInsights(type?: string, isRead?: boolean, limit?: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  updateAiInsight(id: number, insight: Partial<AiInsight>): Promise<AiInsight | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private invoices: Map<number, Invoice>;
  private ledgerEntries: Map<number, LedgerEntry>;
  private accounts: Map<number, Account>;
  private exchangeRates: Map<string, ExchangeRate>;
  private auditLogs: Map<number, AuditLog>;
  private aiInsights: Map<number, AiInsight>;

  private userIdCounter: number;
  private transactionIdCounter: number;
  private invoiceIdCounter: number;
  private ledgerEntryIdCounter: number;
  private accountIdCounter: number;
  private exchangeRateIdCounter: number;
  private auditLogIdCounter: number;
  private aiInsightIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.invoices = new Map();
    this.ledgerEntries = new Map();
    this.accounts = new Map();
    this.exchangeRates = new Map();
    this.auditLogs = new Map();
    this.aiInsights = new Map();

    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.invoiceIdCounter = 1;
    this.ledgerEntryIdCounter = 1;
    this.accountIdCounter = 1;
    this.exchangeRateIdCounter = 1;
    this.auditLogIdCounter = 1;
    this.aiInsightIdCounter = 1;

    // Initialize with demo data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByNumber(number: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.transactionNumber === number,
    );
  }

  async getTransactions(limit?: number): Promise<Transaction[]> {
    const txs = Array.from(this.transactions.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return limit ? txs.slice(0, limit) : txs;
  }

  async createTransaction(insertTx: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const createdAt = new Date();
    const transaction: Transaction = { ...insertTx, id, createdAt };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, txData: Partial<Transaction>): Promise<Transaction | undefined> {
    const tx = await this.getTransaction(id);
    if (!tx) return undefined;

    const updatedTx = { ...tx, ...txData };
    this.transactions.set(id, updatedTx);
    return updatedTx;
  }

  // Invoice methods
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoiceByNumber(number: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (invoice) => invoice.invoiceNumber === number,
    );
  }

  async getInvoices(type?: string, status?: string, limit?: number): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values())
      .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());

    if (type) {
      invoices = invoices.filter(invoice => invoice.type === type);
    }

    if (status) {
      invoices = invoices.filter(invoice => invoice.status === status);
    }

    return limit ? invoices.slice(0, limit) : invoices;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const createdAt = new Date();
    const invoice: Invoice = { ...insertInvoice, id, createdAt };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = await this.getInvoice(id);
    if (!invoice) return undefined;

    const updatedInvoice = { ...invoice, ...invoiceData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  // Ledger entry methods
  async getLedgerEntry(id: number): Promise<LedgerEntry | undefined> {
    return this.ledgerEntries.get(id);
  }

  async getLedgerEntries(accountName?: string, limit?: number): Promise<LedgerEntry[]> {
    let entries = Array.from(this.ledgerEntries.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (accountName) {
      entries = entries.filter(entry => entry.accountName === accountName);
    }

    return limit ? entries.slice(0, limit) : entries;
  }

  async createLedgerEntry(insertEntry: InsertLedgerEntry): Promise<LedgerEntry> {
    const id = this.ledgerEntryIdCounter++;
    const createdAt = new Date();
    const entry: LedgerEntry = { ...insertEntry, id, createdAt };
    this.ledgerEntries.set(id, entry);
    return entry;
  }

  // Account methods
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async getAccountByName(name: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.name === name,
    );
  }

  async getAccounts(type?: string): Promise<Account[]> {
    let accounts = Array.from(this.accounts.values())
      .sort((a, b) => a.name.localeCompare(b.name));

    if (type) {
      accounts = accounts.filter(account => account.type === type);
    }

    return accounts;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.accountIdCounter++;
    const createdAt = new Date();
    const account: Account = { ...insertAccount, id, createdAt };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, accountData: Partial<Account>): Promise<Account | undefined> {
    const account = await this.getAccount(id);
    if (!account) return undefined;

    const updatedAccount = { ...account, ...accountData };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  // Exchange rate methods
  async getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined> {
    const key = `${baseCurrency}-${targetCurrency}`;
    return this.exchangeRates.get(key);
  }

  async createExchangeRate(insertRate: InsertExchangeRate): Promise<ExchangeRate> {
    const id = this.exchangeRateIdCounter++;
    const createdAt = new Date();
    const rate: ExchangeRate = { ...insertRate, id, createdAt };

    const key = `${rate.baseCurrency}-${rate.targetCurrency}`;
    this.exchangeRates.set(key, rate);
    return rate;
  }

  // Audit log methods
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = this.auditLogIdCounter++;
    const createdAt = new Date();
    const log: AuditLog = { ...insertLog, id, createdAt };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(entityType?: string, entityId?: number, limit?: number): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (entityType) {
      logs = logs.filter(log => log.entityType === entityType);
    }

    if (entityId) {
      logs = logs.filter(log => log.entityId === entityId);
    }

    return limit ? logs.slice(0, limit) : logs;
  }

  // AI insight methods
  async getAiInsight(id: number): Promise<AiInsight | undefined> {
    return this.aiInsights.get(id);
  }

  async getAiInsights(type?: string, isRead?: boolean, limit?: number): Promise<AiInsight[]> {
    let insights = Array.from(this.aiInsights.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (type) {
      insights = insights.filter(insight => insight.type === type);
    }

    if (isRead !== undefined) {
      insights = insights.filter(insight => insight.isRead === isRead);
    }

    return limit ? insights.slice(0, limit) : insights;
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.aiInsightIdCounter++;
    const createdAt = new Date();
    const isRead = false;
    const insight: AiInsight = { ...insertInsight, id, createdAt, isRead };
    this.aiInsights.set(id, insight);
    return insight;
  }

  async updateAiInsight(id: number, insightData: Partial<AiInsight>): Promise<AiInsight | undefined> {
    const insight = await this.getAiInsight(id);
    if (!insight) return undefined;

    const updatedInsight = { ...insight, ...insightData };
    this.aiInsights.set(id, updatedInsight);
    return updatedInsight;
  }

  // Initialize demo data
  private initializeData() {
    // Create demo admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$CqZ.IzuNGjmCN1xfMzVeUOXTpZQQTXmK5Z7XHv0Z8Qv4p6RKWMgxa", // "password123"
      email: "admin@cogniflow.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });

    // Create demo accountant user
    this.createUser({
      username: "accountant",
      password: "$2b$10$CqZ.IzuNGjmCN1xfMzVeUOXTpZQQTXmK5Z7XHv0Z8Qv4p6RKWMgxa", // "password123"
      email: "accountant@cogniflow.com",
      firstName: "John",
      lastName: "Doe",
      role: "accountant"
    });

    // Create demo manager user
    this.createUser({
      username: "manager",
      password: "$2b$10$CqZ.IzuNGjmCN1xfMzVeUOXTpZQQTXmK5Z7XHv0Z8Qv4p6RKWMgxa", // "password123"
      email: "manager@cogniflow.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "manager"
    });

    // Create demo accounts
    this.createAccount({
      name: "Cash",
      type: "asset",
      balance: 247928,
      currency: "USD",
      isActive: true
    });

    this.createAccount({
      name: "Accounts Receivable",
      type: "asset",
      balance: 78430,
      currency: "USD",
      isActive: true
    });

    this.createAccount({
      name: "Revenue",
      type: "revenue",
      balance: 1437890,
      currency: "USD",
      isActive: true
    });

    this.createAccount({
      name: "Expenses",
      type: "expense",
      balance: 532670,
      currency: "USD",
      isActive: true
    });

    // Create demo transactions
    const now = new Date();

    this.createTransaction({
      transactionNumber: "INV-2023-078",
      description: "Invoice Payment",
      amount: 12450,
      currency: "USD",
      type: "income",
      category: "Accounts Receivable",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      status: "completed",
      createdBy: 2 // accountant
    });

    this.createTransaction({
      transactionNumber: "PO-2023-142",
      description: "Supplier Payment",
      amount: 8750,
      currency: "USD",
      type: "expense",
      category: "Accounts Payable",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      status: "completed",
      createdBy: 2 // accountant
    });

    this.createTransaction({
      transactionNumber: "PR-2023-06",
      description: "Payroll",
      amount: 42380,
      currency: "USD",
      type: "expense",
      category: "Salaries & Wages",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8),
      status: "completed",
      createdBy: 2 // accountant
    });

    this.createTransaction({
      transactionNumber: "TX-2023-Q2",
      description: "Tax Payment",
      amount: 18940,
      currency: "USD",
      type: "expense",
      category: "Taxes & Duties",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
      status: "pending",
      createdBy: 2 // accountant
    });

    this.createTransaction({
      transactionNumber: "INV-2023-077",
      description: "Invoice Payment",
      amount: 24780,
      currency: "USD",
      type: "income",
      category: "Accounts Receivable",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12),
      status: "completed",
      createdBy: 2 // accountant
    });

    // Create demo invoices
    this.createInvoice({
      invoiceNumber: "INV-2023-078",
      clientName: "ABC Construction",
      amount: 12450,
      currency: "USD",
      issueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15),
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
      status: "paid",
      type: "accounts_receivable",
      notes: "Project phase 1 completion",
      createdBy: 2 // accountant
    });

    this.createInvoice({
      invoiceNumber: "INV-2023-077",
      clientName: "XYZ Development",
      amount: 24780,
      currency: "USD",
      issueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 18),
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12),
      status: "paid",
      type: "accounts_receivable",
      notes: "Consulting services",
      createdBy: 2 // accountant
    });

    this.createInvoice({
      invoiceNumber: "PO-2023-142",
      clientName: "Building Supplies Inc.",
      amount: 8750,
      currency: "USD",
      issueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20),
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      status: "paid",
      type: "accounts_payable",
      notes: "Monthly material supplies",
      createdBy: 2 // accountant
    });

    // Create demo AI insights
    this.createAiInsight({
      type: "anomaly",
      title: "Unusual Transaction Activity",
      description: "Detected 3 unusual transactions in the last 30 days that may require review.",
      severity: "warning",
      data: { transactions: [4, 5, 6] }
    });

    this.createAiInsight({
      type: "prediction",
      title: "Cash Flow Prediction",
      description: "Based on current trends, projected cash flow for next quarter is estimated at $320K, +8% YoY.",
      severity: "info",
      data: { prediction: 320000, change: 8 }
    });

    this.createAiInsight({
      type: "recommendation",
      title: "Budget Optimization",
      description: "AI analysis suggests potential 12% savings in equipment costs by adjusting procurement strategies.",
      severity: "info",
      data: { potentialSavings: 64000, category: "equipment" }
    });

    this.createAiInsight({
      type: "optimization",
      title: "Tax Optimization",
      description: "Identified potential tax deductions worth $42K for Q2 based on current financial activity.",
      severity: "info",
      data: { potentialDeductions: 42000, quarter: "Q2" }
    });

    // Add example projects and inventory data
    const projects = [
      {
        id: 1,
        name: "Commercial Complex Development",
        status: "In Progress",
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        budget: 2500000,
        progress: 35
      },
      {
        id: 2,
        name: "Residential Tower Construction",
        status: "Planning",
        startDate: "2024-03-01",
        endDate: "2025-06-30",
        budget: 1800000,
        progress: 15
      }
    ];
    const inventory = [
      {
        id: 1,
        name: "Cement",
        quantity: 500,
        unit: "bags",
        reorderPoint: 100,
        location: "Warehouse A"
      },
      {
        id: 2,
        name: "Steel Bars",
        quantity: 1000,
        unit: "pieces",
        reorderPoint: 200,
        location: "Warehouse B"
      }
    ];

    //  Add placeholder for now.  Requires schema definitions to properly integrate.
    console.log("Projects:", projects);
    console.log("Inventory:", inventory);

  }
}

export const storage = new MemStorage();
import { Transaction, Invoice, LedgerEntry } from "@shared/schema";
import { storage } from "../storage";

export const aiService = {
  // Detect anomalies in transactions
  detectAnomalies: async (transactions: Transaction[]): Promise<void> => {
    try {
      // This is a simplified implementation for demo purposes
      // In a real AI system, this would use more sophisticated algorithms
      
      // Get all past transactions for comparison
      const pastTransactions = await storage.getTransactions();
      
      // Iterate over new transactions and check for anomalies
      for (const transaction of transactions) {
        let isAnomaly = false;
        let reason = "";
        
        // 1. Check for unusually large amounts
        const avgAmount = pastTransactions.reduce((sum, tx) => 
          sum + Number(tx.amount), 0) / pastTransactions.length;
          
        if (Number(transaction.amount) > avgAmount * 3) {
          isAnomaly = true;
          reason = "Transaction amount is significantly higher than average";
        }
        
        // 2. Check for unusual transaction categories
        const categories = new Set(pastTransactions.map(tx => tx.category));
        if (!categories.has(transaction.category)) {
          isAnomaly = true;
          reason = "Transaction category is new and has not been used before";
        }
        
        // 3. Check for duplicate transactions (same amount, category, and close date)
        const potentialDuplicates = pastTransactions.filter(tx => 
          tx.transactionNumber !== transaction.transactionNumber &&
          tx.amount === transaction.amount &&
          tx.category === transaction.category &&
          Math.abs(tx.date.getTime() - transaction.date.getTime()) < 86400000 // within 24 hours
        );
        
        if (potentialDuplicates.length > 0) {
          isAnomaly = true;
          reason = "Potential duplicate transaction detected";
        }
        
        // If anomaly detected, create AI insight
        if (isAnomaly) {
          await storage.createAiInsight({
            type: "anomaly",
            title: "Unusual Transaction Detected",
            description: `Transaction ${transaction.transactionNumber} may require review. ${reason}.`,
            severity: "warning",
            data: { transactionId: transaction.id, reason }
          });
        }
      }
    } catch (error) {
      console.error("Error in anomaly detection:", error);
    }
  },
  
  // Generate cash flow predictions
  generateCashFlowPrediction: async (): Promise<void> => {
    try {
      // This is a simplified implementation for demo purposes
      // In a real AI system, this would use more sophisticated forecasting models
      
      // Get historical transactions
      const transactions = await storage.getTransactions();
      
      // Calculate income and expenses for the past 6 months
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      
      const recentTransactions = transactions.filter(tx => tx.date >= sixMonthsAgo);
      
      let totalIncome = 0;
      let totalExpenses = 0;
      
      recentTransactions.forEach(tx => {
        if (tx.type === "income") {
          totalIncome += Number(tx.amount);
        } else if (tx.type === "expense") {
          totalExpenses += Number(tx.amount);
        }
      });
      
      // Simple prediction: average monthly income and expenses projected forward
      const monthCount = 6;
      const avgMonthlyIncome = totalIncome / monthCount;
      const avgMonthlyExpenses = totalExpenses / monthCount;
      
      // Predict next quarter cash flow (3 months)
      const predictedQuarterlyCashFlow = (avgMonthlyIncome - avgMonthlyExpenses) * 3;
      
      // Compare with same quarter last year (simplified example)
      const lastYearQuarterlyCashFlow = predictedQuarterlyCashFlow * 0.92; // Assuming 8% growth
      const percentChange = ((predictedQuarterlyCashFlow - lastYearQuarterlyCashFlow) / lastYearQuarterlyCashFlow) * 100;
      
      // Create AI insight with prediction
      await storage.createAiInsight({
        type: "prediction",
        title: "Cash Flow Prediction",
        description: `Based on current trends, projected cash flow for next quarter is estimated at $${Math.round(predictedQuarterlyCashFlow / 1000)}K, ${percentChange.toFixed(1)}% YoY.`,
        severity: "info",
        data: { 
          predictedCashFlow: predictedQuarterlyCashFlow, 
          percentChange: percentChange 
        }
      });
    } catch (error) {
      console.error("Error in cash flow prediction:", error);
    }
  },
  
  // Identify cost-saving opportunities
  identifyCostSavingOpportunities: async (): Promise<void> => {
    try {
      // This is a simplified implementation for demo purposes
      
      // Get all expense transactions
      const transactions = await storage.getTransactions();
      const expenses = transactions.filter(tx => tx.type === "expense");
      
      // Group by category
      const expensesByCategory: Record<string, number> = {};
      
      expenses.forEach(expense => {
        const category = expense.category;
        const amount = Number(expense.amount);
        
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        
        expensesByCategory[category] += amount;
      });
      
      // Find the category with highest expenses
      let highestCategory = "";
      let highestAmount = 0;
      
      for (const category in expensesByCategory) {
        if (expensesByCategory[category] > highestAmount) {
          highestCategory = category;
          highestAmount = expensesByCategory[category];
        }
      }
      
      // Simulate finding opportunities in the highest spending category
      if (highestCategory && highestAmount > 0) {
        // For demo, assume we can save 12% in this category
        const savingsRate = 0.12;
        const potentialSavings = highestAmount * savingsRate;
        
        await storage.createAiInsight({
          type: "recommendation",
          title: "Budget Optimization",
          description: `AI analysis suggests potential ${(savingsRate * 100).toFixed(0)}% savings in ${highestCategory.toLowerCase()} costs by adjusting procurement strategies.`,
          severity: "info",
          data: { 
            category: highestCategory, 
            currentSpend: highestAmount,
            potentialSavings: potentialSavings 
          }
        });
      }
    } catch (error) {
      console.error("Error in cost saving analysis:", error);
    }
  },
  
  // Identify tax deduction opportunities
  identifyTaxDeductions: async (): Promise<void> => {
    try {
      // This is a simplified implementation for demo purposes
      
      // Get all expense transactions for the current quarter
      const transactions = await storage.getTransactions();
      
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
      const currentYear = now.getFullYear();
      
      const quarterStartMonth = (currentQuarter - 1) * 3;
      const quarterStart = new Date(currentYear, quarterStartMonth, 1);
      const quarterEnd = new Date(currentYear, quarterStartMonth + 3, 0);
      
      const quarterExpenses = transactions.filter(tx => 
        tx.type === "expense" && 
        tx.date >= quarterStart && 
        tx.date <= quarterEnd
      );
      
      // Calculate total expenses for the quarter
      const totalQuarterExpenses = quarterExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount), 0
      );
      
      // Simplified tax deduction estimation
      // In a real app, this would involve complex tax rules
      const estimatedTaxRate = 0.25; // 25% tax rate
      const estimatedDeductions = totalQuarterExpenses * 0.3; // Assume 30% is deductible
      const taxSavings = estimatedDeductions * estimatedTaxRate;
      
      if (taxSavings > 0) {
        await storage.createAiInsight({
          type: "optimization",
          title: "Tax Optimization",
          description: `Identified potential tax deductions worth $${Math.round(taxSavings / 1000)}K for Q${currentQuarter} based on current financial activity.`,
          severity: "info",
          data: { 
            quarter: `Q${currentQuarter}`,
            year: currentYear,
            potentialDeductions: taxSavings
          }
        });
      }
    } catch (error) {
      console.error("Error in tax deduction analysis:", error);
    }
  },
  
  // Run all AI analysis tasks
  runAnalysis: async (): Promise<void> => {
    await aiService.generateCashFlowPrediction();
    await aiService.identifyCostSavingOpportunities();
    await aiService.identifyTaxDeductions();
  }
};

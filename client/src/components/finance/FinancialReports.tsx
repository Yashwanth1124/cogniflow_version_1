import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, FileText, BarChart2, LineChart, PieChart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useTheme } from "@/hooks/useTheme";

// Create a custom date picker component since we don't have one in the UI components
const CustomDatePicker = ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, "-")}>{label}</Label>
      <Input
        id={label.toLowerCase().replace(/\s/g, "-")}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

const FinancialReports = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("cash-flow");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { 
    useCashFlowReport, 
    useIncomeStatementReport, 
    useBalanceSheetReport 
  } = useFinance();

  const { 
    data: cashFlowData, 
    isLoading: cashFlowLoading, 
    error: cashFlowError
  } = useCashFlowReport(startDate, endDate);

  const { 
    data: incomeStatementData, 
    isLoading: incomeStatementLoading, 
    error: incomeStatementError 
  } = useIncomeStatementReport();

  const { 
    data: balanceSheetData, 
    isLoading: balanceSheetLoading, 
    error: balanceSheetError 
  } = useBalanceSheetReport();

  const isDarkMode = theme === "dark";

  // Chart colors
  const colors = {
    primary: isDarkMode ? "#3b82f6" : "#2563eb",
    secondary: isDarkMode ? "#8b5cf6" : "#7c3aed",
    success: isDarkMode ? "#10b981" : "#059669",
    warning: isDarkMode ? "#f59e0b" : "#d97706",
    danger: isDarkMode ? "#ef4444" : "#dc2626",
    text: isDarkMode ? "#e5e7eb" : "#374151",
    grid: isDarkMode ? "#374151" : "#e5e7eb"
  };

  // Pie chart colors
  const CHART_COLORS = [
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
    colors.danger
  ];

  const handleExportReport = () => {
    // In a real app, this would generate a PDF or Excel report
    console.log(`Exporting ${activeTab} report...`);
    alert(`Exporting ${activeTab} report - this would save a PDF or Excel file in a real application`);
  };

  // Render Cash Flow Report
  const renderCashFlowReport = () => {
    if (cashFlowLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (cashFlowError || !cashFlowData) {
      return (
        <div className="text-center text-red-500 p-6">
          <p>Failed to load cash flow report: {cashFlowError instanceof Error ? cashFlowError.message : "Unknown error"}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {cashFlowData.summary?.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono mt-2">
                  {formatCurrency(item.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Over Time</CardTitle>
            <CardDescription>
              {cashFlowData.subtitle || `${formatDate(startDate)} - ${formatDate(endDate)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={cashFlowData.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="month" tick={{ fill: colors.text }} />
                  <YAxis tick={{ fill: colors.text }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                      borderColor: colors.grid,
                      color: colors.text
                    }}
                  />
                  <Legend wrapperStyle={{ color: colors.text }} />
                  <Line
                    type="monotone"
                    dataKey="inflow"
                    name="Cash Inflow"
                    stroke={colors.success}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="outflow"
                    name="Cash Outflow"
                    stroke={colors.danger}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Income Statement Report
  const renderIncomeStatementReport = () => {
    if (incomeStatementLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (incomeStatementError || !incomeStatementData) {
      return (
        <div className="text-center text-red-500 p-6">
          <p>Failed to load income statement: {incomeStatementError instanceof Error ? incomeStatementError.message : "Unknown error"}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {incomeStatementData.summary?.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono mt-2">
                  {formatCurrency(item.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={incomeStatementData.data?.revenueBreakdown.map(item => ({
                        name: item.category,
                        value: item.amount
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {incomeStatementData.data?.revenueBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        borderColor: colors.grid,
                        color: colors.text
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={incomeStatementData.data?.expenseBreakdown.map(item => ({
                        name: item.category,
                        value: item.amount
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {incomeStatementData.data?.expenseBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        borderColor: colors.grid,
                        color: colors.text
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Render Balance Sheet Report
  const renderBalanceSheetReport = () => {
    if (balanceSheetLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (balanceSheetError || !balanceSheetData) {
      return (
        <div className="text-center text-red-500 p-6">
          <p>Failed to load balance sheet: {balanceSheetError instanceof Error ? balanceSheetError.message : "Unknown error"}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {balanceSheetData.summary?.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono mt-2">
                  {formatCurrency(item.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balanceSheetData.data?.assetAccounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{account.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-900 dark:text-gray-100">Total Assets</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono">
                    {formatCurrency(balanceSheetData.summary?.[0].value || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balanceSheetData.data?.liabilityAccounts.length ? (
                  balanceSheetData.data.liabilityAccounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{account.name}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    No liability accounts found
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-900 dark:text-gray-100">Total Liabilities</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono">
                    {formatCurrency(balanceSheetData.summary?.[1].value || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balanceSheetData.data?.equityAccounts.length ? (
                  balanceSheetData.data.equityAccounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{account.name}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    No equity accounts found
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-900 dark:text-gray-100">Total Equity</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono">
                    {formatCurrency(balanceSheetData.summary?.[2].value || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">Financial Reports</CardTitle>
              <CardDescription>
                Generate and analyze your financial reports
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={handleExportReport}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="cash-flow" className="flex items-center">
                <LineChart className="mr-2 h-4 w-4" />
                Cash Flow
              </TabsTrigger>
              <TabsTrigger value="income-statement" className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                Income Statement
              </TabsTrigger>
              <TabsTrigger value="balance-sheet" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Balance Sheet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cash-flow">
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <CustomDatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                />
                <CustomDatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
              {renderCashFlowReport()}
            </TabsContent>

            <TabsContent value="income-statement">
              {renderIncomeStatementReport()}
            </TabsContent>

            <TabsContent value="balance-sheet">
              {renderBalanceSheetReport()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;

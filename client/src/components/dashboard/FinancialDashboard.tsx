import { useState } from "react";
import KpiCard from "./KpiCard";
import ChartSection from "./ChartSection";
import AiInsights from "./AiInsights";
import TransactionsTable from "./TransactionsTable";
import { useFinance } from "@/hooks/useFinance";
import { DollarSign, FileText, BarChart2, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const FinancialDashboard = () => {
  const [timeRange, setTimeRange] = useState("7");
  const { useKpis, useRevenueChart, useExpenseCategoriesChart } = useFinance();
  
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useKpis();
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useRevenueChart();
  const { data: expenseData, isLoading: expenseLoading, error: expenseError } = useExpenseCategoriesChart();

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Financial Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back, get a quick overview of your financial metrics</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {kpisLoading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="flex items-center mt-4">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))
        ) : kpis ? (
          // Render actual KPI cards
          kpis.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              changeText={kpi.changeText}
              icon={
                kpi.title === "Cash Flow" ? (
                  <DollarSign className="w-6 h-6" />
                ) : kpi.title === "Outstanding Invoices" ? (
                  <FileText className="w-6 h-6" />
                ) : kpi.title === "Total Revenue" ? (
                  <BarChart2 className="w-6 h-6" />
                ) : (
                  <CreditCard className="w-6 h-6" />
                )
              }
              iconBgClass={kpi.iconBgClass}
              iconColorClass={kpi.iconColorClass}
            />
          ))
        ) : (
          // Error state
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow col-span-4">
            <div className="text-center text-red-500">
              <p>Failed to load KPI data: {kpisError instanceof Error ? kpisError.message : "Unknown error"}</p>
              <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Charts Section */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <ChartSection
          title="Revenue Overview"
          chartType="line"
          data={revenueData || { labels: [], datasets: [{ label: "Revenue", data: [] }] }}
          loading={revenueLoading}
          error={revenueError instanceof Error ? revenueError : null}
          height={300}
        />
        
        <ChartSection
          title="Expense Categories"
          chartType="pie"
          data={expenseData || { labels: [], datasets: [{ label: "Expenses", data: [] }] }}
          loading={expenseLoading}
          error={expenseError instanceof Error ? expenseError : null}
          height={300}
          periodOptions={["Monthly", "Yearly"]}
        />
      </div>
      
      {/* AI-Powered Insights Section */}
      <div className="mb-8">
        <AiInsights />
      </div>
      
      {/* Recent Transactions Table */}
      <div className="mb-8">
        <TransactionsTable limit={5} showViewAll={true} />
      </div>
    </div>
  );
};

export default FinancialDashboard;

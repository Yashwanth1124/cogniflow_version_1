import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartData } from "@shared/types";
import { useTheme } from "@/hooks/useTheme";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartSectionProps {
  title: string;
  chartType: "bar" | "line" | "pie";
  data: ChartData;
  loading?: boolean;
  error?: Error | null;
  height?: number;
  periodOptions?: string[];
}

const ChartSection = ({
  title,
  chartType,
  data,
  loading = false,
  error = null,
  height = 300,
  periodOptions = ["Monthly", "Quarterly", "Yearly"]
}: ChartSectionProps) => {
  const { theme } = useTheme();
  const [activePeriod, setActivePeriod] = useState(periodOptions[0]);
  
  const isDarkMode = theme === "dark";
  
  // Colors for the charts
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
  const COLORS = [
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
    colors.danger
  ];

  // Render loading state
  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="h-64 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="h-64 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <div className="text-center px-4">
              <p className="text-red-500 font-medium">Error loading chart data</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render appropriate chart based on type
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data.labels.map((label, i) => ({
                name: label,
                value: data.datasets[0].data[i]
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fill: colors.text }} />
              <YAxis tick={{ fill: colors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  borderColor: colors.grid,
                  color: colors.text
                }}
              />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Bar
                dataKey="value"
                fill={colors.primary}
                name={data.datasets[0].label}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data.labels.map((label, i) => ({
                name: label,
                value: data.datasets[0].data[i]
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fill: colors.text }} />
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
                dataKey="value"
                stroke={colors.primary}
                name={data.datasets[0].label}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data.labels.map((label, i) => ({
                  name: label,
                  value: data.datasets[0].data[i]
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.labels.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  borderColor: colors.grid,
                  color: colors.text
                }}
                formatter={(value, name) => [`${value}`, name]}
              />
              <Legend 
                wrapperStyle={{ color: colors.text }}
                formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex space-x-2">
          {periodOptions.map((period) => (
            <Button
              key={period}
              variant={activePeriod === period ? "default" : "ghost"}
              size="sm"
              className={cn(
                "px-3 py-1 text-xs font-medium",
                activePeriod === period
                  ? ""
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
              onClick={() => setActivePeriod(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
};

export default ChartSection;

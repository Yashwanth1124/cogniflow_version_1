import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/useFinance";
import { AlertTriangle, BarChart2, BrainCircuit, TrendingUp, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiInsightData } from "@shared/types";

const AiInsights = () => {
  const { useAiInsights, useMarkAiInsightAsRead } = useFinance();
  const { data: insights, isLoading, error } = useAiInsights();
  const markAsRead = useMarkAiInsightAsRead();

  const handleMarkAsRead = (insightId: number) => {
    markAsRead.mutate(insightId);
  };

  // Get icon based on insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "anomaly":
        return <AlertTriangle className="w-6 h-6" />;
      case "prediction":
        return <TrendingUp className="w-6 h-6" />;
      case "recommendation":
        return <BarChart2 className="w-6 h-6" />;
      case "optimization":
        return <FileSpreadsheet className="w-6 h-6" />;
      default:
        return <BrainCircuit className="w-6 h-6" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-purple-500" />
            AI-Powered Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6 h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !insights) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-purple-500" />
            AI-Powered Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-800 rounded-md p-2">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Error Loading Insights</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {error instanceof Error ? error.message : "Failed to load AI insights"}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 text-sm text-purple-600 dark:text-purple-400 font-medium p-0 h-auto"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <BrainCircuit className="w-5 h-5 mr-2 text-purple-500" />
          AI-Powered Financial Insights
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-lg border",
                insight.type === "anomaly"
                  ? "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800"
                  : insight.type === "prediction"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800"
                  : insight.type === "recommendation"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
              )}
            >
              <div className="flex items-start">
                <div
                  className={cn(
                    "flex-shrink-0 rounded-md p-2",
                    insight.type === "anomaly"
                      ? "bg-purple-100 dark:bg-purple-800"
                      : insight.type === "prediction"
                      ? "bg-green-100 dark:bg-green-800"
                      : insight.type === "recommendation"
                      ? "bg-blue-100 dark:bg-blue-800"
                      : "bg-amber-100 dark:bg-amber-800"
                  )}
                >
                  <div
                    className={cn(
                      insight.type === "anomaly"
                        ? "text-purple-600 dark:text-purple-300"
                        : insight.type === "prediction"
                        ? "text-green-600 dark:text-green-300"
                        : insight.type === "recommendation"
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-amber-600 dark:text-amber-300"
                    )}
                  >
                    {getInsightIcon(insight.type)}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{insight.description}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className={cn(
                      "mt-2 text-sm font-medium p-0 h-auto",
                      insight.type === "anomaly"
                        ? "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        : insight.type === "prediction"
                        ? "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                        : insight.type === "recommendation"
                        ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        : "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                    )}
                    onClick={() => handleMarkAsRead(idx)}
                  >
                    {insight.ctaText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiInsights;

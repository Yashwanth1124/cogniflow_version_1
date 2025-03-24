import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@shared/schema";
import { Calendar, CreditCard, FileText, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionsTableProps {
  limit?: number;
  showViewAll?: boolean;
}

const TransactionsTable = ({
  limit = 5,
  showViewAll = true
}: TransactionsTableProps) => {
  const { useTransactions } = useFinance();
  const { data: transactions, isLoading, error } = useTransactions(limit);
  const [currentPage, setCurrentPage] = useState(1);

  // Get transaction icon based on category
  const getTransactionIcon = (category: string, type: string) => {
    if (category.includes("Receivable")) {
      return (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        </div>
      );
    } else if (category.includes("Payable")) {
      return (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-red-600 dark:text-red-300" />
        </div>
      );
    } else if (category.includes("Taxes") || category.includes("Duties")) {
      return (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
          <FileText className="h-4 w-4 text-purple-600 dark:text-purple-300" />
        </div>
      );
    } else {
      return (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-300" />
        </div>
      );
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
            {status}
          </Badge>
        );
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</CardTitle>
          {showViewAll && (
            <Skeleton className="h-5 w-16" />
          )}
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(limit).fill(0).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  }

  // Error state
  if (error || !transactions) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Error Loading Transactions</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {error instanceof Error ? error.message : "Failed to load transaction data"}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate pagination
  const totalTransactions = transactions.length;
  const totalPages = Math.ceil(totalTransactions / limit);
  const pageStart = (currentPage - 1) * limit;
  const pageEnd = Math.min(pageStart + limit, totalTransactions);
  const currentTransactions = transactions.slice(pageStart, pageEnd);

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</CardTitle>
        {showViewAll && (
          <Button variant="link" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View all
          </Button>
        )}
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.category, transaction.type)}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.transactionNumber}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900 dark:text-white">{formatDate(transaction.date)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900 dark:text-white">{transaction.category}</div>
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(transaction.status)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  <Button variant="ghost" className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-2">
                    View
                  </Button>
                  <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                    Export
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{pageStart + 1}</span> to{" "}
              <span className="font-medium">{pageEnd}</span> of{" "}
              <span className="font-medium">{totalTransactions}</span> transactions
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TransactionsTable;

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertInvoiceSchema } from "@shared/schema";
import { formatCurrency, formatDate, generateTransactionNumber } from "@/lib/utils";
import { Loader2, PlusCircle, Filter, Download, Search, CheckCircle, AlertTriangle, FileText } from "lucide-react";

// Form schema with validation
const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(3, "Invoice number is required"),
  clientName: z.string().min(3, "Client name is required"),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, { message: "Amount must be a positive number" }),
  currency: z.string().min(1, "Currency is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const AccountsReceivable = () => {
  const { useInvoices, useCreateInvoice, useUpdateInvoice } = useFinance();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const itemsPerPage = 10;

  // Fetch invoices - accounts receivable type
  const { data: invoices, isLoading, error } = useInvoices("accounts_receivable", statusFilter);
  
  // Mutations for creating and updating invoices
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  // Filter invoices based on search query and active tab
  const filteredInvoices = invoices
    ? invoices.filter(invoice => {
        const matchesSearch = 
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === "all") return matchesSearch;
        if (activeTab === "pending") return matchesSearch && invoice.status === "pending";
        if (activeTab === "overdue") return matchesSearch && invoice.status === "overdue";
        if (activeTab === "paid") return matchesSearch && invoice.status === "paid";
        
        return matchesSearch;
      })
    : [];

  // Calculate pagination
  const totalInvoices = filteredInvoices.length;
  const totalPages = Math.ceil(totalInvoices / itemsPerPage);
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Initialize form
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: generateTransactionNumber("INV"),
      clientName: "",
      amount: "",
      currency: "USD",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      notes: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      await createInvoice.mutateAsync({
        invoiceNumber: values.invoiceNumber,
        clientName: values.clientName,
        amount: Number(values.amount),
        currency: values.currency,
        issueDate: new Date(values.issueDate),
        dueDate: new Date(values.dueDate),
        status: values.status as "pending" | "paid" | "overdue",
        type: "accounts_receivable",
        notes: values.notes,
        createdBy: 1, // This would come from auth context in a real implementation
      });

      setIsDialogOpen(false);
      form.reset({
        invoiceNumber: generateTransactionNumber("INV"),
        clientName: "",
        amount: "",
        currency: "USD",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pending",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  // Handle marking an invoice as paid
  const handleMarkAsPaid = async (id: number) => {
    try {
      await updateInvoice.mutateAsync({
        id,
        data: { status: "paid" }
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">
            Overdue
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Failed to load invoices: {error instanceof Error ? error.message : "Unknown error"}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">Accounts Receivable</CardTitle>
              <CardDescription>
                Manage all your client invoices and payments
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Create New Receivable Invoice</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new client invoice.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="invoiceNumber">Invoice Number</Label>
                          <Input
                            id="invoiceNumber"
                            {...form.register("invoiceNumber")}
                            readOnly
                          />
                          {form.formState.errors.invoiceNumber && (
                            <p className="text-sm text-red-500">{form.formState.errors.invoiceNumber.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientName">Client Name</Label>
                          <Input
                            id="clientName"
                            {...form.register("clientName")}
                            placeholder="Enter client name"
                          />
                          {form.formState.errors.clientName && (
                            <p className="text-sm text-red-500">{form.formState.errors.clientName.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            {...form.register("amount")}
                            placeholder="0.00"
                          />
                          {form.formState.errors.amount && (
                            <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select
                            value={form.watch("currency")}
                            onValueChange={(value) => form.setValue("currency", value)}
                          >
                            <SelectTrigger id="currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                            </SelectContent>
                          </Select>
                          {form.formState.errors.currency && (
                            <p className="text-sm text-red-500">{form.formState.errors.currency.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="issueDate">Issue Date</Label>
                          <Input
                            id="issueDate"
                            type="date"
                            {...form.register("issueDate")}
                          />
                          {form.formState.errors.issueDate && (
                            <p className="text-sm text-red-500">{form.formState.errors.issueDate.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            {...form.register("dueDate")}
                          />
                          {form.formState.errors.dueDate && (
                            <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={form.watch("status")}
                          onValueChange={(value) => form.setValue("status", value)}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.status && (
                          <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          {...form.register("notes")}
                          placeholder="Enter any notes (optional)"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createInvoice.isPending}>
                        {createInvoice.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Invoice"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Tabs className="mt-6" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                Pending <Badge variant="secondary" className="ml-1">{invoices?.filter(i => i.status === "pending").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex items-center gap-2">
                Overdue <Badge variant="secondary" className="ml-1">{invoices?.filter(i => i.status === "overdue").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or client"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || undefined)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        {invoice.status !== "paid" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mr-2"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            disabled={updateInvoice.isPending}
                          >
                            {updateInvoice.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="mr-1 h-4 w-4" /> Mark as Paid
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="mr-2" disabled>
                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" /> Paid
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <FileText className="mr-1 h-4 w-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalInvoices)}</span> of{" "}
              <span className="font-medium">{totalInvoices}</span> invoices
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={currentPage === pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationLink className="cursor-default">...</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AccountsReceivable;

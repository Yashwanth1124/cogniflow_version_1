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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertLedgerEntrySchema } from "@shared/schema";
import { formatCurrency, formatDate, generateTransactionNumber } from "@/lib/utils";
import { Loader2, PlusCircle, Filter, Download, Search } from "lucide-react";

// Form schema with validation
const ledgerEntryFormSchema = z.object({
  entryNumber: z.string().min(3, "Entry number is required"),
  description: z.string().min(3, "Description is required"),
  debit: z.string().refine(val => !isNaN(Number(val)), { message: "Debit must be a number" }),
  credit: z.string().refine(val => !isNaN(Number(val)), { message: "Credit must be a number" }),
  accountName: z.string().min(1, "Account is required"),
  date: z.string().min(1, "Date is required"),
  transactionId: z.number().nullable().optional(),
});

type LedgerEntryFormValues = z.infer<typeof ledgerEntryFormSchema>;

const GeneralLedger = () => {
  const { useLedgerEntries, useAccounts, useCreateLedgerEntry } = useFinance();
  const [currentPage, setCurrentPage] = useState(1);
  const [accountFilter, setAccountFilter] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  // Fetch ledger entries
  const { data: ledgerEntries, isLoading: entriesLoading, error: entriesError } = useLedgerEntries(accountFilter);
  
  // Fetch accounts for the form
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  
  // Mutation for creating a new ledger entry
  const createEntry = useCreateLedgerEntry();

  // Search and filter entries
  const filteredEntries = ledgerEntries
    ? ledgerEntries.filter(entry => 
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.accountName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Calculate pagination
  const totalEntries = filteredEntries.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Initialize form
  const form = useForm<LedgerEntryFormValues>({
    resolver: zodResolver(ledgerEntryFormSchema),
    defaultValues: {
      entryNumber: generateTransactionNumber("JE"),
      description: "",
      debit: "0",
      credit: "0",
      accountName: "",
      date: new Date().toISOString().split("T")[0],
      transactionId: null,
    },
  });

  // Handle form submission
  const onSubmit = async (values: LedgerEntryFormValues) => {
    try {
      await createEntry.mutateAsync({
        entryNumber: values.entryNumber,
        description: values.description,
        debit: Number(values.debit),
        credit: Number(values.credit),
        accountName: values.accountName,
        date: new Date(values.date),
        transactionId: values.transactionId || undefined,
        createdBy: 1, // This would come from auth context in a real implementation
      });

      setIsDialogOpen(false);
      form.reset({
        entryNumber: generateTransactionNumber("JE"),
        description: "",
        debit: "0",
        credit: "0",
        accountName: "",
        date: new Date().toISOString().split("T")[0],
        transactionId: null,
      });
    } catch (error) {
      console.error("Error creating ledger entry:", error);
    }
  };

  // Loading state
  if (entriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (entriesError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Failed to load ledger entries: {entriesError instanceof Error ? entriesError.message : "Unknown error"}</p>
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
              <CardTitle className="text-2xl">General Ledger</CardTitle>
              <CardDescription>
                View and manage all your general ledger entries
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Create New Ledger Entry</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new ledger entry.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entryNumber">Entry Number</Label>
                          <Input
                            id="entryNumber"
                            {...form.register("entryNumber")}
                            readOnly
                          />
                          {form.formState.errors.entryNumber && (
                            <p className="text-sm text-red-500">{form.formState.errors.entryNumber.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            {...form.register("date")}
                          />
                          {form.formState.errors.date && (
                            <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          {...form.register("description")}
                          placeholder="Enter description"
                        />
                        {form.formState.errors.description && (
                          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Account</Label>
                        <Controller
                          control={form.control}
                          name="accountName"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={accountsLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts?.map(account => (
                                  <SelectItem key={account.id} value={account.name}>
                                    {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {form.formState.errors.accountName && (
                          <p className="text-sm text-red-500">{form.formState.errors.accountName.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="debit">Debit</Label>
                          <Input
                            id="debit"
                            type="number"
                            step="0.01"
                            min="0"
                            {...form.register("debit")}
                          />
                          {form.formState.errors.debit && (
                            <p className="text-sm text-red-500">{form.formState.errors.debit.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="credit">Credit</Label>
                          <Input
                            id="credit"
                            type="number"
                            step="0.01"
                            min="0"
                            {...form.register("credit")}
                          />
                          {form.formState.errors.credit && (
                            <p className="text-sm text-red-500">{form.formState.errors.credit.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createEntry.isPending}>
                        {createEntry.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Entry"
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

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by description, entry number, or account"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={accountFilter || ""}
              onValueChange={(value) => setAccountFilter(value || undefined)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by account" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map(account => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No ledger entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.accountName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(entry.debit) > 0 ? formatCurrency(entry.debit) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(entry.credit) > 0 ? formatCurrency(entry.credit) : "—"}
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
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalEntries)}</span> of{" "}
              <span className="font-medium">{totalEntries}</span> entries
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

export default GeneralLedger;

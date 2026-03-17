import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Variant_expense_income,
  useDeleteTransaction,
  useTransactions,
} from "../hooks/useQueries";
import { AddTransactionDialog } from "./AddTransactionDialog";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function Transactions() {
  const { data: transactions, isLoading } = useTransactions();
  const { mutateAsync: deleteTransaction, isPending: isDeleting } =
    useDeleteTransaction();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
  );

  const availableMonths = useMemo(() => {
    if (!transactions) return [];
    const months = new Set<string>();
    for (const tx of transactions) {
      const [year, month] = tx.date.split("-");
      months.add(`${year}-${month}`);
    }
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter((tx) => tx.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth]);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const getMonthLabel = (value: string) => {
    const [year, month] = value.split("-");
    return `${MONTHS[Number.parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-700 text-foreground">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track every dollar in and out
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger
            data-ocid="transaction.month.select"
            className="w-44 bg-card border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {availableMonths.length === 0 ? (
              <SelectItem value={selectedMonth}>
                {getMonthLabel(selectedMonth)}
              </SelectItem>
            ) : (
              availableMonths.map((m) => (
                <SelectItem key={m} value={m}>
                  {getMonthLabel(m)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {filtered.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Transactions list */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="p-4 space-y-3"
              data-ocid="transaction.loading_state"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3"
              data-ocid="transaction.empty_state"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
              <p className="text-muted-foreground text-sm">
                No transactions for this month
              </p>
              <p className="text-xs text-muted-foreground">
                Add your first transaction to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tx, index) => (
                <div
                  key={String(tx.id)}
                  data-ocid={`transaction.item.${index + 1}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0"
                      style={{
                        background:
                          tx.transactionType === Variant_expense_income.income
                            ? "oklch(0.72 0.18 145 / 0.15)"
                            : "oklch(0.62 0.22 27 / 0.15)",
                        color:
                          tx.transactionType === Variant_expense_income.income
                            ? "oklch(0.72 0.18 145)"
                            : "oklch(0.62 0.22 27)",
                      }}
                    >
                      {tx.transactionType === Variant_expense_income.income
                        ? "↑"
                        : "↓"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0 border-border text-muted-foreground"
                        >
                          {tx.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-display text-base font-600"
                      style={{
                        color:
                          tx.transactionType === Variant_expense_income.income
                            ? "oklch(0.72 0.18 145)"
                            : "oklch(0.62 0.22 27)",
                      }}
                    >
                      {tx.transactionType === Variant_expense_income.income
                        ? "+"
                        : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`transaction.delete_button.${index + 1}`}
                      onClick={() => handleDelete(tx.id)}
                      disabled={isDeleting && deletingId === tx.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting && deletingId === tx.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

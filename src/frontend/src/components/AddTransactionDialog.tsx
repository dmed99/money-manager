import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CATEGORIES } from "../data/sampleData";
import { Variant_expense_income, useAddTransaction } from "../hooks/useQueries";

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [txType, setTxType] = useState<Variant_expense_income>(
    Variant_expense_income.expense,
  );
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { mutateAsync: addTransaction, isPending } = useAddTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description || !date) {
      toast.error("Please fill in all fields");
      return;
    }
    const numAmount = Number.parseFloat(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await addTransaction({
        type: txType,
        amount: numAmount,
        category,
        description,
        date,
      });
      toast.success("Transaction added successfully");
      setOpen(false);
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setTxType(Variant_expense_income.expense);
    } catch {
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          data-ocid="transaction.add_button"
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent
        data-ocid="add_transaction.dialog"
        className="bg-card border-border sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            New Transaction
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Type toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Type
            </Label>
            <ToggleGroup
              type="single"
              value={txType}
              onValueChange={(v) => v && setTxType(v as Variant_expense_income)}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem
                value={Variant_expense_income.expense}
                className="data-[state=on]:bg-expense/20 data-[state=on]:text-expense data-[state=on]:border-expense/40 border border-border"
                style={{}}
              >
                Expense
              </ToggleGroupItem>
              <ToggleGroupItem
                value={Variant_expense_income.income}
                className="data-[state=on]:bg-income/20 data-[state=on]:text-income data-[state=on]:border-income/40 border border-border"
              >
                Income
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label
              htmlFor="amount"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                data-ocid="add_transaction.input"
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-secondary border-border"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                data-ocid="add_transaction.select"
                className="bg-secondary border-border"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="desc"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Description
            </Label>
            <Input
              id="desc"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor="date"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="add_transaction.cancel_button"
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="add_transaction.submit_button"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Transaction"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

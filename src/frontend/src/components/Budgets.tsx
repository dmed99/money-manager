import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CATEGORIES } from "../data/sampleData";
import {
  useBudgets,
  useCategoryBreakdown,
  useUpdateBudget,
} from "../hooks/useQueries";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function Budgets() {
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: breakdown } = useCategoryBreakdown();
  const { mutateAsync: updateBudget } = useUpdateBudget();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  const budgetMap = useMemo(() => {
    const map = new Map<string, number>();
    if (budgets) {
      for (const [cat, amount] of budgets) map.set(cat, amount);
    }
    for (const cat of CATEGORIES) {
      if (!map.has(cat)) map.set(cat, 0);
    }
    return map;
  }, [budgets]);

  const spendingMap = useMemo(() => {
    const map = new Map<string, number>();
    if (breakdown) {
      for (const [cat, amount] of breakdown) map.set(cat, amount);
    }
    return map;
  }, [breakdown]);

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(String(budgetMap.get(category) ?? ""));
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  const saveEdit = async (category: string) => {
    const amount = Number.parseFloat(editValue);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setSavingCategory(category);
    try {
      await updateBudget({ category, amount });
      toast.success(`Budget updated for ${category}`);
      setEditingCategory(null);
    } catch {
      toast.error("Failed to update budget");
    } finally {
      setSavingCategory(null);
    }
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    if (budget === 0) return "no-budget";
    const ratio = spent / budget;
    if (ratio >= 1) return "over";
    if (ratio >= 0.8) return "warning";
    return "ok";
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-700 text-foreground">
          Budgets
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Set spending limits for each category
        </p>
      </div>

      {budgetsLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="budget.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map((category, index) => {
            const budget = budgetMap.get(category) ?? 0;
            const spent = spendingMap.get(category) ?? 0;
            const status = getBudgetStatus(spent, budget);
            const percentage =
              budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
            const isEditing = editingCategory === category;
            const isSaving = savingCategory === category;

            const progressColor =
              status === "over"
                ? "oklch(0.62 0.22 27)"
                : status === "warning"
                  ? "oklch(0.78 0.18 80)"
                  : "oklch(0.72 0.17 165)";

            return (
              <Card
                key={category}
                data-ocid={`budget.item.${index + 1}`}
                className="bg-card border-border"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-sm font-600">
                      {category}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {status === "over" && (
                        <Badge
                          className="text-xs"
                          style={{
                            background: "oklch(0.62 0.22 27 / 0.2)",
                            color: "oklch(0.62 0.22 27)",
                            border: "1px solid oklch(0.62 0.22 27 / 0.3)",
                          }}
                        >
                          Over budget
                        </Badge>
                      )}
                      {status === "warning" && (
                        <Badge
                          className="text-xs"
                          style={{
                            background: "oklch(0.78 0.18 80 / 0.2)",
                            color: "oklch(0.78 0.18 80)",
                            border: "1px solid oklch(0.78 0.18 80 / 0.3)",
                          }}
                        >
                          Nearly full
                        </Badge>
                      )}
                      {!isEditing ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          data-ocid={`budget.edit_button.${index + 1}`}
                          onClick={() => startEdit(category)}
                          className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-ocid={`budget.save_button.${index + 1}`}
                            onClick={() => saveEdit(category)}
                            disabled={isSaving}
                            className="w-7 h-7 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEdit}
                            className="w-7 h-7 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="10"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-secondary border-border h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(category);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span
                        className="font-display text-xl font-600"
                        style={{ color: progressColor }}
                      >
                        {formatCurrency(spent)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        of {budget > 0 ? formatCurrency(budget) : "no limit"}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.22 0.02 255)" }}
                    >
                      {budget > 0 && (
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            background: progressColor,
                          }}
                        />
                      )}
                    </div>
                    {budget > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(0)}% used
                        {status !== "over" &&
                          ` · ${formatCurrency(budget - spent)} remaining`}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

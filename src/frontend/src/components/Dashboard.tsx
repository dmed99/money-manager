import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Variant_expense_income } from "../backend";
import {
  useCategoryBreakdown,
  useSummary,
  useTransactions,
} from "../hooks/useQueries";

const CHART_COLORS = [
  "oklch(0.72 0.17 165)",
  "oklch(0.65 0.22 27)",
  "oklch(0.72 0.17 290)",
  "oklch(0.78 0.18 80)",
  "oklch(0.65 0.18 200)",
  "oklch(0.75 0.15 50)",
  "oklch(0.68 0.18 310)",
  "oklch(0.70 0.16 130)",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: breakdown, isLoading: breakdownLoading } =
    useCategoryBreakdown();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const recentTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const chartData = useMemo(() => {
    if (!breakdown) return [];
    return breakdown
      .filter(([, amount]) => amount > 0)
      .map(([name, value]) => ({ name, value }));
  }, [breakdown]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-700 text-foreground">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your financial snapshot at a glance
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          data-ocid="summary.balance.card"
          className="bg-card border-border relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p
                className={`font-display text-3xl font-700 glow-primary ${
                  (summary?.netBalance ?? 0) >= 0
                    ? "text-income"
                    : "text-expense"
                }`}
              >
                {formatCurrency(summary?.netBalance ?? 0)}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Total balance
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          data-ocid="summary.income.card"
          className="bg-card border-border relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "oklch(0.72 0.18 145 / 0.05)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p
                className="font-display text-3xl font-700"
                style={{ color: "oklch(0.72 0.18 145)" }}
              >
                {formatCurrency(summary?.totalIncome ?? 0)}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.72 0.18 145)" }}
              />
              <span className="text-xs text-muted-foreground">All income</span>
            </div>
          </CardContent>
        </Card>

        <Card
          data-ocid="summary.expenses.card"
          className="bg-card border-border relative overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0.62 0.22 27 / 0.05)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p
                className="font-display text-3xl font-700"
                style={{ color: "oklch(0.62 0.22 27)" }}
              >
                {formatCurrency(summary?.totalExpenses ?? 0)}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.62 0.22 27)" }}
              />
              <span className="text-xs text-muted-foreground">
                All expenses
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {breakdownLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : chartData.length === 0 ? (
              <div
                className="h-64 flex flex-col items-center justify-center gap-2"
                data-ocid="chart.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  No expense data yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add transactions to see breakdown
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.17 0.018 255)",
                      border: "1px solid oklch(0.25 0.02 255)",
                      borderRadius: "8px",
                      color: "oklch(0.93 0.01 255)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "oklch(0.55 0.015 255)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base">
              Recent Transactions
            </CardTitle>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 gap-2"
                data-ocid="recent.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  No transactions yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={String(tx.id)}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background:
                            tx.transactionType === Variant_expense_income.income
                              ? "oklch(0.72 0.18 145)"
                              : "oklch(0.62 0.22 27)",
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category} · {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-600"
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

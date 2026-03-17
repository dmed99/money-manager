import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Variant_expense_income } from "./backend";
import { AppSidebar } from "./components/AppSidebar";
import { Budgets } from "./components/Budgets";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { SAMPLE_BUDGETS, SAMPLE_TRANSACTIONS } from "./data/sampleData";
import { useActor } from "./hooks/useActor";

type View = "dashboard" | "transactions" | "budgets";

function SampleDataLoader({ onLoaded }: { onLoaded: () => void }) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);

  const loadSampleData = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      // Load transactions and budgets in parallel batches
      const txPromises = SAMPLE_TRANSACTIONS.map((tx) =>
        actor.addTransaction(
          tx.type,
          tx.amount,
          tx.category,
          tx.description,
          tx.date,
        ),
      );
      const budgetPromises = SAMPLE_BUDGETS.map(([cat, amount]) =>
        actor.updateBudget(cat, amount),
      );
      await Promise.all([...txPromises, ...budgetPromises]);
      toast.success("Sample data loaded!");
      onLoaded();
    } catch {
      toast.error("Failed to load sample data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-card border border-border rounded-xl p-4 shadow-glow max-w-xs">
        <p className="text-sm font-medium text-foreground mb-1">
          Start with sample data?
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Load realistic transactions to explore the app
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={loadSampleData}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
          >
            {loading ? "Loading..." : "Load Sample Data"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onLoaded}
            className="text-xs border-border"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSamplePrompt, setShowSamplePrompt] = useState(false);
  const [sampleChecked, setSampleChecked] = useState(false);
  const { actor, isFetching } = useActor();

  // Check if we should show sample data prompt
  useEffect(() => {
    if (!actor || isFetching || sampleChecked) return;
    setSampleChecked(true);
    actor
      .getTransactions()
      .then((txs) => {
        if (txs.length === 0) {
          setShowSamplePrompt(true);
        }
      })
      .catch(() => {});
  }, [actor, isFetching, sampleChecked]);

  const handleSampleLoaded = () => {
    setShowSamplePrompt(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <span className="font-display font-700 text-foreground">
              Ledger
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "transactions" && <Transactions />}
          {activeView === "budgets" && <Budgets />}
        </main>

        {/* Footer */}
        <footer className="hidden lg:block border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {showSamplePrompt && <SampleDataLoader onLoaded={handleSampleLoaded} />}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

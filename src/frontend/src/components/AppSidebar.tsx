import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Target,
  Wallet,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type View = "dashboard" | "transactions" | "budgets";

interface AppSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems: {
  id: View;
  label: string;
  icon: React.ElementType;
  ocid: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
    ocid: "nav.transactions.link",
  },
  { id: "budgets", label: "Budgets", icon: Target, ocid: "nav.budgets.link" },
];

export function AppSidebar({
  activeView,
  onViewChange,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();

  const isLoggedIn = !!identity;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onMobileClose}
          onKeyDown={(e) => e.key === "Enter" && onMobileClose()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 flex flex-col bg-sidebar border-r border-sidebar-border mesh-bg transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shadow-glow-sm">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-display font-700 text-sidebar-foreground text-base leading-tight">
              Ledger
            </p>
            <p className="text-xs text-muted-foreground">Money Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => {
                  onViewChange(item.id);
                  onMobileClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-glow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon
                  className={cn("w-4 h-4", isActive ? "text-primary" : "")}
                />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          {isLoggedIn ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground px-1 truncate">
                {identity.getPrincipal().toString().slice(0, 24)}...
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={clear}
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40"
              onClick={login}
              disabled={isLoggingIn}
            >
              <LogIn className="w-3.5 h-3.5 mr-2" />
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}

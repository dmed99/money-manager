import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Variant_expense_income } from "../backend";
import type { Transaction } from "../backend";
import { useActor } from "./useActor";

export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  }>({
    queryKey: ["summary"],
    queryFn: async () => {
      if (!actor) return { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
      return actor.getSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategoryBreakdown() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, number][]>({
    queryKey: ["categoryBreakdown"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategoryBreakdown();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBudgets() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, number][]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBudgets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      type: Variant_expense_income;
      amount: number;
      category: string;
      description: string;
      date: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addTransaction(
        data.type,
        data.amount,
        data.category,
        data.description,
        data.date,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["categoryBreakdown"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["categoryBreakdown"] });
    },
  });
}

export function useUpdateBudget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { category: string; amount: number }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateBudget(data.category, data.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export { Variant_expense_income };

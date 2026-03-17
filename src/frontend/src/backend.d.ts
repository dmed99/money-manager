import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    transactionType: Variant_expense_income;
    date: string;
    description: string;
    timestamp: Time;
    category: string;
    amount: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_expense_income {
    expense = "expense",
    income = "income"
}
export interface backendInterface {
    addTransaction(transactionType: Variant_expense_income, amount: number, category: string, description: string, date: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTransaction(transactionId: bigint): Promise<boolean>;
    getBudgets(): Promise<Array<[string, number]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryBreakdown(): Promise<Array<[string, number]>>;
    getSummary(): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netBalance: number;
    }>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBudget(category: string, amount: number): Promise<void>;
}

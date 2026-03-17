# Money Manager

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- Dashboard with summary cards: total balance, total income, total expenses
- Transaction list with date, category, description, and amount
- Add transaction form (income or expense, amount, category, description, date)
- Category breakdown chart (expenses by category)
- Budget tracking: set monthly budget per category, show progress
- Filter transactions by month/year
- Delete transactions

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store transactions (id, type, amount, category, description, date), budgets (category, monthly limit)
2. Backend APIs: addTransaction, getTransactions, deleteTransaction, setBudget, getBudgets
3. Frontend: Dashboard page with summary cards and category chart
4. Frontend: Transactions page with list, filters, and add/delete
5. Frontend: Budget page with category budget settings and progress bars
6. Authorization to keep data per user

# Lemon Business Billing App

## Current State
A full-stack lemon business billing app with customer management, transaction tracking, credit due payments, and multilingual support. The app uses Internet Identity for authentication and stores data on ICP backend.

## Requested Changes (Diff)

### Add
- Date picker input that is clearly visible, tappable, and interactive on both mobile and desktop in TransactionEntryForm

### Modify
- Performance improvement: The CustomerRow component currently fires 2 separate backend calls per customer (balance + transactions). Move balance and last-transaction-date fetching to a batch/optimized approach — load all customers once and avoid per-row heavy queries on the home page. Show only customer name and phone in the list; balance and last date can be fetched lazily or removed from the list to eliminate N+1 slowness.
- TransactionEntryForm date input: replace plain `<Input type="date">` with a more mobile-friendly date picker using a native date input styled prominently so users can tap and select any date easily on mobile

### Remove
- Per-row `useGetCustomerBalance` and `useGetTransactionsForCustomer` calls from `CustomerRow` in HomePage (they cause N+1 backend calls, making the home page slow)

## Implementation Plan
1. Refactor `CustomerRow` in `HomePage.tsx` to not call per-row balance/transaction queries — pass only customer data to `CustomerListItem`, remove the heavy per-row queries
2. Update `CustomerListItem` to work without balance/lastTransactionDate props, or accept them as optional
3. In `TransactionEntryForm.tsx`, make the date input more prominent and mobile-friendly — use a styled date input with clear label and ensure it renders as a tappable date picker on mobile
4. Verify no TypeScript errors and build succeeds

# Specification

## Summary
**Goal:** Allow decimal (floating-point) number inputs across transaction and customer forms, and update the backend to store and process decimal values.

**Planned changes:**
- Update `TransactionEntryForm` quantity, rate, and payment fields to accept decimal input (e.g., `step="any"`) and parse values as floats
- Update `AddCustomerModal` previous credit field to accept decimal input and submit as float
- Update `useTransactionCalculations` hook to use `parseFloat` instead of `parseInt` for all numeric computations
- Update backend Motoko actor to use `Float` instead of `Int`/`Nat` for quantity, rate, payment, and credit balance fields, ensuring all calculations use float arithmetic

**User-visible outcome:** Users can enter decimal values (e.g., 1.5, 10.25, 250.75) in quantity, rate, payment, and previous credit fields, and all computed totals and balances correctly reflect decimal precision.

# Specification

## Summary
**Goal:** Fix the "Add Customer" functionality on the Home tab so that submitting the form correctly creates a new customer and updates the UI.

**Planned changes:**
- Fix the AddCustomerModal form submission to properly call the backend and create a new customer.
- Update the customer list on the Home tab to reflect the newly added customer without a page reload.
- Show a success toast notification after a customer is successfully added.
- Show an error toast if the backend call fails, keeping the modal open with entered data.
- Ensure the customer count in the SummaryBanner increments after a new customer is added.

**User-visible outcome:** Users can add a new customer from the Home tab, see them appear in the customer list immediately, and receive a success or error notification based on the outcome.

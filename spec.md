# Specification

## Summary
**Goal:** Fix the broken Add Customer functionality on the Home Page so that submitting the form successfully creates a new customer and updates the customer list.

**Planned changes:**
- Fix the `AddCustomerModal` to correctly call the backend `addCustomer` mutation on form submission
- Ensure the actor is ready before allowing submission, showing a loading/error state if not
- Handle both online (direct call) and offline (queued) submission paths
- Clear form state and close the modal after successful submission
- Add form validation to prevent submission with empty required fields and display appropriate error messages

**User-visible outcome:** Users can open the Add Customer modal, fill in the name, phone, and previous credit fields, and successfully add a new customer that immediately appears in the customer list on the Home Page.

import CreditPaymentListItem from "@/components/CreditPaymentListItem";
import CustomerDashboard from "@/components/CustomerDashboard";
import TransactionEntryForm from "@/components/TransactionEntryForm";
import TransactionListItem from "@/components/TransactionListItem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useDeleteCreditPayment,
  useDeleteCustomer,
  useGetCreditPaymentsForCustomer,
  useGetCustomerBalance,
  useGetCustomerById,
  useGetTransactionsForCustomer,
  usePayCreditDue,
} from "@/hooks/useQueries";
import { useParams } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Banknote, ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CreditPaymentTransaction, Transaction } from "../backend";

type UnifiedEntry =
  | { type: "transaction"; date: bigint; data: Transaction }
  | { type: "creditPayment"; date: bigint; data: CreditPaymentTransaction };

const MIN_PAYMENT = 0.01;

export default function CustomerDetailPage() {
  const { customerId } = useParams({ from: "/customer/$customerId" });
  const navigate = useNavigate();
  const customerIdBig = BigInt(customerId);
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [showPayForm, setShowPayForm] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<bigint | null>(
    null,
  );

  const {
    data: customer,
    isLoading: loadingCustomer,
    error: customerError,
  } = useGetCustomerById(customerIdBig);
  const { data: balance = 0, isLoading: loadingBalance } =
    useGetCustomerBalance(customerIdBig);
  const { data: transactions = [], isLoading: loadingTx } =
    useGetTransactionsForCustomer(customerIdBig);
  const { data: creditPayments = [], isLoading: loadingCreditPayments } =
    useGetCreditPaymentsForCustomer(customerIdBig);
  const deleteCustomer = useDeleteCustomer();
  const payCreditDue = usePayCreditDue();
  const deleteCreditPayment = useDeleteCreditPayment();

  // Merge and sort all entries by date descending
  const unifiedEntries: UnifiedEntry[] = [
    ...transactions.map(
      (tx): UnifiedEntry => ({ type: "transaction", date: tx.date, data: tx }),
    ),
    ...creditPayments.map(
      (cp): UnifiedEntry => ({
        type: "creditPayment",
        date: cp.transactionDate,
        data: cp,
      }),
    ),
  ].sort((a, b) => Number(b.date - a.date));

  const totalEntries = transactions.length + creditPayments.length;

  const handleDelete = async () => {
    try {
      await deleteCustomer.mutateAsync(customerIdBig);
      toast.success(t("customerDeleted"));
      navigate({ to: "/" });
    } catch {
      toast.error(t("failedToDeleteCustomer"));
    }
  };

  const validatePaymentAmount = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return t("paymentInvalid");

    const amount = Number.parseFloat(trimmed);
    if (Number.isNaN(amount) || amount <= 0) return t("paymentInvalid");
    if (amount < MIN_PAYMENT) return t("paymentInvalid");
    if (amount > balance) return t("paymentExceedsBalance");

    return "";
  };

  const handlePaymentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setPaymentAmount(val);
    if (paymentError) setPaymentError("");
  };

  const handlePayCreditDue = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validatePaymentAmount(paymentAmount);
    if (error) {
      setPaymentError(error);
      return;
    }

    const amount = Number.parseFloat(paymentAmount);

    try {
      await payCreditDue.mutateAsync({
        customerId: customerIdBig,
        paymentAmount: amount,
      });
      toast.success(t("paymentSuccess"));
      setPaymentAmount("");
      setPaymentError("");
      setShowPayForm(false);
    } catch {
      toast.error(t("paymentFailed"));
    }
  };

  const handleDeleteCreditPayment = async (paymentId: bigint) => {
    setDeletingPaymentId(paymentId);
    try {
      await deleteCreditPayment.mutateAsync({
        paymentId,
        customerId: customerIdBig,
      });
      toast.success(t("creditPaymentDeleted"));
    } catch {
      toast.error(t("failedToDeleteCreditPayment"));
    } finally {
      setDeletingPaymentId(null);
    }
  };

  if (loadingCustomer || loadingBalance) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("customerNotFound")}</AlertDescription>
      </Alert>
    );
  }

  const hasPositiveBalance = balance > 0;

  return (
    <div>
      {/* Customer Dashboard */}
      <CustomerDashboard customer={customer} balance={balance} />

      {/* Action Buttons */}
      <div className="flex gap-2 mb-5">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex-1 bg-lemon-green-dark hover:bg-lemon-green text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {showForm ? t("hideForm") : t("addTransaction")}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteCustomer")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteCustomerDesc")} <strong>{customer.name}</strong>{" "}
                {t("deleteCustomerDesc2")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteCustomer.isPending}
              >
                {deleteCustomer.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Transaction Entry Form */}
      {showForm && (
        <div className="mb-5">
          <TransactionEntryForm
            customerId={customerIdBig}
            currentBalance={balance}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Pay Credit Due Section — only shown when balance > 0 */}
      {hasPositiveBalance && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-blue-800">{t("payCreditDue")}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-blue-100 font-semibold h-7 px-2"
              onClick={() => {
                setShowPayForm(!showPayForm);
                setPaymentError("");
                setPaymentAmount("");
              }}
            >
              {showPayForm ? t("cancel") : t("payCreditDue")}
            </Button>
          </div>
          <p className="text-xs text-blue-600 mb-3">{t("payCreditDueDesc")}</p>

          {showPayForm && (
            <form onSubmit={handlePayCreditDue} className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="pay-amount"
                  className="text-blue-800 font-semibold text-sm"
                >
                  {t("paymentAmount")}
                </Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={balance}
                  placeholder={t("paymentAmountPlaceholder")}
                  value={paymentAmount}
                  onChange={handlePaymentAmountChange}
                  className={`border-blue-300 focus-visible:ring-blue-400 bg-white ${paymentError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  disabled={payCreditDue.isPending}
                  autoFocus
                />
                {paymentError ? (
                  <p className="text-xs text-destructive font-medium">
                    {paymentError}
                  </p>
                ) : (
                  <p className="text-xs text-blue-500">
                    Max: ₹{balance.toFixed(2)}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={payCreditDue.isPending || !paymentAmount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {payCreditDue.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Banknote className="w-4 h-4 mr-1" />
                )}
                {t("submitPayment")}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Unified Transaction History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-lemon-dark">
            {t("transactionHistory")}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {totalEntries}
          </span>
        </div>

        {loadingTx || loadingCreditPayments ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : unifiedEntries.length === 0 ? (
          <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
            <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("noTransactionsYet")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("addFirstTransaction")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unifiedEntries.map((entry) => {
              if (entry.type === "transaction") {
                return (
                  <TransactionListItem
                    key={`tx-${entry.data.id.toString()}`}
                    transaction={entry.data as Transaction}
                  />
                );
              }
              const cp = entry.data as CreditPaymentTransaction;
              return (
                <CreditPaymentListItem
                  key={`cp-${cp.id.toString()}`}
                  payment={cp}
                  onDelete={handleDeleteCreditPayment}
                  isDeleting={deletingPaymentId === cp.id}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAddTransaction } from "@/hooks/useQueries";
import { useTransactionCalculations } from "@/hooks/useTransactionCalculations";
import { useNavigate } from "@tanstack/react-router";
import { Calculator, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TransactionEntryFormProps {
  customerId: bigint;
  currentBalance: number;
  onSuccess?: () => void;
}

export default function TransactionEntryForm({
  customerId,
  currentBalance,
  onSuccess,
}: TransactionEntryFormProps) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { t } = useLanguage();

  const [date, setDate] = useState(today);
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [prevCredit, setPrevCredit] = useState(currentBalance.toString());
  const [todayDebited, setTodayDebited] = useState("");

  const addTransaction = useAddTransaction();

  const { totalAmount, netCredit } = useTransactionCalculations({
    quantity,
    rate,
    previousCredit: Number.parseFloat(prevCredit) || 0,
    todayDebited,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = Number.parseFloat(quantity);
    const rateVal = Number.parseFloat(rate);
    const debit = Number.parseFloat(todayDebited) || 0;

    if (!qty || qty <= 0) {
      toast.error(t("validQtyError"));
      return;
    }
    if (!rateVal || rateVal <= 0) {
      toast.error(t("validRateError"));
      return;
    }
    if (debit < 0) {
      toast.error(t("negativeDebitError"));
      return;
    }

    try {
      const tx = await addTransaction.mutateAsync({
        customerId,
        lemonQuantity: qty,
        ratePerUnit: rateVal,
        todayDebited: debit,
      });
      toast.success(t("transactionAdded"));
      if (onSuccess) onSuccess();
      if (tx) {
        navigate({
          to: "/customer/$customerId/bill/$transactionId",
          params: {
            customerId: customerId.toString(),
            transactionId: tx.id.toString(),
          },
        });
      }
    } catch {
      toast.error(t("failedToAddTransaction"));
    }
  };

  return (
    <Card className="border-lemon-yellow-dark/30 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lemon-dark text-base">
          <Plus className="w-5 h-5 text-lemon-green-dark" />
          {t("newLemonTransaction")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor="tx-date"
              className="text-sm font-semibold text-lemon-dark"
            >
              {t("date")}
            </Label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-ocid="transaction.date.input"
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              className="flex h-12 w-full rounded-md border-2 border-lemon-yellow-dark/50 bg-background px-3 py-2 text-base font-semibold text-lemon-dark ring-offset-background focus:outline-none focus:ring-2 focus:ring-lemon-green focus:border-lemon-green cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">Tap to change date</p>
          </div>

          {/* Quantity & Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-lemon-dark">
                {t("lemonQty")}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border-lemon-yellow-dark/40 focus-visible:ring-lemon-green"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-lemon-dark">
                {t("ratePerUnit")}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="border-lemon-yellow-dark/40 focus-visible:ring-lemon-green"
              />
            </div>
          </div>

          {/* Auto-calculated Total */}
          <div className="bg-lemon-yellow/40 rounded-xl p-3 flex items-center justify-between border border-lemon-yellow-dark/30">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-lemon-dark/60" />
              <span className="text-sm font-semibold text-lemon-dark">
                {t("totalAmount")}
              </span>
            </div>
            <span className="text-xl font-extrabold text-lemon-green-dark">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Previous Credit */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-lemon-dark">
              {t("previousCredit")}
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={prevCredit}
              onChange={(e) => setPrevCredit(e.target.value)}
              className="border-orange-300 focus-visible:ring-orange-400"
            />
            <p className="text-xs text-muted-foreground">
              {t("preFilledBalance")}
            </p>
          </div>

          {/* Today's Debit */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-lemon-dark">
              {t("todayPayment")}
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={t("amountPaidToday")}
              value={todayDebited}
              onChange={(e) => setTodayDebited(e.target.value)}
              className="border-blue-300 focus-visible:ring-blue-400"
            />
          </div>

          {/* Net Credit Preview */}
          <div
            className={`rounded-xl p-3 flex items-center justify-between border ${
              netCredit > 0
                ? "bg-orange-50 border-orange-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <span className="text-sm font-semibold text-foreground">
              {t("netCreditBalance")}
            </span>
            <span
              className={`text-xl font-extrabold ${netCredit > 0 ? "text-orange-600" : "text-lemon-green-dark"}`}
            >
              ₹{netCredit.toFixed(2)}
            </span>
          </div>

          <Button
            type="submit"
            disabled={addTransaction.isPending}
            className="w-full bg-lemon-green-dark hover:bg-lemon-green text-white font-bold"
          >
            {addTransaction.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            {t("addTransactionBtn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

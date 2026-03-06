import { useMemo } from "react";

interface TransactionCalculationInputs {
  quantity: string;
  rate: string;
  previousCredit: number;
  todayDebited: string;
}

interface TransactionCalculationResults {
  totalAmount: number;
  netCredit: number;
}

export function useTransactionCalculations({
  quantity,
  rate,
  previousCredit,
  todayDebited,
}: TransactionCalculationInputs): TransactionCalculationResults {
  return useMemo(() => {
    const qty = Number.parseFloat(quantity) || 0;
    const rateVal = Number.parseFloat(rate) || 0;
    const prevCredit = previousCredit || 0;
    const debited = Number.parseFloat(todayDebited) || 0;

    const totalAmount = qty * rateVal;
    const gross = totalAmount + prevCredit;
    const netCredit =
      gross > debited ? Number.parseFloat((gross - debited).toFixed(2)) : 0;

    return {
      totalAmount: Number.parseFloat(totalAmount.toFixed(2)),
      netCredit,
    };
  }, [quantity, rate, previousCredit, todayDebited]);
}

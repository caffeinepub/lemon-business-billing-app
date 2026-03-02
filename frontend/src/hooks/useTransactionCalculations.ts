import { useMemo } from 'react';

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
    const qty = parseFloat(quantity) || 0;
    const rateVal = parseFloat(rate) || 0;
    const prevCredit = previousCredit || 0;
    const debited = parseFloat(todayDebited) || 0;

    const totalAmount = qty * rateVal;
    const gross = totalAmount + prevCredit;
    const netCredit = gross > debited ? parseFloat((gross - debited).toFixed(2)) : 0;

    return {
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      netCredit,
    };
  }, [quantity, rate, previousCredit, todayDebited]);
}

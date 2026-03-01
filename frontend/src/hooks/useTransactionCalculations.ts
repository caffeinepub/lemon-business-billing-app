import { useMemo } from 'react';

interface TransactionCalcInput {
  quantity: number;
  rate: number;
  previousCredit: number;
  todayDebited: number;
}

interface TransactionCalcResult {
  totalAmount: number;
  netCredit: number;
}

export function useTransactionCalculations({
  quantity,
  rate,
  previousCredit,
  todayDebited,
}: TransactionCalcInput): TransactionCalcResult {
  return useMemo(() => {
    const totalAmount = Math.round((quantity * rate) * 100) / 100;
    const gross = previousCredit + totalAmount;
    const netCredit = Math.round((gross > todayDebited ? gross - todayDebited : 0) * 100) / 100;
    return { totalAmount, netCredit };
  }, [quantity, rate, previousCredit, todayDebited]);
}

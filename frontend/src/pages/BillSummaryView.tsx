import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetCustomerById, useGetTransactionsForCustomer } from '@/hooks/useQueries';
import BillLayout from '@/components/BillLayout';
import { formatBillText } from '@/utils/formatBillText';
import { Printer, MessageCircle, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BillSummaryView() {
  const { customerId, transactionId } = useParams({ from: '/customer/$customerId/bill/$transactionId' });
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const customerIdBig = BigInt(customerId);
  const txId = BigInt(transactionId);

  const { data: customer, isLoading: loadingCustomer } = useGetCustomerById(customerIdBig);
  const { data: transactions = [], isLoading: loadingTx } = useGetTransactionsForCustomer(customerIdBig);

  const transaction = useMemo(
    () => transactions.find((tx) => tx.id === txId),
    [transactions, txId]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!customer || !transaction) return;
    const text = formatBillText(customer, transaction, language);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loadingCustomer || loadingTx) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (!customer || !transaction) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('billNotFound')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {/* Action Buttons - hidden on print */}
      <div className="flex gap-2 mb-4 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/customer/$customerId', params: { customerId: customerId.toString() } })}
          className="border-lemon-yellow-dark/40 text-lemon-dark"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('back')}
        </Button>
        <Button
          onClick={handlePrint}
          className="flex-1 bg-lemon-dark hover:bg-lemon-dark/80 text-lemon-yellow font-bold"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          {t('printBill')}
        </Button>
        <Button
          onClick={handleWhatsApp}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          <MessageCircle className="w-4 h-4 mr-1.5" />
          {t('whatsApp')}
        </Button>
      </div>

      {/* Bill */}
      <BillLayout customer={customer} transaction={transaction} />
    </div>
  );
}

import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
} from '@/components/ui/alert-dialog';
import {
  useGetCustomerById,
  useGetCustomerBalance,
  useGetTransactionsForCustomer,
  useDeleteCustomer,
} from '@/hooks/useQueries';
import CustomerDashboard from '@/components/CustomerDashboard';
import TransactionListItem from '@/components/TransactionListItem';
import TransactionEntryForm from '@/components/TransactionEntryForm';
import { Plus, ClipboardList, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CustomerDetailPage() {
  const { customerId } = useParams({ from: '/customer/$customerId' });
  const navigate = useNavigate();
  const customerIdBig = BigInt(customerId);
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);

  const { data: customer, isLoading: loadingCustomer, error: customerError } = useGetCustomerById(customerIdBig);
  const { data: balance = BigInt(0), isLoading: loadingBalance } = useGetCustomerBalance(customerIdBig);
  const { data: transactions = [], isLoading: loadingTx } = useGetTransactionsForCustomer(customerIdBig);
  const deleteCustomer = useDeleteCustomer();

  const sortedTransactions = [...transactions].sort((a, b) => Number(b.date - a.date));

  const handleDelete = async () => {
    try {
      await deleteCustomer.mutateAsync(customerIdBig);
      toast.success(t('customerDeleted'));
      navigate({ to: '/' });
    } catch {
      toast.error(t('failedToDeleteCustomer'));
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
        <AlertDescription>{t('customerNotFound')}</AlertDescription>
      </Alert>
    );
  }

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
          {showForm ? t('hideForm') : t('addTransaction')}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="border-destructive text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteCustomer')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteCustomerDesc')} <strong>{customer.name}</strong> {t('deleteCustomerDesc2')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteCustomer.isPending}
              >
                {deleteCustomer.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {t('delete')}
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

      {/* Transaction History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-lemon-dark">{t('transactionHistory')}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {transactions.length}
          </span>
        </div>

        {loadingTx ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : sortedTransactions.length === 0 ? (
          <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
            <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('noTransactionsYet')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('addFirstTransaction')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((tx) => (
              <TransactionListItem key={tx.id.toString()} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

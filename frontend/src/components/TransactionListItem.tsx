import { useNavigate } from '@tanstack/react-router';
import type { Transaction } from '../backend';
import { Button } from '@/components/ui/button';
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
import { FileText, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteTransaction } from '@/hooks/useQueries';
import { useLanguage } from '@/contexts/LanguageContext';

interface TransactionListItemProps {
  transaction: Transaction;
}

function fmt(value: bigint): string {
  return Number(value).toFixed(2);
}

export default function TransactionListItem({ transaction }: TransactionListItemProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const deleteTransaction = useDeleteTransaction();
  const { t } = useLanguage();

  const date = new Date(Number(transaction.date) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const hasCredit = transaction.netCredit > BigInt(0);

  const handleDelete = async () => {
    await deleteTransaction.mutateAsync({
      transactionId: transaction.id,
      customerId: transaction.customerId,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          className="flex-1 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors rounded-lg -mx-1 px-1"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {date}
              </span>
              <span className="text-xs text-muted-foreground">
                {transaction.lemonQuantity.toString()} pcs × ₹{fmt(transaction.ratePerUnit)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-bold text-foreground text-sm">
                {t('total')}: ₹{fmt(transaction.totalAmount)}
              </span>
              <span className={`font-extrabold text-sm ${hasCredit ? 'text-orange-600' : 'text-lemon-green-dark'}`}>
                {t('bal')}: ₹{fmt(transaction.netCredit)}
              </span>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:bg-destructive/10 h-8 w-8"
              disabled={deleteTransaction.isPending}
            >
              {deleteTransaction.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteTransaction')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteTransactionDesc')} <strong>{date}</strong> (₹{fmt(transaction.totalAmount)}). {t('deleteTransactionDesc2')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t('lemonQtyLabel')}</p>
              <p className="font-semibold">{transaction.lemonQuantity.toString()} pcs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('rateUnitLabel')}</p>
              <p className="font-semibold">₹{fmt(transaction.ratePerUnit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('totalAmountLabel')}</p>
              <p className="font-bold text-lemon-green-dark">₹{fmt(transaction.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('todayPaidLabel')}</p>
              <p className="font-bold text-blue-600">₹{fmt(transaction.todayDebited)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('prevCreditLabel')}</p>
              <p className="font-semibold text-orange-500">₹{fmt(transaction.previousCredit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('netCreditLabel')}</p>
              <p className={`font-extrabold ${hasCredit ? 'text-orange-600' : 'text-lemon-green-dark'}`}>
                ₹{fmt(transaction.netCredit)}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2 border-lemon-green text-lemon-green-dark hover:bg-lemon-green/10 font-semibold"
            onClick={() =>
              navigate({
                to: '/customer/$customerId/bill/$transactionId',
                params: {
                  customerId: transaction.customerId.toString(),
                  transactionId: transaction.id.toString(),
                },
              })
            }
          >
            <FileText className="w-4 h-4 mr-1.5" />
            {t('viewBill')}
          </Button>
        </div>
      )}
    </div>
  );
}

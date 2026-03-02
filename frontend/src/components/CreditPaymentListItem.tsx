import type { CreditPaymentTransaction } from '../backend';
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
import { Banknote, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreditPaymentListItemProps {
  payment: CreditPaymentTransaction;
  onDelete: (paymentId: bigint) => Promise<void>;
  isDeleting?: boolean;
}

function fmt(value: number): string {
  return value.toFixed(2);
}

export default function CreditPaymentListItem({
  payment,
  onDelete,
  isDeleting = false,
}: CreditPaymentListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  const date = new Date(Number(payment.transactionDate) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleDelete = async () => {
    await onDelete(payment.id);
  };

  return (
    <div className="bg-card rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          className="flex-1 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors rounded-lg -mx-1 px-1"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Icon badge */}
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Banknote className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {date}
              </span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {t('creditDuePayment')}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-bold text-blue-700 text-sm">
                − ₹{fmt(payment.paymentAmount)}
              </span>
              <span className="font-semibold text-sm text-muted-foreground">
                {t('bal')}: ₹{fmt(payment.resultingCreditBalance)}
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
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteCreditPayment')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteCreditPaymentDesc')} ₹{fmt(payment.paymentAmount)} ({date}).{' '}
                {t('deleteCreditPaymentDesc2')}
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
        <div className="border-t border-blue-100 bg-blue-50/40 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t('amountPaid')}</p>
              <p className="font-bold text-blue-700">₹{fmt(payment.paymentAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('resultingBalance')}</p>
              <p className={`font-extrabold ${payment.resultingCreditBalance > 0 ? 'text-orange-600' : 'text-lemon-green-dark'}`}>
                ₹{fmt(payment.resultingCreditBalance)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

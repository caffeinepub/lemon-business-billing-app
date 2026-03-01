import type { Customer, Transaction } from '../backend';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';

interface BillLayoutProps {
  customer: Customer;
  transaction: Transaction;
}

function fmt(value: bigint): string {
  return Number(value).toFixed(2);
}

export default function BillLayout({ customer, transaction }: BillLayoutProps) {
  const { t } = useLanguage();

  const date = new Date(Number(transaction.date) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const hasCredit = transaction.netCredit > BigInt(0);

  return (
    <div className="bill-content bg-white rounded-2xl border-2 border-lemon-yellow-dark/40 shadow-lg overflow-hidden">
      {/* Bill Header */}
      <div className="bg-lemon-yellow px-6 py-5 text-center print:bg-white print:border-b-2 print:border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img
            src="/assets/generated/lemon-logo.dim_128x128.png"
            alt="Lemon"
            className="w-8 h-8 rounded-full print:hidden"
          />
          <h2 className="text-lemon-dark font-extrabold text-xl tracking-tight">🍋 {t('appTitle')}</h2>
        </div>
        <p className="text-lemon-dark/60 text-sm font-medium">{t('salesBill')}</p>
        <p className="text-lemon-dark/50 text-xs mt-1">{t('billDate')}: {date}</p>
      </div>

      {/* Customer Info */}
      <div className="px-6 py-4 bg-lemon-yellow/10 border-b border-lemon-yellow-dark/20">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('customerDetails')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{t('name')}</p>
            <p className="font-bold text-foreground">{customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('phone')}</p>
            <p className="font-bold text-foreground">{customer.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="px-6 py-4 border-b border-lemon-yellow-dark/20">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t('transactionDetails')}</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('lemonQuantity')}</span>
            <span className="font-bold text-foreground">{transaction.lemonQuantity.toString()} pcs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('ratePerUnitLabel')}</span>
            <span className="font-bold text-foreground">₹{fmt(transaction.ratePerUnit)}</span>
          </div>
          <Separator className="bg-lemon-yellow-dark/30" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">{t('todaysTotal')}</span>
            <span className="font-extrabold text-lemon-green-dark text-lg">
              ₹{fmt(transaction.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="px-6 py-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t('balanceSummary')}</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('previousCreditLabel')}</span>
            <span className="font-semibold text-orange-500">
              ₹{fmt(transaction.previousCredit)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('todaysPayment')}</span>
            <span className="font-semibold text-blue-600">
              − ₹{fmt(transaction.todayDebited)}
            </span>
          </div>
          <Separator className="bg-lemon-yellow-dark/30" />
          <div className={`flex justify-between items-center rounded-xl p-3 ${
            hasCredit ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
          }`}>
            <span className="font-bold text-foreground">{t('netCreditBalanceLabel')}</span>
            <span className={`font-extrabold text-xl ${hasCredit ? 'text-orange-600' : 'text-lemon-green-dark'}`}>
              ₹{fmt(transaction.netCredit)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-lemon-yellow/20 text-center border-t border-lemon-yellow-dark/20">
        <p className="text-xs text-lemon-dark/60 font-medium">{t('thankYou')}</p>
        <p className="text-xs text-lemon-dark/40 mt-0.5">{t('poweredBy')}</p>
      </div>
    </div>
  );
}

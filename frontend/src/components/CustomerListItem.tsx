import React from 'react';
import { Link } from '@tanstack/react-router';
import type { Customer } from '../backend';
import { ChevronRight, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CustomerListItemProps {
  customer: Customer;
  balance: bigint;
  lastTransactionDate?: Date | null;
}

function CustomerListItem({
  customer,
  balance,
  lastTransactionDate,
}: CustomerListItemProps) {
  const formattedBalance = Number(balance).toFixed(2);
  const hasCredit = balance > BigInt(0);
  const hasPreviousDue = customer.previousCredit > BigInt(0);
  const formattedPreviousDue = Number(customer.previousCredit).toFixed(2);
  const { t } = useLanguage();

  return (
    <Link
      to="/customer/$customerId"
      params={{ customerId: customer.id.toString() }}
      className="block"
    >
      <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 shadow-sm border border-border hover:border-lemon-yellow-dark/50 hover:shadow-md transition-all active:scale-[0.99]">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-lemon-yellow flex items-center justify-center shrink-0 border-2 border-lemon-yellow-dark/30">
          <span className="text-lemon-dark font-extrabold text-lg uppercase">
            {customer.name.charAt(0)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base truncate">{customer.name}</p>
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
            <Phone className="w-3 h-3" />
            <span>{customer.phoneNumber}</span>
            {lastTransactionDate && (
              <>
                <span className="mx-1">·</span>
                <span>
                  {lastTransactionDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </>
            )}
          </div>
          {hasPreviousDue && (
            <div className="mt-0.5">
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                {t('previousDue')}: ₹{formattedPreviousDue}
              </span>
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="text-right shrink-0">
          <p
            className={`font-extrabold text-base ${
              hasCredit ? 'text-orange-600' : 'text-lemon-green-dark'
            }`}
          >
            ₹{formattedBalance}
          </p>
          <p className="text-xs text-muted-foreground">{hasCredit ? t('creditDue') : t('clear')}</p>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

export default React.memo(CustomerListItem);

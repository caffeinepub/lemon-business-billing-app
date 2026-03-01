import { Card, CardContent } from '@/components/ui/card';
import type { Customer } from '../backend';
import { Phone, Calendar, IndianRupee } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CustomerDashboardProps {
  customer: Customer;
  balance: bigint;
}

export default function CustomerDashboard({ customer, balance }: CustomerDashboardProps) {
  const hasCredit = balance > BigInt(0);
  const { t } = useLanguage();
  const dateCreated = new Date(Number(customer.dateCreated) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="bg-gradient-to-br from-lemon-yellow to-lemon-yellow-dark/60 border-lemon-yellow-dark/40 shadow-md mb-5">
      <CardContent className="p-5">
        {/* Customer Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center border-2 border-lemon-dark/20 shadow-sm">
            <span className="text-lemon-dark font-extrabold text-2xl uppercase">
              {customer.name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-lemon-dark font-extrabold text-xl leading-tight">{customer.name}</h2>
            <div className="flex items-center gap-1 text-lemon-dark/60 text-sm mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{customer.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-orange-600" />
              <p className="text-xs text-lemon-dark/60 font-medium">{t('creditDueCard')}</p>
            </div>
            <p className={`text-2xl font-extrabold ${hasCredit ? 'text-orange-600' : 'text-lemon-green-dark'}`}>
              ₹{Number(balance).toFixed(2)}
            </p>
            <p className="text-xs text-lemon-dark/50 mt-0.5">{hasCredit ? t('outstanding') : t('allClear')}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-lemon-green-dark" />
              <p className="text-xs text-lemon-dark/60 font-medium">{t('since')}</p>
            </div>
            <p className="text-sm font-bold text-lemon-dark">{dateCreated}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

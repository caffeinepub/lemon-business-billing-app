import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllCustomers, useGetCustomerBalance, useGetTransactionsForCustomer, useGetLemonSummary } from '@/hooks/useQueries';
import SummaryBanner from '@/components/SummaryBanner';
import CustomerListItem from '@/components/CustomerListItem';
import AddCustomerModal from '@/components/AddCustomerModal';
import { Plus, Users, Citrus, BarChart3 } from 'lucide-react';
import type { Customer } from '../backend';
import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Sub-component to fetch per-customer data for the list
function CustomerRow({ customer }: { customer: Customer }) {
  const { data: balance = BigInt(0) } = useGetCustomerBalance(customer.id);
  const { data: transactions = [] } = useGetTransactionsForCustomer(customer.id);

  const lastTxDate = useMemo(() => {
    if (transactions.length === 0) return null;
    const sorted = [...transactions].sort((a, b) => Number(b.date - a.date));
    return new Date(Number(sorted[0].date) / 1_000_000);
  }, [transactions]);

  return (
    <CustomerListItem
      customer={customer}
      balance={balance}
      lastTransactionDate={lastTxDate}
    />
  );
}

export default function HomePage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { data: customers = [], isLoading, refetch: refetchCustomers } = useGetAllCustomers();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useGetLemonSummary();
  const { t } = useLanguage();

  const handleModalOpenChange = (open: boolean) => {
    setAddModalOpen(open);
    // When modal closes after adding, ensure data is fresh
    if (!open) {
      refetchCustomers();
      refetchSummary();
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-lemon-dark">{t('dashboard')}</h2>
          <p className="text-sm text-muted-foreground">{t('lemonLedger')}</p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-lemon-green-dark hover:bg-lemon-green text-white font-bold shadow-sm"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          {t('add')}
        </Button>
      </div>

      {/* Unified Summary Banner */}
      {summaryLoading ? (
        <Skeleton className="h-20 w-full rounded-xl mb-5" />
      ) : (
        <SummaryBanner
          customerCount={customers.length}
          totalCreditDue={summary?.totalCreditDue ?? BigInt(0)}
          totalLemonsSold={summary?.totalLemonsSold ?? BigInt(0)}
        />
      )}

      {/* My Lemon Summary Button */}
      <Link to="/my-summary" className="block mb-5">
        <div className="flex items-center gap-3 bg-lemon-yellow/60 hover:bg-lemon-yellow border border-lemon-yellow-dark/30 rounded-xl px-4 py-3 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-lemon-green-dark/10 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-lemon-green-dark" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lemon-dark text-sm">{t('myLemonSummary')}</p>
            <p className="text-xs text-lemon-dark/60">{t('myLemonSummaryDesc')}</p>
          </div>
          <span className="text-lemon-dark/40 text-lg">›</span>
        </div>
      </Link>

      {/* Customer List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-lemon-yellow/50 flex items-center justify-center mb-4">
            <Citrus className="w-10 h-10 text-lemon-yellow-dark" />
          </div>
          <h3 className="text-lg font-bold text-lemon-dark mb-2">{t('noCustomersYet')}</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs">
            {t('noCustomersDesc')}
          </p>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-lemon-green-dark hover:bg-lemon-green text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('addFirstCustomer')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              {customers.length} {customers.length !== 1 ? t('customers') : t('customer')}
            </span>
          </div>
          {customers.map((customer) => (
            <CustomerRow key={customer.id.toString()} customer={customer} />
          ))}
        </div>
      )}

      <AddCustomerModal open={addModalOpen} onOpenChange={handleModalOpenChange} />
    </div>
  );
}

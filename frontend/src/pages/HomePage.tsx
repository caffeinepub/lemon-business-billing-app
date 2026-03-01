import React, { useState, useMemo, useCallback, memo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useGetAllCustomers,
  useGetCustomerBalance,
  useGetTransactionsForCustomer,
  useGetLemonSummary,
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from '@/hooks/useQueries';
import SummaryBanner from '@/components/SummaryBanner';
import CustomerListItem from '@/components/CustomerListItem';
import AddCustomerModal from '@/components/AddCustomerModal';
import InstallAppBanner from '@/components/InstallAppBanner';
import { Plus, Users, BarChart3, LogIn, Loader2, Download } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Customer } from '../backend';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';

// ── CustomerRow ───────────────────────────────────────────────────────────────

const CustomerRow = memo(function CustomerRow({ customer }: { customer: Customer }) {
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
});

// ── LoginScreen ───────────────────────────────────────────────────────────────

function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const { canInstall, showIOSInstructions, promptToInstall, showBanner } = usePWAInstall();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
      <div className="w-24 h-24 rounded-full bg-lemon-yellow flex items-center justify-center shadow-md">
        <img
          src="/assets/generated/lemon-logo.dim_128x128.png"
          alt="Lemon Business"
          className="w-20 h-20 rounded-full object-cover"
        />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-lemon-dark mb-2">Welcome Back!</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Sign in to manage your lemon business customers and transactions.
        </p>
      </div>
      <Button
        onClick={() => login()}
        disabled={isLoggingIn}
        size="lg"
        className="gap-2 bg-lemon-green-dark hover:bg-lemon-green text-white font-bold px-8"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Sign In
          </>
        )}
      </Button>

      {/* Install App on login screen */}
      {showBanner && (
        <div className="w-full max-w-xs">
          <InstallAppBanner />
        </div>
      )}
    </div>
  );
}

// ── ProfileSetupModal ─────────────────────────────────────────────────────────

function ProfileSetupModal({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile(
      { name: name.trim(), email: email.trim() },
      { onSuccess: onDone }
    );
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>Enter your name to get started with Lemon Business.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="profile-name">Your Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="profile-email">Email (optional)</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@example.com"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !name.trim()} className="w-full">
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
              ) : (
                'Get Started'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [profileSetupDone, setProfileSetupDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { t } = useLanguage();
  const { canInstall, showIOSInstructions, promptToInstall, showBanner } = usePWAInstall();

  const { data: customers = [], isLoading: customersLoading, refetch: refetchCustomers } = useGetAllCustomers();
  const { data: summary, isLoading: summaryLoading } = useGetLemonSummary();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null &&
    !profileSetupDone;

  const handleModalOpenChange = useCallback((open: boolean) => {
    setAddModalOpen(open);
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phoneNumber.includes(q)
    );
  }, [customers, searchQuery]);

  // ── Not authenticated ─────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-yellow" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // ── Profile setup ─────────────────────────────────────────────────────────
  if (showProfileSetup) {
    return <ProfileSetupModal onDone={() => setProfileSetupDone(true)} />;
  }

  // ── Authenticated view ────────────────────────────────────────────────────
  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-lemon-dark">{t('dashboard')}</h2>
          <p className="text-sm text-muted-foreground">{t('lemonLedger')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Compact install button in header area */}
          {(canInstall || showIOSInstructions) && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-lemon-green text-lemon-green-dark hover:bg-lemon-green/10 font-semibold"
              onClick={canInstall ? promptToInstall : undefined}
              title="Install App"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </Button>
          )}
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-lemon-green-dark hover:bg-lemon-green text-white font-bold shadow-sm"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t('add')}
          </Button>
        </div>
      </div>

      {/* PWA Install Banner — prominent, near top */}
      <InstallAppBanner className="mb-4" />

      {/* Summary Banner */}
      {summaryLoading ? (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : summary ? (
        <SummaryBanner
          customerCount={customers.length}
          summary={summary}
        />
      ) : null}

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

      {/* Search bar */}
      <div className="mb-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers…"
          className="w-full"
        />
      </div>

      {/* Customer List */}
      {customersLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-lemon-yellow/50 flex items-center justify-center">
            <Users className="w-8 h-8 text-lemon-dark/40" />
          </div>
          <p className="text-lemon-dark/60 font-medium">
            {searchQuery ? 'No customers found' : t('noCustomersYet')}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'Try a different search term' : t('noCustomersDesc')}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setAddModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-1 border-lemon-green text-lemon-green-dark hover:bg-lemon-green/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('addCustomer')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <CustomerRow key={customer.id.toString()} customer={customer} />
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        open={addModalOpen}
        onClose={() => handleModalOpenChange(false)}
        onSuccess={() => {
          refetchCustomers();
        }}
      />
    </div>
  );
}

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddCustomer } from '../hooks/useQueries';
import { useLanguage } from '../contexts/LanguageContext';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { WifiOff, Loader2 } from 'lucide-react';

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddCustomerModal({ open, onClose, onSuccess }: AddCustomerModalProps) {
  const { t } = useLanguage();
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const addCustomer = useAddCustomer();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [previousCredit, setPreviousCredit] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const isOffline = !navigator.onLine;
  const isAuthenticated = !!identity;

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = t('fillAllFields');
    if (!phone.trim()) newErrors.phone = t('fillAllFields');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // If online but actor not ready yet, show error
    if (!isOffline && (!actor || !identity)) {
      setErrors({ name: 'Please wait, connecting to server…' });
      return;
    }

    const creditValue = previousCredit.trim() ? parseFloat(previousCredit) : 0;
    const creditFloat = Math.max(0, isNaN(creditValue) ? 0 : creditValue);

    try {
      await addCustomer.mutateAsync({
        name: name.trim(),
        phoneNumber: phone.trim(),
        previousCredit: creditFloat,
      });
      // Reset form
      setName('');
      setPhone('');
      setPreviousCredit('');
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to add customer:', err);
    }
  };

  const handleClose = () => {
    if (addCustomer.isPending) return;
    setName('');
    setPhone('');
    setPreviousCredit('');
    setErrors({});
    addCustomer.reset();
    onClose();
  };

  const isSubmitDisabled = addCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addNewCustomer')}</DialogTitle>
        </DialogHeader>

        {isOffline && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>You are offline. This will be saved and synced when you reconnect.</span>
          </div>
        )}

        {!isOffline && actorFetching && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            <span>Connecting to server…</span>
          </div>
        )}

        {!isOffline && !actorFetching && !isAuthenticated && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            <span>Please sign in to add customers.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="customer-name">{t('customerName')}</Label>
            <Input
              id="customer-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder={t('customerNamePlaceholder')}
              disabled={addCustomer.isPending}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="customer-phone">{t('phoneNumber')}</Label>
            <Input
              id="customer-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder={t('phoneNumberPlaceholder')}
              type="tel"
              disabled={addCustomer.isPending}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="previous-credit">{t('previousCreditDue')}</Label>
            <Input
              id="previous-credit"
              value={previousCredit}
              onChange={(e) => setPreviousCredit(e.target.value)}
              placeholder={t('previousCreditDuePlaceholder')}
              type="number"
              min="0"
              step="0.01"
              disabled={addCustomer.isPending}
            />
            <p className="text-xs text-muted-foreground">{t('previousCreditDueHint')}</p>
          </div>

          {addCustomer.isError && (
            <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">
              {(addCustomer.error as Error)?.message || t('failedToAddCustomer')}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addCustomer.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
            >
              {addCustomer.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding…
                </span>
              ) : (
                t('addCustomer')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

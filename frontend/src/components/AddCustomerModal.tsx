import { useState } from 'react';
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
import { useAddCustomer } from '@/hooks/useQueries';
import { useActor } from '@/hooks/useActor';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCustomerModal({ open, onOpenChange }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const addCustomer = useAddCustomer();
  const { actor, isFetching: actorFetching } = useActor();
  const { t } = useLanguage();

  const isActorReady = !!actor && !actorFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(t('fillAllFields'));
      return;
    }
    if (!isActorReady) {
      toast.error('Please wait, connecting to backend...');
      return;
    }
    try {
      await addCustomer.mutateAsync({ name: name.trim(), phoneNumber: phone.trim() });
      toast.success(`${t('customerAdded').replace('!', '')} "${name}"!`);
      setName('');
      setPhone('');
      onOpenChange(false);
    } catch (err) {
      console.error('Add customer error:', err);
      toast.error(t('failedToAddCustomer'));
    }
  };

  const handleCancel = () => {
    setName('');
    setPhone('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !addCustomer.isPending) {
        setName('');
        setPhone('');
        onOpenChange(false);
      } else if (isOpen) {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lemon-dark">
            <UserPlus className="w-5 h-5 text-lemon-green-dark" />
            {t('addNewCustomer')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cust-name" className="text-lemon-dark font-semibold">
              {t('customerName')} *
            </Label>
            <Input
              id="cust-name"
              placeholder={t('customerNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-lemon-yellow-dark/40 focus-visible:ring-lemon-green"
              autoFocus
              disabled={addCustomer.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-phone" className="text-lemon-dark font-semibold">
              {t('phoneNumber')} *
            </Label>
            <Input
              id="cust-phone"
              placeholder={t('phoneNumberPlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-lemon-yellow-dark/40 focus-visible:ring-lemon-green"
              type="tel"
              disabled={addCustomer.isPending}
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={addCustomer.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={addCustomer.isPending || !isActorReady}
              className="flex-1 bg-lemon-green-dark hover:bg-lemon-green text-white font-bold"
            >
              {addCustomer.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <UserPlus className="w-4 h-4 mr-1" />
              )}
              {t('addCustomer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

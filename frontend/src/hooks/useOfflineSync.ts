import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import {
  getPendingOperations,
  removeOperation,
  getPendingCount,
  type OfflineOperation,
} from '@/utils/offlineQueue';

export type SyncStatus = 'idle' | 'syncing' | 'error';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isSyncingRef = useRef(false);

  // Refresh pending count
  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  // Process a single operation
  const processOperation = useCallback(
    async (op: OfflineOperation): Promise<boolean> => {
      if (!actor) return false;

      try {
        if (op.type === 'addCustomer') {
          const { name, phoneNumber, previousCredit } = op.payload as {
            name: string;
            phoneNumber: string;
            previousCredit: number;
          };
          await actor.addCustomer(name, phoneNumber, previousCredit);
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
        } else if (op.type === 'addTransaction') {
          const { customerId, lemonQuantity, ratePerUnit, todayDebited } = op.payload as {
            customerId: string;
            lemonQuantity: number;
            ratePerUnit: number;
            todayDebited: number;
          };
          await actor.addTransaction(
            BigInt(customerId),
            lemonQuantity,
            ratePerUnit,
            todayDebited,
          );
          queryClient.invalidateQueries({ queryKey: ['transactions', customerId] });
          queryClient.invalidateQueries({ queryKey: ['customerBalance', customerId] });
          queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
        } else if (op.type === 'payCreditDue') {
          const { customerId, paymentAmount } = op.payload as {
            customerId: string;
            paymentAmount: number;
          };
          await actor.payCreditDue(BigInt(customerId), paymentAmount);
          queryClient.invalidateQueries({ queryKey: ['customerBalance', customerId] });
          queryClient.invalidateQueries({ queryKey: ['creditPayments', customerId] });
          queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
        }
        return true;
      } catch (err) {
        console.warn('[OfflineSync] Failed to process operation:', op.type, err);
        return false;
      }
    },
    [actor, queryClient]
  );

  // Sync all pending operations
  const syncPending = useCallback(async () => {
    if (isSyncingRef.current || !actor || !identity || !navigator.onLine) return;

    const pending = await getPendingOperations();
    if (pending.length === 0) return;

    isSyncingRef.current = true;
    setSyncStatus('syncing');

    let hasError = false;
    for (const op of pending) {
      const success = await processOperation(op);
      if (success) {
        await removeOperation(op.id);
      } else {
        hasError = true;
      }
    }

    isSyncingRef.current = false;
    setSyncStatus(hasError ? 'error' : 'idle');
    await refreshPendingCount();
  }, [actor, identity, processOperation, refreshPendingCount]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => syncPending(), 1000);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPending]);

  // Initial pending count load
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Sync when actor becomes available and we're online
  useEffect(() => {
    if (actor && identity && isOnline) {
      syncPending();
    }
  }, [actor, identity, isOnline, syncPending]);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    syncPending,
    refreshPendingCount,
  };
}

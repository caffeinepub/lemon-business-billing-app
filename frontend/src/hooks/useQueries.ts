import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Customer, Transaction, LemonSummary, CreditPaymentTransaction, UserProfile } from '../backend';
import { enqueueOperation } from '../utils/offlineQueue';
import { toast } from 'sonner';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Customers ───────────────────────────────────────────────────────────────

export function useGetAllCustomers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetCustomerById(customerId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Customer>({
    queryKey: ['customer', customerId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomerById(customerId);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useAddCustomer() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; phoneNumber: string; previousCredit: bigint }) => {
      const isOnline = navigator.onLine;

      // Offline path: queue the operation
      if (!isOnline) {
        await enqueueOperation('addCustomer', {
          name: params.name,
          phoneNumber: params.phoneNumber,
          previousCredit: params.previousCredit.toString(),
        });
        toast.success('Customer saved offline. Will sync when online.');
        return {
          id: BigInt(Date.now()),
          name: params.name,
          phoneNumber: params.phoneNumber,
          previousCredit: params.previousCredit,
          dateCreated: BigInt(Date.now()) * BigInt(1_000_000),
        } as Customer;
      }

      // Online path: wait briefly if actor is still initializing
      if (actorFetching) {
        throw new Error('Still connecting to server. Please try again in a moment.');
      }

      if (!actor) {
        throw new Error('Unable to connect to server. Please refresh and try again.');
      }

      if (!identity) {
        throw new Error('Not authenticated. Please sign in and try again.');
      }

      return actor.addCustomer(params.name, params.phoneNumber, params.previousCredit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
    },
    onError: (error: Error) => {
      console.error('Add customer error:', error);
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomer(customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetTransactionsForCustomer(customerId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', customerId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionsForCustomer(customerId);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useAddTransaction() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: bigint;
      lemonQuantity: bigint;
      ratePerUnit: bigint;
      todayDebited: bigint;
    }) => {
      const isOnline = navigator.onLine;

      if (!isOnline) {
        await enqueueOperation('addTransaction', {
          customerId: params.customerId.toString(),
          lemonQuantity: params.lemonQuantity.toString(),
          ratePerUnit: params.ratePerUnit.toString(),
          todayDebited: params.todayDebited.toString(),
        });
        toast.success('Transaction saved offline. Will sync when online.');
        const totalAmount = params.lemonQuantity * params.ratePerUnit;
        return {
          id: BigInt(Date.now()),
          customerId: params.customerId,
          date: BigInt(Date.now()) * BigInt(1_000_000),
          lemonQuantity: params.lemonQuantity,
          ratePerUnit: params.ratePerUnit,
          totalAmount,
          previousCredit: BigInt(0),
          todayDebited: params.todayDebited,
          netCredit: totalAmount - params.todayDebited > BigInt(0) ? totalAmount - params.todayDebited : BigInt(0),
        } as Transaction;
      }

      if (actorFetching) {
        throw new Error('Still connecting to server. Please try again in a moment.');
      }

      if (!actor || !identity) throw new Error('Not authenticated. Please log in.');
      return actor.addTransaction(
        params.customerId,
        params.lemonQuantity,
        params.ratePerUnit,
        params.todayDebited,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customerBalance', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { transactionId: bigint; customerId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTransaction(params.transactionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customerBalance', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
    },
  });
}

// ─── Customer Balance ─────────────────────────────────────────────────────────

export function useGetCustomerBalance(customerId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['customerBalance', customerId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomerBalance(customerId);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ─── Credit Payments ──────────────────────────────────────────────────────────

export function usePayCreditDue() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { customerId: bigint; paymentAmount: bigint }) => {
      const isOnline = navigator.onLine;

      if (!isOnline) {
        await enqueueOperation('payCreditDue', {
          customerId: params.customerId.toString(),
          paymentAmount: params.paymentAmount.toString(),
        });
        toast.success('Payment saved offline. Will sync when online.');
        return;
      }

      if (actorFetching) {
        throw new Error('Still connecting to server. Please try again in a moment.');
      }

      if (!actor || !identity) throw new Error('Not authenticated. Please log in.');
      return actor.payCreditDue(params.customerId, params.paymentAmount);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customerBalance', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['creditPayments', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
    },
  });
}

export function useGetCreditPaymentTransactionsForCustomer(customerId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CreditPaymentTransaction[]>({
    queryKey: ['creditPayments', customerId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCreditPaymentTransactionsForCustomer(customerId);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useDeleteCreditPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { paymentId: bigint; customerId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCreditPayment(params.paymentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['creditPayments', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customerBalance', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
    },
  });
}

// ─── Lemon Summary ────────────────────────────────────────────────────────────

export function useGetLemonSummary() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<LemonSummary>({
    queryKey: ['lemonSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLemonSummary();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Customer, Transaction, LemonSummary } from '../backend';
import { toast } from 'sonner';

// ─── Customers ───────────────────────────────────────────────────────────────

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useGetCustomerById(customerId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Customer>({
    queryKey: ['customer', customerId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      return actor.getCustomerById(customerId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useGetCustomerBalance(customerId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ['customerBalance', customerId.toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCustomerBalance(customerId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddCustomer() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phoneNumber }: { name: string; phoneNumber: string }) => {
      if (!actor || isFetching) throw new Error('Actor not ready');
      const result = await actor.addCustomer(name, phoneNumber);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
      queryClient.refetchQueries({ queryKey: ['customers'] });
      queryClient.refetchQueries({ queryKey: ['lemonSummary'] });
    },
    onError: (error) => {
      console.error('Failed to add customer:', error);
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: bigint) => {
      if (!actor) throw new Error('Actor not ready');
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
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ['transactions', customerId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionsForCustomer(customerId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerId,
      lemonQuantity,
      ratePerUnit,
      todayDebited,
    }: {
      customerId: bigint;
      lemonQuantity: bigint;
      ratePerUnit: bigint;
      todayDebited: bigint;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.addTransaction(customerId, lemonQuantity, ratePerUnit, todayDebited);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customerBalance', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ transactionId, customerId }: { transactionId: bigint; customerId: bigint }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteTransaction(transactionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customerBalance', variables.customerId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['lemonSummary'] });
      toast.success('Transaction deleted');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });
}

// ─── Lemon Summary ────────────────────────────────────────────────────────────

export function useGetLemonSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<LemonSummary>({
    queryKey: ['lemonSummary'],
    queryFn: async () => {
      if (!actor) {
        return {
          totalCreditDue: BigInt(0),
          totalLemonsSold: BigInt(0),
          totalRupeesCollected: BigInt(0),
          totalProfitOrLoss: BigInt(0),
        };
      }
      return actor.getLemonSummary();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface LemonSummary {
    totalCreditDue: bigint;
    totalRupeesCollected: bigint;
    totalProfitOrLoss: bigint;
    totalLemonsSold: bigint;
}
export interface Customer {
    id: bigint;
    dateCreated: Time;
    name: string;
    phoneNumber: string;
}
export interface Transaction {
    id: bigint;
    date: Time;
    previousCredit: bigint;
    totalAmount: bigint;
    ratePerUnit: bigint;
    customerId: bigint;
    netCredit: bigint;
    lemonQuantity: bigint;
    todayDebited: bigint;
}
export interface backendInterface {
    addCustomer(name: string, phoneNumber: string): Promise<Customer>;
    addTransaction(customerId: bigint, lemonQuantity: bigint, ratePerUnit: bigint, todayDebited: bigint): Promise<Transaction>;
    deleteCustomer(customerId: bigint): Promise<void>;
    deleteTransaction(transactionId: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getCustomerBalance(customerId: bigint): Promise<bigint>;
    getCustomerById(customerId: bigint): Promise<Customer>;
    getLemonSummary(): Promise<LemonSummary>;
    getTransactionsForCustomer(customerId: bigint): Promise<Array<Transaction>>;
}

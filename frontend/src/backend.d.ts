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
export interface CreditPaymentTransaction {
    id: bigint;
    transactionDate: Time;
    transactionType: string;
    resultingCreditBalance: bigint;
    customerId: bigint;
    paymentAmount: bigint;
}
export interface Customer {
    id: bigint;
    dateCreated: Time;
    name: string;
    previousCredit: bigint;
    phoneNumber: string;
}
export interface UserProfile {
    name: string;
    email: string;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(name: string, phoneNumber: string, previousCredit: bigint): Promise<Customer>;
    addTransaction(customerId: bigint, lemonQuantity: bigint, ratePerUnit: bigint, todayDebited: bigint): Promise<Transaction>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCreditPayment(paymentId: bigint): Promise<void>;
    deleteCustomer(customerId: bigint): Promise<void>;
    deleteTransaction(transactionId: bigint): Promise<void>;
    getAllCreditPaymentTransactions(arg0: {
    }): Promise<Array<CreditPaymentTransaction>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCreditPaymentTransactionsForCustomer(customerId: bigint): Promise<Array<CreditPaymentTransaction>>;
    getCustomerBalance(customerId: bigint): Promise<bigint>;
    getCustomerById(customerId: bigint): Promise<Customer>;
    getLemonSummary(): Promise<LemonSummary>;
    getTransactionsForCustomer(customerId: bigint): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    payCreditDue(customerId: bigint, paymentAmount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}

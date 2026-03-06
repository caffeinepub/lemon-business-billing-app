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
    totalCreditDue: number;
    totalRupeesCollected: number;
    totalProfitOrLoss: number;
    totalLemonsSold: number;
}
export interface CreditPaymentTransaction {
    id: bigint;
    transactionDate: Time;
    transactionType: string;
    resultingCreditBalance: number;
    customerId: bigint;
    paymentAmount: number;
}
export interface Customer {
    id: bigint;
    dateCreated: Time;
    name: string;
    previousCredit: number;
    phoneNumber: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface Transaction {
    id: bigint;
    date: Time;
    previousCredit: number;
    totalAmount: number;
    ratePerUnit: number;
    customerId: bigint;
    netCredit: number;
    lemonQuantity: number;
    todayDebited: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(name: string, phoneNumber: string, previousCredit: number): Promise<Customer>;
    addTransaction(customerId: bigint, lemonQuantity: number, ratePerUnit: number, todayDebited: number): Promise<Transaction>;
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
    getCustomerBalance(customerId: bigint): Promise<number>;
    getCustomerById(customerId: bigint): Promise<Customer>;
    getLemonSummary(): Promise<LemonSummary>;
    getTransactionsForCustomer(customerId: bigint): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    payCreditDue(customerId: bigint, paymentAmount: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}

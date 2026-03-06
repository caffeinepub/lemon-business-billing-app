import type { Customer, Transaction } from "../backend";
import { type Language, translations } from "../i18n/translations";

function fmt(value: number): string {
  return value.toFixed(2);
}

export function formatBillText(
  customer: Customer,
  transaction: Transaction,
  language: Language = "en",
): string {
  const tr = translations[language];

  const date = new Date(
    Number(transaction.date) / 1_000_000,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const lines = [
    tr.billHeader,
    "─────────────────────────",
    `${tr.billCustomer} : ${customer.name}`,
    `${tr.billPhone}    : ${customer.phoneNumber}`,
    `${tr.billDateLabel}     : ${date}`,
    "─────────────────────────",
    `${tr.billLemonQty}: ${transaction.lemonQuantity.toFixed(2)} pcs`,
    `${tr.billRateUnit}: ₹${fmt(transaction.ratePerUnit)}`,
    `${tr.billTotalAmt}: ₹${fmt(transaction.totalAmount)}`,
    "─────────────────────────",
    `${tr.billPrevCredit} : ₹${fmt(transaction.previousCredit)}`,
    `${tr.billTodayPaid}  : ₹${fmt(transaction.todayDebited)}`,
    `${tr.billNetCredit}  : ₹${fmt(transaction.netCredit)}`,
    "─────────────────────────",
    tr.billThankYou,
  ];

  return encodeURIComponent(lines.join("\n"));
}

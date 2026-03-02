import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

module {
  type OldUserProfile = {
    name : Text;
    email : Text;
  };

  type OldCustomer = {
    id : Nat;
    name : Text;
    phoneNumber : Text;
    dateCreated : Int;
    previousCredit : Nat;
  };

  type OldTransaction = {
    id : Nat;
    customerId : Nat;
    date : Int;
    lemonQuantity : Nat;
    ratePerUnit : Nat;
    totalAmount : Nat;
    previousCredit : Nat;
    todayDebited : Nat;
    netCredit : Nat;
  };

  type OldCreditPaymentTransaction = {
    id : Nat;
    customerId : Nat;
    transactionDate : Int;
    paymentAmount : Nat;
    resultingCreditBalance : Nat;
    transactionType : Text;
  };

  type OldLemonSummary = {
    totalCreditDue : Nat;
    totalLemonsSold : Nat;
    totalRupeesCollected : Nat;
    totalProfitOrLoss : Nat;
  };

  module OldCustomer {
    public func compare(a : OldCustomer, b : OldCustomer) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module OldTransaction {
    public func compare(a : OldTransaction, b : OldTransaction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type OldActor = {
    nextCustomerId : Nat;
    nextTransactionId : Nat;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    customers : Map.Map<Nat, OldCustomer>;
    transactions : Map.Map<Nat, OldTransaction>;
    customerBalances : Map.Map<Nat, Nat>;
    creditPaymentTransactions : Map.Map<Nat, OldCreditPaymentTransaction>;
  };

  type NewActor = {
    nextCustomerId : Nat;
    nextTransactionId : Nat;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    customers : Map.Map<Nat, NewCustomer>;
    transactions : Map.Map<Nat, NewTransaction>;
    customerBalances : Map.Map<Nat, Float>;
    creditPaymentTransactions : Map.Map<Nat, NewCreditPaymentTransaction>;
  };

  // New types
  type NewCustomer = {
    id : Nat;
    name : Text;
    phoneNumber : Text;
    dateCreated : Int;
    previousCredit : Float;
  };

  type NewTransaction = {
    id : Nat;
    customerId : Nat;
    date : Int;
    lemonQuantity : Float;
    ratePerUnit : Float;
    totalAmount : Float;
    previousCredit : Float;
    todayDebited : Float;
    netCredit : Float;
  };

  type NewCreditPaymentTransaction = {
    id : Nat;
    customerId : Nat;
    transactionDate : Int;
    paymentAmount : Float;
    resultingCreditBalance : Float;
    transactionType : Text;
  };

  public func run(old : OldActor) : NewActor {
    let newCustomers = old.customers.map<Nat, OldCustomer, NewCustomer>(
      func(_id, oldCustomer) {
        {
          oldCustomer with
          previousCredit = oldCustomer.previousCredit.toFloat()
        };
      }
    );

    let newTransactions = old.transactions.map<Nat, OldTransaction, NewTransaction>(
      func(_id, oldTransaction) {
        {
          oldTransaction with
          lemonQuantity = oldTransaction.lemonQuantity.toFloat();
          ratePerUnit = oldTransaction.ratePerUnit.toFloat();
          totalAmount = oldTransaction.totalAmount.toFloat();
          previousCredit = oldTransaction.previousCredit.toFloat();
          todayDebited = oldTransaction.todayDebited.toFloat();
          netCredit = oldTransaction.netCredit.toFloat();
        };
      }
    );

    let newBalances = old.customerBalances.map(
      func(_id, oldBalance) { oldBalance.toFloat() }
    );

    let newCreditPayments = old.creditPaymentTransactions.map<Nat, OldCreditPaymentTransaction, NewCreditPaymentTransaction>(
      func(_id, oldPayment) {
        {
          oldPayment with
          paymentAmount = oldPayment.paymentAmount.toFloat();
          resultingCreditBalance = oldPayment.resultingCreditBalance.toFloat();
        };
      }
    );

    {
      old with
      customers = newCustomers;
      transactions = newTransactions;
      customerBalances = newBalances;
      creditPaymentTransactions = newCreditPayments;
    };
  };
};

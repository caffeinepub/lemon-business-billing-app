import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Customer = {
    id : Nat;
    name : Text;
    phoneNumber : Text;
    dateCreated : Time.Time;
  };

  public type Transaction = {
    id : Nat;
    customerId : Nat;
    date : Time.Time;
    lemonQuantity : Nat;
    ratePerUnit : Nat;
    totalAmount : Nat;
    previousCredit : Nat;
    todayDebited : Nat;
    netCredit : Nat;
  };

  public type LemonSummary = {
    totalCreditDue : Nat;
    totalLemonsSold : Nat;
    totalRupeesCollected : Nat;
    totalProfitOrLoss : Nat;
  };

  module Customer {
    public func compare(a : Customer, b : Customer) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Transaction {
    public func compare(a : Transaction, b : Transaction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  var nextCustomerId = 1;
  var nextTransactionId = 1;

  let customers = Map.empty<Nat, Customer>();
  let transactions = Map.empty<Nat, Transaction>();
  let customerBalances = Map.empty<Nat, Nat>();

  public shared ({ caller }) func addCustomer(name : Text, phoneNumber : Text) : async Customer {
    let customer : Customer = {
      id = nextCustomerId;
      name;
      phoneNumber;
      dateCreated = Time.now();
    };
    customers.add(nextCustomerId, customer);
    customerBalances.add(nextCustomerId, 0);
    nextCustomerId += 1;
    customer;
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    customers.values().toArray().sort();
  };

  public query ({ caller }) func getCustomerById(customerId : Nat) : async Customer {
    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer id " # customerId.toText() # " does not exist!") };
      case (?customer) { customer };
    };
  };

  public shared ({ caller }) func addTransaction(
    customerId : Nat,
    lemonQuantity : Nat,
    ratePerUnit : Nat,
    todayDebited : Nat,
  ) : async Transaction {
    let customerExists = customers.containsKey(customerId);
    if (not customerExists) {
      Runtime.trap("Invalid customer id: " # customerId.toText());
    };

    let prevBalance = switch (customerBalances.get(customerId)) {
      case (null) { Runtime.trap("Customer balance for id " # customerId.toText() # " not found.") };
      case (?balance) { balance };
    };
    let totalAmount = lemonQuantity * ratePerUnit;
    let newBalance = if (totalAmount + prevBalance > todayDebited) {
      totalAmount + prevBalance - todayDebited;
    } else {
      0;
    };

    let transaction : Transaction = {
      id = nextTransactionId;
      customerId;
      date = Time.now();
      lemonQuantity;
      ratePerUnit;
      totalAmount;
      previousCredit = prevBalance;
      todayDebited;
      netCredit = newBalance;
    };

    transactions.add(nextTransactionId, transaction);
    customerBalances.add(customerId, newBalance);
    nextTransactionId += 1;
    transaction;
  };

  public query ({ caller }) func getTransactionsForCustomer(customerId : Nat) : async [Transaction] {
    transactions.values().toArray().filter(func(tx) { tx.customerId == customerId }).sort();
  };

  public query ({ caller }) func getCustomerBalance(customerId : Nat) : async Nat {
    switch (customerBalances.get(customerId)) {
      case (null) { Runtime.trap("Customer id " # customerId.toText() # " does not have credit balance!") };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func deleteCustomer(customerId : Nat) : async () {
    let customerExists = customers.containsKey(customerId);
    if (not customerExists) {
      Runtime.trap("Invalid customer id: " # customerId.toText());
    };

    customers.remove(customerId);
    customerBalances.remove(customerId);

    let transactionEntriesToRemove = transactions.entries().toArray().filter(
      func(entry) {
        let (id, transaction) = entry;
        transaction.customerId == customerId;
      }
    );

    let transactionIdsToRemove = transactionEntriesToRemove.map(
      func(entry) {
        let (id, _) = entry;
        id;
      }
    );

    for (id in transactionIdsToRemove.values()) {
      transactions.remove(id);
    };
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Nat) : async () {
    let txOpt = transactions.get(transactionId);
    switch (txOpt) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) {
        let customerId = transaction.customerId;

        ignore transaction;
        transactions.remove(transactionId);

        // Recalculate the customer's balance
        let remainingTransactions = transactions.values().toArray().filter(
          func(tx) { tx.customerId == customerId }
        );

        let balance = remainingTransactions.foldLeft(
          0,
          func(acc, tx) { acc + tx.netCredit },
        );

        customerBalances.add(customerId, balance);
      };
    };
  };

  public query ({ caller }) func getLemonSummary() : async LemonSummary {
    var totalCreditDue = 0;
    var totalLemonsSold = 0;
    var totalRupeesCollected = 0;

    for (balance in customerBalances.values()) {
      totalCreditDue += balance;
    };

    for (tr in transactions.values()) {
      totalLemonsSold += tr.lemonQuantity;
      totalRupeesCollected += tr.totalAmount;
    };

    let totalProfitOrLoss = totalRupeesCollected - totalCreditDue;

    return {
      totalCreditDue;
      totalLemonsSold;
      totalRupeesCollected;
      totalProfitOrLoss;
    };
  };
};

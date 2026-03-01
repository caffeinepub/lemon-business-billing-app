import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can get profiles") };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type Customer = {
    id : Nat;
    name : Text;
    phoneNumber : Text;
    dateCreated : Time.Time;
    previousCredit : Nat;
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

  public type CreditPaymentTransaction = {
    id : Nat;
    customerId : Nat;
    transactionDate : Time.Time;
    paymentAmount : Nat;
    resultingCreditBalance : Nat;
    transactionType : Text;
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
  let creditPaymentTransactions = Map.empty<Nat, CreditPaymentTransaction>();

  public shared ({ caller }) func addCustomer(name : Text, phoneNumber : Text, previousCredit : Nat) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can add customers") };
    let customer : Customer = {
      id = nextCustomerId;
      name;
      phoneNumber;
      dateCreated = Time.now();
      previousCredit;
    };
    customers.add(nextCustomerId, customer);
    customerBalances.add(nextCustomerId, previousCredit);
    nextCustomerId += 1;
    customer;
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view customers") };
    customers.values().toArray().sort();
  };

  public query ({ caller }) func getCustomerById(customerId : Nat) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view customers") };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can add transactions") };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view transactions") };
    transactions.values().toArray().filter(func(tx) { tx.customerId == customerId }).sort();
  };

  public query ({ caller }) func getCustomerBalance(customerId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view customer balances") };
    switch (customerBalances.get(customerId)) {
      case (null) { Runtime.trap("Customer id " # customerId.toText() # " does not have credit balance!") };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func deleteCustomer(customerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can delete customers") };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can delete transactions") };
    let txOpt = transactions.get(transactionId);
    switch (txOpt) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) {
        let customerId = transaction.customerId;

        ignore transaction;
        transactions.remove(transactionId);

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

  public shared ({ caller }) func payCreditDue(customerId : Nat, paymentAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can record credit due payments") };
    let balanceOpt = customerBalances.get(customerId);
    switch (balanceOpt) {
      case (null) {
        Runtime.trap("Customer id " # customerId.toText() # " does not have credit balance!");
      };
      case (?balance) {
        if (paymentAmount > balance) {
          Runtime.trap("Payment amount exceeds outstanding credit due. Balance: " # balance.toText());
        };

        let newBalance = balance - paymentAmount;
        customerBalances.add(customerId, newBalance);

        let paymentTransaction : CreditPaymentTransaction = {
          id = nextTransactionId;
          customerId;
          transactionDate = Time.now();
          paymentAmount;
          resultingCreditBalance = newBalance;
          transactionType = "Credit Due Payment";
        };

        creditPaymentTransactions.add(nextTransactionId, paymentTransaction);
        nextTransactionId += 1;
      };
    };
  };

  public query ({ caller }) func getLemonSummary() : async LemonSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view the lemon summary") };
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

    {
      totalCreditDue;
      totalLemonsSold;
      totalRupeesCollected;
      totalProfitOrLoss;
    };
  };

  public query ({ caller }) func getAllCreditPaymentTransactions(_ : {}) : async [CreditPaymentTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view credit payment transactions") };
    creditPaymentTransactions.values().toArray();
  };

  public query ({ caller }) func getCreditPaymentTransactionsForCustomer(customerId : Nat) : async [CreditPaymentTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view credit payment transactions") };
    creditPaymentTransactions.values().toArray().filter(func(tx) { tx.customerId == customerId });
  };

  public shared ({ caller }) func deleteCreditPayment(paymentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete credit payment records");
    };
    let paymentRecordExists = creditPaymentTransactions.containsKey(paymentId);
    if (not paymentRecordExists) {
      Runtime.trap("Invalid payment record id: " # paymentId.toText());
    };
    creditPaymentTransactions.remove(paymentId);
  };
};

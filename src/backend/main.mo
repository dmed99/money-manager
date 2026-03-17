import Map "mo:core/Map";
import List "mo:core/List";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type Transaction = {
    id : Nat;
    transactionType : { #income; #expense };
    amount : Float;
    category : Text;
    description : Text;
    date : Text;
    timestamp : Time.Time;
  };

  module Transaction {
    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };

    public func compareByDate(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t1.timestamp, t2.timestamp);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let nextTransactionId = Map.empty<Principal, Nat>();
  let budgets = Map.empty<Principal, Map.Map<Text, Float>>();
  let transactions = Map.empty<Principal, List.List<Transaction>>();

  func getAndIncrementNextTransactionId(caller : Principal) : Nat {
    let id = switch (nextTransactionId.get(caller)) {
      case (null) { 1 };
      case (?existingId) { existingId + 1 };
    };
    nextTransactionId.add(caller, id + 1);
    id;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
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

  public shared ({ caller }) func addTransaction(transactionType : { #income; #expense }, amount : Float, category : Text, description : Text, date : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    let transaction : Transaction = {
      id = getAndIncrementNextTransactionId(caller);
      transactionType;
      amount;
      category;
      description;
      date;
      timestamp = Time.now();
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { List.empty<Transaction>() };
      case (?existingTransactions) { existingTransactions };
    };
    userTransactions.add(transaction);
    transactions.add(caller, userTransactions);
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };

    switch (transactions.get(caller)) {
      case (null) { false };
      case (?userTransactions) {
        let filteredTransactions = userTransactions.filter(
          func(t) { t.id != transactionId }
        );
        transactions.add(caller, filteredTransactions);
        true;
      };
    };
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    switch (transactions.get(caller)) {
      case (null) { [] };
      case (?userTransactions) {
        userTransactions.toArray().sort(Transaction.compareByDate);
      };
    };
  };

  public shared ({ caller }) func updateBudget(category : Text, amount : Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update budgets");
    };

    let userBudgets = switch (budgets.get(caller)) {
      case (null) { Map.empty<Text, Float>() };
      case (?existingBudgets) { existingBudgets };
    };
    userBudgets.add(category, amount);
    budgets.add(caller, userBudgets);
  };

  public query ({ caller }) func getBudgets() : async [(Text, Float)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view budgets");
    };
    switch (budgets.get(caller)) {
      case (null) { [] };
      case (?userBudgets) {
        let budgetsIter = userBudgets.entries();
        let budgetsArray = budgetsIter.toArray();
        budgetsArray;
      };
    };
  };

  public query ({ caller }) func getSummary() : async {
    totalIncome : Float;
    totalExpenses : Float;
    netBalance : Float;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view summaries");
    };

    var totalIncome = 0.0;
    var totalExpenses = 0.0;

    switch (transactions.get(caller)) {
      case (null) {};
      case (?userTransactions) {
        let transactionsIter = userTransactions.values();
        for (transaction in transactionsIter) {
          switch (transaction.transactionType) {
            case (#income) { totalIncome += transaction.amount };
            case (#expense) { totalExpenses += transaction.amount };
          };
        };
      };
    };

    {
      totalIncome;
      totalExpenses;
      netBalance = totalIncome - totalExpenses;
    };
  };

  public query ({ caller }) func getCategoryBreakdown() : async [(Text, Float)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view breakdowns");
    };

    let breakdown = Map.empty<Text, Float>();

    switch (transactions.get(caller)) {
      case (null) {};
      case (?userTransactions) {
        let transactionsIter = userTransactions.values();
        for (transaction in transactionsIter) {
          if (transaction.transactionType == #expense) {
            let currentAmount = switch (breakdown.get(transaction.category)) {
              case (null) { 0.0 };
              case (?existingAmount) { existingAmount };
            };
            breakdown.add(transaction.category, currentAmount + transaction.amount);
          };
        };
      };
    };

    breakdown.entries().toArray();
  };
};

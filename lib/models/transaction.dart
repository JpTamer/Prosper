class Transaction {
  final int? id;
  final int userId;
  final String description;
  final double amount;
  final String type; // 'Income' or 'Expense'
  final DateTime datetime;

  Transaction({
    this.id,
    required this.userId,
    required this.description,
    required this.amount,
    required this.type,
    required this.datetime,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      userId: json['user_id'],
      description: json['description'],
      amount: double.parse(json['amount'].toString()),
      type: json['type'],
      datetime: DateTime.parse(json['datetime']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'description': description,
      'amount': amount,
      'type': type,
      'datetime': datetime.toIso8601String(),
    };
  }
}

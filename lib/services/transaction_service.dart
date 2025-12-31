import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/transaction.dart';

class TransactionService {
  static const String baseUrl = 'https://prosper-iymc.onrender.com';

  // Get all transactions for a user
  static Future<List<Transaction>> getTransactions(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/transactions/$userId'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Transaction.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load transactions');
      }
    } catch (e) {
      throw Exception('Error fetching transactions: $e');
    }
  }

  // Add a new transaction
  static Future<void> addTransaction(Transaction transaction) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/transactions'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(transaction.toJson()),
      );

      if (response.statusCode != 201) {
        throw Exception('Failed to add transaction');
      }
    } catch (e) {
      throw Exception('Error adding transaction: $e');
    }
  }

  // Delete a transaction
  static Future<void> deleteTransaction(int transactionId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/transactions/$transactionId'),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete transaction');
      }
    } catch (e) {
      throw Exception('Error deleting transaction: $e');
    }
  }

  // Get financial summary
  static Future<Map<String, double>> getSummary(int userId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/summary/$userId'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'income': double.parse(data['income'].toString()),
          'expenses': double.parse(data['expenses'].toString()),
          'balance': double.parse(data['balance'].toString()),
        };
      } else {
        throw Exception('Failed to load summary');
      }
    } catch (e) {
      throw Exception('Error fetching summary: $e');
    }
  }

  // End month and archive transactions
  static Future<Map<String, dynamic>> endMonth(int userId) async {
    try {
      final response = await http.post(Uri.parse('$baseUrl/end-month/$userId'));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to end month');
      }
    } catch (e) {
      throw Exception('Error ending month: $e');
    }
  }

  // Get monthly history
  static Future<List<dynamic>> getMonthlyHistory(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/monthly-history/$userId'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load monthly history');
      }
    } catch (e) {
      throw Exception('Error fetching monthly history: $e');
    }
  }
}

import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class Opportunity {
  final String symbol;
  final String buyExchange;
  final double buyPrice;
  final String sellExchange;
  final double sellPrice;
  final double netProfitPct;
  final double grossProfitPct;
  final int timestamp;

  Opportunity({
    required this.symbol,
    required this.buyExchange,
    required this.buyPrice,
    required this.sellExchange,
    required this.sellPrice,
    required this.netProfitPct,
    required this.grossProfitPct,
    required this.timestamp,
  });

  factory Opportunity.fromJson(Map<String, dynamic> json) {
    return Opportunity(
      symbol: json['symbol'] as String,
      buyExchange: json['buy_exchange'] as String,
      buyPrice: (json['buy_price'] as num).toDouble(),
      sellExchange: json['sell_exchange'] as String,
      sellPrice: (json['sell_price'] as num).toDouble(),
      netProfitPct: (json['net_profit_pct'] as num).toDouble(),
      grossProfitPct: (json['gross_profit_pct'] as num).toDouble(),
      timestamp: json['timestamp'] as int,
    );
  }
}

class TickerData {
  final String symbol;
  final double avgPrice;
  final List<ExchangePrice> exchanges;

  TickerData({
    required this.symbol,
    required this.avgPrice,
    required this.exchanges,
  });

  factory TickerData.fromJson(Map<String, dynamic> json) {
    return TickerData(
      symbol: json['symbol'] as String,
      avgPrice: (json['avg_price'] as num).toDouble(),
      exchanges: (json['exchanges'] as List)
          .map((e) => ExchangePrice.fromJson(e))
          .toList(),
    );
  }
}

class ExchangePrice {
  final String exchange;
  final double price;

  ExchangePrice({required this.exchange, required this.price});

  factory ExchangePrice.fromJson(Map<String, dynamic> json) {
    return ExchangePrice(
      exchange: json['exchange'] as String,
      price: (json['price'] as num).toDouble(),
    );
  }
}

class WebSocketService {
  WebSocketChannel? _channel;
  final StreamController<Opportunity> _opportunityController =
      StreamController<Opportunity>.broadcast();
  final StreamController<Map<String, TickerData>> _tickerController =
      StreamController<Map<String, TickerData>>.broadcast();

  Stream<Opportunity> get opportunityStream => _opportunityController.stream;
  Stream<Map<String, TickerData>> get tickerStream => _tickerController.stream;

  bool get isConnected => _channel != null;

  void connect(String url) {
    if (_channel != null) {
      disconnect();
    }

    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
      _channel!.stream.listen(
        (message) {
          try {
            final data = json.decode(message as String);
            final type = data['type'] as String;

            if (type == 'opportunity') {
              final opportunity = Opportunity.fromJson(data['data'] as Map<String, dynamic>);
              _opportunityController.add(opportunity);
            } else if (type == 'ticker') {
              final tickerMap = <String, TickerData>{};
              final tickerData = data['data'] as Map<String, dynamic>;
              tickerData.forEach((key, value) {
                tickerMap[key] = TickerData.fromJson(value as Map<String, dynamic>);
              });
              _tickerController.add(tickerMap);
            }
          } catch (e) {
            print('Error parsing WebSocket message: $e');
          }
        },
        onError: (error) {
          print('WebSocket error: $error');
          _channel = null;
        },
        onDone: () {
          print('WebSocket connection closed');
          _channel = null;
        },
      );
    } catch (e) {
      print('Error connecting to WebSocket: $e');
      _channel = null;
    }
  }

  void disconnect() {
    _channel?.sink.close();
    _channel = null;
  }

  void dispose() {
    disconnect();
    _opportunityController.close();
    _tickerController.close();
  }
}

final webSocketServiceProvider = Provider<WebSocketService>((ref) {
  final service = WebSocketService();
  service.connect('ws://localhost:8000/ws');

  ref.onDispose(() {
    service.dispose();
  });

  return service;
});

final opportunitiesProvider =
    StreamProvider<List<Opportunity>>((ref) async* {
  final wsService = ref.watch(webSocketServiceProvider);
  final opportunities = <Opportunity>[];

  await for (final opportunity in wsService.opportunityStream) {
    final existingIndex = opportunities.indexWhere(
      (o) => o.symbol == opportunity.symbol &&
          o.buyExchange == opportunity.buyExchange &&
          o.sellExchange == opportunity.sellExchange,
    );

    if (existingIndex >= 0) {
      opportunities[existingIndex] = opportunity;
    } else {
      opportunities.add(opportunity);
    }

    opportunities.sort((a, b) => b.netProfitPct.compareTo(a.netProfitPct));
    yield List.from(opportunities);
  }
});

final tickerDataProvider =
    StreamProvider<Map<String, TickerData>>((ref) async* {
  final wsService = ref.watch(webSocketServiceProvider);

  await for (final tickerMap in wsService.tickerStream) {
    yield tickerMap;
  }
});

final connectionStatusProvider = Provider<bool>((ref) {
  final wsService = ref.watch(webSocketServiceProvider);
  return wsService.isConnected;
});

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:arbhunter/providers/websocket_provider.dart';

class TickerTape extends ConsumerWidget {
  const TickerTape({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tickerAsync = ref.watch(tickerDataProvider);

    return Container(
      height: 50,
      color: Colors.black,
      child: tickerAsync.when(
        data: (tickerMap) {
          if (tickerMap.isEmpty) {
            return Center(
              child: Text(
                'Loading market data...',
                style: TextStyle(
                  fontFamily: 'monospace',
                  color: const Color(0xFF00FF41).withOpacity(0.5),
                ),
              ),
            );
          }

          return ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: tickerMap.length,
            itemBuilder: (context, index) {
              final symbol = tickerMap.keys.elementAt(index);
              final ticker = tickerMap[symbol]!;
              final formattedPrice = ticker.avgPrice.toStringAsFixed(2);

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: const Color(0xFF00FF41).withOpacity(0.3),
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      symbol,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        color: Color(0xFF00FF41),
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '\$$formattedPrice',
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        color: Color(0xFF00FF41),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => Center(
          child: Text(
            'Connecting to market feed...',
            style: TextStyle(
              fontFamily: 'monospace',
              color: const Color(0xFF00FF41).withOpacity(0.5),
            ),
          ),
        ),
        error: (error, stack) => Center(
          child: Text(
            'Error: $error',
            style: const TextStyle(
              fontFamily: 'monospace',
              color: Colors.red,
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:arbhunter/providers/websocket_provider.dart';
import 'package:data_table_2/data_table_2.dart';

class OpportunityGrid extends ConsumerWidget {
  const OpportunityGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final opportunitiesAsync = ref.watch(opportunitiesProvider);

    return opportunitiesAsync.when(
      data: (opportunities) {
        if (opportunities.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.search_off,
                  size: 64,
                  color: const Color(0xFF00FF41).withOpacity(0.3),
                ),
                const SizedBox(height: 16),
                Text(
                  'No arbitrage opportunities found',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 18,
                    color: const Color(0xFF00FF41).withOpacity(0.5),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Monitoring markets...',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: const Color(0xFF00FF41).withOpacity(0.3),
                  ),
                ),
              ],
            ),
          );
        }

        return DataTable2(
          columnSpacing: 20,
          horizontalMargin: 20,
          minWidth: 1000,
          headingRowDecoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: const Color(0xFF00FF41).withOpacity(0.3),
                width: 1,
              ),
            ),
          ),
          headingRowHeight: 40,
          dataRowHeight: 50,
          columns: const [
            DataColumn2(
              label: Text(
                'SYMBOL',
                style: TextStyle(
                  fontFamily: 'monospace',
                  color: Color(0xFF00FF41),
                  fontWeight: FontWeight.bold,
                ),
              ),
              size: ColumnSize.S,
            ),
            DataColumn2(
              label: Text(
                'BUY AT',
                style: TextStyle(
                  fontFamily: 'monospace',
                  color: Color(0xFF00FF41),
                  fontWeight: FontWeight.bold,
                ),
              ),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text(
                'SELL AT',
                style: TextStyle(
                  fontFamily: 'monospace',
                  color: Color(0xFF00FF41),
                  fontWeight: FontWeight.bold,
                ),
              ),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text(
                'NET PROFIT %',
                style: TextStyle(
                  fontFamily: 'monospace',
                  color: Color(0xFF00FF41),
                  fontWeight: FontWeight.bold,
                ),
              ),
              size: ColumnSize.M,
            ),
            DataColumn2(
              label: Text(
                'ACTION',
                style: TextStyle(
                  fontFamily: 'monospace',
                  color: Color(0xFF00FF41),
                  fontWeight: FontWeight.bold,
                ),
              ),
              size: ColumnSize.S,
            ),
          ],
          rows: opportunities.map((opp) {
            final profitColor = opp.netProfitPct > 1.0
                ? const Color(0xFF00FF41)
                : opp.netProfitPct > 0.7
                    ? Colors.yellow
                    : const Color(0xFF00FF41).withOpacity(0.7);

            return DataRow2(
              cells: [
                DataCell(
                  Text(
                    opp.symbol,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      color: Color(0xFF00FF41),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                DataCell(
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        opp.buyExchange.toUpperCase(),
                        style: TextStyle(
                          fontFamily: 'monospace',
                          color: const Color(0xFF00FF41).withOpacity(0.7),
                          fontSize: 10,
                        ),
                      ),
                      Text(
                        '\$${opp.buyPrice.toStringAsFixed(4)}',
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          color: Color(0xFF00FF41),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                DataCell(
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        opp.sellExchange.toUpperCase(),
                        style: TextStyle(
                          fontFamily: 'monospace',
                          color: const Color(0xFF00FF41).withOpacity(0.7),
                          fontSize: 10,
                        ),
                      ),
                      Text(
                        '\$${opp.sellPrice.toStringAsFixed(4)}',
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          color: Color(0xFF00FF41),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: profitColor.withOpacity(0.1),
                      border: Border.all(
                        color: profitColor,
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '+${opp.netProfitPct.toStringAsFixed(3)}%',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        color: profitColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
                DataCell(
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Trade execution not implemented\n'
                            'Buy ${opp.symbol} on ${opp.buyExchange} at \$${opp.buyPrice.toStringAsFixed(4)}\n'
                            'Sell on ${opp.sellExchange} at \$${opp.sellPrice.toStringAsFixed(4)}',
                            style: const TextStyle(
                              fontFamily: 'monospace',
                            ),
                          ),
                          backgroundColor: Colors.black,
                          duration: const Duration(seconds: 5),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: const Color(0xFF00FF41),
                      side: const BorderSide(
                        color: Color(0xFF00FF41),
                        width: 1,
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                    ),
                    child: const Text(
                      'TRADE',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        );
      },
      loading: () => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(
              color: Color(0xFF00FF41),
            ),
            const SizedBox(height: 16),
            Text(
              'Scanning markets for opportunities...',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 14,
                color: const Color(0xFF00FF41).withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Error: $error',
              style: const TextStyle(
                fontFamily: 'monospace',
                color: Colors.red,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

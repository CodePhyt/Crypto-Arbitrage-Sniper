import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:arbhunter/providers/websocket_provider.dart';
import 'package:arbhunter/widgets/ticker_tape.dart';
import 'package:arbhunter/widgets/opportunity_grid.dart';
import 'package:arbhunter/services/sound_service.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final SoundService _soundService = SoundService();

  @override
  void initState() {
    super.initState();
    _soundService.initialize();
  }

  void _checkForAlerts(List<Opportunity> opportunities) {
    for (final opp in opportunities) {
      if (opp.netProfitPct > 1.0) {
        _soundService.playAlert();
        break;
      }
    }
  }

  @override
  void dispose() {
    _soundService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isConnected = ref.watch(connectionStatusProvider);

    ref.listen<AsyncValue<List<Opportunity>>>(
      opportunitiesProvider,
      (previous, next) {
        next.whenData((opportunities) {
          _checkForAlerts(opportunities);
        });
      },
    );

    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.black,
              border: Border(
                bottom: BorderSide(
                  color: const Color(0xFF00FF41).withOpacity(0.3),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      'ARBHUNTER',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF00FF41),
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(width: 20),
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isConnected
                            ? const Color(0xFF00FF41)
                            : Colors.red,
                        boxShadow: isConnected
                            ? [
                                BoxShadow(
                                  color: const Color(0xFF00FF41).withOpacity(0.6),
                                  blurRadius: 8,
                                  spreadRadius: 2,
                                )
                              ]
                            : null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isConnected ? 'CONNECTED' : 'DISCONNECTED',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: isConnected
                            ? const Color(0xFF00FF41)
                            : Colors.red,
                      ),
                    ),
                  ],
                ),
                Text(
                  'CRYPTO ARBITRAGE SCANNER',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 14,
                    color: const Color(0xFF00FF41).withOpacity(0.7),
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
          const TickerTape(),
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black,
                border: Border.all(
                  color: const Color(0xFF00FF41).withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: const OpportunityGrid(),
            ),
          ),
        ],
      ),
    );
  }
}

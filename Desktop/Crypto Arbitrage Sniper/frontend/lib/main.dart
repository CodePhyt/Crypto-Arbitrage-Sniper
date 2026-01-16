import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:arbhunter/screens/dashboard_screen.dart';

void main() {
  runApp(const ProviderScope(child: ArbHunterApp()));
}

class ArbHunterApp extends StatelessWidget {
  const ArbHunterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ArbHunter - Crypto Arbitrage Scanner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
        primaryColor: const Color(0xFF00FF41),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00FF41),
          onPrimary: Colors.black,
          secondary: Color(0xFF00FF41),
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(
            fontFamily: 'monospace',
            color: Color(0xFF00FF41),
            fontSize: 14,
          ),
          bodyMedium: TextStyle(
            fontFamily: 'monospace',
            color: Color(0xFF00FF41),
            fontSize: 12,
          ),
        ),
      ),
      home: const DashboardScreen(),
    );
  }
}

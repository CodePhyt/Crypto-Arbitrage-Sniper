# ArbHunter - Crypto Arbitrage Scanner

A high-frequency cryptocurrency arbitrage scanner that detects price discrepancies between Binance, MEXC, and KuCoin in real-time with a Bloomberg Terminal-style desktop dashboard.

## Architecture

- **Backend:** Python 3.12 + FastAPI + CCXT + Asyncio
- **Frontend:** Flutter Desktop (Windows/macOS) + Riverpod
- **Communication:** WebSockets for real-time data streaming

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```
   
   Or use the startup script:
   ```bash
   python run.py
   ```

   The API will be available at `http://localhost:8000`
   WebSocket endpoint: `ws://localhost:8000/ws`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

3. Run the Flutter app:
   ```bash
   # For Windows:
   flutter run -d windows
   
   # For macOS:
   flutter run -d macos
   ```

## Features

- **Real-time Market Scanning:** Scans top 50 cryptocurrency pairs every 3 seconds
- **Multi-Exchange Support:** Monitors Binance, MEXC, and KuCoin simultaneously
- **Arbitrage Detection:** Calculates net profit after fees (0.2% total, 0.1% per trade)
- **Bloomberg Terminal UI:** Dark theme with neon green accents and monospaced fonts
- **Live Ticker Tape:** Real-time price updates for major cryptocurrencies
- **Opportunity Grid:** Detailed data table showing profitable arbitrage opportunities
- **Sound Alerts:** Audio notifications for opportunities with >1% profit

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application with WebSocket server
│   ├── exchange_manager.py  # Exchange connection management
│   ├── market_scanner.py    # Market scanning logic
│   ├── arb_calculator.py    # Arbitrage calculation engine
│   ├── requirements.txt     # Python dependencies
│   └── run.py              # Startup script
├── frontend/
│   ├── lib/
│   │   ├── main.dart                    # Flutter app entry point
│   │   ├── providers/
│   │   │   └── websocket_provider.dart # WebSocket state management
│   │   ├── screens/
│   │   │   └── dashboard_screen.dart   # Main dashboard UI
│   │   ├── widgets/
│   │   │   ├── ticker_tape.dart        # Live ticker widget
│   │   │   └── opportunity_grid.dart   # Opportunities data grid
│   │   └── services/
│   │       └── sound_service.dart      # Sound alert service
│   ├── pubspec.yaml         # Flutter dependencies
│   └── assets/
│       └── sounds/          # Sound files (optional)
└── roadmap.txt              # Project specifications
```

## Configuration

### Arbitrage Parameters

- **Minimum Profit Threshold:** 0.5% net profit (configurable in `arb_calculator.py`)
- **Taker Fee:** 0.1% per trade (0.2% total for round trip)
- **Scan Interval:** 3 seconds (configurable in `market_scanner.py`)
- **Sound Alert Threshold:** >1% profit (configurable in `dashboard_screen.dart`)

### Supported Exchanges

The backend connects to public APIs only. No API keys required for market data:
- Binance
- MEXC
- KuCoin

## Notes

- The scanner only flags opportunities with net profit > 0.5% after accounting for trading fees
- All calculations include fee deductions automatically
- The frontend requires the backend to be running for full functionality
- Sound alerts require an `alert.wav` file in `frontend/assets/sounds/` (optional)

## License

This project is for educational and research purposes.

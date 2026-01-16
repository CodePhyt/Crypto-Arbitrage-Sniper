# ArbHunter Backend

FastAPI backend for the ArbHunter Crypto Arbitrage Scanner.

## Setup

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

- `GET /` - Root endpoint with status
- `GET /health` - Health check
- `WS /ws` - WebSocket endpoint for real-time arbitrage opportunities and ticker updates

## Configuration

The backend connects to Binance, MEXC, and KuCoin public APIs. No API keys are required for fetching public market data. The exchanges are configured without authentication keys as they're only used for public data access.

## Scanning

The backend scans the top 50 cryptocurrency pairs every 3 seconds and calculates arbitrage opportunities. Only opportunities with net profit > 0.5% (after 0.2% total fees) are broadcasted to connected clients.

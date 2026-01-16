# ArbHunter - Setup & Quick Start Guide

## Prerequisites

### Backend Requirements
- Python 3.12 or higher
- pip (Python package manager)

### Frontend Requirements
- Flutter SDK 3.0.0 or higher
- Dart SDK 3.5.0 or higher
- For Windows: Visual Studio with C++ tools
- For macOS: Xcode

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
# OR
python run.py
```

The backend will start on `http://localhost:8000`
WebSocket endpoint: `ws://localhost:8000/ws`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Flutter dependencies
flutter pub get

# Run the app
# Windows:
flutter run -d windows
# macOS:
flutter run -d macos
```

## Quick Test

### Test Backend (Terminal 1)
```bash
cd backend
python main.py
```

You should see:
```
ArbHunter backend started - Scanning for opportunities...
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Test Frontend (Terminal 2)
```bash
cd frontend
flutter run -d windows  # or macos
```

The Flutter app should launch and connect to the backend automatically.

### Verify Connection

1. Check backend terminal - you should see scan logs
2. Check Flutter app - connection indicator should show "CONNECTED" in green
3. Ticker tape should show cryptocurrency prices updating
4. If opportunities are found, they'll appear in the grid

## Troubleshooting

### Backend Issues

**Error: Module not found**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

**Error: CCXT connection issues**
- Check internet connection
- Exchanges may rate limit - the code handles this automatically
- Wait a few seconds and try again

### Frontend Issues

**Error: Flutter packages not found**
- Run `flutter pub get` in the frontend directory
- Ensure Flutter SDK is properly installed (`flutter doctor`)

**Error: Cannot connect to backend**
- Make sure backend is running on port 8000
- Check firewall settings
- Verify WebSocket URL: `ws://localhost:8000/ws`

**No data showing**
- Wait a few seconds for the first scan cycle (scans every 3 seconds)
- Check backend logs for errors
- Verify exchanges are accessible from your network

## Configuration

### Change Scan Interval
Edit `backend/market_scanner.py`:
```python
self.scan_interval = 3.0  # Change to desired seconds
```

### Change Minimum Profit Threshold
Edit `backend/arb_calculator.py`:
```python
MIN_PROFIT_THRESHOLD = 0.005  # 0.5% - change as needed
```

### Change Sound Alert Threshold
Edit `frontend/lib/screens/dashboard_screen.dart`:
```dart
if (opp.netProfitPct > 1.0) {  # Change 1.0 to desired percentage
```

## Adding Sound Alerts

1. Place an `alert.wav` file in `frontend/assets/sounds/`
2. The file should be a valid WAV audio file
3. If no file is present, the app will work but without sound alerts

## Project Status

✅ All code implemented
✅ All linter errors fixed
✅ Backend and frontend properly configured
✅ WebSocket communication setup
✅ Ready for testing and deployment

## Next Steps

1. Start both backend and frontend
2. Monitor the dashboard for arbitrage opportunities
3. Customize thresholds and scan intervals as needed
4. Add your own sound alert file (optional)

Happy hunting! 🚀

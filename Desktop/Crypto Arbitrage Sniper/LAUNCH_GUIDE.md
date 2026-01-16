# ArbHunter - Launch Guide 🚀

Complete step-by-step guide to launch and run ArbHunter.

## Pre-Flight Checklist

Before launching, ensure you have:

- [ ] Python 3.12+ installed (`python --version`)
- [ ] pip installed (`pip --version`)
- [ ] Flutter SDK 3.0.0+ installed (`flutter --version`)
- [ ] Internet connection (required for exchange APIs)
- [ ] Windows or macOS (for desktop app)

## Launch Sequence

### Terminal 1: Backend Server

**Step 1:** Open a terminal and navigate to the project
```bash
cd "C:\Users\Kadir\Desktop\Crypto Arbitrage Sniper"
```

**Step 2:** Navigate to backend directory
```bash
cd backend
```

**Step 3:** Create virtual environment (first time only)
```bash
python -m venv venv
```

**Step 4:** Activate virtual environment
```bash
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

**Step 5:** Install dependencies (first time only)
```bash
pip install -r requirements.txt
```

**Step 6:** Optional - Test connections
```bash
python test_connection.py
```

**Expected Output:**
```
Testing ArbHunter Backend Setup...

Testing ticker fetch for BTC/USDT...

Testing BINANCE... ✅ SUCCESS
   Bid: $xxxxx.xx
   Ask: $xxxxx.xx
   Last: $xxxxx.xx

Testing MEXC... ✅ SUCCESS
...

Testing KUCOIN... ✅ SUCCESS
...
```

**Step 7:** Start the backend server
```bash
python main.py
```

**Expected Output:**
```
ArbHunter backend started - Scanning for opportunities...
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ **Backend is now running! Keep this terminal open.**

---

### Terminal 2: Flutter Frontend

**Step 1:** Open a NEW terminal window
```bash
cd "C:\Users\Kadir\Desktop\Crypto Arbitrage Sniper"
```

**Step 2:** Navigate to frontend directory
```bash
cd frontend
```

**Step 3:** Install Flutter dependencies (first time only)
```bash
flutter pub get
```

**Step 4:** Run the Flutter app
```bash
# For Windows:
flutter run -d windows

# For macOS:
flutter run -d macos
```

**Expected Output:**
```
Launching lib\main.dart on Windows in debug mode...
Building Windows application...
Running Gradle task 'assembleDebug'...
√ Built build\windows\x64\runner\Debug\arbhunter.exe

Flutter run key commands.
...
```

**Step 5:** Wait for app window to open
- A desktop window should appear
- You should see the ArbHunter dashboard

✅ **Frontend is now running!**

---

## Verification Steps

### 1. Check Backend Status

**In Terminal 1 (Backend):**
- ✅ Should show "Uvicorn running on http://0.0.0.0:8000"
- ✅ Should show "Scanning for opportunities..."
- ✅ No error messages

**Browser Test:**
```
Open: http://localhost:8000
Should see: {"status":"ArbHunter API is running",...}
```

### 2. Check Frontend Status

**In App Window:**
- ✅ Title bar shows "ARBHUNTER"
- ✅ Connection indicator shows "CONNECTED" (green)
- ✅ Ticker tape is visible at the top
- ✅ Opportunities grid is visible below

**In Terminal 2 (Frontend):**
- ✅ Should show "Flutter run key commands"
- ✅ No error messages

### 3. Verify Data Flow

**Wait 5-10 seconds for first scan:**
- ✅ Ticker tape should show cryptocurrency prices
- ✅ Prices should update continuously
- ✅ Backend console should show scan logs

**After 30 seconds:**
- ✅ If opportunities exist, they appear in the grid
- ✅ Opportunities sorted by profit percentage
- ✅ Each row shows: Symbol, Buy At, Sell At, Net Profit %

## Quick Launch Scripts

### Windows (Double-click to start backend)
```
start_backend.bat
```

### macOS/Linux (Run from terminal)
```bash
chmod +x start_backend.sh
./start_backend.sh
```

**Note:** These scripts start the backend only. You still need to start the frontend separately.

## What to Expect

### First Launch (First 10 seconds):
1. Backend connects to exchanges
2. Frontend connects to backend via WebSocket
3. First market scan completes
4. Ticker prices appear

### Normal Operation:
1. **Every 1 second:** Ticker prices update
2. **Every 3 seconds:** Market scan runs
3. **When opportunities found:** Appear in grid
4. **If profit >1%:** Sound alert triggers (if file present)

### Sample Console Output

**Backend:**
```
ArbHunter backend started - Scanning for opportunities...
INFO:     Uvicorn running on http://0.0.0.0:8000
Scanning markets...
Found 3 opportunities
Broadcasting opportunities...
```

**Frontend:**
```
Flutter run key commands.
r Hot reload.
R Hot restart.
q Quit application.
```

## Troubleshooting

### Backend Won't Start

**Issue:** `ModuleNotFoundError`
```bash
# Solution: Install dependencies
cd backend
pip install -r requirements.txt
```

**Issue:** `Port already in use`
```bash
# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill
```

**Issue:** Exchange connection errors
- Check internet connection
- Exchanges may be rate limiting (wait 10 seconds)
- Try running `python test_connection.py`

### Frontend Won't Connect

**Issue:** "DISCONNECTED" indicator (red)
1. Verify backend is running on port 8000
2. Check http://localhost:8000 in browser
3. Verify firewall isn't blocking connection
4. Try restarting both backend and frontend

**Issue:** No data showing
- Wait 10-15 seconds for first scan
- Check backend console for errors
- Verify exchanges are accessible
- Check internet connection

**Issue:** Flutter build errors
```bash
# Clean and rebuild
cd frontend
flutter clean
flutter pub get
flutter run -d windows
```

### General Issues

**Issue:** App crashes or freezes
- Check both console outputs for errors
- Verify all dependencies installed
- Try restarting both backend and frontend
- Check system resources (CPU/memory)

**Issue:** Slow performance
- Normal on first launch (compiling)
- Subsequent launches should be faster
- Backend scanning happens every 3 seconds (by design)

## Stopping the Application

### Backend
**In Terminal 1:**
```
Press: CTRL + C
```

### Frontend
**In Terminal 2:**
```
Press: q (while terminal is focused)
```

**Or:**
```
Close the app window
```

## Next Steps After Launch

1. **Monitor Opportunities:** Watch the grid for profitable arbitrage
2. **Adjust Thresholds:** Modify minimum profit in `arb_calculator.py`
3. **Add Sound Alert:** Place `alert.wav` in `frontend/assets/sounds/`
4. **Customize UI:** Modify colors/themes in `main.dart`
5. **Add More Pairs:** Edit `TOP_SYMBOLS` in `market_scanner.py`

## Performance Tips

- **First Launch:** May take 30-60 seconds (compilation)
- **Subsequent Launches:** Should be much faster
- **Resource Usage:** Backend ~50MB RAM, Frontend ~200MB RAM
- **Network:** Requires stable internet connection

## Support

- Check `SETUP.md` for detailed configuration
- Review `README.md` for architecture
- See `QUICK_START.md` for fast setup
- Check console logs for specific errors

---

**🎉 You're all set! Happy arbitrage hunting!**

*Last Updated: January 16, 2026*

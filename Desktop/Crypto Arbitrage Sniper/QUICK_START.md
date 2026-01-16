# ArbHunter - Quick Start Guide 🚀

Get up and running in under 5 minutes!

## Prerequisites Check

### Backend
```bash
python --version  # Should be 3.12+
pip --version     # Should be available
```

### Frontend
```bash
flutter --version  # Should be 3.0.0+
dart --version     # Should be 3.5.0+
```

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Optional: Test connections
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
```

## Step 2: Start Backend Server

```bash
# In backend directory
python main.py
```

**Or use the startup script:**
- Windows: Double-click `start_backend.bat` in project root
- macOS/Linux: Run `./start_backend.sh` in project root

**You should see:**
```
ArbHunter backend started - Scanning for opportunities...
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

✅ **Backend is running when you see the Uvicorn message!**

## Step 3: Frontend Setup (2 minutes)

**Open a NEW terminal window** (keep backend running)

```bash
# Navigate to frontend
cd frontend

# Install Flutter dependencies
flutter pub get

# Run the app
flutter run -d windows   # For Windows
# OR
flutter run -d macos     # For macOS
```

**Expected Output:**
```
Launching lib\main.dart on Windows in debug mode...
Building Windows application...
```

## Step 4: Verify Everything Works

### ✅ Backend Checklist:
- [ ] Server running on port 8000
- [ ] No error messages in console
- [ ] "Scanning for opportunities..." message appears

### ✅ Frontend Checklist:
- [ ] App window opens
- [ ] Connection indicator shows **CONNECTED** (green)
- [ ] Ticker tape shows cryptocurrency prices
- [ ] Dashboard displays "Monitoring markets..."

## Troubleshooting

### ❌ Backend Won't Start

**Error: "Module not found"**
```bash
# Make sure you're in the backend directory
cd backend
pip install -r requirements.txt
```

**Error: "Port already in use"**
```bash
# Kill process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill
```

### ❌ Frontend Won't Connect

**Connection indicator shows "DISCONNECTED" (red)**
1. Verify backend is running: Open http://localhost:8000 in browser
2. Should see: `{"status":"ArbHunter API is running",...}`
3. Check firewall settings
4. Try restarting both backend and frontend

**No data showing:**
- Wait 5-10 seconds for first scan cycle
- Check backend console for errors
- Verify internet connection (needed for exchange APIs)

### ❌ Flutter Build Errors

**Error: "Package not found"**
```bash
cd frontend
flutter clean
flutter pub get
flutter run -d windows
```

**Error: "SDK not found"**
- Ensure Flutter SDK is installed and in PATH
- Run `flutter doctor` to check setup

## What to Expect

### First 10 Seconds:
- Backend connects to exchanges
- First scan completes
- Ticker prices appear

### After 10-30 Seconds:
- Market data updates continuously
- If opportunities exist, they appear in the grid
- Sound alert may trigger (if >1% profit found)

### Normal Operation:
- **Ticker Tape**: Updates every 1 second with latest prices
- **Market Scanner**: Scans for opportunities every 3 seconds
- **Opportunities**: Appear in grid when net profit >0.5%

## First Test Run

1. Start backend → Wait for "Uvicorn running" message
2. Start frontend → Wait for app window to open
3. Verify connection → Should show "CONNECTED" in green
4. Watch ticker → Prices should update within 5 seconds
5. Check console → Backend should show scan logs

## Next Steps

- ✅ **System is working** → Monitor for arbitrage opportunities
- ⚙️ **Customize** → Adjust thresholds in code (see SETUP.md)
- 🔔 **Add alerts** → Place `alert.wav` in `frontend/assets/sounds/`
- 📊 **Analyze** → Watch for patterns in opportunities

## Getting Help

- Check `SETUP.md` for detailed configuration
- Review `README.md` for architecture overview
- See `PROJECT_STATUS.md` for feature list
- Check backend/frontend console logs for errors

---

**🎉 You're all set! Happy arbitrage hunting!**

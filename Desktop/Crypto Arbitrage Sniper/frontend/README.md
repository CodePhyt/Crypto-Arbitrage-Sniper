# ArbHunter Frontend

Flutter desktop application for the ArbHunter Crypto Arbitrage Scanner.

## Setup

1. Make sure you have Flutter installed (SDK >= 3.0.0)
2. Install dependencies:
   ```bash
   flutter pub get
   ```
3. Run the application:
   ```bash
   flutter run -d windows
   # or
   flutter run -d macos
   ```

## Note on Sound Alert

The sound alert feature requires an `alert.wav` file in `assets/sounds/`. For now, the app will run without sounds if the file is missing. To add sound alerts, place an `alert.wav` file in the `assets/sounds/` directory.

## Backend Connection

The app connects to `ws://localhost:8000/ws` by default. Make sure the FastAPI backend is running before starting the Flutter app.

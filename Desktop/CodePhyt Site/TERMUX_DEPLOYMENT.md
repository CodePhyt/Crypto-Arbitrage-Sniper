# Solana Seeker 2 Termux Deployment Guide
**Codename:** Operation Physical Uplink

This guide outlines the precise steps to deploy the `solana-termux-node` bridge onto the physical Solana Seeker 2 Android device via Termux.

### Prerequisites
- Install [Termux](https://f-droid.org/en/packages/com.termux/) from F-Droid (The Google Play Store version is deprecated and broken).

### Full Deployment Sequence (Copy & Paste)

1. **Update System & Install Core Dependencies**
```bash
pkg update -y && pkg upgrade -y
pkg install -y git nodejs python make clang x11-repo chromium
```
*Note: We install Chromium specifically for Termux because the default Puppeteer Chromium binary often fails on Android ARM64 architectures.*

2. **Configure Node.js & Puppeteer Environment**
Before installing `whatsapp-web.js`, we must tell Puppeteer to skip downloading Chromium and use the local Termux version instead.
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/data/data/com.termux/files/usr/bin/chromium-browser
```

3. **Clone the ARES Repository**
*Assuming the repo is pushed to GitHub. Replace `<YOUR_GIT_URL>` with the actual repository URL.*
```bash
git clone <YOUR_GIT_URL> ares-system
cd ares-system/solana-termux-node
```

4. **Install Node Dependencies**
```bash
npm install
```

5. **Modify `index.js` for Termux (CRITICAL HOTFIX)**
You must ensure the `puppeteer` configuration in `index.js` points to the native Termux Chromium.
Verify `index.js` contains the following in the client initialization:
```javascript
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/data/data/com.termux/files/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});
```

6. **Initialize the Node**
Start the bridge and scan the QR code using the WhatsApp app on the Solana Seeker.
```bash
node index.js
```

### Keeping the Node Alive
Android OS aggressively kills background processes. To ensure the Termux Node stays alive 24/7 as a bridge:
1. Swipe down on the Android notification drawer.
2. Find the "Termux" notification.
3. Tap "Acquire Wakelock" (this prevents the device CPU from sleeping).
4. Disable battery optimization for the Termux app in Android Settings.

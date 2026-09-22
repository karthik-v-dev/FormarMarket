# Fresh Veggies — Phase 2 Expo Customer App

This project is the customer-facing mobile app for the vegetable next-day delivery system.

## Included

- Customer login/register
- Vegetable catalogue from the Phase 1 API
- Add/remove cart items
- Delivery address
- Next-day delivery slot selection
- COD / UPI selection
- Order creation
- Order history
- Order details
- EAS Android APK configuration

## Backend

This app expects the Phase 1 Node/Express API.

Set the API URL before running the app:

```bash
copy .env.example .env
```

Then edit `.env`:

```text
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:4000/api/v1
```

For a physical Android phone, do NOT use `localhost`. Use the computer's LAN IP if the phone and computer are on the same Wi-Fi.

For an EAS cloud build, use a publicly reachable HTTPS backend URL, for example:

```text
EXPO_PUBLIC_API_URL=https://api.example.com/api/v1
```

## Install and run

```bash
npm install
npx expo start
```

## Build an installable APK with EAS

Install/login to EAS:

```bash
npm install --global eas-cli
eas login
```

Then from this project directory:

```bash
eas build -p android --profile preview
```

The `preview` profile is configured to produce an Android APK.

After the cloud build finishes, EAS provides an install/download link.

## Production Play Store build

The `production` profile is configured for Android App Bundle:

```bash
eas build -p android --profile production
```

Google Play normally uses the `.aab` format rather than a directly installed APK.

## Important

The API contract must match the Phase 1 backend. If your backend returns slightly different JSON field names, adjust `src`/`App.tsx` accordingly.

This Phase 2 build intentionally does not pretend that payment gateways, driver live GPS, push notifications, or Socket.IO tracking are complete. Those are planned for later phases.

# TouchBase Academy Mobile App

React Native mobile application for TouchBase Academy built with Expo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Update `app.json` with your Expo project ID (if using EAS):
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Project Structure

```
mobile/
├── app.json              # Expo configuration
├── App.tsx              # Root component
├── navigation/          # Navigation setup
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainNavigator.tsx
│   └── types.ts
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   └── main/           # Main app screens
├── lib/                 # Utilities and services
│   ├── supabase/       # Supabase client
│   └── types/          # TypeScript types
└── assets/             # Images and assets
```

## Features

- Authentication with Supabase
- Navigation with React Navigation
- TypeScript support
- Shared types with web app

## Next Steps

- Implement offline module downloads
- Add push notifications
- Integrate with web app API
- Add module player with offline support


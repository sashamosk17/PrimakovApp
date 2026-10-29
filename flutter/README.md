# PrimakovApp Flutter

Flutter версия мобильного приложения PrimakovApp. This is a complete conversion from React Native/Expo to Flutter.

## Features

- **Authentication**: Login and Registration screens
- **Schedule Management**: View school schedule and lessons
- **Deadline Tracking**: Track and manage deadlines with status indicators
- **Stories/Announcements**: View announcements and school updates
- **Rating System**: Rate teachers and view ratings
- **User Profile**: Manage user profile and settings

## Project Structure

```
lib/
├── main.dart                 # Application entry point
├── config/                   # Configuration files
│   └── api_config.dart      # API configuration
├── models/                   # Data models
│   └── api_models.dart      # All API models and enums
├── providers/                # State management (Riverpod)
│   ├── auth_provider.dart
│   ├── deadline_provider.dart
│   ├── schedule_provider.dart
│   ├── story_provider.dart
│   ├── rating_provider.dart
│   ├── announcement_provider.dart
│   └── ui_provider.dart
├── services/                 # API services
│   └── api/
│       ├── auth_service.dart
│       ├── deadline_service.dart
│       ├── schedule_service.dart
│       ├── rating_service.dart
│       ├── story_service.dart
│       └── announcement_service.dart
├── screens/                  # Screen widgets
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   └── main/
│       ├── schedule_screen.dart
│       ├── deadline_screen.dart
│       └── profile_screen.dart
└── widgets/                  # Reusable widgets
    ├── story_card.dart
    ├── lesson_card.dart
    └── deadline_card.dart
```

## Getting Started

### Prerequisites

- Flutter SDK 3.0.0 or higher
- Dart 3.0.0 or higher
- Android Studio / Xcode (for Android/iOS development)

### Installation

1. Clone the repository and navigate to the flutter directory:
```bash
cd PrimakovApp/flutter
```

2. Get dependencies:
```bash
flutter pub get
```

3. Generate necessary files:
```bash
dart run build_runner build
```

### Running the App

Development:
```bash
flutter run
```

For Android:
```bash
flutter run -d android
```

For iOS:
```bash
flutter run -d ios
```

For Web (if enabled):
```bash
flutter run -d chrome
```

### Build for Production

Android:
```bash
flutter build apk --release
flutter build bundle --release  # For Google Play
```

iOS:
```bash
flutter build ios --release
```

Web:
```bash
flutter build web --release
```

## API Integration

API base URL is configured in `lib/config/api_config.dart`. Update the `baseUrl` constant to point to your backend server:

```dart
static const String baseUrl = 'http://localhost:3000/api';
```

Or use environment variable:
```bash
flutter run --dart-define=API_BASE_URL=http://your-api.com/api
```

## State Management

This project uses **Riverpod** for state management, replacing Redux from the React Native version.

Providers are organized by feature:
- `auth_provider.dart` - Authentication state
- `deadline_provider.dart` - Deadlines management
- `schedule_provider.dart` - Schedule data
- `story_provider.dart` - Stories/Announcements
- `rating_provider.dart` - Ratings
- `announcement_provider.dart` - Announcements
- `ui_provider.dart` - UI state (theme, selected tab, etc.)

## Key Conversions from React Native

| React Native | Flutter |
|---|---|
| Redux | Riverpod (StateNotifier) |
| React Navigation | Flutter Navigator 2.0 |
| Axios | Dio |
| TypeError | dart Types |
| AsyncStorage | shared_preferences |
| React Components | Flutter Widgets |
| StyleSheet | ThemeData + TextStyle |

## Debugging

Enable verbose logging:
```bash
flutter run -v
```

View device logs:
```bash
adb logcat              # Android
log stream --device    # iOS
```

## Testing

Run tests:
```bash
flutter test
```

## Contributing

Follow these guidelines:
1. Use meaningful commit messages
2. Keep code formatted with `flutter format`
3. Analyze code with `flutter analyze`
4. Write tests for new features

## License

See LICENSE file in root directory

## Support

For issues or questions, contact the development team.

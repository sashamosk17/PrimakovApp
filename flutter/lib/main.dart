/// Main App Entry Point
/// Updated with 4-tab navigation: Home, Schedule, Services, Profile

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main/home_screen.dart';
import 'screens/main/schedule_screen.dart';
import 'screens/main/services_screen.dart';
import 'screens/main/profile_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/ui_provider.dart';
import 'config/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ru', null);
  runApp(const ProviderScope(child: PrimakovApp()));
}

class PrimakovApp extends ConsumerWidget {
  const PrimakovApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated = ref.watch(isAuthenticatedProvider);
    final isDarkMode = ref.watch(isDarkModeProvider);

    return MaterialApp(
      title: 'PrimakovApp',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ru', 'RU'),
        Locale('en', 'US'),
      ],
      locale: const Locale('ru', 'RU'),
      home: isAuthenticated
          ? const MainNavigator()
          : const AuthNavigator(),
    );
  }
}

/// Auth Navigator
class AuthNavigator extends StatelessWidget {
  const AuthNavigator({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Navigator(
      pages: const [
        MaterialPage(
          child: LoginScreen(),
          key: ValueKey('login'),
        ),
      ],
      onPopPage: (route, result) => route.didPop(result),
    );
  }
}

/// Main Navigator with 4 Bottom Tabs
class MainNavigator extends ConsumerStatefulWidget {
  const MainNavigator({Key? key}) : super(key: key);

  @override
  ConsumerState<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends ConsumerState<MainNavigator> with TickerProviderStateMixin {
  int _selectedIndex = 0;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.9).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _onItemTapped(int index) {
    if (_selectedIndex != index) {
      _animationController.forward().then((_) {
        setState(() {
          _selectedIndex = index;
        });
        _animationController.reverse();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = ref.watch(isDarkModeProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: const [
          HomeScreen(),        // Tab 0: Главная
          ScheduleScreen(),    // Tab 1: Расписание
          ServicesScreen(),    // Tab 2: Сервисы
          ProfileScreen(),     // Tab 3: Профиль
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDarkMode
              ? const Color(0xFF1A1C1D).withOpacity(0.95)
              : Colors.white.withOpacity(0.95),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDarkMode ? 0.3 : 0.08),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
          child: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: _onItemTapped,
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.transparent,
            selectedItemColor: theme.colorScheme.primary,
            unselectedItemColor: isDarkMode
                ? const Color(0xFF8A9099)
                : const Color(0xFF9E9E9E),
            selectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 11,
              letterSpacing: 0.5,
            ),
            unselectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 11,
            ),
            elevation: 0,
            items: [
              _buildNavItem(Icons.newspaper, Icons.newspaper_outlined, 'Home', 0),
              _buildNavItem(Icons.calendar_today, Icons.calendar_today_outlined, 'Schedule', 1),
              _buildNavItem(Icons.apps, Icons.apps_outlined, 'Services', 2),
              _buildNavItem(Icons.person, Icons.person_outline, 'Profile', 3),
            ],
          ),
        ),
      ),
    );
  }

  BottomNavigationBarItem _buildNavItem(
    IconData activeIcon,
    IconData inactiveIcon,
    String label,
    int index,
  ) {
    final isSelected = _selectedIndex == index;
    final theme = Theme.of(context);

    return BottomNavigationBarItem(
      icon: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 16 : 0,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? theme.colorScheme.primary.withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          isSelected ? activeIcon : inactiveIcon,
          size: 24,
        ),
      ),
      label: label,
    );
  }
}

/// Main App Entry Point
/// Updated with 4-tab navigation: Home, Schedule, Services, Profile

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'config/app_localizations.dart';
import 'providers/locale_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main/home_screen.dart';
import 'screens/main/schedule_screen.dart';
import 'screens/main/services_screen.dart';
import 'screens/main/profile_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/ui_provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'services/cache/offline_cache_service.dart';
import 'config/app_theme.dart';
import 'config/app_colors.dart';
import 'config/app_spacing.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await OfflineCacheService().init();
  await initializeDateFormatting('ru', null);
  runApp(const ProviderScope(child: PrimakovApp()));
}

class PrimakovApp extends ConsumerWidget {
  const PrimakovApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated = ref.watch(isAuthenticatedProvider);
    final isDarkMode = ref.watch(isDarkModeProvider);
    final currentLocale = ref.watch(localeProvider);

    return MaterialApp(
      title: 'PrimakovApp',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ru', 'RU'),
        Locale('en', 'US'),
      ],
      locale: currentLocale,
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
    HapticFeedback.lightImpact();
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
    final loc = AppLocalizations.of(context);

    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _selectedIndex,
        children: const [
          HomeScreen(),        // Tab 0: Главная
          ScheduleScreen(),    // Tab 1: Расписание
          ServicesScreen(),    // Tab 2: Сервисы
          ProfileScreen(),     // Tab 3: Профиль
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              boxShadow: isDarkMode ? AppColors.darkFloatingShadow : AppColors.floatingShadow,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: Container(
                  decoration: BoxDecoration(
                    color: isDarkMode
                        ? const Color(0xCC161B22)
                        : const Color(0xE6FFFFFF),
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(
                      color: isDarkMode
                          ? const Color(0x26FFFFFF)
                          : const Color(0x14000000),
                      width: 1,
                    ),
                  ),
                  child: Theme(
                    data: theme.copyWith(
                      splashColor: Colors.transparent,
                      highlightColor: Colors.transparent,
                    ),
                    child: BottomNavigationBar(
                      currentIndex: _selectedIndex,
                      onTap: _onItemTapped,
                      type: BottomNavigationBarType.fixed,
                      backgroundColor: Colors.transparent,
                      elevation: 0,
                      selectedItemColor: theme.colorScheme.primary,
                      unselectedItemColor: isDarkMode
                          ? const Color(0xFF8B949E)
                          : const Color(0xFF8A9099),
                      selectedLabelStyle: const TextStyle(
                        fontFamily: 'Manrope',
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                        letterSpacing: 0.3,
                      ),
                      unselectedLabelStyle: const TextStyle(
                        fontFamily: 'Manrope',
                        fontWeight: FontWeight.w500,
                        fontSize: 11,
                      ),
                      items: [
                        _buildNavItem(Icons.newspaper_rounded, Icons.newspaper_outlined, loc.navHome, 0),
                        _buildNavItem(Icons.calendar_month_rounded, Icons.calendar_today_outlined, loc.navSchedule, 1),
                        _buildNavItem(Icons.grid_view_rounded, Icons.grid_view_outlined, loc.navServices, 2),
                        _buildNavItem(Icons.person_rounded, Icons.person_outline_rounded, loc.navProfile, 3),
                      ],
                    ),
                  ),
                ),
              ),
            ),
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
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 16 : 6,
          vertical: 6,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? theme.colorScheme.primary.withOpacity(0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
        ),
        child: Icon(
          isSelected ? activeIcon : inactiveIcon,
          size: 22,
        ),
      ),
      label: label,
    );
  }
}

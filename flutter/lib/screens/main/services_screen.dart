/// Services Screen - Bento Grid 2.0 & Campus Directory
/// Elevated with pastel plates, squircle 18px radiuses, glassmorphism search, and haptic animations

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/app_colors.dart';
import '../../config/app_spacing.dart';
import '../../config/app_typography.dart';
import '../canteen_menu_screen.dart';
import '../rooms_list_screen.dart';
import '../create_request_screen.dart';
import '../announcements_screen.dart';
import '../teacher_ratings_screen.dart';
import 'schedule_screen.dart';
import 'people_directory_screen.dart';
import 'user_profile_detail_screen.dart';
import 'grades_screen.dart';
import 'house_cup_screen.dart';
import 'boarding_screen.dart';
import '../../providers/user_provider.dart';
import '../../services/api/user_service.dart';
import '../../models/api_models.dart';

class ServicesScreen extends ConsumerStatefulWidget {
  const ServicesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends ConsumerState<ServicesScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final primaryColor = isDark ? AppColors.darkPrimary : AppColors.primary;

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                'Сервисы',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.5,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 14),

              // Search Section - Campus People Directory
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Поиск по гимназии',
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.3,
                      color: textPrimary,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => const PeopleDirectoryScreen(),
                        ),
                      );
                    },
                    icon: Icon(Icons.menu_book_rounded, size: 16, color: primaryColor),
                    label: Text(
                      'Справочник',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: primaryColor,
                      ),
                    ),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Glassmorphic Search Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xCC161B22) : const Color(0xE6FFFFFF),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
                        width: 1,
                      ),
                      boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) {
                        setState(() {
                          _isSearching = value.trim().isNotEmpty;
                        });
                      },
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        color: textPrimary,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Поиск по имени, классу или роли...',
                        hintStyle: TextStyle(
                          fontFamily: 'Inter',
                          color: textSecondary,
                          fontSize: 13,
                        ),
                        prefixIcon: Icon(Icons.search_rounded, color: textSecondary, size: 20),
                        suffixIcon: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (_isSearching)
                              IconButton(
                                icon: Icon(Icons.clear_rounded, color: textSecondary, size: 18),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {
                                    _isSearching = false;
                                  });
                                },
                              ),
                            IconButton(
                              tooltip: 'Открыть справочник с фильтрами',
                              icon: Icon(Icons.tune_rounded, color: primaryColor, size: 20),
                              onPressed: () {
                                HapticFeedback.lightImpact();
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => const PeopleDirectoryScreen(),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                        filled: false,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 18),
              if (_isSearching) ...[
                Text(
                  'Результаты поиска',
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ref.watch(directorySearchProvider(DirectorySearchParams(query: _searchController.text.trim()))).when(
                        loading: () => const Center(child: CircularProgressIndicator()),
                        error: (err, stack) => Center(
                          child: Text(
                            'Ничего не найдено',
                            style: TextStyle(color: textSecondary),
                          ),
                        ),
                        data: (users) {
                          if (users.isEmpty) {
                            return Center(
                              child: Text(
                                'Ничего не найдено по запросу «${_searchController.text.trim()}»',
                                style: TextStyle(color: textSecondary),
                              ),
                            );
                          }

                          return ListView.builder(
                            padding: const EdgeInsets.only(bottom: 90),
                            itemCount: users.length,
                            itemBuilder: (context, index) {
                              final user = users[index];
                              return _UserResultCard(
                                user: user,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => UserProfileDetailScreen(
                                        initialUser: user,
                                      ),
                                    ),
                                  );
                                },
                              );
                            },
                          );
                        },
                      ),
                ),
              ] else ...[
                // Services Grid 2x3 (Bento Tiles)
                Text(
                  'Все сервисы',
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: GridView.count(
                    padding: const EdgeInsets.only(bottom: 90),
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.15,
                    children: [
                      _InteractiveBentoTile(
                        icon: Icons.support_agent_rounded,
                        title: 'Заявки',
                        subtitle: 'Обращения и помощь',
                        pastelBg: isDark ? AppColors.darkPastelRed : AppColors.pastelRed,
                        iconColor: isDark ? AppColors.darkPrimary : AppColors.pastelRedIcon,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const CreateRequestScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.restaurant_rounded,
                        title: 'Столовая',
                        subtitle: 'Меню и питание',
                        pastelBg: isDark ? AppColors.darkPastelAmber : AppColors.pastelAmber,
                        iconColor: const Color(0xFFE65100),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const CanteenMenuScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.calendar_month_rounded,
                        title: 'Расписание',
                        subtitle: 'Уроки и звонки',
                        pastelBg: isDark ? AppColors.darkPastelIndigo : AppColors.pastelIndigo,
                        iconColor: const Color(0xFF3F51B5),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const ScheduleScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.map_rounded,
                        title: 'Карта',
                        subtitle: 'Кабинеты и зоны',
                        pastelBg: isDark ? AppColors.darkPastelGreen : AppColors.pastelGreen,
                        iconColor: const Color(0xFF2E7D32),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const RoomsListScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.campaign_rounded,
                        title: 'Объявления',
                        subtitle: 'События гимназии',
                        pastelBg: isDark ? AppColors.darkPastelPink : AppColors.pastelPink,
                        iconColor: const Color(0xFFC2185B),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const AnnouncementsScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.star_rounded,
                        title: 'Рейтинги',
                        subtitle: 'Отзывы и оценки',
                        pastelBg: isDark ? AppColors.darkPastelBlue : AppColors.pastelBlue,
                        iconColor: const Color(0xFF0288D1),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const TeacherRatingsScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.grade_rounded,
                        title: 'Успеваемость',
                        subtitle: 'Оценки и GPA симулятор',
                        pastelBg: isDark ? AppColors.darkPastelAmber : const Color(0xFFFFF3E0),
                        iconColor: const Color(0xFFE65100),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const GradesScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.shield_rounded,
                        title: 'Кубок Домов',
                        subtitle: 'Лига Домов Примакова',
                        pastelBg: isDark ? AppColors.darkPastelRed : AppColors.pastelRed,
                        iconColor: AppColors.primary,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const HouseCupScreen(),
                            ),
                          );
                        },
                      ),
                      _InteractiveBentoTile(
                        icon: Icons.hotel_rounded,
                        title: 'Пансион',
                        subtitle: 'Школа-пансион Раздоры',
                        pastelBg: isDark ? AppColors.darkPastelIndigo : AppColors.pastelIndigo,
                        iconColor: const Color(0xFF3F51B5),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const BoardingScreen(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _InteractiveBentoTile extends StatefulWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color pastelBg;
  final Color iconColor;
  final VoidCallback onTap;

  const _InteractiveBentoTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.pastelBg,
    required this.iconColor,
    required this.onTap,
  });

  @override
  State<_InteractiveBentoTile> createState() => _InteractiveBentoTileState();
}

class _InteractiveBentoTileState extends State<_InteractiveBentoTile> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;

    return AnimatedScale(
      scale: _isPressed ? 0.97 : 1.0,
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOutCubic,
      child: Material(
        color: cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        child: InkWell(
          onTapDown: (_) => setState(() => _isPressed = true),
          onTapUp: (_) => setState(() => _isPressed = false),
          onTapCancel: () => setState(() => _isPressed = false),
          onTap: () {
            HapticFeedback.lightImpact();
            widget.onTap();
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
              border: Border.all(
                color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
                width: 1,
              ),
              boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: widget.pastelBg,
                        borderRadius: BorderRadius.circular(AppSpacing.radiusTile), // 18px!
                      ),
                      child: Icon(
                        widget.icon,
                        color: widget.iconColor,
                        size: 24,
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 13,
                      color: isDark
                          ? AppColors.darkTextSecondary.withOpacity(0.5)
                          : AppColors.textSecondary.withOpacity(0.5),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      widget.subtitle,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _UserResultCard extends StatelessWidget {
  final User user;
  final VoidCallback onTap;

  const _UserResultCard({
    required this.user,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;

    final isTeacher = user.role == UserRole.TEACHER;
    final avatarBg = isTeacher
        ? (isDark ? AppColors.darkPastelIndigo : AppColors.pastelIndigo)
        : (isDark ? AppColors.darkPastelRed : AppColors.pastelRed);
    final avatarColor = isTeacher
        ? const Color(0xFF3F51B5)
        : (isDark ? AppColors.darkPrimary : AppColors.primaryRed);

    final fName = user.firstName.isNotEmpty ? user.firstName[0] : '';
    final lName = user.lastName.isNotEmpty ? user.lastName[0] : '';
    final initials = '$lName$fName'.isNotEmpty ? '$lName$fName' : 'Г';

    String roleLabel = 'Учащийся';
    if (isTeacher) {
      roleLabel = 'Преподаватель';
    } else if (user.role == UserRole.ADMIN) {
      roleLabel = 'Администрация';
    }
    if (user.groupName != null && user.groupName!.isNotEmpty) {
      roleLabel = '$roleLabel • ${user.groupName}';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
          width: 0.8,
        ),
        boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
      ),
      child: ListTile(
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: avatarBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              initials,
              style: TextStyle(
                fontFamily: 'Manrope',
                color: avatarColor,
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                '${user.lastName} ${user.firstName}',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  color: textPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (user.isBirthdayToday)
              const Padding(
                padding: EdgeInsets.only(left: 4),
                child: Text('🎂', style: TextStyle(fontSize: 14)),
              ),
          ],
        ),
        subtitle: Text(
          roleLabel,
          style: TextStyle(
            fontFamily: 'Inter',
            color: textSecondary,
            fontSize: 12,
          ),
        ),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
      ),
    );
  }
}

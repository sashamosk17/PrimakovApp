/// Services Screen
/// Shows various school services and live teacher search

import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../canteen_menu_screen.dart';
import '../rooms_list_screen.dart';
import '../create_request_screen.dart';
import '../announcements_screen.dart';
import '../teacher_ratings_screen.dart';
import 'schedule_screen.dart';
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
    final surfaceColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final primaryColor = isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed;
    final borderColor = isDark ? AppColors.darkBorderSecondary : const Color(0xFFE8E8EA);

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                'Сервисы',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 16),

              // Search Section - Live Teachers Search
              Text(
                'Поиск учителей',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _searchController,
                onChanged: (value) {
                  setState(() {
                    _isSearching = value.trim().isNotEmpty;
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Поиск учителей по имени...',
                  hintStyle: TextStyle(color: textSecondary),
                  prefixIcon: Icon(Icons.search, color: textSecondary, size: 20),
                  suffixIcon: _isSearching
                      ? IconButton(
                          icon: Icon(Icons.clear, color: textSecondary, size: 20),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              _isSearching = false;
                            });
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: surfaceColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: borderColor),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(color: primaryColor, width: 2),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
              
              const SizedBox(height: 16),
              if (_isSearching) ...[
                Text(
                  'Результаты поиска',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ref.watch(teachersProvider).when(
                        loading: () => const Center(child: CircularProgressIndicator()),
                        error: (err, stack) => Center(
                          child: Text(
                            'Ошибка загрузки: $err',
                            style: TextStyle(color: textSecondary),
                          ),
                        ),
                        data: (teachers) {
                          final query = _searchController.text.trim().toLowerCase();
                          final filtered = teachers.where((t) {
                            return t.fullName.toLowerCase().contains(query) ||
                                t.firstName.toLowerCase().contains(query) ||
                                t.lastName.toLowerCase().contains(query);
                          }).toList();

                          if (filtered.isEmpty) {
                            return Center(
                              child: Text(
                                'Преподаватели не найдены',
                                style: TextStyle(color: textSecondary),
                              ),
                            );
                          }

                          return ListView.builder(
                            itemCount: filtered.length,
                            itemBuilder: (context, index) {
                              final teacher = filtered[index];
                              return _TeacherCard(
                                teacher: teacher,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => const TeacherRatingsScreen(),
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
                // Services Grid
                Text(
                  'Все сервисы',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 3,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.9,
                    children: [
                      _ServiceCard(
                        icon: Icons.support_agent,
                        title: 'Заявки',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const CreateRequestScreen(),
                            ),
                          );
                        },
                      ),
                      _ServiceCard(
                        icon: Icons.restaurant,
                        title: 'Столовая',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const CanteenMenuScreen(),
                            ),
                          );
                        },
                      ),
                      _ServiceCard(
                        icon: Icons.schedule,
                        title: 'Расписание',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const ScheduleScreen(),
                            ),
                          );
                        },
                      ),
                      _ServiceCard(
                        icon: Icons.map,
                        title: 'Карта',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const RoomsListScreen(),
                            ),
                          );
                        },
                      ),
                      _ServiceCard(
                        icon: Icons.announcement,
                        title: 'Объявления',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const AnnouncementsScreen(),
                            ),
                          );
                        },
                      ),
                      _ServiceCard(
                        icon: Icons.star,
                        title: 'Рейтинги',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const TeacherRatingsScreen(),
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

class _ServiceCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ServiceCard({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final iconColor = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;

    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
            boxShadow: isDark ? null : const [
              BoxShadow(
                color: Color(0x05000000),
                blurRadius: 4,
                offset: Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurfaceContainer : AppColors.storyBackground,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: isDark ? iconColor : AppColors.primaryRed,
                  size: 20,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: textPrimary,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TeacherCard extends StatelessWidget {
  final Teacher teacher;
  final VoidCallback onTap;

  const _TeacherCard({
    required this.teacher,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;

    final initials = '${teacher.firstName.isNotEmpty ? teacher.firstName[0] : ""}${teacher.lastName.isNotEmpty ? teacher.lastName[0] : ""}';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(10),
        border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
      ),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: const Color(0xFF1976D2).withOpacity(0.15),
          child: Text(
            initials,
            style: const TextStyle(
              color: Color(0xFF1976D2),
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
        title: Text(
          teacher.fullName,
          style: TextStyle(
            color: textPrimary,
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
        subtitle: Text(
          'Преподаватель',
          style: TextStyle(
            color: textSecondary,
            fontSize: 12,
          ),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14),
      ),
    );
  }
}

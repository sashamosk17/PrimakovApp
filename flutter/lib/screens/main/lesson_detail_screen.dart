/// Lesson Detail Screen
/// Shows detailed information about a specific lesson

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';
import '../../config/app_colors.dart';
import '../teacher_ratings_screen.dart';

class LessonDetailScreen extends ConsumerWidget {
  final Lesson lesson;

  const LessonDetailScreen({
    Key? key,
    required this.lesson,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final scaffoldBg = isDarkMode
        ? AppColors.darkBackgroundPrimary
        : theme.scaffoldBackgroundColor;
    final textPrimary = isDarkMode
        ? AppColors.darkTextPrimary
        : AppColors.textPrimary;
    final primaryColor = isDarkMode
        ? AppColors.darkPrimaryRed
        : AppColors.primaryRed;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: isDarkMode
            ? AppColors.darkOnPrimaryFixed
            : primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: isDarkMode ? textPrimary : Colors.white,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Детали урока',
          style: TextStyle(
            color: isDarkMode ? textPrimary : Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDarkMode
                    ? AppColors.darkOnPrimaryFixed
                    : primaryColor,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lesson.subject,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? textPrimary : Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        color: isDarkMode
                            ? textPrimary.withOpacity(0.7)
                            : Colors.white70,
                        size: 18,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${lesson.startTime} - ${lesson.endTime}',
                        style: TextStyle(
                          fontSize: 16,
                          color: isDarkMode
                              ? textPrimary.withOpacity(0.7)
                              : Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Location Info
            _InfoSection(
              icon: Icons.room,
              title: 'Местоположение',
              children: [
                _InfoRow(
                  label: 'Кабинет',
                  value: lesson.room,
                ),
                _InfoRow(
                  label: 'Этаж',
                  value: '${lesson.floor} этаж',
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Teacher Info
            _InfoSection(
              icon: Icons.person,
              title: 'Преподаватель',
              children: [
                _InfoRow(
                  label: 'Имя',
                  value: lesson.teacherName ?? 'Не указан',
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => const TeacherRatingsScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.star, size: 18),
                      label: const Text('Оценить учителя'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDarkMode
                            ? AppColors.darkSurfaceContainerLow
                            : primaryColor,
                        foregroundColor: isDarkMode
                            ? textPrimary
                            : Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Homework Info
            _InfoSection(
              icon: Icons.assignment,
              title: 'Домашнее задание',
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: lesson.hasHomework
                        ? (isDarkMode ? const Color(0xFF3D1F1F) : const Color(0xFFFFEBEE))
                        : (isDarkMode ? const Color(0xFF1F3D1F) : const Color(0xFFE8F5E9)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            lesson.hasHomework ? Icons.warning : Icons.check_circle,
                            color: lesson.hasHomework
                                ? const Color(0xFFD32F2F)
                                : const Color(0xFF4CAF50),
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              lesson.hasHomework
                                  ? 'Есть домашнее задание'
                                  : 'Домашнего задания нет',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: lesson.hasHomework
                                    ? const Color(0xFFD32F2F)
                                    : const Color(0xFF4CAF50),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (lesson.hasHomework && lesson.homeworkDescription != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDarkMode
                                ? AppColors.darkSurfaceContainerLow
                                : Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            lesson.homeworkDescription!,
                            style: TextStyle(
                              fontSize: 14,
                              color: textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Quick Actions
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Быстрые действия',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _ActionButton(
                    icon: Icons.map,
                    label: 'Показать на карте школы',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Карта школы скоро появится')),
                      );
                    },
                  ),
                  const SizedBox(height: 8),
                  _ActionButton(
                    icon: Icons.notifications,
                    label: 'Напомнить за 10 минут',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Напоминание установлено')),
                      );
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<Widget> children;

  const _InfoSection({
    required this.icon,
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final surfaceColor = isDarkMode
        ? AppColors.darkBackgroundSecondary
        : theme.colorScheme.surface;
    final textPrimary = isDarkMode
        ? AppColors.darkTextPrimary
        : AppColors.textPrimary;
    final iconBgColor = isDarkMode
        ? AppColors.darkSurfaceContainerLow
        : const Color(0xFFFFEBEE);
    final primaryColor = isDarkMode
        ? AppColors.darkPrimaryRed
        : AppColors.primaryRed;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: isDarkMode ? Border.all(color: AppColors.darkBorderPrimary) : null,
        boxShadow: isDarkMode ? null : const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final textSecondary = isDarkMode
        ? AppColors.darkTextSecondary
        : AppColors.textSecondary;
    final textPrimary = isDarkMode
        ? AppColors.darkTextPrimary
        : AppColors.textPrimary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: textSecondary),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final surfaceColor = isDarkMode
        ? AppColors.darkBackgroundSecondary
        : AppColors.backgroundSecondary;
    final borderColor = isDarkMode
        ? AppColors.darkBorderPrimary
        : const Color(0xFFE8E8EA);
    final textPrimary = isDarkMode
        ? AppColors.darkTextPrimary
        : AppColors.textPrimary;
    final primaryColor = isDarkMode
        ? AppColors.darkPrimaryRed
        : AppColors.primaryRed;

    return Material(
      color: surfaceColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Icon(icon, color: primaryColor, size: 22),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: textPrimary,
                  ),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: textPrimary.withOpacity(0.4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
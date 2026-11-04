/// Lesson Card Widget - Bento 2.0 Academic Style
/// Modern minimalist card with Lucide icons, ghost borders, and noble Primakov branding

import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../config/app_colors.dart';
import '../models/api_models.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';
import 'primakov_card.dart';

class LessonCard extends StatelessWidget {
  final Lesson lesson;
  final VoidCallback? onTap;
  final bool isCurrent;

  const LessonCard({
    Key? key,
    required this.lesson,
    this.onTap,
    this.isCurrent = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final startTime = lesson.startTime.isNotEmpty ? lesson.startTime : '--:--';
    final endTime = lesson.endTime.isNotEmpty ? lesson.endTime : '--:--';
    final subject = lesson.subject.isNotEmpty ? lesson.subject : 'Без названия';
    final teacherName = lesson.teacherName ?? 'Преподаватель не указан';
    final room = lesson.room.isNotEmpty ? lesson.room : '?';
    final floor = lesson.floor;

    final primaryColor = isDarkMode ? AppColors.darkPrimary : AppColors.primary;
    final primaryContainer = isDarkMode
        ? AppColors.darkPrimaryContainer.withOpacity(0.3)
        : AppColors.primaryFixed.withOpacity(0.4);

    return PrimakovCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      onTap: onTap,
      borderColor: isCurrent
          ? primaryColor.withOpacity(0.5)
          : null,
      backgroundColor: isCurrent
          ? (isDarkMode ? const Color(0xFF1E1719) : const Color(0xFFFFF9F9))
          : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row 1: Time Interval Pill + Current indicator / Homework Pill
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Time Interval Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isCurrent ? primaryContainer : (isDarkMode ? AppColors.darkSurfaceContainerHigh : AppColors.surfaceContainerLow),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                  border: isCurrent
                      ? Border.all(color: primaryColor.withOpacity(0.4), width: 1)
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      LucideIcons.clock,
                      size: 13,
                      color: isCurrent
                          ? primaryColor
                          : (isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '$startTime — $endTime',
                      style: AppTypography.labelMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: isCurrent
                            ? primaryColor
                            : (isDarkMode ? AppColors.darkTextPrimary : AppColors.onSurface),
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),

              // Homework status chip
              if (lesson.hasHomework)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDarkMode
                        ? AppColors.darkPastelAmber
                        : AppColors.pastelAmber,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                    border: Border.all(
                      color: const Color(0xFFE65100).withOpacity(0.2),
                      width: 0.8,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        LucideIcons.bookOpen,
                        size: 12,
                        color: Color(0xFFE65100),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'ДЗ',
                        style: AppTypography.labelExtraSmall.copyWith(
                          color: const Color(0xFFE65100),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          // Row 2: Subject Title
          Text(
            subject,
            style: AppTypography.heading2.copyWith(
              color: isDarkMode ? AppColors.darkTextPrimary : AppColors.onSurface,
              fontSize: 18,
            ),
          ),

          const SizedBox(height: 10),

          // Row 3: Teacher + Location chips
          Row(
            children: [
              // Teacher
              Expanded(
                child: Row(
                  children: [
                    Icon(
                      LucideIcons.user,
                      size: 14,
                      color: isDarkMode
                          ? AppColors.darkTextSecondary
                          : AppColors.secondary,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        teacherName,
                        style: AppTypography.bodySmall.copyWith(
                          color: isDarkMode
                              ? AppColors.darkTextSecondary
                              : AppColors.secondary,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // Location (Room & Floor)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    LucideIcons.mapPin,
                    size: 14,
                    color: isDarkMode
                        ? AppColors.darkTextSecondary
                        : AppColors.secondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Каб. $room, эт. $floor',
                    style: AppTypography.bodySmall.copyWith(
                      color: isDarkMode
                          ? AppColors.darkTextSecondary
                          : AppColors.secondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

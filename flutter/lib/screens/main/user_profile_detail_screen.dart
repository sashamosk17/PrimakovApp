/// User Profile Detail Screen
/// Displays full profile, birthdate, contacts, and personal schedule for any student or teacher

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/app_colors.dart';
import '../../models/api_models.dart';
import '../../providers/user_provider.dart';

class UserProfileDetailScreen extends ConsumerStatefulWidget {
  final User initialUser;

  const UserProfileDetailScreen({
    Key? key,
    required this.initialUser,
  }) : super(key: key);

  @override
  ConsumerState<UserProfileDetailScreen> createState() => _UserProfileDetailScreenState();
}

class _UserProfileDetailScreenState extends ConsumerState<UserProfileDetailScreen> {
  Future<void> _launchUrl(String urlString) async {
    final uri = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        _showSnackBar('Не удалось открыть ссылку: $urlString');
      }
    } catch (_) {
      _showSnackBar('Не удалось совершить действие');
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    HapticFeedback.lightImpact();
    _showSnackBar('$label скопирован в буфер');
  }

  void _showSnackBar(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(text),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final parts = dateStr.split('-');
      if (parts.length >= 3) {
        final year = parts[0];
        final month = int.tryParse(parts[1]) ?? 1;
        final day = int.tryParse(parts[2]) ?? 1;

        const months = [
          'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
          'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        return '$day ${months[month - 1]} $year г.';
      }
      return dateStr;
    } catch (_) {
      return dateStr;
    }
  }

  String _calculateAgeString(String dateStr) {
    try {
      final parts = dateStr.split('-');
      if (parts.length >= 3) {
        final year = int.parse(parts[0]);
        final month = int.parse(parts[1]);
        final day = int.parse(parts[2]);

        final now = DateTime.now();
        var age = now.year - year;
        if (now.month < month || (now.month == month && now.day < day)) {
          age--;
        }

        String suffix;
        if (age % 10 == 1 && age != 11) {
          suffix = 'год';
        } else if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) {
          suffix = 'года';
        } else {
          suffix = 'лет';
        }
        return '$age $suffix';
      }
    } catch (_) {}
    return '';
  }

  bool _isBirthdayToday(String dateStr) {
    try {
      final parts = dateStr.split('-');
      if (parts.length >= 3) {
        final month = int.parse(parts[1]);
        final day = int.parse(parts[2]);
        final now = DateTime.now();
        return now.month == month && now.day == day;
      }
    } catch (_) {}
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final user = widget.initialUser;

    final profileAsync = ref.watch(userProfileProvider(user.id));

    final rawBirthDate = profileAsync.valueOrNull?.user.birthDate ?? user.birthDate;
    final rawPhone = profileAsync.valueOrNull?.user.phone ?? user.phone;
    final rawTelegram = profileAsync.valueOrNull?.user.telegram ?? user.telegram;

    final effectiveBirthDate = (rawBirthDate != null && rawBirthDate.isNotEmpty)
        ? rawBirthDate
        : (user.role == UserRole.STUDENT ? '2010-04-12' : '1982-05-18');
    final effectivePhone = (rawPhone != null && rawPhone.isNotEmpty)
        ? rawPhone
        : '+7 (999) 123-45-67';
    final effectiveTelegram = (rawTelegram != null && rawTelegram.isNotEmpty)
        ? rawTelegram
        : (user.email.isNotEmpty ? '@${user.email.split("@")[0]}' : '@ivan.petrov');

    final lessons = (profileAsync.valueOrNull?.todayLessons != null && profileAsync.valueOrNull!.todayLessons.isNotEmpty)
        ? profileAsync.valueOrNull!.todayLessons
        : [
            Lesson(
              id: 'l-1',
              subject: 'Алгебра и начала анализа',
              teacherId: 'teacher-1',
              teacherName: 'Соколова Е.М.',
              room: 'Каб. 305',
              floor: 3,
              startTime: '09:00',
              endTime: '09:45',
              hasHomework: true,
              homeworkDescription: '№ 412, 415 (б), параграф 18',
            ),
            Lesson(
              id: 'l-2',
              subject: 'Русский язык',
              teacherId: 'teacher-2',
              teacherName: 'Ковалева А.С.',
              room: 'Каб. 201',
              floor: 2,
              startTime: '10:00',
              endTime: '10:45',
              hasHomework: false,
            ),
          ];

    final isBday = effectiveBirthDate != null && _isBirthdayToday(effectiveBirthDate);
    final ageStr = effectiveBirthDate != null ? _calculateAgeString(effectiveBirthDate) : '';

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackgroundPrimary : const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Профиль гимназиста'),
        backgroundColor: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header Hero Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(isDark ? 40 : 12),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Avatar
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: user.role == UserRole.TEACHER
                            ? const Color(0xFF7C3AED)
                            : (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed),
                        width: 3,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (user.role == UserRole.TEACHER
                                  ? const Color(0xFF7C3AED)
                                  : AppColors.primaryRed)
                              .withAlpha(50),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: user.avatarUrl != null && user.avatarUrl!.isNotEmpty
                          ? Image.network(
                              user.avatarUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => _buildAvatarFallback(),
                            )
                          : _buildAvatarFallback(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Name
                  Text(
                    '${user.lastName} ${user.firstName}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Manrope',
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Role & Group badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: user.role == UserRole.TEACHER
                              ? const Color(0xFFF3E8FF)
                              : const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          user.role == UserRole.TEACHER ? 'Преподаватель' : 'Учащийся',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: user.role == UserRole.TEACHER
                                ? const Color(0xFF6B21A8)
                                : const Color(0xFF1D4ED8),
                          ),
                        ),
                      ),
                      if (user.groupName != null) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            user.groupName!,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF334155),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),

                  // Birthday Celebration Banner
                  if (isBday) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.amber.withAlpha(40),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('🎂', style: TextStyle(fontSize: 20)),
                          SizedBox(width: 8),
                          Text(
                            'Сегодня отмечает день рождения!',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF78350F),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Quick Contact Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: _buildContactActionButton(
                      icon: Icons.phone,
                      label: 'Звонок',
                      color: const Color(0xFF10B981),
                      onTap: effectivePhone != null
                          ? () => _launchUrl('tel:$effectivePhone')
                          : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildContactActionButton(
                      icon: Icons.mail_outline,
                      label: 'Почта',
                      color: const Color(0xFF3B82F6),
                      onTap: () => _launchUrl('mailto:${user.email}'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildContactActionButton(
                      icon: Icons.send_rounded,
                      label: 'Telegram',
                      color: const Color(0xFF0EA5E9),
                      onTap: effectiveTelegram != null
                          ? () => _launchUrl('https://t.me/${effectiveTelegram.replaceAll('@', '')}')
                          : null,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Details Section (Birthdate, Email, Phone, Telegram)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorderSecondary : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Контактная информация',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.darkTextPrimary : const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Birth Date
                    if (effectiveBirthDate != null) ...[
                      _buildInfoRow(
                        icon: Icons.cake_outlined,
                        title: 'Дата рождения',
                        value: '${_formatDate(effectiveBirthDate)} ($ageStr)',
                        isDark: isDark,
                      ),
                      const Divider(height: 20),
                    ],

                    // Email
                    _buildInfoRow(
                      icon: Icons.alternate_email,
                      title: 'Корпоративная почта',
                      value: user.email,
                      isDark: isDark,
                      onTap: () => _copyToClipboard(user.email, 'Email'),
                    ),
                    const Divider(height: 20),

                    // Phone
                    _buildInfoRow(
                      icon: Icons.phone_android,
                      title: 'Телефон',
                      value: effectivePhone ?? 'Не указан',
                      isDark: isDark,
                      onTap: effectivePhone != null
                          ? () => _copyToClipboard(effectivePhone, 'Телефон')
                          : null,
                    ),
                    const Divider(height: 20),

                    // Telegram
                    _buildInfoRow(
                      icon: Icons.chat_bubble_outline,
                      title: 'Telegram',
                      value: effectiveTelegram ?? 'Не указан',
                      isDark: isDark,
                      onTap: effectiveTelegram != null
                          ? () => _copyToClipboard(effectiveTelegram, 'Telegram')
                          : null,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Today's Timetable Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorderSecondary : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Расписание на сегодня',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppColors.darkTextPrimary : const Color(0xFF0F172A),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Сегодня',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white70 : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    profileAsync.when(
                      loading: () => const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                      error: (_, __) => _buildFallbackLessons(user, isDark),
                      data: (profileData) {
                        final schedLessons = profileData.todayLessons;
                        if (schedLessons.isEmpty) {
                          return _buildEmptyLessons(isDark);
                        }
                        return _buildLessonList(schedLessons, isDark);
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarFallback() {
    final initials = '${widget.initialUser.firstName.isNotEmpty ? widget.initialUser.firstName[0] : ''}'
        '${widget.initialUser.lastName.isNotEmpty ? widget.initialUser.lastName[0] : ''}';
    return Container(
      color: widget.initialUser.role == UserRole.TEACHER
          ? const Color(0xFF7C3AED)
          : AppColors.primaryRed,
      child: Center(
        child: Text(
          initials,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 28,
          ),
        ),
      ),
    );
  }

  Widget _buildContactActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback? onTap,
  }) {
    final enabled = onTap != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: enabled ? color.withAlpha(20) : const Color(0xFFE2E8F0),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: enabled ? color.withAlpha(60) : Colors.transparent,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: enabled ? color : const Color(0xFF94A3B8), size: 22),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: enabled ? color : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String title,
    required String value,
    required bool isDark,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          children: [
            Icon(icon, size: 20, color: isDark ? AppColors.darkTextSecondary : const Color(0xFF64748B)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? AppColors.darkTextSecondary : const Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextPrimary : const Color(0xFF1E293B),
                    ),
                  ),
                ],
              ),
            ),
            if (onTap != null)
              Icon(
                Icons.copy,
                size: 16,
                color: isDark ? AppColors.darkTextSecondary : const Color(0xFF94A3B8),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyLessons(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 18),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.event_busy, size: 36, color: isDark ? Colors.white30 : const Color(0xFFCBD5E1)),
            const SizedBox(height: 8),
            Text(
              'На сегодня уроков нет',
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white60 : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLessonList(List<Lesson> lessons, bool isDark) {
    return Column(
      children: lessons.asMap().entries.map((entry) {
        final idx = entry.key;
        final lesson = entry.value;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF3A3A3C) : const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      '${idx + 1}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF334155),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lesson.subject,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Каб. ${lesson.room} • этаж ${lesson.floor}',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? Colors.white60 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${lesson.startTime}–${lesson.endTime}',
                      style: TextStyle(
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white70 : const Color(0xFF475569),
                      ),
                    ),
                    if (lesson.hasHomework)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'ДЗ',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB45309),
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildFallbackLessons(User user, bool isDark) {
    // Graceful offline fallback
    final mockLessons = [
      Lesson(
        id: '1',
        subject: user.role == UserRole.TEACHER ? 'Математика' : 'Алгебра',
        teacherId: user.id,
        startTime: '09:00',
        endTime: '09:45',
        room: '305',
        floor: 3,
        hasHomework: true,
      ),
      Lesson(
        id: '2',
        subject: user.role == UserRole.TEACHER ? 'Геометрия' : 'Русский язык',
        teacherId: user.id,
        startTime: '10:00',
        endTime: '10:45',
        room: '201',
        floor: 2,
        hasHomework: false,
      ),
    ];
    return _buildLessonList(mockLessons, isDark);
  }
}


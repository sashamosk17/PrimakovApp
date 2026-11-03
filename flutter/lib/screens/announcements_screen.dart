/// Announcements Screen
/// Displays all school announcements with interactive detail sheet & Apple-style card design

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/announcement_provider.dart';
import '../config/app_colors.dart';

class AnnouncementsScreen extends ConsumerStatefulWidget {
  const AnnouncementsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends ConsumerState<AnnouncementsScreen> {
  @override
  void initState() {
    super.initState();
    // Load announcements on screen open
    Future.microtask(() => ref.read(announcementProvider.notifier).fetchAnnouncements());
  }

  void _showAnnouncementDetails(BuildContext context, dynamic announcement, bool isDark) {
    HapticFeedback.lightImpact();

    final createdAt = DateTime.tryParse(announcement.createdAt) ?? DateTime.now();
    final formattedDate = DateFormat('d MMMM yyyy, HH:mm', 'ru').format(createdAt);
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final cardBg = isDark ? AppColors.darkBackgroundSecondary : Colors.white;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withOpacity(0.55),
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(ctx).size.height * 0.88,
          ),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.25),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Drag handle
                Center(
                  child: Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 8),
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: (isDark ? Colors.white24 : Colors.black12),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),

                // Header with category badge & close button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.25),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.campaign_rounded,
                              size: 14,
                              color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              announcement.category ?? 'ОБЪЯВЛЕНИЕ',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                                color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          Navigator.of(ctx).pop();
                        },
                        icon: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.close_rounded,
                            size: 18,
                            color: textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Scrollable Content
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          announcement.title,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                            height: 1.25,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              Icons.schedule_rounded,
                              size: 13,
                              color: textSecondary,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              formattedDate,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          height: 1,
                          color: isDark ? AppColors.darkBorderPrimary : const Color(0xFFEEEEEE),
                        ),
                        const SizedBox(height: 16),
                        SelectableText(
                          announcement.content,
                          style: TextStyle(
                            fontSize: 15,
                            color: textPrimary,
                            height: 1.6,
                            letterSpacing: -0.1,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),

                // Bottom actions
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            Clipboard.setData(ClipboardData(
                              text: '${announcement.title}\n\n${announcement.content}',
                            ));
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text('Текст объявления скопирован в буфер обмена'),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          icon: const Icon(Icons.copy_rounded, size: 16),
                          label: const Text('Скопировать'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: textPrimary,
                            side: BorderSide(
                              color: isDark ? AppColors.darkBorderPrimary : const Color(0xFFD0D7DE),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            Navigator.of(ctx).pop();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            'Закрыть',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final surfaceColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;

    final announcementState = ref.watch(announcementProvider);
    final isLoading = announcementState.isLoading;
    final announcements = announcementState.items;
    final error = announcementState.error;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: isDark ? AppColors.darkSurfaceContainerLow : Colors.white,
        elevation: 0,
        title: Text(
          'Объявления',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: textPrimary,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
              ),
            )
          : error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: textSecondary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Ошибка загрузки',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          error,
                          textAlign: TextAlign.center,
                          style: TextStyle(color: textSecondary),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () {
                            ref.read(announcementProvider.notifier).fetchAnnouncements();
                          },
                          icon: const Icon(Icons.refresh),
                          label: const Text('Повторить'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : announcements.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.announcement_outlined,
                            size: 64,
                            color: textSecondary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Нет объявлений',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Объявления появятся здесь',
                            style: TextStyle(color: textSecondary),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () async {
                        await ref.read(announcementProvider.notifier).fetchAnnouncements();
                      },
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        itemCount: announcements.length,
                        itemBuilder: (context, index) {
                          final announcement = announcements[index];
                          return _AnnouncementCard(
                            announcement: announcement,
                            surfaceColor: surfaceColor,
                            textPrimary: textPrimary,
                            textSecondary: textSecondary,
                            isDark: isDark,
                            onTap: () => _showAnnouncementDetails(context, announcement, isDark),
                          );
                        },
                      ),
                    ),
    );
  }
}

class _AnnouncementCard extends StatelessWidget {
  final dynamic announcement;
  final Color surfaceColor;
  final Color textPrimary;
  final Color textSecondary;
  final bool isDark;
  final VoidCallback onTap;

  const _AnnouncementCard({
    required this.announcement,
    required this.surfaceColor,
    required this.textPrimary,
    required this.textSecondary,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final createdAt = DateTime.tryParse(announcement.createdAt) ?? DateTime.now();
    final formattedDate = DateFormat('d MMMM yyyy, HH:mm', 'ru').format(createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? AppColors.darkBorderPrimary : const Color(0xFFF0F0F0),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: onTap,
          splashColor: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.08),
          highlightColor: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.04),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.announcement_rounded,
                        color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        announcement.title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: textPrimary,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                    Icon(
                      Icons.chevron_right_rounded,
                      color: textSecondary.withOpacity(0.6),
                      size: 20,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  announcement.content,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13.5,
                    color: textPrimary.withOpacity(0.85),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(
                      Icons.access_time_rounded,
                      size: 13,
                      color: textSecondary,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      formattedDate,
                      style: TextStyle(
                        fontSize: 11.5,
                        color: textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      'Подробнее',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                      ),
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

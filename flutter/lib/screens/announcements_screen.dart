/// Announcements Screen
/// Displays all school announcements

import 'package:flutter/material.dart';
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
                        padding: const EdgeInsets.all(16),
                        itemCount: announcements.length,
                        itemBuilder: (context, index) {
                          final announcement = announcements[index];
                          return _AnnouncementCard(
                            announcement: announcement,
                            surfaceColor: surfaceColor,
                            textPrimary: textPrimary,
                            textSecondary: textSecondary,
                            isDark: isDark,
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

  const _AnnouncementCard({
    required this.announcement,
    required this.surfaceColor,
    required this.textPrimary,
    required this.textSecondary,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final createdAt = DateTime.parse(announcement.createdAt);
    final formattedDate = DateFormat('d MMMM yyyy, HH:mm', 'ru').format(createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
        boxShadow: isDark
            ? null
            : [
                const BoxShadow(
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
                  color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
                      .withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.announcement,
                  color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                  size: 20,
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
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            announcement.content,
            style: TextStyle(
              fontSize: 14,
              color: textPrimary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                Icons.access_time,
                size: 14,
                color: textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                formattedDate,
                style: TextStyle(
                  fontSize: 12,
                  color: textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

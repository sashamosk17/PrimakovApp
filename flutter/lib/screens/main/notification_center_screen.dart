import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/app_colors.dart';
import '../../providers/notification_provider.dart';
import '../../services/notifications/push_notification_service.dart';
import 'deadline_screen.dart';
import 'schedule_screen.dart';
import '../canteen_menu_screen.dart';

class NotificationCenterScreen extends ConsumerStatefulWidget {
  const NotificationCenterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<NotificationCenterScreen> createState() =>
      _NotificationCenterScreenState();
}

class _NotificationCenterScreenState
    extends ConsumerState<NotificationCenterScreen> {
  String _selectedFilter = 'ALL'; // ALL, URGENT, DEADLINE_24, SCHEDULE

  String _formatTimeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Только что';
    if (diff.inMinutes < 60) return '${diff.inMinutes} мин назад';
    if (diff.inHours < 24) return '${diff.inHours} ч назад';
    return '${diff.inDays} дн назад';
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg =
        isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary;
    final cardBg =
        isDark ? AppColors.darkBackgroundSecondary : Colors.white;
    final primaryColor =
        isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed;

    // Filter items
    final filteredNotifications = state.notifications.where((n) {
      if (_selectedFilter == 'ALL') return true;
      if (_selectedFilter == 'URGENT') {
        return n.priority == NotificationAlertPriority.urgent;
      }
      if (_selectedFilter == 'DEADLINE_24') {
        return n.payload['type'] == 'DEADLINE_ALERT' &&
            n.hoursRemaining != null &&
            n.hoursRemaining! > 2;
      }
      if (_selectedFilter == 'SCHEDULE') {
        return n.payload['type'] == 'SCHEDULE_CHANGE';
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        title: const Text(
          'Уведомления',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: scaffoldBg,
        elevation: 0,
        actions: [
          if (state.unreadCount > 0)
            TextButton.icon(
              onPressed: () {
                HapticFeedback.lightImpact();
                ref.read(notificationProvider.notifier).markAllAsRead();
              },
              icon: const Icon(Icons.done_all, size: 18),
              label: const Text('Прочитать все'),
              style: TextButton.styleFrom(
                foregroundColor: primaryColor,
              ),
            ),
          PopupMenuButton<String>(
            icon: Icon(
              Icons.more_vert,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
            onSelected: (val) {
              if (val == 'clear') {
                HapticFeedback.mediumImpact();
                ref.read(notificationProvider.notifier).clearAll();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'clear',
                child: Row(
                  children: [
                    Icon(Icons.delete_sweep, size: 20, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Очистить все'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('Все', 'ALL', isDark),
                const SizedBox(width: 8),
                _buildFilterChip('Срочные 2ч', 'URGENT', isDark, isUrgentBadge: true),
                const SizedBox(width: 8),
                _buildFilterChip('Дедлайны 24ч', 'DEADLINE_24', isDark),
                const SizedBox(width: 8),
                _buildFilterChip('Расписание', 'SCHEDULE', isDark),
              ],
            ),
          ),
          const Divider(height: 1),

          // List of notifications
          Expanded(
            child: filteredNotifications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.notifications_none,
                          size: 64,
                          color: isDark
                              ? AppColors.darkIconGray
                              : Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Нет уведомлений в этой категории',
                          style: TextStyle(
                            fontSize: 16,
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredNotifications.length,
                    itemBuilder: (context, index) {
                      final item = filteredNotifications[index];
                      final isUrgent =
                          item.priority == NotificationAlertPriority.urgent;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: item.isRead
                              ? cardBg
                              : (isDark
                                  ? const Color(0xFF2E1C1F)
                                  : const Color(0xFFFFF0F2)),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isUrgent
                                ? (isDark
                                    ? const Color(0xFF93000A)
                                    : const Color(0xFFFFDAD6))
                                : (item.isRead
                                    ? (isDark
                                        ? AppColors.darkBorderPrimary
                                        : AppColors.borderPrimary)
                                    : primaryColor.withOpacity(0.3)),
                            width: isUrgent ? 1.5 : 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () {
                              HapticFeedback.selectionClick();
                              ref
                                  .read(notificationProvider.notifier)
                                  .markAsRead(item.id);

                              final type = item.payload['type'] as String?;
                              if (type == 'DEADLINE_ALERT') {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const DeadlineScreen(),
                                  ),
                                );
                              } else if (type == 'SCHEDULE_CHANGE') {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const ScheduleScreen(),
                                  ),
                                );
                              } else if (type == 'CANTEEN_MENU') {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const CanteenMenuScreen(),
                                  ),
                                );
                              }
                            },
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Icon badge
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: isUrgent
                                          ? (isDark
                                              ? const Color(0xFF93000A)
                                              : const Color(0xFFBA1A1A))
                                          : (item.isRead
                                              ? (isDark
                                                  ? AppColors.darkSurfaceContainerHigh
                                                  : Colors.grey[200])
                                              : primaryColor.withOpacity(0.12)),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(
                                      isUrgent
                                          ? Icons.warning_amber_rounded
                                          : (item.payload['type'] ==
                                                  'SCHEDULE_CHANGE'
                                              ? Icons.calendar_month
                                              : Icons.notifications),
                                      color: isUrgent
                                          ? Colors.white
                                          : (item.isRead
                                              ? (isDark
                                                  ? AppColors.darkTextSecondary
                                                  : Colors.grey[700])
                                              : primaryColor),
                                      size: 22,
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  // Text details
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                item.title,
                                                style: TextStyle(
                                                  fontWeight: item.isRead
                                                      ? FontWeight.w600
                                                      : FontWeight.bold,
                                                  fontSize: 15,
                                                  color: isUrgent
                                                      ? (isDark
                                                          ? const Color(0xFFFFB4AB)
                                                          : const Color(0xFFBA1A1A))
                                                      : (isDark
                                                          ? AppColors.darkTextPrimary
                                                          : AppColors.textPrimary),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              _formatTimeAgo(item.receivedAt),
                                              style: TextStyle(
                                                fontSize: 11,
                                                color: isDark
                                                    ? AppColors.darkTextSecondary
                                                    : AppColors.textSecondary,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          item.body,
                                          style: TextStyle(
                                            fontSize: 13,
                                            height: 1.35,
                                            color: isDark
                                                ? AppColors.darkTextSecondary
                                                : AppColors.textSecondary,
                                          ),
                                        ),
                                        if (isUrgent) ...[
                                          const SizedBox(height: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: isDark
                                                  ? const Color(0xFF93000A)
                                                  : const Color(0xFFBA1A1A),
                                              borderRadius:
                                                  BorderRadius.circular(6),
                                            ),
                                            child: const Text(
                                              'СРОЧНО: остался 1 час до закрытия',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                  if (!item.isRead) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      width: 8,
                                      height: 8,
                                      margin: const EdgeInsets.only(top: 6),
                                      decoration: BoxDecoration(
                                        color: primaryColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String key, bool isDark,
      {bool isUrgentBadge = false}) {
    final isSelected = _selectedFilter == key;
    final primaryColor =
        isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed;

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (val) {
        if (val) {
          HapticFeedback.selectionClick();
          setState(() {
            _selectedFilter = key;
          });
        }
      },
      selectedColor: isUrgentBadge
          ? (isDark ? const Color(0xFF93000A) : const Color(0xFFBA1A1A))
          : primaryColor,
      labelStyle: TextStyle(
        color: isSelected
            ? Colors.white
            : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 13,
      ),
      backgroundColor:
          isDark ? AppColors.darkBackgroundSecondary : Colors.grey[100],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: isSelected
              ? Colors.transparent
              : (isDark ? AppColors.darkBorderPrimary : AppColors.borderPrimary),
        ),
      ),
    );
  }
}


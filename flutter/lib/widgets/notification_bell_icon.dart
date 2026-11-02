import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_colors.dart';
import '../providers/notification_provider.dart';
import '../screens/main/notification_center_screen.dart';

class NotificationBellIcon extends ConsumerWidget {
  final Color? color;

  const NotificationBellIcon({Key? key, this.color}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = color ??
        (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary);
    final badgeColor =
        isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed;

    return Stack(
      alignment: Alignment.center,
      children: [
        IconButton(
          icon: Icon(Icons.notifications_outlined, color: iconColor, size: 26),
          tooltip: 'Уведомления',
          onPressed: () {
            HapticFeedback.lightImpact();
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const NotificationCenterScreen(),
              ),
            );
          },
        ),
        if (state.unreadCount > 0)
          Positioned(
            right: 8,
            top: 8,
            child: IgnorePointer(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor,
                  shape: state.unreadCount > 9 ? BoxShape.rectangle : BoxShape.circle,
                  borderRadius: state.unreadCount > 9 ? BorderRadius.circular(10) : null,
                  border: Border.all(
                    color: isDark ? AppColors.darkBackgroundPrimary : Colors.white,
                    width: 1.5,
                  ),
                ),
                constraints: const BoxConstraints(
                  minWidth: 16,
                  minHeight: 16,
                ),
                child: Center(
                  child: Text(
                    state.unreadCount > 99 ? '99+' : '${state.unreadCount}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      height: 1,
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}


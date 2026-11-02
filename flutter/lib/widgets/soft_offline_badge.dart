import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../config/app_colors.dart';

/// Soft Offline Badge (UI-03)
/// Visual indicator displayed when data is served from local offline cache (Hive).
/// Features animated appearance, human-friendly update timestamp, and quick sync action.
class SoftOfflineBadge extends StatelessWidget {
  final DateTime? lastUpdated;
  final VoidCallback onRefresh;
  final bool isSyncing;

  const SoftOfflineBadge({
    Key? key,
    required this.lastUpdated,
    required this.onRefresh,
    this.isSyncing = false,
  }) : super(key: key);

  String _formatTimestamp(DateTime? timestamp) {
    if (timestamp == null) return 'недавно';
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'только что';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes} мин назад';
    } else if (timestamp.day == now.day &&
        timestamp.month == now.month &&
        timestamp.year == now.year) {
      return 'сегодня в ${DateFormat('HH:mm').format(timestamp)}';
    } else {
      return DateFormat('d MMM в HH:mm', 'ru').format(timestamp);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final timeStr = _formatTimestamp(lastUpdated);

    final bg = isDark ? const Color(0xFF2C2415) : const Color(0xFFFFF9EE);
    final border = isDark ? const Color(0xFF6B531F) : const Color(0xFFFFE0A3);
    final textColor = isDark ? const Color(0xFFFFD580) : const Color(0xFF8A5B00);
    final iconColor = isDark ? const Color(0xFFFFC043) : const Color(0xFFD97706);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(
            isSyncing ? Icons.sync : Icons.cloud_done_outlined,
            size: 18,
            color: iconColor,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Офлайн-режим (данные из кэша)',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
                Text(
                  'Синхронизировано $timeStr',
                  style: TextStyle(
                    fontSize: 10.5,
                    color: textColor.withOpacity(0.85),
                  ),
                ),
              ],
            ),
          ),
          InkWell(
            onTap: isSyncing
                ? null
                : () {
                    HapticFeedback.lightImpact();
                    onRefresh();
                  },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: border.withOpacity(0.5),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isSyncing)
                    const SizedBox(
                      width: 12,
                      height: 12,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  else
                    Icon(Icons.refresh, size: 13, color: textColor),
                  const SizedBox(width: 4),
                  Text(
                    isSyncing ? 'Синхронизация' : 'Обновить',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}


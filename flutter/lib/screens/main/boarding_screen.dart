import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/app_colors.dart';
import '../../config/app_spacing.dart';
import '../../models/api_models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/boarding_provider.dart';

class BoardingScreen extends ConsumerStatefulWidget {
  const BoardingScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<BoardingScreen> createState() => _BoardingScreenState();
}

class _BoardingScreenState extends ConsumerState<BoardingScreen> {
  bool _isCheckingIn = false;

  void _showLeaveRequestModal(BuildContext context) {
    HapticFeedback.lightImpact();
    String transportType = 'SHUTTLE';
    DateTime departureDate = DateTime.now().add(const Duration(days: 2));
    DateTime returnDate = DateTime.now().add(const Duration(days: 4));
    bool guardianConfirmed = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final sheetBg = isDark ? const Color(0xFF1E2024) : Colors.white;
          final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.onSurface;
          final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.secondary;

          return Container(
            decoration: BoxDecoration(
              color: sheetBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white24 : Colors.black12,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.weekend_rounded, color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Weekend Leave Pass',
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                          ),
                        ),
                        Text(
                          'Заявление на выезд из пансиона на выходные',
                          style: TextStyle(fontSize: 12, color: textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Transport Type Selection
                Text(
                  'Способ выезда:',
                  style: TextStyle(fontFamily: 'Manrope', fontSize: 12, fontWeight: FontWeight.bold, color: textSecondary),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    {'type': 'SHUTTLE', 'label': 'Шаттл гимназии', 'icon': Icons.directions_bus},
                    {'type': 'PARENTS', 'label': 'С родителями', 'icon': Icons.family_restroom},
                    {'type': 'INDEPENDENT', 'label': 'Самостоятельно', 'icon': Icons.directions_walk},
                  ].map((item) {
                    final isSel = transportType == item['type'];
                    return ChoiceChip(
                      avatar: Icon(item['icon'] as IconData, size: 16, color: isSel ? Colors.white : AppColors.primary),
                      label: Text(
                        item['label'] as String,
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isSel ? Colors.white : textPrimary,
                        ),
                      ),
                      selected: isSel,
                      selectedColor: AppColors.primary,
                      backgroundColor: isDark ? const Color(0xFF2C2E33) : const Color(0xFFF1F3F6),
                      onSelected: (val) {
                        if (val) setModalState(() => transportType = item['type'] as String);
                      },
                    );
                  }).toList(),
                ),

                const SizedBox(height: 16),
                // Dates preview
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF282A30) : const Color(0xFFF7F8FA),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Выезд:', style: TextStyle(fontSize: 11, color: textSecondary)),
                          Text('Пятница, 17:30', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                      const Icon(Icons.arrow_forward_rounded, size: 16, color: Colors.grey),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Возвращение:', style: TextStyle(fontSize: 11, color: textSecondary)),
                          Text('Воскресенье, 21:00', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),
                // Guardian confirmation switch
                Row(
                  children: [
                    Checkbox(
                      value: guardianConfirmed,
                      activeColor: AppColors.primary,
                      onChanged: (val) {
                        setModalState(() => guardianConfirmed = val ?? false);
                      },
                    ),
                    Expanded(
                      child: Text(
                        'Согласие родителей / законных представителей получено',
                        style: TextStyle(fontFamily: 'Manrope', fontSize: 12, color: textPrimary),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    onPressed: () async {
                      Navigator.of(ctx).pop();
                      final ok = await ref.read(boardingProvider.notifier).submitLeaveRequest(
                        departureDate: departureDate.toIso8601String(),
                        returnDate: returnDate.toIso8601String(),
                        transportType: transportType,
                        guardianConfirmed: guardianConfirmed,
                      );

                      if (ok && mounted) {
                        HapticFeedback.mediumImpact();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Заявление на выезд успешно подано воспитателю!'),
                            backgroundColor: const Color(0xFF2E7D32),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        );
                      }
                    },
                    child: const Text(
                      'Подать заявление на выезд',
                      style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _performCheckIn() async {
    HapticFeedback.mediumImpact();
    setState(() => _isCheckingIn = true);

    final ok = await ref.read(boardingProvider.notifier).submitCheckIn(
      notes: 'Вечерняя перекличка. Кампус Раздоры, корпус подтвержден.',
    );

    setState(() => _isCheckingIn = false);

    if (ok && mounted) {
      HapticFeedback.heavyImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text('Отметка в корпусе успешно сохранена!'),
            ],
          ),
          backgroundColor: const Color(0xFF2E7D32),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.surface;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.onSurface;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.secondary;
    final cardBg = isDark ? AppColors.darkBackgroundSecondary : AppColors.surfaceContainerLowest;

    final boardingAsync = ref.watch(boardingProvider);

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          'Пансион Примакова',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: IconButton(
              onPressed: () => _showLeaveRequestModal(context),
              tooltip: 'Оформить выезд',
              icon: Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.card_membership_rounded, color: AppColors.primary, size: 20),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            await ref.read(boardingProvider.notifier).loadStatus();
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              // Evening Check-in Hero Bento Card
              _buildEveningCheckInCard(isDark),

              const SizedBox(height: 18),

              // Weekend Leave Pass Action Card
              _buildLeavePassPromoCard(isDark, cardBg, textPrimary, textSecondary),

              const SizedBox(height: 24),

              // Status and History Section
              Text(
                'История и статус пансионера',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 12),

              boardingAsync.when(
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                ),
                error: (err, _) => Center(
                  child: Text('Ошибка загрузки истории пансиона: $err', style: TextStyle(color: textSecondary)),
                ),
                data: (statusData) {
                  final recent = statusData.recentCheckIns;
                  if (recent.isEmpty) {
                    return Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Center(
                        child: Text(
                          'Записей вечерней переклички пока нет',
                          style: TextStyle(fontFamily: 'Manrope', color: textSecondary),
                        ),
                      ),
                    );
                  }

                  return Column(
                    children: recent.map((item) {
                      final isPresent = item.status == 'PRESENT';
                      final color = isPresent ? const Color(0xFF2E7D32) : const Color(0xFFF57C00);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.05),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: color.withOpacity(0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    isPresent ? Icons.check_circle_rounded : Icons.access_time_filled_rounded,
                                    color: color,
                                    size: 18,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.notes ?? 'Вечерний чекин',
                                      style: TextStyle(
                                        fontFamily: 'Manrope',
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      item.checkInTime.replaceFirst('T', ' ').split('.')[0],
                                      style: TextStyle(
                                        fontFamily: 'Manrope',
                                        fontSize: 11,
                                        color: textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                              ),
                              child: Text(
                                isPresent ? 'В КОРПУСЕ' : item.status,
                                style: TextStyle(
                                  fontFamily: 'Manrope',
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  color: color,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEveningCheckInCard(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF1B2330), const Color(0xFF14171C)]
              : [const Color(0xFF1E88E5), const Color(0xFF1565C0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E88E5).withOpacity(0.3),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.nightlight_round, color: Colors.white, size: 12),
                    SizedBox(width: 4),
                    Text(
                      '21:00 Вечерний Check-in',
                      style: TextStyle(fontFamily: 'Manrope', color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.shield_rounded, color: Colors.white70, size: 20),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Кампус «Раздоры»',
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Подтвердите присутствие в жилом корпусе пансиона до 21:30',
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 12,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 18),

          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              onPressed: _isCheckingIn ? null : _performCheckIn,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF1565C0),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              icon: _isCheckingIn
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF1565C0)),
                    )
                  : const Icon(Icons.done_all_rounded, size: 20, color: Color(0xFF1565C0)),
              label: Text(
                _isCheckingIn ? 'Регистрация...' : 'Я в корпусе',
                style: const TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1565C0),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLeavePassPromoCard(bool isDark, Color cardBg, Color textPrimary, Color textSecondary) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(color: isDark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.car_rental_rounded, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Weekend Leave Pass',
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Выезд домой на выходные (шатл / родители)',
                  style: TextStyle(fontSize: 12, color: textSecondary),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => _showLeaveRequestModal(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              elevation: 0,
            ),
            child: const Text('Оформить', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}


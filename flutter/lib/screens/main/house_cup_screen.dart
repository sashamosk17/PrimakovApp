import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/app_colors.dart';
import '../../config/app_spacing.dart';
import '../../models/api_models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/house_provider.dart';

class HouseCupScreen extends ConsumerStatefulWidget {
  const HouseCupScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HouseCupScreen> createState() => _HouseCupScreenState();
}

class _HouseCupScreenState extends ConsumerState<HouseCupScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _showAwardPointsDialog(BuildContext context) {
    HapticFeedback.lightImpact();
    String selectedHouse = 'NORTH';
    int points = 25;
    String category = 'OLYMPIAD';
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
          title: const Row(
            children: [
              Icon(Icons.stars_rounded, color: AppColors.primary, size: 24),
              SizedBox(width: 8),
              Text(
                'Начислить баллы Дому',
                style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.w800, fontSize: 18),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Выберите Дом:', style: TextStyle(fontFamily: 'Manrope', fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: selectedHouse,
                  items: const [
                    DropdownMenuItem(value: 'NORTH', child: Text('Север (Белый медведь)')),
                    DropdownMenuItem(value: 'SOUTH', child: Text('Юг (Тигр)')),
                    DropdownMenuItem(value: 'EAST', child: Text('Восток (Дракон и Панда)')),
                    DropdownMenuItem(value: 'WEST', child: Text('Запад (Крылатый лев)')),
                  ],
                  onChanged: (val) {
                    if (val != null) setDialogState(() => selectedHouse = val);
                  },
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('Категория:', style: TextStyle(fontFamily: 'Manrope', fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: category,
                  items: const [
                    DropdownMenuItem(value: 'OLYMPIAD', child: Text('Олимпиады и наука')),
                    DropdownMenuItem(value: 'ACADEMIC', child: Text('Академические успехи')),
                    DropdownMenuItem(value: 'SPORTS', child: Text('Спорт и победы')),
                    DropdownMenuItem(value: 'CULTURE', child: Text('Творчество и сцена')),
                    DropdownMenuItem(value: 'CHARITY', child: Text('Благотворительность')),
                  ],
                  onChanged: (val) {
                    if (val != null) setDialogState(() => category = val);
                  },
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('Количество баллов:', style: TextStyle(fontFamily: 'Manrope', fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [10, 25, 50, 100].map((p) {
                    final isSel = points == p;
                    return ChoiceChip(
                      label: Text('+$p'),
                      selected: isSel,
                      selectedColor: AppColors.primary,
                      labelStyle: TextStyle(
                        color: isSel ? Colors.white : Colors.black87,
                        fontWeight: FontWeight.bold,
                      ),
                      onSelected: (val) {
                        if (val) setDialogState(() => points = p);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
                const Text('Обоснование / Достижение:', style: TextStyle(fontFamily: 'Manrope', fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: reasonController,
                  decoration: InputDecoration(
                    hintText: '1 место на этапе ВсОШ...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Отмена', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                final reason = reasonController.text.trim();
                if (reason.isEmpty) return;

                Navigator.of(ctx).pop();
                final ok = await ref.read(houseProvider.notifier).awardPoints(
                  house: selectedHouse,
                  points: points,
                  category: category,
                  reason: reason,
                );

                if (ok && mounted) {
                  HapticFeedback.heavyImpact();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Баллы Дому успешно начислены! (+$points)'),
                      backgroundColor: const Color(0xFF2E7D32),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                }
              },
              child: const Text('Начислить', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.surface;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.onSurface;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.secondary;
    final cardBg = isDark ? AppColors.darkBackgroundSecondary : AppColors.surfaceContainerLowest;

    final user = ref.watch(currentUserProvider);
    final isStaff = user?.role == UserRole.TEACHER || user?.role == UserRole.ADMIN;
    final houseAsync = ref.watch(houseProvider);

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          'Кубок Домов Примакова',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          if (isStaff)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: IconButton(
                onPressed: () => _showAwardPointsDialog(context),
                tooltip: 'Начислить баллы',
                icon: Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primary, size: 20),
                ),
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            await ref.read(houseProvider.notifier).loadStandings();
          },
          child: houseAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
            error: (err, _) => Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.shield_outlined, size: 48, color: Colors.grey),
                    const SizedBox(height: 12),
                    Text(
                      'Не удалось загрузить таблицу Лиги Домов',
                      style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: textPrimary),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                      onPressed: () => ref.read(houseProvider.notifier).loadStandings(),
                      child: const Text('Повторить', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              ),
            ),
            data: (cupData) {
              final standings = cupData.standings;
              final transactions = cupData.recentTransactions;

              return ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  // Leader Pedestal
                  _buildInteractivePedestal(standings, isDark, textPrimary),

                  const SizedBox(height: 24),

                  // 4 Houses Standings Cards Grid
                  _buildHousesGrid(standings, isDark, textPrimary, textSecondary, cardBg),

                  const SizedBox(height: 28),

                  // Recent Achievements Section Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Лента достижений гимназистов',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: textPrimary,
                          letterSpacing: -0.3,
                        ),
                      ),
                      if (isStaff)
                        TextButton.icon(
                          onPressed: () => _showAwardPointsDialog(context),
                          icon: const Icon(Icons.add, size: 16, color: AppColors.primary),
                          label: const Text('Баллы', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: AppColors.primary)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Transactions List
                  if (transactions.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Center(
                        child: Text(
                          'Пока нет зафиксированных начислений',
                          style: TextStyle(fontFamily: 'Manrope', color: textSecondary),
                        ),
                      ),
                    )
                  else
                    Column(
                      children: transactions
                          .map((tx) => _buildTransactionCard(tx, isDark, textPrimary, textSecondary, cardBg))
                          .toList(),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildInteractivePedestal(List<HouseStanding> standings, bool isDark, Color textPrimary) {
    // Need top 3 (or 4)
    if (standings.length < 3) return const SizedBox.shrink();

    final first = standings.isNotEmpty ? standings[0] : null;
    final second = standings.length > 1 ? standings[1] : null;
    final third = standings.length > 2 ? standings[2] : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        color: isDark ? const Color(0xFF202227) : const Color(0xFFF1F3F6),
        border: Border.all(color: isDark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          const Text(
            'ПЬЕДЕСТАЛ ЛИДЕРОВ КУБКА',
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // 2nd Place (Left)
              if (second != null) _buildPedestalBar(second, 2, 110, isDark, textPrimary),
              const SizedBox(width: 14),

              // 1st Place (Center - Highest)
              if (first != null) _buildPedestalBar(first, 1, 150, isDark, textPrimary),
              const SizedBox(width: 14),

              // 3rd Place (Right)
              if (third != null) _buildPedestalBar(third, 3, 85, isDark, textPrimary),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPedestalBar(HouseStanding standing, int rank, double height, bool isDark, Color textPrimary) {
    final config = HouseConfig.fromHouseName(standing.house);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // House Totem & Crest Pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: config.color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: config.color.withOpacity(0.4)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(config.icon, color: config.color, size: 14),
              const SizedBox(width: 4),
              Text(
                config.displayName,
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: config.color,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '${standing.totalPoints} б.',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 13,
            fontWeight: FontWeight.w900,
            color: textPrimary,
          ),
        ),
        const SizedBox(height: 6),

        // Animated Pedestal Pillar
        AnimatedBuilder(
          animation: _animController,
          builder: (context, child) {
            final curvedValue = CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic).value;
            return Container(
              width: 82,
              height: height * curvedValue,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                gradient: LinearGradient(
                  colors: [
                    config.color,
                    config.color.withOpacity(0.7),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                boxShadow: [
                  BoxShadow(
                    color: config.color.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              alignment: Alignment.topCenter,
              padding: const EdgeInsets.only(top: 8),
              child: Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  '$rank',
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: config.color,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildHousesGrid(
    List<HouseStanding> standings,
    bool isDark,
    Color textPrimary,
    Color textSecondary,
    Color cardBg,
  ) {
    return Column(
      children: standings.map((standing) {
        final config = HouseConfig.fromHouseName(standing.house);

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusTile),
            border: Border.all(color: config.color.withOpacity(0.25)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            children: [
              // Rank badge
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: config.color,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  '#${standing.rank}',
                  style: const TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 14),

              // House info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Дом ${config.displayName}',
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '• ${config.totem}',
                          style: TextStyle(fontSize: 12, color: textSecondary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '«${config.motto}»',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontStyle: FontStyle.italic,
                        fontSize: 11,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              // Points Counter
              Text(
                '${standing.totalPoints} б.',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: config.color,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTransactionCard(
    HouseTransaction tx,
    bool isDark,
    Color textPrimary,
    Color textSecondary,
    Color cardBg,
  ) {
    final config = HouseConfig.fromHouseName(tx.house);
    final dateStr = tx.createdAt.contains('T') ? tx.createdAt.split('T')[0] : tx.createdAt;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.04)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: config.color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(config.icon, color: config.color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Дом ${config.displayName}',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: config.color,
                      ),
                    ),
                    Text(
                      '+${tx.points}',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF2E7D32),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  tx.reason,
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      tx.category,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: textSecondary.withOpacity(0.7),
                      ),
                    ),
                    Text(
                      dateStr,
                      style: TextStyle(
                        fontSize: 10,
                        color: textSecondary.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


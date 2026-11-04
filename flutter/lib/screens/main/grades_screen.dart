import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/app_colors.dart';
import '../../config/app_spacing.dart';
import '../../config/app_typography.dart';
import '../../models/api_models.dart';
import '../../providers/grades_provider.dart';
import '../../widgets/soft_offline_badge.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';

class GradesScreen extends ConsumerStatefulWidget {
  const GradesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<GradesScreen> createState() => _GradesScreenState();
}

class _GradesScreenState extends ConsumerState<GradesScreen> {
  String _selectedPeriod = '1 триместр';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _periods = ['1 триместр', '2 триместр', '3 триместр', 'Итог'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openGpaSimulator([SubjectGradeSummary? initialSubject]) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _GpaSimulatorSheet(
        initialSubject: initialSubject,
        allSummaries: ref.read(gradesProvider).value ?? [],
      ),
    );
  }

  Color _getGradeColor(int value) {
    switch (value) {
      case 5:
        return const Color(0xFF2E7D32); // Emerald
      case 4:
        return const Color(0xFF1E88E5); // Blue
      case 3:
        return const Color(0xFFF57C00); // Amber
      case 2:
      default:
        return const Color(0xFFBA1A1A); // Red
    }
  }

  String _formatWeightSuperscript(double weight) {
    if (weight == 1.0) return '';
    if (weight == 1.5) return '¹·⁵';
    if (weight == 2.0) return '²';
    return '^${weight.toString().replaceAll('.0', '')}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final gradesAsync = ref.watch(gradesProvider);
    final notifier = ref.read(gradesProvider.notifier);

    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.surface;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.onSurface;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.secondary;
    final cardBg = isDark ? AppColors.darkBackgroundSecondary : AppColors.surfaceContainerLowest;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          'Успеваемость',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: IconButton(
              onPressed: () => _openGpaSimulator(),
              tooltip: 'GPA Simulator',
              icon: Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  LucideIcons.calculator,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            await ref.read(gradesProvider.notifier).loadGrades(period: _selectedPeriod);
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              if (notifier.isServedFromCache) ...[
                SoftOfflineBadge(
                  lastUpdated: notifier.lastUpdated,
                  onRefresh: () {
                    ref.read(gradesProvider.notifier).loadGrades(period: _selectedPeriod);
                  },
                ),
                const SizedBox(height: 12),
              ],

              // Bento Header: Overall Academic GPA Summary Card
              _buildOverallGpaCard(isDark, notifier.overallGpa),

              const SizedBox(height: 16),

              // Period Switcher Pills
              _buildPeriodSwitcher(isDark),

              const SizedBox(height: 14),

              // Search Bar
              _buildSearchBar(isDark, textPrimary, textSecondary),

              const SizedBox(height: 16),

              // Subjects List
              gradesAsync.when(
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                ),
                error: (error, _) => Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
                    border: Border.all(color: Colors.red.withOpacity(0.2)),
                  ),
                  child: Column(
                    children: [
                      const Icon(LucideIcons.cloudOff, size: 36, color: Colors.redAccent),
                      const SizedBox(height: 12),
                      Text(
                        'Не удалось загрузить ведомость оценок',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontWeight: FontWeight.w700,
                          color: textPrimary,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        error.toString(),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          color: textSecondary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () {
                          ref.read(gradesProvider.notifier).loadGrades(period: _selectedPeriod);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(LucideIcons.refreshCw, size: 15, color: Colors.white),
                        label: const Text(
                          'Повторить попытку',
                          style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
                data: (summaries) {
                  final filtered = summaries.where((s) {
                    if (_searchQuery.isEmpty) return true;
                    return s.subjectName.toLowerCase().contains(_searchQuery.toLowerCase());
                  }).toList();

                  if (filtered.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Text(
                          'По запросу ничего не найдено',
                          style: TextStyle(fontFamily: 'Manrope', color: textSecondary),
                        ),
                      ),
                    );
                  }

                  return Column(
                    children: filtered
                        .map((summary) => _buildSubjectCard(summary, isDark, textPrimary, textSecondary, cardBg))
                        .toList(),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOverallGpaCard(bool isDark, double gpa) {
    String status = 'Хорошист';
    Color badgeColor = const Color(0xFF1E88E5);
    if (gpa >= 4.75) {
      status = 'Претендент на медаль';
      badgeColor = const Color(0xFF2E7D32);
    } else if (gpa >= 4.5) {
      status = 'Отличник';
      badgeColor = const Color(0xFF2E7D32);
    } else if (gpa < 3.5 && gpa > 0) {
      status = 'Требуется подтянуть';
      badgeColor = const Color(0xFFF57C00);
    }

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF2B1111), const Color(0xFF1C1D1F)]
              : [const Color(0xFF8B0000), const Color(0xFFBA1A1A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: (isDark ? Colors.black : AppColors.primary).withOpacity(0.25),
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
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.graduationCap, color: Colors.white, size: 13),
                        const SizedBox(width: 5),
                        Text(
                          _selectedPeriod,
                          style: const TextStyle(
                            fontFamily: 'Manrope',
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                ),
                child: Text(
                  status,
                  style: const TextStyle(
                    fontFamily: 'Manrope',
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Средневзвешенный балл',
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        gpa > 0 ? gpa.toStringAsFixed(2) : '—',
                        style: const TextStyle(
                          fontFamily: 'Manrope',
                          color: Colors.white,
                          fontSize: 38,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -1,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.18),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.trendingUp, color: Colors.white, size: 12),
                            SizedBox(width: 3),
                            Text(
                              '+0.14 нед.',
                              style: TextStyle(
                                fontFamily: 'Manrope',
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              InkWell(
                onTap: () => _openGpaSimulator(),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Row(
                    children: [
                      Icon(LucideIcons.lineChart, color: AppColors.primary, size: 15),
                      SizedBox(width: 6),
                      Text(
                        'Калькулятор',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          color: AppColors.primary,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodSwitcher(bool isDark) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: _periods.map((period) {
          final isSelected = _selectedPeriod == period;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(
                period,
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? Colors.white
                      : (isDark ? AppColors.darkTextSecondary : AppColors.secondary),
                ),
              ),
              selected: isSelected,
              selectedColor: AppColors.primary,
              backgroundColor: isDark ? const Color(0xFF26282B) : const Color(0xFFE9ECF0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
              ),
              side: BorderSide.none,
              onSelected: (val) {
                if (val) {
                  HapticFeedback.selectionClick();
                  setState(() {
                    _selectedPeriod = period;
                  });
                  ref.read(gradesProvider.notifier).loadGrades(period: period);
                }
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSearchBar(bool isDark, Color textPrimary, Color textSecondary) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF222427) : const Color(0xFFF1F3F6),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          Icon(LucideIcons.search, size: 16, color: textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                });
              },
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 13,
                color: textPrimary,
              ),
              decoration: InputDecoration(
                hintText: 'Поиск по предмету...',
                hintStyle: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 13,
                  color: textSecondary.withOpacity(0.7),
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          if (_searchQuery.isNotEmpty)
            GestureDetector(
              onTap: () {
                _searchController.clear();
                setState(() {
                  _searchQuery = '';
                });
              },
              child: Icon(LucideIcons.x, size: 16, color: textSecondary),
            ),
        ],
      ),
    );
  }

  Widget _buildSubjectCard(
    SubjectGradeSummary summary,
    bool isDark,
    Color textPrimary,
    Color textSecondary,
    Color cardBg,
  ) {
    final avg = summary.averageScore;
    final mark = summary.periodMark ?? 0;
    final markColor = _getGradeColor(mark > 0 ? mark : (avg >= 4.5 ? 5 : (avg >= 3.5 ? 4 : 3)));

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(
          color: isDark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.05),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  summary.subjectName,
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: textPrimary,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
              Row(
                children: [
                  // Average score pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF2E3136) : const Color(0xFFE9ECF0),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'ср. ${avg.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Period Mark
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: markColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: markColor.withOpacity(0.35),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      mark > 0 ? mark.toString() : (avg > 0 ? (avg >= 4.5 ? '5' : (avg >= 3.5 ? '4' : '3')) : '—'),
                      style: const TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Grade Chips with Weight Superscript
          if (summary.grades.isEmpty)
            Text(
              'Нет текущих оценок',
              style: TextStyle(fontFamily: 'Manrope', fontSize: 12, color: textSecondary),
            )
          else
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: summary.grades.map((grade) {
                final color = _getGradeColor(grade.value);
                final weightStr = _formatWeightSuperscript(grade.weight);

                return Tooltip(
                  message: '${grade.topic ?? "Оценка"} (${grade.date.split("T")[0]})',
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: color.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          grade.value.toString(),
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: color,
                          ),
                        ),
                        if (weightStr.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(left: 1),
                            child: Text(
                              weightStr,
                              style: TextStyle(
                                fontFamily: 'Manrope',
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: color.withOpacity(0.85),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

          const SizedBox(height: 12),
          // Quick Simulate button
          Align(
            alignment: Alignment.centerRight,
            child: InkWell(
              onTap: () => _openGpaSimulator(summary),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.slidersHorizontal, size: 13, color: isDark ? const Color(0xFFFFA396) : AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      'Смоделировать балл',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isDark ? const Color(0xFFFFA396) : AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// GPA Simulator Interactive Bottom Sheet
// ==========================================

class _GpaSimulatorSheet extends StatefulWidget {
  final SubjectGradeSummary? initialSubject;
  final List<SubjectGradeSummary> allSummaries;

  const _GpaSimulatorSheet({
    Key? key,
    this.initialSubject,
    required this.allSummaries,
  }) : super(key: key);

  @override
  State<_GpaSimulatorSheet> createState() => _GpaSimulatorSheetState();
}

class _GpaSimulatorSheetState extends State<_GpaSimulatorSheet> {
  late SubjectGradeSummary _selectedSubject;
  late GpaSimulator _simulator;

  @override
  void initState() {
    super.initState();
    _selectedSubject = widget.initialSubject ??
        (widget.allSummaries.isNotEmpty
            ? widget.allSummaries.first
            : SubjectGradeSummary(subjectName: 'Алгебра', grades: [], averageScore: 4.42));
    _simulator = GpaSimulator(summary: _selectedSubject);
  }

  void _onSelectSubject(SubjectGradeSummary sub) {
    HapticFeedback.selectionClick();
    setState(() {
      _selectedSubject = sub;
      _simulator = GpaSimulator(summary: sub);
    });
  }

  void _addGrade(int value, double weight, String label) {
    HapticFeedback.lightImpact();
    setState(() {
      _simulator.addHypotheticalGrade(value: value, weight: weight, label: label);
    });
  }

  void _removeGrade(int index) {
    HapticFeedback.lightImpact();
    setState(() {
      _simulator.removeHypotheticalGrade(index);
    });
  }

  void _reset() {
    HapticFeedback.mediumImpact();
    setState(() {
      _simulator.reset();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.onSurface;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.secondary;
    final sheetBg = isDark ? const Color(0xFF1E2024) : Colors.white;

    final currentScore = _simulator.currentScore;
    final projectedScore = _simulator.simulatedScore;
    final reachesFive = projectedScore >= 4.50;

    return Container(
      decoration: BoxDecoration(
        color: sheetBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag Handle
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

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(LucideIcons.calculator, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'GPA Simulator',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: textPrimary,
                        ),
                      ),
                      Text(
                        'Калькулятор прогноза балла',
                        style: TextStyle(fontSize: 12, color: textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
              if (_simulator.hypotheticalGrades.isNotEmpty)
                TextButton(
                  onPressed: _reset,
                  child: const Text('Сброс', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // Subject Selector Dropdown / Chips
          if (widget.allSummaries.length > 1) ...[
            Text(
              'Выберите предмет:',
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: textSecondary,
              ),
            ),
            const SizedBox(height: 6),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: widget.allSummaries.map((sub) {
                  final isSelected = sub.subjectName == _selectedSubject.subjectName;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(
                        sub.subjectName,
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? Colors.white : textPrimary,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: AppColors.primary,
                      backgroundColor: isDark ? const Color(0xFF2C2E33) : const Color(0xFFF1F3F6),
                      onSelected: (val) {
                        if (val) _onSelectSubject(sub);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Simulation Score Display Bento
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF282A30) : const Color(0xFFF7F8FA),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: reachesFive
                    ? const Color(0xFF2E7D32).withOpacity(0.4)
                    : AppColors.primary.withOpacity(0.2),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text(
                      'Текущий балл',
                      style: TextStyle(fontFamily: 'Manrope', fontSize: 11, color: textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      currentScore.toStringAsFixed(2),
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: textPrimary,
                      ),
                    ),
                  ],
                ),
                Icon(LucideIcons.arrowRight, color: textSecondary, size: 18),
                Column(
                  children: [
                    Text(
                      'Прогноз балла',
                      style: TextStyle(fontFamily: 'Manrope', fontSize: 11, color: textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      projectedScore.toStringAsFixed(2),
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: reachesFive ? const Color(0xFF2E7D32) : AppColors.primary,
                      ),
                    ),
                  ],
                ),
                Column(
                  children: [
                    Text(
                      'Выходит 5?',
                      style: TextStyle(fontFamily: 'Manrope', fontSize: 11, color: textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: reachesFive ? const Color(0xFF2E7D32) : const Color(0xFFBA1A1A),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        reachesFive ? 'ДА (5)' : 'НЕТ (4)',
                        style: const TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          Text(
            'Добавить гипотетическую оценку:',
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: textSecondary,
            ),
          ),
          const SizedBox(height: 10),

          // Quick Action Buttons for adding hypothetical grades
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildAddGradeButton(
                label: '+5 (вес 1)',
                value: 5,
                weight: 1.0,
                color: const Color(0xFF2E7D32),
              ),
              _buildAddGradeButton(
                label: '+5 (вес 2, К/Р)',
                value: 5,
                weight: 2.0,
                color: const Color(0xFF2E7D32),
              ),
              _buildAddGradeButton(
                label: '+4 (вес 1)',
                value: 4,
                weight: 1.0,
                color: const Color(0xFF1E88E5),
              ),
              _buildAddGradeButton(
                label: '+4 (вес 2, К/Р)',
                value: 4,
                weight: 2.0,
                color: const Color(0xFF1E88E5),
              ),
              _buildAddGradeButton(
                label: '+3 (вес 1)',
                value: 3,
                weight: 1.0,
                color: const Color(0xFFF57C00),
              ),
            ],
          ),

          // List of added hypothetical grades
          if (_simulator.hypotheticalGrades.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'Добавленные симуляции:',
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: textSecondary,
              ),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: _simulator.hypotheticalGrades.asMap().entries.map((entry) {
                final idx = entry.key;
                final h = entry.value;
                return Chip(
                  label: Text(
                    h.label,
                    style: const TextStyle(fontFamily: 'Manrope', fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  deleteIcon: const Icon(LucideIcons.x, size: 14),
                  onDeleted: () => _removeGrade(idx),
                  backgroundColor: isDark ? const Color(0xFF32353B) : const Color(0xFFE9ECF0),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  side: BorderSide.none,
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAddGradeButton({
    required String label,
    required int value,
    required double weight,
    required Color color,
  }) {
    return ElevatedButton(
      onPressed: () => _addGrade(value, weight, label),
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withOpacity(0.12),
        foregroundColor: color,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: color.withOpacity(0.3)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Manrope',
          fontWeight: FontWeight.w800,
          fontSize: 12,
          color: color,
        ),
      ),
    );
  }
}


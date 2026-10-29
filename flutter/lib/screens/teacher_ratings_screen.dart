/// Teacher Ratings Screen
/// Displays teacher ratings and allows students to rate teachers

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/rating_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/user_provider.dart';
import '../services/api/user_service.dart';
import '../config/app_colors.dart';

class TeacherRatingsScreen extends ConsumerStatefulWidget {
  const TeacherRatingsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TeacherRatingsScreen> createState() =>
      _TeacherRatingsScreenState();
}

class _TeacherRatingsScreenState extends ConsumerState<TeacherRatingsScreen> {
  String? _selectedTeacherId;
  final TextEditingController _commentController = TextEditingController();
  double _currentRating = 5.0;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _loadTeacherRatings(String teacherId) {
    ref.read(ratingProvider.notifier).fetchTeacherRatings(teacherId);
  }

  Future<void> _submitRating() async {
    if (_selectedTeacherId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Выберите учителя')),
      );
      return;
    }

    if (_commentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Напишите комментарий')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      await ref.read(ratingProvider.notifier).rateTeacher(
            _selectedTeacherId!,
            _currentRating,
            _commentController.text.trim(),
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Оценка успешно отправлена')),
        );
        _commentController.clear();
        setState(() {
          _currentRating = 5.0;
        });
        _loadTeacherRatings(_selectedTeacherId!);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg =
        isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary;
    final textPrimary =
        isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary =
        isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final surfaceColor = isDark
        ? AppColors.darkBackgroundSecondary
        : AppColors.backgroundSecondary;
    final primaryColor =
        isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed;
    final borderColor =
        isDark ? AppColors.darkBorderSecondary : const Color(0xFFE8E8EA);

    final authState = ref.watch(authProvider);
    final userRole = authState.role;

    // Загрузить список учителей из API
    final teachersAsync = ref.watch(teachersProvider);

    return teachersAsync.when(
      loading: () => Scaffold(
        backgroundColor: scaffoldBg,
        appBar: AppBar(
          backgroundColor:
              isDark ? AppColors.darkSurfaceContainerLow : Colors.white,
          elevation: 0,
          title: Text(
            'Рейтинги учителей',
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
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (error, stack) => Scaffold(
        backgroundColor: scaffoldBg,
        appBar: AppBar(
          backgroundColor:
              isDark ? AppColors.darkSurfaceContainerLow : Colors.white,
          elevation: 0,
          title: Text(
            'Рейтинги учителей',
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
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: textSecondary),
                const SizedBox(height: 16),
                Text(
                  'Ошибка загрузки учителей',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: textSecondary),
                ),
              ],
            ),
          ),
        ),
      ),
      data: (teachers) => _buildScreen(
          context,
          teachers,
          isDark,
          scaffoldBg,
          textPrimary,
          textSecondary,
          surfaceColor,
          primaryColor,
          borderColor,
          userRole),
    );
  }

  Widget _buildScreen(
    BuildContext context,
    List<Teacher> teachers,
    bool isDark,
    Color scaffoldBg,
    Color textPrimary,
    Color textSecondary,
    Color surfaceColor,
    Color primaryColor,
    Color borderColor,
    String? userRole,
  ) {
    final ratingState = ref.watch(ratingProvider);
    final ratings = ratingState.items;
    final isLoading = ratingState.isLoading;
    final averageRating = ref.watch(averageRatingProvider);

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor:
            isDark ? AppColors.darkSurfaceContainerLow : Colors.white,
        elevation: 0,
        title: Text(
          'Рейтинги учителей',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Teacher Selection
            Text(
              'Выберите учителя',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: borderColor),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: _selectedTeacherId,
                  hint: Text(
                    'Выберите учителя...',
                    style: TextStyle(color: textSecondary),
                  ),
                  dropdownColor: surfaceColor,
                  style: TextStyle(color: textPrimary, fontSize: 16),
                  items: teachers.map((teacher) {
                    return DropdownMenuItem<String>(
                      value: teacher.id,
                      child: Text(teacher.fullName),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedTeacherId = value;
                    });
                    if (value != null) {
                      _loadTeacherRatings(value);
                    }
                  },
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Rating Form (only for students)
            if (_selectedTeacherId != null && userRole == 'STUDENT') ...[
              Text(
                'Оценить учителя',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Оценка:',
                        style: TextStyle(
                            color: textPrimary, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        return IconButton(
                          icon: Icon(
                            index < _currentRating
                                ? Icons.star
                                : Icons.star_border,
                            color: const Color(0xFFFFB300),
                            size: 32,
                          ),
                          onPressed: () {
                            setState(() {
                              _currentRating = index + 1.0;
                            });
                          },
                        );
                      }),
                    ),
                    const SizedBox(height: 16),
                    Text('Комментарий:',
                        style: TextStyle(
                            color: textPrimary, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _commentController,
                      maxLines: 4,
                      style: TextStyle(color: textPrimary),
                      decoration: InputDecoration(
                        hintText: 'Поделитесь своим мнением (анонимно)',
                        hintStyle: TextStyle(color: textSecondary),
                        filled: true,
                        fillColor: isDark
                            ? AppColors.darkSurfaceContainerLow
                            : Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: borderColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: borderColor),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: primaryColor, width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _isSubmitting ? null : _submitRating,
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2))
                            : const Text('Отправить оценку',
                                style: TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    )
                  ],
                ),
              ),
            ],

            // Rating List (only for admins)
            if (_selectedTeacherId != null &&
                (userRole == 'ADMIN' || userRole == 'SUPERADMIN')) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Отзывы',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  if (ratings.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFB300).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.star,
                            color: Color(0xFFFFB300),
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            averageRating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFFFB300),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              if (isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (ratings.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      children: [
                        Icon(
                          Icons.rate_review_outlined,
                          size: 48,
                          color: textSecondary,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Пока нет отзывов',
                          style: TextStyle(
                            fontSize: 16,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ...ratings.map((rating) => _RatingCard(
                      rating: rating,
                      surfaceColor: surfaceColor,
                      textPrimary: textPrimary,
                      textSecondary: textSecondary,
                      isDark: isDark,
                    )),
            ],
          ],
        ),
      ),
    );
  }
}

class _RatingCard extends StatelessWidget {
  final dynamic rating;
  final Color surfaceColor;
  final Color textPrimary;
  final Color textSecondary;
  final bool isDark;

  const _RatingCard({
    required this.rating,
    required this.surfaceColor,
    required this.textPrimary,
    required this.textSecondary,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final createdAt = DateTime.parse(rating.createdAt);
    final formattedDate = DateFormat('d MMMM yyyy', 'ru').format(createdAt);

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    index < rating.rate.floor()
                        ? Icons.star
                        : Icons.star_border,
                    color: const Color(0xFFFFB300),
                    size: 20,
                  );
                }),
              ),
              Text(
                formattedDate,
                style: TextStyle(
                  fontSize: 12,
                  color: textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            rating.comment,
            style: TextStyle(
              fontSize: 14,
              color: textPrimary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

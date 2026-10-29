import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import '../../config/app_colors.dart';
import '../../config/app_typography.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/priority_toggle.dart';
import '../../providers/deadline_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/api_models.dart';

/// Shows the add deadline modal bottom sheet
void showAddDeadlineModal(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => const AddDeadlineScreen(),
  );
}

class AddDeadlineScreen extends ConsumerStatefulWidget {
  const AddDeadlineScreen({super.key});

  @override
  ConsumerState<AddDeadlineScreen> createState() => _AddDeadlineScreenState();
}

class _AddDeadlineScreenState extends ConsumerState<AddDeadlineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  String? _selectedSubject;
  DateTime? _selectedDate;
  bool _isHighPriority = false;
  bool _isLoading = false;

  final List<String> _subjects = [
    'Математика',
    'Русский язык',
    'Литература',
    'Английский язык',
    'История',
    'Обществознание',
    'Физика',
    'Химия',
    'Биология',
    'География',
    'Информатика',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: isDark
                ? ColorScheme.dark(
                    primary: AppColors.primaryRed,
                    onPrimary: Colors.white,
                    surface: AppColors.darkSurfaceContainerHigh,
                    onSurface: AppColors.darkTextPrimary,
                    surfaceContainerHighest: AppColors.darkBackgroundSecondary,
                  )
                : ColorScheme.light(
                    primary: AppColors.primaryRed,
                    onPrimary: Colors.white,
                    surface: Colors.white,
                    onSurface: AppColors.textPrimary,
                  ),
            dialogBackgroundColor: isDark
                ? AppColors.darkSurfaceContainerHigh
                : Colors.white,
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primaryRed,
              ),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _saveDeadline() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Выберите предмет')),
      );
      return;
    }
    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Выберите дату сдачи')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final userId = ref.read(userIdProvider);
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final newDeadline = Deadline(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: _titleController.text,
        description: _descriptionController.text.isEmpty
            ? ''
            : _descriptionController.text,
        dueDate: _selectedDate!.toIso8601String(),
        userId: userId,
        status: DeadlineStatus.PENDING,
        subject: _selectedSubject ?? '',
        createdAt: DateTime.now().toIso8601String(),
        completedAt: null,
      );

      await ref.read(deadlineProvider.notifier).createDeadline(newDeadline);

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Дедлайн создан')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: AppColors.cardShadow,
          ),
          child: Stack(
            children: [
              // Sketch Background Watermark
              Positioned(
                top: -38.79,
                right: -12.37,
                child: Transform.rotate(
                  angle: 0.2094,
                  child: Opacity(
                    opacity: 0.03,
                    child: Image.asset(
                      'assets/images/sketch_bg.png',
                      width: 390,
                      height: 160,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              // Content
              Column(
                children: [
                  // Drag Handle
                  Container(
                    margin: const EdgeInsets.only(top: 12),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.darkBorderPrimary
                          : AppColors.borderPrimary,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  // Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                    child: Row(
                      children: [
                        IconButton(
                          icon: Icon(
                            Icons.close,
                            color: isDark
                                ? AppColors.darkTextPrimary
                                : AppColors.textPrimary,
                          ),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Новый дедлайн',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? AppColors.darkTextPrimary
                                : AppColors.textPrimary,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.darkSurfaceContainerHigh
                                : AppColors.backgroundSecondary,
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Opacity(
                              opacity: 0.8,
                              child: Image.asset(
                                'assets/images/primakov_logo.png',
                                width: 24,
                                height: 24,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Form Area
                  Expanded(
                    child: SingleChildScrollView(
                      controller: scrollController,
                      padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            // Task Title Field
                            CustomTextField(
                              label: 'Название задачи',
                              placeholder: 'Например: Курсовая работа',
                              controller: _titleController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Введите название';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 32),
                            // Subject Selection
                            CustomDropdown<String>(
                              label: 'Предмет',
                              placeholder: 'Выберите предмет',
                              value: _selectedSubject,
                              items: _subjects
                                  .map((subject) => DropdownMenuItem(
                                        value: subject,
                                        child: Text(subject),
                                      ))
                                  .toList(),
                              onChanged: (value) {
                                setState(() {
                                  _selectedSubject = value;
                                });
                              },
                            ),
                            const SizedBox(height: 32),
                            // Date Picker Field
                            CustomTextField(
                              label: 'Дата сдачи',
                              placeholder: _selectedDate == null
                                  ? 'mm/dd/yyyy'
                                  : DateFormat('MM/dd/yyyy')
                                      .format(_selectedDate!),
                              readOnly: true,
                              onTap: _selectDate,
                              suffixIcon: Padding(
                                padding: const EdgeInsets.all(10),
                                child: SvgPicture.asset(
                                  'assets/icons/calendar_icon.svg',
                                  width: 18,
                                  height: 20,
                                ),
                              ),
                            ),
                            const SizedBox(height: 32),
                            // Description Multi-line
                            CustomTextField(
                              label: 'Описание',
                              placeholder:
                                  'Добавьте детали задачи, ссылки или\nтребования...',
                              controller: _descriptionController,
                              maxLines: 4,
                            ),
                            const SizedBox(height: 32),
                            // Priority Toggle
                            PriorityToggle(
                              isHighPriority: _isHighPriority,
                              onChanged: (value) {
                                setState(() {
                                  _isHighPriority = value;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Footer Action
                  Container(
                    color: bgColor,
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        CustomButton(
                          text: 'Сохранить',
                          onPressed: _saveDeadline,
                          isLoading: _isLoading,
                          icon: SvgPicture.asset(
                            'assets/icons/checkmark_icon.svg',
                            width: 9.5,
                            height: 7,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'ACADEMIC CURATOR SYSTEM V2.4',
                          style: AppTypography.labelSmall.copyWith(
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

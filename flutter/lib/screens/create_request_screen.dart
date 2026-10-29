import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/request_provider.dart';
import '../providers/room_provider.dart';
import '../models/api_models.dart';
import '../config/app_spacing.dart';

class CreateRequestScreen extends ConsumerStatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  ConsumerState<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends ConsumerState<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  RequestType _selectedType = RequestType.IT;
  RequestPriority _selectedPriority = RequestPriority.MEDIUM;
  String? _selectedRoomId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(roomProvider.notifier).fetchRooms());
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final roomState = ref.watch(roomProvider);
    final requestState = ref.watch(requestProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Новая заявка',
          style: TextStyle(
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            // Request Type
            Text(
              'Тип заявки',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTypeCard(
                    RequestType.IT,
                    'IT',
                    Icons.computer,
                    const Color(0xFF2196F3),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTypeCard(
                    RequestType.MAINTENANCE,
                    'Ремонт',
                    Icons.build,
                    const Color(0xFFFF9800),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTypeCard(
                    RequestType.CLEANING,
                    'Уборка',
                    Icons.cleaning_services,
                    const Color(0xFF4CAF50),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),

            // Title
            Text(
              'Заголовок',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _titleController,
              style: TextStyle(color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'Краткое описание проблемы',
                hintStyle: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                filled: true,
                fillColor: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: isDark ? BorderSide(color: AppColors.darkBorderPrimary) : BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: isDark ? BorderSide(color: AppColors.darkBorderPrimary) : BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Введите заголовок';
                }
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.xl),

            // Description
            Text(
              'Описание',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descriptionController,
              maxLines: 5,
              style: TextStyle(color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'Подробное описание проблемы',
                hintStyle: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                filled: true,
                fillColor: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: isDark ? BorderSide(color: AppColors.darkBorderPrimary) : BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: isDark ? BorderSide(color: AppColors.darkBorderPrimary) : BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                  ),
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Введите описание';
                }
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.xl),

            // Priority
            Text(
              'Приоритет',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildPriorityChip(RequestPriority.LOW, 'Низкий', Colors.grey),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildPriorityChip(RequestPriority.MEDIUM, 'Средний', Colors.blue),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildPriorityChip(RequestPriority.HIGH, 'Высокий', Colors.orange),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildPriorityChip(RequestPriority.URGENT, 'Срочно', Colors.red),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),

            // Room
            Text(
              'Аудитория (опционально)',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
              ),
              child: DropdownButtonFormField<String>(
                initialValue: _selectedRoomId,
                dropdownColor: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
                style: TextStyle(color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Выберите аудиторию',
                  hintStyle: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
                items: [
                  DropdownMenuItem<String>(
                    value: null,
                    child: Text(
                      'Не выбрано',
                      style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                    ),
                  ),
                  ...roomState.rooms.map((room) {
                    return DropdownMenuItem<String>(
                      value: room.id,
                      child: Text('${room.number} - ${room.name ?? "Аудитория"}'),
                    );
                  }),
                ],
                onChanged: (value) {
                  setState(() => _selectedRoomId = value);
                },
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),

            // Submit button
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: requestState.isLoading ? null : _submitRequest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: requestState.isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Отправить заявку',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeCard(RequestType type, String label, IconData icon, Color color) {
    final isSelected = _selectedType == type;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => setState(() => _selectedType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? color : (isDark ? AppColors.darkBackgroundSecondary : Colors.white),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : (isDark ? AppColors.darkBorderPrimary : Colors.grey.shade300),
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 32,
              color: isSelected ? Colors.white : color,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isSelected
                    ? Colors.white
                    : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityChip(RequestPriority priority, String label, Color color) {
    final isSelected = _selectedPriority == priority;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => setState(() => _selectedPriority = priority),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? color : (isDark ? AppColors.darkBackgroundSecondary : Colors.white),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? color : (isDark ? AppColors.darkBorderPrimary : Colors.grey.shade300),
            width: 2,
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected
                ? Colors.white
                : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
          ),
        ),
      ),
    );
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    try {
      await ref.read(requestProvider.notifier).createRequest(
            title: _titleController.text.trim(),
            description: _descriptionController.text.trim(),
            type: _selectedType,
            priority: _selectedPriority,
            roomId: _selectedRoomId,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Заявка успешно создана'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}

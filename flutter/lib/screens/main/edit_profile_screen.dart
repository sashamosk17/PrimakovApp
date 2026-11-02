import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';
import '../../providers/user_provider.dart';
import '../../providers/auth_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _birthDateController;
  late TextEditingController _phoneController;
  late TextEditingController _telegramController;
  bool _isChanged = false;

  @override
  void initState() {
    super.initState();
    final currentUser = ref.read(currentUserProvider);
    final isStudent = currentUser?.role == UserRole.STUDENT;
    final defaultBirth = isStudent ? '2010-04-12' : '1982-05-18';
    final defaultPhone = '+7 (999) 123-45-67';
    final defaultTg = currentUser != null && currentUser.email.isNotEmpty
        ? '@${currentUser.email.split("@")[0]}'
        : '@ivan.petrov';

    _firstNameController = TextEditingController(text: currentUser?.firstName ?? 'Иван');
    _lastNameController = TextEditingController(text: currentUser?.lastName ?? 'Петров');
    _birthDateController = TextEditingController(
      text: (currentUser?.birthDate != null && currentUser!.birthDate!.isNotEmpty)
          ? currentUser.birthDate!.split('T')[0]
          : defaultBirth,
    );
    _phoneController = TextEditingController(
      text: (currentUser?.phone != null && currentUser!.phone!.isNotEmpty)
          ? currentUser.phone!
          : defaultPhone,
    );
    _telegramController = TextEditingController(
      text: (currentUser?.telegram != null && currentUser!.telegram!.isNotEmpty)
          ? currentUser.telegram!
          : defaultTg,
    );
    
    // Listen to changes
    _firstNameController.addListener(_onTextChanged);
    _lastNameController.addListener(_onTextChanged);
    _birthDateController.addListener(_onTextChanged);
    _phoneController.addListener(_onTextChanged);
    _telegramController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _firstNameController.removeListener(_onTextChanged);
    _lastNameController.removeListener(_onTextChanged);
    _birthDateController.removeListener(_onTextChanged);
    _phoneController.removeListener(_onTextChanged);
    _telegramController.removeListener(_onTextChanged);

    _firstNameController.dispose();
    _lastNameController.dispose();
    _birthDateController.dispose();
    _phoneController.dispose();
    _telegramController.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final currentUser = ref.read(currentUserProvider);
    final curBirthDate = currentUser?.birthDate != null ? currentUser!.birthDate!.split('T')[0] : '';
    
    final firstNameChanged = _firstNameController.text.trim() != (currentUser?.firstName ?? '');
    final lastNameChanged = _lastNameController.text.trim() != (currentUser?.lastName ?? '');
    final birthDateChanged = _birthDateController.text.trim() != curBirthDate;
    final phoneChanged = _phoneController.text.trim() != (currentUser?.phone ?? '');
    final telegramChanged = _telegramController.text.trim() != (currentUser?.telegram ?? '');
    
    setState(() {
      _isChanged = firstNameChanged || lastNameChanged || birthDateChanged || phoneChanged || telegramChanged;
    });
  }

  Future<void> _selectBirthDate() async {
    DateTime initial = DateTime(2008, 1, 1);
    if (_birthDateController.text.isNotEmpty) {
      try {
        initial = DateTime.parse(_birthDateController.text.trim());
      } catch (_) {}
    }

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      helpText: 'Выберите дату рождения',
      cancelText: 'Отмена',
      confirmText: 'Выбрать',
    );

    if (picked != null) {
      final y = picked.year.toString().padLeft(4, '0');
      final m = picked.month.toString().padLeft(2, '0');
      final d = picked.day.toString().padLeft(2, '0');
      setState(() {
        _birthDateController.text = '$y-$m-$d';
      });
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final profileNotifier = ref.read(profileProvider.notifier);
    
    try {
      var tg = _telegramController.text.trim();
      if (tg.isNotEmpty && !tg.startsWith('@')) {
        tg = '@$tg';
      }

      await profileNotifier.updateProfile(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        birthDate: _birthDateController.text.trim().isNotEmpty ? _birthDateController.text.trim() : null,
        phone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
        telegram: tg.isNotEmpty ? tg : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Профиль успешно обновлен'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
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

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(profileLoadingProvider);
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Редактирование профиля'),
        actions: [
          if (_isChanged && !isLoading)
            TextButton(
              onPressed: _saveProfile,
              child: const Text('Сохранить'),
            ),
          if (isLoading)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
        ],
      ),
      body: currentUser == null
          ? const Center(child: Text('Ошибка загрузки профиля'))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Email (только для чтения)
                    TextFormField(
                      initialValue: currentUser.email,
                      decoration: const InputDecoration(
                        labelText: 'Email (аккаунт)',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      enabled: false,
                      style: const TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 16),

                    // Класс (если ученик)
                    if (currentUser.groupName != null) ...[
                      TextFormField(
                        initialValue: currentUser.groupName,
                        decoration: const InputDecoration(
                          labelText: 'Класс',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.school_outlined),
                        ),
                        enabled: false,
                        style: const TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 16),
                    ],
                    
                    // Имя
                    TextFormField(
                      controller: _firstNameController,
                      decoration: const InputDecoration(
                        labelText: 'Имя',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.person),
                      ),
                      textCapitalization: TextCapitalization.words,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Введите имя';
                        }
                        if (value.trim().length > 50) {
                          return 'Имя не должно превышать 50 символов';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    // Фамилия
                    TextFormField(
                      controller: _lastNameController,
                      decoration: const InputDecoration(
                        labelText: 'Фамилия',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      textCapitalization: TextCapitalization.words,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Введите фамилию';
                        }
                        if (value.trim().length > 50) {
                          return 'Фамилия не должна превышать 50 символов';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Дата рождения
                    TextFormField(
                      controller: _birthDateController,
                      readOnly: true,
                      onTap: _selectBirthDate,
                      decoration: InputDecoration(
                        labelText: 'Дата рождения',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.cake_outlined),
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.calendar_month),
                          onPressed: _selectBirthDate,
                        ),
                        hintText: 'ГГГГ-ММ-ДД',
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Телефон
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Номер телефона',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.phone_outlined),
                        hintText: '+7 (999) 000-00-00',
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Telegram
                    TextFormField(
                      controller: _telegramController,
                      decoration: const InputDecoration(
                        labelText: 'Telegram никнейм',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.send_rounded),
                        hintText: '@username',
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    // Кнопка сохранения
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: (_isChanged && !isLoading) ? _saveProfile : null,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Сохранить изменения'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

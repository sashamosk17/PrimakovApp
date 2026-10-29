import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  bool _isChanged = false;

  @override
  void initState() {
    super.initState();
    final currentUser = ref.read(currentUserProvider);
    _firstNameController = TextEditingController(text: currentUser?.firstName ?? '');
    _lastNameController = TextEditingController(text: currentUser?.lastName ?? '');
    
    // Слушаем изменения в текстовых полях
    _firstNameController.addListener(_onTextChanged);
    _lastNameController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _firstNameController.removeListener(_onTextChanged);
    _lastNameController.removeListener(_onTextChanged);
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final currentUser = ref.read(currentUserProvider);
    final firstNameChanged = _firstNameController.text != (currentUser?.firstName ?? '');
    final lastNameChanged = _lastNameController.text != (currentUser?.lastName ?? '');
    
    setState(() {
      _isChanged = firstNameChanged || lastNameChanged;
    });
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final profileNotifier = ref.read(profileProvider.notifier);
    
    try {
      await profileNotifier.updateProfile(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
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
          : Padding(
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
                        labelText: 'Email',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.email),
                      ),
                      enabled: false,
                      style: const TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 16),
                    
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
                    
                    // Роль (только для чтения)
                    TextFormField(
                      initialValue: currentUser.role.name,
                      decoration: const InputDecoration(
                        labelText: 'Роль',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.admin_panel_settings),
                      ),
                      enabled: false,
                      style: const TextStyle(color: Colors.grey),
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
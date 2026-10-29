/// Converted from React Native RegisterScreen.tsx

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/app_colors.dart';
import '../../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_emailController.text.isEmpty || 
        _passwordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      setState(() {
        _error = 'Пожалуйста, заполните все поля';
      });
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() {
        _error = 'Пароли не совпадают';
      });
      return;
    }

    if (_passwordController.text.length < 6) {
      setState(() {
        _error = 'Пароль должен быть не менее 6 символов';
      });
      return;
    }

    try {
      final authNotifier = ref.read(authProvider.notifier);
      await authNotifier.register(
        _emailController.text,
        _passwordController.text,
      );
      // Navigation handled by root widget based on auth state
    } catch (e) {
      String message = e.toString();
      if (message.startsWith('Exception: ')) {
        message = message.substring(11);
      }
      setState(() {
        _error = message;
      });
    }
  }

  void _handleBack() {
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authLoadingProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.backgroundPrimary,
      appBar: AppBar(
        title: Text(
          'Регистрация',
          style: TextStyle(
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        backgroundColor: isDark ? AppColors.darkSurface : AppColors.primaryRed,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: isDark ? AppColors.darkTextPrimary : Colors.white,
          ),
          onPressed: _handleBack,
        ),
        iconTheme: IconThemeData(
          color: isDark ? AppColors.darkTextPrimary : Colors.white,
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
            child: Column(
              children: [
                // Subtitle
                Text(
                  'Создайте аккаунт',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 32),
                // Email field
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: isDark ? [] : const [
                      BoxShadow(
                        color: Color(0x08000000),
                        blurRadius: 10,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _emailController,
                    enabled: !isLoading,
                    keyboardType: TextInputType.emailAddress,
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      labelText: 'Email',
                      labelStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                      hintStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : const Color(0xFF999999),
                      ),
                      prefixIcon: Icon(
                        Icons.email_outlined,
                        color: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: isDark ? AppColors.darkSurfaceContainer : Colors.white,
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Password field
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: isDark ? [] : const [
                      BoxShadow(
                        color: Color(0x08000000),
                        blurRadius: 10,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _passwordController,
                    enabled: !isLoading,
                    obscureText: true,
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      labelText: 'Пароль',
                      labelStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                      hintStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : const Color(0xFF999999),
                      ),
                      prefixIcon: Icon(
                        Icons.lock_outlined,
                        color: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: isDark ? AppColors.darkSurfaceContainer : Colors.white,
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Confirm Password field
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: isDark ? [] : const [
                      BoxShadow(
                        color: Color(0x08000000),
                        blurRadius: 10,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _confirmPasswordController,
                    enabled: !isLoading,
                    obscureText: true,
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      labelText: 'Подтвердите пароль',
                      labelStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                      hintStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : const Color(0xFF999999),
                      ),
                      prefixIcon: Icon(
                        Icons.lock_outlined,
                        color: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: isDark ? AppColors.darkSurfaceContainer : Colors.white,
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Error message
                if (_error != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkErrorContainer : const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isDark ? AppColors.darkError : const Color(0xFFD32F2F),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.error_outline,
                          color: isDark ? AppColors.darkError : const Color(0xFFD32F2F),
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _error!,
                            style: TextStyle(
                              color: isDark ? AppColors.darkOnErrorContainer : const Color(0xFFD32F2F),
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                // Register button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _handleRegister,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                      disabledBackgroundColor: isDark ? AppColors.darkSurfaceContainerHigh : const Color(0xFFCCCCCC),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text(
                            'Зарегистрироваться',
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
        ),
      ),
    );
  }
}

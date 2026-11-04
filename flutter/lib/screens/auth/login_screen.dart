import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../config/app_colors.dart';
import '../../config/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/locale_provider.dart';
import 'register_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController(
    text: 'ivan.petrov@primakov.school',
  );
  final _passwordController = TextEditingController(
    text: 'password123',
  );
  bool _obscurePassword = true;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin(AppLocalizations loc) async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() {
        _error = loc.translate('fillAllFields');
      });
      return;
    }

    try {
      final authNotifier = ref.read(authProvider.notifier);
      await authNotifier.login(
        _emailController.text,
        _passwordController.text,
      );
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

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final currentLocale = ref.watch(localeProvider);
    final isLoading = ref.watch(authLoadingProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.backgroundPrimary,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Language Switcher Chip at top
                Align(
                  alignment: Alignment.topRight,
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      ref.read(localeProvider.notifier).toggleLocale();
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            LucideIcons.globe,
                            size: 14,
                            color: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            currentLocale.languageCode == 'en' ? 'EN' : 'RU',
                            style: TextStyle(
                              fontFamily: 'Manrope',
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Logo/Icon
                Container(
                  width: 100,
                  height: 100,
                  child: Center(
                    child: Opacity(
                      opacity: 0.8,
                      child: Image.asset(
                        'assets/images/primakov_logo.png',
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Title
                Text(
                  'PrimakovApp',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),

                // Subtitle
                Text(
                  loc.welcome,
                  style: TextStyle(
                    fontSize: 16,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 48),

                // Email Field
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
                      hintText: loc.email,
                      hintStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : const Color(0xFF999999),
                      ),
                      prefixIcon: Icon(
                        LucideIcons.mail,
                        size: 20,
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

                // Password Field
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
                    obscureText: _obscurePassword,
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: loc.password,
                      hintStyle: TextStyle(
                        color: isDark ? AppColors.darkTextSecondary : const Color(0xFF999999),
                      ),
                      prefixIcon: Icon(
                        LucideIcons.lock,
                        size: 20,
                        color: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? LucideIcons.eye
                              : LucideIcons.eyeOff,
                          size: 20,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
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

                // Forgot Password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(loc.translate('passwordRecoverySoon')),
                        ),
                      );
                    },
                    child: Text(
                      loc.forgotPassword,
                      style: TextStyle(
                        color: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),

                // Error Message
                if (_error != null) ...[
                  Container(
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
                          LucideIcons.alertCircle,
                          color: isDark ? AppColors.darkError : const Color(0xFFD32F2F),
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _error!,
                            style: TextStyle(
                              color: isDark ? AppColors.darkOnErrorContainer : const Color(0xFFD32F2F),
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Login Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : () => _handleLogin(loc),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
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
                        : Text(
                            loc.loginButton,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),

                const SizedBox(height: 24),

                // Register Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${loc.dontHaveAccount} ',
                      style: TextStyle(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => const RegisterScreen(),
                          ),
                        );
                      },
                      child: Text(
                        loc.registerButton,
                        style: TextStyle(
                          color: isDark ? AppColors.darkPrimary : AppColors.primaryRed,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Footer
                Text(
                  'ACADEMIC CURATOR SYSTEM V2.4',
                  style: TextStyle(
                    fontSize: 11,
                    color: (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary).withOpacity(0.6),
                    letterSpacing: 1.2,
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


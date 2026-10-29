/// Unified Profile Screen - Combines profile info, academic metrics, and security settings
/// Material Design 3 aesthetic with iOS-style grouped lists and Primakov Gymnasium branding

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/app_colors.dart';
import '../../models/api_models.dart';
import '../../providers/auth_provider.dart';
import '../../providers/ui_provider.dart';
import '../../providers/user_provider.dart';
import 'change_password_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const _ProfileScreenContent();
  }
}

class _ProfileScreenContent extends ConsumerStatefulWidget {
  const _ProfileScreenContent({Key? key}) : super(key: key);

  @override
  ConsumerState<_ProfileScreenContent> createState() => _ProfileScreenContentState();
}

class _ProfileScreenContentState extends ConsumerState<_ProfileScreenContent> {
  String _appVersion = '2.4.0';

  @override
  void initState() {
    super.initState();
    _loadAppVersion();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(authProvider.notifier).fetchCurrentUser();
      ref.read(profileProvider.notifier).loadProfile();
    });
  }

  Future<void> _loadAppVersion() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      if (mounted) {
        setState(() {
          _appVersion = packageInfo.version;
        });
      }
    } catch (_) {
      // Keep default version fallback
    }
  }

  void _showFloatingSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: isError
            ? const Color(0xFFBA1A1A)
            : (isDark ? const Color(0xFF2E7D32) : const Color(0xFF1E2124)),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }

  Widget _buildNotificationButton(BuildContext context, WidgetRef ref) {
    final notificationSettings = ref.watch(notificationSettingsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return IconButton(
      tooltip: 'Настройки уведомлений',
      icon: Icon(
        notificationSettings.pushEnabled
            ? Icons.notifications_active
            : Icons.notifications_outlined,
      ),
      color: notificationSettings.pushEnabled
          ? (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
          : (isDark ? AppColors.darkTextSecondary : const Color(0xFF64748B)),
      onPressed: () {
        _showNotificationQuickSettings(context, ref);
      },
    );
  }

  void _showNotificationQuickSettings(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => _NotificationSettingsContent(
          scrollController: scrollController,
          theme: theme,
        ),
      ),
    );
  }

  void _showAvatarSelectionSheet(User? user) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currentAvatar = user?.avatarUrl ?? '';
    final urlController = TextEditingController(text: currentAvatar);

    final presetAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) => StatefulBuilder(
        builder: (context, setModalState) {
          final selectedUrl = urlController.text.trim();

          return Container(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 16,
              bottom: MediaQuery.of(bottomSheetContext).viewInsets.bottom + 24,
            ),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withAlpha((0.2 * 255).round()),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Фото профиля',
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Выберите изображение из галереи гимназии или укажите прямую ссылку',
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Current / Preview Avatar
                  Center(
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isDark ? AppColors.darkSurfaceContainerHigh : const Color(0xFFF0F0F2),
                        border: Border.all(
                          color: theme.colorScheme.primary,
                          width: 3,
                        ),
                      ),
                      child: ClipOval(
                        child: selectedUrl.isNotEmpty
                            ? Image.network(
                                selectedUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Icon(
                                  Icons.broken_image,
                                  size: 40,
                                  color: theme.colorScheme.primary,
                                ),
                              )
                            : Icon(
                                Icons.person,
                                size: 48,
                                color: theme.colorScheme.primary,
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Коллекция аватаров Гимназии',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 64,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: presetAvatars.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (context, index) {
                        final preset = presetAvatars[index];
                        final isSelected = selectedUrl == preset;
                        return GestureDetector(
                          onTap: () {
                            setModalState(() {
                              urlController.text = preset;
                            });
                          },
                          child: Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected ? theme.colorScheme.primary : Colors.transparent,
                                width: 3,
                              ),
                            ),
                            child: ClipOval(
                              child: Image.network(
                                preset,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: urlController,
                    onChanged: (_) => setModalState(() {}),
                    decoration: InputDecoration(
                      labelText: 'URL изображения',
                      hintText: 'https://example.com/avatar.jpg',
                      prefixIcon: const Icon(Icons.link),
                      suffixIcon: urlController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                setModalState(() {
                                  urlController.clear();
                                });
                              },
                            )
                          : null,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      if (currentAvatar.isNotEmpty) ...[
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () async {
                              try {
                                await ref
                                    .read(profileProvider.notifier)
                                    .updateProfile(avatarUrl: '');
                                ref.read(authProvider.notifier).fetchCurrentUser();
                                if (bottomSheetContext.mounted) {
                                  Navigator.pop(bottomSheetContext);
                                }
                                _showFloatingSnackBar('Фото удалено');
                              } catch (e) {
                                _showFloatingSnackBar('Ошибка: $e', isError: true);
                              }
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFFBA1A1A),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('Удалить'),
                          ),
                        ),
                        const SizedBox(width: 12),
                      ],
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () async {
                            final targetUrl = urlController.text.trim();
                            try {
                              await ref
                                  .read(profileProvider.notifier)
                                  .updateProfile(avatarUrl: targetUrl);
                              ref.read(authProvider.notifier).fetchCurrentUser();
                              if (bottomSheetContext.mounted) {
                                Navigator.pop(bottomSheetContext);
                              }
                              _showFloatingSnackBar('Фото профиля успешно сохранено');
                            } catch (e) {
                              _showFloatingSnackBar('Ошибка сохранения фото: $e', isError: true);
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Сохранить'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showActiveSessionsSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ActiveSessionsModalContent(
        theme: Theme.of(context),
        onRevokeSuccess: (deviceName) {
          _showFloatingSnackBar('Сессия "$deviceName" успешно завершена');
        },
        onError: (err) {
          _showFloatingSnackBar('Ошибка управления сессиями: $err', isError: true);
        },
      ),
    );
  }

  void _showHelpAndSupportModal() {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.onSurface.withAlpha((0.2 * 255).round()),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withAlpha((0.1 * 255).round()),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.support_agent, color: theme.colorScheme.primary, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Помощь и поддержка',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        'Кураторская и техническая служба',
                        style: TextStyle(
                          fontSize: 13,
                          color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Academic Curator card
              _HelpContactCard(
                title: 'Академический куратор',
                subtitle: 'Смирнова Елена Николаевна',
                details: 'Пн–Пт: 08:30–17:00 • Корпус А, кабинет 204',
                icon: Icons.person_pin,
                actionLabel: 'curator@primakov.school',
                onAction: () async {
                  await Clipboard.setData(const ClipboardData(text: 'curator@primakov.school'));
                  _showFloatingSnackBar('Email куратора скопирован в буфер');
                },
                secondaryActionLabel: '+7 (495) 987-65-43',
                onSecondaryAction: () async {
                  final uri = Uri.parse('tel:+74959876543');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                  } else {
                    await Clipboard.setData(const ClipboardData(text: '+74959876543'));
                    _showFloatingSnackBar('Телефон куратора скопирован');
                  }
                },
              ),

              const SizedBox(height: 16),

              // Technical Support card
              _HelpContactCard(
                title: 'Служба технической поддержки',
                subtitle: 'Вопросы по работе PrimakovApp',
                details: 'Круглосуточный прием обращений',
                icon: Icons.headset_mic,
                actionLabel: 'support@primakov.school',
                onAction: () async {
                  await Clipboard.setData(const ClipboardData(text: 'support@primakov.school'));
                  _showFloatingSnackBar('Email техподдержки скопирован');
                },
                secondaryActionLabel: 'Открыть Telegram-бот',
                onSecondaryAction: () async {
                  final uri = Uri.parse('https://t.me/primakov_help_bot');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  } else {
                    _showFloatingSnackBar('Телеграм-бот: @primakov_help_bot');
                  }
                },
              ),

              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Понятно'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDocumentsModal() {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final docs = [
      {
        'title': 'Устав АНОО «Гимназия им. Е.М. Примакова»',
        'subtitle': 'Основной учредительный регламент • PDF 2.4 МБ',
        'icon': Icons.account_balance,
      },
      {
        'title': 'Правила внутреннего распорядка',
        'subtitle': 'Регламент поведения и академический этикет • PDF 1.1 МБ',
        'icon': Icons.rule,
      },
      {
        'title': 'Положение об академической честности',
        'subtitle': 'Критерии оценивания и политика дедлайнов • PDF 850 КБ',
        'icon': Icons.menu_book,
      },
      {
        'title': 'Положение о школьной форме',
        'subtitle': 'Стандарты делового стиля гимназистов • PDF 620 КБ',
        'icon': Icons.checkroom,
      },
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.onSurface.withAlpha((0.2 * 255).round()),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withAlpha((0.1 * 255).round()),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.description, color: theme.colorScheme.primary, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Нормативные документы',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        'Официальные положения Гимназии',
                        style: TextStyle(
                          fontSize: 13,
                          color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              ...docs.map((doc) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceContainerHigh : const Color(0xFFF7F7F9),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: theme.colorScheme.onSurface.withAlpha((0.08 * 255).round()),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withAlpha((0.1 * 255).round()),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(doc['icon'] as IconData, color: theme.colorScheme.primary, size: 20),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                doc['title'] as String,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: theme.colorScheme.onSurface,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                doc['subtitle'] as String,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.download_outlined),
                          tooltip: 'Скачать документ',
                          onPressed: () {
                            _showFloatingSnackBar('Загрузка документа «${doc['title']}» начата');
                          },
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 12),
              // Request Official Certificate Button
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withAlpha((0.08 * 255).round()),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.colorScheme.primary.withAlpha((0.2 * 255).round()),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.assignment_turned_in, color: theme.colorScheme.primary, size: 22),
                        const SizedBox(width: 10),
                        Text(
                          'Заказ справки об обучении',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Справка с гербовой печатью гимназии для военкомата, налоговой или визовых центров.',
                      style: TextStyle(
                        fontSize: 12,
                        color: theme.colorScheme.onSurface.withAlpha((0.7 * 255).round()),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.send, size: 16),
                        label: const Text('Заказать справку'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          Navigator.pop(context);
                          _showCertificateOrderDialog();
                        },
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  void _showCertificateOrderDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Заказ справки об обучении'),
        content: const Text(
          'Заявка на изготовление справки с гербовой печатью отправлена в секретариат гимназии. '
          'Готовая справка будет доступна в канцелярии (Корпус А, каб. 101) в течение 2 рабочих дней.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _showFloatingSnackBar('Заявка на справку зарегистрирована');
            },
            child: const Text('Понятно'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('О приложении'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('PrimakovApp v$_appVersion'),
            const SizedBox(height: 8),
            const Text('Academic Curator System'),
            const SizedBox(height: 16),
            const Text(
              'Информационная система управления учебным процессом АНОО «Гимназия им. Е.М. Примакова».',
              style: TextStyle(fontSize: 13, color: Color(0xFF5F5E5E)),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              showLicensePage(
                context: context,
                applicationName: 'PrimakovApp',
                applicationVersion: _appVersion,
              );
            },
            child: const Text('Лицензии'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Закрыть'),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Выход из аккаунта'),
        content: const Text('Вы уверены, что хотите выйти из профиля на этом устройстве?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Отмена',
              style: TextStyle(color: Color(0xFF5F5E5E)),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
            },
            child: const Text(
              'Выйти',
              style: TextStyle(color: Color(0xFFBA1A1A)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final currentUser = ref.watch(currentUserProvider) ?? authState.currentUser;
    final isDarkMode = ref.watch(isDarkModeProvider);
    final userRole = authState.userRole ?? UserRole.STUDENT;

    String userName = 'Студент';
    if (currentUser != null && currentUser.fullName.trim().isNotEmpty) {
      userName = currentUser.fullName.trim();
    } else if (currentUser != null && currentUser.email.isNotEmpty) {
      final prefix = currentUser.email.split('@').first;
      final parts = prefix.split('.');
      if (parts.length >= 2) {
        final f = parts[0][0].toUpperCase() + parts[0].substring(1);
        final l = parts[1][0].toUpperCase() + parts[1].substring(1);
        userName = '$f $l';
      } else {
        userName = prefix;
      }
    } else if (authState.isAuthenticated) {
      userName = userRole == UserRole.STUDENT ? 'Иван Петров' : 'Преподаватель';
    }
    final userClass = userRole == UserRole.STUDENT ? '11 «А» класс' : 'Преподаватель';

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary;
    final appBarBg = isDark
        ? AppColors.darkBackgroundPrimary.withAlpha((0.8 * 255).round())
        : AppColors.backgroundPrimary.withAlpha((0.8 * 255).round());

    final statsAsync = ref.watch(userStatsProvider);
    final sessionsAsync = ref.watch(sessionsProvider);

    final sessionsSubtitle = sessionsAsync.when(
      data: (sessions) => '${sessions.length} устройства в сети',
      loading: () => 'Загрузка...',
      error: (_, __) => 'Просмотр сессий',
    );

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: appBarBg,
        elevation: 0,
        flexibleSpace: Container(
          decoration: BoxDecoration(color: appBarBg),
        ),
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark ? AppColors.darkSurfaceContainerHigh : const Color(0xFFE8E8EA),
                border: Border.all(
                  color: AppColors.borderPrimary.withAlpha((0.2 * 255).round()),
                  width: 1,
                ),
              ),
              child: Icon(
                Icons.person,
                size: 18,
                color: isDark ? AppColors.darkPrimary : const Color(0xFF8C251C),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'PrimakovApp',
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkPrimary : const Color(0xFF8C251C),
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          _buildNotificationButton(context, ref),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(authProvider.notifier).fetchCurrentUser();
          await ref.read(profileProvider.notifier).loadProfile();
          ref.invalidate(userStatsProvider);
          await ref.read(sessionsProvider.notifier).loadSessions();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Column(
            children: [
              // Hero Profile Section with Editable Avatar
              const SizedBox(height: 24),
              _ProfileHeader(
                userName: userName,
                userRole: userRole,
                userClass: userClass,
                avatarUrl: currentUser?.avatarUrl,
                onEditAvatar: () => _showAvatarSelectionSheet(currentUser),
              ),

              // Academic Stats Grid (only for students)
              if (userRole == UserRole.STUDENT) ...[
                const SizedBox(height: 36),
                Row(
                  children: [
                    Expanded(
                      child: _StatsCard(
                        label: 'Средний балл',
                        value: statsAsync.when(
                          data: (s) => s.gpa.toStringAsFixed(2),
                          loading: () => '...',
                          error: (_, __) => '4.85',
                        ),
                        isPrimary: true,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _StatsCard(
                        label: 'Посещаемость',
                        value: statsAsync.when(
                          data: (s) => '${s.attendanceRate.round()}%',
                          loading: () => '...',
                          error: (_, __) => '98%',
                        ),
                        isPrimary: false,
                      ),
                    ),
                  ],
                ),
                if (statsAsync.valueOrNull != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _MiniStatChip(
                          icon: Icons.check_circle_outline,
                          label: 'Сдано дедлайнов: ${statsAsync.value!.completedDeadlines}',
                          color: const Color(0xFF2E7D32),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MiniStatChip(
                          icon: Icons.pending_actions,
                          label: 'В процессе: ${statsAsync.value!.pendingDeadlines}',
                          color: const Color(0xFFE65100),
                        ),
                      ),
                    ],
                  ),
                ],
              ],

              const SizedBox(height: 36),

              // Security & Authentication Group
              _SettingsGroup(
                children: [
                  _SettingToggleRow(
                    icon: Icons.verified_user,
                    title: 'Двухфакторная аутентификация',
                    subtitle: 'Дополнительная защита аккаунта',
                    value: currentUser?.twoFactorEnabled ?? false,
                    onChanged: (value) async {
                      try {
                        await ref
                            .read(profileProvider.notifier)
                            .updateProfile(twoFactorEnabled: value);
                        ref.read(authProvider.notifier).fetchCurrentUser();
                        _showFloatingSnackBar(
                          value ? '2FA успешно включена' : '2FA выключена',
                        );
                      } catch (e) {
                        _showFloatingSnackBar('Ошибка переключения 2FA: $e', isError: true);
                      }
                    },
                  ),
                  Divider(
                    height: 1,
                    indent: 66,
                    color: isDark ? AppColors.darkBorderSecondary : const Color(0xFFEEEEF0),
                  ),
                  _SettingsRow(
                    icon: Icons.devices,
                    title: 'Активные сессии',
                    subtitle: sessionsSubtitle,
                    onTap: _showActiveSessionsSheet,
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Profile Management Group
              _SettingsGroup(
                children: [
                  _SettingNavigationRow(
                    icon: Icons.edit,
                    title: 'Редактировать профиль',
                    subtitle: 'Изменить имя и фамилию',
                    onTap: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => const EditProfileScreen(),
                        ),
                      );
                      ref.read(authProvider.notifier).fetchCurrentUser();
                    },
                  ),
                  Divider(
                    height: 1,
                    indent: 66,
                    color: isDark ? AppColors.darkBorderSecondary : const Color(0xFFEEEEF0),
                  ),
                  _SettingNavigationRow(
                    icon: Icons.lock_outline,
                    title: 'Сменить пароль',
                    subtitle: 'Обновить пароль доступа',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => const ChangePasswordScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Appearance Group
              _SettingsGroup(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withAlpha((0.08 * 255).round()),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                Icons.palette,
                                color: theme.colorScheme.primary,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Text(
                              'Оформление',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: _ThemeCard(
                                icon: Icons.light_mode,
                                label: 'Светлая',
                                isSelected: !isDarkMode,
                                onTap: () {
                                  ref.read(uiProvider.notifier).setDarkMode(false);
                                },
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: _ThemeCard(
                                icon: Icons.dark_mode,
                                label: 'Темная',
                                isSelected: isDarkMode,
                                onTap: () {
                                  ref.read(uiProvider.notifier).setDarkMode(true);
                                },
                                isDark: true,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Support & Official Documents Group
              _SettingsGroup(
                children: [
                  _SettingsRow(
                    icon: Icons.help_outline,
                    title: 'Помощь и поддержка',
                    subtitle: 'Куратор, техническая поддержка, контакты',
                    onTap: _showHelpAndSupportModal,
                  ),
                  Divider(
                    height: 1,
                    indent: 66,
                    color: isDark ? AppColors.darkBorderSecondary : const Color(0xFFEEEEF0),
                  ),
                  _SettingsRow(
                    icon: Icons.description,
                    title: 'Документы и регламенты',
                    subtitle: 'Устав, правила, заказ справок',
                    onTap: _showDocumentsModal,
                  ),
                  Divider(
                    height: 1,
                    indent: 66,
                    color: isDark ? AppColors.darkBorderSecondary : const Color(0xFFEEEEF0),
                  ),
                  _SettingsRow(
                    icon: Icons.info_outline,
                    title: 'О приложении',
                    subtitle: 'Версия $_appVersion • Лицензии',
                    onTap: () => _showAboutDialog(context),
                  ),
                ],
              ),

              const SizedBox(height: 48),

              // Logout Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _showLogoutDialog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFBA1A1A),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.logout, size: 20),
                      SizedBox(width: 12),
                      Text(
                        'Выйти из профиля',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 36),

              // Footer
              Text(
                'ВЕРСИЯ $_appVersion\nhttps://primakov.school/',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface.withAlpha((0.4 * 255).round()),
                  letterSpacing: 1.5,
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

// Profile Header Widget with Avatar click support
class _ProfileHeader extends StatelessWidget {
  final String userName;
  final UserRole userRole;
  final String userClass;
  final String? avatarUrl;
  final VoidCallback onEditAvatar;

  const _ProfileHeader({
    required this.userName,
    required this.userRole,
    required this.userClass,
    this.avatarUrl,
    required this.onEditAvatar,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final surfaceColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final primaryColor = theme.colorScheme.primary;

    return Column(
      children: [
        GestureDetector(
          onTap: onEditAvatar,
          child: Stack(
            children: [
              Container(
                width: 128,
                height: 128,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: surfaceColor,
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withAlpha((0.15 * 255).round()),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                  border: Border.all(
                    color: surfaceColor,
                    width: 4,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: avatarUrl != null && avatarUrl!.trim().isNotEmpty
                      ? Image.network(
                          avatarUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Icon(
                            Icons.person,
                            size: 64,
                            color: primaryColor,
                          ),
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Center(
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                value: loadingProgress.expectedTotalBytes != null
                                    ? loadingProgress.cumulativeBytesLoaded /
                                        loadingProgress.expectedTotalBytes!
                                    : null,
                              ),
                            );
                          },
                        )
                      : Icon(
                          Icons.person,
                          size: 64,
                          color: primaryColor,
                        ),
                ),
              ),
              Positioned(
                bottom: -2,
                right: -2,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: primaryColor,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha((0.2 * 255).round()),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.camera_alt,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Text(
          userName,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: theme.colorScheme.onSurface,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          _getRoleBadge(userRole, userClass),
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
            letterSpacing: 1.5,
          ),
        ),
      ],
    );
  }

  String _getRoleBadge(UserRole role, String className) {
    switch (role) {
      case UserRole.STUDENT:
        return 'СТУДЕНТ • $className';
      case UserRole.TEACHER:
        return 'УЧИТЕЛЬ';
      case UserRole.ADMIN:
        return 'АДМИНИСТРАТОР';
    }
  }
}

// Stats Card Widget
class _StatsCard extends StatelessWidget {
  final String label;
  final String value;
  final bool isPrimary;

  const _StatsCard({
    required this.label,
    required this.value,
    required this.isPrimary,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final surfaceColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.borderPrimary.withAlpha((0.1 * 255).round()),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha((0.02 * 255).round()),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: isPrimary ? theme.colorScheme.primary : theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniStatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _MiniStatChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withAlpha((0.1 * 255).round()),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withAlpha((0.2 * 255).round())),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? theme.colorScheme.onSurface : color,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

// Settings Group Widget
class _SettingsGroup extends StatelessWidget {
  final List<Widget> children;

  const _SettingsGroup({Key? key, required this.children}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark
        ? AppColors.darkBackgroundSecondary
        : AppColors.backgroundSecondary;

    return Material(
      color: surfaceColor,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: Column(children: children),
    );
  }
}

// Settings Row Widget
class _SettingsRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;

  const _SettingsRow({
    Key? key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final effectiveIconColor = theme.colorScheme.primary;

    return InkWell(
      onTap: onTap,
      splashColor: isDark
          ? AppColors.darkPrimaryRed.withAlpha((0.12 * 255).round())
          : AppColors.primaryRed.withAlpha((0.08 * 255).round()),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: effectiveIconColor.withAlpha((0.08 * 255).round()),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: effectiveIconColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 13,
                        color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: isDark ? AppColors.darkOutline : AppColors.borderPrimary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}

// Setting Toggle Row Widget
class _SettingToggleRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SettingToggleRow({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveIconColor = theme.colorScheme.primary;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: effectiveIconColor.withAlpha((0.08 * 255).round()),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: effectiveIconColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle!,
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class _SettingNavigationRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _SettingNavigationRow({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final effectiveIconColor = theme.colorScheme.primary;

    return InkWell(
      onTap: onTap,
      splashColor: isDark
          ? AppColors.darkPrimaryRed.withAlpha((0.12 * 255).round())
          : AppColors.primaryRed.withAlpha((0.08 * 255).round()),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: effectiveIconColor.withAlpha((0.08 * 255).round()),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: effectiveIconColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 13,
                        color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: theme.colorScheme.onSurface.withAlpha((0.4 * 255).round()),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}

// Theme Card Widget
class _ThemeCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isDark;

  const _ThemeCard({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.isDark = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentDark = theme.brightness == Brightness.dark;
    final cardBg = isDark
        ? (currentDark ? AppColors.darkSurfaceContainerHigh : const Color(0xFFF3F3F5))
        : (currentDark ? AppColors.darkSurfaceContainer : Colors.white);
    final iconBg = isDark
        ? (currentDark ? AppColors.darkSurfaceContainerLowest : const Color(0xFF1A1C1D))
        : (currentDark ? AppColors.darkSurfaceContainerLow : const Color(0xFFF9F9FB));
    final iconColor = isDark
        ? (currentDark ? AppColors.darkOnSurface : const Color(0xFFF3F3F5))
        : (currentDark ? AppColors.darkOnSurface : const Color(0xFF1A1C1D));

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? theme.colorScheme.primary.withAlpha((0.5 * 255).round())
                : AppColors.borderPrimary.withAlpha((0.15 * 255).round()),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: iconBg,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha((0.05 * 255).round()),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                icon,
                color: iconColor,
                size: 24,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Active Sessions Modal Sheet Content
class _ActiveSessionsModalContent extends ConsumerWidget {
  final ThemeData theme;
  final ValueChanged<String> onRevokeSuccess;
  final ValueChanged<String> onError;

  const _ActiveSessionsModalContent({
    required this.theme,
    required this.onRevokeSuccess,
    required this.onError,
  });

  IconData _getPlatformIcon(String platform) {
    final p = platform.toLowerCase();
    if (p.contains('ios') || p.contains('iphone') || p.contains('ipad')) {
      return Icons.phone_iphone;
    } else if (p.contains('android')) {
      return Icons.phone_android;
    } else if (p.contains('mac') || p.contains('darwin')) {
      return Icons.laptop_mac;
    } else if (p.contains('win')) {
      return Icons.laptop_windows;
    } else {
      return Icons.devices;
    }
  }

  String _formatSessionDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 2) return 'Только что';
    if (diff.inHours < 1) return '${diff.inMinutes} мин назад';
    if (diff.inDays < 1) return '${diff.inHours} ч назад';
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = theme.brightness == Brightness.dark;
    final sessionsState = ref.watch(sessionsProvider);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceContainer : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withAlpha((0.2 * 255).round()),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Активные сессии',
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Устройства с доступом к вашему профилю',
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                tooltip: 'Обновить сессии',
                onPressed: () {
                  ref.read(sessionsProvider.notifier).loadSessions();
                },
              ),
            ],
          ),
          const SizedBox(height: 20),
          sessionsState.when(
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(),
              ),
            ),
            error: (err, _) => Center(
              child: Column(
                children: [
                  const Icon(Icons.error_outline, color: Color(0xFFBA1A1A), size: 36),
                  const SizedBox(height: 8),
                  Text('Ошибка загрузки сессий: $err'),
                  TextButton(
                    onPressed: () {
                      ref.read(sessionsProvider.notifier).loadSessions();
                    },
                    child: const Text('Повторить'),
                  ),
                ],
              ),
            ),
            data: (sessions) {
              if (sessions.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(child: Text('Нет активных сессий')),
                );
              }

              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: sessions.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final session = sessions[index];
                  final isCurrent = session.isCurrent;

                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceContainerHigh : const Color(0xFFF7F7F9),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isCurrent
                            ? const Color(0xFF2E7D32).withAlpha((0.4 * 255).round())
                            : theme.colorScheme.onSurface.withAlpha((0.08 * 255).round()),
                        width: isCurrent ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isCurrent
                                ? const Color(0xFF2E7D32).withAlpha((0.15 * 255).round())
                                : theme.colorScheme.primary.withAlpha((0.1 * 255).round()),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            _getPlatformIcon(session.platform),
                            color: isCurrent ? const Color(0xFF2E7D32) : theme.colorScheme.primary,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      session.device,
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                        color: theme.colorScheme.onSurface,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (isCurrent) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2E7D32),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        'Текущее',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${session.location} • ${session.ipAddress}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
                                ),
                              ),
                              Text(
                                'Активность: ${_formatSessionDate(session.lastActiveAt)}',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: theme.colorScheme.onSurface.withAlpha((0.45 * 255).round()),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (!isCurrent)
                          IconButton(
                            icon: const Icon(Icons.logout, color: Color(0xFFBA1A1A), size: 20),
                            tooltip: 'Завершить сессию',
                            onPressed: () async {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Завершить сессию?'),
                                  content: Text('Вы действительно хотите завершить сессию на "${session.device}"?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx, false),
                                      child: const Text('Отмена'),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx, true),
                                      child: const Text(
                                        'Завершить',
                                        style: TextStyle(color: Color(0xFFBA1A1A)),
                                      ),
                                    ),
                                  ],
                                ),
                              );

                              if (confirm == true) {
                                try {
                                  await ref.read(sessionsProvider.notifier).revokeSession(session.id);
                                  onRevokeSuccess(session.device);
                                } catch (e) {
                                  onError(e.toString());
                                }
                              }
                            },
                          ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

// Help Contact Card
class _HelpContactCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String details;
  final IconData icon;
  final String actionLabel;
  final VoidCallback onAction;
  final String secondaryActionLabel;
  final VoidCallback onSecondaryAction;

  const _HelpContactCard({
    required this.title,
    required this.subtitle,
    required this.details,
    required this.icon,
    required this.actionLabel,
    required this.onAction,
    required this.secondaryActionLabel,
    required this.onSecondaryAction,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceContainerHigh : const Color(0xFFF7F7F9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.onSurface.withAlpha((0.08 * 255).round()),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withAlpha((0.1 * 255).round()),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: theme.colorScheme.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            details,
            style: TextStyle(
              fontSize: 12,
              color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onAction,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    actionLabel,
                    style: const TextStyle(fontSize: 11),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: onSecondaryAction,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    secondaryActionLabel,
                    style: const TextStyle(fontSize: 11),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Notification Settings Modal Content
class _NotificationSettingsContent extends ConsumerWidget {
  final ScrollController scrollController;
  final ThemeData theme;

  const _NotificationSettingsContent({
    required this.scrollController,
    required this.theme,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationSettings = ref.watch(notificationSettingsProvider);

    return Container(
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurface.withAlpha((0.3 * 255).round()),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              controller: scrollController,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Row(
                      children: [
                        Icon(
                          Icons.notifications,
                          color: theme.colorScheme.primary,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Быстрые настройки уведомлений',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: SwitchListTile(
                      value: notificationSettings.pushEnabled,
                      onChanged: (value) async {
                        await ref.read(uiProvider.notifier).togglePushNotifications();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                value ? 'Уведомления включены' : 'Уведомления выключены',
                              ),
                            ),
                          );
                        }
                      },
                      title: Text(
                        'Push-уведомления',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      subtitle: Text(
                        'Получать важные уведомления гимназии',
                        style: TextStyle(
                          color: theme.colorScheme.onSurface.withAlpha((0.7 * 255).round()),
                        ),
                      ),
                    ),
                  ),
                  if (notificationSettings.pushEnabled) ...[
                    const Divider(),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: SwitchListTile(
                        value: notificationSettings.deadlineNotifications,
                        onChanged: (value) async {
                          await ref.read(uiProvider.notifier).toggleDeadlineNotifications();
                        },
                        title: const Text('Дедлайны'),
                        subtitle: const Text('Напоминания о приближающихся дедлайнах'),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: SwitchListTile(
                        value: notificationSettings.scheduleNotifications,
                        onChanged: (value) async {
                          await ref.read(uiProvider.notifier).toggleScheduleNotifications();
                        },
                        title: const Text('Расписание'),
                        subtitle: const Text('Изменения в расписании занятий'),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: SwitchListTile(
                        value: notificationSettings.announcementNotifications,
                        onChanged: (value) async {
                          await ref.read(uiProvider.notifier).toggleAnnouncementNotifications();
                        },
                        title: const Text('Объявления'),
                        subtitle: const Text('Важные объявления и новости гимназии'),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

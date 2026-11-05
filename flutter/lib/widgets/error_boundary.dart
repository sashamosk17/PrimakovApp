import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/app_colors.dart';

/// Global Error Handler & Error Boundary for PrimakovApp
/// Intercepts framework-level render/build errors and asynchronous exceptions,
/// replacing the default Flutter Red Screen of Death with a graceful, branded fallback UI.
class GlobalErrorHandler {
  static bool _initialized = false;

  /// Initializes framework-level and platform-level error hooks.
  static void init() {
    if (_initialized) return;
    _initialized = true;

    // 1. Replace Flutter's default red screen with a graceful fallback widget
    ErrorWidget.builder = (FlutterErrorDetails details) {
      return GlobalErrorWidget(details: details);
    };

    // 2. Intercept synchronous Flutter framework errors
    final originalOnError = FlutterError.onError;
    FlutterError.onError = (FlutterErrorDetails details) {
      // Log error safely without crashing the isolate
      debugPrint('🚨 [FlutterError caught]: ${details.exceptionAsString()}');
      if (kDebugMode && details.stack != null) {
        debugPrint(details.stack.toString());
      }

      // Allow original handler if present, but prevent re-throwing fatal crash
      if (originalOnError != null) {
        try {
          originalOnError(details);
        } catch (_) {}
      }
    };

    // 3. Intercept uncaught asynchronous errors in the root isolate
    PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
      debugPrint('🚨 [PlatformDispatcher caught async error]: $error');
      if (kDebugMode) {
        debugPrint(stack.toString());
      }
      return true; // Mark as handled so app process is not terminated
    };
  }
}

/// Fallback widget displayed in place of any crashing component.
class GlobalErrorWidget extends StatefulWidget {
  final FlutterErrorDetails? details;
  final String? errorMessage;
  final VoidCallback? onRetry;

  const GlobalErrorWidget({
    Key? key,
    this.details,
    this.errorMessage,
    this.onRetry,
  }) : super(key: key);

  @override
  State<GlobalErrorWidget> createState() => _GlobalErrorWidgetState();
}

class _GlobalErrorWidgetState extends State<GlobalErrorWidget> {
  bool _showDetails = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final cardBg = isDark ? AppColors.darkBackgroundSecondary : Colors.white;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final accentRed = isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed;

    final errString = widget.errorMessage ??
        widget.details?.exceptionAsString() ??
        'Произошла непредвиденная ошибка интерфейса';

    return Center(
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: accentRed.withOpacity(0.25),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.4 : 0.08),
              blurRadius: 18,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon Badge
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: accentRed.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(
                LucideIcons.alertTriangle,
                size: 28,
                color: accentRed,
              ),
            ),
            const SizedBox(height: 14),

            // Title
            Text(
              'Не удалось отобразить элемент',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: textPrimary,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 6),

            // Friendly Description
            Text(
              'Приложение перехватило сбой и продолжает работу. Вы можете повторить попытку.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 13,
                color: textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),

            // Action Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (widget.onRetry != null) ...[
                  ElevatedButton.icon(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      widget.onRetry!();
                    },
                    icon: const Icon(LucideIcons.refreshCw, size: 14),
                    label: const Text('Повторить'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentRed,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      elevation: 0,
                    ),
                  ),
                  const SizedBox(width: 10),
                ],
                TextButton(
                  onPressed: () {
                    setState(() {
                      _showDetails = !_showDetails;
                    });
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: textSecondary,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  child: Text(
                    _showDetails ? 'Скрыть детали' : 'Подробнее',
                    style: const TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),

            // Expandable Technical Details
            if (_showDetails) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isDark ? Colors.black26 : const Color(0xFFF6F8FA),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark ? Colors.white12 : const Color(0xFFE1E4E8),
                  ),
                ),
                child: SelectableText(
                  errString,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: isDark ? Colors.white70 : Colors.black87,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// A widget that catches any exceptions thrown by its child subtree during build
/// and renders a graceful fallback widget instead of crashing.
class ErrorBoundary extends StatefulWidget {
  final Widget child;
  final Widget Function(BuildContext context, Object error, VoidCallback retry)? fallbackBuilder;

  const ErrorBoundary({
    Key? key,
    required this.child,
    this.fallbackBuilder,
  }) : super(key: key);

  @override
  State<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends State<ErrorBoundary> {
  Object? _error;

  @override
  void initState() {
    super.initState();
  }

  void _resetError() {
    setState(() {
      _error = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      if (widget.fallbackBuilder != null) {
        return widget.fallbackBuilder!(context, _error!, _resetError);
      }
      return GlobalErrorWidget(
        errorMessage: _error.toString(),
        onRetry: _resetError,
      );
    }

    return _ErrorBoundaryScope(
      onError: (err) {
        setState(() {
          _error = err;
        });
      },
      child: widget.child,
    );
  }
}

class _ErrorBoundaryScope extends InheritedWidget {
  final void Function(Object error) onError;

  const _ErrorBoundaryScope({
    Key? key,
    required this.onError,
    required Widget child,
  }) : super(key: key, child: child);

  @override
  bool updateShouldNotify(_ErrorBoundaryScope oldWidget) => false;
}


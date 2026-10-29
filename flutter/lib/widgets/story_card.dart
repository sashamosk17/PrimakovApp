/// Story Card Widget - Исправленная версия без overflow
import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import '../models/api_models.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

class StoryCard extends StatelessWidget {
  final Story story;
  final VoidCallback? onTap;

  const StoryCard({
    Key? key,
    required this.story,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isViewed = story.viewedBy.isNotEmpty;
    final hasImage = story.imageUrl != null && story.imageUrl!.isNotEmpty;
    final hasVideo = story.videoUrl != null && story.videoUrl!.isNotEmpty;
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final displayType = hasImage ? 'image' : (hasVideo ? 'video' : 'text');

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 80,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Аватар/превью
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isViewed
                      ? (isDarkMode ? AppColors.darkStoryViewed : AppColors.storyViewed)
                      : (isDarkMode ? AppColors.darkPrimaryRed : AppColors.primaryRed),
                  width: 2,
                ),
                gradient: !hasImage && !hasVideo
                    ? AppColors.primaryGradient
                    : null,
              ),
              child: ClipOval(
                child: hasImage
                    ? _buildImage(story.imageUrl!, displayType, isDarkMode)
                    : _buildPlaceholder(displayType, isDarkMode),
              ),
            ),
            const SizedBox(height: 6),

            // Заголовок - ограничиваем 2 строками
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 32),
              child: Text(
                story.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: isViewed ? FontWeight.normal : FontWeight.w600,
                  color: isViewed
                      ? (AppColors.textTertiary)
                      : (AppColors.textPrimary),
                ),
              ),
            ),

            // Индикатор "Новое" - показываем только если не просмотрено
            if (!isViewed) ...[
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs, vertical: 1),
                decoration: BoxDecoration(
                  color: isDarkMode ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                  borderRadius: BorderRadius.circular(AppSpacing.sm),
                ),
                child: Text(
                  'NEW',
                  style: AppTypography.labelSmall.copyWith(
                    fontSize: 7,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildImage(String imageUrl, String displayType, bool isDarkMode) {
    if (imageUrl.startsWith('assets/')) {
      return Image.asset(
        imageUrl,
        fit: BoxFit.cover,
        width: 70,
        height: 70,
        errorBuilder: (context, error, stackTrace) {
          return _buildPlaceholder(displayType, isDarkMode);
        },
      );
    }
    return Image.network(
      imageUrl,
      fit: BoxFit.cover,
      width: 70,
      height: 70,
      errorBuilder: (context, error, stackTrace) {
        return _buildPlaceholder(displayType, isDarkMode);
      },
    );
  }

  Widget _buildPlaceholder(String type, bool isDarkMode) {
    return Container(
      width: 70,
      height: 70,
      color: isDarkMode ? AppColors.darkMediumGray : AppColors.mediumGray,
      child: Icon(
        type == 'video' ? Icons.videocam : Icons.newspaper,
        size: 28,
        color: isDarkMode ? AppColors.darkIconGray : AppColors.iconGray,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../../config/app_colors.dart';
import '../../config/app_spacing.dart';
import '../models/api_models.dart';
import '../providers/canteen_provider.dart';

class CanteenMenuScreen extends ConsumerStatefulWidget {
  const CanteenMenuScreen({super.key});

  @override
  ConsumerState<CanteenMenuScreen> createState() => _CanteenMenuScreenState();
}

class _CanteenMenuScreenState extends ConsumerState<CanteenMenuScreen> {
  // Контроллеры из пакета scrollable_positioned_list
  final ItemScrollController _itemScrollController = ItemScrollController();
  final ItemPositionsListener _itemPositionsListener = ItemPositionsListener.create();

  MealType _selectedMealType = MealType.LUNCH; // Начальное значение по умолчанию

  // Флаг, чтобы не переключать вкладку во время программной прокрутки
  bool _isScrollingProgrammatically = false;

  // Карта для хранения индексов начала каждой секции в общем списке
  Map<MealType, int> _sectionIndices = {};

  final List<MealType> _mealTypes = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK];
  final Map<MealType, String> _mealTypeLabels = {
    MealType.BREAKFAST: 'Завтрак',
    MealType.LUNCH: 'Обед',
    MealType.DINNER: 'Ужин',
    MealType.SNACK: 'Перекус',
  };
  final Map<MealType, IconData> _mealTypeIcons = {
    MealType.BREAKFAST: Icons.wb_sunny_outlined,
    MealType.LUNCH: Icons.restaurant,
    MealType.DINNER: Icons.nightlight_outlined,
    MealType.SNACK: Icons.coffee,
  };

  @override
  void initState() {
    super.initState();
    _itemPositionsListener.itemPositions.addListener(_onScroll);
    _initializeScreen();
  }

  void _initializeScreen() {
    _selectedMealType = _getInitialMealType();

    // Загружаем меню
    Future.microtask(() {
      if (mounted) {
        ref.read(canteenProvider.notifier).fetchTodayMenu();
      }
    }).then((_) {
      // После загрузки и отрисовки первого кадра, прокручиваем к нужной секции
      if (mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          // Убеждаемся, что контроллер готов, прежде чем скроллить
          if (mounted && _itemScrollController.isAttached) {
            _scrollToSection(_selectedMealType, isInitial: true);
          }
        });
      }
    });
  }

  MealType _getInitialMealType() {
    final hour = DateTime.now().hour;
    if (hour < 11) return MealType.BREAKFAST;
    if (hour < 16) return MealType.LUNCH;
    if (hour < 20) return MealType.DINNER;
    // Поздним вечером или если ничего не подошло, покажем обед
    return MealType.LUNCH;
  }

  @override
  void dispose() {
    _itemPositionsListener.itemPositions.removeListener(_onScroll);
    super.dispose();
  }

  // Слушатель прокрутки: определяет, какая секция сейчас наверху
  void _onScroll() {
    if (_isScrollingProgrammatically) return;

    // Получаем информацию о видимых элементах. Нас интересует самый верхний.
    final visibleIndexes = _itemPositionsListener.itemPositions.value
        .where((item) => item.itemLeadingEdge >= 0)
        .map((item) => item.index);

    if (visibleIndexes.isEmpty) return;

    final firstVisibleIndex = visibleIndexes.reduce((a, b) => a < b ? a : b);

    MealType? currentSection;
    // Находим, какой секции принадлежит этот индекс
    for (final mealType in _mealTypes.reversed) {
      final sectionIndex = _sectionIndices[mealType];
      if (sectionIndex != null && firstVisibleIndex >= sectionIndex) {
        currentSection = mealType;
        break;
      }
    }

    if (currentSection != null && _selectedMealType != currentSection) {
      setState(() {
        _selectedMealType = currentSection!;
      });
    }
  }

  // Прокрутка к секции по нажатию на таб
  void _scrollToSection(MealType mealType, {bool isInitial = false}) {
    final index = _sectionIndices[mealType];

    // Если индекса нет (например, секция пуста и не была добавлена), ничего не делаем
    if (index == null) return;

    // Обновляем таб сразу для лучшего UX
    if (_selectedMealType != mealType) {
      setState(() {
        _selectedMealType = mealType;
      });
    }

    _isScrollingProgrammatically = true;

    // Выравнивание 0.0 означает, что верх элемента будет у верха viewport
    if (isInitial) {
      _itemScrollController.jumpTo(index: index);
      _isScrollingProgrammatically = false;
    } else {
      _itemScrollController.scrollTo(
        index: index,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutCubic,
        alignment: 0,
      ).whenComplete(() {
        // Даем небольшую задержку перед снятием флага, чтобы скролл-слушатель не сработал преждевременно
        Future.delayed(const Duration(milliseconds: 100), () {
          if (mounted) {
            _isScrollingProgrammatically = false;
          }
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final canteenState = ref.watch(canteenProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Формируем единый список виджетов (заголовки + блюда)
    // и заполняем карту индексов _sectionIndices
    final List<Widget> listItems = _buildAndMapListItems(canteenState.todayMenu);

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
          'Меню столовой',
          style: TextStyle(
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Meal Type Tabs
          Container(
            color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
            child: Row(
              children: List.generate(
                _mealTypes.length,
                (index) => Expanded(
                  flex: _selectedMealType == _mealTypes[index] ? 2 : 1,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    child: _buildMealTypeChip(
                      _mealTypes[index],
                      _mealTypeLabels[_mealTypes[index]]!,
                      _mealTypeIcons[_mealTypes[index]]!,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Menu List
          Expanded(
            child: canteenState.isLoading && listItems.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : canteenState.error != null && listItems.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 64,
                              color: isDark ? AppColors.darkIconGray : Colors.grey.shade400,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Ошибка загрузки меню',
                              style: TextStyle(
                                fontSize: 16,
                                color: isDark ? AppColors.darkTextSecondary : Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: () => ref.read(canteenProvider.notifier).fetchTodayMenu(),
                              child: const Text('Повторить'),
                            ),
                          ],
                        ),
                      )
                    : listItems.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.restaurant_menu,
                                  size: 64,
                                  color: isDark ? AppColors.darkIconGray : Colors.grey.shade300,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Меню не найдено',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: isDark ? AppColors.darkTextSecondary : Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ScrollablePositionedList.builder(
                            itemCount: listItems.length,
                            itemScrollController: _itemScrollController,
                            itemPositionsListener: _itemPositionsListener,
                            itemBuilder: (context, index) {
                              return listItems[index];
                            },
                          ),
          ),
        ],
      ),
    );
  }

  // Ключевая функция: создает плоский список виджетов и карту индексов
  List<Widget> _buildAndMapListItems(List<CanteenMenu>? menus) {
    _sectionIndices.clear();
    final List<Widget> items = [];

    print('🎨 [CanteenScreen] Building list items...');
    print('🎨 [CanteenScreen] Menus: ${menus?.length ?? 0}');

    if (menus == null || menus.isEmpty) {
      print('⚠️ [CanteenScreen] No menus to display');
      return items;
    }

    for (final menu in menus) {
      print('🎨 [CanteenScreen] Menu: ${menu.mealType}, items: ${menu.items.length}');
    }

    for (final mealType in _mealTypes) {
      // Собираем блюда для этой секции
      final sectionItems = <CanteenMenuItem>[];
      for (final menu in menus) {
        // Фильтруем по mealType меню, а не по category блюда
        if (menu.mealType == mealType) {
          print('✅ [CanteenScreen] Found menu for $mealType with ${menu.items.length} items');
          sectionItems.addAll(menu.items);
        }
      }

      print('📊 [CanteenScreen] Section $mealType has ${sectionItems.length} items');


      // Если в секции есть блюда, добавляем заголовок и сами блюда в общий список
      if (sectionItems.isNotEmpty) {
        // Запоминаем индекс, с которого начинается эта секция (индекс заголовка)
        _sectionIndices[mealType] = items.length;

        // Добавляем заголовок
        items.add(Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 0),
          child: _buildSectionHeader(
            _mealTypeLabels[mealType]!,
            _mealTypeIcons[mealType]!,
            sectionItems.length,
          ),
        ));

        // Добавляем блюда
        for (final item in sectionItems) {
          items.add(Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 12, AppSpacing.lg, 0),
            child: _buildMenuItem(item),
          ));
        }

        // Добавляем отступ в конце секции
        items.add(const SizedBox(height: 12));
      }
    }
    return items;
  }

  Widget _buildMealTypeChip(MealType type, String label, IconData icon) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isSelected = _selectedMealType == type;

    return GestureDetector(
      onTap: () => _scrollToSection(type),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 12 : 8,
          vertical: 12,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
              : (isDark ? AppColors.darkLightGray : AppColors.lightGray),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: isSelected ? 20 : 16,
              color: isSelected
                  ? Colors.white
                  : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
            ),
            if (isSelected) ...[
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  // Остальная часть вашего кода (_buildFullMenuList, _buildSectionHeader и т.д.)
  // остается без изменений, так как она уже написана хорошо.
  // Я просто скопирую ее сюда для полноты.
  

  Widget _buildSectionHeader(String title, IconData icon, int itemCount) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark 
              ? [AppColors.darkPrimaryRed.withOpacity(0.8), AppColors.darkPrimaryRed.withOpacity(0.6)]
              : [AppColors.primaryRed.withOpacity(0.1), AppColors.primaryRed.withOpacity(0.05)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.darkPrimaryRed.withOpacity(0.3) : AppColors.primaryRed.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed, size: 24),
          const SizedBox(width: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '$itemCount',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(CanteenMenuItem item) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
        boxShadow: isDark ? null : [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image placeholder
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkLightGray : AppColors.lightGray,
                borderRadius: BorderRadius.circular(12),
              ),
              child: item.imageUrl != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        item.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Icon(
                          Icons.restaurant,
                          size: 32,
                          color: isDark ? AppColors.darkIconGray : AppColors.iconGray,
                        ),
                      ),
                    )
                  : Icon(
                      Icons.restaurant,
                      size: 32,
                      color: isDark ? AppColors.darkIconGray : AppColors.iconGray,
                    ),
            ),
            const SizedBox(width: 12),
            // Item details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          item.name,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          ),
                        ),
                      ),
                      if (item.price != null)
                        Text(
                          '${item.price!.toStringAsFixed(0)} ₽',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                          ),
                        ),
                    ],
                  ),
                  if (item.description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      item.description!,
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildNutritionBadge('${item.calories} ккал', Icons.local_fire_department),
                      if (item.weight != null)
                        _buildNutritionBadge('${item.weight} г', Icons.scale),
                      if (item.isVegetarian)
                        _buildIconBadge(Icons.eco, Colors.green),
                      if (item.isVegan)
                        _buildIconBadge(Icons.spa, Colors.lightGreen),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNutritionBadge(String text, IconData icon) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkLightGray : AppColors.lightGray,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconBadge(IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Icon(icon, size: 14, color: color),
    );
  }
}
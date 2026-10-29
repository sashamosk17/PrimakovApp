import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/room_provider.dart';
import '../models/api_models.dart';
import '../../config/app_colors.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

class RoomsListScreen extends ConsumerStatefulWidget {
  const RoomsListScreen({super.key});

  @override
  ConsumerState<RoomsListScreen> createState() => _RoomsListScreenState();
}

class _RoomsListScreenState extends ConsumerState<RoomsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String? _selectedBuilding;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(roomProvider.notifier).fetchRooms());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final roomState = ref.watch(roomProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    var filteredRooms = roomState.rooms;
    if (_searchQuery.isNotEmpty) {
      filteredRooms = filteredRooms.where((room) {
        return room.number.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (room.name?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      }).toList();
    }
    if (_selectedBuilding != null) {
      filteredRooms = filteredRooms.where((room) => room.building == _selectedBuilding).toList();
    }

    final buildings = <String>[];
    for (var room in roomState.rooms) {
      if (!buildings.contains(room.building)) {
        buildings.add(room.building);
      }
    }
    buildings.sort();

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
          'Карта школы',
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
          Container(
            color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                hintText: 'Поиск по номеру или названию',
                hintStyle: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                prefixIcon: Icon(Icons.search, color: isDark ? AppColors.darkIconGray : AppColors.iconGray),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear, color: isDark ? AppColors.darkIconGray : AppColors.iconGray),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: isDark ? AppColors.darkLightGray : AppColors.lightGray,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
          if (buildings.isNotEmpty)
            Container(
              color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
              padding: const EdgeInsets.only(left: AppSpacing.lg, right: AppSpacing.lg, bottom: AppSpacing.md),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('Все', _selectedBuilding == null, () {
                      setState(() => _selectedBuilding = null);
                    }),
                    const SizedBox(width: 8),
                    ...buildings.map((building) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: _buildFilterChip(
                            'Корпус $building',
                            _selectedBuilding == building,
                            () => setState(() => _selectedBuilding = building),
                          ),
                        )),
                  ],
                ),
              ),
            ),
          Expanded(
            child: roomState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : roomState.error != null
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
                              'Ошибка загрузки аудиторий',
                              style: TextStyle(
                                fontSize: 16,
                                color: isDark ? AppColors.darkTextSecondary : Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: () => ref.read(roomProvider.notifier).fetchRooms(),
                              child: const Text('Повторить'),
                            ),
                          ],
                        ),
                      )
                    : filteredRooms.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: isDark ? AppColors.darkIconGray : Colors.grey.shade300,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Аудитории не найдены',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: isDark ? AppColors.darkTextSecondary : Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () async {
                              await ref.read(roomProvider.notifier).fetchRooms();
                            },
                            child: ListView.builder(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: const EdgeInsets.all(AppSpacing.lg),
                              itemCount: filteredRooms.length,
                              itemBuilder: (context, index) {
                                final room = filteredRooms[index];
                                return _buildRoomCard(room);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
              : (isDark ? AppColors.darkLightGray : AppColors.lightGray),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isSelected
                ? Colors.white
                : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
          ),
        ),
      ),
    );
  }

  Widget _buildRoomCard(Room room) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: isDark ? BorderSide(color: AppColors.darkBorderPrimary) : BorderSide.none,
      ),
      elevation: isDark ? 0 : 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkStoryBackground : AppColors.storyBackground,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.meeting_room,
                color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        room.number,
                        style: AppTypography.heading3.copyWith(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.darkPrimaryRed.withOpacity(0.2)
                              : AppColors.primaryRed.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Корпус ${room.building}',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (room.name != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      room.name!,
                      style: AppTypography.bodyMedium.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.layers,
                        size: 14,
                        color: isDark ? AppColors.darkIconGray : Colors.grey,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${room.floor} этаж',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.darkIconGray : Colors.grey,
                        ),
                      ),
                      if (room.capacity != null) ...[
                        const SizedBox(width: 12),
                        Icon(
                          Icons.people,
                          size: 14,
                          color: isDark ? AppColors.darkIconGray : Colors.grey,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${room.capacity} мест',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? AppColors.darkIconGray : Colors.grey,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            if (room.latitude != null && room.longitude != null)
              IconButton(
                icon: Icon(
                  Icons.map,
                  color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Карта для аудитории ${room.number}'),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
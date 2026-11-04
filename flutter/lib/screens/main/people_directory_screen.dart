/// Campus People Directory Screen
/// Search all gymnasium students, teachers, and staff, view contacts, birthdays, and schedules

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../config/app_colors.dart';
import '../../models/api_models.dart';
import '../../providers/user_provider.dart';
import 'user_profile_detail_screen.dart';

class PeopleDirectoryScreen extends ConsumerStatefulWidget {
  const PeopleDirectoryScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<PeopleDirectoryScreen> createState() => _PeopleDirectoryScreenState();
}

class _PeopleDirectoryScreenState extends ConsumerState<PeopleDirectoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedRole = 'ALL'; // ALL, STUDENT, TEACHER
  String _selectedClass = 'ALL';

  final List<String> _gymnasiumClasses = [
    'ALL',
    '1-А', '2-Б', '4-А',
    '5-А', '6-Б', '7-А', '8-В',
    '9-А', '9-Б',
    '10-А', '10-Б',
    '11-А', '11-Б',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final searchParams = DirectorySearchParams(
      query: _searchController.text.trim().isNotEmpty ? _searchController.text.trim() : null,
      role: _selectedRole != 'ALL' ? _selectedRole : null,
      groupName: _selectedClass != 'ALL' ? _selectedClass : null,
    );

    final usersAsync = ref.watch(directorySearchProvider(searchParams));

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackgroundPrimary : const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Справочник гимназии'),
        backgroundColor: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Search & Filters Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(isDark ? 30 : 8),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search TextField
                TextField(
                  controller: _searchController,
                  onChanged: (_) {
                    setState(() {});
                  },
                  decoration: InputDecoration(
                    hintText: 'Поиск по имени, классу или кафедре...',
                    hintStyle: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                    ),
                    prefixIcon: Icon(
                      LucideIcons.search,
                      size: 18,
                      color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                    ),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(LucideIcons.x, size: 16),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {});
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFF1F5F9),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),

                const SizedBox(height: 12),

                // Role Filter Chips
                Row(
                  children: [
                    _buildRoleChip('ALL', 'Все', isDark),
                    const SizedBox(width: 8),
                    _buildRoleChip('STUDENT', 'Учащиеся', isDark),
                    const SizedBox(width: 8),
                    _buildRoleChip('TEACHER', 'Преподаватели', isDark),
                  ],
                ),

                // Class Selector (when ALL or STUDENT is selected)
                if (_selectedRole != 'TEACHER') ...[
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 32,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _gymnasiumClasses.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 6),
                      itemBuilder: (context, index) {
                        final cls = _gymnasiumClasses[index];
                        final isSelected = _selectedClass == cls;
                        return GestureDetector(
                          onTap: () {
                            HapticFeedback.lightImpact();
                            setState(() {
                              _selectedClass = cls;
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
                                  : (isDark ? const Color(0xFF3A3A3C) : const Color(0xFFE2E8F0)),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                cls == 'ALL' ? 'Все классы' : cls,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected
                                      ? Colors.white
                                      : (isDark ? Colors.white70 : const Color(0xFF475569)),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),

          // User Results List
          Expanded(
            child: usersAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => _buildFallbackList(isDark),
              data: (users) {
                if (users.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          LucideIcons.search,
                          size: 44,
                          color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Никого не найдено',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white70 : const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Попробуйте изменить поисковый запрос или фильтры',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: users.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final user = users[index];
                    return _buildUserTile(user, isDark);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleChip(String value, String label, bool isDark) {
    final isSelected = _selectedRole == value;
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        setState(() {
          _selectedRole = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
              : (isDark ? const Color(0xFF2C2C2E) : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
                : (isDark ? Colors.white10 : const Color(0xFFE2E8F0)),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.white70 : const Color(0xFF475569)),
          ),
        ),
      ),
    );
  }

  Widget _buildUserTile(User user, bool isDark) {
    final initials = '${user.firstName.isNotEmpty ? user.firstName[0] : ''}'
        '${user.lastName.isNotEmpty ? user.lastName[0] : ''}';

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.darkBorderSecondary : const Color(0xFFE2E8F0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 20 : 6),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        onTap: () {
          HapticFeedback.lightImpact();
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => UserProfileDetailScreen(initialUser: user),
            ),
          );
        },
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: user.role == UserRole.TEACHER
                ? const Color(0xFF7C3AED)
                : (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed),
          ),
          child: ClipOval(
            child: user.avatarUrl != null && user.avatarUrl!.isNotEmpty
                ? Image.network(
                    user.avatarUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Center(
                      child: Text(
                        initials,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  )
                : Center(
                    child: Text(
                      initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                '${user.lastName} ${user.firstName}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.darkTextPrimary : const Color(0xFF0F172A),
                ),
              ),
            ),
            if (user.isBirthdayToday)
              const Padding(
                padding: EdgeInsets.only(left: 4),
                child: Text('🎂', style: TextStyle(fontSize: 16)),
              ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: user.role == UserRole.TEACHER
                      ? const Color(0xFFF3E8FF)
                      : const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  user.role == UserRole.TEACHER ? 'Учитель' : 'Ученик',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: user.role == UserRole.TEACHER
                        ? const Color(0xFF6B21A8)
                        : const Color(0xFF1D4ED8),
                  ),
                ),
              ),
              if (user.groupName != null) ...[
                const SizedBox(width: 6),
                Text(
                  user.groupName!,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white60 : const Color(0xFF64748B),
                  ),
                ),
              ],
            ],
          ),
        ),
        trailing: Icon(
          LucideIcons.chevronRight,
          size: 14,
          color: isDark ? Colors.white30 : const Color(0xFF94A3B8),
        ),
      ),
    );
  }

  Widget _buildFallbackList(bool isDark) {
    // Graceful offline test data
    final fallbackUsers = [
      User(
        id: 'user-1',
        email: 'ivan.petrov@primakov.school',
        firstName: 'Иван',
        lastName: 'Петров',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '10-А',
        birthDate: '2010-04-12',
        phone: '+7 (999) 111-22-33',
        telegram: '@ivan_petrov_gym',
      ),
      User(
        id: 'user-2',
        email: 'maria.sokolova@primakov.school',
        firstName: 'Мария',
        lastName: 'Соколова',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '10-А',
        birthDate: '2010-07-25',
        phone: '+7 (999) 222-33-44',
        telegram: '@maria_sokolova_gym',
      ),
      User(
        id: 'teacher-1',
        email: 'teacher.ivanov@primakov.school',
        firstName: 'Иван',
        lastName: 'Иванов',
        role: UserRole.TEACHER,
        isActive: true,
        groupName: 'Кафедра математики',
        birthDate: '1980-05-18',
        phone: '+7 (916) 123-45-67',
        telegram: '@ivanov_math',
      ),
      User(
        id: 'teacher-2',
        email: 'teacher.sidorov@primakov.school',
        firstName: 'Виктор',
        lastName: 'Сидоров',
        role: UserRole.TEACHER,
        isActive: true,
        groupName: 'Кафедра словесности',
        birthDate: '1976-12-03',
        phone: '+7 (916) 234-56-78',
        telegram: '@sidorov_lit',
      ),
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: fallbackUsers.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        return _buildUserTile(fallbackUsers[index], isDark);
      },
    );
  }
}


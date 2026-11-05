/// API Models
/// Converted from TypeScript types/api.ts

import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final UserRole role;
  final bool isActive;
  final String? vkId;
  final String? avatarUrl;
  final bool twoFactorEnabled;
  final String? groupName;
  final String? birthDate;
  final String? phone;
  final String? telegram;
  final bool isBirthdayToday;
  final String? house;
  final bool isBoarding;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.isActive,
    this.vkId,
    this.avatarUrl,
    this.twoFactorEnabled = false,
    this.groupName,
    this.birthDate,
    this.phone,
    this.telegram,
    this.isBirthdayToday = false,
    this.house,
    this.isBoarding = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    UserRole roleVal = UserRole.STUDENT;
    final roleStr = json['role'] as String? ?? 'STUDENT';
    if (roleStr == 'TEACHER') {
      roleVal = UserRole.TEACHER;
    } else if (roleStr == 'ADMIN' || roleStr == 'SUPERADMIN') {
      roleVal = UserRole.ADMIN;
    }

    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      role: roleVal,
      isActive: json['isActive'] as bool? ?? true,
      vkId: json['vkId'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      twoFactorEnabled: json['twoFactorEnabled'] as bool? ?? false,
      groupName: json['groupName'] as String?,
      birthDate: json['birthDate'] as String?,
      phone: json['phone'] as String?,
      telegram: json['telegram'] as String?,
      isBirthdayToday: json['isBirthdayToday'] as bool? ?? false,
      house: json['house'] as String?,
      isBoarding: json['isBoarding'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'firstName': firstName,
    'lastName': lastName,
    'role': role.name,
    'isActive': isActive,
    'vkId': vkId,
    'avatarUrl': avatarUrl,
    'twoFactorEnabled': twoFactorEnabled,
    'groupName': groupName,
    'birthDate': birthDate,
    'phone': phone,
    'telegram': telegram,
    'isBirthdayToday': isBirthdayToday,
    'house': house,
    'isBoarding': isBoarding,
  };

  User copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    UserRole? role,
    bool? isActive,
    String? vkId,
    String? avatarUrl,
    bool? twoFactorEnabled,
    String? groupName,
    String? birthDate,
    String? phone,
    String? telegram,
    bool? isBirthdayToday,
    String? house,
    bool? isBoarding,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      vkId: vkId ?? this.vkId,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
      groupName: groupName ?? this.groupName,
      birthDate: birthDate ?? this.birthDate,
      phone: phone ?? this.phone,
      telegram: telegram ?? this.telegram,
      isBirthdayToday: isBirthdayToday ?? this.isBirthdayToday,
      house: house ?? this.house,
      isBoarding: isBoarding ?? this.isBoarding,
    );
  }

  String get fullName => '$firstName $lastName'.trim();
}

enum UserRole { STUDENT, TEACHER, ADMIN }

class UserProfileData {
  final User user;
  final List<Lesson> todayLessons;

  UserProfileData({
    required this.user,
    required this.todayLessons,
  });

  factory UserProfileData.fromJson(Map<String, dynamic> json) {
    final user = User.fromJson(json);
    final lessonsJson = json['todayLessons'] as List<dynamic>? ?? [];
    final lessons = lessonsJson
        .map((l) => Lesson.fromJson(l as Map<String, dynamic>))
        .toList();
    return UserProfileData(user: user, todayLessons: lessons);
  }
}

class Lesson {
  final String id;
  final String subject;
  final String teacherId;
  final String? teacherName;
  final String startTime;
  final String endTime;
  final String room;
  final int floor;
  final bool hasHomework;
  final String? homeworkDescription;

  Lesson({
    required this.id,
    required this.subject,
    required this.teacherId,
    this.teacherName,
    required this.startTime,
    required this.endTime,
    required this.room,
    required this.floor,
    required this.hasHomework,
    this.homeworkDescription,
  });

  factory Lesson.fromJson(Map<String, dynamic> json) {
    // Адаптер для формата бэкенда
    String startTime;
    String endTime;

    if (json['timeSlot'] != null) {
      startTime = json['timeSlot']['_startTime'] as String? ?? '';
      endTime = json['timeSlot']['_endTime'] as String? ?? '';
    } else {
      startTime = json['startTime'] as String? ?? '';
      endTime = json['endTime'] as String? ?? '';
    }

    String room;
    if (json['room'] != null && json['room'] is Map) {
      room = json['room']['_number'] as String? ?? '';
    } else {
      room = json['room'] as String? ?? '';
    }

    return Lesson(
      id: json['id'] as String,
      subject: json['subject'] as String,
      teacherId: json['teacherId'] as String,
      teacherName: json['teacherName'] as String?,
      startTime: startTime,
      endTime: endTime,
      room: room,
      floor: json['floor'] as int? ?? 3,
      hasHomework: json['hasHomework'] as bool? ?? false,
      homeworkDescription: json['homeworkDescription'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'subject': subject,
    'teacherId': teacherId,
    'teacherName': teacherName,
    'startTime': startTime,
    'endTime': endTime,
    'room': room,
    'floor': floor,
    'hasHomework': hasHomework,
    'homeworkDescription': homeworkDescription,
  };
}

class Schedule {
  final String id;
  final String groupId;
  final String date;
  final List<Lesson> lessons;

  Schedule({
    required this.id,
    required this.groupId,
    required this.date,
    required this.lessons,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      id: json['id'] as String,
      groupId: json['groupId'] as String,
      date: json['date'] as String,
      lessons: (json['lessons'] as List<dynamic>?)
          ?.map((e) => Lesson.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'groupId': groupId,
    'date': date,
    'lessons': lessons.map((e) => e.toJson()).toList(),
  };
}

enum DeadlineStatus { PENDING, COMPLETED, OVERDUE }

class Deadline {
  final String id;
  final String title;
  final String description;
  final String dueDate;
  final String userId;
  final DeadlineStatus status;
  final String? subject;
  final String createdAt;
  final String? completedAt;

  Deadline({
    required this.id,
    required this.title,
    required this.description,
    required this.dueDate,
    required this.userId,
    required this.status,
    this.subject,
    required this.createdAt,
    this.completedAt,
  });

  factory Deadline.fromJson(Map<String, dynamic> json) {
    return Deadline(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      dueDate: json['dueDate'] as String,
      userId: json['userId'] as String,
      status: DeadlineStatus.values.byName(json['status'] as String? ?? 'PENDING'),
      subject: json['subject'] as String?,
      createdAt: json['createdAt'] as String,
      completedAt: json['completedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'dueDate': dueDate,
    'userId': userId,
    'status': status.name,
    'subject': subject,
    'createdAt': createdAt,
    'completedAt': completedAt,
  };
}

class Story {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;
  final String? videoUrl;
  final List<String> viewedBy;
  final String? linkUrl;
  final String? linkText;

  Story({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    this.videoUrl,
    required this.viewedBy,
    this.linkUrl,
    this.linkText,
  });

  factory Story.fromJson(Map<String, dynamic> json) {
    return Story(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String?,
      videoUrl: json['videoUrl'] as String?,
      viewedBy: List<String>.from(json['viewedBy'] as List<dynamic>? ?? []),
      linkUrl: json['linkUrl'] as String?,
      linkText: json['linkText'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'imageUrl': imageUrl,
    'videoUrl': videoUrl,
    'viewedBy': viewedBy,
    'linkUrl': linkUrl,
    'linkText': linkText,
  };
}

class Rating {
  final String id;
  final String teacherId;
  final String? studentId;
  final double rate;
  final String comment;
  final String createdAt;

  Rating({
    required this.id,
    required this.teacherId,
    this.studentId,
    required this.rate,
    required this.comment,
    required this.createdAt,
  });

  factory Rating.fromJson(Map<String, dynamic> json) {
    return Rating(
      id: json['id'] as String,
      teacherId: json['teacherId'] as String,
      studentId: json['studentId'] as String?,
      rate: (json['rate'] as num).toDouble(),
      comment: json['comment'] as String? ?? '',
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'teacherId': teacherId,
    'studentId': studentId,
    'rate': rate,
    'comment': comment,
    'createdAt': createdAt,
  };
}

class Announcement {
  final String id;
  final String title;
  final String content;
  final String? category;
  final String createdAt;

  Announcement({
    required this.id,
    required this.title,
    required this.content,
    this.category,
    required this.createdAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      category: json['category'] as String?,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'content': content,
    if (category != null) 'category': category,
    'createdAt': createdAt,
  };
}

class News {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;
  final String? category;
  final String createdAt;

  News({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    this.category,
    required this.createdAt,
  });

  factory News.fromJson(Map<String, dynamic> json) {
    return News(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String?,
      category: json['category'] as String?,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'imageUrl': imageUrl,
    if (category != null) 'category': category,
    'createdAt': createdAt,
  };
}

class Quote {
  final String id;
  final String text;
  final String author;

  Quote({
    required this.id,
    required this.text,
    required this.author,
  });

  factory Quote.fromJson(Map<String, dynamic> json) {
    return Quote(
      id: json['id'] as String,
      text: json['text'] as String,
      author: json['author'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'text': text,
    'author': author,
  };
}

class CafeteriaInfo {
  final double balance;
  final String todayMenu;

  CafeteriaInfo({
    required this.balance,
    required this.todayMenu,
  });

  factory CafeteriaInfo.fromJson(Map<String, dynamic> json) {
    return CafeteriaInfo(
      balance: (json['balance'] as num).toDouble(),
      todayMenu: json['todayMenu'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'balance': balance,
    'todayMenu': todayMenu,
  };
}

class AuthResponse {
  final User user;
  final String token;

  AuthResponse({
    required this.user,
    required this.token,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'user': user.toJson(),
    'token': token,
  };
}

class ApiResponse<T> {
  final String status;
  final T? data;
  final Map<String, dynamic>? error;

  ApiResponse({
    required this.status,
    this.data,
    this.error,
  });

  bool get isSuccess => status == 'success';
  bool get isError => status == 'error';

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      status: json['status'] as String? ?? 'error',
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : null,
      error: json['error'] as Map<String, dynamic>?,
    );
  }
}

// --- New Features (Vision 3) ---

class Room {
  final String id;
  final String number;
  final String? name;
  final String building;
  final int floor;
  final int? capacity;
  final double? latitude;
  final double? longitude;
  final String? description;
  final bool isActive;

  Room({
    required this.id,
    required this.number,
    this.name,
    required this.building,
    required this.floor,
    this.capacity,
    this.latitude,
    this.longitude,
    this.description,
    required this.isActive,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] as String,
      number: json['number'] as String,
      name: json['name'] as String?,
      building: json['building'] as String? ?? 'A',
      floor: json['floor'] as int? ?? 1,
      capacity: json['capacity'] as int?,
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      description: json['description'] as String?,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'number': number,
    'name': name,
    'building': building,
    'floor': floor,
    'capacity': capacity,
    'latitude': latitude,
    'longitude': longitude,
    'description': description,
    'isActive': isActive,
  };
}

enum RequestType { IT, MAINTENANCE, CLEANING }
enum RequestPriority { LOW, MEDIUM, HIGH, URGENT }
enum RequestStatus { PENDING, IN_PROGRESS, COMPLETED, CANCELLED }

class SupportRequest {
  final String id;
  final String title;
  final String description;
  final RequestType type;
  final RequestPriority priority;
  final RequestStatus status;
  final String creatorId;
  final String? assigneeId;
  final String? roomId;
  final String? notes;
  final String createdAt;
  final String updatedAt;
  final String? completedAt;

  SupportRequest({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.priority,
    required this.status,
    required this.creatorId,
    this.assigneeId,
    this.roomId,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  factory SupportRequest.fromJson(Map<String, dynamic> json) {
    return SupportRequest(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      type: RequestType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => RequestType.IT,
      ),
      priority: RequestPriority.values.firstWhere(
        (e) => e.name == json['priority'],
        orElse: () => RequestPriority.LOW,
      ),
      status: RequestStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => RequestStatus.PENDING,
      ),
      creatorId: json['creatorId'] as String,
      assigneeId: json['assigneeId'] as String?,
      roomId: json['roomId'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
      completedAt: json['completedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'type': type.name,
    'priority': priority.name,
    'status': status.name,
    'creatorId': creatorId,
    'assigneeId': assigneeId,
    'roomId': roomId,
    'notes': notes,
    'createdAt': createdAt,
    'updatedAt': updatedAt,
    'completedAt': completedAt,
  };
}

enum MealType { BREAKFAST, LUNCH, DINNER, SNACK }

class CanteenMenuItem {
  final String id;
  final String name;
  final String? description;
  final String? category;
  final int calories;
  final double? protein;
  final double? carbs;
  final double? fat;
  final int? weight;
  final String? imageUrl;
  final List<String> allergens;
  final bool isVegetarian;
  final bool isVegan;
  final double? price;
  final int displayOrder;

  CanteenMenuItem({
    required this.id,
    required this.name,
    this.description,
    this.category,
    required this.calories,
    this.protein,
    this.carbs,
    this.fat,
    this.weight,
    this.imageUrl,
    required this.allergens,
    required this.isVegetarian,
    required this.isVegan,
    this.price,
    required this.displayOrder,
  });

  factory CanteenMenuItem.fromJson(Map<String, dynamic> json) {
    return CanteenMenuItem(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      calories: json['calories'] as int? ?? 0,
      protein: json['protein'] != null ? (json['protein'] as num).toDouble() : null,
      carbs: json['carbs'] != null ? (json['carbs'] as num).toDouble() : null,
      fat: json['fat'] != null ? (json['fat'] as num).toDouble() : null,
      weight: json['weight'] as int?,
      imageUrl: json['imageUrl'] as String?,
      allergens: (json['allergens'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      isVegetarian: json['isVegetarian'] as bool? ?? false,
      isVegan: json['isVegan'] as bool? ?? false,
      price: json['price'] != null ? (json['price'] as num).toDouble() : null,
      displayOrder: json['displayOrder'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'category': category,
    'calories': calories,
    'protein': protein,
    'carbs': carbs,
    'fat': fat,
    'weight': weight,
    'imageUrl': imageUrl,
    'allergens': allergens,
    'isVegetarian': isVegetarian,
    'isVegan': isVegan,
    'price': price,
    'displayOrder': displayOrder,
  };
}

class CanteenMenu {
  final String id;
  final String date;
  final MealType mealType;
  final List<CanteenMenuItem> items;
  final String createdAt;

  CanteenMenu({
    required this.id,
    required this.date,
    required this.mealType,
    required this.items,
    required this.createdAt,
  });

  factory CanteenMenu.fromJson(Map<String, dynamic> json) {
    return CanteenMenu(
      id: json['id'] as String,
      date: json['date'] as String,
      mealType: MealType.values.firstWhere(
        (e) => e.name == json['mealType'],
        orElse: () => MealType.LUNCH,
      ),
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => CanteenMenuItem.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'date': date,
    'mealType': mealType.name,
    'items': items.map((e) => e.toJson()).toList(),
    'createdAt': createdAt,
  };
}

/// Notification Settings Model
class NotificationSettings {
  final bool pushEnabled;
  final bool deadlineNotifications;
  final bool scheduleNotifications;
  final bool announcementNotifications;

  const NotificationSettings({
    this.pushEnabled = true,
    this.deadlineNotifications = true,
    this.scheduleNotifications = true,
    this.announcementNotifications = true,
  });

  NotificationSettings copyWith({
    bool? pushEnabled,
    bool? deadlineNotifications,
    bool? scheduleNotifications,
    bool? announcementNotifications,
  }) {
    return NotificationSettings(
      pushEnabled: pushEnabled ?? this.pushEnabled,
      deadlineNotifications: deadlineNotifications ?? this.deadlineNotifications,
      scheduleNotifications: scheduleNotifications ?? this.scheduleNotifications,
      announcementNotifications: announcementNotifications ?? this.announcementNotifications,
    );
  }

  factory NotificationSettings.fromJson(Map<String, dynamic> json) {
    return NotificationSettings(
      pushEnabled: json['pushEnabled'] as bool? ?? true,
      deadlineNotifications: json['deadlineNotifications'] as bool? ?? true,
      scheduleNotifications: json['scheduleNotifications'] as bool? ?? true,
      announcementNotifications: json['announcementNotifications'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'pushEnabled': pushEnabled,
    'deadlineNotifications': deadlineNotifications,
    'scheduleNotifications': scheduleNotifications,
    'announcementNotifications': announcementNotifications,
  };
}

/// User Active Session Model
class UserSession {
  final String id;
  final String userId;
  final String device;
  final String platform;
  final String ipAddress;
  final String location;
  final DateTime lastActiveAt;
  final DateTime createdAt;
  final bool isCurrent;

  UserSession({
    required this.id,
    required this.userId,
    required this.device,
    required this.platform,
    required this.ipAddress,
    required this.location,
    required this.lastActiveAt,
    required this.createdAt,
    this.isCurrent = false,
  });

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      device: json['device'] as String? ?? 'Неизвестное устройство',
      platform: json['platform'] as String? ?? 'web',
      ipAddress: json['ipAddress'] as String? ?? '127.0.0.1',
      location: json['location'] as String? ?? 'Москва, Россия',
      lastActiveAt: DateTime.tryParse(json['lastActiveAt'] as String? ?? '') ?? DateTime.now(),
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
      isCurrent: json['isCurrent'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'userId': userId,
    'device': device,
    'platform': platform,
    'ipAddress': ipAddress,
    'location': location,
    'lastActiveAt': lastActiveAt.toIso8601String(),
    'createdAt': createdAt.toIso8601String(),
    'isCurrent': isCurrent,
  };
}

/// User Academic Stats Model
class UserStats {
  final String userId;
  final double gpa;
  final double attendanceRate;
  final int totalLessons;
  final int completedDeadlines;
  final int pendingDeadlines;

  UserStats({
    required this.userId,
    required this.gpa,
    required this.attendanceRate,
    required this.totalLessons,
    required this.completedDeadlines,
    required this.pendingDeadlines,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      userId: json['userId'] as String? ?? '',
      gpa: (json['gpa'] as num?)?.toDouble() ?? 4.85,
      attendanceRate: (json['attendanceRate'] as num?)?.toDouble() ?? 98.0,
      totalLessons: (json['totalLessons'] as num?)?.toInt() ?? 32,
      completedDeadlines: (json['completedDeadlines'] as num?)?.toInt() ?? 0,
      pendingDeadlines: (json['pendingDeadlines'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'gpa': gpa,
    'attendanceRate': attendanceRate,
    'totalLessons': totalLessons,
    'completedDeadlines': completedDeadlines,
    'pendingDeadlines': pendingDeadlines,
  };
}

// ==========================================
// BLOCK 1: Academic Grades & GPA Simulator Models
// ==========================================

class GradeItem {
  final String id;
  final String studentId;
  final String subjectId;
  final String subjectName;
  final int value;
  final double weight;
  final String date;
  final String period;
  final String? topic;

  GradeItem({
    required this.id,
    required this.studentId,
    required this.subjectId,
    required this.subjectName,
    required this.value,
    this.weight = 1.0,
    required this.date,
    this.period = "1 триместр",
    this.topic,
  });

  factory GradeItem.fromJson(Map<String, dynamic> json) {
    return GradeItem(
      id: json['id'] as String? ?? '',
      studentId: json['studentId'] as String? ?? '',
      subjectId: json['subjectId'] as String? ?? '',
      subjectName: json['subjectName'] as String? ?? '',
      value: (json['value'] as num?)?.toInt() ?? 5,
      weight: (json['weight'] as num?)?.toDouble() ?? 1.0,
      date: json['date'] as String? ?? DateTime.now().toIso8601String(),
      period: json['period'] as String? ?? '1 триместр',
      topic: json['topic'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'studentId': studentId,
    'subjectId': subjectId,
    'subjectName': subjectName,
    'value': value,
    'weight': weight,
    'date': date,
    'period': period,
    'topic': topic,
  };
}

class SubjectGradeSummary {
  final String subjectName;
  final List<GradeItem> grades;
  final double averageScore;
  final int? periodMark;

  SubjectGradeSummary({
    required this.subjectName,
    required this.grades,
    required this.averageScore,
    this.periodMark,
  });

  factory SubjectGradeSummary.fromJson(Map<String, dynamic> json) {
    final gradesRaw = json['grades'] as List<dynamic>? ?? [];
    final parsedGrades = gradesRaw
        .map((e) => GradeItem.fromJson(e as Map<String, dynamic>))
        .toList();

    return SubjectGradeSummary(
      subjectName: json['subjectName'] as String? ?? '',
      grades: parsedGrades,
      averageScore: (json['averageScore'] as num?)?.toDouble() ?? 0.0,
      periodMark: (json['periodMark'] as num?)?.toInt(),
    );
  }

  Map<String, dynamic> toJson() => {
    'subjectName': subjectName,
    'grades': grades.map((g) => g.toJson()).toList(),
    'averageScore': averageScore,
    'periodMark': periodMark,
  };
}

class HypotheticalGrade {
  final int value;
  final double weight;
  final String label;

  HypotheticalGrade({
    required this.value,
    required this.weight,
    required this.label,
  });
}

class GpaSimulator {
  final SubjectGradeSummary summary;
  final List<HypotheticalGrade> hypotheticalGrades = [];

  GpaSimulator({required this.summary});

  double get currentScore => summary.averageScore;

  void addHypotheticalGrade({
    required int value,
    required double weight,
    String? label,
  }) {
    hypotheticalGrades.add(
      HypotheticalGrade(
        value: value,
        weight: weight,
        label: label ?? '+$value (вес ${weight == 1.0 ? "1" : weight})',
      ),
    );
  }

  void removeHypotheticalGrade(int index) {
    if (index >= 0 && index < hypotheticalGrades.length) {
      hypotheticalGrades.removeAt(index);
    }
  }

  void reset() {
    hypotheticalGrades.clear();
  }

  double get simulatedScore {
    double totalWeighted = 0;
    double totalWeight = 0;

    for (final g in summary.grades) {
      totalWeighted += g.value * g.weight;
      totalWeight += g.weight;
    }

    for (final h in hypotheticalGrades) {
      totalWeighted += h.value * h.weight;
      totalWeight += h.weight;
    }

    if (totalWeight == 0) return 0.0;
    final avg = totalWeighted / totalWeight;
    return (avg * 100).round() / 100.0;
  }

  bool willAchieveTarget(double target) {
    return simulatedScore >= target;
  }
}

// ==========================================
// BLOCK 2: House System (Лига Домов Примакова)
// ==========================================

class HouseStanding {
  final String house;
  final int totalPoints;
  final int rank;

  HouseStanding({
    required this.house,
    required this.totalPoints,
    required this.rank,
  });

  factory HouseStanding.fromJson(Map<String, dynamic> json) {
    return HouseStanding(
      house: json['house'] as String? ?? 'NORTH',
      totalPoints: (json['totalPoints'] as num?)?.toInt() ?? 0,
      rank: (json['rank'] as num?)?.toInt() ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
    'house': house,
    'totalPoints': totalPoints,
    'rank': rank,
  };
}

class HouseTransaction {
  final String id;
  final String house;
  final int points;
  final String category;
  final String reason;
  final String awardedBy;
  final String? studentId;
  final String createdAt;

  HouseTransaction({
    required this.id,
    required this.house,
    required this.points,
    required this.category,
    required this.reason,
    required this.awardedBy,
    this.studentId,
    required this.createdAt,
  });

  factory HouseTransaction.fromJson(Map<String, dynamic> json) {
    return HouseTransaction(
      id: json['id'] as String? ?? '',
      house: json['house'] as String? ?? 'NORTH',
      points: (json['points'] as num?)?.toInt() ?? 0,
      category: json['category'] as String? ?? 'ACADEMIC',
      reason: json['reason'] as String? ?? '',
      awardedBy: json['awardedBy'] as String? ?? '',
      studentId: json['studentId'] as String?,
      createdAt: json['createdAt'] as String? ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'house': house,
    'points': points,
    'category': category,
    'reason': reason,
    'awardedBy': awardedBy,
    'studentId': studentId,
    'createdAt': createdAt,
  };
}

class HouseCupData {
  final List<HouseStanding> standings;
  final List<HouseTransaction> recentTransactions;

  HouseCupData({
    required this.standings,
    required this.recentTransactions,
  });

  factory HouseCupData.fromJson(Map<String, dynamic> json) {
    final standingsRaw = json['standings'] as List<dynamic>? ?? [];
    final txRaw = json['recentTransactions'] as List<dynamic>? ?? [];

    return HouseCupData(
      standings: standingsRaw
          .map((e) => HouseStanding.fromJson(e as Map<String, dynamic>))
          .toList(),
      recentTransactions: txRaw
          .map((e) => HouseTransaction.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'standings': standings.map((s) => s.toJson()).toList(),
    'recentTransactions': recentTransactions.map((t) => t.toJson()).toList(),
  };
}

class HouseConfig {
  final String house;
  final String displayName;
  final String totem;
  final String motto;
  final Color color;
  final IconData icon;

  const HouseConfig({
    required this.house,
    required this.displayName,
    required this.totem,
    required this.motto,
    required this.color,
    required this.icon,
  });

  static HouseConfig fromHouseName(String? house) {
    switch ((house ?? '').toUpperCase()) {
      case 'NORTH':
        return const HouseConfig(
          house: 'NORTH',
          displayName: 'Север',
          totem: 'Белый медведь',
          motto: 'Мудрость и стойкость',
          color: Color(0xFF1E88E5),
          icon: LucideIcons.snowflake,
        );
      case 'SOUTH':
        return const HouseConfig(
          house: 'SOUTH',
          displayName: 'Юг',
          totem: 'Тигр',
          motto: 'Всегда начинай с себя!',
          color: Color(0xFFF57C00),
          icon: LucideIcons.flame,
        );
      case 'EAST':
        return const HouseConfig(
          house: 'EAST',
          displayName: 'Восток',
          totem: 'Дракон и Панда',
          motto: 'Гармония и баланс',
          color: Color(0xFF2E7D32),
          icon: LucideIcons.leaf,
        );
      case 'WEST':
      default:
        return const HouseConfig(
          house: 'WEST',
          displayName: 'Запад',
          totem: 'Крылатый лев',
          motto: 'Свобода и благородство',
          color: Color(0xFF8B0000),
          icon: LucideIcons.shield,
        );
    }
  }
}

// ==========================================
// BLOCK 3: Boarding Life (Школа-пансион) Models
// ==========================================

class BoardingCheckInItem {
  final String id;
  final String studentId;
  final String checkInTime;
  final String status;
  final String? notes;

  BoardingCheckInItem({
    required this.id,
    required this.studentId,
    required this.checkInTime,
    required this.status,
    this.notes,
  });

  factory BoardingCheckInItem.fromJson(Map<String, dynamic> json) {
    return BoardingCheckInItem(
      id: json['id'] as String? ?? '',
      studentId: json['studentId'] as String? ?? '',
      checkInTime: json['checkInTime'] as String? ?? DateTime.now().toIso8601String(),
      status: json['status'] as String? ?? 'PRESENT',
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'studentId': studentId,
    'checkInTime': checkInTime,
    'status': status,
    'notes': notes,
  };
}

class WeekendLeaveRequestItem {
  final String id;
  final String studentId;
  final String departureDate;
  final String returnDate;
  final String transportType;
  final String status;
  final bool guardianConfirmed;
  final String? createdAt;

  WeekendLeaveRequestItem({
    required this.id,
    required this.studentId,
    required this.departureDate,
    required this.returnDate,
    required this.transportType,
    required this.status,
    required this.guardianConfirmed,
    this.createdAt,
  });

  factory WeekendLeaveRequestItem.fromJson(Map<String, dynamic> json) {
    return WeekendLeaveRequestItem(
      id: json['id'] as String? ?? '',
      studentId: json['studentId'] as String? ?? '',
      departureDate: json['departureDate'] as String? ?? '',
      returnDate: json['returnDate'] as String? ?? '',
      transportType: json['transportType'] as String? ?? 'SHUTTLE',
      status: json['status'] as String? ?? 'PENDING',
      guardianConfirmed: json['guardianConfirmed'] as bool? ?? false,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'studentId': studentId,
    'departureDate': departureDate,
    'returnDate': returnDate,
    'transportType': transportType,
    'status': status,
    'guardianConfirmed': guardianConfirmed,
    'createdAt': createdAt,
  };
}

class BoardingStatusResponse {
  final BoardingCheckInItem? lastCheckIn;
  final WeekendLeaveRequestItem? activeLeave;
  final List<BoardingCheckInItem> recentCheckIns;

  BoardingStatusResponse({
    this.lastCheckIn,
    this.activeLeave,
    this.recentCheckIns = const [],
  });

  factory BoardingStatusResponse.fromJson(Map<String, dynamic> json) {
    final checkInsRaw = json['recentCheckIns'] as List<dynamic>? ?? [];

    return BoardingStatusResponse(
      lastCheckIn: json['lastCheckIn'] != null
          ? BoardingCheckInItem.fromJson(json['lastCheckIn'] as Map<String, dynamic>)
          : null,
      activeLeave: json['activeLeave'] != null
          ? WeekendLeaveRequestItem.fromJson(json['activeLeave'] as Map<String, dynamic>)
          : null,
      recentCheckIns: checkInsRaw
          .map((e) => BoardingCheckInItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'lastCheckIn': lastCheckIn?.toJson(),
    'activeLeave': activeLeave?.toJson(),
    'recentCheckIns': recentCheckIns.map((c) => c.toJson()).toList(),
  };
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:primakov_app/config/app_localizations.dart';
import 'package:primakov_app/providers/locale_provider.dart';

void main() {
  group('AppLocalizations Tests', () {
    test('Russian dictionary provides correct translations', () {
      final locRu = AppLocalizations(const Locale('ru', 'RU'));
      expect(locRu.navHome, 'Главная');
      expect(locRu.navSchedule, 'Расписание');
      expect(locRu.navServices, 'Сервисы');
      expect(locRu.navProfile, 'Профиль');
      expect(locRu.todaySchedule, 'Расписание на сегодня');
      expect(locRu.room, 'Кабинет');
      expect(locRu.teacher, 'Преподаватель');
      expect(locRu.settings, 'Настройки');
      expect(locRu.language, 'Язык');
      expect(locRu.deadlines, 'Дедлайны');
      expect(locRu.canteen, 'Столовая');
      expect(locRu.boarding, 'Пансион Раздоры');
      expect(locRu.houseCup, 'Лига Домов (House Cup)');
      expect(locRu.loginButton, 'Войти в систему');
      expect(locRu.roleStudent, 'Ученик');
      expect(locRu.appLanguage, 'Язык интерфейса');
      expect(locRu.helpAndSupport, 'Помощь и поддержка');
      expect(locRu.documentsAndRegulations, 'Документы и регламенты');
      expect(locRu.badgeInProgress, 'ИДЕТ УРОК');
      expect(locRu.mySchedule, 'Мое расписание');
      expect(locRu.allLessons, 'Все уроки');
      expect(locRu.translate('untilLessonEnd'), 'До конца урока');
      expect(locRu.translate('minutesShort'), 'мин');
      expect(locRu.translate('nextLesson'), 'Следующий урок');
      expect(locRu.translate('emailBoundMsg'), 'Корпоративная почта привязана к аккаунту');
    });

    test('English dictionary provides correct translations', () {
      final locEn = AppLocalizations(const Locale('en', 'US'));
      expect(locEn.navHome, 'Home');
      expect(locEn.navSchedule, 'Schedule');
      expect(locEn.navServices, 'Services');
      expect(locEn.navProfile, 'Profile');
      expect(locEn.todaySchedule, "Today's Schedule");
      expect(locEn.room, 'Room');
      expect(locEn.teacher, 'Teacher');
      expect(locEn.settings, 'Settings');
      expect(locEn.language, 'Language');
      expect(locEn.deadlines, 'Deadlines');
      expect(locEn.canteen, 'Canteen');
      expect(locEn.boarding, 'Boarding Razdory');
      expect(locEn.houseCup, 'House Cup Tournament');
      expect(locEn.loginButton, 'Sign In');
      expect(locEn.roleStudent, 'Student');
      expect(locEn.appLanguage, 'App Language');
      expect(locEn.helpAndSupport, 'Help & Support');
      expect(locEn.documentsAndRegulations, 'Documents & Policies');
      expect(locEn.badgeInProgress, 'IN PROGRESS');
      expect(locEn.mySchedule, 'My Schedule');
      expect(locEn.allLessons, 'All Lessons');
      expect(locEn.translate('untilLessonEnd'), 'Until lesson end');
      expect(locEn.translate('minutesShort'), 'min');
      expect(locEn.translate('nextLesson'), 'Next Lesson');
      expect(locEn.translate('emailBoundMsg'), 'Corporate email is linked to your account');
    });

    test('Fallback to Russian when key is missing or locale is default', () {
      final locDefault = AppLocalizations(const Locale('ru'));
      expect(locDefault.translate('appName'), 'Гимназия Примакова');
    });
  });

  group('LocaleNotifier Tests', () {
    test('Initial locale defaults to Russian', () {
      final notifier = LocaleNotifier();
      expect(notifier.state.languageCode, 'ru');
    });

    test('setLocale updates state to English and Russian', () async {
      final notifier = LocaleNotifier();
      await notifier.setLocale(const Locale('en', 'US'));
      expect(notifier.state.languageCode, 'en');

      await notifier.setLocale(const Locale('ru', 'RU'));
      expect(notifier.state.languageCode, 'ru');
    });

    test('toggleLocale switches between ru and en', () async {
      final notifier = LocaleNotifier();
      expect(notifier.state.languageCode, 'ru');

      await notifier.toggleLocale();
      expect(notifier.state.languageCode, 'en');

      await notifier.toggleLocale();
      expect(notifier.state.languageCode, 'ru');
    });
  });

  group('Widget Localization Integration', () {
    testWidgets('Renders localized text dynamically based on locale', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: const [
            AppLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('ru', 'RU'),
            Locale('en', 'US'),
          ],
          locale: const Locale('en', 'US'),
          home: Builder(
            builder: (context) {
              final loc = AppLocalizations.of(context);
              return Scaffold(
                body: Column(
                  children: [
                    Text(loc.navHome),
                    Text(loc.navSchedule),
                    Text(loc.navServices),
                  ],
                ),
              );
            },
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Schedule'), findsOneWidget);
      expect(find.text('Services'), findsOneWidget);
    });
  });
}


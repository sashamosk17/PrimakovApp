import React, { useState } from "react";
import type { Schedule, Lesson, Subject, User, TeacherAssignment } from "../types";

interface ScheduleViewProps {
  schedules: Schedule[];
  subjects: Subject[];
  teachers: User[];
  assignments: TeacherAssignment[];
  onSubstituteTeacher: (scheduleId: string, lessonId: string, newTeacherId: string, comment?: string) => Promise<void>;
  onAddLesson: (lessonData: {
    scheduleId: string;
    subject: string;
    teacherId: string;
    startTime: string;
    endTime: string;
    roomNumber: string;
    floor?: number;
    homeworkDescription?: string;
  }) => Promise<void>;
  onCreateSubject: (name: string, description?: string) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onAssignTeacher: (teacherId: string, subjectId: string) => Promise<void>;
  onRemoveAssignment: (teacherId: string, subjectId: string) => Promise<void>;
  onTriggerPushAlerts: () => Promise<{ sentCount: number; checkedCount: number }>;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  subjects,
  teachers,
  assignments,
  onSubstituteTeacher,
  onAddLesson,
  onCreateSubject,
  onDeleteSubject,
  onAssignTeacher,
  onRemoveAssignment,
  onTriggerPushAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<"schedules" | "subjects" | "assignments">("schedules");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [searchSubject, setSearchSubject] = useState("");

  // Modals state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedLessonForSub, setSelectedLessonForSub] = useState<{ scheduleId: string; lesson: Lesson } | null>(null);
  const [subTeacherId, setSubTeacherId] = useState("");
  const [subComment, setSubComment] = useState("");

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjDesc, setNewSubjDesc] = useState("");

  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [targetScheduleId, setTargetScheduleId] = useState(schedules[0]?.id || "");
  const [newLessonSubject, setNewLessonSubject] = useState(subjects[0]?.name || "Математика");
  const [newLessonTeacherId, setNewLessonTeacherId] = useState(teachers[0]?.id || "");
  const [newLessonStart, setNewLessonStart] = useState("09:00");
  const [newLessonEnd, setNewLessonEnd] = useState("09:45");
  const [newLessonRoom, setNewLessonRoom] = useState("301");
  const [newLessonFloor, setNewLessonFloor] = useState(3);
  const [newLessonHw, setNewLessonHw] = useState("");

  // Teacher Assignment selection
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<string>(teachers[0]?.id || "");
  const [selectedSubjectForAssign, setSelectedSubjectForAssign] = useState<string>(subjects[0]?.id || "");

  // Status banners
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [isProcessingPush, setIsProcessingPush] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter schedules
  const availableGroups = Array.from(new Set(schedules.map((s) => s.groupId)));
  const filteredSchedules = selectedGroup === "ALL"
    ? schedules
    : schedules.filter((s) => s.groupId === selectedGroup);

  // Filter subjects
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchSubject.toLowerCase()))
  );

  const getTeacherName = (teacherId: string) => {
    const t = teachers.find((u) => u.id === teacherId);
    return t ? `${t.firstName} ${t.lastName}` : teacherId;
  };

  const handleOpenSubstituteModal = (scheduleId: string, lesson: Lesson) => {
    setSelectedLessonForSub({ scheduleId, lesson });
    setSubTeacherId(teachers.find((t) => t.id !== lesson.teacherId)?.id || teachers[0]?.id || "");
    setSubComment("Замена по болезни");
    setIsSubModalOpen(true);
    setActionError(null);
  };

  const handleSubmitSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonForSub || !subTeacherId) return;

    try {
      await onSubstituteTeacher(
        selectedLessonForSub.scheduleId,
        selectedLessonForSub.lesson.id,
        subTeacherId,
        subComment
      );
      setIsSubModalOpen(false);
      setSelectedLessonForSub(null);
    } catch (err: any) {
      setActionError(err.message || "Ошибка при оформлении замены");
    }
  };

  const handleCreateSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    try {
      await onCreateSubject(newSubjName.trim(), newSubjDesc.trim());
      setIsAddSubjectOpen(false);
      setNewSubjName("");
      setNewSubjDesc("");
    } catch (err: any) {
      setActionError(err.message || "Ошибка при создании предмета");
    }
  };

  const handleAddLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetScheduleId || !newLessonSubject || !newLessonTeacherId) return;

    try {
      await onAddLesson({
        scheduleId: targetScheduleId,
        subject: newLessonSubject,
        teacherId: newLessonTeacherId,
        startTime: newLessonStart,
        endTime: newLessonEnd,
        roomNumber: newLessonRoom,
        floor: newLessonFloor,
        homeworkDescription: newLessonHw.trim() || undefined,
      });
      setIsAddLessonOpen(false);
    } catch (err: any) {
      setActionError(err.message || "Ошибка при добавлении урока");
    }
  };

  const handleTriggerPush = async () => {
    setIsProcessingPush(true);
    setPushStatusMessage(null);
    setActionError(null);
    try {
      const res = await onTriggerPushAlerts();
      setPushStatusMessage(
        `Воркер успешно отработал! Проверено дедлайнов: ${res.checkedCount}, отправлено push-уведомлений: ${res.sentCount} (алерты за 24 ч и 2 ч).`
      );
    } catch (err: any) {
      setActionError(err.message || "Ошибка запуска воркера пушей");
    } finally {
      setIsProcessingPush(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
            Расписание и Предметы
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Конструктор учебных дисциплин (миграция 020), матрица учителей и оперативное управление заменами
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerPush}
            disabled={isProcessingPush}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm text-red-700">notifications_active</span>
            {isProcessingPush ? "Проверка дедлайнов..." : "Запустить Push-воркер"}
          </button>

          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="px-4 py-2.5 bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-primary">add_circle</span>
            Новый предмет
          </button>

          <button
            onClick={() => {
              if (schedules.length > 0) setTargetScheduleId(schedules[0].id);
              setIsAddLessonOpen(true);
            }}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">schedule</span>
            Добавить урок
          </button>
        </div>
      </div>

      {/* Push Status Banner */}
      {pushStatusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>{pushStatusMessage}</span>
          </div>
          <button
            onClick={() => setPushStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-between text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("schedules")}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "schedules"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          Расписание и Замены
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {schedules.reduce((acc, s) => acc + s.lessons.length, 0)} уроков
          </span>
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "subjects"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-sm">book</span>
          Справочник предметов (020)
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {subjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "assignments"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-sm">assignment_ind</span>
          Назначения учителей
        </button>
      </div>

      {/* TAB 1: SCHEDULES & SUBSTITUTIONS */}
      {activeTab === "schedules" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
                Класс:
              </span>
              <button
                onClick={() => setSelectedGroup("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGroup === "ALL"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Все классы
              </button>
              {availableGroups.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGroup === grp
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Отображается расписаний: {filteredSchedules.length}
            </div>
          </div>

          {/* Schedule List */}
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">event_busy</span>
              <p className="text-sm font-semibold">Расписание не найдено для выбранных параметров</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-red-50 text-red-900 font-extrabold rounded-lg text-sm">
                        Класс {schedule.groupId}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Дата: {schedule.date}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setTargetScheduleId(schedule.id);
                        setIsAddLessonOpen(true);
                      }}
                      className="text-xs font-bold text-primary hover:text-red-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Добавить урок в этот день
                    </button>
                  </div>

                  {schedule.lessons.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">Нет уроков в этом расписании</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {schedule.lessons.map((lesson) => {
                        const isSubstituted = lesson.homeworkDescription?.includes("[Замена:");
                        return (
                          <div
                            key={lesson.id}
                            className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-24 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg text-center">
                                {lesson.startTime} — {lesson.endTime}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-800">
                                    {lesson.subject}
                                  </span>
                                  {isSubstituted && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-full animate-pulse">
                                      Замена
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px] text-slate-400">person</span>
                                    {getTeacherName(lesson.teacherId)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px] text-slate-400">meeting_room</span>
                                    Кабинет {lesson.room} (этаж {lesson.floor || 1})
                                  </span>
                                </div>

                                {lesson.homeworkDescription && (
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    {lesson.homeworkDescription}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenSubstituteModal(schedule.id, lesson)}
                              className="px-3 py-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                            >
                              <span className="material-symbols-outlined text-xs">published_with_changes</span>
                              Оформить замену
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBJECTS CATALOG (MIGRATION 020) */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Поиск предмета..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Всего дисциплин в каталоге: {subjects.length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="text-base font-bold text-slate-800">{sub.name}</h4>
                    <button
                      onClick={() => onDeleteSubject(sub.id)}
                      title="Удалить предмет"
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                    {sub.description || "Описание учебной дисциплины не заполнено."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>UUID: {sub.id.slice(0, 8)}...</span>
                  <span>{new Date(sub.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEACHER ASSIGNMENTS MATRIX */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* Quick Assign Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">person_add</span>
              Закрепить преподавателя за предметом
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Преподаватель
                </label>
                <select
                  value={selectedTeacherForAssign}
                  onChange={(e) => setSelectedTeacherForAssign(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Предмет
                </label>
                <select
                  value={selectedSubjectForAssign}
                  onChange={(e) => setSelectedSubjectForAssign(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={async () => {
                  if (!selectedTeacherForAssign || !selectedSubjectForAssign) return;
                  await onAssignTeacher(selectedTeacherForAssign, selectedSubjectForAssign);
                }}
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-red-800 transition-colors shadow-sm cursor-pointer"
              >
                Закрепить дисциплину
              </button>
            </div>
          </div>

          {/* Matrix of Teachers and their assigned subjects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((teacher) => {
              const teacherAssignments = assignments.filter((a) => a.teacherId === teacher.id);
              return (
                <div
                  key={teacher.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-900 font-extrabold flex items-center justify-center text-sm">
                      {teacher.firstName[0]}
                      {teacher.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {teacher.firstName} {teacher.lastName}
                      </h4>
                      <p className="text-xs text-slate-400">{teacher.email}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Закрепленные дисциплины:
                    </p>
                    {teacherAssignments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Нет назначенных предметов</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {teacherAssignments.map((a) => (
                          <span
                            key={a.subjectId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                          >
                            {a.subjectName || subjects.find((s) => s.id === a.subjectId)?.name || a.subjectId}
                            <button
                              onClick={() => onRemoveAssignment(teacher.id, a.subjectId)}
                              title="Открепить"
                              className="text-slate-400 hover:text-red-700 ml-1 cursor-pointer font-bold"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: SUBSTITUTE TEACHER */}
      {isSubModalOpen && selectedLessonForSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">published_with_changes</span>
                Оформление замены урока
              </h4>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div>
                <span className="text-slate-400">Предмет:</span>{" "}
                <span className="font-bold text-slate-700">{selectedLessonForSub.lesson.subject}</span>
              </div>
              <div>
                <span className="text-slate-400">Время и кабинет:</span>{" "}
                <span className="font-semibold text-slate-700">
                  {selectedLessonForSub.lesson.startTime} - {selectedLessonForSub.lesson.endTime} (каб. {selectedLessonForSub.lesson.room})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Основной преподаватель:</span>{" "}
                <span className="font-semibold text-slate-700">
                  {getTeacherName(selectedLessonForSub.lesson.teacherId)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitSubstitute} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Преподаватель на замену:
                </label>
                <select
                  value={subTeacherId}
                  onChange={(e) => setSubTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                >
                  {teachers
                    .filter((t) => t.id !== selectedLessonForSub.lesson.teacherId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Причина / Примечание:
                </label>
                <input
                  type="text"
                  value={subComment}
                  onChange={(e) => setSubComment(e.target.value)}
                  placeholder="Например: Больничный лист"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  Подтвердить замену
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Новый учебный предмет
              </h4>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubjectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Название предмета:
                </label>
                <input
                  type="text"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="Например: Астрономия и астрофизика"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Описание:
                </label>
                <textarea
                  value={newSubjDesc}
                  onChange={(e) => setNewSubjDesc(e.target.value)}
                  placeholder="Краткое описание курса..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  Создать предмет
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LESSON */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">schedule</span>
                Добавление урока в расписание
              </h4>
              <button
                onClick={() => setIsAddLessonOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Расписание / Класс:
                </label>
                <select
                  value={targetScheduleId}
                  onChange={(e) => setTargetScheduleId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      Класс {s.groupId} ({s.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Предмет:
                </label>
                <select
                  value={newLessonSubject}
                  onChange={(e) => setNewLessonSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Преподаватель:
                </label>
                <select
                  value={newLessonTeacherId}
                  onChange={(e) => setNewLessonTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Начало</label>
                  <input
                    type="time"
                    value={newLessonStart}
                    onChange={(e) => setNewLessonStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Конец</label>
                  <input
                    type="time"
                    value={newLessonEnd}
                    onChange={(e) => setNewLessonEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Кабинет</label>
                  <input
                    type="text"
                    value={newLessonRoom}
                    onChange={(e) => setNewLessonRoom(e.target.value)}
                    placeholder="301"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Этаж</label>
                  <input
                    type="number"
                    value={newLessonFloor}
                    onChange={(e) => setNewLessonFloor(Number(e.target.value))}
                    min={1}
                    max={5}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Домашнее задание (необязательно)
                </label>
                <input
                  type="text"
                  value={newLessonHw}
                  onChange={(e) => setNewLessonHw(e.target.value)}
                  placeholder="Параграф 5, упр. 12"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  Сохранить урок
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


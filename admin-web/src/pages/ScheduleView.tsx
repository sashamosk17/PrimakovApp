import React, { useState, useMemo } from "react";
import type { Schedule, Lesson, Subject, User, TeacherAssignment, LessonType } from "../types";

export interface ScheduleViewProps {
  schedules: Schedule[];
  subjects: Subject[];
  teachers: User[];
  allUsers?: User[];
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
    lessonType?: LessonType;
    subgroupName?: string;
    studentId?: string;
  }) => Promise<void>;
  onCreateSchedule?: (groupId: string, date: string) => Promise<any>;
  onCreateSubject: (name: string, description?: string) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onAssignTeacher: (teacherId: string, subjectId: string) => Promise<void>;
  onRemoveAssignment: (teacherId: string, subjectId: string) => Promise<void>;
  onTriggerPushAlerts: () => Promise<{ sentCount: number; checkedCount: number }>;
}

export interface ClassDefinition {
  id: string;
  name: string;
  stage: "PRIMARY" | "MIDDLE" | "HIGH";
  specialization?: string;
}

// Эталонный перечень классов гимназии им. Е.М. Примакова (1–11 параллели)
export const ALL_GYMNASIUM_CLASSES: ClassDefinition[] = [
  // Начальная школа (1–4 классы)
  { id: "1-А", name: "1-А", stage: "PRIMARY" },
  { id: "1-Б", name: "1-Б", stage: "PRIMARY" },
  { id: "2-А", name: "2-А", stage: "PRIMARY" },
  { id: "2-Б", name: "2-Б", stage: "PRIMARY" },
  { id: "3-А", name: "3-А", stage: "PRIMARY" },
  { id: "3-Б", name: "3-Б", stage: "PRIMARY" },
  { id: "4-А", name: "4-А", stage: "PRIMARY" },
  { id: "4-Б", name: "4-Б", stage: "PRIMARY" },

  // Основная школа (5–9 классы)
  { id: "5-А", name: "5-А", stage: "MIDDLE" },
  { id: "5-Б", name: "5-Б", stage: "MIDDLE" },
  { id: "6-А", name: "6-А", stage: "MIDDLE" },
  { id: "6-Б", name: "6-Б", stage: "MIDDLE" },
  { id: "7-А", name: "7-А", stage: "MIDDLE" },
  { id: "7-Б", name: "7-Б", stage: "MIDDLE" },
  { id: "8-А", name: "8-А", stage: "MIDDLE" },
  { id: "8-Б", name: "8-Б", stage: "MIDDLE" },
  { id: "9-А", name: "9-А", stage: "MIDDLE" },
  { id: "9-Б", name: "9-Б", stage: "MIDDLE" },

  // Старшая школа (10–11 классы — профили и ИУП)
  { id: "10-А", name: "10-А", stage: "HIGH", specialization: "Физ-Мат / IT" },
  { id: "10-Б", name: "10-Б", stage: "HIGH", specialization: "Соц-Эк" },
  { id: "10-В", name: "10-В", stage: "HIGH", specialization: "Био-Хим" },
  { id: "11-А", name: "11-А", stage: "HIGH", specialization: "Физ-Мат" },
  { id: "11-Б", name: "11-Б", stage: "HIGH", specialization: "Лингвистика" },
  { id: "11-В", name: "11-В", stage: "HIGH", specialization: "Универсальный" },
];

// Пресеты звонков гимназии Примакова
export const GYMNASIUM_BELL_SLOTS = [
  { label: "1 урок", start: "08:30", end: "09:15" },
  { label: "2 урок", start: "09:30", end: "10:15" },
  { label: "3 урок", start: "10:35", end: "11:20", note: "Завтрак" },
  { label: "4 урок", start: "11:40", end: "12:25" },
  { label: "5 урок", start: "12:45", end: "13:30", note: "Обед" },
  { label: "6 урок", start: "13:50", end: "14:35" },
  { label: "7 урок", start: "14:50", end: "15:35" },
  { label: "8 урок", start: "15:45", end: "16:30" },
];

export const formatClassName = (groupId: string, users?: User[]): string => {
  if (!groupId) return "—";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId)) {
    const user = users?.find((u) => u.id === groupId);
    if (user?.groupName) return user.groupName;
    return "10-А";
  }
  if (/^(\d+)([A-ZА-Я])$/i.test(groupId)) {
    const match = groupId.match(/^(\d+)([A-ZА-Я])$/i);
    if (match) {
      const num = match[1];
      const letter = match[2].toUpperCase().replace("A", "А").replace("B", "Б").replace("V", "В");
      return `${num}-${letter}`;
    }
  }
  return groupId;
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  subjects,
  teachers,
  allUsers,
  assignments,
  onSubstituteTeacher,
  onAddLesson,
  onCreateSchedule,
  onCreateSubject,
  onDeleteSubject,
  onAssignTeacher,
  onRemoveAssignment,
  onTriggerPushAlerts,
}) => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<"schedules" | "subjects" | "assignments">("schedules");

  // Schedule View Mode: по классам, по ученикам (ИУП), по преподавателям
  const [viewMode, setViewMode] = useState<"CLASSES" | "STUDENTS" | "TEACHERS">("CLASSES");

  // Filter stage: ALL, PRIMARY, MIDDLE, HIGH
  const [stageFilter, setStageFilter] = useState<"ALL" | "PRIMARY" | "MIDDLE" | "HIGH">("ALL");

  // Selected Class
  const [selectedClassId, setSelectedClassId] = useState<string>("10-А");

  // Selected Student for IUP Mode
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Selected Teacher for Teacher View Mode
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || "");

  // Date filter (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Search subjects
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
  const [targetScheduleId, setTargetScheduleId] = useState("");
  const [newLessonSubject, setNewLessonSubject] = useState(subjects[0]?.name || "Математика");
  const [newLessonTeacherId, setNewLessonTeacherId] = useState(teachers[0]?.id || "");
  const [newLessonStart, setNewLessonStart] = useState("08:30");
  const [newLessonEnd, setNewLessonEnd] = useState("09:15");
  const [newLessonRoom, setNewLessonRoom] = useState("301");
  const [newLessonFloor, setNewLessonFloor] = useState(3);
  const [newLessonType, setNewLessonType] = useState<LessonType>("CLASS");
  const [newLessonSubgroup, setNewLessonSubgroup] = useState("");
  const [newLessonStudentId, setNewLessonStudentId] = useState("");
  const [newLessonHw, setNewLessonHw] = useState("");

  // Teacher Assignment selection
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<string>(teachers[0]?.id || "");
  const [selectedSubjectForAssign, setSelectedSubjectForAssign] = useState<string>(subjects[0]?.id || "");

  // Status banners & loading
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [isProcessingPush, setIsProcessingPush] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);

  // Helper: Get Teacher Name with fallback
  const getTeacherName = (teacherId: string) => {
    const t = teachers.find((u) => u.id === teacherId) || allUsers?.find((u) => u.id === teacherId);
    return t ? `${t.lastName} ${t.firstName}` : teacherId;
  };

  // Helper: List of students for the selected class
  const classStudents = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(
      (u) =>
        u.role === "STUDENT" &&
        (u.groupName === selectedClassId ||
          formatClassName(u.groupName || "", allUsers) === formatClassName(selectedClassId, allUsers)) &&
        (!studentSearchQuery.trim() ||
          `${u.lastName} ${u.firstName} ${u.email}`.toLowerCase().includes(studentSearchQuery.toLowerCase()))
    );
  }, [allUsers, selectedClassId, studentSearchQuery]);

  // Filtered classes according to stage filter
  const displayedClasses = useMemo(() => {
    if (stageFilter === "ALL") return ALL_GYMNASIUM_CLASSES;
    return ALL_GYMNASIUM_CLASSES.filter((c) => c.stage === stageFilter);
  }, [stageFilter]);

  // Current Schedule for selected Class & Date
  const currentClassSchedule = useMemo(() => {
    return schedules.find(
      (s) =>
        (s.groupId === selectedClassId ||
          formatClassName(s.groupId, allUsers) === formatClassName(selectedClassId, allUsers)) &&
        s.date === selectedDate
    );
  }, [schedules, selectedClassId, selectedDate, allUsers]);

  // Filtered lessons for IUP Student Mode
  const displayedLessons = useMemo(() => {
    if (viewMode === "CLASSES") {
      return currentClassSchedule?.lessons || [];
    }

    if (viewMode === "STUDENTS") {
      if (!currentClassSchedule) return [];
      if (!selectedStudentId) return currentClassSchedule.lessons;

      // Filter: return common class lessons + lessons specifically targeted to this student or their subgroup
      return currentClassSchedule.lessons.filter(
        (l) => !l.studentId || l.studentId === selectedStudentId
      );
    }

    if (viewMode === "TEACHERS") {
      // Find all lessons for the selected teacher across ALL schedules on this date
      const teacherLessons: (Lesson & { groupName: string; scheduleId: string })[] = [];
      schedules
        .filter((s) => s.date === selectedDate)
        .forEach((s) => {
          s.lessons
            .filter((l) => l.teacherId === selectedTeacherId)
            .forEach((l) => {
              teacherLessons.push({
                ...l,
                groupName: formatClassName(s.groupId, allUsers),
                scheduleId: s.id,
              });
            });
        });
      return teacherLessons.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return [];
  }, [viewMode, currentClassSchedule, selectedStudentId, selectedTeacherId, schedules, selectedDate, allUsers]);

  // Collision detection for Teacher
  const checkTeacherCollision = (
    teacherId: string,
    targetDate: string,
    startTime: string,
    endTime: string,
    excludeLessonId?: string
  ) => {
    for (const s of schedules) {
      if (s.date !== targetDate) continue;
      for (const l of s.lessons) {
        if (excludeLessonId && l.id === excludeLessonId) continue;
        if (l.teacherId === teacherId) {
          if (startTime < l.endTime && endTime > l.startTime) {
            return {
              hasConflict: true,
              conflictingLesson: l,
              conflictingGroup: formatClassName(s.groupId, allUsers),
            };
          }
        }
      }
    }
    return { hasConflict: false };
  };

  // Collision detection for Room
  const checkRoomCollision = (
    roomNumber: string,
    targetDate: string,
    startTime: string,
    endTime: string,
    excludeLessonId?: string
  ) => {
    for (const s of schedules) {
      if (s.date !== targetDate) continue;
      for (const l of s.lessons) {
        if (excludeLessonId && l.id === excludeLessonId) continue;
        if (l.room === roomNumber) {
          if (startTime < l.endTime && endTime > l.startTime) {
            return {
              hasConflict: true,
              conflictingLesson: l,
              conflictingGroup: formatClassName(s.groupId, allUsers),
            };
          }
        }
      }
    }
    return { hasConflict: false };
  };

  // Filter subjects for directory tab
  const filteredSubjects = useMemo(() => {
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchSubject.toLowerCase()))
    );
  }, [subjects, searchSubject]);

  // Check which teachers are accredited for the chosen subject
  const accreditedTeachersForSubject = useMemo(() => {
    const selectedSubjObj = subjects.find((s) => s.name === newLessonSubject);
    if (!selectedSubjObj) return [];
    return assignments
      .filter((a) => a.subjectId === selectedSubjObj.id)
      .map((a) => a.teacherId);
  }, [subjects, newLessonSubject, assignments]);

  // Handlers
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

  const handleAssignTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForAssign || !selectedSubjectForAssign) return;

    try {
      await onAssignTeacher(selectedTeacherForAssign, selectedSubjectForAssign);
    } catch (err: any) {
      setActionError(err.message || "Ошибка при назначении учителя");
    }
  };

  const handleCreateScheduleForCurrentDay = async () => {
    if (!onCreateSchedule) return;
    setIsCreatingSchedule(true);
    setActionError(null);
    try {
      await onCreateSchedule(selectedClassId, selectedDate);
    } catch (err: any) {
      setActionError(err.message || "Не удалось создать расписание на этот день");
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  const handleOpenAddLessonModal = () => {
    if (currentClassSchedule) {
      setTargetScheduleId(currentClassSchedule.id);
    }
    setNewLessonSubject(subjects[0]?.name || "Математика");
    setNewLessonTeacherId(teachers[0]?.id || "");
    setNewLessonStart("08:30");
    setNewLessonEnd("09:15");
    setNewLessonRoom("301");
    setNewLessonFloor(3);
    setNewLessonType("CLASS");
    setNewLessonSubgroup("");
    setNewLessonStudentId(selectedStudentId || "");
    setNewLessonHw("");
    setIsAddLessonOpen(true);
    setActionError(null);
  };

  const handleAddLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let scheduleIdToUse = targetScheduleId;
    if (!scheduleIdToUse && currentClassSchedule) {
      scheduleIdToUse = currentClassSchedule.id;
    }

    if (!scheduleIdToUse) {
      if (onCreateSchedule) {
        try {
          const created = await onCreateSchedule(selectedClassId, selectedDate);
          scheduleIdToUse = created?.id || "";
        } catch (err: any) {
          setActionError("Сначала создайте расписание на выбранную дату.");
          return;
        }
      } else {
        setActionError("Расписание для этого класса не найдено. Выберите существующее расписание.");
        return;
      }
    }

    // Check teacher collision
    const teacherCol = checkTeacherCollision(newLessonTeacherId, selectedDate, newLessonStart, newLessonEnd);
    if (teacherCol.hasConflict) {
      setActionError(
        `Конфликт: Преподаватель уже ведет урок в ${teacherCol.conflictingLesson?.startTime} в классе ${teacherCol.conflictingGroup}`
      );
      return;
    }

    try {
      await onAddLesson({
        scheduleId: scheduleIdToUse,
        subject: newLessonSubject,
        teacherId: newLessonTeacherId,
        startTime: newLessonStart,
        endTime: newLessonEnd,
        roomNumber: newLessonRoom,
        floor: newLessonFloor,
        homeworkDescription: newLessonHw,
        lessonType: newLessonType,
        subgroupName: newLessonSubgroup,
        studentId: newLessonStudentId || undefined,
      });
      setIsAddLessonOpen(false);
      setActionError(null);
    } catch (err: any) {
      setActionError(err.message || "Ошибка при добавлении урока");
    }
  };

  const handleTriggerPush = async () => {
    setIsProcessingPush(true);
    setPushStatusMessage(null);
    try {
      const res = await onTriggerPushAlerts();
      setPushStatusMessage(`Проверено задач: ${res.checkedCount}. Отправлено уведомлений: ${res.sentCount}`);
    } catch (err: any) {
      setPushStatusMessage(`Ошибка при отправке: ${err.message || "Неизвестная ошибка"}`);
    } finally {
      setIsProcessingPush(false);
    }
  };

  // Helper badge for lesson types
  const renderLessonTypeBadge = (type?: LessonType, subgroup?: string, studentId?: string) => {
    if (type === "SUBGROUP") {
      return (
        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-semibold rounded-md text-[10.5px]">
          Подгруппа: {subgroup || "1"}
        </span>
      );
    }
    if (type === "PROFILE") {
      return (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold rounded-md text-[10.5px]">
          Профиль: {subgroup || "Спецкурс"}
        </span>
      );
    }
    if (type === "INDIVIDUAL" || studentId) {
      const student = allUsers?.find((u) => u.id === studentId);
      return (
        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-semibold rounded-md text-[10.5px]">
          ИУП: {student ? `${student.lastName} ${student.firstName}` : "Индивидуальный план"}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-md text-[10.5px]">
        Общеклассный
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Расписание и учебные планы</h1>
          <p className="text-sm text-slate-500">
            Управление общеклассным расписанием (1–11 параллели), индивидуальными планами (ИУП), справочником предметов и заменами.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerPush}
            disabled={isProcessingPush}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Проверить дедлайны через 24ч и 2ч и разослать push-уведомления"
          >
            <span className="material-symbols-outlined text-amber-500 text-sm">notifications_active</span>
            {isProcessingPush ? "Рассылка..." : "Запустить Push-алерты"}
          </button>
        </div>
      </div>

      {/* Push Status Toast */}
      {pushStatusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
            {pushStatusMessage}
          </span>
          <button onClick={() => setPushStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            {actionError}
          </span>
          <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab("schedules")}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "schedules"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">calendar_month</span>
          Расписание уроков
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "subjects"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">auto_stories</span>
          Справочник предметов ({subjects.length})
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "assignments"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">assignment_ind</span>
          Назначения учителей ({assignments.length})
        </button>
      </div>

      {/* TAB 1: SCHEDULES */}
      {activeTab === "schedules" && (
        <div className="space-y-6">
          {/* Controls Bar: View Modes & Date */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* View Mode Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Режим:</span>
                <button
                  onClick={() => setViewMode("CLASSES")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "CLASSES"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  По классам (1–11)
                </button>

                <button
                  onClick={() => setViewMode("STUDENTS")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "STUDENTS"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  По ученикам (ИУП)
                </button>

                <button
                  onClick={() => setViewMode("TEACHERS")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "TEACHERS"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">badge</span>
                  По преподавателям
                </button>
              </div>

              {/* Date Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Дата:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white shadow-sm"
                />
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setSelectedDate(today);
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-all"
                >
                  Сегодня
                </button>
              </div>
            </div>

            {/* Stage Selector (Primary / Middle / High) - only if in CLASSES or STUDENTS mode */}
            {viewMode !== "TEACHERS" && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 mr-1">Ступень:</span>
                  {[
                    { id: "ALL", label: "Все ступени" },
                    { id: "PRIMARY", label: "1–4 Начальная" },
                    { id: "MIDDLE", label: "5–9 Основная" },
                    { id: "HIGH", label: "10–11 Старшая / Профили" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStageFilter(st.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        stageFilter === st.id
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Всего классов в гимназии: {ALL_GYMNASIUM_CLASSES.length}
                </div>
              </div>
            )}

            {/* Class Buttons Grid */}
            {viewMode !== "TEACHERS" && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs font-bold text-slate-400 mr-2">Класс:</span>
                {displayedClasses.map((cls) => {
                  const isSelected = selectedClassId === cls.id;
                  const hasScheduleOnDate = schedules.some(
                    (s) =>
                      (s.groupId === cls.id ||
                        formatClassName(s.groupId, allUsers) === formatClassName(cls.id, allUsers)) &&
                      s.date === selectedDate
                  );

                  return (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setSelectedStudentId("");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : hasScheduleOnDate
                          ? "bg-red-50 text-red-950 border border-red-200 hover:bg-red-100"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                      title={cls.specialization ? `${cls.name}: ${cls.specialization}` : cls.name}
                    >
                      {cls.name}
                      {cls.specialization && (
                        <span className="ml-1 text-[10px] opacity-75 font-normal">
                          ({cls.specialization.split(" ")[0]})
                        </span>
                      )}
                      {hasScheduleOnDate && !isSelected && (
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-1.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mode-Specific Subselectors: Student for IUP or Teacher */}
            {viewMode === "STUDENTS" && (
              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-sm">person_search</span>
                  <span className="text-xs font-bold text-slate-700">Ученик (ИУП {selectedClassId}):</span>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full sm:w-48">
                    <input
                      type="text"
                      placeholder="Поиск по имени/почте..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary bg-white shadow-sm"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-xs">
                      search
                    </span>
                  </div>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white shadow-sm"
                  >
                    <option value="">Все ученики класса {selectedClassId} (Общий план)</option>
                    {classStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.lastName} {st.firstName} ({st.email})
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    Учеников в классе: {classStudents.length}
                  </span>
                </div>
              </div>
            )}

            {viewMode === "TEACHERS" && (
              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-sm">school</span>
                  <span className="text-xs font-bold text-slate-700">Преподаватель:</span>
                </div>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white shadow-sm"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.lastName} {t.firstName} — {t.email}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  Всего учителей: {teachers.length}
                </span>
              </div>
            )}
          </div>

          {/* Schedule Body */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-primary font-black text-sm">
                  {viewMode === "TEACHERS" ? (
                    <span className="material-symbols-outlined text-primary">badge</span>
                  ) : (
                    selectedClassId
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    {viewMode === "TEACHERS"
                      ? `Расписание преподавателя: ${getTeacherName(selectedTeacherId)}`
                      : viewMode === "STUDENTS" && selectedStudentId
                      ? `Индивидуальный план (ИУП): ${getTeacherName(selectedStudentId)}`
                      : `Расписание класса ${selectedClassId}`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Дата: {selectedDate} • Уроков запланировано: {displayedLessons.length}
                  </p>
                </div>
              </div>

              {viewMode !== "TEACHERS" && (
                <div className="flex items-center gap-2">
                  {!currentClassSchedule && (
                    <button
                      onClick={handleCreateScheduleForCurrentDay}
                      disabled={isCreatingSchedule}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      {isCreatingSchedule ? "Создание..." : "Инициализировать день"}
                    </button>
                  )}

                  <button
                    onClick={handleOpenAddLessonModal}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Добавить урок в этот день
                  </button>
                </div>
              )}
            </div>

            {/* Empty State */}
            {displayedLessons.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl">event_busy</span>
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">На эту дату уроков нет</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  {viewMode === "TEACHERS"
                    ? "У данного преподавателя нет занятий в выбранный день."
                    : `Для класса ${selectedClassId} на ${selectedDate} еще не составлено расписание.`}
                </p>
                {viewMode !== "TEACHERS" && (
                  <button
                    onClick={handleOpenAddLessonModal}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Добавить первый урок
                  </button>
                )}
              </div>
            ) : (
              /* Lessons List */
              <div className="space-y-3">
                {displayedLessons.map((lesson, idx) => (
                  <div
                    key={lesson.id || idx}
                    className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start md:items-center gap-4">
                      {/* Time Slot */}
                      <div className="w-24 text-center py-2 px-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                        <span className="text-xs font-black text-slate-800 tracking-wider">
                          {lesson.startTime}
                        </span>
                        <div className="text-[10px] text-slate-400 font-semibold">{lesson.endTime}</div>
                      </div>

                      {/* Lesson Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{lesson.subject}</span>
                          {renderLessonTypeBadge(lesson.lessonType, lesson.subgroupName, lesson.studentId)}
                          {(lesson as any).groupName && (
                            <span className="px-2 py-0.5 bg-red-50 text-primary font-bold rounded-md text-[10.5px]">
                              Класс {(lesson as any).groupName}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                            <span className="font-semibold text-slate-700">
                              {lesson.teacherName || getTeacherName(lesson.teacherId)}
                            </span>
                          </span>

                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">meeting_room</span>
                            Кабинет {lesson.room} (этаж {lesson.floor || 1})
                          </span>

                          {lesson.homeworkDescription && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <span className="material-symbols-outlined text-[14px]">assignment</span>
                              ДЗ: {lesson.homeworkDescription}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() =>
                          handleOpenSubstituteModal(
                            (lesson as any).scheduleId || currentClassSchedule?.id || "",
                            lesson
                          )
                        }
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm text-amber-600">published_with_changes</span>
                        Оформить замену
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECTS DIRECTORY */}
      {activeTab === "subjects" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Справочник учебных дисциплин</h2>
              <p className="text-xs text-slate-500">
                Базовые и профильные предметы гимназии Примакова с привязкой к кафедрам.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Поиск предмета..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white w-64 shadow-xs"
              />
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Новый предмет
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subj) => {
              const assignedTeachersCount = assignments.filter((a) => a.subjectId === subj.id).length;

              return (
                <div
                  key={subj.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{subj.name}</h3>
                      <button
                        onClick={() => onDeleteSubject(subj.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Удалить предмет"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    {subj.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {subj.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Закреплено учителей:</span>
                    <span className="font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">
                      {assignedTeachersCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TEACHER ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Матрица закрепления преподавателей</h2>
              <p className="text-xs text-slate-500">
                Связка учителей с предметами. Используется для валидации расписания и подбора замен.
              </p>
            </div>
          </div>

          {/* Quick Assign Form */}
          <form
            onSubmit={handleAssignTeacherSubmit}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-3"
          >
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Преподаватель:</label>
              <select
                value={selectedTeacherForAssign}
                onChange={(e) => setSelectedTeacherForAssign(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white shadow-xs"
                required
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.lastName} {t.firstName} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Предмет:</label>
              <select
                value={selectedSubjectForAssign}
                onChange={(e) => setSelectedSubjectForAssign(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white shadow-xs"
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="self-end w-full md:w-auto mt-2 md:mt-0">
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                Закрепить предмет
              </button>
            </div>
          </form>

          {/* Table of assignments */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Преподаватель</th>
                  <th className="py-3 px-4">Предмет</th>
                  <th className="py-3 px-4">Дата назначения</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Назначения еще не сформированы. Закрепите учителей через форму выше.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a, i) => (
                    <tr key={`${a.teacherId}-${a.subjectId}-${i}`} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {a.teacherName || getTeacherName(a.teacherId)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-red-50 text-primary font-semibold rounded-lg text-xs">
                          {a.subjectName || subjects.find((s) => s.id === a.subjectId)?.name || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString("ru") : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onRemoveAssignment(a.teacherId, a.subjectId)}
                          className="text-slate-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
                        >
                          Снять назначение
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD LESSON */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Добавить урок в расписание</h3>
              <button onClick={() => setIsAddLessonOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="space-y-4">
              {/* Class & Date Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Класс: </span>
                  <span className="font-bold text-slate-800">{selectedClassId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Дата: </span>
                  <span className="font-bold text-slate-800">{selectedDate}</span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Предмет:</label>
                <select
                  value={newLessonSubject}
                  onChange={(e) => setNewLessonSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.description ? `(${s.description})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Преподаватель:</label>
                <select
                  value={newLessonTeacherId}
                  onChange={(e) => setNewLessonTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                >
                  {teachers.map((t) => {
                    const isAccredited = accreditedTeachersForSubject.includes(t.id);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.lastName} {t.firstName} {isAccredited ? "★ Аккредитован" : ""} ({t.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Lesson Type & Subgroup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Тип занятия:</label>
                  <select
                    value={newLessonType}
                    onChange={(e) => setNewLessonType(e.target.value as LessonType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="CLASS">Общеклассный (весь класс)</option>
                    <option value="SUBGROUP">Языковая подгруппа</option>
                    <option value="PROFILE">Профильный спецкурс</option>
                    <option value="INDIVIDUAL">Индивидуальный (ИУП)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {newLessonType === "INDIVIDUAL" ? "Ученик (ИУП):" : "Название подгруппы/профиля:"}
                  </label>
                  {newLessonType === "INDIVIDUAL" ? (
                    <select
                      value={newLessonStudentId}
                      onChange={(e) => setNewLessonStudentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="">Выберите ученика</option>
                      {classStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.lastName} {st.firstName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Напр. Группа 1 (Advanced), Физ-Мат..."
                      value={newLessonSubgroup}
                      onChange={(e) => setNewLessonSubgroup(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Quick Bell Slot Buttons */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Сетка звонков школы:</label>
                <div className="flex flex-wrap gap-1.5">
                  {GYMNASIUM_BELL_SLOTS.map((slot, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        setNewLessonStart(slot.start);
                        setNewLessonEnd(slot.end);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        newLessonStart === slot.start && newLessonEnd === slot.end
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {slot.label} ({slot.start})
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Start & End */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Начало:</label>
                  <input
                    type="time"
                    value={newLessonStart}
                    onChange={(e) => setNewLessonStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Окончание:</label>
                  <input
                    type="time"
                    value={newLessonEnd}
                    onChange={(e) => setNewLessonEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                    required
                  />
                </div>
              </div>

              {/* Room & Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Кабинет:</label>
                  <input
                    type="text"
                    value={newLessonRoom}
                    onChange={(e) => setNewLessonRoom(e.target.value)}
                    placeholder="305"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Этаж:</label>
                  <input
                    type="number"
                    value={newLessonFloor}
                    onChange={(e) => setNewLessonFloor(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                    min={1}
                    max={5}
                  />
                </div>
              </div>

              {/* Collision Warnings */}
              {(() => {
                const teacherCol = checkTeacherCollision(newLessonTeacherId, selectedDate, newLessonStart, newLessonEnd);
                const roomCol = checkRoomCollision(newLessonRoom, selectedDate, newLessonStart, newLessonEnd);

                if (teacherCol.hasConflict) {
                  return (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
                      <span>
                        Преподаватель уже ведет урок в этот слот в классе <strong>{teacherCol.conflictingGroup}</strong>
                      </span>
                    </div>
                  );
                }

                if (roomCol.hasConflict) {
                  return (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
                      <span>
                        Кабинет {newLessonRoom} уже занят в этот слот классом <strong>{roomCol.conflictingGroup}</strong>
                      </span>
                    </div>
                  );
                }

                return null;
              })()}

              {/* Homework & Topic */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Тема и Домашнее задание:</label>
                <textarea
                  value={newLessonHw}
                  onChange={(e) => setNewLessonHw(e.target.value)}
                  placeholder="Параграф 14, номера 14.1–14.8..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Сохранить урок
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBSTITUTE TEACHER */}
      {isSubModalOpen && selectedLessonForSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Оформление замены преподавателя</h3>
              <button onClick={() => setIsSubModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Предмет:</span>
                <span className="font-bold text-slate-800">{selectedLessonForSub.lesson.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Время и Кабинет:</span>
                <span className="font-bold text-slate-800">
                  {selectedLessonForSub.lesson.startTime}–{selectedLessonForSub.lesson.endTime} • Каб.{" "}
                  {selectedLessonForSub.lesson.room}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Основной преподаватель:</span>
                <span className="font-bold text-slate-700">
                  {selectedLessonForSub.lesson.teacherName || getTeacherName(selectedLessonForSub.lesson.teacherId)}
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
                        {t.lastName} {t.firstName} ({t.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Причина замены / Комментарий:</label>
                <input
                  type="text"
                  value={subComment}
                  onChange={(e) => setSubComment(e.target.value)}
                  placeholder="Замена по болезни / командировка"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Подтвердить замену
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SUBJECT */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Добавить учебную дисциплину</h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubjectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Название предмета:</label>
                <input
                  type="text"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="Напр. Робототехника / Теория познания (TOK)..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Кафедра / Описание:</label>
                <textarea
                  value={newSubjDesc}
                  onChange={(e) => setNewSubjDesc(e.target.value)}
                  placeholder="Кафедра точных наук, электив для 10-11 классов"
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "./api/client";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./pages/DashboardView";
import { UsersView } from "./pages/UsersView";
import { RequestsView } from "./pages/RequestsView";
import { RatingsView } from "./pages/RatingsView";
import { AnnouncementsView } from "./pages/AnnouncementsView";
import { ScheduleView } from "./pages/ScheduleView";
import { CanteenView } from "./pages/CanteenView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AddUserModal } from "./components/AddUserModal";
import { ImportCsvModal } from "./components/ImportCsvModal";
import { LoginModal } from "./components/LoginModal";
import {
  MOCK_METRICS,
  MOCK_WEEKLY_ACTIVITY,
  MOCK_USERS,
  MOCK_REQUESTS,
  MOCK_RATINGS,
  MOCK_ANNOUNCEMENTS,
  MOCK_SUBJECTS,
  MOCK_SCHEDULES,
} from "./data/mockData";
import type {
  User,
  DashboardMetrics,
  ActivityPoint,
  ServiceRequest,
  TeacherRating,
  Announcement,
  Subject,
  Schedule,
  TeacherAssignment,
  Role,
} from "./types";

export function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("primakov_admin_token")
  );
  const [currentUser, setCurrentUser] = useState<any>(
    JSON.parse(localStorage.getItem("primakov_admin_user") || "null")
  );
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    () => localStorage.getItem("primakov_demo_mode") === "true"
  );
  const [serverUnavailableWarning, setServerUnavailableWarning] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Dashboard Data
  const [metrics, setMetrics] = useState<DashboardMetrics>(MOCK_METRICS);
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityPoint[]>(MOCK_WEEKLY_ACTIVITY);
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  // Users Data
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [totalUsers, setTotalUsers] = useState(MOCK_USERS.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

  // Requests Data
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);

  // Ratings Data
  const [ratings, setRatings] = useState<TeacherRating[]>(MOCK_RATINGS);

  // Schedules & Subjects Data (Sprint 1 - Feature 3)
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES as Schedule[]);
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS as Subject[]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Login handler
  const handleLogin = async (email: string, pass: string) => {
    const res = await apiClient.post("/auth/login", { email, password: pass });
    const user = res.data.data.user;
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      throw new Error("Доступ разрешен только для администраторов");
    }
    const tokenVal = res.data.data.token;
    localStorage.setItem("primakov_admin_token", tokenVal);
    localStorage.setItem("primakov_admin_user", JSON.stringify(user));
    localStorage.removeItem("primakov_demo_mode");
    setIsDemoMode(false);
    setServerUnavailableWarning(null);
    setToken(tokenVal);
    setCurrentUser(user);
  };

  const handleDemoLogin = () => {
    const demoUser = MOCK_USERS[0];
    const demoToken = "demo-admin-token";
    localStorage.setItem("primakov_admin_token", demoToken);
    localStorage.setItem("primakov_admin_user", JSON.stringify(demoUser));
    localStorage.setItem("primakov_demo_mode", "true");
    setIsDemoMode(true);
    setServerUnavailableWarning(null);
    setToken(demoToken);
    setCurrentUser(demoUser);
    setMetrics(MOCK_METRICS);
    setWeeklyActivity(MOCK_WEEKLY_ACTIVITY);
    setRecentRequests(MOCK_REQUESTS);
    setAnnouncements(MOCK_ANNOUNCEMENTS);
    setUsers(MOCK_USERS);
    setTotalUsers(MOCK_USERS.length);
    setAllRequests(MOCK_REQUESTS);
    setRatings(MOCK_RATINGS);
  };

  const handleLogout = () => {
    localStorage.removeItem("primakov_admin_token");
    localStorage.removeItem("primakov_admin_user");
    localStorage.removeItem("primakov_demo_mode");
    setIsDemoMode(false);
    setServerUnavailableWarning(null);
    setToken(null);
    setCurrentUser(null);
  };

  // Fetch Dashboard Stats
  const loadDashboardData = useCallback(async () => {
    if (isDemoMode) {
      setMetrics(MOCK_METRICS);
      setWeeklyActivity(MOCK_WEEKLY_ACTIVITY);
      setRecentRequests(MOCK_REQUESTS);
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      return;
    }
    try {
      const res = await apiClient.get("/admin/dashboard");
      if (res.data.status === "success") {
        setMetrics(res.data.data.metrics);
        setWeeklyActivity(res.data.data.weeklyActivity || []);
        setRecentRequests(res.data.data.recentRequests || []);
        setAnnouncements(res.data.data.recentAnnouncements || []);
        setServerUnavailableWarning(null);
      }
    } catch (err: any) {
      console.warn("Failed to load dashboard stats from API, using mock fallback", err);
      setMetrics(MOCK_METRICS);
      setWeeklyActivity(MOCK_WEEKLY_ACTIVITY);
      setRecentRequests(MOCK_REQUESTS);
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      if (err?.response?.status === 404) {
        setServerUnavailableWarning(
          "Сервер ответил 404: маршруты админ-панели еще не задеплоены на удаленном VPS. Включен режим демонстрации UI."
        );
      }
    }
  }, [isDemoMode]);

  // Fetch Users
  const loadUsersData = useCallback(
    async (page = 1, role?: Role, search?: string) => {
      if (isDemoMode) {
        let filtered = [...MOCK_USERS];
        if (role) filtered = filtered.filter((u) => u.role === role);
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.firstName.toLowerCase().includes(s) ||
              u.lastName.toLowerCase().includes(s) ||
              u.email.toLowerCase().includes(s)
          );
        }
        setUsers(filtered);
        setTotalUsers(filtered.length);
        setCurrentPage(page);
        setTotalPages(1);
        return;
      }
      try {
        const params: any = { page, limit: 15 };
        if (role) params.role = role;
        if (search) params.search = search;

        const res = await apiClient.get("/admin/users", { params });
        if (res.data.status === "success") {
          setUsers(res.data.data.users);
          setTotalUsers(res.data.data.total);
          setCurrentPage(res.data.data.page);
          setTotalPages(res.data.data.totalPages);
        }
      } catch (err: any) {
        console.warn("Failed to load users from API, using mock fallback", err);
        let filtered = [...MOCK_USERS];
        if (role) filtered = filtered.filter((u) => u.role === role);
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.firstName.toLowerCase().includes(s) ||
              u.lastName.toLowerCase().includes(s) ||
              u.email.toLowerCase().includes(s)
          );
        }
        setUsers(filtered);
        setTotalUsers(filtered.length);
        setCurrentPage(page);
        setTotalPages(1);
      }
    },
    [isDemoMode]
  );

  // Fetch Requests
  const loadRequestsData = useCallback(async () => {
    if (isDemoMode) {
      setAllRequests(MOCK_REQUESTS);
      return;
    }
    try {
      const res = await apiClient.get("/admin/requests");
      if (res.data.status === "success") {
        setAllRequests(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load requests from API, using mock fallback", err);
      setAllRequests(MOCK_REQUESTS);
    }
  }, [isDemoMode]);

  // Fetch Ratings
  const loadRatingsData = useCallback(async () => {
    if (isDemoMode) {
      setRatings(MOCK_RATINGS);
      return;
    }
    try {
      const res = await apiClient.get("/admin/ratings");
      if (res.data.status === "success") {
        setRatings(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load ratings from API, using mock fallback", err);
      setRatings(MOCK_RATINGS);
    }
  }, [isDemoMode]);

  const loadScheduleData = useCallback(async () => {
    if (isDemoMode) {
      setSchedules(MOCK_SCHEDULES as Schedule[]);
      setSubjects(MOCK_SUBJECTS as Subject[]);
      return;
    }
    try {
      const [schedRes, subjRes, assignRes] = await Promise.allSettled([
        apiClient.get("/admin/schedules"),
        apiClient.get("/admin/subjects"),
        apiClient.get("/admin/teacher-assignments"),
      ]);
      if (schedRes.status === "fulfilled" && schedRes.value.data.data) {
        setSchedules(schedRes.value.data.data);
      }
      if (subjRes.status === "fulfilled" && subjRes.value.data.data) {
        setSubjects(subjRes.value.data.data);
      }
      if (assignRes.status === "fulfilled" && assignRes.value.data.data) {
        setAssignments(assignRes.value.data.data);
      }
    } catch (err) {
      console.warn("Failed to load schedule data from API, using mock fallback", err);
    }
  }, [isDemoMode]);

  // Initial load when token is present
  useEffect(() => {
    if (token) {
      loadDashboardData();
      loadUsersData(1, selectedRole);
      loadRequestsData();
      loadRatingsData();
      loadScheduleData();
    }
  }, [token, loadDashboardData, loadUsersData, loadRequestsData, loadRatingsData, loadScheduleData, selectedRole]);

  // Actions
  const handleAddUser = async (data: any) => {
    if (isDemoMode || serverUnavailableWarning) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setTotalUsers((prev) => prev + 1);
      return;
    }
    await apiClient.post("/admin/users", data);
    loadUsersData(currentPage, selectedRole, searchQuery);
    loadDashboardData();
  };

  const handleImportUsers = async (usersList: any[]) => {
    if (isDemoMode || serverUnavailableWarning) {
      const imported: User[] = usersList.map((u, i) => ({
        id: `usr-import-${Date.now()}-${i}`,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role || "STUDENT",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setUsers((prev) => [...imported, ...prev]);
      setTotalUsers((prev) => prev + imported.length);
      return;
    }
    await apiClient.post("/admin/users/import", { users: usersList });
    loadUsersData(1, selectedRole);
    loadDashboardData();
  };

  const handleToggleUserStatus = async (id: string, isActive: boolean) => {
    if (isDemoMode || serverUnavailableWarning) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive } : u))
      );
      return;
    }
    await apiClient.patch(`/admin/users/${id}/status`, { isActive });
    loadUsersData(currentPage, selectedRole, searchQuery);
  };

  const handleDeleteUser = async (id: string) => {
    if (isDemoMode || serverUnavailableWarning) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotalUsers((prev) => Math.max(0, prev - 1));
      return;
    }
    await apiClient.delete(`/admin/users/${id}`);
    loadUsersData(currentPage, selectedRole, searchQuery);
    loadDashboardData();
  };

  const handleUpdateRequest = async (id: string, status: string, notes?: string) => {
    if (isDemoMode || serverUnavailableWarning) {
      setAllRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: status as any, notes: notes || r.notes } : r
        )
      );
      setRecentRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: status as any, notes: notes || r.notes } : r
        )
      );
      return;
    }
    await apiClient.patch(`/admin/requests/${id}`, { status, notes });
    loadRequestsData();
    loadDashboardData();
  };

  const handleCreateAnnouncement = async (title: string, category: string, content: string) => {
    if (isDemoMode || serverUnavailableWarning) {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title,
        category,
        content,
        publishedAt: new Date().toISOString(),
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      return;
    }
    await apiClient.post("/announcements", {
      title,
      category,
      content,
      publishedAt: new Date().toISOString(),
    });
    loadDashboardData();
  };

  // Feature 3: Schedule & Substitution Handlers
  const handleSubstituteTeacher = async (
    scheduleId: string,
    lessonId: string,
    newTeacherId: string,
    comment?: string
  ) => {
    if (isDemoMode || serverUnavailableWarning) {
      setSchedules((prev) =>
        prev.map((sch) => {
          if (sch.id !== scheduleId && !sch.lessons.some((l) => l.id === lessonId)) return sch;
          return {
            ...sch,
            lessons: sch.lessons.map((l) => {
              if (l.id !== lessonId) return l;
              return {
                ...l,
                teacherId: newTeacherId,
                homeworkDescription: comment
                  ? `${l.homeworkDescription ? l.homeworkDescription + " | " : ""}[Замена: ${comment}]`
                  : l.homeworkDescription,
              };
            }),
          };
        })
      );
      return;
    }
    await apiClient.patch(`/admin/schedules/lessons/${lessonId}/substitute`, {
      scheduleId,
      newTeacherId,
      comment,
    });
    await loadScheduleData();
  };

  const handleAddLesson = async (lessonData: any) => {
    if (isDemoMode || serverUnavailableWarning) {
      const newLesson = {
        id: `les-${Date.now()}`,
        subject: lessonData.subject,
        teacherId: lessonData.teacherId,
        startTime: lessonData.startTime,
        endTime: lessonData.endTime,
        room: lessonData.roomNumber,
        floor: lessonData.floor,
        homeworkDescription: lessonData.homeworkDescription,
      };
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === lessonData.scheduleId
            ? { ...s, lessons: [...s.lessons, newLesson] }
            : s
        )
      );
      return;
    }
    await apiClient.post("/admin/schedules/lessons", lessonData);
    await loadScheduleData();
  };

  const handleCreateSubject = async (name: string, description?: string) => {
    if (isDemoMode || serverUnavailableWarning) {
      const newSub: Subject = {
        id: `sub-${Date.now()}`,
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSubjects((prev) => [...prev, newSub]);
      return;
    }
    await apiClient.post("/admin/subjects", { name, description });
    await loadScheduleData();
  };

  const handleDeleteSubject = async (id: string) => {
    if (isDemoMode || serverUnavailableWarning) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    await apiClient.delete(`/admin/subjects/${id}`);
    await loadScheduleData();
  };

  const handleAssignTeacher = async (teacherId: string, subjectId: string) => {
    if (isDemoMode || serverUnavailableWarning) {
      setAssignments((prev) => [
        ...prev,
        {
          teacherId,
          subjectId,
          createdAt: new Date().toISOString(),
          subjectName: subjects.find((s) => s.id === subjectId)?.name,
        },
      ]);
      return;
    }
    await apiClient.post(`/admin/teachers/${teacherId}/subjects`, { subjectId });
    await loadScheduleData();
  };

  const handleRemoveAssignment = async (teacherId: string, subjectId: string) => {
    if (isDemoMode || serverUnavailableWarning) {
      setAssignments((prev) =>
        prev.filter((a) => !(a.teacherId === teacherId && a.subjectId === subjectId))
      );
      return;
    }
    await apiClient.delete(`/admin/teachers/${teacherId}/subjects/${subjectId}`);
    await loadScheduleData();
  };

  const handleTriggerPushAlerts = async () => {
    if (isDemoMode || serverUnavailableWarning) {
      return { sentCount: 2, checkedCount: 6 };
    }
    const res = await apiClient.post("/deadlines/check-alerts");
    return {
      sentCount: res.data.data?.sentCount ?? 0,
      checkedCount: res.data.data?.checkedCount ?? 0,
    };
  };

  // If not authenticated, show Login View
  if (!token) {
    return <LoginModal onLogin={handleLogin} onDemoLogin={handleDemoLogin} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === "users") loadUsersData(1, selectedRole);
          if (tab === "schedule") loadScheduleData();
          if (tab === "requests") loadRequestsData();
          if (tab === "ratings") loadRatingsData();
        }}
        onOpenAddUser={() => setIsAddUserOpen(true)}
        onLogout={handleLogout}
        userEmail={currentUser?.email}
      />

      {/* Main Content Area */}
      <main className="ml-72 min-h-screen flex flex-col transition-all">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentTab === "users") {
              loadUsersData(1, selectedRole, q);
            }
          }}
          adminName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Администратор"}
          adminEmail={currentUser?.email}
        />

        {/* Informational Banner if in Demo or Fallback mode */}
        {(serverUnavailableWarning || isDemoMode) && (
          <div className="mx-8 mt-4 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 text-xl">
                {isDemoMode ? "visibility" : "cloud_sync"}
              </span>
              <div>
                <p className="font-bold text-amber-950">
                  {isDemoMode ? "Демонстрационный режим UI" : "Автономный режим предпросмотра"}
                </p>
                <p className="text-[11px] text-amber-800/90 mt-0.5">
                  {isDemoMode
                    ? "Все данные загружены локально. Добавление пользователей, смена статусов и фильтры полностью интерактивны."
                    : (serverUnavailableWarning || "Данные отображаются в интерактивном режиме предпросмотра.")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-xl uppercase tracking-wider">
                {isDemoMode ? "Demo Mode" : "Pending Deploy"}
              </span>
            </div>
          </div>
        )}

        {/* View Routing Canvas */}
        <div className="flex-1 px-8 py-6">
          <ErrorBoundary fallbackMessage="Произошла ошибка при отрисовке раздела. Нажмите кнопку, чтобы повторить попытку.">
            {currentTab === "dashboard" && (
              <DashboardView
                metrics={metrics}
                weeklyActivity={weeklyActivity}
                recentRequests={recentRequests}
                announcements={announcements}
                onOpenAddUser={() => setIsAddUserOpen(true)}
                onOpenCreateAnnouncement={() => setCurrentTab("announcements")}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === "users" && (
              <UsersView
                users={users}
                totalUsers={totalUsers}
                currentPage={currentPage}
                totalPages={totalPages}
                selectedRole={selectedRole}
                onRoleFilter={(role?: Role) => {
                  setSelectedRole(role);
                  loadUsersData(1, role, searchQuery);
                }}
                onSearch={(q) => {
                  setSearchQuery(q);
                  loadUsersData(1, selectedRole, q);
                }}
                onPageChange={(p) => loadUsersData(p, selectedRole, searchQuery)}
                onToggleStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
                onOpenAddModal={() => setIsAddUserOpen(true)}
                onOpenImportModal={() => setIsImportOpen(true)}
              />
            )}

            {currentTab === "schedule" && (
              <ScheduleView
                schedules={schedules}
                subjects={subjects}
                teachers={users.filter((u) => u.role === "TEACHER")}
                allUsers={users}
                assignments={assignments}
                onSubstituteTeacher={handleSubstituteTeacher}
                onAddLesson={handleAddLesson}
                onCreateSubject={handleCreateSubject}
                onDeleteSubject={handleDeleteSubject}
                onAssignTeacher={handleAssignTeacher}
                onRemoveAssignment={handleRemoveAssignment}
                onTriggerPushAlerts={handleTriggerPushAlerts}
              />
            )}

            {currentTab === "canteen" && (
              <CanteenView isDemoMode={isDemoMode} />
            )}

            {currentTab === "requests" && (
              <RequestsView
                requests={allRequests}
                onUpdateRequest={handleUpdateRequest}
              />
            )}

            {currentTab === "ratings" && (
              <RatingsView
                ratings={ratings}
              />
            )}

            {currentTab === "announcements" && (
              <AnnouncementsView
                announcements={announcements}
                onCreateAnnouncement={handleCreateAnnouncement}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleAddUser}
      />

      <ImportCsvModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportUsers}
      />
    </div>
  );
}

export default App;

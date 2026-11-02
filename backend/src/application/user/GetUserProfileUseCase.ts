import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { Result } from "../../shared/Result";
import { Role } from "../../shared/types";

export interface GetUserProfileInput {
  targetUserId: string;
  date?: string;
}

export interface LessonProfileDTO {
  id: string;
  subject: string;
  teacherId: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  room: string;
  floor: number;
  hasHomework: boolean;
  homeworkDescription?: string;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  groupName?: string;
  birthDate?: string;
  phone?: string;
  telegram?: string;
  vkId?: string;
  createdAt: string;
  updatedAt: string;
  todayLessons: LessonProfileDTO[];
}

export class GetUserProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly scheduleRepository: IScheduleRepository
  ) {}

  public async execute(input: GetUserProfileInput): Promise<Result<UserProfileDTO>> {
    try {
      if (!input.targetUserId) {
        return Result.fail("User ID is required");
      }

      const userResult = await this.userRepository.findById(input.targetUserId);
      if (userResult.isFailure || !userResult.value) {
        return Result.fail("Пользователь не найден (User not found)");
      }

      const user = userResult.value;
      const targetDate = input.date ? new Date(input.date) : new Date();

      // Retrieve lessons for this user on the target date
      let todayLessons: LessonProfileDTO[] = [];

      try {
        if (user.isStudent() && user.groupName) {
          // Normalise group name (e.g. "10-А" -> "10A" or match directly)
          const normGroup = user.groupName.replace("-", "").toUpperCase();
          const scheduleResult = await this.scheduleRepository.getScheduleByDate(normGroup, targetDate);
          
          if (scheduleResult.isSuccess && scheduleResult.value) {
            todayLessons = scheduleResult.value.lessons.map((l) => ({
              id: l.id,
              subject: l.subject,
              teacherId: l.teacherId,
              teacherName: l.teacherName,
              startTime: l.timeSlot.startTime,
              endTime: l.timeSlot.endTime,
              room: l.room.number,
              floor: l.room.floor,
              hasHomework: l.hasHomework,
              homeworkDescription: l.homeworkDescription,
            }));
          } else {
            // Fallback via userId
            const userSchedResult = await this.scheduleRepository.getScheduleByUserId(user.id, targetDate);
            if (userSchedResult.isSuccess && userSchedResult.value) {
              todayLessons = userSchedResult.value.lessons.map((l) => ({
                id: l.id,
                subject: l.subject,
                teacherId: l.teacherId,
                teacherName: l.teacherName,
                startTime: l.timeSlot.startTime,
                endTime: l.timeSlot.endTime,
                room: l.room.number,
                floor: l.room.floor,
                hasHomework: l.hasHomework,
                homeworkDescription: l.homeworkDescription,
              }));
            }
          }
        } else if (user.isTeacher()) {
          // For teachers, search lessons across schedules where teacher matches
          const allSchedulesResult = await this.scheduleRepository.getAll();
          if (allSchedulesResult.isSuccess && allSchedulesResult.value) {
            const allLessons: LessonProfileDTO[] = [];
            for (const sched of allSchedulesResult.value) {
              for (const l of sched.lessons) {
                if (
                  l.teacherId === user.id ||
                  (l.teacherName && (l.teacherName.includes(user.lastName) || l.teacherName.includes(user.firstName)))
                ) {
                  allLessons.push({
                    id: l.id,
                    subject: l.subject,
                    teacherId: l.teacherId,
                    teacherName: l.teacherName || `${user.lastName} ${user.firstName}`,
                    startTime: l.timeSlot.startTime,
                    endTime: l.timeSlot.endTime,
                    room: l.room.number,
                    floor: l.room.floor,
                    hasHomework: l.hasHomework,
                    homeworkDescription: l.homeworkDescription,
                  });
                }
              }
            }
            todayLessons = allLessons;
          }
        }
      } catch (err) {
        // If schedule fetch fails, return empty lessons without crashing profile
        console.warn("Could not load user schedule for profile:", err);
      }

      const profile: UserProfileDTO = {
        id: user.id,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.lastName} ${user.firstName}`,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
        groupName: user.groupName,
        birthDate: user.birthDate,
        phone: user.phone,
        telegram: user.telegram,
        vkId: user.vkId,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        todayLessons,
      };

      return Result.ok(profile);
    } catch (error) {
      console.error("Error in GetUserProfileUseCase:", error);
      return Result.fail(error instanceof Error ? error.message : "Failed to get user profile");
    }
  }
}

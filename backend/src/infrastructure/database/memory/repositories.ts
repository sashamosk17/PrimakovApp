import { MockScheduleRepository } from "./MockScheduleRepository";
import { MockDeadlineRepository } from "./MockDeadlineRepository";
import { MockAnnouncementRepository } from "./MockAnnouncementRepository";
import { MockStoryRepository } from "./MockStoryRepository";
import { MockUserRepository } from "./MockUserRepository";
import { MockRatingRepository } from "./MockRatingRepository";

export const scheduleRepository = new MockScheduleRepository();
export const deadlineRepository = new MockDeadlineRepository();
export const announcementRepository = new MockAnnouncementRepository();
export const storyRepository = new MockStoryRepository();
export const userRepository = new MockUserRepository();
export const ratingRepository = new MockRatingRepository();

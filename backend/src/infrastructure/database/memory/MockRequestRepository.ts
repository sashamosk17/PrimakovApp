import {
  IRequestRepository,
  Request,
  RequestPriority,
  RequestStatus,
  RequestType,
} from "../../../domain/repositories/IRequestRepository";
import { Result } from "../../../shared/Result";

export class MockRequestRepository implements IRequestRepository {
  private requests: Request[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const now = new Date();
    this.requests = [
      {
        id: "req-1",
        type: "IT",
        title: "Не работает проектор в 101",
        description: "Проектор не включается с пульта",
        status: "PENDING",
        priority: "HIGH",
        creatorId: "user-1",
        roomId: "room-101",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "req-2",
        type: "MAINTENANCE",
        title: "Сломан стул в 201",
        description: "У стула сломана ножка",
        status: "IN_PROGRESS",
        priority: "LOW",
        creatorId: "user-2",
        assigneeId: "user-1",
        roomId: "room-201",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "req-3",
        type: "CLEANING",
        title: "Уборка после лабораторной",
        description: "Требуется влажная уборка в 202",
        status: "COMPLETED",
        priority: "MEDIUM",
        creatorId: "user-1",
        assigneeId: "user-2",
        roomId: "room-202",
        createdAt: now,
        updatedAt: now,
        completedAt: now,
      },
    ];
  }

  async getAll(): Promise<Result<Request[]>> {
    return Result.ok(this.requests);
  }

  async getById(id: string): Promise<Result<Request | null>> {
    const req = this.requests.find((r) => r.id === id);
    return Result.ok(req || null);
  }

  async getByCreator(creatorId: string): Promise<Result<Request[]>> {
    return Result.ok(this.requests.filter((r) => r.creatorId === creatorId));
  }

  async getByAssignee(assigneeId: string): Promise<Result<Request[]>> {
    return Result.ok(this.requests.filter((r) => r.assigneeId === assigneeId));
  }

  async getByStatus(status: RequestStatus): Promise<Result<Request[]>> {
    return Result.ok(this.requests.filter((r) => r.status === status));
  }

  async getByType(type: RequestType): Promise<Result<Request[]>> {
    return Result.ok(this.requests.filter((r) => r.type === type));
  }

  async getByRoom(roomId: string): Promise<Result<Request[]>> {
    return Result.ok(this.requests.filter((r) => r.roomId === roomId));
  }

  async getActive(): Promise<Result<Request[]>> {
    return Result.ok(
      this.requests.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED")
    );
  }

  async save(request: Request): Promise<Result<void>> {
    this.requests.push(request);
    return Result.ok();
  }

  async update(request: Request): Promise<Result<void>> {
    const index = this.requests.findIndex((r) => r.id === request.id);
    if (index >= 0) {
      this.requests[index] = { ...this.requests[index], ...request, updatedAt: new Date() };
    } else {
      this.requests.push(request);
    }
    return Result.ok();
  }
}


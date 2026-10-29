import { Result } from "../../shared/Result";

export type RequestType = "IT" | "MAINTENANCE" | "CLEANING";
export type RequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Request {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  creatorId: string;
  assigneeId?: string;
  roomId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface IRequestRepository {
  getAll?(): Promise<Result<Request[]>>;
  getById(id: string): Promise<Result<Request | null>>;
  getByCreator(creatorId: string): Promise<Result<Request[]>>;
  getByAssignee(assigneeId: string): Promise<Result<Request[]>>;
  getByStatus(status: RequestStatus): Promise<Result<Request[]>>;
  getByType(type: RequestType): Promise<Result<Request[]>>;
  getByRoom(roomId: string): Promise<Result<Request[]>>;
  getActive(): Promise<Result<Request[]>>;
  save(request: Request): Promise<Result<void>>;
  update(request: Request): Promise<Result<void>>;
}


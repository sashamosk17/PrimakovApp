import { Request, Response } from "express";
import { IRoomRepository } from "../../domain/repositories/IRoomRepository";
import { GetAllRoomsUseCase } from "../../application/room/GetAllRoomsUseCase";
import { GetRoomByNumberUseCase } from "../../application/room/GetRoomByNumberUseCase";
import { GetRoomsByBuildingUseCase } from "../../application/room/GetRoomsByBuildingUseCase";
import { GetRoomsByFloorUseCase } from "../../application/room/GetRoomsByFloorUseCase";

export class RoomController {
  constructor(private repository: IRoomRepository) { }

  getAll = async (req: Request, res: Response) => {
    const useCase = new GetAllRoomsUseCase(this.repository);
    const result = await useCase.execute();

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  getByNumber = async (req: Request, res: Response) => {
    const { number } = req.params;
    const useCase = new GetRoomByNumberUseCase(this.repository);
    const result = await useCase.execute(number);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    if (!result.value) {
      return res.status(404).json({
        status: "error",
        error: { message: "Room not found" },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  getByBuilding = async (req: Request, res: Response) => {
    const { building } = req.params;
    const useCase = new GetRoomsByBuildingUseCase(this.repository);
    const result = await useCase.execute(building);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  getByFloor = async (req: Request, res: Response) => {
    const { building, floor } = req.params;
    const floorNumber = parseInt(floor, 10);

    if (isNaN(floorNumber)) {
      return res.status(400).json({
        status: "error",
        error: { message: "Invalid floor number" },
      });
    }

    const useCase = new GetRoomsByFloorUseCase(this.repository);
    const result = await useCase.execute(building, floorNumber);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };
}

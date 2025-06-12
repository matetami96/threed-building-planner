import { Vector2 } from "three";
import BoqBuildingFlat from "./models/BoqBuildingFlat";
import BoqBuildingHipped from "./models/BoqBuildingHipped";
import BoqBuildingSaddle from "./models/BoqBuildingSaddle";

export type BoqBuilding = BoqBuildingFlat | BoqBuildingSaddle | BoqBuildingHipped;
export type BuildingWithLocation = BoqBuilding & {
	location?: { lat: number; lng: number };
	hasClosedLoopSystem?: boolean;
	closingPointIndex?: number;
	segments?: { from: Vector2; to: Vector2; length: number }[];
	obstacles?: RooftopObstacleType[];
};

export type RooftopObstacleType = {
	id: string;
	position: [number, number, number];
	scale: [number, number, number];
};

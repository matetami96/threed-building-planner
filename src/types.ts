import BoqBuildingFlat from "./models/BoqBuildingFlat";
import BoqBuildingHipped from "./models/BoqBuildingHipped";
import BoqBuildingSaddle from "./models/BoqBuildingSaddle";

export type BoqBuilding = BoqBuildingFlat | BoqBuildingSaddle | BoqBuildingHipped;
export type BuildingWithLocation = BoqBuilding & {
	location?: { lat: number; lng: number };
};

import BoqBuilding from "./BoqBuilding";

class BoqBuildingFlat extends BoqBuilding {
	constructor(
		public roofType: string = "flat",
		public buildingWidth: number = 0.5,
		public buildingHeight: number = 0.2,
		public buildingLength: number = 0.5, // depth
		public buildingPosition: [number, number, number] = [0, 0, 0],
		public buildingRotation: [number, number, number] = [0, 0, 0]
	) {
		super(roofType, buildingWidth, buildingHeight, buildingLength, buildingPosition, buildingRotation);
	}
}

export default BoqBuildingFlat;

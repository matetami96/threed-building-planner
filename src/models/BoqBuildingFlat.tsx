import BoqBuilding from "./BoqBuilding";

class BoqBuildingFlat extends BoqBuilding {
	constructor(
		public groupPosition: [number, number, number] = [0, 0, 0],
		public groupRotation: [number, number, number] = [0, 0, 0],
		public buildingPosition: [number, number, number] = [0, 0, 0],
		public buildingRotation: [number, number, number] = [0, 0, 0],
		public roofType: string = "flat",
		public buildingWidth: number = 10,
		public buildingHeight: number = 5,
		public buildingLength: number = 10
	) {
		super(roofType, buildingWidth, buildingHeight, buildingLength, buildingPosition, buildingRotation);
	}
}

export default BoqBuildingFlat;

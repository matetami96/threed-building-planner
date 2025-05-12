import BoqBuilding from "./BoqBuilding";

class BoqBuildingHipped extends BoqBuilding {
	constructor(
		public groupPosition: [number, number, number] = [0, -0.148, 0],
		public buildingPosition: [number, number, number] = [0, 0.15, 0],
		public roofType: string = "hipped",
		public buildingWidth: number = 0.5,
		public buildingHeight: number = 0.3,
		public buildingLength: number = 0.5, // depth
		public roofPosition: [number, number, number] = [0, 0.4, 0],
		public roofRotation: [number, number, number] = [0, Math.PI / 4, 0],
		public roofRadius: number = 0.35,
		public roofHeight: number = 0.2,
		public roofSegments: number = 4
	) {
		super(roofType, buildingWidth, buildingHeight, buildingLength, buildingPosition, [0, 0, 0]);
	}
}

export default BoqBuildingHipped;

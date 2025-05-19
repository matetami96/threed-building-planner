import BoqBuilding from "./BoqBuilding";

class BoqBuildingSaddle extends BoqBuilding {
	constructor(
		public groupPosition: [number, number, number] = [0, 0, 0],
		public groupRotation: [number, number, number] = [0, 0, 0],
		public buildingPosition: [number, number, number] = [0, 0, 0],
		public buildingRotation: [number, number, number] = [0, 0, 0],
		public roofType: string = "saddle",
		public buildingWidth: number = 0.5,
		public buildingHeight: number = 0.3,
		public buildingLength: number = 0.5, // depth
		public roofPosition: [number, number, number] = [0, 0, -0.25],
		public roofRotation: [number, number, number] = [0, 0, 0],
		public roofWidth: number = 0.5,
		public roofHeight: number = 0.4,
		public roofLength: number = 0.5
	) {
		super(roofType, buildingWidth, buildingHeight, buildingLength, buildingPosition, buildingRotation);
	}
}

export default BoqBuildingSaddle;

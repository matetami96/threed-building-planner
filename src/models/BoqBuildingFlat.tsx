import BoqBuilding from "./BoqBuilding";

class BoqBuildingFlat extends BoqBuilding {
	constructor(
		public roofType: string = "flat",
		public width: number = 0.5,
		public height: number = 0.2,
		public length: number = 0.5, // depth
		public position: [number, number, number] = [0, -0.05, 0],
		public rotation: [number, number, number] = [0, 0, 0]
	) {
		super(roofType, width, height, length, position, rotation);
	}
}

export default BoqBuildingFlat;

class BoqBuilding {
	constructor(
		public roofType: string,
		public buildingWidth: number,
		public buildingHeight: number,
		public buildingLength: number, // depth
		public buildingPosition: [number, number, number],
		public buildingRotation: [number, number, number]
	) {}
}

export default BoqBuilding;

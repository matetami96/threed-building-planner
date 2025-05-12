class BoqBuilding {
	constructor(
		public type: string,
		public width: number,
		public height: number,
		public length: number, // depth
		public position: [number, number, number],
		public rotation: [number, number, number]
	) {}
}

export default BoqBuilding;

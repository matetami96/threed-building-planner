import { RooftopObjectType } from "../types";

type RoofObjectEditorProps = {
	roofObject: RooftopObjectType;
	buildingWidth: number;
	buildingLength: number;
	buildingHeight: number;
	onUpdate: (updated: RooftopObjectType) => void;
};

const RoofObjectEditor = ({
	roofObject,
	buildingWidth,
	buildingLength,
	buildingHeight,
	onUpdate,
}: RoofObjectEditorProps) => {
	const [posX, , posZ] = roofObject.position;
	const [scaleX, scaleY, scaleZ] = roofObject.scale;

	const clampValue = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

	const updateObstacle = (key: "position" | "scale", index: number, value: number) => {
		const newObstacle = { ...roofObject };

		if (key === "position") {
			const halfW = buildingWidth / 2;
			const halfL = buildingLength / 2;
			const halfX = roofObject.scale[0] / 2;
			const halfZ = roofObject.scale[2] / 2;

			if (index === 0) value = clampValue(value, -halfW + halfX, halfW - halfX); // X
			if (index === 2) value = clampValue(value, -halfL + halfZ, halfL - halfZ); // Z

			newObstacle.position[index] = value;
			newObstacle.position[1] = buildingHeight + roofObject.scale[1] / 2;
		}

		if (key === "scale") {
			const newScale = [...newObstacle.scale];
			newScale[index] = value;

			newScale[0] = clampValue(newScale[0], 0.2, buildingWidth);
			newScale[1] = clampValue(newScale[1], 0.1, buildingHeight);
			newScale[2] = clampValue(newScale[2], 0.2, buildingLength);

			newObstacle.scale = newScale as [number, number, number];

			const halfW = buildingWidth / 2;
			const halfL = buildingLength / 2;
			const halfX = newScale[0] / 2;
			const halfZ = newScale[2] / 2;

			newObstacle.position[0] = clampValue(newObstacle.position[0], -halfW + halfX, halfW - halfX);
			newObstacle.position[2] = clampValue(newObstacle.position[2], -halfL + halfZ, halfL - halfZ);
			newObstacle.position[1] = buildingHeight + newScale[1] / 2;
		}

		onUpdate(newObstacle);
	};

	return (
		<div className="building-inputs">
			<h3>Edit Object</h3>
			<label>
				<p>Width (X):</p>
				<input
					type="number"
					value={scaleX.toFixed(2)}
					onChange={(e) => updateObstacle("scale", 0, parseFloat(e.target.value))}
				/>
			</label>
			<br />
			<label>
				<p>Height (Y):</p>
				<input
					type="number"
					value={scaleY.toFixed(2)}
					onChange={(e) => updateObstacle("scale", 1, parseFloat(e.target.value))}
				/>
			</label>
			<br />
			<label>
				<p>Length (Z):</p>
				<input
					type="number"
					value={scaleZ.toFixed(2)}
					onChange={(e) => updateObstacle("scale", 2, parseFloat(e.target.value))}
				/>
			</label>
			<br />
			<label>
				<p>Position X:</p>
				<input
					type="number"
					value={posX.toFixed(2)}
					onChange={(e) => updateObstacle("position", 0, parseFloat(e.target.value))}
				/>
			</label>
			<br />
			<label>
				<p>Position Z:</p>
				<input
					type="number"
					value={posZ.toFixed(2)}
					onChange={(e) => updateObstacle("position", 2, parseFloat(e.target.value))}
				/>
			</label>
		</div>
	);
};

export default RoofObjectEditor;

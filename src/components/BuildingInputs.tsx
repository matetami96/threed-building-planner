import BoqBuildingFlat from "../models/BoqBuildingFlat";
import BoqBuildingHipped from "../models/BoqBuildingHipped";
import BoqBuildingSaddle from "../models/BoqBuildingSaddle";

import "./BuildingInputs.css";

type BuildingInputsProps = {
	currentBuildingType: "flat" | "saddle" | "hipped";
	buildingProps: BoqBuildingFlat | BoqBuildingSaddle | BoqBuildingHipped;
	onChangeBuildingState: (key: string, value: number | number[]) => void;
};

const BuildingInputs = ({ currentBuildingType, buildingProps, onChangeBuildingState }: BuildingInputsProps) => {
	const { roofType } = buildingProps;

	const renderBuildingInputs = () => {
		if (currentBuildingType === "flat" && roofType === "flat") {
			const { buildingWidth, buildingHeight, buildingLength, buildingPosition, buildingRotation } =
				buildingProps as BoqBuildingFlat;

			return (
				<div className="building-inputs">
					<h3>Flat Building Properties</h3>
					<label>
						<p>Width:</p>
						<input
							type="number"
							step="0.1"
							value={buildingWidth}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 0 && val <= 2) {
									onChangeBuildingState("buildingWidth", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						<p>Height:</p>
						<input
							type="number"
							step="0.1"
							value={buildingHeight}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 0 && val <= 2) {
									onChangeBuildingState("buildingHeight", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						<p>Length:</p>
						<input
							type="number"
							step="0.1"
							value={buildingLength}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 0 && val <= 2) {
									onChangeBuildingState("buildingLength", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						<p>Position X:</p>
						<input
							type="number"
							step="0.1"
							value={buildingPosition[0]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("buildingPosition", [val, buildingPosition[1], buildingPosition[2]]);
							}}
						/>
					</label>
					<br />
					<label>
						<p>Position Z:</p>
						<input
							type="number"
							step="0.1"
							value={buildingPosition[2]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("buildingPosition", [buildingPosition[0], buildingPosition[1], val]);
							}}
						/>
					</label>
					<br />
					<label>
						<p>Rotation Y:</p>
						<input
							type="number"
							step="0.1"
							value={buildingRotation[1]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("buildingRotation", [buildingRotation[0], val, buildingRotation[2]]);
							}}
						/>
					</label>
				</div>
			);
		}

		if (currentBuildingType === "saddle" && roofType === "saddle") {
			const { groupPosition, groupRotation, buildingWidth, buildingHeight, buildingLength, roofHeight } =
				buildingProps as BoqBuildingSaddle;

			return (
				<div className="building-inputs">
					<h3>Saddle Building Properties</h3>
					<label>
						Group Position X:
						<input
							type="number"
							step="0.1"
							value={groupPosition[0]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("groupPosition", [val, groupPosition[1], groupPosition[2]]);
							}}
						/>
					</label>
					<br />
					<label>
						Group Position Z:
						<input
							type="number"
							step="0.1"
							value={groupPosition[2]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("groupPosition", [groupPosition[0], groupPosition[1], val]);
							}}
						/>
					</label>
					<br />
					<label>
						Group Rotation Y:
						<input
							type="number"
							step="0.1"
							value={groupRotation[1]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("groupRotation", [groupRotation[0], val, groupRotation[2]]);
							}}
						/>
					</label>
					<br />
					<label>
						Building Height:
						<input
							type="number"
							step="0.1"
							value={buildingHeight}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 0 && val <= 2) {
									onChangeBuildingState("buildingHeight", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						Roof Height:
						<input
							type="number"
							step="0.1"
							value={roofHeight}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 0 && val <= 2) {
									onChangeBuildingState("roofHeight", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						Building Width:
						<input
							type="number"
							step="0.1"
							value={buildingWidth}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 0 && val <= 2) {
									onChangeBuildingState("buildingWidth", val);
									onChangeBuildingState("roofWidth", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						Building Length:
						<input
							type="number"
							step="0.1"
							value={buildingLength}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 0 && val <= 2) {
									onChangeBuildingState("buildingLength", val);
									onChangeBuildingState("roofLength", val);
								}
							}}
						/>
					</label>
				</div>
			);
		}

		return null;
	};

	return renderBuildingInputs();
};

export default BuildingInputs;

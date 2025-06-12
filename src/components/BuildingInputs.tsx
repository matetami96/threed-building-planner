import BoqBuildingFlat from "../models/BoqBuildingFlat";
import BoqBuildingHipped from "../models/BoqBuildingHipped";
import BoqBuildingSaddle from "../models/BoqBuildingSaddle";

import "./BuildingInputs.css";

type BuildingInputsProps = {
	currentLocation: { lat: number; lng: number };
	currentBuildingType: "flat" | "saddle" | "hipped";
	buildingProps: BoqBuildingFlat | BoqBuildingSaddle | BoqBuildingHipped;
	disableInputs: boolean;
	onChangeBuildingState: (key: string, value: number | number[]) => void;
};

const BuildingInputs = ({
	currentLocation,
	currentBuildingType,
	buildingProps,
	disableInputs,
	onChangeBuildingState,
}: BuildingInputsProps) => {
	const { roofType } = buildingProps;

	const renderBuildingInputs = () => {
		if (currentBuildingType === "flat" && roofType === "flat") {
			const { buildingWidth, buildingHeight, buildingLength, buildingPosition, buildingRotation } =
				buildingProps as BoqBuildingFlat;

			return (
				<div className="building-inputs">
					<h3>Flat Building Properties</h3>
					<h4>Coordinates (lat, lng):</h4>
					<p className="coordinates">
						{currentLocation.lat}, {currentLocation.lng}
					</p>
					<label>
						<p>Width (m):</p>
						<input
							type="number"
							disabled={disableInputs}
							value={buildingWidth}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 5 && val <= 60) {
									onChangeBuildingState("buildingWidth", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						<p>Height (m):</p>
						<input
							type="number"
							disabled={disableInputs}
							value={buildingHeight}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 2 && val <= 20) {
									onChangeBuildingState("buildingHeight", val);
								}
							}}
						/>
					</label>
					<br />
					<label>
						<p>Length (m):</p>
						<input
							type="number"
							disabled={disableInputs}
							value={buildingLength}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								if (val >= 5 && val <= 60) {
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
							disabled={disableInputs}
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
							disabled={disableInputs}
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
							disabled={disableInputs}
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
					<h4>Coordinates (lat, lng):</h4>
					<p className="coordinates">
						{currentLocation.lat}, {currentLocation.lng}
					</p>
					<label>
						<p>Group Position X:</p>
						<input
							type="number"
							step="0.1"
							disabled={disableInputs}
							value={groupPosition[0]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("groupPosition", [val, groupPosition[1], groupPosition[2]]);
							}}
						/>
					</label>
					<br />
					<label>
						<p>Group Position Z:</p>
						<input
							type="number"
							step="0.1"
							disabled={disableInputs}
							value={groupPosition[2]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("groupPosition", [groupPosition[0], groupPosition[1], val]);
							}}
						/>
					</label>
					<br />
					<label>
						<p>Group Rotation Y:</p>
						<input
							type="number"
							step="0.1"
							disabled={disableInputs}
							value={groupRotation[1]}
							onChange={(e) => {
								const val = parseFloat(e.target.value);
								onChangeBuildingState("groupRotation", [groupRotation[0], val, groupRotation[2]]);
							}}
						/>
					</label>
					<br />
					<label>
						<p>Building Height:</p>
						<input
							type="number"
							step="0.1"
							disabled={disableInputs}
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
						<p>Roof Height:</p>
						<input
							type="number"
							step="0.1"
							disabled={disableInputs}
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
						<p>Building Width:</p>
						<input
							type="number"
							step="0.1"
							disabled={disableInputs}
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
						<p>Building Length:</p>
						<input
							type="number"
							step="0.1"
							disabled={disableInputs}
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

import { Euler, Matrix4, Quaternion, Vector2, Vector3 } from "three";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";
import BoqBuilding from "./models/BoqBuilding";
import { BuildingWithLocation } from "./types";
import BoqBuildingFlat from "./models/BoqBuildingFlat";
import BoqBuildingSaddle from "./models/BoqBuildingSaddle";
import BoqBuildingHipped from "./models/BoqBuildingHipped";

import { getGoogleMapImageUrl } from "./utils/mapHelpers";
import Platform from "./components/Platform";
import SearchBar from "./components/SearchBar";
import BoqBuildingRenderer from "./components/BoqBuildingRenderer";
import BuildingInputs from "./components/BuildingInputs";
import DraggablePoint from "./components/Draggablepoint";
import { getTransformedPoints } from "./utils/utils";

const START_LOCATION = { lat: 45.8664544, lng: 25.7981645 };
const hiddenBuildingsInput = document.querySelector<HTMLInputElement>("[name='buildings']")!;
const segmentInputContainer = document.querySelector<HTMLDivElement>("#segment-inputs")!;
const loopInputs = document.querySelectorAll<HTMLInputElement>("[name='BoqGuardRails[conf_open_closed]']");
// const availableBuildingTypes = ["flat", "saddle", "hipped"];
// const buildingsData = {};
declare const availableBuildingTypes: string[];
declare const buildingsData: BuildingWithLocation | object;

const App = () => {
	const [mapImageUrl, setMapImageUrl] = useState<string>(getGoogleMapImageUrl(START_LOCATION.lat, START_LOCATION.lng));
	const [currentlySelectedLocation, setCurrentlySelectedLocation] = useState<{ lat: number; lng: number }>(
		START_LOCATION
	);
	const [currentBuildingType, setCurrentBuildingType] = useState<"flat" | "saddle" | "hipped" | null>(null);
	const [currentTransformTarget, setCurrentTransformTarget] = useState<"group" | "roof" | "building">("group");
	const [currentTransformMode, setCurrentTransformMode] = useState<"translate" | "scale" | "rotate">("translate");
	const [buildingAdded, setBuildingAdded] = useState(false);
	const [currentBuildingData, setCurrentBuildingData] = useState<BoqBuilding | null>(null);
	const [enableDrawing, setEnableDrawing] = useState(false);
	const [drawingFinished, setDrawingFinished] = useState(false);
	const [drawPoints, setDrawPoints] = useState<Vector2[]>([]);
	const [isDrawingClosed, setIsDrawingClosed] = useState(false);
	const [closingPointIndex, setClosingPointIndex] = useState<number | null>(null);
	const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

	const drawingSegments = useMemo(() => {
		if (drawPoints.length < 2) return [];

		const segments: { from: Vector2; to: Vector2; length: number }[] = [];

		for (let i = 1; i < drawPoints.length; i++) {
			const from = drawPoints[i - 1];
			const to = drawPoints[i];
			segments.push({ from, to, length: Math.round(from.distanceTo(to)) });
		}

		// Add closing segment if shape is closed
		if (
			(isDrawingClosed && closingPointIndex !== null) ||
			(!isDrawingClosed && closingPointIndex !== null && drawPoints.length === 3)
		) {
			const from = drawPoints.at(-1)!;
			const to = drawPoints[closingPointIndex];
			segments.push({ from, to, length: Math.round(from.distanceTo(to)) });
		}

		return segments;
	}, [drawPoints, isDrawingClosed, closingPointIndex]);

	const handleBuildingClick = (e: ThreeEvent<PointerEvent>) => {
		if (!enableDrawing || isDrawingClosed || drawingFinished || !currentBuildingData) return;

		const worldPoint = new Vector3(e.point.x, 0, e.point.z);
		const clickedXZ = new Vector2(worldPoint.x, worldPoint.z);

		setDrawPoints((prev) => {
			const threshold = 0.5;

			// Check if click is near an existing point
			const index = prev.findIndex((p) => {
				// Convert local point to world space to compare with the clicked position
				const localVec = new Vector3(p.x, 0, p.y);
				const matrix = new Matrix4().compose(
					new Vector3(...currentBuildingData.buildingPosition),
					new Quaternion().setFromEuler(new Euler(...currentBuildingData.buildingRotation)),
					new Vector3(1, 1, 1)
				);
				localVec.applyMatrix4(matrix);
				return new Vector2(localVec.x, localVec.z).distanceTo(clickedXZ) < threshold;
			});

			// Closing shape logic
			if (index !== -1) {
				if (index === prev.length - 1 || index === prev.length - 2) {
					setDrawingFinished(true);
					return prev;
				}

				if (prev.length === 3 && index === 0) {
					setClosingPointIndex(index);
					setDrawingFinished(true);
					return prev;
				}

				setIsDrawingClosed(true);
				setClosingPointIndex(index);
				setDrawingFinished(true);
				return prev;
			}

			// 🔁 New logic: convert worldPoint to local space
			const inverseMatrix = new Matrix4()
				.compose(
					new Vector3(...currentBuildingData.buildingPosition),
					new Quaternion().setFromEuler(new Euler(...currentBuildingData.buildingRotation)),
					new Vector3(1, 1, 1)
				)
				.invert();

			const localPoint = worldPoint.clone().applyMatrix4(inverseMatrix);
			const localXZ = new Vector2(localPoint.x, localPoint.z);

			return [...prev, localXZ];
		});
	};

	const handleLocationSelect = (lat: number, lng: number) => {
		const mapUrl = getGoogleMapImageUrl(lat, lng);
		setCurrentlySelectedLocation({ lat, lng });
		setMapImageUrl(mapUrl);
	};

	const handleBuildingTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentBuildingType(event.target.value as "flat" | "saddle" | "hipped");
	};

	const handleAddBuilding = useCallback(
		(_currentBuildingType: "flat" | "saddle" | "hipped", location: { lat: number; lng: number }) => {
			let building: BuildingWithLocation | null = null;

			switch (_currentBuildingType) {
				case "flat":
					building = new BoqBuildingFlat();
					setCurrentTransformTarget("building");
					setCurrentTransformMode("translate");
					break;
				case "saddle":
					building = new BoqBuildingSaddle();
					setCurrentTransformTarget("group");
					setCurrentTransformMode("translate");
					break;
				case "hipped":
					building = new BoqBuildingHipped();
					setCurrentTransformTarget("group");
					setCurrentTransformMode("translate");
					break;
				default:
					console.warn("No building type selected");
					break;
			}

			setCurrentBuildingData(building);
			setBuildingAdded(true);
			building!.location = location;
			hiddenBuildingsInput.value = JSON.stringify(building);
			// document.querySelector<HTMLInputElement>("[name='buildings']")!.value = JSON.stringify(building);
			console.log("building data when first added:", building);
		},
		[]
	);

	const handleChangeTransformTarget = (mode: "group" | "roof" | "building") => {
		if (mode === "group") {
			setCurrentTransformMode("translate");
		}

		if (mode === "building" || mode === "roof") {
			setCurrentTransformMode("scale");
		}

		setCurrentTransformTarget(mode);
	};

	const handleBuildingInputChange = (key: string, value: number | number[]) => {
		setCurrentBuildingData((prev) => prev && { ...prev, [key]: value });
		const updatedBuildingData = { ...currentBuildingData, [key]: value };
		hiddenBuildingsInput.value = JSON.stringify(updatedBuildingData);
		// document.querySelector<HTMLInputElement>("[name='buildings']")!.value = JSON.stringify(updatedBuildingData);
	};

	const handleResetDrawing = () => {
		setDrawingFinished(false);
		setDrawPoints([]);
		setIsDrawingClosed(false);
		setClosingPointIndex(null);
		loopInputs.forEach((input) => (input.checked = false));
		segmentInputContainer.innerHTML = "";
		const hiddenInputData: BuildingWithLocation = JSON.parse(hiddenBuildingsInput.value);
		delete hiddenInputData["hasClosedLoopSystem"];
		delete hiddenInputData["segments"];
		delete hiddenInputData["closingPointIndex"];
		hiddenBuildingsInput.value = JSON.stringify(hiddenInputData);
	};

	const handleLoadFromDrawing = () => {
		loopInputs.forEach((input) => {
			if (input.value === "c" && isDrawingClosed) {
				input.checked = true;
			} else if (input.value === "o" && !isDrawingClosed) {
				input.checked = true;
			}
		});
		segmentInputContainer.innerHTML = "";
		drawingSegments.forEach((segment, index) => {
			const rowDiv = document.createElement("div");
			rowDiv.className = "row";

			const innerDiv = document.createElement("div");
			innerDiv.className = "col-md-3 col-sm-6 col-xs-12";

			const inputDiv = document.createElement("div");
			inputDiv.className = `text-input-compact field-boqguardrails-conf_segment_lengths-${index}`;

			const input = document.createElement("input");
			input.type = "text";
			input.id = `boqguardrails-conf_segment_lengths-${index}`;
			input.className = "text-right form-control";
			input.name = `BoqGuardRails[conf_segment_lengths][${index}]`;
			input.maxLength = 4;
			input.value = segment.length.toString();

			const helpBlock = document.createElement("div");
			helpBlock.className = "help-block";

			inputDiv.appendChild(input);
			inputDiv.appendChild(helpBlock);
			innerDiv.appendChild(inputDiv);
			rowDiv.appendChild(innerDiv);
			segmentInputContainer.appendChild(rowDiv);
		});
		const hiddenInputData: BuildingWithLocation = JSON.parse(hiddenBuildingsInput.value);
		hiddenInputData.hasClosedLoopSystem = isDrawingClosed;
		hiddenInputData.segments = drawingSegments;
		hiddenInputData.closingPointIndex = closingPointIndex!;
		hiddenBuildingsInput.value = JSON.stringify(hiddenInputData);
	};

	useEffect(() => {
		if (buildingsData && Object.keys(buildingsData).length > 0) {
			// Do something if buildingsData is a non-empty object
			const initialBuildingData = JSON.parse(JSON.stringify(buildingsData)) as BuildingWithLocation;
			setCurrentlySelectedLocation(initialBuildingData.location!);
			setCurrentBuildingType(initialBuildingData.roofType as "flat" | "saddle" | "hipped");
			setCurrentTransformTarget(initialBuildingData.roofType === "flat" ? "building" : "group");
			setCurrentTransformMode("translate");
			setMapImageUrl(getGoogleMapImageUrl(initialBuildingData.location!.lat, initialBuildingData.location!.lng));
			setCurrentBuildingData(initialBuildingData);
			setBuildingAdded(true);
			hiddenBuildingsInput.value = JSON.stringify(initialBuildingData);
			// document.querySelector<HTMLInputElement>("[name='buildings']")!.value = JSON.stringify(initialBuildingData);
			if ("hasClosedLoopSystem" in initialBuildingData && "segments" in initialBuildingData) {
				// we have segments and a closed loop system
				setEnableDrawing(true);
				setDrawingFinished(true);
				setIsDrawingClosed(initialBuildingData.hasClosedLoopSystem!);
				setClosingPointIndex(initialBuildingData.closingPointIndex!);
				const restoredPoints: Vector2[] = [];

				if (initialBuildingData.segments!.length > 0) {
					initialBuildingData.segments!.forEach((segment) => {
						restoredPoints.push(new Vector2(segment.from.x, segment.from.y));
					});
				}

				setDrawPoints(restoredPoints);
			}
			console.log("Initial building data loaded:", initialBuildingData);
		}
	}, []);

	useEffect(() => {
		if (
			(!buildingsData || Object.keys(buildingsData).length === 0) &&
			availableBuildingTypes.length === 1 &&
			!buildingAdded
		) {
			// Do something when buildingsData is null, undefined, or an empty object
			// and there's only one building type available
			const initialBuildingType = availableBuildingTypes[0] as "flat" | "saddle" | "hipped";
			setCurrentBuildingType(initialBuildingType);
			handleAddBuilding(initialBuildingType, currentlySelectedLocation);
		}
	}, [handleAddBuilding, currentlySelectedLocation, buildingAdded]);

	return (
		<div className="app-container">
			{/* <input type="hidden" name="buildings" value={""} /> */}
			<div className="canvas-wrapper">
				<SearchBar onLocationSelect={handleLocationSelect} />
				<div className="canvas-container">
					<Canvas
						shadows
						camera={{
							position: [0, 90, 100],
							zoom: 3,
						}}
					>
						<ambientLight intensity={0.5} />
						<directionalLight position={[10, 10, 10]} intensity={1} castShadow />
						{mapImageUrl && (
							<Platform mapImageUrl={mapImageUrl} currentlySelectedLocation={currentlySelectedLocation} />
						)}
						{currentBuildingData && (
							<BoqBuildingRenderer
								transformTarget={currentTransformTarget}
								transformMode={currentTransformMode}
								buildingProps={currentBuildingData}
								disableTransform={enableDrawing}
								onTransformUpdate={(updated) => {
									setCurrentBuildingData(updated);
									updated.location = currentlySelectedLocation;
									hiddenBuildingsInput.value = JSON.stringify(updated);
									// document.querySelector<HTMLInputElement>("[name='buildings']")!.value = JSON.stringify(updated);
								}}
								onBuildingClick={handleBuildingClick}
							/>
						)}
						{drawPoints.map((point, index) => (
							<DraggablePoint
								key={index}
								index={index}
								initial={point}
								y={currentBuildingData!.buildingHeight + 0.03}
								enabled={enableDrawing && drawingFinished}
								isActive={index === activePointIndex}
								onClick={() => setActivePointIndex(index)}
								onUpdate={(idx, newPos) => {
									const updated = [...drawPoints];
									updated[idx] = newPos;
									setDrawPoints(updated);
								}}
								buildingData={currentBuildingData!}
							/>
						))}
						{drawPoints.length >= 2 && (
							<Line points={getTransformedPoints(drawPoints, currentBuildingData!)} color="yellow" lineWidth={5} />
						)}
						{isDrawingClosed && closingPointIndex !== null && drawPoints.length > 1 && (
							<Line
								points={getTransformedPoints([drawPoints.at(-1)!, drawPoints[closingPointIndex]], currentBuildingData!)}
								color="yellow"
								lineWidth={5}
							/>
						)}
						{!isDrawingClosed && closingPointIndex !== null && drawPoints.length === 3 && drawingFinished && (
							<Line
								points={getTransformedPoints([drawPoints.at(-1)!, drawPoints[closingPointIndex]], currentBuildingData!)}
								color="yellow"
								lineWidth={5}
							/>
						)}
						<OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
					</Canvas>
				</div>
			</div>
			<div className="action-container">
				<h3>Define a building type</h3>
				<div className="options-container">
					{availableBuildingTypes.includes("flat") && (
						<div>
							<label htmlFor="flat">Flat Roof</label>
							<input
								type="radio"
								name="building"
								id="flat"
								value={"flat"}
								checked={currentBuildingType === "flat"}
								onChange={handleBuildingTypeChange}
							/>
						</div>
					)}
					{availableBuildingTypes.includes("saddle") && (
						<div>
							<label htmlFor="saddle">Saddle Roof</label>
							<input
								type="radio"
								name="building"
								id="saddle"
								value={"saddle"}
								checked={currentBuildingType === "saddle"}
								onChange={handleBuildingTypeChange}
							/>
						</div>
					)}
					{availableBuildingTypes.includes("hipped") && (
						<div>
							<label htmlFor="hipped">Hipped Roof</label>
							<input
								type="radio"
								name="building"
								id="hipped"
								value={"hipped"}
								checked={currentBuildingType === "hipped"}
								onChange={handleBuildingTypeChange}
							/>
						</div>
					)}
				</div>
				{currentBuildingType && (
					<div className="btn-container">
						<button className="btn" onClick={() => handleAddBuilding(currentBuildingType!, currentlySelectedLocation!)}>
							+ Add new building
						</button>
					</div>
				)}
				{currentBuildingType && currentBuildingType !== "flat" && buildingAdded && (
					<>
						<h3>Current transform target: {currentTransformTarget}</h3>
						<div className="options-container">
							<div>
								<label htmlFor="group">Focus group</label>
								<input
									type="radio"
									name="focus-target"
									id="group"
									value={"group"}
									checked={currentTransformTarget === "group"}
									onChange={() => handleChangeTransformTarget("group")}
								/>
							</div>
							<div>
								<label htmlFor="roof">Focus roof</label>
								<input
									type="radio"
									name="focus-target"
									id="roof"
									value={"roof"}
									checked={currentTransformTarget === "roof"}
									onChange={() => handleChangeTransformTarget("roof")}
								/>
							</div>
							<div>
								<label htmlFor="building">Focus building</label>
								<input
									type="radio"
									name="focus-target"
									id="building"
									value={"building"}
									checked={currentTransformTarget === "building"}
									onChange={() => handleChangeTransformTarget("building")}
								/>
							</div>
						</div>
					</>
				)}
				{currentBuildingType && buildingAdded && (
					<>
						<h3>Current mode: {currentTransformMode}</h3>
						<div className="options-container">
							{(currentBuildingType === "flat" || currentTransformTarget === "group") && (
								<div>
									<label htmlFor="translate">Translate</label>
									<input
										type="radio"
										name="translate-mode"
										id="translate"
										value={"translate"}
										checked={currentTransformMode === "translate"}
										onChange={() => setCurrentTransformMode("translate")}
									/>
								</div>
							)}
							<div>
								<label htmlFor="scale">Scale</label>
								<input
									type="radio"
									name="translate-mode"
									id="scale"
									value={"scale"}
									checked={currentTransformMode === "scale"}
									onChange={() => setCurrentTransformMode("scale")}
								/>
							</div>
							{(currentBuildingType === "flat" || currentTransformTarget === "group") && (
								<div>
									<label htmlFor="rotate">Rotate</label>
									<input
										type="radio"
										name="translate-mode"
										id="rotate"
										value={"rotate"}
										checked={currentTransformMode === "rotate"}
										onChange={() => setCurrentTransformMode("rotate")}
									/>
								</div>
							)}
						</div>
					</>
				)}
				{buildingAdded && currentBuildingData && (
					<BuildingInputs
						currentLocation={currentlySelectedLocation!}
						currentBuildingType={currentBuildingType!}
						buildingProps={currentBuildingData}
						disableInputs={enableDrawing}
						onChangeBuildingState={handleBuildingInputChange}
					/>
				)}
				{buildingAdded && (
					<>
						<h3>Drawing mode {`${enableDrawing ? "enabled" : "disabled"}`}</h3>
						<div className="btn-container">
							<button className="btn" onClick={() => setEnableDrawing((prev) => !prev)}>
								Toggle Draw Mode
							</button>
						</div>
					</>
				)}
				{drawPoints.length > 0 && buildingAdded && enableDrawing && (
					<>
						<h3>Draw actions</h3>
						<div className="btn-container">
							<button className="btn" onClick={handleResetDrawing}>
								Reset Drawing
							</button>
							{drawingFinished && drawPoints.length > 1 && (
								<button className="btn" onClick={handleLoadFromDrawing}>
									Load from drawing
								</button>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default App;

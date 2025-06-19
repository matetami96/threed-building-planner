import { Euler, MathUtils, Matrix4, Quaternion, Vector2, Vector3 } from "three";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import "./App.css";
import { BoqBuilding, RooftopObjectType } from "./types";
import BoqBuildingFlat from "./models/BoqBuildingFlat";
import BoqBuildingSaddle from "./models/BoqBuildingSaddle";
import BoqBuildingHipped from "./models/BoqBuildingHipped";

import { getGoogleMapImageUrl } from "./utils/mapHelpers";
import Platform from "./components/Platform";
import SearchBar from "./components/SearchBar";
import BoqBuildingRenderer from "./components/BoqBuildingRenderer";
import BuildingInputs from "./components/BuildingInputs";
import DraggablePoint from "./components/Draggablepoint";
import { adjustSegmentLength, getMaxSegmentLength, getTransformedPoints } from "./utils/utils";
import RooftopObject from "./components/RooftopObject";
import RoofObjectEditor from "./components/RoofObjectEditor";

const START_LOCATION = { lat: 45.8664544, lng: 25.7981645 };
const hiddenBuildingsInput = document.querySelector<HTMLInputElement>("[name='buildings']")!;
const segmentInputContainer = document.querySelector<HTMLDivElement>("#segment-inputs")!;
const loopInputs = document.querySelectorAll<HTMLInputElement>("[name='BoqGuardRails[conf_open_closed]']");
// const availableBuildingTypes = ["flat", "saddle", "hipped"];
// const buildingsData = {};
declare const availableBuildingTypes: string[];
declare const buildingsData: BoqBuilding | object;

const App = () => {
	const [currentStep, setCurrentStep] = useState<"defineBuilding" | "defineRestrictions" | "defineLayout">(
		"defineBuilding"
	);
	const [mapImageUrl, setMapImageUrl] = useState<string>(getGoogleMapImageUrl(START_LOCATION.lat, START_LOCATION.lng));
	const [currentlySelectedLocation, setCurrentlySelectedLocation] = useState<{ lat: number; lng: number }>(
		START_LOCATION
	);
	const [currentBuildingType, setCurrentBuildingType] = useState<"flat" | "saddle" | "hipped" | null>(null);
	const [currentTransformTarget, setCurrentTransformTarget] = useState<"group" | "roof" | "building">("group");
	const [currentTransformMode, setCurrentTransformMode] = useState<"translate" | "scale" | "rotate">("translate");
	const [buildingAdded, setBuildingAdded] = useState(false);
	const [currentBuildingData, setCurrentBuildingData] = useState<BoqBuilding | null>(null);
	const [roofObjects, setRoofObjects] = useState<RooftopObjectType[]>([]);
	const [activeRoofObjectId, setActiveRoofObjectId] = useState<string | null>(null);
	const [drawingFinished, setDrawingFinished] = useState(false);
	const [drawPoints, setDrawPoints] = useState<Vector2[]>([]);
	const [isDrawingClosed, setIsDrawingClosed] = useState(false);
	const [closingPointIndex, setClosingPointIndex] = useState<number | null>(null);
	const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
	const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
	const [segmentInputLength, setSegmentInputLength] = useState<number | null>(null);
	const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);

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
			let building: BoqBuilding | null = null;

			switch (_currentBuildingType) {
				case "flat":
					building = new BoqBuildingFlat();
					setCurrentTransformTarget("group");
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
		if (key === "buildingHeight") {
			const newHeight = value as number;

			// Recalculate Y position for all roofObjects
			setRoofObjects((prev) =>
				prev.map((obj) => ({
					...obj,
					position: [obj.position[0], newHeight + obj.scale[1] / 2, obj.position[2]],
				}))
			);
		}
		const updatedBuildingData = { ...currentBuildingData, [key]: value };
		hiddenBuildingsInput.value = JSON.stringify(updatedBuildingData);
		// document.querySelector<HTMLInputElement>("[name='buildings']")!.value = JSON.stringify(updatedBuildingData);
	};

	const handleTransformUpdate = useCallback(
		(updated: BoqBuilding) => {
			if (
				JSON.stringify(updated.groupPosition) !== JSON.stringify(currentBuildingData?.groupPosition) ||
				JSON.stringify(updated.groupRotation) !== JSON.stringify(currentBuildingData?.groupRotation) ||
				JSON.stringify(updated.buildingPosition) !== JSON.stringify(currentBuildingData?.buildingPosition) ||
				JSON.stringify(updated.buildingRotation) !== JSON.stringify(currentBuildingData?.buildingRotation) ||
				updated.buildingWidth !== currentBuildingData?.buildingWidth ||
				updated.buildingHeight !== currentBuildingData?.buildingHeight ||
				updated.buildingLength !== currentBuildingData?.buildingLength
			) {
				setCurrentBuildingData(updated);
				setRoofObjects((prev) =>
					prev.map((obj) => ({
						...obj,
						position: [obj.position[0], updated.buildingHeight + obj.scale[1] / 2, obj.position[2]],
					}))
				);
				updated.location = currentlySelectedLocation;
				hiddenBuildingsInput.value = JSON.stringify(updated);
			}
		},
		[currentBuildingData, currentlySelectedLocation]
	);

	const handlePlaceRoofObject = () => {
		const newRoofObject: RooftopObjectType = {
			id: uuidv4(),
			position: [0, currentBuildingData!.buildingHeight + 0.5 / 2, 0],
			scale: [1, 0.5, 1],
		};
		setRoofObjects((prev) => [...prev, newRoofObject]);
		setActiveRoofObjectId(newRoofObject.id);
	};

	const handleDeleteRoofObject = () => {
		const updatedRoofObjects = roofObjects.filter((obj) => obj.id !== activeRoofObjectId);
		setRoofObjects(updatedRoofObjects);
		setActiveRoofObjectId(updatedRoofObjects.length > 0 ? updatedRoofObjects[0].id : null);
		const hiddenInputData: BoqBuilding = JSON.parse(hiddenBuildingsInput.value);
		hiddenInputData.roofObjects = updatedRoofObjects;
		hiddenBuildingsInput.value = JSON.stringify(hiddenInputData);
	};

	const handleBuildingClick = (e: ThreeEvent<PointerEvent>) => {
		if (currentStep !== "defineLayout" || isDrawingClosed || drawingFinished || !currentBuildingData) return;

		const worldPoint = new Vector3(e.point.x, 0, e.point.z);
		const clickedXZ = new Vector2(worldPoint.x, worldPoint.z);

		setDrawPoints((prev) => {
			const threshold = 0.5;

			// Check if click is near an existing point
			const index = prev.findIndex((p) => {
				// Convert local point to world space to compare with the clicked position
				const localVec = new Vector3(p.x, 0, p.y);
				const matrix = new Matrix4().compose(
					new Vector3(...currentBuildingData.groupPosition),
					new Quaternion().setFromEuler(new Euler(...currentBuildingData.groupRotation)),
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
					new Vector3(...currentBuildingData.groupPosition),
					new Quaternion().setFromEuler(new Euler(...currentBuildingData.groupRotation)),
					new Vector3(1, 1, 1)
				)
				.invert();

			const localPoint = worldPoint.clone().applyMatrix4(inverseMatrix);
			const localXZ = new Vector2(localPoint.x, localPoint.z);

			// Clamp point within building bounds + visual buffer
			const halfW = currentBuildingData.buildingWidth / 2;
			const halfL = currentBuildingData.buildingLength / 2;
			const radius = 0.15;

			localXZ.x = MathUtils.clamp(localXZ.x, -halfW + radius, halfW - radius);
			localXZ.y = MathUtils.clamp(localXZ.y, -halfL + radius, halfL - radius);

			return [...prev, localXZ];
		});
	};

	const handleResetDrawing = () => {
		setDrawingFinished(false);
		setDrawPoints([]);
		setIsDrawingClosed(false);
		setClosingPointIndex(null);
		setSelectedSegmentIndex(null);
		setSegmentInputLength(null);
		loopInputs.forEach((input) => (input.checked = false));
		segmentInputContainer.innerHTML = "";
		const hiddenInputData: BoqBuilding = JSON.parse(hiddenBuildingsInput.value);
		delete hiddenInputData["hasClosedLoopSystem"];
		delete hiddenInputData["segments"];
		delete hiddenInputData["closingPointIndex"];
		hiddenBuildingsInput.value = JSON.stringify(hiddenInputData);
	};

	const drawnSegments = useMemo(() => {
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

	const handleDragabblePointUpdated = (idx: number, newPos: Vector2) => {
		const updated = [...drawPoints];
		updated[idx] = newPos;
		setDrawPoints(updated);

		if (selectedSegmentIndex !== null) {
			const from = updated[selectedSegmentIndex];
			const to =
				selectedSegmentIndex === updated.length - 1 && isDrawingClosed ? updated[0] : updated[selectedSegmentIndex + 1];

			if (from && to && (idx === selectedSegmentIndex || idx === selectedSegmentIndex + 1)) {
				const newLength = from.distanceTo(to);
				setSegmentInputLength(Math.round(newLength));
			}
		}
	};

	const handleUpdateSegmentLength = () => {
		if (segmentInputLength && drawPoints.length >= 2 && segmentInputLength >= 1 && currentBuildingData) {
			const clampedLength = Math.min(
				segmentInputLength,
				+getMaxSegmentLength(
					drawnSegments[selectedSegmentIndex!],
					currentBuildingData.buildingWidth,
					currentBuildingData.buildingLength
				)
			);
			adjustSegmentLength(
				selectedSegmentIndex!,
				clampedLength,
				drawPoints,
				isDrawingClosed,
				closingPointIndex,
				currentBuildingData.buildingWidth,
				currentBuildingData.buildingLength,
				setDrawPoints
			);
			setSegmentInputLength(Math.round(clampedLength));
		}
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
		drawnSegments.forEach((segment, index) => {
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
		const hiddenInputData: BoqBuilding = JSON.parse(hiddenBuildingsInput.value);
		hiddenInputData.hasClosedLoopSystem = isDrawingClosed;
		hiddenInputData.segments = drawnSegments;
		hiddenInputData.closingPointIndex = closingPointIndex!;
		hiddenInputData.roofObjects = roofObjects;
		hiddenBuildingsInput.value = JSON.stringify(hiddenInputData);
	};

	useEffect(() => {
		if (buildingsData && Object.keys(buildingsData).length > 0) {
			// Do something if buildingsData is a non-empty object
			const initialBuildingData = JSON.parse(JSON.stringify(buildingsData)) as BoqBuilding;
			setCurrentlySelectedLocation(initialBuildingData.location!);
			setCurrentBuildingType(initialBuildingData.roofType as "flat" | "saddle" | "hipped");
			setCurrentTransformTarget("group");
			setCurrentTransformMode("translate");
			setMapImageUrl(getGoogleMapImageUrl(initialBuildingData.location!.lat, initialBuildingData.location!.lng));
			setCurrentBuildingData(initialBuildingData);
			setBuildingAdded(true);
			hiddenBuildingsInput.value = JSON.stringify(initialBuildingData);
			// document.querySelector<HTMLInputElement>("[name='buildings']")!.value = JSON.stringify(initialBuildingData);
			if ("hasClosedLoopSystem" in initialBuildingData && "segments" in initialBuildingData) {
				// we have segments and a closed loop system
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
				setCurrentStep("defineLayout");
			}
			if ("roofObjects" in initialBuildingData) {
				if (initialBuildingData.roofObjects!.length > 0) {
					setRoofObjects(initialBuildingData.roofObjects!);
					setActiveRoofObjectId(initialBuildingData.roofObjects![0].id);
				}
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

	const renderObstacles = () => {
		if (!currentBuildingData || roofObjects.length === 0) return null;

		return roofObjects.map((obstacle) => (
			<RooftopObject key={obstacle.id} obstacle={obstacle} onClick={() => setActiveRoofObjectId(obstacle.id)} />
		));
	};

	const renderDraggablePoints = () => {
		return drawPoints.map((point, index) => (
			<DraggablePoint
				key={index}
				index={index}
				initial={point}
				y={currentBuildingData!.buildingHeight + 0.03}
				enabled={currentStep === "defineLayout" && drawingFinished}
				isActive={index === activePointIndex}
				onClick={() => setActivePointIndex(index)}
				onUpdate={handleDragabblePointUpdated}
				buildingData={currentBuildingData!}
				currentStep={currentStep}
			/>
		));
	};

	const renderDrawnSegments = () => {
		return drawnSegments.map((segment, index) => {
			const [from, to] = getTransformedPoints([segment.from, segment.to], currentBuildingData!);

			const isHovered = hoveredSegmentIndex === index;
			const isSelected = selectedSegmentIndex === index;

			return (
				<Line
					key={index}
					points={[...from, ...to]}
					color={isSelected ? "orange" : isHovered ? "orange" : "yellow"}
					lineWidth={isHovered ? 15 : 5}
					onPointerOver={(e) => {
						if (currentStep !== "defineLayout") return;
						e.stopPropagation();
						setHoveredSegmentIndex(index);
					}}
					onPointerOut={(e) => {
						if (currentStep !== "defineLayout") return;
						e.stopPropagation();
						setHoveredSegmentIndex(null);
					}}
					onClick={(e) => {
						if (currentStep !== "defineLayout") return;
						e.stopPropagation();
						setSelectedSegmentIndex(index);
						setSegmentInputLength(segment.length);
					}}
				/>
			);
		});
	};

	const renderCanvasContent = () => {
		return (
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
								disableTransform={currentStep !== "defineBuilding"}
								onTransformUpdate={handleTransformUpdate}
								onBuildingClick={handleBuildingClick}
							>
								{renderObstacles()}
							</BoqBuildingRenderer>
						)}
						{renderDraggablePoints()}
						{renderDrawnSegments()}
						<OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
					</Canvas>
				</div>
			</div>
		);
	};

	const renderDashboardContent = () => {
		return (
			<div className="action-container">
				<h3>Select current step</h3>
				<div className="btn-container control-panel">
					<button className="btn" onClick={() => setCurrentStep("defineBuilding")}>
						Define building
					</button>
					<button className="btn" onClick={() => setCurrentStep("defineRestrictions")} disabled={!buildingAdded}>
						Roof Objects
					</button>
					<button className="btn" onClick={() => setCurrentStep("defineLayout")} disabled={!buildingAdded}>
						Drawing
					</button>
				</div>
				{currentStep === "defineBuilding" && (
					<>
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
								<button
									className="btn"
									onClick={() => handleAddBuilding(currentBuildingType!, currentlySelectedLocation!)}
								>
									Add new building
								</button>
							</div>
						)}
						{currentBuildingType && buildingAdded && (
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
									{currentBuildingType !== "flat" && (
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
									)}
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
									{currentTransformTarget === "group" && (
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
									{currentTransformTarget !== "group" && (
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
									)}
									{currentTransformTarget === "group" && (
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
								disableInputs={false}
								onChangeBuildingState={handleBuildingInputChange}
							/>
						)}
					</>
				)}
				{currentStep === "defineRestrictions" && buildingAdded && (
					<>
						<h3>Roof objects</h3>
						<div className="btn-container">
							<button className="btn" onClick={handlePlaceRoofObject}>
								Add Roof Object
							</button>
							{activeRoofObjectId && (
								<button className="btn" onClick={handleDeleteRoofObject}>
									Delete object
								</button>
							)}
						</div>
						{activeRoofObjectId &&
							(() => {
								const obj = roofObjects.find((o) => o.id === activeRoofObjectId);

								if (!obj) return null;

								return (
									<RoofObjectEditor
										roofObject={obj}
										buildingWidth={currentBuildingData!.buildingWidth}
										buildingLength={currentBuildingData!.buildingLength}
										buildingHeight={currentBuildingData!.buildingHeight}
										onUpdate={(updated) =>
											setRoofObjects((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
										}
									/>
								);
							})()}
					</>
				)}
				{currentStep === "defineLayout" && buildingAdded && (
					<>
						<h3>Draw actions</h3>
						<div className="btn-container">
							<button className="btn" onClick={handleResetDrawing} disabled={drawPoints.length === 0}>
								Reset Drawing
							</button>
							{drawingFinished && (
								<button className="btn" onClick={handleLoadFromDrawing} disabled={drawPoints.length < 2}>
									Load from drawing
								</button>
							)}
						</div>
						{selectedSegmentIndex !== null && currentBuildingData && (
							<div className="segment-editor">
								<label htmlFor="segment-length">Segment length:</label>
								<input
									id="segment-length"
									type="number"
									min={1}
									max={getMaxSegmentLength(
										drawnSegments[selectedSegmentIndex!],
										currentBuildingData.buildingWidth,
										currentBuildingData.buildingLength
									)}
									value={segmentInputLength ?? ""}
									onChange={(e) => setSegmentInputLength(parseFloat(e.target.value))}
								/>
								<button className="btn" onClick={handleUpdateSegmentLength}>
									Update length
								</button>
							</div>
						)}
					</>
				)}
			</div>
		);
	};

	return (
		<div className="app-container">
			{/* <input type="hidden" name="buildings" value={""} /> */}
			{renderCanvasContent()}
			{renderDashboardContent()}
		</div>
	);
};

export default App;

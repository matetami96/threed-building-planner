import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState } from "react";

import "./App.css";
import { getGoogleMapImageUrl } from "./utils/mapHelpers";
import Platform from "./components/Platform";
import SearchBar from "./components/SearchBar";
import BoqBuildingFlat from "./models/BoqBuildingFlat";
import BoqBuildingSaddle from "./models/BoqBuildingSaddle";
import BoqBuildingHipped from "./models/BoqBuildingHipped";
import BoqBuildingRenderer from "./components/BoqBuildingRenderer";
import BuildingInputs from "./components/BuildingInputs";

const START_LOCATION = { lat: 45.86, lng: 25.79 };

type BoqBuilding = BoqBuildingFlat | BoqBuildingSaddle | BoqBuildingHipped;

const App = () => {
	const [mapImageUrl, setMapImageUrl] = useState<string>(
		getGoogleMapImageUrl(START_LOCATION.lat, START_LOCATION.lng, 17, 640, 640)
	);
	const [currentBuildingType, setCurrentBuildingType] = useState<"flat" | "saddle" | "hipped" | null>(null);
	const [currentTransformTarget, setCurrentTransformTarget] = useState<"group" | "roof" | "building">("group");
	const [currentTransformMode, setCurrentTransformMode] = useState<"translate" | "scale" | "rotate">("translate");
	const [buildingAdded, setBuildingAdded] = useState(false);
	const [currentBuildingData, setCurrentBuildingData] = useState<BoqBuilding | null>(null);
	const buildingRendererRef = useRef<{ triggerSave: () => void }>(null);

	const handleLocationSelect = (lat: number, lng: number) => {
		const mapUrl = getGoogleMapImageUrl(lat, lng, 17, 640, 640);
		setMapImageUrl(mapUrl);
	};

	const handleBuildingTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentBuildingType(event.target.value as "flat" | "saddle" | "hipped");
	};

	const handleAddBuilding = () => {
		let building: BoqBuilding | null = null;

		switch (currentBuildingType) {
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

		console.log("building data when first added:", building);
		setCurrentBuildingData(building);
		setBuildingAdded(true);
	};

	const handleChangeTransformTarget = (mode: "group" | "roof" | "building") => {
		if (mode === "group") {
			setCurrentTransformMode("translate");
		}

		if (mode === "building" || mode === "roof") {
			setCurrentTransformMode("scale");
		}

		setCurrentTransformTarget(mode);
	};

	const handleSaveBuilding = () => {
		const updated = buildingRendererRef.current?.triggerSave();

		if (updated) {
			// TODO: send to API
			console.log("✅ Building updated and stored:", updated);
		}
	};

	const handleBuildingInputChange = (key: string, value: number | number[]) => {
		setCurrentBuildingData((prev) => prev && { ...prev, [key]: value });
	};

	return (
		<div className="app-container">
			<div className="canvas-wrapper">
				<SearchBar onLocationSelect={handleLocationSelect} />
				<div className="canvas-container">
					<Canvas
						shadows
						camera={{
							position: [0, 1, 1.75],
							fov: 50,
						}}
					>
						<ambientLight intensity={0.5} />
						<directionalLight position={[10, 10, 10]} intensity={1} castShadow />
						{mapImageUrl && <Platform mapImageUrl={mapImageUrl} />}
						{currentBuildingData && (
							<BoqBuildingRenderer
								ref={buildingRendererRef}
								transformTarget={currentTransformTarget}
								transformMode={currentTransformMode}
								buildingProps={currentBuildingData}
								onSave={handleSaveBuilding}
								onTransformUpdate={(updated) => setCurrentBuildingData(updated)}
							/>
						)}
						<OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
					</Canvas>
				</div>
			</div>
			<div className="action-container">
				<h3>Define a building type</h3>
				<div className="options-container">
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
				</div>
				{currentBuildingType && (
					<div className="btn-container">
						<button className="btn" onClick={handleAddBuilding}>
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
				{currentBuildingData && (
					<div className="btn-container">
						<button className="btn" onClick={handleSaveBuilding}>
							Save current building
						</button>
					</div>
				)}
				{buildingAdded && currentBuildingData && (
					<BuildingInputs
						currentBuildingType={currentBuildingType!}
						buildingProps={currentBuildingData}
						onChangeBuildingState={handleBuildingInputChange}
					/>
				)}
			</div>
		</div>
	);
};

export default App;

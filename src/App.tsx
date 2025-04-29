import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";

import "./App.css";
import { getGoogleMapImageUrl } from "./utils/mapHelpers";
import Platform from "./components/Platform";
import Rectangles from "./components/Rectangles";
import SearchBar from "./components/SearchBar";

const START_LOCATION = { lat: 45.86, lng: 25.79 };
const PLATFORM_Y = -0.15;

const App = () => {
	const [rectangles, setRectangles] = useState<
		{
			id: number;
			position: [number, number, number];
			rotation: [number, number, number];
			width: number;
			length: number;
			height: number;
		}[]
	>([]);
	const [mapImageUrl, setMapImageUrl] = useState<string>(
		getGoogleMapImageUrl(START_LOCATION.lat, START_LOCATION.lng, 17, 640, 640)
	);

	// 🟢 Handles the location select and updates the map texture URL
	const handleLocationSelect = (lat: number, lng: number) => {
		const mapUrl = getGoogleMapImageUrl(lat, lng, 17, 640, 640);
		setMapImageUrl(mapUrl);
	};

	const addRectangle = () => {
		const newId = rectangles.length + 1;
		const platformSize = 4;
		const halfSize = platformSize / 2;

		const randomX = Math.random() * platformSize - halfSize;
		const randomZ = Math.random() * platformSize - halfSize;

		setRectangles([
			...rectangles,
			{
				id: newId,
				position: [randomX, 0.1, randomZ],
				rotation: [0, 0, 0],
				width: 0.5,
				length: 0.5,
				height: 0.5,
			},
		]);
	};

	const updateRectanglePosition = (id: number, position: [number, number, number]) => {
		setRectangles((prev) =>
			prev.map((rect) =>
				rect.id === id
					? {
							...rect,
							position: [position[0], PLATFORM_Y + rect.height / 2, position[2]],
					  }
					: rect
			)
		);
	};

	const updateRectangleSize = (id: number, width: number, height: number, length: number) => {
		setRectangles((prev) =>
			prev.map((rect) =>
				rect.id === id
					? {
							...rect,
							width,
							height,
							length,
							position: [rect.position[0], PLATFORM_Y + height / 2, rect.position[2]],
					  }
					: rect
			)
		);
	};

	return (
		<div className="app-container">
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
					<Rectangles
						rectangles={rectangles}
						onResize={updateRectangleSize}
						onPositionChange={updateRectanglePosition}
					/>
					<OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
				</Canvas>
			</div>
			<div className="controls-container">
				<button className="add-button" onClick={addRectangle}>
					Add Square
				</button>
			</div>
		</div>
	);
};

export default App;

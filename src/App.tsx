import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";

import "./App.css";
import { getGoogleMapImageUrl } from "./utils/mapHelpers";
import Platform from "./components/Platform";
// import Rectangles from "./components/Rectangles";
import SearchBar from "./components/SearchBar";
import Shapes from "./components/Shapes";

const START_LOCATION = { lat: 45.86, lng: 25.79 };
// const PLATFORM_Y = -0.15;

const App = () => {
	const [mapImageUrl, setMapImageUrl] = useState<string>(
		getGoogleMapImageUrl(START_LOCATION.lat, START_LOCATION.lng, 17, 640, 640)
	);

	const [shapes, setShapes] = useState<
		{
			id: number;
			position: [number, number, number];
			rotation: [number, number, number];
			width: number;
			length: number;
			height: number;
			type: "box" | "cylinder" | "cone";
			sides?: number;
		}[]
	>([]);

	/* const [rectangles, setRectangles] = useState<
		{
			id: number;
			position: [number, number, number];
			rotation: [number, number, number];
			width: number;
			length: number;
			height: number;
		}[]
	>([]); */

	const handleLocationSelect = (lat: number, lng: number) => {
		const mapUrl = getGoogleMapImageUrl(lat, lng, 17, 640, 640);
		setMapImageUrl(mapUrl);
	};

	const addShape = () => {
		const newId = shapes.length + 1;
		const platformSize = 4;
		const halfSize = platformSize / 2;

		const randomX = Math.random() * platformSize - halfSize;
		const randomZ = Math.random() * platformSize - halfSize;

		const types: Array<"box" | "cylinder" | "cone"> = ["box", "cylinder", "cone"];
		const randomType = types[Math.floor(Math.random() * types.length)];

		const randomSides = Math.floor(Math.random() * 8) + 3; // 3 to 10 sides
		const randomWidth = Math.random() * 1 + 0.5;
		const randomHeight = Math.random() * 1 + 0.5;
		const randomLength = Math.random() * 1 + 0.5;

		setShapes([
			...shapes,
			{
				id: newId,
				position: [randomX, 0.1, randomZ],
				rotation: [0, 0, 0],
				width: randomWidth,
				length: randomLength,
				height: randomHeight,
				type: randomType,
				sides: randomSides,
			},
		]);
	};

	/* const addRectangle = () => {
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
	}; */

	/* const updateRectanglePosition = (id: number, position: [number, number, number]) => {
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
	}; */

	/* const updateRectangleSize = (id: number, width: number, height: number, length: number) => {
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
	}; */

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
					<Shapes shapes={shapes} />
					{/* <Rectangles
						rectangles={rectangles}
						onResize={updateRectangleSize}
						onPositionChange={updateRectanglePosition}
					/> */}
					<OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
				</Canvas>
			</div>
			<div className="controls-container">
				<button className="add-button" onClick={addShape}>
					Add Shape
				</button>
				{/* <button className="add-button" onClick={addRectangle}>
					Add Square
				</button> */}
			</div>
		</div>
	);
};

export default App;

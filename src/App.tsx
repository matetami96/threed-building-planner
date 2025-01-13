import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";

import "./App.css";
import Platform from "./components/Platform";
import Rectangles from "./components/Rectangles";

const App = () => {
	const [rectangles, setRectangles] = useState<
		{ id: number; position: [number, number, number]; rotation: [number, number, number] }[]
	>([]);
	const [controlsEnabled, setControlsEnabled] = useState(true);
	const [isDragging, setIsDragging] = useState(false);

	const addRectangle = () => {
		const newId = rectangles.length + 1;

		const platformSize = 4; // Size of the image platform
		const halfSize = platformSize / 2;

		const randomX = Math.random() * platformSize - halfSize; // X range: [-2, 2]
		const randomZ = Math.random() * platformSize - halfSize; // Z range: [-2, 2]

		setRectangles([...rectangles, { id: newId, position: [randomX, 0.1, randomZ], rotation: [0, 0, 0] }]);
	};

	const updateRectangleRotation = (id: number, rotation: [number, number, number]) => {
		setRectangles((prev) => prev.map((rect) => (rect.id === id ? { ...rect, rotation } : rect)));
	};

	return (
		<div className="app-container">
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
					<Platform />
					<Rectangles
						rectangles={rectangles}
						isDragging={isDragging}
						onDragStart={() => {
							setControlsEnabled(false);
							setIsDragging(true);
						}}
						onDragEnd={() => {
							setControlsEnabled(true);
							setIsDragging(false);
						}}
						onRotate={updateRectangleRotation}
						onEnableControls={() => setControlsEnabled(true)}
						onDisableControls={() => setControlsEnabled(false)}
					/>
					<OrbitControls enabled={controlsEnabled} />
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

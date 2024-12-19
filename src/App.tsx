import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";

import "./App.css";
import Platform from "./components/Platform";
import Rectangles from "./components/Rectangles";

const App = () => {
	const [rectangles, setRectangles] = useState<{ id: number; position: [number, number, number] }[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	const addRectangle = () => {
		const newId = rectangles.length + 1;

		// Generate a random position within the 4x4 image platform
		const platformSize = 4; // Size of the image platform
		const halfSize = platformSize / 2;

		const randomX = Math.random() * platformSize - halfSize; // X range: [-2, 2]
		const randomZ = Math.random() * platformSize - halfSize; // Z range: [-2, 2]

		setRectangles([...rectangles, { id: newId, position: [randomX, 0.1, randomZ] }]);
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
						onDragStart={() => setIsDragging(true)}
						onDragEnd={() => setIsDragging(false)}
					/>
					<OrbitControls enabled={!isDragging} />
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

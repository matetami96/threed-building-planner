import { TransformControls } from "@react-three/drei";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";

type RectangleProps = {
	rectangles: {
		id: number;
		position: [number, number, number];
		rotation: [number, number, number];
		width: number;
		length: number;
		height: number;
	}[];
	onResize: (id: number, width: number, height: number, length: number) => void;
	onPositionChange: (id: number, position: [number, number, number]) => void;
};

const Rectangles = ({ rectangles, onResize, onPositionChange }: RectangleProps) => {
	const { scene } = useThree();
	const [activeRectangle, setActiveRectangle] = useState<number | null>(null);

	// Mode state with right-click cycling logic
	const modes = ["translate", "scale", "rotate"] as const;
	const [modeIndex, setModeIndex] = useState(0);
	const mode = modes[modeIndex];

	const handleObjectClick = (id: number) => {
		setActiveRectangle(id);
	};

	const handleRightClick = (e: ThreeEvent<MouseEvent>, id: number) => {
		e.stopPropagation();
		if (activeRectangle === id) {
			setModeIndex((prev) => (prev + 1) % modes.length);
		}
	};

	return (
		<>
			{rectangles.map((rect) => (
				<group key={rect.id}>
					<mesh
						name={rect.id.toString()} // Identify mesh by ID for TransformControls
						position={[rect.position[0], rect.position[1], rect.position[2]]}
						rotation={rect.rotation}
						scale={[rect.width, rect.height, rect.length]}
						castShadow
						onClick={() => handleObjectClick(rect.id)}
						onContextMenu={(e) => handleRightClick(e, rect.id)} // Right click to cycle modes
					>
						<boxGeometry args={[1, 1, 1]} />
						<meshStandardMaterial color={activeRectangle === rect.id ? "orange" : "lightgray"} />
					</mesh>

					{/* Show TransformControls only for active rectangle */}
					{activeRectangle === rect.id && (
						<TransformControls
							mode={mode}
							showX={mode !== "rotate"}
							showY={mode !== "translate"}
							showZ={mode !== "rotate"}
							object={scene.getObjectByName(rect.id.toString()) as THREE.Object3D}
							onObjectChange={() => {
								const target = scene.getObjectByName(rect.id.toString()) as THREE.Object3D;
								if (target) {
									if (mode === "scale") {
										const newWidth = target.scale.x;
										const newHeight = target.scale.y;
										const newLength = target.scale.z;
										onResize(rect.id, newWidth, newHeight, newLength);
									} else if (mode === "translate") {
										const newPos = target.position;
										onPositionChange(rect.id, [newPos.x, newPos.y, newPos.z]);
									}
								}
							}}
						/>
					)}
				</group>
			))}
		</>
	);
};

export default Rectangles;

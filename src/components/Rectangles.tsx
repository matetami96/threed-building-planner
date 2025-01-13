import { DragControls, TransformControls } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

type RectangleProps = {
	rectangles: {
		id: number;
		position: [number, number, number];
		rotation: [number, number, number];
	}[];
	onDragStart: () => void;
	onDragEnd: () => void;
	onRotate: (id: number, rotation: [number, number, number]) => void;
	onEnableControls: () => void;
	onDisableControls: () => void;
	isDragging: boolean;
};

const Rectangles = ({
	rectangles,
	onDragStart,
	onDragEnd,
	onRotate,
	onEnableControls,
	onDisableControls,
	isDragging,
}: RectangleProps) => {
	const transformRefs = useRef<Record<number, THREE.Object3D>>({});
	const [activeRectangle, setActiveRectangle] = useState<number | null>(null);

	const handleObjectClick = (id: number) => {
		setActiveRectangle(id);
	};

	return (
		<>
			{rectangles.map((rect) => (
				<group key={rect.id}>
					<DragControls onDragStart={onDragStart} onDragEnd={onDragEnd} axisLock="y">
						<mesh
							position={rect.position}
							rotation={rect.rotation}
							castShadow
							userData={{ id: rect.id }}
							onClick={() => handleObjectClick(rect.id)}
							ref={(ref) => {
								if (ref) transformRefs.current[rect.id] = ref;
							}}
						>
							<boxGeometry args={[0.5, 0.5, 0.5]} />
							<meshStandardMaterial color={activeRectangle === rect.id ? "orange" : "lightgray"} />
						</mesh>
					</DragControls>
					{activeRectangle === rect.id && !isDragging && (
						<TransformControls
							showX={false}
							showZ={false}
							mode="rotate"
							object={transformRefs.current[rect.id]}
							onObjectChange={(event) => {
								onDisableControls();
								const mesh = event!.target as THREE.Object3D;
								const newRotation = mesh.rotation;
								onRotate(rect.id, [newRotation.x, newRotation.y, newRotation.z]);
							}}
							onMouseUp={() => onEnableControls()}
						/>
					)}
				</group>
			))}
		</>
	);
};

export default Rectangles;

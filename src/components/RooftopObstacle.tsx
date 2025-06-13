import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type RooftopObstacleProps = {
	obstacle: {
		id: string;
		position: [number, number, number];
		scale: [number, number, number];
	};
	buildingWidth: number;
	buildingLength: number;
	buildingHeight: number;
	isActive: boolean;
	transformMode: "translate" | "scale" | "rotate";
	onClick: () => void;
	onUpdate: (updated: RooftopObstacleProps["obstacle"]) => void;
};

export default function RooftopObstacle({
	obstacle,
	buildingWidth,
	buildingLength,
	buildingHeight,
	isActive,
	transformMode,
	onClick,
	onUpdate,
}: RooftopObstacleProps) {
	const [controlsTarget, setControlsTarget] = useState<THREE.Object3D | null>(null);
	const ref = useRef<THREE.Mesh>(null);

	useEffect(() => {
		const refValue: THREE.Object3D | null = ref.current;

		if (refValue) {
			setControlsTarget(refValue);
		} else {
			setControlsTarget(null);
		}

		// Optional: reset on unmount/change
		return () => setControlsTarget(null);
	}, []);

	const handleMouseUp = () => {
		const mesh = ref.current!;
		const minScale = 0.2;

		// Clamp scales
		mesh.scale.y = THREE.MathUtils.clamp(mesh.scale.y, 0.1, 5);
		mesh.scale.x = THREE.MathUtils.clamp(mesh.scale.x, minScale, buildingWidth - 0.2);
		mesh.scale.z = THREE.MathUtils.clamp(mesh.scale.z, minScale, buildingLength - 0.2);

		// Clamp position in local space
		const pos = mesh.position;
		const halfW = buildingWidth / 2;
		const halfL = buildingLength / 2;
		const halfX = mesh.scale.x / 2;
		const halfZ = mesh.scale.z / 2;

		pos.x = THREE.MathUtils.clamp(pos.x, -halfW + halfX, halfW - halfX);
		pos.z = THREE.MathUtils.clamp(pos.z, -halfL + halfZ, halfL - halfZ);
		pos.y = buildingHeight + obstacle.scale[1] / 2;

		// Update data
		onUpdate({
			...obstacle,
			position: [pos.x, pos.y, pos.z],
			scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
		});
	};

	return (
		<>
			<mesh
				ref={ref}
				position={[obstacle.position[0], buildingHeight + obstacle.scale[1] / 2, obstacle.position[2]]}
				scale={obstacle.scale}
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}
			>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial color="brown" />
			</mesh>

			{isActive && controlsTarget && (
				<TransformControls
					object={controlsTarget}
					mode={transformMode}
					showX={transformMode !== "rotate"}
					showY={transformMode === "scale"}
					showZ={transformMode !== "rotate"}
					onMouseUp={handleMouseUp}
				/>
			)}
		</>
	);
}

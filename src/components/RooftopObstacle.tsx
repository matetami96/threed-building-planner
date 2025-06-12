import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type RooftopObstacleProps = {
	obstacle: {
		id: string;
		position: [number, number, number];
		scale: [number, number, number];
	};
	buildingMatrix: THREE.Matrix4;
	buildingMatrixInverse: THREE.Matrix4;
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
	buildingMatrix,
	buildingMatrixInverse,
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

	// Local → World
	const localVec = new THREE.Vector3(...obstacle.position);
	const worldPos = localVec.clone().applyMatrix4(buildingMatrix);

	return (
		<>
			<mesh
				ref={ref}
				position={new THREE.Vector3(worldPos.x, worldPos.y + obstacle.scale[1] / 2, worldPos.z)}
				scale={new THREE.Vector3(...obstacle.scale)}
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
					showY={transformMode !== "translate"}
					showZ={transformMode !== "rotate"}
					onMouseUp={() => {
						const mesh = controlsTarget;
						const minScale = 0.2;
						const maxScale = 10; // fallback upper bound
						// Clamp scale Y (height)
						mesh.scale.y = THREE.MathUtils.clamp(mesh.scale.y, 0.1, 5);
						// Clamp scale X and Z to not exceed building footprint
						const maxScaleX = Math.min(maxScale, buildingWidth - 0.2);
						const maxScaleZ = Math.min(maxScale, buildingLength - 0.2);
						mesh.scale.x = THREE.MathUtils.clamp(mesh.scale.x, minScale, maxScaleX);
						mesh.scale.z = THREE.MathUtils.clamp(mesh.scale.z, minScale, maxScaleZ);
						// Convert world → local
						const local = mesh.position.clone().applyMatrix4(buildingMatrixInverse);
						// Get actual size after scale + rotation
						const box = new THREE.Box3().setFromObject(mesh);
						const size = new THREE.Vector3();
						box.getSize(size);
						const halfW = buildingWidth / 2;
						const halfL = buildingLength / 2;
						const halfSizeX = size.x / 2;
						const halfSizeZ = size.z / 2;
						local.x = THREE.MathUtils.clamp(local.x, -halfW + halfSizeX, halfW - halfSizeX);
						local.z = THREE.MathUtils.clamp(local.z, -halfL + halfSizeZ, halfL - halfSizeZ);
						// Set Y to be half the height so it's placed on top of the roof
						local.y = buildingHeight / 2;
						onUpdate({
							...obstacle,
							position: [local.x, local.y, local.z],
							scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
						});
					}}
				/>
			)}
		</>
	);
}

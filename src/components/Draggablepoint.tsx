import { TransformControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { BoqBuilding } from "../types";

type Props = {
	index: number;
	initial: THREE.Vector2;
	y: number;
	enabled: boolean;
	isActive: boolean;
	onClick: () => void;
	onUpdate: (index: number, newPos: THREE.Vector2) => void;
	buildingData: BoqBuilding;
};

export default function DraggablePoint({
	index,
	initial,
	y,
	enabled,
	isActive,
	onClick,
	onUpdate,
	buildingData,
}: Props) {
	const meshRef = useRef<THREE.Mesh>(null);
	const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(initial.x, y, initial.y));
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		// Convert local XZ point into world position
		const localPos = new THREE.Vector3(initial.x, 0, initial.y);

		const transformMatrix = new THREE.Matrix4().compose(
			new THREE.Vector3(...buildingData.groupPosition),
			new THREE.Quaternion().setFromEuler(new THREE.Euler(...buildingData.groupRotation)),
			new THREE.Vector3(1, 1, 1)
		);

		localPos.applyMatrix4(transformMatrix);
		localPos.y = y; // place on rooftop

		setPosition(localPos);
	}, [initial, y, buildingData]);

	const handleMouseUp = () => {
		if (!meshRef.current) return;
		const worldPos = meshRef.current.position.clone();
		const { groupPosition, groupRotation, buildingWidth, buildingLength } = buildingData;
		// Step 1: Create inverse matrix to get local space
		const inverseMatrix = new THREE.Matrix4()
			.compose(
				new THREE.Vector3(...groupPosition),
				new THREE.Quaternion().setFromEuler(new THREE.Euler(...groupRotation)),
				new THREE.Vector3(1, 1, 1)
			)
			.invert();
		// Step 2: Convert world position to local space
		const localPos = worldPos.clone().applyMatrix4(inverseMatrix);
		// Step 3: Clamp in LOCAL space
		const halfW = buildingWidth / 2;
		const halfL = buildingLength / 2;
		const circleRadius = 0.15;
		localPos.x = THREE.MathUtils.clamp(localPos.x, -halfW + circleRadius, halfW - circleRadius);
		localPos.z = THREE.MathUtils.clamp(localPos.z, -halfL + circleRadius, halfL - circleRadius);
		// Step 4: Save only XZ in local space
		const local2D = new THREE.Vector2(localPos.x, localPos.z);
		onUpdate(index, local2D);
	};

	const radius = hovered ? 0.3 : 0.15;
	const color = hovered ? "orange" : "yellow";

	return (
		<>
			<mesh
				ref={meshRef}
				position={position}
				rotation={[-Math.PI / 2, 0, 0]}
				onPointerOver={(e) => {
					e.stopPropagation();
					setHovered(true);
				}}
				onPointerOut={(e) => {
					e.stopPropagation();
					setHovered(false);
				}}
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}
			>
				<circleGeometry args={[radius, 32]} />
				<meshStandardMaterial color={color} />
			</mesh>

			{enabled && isActive && (
				<TransformControls
					object={meshRef.current!}
					mode="translate"
					showY={false}
					showX={true}
					showZ={true}
					onMouseUp={handleMouseUp}
				/>
			)}
		</>
	);
}

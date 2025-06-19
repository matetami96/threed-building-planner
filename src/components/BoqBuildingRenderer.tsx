import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

import BoqBuildingFlat from "../models/BoqBuildingFlat";
import { BoqBuilding } from "../types";

type BoqBuildingRendererProps = {
	transformTarget: "group" | "roof" | "building";
	transformMode: "translate" | "scale" | "rotate";
	buildingProps: BoqBuilding;
	disableTransform: boolean;
	onTransformUpdate?: (updated: BoqBuilding) => void;
	onBuildingClick?: (e: ThreeEvent<PointerEvent>) => void;
	children?: React.ReactNode;
};

const BoqBuildingRenderer = ({
	transformTarget,
	transformMode,
	buildingProps,
	disableTransform,
	onTransformUpdate,
	onBuildingClick,
	children,
}: BoqBuildingRendererProps) => {
	const [isDragging, setIsDragging] = useState(false);
	const groupRef = useRef<THREE.Group>(null);
	const buildingRef = useRef<THREE.Mesh>(null);
	const transformRef = useRef<THREE.Object3D>();

	useEffect(() => {
		switch (transformTarget) {
			case "group":
				transformRef.current = groupRef.current!;
				break;
			case "building":
				transformRef.current = buildingRef.current!;
				break;
			default:
				transformRef.current = undefined;
		}
	}, [transformTarget]);

	useEffect(() => {
		if (!isDragging && groupRef.current && buildingRef.current) {
			const flat = buildingProps as BoqBuildingFlat;

			const scale = buildingRef.current.scale.clone();
			scale.x = THREE.MathUtils.clamp(scale.x, 0.1, 10);
			scale.y = THREE.MathUtils.clamp(scale.y, 0.1, 10);
			scale.z = THREE.MathUtils.clamp(scale.z, 0.1, 10);

			// Update vertical position based on height
			buildingRef.current.position.y = (flat.buildingHeight * scale.y) / 2;

			// Reset mesh scale
			buildingRef.current.scale.set(1, 1, 1);

			const updated: BoqBuildingFlat = {
				...flat,
				groupPosition: [groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z],
				groupRotation: [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z],
				buildingPosition: [
					buildingRef.current.position.x,
					buildingRef.current.position.y,
					buildingRef.current.position.z,
				],
				buildingRotation: [
					buildingRef.current.rotation.x,
					buildingRef.current.rotation.y,
					buildingRef.current.rotation.z,
				],
				buildingWidth: flat.buildingWidth * scale.x,
				buildingHeight: flat.buildingHeight * scale.y,
				buildingLength: flat.buildingLength * scale.z,
			};

			onTransformUpdate?.(updated);
		}
	}, [buildingProps, isDragging, onTransformUpdate]);

	const renderFlat = () => {
		const flat = buildingProps as BoqBuildingFlat;

		return (
			<group ref={groupRef} position={flat.groupPosition} rotation={flat.groupRotation}>
				<mesh
					ref={buildingRef}
					position={flat.buildingPosition}
					rotation={flat.buildingRotation}
					onPointerDown={onBuildingClick}
				>
					<boxGeometry args={[flat.buildingWidth, flat.buildingHeight, flat.buildingLength]} />
					<meshStandardMaterial color="lightgray" />
				</mesh>
				{children}
			</group>
		);
	};

	const getAxisVisibility = () => {
		return {
			showX: transformMode === "scale" || transformMode === "translate",
			showY: (transformTarget === "building" && transformMode === "scale") || transformMode === "rotate",
			showZ: transformMode === "scale" || transformMode === "translate",
		};
	};

	return (
		<>
			{buildingProps.roofType === "flat" && renderFlat()}
			{transformRef.current && !disableTransform && (
				<TransformControls
					object={transformRef.current}
					mode={transformMode}
					showX={getAxisVisibility().showX}
					showY={getAxisVisibility().showY}
					showZ={getAxisVisibility().showZ}
					enabled
					visible
					onMouseDown={() => setIsDragging(true)}
					onMouseUp={() => setIsDragging(false)}
				/>
			)}
		</>
	);
};

export default BoqBuildingRenderer;

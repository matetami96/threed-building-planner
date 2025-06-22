import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

import BoqBuildingFlat from "../models/BoqBuildingFlat";
import { BoqBuilding } from "../types";

type BoqBuildingRendererProps = {
	currentStep: "defineBuilding" | "defineRestrictions" | "defineLayout";
	transformTarget: "group" | "roof" | "building";
	transformMode: "translate" | "scale" | "rotate";
	buildingProps: BoqBuilding;
	disableTransform: boolean;
	onTransformUpdate?: (updated: BoqBuilding) => void;
	onBuildingClick?: (e: ThreeEvent<PointerEvent>) => void;
	onDoubleClickBuilding?: () => void;
	children?: React.ReactNode;
};

const BoqBuildingRenderer = ({
	currentStep,
	transformTarget,
	transformMode,
	buildingProps,
	disableTransform,
	onTransformUpdate,
	onBuildingClick,
	onDoubleClickBuilding,
	children,
}: BoqBuildingRendererProps) => {
	const [isDragging, setIsDragging] = useState(false);
	const [buildingHovered, setBuildingHovered] = useState(false);
	const groupRef = useRef<THREE.Group>(null);
	const buildingRef = useRef<THREE.Mesh>(null);
	const transformControlsRef = useRef<React.ElementRef<typeof TransformControls>>(null);

	// Attach new target object when switching transform target
	useEffect(() => {
		if (currentStep !== "defineBuilding") return;

		const target =
			transformTarget === "group" ? groupRef.current : transformTarget === "building" ? buildingRef.current : null;

		if (transformControlsRef.current && target) {
			transformControlsRef.current.attach(target);
		}
	}, [transformTarget, currentStep]);

	useEffect(() => {
		if (!isDragging && groupRef.current && buildingRef.current) {
			const flat = buildingProps as BoqBuildingFlat;

			const scale = buildingRef.current.scale.clone();
			scale.x = THREE.MathUtils.clamp(scale.x, 0.1, 10);
			scale.y = THREE.MathUtils.clamp(scale.y, 0.1, 10);
			scale.z = THREE.MathUtils.clamp(scale.z, 0.1, 10);

			buildingRef.current.position.y = (flat.buildingHeight * scale.y) / 2;
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
					onDoubleClick={(e) => {
						e.stopPropagation();
						onDoubleClickBuilding?.();
						setBuildingHovered(false);
					}}
					onPointerOver={(e) => {
						if (currentStep === "defineBuilding") return;
						e.stopPropagation();
						setBuildingHovered(true);
					}}
					onPointerOut={(e) => {
						e.stopPropagation();
						setBuildingHovered(false);
					}}
				>
					<boxGeometry args={[flat.buildingWidth, flat.buildingHeight, flat.buildingLength]} />
					<meshStandardMaterial color={buildingHovered ? "lightblue" : "lightgray"} />
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
			{!disableTransform && (
				<TransformControls
					ref={transformControlsRef}
					mode={transformMode}
					showX={getAxisVisibility().showX}
					showY={getAxisVisibility().showY}
					showZ={getAxisVisibility().showZ}
					enabled={!disableTransform}
					visible={!disableTransform}
					onMouseDown={() => setIsDragging(true)}
					onMouseUp={() => setIsDragging(false)}
					onObjectChange={() => {
						if (!groupRef.current || !buildingRef.current) return;
						if (transformMode === "scale") return;

						const flat = buildingProps as BoqBuildingFlat;
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
							// keep original dimensions during live scale
							buildingWidth: flat.buildingWidth,
							buildingHeight: flat.buildingHeight,
							buildingLength: flat.buildingLength,
						};

						onTransformUpdate?.(updated);
					}}
				/>
			)}
		</>
	);
};

export default BoqBuildingRenderer;

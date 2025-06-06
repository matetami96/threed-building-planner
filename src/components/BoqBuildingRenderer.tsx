import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

import BoqBuildingFlat from "../models/BoqBuildingFlat";
import BoqBuildingHipped from "../models/BoqBuildingHipped";
import BoqBuildingSaddle from "../models/BoqBuildingSaddle";
// import { extractTransform } from "../utils/extractObjectTransform";
import { BoqBuilding, BuildingWithLocation } from "../types";

type BoqBuildingRendererProps = {
	transformTarget: "group" | "roof" | "building";
	transformMode: "translate" | "scale" | "rotate";
	buildingProps: BoqBuilding;
	disableTransform: boolean;
	onTransformUpdate?: (updated: BuildingWithLocation) => void;
	onBuildingClick?: (e: ThreeEvent<PointerEvent>) => void;
};

const BoqBuildingRenderer = ({
	transformTarget,
	transformMode,
	buildingProps,
	disableTransform,
	onTransformUpdate,
	onBuildingClick,
}: BoqBuildingRendererProps) => {
	const [controlsTarget, setControlsTarget] = useState<THREE.Object3D | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const groupRef = useRef<THREE.Group>(null);
	const roofRef = useRef<THREE.Mesh>(null);
	const buildingRef = useRef<THREE.Mesh>(null);

	useEffect(() => {
		let ref: THREE.Object3D | null = null;

		switch (transformTarget) {
			case "building":
				ref = buildingRef.current;
				break;
			case "roof":
				ref = roofRef.current;
				break;
			case "group":
				ref = groupRef.current;
				break;
		}

		if (ref) {
			setControlsTarget(ref);
		} else {
			setControlsTarget(null);
		}

		// Optional: reset on unmount/change
		return () => setControlsTarget(null);
	}, [transformTarget]);

	useEffect(() => {
		if (buildingProps.roofType !== "flat" || !buildingRef.current) return;
		const { buildingPosition, buildingRotation } = buildingProps as BoqBuildingFlat;

		const mesh = buildingRef.current;
		mesh.position.set(...buildingPosition);
		mesh.rotation.set(...buildingRotation);
		mesh.scale.set(1, 1, 1);
	}, [buildingProps]);

	useEffect(() => {
		if (buildingProps.roofType !== "saddle" || !groupRef.current || !buildingRef.current || !roofRef.current) return;

		const { groupPosition, groupRotation, buildingPosition, buildingRotation, roofPosition, roofRotation } =
			buildingProps as BoqBuildingSaddle;

		groupRef.current?.position.set(...groupPosition);
		groupRef.current?.rotation.set(...groupRotation);
		groupRef.current?.scale.set(1, 1, 1);

		buildingRef.current?.position.set(...buildingPosition);
		buildingRef.current?.rotation.set(...buildingRotation);
		buildingRef.current?.scale.set(1, 1, 1);

		roofRef.current?.position.set(...roofPosition);
		roofRef.current?.rotation.set(...roofRotation);
		roofRef.current?.scale.set(1, 1, 1);
	}, [buildingProps]);

	useFrame(() => {
		if (buildingProps.roofType === "flat" && buildingRef.current) {
			const mesh = buildingRef.current;

			// Prevent too small or negative Y scale
			if (mesh.scale.y < 0.05) {
				mesh.scale.y = 0.05;
			}

			// Adjust position to stay on platform
			mesh.position.y = (buildingProps.buildingHeight * mesh.scale.y) / 2;

			const newPos: [number, number, number] = [mesh.position.x, mesh.position.y, mesh.position.z];
			const newRot: [number, number, number] = [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z];
			const newScale: [number, number, number] = [mesh.scale.x, mesh.scale.y, mesh.scale.z];

			const updated = {
				...buildingProps,
				buildingPosition: newPos,
				buildingRotation: newRot,
				buildingWidth: buildingProps.buildingWidth * newScale[0],
				buildingHeight: buildingProps.buildingHeight * newScale[1],
				buildingLength: buildingProps.buildingLength * newScale[2],
			};

			// Prevent looping updates
			const isChanged = JSON.stringify(updated) !== JSON.stringify(buildingProps);

			if (isChanged) {
				if (transformMode === "scale" && !isDragging) {
					onTransformUpdate?.(updated);
				} else if (transformMode !== "scale") {
					// callback to update App state here
					onTransformUpdate?.(updated);
				}
			}
		}
	});

	useFrame(() => {
		if (
			(buildingProps.roofType === "saddle" || buildingProps.roofType === "hipped") &&
			buildingRef.current &&
			roofRef.current &&
			groupRef.current
		) {
			const building = buildingRef.current;
			const roof = roofRef.current;
			const group = groupRef.current;

			const isSaddle = buildingProps.roofType === "saddle";
			const isHipped = buildingProps.roofType === "hipped";

			const baseBuildingHeight = (buildingProps as BoqBuildingHipped | BoqBuildingSaddle).buildingHeight;

			// Clamp Y scales
			if (building.scale.y < 0.05) building.scale.y = 0.05;
			if (roof.scale.y < 0.1) roof.scale.y = 0.1;

			// Keep building above platform
			building.position.y = (baseBuildingHeight * building.scale.y) / 2;

			// Align roof on top
			if (isHipped) {
				const baseRoofHeight = (buildingProps as BoqBuildingHipped).roofHeight;
				const scaledBuildingHeight = baseBuildingHeight * building.scale.y;
				const roofOffset = (baseRoofHeight * roof.scale.y) / 2;
				roof.position.y = scaledBuildingHeight + roofOffset;
			} else if (isSaddle) {
				const topOfBuilding = building.position.y + (baseBuildingHeight * building.scale.y) / 2;
				roof.position.y = topOfBuilding;
				roof.position.z = -buildingProps.buildingLength / 2; // keep roof centered
			}

			// Now update props if saddle
			if (isSaddle) {
				const saddleBuildingProps = buildingProps as BoqBuildingSaddle;
				const baseRoofHeight = saddleBuildingProps.roofHeight;

				const updated: BoqBuildingSaddle = {
					...saddleBuildingProps,
					groupPosition: [group.position.x, group.position.y, group.position.z],
					groupRotation: [group.rotation.x, group.rotation.y, group.rotation.z],
					buildingPosition: [building.position.x, building.position.y, building.position.z],
					buildingRotation: [building.rotation.x, building.rotation.y, building.rotation.z],
					buildingHeight: baseBuildingHeight * building.scale.y,
					buildingWidth: saddleBuildingProps.buildingWidth * group.scale.x,
					buildingLength: saddleBuildingProps.buildingLength * group.scale.z,
					roofPosition: [roof.position.x, roof.position.y, roof.position.z],
					roofRotation: [roof.rotation.x, roof.rotation.y, roof.rotation.z],
					roofHeight: baseRoofHeight * roof.scale.y,
					roofWidth: saddleBuildingProps.roofWidth * group.scale.x,
					roofLength: saddleBuildingProps.roofLength * group.scale.z,
				};

				const isChanged = JSON.stringify(updated) !== JSON.stringify(buildingProps);

				if (isChanged) {
					if (transformMode === "scale" && !isDragging) {
						onTransformUpdate?.(updated);
					} else if (transformMode !== "scale") {
						onTransformUpdate?.(updated);
					}
				}
			}
		}
	});

	/* const handleSave = () => {
			const type = buildingProps.roofType;

			if (type === "flat" && buildingRef.current) {
				const { buildingWidth, buildingHeight, buildingLength } = buildingProps as BoqBuildingFlat;
				const { position, rotation, scale } = extractTransform(buildingRef.current);

				return {
					roofType: "flat",
					buildingWidth: buildingWidth * scale[0],
					buildingHeight: buildingHeight * scale[1],
					buildingLength: buildingLength * scale[2],
					buildingPosition: position,
					buildingRotation: rotation,
				};
			}

			if (type === "saddle" && groupRef.current && buildingRef.current && roofRef.current) {
				const { buildingWidth, buildingHeight, buildingLength, roofWidth, roofHeight, roofLength } =
					buildingProps as BoqBuildingSaddle;

				const group = extractTransform(groupRef.current);
				const building = extractTransform(buildingRef.current);
				const roof = extractTransform(roofRef.current);

				return {
					roofType: "saddle",
					groupPosition: group.position,
					groupRotation: group.rotation,
					buildingPosition: building.position,
					buildingRotation: building.rotation,
					buildingWidth: buildingWidth * building.scale[0],
					buildingHeight: buildingHeight * building.scale[1],
					buildingLength: buildingLength * building.scale[2],
					roofPosition: roof.position,
					roofRotation: roof.rotation,
					roofWidth: roofWidth * roof.scale[0],
					roofHeight: roofHeight * roof.scale[1],
					roofLength: roofLength * roof.scale[2],
				};
			}

			if (type === "hipped" && groupRef.current && buildingRef.current && roofRef.current) {
				const { buildingWidth, buildingHeight, buildingLength, roofRadius, roofHeight, roofSegments } =
					buildingProps as BoqBuildingHipped;

				const group = extractTransform(groupRef.current);
				const building = extractTransform(buildingRef.current);
				const roof = extractTransform(roofRef.current);

				return {
					roofType: "hipped",
					groupPosition: group.position,
					groupRotation: group.rotation,
					buildingPosition: building.position,
					buildingRotation: building.rotation,
					buildingWidth: buildingWidth * building.scale[0],
					buildingHeight: buildingHeight * building.scale[1],
					buildingLength: buildingLength * building.scale[2],
					roofPosition: roof.position,
					roofRotation: roof.rotation,
					roofRadius: roofRadius * roof.scale[0],
					roofHeight: roofHeight * roof.scale[1],
					roofSegments,
				};
			}

			return buildingProps;
		}; */

	const renderBuildingModel = () => {
		switch (buildingProps.roofType) {
			case "flat": {
				const { buildingWidth, buildingHeight, buildingLength, buildingPosition } = buildingProps as BoqBuildingFlat;

				return (
					<>
						<mesh ref={buildingRef} position={buildingPosition} key="flat" onPointerDown={onBuildingClick}>
							<boxGeometry args={[buildingWidth, buildingHeight, buildingLength]} />
							<meshStandardMaterial color="lightgray" />
						</mesh>

						{transformTarget === "building" && controlsTarget && !disableTransform && (
							<TransformControls
								key={"flat-controls"}
								showX={transformMode !== "rotate"}
								showY={transformMode !== "translate"}
								showZ={transformMode !== "rotate"}
								object={controlsTarget}
								mode={transformMode}
								onMouseDown={() => setIsDragging(true)}
								onMouseUp={() => setIsDragging(false)}
							/>
						)}
					</>
				);
			}

			case "saddle": {
				const {
					groupPosition,
					buildingPosition,
					buildingWidth,
					buildingHeight,
					buildingLength,
					roofPosition,
					roofRotation,
					roofWidth,
					roofHeight,
					roofLength,
				} = buildingProps as BoqBuildingSaddle;

				const halfWidth = roofWidth / 2;
				const shape = new THREE.Shape();
				shape.moveTo(-halfWidth, 0);
				shape.lineTo(halfWidth, 0);
				shape.lineTo(0, roofHeight);
				shape.lineTo(-halfWidth, 0);

				const extrudeSettings = {
					steps: 1,
					depth: roofLength,
					bevelEnabled: false,
				};

				const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
				const showX = transformMode !== "rotate";
				const showY = transformMode === "rotate";
				const showZ = transformMode !== "rotate";

				return (
					<>
						<group ref={groupRef} position={groupPosition} key="saddle">
							<mesh ref={buildingRef} position={buildingPosition}>
								<boxGeometry args={[buildingWidth, buildingHeight, buildingLength]} />
								<meshStandardMaterial color="lightgray" />
							</mesh>
							<mesh ref={roofRef} geometry={geometry} position={roofPosition} rotation={roofRotation}>
								<meshStandardMaterial color="sienna" />
							</mesh>
						</group>

						{transformTarget === "group" && controlsTarget && (
							<TransformControls
								key={"saddle-group-controls"}
								showX={showX}
								showY={showY}
								showZ={showZ}
								object={controlsTarget}
								mode={transformMode}
								onMouseDown={() => setIsDragging(true)}
								onMouseUp={() => setIsDragging(false)}
							/>
						)}

						{transformTarget === "roof" && controlsTarget && (
							<TransformControls
								showX={false}
								showZ={false}
								key={"saddle-roof-controls"}
								object={controlsTarget}
								mode={transformMode}
								onMouseDown={() => setIsDragging(true)}
								onMouseUp={() => setIsDragging(false)}
							/>
						)}

						{transformTarget === "building" && controlsTarget && (
							<TransformControls
								showX={false}
								showZ={false}
								key={"saddle-building-controls"}
								object={controlsTarget}
								mode={transformMode}
								onMouseDown={() => setIsDragging(true)}
								onMouseUp={() => setIsDragging(false)}
							/>
						)}
					</>
				);
			}

			case "hipped": {
				{
					const {
						groupPosition,
						buildingPosition,
						buildingWidth,
						buildingHeight,
						buildingLength,
						roofPosition,
						roofRotation,
						roofRadius,
						roofHeight,
						roofSegments,
					} = buildingProps as BoqBuildingHipped;

					const showX = transformMode !== "rotate";
					const showY = transformMode === "rotate";
					const showZ = transformMode !== "rotate";

					return (
						<>
							<group ref={groupRef} position={groupPosition} key="hipped">
								<mesh ref={buildingRef} position={buildingPosition}>
									<boxGeometry args={[buildingWidth, buildingHeight, buildingLength]} />
									<meshStandardMaterial color="lightgray" />
								</mesh>
								<mesh ref={roofRef} position={roofPosition} rotation={roofRotation}>
									<coneGeometry args={[roofRadius, roofHeight, roofSegments]} />
									<meshStandardMaterial color="sienna" />
								</mesh>
							</group>

							{transformTarget === "group" && controlsTarget && (
								<TransformControls
									key={"hipped-group-controls"}
									showX={showX}
									showY={showY}
									showZ={showZ}
									object={controlsTarget}
									mode={transformMode}
								/>
							)}

							{transformTarget === "roof" && controlsTarget && (
								<TransformControls
									showX={false}
									showZ={false}
									key={"hipped-roof-controls"}
									object={controlsTarget}
									mode={transformMode}
								/>
							)}

							{transformTarget === "building" && controlsTarget && (
								<TransformControls
									showX={false}
									showZ={false}
									key={"hipped-building-controls"}
									object={controlsTarget}
									mode={transformMode}
								/>
							)}
						</>
					);
				}
			}

			default:
				console.warn("No building type selected");
				break;
		}
	};

	return renderBuildingModel();
};

export default BoqBuildingRenderer;

import * as THREE from "three";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { TransformControls } from "@react-three/drei";

import BoqBuildingFlat from "../models/BoqBuildingFlat";
import BoqBuildingHipped from "../models/BoqBuildingHipped";
import BoqBuildingSaddle from "../models/BoqBuildingSaddle";
import { extractTransform } from "../utils/extractObjectTransform";

type BoqBuildingRendererProps = {
	transformTarget: "group" | "roof" | "building";
	transformMode: "translate" | "scale" | "rotate";
	buildingProps: BoqBuildingFlat | BoqBuildingSaddle | BoqBuildingHipped;
	onSave: () => void;
};

const BoqBuildingRenderer = forwardRef(
	({ transformTarget, transformMode, buildingProps }: BoqBuildingRendererProps, ref) => {
		const [controlsReady, setControlsReady] = useState(false);
		const [controlsTarget, setControlsTarget] = useState<THREE.Object3D | null>(null);
		const groupRef = useRef<THREE.Group>(null);
		const roofRef = useRef<THREE.Mesh>(null);
		const buildingRef = useRef<THREE.Mesh>(null);

		useEffect(() => {
			const ref =
				transformTarget === "group"
					? groupRef.current
					: transformTarget === "roof"
					? roofRef.current
					: transformTarget === "building"
					? buildingRef.current
					: null;

			if (ref && !controlsReady) {
				setControlsReady(true);
			}
		}, [controlsReady, transformTarget]);

		useEffect(() => {
			let target: THREE.Object3D | null = null;

			switch (transformTarget) {
				case "group":
					target = groupRef.current;
					break;
				case "roof":
					target = roofRef.current;
					break;
				case "building":
					target = buildingRef.current;
					break;
			}

			if (target && target.parent) {
				setControlsTarget(target); // ✅ Ready to attach
			} else {
				setControlsTarget(null); // ❌ Not ready
			}
		}, [transformTarget, buildingProps]);

		useImperativeHandle(ref, () => ({
			triggerSave: handleSave,
		}));

		const handleSave = () => {
			const type = buildingProps.type;

			if (type === "flat" && buildingRef.current) {
				const { width, height, length } = buildingProps as BoqBuildingFlat;
				const { position, rotation, scale } = extractTransform(buildingRef.current);

				return {
					type: "flat",
					buildingWidth: width * scale[0],
					buildingHeight: height * scale[1],
					buildingLength: length * scale[2],
					position,
					rotation,
				};
			}

			if (type === "saddle" && groupRef.current && buildingRef.current && roofRef.current) {
				const { buildingWidth, buildingHeight, buildingLength, roofWidth, roofHeight, roofLength } =
					buildingProps as BoqBuildingSaddle;

				const group = extractTransform(groupRef.current);
				const building = extractTransform(buildingRef.current);
				const roof = extractTransform(roofRef.current);

				return {
					type: "saddle",
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
					type: "hipped",
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
		};

		const renderBuildingModel = () => {
			switch (buildingProps.type) {
				case "flat": {
					const { position, width, height, length } = buildingProps as BoqBuildingFlat;

					return (
						<>
							<mesh ref={buildingRef} position={position} key="flat">
								<boxGeometry args={[width, height, length]} />
								<meshStandardMaterial color="lightgray" />
							</mesh>

							{controlsReady && buildingRef.current && transformTarget === "building" && controlsTarget && (
								<TransformControls
									key={"flat-controls"}
									showX={transformMode !== "rotate"}
									showY={transformMode !== "rotate"}
									object={buildingRef.current}
									mode={transformMode}
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

							{controlsReady && transformTarget === "group" && groupRef.current && controlsTarget && (
								<TransformControls
									key={"saddle-group-controls"}
									showX={transformMode !== "rotate"}
									showY={transformMode !== "rotate"}
									object={groupRef.current}
									mode={transformMode}
								/>
							)}

							{controlsReady && transformTarget === "roof" && roofRef.current && controlsTarget && (
								<TransformControls key={"saddle-roof-controls"} object={roofRef.current} mode={transformMode} />
							)}

							{controlsReady && transformTarget === "building" && buildingRef.current && controlsTarget && (
								<TransformControls key={"saddle-building-controls"} object={buildingRef.current} mode={transformMode} />
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

								{controlsReady && transformTarget === "group" && groupRef.current && controlsTarget && (
									<TransformControls
										key={"hipped-group-controls"}
										showX={transformMode !== "rotate"}
										showY={transformMode !== "rotate"}
										object={groupRef.current}
										mode={transformMode}
									/>
								)}

								{controlsReady && transformTarget === "roof" && roofRef.current && controlsTarget && (
									<TransformControls key={"hipped-roof-controls"} object={roofRef.current} mode={transformMode} />
								)}

								{controlsReady && transformTarget === "building" && buildingRef.current && controlsTarget && (
									<TransformControls
										key={"hipped-building-controls"}
										object={buildingRef.current}
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
	}
);

export default BoqBuildingRenderer;

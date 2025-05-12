import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TransformControls, Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";

const Flathouse = () => {
	const [currentTransformTarget, setCurrentTransformTarget] = useState<"building" | null>(null);
	const [modeIndex, setModeIndex] = useState(0);
	const buildingRef = useRef<THREE.Mesh>(null);
	const modes = ["translate", "scale", "rotate"] as const;
	const mode = modes[modeIndex];

	const boxWidth = 0.5;
	const boxHeight = 0.2;
	const boxDepth = 0.5;

	useEffect(() => {
		const onRightClick = (e: MouseEvent) => {
			e.preventDefault();
			setModeIndex((prev) => (prev + 1) % modes.length);
		};

		window.addEventListener("contextmenu", onRightClick);

		return () => {
			window.removeEventListener("contextmenu", onRightClick);
		};
	}, [modes.length]);

	useEffect(() => {
		if (!currentTransformTarget) {
			setCurrentTransformTarget("building");
		}
	}, [currentTransformTarget]);

	const handleRightClick = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation();
		setModeIndex((prev) => (prev + 1) % modes.length);
	};

	return (
		<>
			<Html position={[0.5, 0.6, 0]}>
				<button
					onClick={() => {
						const building = buildingRef.current;

						if (!building) {
							console.warn("Refs not ready");
							return;
						}

						// POSITION & ROTATION
						const { x, y, z } = building.position;
						const rotationZ = building.rotation.z;

						// DIMENSIONS
						const buildingScale = building.scale;

						const buildingDims = {
							width: boxWidth * buildingScale.x,
							height: boxHeight * buildingScale.y,
							length: boxDepth * buildingScale.z,
						};

						console.log("🏠Flat roofed house info:");
						console.table({
							position: { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) },
							rotationZ: rotationZ.toFixed(2),
							buildingDims,
						});
					}}
				>
					Log House Info
				</button>
			</Html>

			<mesh ref={buildingRef} position={[0, 0.01, 0]}>
				<boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
				<meshStandardMaterial color="lightgray" />
			</mesh>

			{currentTransformTarget === "building" && buildingRef.current && (
				<TransformControls
					showX={mode !== "rotate"}
					showY={mode !== "rotate"}
					mode={mode}
					object={buildingRef.current}
					onContextMenu={handleRightClick}
				/>
			)}
		</>
	);
};

export default Flathouse;

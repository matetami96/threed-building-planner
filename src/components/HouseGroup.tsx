import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TransformControls, Html } from "@react-three/drei";
import { ThreeEvent /* , useFrame */ } from "@react-three/fiber";
// import GableRoof from "./Gableroof";

const HouseGroup = () => {
	const [currentTransformTarget, setCurrentTransformTarget] = useState<"group" | "roof" | "building" | null>(null);
	// const [groupScale, setGroupScale] = useState<[number, number, number]>([1, 1, 1]);
	// const [roofScale, setRoofScale] = useState<[number, number, number]>([1, 1, 1]);
	const [modeIndex, setModeIndex] = useState(0);

	const groupRef = useRef<THREE.Group>(null);
	const roofRef = useRef<THREE.Mesh>(null);
	const buildingRef = useRef<THREE.Mesh>(null);

	const modes = ["translate", "scale", "rotate"] as const;
	const mode = modes[modeIndex];

	const boxWidth = 0.5;
	const boxHeight = 0.3;
	const boxDepth = 0.5;
	const coneRadius = 0.35;
	const coneHeight = 0.2;
	const coneSegments = 4;

	/* useFrame(() => {
		if (groupRef.current) {
			const { x, y, z } = groupRef.current.scale;
			setGroupScale((prev) => (prev[0] !== x || prev[1] !== y || prev[2] !== z ? [x, y, z] : prev));
		}

		if (roofRef.current) {
			const { x, y, z } = roofRef.current.scale;
			setRoofScale((prev) => (prev[0] !== x || prev[1] !== y || prev[2] !== z ? [x, y, z] : prev));
		}
	}); */

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
			setCurrentTransformTarget("group");
		}
	}, [currentTransformTarget]);

	// Optional: Keep it slowly rotating (visual test)
	// useFrame(() => {
	//   if (groupRef.current) {
	//     groupRef.current.rotation.y += 0.001;
	//   }
	// });

	const handleRightClick = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation();
		setModeIndex((prev) => (prev + 1) % modes.length);
	};

	const handleTransformTargetChange = () => {
		setCurrentTransformTarget((prev) => {
			// if (prev === null) {
			// 	return "group";
			// }

			if (prev === "group") {
				return "roof";
			}

			if (prev === "roof") {
				return "building";
			}

			if (prev === "building") {
				return "group";
			}

			return prev;
		});
	};

	return (
		<>
			<Html position={[0.5, 0.6, 0]}>
				<button
					onClick={() => {
						const group = groupRef.current;
						const building = buildingRef.current;
						const roof = roofRef.current;

						if (!group || !building || !roof) {
							console.warn("Refs not ready");
							return;
						}

						// GROUP POSITION & ROTATION
						const { x, y, z } = group.position;
						const rotationZ = group.rotation.z;

						// DIMENSIONS
						const buildingScale = building.scale;
						const roofScale = roof.scale;

						const buildingDims = {
							width: boxWidth * buildingScale.x,
							height: boxHeight * buildingScale.y,
							length: boxDepth * buildingScale.z,
						};

						const roofDims = {
							radius: coneRadius * roofScale.x, // assume uniform scale for now
							height: coneHeight * roofScale.y,
						};

						console.log("🏠 House info:");
						console.table({
							position: { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) },
							rotationZ: rotationZ.toFixed(2),
							buildingDims,
							roofDims,
						});
					}}
				>
					Log House Info
				</button>
			</Html>

			<Html position={[0, 0.6, 0]}>
				<button onClick={handleTransformTargetChange}>
					{currentTransformTarget ? "Control:" : ""}{" "}
					{currentTransformTarget === "group"
						? "House (group)"
						: currentTransformTarget === "roof"
						? "Roof"
						: "Building"}
				</button>
			</Html>
			<group ref={groupRef} position={[0, -0.148, 0]}>
				<mesh ref={buildingRef} position={[0, boxHeight / 2, 0]}>
					<boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
					<meshStandardMaterial color="lightgray" />
				</mesh>
				<mesh ref={roofRef} position={[0, boxHeight + coneHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
					<coneGeometry args={[coneRadius, coneHeight, coneSegments]} />
					<meshStandardMaterial color="sienna" />
				</mesh>
				{/* <GableRoof
					ref={roofRef}
					width={boxWidth}
					height={0.4}
					length={boxDepth}
					position={[0, boxHeight, -boxDepth / 2]} // offset because extrude goes forward
					rotation={[0, 0, 0]}
				/> */}
			</group>

			{currentTransformTarget === "group" && groupRef.current && (
				<TransformControls
					showX={mode !== "rotate"}
					showY={mode !== "rotate"}
					object={groupRef.current!}
					mode={mode}
					onContextMenu={handleRightClick}
				/>
			)}

			{/* {currentTransformTarget === "group" && (
				<Html position={[0, 1.3, 0]}>
					<div style={{ background: "white", padding: "4px", borderRadius: "4px", fontSize: "12px", width: "8rem" }}>
						<b>Group Dimensions:</b>
						<br />
						Width: {(boxWidth * groupScale[0]).toFixed(2)}
						<br />
						Height: {(boxHeight * groupScale[1]).toFixed(2)}
						<br />
						Length: {(boxLength * groupScale[2]).toFixed(2)}
					</div>
				</Html>
			)} */}

			{currentTransformTarget === "roof" && roofRef.current && (
				<TransformControls object={roofRef.current!} mode="scale" />
			)}

			{/* {currentTransformTarget === "roof" && (
				<Html position={[0, 1.5, 0]}>
					<div style={{ background: "white", padding: "4px", borderRadius: "4px", fontSize: "12px", width: "8rem" }}>
						<b>Roof Dimensions:</b>
						<br />
						Diameter: {(coneRadius * 2 * roofScale[0]).toFixed(2)}
						<br />
						Height: {(coneHeight * roofScale[1]).toFixed(2)}
					</div>
				</Html>
			)} */}

			{currentTransformTarget === "building" && buildingRef.current && (
				<TransformControls object={buildingRef.current!} mode="scale" />
			)}

			{/* <TransformControls object={groupRef.current!} mode={mode} onContextMenu={handleRightClick}>
				<group ref={groupRef} position={[0, 0, 0]}>
					<mesh position={[0, boxHeight / 2, 0]}>
						<boxGeometry args={[1, boxHeight, 1]} />
						<meshStandardMaterial color="lightgray" />
					</mesh>
					<mesh position={[0, boxHeight + coneHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
						<coneGeometry args={[0.7, coneHeight, 4]} />
						<meshStandardMaterial color="sienna" />
					</mesh>
				</group>
			</TransformControls> */}
		</>
	);
};

export default HouseGroup;

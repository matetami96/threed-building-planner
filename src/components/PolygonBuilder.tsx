import { useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { Html, TransformControls } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";

const PolygonBuilder = () => {
	const [points, setPoints] = useState<THREE.Vector2[]>([]);
	const [finished, setFinished] = useState(false);
	const modes = ["translate", "scale", "rotate"] as const;
	const [modeIndex, setModeIndex] = useState(0);
	const mode = modes[modeIndex];

	const handleRightClick = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation();
		setModeIndex((prev) => (prev + 1) % modes.length);
	};

	const planeRef = useRef<THREE.Mesh>(null);
	const height = 0.5;

	// 🟡 Handle click on the plane to add points
	const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
		if (finished) return;

		// Convert 3D point (x, y, z) → 2D Vector2 (x, z)
		const x = e.point.x;
		const z = e.point.z;
		const newPoint = new THREE.Vector2(x, z);

		setPoints([...points, newPoint]);
	};

	// 🟢 Convert points to shape + extrude geometry (once finished)
	const extrudedGeometry = useMemo(() => {
		if (!finished || points.length < 3) return null;

		const shape = new THREE.Shape();
		shape.moveTo(points[0].x, points[0].y);
		points.slice(1).forEach((p) => shape.lineTo(p.x, p.y));

		return new THREE.ExtrudeGeometry(shape, {
			depth: height,
			bevelEnabled: false,
		});
	}, [finished, points]);

	return (
		<>
			{/* Clickable ground plane */}
			{!finished && (
				<mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onPointerDown={handlePointerDown}>
					<planeGeometry args={[5, 5]} />
					<meshStandardMaterial color="white" opacity={0.2} transparent />
				</mesh>
			)}

			{/* Points preview (small spheres) */}
			{!finished &&
				points.map((p, i) => (
					<mesh key={i} position={[p.x, 0.01, p.y]}>
						<sphereGeometry args={[0.05, 8, 8]} />
						<meshStandardMaterial color="yellow" />
					</mesh>
				))}

			{/* Connecting lines (preview shape outline) */}
			{!finished &&
				points.length >= 2 &&
				points.map((p, i) => {
					if (i === 0) return null;
					const prev = points[i - 1];
					const mid = new THREE.Vector3((p.x + prev.x) / 2, 0.02, (p.y + prev.y) / 2);
					const length = new THREE.Vector2(p.x - prev.x, p.y - prev.y).length();

					const angle = Math.atan2(p.y - prev.y, p.x - prev.x);
					return (
						<mesh key={`line-${i}`} position={mid} rotation={[0, -angle, 0]}>
							<boxGeometry args={[length, 0.01, 0.01]} />
							<meshStandardMaterial color="white" />
						</mesh>
					);
				})}

			{/* Finished building mesh */}
			{extrudedGeometry && (
				<TransformControls mode={mode} onContextMenu={handleRightClick}>
					<mesh position={[0, height / 2, 0]}>
						<primitive object={extrudedGeometry} attach="geometry" />
						<meshStandardMaterial color="skyblue" />
					</mesh>
				</TransformControls>
			)}

			{/* UI */}
			<Html position={[0, 1.5, 0]} center>
				<button onClick={() => setFinished(true)} style={{ padding: "6px 12px" }}>
					Finish Building
				</button>
			</Html>
		</>
	);
};

export default PolygonBuilder;

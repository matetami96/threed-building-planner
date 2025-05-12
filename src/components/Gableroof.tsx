import * as THREE from "three";
import { useMemo, forwardRef } from "react";
import { MeshProps } from "@react-three/fiber";

type GableRoofProps = {
	width?: number;
	height?: number;
	length?: number;
} & MeshProps;

const GableRoof = forwardRef<THREE.Mesh, GableRoofProps>(
	({ width = 1, height = 0.5, length = 1, position = [0, 0, 0], rotation = [0, 0, 0], ...rest }, ref) => {
		const geometry = useMemo(() => {
			const halfWidth = width / 2;

			const shape = new THREE.Shape();
			shape.moveTo(-halfWidth, 0);
			shape.lineTo(halfWidth, 0);
			shape.lineTo(0, height);
			shape.lineTo(-halfWidth, 0);

			const extrudeSettings = {
				steps: 1,
				depth: length,
				bevelEnabled: false,
			};

			return new THREE.ExtrudeGeometry(shape, extrudeSettings);
		}, [width, height, length]);

		return (
			<mesh ref={ref} geometry={geometry} position={position} rotation={rotation} {...rest}>
				<meshStandardMaterial color="sienna" />
			</mesh>
		);
	}
);

export default GableRoof;

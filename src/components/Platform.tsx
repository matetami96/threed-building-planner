import { useLoader } from "@react-three/fiber";
import { TextureLoader, DoubleSide } from "three";

const Platform = () => {
	const texture = useLoader(TextureLoader, "/map.png"); // Load the image texture

	return (
		<>
			{/* Main Platform */}
			<mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[20, 20]} />
				<meshBasicMaterial color="grey" side={DoubleSide} />
			</mesh>

			{/* Smaller Plane with Image Texture */}
			<mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[5, 5]} />
				<meshBasicMaterial map={texture} side={DoubleSide} />
			</mesh>
		</>
	);
};

export default Platform;

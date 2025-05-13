import { useLoader } from "@react-three/fiber";
import { TextureLoader, DoubleSide } from "three";

type PlatformProps = {
	mapImageUrl: string;
};

const Platform = ({ mapImageUrl }: PlatformProps) => {
	const texture = useLoader(TextureLoader, mapImageUrl);

	return (
		<>
			<mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[20, 20]} />
				<meshBasicMaterial color="grey" side={DoubleSide} />
			</mesh>

			<mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[5, 5]} />
				<meshBasicMaterial map={texture} side={DoubleSide} />
			</mesh>
		</>
	);
};

export default Platform;

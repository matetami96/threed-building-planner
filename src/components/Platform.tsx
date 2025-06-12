import { useLoader } from "@react-three/fiber";
import { TextureLoader, DoubleSide } from "three";

type PlatformProps = {
	mapImageUrl: string;
	currentlySelectedLocation: { lat: number; lng: number };
};

const MAP_IMAGE_PX = 640;
const ZOOM = 17;

const Platform = ({ mapImageUrl, currentlySelectedLocation }: PlatformProps) => {
	const texture = useLoader(TextureLoader, mapImageUrl);

	const metersPerPixel = (156543.03392 * Math.cos((currentlySelectedLocation.lat * Math.PI) / 180)) / Math.pow(2, ZOOM);
	const mapSizeInMeters = metersPerPixel * MAP_IMAGE_PX;
	const mainPlatformSize = mapSizeInMeters * 1.25; // make the grey platform 25% larger

	return (
		<>
			<mesh position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[mainPlatformSize, mainPlatformSize]} />
				<meshBasicMaterial color="grey" side={DoubleSide} />
			</mesh>

			<mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[mapSizeInMeters, mapSizeInMeters]} />
				<meshBasicMaterial map={texture} side={DoubleSide} />
			</mesh>
		</>
	);
};

export default Platform;

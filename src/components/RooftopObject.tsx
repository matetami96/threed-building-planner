import { useState } from "react";

type RooftopObjectProps = {
	activeRoofObjectId: string | null;
	roofObject: {
		id: string;
		position: [number, number, number];
		scale: [number, number, number];
	};
	onClick: () => void;
	onDoubleClick: () => void;
};

export default function RooftopObject({ activeRoofObjectId, roofObject, onClick, onDoubleClick }: RooftopObjectProps) {
	const [roofObjectHovered, setRoofObjectHovered] = useState(false);

	const decideColor = () => {
		if (roofObjectHovered) return "#DAA520";
		if (activeRoofObjectId === roofObject.id) return "orange";
		return "brown";
	};

	return (
		<mesh
			position={[roofObject.position[0], roofObject.position[1], roofObject.position[2]]}
			scale={roofObject.scale}
			onPointerOver={() => setRoofObjectHovered(true)}
			onPointerOut={() => setRoofObjectHovered(false)}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			onDoubleClick={(e) => {
				e.stopPropagation();
				onDoubleClick();
			}}
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={decideColor()} />
		</mesh>
	);
}

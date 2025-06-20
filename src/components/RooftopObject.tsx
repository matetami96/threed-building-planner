type RooftopObjectProps = {
	activeRoofObjectId: string | null;
	roofObject: {
		id: string;
		position: [number, number, number];
		scale: [number, number, number];
	};
	onClick: () => void;
};

export default function RooftopObject({ activeRoofObjectId, roofObject, onClick }: RooftopObjectProps) {
	return (
		<mesh
			position={[roofObject.position[0], roofObject.position[1], roofObject.position[2]]}
			scale={roofObject.scale}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={activeRoofObjectId === roofObject.id ? "orange" : "brown"} />
		</mesh>
	);
}

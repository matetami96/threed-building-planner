type RooftopObjectProps = {
	obstacle: {
		id: string;
		position: [number, number, number];
		scale: [number, number, number];
	};
	onClick: () => void;
};

export default function RooftopObject({ obstacle, onClick }: RooftopObjectProps) {
	return (
		<mesh
			position={[obstacle.position[0], obstacle.position[1], obstacle.position[2]]}
			scale={obstacle.scale}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color="brown" />
		</mesh>
	);
}

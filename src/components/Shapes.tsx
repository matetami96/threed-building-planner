type ShapeProps = {
	shapes: {
		id: number;
		position: [number, number, number];
		rotation: [number, number, number];
		width: number;
		length: number;
		height: number;
		type: "box" | "cylinder" | "cone";
		sides?: number;
	}[];
};

const Shapes = ({ shapes }: ShapeProps) => {
	return (
		<>
			{shapes.map((shape) => (
				<mesh
					key={shape.id}
					position={shape.position}
					rotation={shape.rotation}
					scale={[shape.width, shape.height, shape.length]}
					castShadow
				>
					{shape.type === "box" ? (
						<boxGeometry args={[1, 1, 1]} />
					) : shape.type === "cylinder" ? (
						<cylinderGeometry args={[0.5, 0.5, 1, shape.sides || 8]} />
					) : shape.type === "cone" ? (
						<coneGeometry args={[0.5, 1, shape.sides || 8]} />
					) : null}
					<meshStandardMaterial color="lightblue" />
				</mesh>
			))}
		</>
	);
};

export default Shapes;

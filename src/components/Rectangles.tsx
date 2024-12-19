import { DragControls } from "@react-three/drei";

type RectangleProps = {
	rectangles: { id: number; position: [number, number, number] }[];
	onDragStart: () => void;
	onDragEnd: () => void;
};

const Rectangles = ({ rectangles, onDragStart, onDragEnd }: RectangleProps) => {
	return (
		<>
			{rectangles.map((rect) => (
				<DragControls key={rect.id} onDragStart={() => onDragStart()} onDragEnd={() => onDragEnd()} axisLock="y">
					<mesh key={rect.id} position={rect.position}>
						{/* Rectangle with width=1, height=0.2, depth=1 */}
						<boxGeometry args={[0.5, 0.5, 0.5]} />
						<meshStandardMaterial color="lightgray" />
					</mesh>
				</DragControls>
			))}
		</>
	);
};

export default Rectangles;

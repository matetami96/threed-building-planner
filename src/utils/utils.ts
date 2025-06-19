import * as THREE from "three";
import { BoqBuilding, Segment } from "../types";

export function extractTransform(obj: THREE.Object3D) {
	const position = new THREE.Vector3();
	const scale = new THREE.Vector3();
	const quaternion = new THREE.Quaternion();
	const rotation = new THREE.Euler();

	obj.getWorldPosition(position);
	obj.getWorldScale(scale);
	obj.getWorldQuaternion(quaternion);
	rotation.setFromQuaternion(quaternion);

	return {
		position: [position.x, position.y, position.z] as [number, number, number],
		rotation: [rotation.x, rotation.y, rotation.z] as [number, number, number],
		scale: [scale.x, scale.y, scale.z] as [number, number, number],
	};
}

export const getTransformedPoints = (
	points: THREE.Vector2[],
	currentBuildingData: BoqBuilding
): [number, number, number][] => {
	const matrix = new THREE.Matrix4().compose(
		new THREE.Vector3(...currentBuildingData!.groupPosition),
		new THREE.Quaternion().setFromEuler(new THREE.Euler(...currentBuildingData!.groupRotation)),
		new THREE.Vector3(1, 1, 1)
	);

	return points.map((p) => {
		const localVec = new THREE.Vector3(p.x, 0, p.y).applyMatrix4(matrix);
		return [localVec.x, currentBuildingData!.buildingHeight, localVec.z];
	});
};

export const adjustSegmentLength = (
	index: number,
	newLength: number,
	drawPoints: THREE.Vector2[],
	isDrawingClosed: boolean,
	closingPointIndex: number | null,
	buildingWidth: number,
	buildingLength: number,
	setDrawPoints: React.Dispatch<React.SetStateAction<THREE.Vector2[]>>
) => {
	const updatedPoints = [...drawPoints];

	const from = updatedPoints[index];

	let to: THREE.Vector2 | undefined;

	if (index < updatedPoints.length - 1) {
		to = updatedPoints[index + 1];
	} else if (isDrawingClosed && closingPointIndex !== null) {
		to = updatedPoints[closingPointIndex];
	} else {
		to = updatedPoints[0]; // fallback for special closing case
	}

	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const originalLength = Math.sqrt(dx * dx + dy * dy);
	if (originalLength === 0) return;

	const direction = new THREE.Vector2(dx, dy).normalize();

	// ✅ Clamp to building bounds
	const maxLength = getMaxLengthInsideBuilding(from, direction, buildingWidth, buildingLength, 0.15);

	const clampedLength = Math.min(newLength, maxLength);

	const scale = clampedLength / originalLength;
	const newTo = new THREE.Vector2(from.x + dx * scale, from.y + dy * scale);

	if (index < updatedPoints.length - 1) {
		updatedPoints[index + 1] = newTo;
	} else {
		updatedPoints[0] = newTo;
	}

	setDrawPoints(updatedPoints);
};

export const getMaxLengthInsideBuilding = (
	from: THREE.Vector2,
	direction: THREE.Vector2,
	buildingWidth: number,
	buildingLength: number,
	buffer = 0
): number => {
	let maxLength = Infinity;

	const halfWidth = buildingWidth / 2;
	const halfLength = buildingLength / 2;

	if (direction.x > 0) {
		maxLength = Math.min(maxLength, (halfWidth - from.x - buffer) / direction.x);
	} else if (direction.x < 0) {
		maxLength = Math.min(maxLength, (-halfWidth - from.x + buffer) / direction.x);
	}

	if (direction.y > 0) {
		maxLength = Math.min(maxLength, (halfLength - from.y - buffer) / direction.y);
	} else if (direction.y < 0) {
		maxLength = Math.min(maxLength, (-halfLength - from.y + buffer) / direction.y);
	}

	return Math.max(0, maxLength);
};

export const getMaxSegmentLength = (segment: Segment, buildingWidth: number, buildingLength: number) => {
	const from = segment.from;
	const to = segment.to;
	const direction = to.clone().sub(from).normalize();

	return getMaxLengthInsideBuilding(from, direction, buildingWidth, buildingLength, 0.15).toFixed(2);
};

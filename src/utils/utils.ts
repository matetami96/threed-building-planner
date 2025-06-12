import * as THREE from "three";
import BoqBuilding from "../models/BoqBuilding";

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
		new THREE.Vector3(...currentBuildingData!.buildingPosition),
		new THREE.Quaternion().setFromEuler(new THREE.Euler(...currentBuildingData!.buildingRotation)),
		new THREE.Vector3(1, 1, 1)
	);

	return points.map((p) => {
		const localVec = new THREE.Vector3(p.x, 0, p.y).applyMatrix4(matrix);
		return [localVec.x, currentBuildingData!.buildingHeight, localVec.z];
	});
};

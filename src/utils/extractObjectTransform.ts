import * as THREE from "three";

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

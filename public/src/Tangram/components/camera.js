import { PerspectiveCamera } from "../../../vendor/three/build/three.module.js";

function createCamera() {
  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    500
  );

  // move the camera back so we can view the scene
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  return camera;
}

export { createCamera };

import {
  BufferGeometry,
  Line,
  Vector3,
  LineBasicMaterial,
} from "../../../vendor/three/build/three.module.js";

function createAxis() {
  // create a default (gray) LineBasic material
  const material = new LineBasicMaterial({
    color: 0x8f8f8f,
  });

  const points = [];
  // origin
  points.push(new Vector3(0, 0, 0));
  // x-axis
  points.push(new Vector3(10, 0, 0));
  points.push(new Vector3(9, 1, 0));
  points.push(new Vector3(10, 0, 0));
  points.push(new Vector3(9, -1, 0));
  points.push(new Vector3(10, 0, 0));
  points.push(new Vector3(0, 0, 0));
  // y-axis
  points.push(new Vector3(0, 10, 0));
  points.push(new Vector3(1, 9, 0));
  points.push(new Vector3(0, 10, 0));
  points.push(new Vector3(-1, 9, 0));
  points.push(new Vector3(0, 10, 0));
  points.push(new Vector3(0, 0, 0));

  // create a geometry
  const geometry = new BufferGeometry().setFromPoints(points);

  const axis = new Line(geometry, material);

  return axis;
}

export { createAxis };

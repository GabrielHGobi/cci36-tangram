import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Group, EdgesGeometry, LineBasicMaterial, LineSegments } from '../../../vendor/three/build/three.module.js';

function createParallelogram(name, color) {

  const parallelogramShape = new Shape();
  
  parallelogramShape.moveTo(0, - Math.sqrt(2)/8);
  parallelogramShape.lineTo( + Math.sqrt(2)/4, - Math.sqrt(2)/8);
  parallelogramShape.lineTo(0, + Math.sqrt(2)/8);
  parallelogramShape.lineTo( - Math.sqrt(2)/4, + Math.sqrt(2)/8);
  parallelogramShape.lineTo(0, - Math.sqrt(2)/8);

  // create a geometry and edge geometry
  const geometry = new ShapeGeometry( parallelogramShape );
  const edge_geometry = new EdgesGeometry( geometry );

  // create a default (white) Basic material
  const material = new MeshBasicMaterial({color: color});

  // create a Basic material for the edges
  const edge_mat = new LineBasicMaterial({color: "black", linewidth: 1});

  // create a Mesh and Edhes containing the geometry and material
  const mesh = new Mesh(geometry, material);
  const edges = new LineSegments(edge_geometry, edge_mat);

  // grouping the mesh and the edges
  const parallelogram = new Group();
  parallelogram.name = name;
  parallelogram.add(mesh);
  parallelogram.add(edges);

  return parallelogram;
}

export { createParallelogram };
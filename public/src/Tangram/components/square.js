import { Mesh, MeshBasicMaterial, LineBasicMaterial, Shape, ShapeGeometry, Group, LineSegments, EdgesGeometry } from '../../../vendor/three/build/three.module.js';

function createSquare(name, color) {

  const squareShape = new Shape();
  
  squareShape.moveTo( -Math.sqrt(2)/8, -Math.sqrt(2)/8);
  squareShape.lineTo( + Math.sqrt(2)/8, -Math.sqrt(2)/8);
  squareShape.lineTo( + Math.sqrt(2)/8, + Math.sqrt(2)/8);
  squareShape.lineTo( - Math.sqrt(2)/8, + Math.sqrt(2)/8);
  squareShape.lineTo( - Math.sqrt(2)/8, - Math.sqrt(2)/8)
  
  // create a geometry and edge geometry
  const geometry = new ShapeGeometry( squareShape );
  const edge_geometry = new EdgesGeometry( geometry );

  // create a default (white) Basic material
  const material = new MeshBasicMaterial({color: color});

  // create a Basic material for the edges
  const edge_mat = new LineBasicMaterial({color: "black", linewidth: 1});

  // create a Mesh and Edhes containing the geometry and material
  const mesh = new Mesh(geometry, material);
  const edges = new LineSegments(edge_geometry, edge_mat);

  // grouping the mesh and the edges
  const square = new Group();
  square.name = name;
  square.add(mesh);
  square.add(edges);

  return square;
}

export { createSquare };
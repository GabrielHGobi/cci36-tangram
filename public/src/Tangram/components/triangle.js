import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Group, EdgesGeometry, LineBasicMaterial, LineSegments } from '../../../vendor/three/build/three.module.js';

function createTriangle(x, y, scale, color) {

  const triangleShape = new Shape();

  triangleShape.moveTo(x - Math.sqrt(2)/4/3, y - Math.sqrt(2)/4/3);
  triangleShape.lineTo(x + 2*Math.sqrt(2)/4/3, y - Math.sqrt(2)/4/3);
  triangleShape.lineTo(x - Math.sqrt(2)/4/3, y + 2*Math.sqrt(2)/4/3);
  triangleShape.moveTo(x - Math.sqrt(2)/4/3, y - Math.sqrt(2)/4/3);
  
  // create a geometry and edge geometry
  const geometry = new ShapeGeometry( triangleShape );
  const edge_geometry = new EdgesGeometry( geometry );
  geometry.scale(scale, scale, 1);  
  edge_geometry.scale(scale, scale, 1);

  // create a default Basic material
  const material = new MeshBasicMaterial({color: color});

  // create a Basic material for the edges
  const edge_mat = new LineBasicMaterial({color: "black", linewidth: 1});

  // create a Mesh and Edhes containing the geometry and material
  const mesh = new Mesh(geometry, material);
  const edges = new LineSegments(edge_geometry, edge_mat);

  // grouping the mesh and the edges
  const triangle = new Group();
  triangle.add(mesh);
  triangle.add(edges);

  return triangle;
}

export { createTriangle };
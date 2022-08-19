import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Group, EdgesGeometry, LineBasicMaterial, LineSegments } from '../../../vendor/three/build/three.module.js';

function createTriangle(name, size, color) {

  const triangleShape = new Shape();

  triangleShape.moveTo( - Math.sqrt(2)/4/3, - Math.sqrt(2)/4/3);
  triangleShape.lineTo( + 2*Math.sqrt(2)/4/3, - Math.sqrt(2)/4/3);
  triangleShape.lineTo( - Math.sqrt(2)/4/3, + 2*Math.sqrt(2)/4/3);
  triangleShape.moveTo( - Math.sqrt(2)/4/3, - Math.sqrt(2)/4/3);
  
  // create a geometry and edge geometry
  const geometry = new ShapeGeometry( triangleShape );
  const edge_geometry = new EdgesGeometry( geometry );

  // transform the triangle scale depending on size param
  switch (size) {
    case 'small':
      geometry.scale(1, 1, 1);  
      edge_geometry.scale(1, 1, 1);
      break;
    case 'medium':
      geometry.scale(Math.sqrt(2), Math.sqrt(2), 1);  
      edge_geometry.scale(Math.sqrt(2), Math.sqrt(2), 1);
      break;
    case 'large':
      geometry.scale(2, 2, 1);  
      edge_geometry.scale(2, 2, 1);
      break;
    default:
      console.error("Invalid size param on createTriangle (\"small\", \"medium\", \"large\")");
      break;
  }
  

  // create a default Basic material
  const material = new MeshBasicMaterial({color: color});

  // create a Basic material for the edges
  const edge_mat = new LineBasicMaterial({color: "black", linewidth: 1});

  // create a Mesh and Edhes containing the geometry and material
  const mesh = new Mesh(geometry, material);
  const edges = new LineSegments(edge_geometry, edge_mat);

  // grouping the mesh and the edges
  const triangle = new Group();
  triangle.name = name;
  triangle.add(mesh);
  triangle.add(edges);

  return triangle;
}

export { createTriangle };
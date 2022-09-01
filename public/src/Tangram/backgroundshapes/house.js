import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Group, EdgesGeometry, LineBasicMaterial, LineSegments } from '../../../vendor/three/build/three.module.js';

function createHouse(name, color) {

  const houseShape = new Shape();
  
  houseShape.moveTo(-1/2, -1/2);
  houseShape.lineTo(-1/2, 0);
  houseShape.lineTo( -1/2 - Math.sqrt(2)/8, 0);
  houseShape.lineTo( -1/2 + Math.sqrt(2)/8, + Math.sqrt(2)/4);
  houseShape.lineTo( -1/2 + Math.sqrt(2)/8,  + Math.sqrt(2)/2);
  houseShape.lineTo( -1/2 + 3*Math.sqrt(2)/8, + Math.sqrt(2)/2);
  houseShape.lineTo( -1/2 + 3*Math.sqrt(2)/8, + Math.sqrt(2)/4);
  houseShape.lineTo( + Math.sqrt(2)/8, 1/2);
  houseShape.lineTo( 1/2 + Math.sqrt(2)/8, 0);
  houseShape.lineTo(1/2, 0);
  houseShape.lineTo(1/2, -1/2);
  houseShape.lineTo(-1/2, -1/2);


  // create a geometry and edge geometry
  const geometry = new ShapeGeometry( houseShape );
  const edge_geometry = new EdgesGeometry( geometry );

  // create a default (white) Basic material
  const material = new MeshBasicMaterial({color: color});

  // create a Basic material for the edges
  const edge_mat = new LineBasicMaterial({color: "black", linewidth: 1});

  // create a Mesh and Edhes containing the geometry and material
  const mesh = new Mesh(geometry, material);
  const edges = new LineSegments(edge_geometry, edge_mat);

  // grouping the mesh and the edges
  const house = new Group();
  house.name = name;
  house.add(mesh);
  house.add(edges);

  return house;
}

export { createHouse };
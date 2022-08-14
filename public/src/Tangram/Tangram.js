import { createCamera } from './components/camera.js';
import { createSquare } from './components/square.js';
import { createTriangle } from './components/triangle.js';
import { createParallelogram } from './components/parallelogram.js';

import { createAxis } from './components/axis.js';
import { createScene } from './components/scene.js';

import { createRenderer } from './systems/renderer.js';


// These variables are module-scoped: we cannot access them
// from outside the module
let camera;
let renderer;
let scene;

class Tangram {
    // instance of the Tangram
    constructor(container) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        container.append(renderer.domElement);

        this.small_triangle_1 = createTriangle(0, 0, 10, "pink");
        this.small_triangle_2 = createTriangle(0, 0, 10, "purple");
        this.medium_triangle = createTriangle(0, 0, Math.sqrt(2)*10, "blue");
        this.large_triangle_1 = createTriangle(0, 0, 2*10, "brown");
        this.large_triangle_2 = createTriangle(0, 0, 2*10, "red");
        this.parellelogram = createParallelogram(0, 0, 10, "green")
        this.square = createSquare(0, 0, 10, "yellow");

        
        this.moveToInitalPos();
        this.axis = createAxis();

        scene.add(this.axis, this.square, this.small_triangle_1, this.small_triangle_2,
            this.medium_triangle, this.large_triangle_1, this.large_triangle_2, this.parellelogram);
    }

    // Render the scene
    render() {
        // draw a single frame
        renderer.render(scene, camera);
    }

    moveToInitalPos() {
        this.large_triangle_1.translateX(5/3)
        this.large_triangle_1.translateY(5)
        this.large_triangle_1.rotateZ(3*Math.PI/4);
        
        this.large_triangle_2.translateX(5)
        this.large_triangle_2.translateY(25/3)
        this.large_triangle_2.rotateZ(Math.PI/4);

        this.square.translateX(15/2);
        this.square.translateY(5);
        this.square.rotateZ(Math.PI/4);

        this.medium_triangle.translateX(25/3);
        this.medium_triangle.translateY(5/3);
        this.medium_triangle.rotateZ(Math.PI/2);

        this.small_triangle_1.translateX(5);
        this.small_triangle_1.translateY(10/3);
        this.small_triangle_1.rotateZ(-3*Math.PI/4);

        this.small_triangle_2.translateX(55/6);
        this.small_triangle_2.translateY(15/2);
        this.small_triangle_2.rotateZ(-Math.PI/4);

        this.parellelogram.translateX(15/4);
        this.parellelogram.translateY(10/8);
        this.parellelogram.rotateZ(Math.PI/4);
    }

  }
  
  export { Tangram };
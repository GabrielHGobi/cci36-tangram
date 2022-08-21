import { Group } from '../../vendor/three/build/three.module.js';

import { createCamera } from './components/camera.js';
import { createSquare } from './components/square.js';
import { createTriangle } from './components/triangle.js';
import { createParallelogram } from './components/parallelogram.js';
import { createHouse } from './backgroundshapes/House.js';
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

        this.bgshape = createHouse("house", "#222222");
        this.bgshape.scale.setScalar(15);

        this.tangramos = new Group();

        let small_triangle_1 = createTriangle("sT_1", "small", "#f87705");
        this.tangramos.add(small_triangle_1);

        let small_triangle_2 = createTriangle("sT_2", "small", "#0ef705");
        this.tangramos.add(small_triangle_2);

        let medium_triangle = createTriangle("mT", "medium", "#fb00b7");
        this.tangramos.add(medium_triangle);

        let large_triangle_1 = createTriangle("lT_1", "large", "#006af0");
        this.tangramos.add(large_triangle_1);

        let large_triangle_2 = createTriangle("lT_2", "large", "#f90205");
        this.tangramos.add(large_triangle_2);

        let parallelogram = createParallelogram("P", "#f9f004");
        this.tangramos.add(parallelogram);

        let square = createSquare("S", "#17e1f6");
        this.tangramos.add(square);

        this.moveToInitalPos();
    
        this.tangramos.scale.setScalar( 15 );
        
        this.axis = createAxis();

        scene.add(this.axis, this.tangramos, this.bgshape);
    }

    // Render the scene
    render() {
        // draw a single frame
        renderer.render(scene, camera);
    }

    moveToInitalPos() {

        var sT_1 = this.tangramos.getObjectByName("sT_1");
        sT_1.translateX(1/4)
        sT_1.translateY(1/12)
        sT_1.rotateZ(-3*Math.PI/4);
        
        var sT_2 = this.tangramos.getObjectByName("sT_2");
        sT_2.translateX(2/3)
        sT_2.translateY(1/2)
        sT_2.rotateZ(-Math.PI/4);

        var lT_1 = this.tangramos.getObjectByName("lT_1");
        lT_1.translateX(1/6)
        lT_1.translateY(1/2)
        lT_1.rotateZ(3*Math.PI/4);
        
        var lT_2 = this.tangramos.getObjectByName("lT_2");
        lT_2.translateX(1/2)
        lT_2.translateY(5/6)
        lT_2.rotateZ(Math.PI/4);

        var mT = this.tangramos.getObjectByName("mT");
        mT.translateX(5/6)
        mT.translateY(1/6)
        mT.rotateZ(Math.PI/2);

        var P = this.tangramos.getObjectByName("P");
        P.translateX(7/8)
        P.translateY(5/8)
        P.rotateZ(Math.PI/4);

        var S = this.tangramos.getObjectByName("S");
        S.translateX(1/2)
        S.translateY(1/4)
        S.rotateZ(Math.PI/4);
    }

  }
  
  export { Tangram };
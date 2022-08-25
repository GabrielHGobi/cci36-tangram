import { Vector2, Raycaster } from '../../../vendor/three/build/three.module.js';

let draggableObjects;
let mouseDown;
let mouse = new Vector2();
let raycaster = new Raycaster();
let camera;
let draggedPiece = null;
let intersection = null;
let tangramos = null;
let meshObj = null;

class MouseController {

    // instance of the Mouse Controller
    constructor(cam, dragObj, container) {

        let rect = container.getBoundingClientRect();
        let rl = rect.left;
        let rt = rect.top;
        mouseDown = false;
        camera = cam;
        draggableObjects = dragObj;

        container.addEventListener('mousedown', function (evt) {
            mouseDown = true;
        }, false);

        container.addEventListener('mousemove', function (evt) {

            mouse.x = ((evt.clientX - rl) / container.clientWidth) * 2 - 1;
            mouse.y = - ((evt.clientY - rt) / container.clientHeight) * 2 + 1;

            if (!pointInPolygon()) { // the mouse is over a polygon?
                container.style.cursor = "default";
                return;
            } 

            if (!mouseDown) { // is the button pressed?
                container.style.cursor = "pointer";
                return;
            }
            
            container.style.cursor = "move";

            moveObject();
        }, false);

        container.addEventListener('mouseup', function (evt) {
            mouseDown = false;
        }, false);

    }

}


function pointInPolygon() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(draggableObjects);
    let meshObjects = intersects.filter(item => item.object.isMesh);
    if (meshObjects.length != 0 ) {
        console.log(meshObjects)
        for(meshObj of meshObjects) {
            intersection = meshObj.point;
            if (!draggedPiece) {
                draggedPiece = meshObj.object.parent;
            }
            else {
                if (meshObj.object.parent.renderOrder > draggedPiece.renderOrder) {
                    draggedPiece = meshObj.object.parent;
                }
            }     
        }     
        return true;
    }
    return false;
}

function moveObject() {
    
    tangramos = draggedPiece.parent;
    for (let piece of tangramos.children)
        if (piece.renderOrder > draggedPiece.renderOrder)
            piece.renderOrder -= 1;

    draggedPiece.renderOrder = 7;

    let scene = draggedPiece;
    while (!scene.isScene)
        scene = scene.parent;

    scene.attach(draggedPiece);
    draggedPiece.position.x = intersection.x;
    draggedPiece.position.y = intersection.y;
    tangramos.attach(draggedPiece);
    return;
}



export { MouseController };
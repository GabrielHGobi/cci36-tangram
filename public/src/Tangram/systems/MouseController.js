import { Vector2, Raycaster } from '../../../vendor/three/build/three.module.js';


let mouse = new Vector2();
let raycaster = new Raycaster();

let draggedPiece = null;
let intersection = null;
let tangramos = null;
let meshObj = null;

let camera;
let draggableObjects;
let mouseDown;
let mouseDragging;

class MouseController {

    // instance of the Mouse Controller
    constructor(cam, draggableObjs, container) {

        let rect = container.getBoundingClientRect();
        let rl = rect.left;
        let rt = rect.top;
        mouseDown = false;
        mouseDragging = false;
        camera = cam;
        draggableObjects = draggableObjs;

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
            mouseDragging = true;

            moveObject();

        }, false);

        container.addEventListener('mouseup', function (evt) {
            mouseDown = false;
            mouseDragging = false;
        }, false);

        container.addEventListener('wheel', function (evt) {
            if(!mouseDragging) { return; }
            rotateObject(evt.deltaY); 
        })

    }

}


function pointInPolygon() {
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(draggableObjects);
    let meshObjects = intersects.filter(item => item.object.isMesh);
    if (meshObjects.length != 0 ) {
        draggedPiece = null;
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

function rotateObject(delta){
    draggedPiece.rotateZ(delta/20*Math.PI/180);
}



export { MouseController };
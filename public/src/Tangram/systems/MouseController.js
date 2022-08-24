import { Vector2, Raycaster } from '../../../vendor/three/build/three.module.js';

let intersectedObjects;
let draggableObjects;
let mouseDown;
let mouse = new Vector2();
let raycaster = new Raycaster();
let camera;

class MouseController {

    // instance of the Mouse Controller
    constructor(cam, dragObj) {
        let container = document.querySelector("#scene-container");
        let rect = container.getBoundingClientRect();
        mouseDown = false;
        camera = cam;
        draggableObjects = dragObj;
        
        container.addEventListener('mousedown', function (evt) {
            evt.preventDefault();
            mouseDown = true;
            mouse.x = ((evt.clientX - rect.left) / container.clientWidth ) * 2 - 1;
            mouse.y = - ( (evt.clientY - rect.top) / container.clientHeight ) * 2 + 1;
        }, false);

        container.addEventListener('mousemove', function (evt) {
            evt.preventDefault();
            if (!mouseDown) {return} // is the button pressed?
            if (!pointInPolygon()) {return} // the mouse is over a polygon?
            mouse.x = ((evt.clientX - rect.left) / container.clientWidth ) * 2 - 1;
            mouse.y = - ( (evt.clientY - rect.top) / container.clientHeight ) * 2 + 1;
            moveObject();
        }, false);

        container.addEventListener('mouseup', function (evt) {
            evt.preventDefault();
            mouseDown = false;
        }, false);

    }
  
}


function pointInPolygon() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(draggableObjects);
    if(intersects.length != 0){
        intersectedObjects = intersects;
        return true;
    }
    return false;
}

function moveObject() {
    let i = 0;
    let draggedPiece = null;
    let intersection = null;
    for(i=0; i<intersectedObjects.length; i++){
        if(intersectedObjects[i].object.isMesh){ 
            intersection = intersectedObjects[i].point;
            if(!draggedPiece){
                draggedPiece = intersectedObjects[i].object.parent;   
            }
            else {
                if(intersectedObjects[i].object.parent.renderOrder > draggedPiece.renderOrder){
                    draggedPiece = intersectedObjects[i].object.parent;
                }
            }
        }
    }

    let tangramos = draggedPiece.parent;
    for(let piece of tangramos.children)
        if(piece.renderOrder > draggedPiece.renderOrder)
            piece.renderOrder -= 1;

    draggedPiece.renderOrder = 6;
    
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
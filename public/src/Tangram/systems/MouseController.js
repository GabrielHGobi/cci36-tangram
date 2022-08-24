import { Vector2, Raycaster } from '../../../vendor/three/build/three.module.js';

let intersectedObjects;
let draggableObjects;
let mouseDown;
let mouse = new Vector2();
let raycaster = new Raycaster();
let camera;

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
            mouse.x = ((evt.clientX - rl) / container.clientWidth ) * 2 - 1;
            mouse.y = - ( (evt.clientY - rt) / container.clientHeight ) * 2 + 1;
        }, false);

        container.addEventListener('mousemove', function (evt) {        
            if (!mouseDown) {return} // is the button pressed?
            if (!pointInPolygon()) {return} // the mouse is over a polygon?
            mouse.x = ((evt.clientX - rl) / container.clientWidth ) * 2 - 1;
            mouse.y = - ( (evt.clientY - rt) / container.clientHeight ) * 2 + 1;
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
    if(intersects.length != 0){
        intersectedObjects = intersects;
        return true;
    }
    return false;
}

function moveObject() {
    let draggedPiece = null;
    let intersection = null;
    let inobj = null;
    for(let i=0; i<intersectedObjects.length; i++){
        inobj = intersectedObjects[i];
        if(inobj.object.isMesh){ 
            intersection = inobj.point;
            if(!draggedPiece){
                draggedPiece = inobj.object.parent; 
            }
            else {
                if(inobj.object.parent.renderOrder > draggedPiece.renderOrder){
                    draggedPiece = inobj.object.parent;
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
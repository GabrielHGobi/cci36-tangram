import { Vector2 } from '../../../vendor/three/build/three.module.js';
import { getPolygonIntersectionArea, raycastIntersectingObjects } from '../utils/utils2D.js'


let mouse = new Vector2();

let draggedPiece = null;
let intersection = null;
let tangramos = null;
let scene = null;
let bgshape = null;
let cont = null;

let camera;
let draggableObjects;
let mouseDown;
let mouseDragging;


class MouseController {

    // instance of the Mouse Controller
    constructor(cam, draggableObjs, backgroundShape, container, gamingLoop) {

        let rect = container.getBoundingClientRect();
        let rl = rect.left;
        let rt = rect.top;
        cont = container;
        mouseDown = false;
        mouseDragging = false;
        camera = cam;
        draggableObjects = draggableObjs;
        tangramos = draggableObjects[0].parent;
        scene = tangramos.parent;
        bgshape = backgroundShape[0].parent;


        container.addEventListener('mousedown', function (evt) {
            mouseDown = true;
        }, false);

        container.addEventListener('mousemove', function (evt) {

            mouse.x = ((evt.clientX - rl) / container.clientWidth) * 2 - 1;
            mouse.y = - ((evt.clientY - rt) / container.clientHeight) * 2 + 1;

            let intersectingObjects = raycastIntersectingObjects(mouse, camera, draggableObjects);
            if (intersectingObjects.length === 0) { // the mouse is over a polygon?
                container.style.cursor = "default";   
                return;
            }

            if (!mouseDown) { // is the button pressed?
                container.style.cursor = "pointer";
                return;
            }

            container.style.cursor = "move";
            getTopPieceToDrag(intersectingObjects);
            mouseDragging = true;

            moveObject();

        }, false);

        container.addEventListener('mouseup', function (evt) {
            mouseDown = false;
            mouseDragging = false;
            if(checkCompletion()) {
                if (confirm("Desafio completo!\nPressione o botão para jogar outra vez.")) {
                    location.reload();
                } else {
                    gamingLoop.stop();
                }
            }
        }, false);

        container.addEventListener('wheel', function (evt) {
            if (!mouseDragging) { return; }
            rotateObject(evt.deltaY);
        })

    }

}

function getTopPieceToDrag(intersectingObjects){
    if (intersectingObjects.length != 0) {
        draggedPiece = null;
        for (let Obj of intersectingObjects) {
            intersection = Obj.point;
            if (!draggedPiece) {
                draggedPiece = Obj.object.parent;
            }
            else {
                if (Obj.object.parent.renderOrder > draggedPiece.renderOrder) {
                    draggedPiece = Obj.object.parent;
                }
            }
        }
    }
}

function moveObject() {

    for (let piece of tangramos.children)
        if (piece.renderOrder > draggedPiece.renderOrder)
            piece.renderOrder -= 1;
    draggedPiece.renderOrder = 7;

    scene.attach(draggedPiece);
    draggedPiece.position.x = intersection.x;
    draggedPiece.position.y = intersection.y;
    tangramos.attach(draggedPiece);

    return;
}

function rotateObject(delta) {
    if (delta < 0)
        draggedPiece.rotateZ(-5 * Math.PI / 180);
    else
        draggedPiece.rotateZ(5 * Math.PI / 180);
}

function checkCompletion() {
    const house = bgshape.getObjectByName("house");
    
    let intHArea = 0
    let flag = false
    for (let piece1 of tangramos.children) {
        intHArea += getPolygonIntersectionArea(house, piece1, camera)
    }

    if(intHArea > 0.95){
        intHArea = 0
        for (let i=0; i<tangramos.children.length; i++) {
            let piece1 = tangramos.children[i]
            for (let j=i+1; j<tangramos.children.length; j++){
                let piece2 = tangramos.children[j]
                    intHArea = getPolygonIntersectionArea(piece2, piece1, scene)
                    if(intHArea > 0.1){
                        return false;
                    }
            }
        }
        return true;
    } else {
        return false;
    }
         
}

export { MouseController };
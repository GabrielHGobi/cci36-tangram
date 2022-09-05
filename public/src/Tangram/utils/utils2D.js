import { Vector2, Raycaster, BufferGeometry, PointsMaterial, Points, ShapeUtils } from '../../../vendor/three/build/three.module.js';

function translatePoints(points, translateVec) {
    for (let point of points) {
        point.add(translateVec);
    }
}

function rotatePoints(points, angle) {
    for (let point of points) {
        let old_point = new Vector2()
        old_point.copy(point)
        point.x = Math.cos(angle) * old_point.x - Math.sin(angle) * old_point.y;
        point.y = Math.sin(angle) * old_point.x + Math.cos(angle) * old_point.y;
    }
}

function scalePoints(points, scale) {
    for (let point of points) {
        point.multiplyScalar(scale);
    }
}

function raycastIntersectingObjects(point, camera, objectsArray) {
    let raycaster = new Raycaster();
    raycaster.setFromCamera(point, camera);
    let intersects = raycaster.intersectObjects(objectsArray);
    let meshObjectsIntersecting = intersects.filter(item => item.object.isMesh);
    return meshObjectsIntersecting;
}

function getPolygonVertices(poly) {
    let polyPoints = []
    const curves = poly.children[0].geometry.parameters.shapes.curves;
    for (let v of curves) {
        let v_new = new Vector2()
        v_new.copy(v.v1)
        polyPoints.push(v_new)
    }
    rotatePoints(polyPoints, poly.rotation._z)
    scalePoints(polyPoints, poly.scale.x)
    translatePoints(polyPoints, poly.position)
    return polyPoints
}

function getIntersectionPoints(points1, points2) {
    let intersectionPoints = []
    const n1 = points1.length;
    const n2 = points2.length;
    for (let i = 0; i < n1; i++) {

        let p1 = points1[i]
        let p2 = points1[(i + 1) % n1];
        let line1 = new Vector2();
        line1 = p2.clone()
        line1.sub(p1)


        for (let j = 0; j < n2; j++) {

            let p3 = points2[j];
            let p4 = points2[(j + 1) % n2];
            let line2 = new Vector2();
            line2 = p4.clone()
            line2.sub(p3)


            let den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
            if (den === 0) continue;

            let t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / den;
            if (t < 0 || t > 1) continue;

            let u = ((p1.x - p3.x) * (p1.y - p2.y) - (p1.y - p3.y) * (p1.x - p2.x)) / den;
            if (u < 0 || u > 1) continue;

            let P = new Vector2();
            P.x = p1.x + t * (p2.x - p1.x);
            P.y = p1.y + t * (p2.y - p1.y);

            let crossProd = line1.cross(line2)
            if (crossProd > 0) intersectionPoints.push({ point: P, type: 'enter', visited: false })
            else intersectionPoints.push({ point: P, type: 'exit', visited: false })

        }
    }
    return intersectionPoints;
}

function clockwiseSortPoints(points, convexPolygon) {
    const center = convexPolygon.position;
    points.sort((a, b) => {
        let angleA = (Math.atan2(a.point.x - center.x, a.point.y - center.y) + 2 * Math.PI) % (2 * Math.PI);
        let angleB = (Math.atan2(b.point.x - center.x, b.point.y - center.y) + 2 * Math.PI) % (2 * Math.PI);
        if (angleA < angleB) return -1;
        if (angleA > angleB) return 1;
        return 0;
    });
    return points;
}

function showPoints(pointsArray, scene) {
    let exitPoints = [];
    let enterPoints = [];
    for (let P of pointsArray) {
        if (P.type === 'enter') enterPoints.push(P.point)
        if (P.type === 'exit') exitPoints.push(P.point)
    }

    let dotGeometryEnter = new BufferGeometry();
    let dotGeometryExit = new BufferGeometry();

    let dotMaterialEnter = new PointsMaterial({ size: 10, sizeAttenuation: false, color: 'green' });
    let dotMaterialExit = new PointsMaterial({ size: 10, sizeAttenuation: false, color: 'red' });

    dotGeometryEnter.setFromPoints(enterPoints);
    dotGeometryExit.setFromPoints(exitPoints);

    let dotEnter = new Points(dotGeometryEnter, dotMaterialEnter);
    let dotExit = new Points(dotGeometryExit, dotMaterialExit);

    dotEnter.scale.setScalar(300);
    dotExit.scale.setScalar(300);

    scene.add(dotEnter, dotExit);
}

function isPointInPolygon(testPoint, polygonVertices){
    const nvert = polygonVertices.length;
    let isInside = false;
    for (let i=0, j=nvert-1; i<nvert; j = i++) {
        let vert1 = polygonVertices[i];
        let vert2 = polygonVertices[j];
        if ( ((vert1.y > testPoint.y) != (vert2.y > testPoint.y)) &&
        (testPoint.x < (vert2.x - vert1.x) * (testPoint.y-vert1.y) / (vert2.y-vert1.y) + vert1.x) )
        isInside = !isInside;
    }
    return isInside;
}


function getPolygonIntersectionArea(clippedPolygon, clippingPolygon, camera) {
    let clippedVertices = getPolygonVertices(clippedPolygon);
    let clippingVertices = getPolygonVertices(clippingPolygon);
    let intersectionPointsUnsorted = getIntersectionPoints(clippedVertices, clippingVertices);
    let intersectionPoints = clockwiseSortPoints(intersectionPointsUnsorted, clippingPolygon);
    let intersectPolysVertices = polygonClippingWeilerAtherton(clippedVertices, clippingVertices, intersectionPoints);
    
    let ans = 0
    if(intersectPolysVertices.length === 0){
        if(isPointInPolygon(clippingPolygon.position, clippedVertices)){
            ans += getArea(clippingVertices) / getArea(clippedVertices)
        }
    }
    else{
        for(let polyVertices of intersectPolysVertices){
            ans += getArea(polyVertices) / getArea(clippedVertices)
        }
    }
    return ans
}

/* P is in L1-L2 ? */
function inLine(P, L1, L2) {
    let num = (P.point.x - L1.x) * (L2.y - L1.y) - (P.point.y - L1.y) * (L2.x - L1.x)
    if (num > -0.0001 && num < 0.0001)
        return true
    return false
}

function clockwiseintorder(intPrev, intP, I0){
    let dintP = Math.pow((intP.point.x - I0.x),2) + Math.pow((intP.point.y - I0.y),2)
    let dintPrev = Math.pow((intPrev.point.x - I0.x),2) + Math.pow((intPrev.point.y - I0.y),2)

    if(dintPrev < dintP) return 1
    return 0
}

function listJoin(polyVertices, intersectionPoints) {
    let polyVector = []
    let idxI0 = 0
    let idxI1 = 1
    let idxInt = 0;
    let I0 = polyVertices[idxI0]
    let I1 = polyVertices[idxI1]
    let intP = intersectionPoints[idxInt]

    while (idxI0 < polyVertices.length) {
        polyVector.push({ point: I0, type: 'vertice' })
        let count = 0
        let inLineIntList = []
        while (count < intersectionPoints.length) {
            let r = 0
            if (I1.x - I0.x > 0.001 || I1.x - I0.x < -0.001) {
                r = (intP.point.x - I0.x) / (I1.x - I0.x)
            }
            else {
                r = (intP.point.y - I0.y) / (I1.y - I0.y)
            }
            if (inLine(intP, I0, I1) && r < 1 && r > 0) {
                if (inLineIntList.length == 0) {
                    inLineIntList.push(intP)
                }
                else {
                    let auxbuffer = []
                    while(!clockwiseintorder(inLineIntList[inLineIntList.length-1], intP, I0)){
                        auxbuffer.push(inLineIntList.pop())
                        if(inLineIntList.length == 0)
                            break
                    }
                    auxbuffer.push(intP)
                    let auxV = null
                    while(auxbuffer.length != 0){
                        inLineIntList.push(auxbuffer.pop())
                    }
                }
            }
            count++
            if (idxInt == intersectionPoints.length - 1) {
                idxInt = 0
                intP = intersectionPoints[0]
            }
            else {
                intP = intersectionPoints[++idxInt]
            }
        }
        for(let i = 0; i < inLineIntList.length; i++){
            polyVector.push(inLineIntList[i])
        }
        I0 = polyVertices[++idxI0]
        if (idxI1 == polyVertices.length - 1) {
            I1 = polyVertices[0]
            idxI1 = 0
        }
        else {
            I1 = polyVertices[++idxI1]
        }
    }
    return polyVector
}



function polygonClippingWeilerAtherton(clippedVertices, clippingVertices, intersectionPoints) {
    let polyVectors = []
    let clippedArray = []
    let clippingArray = []
    clippedArray = listJoin(clippedVertices, intersectionPoints)
    clippingArray = listJoin(clippingVertices, intersectionPoints)
    let count = 0
    while (count < intersectionPoints.length) {
        let polyVec = []
        let idx = 0
        let V = clippedArray[0]
        let eV = null
        while (!(V.type === 'enter' && !V.visited)) {
            V = clippedArray[++idx]
        }
        polyVec.push(V)
        count++
        V.visited = true
        eV = V

        while (!(V.type === 'exit' && !V.visited)) {
            if (idx == clippedArray.length - 1)
                idx = 0
            else
                idx++
            V = clippedArray[idx]
            polyVec.push(V)
        }
        count++
        V.visited = true

        let currentPoly = 'clipping'

        while (!(V == eV)) {
            if (currentPoly === 'clipping') {
                idx = clippingArray.findIndex(P => P.point === V.point)
                while (!(V == eV) && !(V.type === 'enter' && !V.visited)) {
                    if (idx == clippingArray.length - 1)
                        idx = 0
                    else
                        idx++
                    V = clippingArray[idx]
                    polyVec.push(V)
                }
                if (V != eV) {
                    V.visited = true
                    count++
                }
                currentPoly = 'clipped'
            }
            else {
                idx = clippedArray.findIndex(P => P.point === V.point)
                while (!(V.type === 'exit' && !V.visited)) {
                    if (idx == clippedArray.length - 1)
                        idx = 0
                    else
                        idx++
                    V = clippedArray[idx]
                    polyVec.push(V)
                }
                V.visited = true
                count++
                currentPoly = 'clipping'
            }
        }
        polyVec.pop()
        let returnVertices = []
        for (let V of polyVec) {
            returnVertices.push(V.point)
        }
        polyVectors.push(returnVertices)
    }
    return polyVectors
}

function getArea(verticesArray) {
    return ShapeUtils.area(verticesArray)
}

export { getPolygonIntersectionArea, raycastIntersectingObjects }

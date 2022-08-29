import { Vector2, BufferGeometry, PointsMaterial, Points } from '../../../vendor/three/build/three.module.js';

function translatePoints(points, translateVec){
    for (let point of points){
        point.add(translateVec);
    }
}

function rotatePoints(points, angle){
    for(let point of points){
        let old_point = new Vector2()
        old_point.copy(point)
        point.x = Math.cos(angle) * old_point.x - Math.sin(angle) * old_point.y;
        point.y = Math.sin(angle) * old_point.x + Math.cos(angle) * old_point.y;
    }
}


function scalePoints(points, scale){
    for (let point of points){
        point.multiplyScalar(scale);
    }
}

function getPolygonVertices(poly){
    let polyPoints = []
    const curves = poly.children[0].geometry.parameters.shapes.curves;
    for(let v of curves){
        let v_new = new Vector2()
        v_new.copy(v.v1)
        polyPoints.push(v_new)
    }
    rotatePoints(polyPoints, poly.rotation._z)
    scalePoints(polyPoints, poly.scale.x)
    translatePoints(polyPoints, poly.position)
    return polyPoints
}

function getIntersectionPoints(points1, points2){
    let intersectionPoints = []
    const n1 = points1.length;
    const n2 = points2.length;
    for(let i = 0; i < n1; i++){

        let p1 = points1[i]
        let p2 = points1[(i+1) % n1];

        for(let j = 0; j < n2; j++){

            let p3 = points2[j];
            let p4 =  points2[(j+1) % n2]; 

            
            let den = (p1.x - p2.x)*(p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x)

            let t = ((p1.x - p3.x)*(p3.y - p4.y) - (p1.y - p3.y)*(p3.x - p4.x)) / den;            
            if(t < 0 || t > 1) continue;

            let u = ((p1.x - p3.x)*(p1.y - p2.y) - (p1.y - p3.y)*(p1.x - p2.x)) / den;
            if(u < 0 || u > 1) continue;

            let P = new Vector2();
            P.x = p1.x + t*(p2.x - p1.x);
            P.y = p1.y + t*(p2.y - p1.y);
            
            console.log(P)
            intersectionPoints.push(P)
            
        }
    }
    return intersectionPoints;
}

function showPoints(pointsArray, scene){
    var dotGeometry = new BufferGeometry();
    dotGeometry.setFromPoints(pointsArray);
    var dotMaterial = new PointsMaterial( { size: 10, sizeAttenuation: false, color: 'red' } );
    var dot = new Points( dotGeometry, dotMaterial );
    dot.scale.setScalar(300);
    scene.add(dot);
}

function getPolygonIntersectionArea(poly1, poly2, scene){
    let poly1Points = getPolygonVertices(poly1);
    let poly2Points = getPolygonVertices(poly2);
    let interPoints = getIntersectionPoints(poly1Points, poly2Points);
    showPoints(interPoints, scene);
    return;
}

export {translatePoints, rotatePoints, scalePoints, getPolygonVertices, getIntersectionPoints, showPoints, getPolygonIntersectionArea}

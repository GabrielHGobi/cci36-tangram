import { Vector2, BufferGeometry, PointsMaterial, Points, ShapeUtils } from '../../../vendor/three/build/three.module.js';

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
        let line1 = new Vector2();
        line1 = p2.clone()
        line1.sub(p1)


        for(let j = 0; j < n2; j++){

            let p3 = points2[j];
            let p4 =  points2[(j+1) % n2]; 
            let line2 = new Vector2();
            line2 = p4.clone()
            line2.sub(p3)

            
            let den = (p1.x - p2.x)*(p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x)
            if(den === 0) continue;

            let t = ((p1.x - p3.x)*(p3.y - p4.y) - (p1.y - p3.y)*(p3.x - p4.x)) / den;            
            if(t < 0 || t > 1) continue;

            let u = ((p1.x - p3.x)*(p1.y - p2.y) - (p1.y - p3.y)*(p1.x - p2.x)) / den;
            if(u < 0 || u > 1) continue;

            let P = new Vector2();
            P.x = p1.x + t*(p2.x - p1.x);
            P.y = p1.y + t*(p2.y - p1.y);

            let crossProd = line1.cross(line2)
            if(crossProd > 0) intersectionPoints.push({point: P, type: 'enter'})
            else intersectionPoints.push({point: P, type: 'exit'})
            
        }
    }
    return intersectionPoints;
}

function showPoints(pointsArray, scene){
    let exitPoints = [];
    let enterPoints = [];
    for(let P of pointsArray){
        if(P.type === 'enter') enterPoints.push(P.point)
        if(P.type === 'exit') exitPoints.push(P.point)
    }

    let dotGeometryEnter = new BufferGeometry();
    let dotGeometryExit = new BufferGeometry();
    
    let dotMaterialEnter = new PointsMaterial( { size: 10, sizeAttenuation: false, color: 'green' } );
    let dotMaterialExit = new PointsMaterial( { size: 10, sizeAttenuation: false, color: 'red' } );

    dotGeometryEnter.setFromPoints(enterPoints);
    dotGeometryExit.setFromPoints(exitPoints);

    let dotEnter = new Points( dotGeometryEnter, dotMaterialEnter );
    let dotExit = new Points( dotGeometryExit, dotMaterialExit );

    dotEnter.scale.setScalar(300);
    dotExit.scale.setScalar(300);

    scene.add(dotEnter, dotExit);
}

function getPolygonIntersectionArea(clippedPolygon, clippingPolygon, scene){
    let clippedVertices = getPolygonVertices(clippedPolygon);
    let clippingVertices = getPolygonVertices(clippingPolygon);
    let intersectionPoints = getIntersectionPoints(clippedVertices, clippingVertices);
    if(intersectionPoints.length != 0){
        showPoints(intersectionPoints, scene);
    }
    
    // polyVertices = polygonClippingWeilerAtherton(clippedVertices, clippingVertices, intersectionPoints);

    // Descomente para testar
    // let totalIntersectionArea = 0;
    // for(let polyVertices of intersectionPolygons){
    //     totalIntersectionArea += getArea(polyVertices)
    // }
    // console.log(totalIntersectionArea);
    // return totalIntersectionArea;
}

function polygonClippingWeilerAtherton(clippedVertices, clippingVertices, intersectionPoints){
    let polyVertices = []; // polyVertices vai ser uma array de arrays - uma para cada polígono de interseção
    return polyVertices;
}

function getArea(verticesArray){
    return ShapeUtils.area(verticesArray)
}

export { getPolygonIntersectionArea }

# Projeto do B1 - CCI36 - Tangram

**Autores:** 

- Gabriel Henrique Gobi
- Thiago Lopes de Araujo

----------
## Introdução
Sucintamente, tangram é um jogo de quebra-cabeçãs cujo objetivo é encaixar 7 peças de forma a sobrepor perfeitamente uma geometria pré-determinada, conforme exemplo a seguir:
![alt](.//images/tangram.png)

Os movimentos possíveis (aplicados sobre uma peça) são:
1. Translação, convencionada no jogo desenvolvido como pressionar o botão esquerdo do mouse e movê-lo (mousedown e mousemove);
2. Rotação, convencionada no jogo desenvolvido como pressionar o botão esquerdo do mouse e mover a wheel  para cima - sentido horário - ou para baixo - sentido anti-horrário (mousedown e mousewheel).

## Função `point-in-polygon`

A função `point-in-polygon` teve dois usos distintos em nossa implementação do Tangram. 

- Durante a captura de eventos do usuários, gostaríamos de saber se o mouse estava sobre uma das peças arrastáveis do Tangram;
- Durante o cálculo da área total de interseção, gostaríamos de saber se o centroide de uma das peças estava dentro do polígono do contorno a ser preenchido.

Para cada um desses usos, implementou-se uma função distinta.

### Função `raycastIntersectingObjects`

Para o primeiro uso, utilizou-se a função abaixo, com o uso do objeto `RayCaster` do THREE.js.

```javascript
function raycastIntersectingObjects(point, camera, objectsArray) {
    let raycaster = new Raycaster();
    raycaster.setFromCamera(point, camera);
    let intersects = raycaster.intersectObjects(objectsArray);
    let meshObjectsIntersecting = intersects.filter(item => item.object.isMesh);
    return meshObjectsIntersecting;
}
```

Utilizando uma câmera ortográfica, mais adequada para problemas em 2D, o raycaster é capaz de emitir um "feixe" a partir da câmera, ortogonal ao plano projetivo, conforme mostrado na figura abaixo:

![alt](.//images/raycast.png)

Passando as peças do tangram como parâmetro para o método `intersectObjects` do raycaster, pode-se obter uma lista de objetos 3D interceptados pelo raio. O único detalhe é que para ajustarmos o raycast, as coordenadas do `point`, passado no método `setFromCamera`, devem estar na forma NDC (*Normal Device Coordinates*). Para o ponto do mouse, é feita a seguinte transformação:

```javascript
mouse.x = ((evt.clientX - rect.left) / container.clientWidth) * 2 - 1;
mouse.y = - ((evt.clientY - rect.top) / container.clientHeight) * 2 + 1;
```

Assim, consegue-se capturar exatamente os objetos que o mouse passa sobre. Realiza-se um filtro para retirarmos somente os objetos do tipo `Mesh`, pois o raycaster retorna também todos `LineSegment`'s associados às arestas do polígono.

### Função `isPointInPolygon`

Já esta função foi criada para resolver o segundo problema. A princípio, tentou-se utilizar a mesma função com raycasting, porém as coordenadas dos objetos no mundo se comportam de forma totalmente diferente das coordenadas capturadas dos eventos de mouse. Dessa forma, optou-se pelo tratamento geométrico do problema, sem a necessidade da mudança de coordenadas. A função criada simula um raycast horizontal (aumentando x, y fixo) para além do posto de teste, e conta quantas arestas ele corta. A cada cruzamento, o raio alterna entre *inside* e *outside*.

```javascript
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
```

## Função `getPolygonIntersectionArea`

A construção da função `getPolygonIntersectionArea` se deu com base no [algorítmo de Weiler-Atherton](https://en.wikipedia.org/wiki/Weiler%E2%80%93Atherton_clipping_algorithm), cuja escolha foi devido à possibilidade de obtenção de clipping de polígonos côncavos.

De posse dos vértices correspondentes aos clippedPolygon (o qual será "recortado") e ao clippingPolygon (determina a envoltória de "corte"), o algorítmo pode ser descrito conforme os passos a seguir:

1. Determinar os pontos de interseção entre os polígonos (por meio das equações de segmentos);
2. Gerar listas de pontos em sentido horário tanto para o clippingPolygon quanto para o clippedPolygon incluíndo-se os pontos de interseção;
3. Partindo-se da lista do clippedPolygon:
4. Procurar ordenadamente primeiro ponto de entrada não visitado e armazenar vértices subsequentes até encontrar vértice de sáida não visitado;
5. Encontrar índece do vértice de sáida anterior na lista do outro polígono e percorrer até encontrar um ponto de entrada;
6. Repetir passos 4 e 5 até enocntrar vértice de entrada inicial; determinando-se um conjunto de vétices que forma um polígon de interseção;
7. Repetir passos 4, 5 e 6 até que todos os pontos de interseção sejam visitados.

Ao término do algorítmo, obtém-se os conjuntos de vértices que originam os polígonos de interseção polyVectors conforme abaixo:

```javascript
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
```

Dado que uma premissa de Weiler-Atherton é a existênica de pontos de interseção, tratou-se a inexistência desse pontos de forma a verificar se o centróide do clippingPolygon estava incluso no clippedPolygon, heurística a qual foi utilizada para indicar que um polígono continha o outro ao invés de serem disjuntos.

O algorítmo foi então extendido de forma a obter a porcentagem de área coberta pelos polígonos gerados:

```javascript
function getPolygonIntersectionArea(clippedPolygon, clippingPolygon) {
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
```
## Tratamento de fim de jogo

A heurística de término de jogo utilizada foi feita por meio da função `checkcompletion`, de forma que se calcula a área de interseção da figura de plano de fundo com as peças do tangram e, caso o somatório da porcentagem de área coberta seja superior à 0.95, procede-se verificando dois a dois se a porcentagem de área de sobreposição entre as peças do tangram é inferior a 0.1. 
Satisfeitas as condições anteriores, detecta-se o término do jogo:

```javascript
function checkCompletion() {
    const house = bgshape.getObjectByName("house");
    
    let intHArea = 0
    for (let piece1 of tangramos.children) {
        intHArea += getPolygonIntersectionArea(house, piece1)
    }

    if(intHArea > 0.95){
        intHArea = 0
        for (let i=0; i<tangramos.children.length; i++) {
            let piece1 = tangramos.children[i]
            for (let j=i+1; j<tangramos.children.length; j++){
                let piece2 = tangramos.children[j]
                    intHArea = getPolygonIntersectionArea(piece2, piece1)
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
```

## Problema da rotação

Para resolver esse problema de forma simples, fez-se as seguintes escolhas na implementação:

1. Desenhar cada peça do tangram ao redor de seu centro geométrico;
2. Transladar cada peça junto com seu eixo cartesiano dentro dos eixos fixos com as coordenadas do mundo;
3. Rotação da peça ao redor da origem do eixo transladado.

Assim, não houve a necessidade de se desfazer as translações anteriores, nem de se trabalhar com quatérnions. Como o eixo de rotação $z'$ de cada peça a acompanha durante as translações, no referencial da peça, esse eixo sempre se mantém fixo, de forma que a qualquer momento basta fazermos a chamada do método `piece.rotateZ(angle)`. A figura abaixo demonstra a opção realizada:

![alt](.//images/rotation.png)

## Cuidados com as transformações geométricas

A rotação foi feita da forma descrita acima. 

Para a escala dos objetos, estes foram ajustados somente uma única vez, na criação dos componentes (não se muda a escala de nenhum objeto durante o jogo).

O principal cuidado tomad nas transformações geométricas foi com respeito à translação - uma transformação projetiva não-linear. 

Na criação dos componentes, na hora de posicioná-los na configuração inicial do quadrado do tangram, antes de rotacioná-los teve que se colocar o centroide de cada figura na posição correta e só depois rotacionar com respeito ao eixo $z'$. Se invertêssemos a ordem de operações, a operação `piece.translateX(dist)` transladaria na direção do eixo $x'$ rotacionado, e não na direção do eixo $x$ fixo do mundo, por exemplo.

Porém, não é só na hora de posicionamento inicial que precisávamos realizar as translações. Com o usuário clicando e arrastando o mouse sobre as peças, elas devem ser movidas no referencial do usuário - os eixos cartesianos fixos do mundo. Para resolver esse problema de forma fácil, sem a necessidade de desfazer transformações anteriores e sem usar quatérnions, utilizou-se o seguinte recurso:

```javascript
scene.attach(draggedPiece);
draggedPiece.position.x = intersection.x;
draggedPiece.position.y = intersection.y;
tangramos.attach(draggedPiece);
```

A ideia é utilizar da estrutura de renderização do THREE.js, em que os objetos são referenciados em forma de árvore. Quando se altera a posição das peças, com elas atreladas aos seus eixos cartesianos próprios, deslocados com relação ao eixo da cena, obtém-se o resultado indesejado já exemplificado. Porém, temporariamente, com o trecho de código acima, "corta-se" o objeto do ramo do tangram (`tangramos`) e coloca-o como parte da cena, do mundo (`scene`). Daí, consegue-se alterar as posições dentro dos eixos coordenados originais (no código, `intersection` é o ponto de interseção do mouse com a peça, nas coordenadas do mundo). Feito isso, junta-se denovo a peça ao grupo pai do tangram para que continue coerente com o padrão utilizado em outras partes do código.
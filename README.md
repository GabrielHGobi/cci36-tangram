# Projeto do B1 - CCI36 - Tangram

**Autores:** 

- Gabriel Henrique Gobi
- Thiago Lopes de Araujo

----------

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



## Função `polygon-intersection-area`

## Tratamento de fim de jogo

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
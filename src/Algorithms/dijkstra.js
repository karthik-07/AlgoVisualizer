export function dijkstra(grid, startNode, finishNode) {
    const visitedNodesInOrder  =[]
    startNode.distance = 0
    const unvisitedNodes = fetchAllNodes(grid)

    while(unvisitedNodes.length) {
        sortNodesByDistance(unvisitedNodes)

        const closestNode = unvisitedNodes.shift()

        if(!closestNode.isWall) {
            if(closestNode === Infinity) return visitedNodesInOrder
            closestNode.isVisited = true;
            visitedNodesInOrder.push(closestNode)
            if(closestNode === finishNode) return visitedNodesInOrder
            updateNeighbors(closestNode, grid)
        }
    }
}

function fetchAllNodes(grid) {
    const nodes = []
    for( const row of grid ){
        for( const node of row ){
            nodes.push(node)
        }
    }  
    return nodes   
}

function sortNodesByDistance(unvisitedNodes){
    unvisitedNodes.sort((na, nb) => na.distance - nb.distance)
}

function updateNeighbors(node, grid) {
    const uinVisitedNeighbors = getUnvisitedNeighbors(node, grid)
    for ( const neighbor of uinVisitedNeighbors) {
        neighbor.distance = node.distance + 1
        node.prevNode = node
    }
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = []
    const { col, row } = node
    if(row>0) neighbors.push(grid[row - 1][col])
    if(row<grid.length - 1) neighbors.push(grid[row+1][col])
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
}
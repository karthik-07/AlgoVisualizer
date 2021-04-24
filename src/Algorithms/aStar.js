export function AStar(grid, startNode, endNode) {
    const visitedNodes = []
    startNode.distance = 0
    const unVisitedNodes = getAllNodes(grid)

    while(unVisitedNodes.length) {
        sortByDistance(unVisitedNodes)
        const closestNode = unVisitedNodes.shift()
        //If wall then skip
        if(!closestNode.isWall) {
            //If closest node is at infinity then stop
            if(closestNode.distance === Infinity) return visitedNodes
            closestNode.isVisited = true
            visitedNodes.push(closestNode)
            if(closestNode === endNode) return visitedNodes
            updateUnvistedNode(closestNode, grid)
        }
    }
}

function getAllNodes(grid) {
    const nodes = []
    for(const row of grid){
        for(const node of row){
            nodes.push(node)
        }
    }
    return nodes
}

function sortByDistance(unVisitedNodes) {
    unVisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance)
}

function updateUnvistedNode(node, grid) {
    const unVisitedNeighbours = getUnvisitedNeighbours(node, grid)
    for(const neighbour of unVisitedNeighbours) {
        neighbour.distance = node.distance + 1 + neighbour.distanceToNode
        neighbour.previousNode = node
    }
}

function getUnvisitedNeighbours(node, grid) {
    const neighbours = []
    const {col, row} = node
    if(row > 0) neighbours.push(grid[row - 1][col])
    if(row < grid.length - 1) neighbours.push(grid[row + 1][col])
    if(col > 0) neighbours.push(grid[row][col - 1])
    if(col < grid[0].length - 1) neighbours.push(grid[row][col + 1])
    return neighbours.filter(neighbour => !neighbour.isVisited)
}
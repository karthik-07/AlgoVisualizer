import React, { Component } from 'react'
import Node from './Nodes/Node'
import {AStar} from '../Algorithms/aStar'

import './PathFinding.css'

export default class PathFinding extends Component {
    constructor() {
        super()
        this.state = {
            grid: [],
            START_ROW: 5,
            FINISH_ROW: 5,
            START_COL: 5,
            FINISH_COL: 20,
            mouseIsPressed: false,
            ROW_COUNT: 20,
            COLUMN_COUNT: 30,
            MOBILE_ROW_COUNT: 10,
            MOBILE_COLUMN_COUNT: 20,
            isRunning: false,
            isStartNode: false,
            isFinishNode: false,
            isWallNode: false, 
            currRow: 0,
            currCol: 0,
            isDesktop: true,
        }
    }

    componentDidMount() {
        const grid = this.getInitialGrid()
        this.setState({grid})
    }

    selectIsRunning() {
        this.setState({isRunning: !this.state.isRunning})
    }

    toggleView() {
        if(!this.state.isRunning) {
            this.clearGrid()
            this.cleatWalls()
            const isDesktopView = !this.state.isDesktop
            let grid 
            if(isDesktopView) {
                grid = this.getInitialGrid(
                    this.state.ROW_COUNT,
                    this.state.COLUMN_COUNT,
                )
                this.setState({isDesktopView, grid})
            } else {
                if (
                    this.state.START_ROW > this.state.MOBILE_ROW_COUNT ||
                    this.state.FINISH_ROW > this.state.MOBILE_ROW_COUNT ||
                    this.state.START_COL > this.state.MOBILE_COLUMN_COUNT ||
                    this.state.FINISH_COL > this.state.MOBILE_COLUMN_COUNT
                ) {
                    alert('Start and Finish Node must be within the Mobile Grid')
                } else {
                    grid = this.getInitialGrid(
                        this.state.MOBILE_ROW_COUNT,
                        this.state.MOBILE_COLUMN_COUNT,
                    )
                    this.setState({isDesktopView, grid})
                }
            }
        }
    }

    //Initial Grid

    getInitialGrid = (
        rowCount = this.state.ROW_COUNT,
        colCount = this.state.COLUMN_COUNT
    ) => {
        const initialGrid = []
        for (let row = 0; row < rowCount; row ++) {
            const currentRow = []
            for (let col = 0; col < colCount; col ++){
                currentRow.push(this.createNode(row, col))
            }
            initialGrid.push(currentRow)
        }
        return initialGrid
    }

    createNode = (row, col) => {
        return {
            row,
            col,
            isStart:
                row === this.state.START_ROW && col === this.state.START_COL,
            isFinish:
                row === this.state.FINISH_ROW &&
                col === this.state.FINISH_COL,
            distance: Infinity,
            distanceToFinish:
                Math.abs(this.state.FINISH_ROW - row) +
                Math.abs(this.state.FINISH_COL - col),
            isVisited: false,
            isWall: false,
            previousNode: null,
            isNode: true
        }
    }

    //Mouse Controls

    handleMouseDown(row, col) {
        if(!this.state.isRunning) {
            if(this.isGridClear()) {
                if(document.getElementById(`node-${row}-${col}`).className === 'node node-start') {
                    this.setState({
                        mouseIsPressed: true,
                        isStart: true,
                        currRow: row, 
                        currCol: col
                    })
                } else if(document.getElementById(`node-${row}-${col}`).className === 'node node-finish') {
                    this.setState({
                        mouseIsPressed: true,
                        isStart: true,
                        currRow: row, 
                        currCol: col
                    })
                } else {
                    const newGrid = getNewGridWithWall(this.state.grid, row, col)
                    this.setState({
                        grid: newGrid,
                        mouseIsPressed: true,
                        isStart: true,
                        currRow: row, 
                        currCol: col
                    })
                }
            } else {
                this.clearGrid()
            }
        }
    }

    isGridClear() {
        for(const row of this.state.grid) {
            for(const node of row) {
                const nodeClass = document.getElementById(`node-${node.row}-${node.col}`).className
                if(nodeClass === 'node node-visited' || nodeClass === 'node node-shortest-path') {
                    return false
                }
            }
        }
        return true
    }




    handleMouseEnter(row, col) {
        if(!this.state.isRunning) {
            if(this.state.mouseIsPressed) {
                const nodeClass = document.getElementById(`node-${row}-${col}`).className
                if(this.state.isStart) {
                    if(nodeClass !== 'node node-wall') {
                        const prevStart = this.state.grid[this.state.currRow][this.state.currCol]
                        prevStart.isStart = false
                        document.getElementById(`node-${this.state.currRow}-${this.state.currCol}`).className = 'node'

                        this.setState({
                            currRow: row,
                            currCol: col
                        })
                        const currStartNode = this.state.grid[row][col]
                        currStartNode.isStart = true
                        document.getElementById(`node-${row}-${col}`).className = 'node node-start'
                    }
                        this.setState({
                            START_ROW: row,
                            START_COL: col
                        })
                } else if(this.state.isFinishNode) {
                    if(nodeClass !== 'node node-wall') {
                        const previousFinish = this.state.grid[this.state.currRow][this.state.currCol]
                        previousFinish.isFinish = false
                        document.getElementById(`node-${this.state.currRow}-${this.state.currCol}`).className = 'node'
                        
                        this.setState({
                            currRow: row,
                            currCol: col
                        })
                        const currentFinishNode = this.state.grid[row][col]
                        currentFinishNode.isFinish = true
                        document.getElementById(`node-${row}-${col}`).className = 'node node-finish'
                    }
                    this.setState({
                        FINISH_ROW: row,
                        FINISH_COL: col
                    })

                } else if(this.state.isWallNode) {
                    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col)
                    this.setState({grid: newGrid})
                }
            }
        }
    }

    handleMouseUp(row, col) {
        if(!this.state.isRunning) {
            this.setState({mouseIsPressed: false})
            if(this.state.isStartNode) {
                const isStartNode = !this.state.isStartNode
                this.setState({isStartNode, START_ROW: row, START_COL: col})
            } else if(this.state.isFinishNode) {
                const isFinishNode = !this.state.isFinishNode
                this.setState({isFinishNode, FINISH_ROW: row, FINISH_COL: col})
            }
            this.getInitialGrid()
        }
    }

    handleMouseLeave() {
        if(this.state.isStartNode) {
            const isStartNode = !this.state.isStartNode
            this.setState({
                isStartNode, mouseIsPressed: false
            })
        } else if(this.state.isFinishNode) {
            const isFinishNode = !this.state.isFinishNode
            this.setState({isFinishNode, mouseIsPressed: false})
        } else if(this.state.isWallNode) {
            const isWallNode = !this.state.isWallNode
            this.setState({isWallNode, mouseIsPressed: false})
            this.getInitialGrid()
        }    
    }


    //Clear Grid

    clearGrid() {
        if(!this.state.isRunning) {
            const newGrid = this.state.gride.slice()
            for(const row of newGrid) {
                for(const node of row) {
                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className
                    if(nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish' && nodeClassName !== 'node node-wall') {
                        document.getElementById(`node-${node.row}-${node.col}`).className = node
                        node.isValid = true
                        node.distance = Infinity
                        node.distanceToFinish = Math.abs(this.state.FINISH_ROW - node.row) + Math.abs(this.state.FINISH_COL - node.col)
                    }

                    if(nodeClassName === 'node node-finish') {
                        node.isVisited = false
                        node.distance = Infinity
                        node.distanceToFinish = 0
                    }

                    if(nodeClassName === 'node node-start') {
                        node.isVisited = false
                        node.distance = Infinity
                        node.distanceToFinish = Math.abs(this.state.FINISH_ROW - node.row) + Math.abs(this.state.FINISH_COL - node.col)
                        node.isStart = true
                        node.isWall = false
                        node.previousNode = null
                        node.isNode = true
                    }
                }
            }
        }
    }


    clearWalls() {
        if(!this.state.isRunning) {
            const newGrid = this.state.grid.slice()
            for(const row of newGrid) {
                for(const node of row) {
                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className
                    if(nodeClassName === 'node node-wall') {
                        document.getElementById(`node-${node.row}-${node.col}`).className = 'node'
                        node.isWall = false
                    }
                }
            }
        }
    }


    //Animation

    visualAlgo(algo) {
        if(!this.state.isRunning) {
            this.clearGrid()
            this.selectIsRunning()
            const { grid } = this.state
            const startNode = grid[this.state.START_ROW][this.state.START_COL]
            const finishNode = grid[this.state.FINISH_ROW][this.state.FINISH_COL]
            let VisitedNode
            switch(algo) {
                case 'AStar':
                    VisitedNode = AStar(grid, startNode, finishNode)
                    break
                default: 
                    break
            }
            const nodesInShortestPath = getNodesInShortestPath(finishNode)
            nodesInShortestPath.push('end')
            this.animate(VisitedNode, nodesInShortestPath)
        }
    }

    animate(VisitedNode, nodesInShortestPath) {
        for(let i = 0; i <= VisitedNode.length; i++) {
            if(i === VisitedNode.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPath)
                }, 10 * i)
                return
            }
            setTimeout(() => {
                const node = VisitedNode[i]
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className
                if(nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish') {
                    document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited'
                }
            }, 10 * i)
        }
    }

    //Path from start to finish

    animateShortestPath(nodesInShortestPath) {
        for(let i = 0; i<nodesInShortestPath; i++) {
            if(nodesInShortestPath[i] == 'end') {
                setTimeout(() => {
                    this.selectIsRunning()
                }, i* 70)
            } else {
                setTimeout(() => {
                    const node = nodesInShortestPath[i]
                    const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className
                    if(nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish') {
                        document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path'
                    }
                }, i* 50)
            }
        }
    }

    render() {
        const { grid, mouseIsPressed } = this.state
        return(
            <div>
                <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
                    <a className="navbar-brand" href="/">
                        <b>PathFinding Visualizer</b>
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggler="collapse"
                        data-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                    </button>
                </nav>
            </div>
        )
    }
    















}





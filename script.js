'use strict';

// a quadrant will be a triple
// (x, y, q)

// actually multiple arrays
var quadSets = []

class World {
    constructor(matWidth, matHeight) {
        this.matWidth = matWidth
        this.matHeight = matHeight
        this.arr = new Array(matWidth * matHeight)
    }

    worldToMatrix(worldX, worldY) {
        const matX = worldX
        const matY = Math.floor(worldY / 2)
        return [matX, matY]
    }

    matrixToWorld(matX, matY) {
        const worldX = matX - Math.floor((matY+1) / 2)
        const worldY = matX + Math.floor(matY / 2)
        return [worldX, worldY]
    }

    getTile(worldX, worldY) {
        const [matX, matY] = this.worldToMatrix(worldX, worldY) 
        return this.arr[matX + matY*this.matWidth]
    }
    setTile = (x, y, tile) => this.arr[x + y*this.matWidth] = tile

    fitCornerScore(x, y) {
        const tileNW = this.getTile(x-1, y-1)
        const tileNE = this.getTile(x, y-1)
        const tileSE = this.getTile(x, y)
        const tileSW = this.getTile(x-1, y)

        // only if all tiles are there we can decide the score
        if (tileNW === null || tileNE === null || tileSW === null || tileSE === null) return 0

        // count walls towards (x, y)
        var wallCount = 0
        
        if (tileNW != undefined) Math.min(1, tileNW.getSegment(2))
        if (tileNE != undefined) Math.min(1, tileNE.getSegment(3))
        if (tileSE != undefined) Math.min(1, tileSE.getSegment(0))
        if (tileSW != undefined) Math.min(1, tileSW.getSegment(1))

        if (wallCount == 1) return -1000 // BAD

        return 0
    }

    fitScoreTotal = (x, y) => this.fitCornerScore(x, y) + this.fitCornerScore(x+1, y) + this.fitCornerScore(x, y+1) + this.fitCornerScore(x+1, y+1)

    create() {
        for (let matY = 0 ; matY < this.matHeight; ++matY) {
            for (let matX = 0 ; matX < this.matWidth; ++matX) {       
                if (tiles.length == 0) return // when empty 
                shuffle(tiles) // shuffle remaining tiles
                for(let tileIdx = 0; true; ++tileIdx) {
                    let tile = tiles[tileIdx]
                    
                    tile.rotation = getRandomInt(4)
                    this.setTile(matX, matY, tile)

                    let maxScore = -1
                    let maxRotation = 0
                    for (let i = 0; i < 4; ++i) {
                        tile.rotation = (tile.rotation + 1) % 4

                        const [worldX, worldY] = this.matrixToWorld(matX, matY)
                        let score = this.fitScoreTotal(worldX, worldY, tile)
                        if (score > maxScore) {
                            maxScore = score
                            maxRotation = tile.rotation
                        }
                    }

                    if (maxScore >= 0 || tileIdx == tiles.length-1) { // when end reached just place the last evaluated one
                        tile.rotation = maxRotation
                        tiles.splice(tileIdx, 1)
                        break
                    }
                }
            }
        }
    }

    draw(ctx) {
        /*for (let x = 0 ; x < this.matWidth; ++x) {
            Tile.prototype.drawLineSegment(ctx, x, -1, 1, 1)
            Tile.prototype.drawLineSegment(ctx, x, -1, -1, 1)

            Tile.prototype.drawLineSegment(ctx, x, this.matHeight, 1, -1)
            Tile.prototype.drawLineSegment(ctx, x, this.matHeight, -1, -1)
        }

        for (let y = 0 ; y < this.matHeight; ++y) {
            Tile.prototype.drawLineSegment(ctx, -1, y, 1, 1)
            Tile.prototype.drawLineSegment(ctx, -1, y, 1, -1)

            Tile.prototype.drawLineSegment(ctx, this.matWidth, y, -1, 1)
            Tile.prototype.drawLineSegment(ctx, this.matWidth, y, -1, -1)
        }*/

        for (let matY = 0 ; matY < this.matHeight; ++matY) {
            for (let matX = 0 ; matX < this.matWidth; ++matX) {
                let tile = this.getTile(matX, matY)
                if (tile !== null) {                    
                    const [worldX, worldY] = this.matrixToWorld(matX, matY)
                    tile.draw(ctx, worldX, worldY)
                }
            }
        }

        /*ctx.globalAlpha = 0.1
        for (let y = 0 ; y < this.matHeight + 1; ++y) {
            for (let x = 0 ; x < this.matWidth; ++x) {
                ctx.fillStyle = "#0000ff" //(x + y) % 2 == 0 ? "blue" : "white"
                ctx.beginPath()
                ctx.moveTo(x * 48 + 24, y * 48 + 24)
                ctx.lineTo(x * 48 + 48, y * 48)
                ctx.lineTo(x * 48 + 72, y * 48 + 24)
                ctx.lineTo(x * 48 + 48, y * 48 + 48)
                ctx.fill()
            }
        }*/
    }
}

const canvas = document.getElementById("myCanvas")
const ctx = canvas.getContext("2d")

var world = new World(4, 8) //new World(canvas.width / 48 / 2 - 1, canvas.height / 48 - 1)

class Tile { // Tegel
    constructor(arr) { // array [0,1,2,0] is NW niets, NE muur, SE deur, SW niets
        this.arr = arr
        this.rotation = 0
    }

    drawLineSegment(ctx, middleX, middleY, dx, dy) {
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.moveTo(middleX, middleY)
        ctx.lineTo(middleX + dx * 24, middleY + dy * 24)
        ctx.stroke()
    }

    drawCircle(ctx, middleX, middleY, dx, dy) {
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.arc(middleX + dx * 11, middleY + dy * 11, 9, 0, 2 * Math.PI)
        ctx.stroke()
    }

    drawQuadrant(ctx, middleX, middleY, dx, dy, lineType) {
        if (lineType >= 1)
            this.drawLineSegment(ctx, middleX, middleY, dx, dy)
        if (lineType == 2)
            this.drawCircle(ctx, middleX, middleY, dx, dy)
    }

    getSegment = (i) => this.arr[(i + this.rotation) % 4]

    draw(ctx, x, y) {
        let rotated = rotateLeft(this.arr, this.rotation)
        let middleX = x * 24 + y * 24 + 48
        let middleY = x * -24 + y * 24 + 24

        if ((x + y) % 2) {
            ctx.beginPath()            
            ctx.moveTo(middleX - 24, middleY)
            ctx.lineTo(middleX     , middleY - 24)
            ctx.lineTo(middleX + 24, middleY)
            ctx.lineTo(middleX     , middleY + 24)
            ctx.fillStyle = "#f0f0f0"
            ctx.fill()
        }

        this.drawQuadrant(ctx, middleX, middleY, -1, 0, rotated[0])
        this.drawQuadrant(ctx, middleX, middleY, 0, -1, rotated[1])
        this.drawQuadrant(ctx, middleX, middleY, 1, 0, rotated[2])
        this.drawQuadrant(ctx, middleX, middleY, 0, 1, rotated[3])
    }
}

var mult = (world.matWidth * world.matHeight) / 33
var tiles = []
for (let i = 0; i < 18 * mult; ++i)
    tiles.push(new Tile([1,0,1,0]))
for (let i = 0; i < 2 * mult; ++i)
    tiles.push(new Tile([0,0,1,1]))
for (let i = 0; i < 7 * mult; ++i)
    tiles.push(new Tile([0,0,0,0]))
for (let i = 0; i < 4 * mult; ++i)
    tiles.push(new Tile([1,0,2,0]))
for (let i = 0; i < 1 * mult; ++i)
    tiles.push(new Tile([0,0,1,2]))
for (let i = 0; i < 1 * mult; ++i)
    tiles.push(new Tile([0,0,2,1]))

const getRandomInt = (max) => Math.floor(Math.random() * max)

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        let j = getRandomInt(i + 1)
        
        // Swap elements array[i] and array[j]
        ;[array[i], array[j]] = [array[j], array[i]] // semicolon needed
    }
    return array
}

const rotateLeft = (array, positions) => array.slice(positions).concat(array.slice(0, positions))

world.create()

world.draw(ctx)
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
        return this.arr[worldX + worldY*this.matWidth]
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
        let matX = Math.floor(this.matWidth / 2);
        let matY = Math.floor(this.matHeight / 2);
        const stopLength = 50;
        let length = 0;

        while (length < stopLength) {
            for (let i = 0; i <= length; ++i) {
                this.placeTile(matX, matY)
                ++matY;
            }
            for (let i = 0; i < length; ++i) {
                this.placeTile(matX, matY)
                --matX;
            }
            ++length

            for (let i = 0; i <= length; ++i) {
                this.placeTile(matX, matY)
                --matY;
            }
            for (let i = 0; i < length; ++i) {
                this.placeTile(matX, matY)
                ++matX;
            }
            ++length
        }

    }

    placeTile(matX, matY) {
        if (tiles.length == 0) return // when empty

        if (matX < 0) return;
        if (matX > this.matWidth) return;
        if (matY < 0) return;
        if (matY > this.matHeight) return;

        shuffle(tiles) // shuffle remaining tiles
        for(let tileIdx = 0; true; ++tileIdx) {
            let tile = tiles[tileIdx]
            
            //tile.rotation = getRandomInt(4)
            this.setTile(matX, matY, tile)

            if (/*maxScore >= 0 ||*/ tileIdx == tiles.length-1) { // when end reached just place the last evaluated one
                //tile.rotation = maxRotation
                tiles.splice(tileIdx, 1)
                break
            }
        }
    }

    draw(ctx) {
        for (let matY = 0 ; matY < this.matHeight; ++matY) {
            for (let matX = 0 ; matX < this.matWidth; ++matX) {
                let tile = this.getTile(matX, matY)
                if (tile !== null) {                    
                    tile.drawTile(ctx, 1 + matX*2, 1 + matY*2) // +1 +1 for a bit of offset
                }
            }
        }
    }
}

const canvas = document.getElementById("myCanvas")
const ctx = canvas.getContext("2d")

var world = new World(8, 8) //new World(canvas.width / 48 / 2 - 1, canvas.height / 48 - 1)

class Tile { // Tegel
    constructor(arr) { // array [0,1,2,0] is NW niets, NE muur, SE deur, SW niets
        this.arr = arr
        this.rotation = 0
    }

    drawLineSegment(ctx, x, y, dx, dy) {
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.moveTo(x * 24, y * 24)
        ctx.lineTo(x * 24 + dx * 24, y * 24 + dy * 24)
        ctx.stroke()
    }

    drawCircle(ctx, x, y, dx, dy) {
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.arc(x * 24 + dx * 11, y * 24 + dy * 11, 9, 0, 2 * Math.PI)
        ctx.stroke()
    }

    drawQuadrant(ctx, x, y, dx, dy, lineType) {
        if (lineType >= 1)
            this.drawLineSegment(ctx, x, y, dx, dy)
        if (lineType == 2)
            this.drawCircle(ctx, x, y, dx, dy)
    }

    drawTile(ctx, middleX, middleY) {
        ctx.fillStyle = (middleX + middleY) % 4 == 0 ? "#0000ff10" : "#ffffff10" // "blue" : "white"
        ctx.beginPath()
        ctx.moveTo(middleX * 24 - 24, middleY * 24 - 24)
        ctx.lineTo(middleX * 24 + 24, middleY * 24 - 24)
        ctx.lineTo(middleX * 24 + 24, middleY * 24 + 24)
        ctx.lineTo(middleX * 24 - 24, middleY * 24 + 24)
        ctx.fill()


        this.drawQuadrant(ctx, middleX - 1, middleY - 1, 1, 0, this.arr[0])
        this.drawQuadrant(ctx, middleX, middleY - 1, 1, 0, this.arr[1])
        this.drawQuadrant(ctx, middleX - 1, middleY, 1, 0, this.arr[2])
        this.drawQuadrant(ctx, middleX, middleY, 1, 0, this.arr[3])
        this.drawQuadrant(ctx, middleX - 1, middleY - 1, 0, 1, this.arr[4])
        this.drawQuadrant(ctx, middleX - 1, middleY, 0, 1, this.arr[5])
        this.drawQuadrant(ctx, middleX, middleY - 1, 0, 1, this.arr[6])
        this.drawQuadrant(ctx, middleX, middleY, 0, 1, this.arr[7])
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

var mult = 2 // (world.matWidth * world.matHeight) / 33
var tiles = []
for (let i = 0; i < 18 * mult; ++i) // empty
    tiles.push(new Tile([0, 0, 0, 0, 0, 0, 0, 0]))
for (let i = 0; i < 7 * mult; ++i) // up line
    tiles.push(new Tile([1, 1, 0, 0, 0, 0, 0, 0]))
for (let i = 0; i < 7 * mult; ++i) // left line
    tiles.push(new Tile([0, 0, 0, 0, 1, 1, 0, 0]))
for (let i = 0; i < 6 * mult; ++i) // big corner
    tiles.push(new Tile([1, 1, 0, 0, 1, 1, 0, 0]))
for (let i = 0; i < 5 * mult; ++i) // up up
    tiles.push(new Tile([1, 1, 1, 1, 0, 1, 0, 0]))
for (let i = 0; i < 5 * mult; ++i) // left left
    tiles.push(new Tile([0, 1, 0, 0, 1, 1, 1, 1]))
for (let i = 0; i < 5 * mult; ++i) // hor
    tiles.push(new Tile([0, 0, 1, 1, 0, 1, 0, 0]))
for (let i = 0; i < 5 * mult; ++i) // hor2 (new)
    tiles.push(new Tile([0, 0, 1, 1, 1, 0, 0, 0]))
for (let i = 0; i < 5 * mult; ++i) // hor-T (new)
tiles.push(new Tile([0, 0, 1, 1, 1, 1, 0, 0]))
for (let i = 0; i < 5 * mult; ++i) // vert
    tiles.push(new Tile([0, 1, 0, 0, 0, 0, 1, 1]))
for (let i = 0; i < 5 * mult; ++i) // vert2 (new)
    tiles.push(new Tile([1, 0, 0, 0, 0, 0, 1, 1]))
for (let i = 0; i < 5 * mult; ++i) // vert-T (new)
    tiles.push(new Tile([1, 1, 0, 0, 0, 0, 1, 1]))

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
'use strict';

// a quadrant will be a triple
// (x, y, q)

// actually multiple arrays
var quadSets = []

class World {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.arr = new Array(width * height)
    }

    getTile = (x, y) => this.arr[x + y*this.width]
    setTile = (x, y, tile) => this.arr[x + y*this.width] = tile

    upperLeftCount(x, y) {
        let count = 0

        if (this.getTile(x-1, y-1).getSegment(2) >= 1) ++count
        if (this.getTile(x, y-1).getSegment(3) >= 1) ++count
        if (this.getTile(x-1, y).getSegment(1) >= 1) ++count

        return count    
    }

    // for upper left
    fitScoreNW(x, y, tile) {
        let score = 0

        if (x > 0 && y > 0) {
            let upperLeftCount = this.upperLeftCount(x, y)

            if (upperLeftCount == 1 && tile.getSegment(0) == 0) return -3 // so guaranteed below 0
            if (upperLeftCount == 0 && tile.getSegment(0) >= 1) return -3 // so guaranteed below 0
        }

        if (tile.getSegment(0) >= 1) {
            if (x > 0 && y > 0 && this.getTile(x-1, y-1).getSegment(2) >= 1) ++score
            if (y > 0 && this.getTile(x, y-1).getSegment(3) >= 1) ++score
            if (x > 0 && this.getTile(x-1, y).getSegment(1) >= 1) ++score
        }
        return score
    }

    fitScoreNE(x, y, tile) {
        let score = 0

        if (tile.getSegment(1) >= 1) {
            if (y > 0 && this.getTile(x, y-1).getSegment(2) >= 1) ++score
            if (x < this.width-1 && y > 0 && this.getTile(x+1, y-1).getSegment(2) >= 1) ++score
        }
        return score
    }

    fitScoreSW(x, y, tile) {
        let score = 0

        if (tile.getSegment(3) >= 1)
            if (x > 0 && this.getTile(x-1, y).getSegment(2) >= 1) ++score
        
        return score
    }

    fitScoreTotal = (x, y, tile) => this.fitScoreNW(x, y, tile) + this.fitScoreNE(x, y, tile) + this.fitScoreSW(x, y, tile)

    create() {
        for (let y = 0 ; y < this.height; ++y) {
            for (let x = 0 ; x < this.width; ++x) {        
                shuffle(tiles) // shuffle remaining tiles
                for(let tileIdx = 0; true; ++tileIdx) {
                    let tile = tiles[tileIdx]
                    
                    tile.rotation = getRandomInt(4)

                    let maxScore = -1
                    let maxRotation = 0
                    for (let i = 0; i < 4; ++i) {
                        tile.rotation = (tile.rotation + 1) % 4
                        let score = this.fitScoreTotal(x, y, tile)
                        if (score > maxScore) {
                            maxScore = score
                            maxRotation = tile.rotation
                        }
                    }

                    if (maxScore >= 0 || tileIdx == tiles.length-1) {
                        tile.rotation = maxRotation
                        this.setTile(x, y, tile)
                        tiles.splice(tileIdx, 1)
                        if (tiles.length == 0) return
                        break
                    }
                }
            }
        }
    }

    draw(ctx) {
        for (let x = 0 ; x < this.width; ++x) {
            Tile.prototype.drawLineSegment(ctx, x, -1, 1, 1)
            Tile.prototype.drawLineSegment(ctx, x, -1, -1, 1)

            Tile.prototype.drawLineSegment(ctx, x, this.height, 1, -1)
            Tile.prototype.drawLineSegment(ctx, x, this.height, -1, -1)
        }

        for (let y = 0 ; y < this.height; ++y) {
            Tile.prototype.drawLineSegment(ctx, -1, y, 1, 1)
            Tile.prototype.drawLineSegment(ctx, -1, y, 1, -1)

            Tile.prototype.drawLineSegment(ctx, this.width, y, -1, 1)
            Tile.prototype.drawLineSegment(ctx, this.width, y, -1, -1)
        }

        for (let y = 0 ; y < this.height; ++y) {
            for (let x = 0 ; x < this.width; ++x) {
                let tile = this.getTile(x, y)
                if (tile !== null) tile.draw(ctx, x, y)
            }
        }

        ctx.globalAlpha = 0.1
        for (let y = 0 ; y < this.height + 1; ++y) {
            for (let x = 0 ; x < this.width; ++x) {
                ctx.fillStyle = "#0000ff" //(x + y) % 2 == 0 ? "blue" : "white"
                ctx.beginPath()
                ctx.moveTo(x * 48 + 24, y * 48 + 24)
                ctx.lineTo(x * 48 + 48, y * 48)
                ctx.lineTo(x * 48 + 72, y * 48 + 24)
                ctx.lineTo(x * 48 + 48, y * 48 + 48)
                ctx.fill()
            }
        }

    }
}

const canvas = document.getElementById("myCanvas")
const ctx = canvas.getContext("2d")

var world = new World(canvas.width / 48 - 1, canvas.height / 48 - 1)

class Tile { // Tegel
    constructor(arr) { // array [0,1,2,0] is NW niets, NE muur, SE deur, SW niets
        this.arr = arr
        this.rotation = 0
    }

    drawLineSegment(ctx, x, y, dx, dy) {
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.moveTo(x * 48 + 48, y * 48 + 48)
        ctx.lineTo(x * 48 + 48 + dx * 24, y * 48 + 48 + dy * 24)
        ctx.stroke()
    }

    drawCircle(ctx, x, y, dx, dy) {
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.arc(x * 48 + 48 + dx * 12, y * 48 + 48 + dy * 12, 10, 0, 2 * Math.PI)
        ctx.stroke()
    }

    drawQuadrant(ctx, x, y, dx, dy, lineType) {
        if (lineType >= 1)
            this.drawLineSegment(ctx, x, y, dx, dy)
        if (lineType == 2)
            this.drawCircle(ctx, x, y, dx, dy)
    }

    getSegment = (i) => this.arr[(i + this.rotation) % 4]

    draw(ctx, x, y) {
        let rotated = rotateLeft(this.arr, this.rotation)

        if ((x + y) % 2) {
            ctx.beginPath()
            ctx.fillStyle = "#f0f0f0"
            ctx.rect(x * 48 + 24, y * 48 + 24, 48, 48)
            ctx.fill()
        }

        this.drawQuadrant(ctx, x, y, -1, -1, rotated[0])
        this.drawQuadrant(ctx, x, y, 1, -1, rotated[1])
        this.drawQuadrant(ctx, x, y, 1, 1, rotated[2])
        this.drawQuadrant(ctx, x, y, -1, 1, rotated[3])
    }
}

var mult = (world.width * world.height) / 33
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
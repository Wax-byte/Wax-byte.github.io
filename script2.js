'use strict';

//Math.seedrandom('any string you like1') //setting the random seed

const randomIntFromInterval = (min,upperbound) => Math.floor(Math.random()*(upperbound-min)+min)

const getRandomInt = (max) => Math.floor(Math.random() * max)

class World {
    constructor(matWidth, matHeight) {
        this.matWidth = matWidth
        this.matHeight = matHeight
        this.arr = new Array(matWidth * matHeight)
    }

    getTile = (worldX, worldY) => this.arr[worldX + worldY*this.matWidth]
    
    setTile = (x, y, tile) => this.arr[x + y*this.matWidth] = tile

    ;*create() { // * makes it a generator method
        let matX = Math.floor(this.matWidth / 2)
        let matY = Math.floor(this.matHeight / 2)
        const stopLength = Math.max(this.matWidth, this.matHeight)
        let length = 0

        while (true) {
            if (length >= stopLength) break
            for (let i = 0; i < length; ++i) {
                this.placeTile(matX, matY)
                yield
                ++matY
            }
            for (let i = 0; i <= length; ++i) {
                this.placeTile(matX, matY)
                yield
                --matX
            }
            ++length

            if (length >= stopLength) break
            for (let i = 0; i < length; ++i) {
                this.placeTile(matX, matY)
                yield
                --matY
            }
            for (let i = 0; i <= length; ++i) {
                this.placeTile(matX, matY)
                yield
                ++matX
            }
            ++length
        }
    }

    placeTile(matX, matY) {
        if (tiles.length == 0) return // when empty

        if (matX < 0) return
        if (matX >= this.matWidth) return
        if (matY < 0) return
        if (matY >= this.matHeight) return

        if (this.getTile(matX, matY) !== undefined) return

        for(let tileIdx = 0; true; ++tileIdx) {
            const tile = tiles[tileIdx]
            
            //tile.rotation = getRandomInt(4)
            //this.setTile(matX, matY, tile)
            const isAllowed = this.tileAllowed(matX, matY, tile)
            if (isAllowed || tileIdx == tiles.length-1) { // when end reached just place the last evaluated one
                tile.failed = tileIdx
                tile.allowed = isAllowed
                this.setTile(matX, matY, tile)
                //tile.rotation = maxRotation
                tiles.splice(tileIdx, 1)
                break
            }
        }
    }

    tileAllowed(matX, matY, tile) {
        let left = 0
        let right = 0
        let up = 0
        let down = 0

        if (tile.arr[0] > 0) ++up
        if (tile.arr[1] > 0) ++up
        if (tile.arr[2] > 0) ++left
        if (tile.arr[3] > 0) ++right
        if (tile.arr[4] > 0) ++left
        if (tile.arr[5] > 0) ++left
        if (tile.arr[6] > 0) ++up
        if (tile.arr[7] > 0) ++down

        let upLeftCorner = 0
        let upRightCorner = 0
        let downLeftCorner = 0
        //let downRightCorner = 0

        if (tile.arr[0] > 0) ++upLeftCorner
        if (tile.arr[1] > 0) ++upRightCorner
        if (tile.arr[4] > 0) ++upLeftCorner 
        if (tile.arr[5] > 0) ++downLeftCorner 

        const leftTile     = this.getTile(matX - 1, matY    )
        const rightTile    = this.getTile(matX + 1, matY    )
        const upTile       = this.getTile(matX    , matY - 1)
        const downTile     = this.getTile(matX    , matY + 1)
        const upRightTile  = this.getTile(matX + 1, matY - 1)
        const downLeftTile = this.getTile(matX - 1, matY + 1)

        if (leftTile === undefined) {
            left = 0
            upLeftCorner = 2
            downLeftCorner = 2
        } else {
            if (leftTile.arr[3] > 0) ++left
            if (leftTile.arr[1] > 0) ++upLeftCorner
        }

        if (rightTile === undefined) {
            right = 0
            upRightCorner = 2
        } else {
            if (rightTile.arr[2] > 0) ++right
            if (rightTile.arr[4] > 0) ++right
            if (rightTile.arr[5] > 0) ++right
            if (rightTile.arr[0] > 0) ++upRightCorner
            if (rightTile.arr[4] > 0) ++upRightCorner
        }
        
        if (upTile === undefined) {
            up = 0
            upLeftCorner = 2
            upRightCorner = 2
        } else {
            if (upTile.arr[7] > 0) ++up
            if (upTile.arr[5] > 0) ++upLeftCorner
        }
        
        if (downTile === undefined) {
            down = 0
            downLeftCorner = 2 // so surely ok
        } else {
            if (downTile.arr[0] > 0) ++down
            if (downTile.arr[1] > 0) ++down
            if (downTile.arr[6] > 0) ++down
            if (downTile.arr[0] > 0) ++downLeftCorner
            if (downTile.arr[4] > 0) ++downLeftCorner
        }

        if (upRightTile === undefined) upRightCorner = 2
        else if (upRightTile.arr[5] > 0) ++upRightCorner
        if (downLeftTile === undefined) downLeftCorner = 2
        else if (downLeftTile.arr[1] > 0) ++downLeftCorner

        return left != 1 && right != 1 && up != 1 && down != 1 && upLeftCorner != 1 && upRightCorner != 1 && downLeftCorner != 1
    }

    draw(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (let matY = 0 ; matY < this.matHeight; ++matY) {
            for (let matX = 0 ; matX < this.matWidth; ++matX) {
                const tile = this.getTile(matX, matY)
                if (tile != null) { // also false when undefined
                    tile.draw(ctx, 1 + matX*2, 1 + matY*2) // +1 +1 for a bit of offset
                } else {
                    const middleX = 1 + matX*2
                    const middleY = 1 + matY*2
                    ctx.fillStyle = "#e0e0e0"
                    ctx.beginPath()
                    ctx.moveTo(middleX * 24 - 24, middleY * 24 - 24)
                    ctx.lineTo(middleX * 24 + 24, middleY * 24 - 24)
                    ctx.lineTo(middleX * 24 + 24, middleY * 24 + 24)
                    ctx.lineTo(middleX * 24 - 24, middleY * 24 + 24)
                    ctx.fill()
                }
            }
        }
    }
}

const canvas = document.getElementById("myCanvas")
const ctx = canvas.getContext("2d")

const world = new World(8, 8)

class Tile { // Tegel
    constructor(arr) { // array [0,1,2,0] is NW niets, NE muur, SE deur, SW niets
        this.arr = arr
        this.rotation = 0
        this.failed = 0
        this.allowed = false
    }

    drawLineSegment(ctx, tileX, tileY, tileDx, tileDy) {
        const x = tileX * 24
        const y = tileY * 24
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + tileDx * 24, y + tileDy * 24)
        ctx.stroke()
    }

    drawCircle(ctx, tileX, tileY, tileDx, tileDy) {
        const x = tileX * 24
        const y = tileY * 24
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.arc(x + tileDx * 11, y + tileDy * 11, 9, 0, 2 * Math.PI)
        ctx.stroke()
    }

    drawLineOrCircle(ctx, tileX, tileY, tileDx, tileDy, lineType) {
        if (lineType >= 1)
            this.drawLineSegment(ctx, tileX, tileY, tileDx, tileDy)
        if (lineType == 2)
            this.drawCircle(ctx, tileX, tileY, tileDx, tileDy)
    }

    draw(ctx, middleX, middleY) {
        ctx.fillStyle = (middleX + middleY) % 4 == 0 ? "#0000ff10" : "#ffffff10" // "blue" : "white"
        ctx.beginPath()
        ctx.moveTo(middleX * 24 - 24, middleY * 24 - 24)
        ctx.lineTo(middleX * 24 + 24, middleY * 24 - 24)
        ctx.lineTo(middleX * 24 + 24, middleY * 24 + 24)
        ctx.lineTo(middleX * 24 - 24, middleY * 24 + 24)
        ctx.fill()

        this.drawLineOrCircle(ctx, middleX - 1, middleY - 1, 1, 0, this.arr[0])
        this.drawLineOrCircle(ctx, middleX    , middleY - 1, 1, 0, this.arr[1])
        this.drawLineOrCircle(ctx, middleX - 1, middleY    , 1, 0, this.arr[2])
        this.drawLineOrCircle(ctx, middleX    , middleY    , 1, 0, this.arr[3])
        this.drawLineOrCircle(ctx, middleX - 1, middleY - 1, 0, 1, this.arr[4])
        this.drawLineOrCircle(ctx, middleX - 1, middleY    , 0, 1, this.arr[5])
        this.drawLineOrCircle(ctx, middleX    , middleY - 1, 0, 1, this.arr[6])
        this.drawLineOrCircle(ctx, middleX    , middleY    , 0, 1, this.arr[7])

        ctx.font = '30px Arial'
        ctx.fillStyle = this.allowed ? 'green' : 'red'
        ctx.fillText(`${this.failed}`, middleX * 24 - 12, middleY * 24 + 12)
    }

    getSegment = (i) => this.arr[(i + this.rotation) % 4]
}

const mult = 1 // (world.matWidth * world.matHeight) / 33
const tiles = []
for (let i = 0; i < 9 * mult; ++i) // empty
    tiles.push(new Tile([0, 0, 0, 0, 0, 0, 0, 0]))
for (let i = 0; i < 12 * mult; ++i) // up line
    tiles.push(new Tile([1, 1, 0, 0, 0, 0, 0, 0]))
for (let i = 0; i < 12 * mult; ++i) // left line
    tiles.push(new Tile([0, 0, 0, 0, 1, 1, 0, 0]))
for (let i = 0; i < 9 * mult; ++i) // big corner
    tiles.push(new Tile([1, 1, 0, 0, 1, 1, 0, 0]))
for (let i = 0; i < 3 * mult; ++i) // up up
    tiles.push(new Tile([1, 1, 1, 1, 0, 1, 0, 0]))
for (let i = 0; i < 3 * mult; ++i) // left left
    tiles.push(new Tile([0, 1, 0, 0, 1, 1, 1, 1]))
for (let i = 0; i < 3 * mult; ++i) // hor
    tiles.push(new Tile([0, 0, 1, 1, 0, 1, 0, 0]))
for (let i = 0; i < 3 * mult; ++i) // hor2 (new)
    tiles.push(new Tile([0, 0, 1, 1, 1, 0, 0, 0]))
for (let i = 0; i < 2 * mult; ++i) // hor-T (new)
    tiles.push(new Tile([0, 0, 1, 1, 1, 1, 0, 0]))
for (let i = 0; i < 3 * mult; ++i) // vert
    tiles.push(new Tile([0, 1, 0, 0, 0, 0, 1, 1]))
for (let i = 0; i < 3 * mult; ++i) // vert2 (new)
    tiles.push(new Tile([1, 0, 0, 0, 0, 0, 1, 1]))
for (let i = 0; i < 2 * mult; ++i) // vert-T (new)
    tiles.push(new Tile([1, 1, 0, 0, 0, 0, 1, 1]))
tiles.length = 0

for (let i = 0; i < 9 * mult; ++i) // empty
    tiles.push(new Tile([0, 0, 0, 0, 0, 0, 0, 0]))
// for (let i = 0; i < 12 * mult; ++i) // up line
//     tiles.push(new Tile([1, 1, 0, 0, 0, 0, 0, 0]))
// for (let i = 0; i < 12 * mult; ++i) // left line
//     tiles.push(new Tile([0, 0, 0, 0, 1, 1, 0, 0]))
for (let i = 0; i < 11 * mult; ++i) // big corner
    tiles.push(new Tile([1, 1, 0, 0, 1, 1, 0, 0]))
for (let i = 0; i < 6 * mult; ++i) // up up
    tiles.push(new Tile([1, 1, 1, 1, 0, 1, 0, 0]))
for (let i = 0; i < 6 * mult; ++i) // left left
    tiles.push(new Tile([0, 1, 0, 0, 1, 1, 1, 1]))
for (let i = 0; i < 6 * mult; ++i) // hor
    tiles.push(new Tile([0, 0, 1, 1, 0, 1, 0, 0]))
for (let i = 0; i < 6 * mult; ++i) // hor2 (new)
    tiles.push(new Tile([0, 0, 1, 1, 1, 0, 0, 0]))
for (let i = 0; i < 4 * mult; ++i) // hor-T (new)
    tiles.push(new Tile([0, 0, 1, 1, 1, 1, 0, 0]))
for (let i = 0; i < 6 * mult; ++i) // vert
    tiles.push(new Tile([0, 1, 0, 0, 0, 0, 1, 1]))
for (let i = 0; i < 6 * mult; ++i) // vert2 (new)
    tiles.push(new Tile([1, 0, 0, 0, 0, 0, 1, 1]))
for (let i = 0; i < 4 * mult; ++i) // vert-T (new)
    tiles.push(new Tile([1, 1, 0, 0, 0, 0, 1, 1]))


shuffle(tiles)

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = getRandomInt(i + 1)
        
        // Swap elements array[i] and array[j]
        ;[array[i], array[j]] = [array[j], array[i]] // semicolon needed
    }
    return array
}

const rotateLeft = (array, positions) => array.slice(positions).concat(array.slice(0, positions))

// Get the button element
const button = document.getElementById('myButton')

const iterator = world.create()

// Add a click event listener to the button
button.addEventListener('click', () => {
    iterator.next()
    world.draw(ctx)
    //alert('Button was clicked!')
})

let mouseDown = false
function handleMouseDown(event) {
    mouseDown = true
    handleMouseMove(event)
}

function handleMouseUp(event) {
    mouseDown = false
}

function handleMouseMove(event) {
    if (!mouseDown) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / 48)
    const y = Math.floor((event.clientY - rect.top) / 48)
    world.placeTile(x, y)
    world.draw(ctx)
}

canvas.addEventListener('mousedown', handleMouseDown)
canvas.addEventListener('mouseup', handleMouseUp)
canvas.addEventListener('mousemove', handleMouseMove)

world.draw(ctx)

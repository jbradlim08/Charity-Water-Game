const gameBoard = document.getElementById("game_board");
const ctx = gameBoard.getContext("2d");

const resetButton = document.getElementById("reset_button");
const cleanWaterScoreText = document.getElementById("clean_water_score");
const dirtyWaterScoreText = document.getElementById("dirty_water_score");

const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

const trainColor = 'lightgreen';
const trainBorderColor = 'black';
const waterColor = 'red';
const backgroundColor = '#378BAF';

const unitSize = 25;

// (-) to left and (+) to right
let velocity = {
    x: unitSize,
    y:0
}
let running = false;

let waterPos = {
    x: 0,
    y: 0
}

let train = [ // Default value
    {x:unitSize * 3, y:0},
    {x:unitSize * 2, y:0},
    {x:unitSize, y:0},
    {x:0, y:0}
]

let cleanWaterScore, dirtyWaterScore;

window.addEventListener('keydown', changeDirection);
resetButton.addEventListener('click', resetGame);

gameStart();


function gameStart(){
    running = true;
    cleanWaterScoreText.textContent = cleanWaterScore;
    createWater();
    drawWater();
    nextTick();
}

function nextTick(){
    if(running){
        setTimeout(() => {
            // clear canvas
            clearCanvas();
            moveTrain();

            // redraw canvas
            drawWater();
            drawTrain();

            // check game over
            checkGameOver();

             // recurse back
            nextTick();
        }, 100)
    } else{
        displayGameOver();
    }
}

// Repainting the board
function clearCanvas(){ 
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, gameWidth, gameHeight)
}

// Will find a random place to place a food
function createWater(){
    function randomWater(min, max){
        return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    }

    waterPos.x = randomWater(0, gameWidth - unitSize);
    waterPos.y = randomWater(0, gameWidth - unitSize);
}

function drawWater(){
    ctx.fillStyle = waterColor;
    ctx.fillRect(waterPos.x, waterPos.y, unitSize, unitSize);
}

function moveTrain(){
    const head = {
        x: train[0].x + velocity.x,
        y: train[0].y + velocity.y
    };

    // To add in front
    train.unshift(head);

    // check collision
    checkTrainCollision();
}

function checkTrainCollision(){
    if(train[0].x == waterPos.x && train[0].y == waterPos.y){
        cleanWaterScore++;
        cleanWaterScoreText.text = cleanWaterScore;
        createWater();
    } else{
        train.pop();
    }
}

function drawTrain(){
    ctx.fillStyle = trainColor;
    ctx.strokeStyle = trainBorderColor;
    train.forEach((trainPart) => {
        ctx.fillRect(trainPart.x, 
                    trainPart.y, 
                    unitSize, 
                    unitSize)
        ctx.strokeRect(trainPart.x, 
                    trainPart.y, 
                    unitSize, 
                    unitSize)
    })
}

function changeDirection(event){
    const keyPressed = event.keyCode;
    console.log(keyPressed)

    // Code
    const LEFT_KEYS = [37, 65];   // Left arrow, A
    const TOP_KEYS = [38, 87];    // Up arrow, W
    const RIGHT_KEYS = [39, 68];  // Right arrow, D
    const BOTTOM_KEYS = [40, 83]; // Down arrow, S

    // Condition boolean
    const goingLeft = (velocity.x == -unitSize)
    const goingUp = (velocity.y == -unitSize)
    const goingRight = (velocity.x == unitSize)
    const goingDown = (velocity.y == unitSize)

    switch(true){
        // To avoid turnaround
        case LEFT_KEYS.includes(keyPressed) && !goingRight:
            velocity.x = -unitSize;
            velocity.y = 0;
            break;
        case TOP_KEYS.includes(keyPressed) && !goingDown:
            velocity.x = 0;
            velocity.y = -unitSize;
            break;
        case RIGHT_KEYS.includes(keyPressed) && !goingLeft:
            velocity.x = unitSize;
            velocity.y = 0;
            break;
        case BOTTOM_KEYS.includes(keyPressed) && !goingUp:
            velocity.x = 0;
            velocity.y = unitSize;
            break;
    }
}

function checkGameOver(){
    switch(true){
        case train[0].x < 0:
            running = false;
            break;
        case train[0].x >= gameWidth:
            running = false;
            break;
        case train[0].y < 0:
            running = false;
            break;
        case train[0].y >= gameHeight:
            running = false;
            break;
    }

    for(let i = 1; i < train.length; i++){
        if(train[i].x == train[0].x &&
           train[i].y == train[0].y
        ){d
            running = false;
        }
    }
}

function displayGameOver(){
    ctx.font = "50px MV Boli";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
}

function resetGame(){

}

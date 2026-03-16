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

let xVelocity = unitSize; // (-) to left and (+) to right
let yVelocity = 0;
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
        }, 50)
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
        x: train[0].x + xVelocity,
        y: train[0].y + yVelocity
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

function changeDirection(){

}

function checkGameOver(){

}

function displayGameOver(){

}

function resetGame(){

}

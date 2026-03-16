const gameBoard = document.getElementById("game_board");
const ctx = gameBoard.getContext("2d");

const resetButton = document.getElementById("reset_button");
const cleanWaterScoreText = document.getElementById("clean_water_score");
const dirtyWaterScoreText = document.getElementById("dirty_water_score");

const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

const trainColor = 'lightgreen';
const trainBorder = 'black';
const waterColor = 'red';
const backgroundColor = '#378BAF';

const unitSize = 25;

let xVelocity = unitSize; // (-) to left and (+) to right
let yVelocity = 0;
let running = false;

let waterX, waterY;

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
    drawTrain();
    nextTick();
}

function nextTick(){
    if(running){
        setTimeout(() => {
            moveTrain();
            drawTrain();
            checkGameOver();
            nextTick(); // recursion
        }, 50)
    } else{
        displayGameOver();
    }
}

// Repainting the board
function clearBoard(){ 
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, gameWidth, gameHeight)
}

// Will find a random place to place a food
function createWater(){
    function randomWater(min, max){
        return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    }

    waterX = randomWater(0, gameWidth - unitSize);
    waterY = randomWater(0, gameWidth - unitSize);
}

function drawWater(){
    ctx.fillStyle = waterColor;
    ctx.fillRect(waterX, waterY, unitSize, unitSize);
}

function moveTrain(){

}

function drawTrain(){

}

function changeDirection(){

}

function checkGameOver(){

}

function displayGameOver(){

}

function resetGame(){

}

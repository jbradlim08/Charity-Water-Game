const gameBoard = document.getElementById("game_board");
const ctx = gameBoard.getContext("2d");
const resetButton = document.getElementById("reset_button");

const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

const trainColor = 'lightgreen';
const trainBorder = 'black';
const waterColor = 'darkblue';

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

window.addEventListener('keydown', changeDirection);
resetButton.addEventListener('click', resetGame);

gameStart();

function gameStart(){

}

function nextTick(){

}

// Repainting the board
function clearBoard(){ 
    
}

// Will find a random place to place a food
function createWater(){

}

function drawWater(){

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

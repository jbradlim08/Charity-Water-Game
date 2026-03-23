const gameBoard = document.getElementById("game_board");
const ctx = gameBoard.getContext("2d");

const restartButton = document.getElementById("restart_button");
const cleanWaterScoreText = document.getElementById("clean_water_score");
const dirtyWaterScoreText = document.getElementById("dirty_water_score");
const gameTimer = document.getElementById("game_timer");
const emojiDisplay = document.getElementById('emoji');
const difficultySelect = document.getElementById("difficulty_select");

// Canvas size
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

const backgroundColor = '#378BAF';
const trainColor = '#3CD8E6';
const trainBorderColor = 'rgb(255, 200, 0)';
const waterColors = {
    clean: '#3CD8E6',
    dirty: 'brown'
}

const emojis = {
    happy: '😁',
    sad: '😔'
};

const difficultySettings = {
    easy: { unitSize: 25, perTick: 100, waterChange: 5000, gameTime: 60 },
    medium: { unitSize: 25, perTick: 85, waterChange: 4500, gameTime: 90 },
    hard: { unitSize: 20, perTick: 70, waterChange: 4000, gameTime: 120 }
};

let unitSize = 25;
let perTick = 100;
let waterChange = 5000;
let gameTime = 60;


// (-) to left and (+) to right
let velocity = {
    x: unitSize,
    y:0
}

let running = false;

let cleanWaterPos = { // always one
    x: 0,
    y: 0
}

let dirtyWaterPos = [];

let train = [ // Default value
    {x:unitSize, y:0},
    {x:0, y:0}
]

let cleanWaterScore, dirtyWaterScore;
let dirtyWaterTimer;
let gameTickTimer;
let countDownTimer;
let growthProgress = 0;
let time;

window.addEventListener('keydown', changeDirection);
restartButton.addEventListener('click', gameStart);
difficultySelect.addEventListener('change', onDifficultyChange);

applyDifficulty(difficultySelect.value);

gameStart();

function applyDifficulty(mode){
    const settings = difficultySettings[mode] || difficultySettings.easy;
    unitSize = settings.unitSize;
    perTick = settings.perTick;
    waterChange = settings.waterChange;
    gameTime = settings.gameTime;
}

function onDifficultyChange(event){
    applyDifficulty(event.target.value);
    gameStart();
}

function initialValue(){
    clearTimeout(gameTickTimer);
    clearTimeout(dirtyWaterTimer);
    clearInterval(countDownTimer);

    cleanWaterScore = 0;
    dirtyWaterScore = 0;
    cleanWaterScoreText.textContent = cleanWaterScore;
    dirtyWaterScoreText.textContent = dirtyWaterScore;
    gameTimer.textContent = gameTime;

    velocity.x = unitSize;
    velocity.y = 0;
    dirtyWaterPos = [];
    growthProgress = 0;

    train = [ // Default value
        {x:unitSize, y:0},
        {x:0, y:0}
    ]

    running = true;
}

function gameStart(){
    initialValue();
    createWater();
    drawCleanWater();
    nextTick();
    countDown();
    setEmoji();
}

function nextTick(){
    if(running){
        gameTickTimer = setTimeout(() => {
            // Clear canvas
            clearCanvas();

            // Move train
            moveTrain();

            // Redraw canvas
            drawCleanWater();
            drawDirtyWater();
            drawTrain();
            
            // Set emoji
            setEmoji();

            // Check game over
            checkGameOver();


             // Recurse back
            nextTick();
        }, perTick)
    } else{
        displayGameOver();
    }
}

// Repainting the board
function clearCanvas(){ 
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, gameWidth, gameHeight)
}

// Will find a random place to place a water
function createWater(){
    function randomWater(min, max){
        return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    }

    cancelDirtyWaterTimer();
    cleanWaterPos.x = randomWater(0, gameWidth - unitSize);
    cleanWaterPos.y = randomWater(0, gameHeight - unitSize);

    startDirtyWaterTimer(cleanWaterPos.x, cleanWaterPos.y);
}

function startDirtyWaterTimer(posX, posY) {
  dirtyWaterTimer = setTimeout(() => {
    dirtyWaterScore++;
    dirtyWaterScoreText.textContent = dirtyWaterScore;
    dirtyWaterPos.push(
        {x: posX, y: posY}
    )
    createWater(); // call it
  }, waterChange);
}

function cancelDirtyWaterTimer() {
  clearTimeout(dirtyWaterTimer);
}

function drawCleanWater(){
    ctx.fillStyle = waterColors.clean;
    ctx.fillRect(cleanWaterPos.x, cleanWaterPos.y, unitSize, unitSize);
}

function drawDirtyWater(){
    ctx.fillStyle = waterColors.dirty;
    dirtyWaterPos.forEach((water) => {
        ctx.fillRect(water.x, 
                    water.y, 
                    unitSize, 
                    unitSize)
    })
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
    if(train[0].x == cleanWaterPos.x && train[0].y == cleanWaterPos.y){
        createWater();

        growthProgress += 1;
        if(growthProgress < 3){
            train.pop();
        } else{
            cleanWaterScore++;
            cleanWaterScoreText.textContent = cleanWaterScore;
            growthProgress = 0;
        }
    } else{
        train.pop();
    }
}

function drawTrain(){
    ctx.lineWidth = 3;  
    train.forEach((trainPart, index) => {
        
        if (index === 0) {
            // head style
            ctx.fillStyle = trainBorderColor;
            ctx.strokeStyle = 'black';
            ctx.fillRect(trainPart.x, 
                         trainPart.y, 
                         unitSize, 
                         unitSize)
            ctx.strokeRect(trainPart.x,
                           trainPart.y, 
                           unitSize, 
                           unitSize)
        } else {
            ctx.fillStyle = trainColor;
            ctx.strokeStyle = trainBorderColor;
            const isTail = index === train.length - 1; // check last index
            if(isTail){
                const fillHeight = growthProgress === 1
                    ? unitSize / 3
                    : growthProgress === 2
                    ? (2 * unitSize) / 3
                    : unitSize;
                if(growthProgress === 1){
                    ctx.fillRect(trainPart.x, 
                        trainPart.y + (unitSize - fillHeight), 
                        unitSize, 
                        unitSize - 2 * (unitSize / 3))
                }
                else if(growthProgress === 2){
                    ctx.fillRect(trainPart.x, 
                            trainPart.y + (unitSize - fillHeight), 
                            unitSize, 
                            unitSize - (unitSize / 3))
                }
                // else growhtProgress 0 / 3 will be empty
            } else{
                ctx.fillRect(trainPart.x, trainPart.y, 
                            unitSize, 
                            unitSize)
            }
            ctx.strokeRect(trainPart.x,
                trainPart.y, 
                unitSize,
                unitSize)
        }
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
        ){
            running = false;
        }
    }
}

function displayGameOver(){
    clearInterval(countDownTimer);
    clearTimeout(gameTickTimer);
    clearTimeout(dirtyWaterTimer);

    ctx.font = "50px MV Boli";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    if (time === 0){
        ctx.fillText("TIMES UP!", gameWidth / 2, gameHeight / 2);
        ctx.font = "22px MV Boli";
        ctx.fillText(`You collected ${cleanWaterScore} clean water`, 
            gameWidth / 2, gameHeight / 2 + 30);
        ctx.fillText(`and wasted ${dirtyWaterScore} clean water`, 
            gameWidth / 2, gameHeight / 2 + 60);
    }else{
        ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    }
}

function countDown(){
    time = gameTime;
    countDownTimer = setInterval(() => {
        time--;
        gameTimer.textContent = time;

        if (time <= 0) {
        clearInterval(countDownTimer);
        running = false;
    }
    }, 1000)
}

function setEmoji() {
    if(cleanWaterScore >= dirtyWaterScore){
        emojiDisplay.textContent = emojis.happy;
    } else{
        emojiDisplay.textContent = emojis.sad;
    }
}

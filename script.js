const gameBoard = document.getElementById("game_board");
const gameContainer = document.getElementById("game_container");
const ctx = gameBoard.getContext("2d");

const restartButton = document.getElementById("restart_button");
const cleanWaterScoreText = document.getElementById("clean_water_score");
const dirtyWaterScoreText = document.getElementById("dirty_water_score");
const gameTimer = document.getElementById("game_timer");
const emojiDisplay = document.getElementById('emoji');
const emojiStatus = document.getElementById("emoji_status");
const difficultySelect = document.getElementById("difficulty_select");

// Canvas size
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

const backgroundColor = '#347e9e';
const trainColor = '#3CD8E6';
const trainBorderColor = 'rgb(255, 200, 0)';
const waterColors = {
    clean: '#3CD8E6',
    dirty: 'brown'
}

const emojis = {
    happy: "\u{1F601}",
    sad: "\u{1F614}"
};

const difficultySettings = {
    easy: { unitSize: 25, perTick: 100, waterChange: 5000, gameTime: 60 },
    medium: { unitSize: 25, perTick: 75, waterChange: 4500, gameTime: 90 },
    hard: { unitSize: 20, perTick: 60, waterChange: 4000, gameTime: 120 }
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
// Phone touch
let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 24;
let audioContext;
let endSoundPlayed = false;

window.addEventListener('keydown', changeDirection);
restartButton.addEventListener('click', gameStart);
difficultySelect.addEventListener('change', onDifficultyChange);
setupPhoneControls();

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

function setupPhoneControls(){
    // Phone controls: allow swipes across the full game area, not just canvas.
    if(window.PointerEvent){
        gameContainer.addEventListener('pointerdown', handlePointerDown);
        gameContainer.addEventListener('pointerup', handlePointerUp);
    } else{
        gameContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        gameContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Prevent accidental page gestures while swiping anywhere in the game area.
    gameContainer.addEventListener('touchmove', preventTouchScroll, { passive: false });
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
    endSoundPlayed = false;

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
    playDirtyWaterSound();
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
        playCollectSound();
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

function playCollectSound(){
    const now = getAudioTime();
    if(now === null){
        return;
    }
    playTone(660, now, 0.10, "triangle", 0.10);
    playTone(880, now + 0.08, 0.10, "triangle", 0.08);
}

function playDirtyWaterSound(){
    const now = getAudioTime();
    if(now === null){
        return;
    }
    playTone(240, now, 0.12, "sawtooth", 0.08);
}

function playGameOverSound(){
    const now = getAudioTime();
    if(now === null){
        return;
    }
    playTone(360, now, 0.12, "square", 0.09);
    playTone(260, now + 0.10, 0.14, "square", 0.09);
}

function playTimesUpSound(){
    const now = getAudioTime();
    if(now === null){
        return;
    }
    playTone(520, now, 0.10, "triangle", 0.08);
    playTone(420, now + 0.10, 0.12, "triangle", 0.08);
    playTone(320, now + 0.22, 0.14, "triangle", 0.08);
}

function getAudioTime(){
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx){
        return null;
    }
    if(!audioContext){
        audioContext = new AudioCtx();
    }
    return audioContext.currentTime;
}

function playTone(frequency, startTime, duration, type, maxGain){
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
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
    const LEFT_KEYS = [37, 65];
    const TOP_KEYS = [38, 87];
    const RIGHT_KEYS = [39, 68];
    const BOTTOM_KEYS = [40, 83];

    switch(true){
        case LEFT_KEYS.includes(keyPressed):
            setDirection("left");
            break;
        case TOP_KEYS.includes(keyPressed):
            setDirection("up");
            break;
        case RIGHT_KEYS.includes(keyPressed):
            setDirection("right");
            break;
        case BOTTOM_KEYS.includes(keyPressed):
            setDirection("down");
            break;
    }
}

function setDirection(direction){
    const goingLeft = velocity.x === -unitSize;
    const goingUp = velocity.y === -unitSize;
    const goingRight = velocity.x === unitSize;
    const goingDown = velocity.y === unitSize;

    if(direction === "left" && !goingRight){
        velocity.x = -unitSize;
        velocity.y = 0;
    } else if(direction === "up" && !goingDown){
        velocity.x = 0;
        velocity.y = -unitSize;
    } else if(direction === "right" && !goingLeft){
        velocity.x = unitSize;
        velocity.y = 0;
    } else if(direction === "down" && !goingUp){
        velocity.x = 0;
        velocity.y = unitSize;
    }
}

function handleTouchStart(event){
    // Phone: remember where the swipe starts.
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(event){
    // Phone: convert swipe direction into game direction.
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if(absX < minSwipeDistance && absY < minSwipeDistance){
        return;
    }

    if(absX > absY){
        setDirection(deltaX > 0 ? "right" : "left");
    } else{
        setDirection(deltaY > 0 ? "down" : "up");
    }
}

function preventTouchScroll(event){
    // Phone: prevent the page from scrolling while swiping on canvas.
    event.preventDefault();
}

function handlePointerDown(event){
    touchStartX = event.clientX;
    touchStartY = event.clientY;
}

function handlePointerUp(event){
    const deltaX = event.clientX - touchStartX;
    const deltaY = event.clientY - touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if(absX < minSwipeDistance && absY < minSwipeDistance){
        return;
    }

    if(absX > absY){
        setDirection(deltaX > 0 ? "right" : "left");
    } else{
        setDirection(deltaY > 0 ? "down" : "up");
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
    if(!endSoundPlayed){
        if (time === 0){
            playTimesUpSound();
        } else{
            playGameOverSound();
        }
        endSoundPlayed = true;
    }

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
        ctx.font = "22px MV Boli";
        ctx.fillText("Collect clean water before it turns dirty", gameWidth / 2, gameHeight / 2 + 40);
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
        emojiStatus.textContent = "Good";
    } else{
        emojiDisplay.textContent = emojis.sad;
        emojiStatus.textContent = "Risk";
    }
}


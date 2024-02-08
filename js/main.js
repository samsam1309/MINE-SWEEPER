"use strict"

var BOARD_SIZE = 12
var MINES_NUM = 32
const MINE = "💣"

var gBoard
var gSecondsPassed
var gTimerInterval
var gLives = 3

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var isFirstClick = true;
var gLevel
var gHitCount
var gSafeClickCount

var hintRemaning = 3
var safeClickRemaning = 3

var numOfHint
var numOfSafeClick


function selectLevel(level) {
    gLevel = level;
    switch (level) {
        case 1:
            BOARD_SIZE = 4;
            MINES_NUM = 2;
            break;

        case 2:
            BOARD_SIZE = 8;
            MINES_NUM = 12;
            break;

        case 3:
            BOARD_SIZE = 12;
            MINES_NUM = 32;
            break;
    }
    onInit();
}

function onInit() {
    gGame.isOn = true
    isFirstClick = true
    gHitCount = 0
    hintRemaning = 3
    gSafeClickCount = 0
    safeClickRemaning = 3
    numOfHint = document.getElementById("numOfHint")
    numOfHint.innerText = hintRemaning
    numOfSafeClick = document.getElementById("numOfSafeClick")
    numOfSafeClick.innerText = safeClickRemaning
    var elBtn = document.querySelector(".emoji")
    elBtn.innerText = "😃"
    play()
}

function play() {
    if (gGame.isOn === true) {
        stopTimer()
        startTimer()
        if (isFirstClick) {
            gBoard = buildBoard();
            RandomPlaceMines(gBoard, MINES_NUM);
            paintMines()
            updateMinesNegsCount();
            isFirstClick = false;
        }
        renderBoard(gBoard)
    }
}

function startTimer() {
    gSecondsPassed = 0
    gTimerInterval = setInterval(function () {
        gSecondsPassed++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(gTimerInterval);
}

function updateTimerDisplay() {
    var elTimer = document.getElementById("timer");
    elTimer.innerText = pad(gSecondsPassed, 3);
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) { num = "0" + num; }
    return num;
}

function buildBoard() {
    const rowCount = BOARD_SIZE
    const colCount = BOARD_SIZE
    const board = []


    for (var i = 0; i < rowCount; i++) {
        board[i] = []
        for (var j = 0; j < colCount; j++) {

            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }

    console.table(board)
    return board
}

function renderBoard(board) {
    var strHtml = "";
    for (var i = 0; i < board.length; i++) {
        strHtml += "<tr>";
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var className = `cell-${i}-${j}`;
            var cellContent = '';

            if (currCell.isShown) {
                cellContent = currCell.isMine ? '💣' : currCell.minesAroundCount;
                className += ' shown'
            } else if (currCell.isMarked) {
                cellContent = '🚩';
            }

            strHtml += `<td class="${className}" onclick="cellClicked(event, ${i}, ${j})" oncontextmenu="cellClicked(event, ${i}, ${j})">${cellContent}</td>`;
        }
        strHtml += "</tr>";
    }
    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
    console.log("elBoard", elBoard)
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    if (board[rowIdx][colIdx].isMine) return
    var countNegs = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue

            const cell = board[i][j]
            if (i === rowIdx && j === colIdx) continue
            if (cell.isMine) countNegs++
        }
    }

    board[rowIdx][colIdx].minesAroundCount = countNegs

}

function updateMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            setMinesNegsCount(gBoard, i, j)
        }
    }

}

function cellClicked(event, row, col) {
    event.preventDefault();

    if (!gGame.isOn) return;

    var cell = gBoard[row][col];

    if (event.type === 'contextmenu') {
        placeFlag(row, col);
    } else if (event.type === 'click' && event.button === 0) {
        if (cell.isMine) {
            handleMineClick(row, col)
        } else if (!cell.isShown) {
            cell.isShown = true;
            if (cell.minesAroundCount === 0 && !cell.isMine) {
                revealNeighbors(row, col);
            }
            renderBoard(gBoard);
        }
    }

    checkWin();
}

function handleMineClick(row, col) {
    gLives--;

    if (gLives === 0) {
        checkGameOver();
    } else {
        alert("You clicked a mine. You have " + gLives + " lives remaining.");
        gBoard[row][col].isShown = true;
        renderBoard(gBoard);
    }
}

function placeFlag(row, col) {
    var cell = gBoard[row][col];
    if (!cell.isShown) {
        if (cell.isMarked) {
            cell.isMarked = false;
        } else {
            cell.isMarked = true;
        }
        renderBoard(gBoard);
    }
}

function revealNeighbors(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            var neighborCell = gBoard[i][j];

            if (!neighborCell.isShown) {
                neighborCell.isShown = true;

                if (neighborCell.minesAroundCount === 0 && !neighborCell.isMine) {
                    revealNeighbors(i, j);
                }
            }
        }
    }
}

function RandomPlaceMines(board, numOfMines) {
    for (var i = 0; i < numOfMines; i++) {

        var randRow = getRandomInt(0, BOARD_SIZE);
        var randCol = getRandomInt(0, BOARD_SIZE);
        var celMine = board[randRow][randCol];

        while (celMine.isMine === true) {
            randRow = getRandomInt(0, BOARD_SIZE);
            randCol = getRandomInt(0, BOARD_SIZE);
            celMine = board[randRow][randCol];
        }

        board[randRow][randCol].isMine = true;

    }
}

function checkGameOver() {
    stopTimer()
    revealMines()
    renderBoard(gBoard)
    paintMines()

    var elBtn = document.querySelector(".emoji")
    elBtn.innerText = "🤯"
    gGame.isOn = false
}
function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) currCell.isShown = true;
        }
    }
    renderBoard(gBoard);
}
function checkWin() {
    stopTimer()
    var cellShownCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isShown && !currCell.isMine) cellShownCount++

        }
    }
    if ((cellShownCount + MINES_NUM) === BOARD_SIZE ** 2) {
        var elBtn = document.querySelector(".emoji")
        elBtn.innerText = "😎"
        gGame.isOn = false
    }
}

function paintMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) {
                var elMine = document.querySelector(`.cell-${i}-${j}`)
                if (elMine) elMine.style.backgroundColor = "red"
            }
        }
    }
}

function activateSafeClick() {
    if (gSafeClickCount < 3) {
        var safeCell = findSafeCell()
        var cell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`)
        cell.style.backgroundColor = "pink"
        setTimeout(() => {
            cell.style.backgroundColor = "grey"
        }, 3000);
        gSafeClickCount++
        safeClickRemaning--
        var numOfSafeClick = document.getElementById("numOfSafeClick")
        numOfSafeClick.innerText = safeClickRemaning
    }
}

function findSafeCell() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isShown) {
                var safeCell = {
                    i: i,
                    j: j
                }
                return safeCell
            }
        }
    }
}

function disableHintSpan() {
    var hintSpan = document.getElementById('hintButton');
    hintSpan.style.pointerEvents = 'none';
    hintSpan.style.opacity = '0.5';
}
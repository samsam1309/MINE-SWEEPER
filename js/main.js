"use strict"

const BOARD_SIZE = 12
const MINES_NUM = 32
const MINE = "💣"
var gBoard
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {
    gGame.isOn = true
    play()
}

function play() {
    if(gGame.isOn === true) {
    gBoard = buildBoard()
    RandomPlaceMines(gBoard, MINES_NUM)
    updateMinesNegsCount()
    renderBoard(gBoard)
    }
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
                isMarked: true
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
            }

            strHtml += `<td class="${className}" onclick="cellClicked(${i}, ${j})">${cellContent}</td>`;
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

function cellClicked(row, col) {
    var cell = gBoard[row][col];
    if (cell.isMine) {
        gameOver()
    }
    if (!cell.isShown) {
        cell.isShown = true;
        if (cell.minesAroundCount === 0 && !cell.isMine) {
            revealNeighbors(row, col)
        }
        renderBoard(gBoard)
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
        var mine = document.querySelector(`.cell-${randRow}-${randCol}`);
        console.log("mine", mine)
       
    }
}

function gameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) currCell.isShown = true
        }
    }
    renderBoard(gBoard)
    var elBtn = document.querySelector("button")
    elBtn.innerText = "🤯"
    gGame.isOn = false
}
'use strict'
const MINE = 'MINE'
const EMPTY = 'EMPTY'
const FLAG = 'FLAG'

const MINE_IMG = '<img src="img/mine icon.png">'
const FLAG_IMG = '<img src="img/flag.png">'

// Model:
var gBoard
var gCell = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: true
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    Beginner: { SIZE: 4, MINES: 2 },
    Medium: { SIZE: 8, MINES: 14 },
    Expert: { SIZE: 12, MINES: 32 }
}
var gCurrentLevel
var cell = gBoard[i] && gBoard[i][j]

function selectLevel(level) {
    var selectedLevel = {
        Beginner: { SIZE: 4, MINES: 2 },
        Medium: { SIZE: 8, MINES: 14 },
        Expert: { SIZE: 12, MINES: 32 }
    }[level]

    if (selectedLevel) {
        gCurrentLevel = selectedLevel
        console.log(`Selected Level: ${level} - Size: ${selectedLevel.SIZE} - Mines: ${selectedLevel.MINES}`)
        initGame()
    }
}

function initGame() {
    gBoard = buildBoard()
    // gLevel = selectLevel()
    renderBoard(gBoard)
    document.getElementById('smiley').innerText = '😃'

    var cells = document.querySelectorAll('.board td')
    cells.forEach(function (cell, index) {
        cell.addEventListener('click', function () {
            var i = Math.floor(index / gCurrentLevel.SIZE)
            var j = index % gCurrentLevel.SIZE
            onCellClicked(cell, i, j)
        })
        cell.addEventListener('contextmenu', function (event) {
            event.preventDefault()
            var i = Math.floor(index / gCurrentLevel.SIZE)
            var j = index % gCurrentLevel.SIZE
            onCellRightClicked(cell, i, j)

        })
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function placeMines(board) {
    var minesToPlace = gCurrentLevel.MINES
    while (minesToPlace > 0) {
        var i = getRandomInt(0, gCurrentLevel.SIZE)
        var j = getRandomInt(0, gCurrentLevel.SIZE)
        if (!board[i][j].isMine) {
            board[i][j].isMine = true
            minesToPlace--
        }
    }
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gCurrentLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gCurrentLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }

            // cell.isMine = getRandomInt(0, gLevel.MINES)
            board[i][j] = cell
        }
    }
    placeMines(board)

    console.table(board)
    return board
}

function renderBoard(board) {
    var cell = gBoard[i] && gBoard[i][j]
    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            const currCell = board[i][j]
            const cellContent = currCell.isMine ? '' : ''
            strHTML += `<td class="cell" onclick="onCellClicked(${i},${j})">${cellContent}</td>\n`
            if (cell && cell.isMine)
                strHTML += MINE_IMG
        }
        if (cell && cell.isMarked) {
            strHTML += FLAG_IMG
            cell.isShown = true
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

function setMinesNegsCount(rowIdx, colIdx, board) {
    var minesAroundCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) minesAroundCount++
        }
    }
    return minesAroundCount
}

var board = buildBoard()
console.log(setMinesNegsCount(1, 2, board))


function onCellRightClicked(elCell, i, j) {
    var cell = gBoard[i] && gBoard[i][j]

    if (cell && cell.isShown) {
        return
    }
    cell.isMarked = !cell.isMarked

    if (cell.isMarked) {
        elCell.innerHTML = FLAG_IMG
        elCell.classList.add('mark')
    } else {
        elCell.innerHTML = ''
        elCell.classList.remove('mark')
    }
    gGame.markedCount++
    console.log('check right click')
}

var clickedCell

function onCellClicked(elCell, i, j) {
    var cell = elCell
    if (!elCell) {
        return
    }
    var cell = gBoard[i] && gBoard[i][j]
    // console.log('check after marked')

    if (cell && cell.isMarked) {
        return
    }
    else {
        if (cell && cell.isMine) {
            // alert('Game over')
            elCell.innerHTML = MINE_IMG
            revealAllMines(elCell)
            checkGameOver()

        } else if (cell && !cell.isMine) {
            cell.isShown = true
            cell.isMarked = true
            cell.minesAroundCount = setMinesNegsCount(i, j, gBoard)
            // renderBoard(gBoard)
            // elCell.innerHTML = minesAroundCount
            elCell.innerHTML = cell.minesAroundCount
            gGame.markedCount++
        }
        // console.log('check', cell.minesAroundCount)
    }
}

function revealAllMines(elCell) {
    for (var row = 0; row < gCurrentLevel.SIZE; row++) {
        for (var col = 0; col < gCurrentLevel.SIZE; col++) {
            var cell = gBoard[row][col]
            if (cell.isMine) {
                // Reveal the mine using the cell reference
                gBoard[row][col].isShown = true
                // Set the mine image in the cell
                // Assuming MINE_IMG is defined elsewhere
                var mineCell = document.querySelector(`.board tr:nth-child(${row + 1}) td:nth-child(${col + 1})`)
                mineCell.innerHTML = MINE_IMG
            }
        }
    }
}

function checkGameOver() {
    var game = gGame
    var cellsCount = gCurrentLevel.SIZE * gCurrentLevel.SIZE

    for (var row = 0; row < gCurrentLevel.SIZE; row++) {
        for (var col = 0; col < gCurrentLevel.SIZE; col++) {
            var cell = gBoard[row][col]

            if (cell.isMine && cell.isShown) {
                game.isOn = false
                alert('game over')
                console.log('Game over')
                return
            }
            // if (game.markedCount + game.shownCount === cellsCount) {
            if (game.shownCount === (cellsCount - gCurrentLevel.MINES) && gLevel.MINES === game.markedCount) {
                game.isOn = false
                console.log('You won!')
                console.log('You won!', cellsCount, game.shownCount, gCurrentLevel.MINES, game.markedCount)
            }
        }
    }
}
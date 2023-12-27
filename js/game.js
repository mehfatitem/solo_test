class GameBoard {

    constructor(indexRowColumn) {
        this.scoreCalculator = new ScoreCalculator(indexRowColumn);
        this.indexRowColumn = indexRowColumn;
        this.lowerLimit = (indexRowColumn + 1) / 4;
        this.upperLimit = (indexRowColumn + 1) / 2;
        this.middleLimit = (indexRowColumn - 1) / 2;
        this.clickCount = 0;
        this.initialize();
    }

    initialize() {
        this.createGameBoard();
        this.setupClickHandlers();
    }

    createGameBoard() {
        let htmlContent = "<table id='solo-test-game-board' border='1' align='center'>";
        for (let i = 0; i < this.indexRowColumn; i++) {
            htmlContent += `<tr id='${i}-row'>`;
            for (let j = 0; j < this.indexRowColumn; j++) {
                let tmp = '';
                let bgcolor = '';

                if (
                    (i >= this.lowerLimit && i <= this.upperLimit && j >= this.lowerLimit && j <= this.upperLimit) ||
                    (i >= this.lowerLimit && i <= this.upperLimit) ||
                    (j >= this.lowerLimit && j <= this.upperLimit)
                ) {
                    tmp = (i === this.middleLimit && j === this.middleLimit) ? "<img src='img/empty2.png'>" : "<img src='img/pawn.png'>";
                    bgcolor = "#52C5CA";
                } else {
                    bgcolor = "#01ACAD";
                }
                htmlContent += `<td bgcolor='${bgcolor}' id='${i}-${j}-area'>${tmp}</td>`;
            }
            htmlContent += "</tr>";
        }
        htmlContent += "</table>";
        $("#solo-test-content").html(htmlContent);
    }

    setupClickHandlers() {
        const moveSound = new Audio("media/click_sound.mp3");
        $(document).on('click', 'td', (event) => {
            const [i, j] = $(event.currentTarget).attr('id').split('-').map(Number);

            if (this.isValidClick(i, j)) {
                this.handleClick(i, j, moveSound);
            }
        });
    }

    isValidClick(i, j) {
        return (
            (i >= this.lowerLimit && i <= this.upperLimit && j >= this.lowerLimit && j <= this.upperLimit) ||
            (i >= this.lowerLimit && i <= this.upperLimit) ||
            (j >= this.lowerLimit && j <= this.upperLimit)
        );
    }

    isMovesLeft() {
        for (let i = 0; i < this.indexRowColumn; i++) {
            for (let j = 0; j < this.indexRowColumn; j++) {
                if ($(`#${i}-${j}-area img`).attr('src') === 'img/pawn.png') {
                    // Check if a valid move is available for the pawn at position (i, j)
                    if (
                        (j < this.indexRowColumn - 2 && $(`#${i}-${j + 1}-area img`).attr('src') === 'img/pawn.png' &&
                            $(`#${i}-${j + 2}-area img`).attr('src') === 'img/empty2.png') || // Right movement
                        (j >= 2 && $(`#${i}-${j - 1}-area img`).attr('src') === 'img/pawn.png' &&
                            $(`#${i}-${j - 2}-area img`).attr('src') === 'img/empty2.png') || // Left movement
                        (i < this.indexRowColumn - 2 && $(`#${i + 1}-${j}-area img`).attr('src') === 'img/pawn.png' &&
                            $(`#${i + 2}-${j}-area img`).attr('src') === 'img/empty2.png') || // Downward movement
                        (i >= 2 && $(`#${i - 1}-${j}-area img`).attr('src') === 'img/pawn.png' &&
                            $(`#${i - 2}-${j}-area img`).attr('src') === 'img/empty2.png') // Upward movement
                    ) {
                        return true; // Valid move available
                    }
                }
            }
        }
        return false; // No valid moves left
    }

    handleClick(row, column, moveSound) {
        const idName = `${row}-${column}-area`;
        const idNameArray = idName.split('-');
        const clickCount = this.clickCount;

        const isEvenClick = clickCount % 2 === 0;
        const isFirstClick = isEvenClick && this.handleFirstClick(idNameArray);
        const isSecondClick = !isEvenClick && this.handleSecondClick(idNameArray, moveSound);

        if (isFirstClick || isSecondClick) {
            this.clickCount++;
        }
    }

    handleFirstClick(idNameArray) {
        const row = parseInt(idNameArray[0]);
        const column = parseInt(idNameArray[1]);

        localStorage.setItem('row1', row);
        localStorage.setItem('column1', column);

        return true;
    }

    handleSecondClick(idNameArray, moveSound) {
        const row2 = parseInt(idNameArray[0]);
        const column2 = parseInt(idNameArray[1]);

        const row1 = parseInt(localStorage.getItem('row1'));
        const column1 = parseInt(localStorage.getItem('column1'));

        let nextRow = (row1 + row2) / 2;
        let nextColumn = (column1 + column2) / 2;

        const [distX, distY] = this.calculateDistance(row1, column1, row2, column2);
        const targetIsEmpty = $(`#${row2}-${column2}-area img`).attr('src') === 'img/pawn.png' ? false : true;
        const targetNext = $(`#${nextRow}-${nextColumn}-area img`).attr('src') === 'img/pawn.png' ? true : false;

        if ((distX === 0 && distY === 2 || distX === 2 && distY === 0) && targetIsEmpty && targetNext) {
            this.makeMove(row1, column1, row2, column2, moveSound);
        } else {
            this.showErrorMessage();
        }

        localStorage.clear();

        if (!this.isMovesLeft()) {
            this.handleGameEnd();
            return false;
        }

        return true;
    }

    calculateDistance(row1, column1, row2, column2) {
        const distX = Math.abs(row1 - row2);
        const distY = Math.abs(column1 - column2);
        return [distX, distY];
    }

    makeMove(row1, column1, row2, column2, moveSound) {
        if (row1 === row2) {
            const tmpY = (column1 + column2) / 2;
            $(`#${row1}-${column1}-area img, #${row1}-${tmpY}-area img`).attr('src', 'img/empty2.png');
        } else {
            const tmpX = (row1 + row2) / 2;
            $(`#${row1}-${column1}-area img, #${tmpX}-${column1}-area img`).attr('src', 'img/empty2.png');
        }

        $(`#${row2}-${column2}-area img`).attr('src', 'img/pawn.png');
        $("#game-step-content").append(`You moved [${row1}, ${column1}] to [${row2}, ${column2}]<br>`);
        moveSound.play();
    }

    showErrorMessage() {
        Swal.fire('Uyarı!', 'Hatalı Hamle!', 'error');
    }

    handleGameEnd() {
        $("#calculateSoloTestButton").css("display", "inline");
        const pawnCount = this.scoreCalculator.calculateRemainingPawnCount();
        const pointArray = this.scoreCalculator.calculateSoloTest(pawnCount);

        Swal.fire(`<b>${pointArray[0]}</b> - ${pointArray[1]} puan`, 'Oyun Bitti.', 'info');
    }
}

class ScoreCalculator {
    constructor(indexRowColumn) {
        this.indexRowColumn = indexRowColumn;
    }

    calculateRemainingPawnCount() {
        let pawnCount = 0;
        for (let i = 0; i < this.indexRowColumn; i++) {
            for (let j = 0; j < this.indexRowColumn; j++) {
                if ($(`#${i}-${j}-area img`).attr('src') === 'img/pawn.png') {
                    pawnCount++;
                }
            }
        }
        return pawnCount;
    }

    calculateSoloTest(pawnCount) {
        return this.calculateScoreFromRemainingPawns(pawnCount);
    }

    calculateScoreFromRemainingPawns(pawnCount) {
        if (pawnCount === 1) return ['Bilgin', '200'];
        if (pawnCount === 2) return ['Zeki', '175'];
        if (pawnCount === 3) return ['Kurnaz', '150'];
        if (pawnCount === 4) return ['Başarılı', '125'];
        if (pawnCount === 5) return ['Normal', '100'];
        if (pawnCount === 6) return ['Tecrübesiz', '75'];
        if (pawnCount === 7) return ['Aptal', '50'];
        if (pawnCount === 8) return ['Gerizekalı', '25'];
        if (pawnCount >= 9) return ['Beyinsiz', '0'];
    }
}

$(document).ready(function() {
    const gameBoard = new GameBoard(7);
    $("#calculateSoloTestButton").click(function() {
        gameBoard.handleGameEnd();
    });

    $("#restartGame").click(function() {
        window.location.reload();
    });
});

var computer = false;
var firstMove = true;
var lines = "123 456 789 147 258 369 159 357".split(' ');
var forks = "79513 13579 39517 17539 24137 26319 68937 48719 48526 24568 26548 48524 37124 19326 37968 19748 38215 18235 94635 34695 27859 29835 61457 67541".split(' ');
var computerTempFork = 0;
var playerTempFork = 0;
var forkCount = 0;

var getText = function (id) {
    return document.getElementById(id).innerHTML;
};
var setText = function (id, text) {
    document.getElementById(id).innerHTML = text;
};

var player1 = prompt("What's player 1's name?", "X");
var player2 = prompt("What's player 2's name?", "O");
var playerNames = function () {
    if (!player1) {
        player1 = "X";
    }
    if (!player2) {
        player2 = "O";
    }
    setText('turn', player1);
    setText('player1', player1);
    setText('player2', player2);
};

playerNames();

window.computerOn = function () {
    computer = true;
    setText('player1', "The computer");
    setText('player2', "You");
    setText('tense', " have");
    setText('X', 0);
    setText('O', 0);
    document.getElementById("turnlabel").style.display = "none";
    document.getElementById("alone").style.display = "none";
    document.getElementById("together").style.display = "inline";
    restart();
};
window.computerOff = function () {
    computer = false;
    playerNames();
    setText('tense', " has");
    setText('X', 0);
    setText('O', 0);
    document.getElementById("turnlabel").style.display = "inline";
    document.getElementById("alone").style.display = "inline";
    document.getElementById("together").style.display = "none";
    restart();
};
window.restart = function () {
    for (i = 1; i < 10; i++) {
        setText(i, "");
    }
    firstMove = true;
};
window.move = function (n) {
    var player = getText('turn');
    var turn = "X";
    if ((player === player2) || (computer)) {
        turn = "O";
    }
    if (spaceAvailable(n)) {
        if (computer) {
            setText(n, "O");
        } else {
            if (turn === "X") {
                setText(n, "X");
            } else {
                setText(n, "O");
            }
        }
        if (!(winningMove(turn) || draw())) {
            if (computer) {
                computerMove();
            }
        }
        if (!computer) {
            if (player === player1) {
                setText("turn", player2);
            } else {
                setText("turn", player1);
            }
        }
    }
};

var checkCombos = function (array, func, p) {
    for (var i in array) {
        var check = func(p, array[i]);
        if (check) {
            return (check);
        }
    }
    return false;
};
var computerMove = function () {
    var c = "X";
    var p = "O";
    turn = c;
    computerTempFork = 0;
    playerTempFork = 0;
    forkCount = 0;
    computerWin = checkCombos(lines, two, c);
    playerBlock = checkCombos(lines, two, p);
    computerFork = checkCombos(forks, fork, c);
    playerFork = checkCombos(forks, fork, p);

    console.log("fork count is ", forkCount);
    //Option 1: The player just made the first move
    if (firstMove) {
        //If player made their first move in the center, computer moves in the corner
        if (getText(5) === p) {
            setText(1, c);
        }
        //Otherwise, computer moves in the center
        else {
            setText(5, c);
        }
        firstMove = false;
    }
    //Option 2: Computer has two in a row and wins
    else if (computerWin) {
        console.log("2");
        setText(computerWin, c);
        alert("You lost :(");
        var total = Number(getText(c));
        total += 1;
        setText(c, total);
        restart();
    }
    //Option 3: Opponent has two in a row, computer blocks
    else if (playerBlock) {
        console.log("3");
        setText(playerBlock, c);
    }
    //Option 4: Computer makes a fork
    else if (computerTempFork !== 0) {
        console.log("4");
        setText(computerTempFork, c);

    }
    //Option 5: Computer blocks a fork if there is only one player fork possible
    else if (forkCount === 1) {
        console.log("5");
        setText(playerTempFork, c);

    }
    //Option 6: Computer makes two in a row if player has two or more possible forks
    else if (forkCount > 1) {
        var goal = checkCombos(lines, possibleTwo, c);
        console.log("goal = ", goal);
        setText(goal, c);
    }
    //Option 7: Computer makes any move
    else {
        console.log("6");
        var square = randomMove();
        setText(square, c);
    }
    draw();
    turn = p;
};
var randomMove = function () {
    var squareID = Math.floor((Math.random() * 9) + 1);
    if (spaceAvailable(squareID)) {
        return squareID;
    } else {
        return randomMove();
    }
};
var possibleTwo = function (p, squares) {
    var first = squares[0];
    var middle = squares[1];
    var last = squares[2];
    console.log("first = ", getText(first), ", middle = ", getText(middle), ", last = ", getText(last));
    //Case 1: first square is the computer, return last to make computer line less obvious to silly players
    if (getText(first) === "X") {
        return last;
    }
    //Case 2: middle square or last square is the computer, return first
    if ((getText(middle) === "X") | (getText(last) === "X")) {
        return first;
    }
};
var two = function (p, squares) {
    var first = squares[0];
    var middle = squares[1];
    var last = squares[2];
    //If all three are full, can't block
    if ((getText(first) && getText(middle) && getText(last)) !== "") {
        return false;
    }
    //Case 1: first and middle square match, should use last
    if ((getText(first) === p) && (getText(middle) === p)) {
        return last;
    }
    //Case 2: middle and last square match, should use first
    else if ((getText(middle) === p) && (getText(last) === p)) {
        return first;
    }
    //Case 3: first and last square match, should use middle
    else if ((getText(first) === p) && (getText(last) === p)) {
        return middle;
    }
    return false;
};
var fork = function (p, squares) {
    var goal1 = getText(squares[0]);
    var goal2 = getText(squares[1]);
    var fork = squares[2];
    var a = getText(squares[3]);
    var b = getText(squares[4]);
    //If goal wins or fork are empty, and a and b are right, a fork
    if ((goal1 === "") && (goal2 === "") && (getText(fork) === "") && (a === p) && (b === p)) {
        console.log("goal 1 = ", squares[0], " goal 2 = ", squares[1], "fork = ", fork, "a = ", a, " b = ", b);
        console.log("fork text = ", getText(fork));
        if (p === "O") {
            forkCount += 1;
        }
        if (p === "X") {
            computerTempFork = fork;
        } else {
            playerTempFork = fork;
        }
    }
};
var spaceAvailable = function (n) {
    if (getText(n) !== "") {
        if (((computer) && (turn !== "X")) || !computer) {
            alert("Oops! That space is occupied");
        }
        return false;
    }
    return true;
};
var winningMove = function (p) {
    return checkCombos(lines, win, p);
};
var win = function (p, squares) {
    for (i = 0; i < 3; i++) {
        if (getText(squares[i]) !== p) {
            return false;
        }
    }
    if (!computer) {
        var total = Number(getText(p));
        total += 1;
        setText(p, total);
        if (p === "X") {
            p = player1;
        } else {
            p = player2;
        }
    } else {
        p = "You";
    }
    alert(p + " won!");
    restart();
    return true;
};
var draw = function () {
    for (i = 1; i < 10; i++) {
        if (getText(i) === '') {
            return;
        }
    }
    alert("Cat's game!");
    restart();
    return true;
};
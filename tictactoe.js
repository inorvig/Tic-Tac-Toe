;(function() {
    var computer = false;
    var firstMove = true;
    var lines = "123 456 789 147 258 369 159 357".split(' ');
    var forks = "79513 13579 39517 17539 24137 26319 68937 48719 48526 24568 26548 48524 37124 19326 37968 19748 38215 18235 94635 34695 27859 29835 61457 67541".split(' ');
    var computerTempFork = 0;
    var playerTempFork = 0;
    var forkCount = 0;
    var player1 = prompt("What's player 1's name?", "X");
    var player2 = prompt("What's player 2's name?", "O");

    //Returns the text of the element at the given html id
    var getText = function (id) {
        return document.getElementById(id).innerHTML;
    };
    //Sets the text of the element at the given html id
    var setText = function (id, text) {
        document.getElementById(id).innerHTML = text;
    };

    //Sets players to X and O if names are not provided, and otherwise sets player names
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

    //Turns on the AI, sets the text of the labels relating to turn and player names, and resets the game
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

    //Turns off the AI, sets the text of the labels relating to turn and player names, and resets the game
    window.computerOff = function () {
        computer = false;
        playerNames();
        setText('tense', " has");
        setText('X', 0);
        setText('O', 0);
        document.getElementById("turnlabel").style.display = "inline";
        document.getElementById("alone").style.display = "inline";
        document.getElementById("together").style.display = "none";
        reset();
    };

    //Clears the board and sets the first move to be true
    window.reset = function () {
        for (i = 1; i < 10; i++) {
            setText(i, "");
        }
        firstMove = true;
    };
    //Called when a player makes a move. Determines who the current player is, sets the text of the square they clicked, checks for a win or a draw, and changes the turn label
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

    //Used to check for two in a row and forks. Takes in an array, a function, and a player, calls the function on each element in the array with the player as a parameter, and returns the result of the function if a square is found, or returns false.
    var checkCombos = function (array, func, p) {
        for (var i in array) {
            var check = func(p, array[i]);
            if (check) {
                return (check);
            }
        }
        return false;
    };
    //Returns the square that completes a winning line
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
    //Finds possible forks, adds to the count of total forks found, and sets the computerTempFork or playerTempFork depending on who the current player is
    var fork = function (p, squares) {
        var goal1 = getText(squares[0]);
        var goal2 = getText(squares[1]);
        var fork = squares[2];
        var a = getText(squares[3]);
        var b = getText(squares[4]);
        //If goal wins or fork are empty, and a and b are right, a fork
        if ((goal1 === "") && (goal2 === "") && (getText(fork) === "") && (a === p) && (b === p)) {
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
    //Returns a square that would make two in a row for the computer
    var possibleTwo = function (p, squares) {
        var first = squares[0];
        var middle = squares[1];
        var last = squares[2];
        //Case 1: first square is the computer, return last to make computer line less obvious to silly players
        if (getText(first) === "X") {
            return last;
        }
        //Case 2: middle square or last square is the computer, return first
        if ((getText(middle) === "X") | (getText(last) === "X")) {
            return first;
        }
    };
    //Returns a random empty square
    var randomMove = function () {
        var squareID = Math.floor((Math.random() * 9) + 1);
        if (spaceAvailable(squareID)) {
            return squareID;
        } else {
            return randomMove();
        }
    };
    //Called after each player move when the AI is on. Checks for possible wins or forks, and moves accordingly.
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
            setText(computerWin, c);
            alert("You lost :(");
            var total = Number(getText(c));
            total += 1;
            setText(c, total);
            reset();
        }
        //Option 3: Opponent has two in a row, computer blocks
        else if (playerBlock) {
            setText(playerBlock, c);
        }
        //Option 4: Computer makes a fork
        else if (computerTempFork !== 0) {
            setText(computerTempFork, c);

        }
        //Option 5: Computer blocks a fork if there is only one player fork possible
        else if (forkCount === 1) {
            setText(playerTempFork, c);

        }
        //Option 6: Computer makes two in a row if player has two or more possible forks
        else if (forkCount > 1) {
            var goal = checkCombos(lines, possibleTwo, c);
            setText(goal, c);
        }
        //Option 7: Computer makes any move (pretty sure this will never be reached)
        else {
            var square = randomMove();
            setText(square, c);
        }
        draw();
        turn = p;
    };


    //Checks if a square is empty
    var spaceAvailable = function (n) {
        if (getText(n) !== "") {
            if (((computer) && (turn !== "X")) || !computer) {
                alert("Oops! That space is occupied");
            }
            return false;
        }
        return true;
    };
    //Checks the whole board for a win
    var winningMove = function (p) {
        return checkCombos(lines, win, p);
    };
    //Checks a line for a win
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
        reset();
        return true;
    };
    //Checks for a draw
    var draw = function () {
        for (i = 1; i < 10; i++) {
            if (getText(i) === '') {
                return;
            }
        }
        alert("Cat's game!");
        reset();
        return true;
    };
})();

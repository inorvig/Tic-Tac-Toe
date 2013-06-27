;(function(exports) {
    var computer = false;
    var lines = "012 345 678 036 147 258 048 246".split(' ');
    var forks = "68402 02468 28406 06428 13026 15208 57826 37608 37415 13457 15437 37413 26013 08215 26857 08637 27104 07124 83524 23584 16748 18724 50346 56430".split(' ');

    var computerTempFork = 0;
    var playerTempFork = 0;
    var forkCount = 0;
    var player1 = prompt("What's player 1's name?", "X");
    var player2 = prompt("What's player 2's name?", "O");

    var dom = {
        //Returns the text of the element at the given html id
        getText: function (id) {
            return document.getElementById(id).innerHTML;
        },

        //Sets the text of the element at the given html id
        setText: function (id, text) {
            document.getElementById(id).innerHTML = text;
        },

        hide: function(id) {
            document.getElementById(id).style.display = "none";
        },

        inline: function(id) {
            document.getElementById(id).style.display = "inline";
        }
    };

    var board = {
        squares: function() {
            var squares = [];
            for (i = 0; i < 9; i++) {
                var square = dom.getText(i);
                squares.push(square === "" ? undefined : square);
            }
            return squares;
        },

        moveCount: function() {
            return this.squares().filter(function(x) {
                return x !== undefined;
            }).length;
        },

        //Clears the board and sets the first move to be true
        reset: function () {
            this.squares().forEach(function(_, i) {
                dom.setText(i, "");
            });
        },

        //Checks if a square is empty
        isSpaceAvailable: function (n) {
            return this.squares()[n] === undefined;
        },

        //Checks for a draw
        draw: function () {
            var isADraw = board.moveCount() === 9;
            if (isADraw) {
                alert("Cat's game!");
                board.reset();
            }
            return isADraw;
        }
    };

    var Scores = function() {
        var scores = {};

        var display = function() {
            for (var i in scores) {
                dom.setText(i, scores[i]);
            }
        };

        this.reset = function() {
            scores["X"] = 0;
            scores["O"] = 0;
            display();
        };

        this.increment = function(playerSymbol) {
            scores[playerSymbol]++;
            display();
        };

        this.reset();
    };

    var scores = new Scores();

    //Sets players to X and O if names are not provided, and otherwise sets player names
    var playerNames = function () {
        if (!player1) {
            player1 = "X";
        }
        if (!player2) {
            player2 = "O";
        }
        dom.setText('turn', player1);
        dom.setText('player1', player1);
        dom.setText('player2', player2);
    };

    playerNames();

    //Turns on the AI, sets the text of the labels relating to turn and player names, and resets the game
    var computerOn = function () {
        computer = true;
        dom.setText('player1', "The computer");
        dom.setText('player2', "You");
        dom.setText('tense', " have");
        scores.reset();
        dom.hide("turnlabel");
        dom.hide("alone");
        dom.inline("together");
        board.reset();
    };

    //Turns off the AI, sets the text of the labels relating to turn and player names, and resets the game
    var computerOff = function () {
        computer = false;
        playerNames();
        dom.setText('tense', " has");
        scores.reset();
        dom.inline("turnlabel");
        dom.inline("alone");
        dom.hide("together");
        board.reset();
    };

    //Called when a player makes a move. Determines who the current player is, sets the text of the square they clicked, checks for a win or a draw, and changes the turn label
    var move = function (n) {
        var player = dom.getText('turn');
        var turn = "X";
        if ((player === player2) || (computer)) {
            turn = "O";
        }
        if (board.spaceAvailable(n)) {
            if (computer) {
                dom.setText(n, "O");
            } else {
                if (turn === "X") {
                    dom.setText(n, "X");
                } else {
                    dom.setText(n, "O");
                }
            }
            if (!(winningMove(turn) || board.draw())) {
                if (computer) {
                    computerMove();
                }
            }
            if (!computer) {
                if (player === player1) {
                    dom.setText("turn", player2);
                } else {
                    dom.setText("turn", player1);
                }
            }
        } else { // space not available
            alert("Oops! That space is occupied");
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
        if ((dom.getText(first) && dom.getText(middle) && dom.getText(last)) !== "") {
            return false;
        }
        //Case 1: first and middle square match, should use last
        if ((dom.getText(first) === p) && (dom.getText(middle) === p)) {
            return last;
        }
        //Case 2: middle and last square match, should use first
        else if ((dom.getText(middle) === p) && (dom.getText(last) === p)) {
            return first;
        }
        //Case 3: first and last square match, should use middle
        else if ((dom.getText(first) === p) && (dom.getText(last) === p)) {
            return middle;
        }
        return false;
    };
    //Finds possible forks, adds to the count of total forks found, and sets the computerTempFork or playerTempFork depending on who the current player is
    var fork = function (p, squares) {
        var goal1 = dom.getText(squares[0]);
        var goal2 = dom.getText(squares[1]);
        var fork = squares[2];
        var a = dom.getText(squares[3]);
        var b = dom.getText(squares[4]);
        //If goal wins or fork are empty, and a and b are right, a fork
        if ((goal1 === "") && (goal2 === "") && (dom.getText(fork) === "") && (a === p) && (b === p)) {
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
        if (dom.getText(first) === "X") {
            return last;
        }
        //Case 2: middle square or last square is the computer, return first
        if ((dom.getText(middle) === "X") | (dom.getText(last) === "X")) {
            return first;
        }
    };
    //Returns a random empty square
    var randomMove = function () {
        var squareID = Math.floor(Math.random() * 9);
        if (board.spaceAvailable(squareID)) {
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
        if (board.moveCount() === 1) {
            //If player made their first move in the center, computer moves in the corner
            if (dom.getText(4) === p) {
                dom.setText(0, c);
            }
            //Otherwise, computer moves in the center
            else {
                dom.setText(4, c);
            }
        }
        //Option 2: Computer has two in a row and wins
        else if (computerWin) {
            dom.setText(computerWin, c);
            alert("You lost :(");
            scores.increment(c);
            board.reset();
        }
        //Option 3: Opponent has two in a row, computer blocks
        else if (playerBlock) {
            dom.setText(playerBlock, c);
        }
        //Option 4: Computer makes a fork
        else if (computerTempFork !== 0) {
            dom.setText(computerTempFork, c);

        }
        //Option 5: Computer blocks a fork if there is only one player fork possible
        else if (forkCount === 1) {
            dom.setText(playerTempFork, c);

        }
        //Option 6: Computer makes two in a row if player has two or more possible forks
        else if (forkCount > 1) {
            var goal = checkCombos(lines, possibleTwo, c);
            dom.setText(goal, c);
        }
        //Option 7: Computer makes any move (pretty sure this will never be reached)
        else {
            var square = randomMove();
            dom.setText(square, c);
        }
        board.draw();
        turn = p;
    };

    //Checks the whole board for a win
    var winningMove = function (p) {
        return checkCombos(lines, win, p);
    };
    //Checks a line for a win
    var win = function (p, squares) {
        for (i = 0; i < 3; i++) {
            if (dom.getText(squares[i]) !== p) {
                return false;
            }
        }
        if (!computer) {
            scores.increment(p);
            if (p === "X") {
                p = player1;
            } else {
                p = player2;
            }
        } else {
            p = "You";
        }
        alert(p + " won!");
        board.reset();
        return true;
    };

    exports.move = move;
    exports.computerOn = computerOn;
    exports.computerOff = computerOff;
    exports.board = board;
})(this);

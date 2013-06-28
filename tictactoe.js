;(function(exports) {
    var match;
    var lines = "012 345 678 036 147 258 048 246".split(' ');
    var forks = "68402 02468 28406 06428 13026 15208 57826 37608 37415 13457 15437 37413 26013 08215 26857 08637 27104 07124 83524 23584 16748 18724 50346 56430".split(' ');

    var computerTempFork = 0;
    var playerTempFork = 0;
    var forkCount = 0;

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

    var ai = {
        getMove: function(computerPlayer, otherPlayer) {
            computerTempFork = 0;
            playerTempFork = 0;
            forkCount = 0;
            computerWin = ai.checkCombos(lines, this.two, computerPlayer);
            playerBlock = ai.checkCombos(lines, this.two, otherPlayer);
            computerFork = ai.checkCombos(forks, this.fork, computerPlayer);
            playerFork = ai.checkCombos(forks, this.fork, otherPlayer);
            //Option 1: The player just made the first move
            if (match.board.moveCount() === 1) {
                //If player made their first move in the center, computer moves in the corner
                if (dom.getText(4) === otherPlayer.id) {
                    return 0;
                }
                //Otherwise, computer moves in the center
                else {
                    return 4;
                }
            }
            //Option 2: Computer has two in a row and wins
            else if (computerWin) {
                return computerWin;
            }
            //Option 3: Opponent has two in a row, computer blocks
            else if (playerBlock) {
                return playerBlock;
            }
            //Option 4: Computer makes a fork
            else if (computerTempFork !== 0) {
                return computerTempFork;
            }
            //Option 5: Computer blocks a fork if there is only one player fork possible
            else if (forkCount === 1) {
                return playerTempFork;
            }
            //Option 6: Computer makes two in a row if player has two or more possible forks
            else if (forkCount > 1) {
                return this.checkCombos(lines, this.possibleTwo, computerPlayer)
            }
            //Option 7: Computer makes any move
            else {
                return this.randomMove();
            }
        },

        //Used to check for two in a row and forks. Takes in an array,
        //a function, and a player, calls the function on each element
        //in the array with the player as a parameter, and returns the
        // result of the function if a square is found, or returns false.
        checkCombos: function (array, func, player) {
            for (var i in array) {
                var check = func(player, array[i]);
                if (check) {
                    return (check);
                }
            }
            return false;
        },

        //Returns the square that completes a winning line
        two: function (player, squares) {
            var first = squares[0];
            var middle = squares[1];
            var last = squares[2];
            //If all three are full, can't block
            if ((dom.getText(first) && dom.getText(middle) && dom.getText(last)) !== "") {
                return false;
            }
            //Case 1: first and middle square match, should use last
            if ((dom.getText(first) === player.id) && (dom.getText(middle) === player.id)) {
                return last;
            }
            //Case 2: middle and last square match, should use first
            else if ((dom.getText(middle) === player.id) &&
                     (dom.getText(last) === player.id)) {
                return first;
            }
            //Case 3: first and last square match, should use middle
            else if ((dom.getText(first) === player.id) && (dom.getText(last) === player.id)) {
                return middle;
            }
            return false;
        },

        //Finds possible forks, adds to the count of total forks found, and sets
        //the computerTempFork or playerTempFork depending on who the current player is
        fork: function (player, squares) {
            var goal1 = dom.getText(squares[0]);
            var goal2 = dom.getText(squares[1]);
            var fork = squares[2];
            var a = dom.getText(squares[3]);
            var b = dom.getText(squares[4]);

            //If goal wins or fork are empty, and a and b are right, a fork
            if ((goal1 === "") && (goal2 === "") && (dom.getText(fork) === "") &&
                (a === player.id) && (b === player.id)) {
                if (player.id === "O") {
                    forkCount += 1;
                }
                if (player.id === "X") {
                    computerTempFork = fork;
                } else {
                    playerTempFork = fork;
                }
            }
        },

        //Returns a square that would make two in a row for the computer
        possibleTwo: function (_, squares) {
            var first = squares[0];
            var middle = squares[1];
            var last = squares[2];
            //Case 1: first square is the computer, return last to make computer
            //line less obvious to silly players
            if (dom.getText(first) === "X") {
                return last;
            }

            //Case 2: middle square or last square is the computer, return first
            if ((dom.getText(middle) === "X") | (dom.getText(last) === "X")) {
                return first;
            }
        },

        //Returns a random empty square
        randomMove: function () {
            var squareID = Math.floor(Math.random() * 9);
            if (match.board.isSpaceAvailable(squareID)) {
                return squareID;
            } else {
                return this.randomMove();
            }
        }
    };

    var Player = function(id, brain) {
        this.id = id;
        this.brain = brain;
    };

    Player.HUMAN = 0;
    Player.COMPUTER = 1;

    Player.prototype = {
        setName: function(name) {
            this.name = name;
            dom.setText('player' + this.id, this.salutation());
        },

        setNameFromPrompt: function() {
            this.setName(prompt("What's " + this.id + "'s name?",
                                this.id));
        },

        salutation: function() {
            return this.name !== undefined ? this.name : this.id;
        }
    };

    var Board = function(match, firstPlayer) {
        this.match = match;
        this.reset();
    };

    Board.prototype = {
        isGameOver: function() {
            return this.isDrawn() || this.isWon();
        },

        gameOver: function() {
            if (match.board.isDrawn()) {
                alert("Cat's game!");
            } else if (match.board.isWon()) {
                var winner = this.isWinner(this.match.player1) ?
                    this.match.player1 :
                    this.match.player2;
                this.match.scores.increment(winner);
                alert(winner.salutation() + " won!");
            }
            this.reset();
        },

        playMove: function(square) {
            var mover = match.board.currentPlayer;
            var nextMover = match.otherPlayer(match.board.currentPlayer);
            if (match.board.isSpaceAvailable(square)) {
                dom.setText(square, mover.id);
                match.board.setCurrentPlayer(nextMover);
                if (match.board.isGameOver()) {
                    match.board.gameOver();
                } else if (nextMover.brain === Player.COMPUTER) {
                    computerMove();
                }
            } else { // space not available
                alert("Oops! That space is occupied");
            }
        },

        setCurrentPlayer: function(player) {
            this.currentPlayer = player;
            dom.setText('turn', player.salutation());
        },

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

        //Clears the board and sets the currentPlayer to player1
        reset: function () {
            this.setCurrentPlayer(this.match.player1);
            this.squares().forEach(function(_, i) {
                dom.setText(i, "");
            });
        },

        //Checks if a square is empty
        isSpaceAvailable: function (n) {
            return this.squares()[n] === undefined;
        },

        isDrawn: function() {
            return this.moveCount() === 9;
        },

        isWon: function() {
            return this.isWinner(this.match.player1) || this.isWinner(this.match.player2);
        },

        isWinner: function(player) {
            return ai.checkCombos(lines, this.winWithRow, player);
        },

        //Checks a line for a win
        winWithRow: function (player, squares) {
            for (i = 0; i < 3; i++) {
                if (dom.getText(squares[i]) !== player.id) {
                    return false;
                }
            }
            return true;
        }
    };

    var Scores = function() {
        var scores = { "X": 0, "O": 0 };

        var display = function() {
            for (var i in scores) {
                dom.setText(i, scores[i]);
            }
        };

        this.increment = function(player) {
            scores[player.id]++;
            display();
        };

        display();
    };

    function Match(player1Brain, player2Brain) {
        this.player1 = new Player("X", player1Brain);
        this.player2 = new Player("O", player2Brain);

        if (player1Brain === Player.HUMAN && player2Brain === Player.HUMAN) {
            this.player1.setNameFromPrompt();
            this.player2.setNameFromPrompt();
        } else if (player1Brain === Player.HUMAN && player2Brain === Player.COMPUTER) {
            this.player1.setName("You");
            this.player2.setName("Computer");
        }

        this.board = new Board(this, this.player1);
        this.scores = new Scores();
    };

    Match.prototype = {
        otherPlayer: function(player) {
            return player === this.player1 ? this.player2 : this.player1;
        },
    };

    var match = new Match(Player.HUMAN, Player.HUMAN);

    // sets up a human vs player game
    var computerOn = function () {
        match = new Match(Player.HUMAN, Player.COMPUTER);
        dom.setText('tense', " have");
        dom.hide("turnlabel");
        dom.hide("alone");
        dom.inline("together");
    };

    // sets up a human vs human game
    var computerOff = function () {
        match = new Match(Player.HUMAN, Player.HUMAN);
        dom.setText('tense', " has");
        dom.inline("turnlabel");
        dom.inline("alone");
        dom.hide("together");
    };

    // called when a player makes a move
    var humanMove = function (n) {
        match.board.playMove(n);
    };

    //Called after each player move when the AI is on. Checks for possible wins or forks, and moves accordingly.
    var computerMove = function () {
        var computerPlayer = match.board.currentPlayer;
        var otherPlayer = match.otherPlayer(match.board.currentPlayer);
        match.board.playMove(computerPlayer, ai.getMove(computerPlayer, otherPlayer));
        if (match.board.isGameOver()) {
            match.board.gameOver();
        } else {
            match.board.setCurrentPlayer(match.otherPlayer(match.board.currentPlayer));
        }
    };

    exports.humanMove = humanMove;
    exports.match = match;
    exports.computerOn = computerOn;
    exports.computerOff = computerOff;
})(this);

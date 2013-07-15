;(function(exports) {
    var match;
    var LINES = "012 345 678 036 147 258 048 246".split(' ');
    var FORKS = "68402 02468 28406 06428 13026 15208 57826 37608 37415 13457 15437 37413 26013 08215 26857 08637 27104 07124 83524 23584 16748 18724 50346 56430".split(' ');

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
        getMove: function(board, computerPlayer, otherPlayer) {
            var computerWin = ai.firstCombo(board, LINES, this.two, computerPlayer);
            var playerBlock = ai.firstCombo(board, LINES, this.two, otherPlayer);
            var computerFork = ai.firstCombo(board, FORKS, this.fork, computerPlayer);
            var playerForks = ai.gatherCombos(board, FORKS, this.fork, otherPlayer);

            //Option 1: The player just made the first move
            if (board.moveCount() === 1) {
                //If player made their first move in the center, computer moves in the corner
                if (board.square(4) === otherPlayer.id) {
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
            else if (computerFork) {
                return computerFork;
            }
            //Option 5: Computer blocks a fork if there is only one player fork possible
            else if (playerForks.length === 1) {
                return playerForks[0];
            }
            else if (playerForks.length > 1) {
                return this.firstCombo(board, LINES, this.possibleTwo, computerPlayer);
            }
            //Option 7: Computer makes any move
            else {
                return this.randomMove(board);
            }
        },

        //Used to check for two in a row and forks. Takes in an array,
        //a function, and a player, calls the function on each element
        //in the array with the player as a parameter, and returns the
        // result of the function if a square is found, or returns false.
        firstCombo: function (board, array, func, player) {
            return this.gatherCombos(board, array, func, player)[0];
        },

        gatherCombos: function (board, array, func, player) {
            var combos = [];
            for (var i in array) {
                var check = func(board, player, array[i]);
                if (check !== false && check !== undefined) {
                    combos.push(check);
                }
            }
            return combos;
        },

        //Returns the square that completes a winning line
        two: function (board, player, squares) {
            var first = board.square(squares[0]);
            var middle = board.square(squares[1]);
            var last = board.square(squares[2]);
            //If all three are full, can't block
            if (first !== undefined && middle !== undefined && last !== undefined) {
                return false;
            }
            //Case 1: first and middle square match, should use last
            if (first === player.id && middle === player.id) {
                return squares[2];
            }
            //Case 2: middle and last square match, should use first
            else if (middle === player.id && last === player.id) {
                return squares[0];
            }
            //Case 3: first and last square match, should use middle
            else if (first === player.id && last === player.id) {
                return squares[1];
            }
            return false;
        },

        // finds possible forks
        fork: function (board, player, squares) {
            var goal1 = board.square(squares[0]);
            var goal2 = board.square(squares[1]);
            var fork = squares[2];
            var a = board.square(squares[3]);
            var b = board.square(squares[4]);

            //If goal wins or fork are empty, and a and b are right, a fork
            if (goal1 === undefined &&
                goal2 === undefined &&
                board.square(fork) === undefined &&
                a === player.id && b === player.id) {
                return fork;
            }
			return false;
        },

        //Returns a square that would make two in a row for the computer
        possibleTwo: function (board, player, squares) {
            var first = board.square(squares[0]);
            var middle = board.square(squares[1]);
            var last = board.square(squares[2]);
            //Case 1: first square is the computer, return last to make computer
            //line less obvious to silly players
            if (first === player.id) {
                return squares[2];
            }

            //Case 2: middle square or last square is the computer, return first
            if (middle === player.id | last === player.id) {
                return squares[0];
            }
        },

        //Returns a random empty square
        randomMove: function (board) {
            var squareID = Math.floor(Math.random() * 9);
            if (board.isSpaceAvailable(squareID)) {
                return squareID;
            } else {
                return this.randomMove(board);
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
            if (this.isDrawn()) {
                alert("Cat's game!");
            } else if (this.isWon()) {
                var winner = this.isWinner(this.match.player1) ?
                    this.match.player1 :
                    this.match.player2;
                this.match.scores.increment(winner);
                alert(winner.salutation() + " won!");
            }
            this.reset();
        },

        playMove: function(square) {
            var mover = this.currentPlayer;
            var nextMover = match.otherPlayer(this.currentPlayer);
            if (this.isSpaceAvailable(square)) {
                dom.setText(square, mover.id);
                this.setCurrentPlayer(nextMover);
                if (this.isGameOver()) {
                    this.gameOver();
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
            for (var i = 0; i < 9; i++) {
                var square = dom.getText(i);
                squares.push(square === "" ? undefined : square);
            }
            return squares;
        },

        square: function(i) {
            return this.squares()[i];
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
            return ai.firstCombo(this, LINES, this.isWinWithRow, player) !== undefined;
        },

        //Checks a line for a win
        isWinWithRow: function (board, player, squares) {
            for (var i = 0; i < 3; i++) {
                if (board.square(squares[i]) !== player.id) {
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
    exports.computerOn = function () {
        match = new Match(Player.HUMAN, Player.COMPUTER);
        dom.setText('tense', " have");
        dom.hide("turnlabel");
        dom.hide("alone");
        dom.inline("together");
    };

    // sets up a human vs human game
    exports.computerOff = function () {
        match = new Match(Player.HUMAN, Player.HUMAN);
        dom.setText('tense', " has");
        dom.inline("turnlabel");
        dom.inline("alone");
        dom.hide("together");
    };

    // called when a player makes a move
    exports.humanMove = function (n) {
        match.board.playMove(n);
    };

    // called to make the computer move
    exports.computerMove = function () {
        var computerPlayer = match.board.currentPlayer;
        var otherPlayer = match.otherPlayer(match.board.currentPlayer);
        match.board.playMove(ai.getMove(match.board, computerPlayer, otherPlayer));
    };

    exports.reset = function() {
        match.board.reset();
    }
})(this);

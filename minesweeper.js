/*
	The minesweeper class handles the minesweeper game as well as the minesweeper board array.
	The constructor for this class determines board size and sets class parameters.

	param1: {Element} BoardEL contains the representation of the board 
	param2: {Integer} Size can be 8, 16, 32 or 64 and determines size of board
*/
function Minesweeper(BoardEL, Size) {
	this.el = BoardEL;
	this.boardSize = Size;
	this.board = [];

	// Reset game.
	$(this.el).empty();

	// Center our board on the page by setting width.
	$(this.el).css("width", this.boardSize * (25));

	// Build the board.
	this.buildBoard();

	var that = this;
	// Bind cheat button.
	$("#cheat").click(function() {
		that.cheat();
	});

	// Bind validate button.
	$("#validate").click(function() {		
		that.validate();
	});
};

/*
	Builds the HTML for the minesweeper board as well as populates the board array with data.
*/
Minesweeper.prototype.buildBoard = function() {
	// Populate HTML and board array with tiles.
	var tileNumber = 0;
	for(var i = 0; i < this.boardSize; ++i) {

		// Create an HTML row that will contain rows of tiles.
		$(this.el).append("<div class='row' id='row" + i + "'></div>");

		var row = [];
		for(var j = 0; j < this.boardSize; ++j) {

			// Push a new tile into our row array.
			row.push({
				tileNumber: tileNumber,
				isHidden: true,
				isBomb: false,
				row: i,
				col: j,
				adjacentNumber: 0
			});

			// Insert HTML tile into the ith row and add tileNumber data.
			$('#row' + i).append("<div id='tile" + tileNumber + "' class='tile hidden'></div>");
			$('#tile' + tileNumber).data('tileNumber', tileNumber);

			// Bind click events to the tile.
			var that = this;
			$('#tile' + tileNumber).click(function() {
				that.revealTile(this);
			});

			// Increment the tile number once we are done inserting a tile
			tileNumber++;
		}
		// Add our row to our board array.
		this.board.push(row);
	}

	// Place bombs
	var bombCount;
	if(this.boardSize === 8) {
		bombCount = 10;
	}
	else {
		bombCount = Math.floor(this.boardSize * this.boardSize * .15);
	}
	while(bombCount != -1) {
		// Randomly generate number between 0 and boardSize to determine bomb placement.
		var handOfTheBombGods = Math.round(Math.random() * this.boardSize * this.boardSize + 1);

		// Find the victim.
		var tile = this.getTileByNumber(handOfTheBombGods);

		// Make sure we found a tile.
		if(!tile) {
			continue;
		}

		// If we don't have a bomb, set it as a bomb.
		if(!tile.isBomb) {
			// Set tile as a bomb.
			tile.isBomb = true;
			var row = tile.row;
			var col = tile.col;

			// Increment count of surrounding tiles.
			for (var k = row - 1; k <= row + 1; k++) {
				for (var l = col - 1; l <= col + 1; l++) {
					if(l != col || k != row) {
	    				this.incCount(k, l);
					}
				}
			}
			bombCount--;
		}
	}
};

/*
	Checks if the current placement of the bomb is valid.
*/
Minesweeper.prototype.validPlace = function(row, col) {
	if(row >= this.boardSize || col >= this.boardSize || col < 0 || row < 0) {
		return false;
	}
	return true;
};

/*
	Increments the adjacentNumber count of tiles next to bombs
*/
Minesweeper.prototype.incCount = function(row, col) {
	if(this.validPlace(row, col) && !this.board[row][col].isBomb) {
        this.board[row][col].adjacentNumber++;
    }
};

/*
	Returns reference to a a tile in the array given a specified tileNumber. If tile cannot be
	found, return false.
*/
Minesweeper.prototype.getTileByNumber = function(tileNumber) {
	for(var i = 0; i < this.boardSize; ++i) {
		for(var j = 0; j < this.boardSize; ++j) {
			if(this.board[i][j].tileNumber === tileNumber) {
				return this.board[i][j];
			}
		}
	}
	return false;
};

/*
	Reveal selected tile. If tile is a bomb, end the game. If not, start revealing every tile adjacent
	To a tile with a 0 adjacency value.
*/
Minesweeper.prototype.revealTile = function(tile) {
	// Find our tile.
	var currentTile = this.getTileByNumber($(tile).data('tileNumber'));
	
	// Check if tile was a bomb and end the game if so. Otherwise, start revealing tiles.
	if(currentTile.isBomb) {
		this.endGame("you hit a bomb! Try again!");
	}
	else {
		this.revealAdjacentTiles(currentTile.row, currentTile.col);
	}

	// Update board's HTML
	this.updateBoardState();
};

/*
	Helper function for revealTile()
*/
Minesweeper.prototype.revealAdjacentTiles = function(row, col) {
	// Base case checks are here to make sure we aren't revealing bombs or unnecessary tiles.
	if(!this.validPlace(row, col)) {
		return;
	}
	if(this.board[row][col].isBomb) {
		return;
	}
	if(!this.board[row][col].isHidden) {
		return;
	}

	// Passed base cases, reveal tile.
	this.board[row][col].isHidden = false;

	// Check if tile is adjacent to another tile with an adjacentNumber value of 0.
	if(this.board[row][col].adjacentNumber === 0) {
		for (var i = row - 1; i <= row + 1; ++i) {
            for (var j = col - 1; j <= col + 1; ++j) {
                if(j != col || i != row) {
                    this.revealAdjacentTiles(i, j);
                }
            }
        }
	}
	return;
};

/*
	Updates the board to the current state of the board array.
*/
Minesweeper.prototype.updateBoardState = function() {
	for(var i = 0; i < this.boardSize; ++i) {
		for(var j = 0; j < this.boardSize; ++j) {
			if(!this.board[i][j].isHidden) {

				// If we have a bomb, reveal it as so.
				if(this.board[i][j].isBomb) {
					$('#tile' + this.board[i][j].tileNumber).addClass("bomb");
				}
				else {
					$('#tile' + this.board[i][j].tileNumber).addClass("showing");

					// Add adjacency number.
					if(this.board[i][j].adjacentNumber != 0) {
						$('#tile' + this.board[i][j].tileNumber).html(this.board[i][j].adjacentNumber);
					}
				}
			}
		}
	}
};


/*
	Check to see if the player has won when they request validation.
*/
Minesweeper.prototype.validate = function() {
	for(var i = 0; i < this.boardSize; ++i) {
		for(var j = 0; j < this.boardSize; ++j) {
			if(!this.board[i][j].isBomb && this.board[i][j].isHidden) {
				this.endGame("you thought wrong! Try again!");
				return;
			}
		}
	}
	this.endGame("You won!");
};

/*
	Allows the current player to cheat by revealing a hidden tile.
*/
Minesweeper.prototype.cheat = function() {
	for(var i = 0; i < this.boardSize; ++i) {
		for(var j = 0; j < this.boardSize; ++j) {
			if(this.board[i][j].isHidden && !this.board[i][j].isBomb) {
				this.board[i][j].isHidden = false;
				this.updateBoardState();
				return;
			}
		}
	}
};

/*
	Reveal all tiles and end the game. Accepts a message to display regarding the loss.
*/
Minesweeper.prototype.endGame = function(message) {
	for(var i = 0; i < this.boardSize; ++i) {
		for(var j = 0; j < this.boardSize; ++j) {
			this.board[i][j].isHidden = false;
		}
	}
	this.updateBoardState();
	alert("Game Over -- " + message);

	// Game over, no more clicking for you!
	for(var i = 0; i < this.boardSize; ++i) {
		$("#row" + i).children().unbind();
	}
	$("#validate").unbind();
	$("#cheat").unbind();
};


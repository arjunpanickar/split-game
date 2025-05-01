// creates psuedo-namespace.
var GAME = {};


//###################
//#   ENTRY POINT   #
//###################
/**
 * Sets global variables, adds click listener to hands, and shows the game screen.
*/
$(document).ready(function() {

	"use strict";

	GAME.createGlobalVars();
	GAME.addBtnListeners();
	
	GAME.gameScreen.fadeOut(0, function() {
		GAME.startScreen.fadeIn();
	});

	
});


//########################
//#   createGlobalVars   #
//########################
/**
 * Creates variables in global namespace.
*/
GAME.createGlobalVars = function() {

	GAME.startScreen = $(".start-screen");
	GAME.startBotFirstBtn = $(".bot-first-btn");
	GAME.startPlayerFirstBtn = $(".player-first-btn");
	
	GAME.state = 0;
	GAME.backupPoints = [null, null];
	
	GAME.gameScreen = $(".game-screen");
	GAME.hands = $(".hand");

	GAME.botTurnIndicator = $(".turn-indicator.bot");
	GAME.botHandLeft = $(".bot.left");
	GAME.botHandRight = $(".bot.right");

	GAME.playerTurnIndicator = $(".turn-indicator.player");
	GAME.playerHandLeft = $(".player.left");
	GAME.playerHandRight = $(".player.right");

	GAME.splitBtns = $(".split-btn");
	GAME.applyBtn = $(".split-btn.apply");
	GAME.cancelBtn = $(".split-btn.cancel");

	GAME.restartBtn = $(".restart-btn");
	GAME.backBtn = $(".back-btn");

	GAME.gameOverScreen = $(".game-over-screen");
	GAME.gameOverMessage = $(".game-over-message")[0];
	GAME.playAgainButton = $(".play-again-btn");

	GAME.isBotPlaying = false;
}


//#######################
//#   addBtnListeners   #
//#######################
/**
 * Adds listener functions to all game buttons.
*/
GAME.addBtnListeners = function() {

	// start
	GAME.startBotFirstBtn.click(function() {
		GAME.start(false);
	});
	GAME.startPlayerFirstBtn.click(function() {
		GAME.start(true);
	});
	
	// hands
	GAME.hands.click(GAME.onHandClick);
	
	// cancel and apply split
	GAME.cancelBtn.click(function() { GAME.exitSplit(false) });
	GAME.applyBtn.click(function() { GAME.exitSplit(true); });
	
	// back
	GAME.backBtn.click(function() {
		if (GAME.state < 3) {
			return;
		}
		GAME.gameScreen.fadeOut(300, function() {
			GAME.startScreen.fadeIn();
		});
	});

	// play again
	GAME.playAgainButton.click(function() {
		GAME.gameOverScreen.fadeOut(300, function() {
			GAME.startScreen.fadeIn();
		});
	});
};


//###################
//#    startGame    #
//###################
/**
 * Starts the game according to the user's selection.
*/
GAME.start = function(isPlayerFirst) {

	if (isPlayerFirst) {
		GAME.restartBtn.off('click', GAME.restartBotFirst);
		GAME.restartBtn.off('click', GAME.restartPlayerFirst);
		GAME.restartBtn.click(GAME.restartPlayerFirst);
	} else {
		GAME.restartBtn.off('click', GAME.restartBotFirst);
		GAME.restartBtn.off('click', GAME.restartPlayerFirst);
		GAME.restartBtn.click(GAME.restartBotFirst);
	}
	GAME.restartBtn.click();

	GAME.startScreen.fadeOut(300, function() {
		GAME.gameScreen.fadeIn();
	});
};


//#######################
//#      doBotMove      #
//#######################
/**
 * Takes a string as bot move and show animation of the moves.
*/
GAME.doBotMove = function(move) {

	GAME.isBotPlaying = true;
	let animationDelay = 800;

	// if splitting is present in the move
	if (move[2] == 1) {
		let nonZeroHand = null;
		if (Number(move[0]) * 2 == GAME.botHandLeft.attr("points")) {
			nonZeroHand = GAME.botHandLeft;
		} else if (Number(move[0]) * 2 == GAME.botHandRight.attr("points")) {
			nonZeroHand = GAME.botHandRight;
		}
		// safety check
		if (nonZeroHand == null) {
			console.error("Invalid Move");
			return;
		}
		
		let zeroHand = null;
		if ("0" == GAME.botHandLeft.attr("points")) {
			zeroHand = GAME.botHandLeft;
		} else if ("0" == GAME.botHandRight.attr("points")) {
			zeroHand = GAME.botHandRight;
		}
		// safety check
		if (zeroHand == null) {
			console.error("Invalid Move");
			return;
		}

		// animation
		setTimeout(function() {
			GAME.selectHand(nonZeroHand);
			setTimeout(function() {
				GAME.selectHand(zeroHand);
				setTimeout(function() {
					GAME.updateHand(zeroHand, move[0], false);
					GAME.updateHand(nonZeroHand, move[0], false);
					setTimeout(function() {
						GAME.doBotMoveWithoutSplit(move, animationDelay);
					}, animationDelay);
				}, animationDelay);
			}, animationDelay);
		}, animationDelay);
	}
	
	// if splitting is not present in the move
	else if (move[2] == 0) {
		GAME.doBotMoveWithoutSplit(move, animationDelay);
	}

	// safety check
	else {
		console.error("Invalid Move");
		return;
	}
}


//#########################
//#  doBotMove w/o Split  #
//#########################
/**
 * Takes a string as bot move and show animation of the moves,
 * but igonres the split value (third digit).
*/
GAME.doBotMoveWithoutSplit = function(move, animationDelay) {

	let attackingHand = null;
	if (move[0] == GAME.botHandLeft.attr("points")) {
		attackingHand = GAME.botHandLeft;
	} else if (move[0] == GAME.botHandRight.attr("points")) {
		attackingHand = GAME.botHandRight;
	}
	// safety check
	if (attackingHand == null) {
		console.error("Invalid Move");
		return;
	}

	let attackedHand = null;
	if (move[1] == GAME.playerHandLeft.attr("points")) {
		attackedHand = GAME.playerHandLeft;
	} else if (move[1] == GAME.playerHandRight.attr("points")) {
		attackedHand = GAME.playerHandRight;
	}
	// safety check
	if (attackedHand == null) {
		console.error("Invalid Move");
		return;
	}

	// animation
	setTimeout(function () {
		GAME.selectHand(attackingHand);
		GAME.state = 1;
		setTimeout(function () {
			GAME.selectHand(attackedHand);
			setTimeout(function () {
				GAME.unselectHand(attackingHand);
				GAME.unselectHand(attackedHand);
				GAME.attack(Number(move[0]), attackedHand);
				GAME.switchTurnIndicator();
				GAME.isBotPlaying = false;
			}, animationDelay);
		}, animationDelay);
	}, animationDelay);
}


//##############
//#   attack   #
//##############
/**
 * Adds an amount of points to a target hand and changes game state, 
 * depending upon game over condition.
*/
GAME.attack = function(amount, target) {

	console.log("Attacked '"+ target.attr("class") + "' with " + amount +
		" points"
	);

	var targetValue = Number(target.attr("points"));
	GAME.updateHand(target, add(targetValue, amount), false);

	// changes state depending upon whether game over occured
	// ### STATE 1 ###
	if (GAME.state == 1) {

		if (GAME.playerHandLeft.attr("points") == 0 &&
			GAME.playerHandRight.attr("points") == 0) {

			console.log("Game Over bot wins");

			// apply game over screen after a brief delay
			window.setTimeout(function() { GAME.gameOver("You Lose :("); }, 500);

			GAME.state = 6;
		}
		else { GAME.state = 3; }
	}
	// ### STATE 4 ###
	else if (GAME.state == 4) {

		if (GAME.botHandLeft.attr("points") == 0 &&
			GAME.botHandRight.attr("points") == 0) {

			console.log("Game Over player wins");

			// apply game over screen after a brief delay
			window.setTimeout(function() { GAME.gameOver("You Win. You are genius."); }, 500);

			GAME.state = 6;
		}
		else { GAME.state = 0; }
	}
};


//################
//#   gameOver   #
//################
/**
 * Takes a message as input and shows
 * the game over screen with that message.
*/
GAME.gameOver = function(message) {
	GAME.gameOverMessage.innerText = message;
	GAME.gameScreen.fadeOut(300, function() {
		GAME.gameOverScreen.fadeIn();
	});
};


//#################
//#  restartGame  #
//#################
/**
 * Restarts the game and sets the state according to what option
 * the user has selected (player plays first or bot plays first).
*/
GAME.restartGame = function (isPlayerFirst) {

	// reset hand points
	GAME.updateHand(GAME.botHandLeft, 1, false);
	GAME.updateHand(GAME.botHandRight, 1, false);
	GAME.updateHand(GAME.playerHandLeft, 1, false);
	GAME.updateHand(GAME.playerHandRight, 1, false);

	if (isPlayerFirst) {
		
		GAME.playerTurnIndicator.addClass("current-turn");
		GAME.botTurnIndicator.removeClass("current-turn");
		GAME.state = 3;
	} else {
		
		GAME.botTurnIndicator.addClass("current-turn");
		GAME.playerTurnIndicator.removeClass("current-turn");
		GAME.state = 0;
	}
	GAME.backupPoints = [null, null];
}

GAME.restartBotFirst = function() {

	if (GAME.isBotPlaying) {
		return;
	}

	GAME.isBotPlaying = true;
	GAME.restartGame(false);
	setTimeout(function() {
		GAME.doBotMove(GAME.findBestMove())
	}, 200);
};

GAME.restartPlayerFirst = function() {

	if (GAME.isBotPlaying) {
		return;
	}
	GAME.restartGame(true);
};


//#################
//#   exitSplit   #
//#################
/**
 * Exits split mode. If toBeApplied is true, then the split will be
 * applied. Otherwise the split will be cancelled and the current player's
 * turn will be restarted.
*/
GAME.exitSplit = function(toBeApplied) {

	// safety check
	if (GAME.state != 5) {

		console.error("Unknown state encountered in exitSplit function");
		return;
	}

	// apply split
	if (toBeApplied) {

		let half = (parseInt(GAME.playerHandLeft.attr("points")) + parseInt(GAME.playerHandRight.attr("points")))/2
		GAME.updateHand(GAME.playerHandLeft, half, true);
		GAME.updateHand(GAME.playerHandRight, half, true);
	}
	
	// clean up remains of the split mode
	GAME.state = 3;
	GAME.splitBtns.css("visibility", "");
	GAME.unselectHand(GAME.playerHandLeft);
	GAME.unselectHand(GAME.playerHandRight);
}


//####################
//#   isLegalSplit   #
//####################
/**
 * Checks if split can be done.
*/
GAME.isLegalSplit = function() {
	if (GAME.playerHandLeft.attr("points") % 2 == 1 || GAME.playerHandRight.attr("points") % 2 == 1) {
		return false;
	}
	if (GAME.playerHandLeft.attr("points") != 0 && GAME.playerHandRight.attr("points") != 0) {
		return false;
	}
	if (GAME.playerHandLeft.attr("points") == 0 && GAME.playerHandRight.attr("points") == 0) {
		return false;
	}
	return true;
};


//###################
//#   onHandClick   #
//###################
/**
 * Applies game behavior depending upon game state and click info. Gets
 * called whenever the user clicks a hand.
*/
GAME.onHandClick = function() {

	// identify the caller by:
	// set playerNum = 1 or 2
	// set isSelected = true or false
	var caller = $(this);
	var playerNum = caller.hasClass("bot") ? 1 : 2;
	var isSelected = caller.hasClass("selected");

	// if bot is playing
	if (GAME.state <= 2) {
		return;
	}

	// if no hand is selected
	else if (GAME.state == 3 && playerNum == 2) {
		GAME.selectHand(caller);
		GAME.state = 4;
	}

	// if one hand is selected
	else if (GAME.state == 4) {

		if (playerNum == 2 && isSelected) {	

			GAME.unselectHand(caller);
			GAME.state = 3;
		}
		else if (playerNum == 2 && !isSelected && GAME.isLegalSplit()) {

			GAME.selectHand(caller);
			GAME.state = 5;
			GAME.backupPoints = [
				GAME.playerHandLeft.attr("points"),
				GAME.playerHandRight.attr("points")
			];
			GAME.splitBtns.css("visibility", "visible");
		}
		else if (playerNum == 1) {

			var attackingHand = GAME.playerHandLeft.hasClass("selected") ?
				GAME.playerHandLeft : GAME.playerHandRight;
			var attackAmount = Number(attackingHand.attr("points"));

			if ((attackAmount != 0) && (caller.attr("points") != 0)) {

				GAME.unselectHand(attackingHand);
				GAME.attack(attackAmount, caller);
				GAME.switchTurnIndicator();
				GAME.doBotMove(GAME.findBestMove());
			}
		}
	}
};


//##################
//#   selectHand   #
//##################
/**
 * Marks a given hand as selected by changing the filepath of its image
 * tag. No changes are made if the given hand is already selected.
*/
GAME.selectHand = function(hand) {

	var old = hand.attr("src");
	if (old.search("unselected") != -1) {

		hand.addClass("selected");
		hand.attr("src", old.replace("un", ""));
	}
};


//####################
//#   unselectHand   #
//####################
/**
 * Marks a given hand as unselected by changing the filepath of its image
 * tag. No changes are made if the given hand is already unselected.
*/
GAME.unselectHand = function(hand) {

	var old = hand.attr("src");
	if (old.search("unselected") == -1) {

		hand.removeClass("selected");
		hand.attr("src", old.replace("selected", "unselected"));
	}
};


//##################
//#   updateHand   #
//##################
/**
 * Updates hand by assigning the given points and swapping in the
 * corresponding hand image.
*/
GAME.updateHand = function(hand, points, isSelected) {

	hand.attr("points", points);

	hand.attr("src", "media/points-" + String(points) + "-" +
		(isSelected ? "" : "un") + "selected.svg");
	if (isSelected) {
		hand.addClass("selected");
	} else {
		hand.removeClass("selected");
	}
};


//############################
//#   switchTurnIndictator   #
//############################
/**
 * Modifies style to indicate whose turn it is. 
*/
GAME.switchTurnIndicator = function() {

	GAME.botTurnIndicator.toggleClass("current-turn");
	GAME.playerTurnIndicator.toggleClass("current-turn");
};


//####################
//#   findBestMove   #
//####################
/**
 * Finds the best move for the bot from GAME.BEST_MOVES.
*/
GAME.findBestMove = function() {
	
	let botPosition = GAME.botHandLeft.attr("points") < GAME.botHandRight.attr("points")
		? `${GAME.botHandLeft.attr("points")}, ${GAME.botHandRight.attr("points")}`
		: `${GAME.botHandRight.attr("points")}, ${GAME.botHandLeft.attr("points")}`;
	let playerPosition = GAME.playerHandLeft.attr("points") < GAME.playerHandRight.attr("points")
		? `${GAME.playerHandLeft.attr("points")}, ${GAME.playerHandRight.attr("points")}`
		: `${GAME.playerHandRight.attr("points")}, ${GAME.playerHandLeft.attr("points")}`;

	let position = `${botPosition}, ${playerPosition}`;
	let move = getRandomItem(GAME.BEST_MOVES[position]);
	return move.toString();
};

// Static best move lookup table generated with python.
GAME.BEST_MOVES = {"0, 0, 0, 1": [], "0, 0, 1, 1": [], "0, 0, 0, 2": [], "0, 0, 1, 2": [], "0, 0, 2, 2": [], "0, 0, 0, 3": [], "0, 0, 1, 3": [], "0, 0, 2, 3": [], "0, 0, 3, 3": [], "0, 0, 0, 4": [], "0, 0, 1, 4": [], "0, 0, 2, 4": [], "0, 0, 3, 4": [], "0, 0, 4, 4": [], "0, 1, 0, 1": [110], "0, 1, 1, 1": [110], "0, 1, 0, 2": [120], "0, 1, 1, 2": [120], "0, 1, 2, 2": [120], "0, 1, 0, 3": [130], "0, 1, 1, 3": [110], "0, 1, 2, 3": [120], "0, 1, 3, 3": [130], "0, 1, 0, 4": [140], "0, 1, 1, 4": [140], "0, 1, 2, 4": [140], "0, 1, 3, 4": [140], "0, 1, 4, 4": [140], "1, 1, 0, 1": [110], "1, 1, 1, 1": [110], "1, 1, 0, 2": [120], "1, 1, 1, 2": [120, 110], "1, 1, 2, 2": [120], "1, 1, 0, 3": [130], "1, 1, 1, 3": [130, 110], "1, 1, 2, 3": [120, 130], "1, 1, 3, 3": [130], "1, 1, 0, 4": [140], "1, 1, 1, 4": [140, 110], "1, 1, 2, 4": [120, 140], "1, 1, 3, 4": [140], "1, 1, 4, 4": [140], "0, 2, 0, 1": [111], "0, 2, 1, 1": [111], "0, 2, 0, 2": [121, 220], "0, 2, 1, 2": [121, 220, 111], "0, 2, 2, 2": [121, 220], "0, 2, 0, 3": [230], "0, 2, 1, 3": [131, 111], "0, 2, 2, 3": [121, 131, 230], "0, 2, 3, 3": [131], "0, 2, 0, 4": [141], "0, 2, 1, 4": [240, 141, 111], "0, 2, 2, 4": [240, 121, 141], "0, 2, 3, 4": [141, 230], "0, 2, 4, 4": [240, 141], "1, 2, 0, 1": [110], "1, 2, 1, 1": [110], "1, 2, 0, 2": [220], "1, 2, 1, 2": [210, 220, 110], "1, 2, 2, 2": [120, 220], "1, 2, 0, 3": [230], "1, 2, 1, 3": [130, 110, 230], "1, 2, 2, 3": [130, 220, 230], "1, 2, 3, 3": [130], "1, 2, 0, 4": [140], "1, 2, 1, 4": [240, 210, 140, 110], "1, 2, 2, 4": [120, 240, 220, 140], "1, 2, 3, 4": [130, 230], "1, 2, 4, 4": [240, 140], "2, 2, 0, 1": [210], "2, 2, 1, 1": [210], "2, 2, 0, 2": [220], "2, 2, 1, 2": [210, 220], "2, 2, 2, 2": [220], "2, 2, 0, 3": [230], "2, 2, 1, 3": [230], "2, 2, 2, 3": [220, 230], "2, 2, 3, 3": [230], "2, 2, 0, 4": [240], "2, 2, 1, 4": [240, 210], "2, 2, 2, 4": [240, 220], "2, 2, 3, 4": [240, 230], "2, 2, 4, 4": [240], "0, 3, 0, 1": [310], "0, 3, 1, 1": [310], "0, 3, 0, 2": [320], "0, 3, 1, 2": [320], "0, 3, 2, 2": [320], "0, 3, 0, 3": [330], "0, 3, 1, 3": [330, 310], "0, 3, 2, 3": [320], "0, 3, 3, 3": [330], "0, 3, 0, 4": [340], "0, 3, 1, 4": [310], "0, 3, 2, 4": [320], "0, 3, 3, 4": [330], "0, 3, 4, 4": [340], "1, 3, 0, 1": [110], "1, 3, 1, 1": [310, 110], "1, 3, 0, 2": [320], "1, 3, 1, 2": [320], "1, 3, 2, 2": [120, 320], "1, 3, 0, 3": [330], "1, 3, 1, 3": [310, 130, 330, 110], "1, 3, 2, 3": [120, 320, 330], "1, 3, 3, 3": [130, 330], "1, 3, 0, 4": [140], "1, 3, 1, 4": [140], "1, 3, 2, 4": [120, 140], "1, 3, 3, 4": [140, 330, 340], "1, 3, 4, 4": [140], "2, 3, 0, 1": [210], "2, 3, 1, 1": [210, 310], "2, 3, 0, 2": [320], "2, 3, 1, 2": [220, 310], "2, 3, 2, 2": [320, 220], "2, 3, 0, 3": [230], "2, 3, 1, 3": [310, 330], "2, 3, 2, 3": [320], "2, 3, 3, 3": [230], "2, 3, 0, 4": [340], "2, 3, 1, 4": [240, 210, 340], "2, 3, 2, 4": [240, 320, 340], "2, 3, 3, 4": [240, 330, 230], "2, 3, 4, 4": [240, 340], "3, 3, 0, 1": [310], "3, 3, 1, 1": [310], "3, 3, 0, 2": [320], "3, 3, 1, 2": [320], "3, 3, 2, 2": [320], "3, 3, 0, 3": [330], "3, 3, 1, 3": [330, 310], "3, 3, 2, 3": [320], "3, 3, 3, 3": [330], "3, 3, 0, 4": [340], "3, 3, 1, 4": [340, 310], "3, 3, 2, 4": [320], "3, 3, 3, 4": [330], "3, 3, 4, 4": [340], "0, 4, 0, 1": [410], "0, 4, 1, 1": [211], "0, 4, 0, 2": [221], "0, 4, 1, 2": [211, 221], "0, 4, 2, 2": [221], "0, 4, 0, 3": [231], "0, 4, 1, 3": [410], "0, 4, 2, 3": [221, 231], "0, 4, 3, 3": [231], "0, 4, 0, 4": [440], "0, 4, 1, 4": [241, 211], "0, 4, 2, 4": [440, 241, 221], "0, 4, 3, 4": [440, 241, 231], "0, 4, 4, 4": [440, 241], "1, 4, 0, 1": [410], "1, 4, 1, 1": [410, 110], "1, 4, 0, 2": [120, 420], "1, 4, 1, 2": [410, 420, 110], "1, 4, 2, 2": [120, 420], "1, 4, 0, 3": [130, 430], "1, 4, 1, 3": [130, 430, 110, 410], "1, 4, 2, 3": [120, 130, 430], "1, 4, 3, 3": [130, 430], "1, 4, 0, 4": [140], "1, 4, 1, 4": [410, 140, 110], "1, 4, 2, 4": [120, 420, 140, 440], "1, 4, 3, 4": [440, 140, 430], "1, 4, 4, 4": [440, 140], "2, 4, 0, 1": [410], "2, 4, 1, 1": [210, 410], "2, 4, 0, 2": [420, 220], "2, 4, 1, 2": [210, 420, 220, 410], "2, 4, 2, 2": [420, 220], "2, 4, 0, 3": [230], "2, 4, 1, 3": [410], "2, 4, 2, 3": [420, 220, 430, 230], "2, 4, 3, 3": [230], "2, 4, 0, 4": [440], "2, 4, 1, 4": [240, 210, 440, 410], "2, 4, 2, 4": [240, 420, 220, 440], "2, 4, 3, 4": [440], "2, 4, 4, 4": [240, 440], "3, 4, 0, 1": [410], "3, 4, 1, 1": [310], "3, 4, 0, 2": [320], "3, 4, 1, 2": [410, 420], "3, 4, 2, 2": [320, 420], "3, 4, 0, 3": [430], "3, 4, 1, 3": [330, 430, 310, 410], "3, 4, 2, 3": [320, 330, 420, 430], "3, 4, 3, 3": [330, 430], "3, 4, 0, 4": [440, 340], "3, 4, 1, 4": [440, 410, 340], "3, 4, 2, 4": [320, 420, 340, 440], "3, 4, 3, 4": [440, 330, 340], "3, 4, 4, 4": [440], "4, 4, 0, 1": [410], "4, 4, 1, 1": [410], "4, 4, 0, 2": [420], "4, 4, 1, 2": [410, 420], "4, 4, 2, 2": [420], "4, 4, 0, 3": [430], "4, 4, 1, 3": [410], "4, 4, 2, 3": [420], "4, 4, 3, 3": [430], "4, 4, 0, 4": [440], "4, 4, 1, 4": [440], "4, 4, 2, 4": [440, 420], "4, 4, 3, 4": [440], "4, 4, 4, 4": [440]};


// Utilities for addition and random selection.
function add(num1, num2) {
	return (num1 + num2) % 5;
}
function getRandomItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}
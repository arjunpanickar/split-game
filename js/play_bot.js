// creates psuedo-namespace
var GAME = {};


//###################
//#   ENTRY POINT   #
//###################
/**
 * Sets global variables, adds click listener to hands, and starts game
 * off with player-1's turn.
*/
$(document).ready(function() {

	"use strict";

	GAME.createGlobalVars();
	GAME.addBtnListeners();
	
	GAME.regions.fadeOut(0, function() {
		GAME.startScreen.fadeIn();
	});

	
});

/**
 * Starts the game
*/
GAME.start = function(isPlayerFirst) {
	if (isPlayerFirst) {
		// indicates player-1's turn
		// GAME.p2Region.addClass("currentTurn");
		// GAME.p1Region.removeClass("currentTurn");
		// GAME.state = 3;
		GAME.restartBtn.click(GAME.restartPlayerFirst);
		GAME.restartBtn.off('click', GAME.restartBotFirst);
	} else {
		// indicates bots's turn
		// GAME.p1Region.addClass("currentTurn");
		// GAME.p2Region.removeClass("currentTurn");
		// GAME.state = 0;
		GAME.restartBtn.click(GAME.restartBotFirst);
		GAME.restartBtn.off('click', GAME.restartPlayerFirst);
	}
	GAME.restartBtn.click();

	GAME.startScreen.fadeOut(300, function() {
		GAME.regions.fadeIn();
	});
};


//#######################
//#   addBtnListeners   #
//#######################
/**
 * Adds listener functions to all game buttons
*/
GAME.addBtnListeners = function() {
	
	// start
	GAME.startBotFirstBtn.click(function() {
		GAME.start(false);
	});
	GAME.startPlayerFirstBtn.click(function() {
		GAME.start(true);
	});
	
	// back
	GAME.backBtn.click(function() {
		GAME.regions.fadeOut(300, function() {
			GAME.startScreen.fadeIn();
		});
	});

	// hands
	GAME.p1Hands.click(GAME.onHandClick);
	GAME.p2Hands.click(GAME.onHandClick);

	// cancel and apply
	GAME.cancelBtns.click(function() { GAME.exitSplit(false); });
	GAME.applyBtns.click(function() { GAME.exitSplit(true); });

	// up and down
	GAME.downBtns.click(function() { GAME.transferPoints(false); });
	GAME.upBtns.click(function() { GAME.transferPoints(true); });

};

GAME.doBotMove = function(move) {
	let animationDelay = 800;
	console.log(move);
	if (move[2] == 1){
		console.log("split");

		let nonZeroHand = null;
		if(Number(move[0]) * 2 == GAME.p1HandTop.attr("points")){
			nonZeroHand = GAME.p1HandTop;
		} else if(Number(move[0]) * 2 == GAME.p1HandBottom.attr("points")){
			nonZeroHand = GAME.p1HandBottom;
		}
		if(nonZeroHand == null) {
			console.error("Invalid Move");
			return;
		}

		let zeroHand = null;
		if("0" == GAME.p1HandTop.attr("points")){
			zeroHand = GAME.p1HandTop;
		} else if("0" == GAME.p1HandBottom.attr("points")){
			zeroHand = GAME.p1HandBottom;
		}
		if(zeroHand == null) {
			console.error("Invalid Move");
			return;
		}

		setTimeout(function() {
			GAME.selectHand(nonZeroHand);
			setTimeout(function() {
				GAME.selectHand(zeroHand);
				setTimeout(function() {
					GAME.updateHand(zeroHand, move[0], false);
					GAME.updateHand(nonZeroHand, move[0], false);
					setTimeout(function() {
						GAME.doBotMoveWithoutSplit(move, animationDelay);
					}, animationDelay)
				}, animationDelay);
			}, animationDelay);
		}, animationDelay);
	} else if(move[2] == 0){
		GAME.doBotMoveWithoutSplit(move, animationDelay);
	} else {
		console.error("Invalid Move");
		return;
	}
}

GAME.doBotMoveWithoutSplit = function(move, animationDelay) {
	let sum = add(Number(move[0]), Number(move[1]));

	let attackingHand = null;
	if(move[0] == GAME.p1HandTop.attr("points")){
		attackingHand = GAME.p1HandTop;
	} else if(move[0] == GAME.p1HandBottom.attr("points")){
		attackingHand = GAME.p1HandBottom;
	}
	if(attackingHand == null) {
		console.error("Invalid Move");
		return;
	}

	
	let attackedHand = null;
	if(move[1] == GAME.p2HandTop.attr("points")){
		attackedHand = GAME.p2HandTop;
	} else if(move[1] == GAME.p2HandBottom.attr("points")){
		attackedHand = GAME.p2HandBottom;
	}
	if(attackedHand == null) {
		console.error("Invalid Move");
		return;
	}

	setTimeout(function () {
		GAME.selectHand(attackingHand);
		GAME.state = 1;
		setTimeout(function (){
			GAME.selectHand(attackedHand);
			setTimeout(function (){
				GAME.unselectHand(attackingHand);
				GAME.attack(Number(move[0]), attackedHand);
				GAME.switchTurnIndicator();
			}, animationDelay);
		}, animationDelay);
	}, animationDelay);
}

//##############
//#   attack   #
//##############
/**
 * Deals an amount of damage to a target hand and changes game state,
 * depending upon game over condition.
*/

function add(num1, num2) {
	return (num1 + num2) % 5
}

GAME.attack = function(amount, target) {

	console.log("Attacked '"+ target.attr("class") + "' with " + amount +
		" points"
	);

	var targetValue = Number(target.attr("points"));

	// deducts amount from target hand's value
	GAME.updateHand(target, add(targetValue, amount), false);

	// changes state depending upon whether game over occured
	// ### STATE 1 ###
	if (GAME.state == 1) {

		if (GAME.p2HandTop.attr("points") == 0 &&
			GAME.p2HandBottom.attr("points") == 0) {

			console.log("Game Over p1 wins");

			// apply game over screen after a brief delay
			window.setTimeout(function() { GAME.gameOver("lost"); }, 500);

			GAME.state = 6;
		}
		else { GAME.state = 3; }
	}
	// ### STATE 4 ###
	else if (GAME.state == 4) {

		if (GAME.p1HandTop.attr("points") == 0 &&
			GAME.p1HandBottom.attr("points") == 0) {

			console.log("Game Over p2 wins");

			// apply game over screen after a brief delay
			window.setTimeout(function() { GAME.gameOver("won"); }, 500);

			GAME.state = 6;
		}
		else {
			GAME.state = 0;
		}
	}
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

	// apply split
	if (toBeApplied) {

		// GAME.state = (GAME.state == 2) ? 0 : 3;
		// GAME.switchTurnIndicator();
		// ### STATE 2 ###
		if (GAME.state == 2) {
			half = (parseInt(GAME.p1HandTop.attr("points")) + parseInt(GAME.p1HandBottom.attr("points")))/2
			GAME.updateHand(GAME.p1HandTop, half, true);
			GAME.updateHand(GAME.p1HandBottom, half, true);
			GAME.state = 0;
		}
		// ### STATE 5 ###
		else if (GAME.state == 5) {
			half = (parseInt(GAME.p2HandTop.attr("points")) + parseInt(GAME.p2HandBottom.attr("points")))/2
			GAME.updateHand(GAME.p2HandTop, half, true);
			GAME.updateHand(GAME.p2HandBottom, half, true);
			GAME.state = 3;
		}
		else {

			console.log("Unknown state encountered in transferPoints " +
				"function");
			return;
		}
	}

	// cancel split by restoring backed up points
	else {

		// ### STATE 2 ###
		if (GAME.state == 2) {

			GAME.updateHand(GAME.p1HandTop, GAME.backupPoints[0], true);
			GAME.updateHand(GAME.p1HandBottom, GAME.backupPoints[1], true);
			GAME.state = 0;
		}
		// ### STATE 5 ###
		else if (GAME.state == 5) {

			GAME.updateHand(GAME.p2HandTop, GAME.backupPoints[0], true);
			GAME.updateHand(GAME.p2HandBottom, GAME.backupPoints[1], true);
			GAME.state = 3;
		}
		else {

			console.log("Unknown state encountered in transferPoints " +
				"function");
			return;
		}
	}

	// clean up remains of the split mode
	GAME.unselectHand(GAME.p1HandTop);
	GAME.unselectHand(GAME.p1HandBottom);
	GAME.unselectHand(GAME.p2HandTop);
	GAME.unselectHand(GAME.p2HandBottom);
	GAME.splitBtns.css("display", "");
}


//################
//#   gameOver   #
//################
/**
 * Replaces the normal game screen with a game over message, depending
 * upon which player won
*/
GAME.gameOver = function(result) {

	// GAME.game
	// 	.html("Game Over</br>Player " + playerNumber + " Wins")
	// 	.addClass("gameOver");
	alert("Game Over\nYou " + result);
};

GAME.restartGame = function (isPlayerFirst) {
	if (isPlayerFirst) {
		console.log("player");
		
		GAME.p2Region.addClass("currentTurn");
		GAME.p1Region.removeClass("currentTurn");

		GAME.state = 3;
	} else {
		console.log("bot");
		
		GAME.p1Region.addClass("currentTurn");
		GAME.p2Region.removeClass("currentTurn");

		GAME.state = 0;
	}
	GAME.backupPoints = [null, null];
	GAME.updateHand(GAME.p1HandTop, 1, false);
	GAME.updateHand(GAME.p1HandBottom, 1, false);
	GAME.updateHand(GAME.p2HandTop, 1, false);
	GAME.updateHand(GAME.p2HandBottom, 1, false);
}
GAME.restartBotFirst = function() {GAME.restartGame(false)};
GAME.restartPlayerFirst = function() {GAME.restartGame(true)};

//########################
//#   createGlobalVars   #
//########################
/**
 * Creates variables in global namespace
*/
GAME.createGlobalVars = function() {

	GAME.game = $(".game");
	GAME.startScreen = $(".start-screen");
	GAME.startBotFirstBtn = $(".bot-first-btn");
	GAME.startPlayerFirstBtn = $(".you-first-btn");
	GAME.regions = $(".game-screen");

	GAME.state = 0;
	GAME.backupPoints = [null, null];

	GAME.p1Region = $(".region.p1");
	GAME.p1Hands = $(".hand.p1");
	GAME.p1HandTop = $(".p1.top");
	GAME.p1HandBottom = $(".p1.bottom");

	GAME.p2Region = $(".region.p2");
	GAME.p2Hands = $(".hand.p2");
	GAME.p2HandTop = $(".p2.top");
	GAME.p2HandBottom = $(".p2.bottom");

	GAME.splitBtns = $(".split-btn");
	GAME.upBtns = $(".split-btn.up");
	GAME.downBtns = $(".split-btn.down");
	GAME.applyBtns = $(".split-btn.apply");
	GAME.cancelBtns = $(".split-btn.cancel");

	GAME.restartBtn = $(".restart-btn");
	GAME.backBtn = $(".back-btn");
}


//####################
//#   isLegalSplit   #
//####################
/**
 * Checks the legality of a given split, and returns true if:
 *		- points are changed, and
 *		- point change is fair, and
 *		- new points are non-negative, and
 *		- new points are not too big,
 * otherwise returns false.
*/
GAME.isLegalSplit = function(ptsOrig, ptsNew) {

	var changed = (ptsOrig[0] != ptsNew[0]) && (ptsOrig[1] != ptsNew[1]);
	var fair = (ptsOrig[0] - ptsNew[0]) == -1 * (ptsOrig[1] - ptsNew[1]);
	var nonNeg = (ptsNew[0] >= 0) && (ptsNew[1] >= 0);
	var notTooBig = (ptsNew[0] < 5) && (ptsNew[1] < 5);

	return changed && fair && nonNeg && notTooBig;
};

//###################
//#   onHandClick   #
//###################
/**
 * Applies game behavior depending upon game state and click info. Gets
 * called by whenever the user clicks a hand.
 *
*/
GAME.onHandClick = function() {

	// identify the caller by:
	// set playerNum = 1 or 2
	// set isSelected = true or false
	var caller = $(this);
	var playerNum = caller.hasClass("p1") ? 1 : 2;
	var isSelected = caller.hasClass("selected");

	console.log(
		"Current state: " + GAME.state +
		"\nClicked hand belonging to player #: " + playerNum +
		"\nThis hand was previously " +
		(isSelected ? "selected" : "unselected")
		);

	// ### STATE 0 ###
	if (GAME.state < 3) {
		return;

		// GAME.selectHand(caller);
		// GAME.state = 1;
	}

	// ### STATE 1 ###
	// else if (GAME.state == 1) {

	// 	if (playerNum == 1 && isSelected) {

	// 		GAME.unselectHand(caller);
	// 		GAME.state = 0;
	// 	}
	// 	else if (playerNum == 1 && !isSelected) {
	// 		if (GAME.p1HandTop.attr("points") % 2 == 1 || GAME.p1HandBottom.attr("points") % 2 == 1) {
	// 			return;
	// 		}
	// 		if (GAME.p1HandTop.attr("points") != 0 && GAME.p1HandBottom.attr("points") != 0) {
	// 			return;
	// 		}

	// 		GAME.selectHand(caller);
	// 		GAME.state = 2;
	// 		GAME.backupPoints = [
	// 			GAME.p1HandTop.attr("points"),
	// 			GAME.p1HandBottom.attr("points")
	// 		];
	// 		$(".split-btn.p1").css("display", "initial");
	// 	}
	// 	else if (playerNum == 2) {

	// 		var attackingHand = GAME.p1HandTop.hasClass("selected") ?
	// 			GAME.p1HandTop : GAME.p1HandBottom;
	// 		var attackAmount = Number(attackingHand.attr("points"));

	// 		if ((attackAmount != 0) && (caller.attr("points") != 0)) {

	// 			GAME.unselectHand(attackingHand);
	// 			GAME.attack(attackAmount, caller);
	// 			GAME.switchTurnIndicator();
	// 		}
	// 	}
	// }

	// ### STATE 3 ###
	else if (GAME.state == 3 && playerNum == 2) {
		GAME.selectHand(caller);
		GAME.state = 4;
	}

	// ### STATE 4 ###
	else if (GAME.state == 4) {

		if (playerNum == 2 && isSelected) {	

			GAME.unselectHand(caller);
			GAME.state = 3;
		}
		else if (playerNum == 2 && !isSelected) {
			if (GAME.p2HandTop.attr("points") % 2 == 1 || GAME.p2HandBottom.attr("points") % 2 == 1) {
				return;
			}
			if (GAME.p2HandTop.attr("points") != 0 && GAME.p2HandBottom.attr("points") != 0) {
				return;
			}

			GAME.selectHand(caller);
			GAME.state = 5;
			GAME.backupPoints = [
				GAME.p2HandTop.attr("points"),
				GAME.p2HandBottom.attr("points")
			];
			$(".split-btn.p2").css("display", "initial");
		}
		else if (playerNum == 1) {

			var attackingHand = GAME.p2HandTop.hasClass("selected") ?
				GAME.p2HandTop : GAME.p2HandBottom;
			var attackAmount = Number(attackingHand.attr("points"));

			if ((attackAmount != 0) && (caller.attr("points") != 0)) {

				GAME.unselectHand(attackingHand);
				GAME.attack(attackAmount, caller);
				GAME.switchTurnIndicator();
				GAME.doBotMove(GAME.findBestMove());
			}
		}
	}

	console.log("Changed state to: " + GAME.state);
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


//############################
//#   switchTurnIndictator   #
//############################
/**
 * Switches style of `region` elements to indicate which whose turn it is. 
*/
GAME.switchTurnIndicator = function() {

	GAME.p1Region.toggleClass("currentTurn");
	GAME.p2Region.toggleClass("currentTurn");
};


//######################
//#   transferPoints   #
//######################
/**
 * Transfers points between the current player's hands as part of split.
 *
 * If `upwards` is true, one points is transfer from the current player's
 * bottom hand to their top hand. Otherwise, the point transfer is in the
 * opposite direction.
 *
 * The point transfer is checked for legality before it is applied.
*/
GAME.transferPoints = function(upwards) {

	// identifies current players hands
	var handTop, handBottom;
	// ### STATE 2 ###
	if (GAME.state == 2) {

		handTop = GAME.p1HandTop;
		handBottom = GAME.p1HandBottom;
	}
	// ### STATE 5 ###
	else if (GAME.state == 5) {

		handTop = GAME.p2HandTop;
		handBottom = GAME.p2HandBottom;
	}
	else {

		console.log("Unknown state encountered in transferPoints function");
		return;
	}

	// identifies original and new points
	var ptsOrig, ptsNew;
	ptsOrig = [
		Number(handTop.attr("points")),
		Number(handBottom.attr("points")),
	];
	if (upwards)
		ptsNew = [
			ptsOrig[0] + 1,
			ptsOrig[1] - 1
		];
	else
		ptsNew = [
			ptsOrig[0] - 1,
			ptsOrig[1] + 1
		];

	// displays new points (if they're legal)
	if (GAME.isLegalSplit(ptsOrig, ptsNew)) {

		GAME.updateHand(handTop, ptsNew[0], true);
		GAME.updateHand(handBottom, ptsNew[1], true);
	}
}


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

GAME.findBestMove = function() {
	let botPosition = GAME.p1HandTop.attr("points") < GAME.p1HandBottom.attr("points") ?
		`${GAME.p1HandTop.attr("points")}, ${GAME.p1HandBottom.attr("points")}` :
		`${GAME.p1HandBottom.attr("points")}, ${GAME.p1HandTop.attr("points")}`;
	let playerPosition = GAME.p2HandTop.attr("points") < GAME.p2HandBottom.attr("points") ?
		`${GAME.p2HandTop.attr("points")}, ${GAME.p2HandBottom.attr("points")}` :
		`${GAME.p2HandBottom.attr("points")}, ${GAME.p2HandTop.attr("points")}`;
	let position = `${botPosition}, ${playerPosition}`;
	move = getRandomItem(BEST_MOVES[position]);
	return move.toString();
};

function getRandomItem(array) {
	return array[Math.floor(Math.random() * array.length)]
}

var BEST_MOVES = {"0, 0, 0, 1": [], "0, 0, 1, 1": [], "0, 0, 0, 2": [], "0, 0, 1, 2": [], "0, 0, 2, 2": [], "0, 0, 0, 3": [], "0, 0, 1, 3": [], "0, 0, 2, 3": [], "0, 0, 3, 3": [], "0, 0, 0, 4": [], "0, 0, 1, 4": [], "0, 0, 2, 4": [], "0, 0, 3, 4": [], "0, 0, 4, 4": [], "0, 1, 0, 1": [110], "0, 1, 1, 1": [110], "0, 1, 0, 2": [120], "0, 1, 1, 2": [120], "0, 1, 2, 2": [120], "0, 1, 0, 3": [130], "0, 1, 1, 3": [110], "0, 1, 2, 3": [120], "0, 1, 3, 3": [130], "0, 1, 0, 4": [140], "0, 1, 1, 4": [140], "0, 1, 2, 4": [140], "0, 1, 3, 4": [140], "0, 1, 4, 4": [140], "1, 1, 0, 1": [110], "1, 1, 1, 1": [110], "1, 1, 0, 2": [120], "1, 1, 1, 2": [120, 110], "1, 1, 2, 2": [120], "1, 1, 0, 3": [130], "1, 1, 1, 3": [130, 110], "1, 1, 2, 3": [120, 130], "1, 1, 3, 3": [130], "1, 1, 0, 4": [140], "1, 1, 1, 4": [140, 110], "1, 1, 2, 4": [120, 140], "1, 1, 3, 4": [140], "1, 1, 4, 4": [140], "0, 2, 0, 1": [111], "0, 2, 1, 1": [111], "0, 2, 0, 2": [121, 220], "0, 2, 1, 2": [121, 220, 111], "0, 2, 2, 2": [121, 220], "0, 2, 0, 3": [230], "0, 2, 1, 3": [131, 111], "0, 2, 2, 3": [121, 131, 230], "0, 2, 3, 3": [131], "0, 2, 0, 4": [141], "0, 2, 1, 4": [240, 141, 111], "0, 2, 2, 4": [240, 121, 141], "0, 2, 3, 4": [141, 230], "0, 2, 4, 4": [240, 141], "1, 2, 0, 1": [110], "1, 2, 1, 1": [110], "1, 2, 0, 2": [220], "1, 2, 1, 2": [210, 220, 110], "1, 2, 2, 2": [120, 220], "1, 2, 0, 3": [230], "1, 2, 1, 3": [130, 110, 230], "1, 2, 2, 3": [130, 220, 230], "1, 2, 3, 3": [130], "1, 2, 0, 4": [140], "1, 2, 1, 4": [240, 210, 140, 110], "1, 2, 2, 4": [120, 240, 220, 140], "1, 2, 3, 4": [130, 230], "1, 2, 4, 4": [240, 140], "2, 2, 0, 1": [210], "2, 2, 1, 1": [210], "2, 2, 0, 2": [220], "2, 2, 1, 2": [210, 220], "2, 2, 2, 2": [220], "2, 2, 0, 3": [230], "2, 2, 1, 3": [230], "2, 2, 2, 3": [220, 230], "2, 2, 3, 3": [230], "2, 2, 0, 4": [240], "2, 2, 1, 4": [240, 210], "2, 2, 2, 4": [240, 220], "2, 2, 3, 4": [240, 230], "2, 2, 4, 4": [240], "0, 3, 0, 1": [310], "0, 3, 1, 1": [310], "0, 3, 0, 2": [320], "0, 3, 1, 2": [320], "0, 3, 2, 2": [320], "0, 3, 0, 3": [330], "0, 3, 1, 3": [330, 310], "0, 3, 2, 3": [320], "0, 3, 3, 3": [330], "0, 3, 0, 4": [340], "0, 3, 1, 4": [310], "0, 3, 2, 4": [320], "0, 3, 3, 4": [330], "0, 3, 4, 4": [340], "1, 3, 0, 1": [110], "1, 3, 1, 1": [310, 110], "1, 3, 0, 2": [320], "1, 3, 1, 2": [320], "1, 3, 2, 2": [120, 320], "1, 3, 0, 3": [330], "1, 3, 1, 3": [310, 130, 330, 110], "1, 3, 2, 3": [120, 320, 330], "1, 3, 3, 3": [130, 330], "1, 3, 0, 4": [140], "1, 3, 1, 4": [140], "1, 3, 2, 4": [120, 140], "1, 3, 3, 4": [140, 330, 340], "1, 3, 4, 4": [140], "2, 3, 0, 1": [210], "2, 3, 1, 1": [210, 310], "2, 3, 0, 2": [320], "2, 3, 1, 2": [220, 310], "2, 3, 2, 2": [320, 220], "2, 3, 0, 3": [230], "2, 3, 1, 3": [310, 330], "2, 3, 2, 3": [320], "2, 3, 3, 3": [230], "2, 3, 0, 4": [340], "2, 3, 1, 4": [240, 210, 340], "2, 3, 2, 4": [240, 320, 340], "2, 3, 3, 4": [240, 330, 230], "2, 3, 4, 4": [240, 340], "3, 3, 0, 1": [310], "3, 3, 1, 1": [310], "3, 3, 0, 2": [320], "3, 3, 1, 2": [320], "3, 3, 2, 2": [320], "3, 3, 0, 3": [330], "3, 3, 1, 3": [330, 310], "3, 3, 2, 3": [320], "3, 3, 3, 3": [330], "3, 3, 0, 4": [340], "3, 3, 1, 4": [340, 310], "3, 3, 2, 4": [320], "3, 3, 3, 4": [330], "3, 3, 4, 4": [340], "0, 4, 0, 1": [410], "0, 4, 1, 1": [211], "0, 4, 0, 2": [221], "0, 4, 1, 2": [211, 221], "0, 4, 2, 2": [221], "0, 4, 0, 3": [231], "0, 4, 1, 3": [410], "0, 4, 2, 3": [221, 231], "0, 4, 3, 3": [231], "0, 4, 0, 4": [440], "0, 4, 1, 4": [241, 211], "0, 4, 2, 4": [440, 241, 221], "0, 4, 3, 4": [440, 241, 231], "0, 4, 4, 4": [440, 241], "1, 4, 0, 1": [410], "1, 4, 1, 1": [410, 110], "1, 4, 0, 2": [120, 420], "1, 4, 1, 2": [410, 420, 110], "1, 4, 2, 2": [120, 420], "1, 4, 0, 3": [130, 430], "1, 4, 1, 3": [130, 430, 110, 410], "1, 4, 2, 3": [120, 130, 430], "1, 4, 3, 3": [130, 430], "1, 4, 0, 4": [140], "1, 4, 1, 4": [410, 140, 110], "1, 4, 2, 4": [120, 420, 140, 440], "1, 4, 3, 4": [440, 140, 430], "1, 4, 4, 4": [440, 140], "2, 4, 0, 1": [410], "2, 4, 1, 1": [210, 410], "2, 4, 0, 2": [420, 220], "2, 4, 1, 2": [210, 420, 220, 410], "2, 4, 2, 2": [420, 220], "2, 4, 0, 3": [230], "2, 4, 1, 3": [410], "2, 4, 2, 3": [420, 220, 430, 230], "2, 4, 3, 3": [230], "2, 4, 0, 4": [440], "2, 4, 1, 4": [240, 210, 440, 410], "2, 4, 2, 4": [240, 420, 220, 440], "2, 4, 3, 4": [440], "2, 4, 4, 4": [240, 440], "3, 4, 0, 1": [410], "3, 4, 1, 1": [310], "3, 4, 0, 2": [320], "3, 4, 1, 2": [410, 420], "3, 4, 2, 2": [320, 420], "3, 4, 0, 3": [430], "3, 4, 1, 3": [330, 430, 310, 410], "3, 4, 2, 3": [320, 330, 420, 430], "3, 4, 3, 3": [330, 430], "3, 4, 0, 4": [440, 340], "3, 4, 1, 4": [440, 410, 340], "3, 4, 2, 4": [320, 420, 340, 440], "3, 4, 3, 4": [440, 330, 340], "3, 4, 4, 4": [440], "4, 4, 0, 1": [410], "4, 4, 1, 1": [410], "4, 4, 0, 2": [420], "4, 4, 1, 2": [410, 420], "4, 4, 2, 2": [420], "4, 4, 0, 3": [430], "4, 4, 1, 3": [410], "4, 4, 2, 3": [420], "4, 4, 3, 3": [430], "4, 4, 0, 4": [440], "4, 4, 1, 4": [440], "4, 4, 2, 4": [440, 420], "4, 4, 3, 4": [440], "4, 4, 4, 4": [440]};
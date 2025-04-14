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

	// indicates player-1's turn
	GAME.p1Region.addClass("currentTurn");

	console.log("jQuery works");
});


//#######################
//#   addBtnListeners   #
//#######################
/**
 * Adds listener functions to all game buttons
*/
GAME.addBtnListeners = function() {

	// hands
	GAME.p1Hands.click(GAME.onHandClick);
	GAME.p2Hands.click(GAME.onHandClick);

	// cancel and apply
	GAME.cancelBtns.click(function() { GAME.exitSplit(false); });
	GAME.applyBtns.click(function() { GAME.exitSplit(true); });

	// up and down
	GAME.downBtns.click(function() { GAME.transferPoints(false); });
	GAME.upBtns.click(function() { GAME.transferPoints(true); });

	// reset
	GAME.resetBtn.click(GAME.resetGame)
};


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
			window.setTimeout(function() { GAME.gameOver(1); }, 500);

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
			window.setTimeout(function() { GAME.gameOver(2); }, 500);

			GAME.state = 6;
		}
		else { GAME.state = 0; }
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
GAME.gameOver = function(playerNumber) {

	// GAME.game
	// 	.html("Game Over</br>Player " + playerNumber + " Wins")
	// 	.addClass("gameOver");
	alert("Game Over\nPlayer " + playerNumber + " Wins");
};

GAME.resetGame = function () {
	console.log("reset");
	if (GAME.state > 2) {
		GAME.switchTurnIndicator();
	}
	GAME.state = 0;
	GAME.backupPoints = [null, null];
	GAME.updateHand(GAME.p1HandTop, 1, false);
	GAME.updateHand(GAME.p1HandBottom, 1, false);
	GAME.updateHand(GAME.p2HandTop, 1, false);
	GAME.updateHand(GAME.p2HandBottom, 1, false);
}


//########################
//#   createGlobalVars   #
//########################
/**
 * Creates variables in global namespace
*/
GAME.createGlobalVars = function() {

	GAME.game = $(".game");
	GAME.startBtn = $(".option.start");
	GAME.regions = $(".region");

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

	GAME.resetBtn = $(".reset-btn");
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
	if (GAME.state == 0 && playerNum == 1) {

		GAME.selectHand(caller);
		GAME.state = 1;
	}

	// ### STATE 1 ###
	else if (GAME.state == 1) {

		if (playerNum == 1 && isSelected) {

			GAME.unselectHand(caller);
			GAME.state = 0;
		}
		else if (playerNum == 1 && !isSelected) {
			if (GAME.p1HandTop.attr("points") % 2 == 1 || GAME.p1HandBottom.attr("points") % 2 == 1) {
				return;
			}
			if (GAME.p1HandTop.attr("points") != 0 && GAME.p1HandBottom.attr("points") != 0) {
				return;
			}

			GAME.selectHand(caller);
			GAME.state = 2;
			GAME.backupPoints = [
				GAME.p1HandTop.attr("points"),
				GAME.p1HandBottom.attr("points")
			];
			$(".split-btn.p1").css("display", "initial");
		}
		else if (playerNum == 2) {

			var attackingHand = GAME.p1HandTop.hasClass("selected") ?
				GAME.p1HandTop : GAME.p1HandBottom;
			var attackAmount = Number(attackingHand.attr("points"));

			if ((attackAmount != 0) && (caller.attr("points") != 0)) {

				GAME.unselectHand(attackingHand);
				GAME.attack(attackAmount, caller);
				GAME.switchTurnIndicator();
			}
		}
	}

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
};

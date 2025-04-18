# Split Game
Split is a turn-based, two-player hand game. It is a variation of the hand game [Chopsticks][chopsticks wiki], which has its roots in Japan. There's also a variation called "Splits" (plural) commonly played in India. This game — Split — might be a regional variation of Splits. When I search online, I only find the game "Splits". But in my area, we call it “Split” and the rules differs with the ones found on the internet.

## About
This is a fork of [implementation of the game Chopsticks][original repo] by [Ian S. McBride][gh ian] and [Enan Rahman][gh enan]. This is an attempt to implement Split in a way that can also be played against a bot.

## Game Rules
The game begins with one point per hand, and the game ends when one of the player loses all points on both hands — in other words, has both hands are "dead". The player with both their hands dead loses. A dead hand is indicated by a closed fist.

During a turn, a player can either **attack** or **split and attack**.
 - Attacking adds all the points from the attacking hand to the attacked hand, but leaves the attacking hand unchanged.  
 After an attack, if a hand exceeds four points, five points are subtracted from it. This is a crucial part of the game as this can make a hand dead.  
 _Example_: If one of your hands has 2 points and is attacked by a hand with 3 points, the total becomes 5. Since that’s over 4, you subtract 5, and your hand ends up with 0 points — or rather dead.

 - Splitting is only allowed if one of the hands of the current player is dead (0 points) and the other hand has 2 or 4 points.  
 It helps the player to revive their dead hand by transferring half the points of the live hand to the dead hand.  
 A hand with zero points can't be used to attack the opponent or be attacked by the opponent, but it is required for a split.

[chopsticks wiki]: https://en.wikipedia.org/wiki/Chopsticks_%28hand_game%29
[original repo]: https://github.com/ian-s-mcb/chopsticks-hand-game-js
[gh enan]: https://github.com/enan789
[gh ian]: https://github.com/ian-s-mcb
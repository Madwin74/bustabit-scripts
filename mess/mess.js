var BetStart = 1;  // 1.00000000 NXT
var betCrashIncrements = 0.08;
var betCrashStart = 2.1;
var betCrashStop = 2.1;
var SurviveCrashes = 25;
var maxBet = 5;
var failureStreak = 3;		// number of failures before going to minimal bets

var site = "nxtbubble";
// nxtbubble -- https://nxt.tothemoon.me  -- https://nxt-old.tothemoon.me
// btctothemoon  -- https://btc.tothemoon.me -- https://btc-old.tothemoon.me
// bustabit -- https://www.bustabit.com
// bustaclam -- https://bustaclam.com
// DP  -- may not be intended for public use, may still be under development
// CR  -- may not be intended for public use, may still be under development


// shouldn't need to edit anything below here
var currentBet = BetStart;
var currentCrash = betCrashStart*100;
var lostBet = 0;  // set to lost bet from previous round or 0 if new
var betMultiplier = 1;
var cashedout = false;
var UserName = engine.getUsername();
var minBet = 0;		// minimum bet variable set below for specific sites
var failureStreakCount = 0;		// number of failures in a row
//var lostBet = 10902.009998999587;  // nxtbubble lost amount since start of this script - resetting to save for now

if (site == "nxtbubble") {
	betMultiplier = 100000000;
	minBet = 0.01;
} else if (site == "bustabit") {
	betMultiplier = 100;
	minBet = 1;
} else if (site == "bustaclam") {
	betMultiplier = 100;
	minBet = 1;
} else if (site == "btctothemoon") {
	betMultiplier = 100;
	minBet = 1;
} else if (site == "DP") {
	betMultiplier = 100;
	minBet = 1;
} else if (site == "CR") {
	betMultiplier = 100;
	minBet = 1;
}

CalculateBet();

engine.on('game_starting', function(info) {
	console.log('Last game status: ', engine.lastGamePlay());
//	if (engine.lastGamePlay() == "LOST") {
	if (lostBet > 0) {
//		lostBet += currentBet;
		currentCrash += betCrashIncrements*100;
		if (currentCrash > betCrashStop*100) {
			currentCrash = betCrashStop*100;
		}

		//figure out new bet (first calculate)
		currentBet = lostBet/(currentCrash/100-1)
		if (currentBet > maxBet) {	
			currentBet = maxBet;
		}
		if (currentBet < BetStart) {
			currentBet = BetStart;
		}
		// figure out new bet (ignore calculation and go to minimum bet if on failure cooldown)
		if (failureStreakCount >= failureStreak && currentBet == maxBet) {
			currentBet = minBet;
		}
//		console.log(lostBet + " " + currentCrash + " " + currentBet);
		
		// rounding to divisible by 100 for bustabit / bustaclam
		if (site == "bustabit") {
			currentBet = Math.ceil(currentBet);
		} else if (site == "bustaclam") {
			currentBet = Math.ceil(currentBet);
		} else if (site == "btctothemoon") {
			currentBet = Math.ceil(currentBet);
		} else if (site == "DP") {
			currentBet = Math.ceil(currentBet);
		} else if (site == "CR") {
			currentBet = Math.ceil(currentBet);
		} else if (site == "nxtbubble") {
			currentBet = Math.ceil(currentBet*100)/100;  // move the decimal 2 places to round the 2 decimal up then move back
		}
		if (currentBet*betMultiplier < engine.getBalance()) {
			engine.placeBet(currentBet*betMultiplier, Math.round(currentCrash), false);
			console.log('New bet will be ' + currentBet + ' and crash point will be ' + currentCrash);
		} else {
			console.log('OUT OF COINS - STOPPING');
			engine.stop();
//			ResetValues();
//			engine.placeBet(currentBet*betMultiplier, currentCrash, false);
		}
	} else {	// last game won or starting new
//	console.log('Last Game was won or starting new :)');
		ResetValues();
		engine.placeBet(currentBet*betMultiplier, currentCrash, false);
	}
//	console.log('Game Starting in ' + info.time_till_start);
});



function CalculateBet() {
// Calculate the new bet based on defined # of crashes to survive

	var simuNewTestBet = BetStart
	
	// slowly increase the value
	if (site == "nxtbubble") {
		simuNewTestBet += 0.01;
	} else if (site == "bustabit") {
		simuNewTestBet += 1;
	} else if (site == "bustaclam") {
		simuNewTestBet += 1;
	} else if (site == "btctothemoon") {
		simuNewTestBet += 1;
	}
	
	var simuNewBet = simuNewTestBet;
	var simulostBet = 0;
	var simuCurrentCrash = betCrashStart*100;
	
	for (var loop = 0; loop < SurviveCrashes; loop++) {
		simulostBet += simuNewBet;
		simuCurrentCrash += betCrashIncrements*100;
		if (simuCurrentCrash > betCrashStop*100) {
			simuCurrentCrash = betCrashStop*100;
		}
		//figure out new bet
		simuNewBet = simulostBet/(simuCurrentCrash/100-1)
		
		// rounding to divisible by 100 for bustabit / bustaclam
		if (site == "bustabit") {
			simuNewBet = Math.floor(simuNewBet) +1;
		} else if (site == "bustaclam") {
			simuNewBet = Math.floor(simuNewBet) +1;
		} else if (site == "btctothemoon") {
			simuNewBet = Math.floor(simuNewBet) +1;
		} else if (site == "nxtbubble") {
			simuNewBet = Math.ceil(simuNewBet*100)/100;  // move the decimal 2 places to round the 2 decimal up then move back
		}
//		console.log('Loop run ' + loop );
	}
	
	if (simuNewBet*betMultiplier > engine.getBalance()) {
		//console.log('Not increasing bet: ' + simuNewBet);
	} else {
		console.log('** Increasing bet **' + simuNewBet);
		BetStart = simuNewTestBet;
	}
}

function ResetValues() {
	lostBet = 0;
	currentCrash = betCrashStart*100;  // 124 = 1.24
	currentBet = BetStart;
	CalculateBet();
}

// testing...
engine.on('game_started', function(data) {
//    console.log('Game started, showing data: ',data);
 //   console.log('Game started, showing my bet?: ',data[UserName].bet);
	if (data[UserName] != "Undefined") {
		cashedout = false;
		lostBet += data[UserName].bet / betMultiplier;
		currentBet = data[UserName].bet / betMultiplier;  // set here incase I manually place bet - want to know what was placed to calculate lostBet on cash_out
		console.log('Current amount to recover: ',lostBet);
	}
//	data[UserName].bet
});

engine.on('cashed_out', function(data) {
//     * @param {number} resp.amount - The amount the user cashed out
//     * @param {number} resp.stopped_at -The percentage at which the user cashed out
	if (data.username == UserName) {
		cashedout = true;
		console.log('Cashed out at: ',data.stopped_at);
		lostBet -= currentBet * (data.stopped_at / 100);
		console.log("DEBUG: Lost amount is now: ", lostBet);
	}

});

engine.on('game_crash', function(data) {
	if (data.game_crash < currentCrash) {
		failureStreakCount++;
	} else {
		failureStreakCount = 0;
	}
});

/*

v6:
- defined minimum bet variable for each game
- to add:  crash cooldown code to bet minimum bet during cooldown phase on failure steaks


Notes:
Calculations...
balance *0.001 rounded becomes max bet
max bet / 10 / 2 rounded down becomes base bet
should survive about 12 rounds
*/

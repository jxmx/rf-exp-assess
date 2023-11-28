//
// Copyright (C) 2021-2024 Jason D. McCormick
// Distributed under the terms of the MIT License available
// at https://raw.githubusercontent.com/jxmx/rf-exp-assess/main/LICENSE
//
//
// oet65.js - Implement the calculations of RF exposure based on FCC 
// Note all references are based on OET65 Edition 97-01
// found at https://transition.fcc.gov/Bureaus/Engineering_Technology/Documents/bulletins/oet65/oet65.pdf
//

// This script depends on the certain functions that are not implemented in older
// browsers, notably private class fields

// Some general support functions
// All load hooks
// Current time is always useful
function currentTimestamp() {
	function pad(n) { return n<10 ? '0'+n : n }
	var d = new Date();
	return d.getUTCFullYear()+'-'
		 + pad(d.getUTCMonth()+1)+'-'
		 + pad(d.getUTCDate())+' '
		 + pad(d.getUTCHours())+':'
		 + pad(d.getUTCMinutes())+':'
		 + pad(d.getUTCSeconds())+' ';
};

window.addEventListener("load", function(){
	var now = currentTimestamp();
	$("#x-timestamp").text(now + " UTC");
});

// Power Density table lookups from OET 65 Appendix A Table 1 for MPE
// For a given frequency in MHz, return the power density in mW/cm^2
function getPwrDensityControlled(f) {
	if( f < 0.3){
		console.log("getPwrDensityControlled(f): Frequency provided out of range");
		return false;		
	} else if(f < 3 ){
		return 100
	} else if(f < 30){
		return 900 / Math.pow(f,2);
	} else if(f < 300){
		return 1;
	} else if(f < 1500){
		return f / 300;
	} else if(f < 100000){
		return 5;
	} else {
		console.log("getPwrDensityControlled(f): Frequency provided out of range");
		return false;
	}
}

function getPwrDensityUncontrolled(f) {
	if( f < 0.3 ){
		console.log("getPwrDensityUncontrolled(f): Frequency provided out of range");
		return false;	   
	} else if(f < 3){
		return 100
	} else if(f < 30){
		return 180 / Math.pow(f,2);
	} else if(f < 300){
		return 0.2;
	} else if(f < 1500){
		return f / 1500;
	} else if(f < 100000){
		return 1;
	} else {
		console.log("getPwrDensityUncontrolled(f): Frequency provided out of range");
		return false;
	}
}

// Calcuate a timeaveragepercent for modifying power
function timeAvgPercent(tx, rx, interval) {
	var cycle = tx + rx;
	var remainder = interval % cycle;;
	var txcompletecycles = Math.floor( interval / cycle) * tx; // tx minutes for complete cycles

	if (tx >= interval) {
		return 1.0; // edge case tx minutes is larger than interval minutes -- so indicate that tx was on for full interval
	} else if (cycle >= interval) {
		return (tx / interval); // edge case where 1 tx+rx cycle is larger than interval
	} else if (tx > remainder) {
		return ((txcompletecycles + remainder) / interval);
	} else {
		return ((txcompletecycles + tx) / interval);
	}
};

// dBW conversions
function W2dBW(watts){
	return (10 * Math.log10(watts)).toFixed(2);
}

function dBW2W(dBW){
	return Math.pow(10, dBW / 10).toFixed(2);
}

//
// Object to store a single calculation

class OET65Calc{

	// elements related to data calculations
	#freq = null;		   		// frequency in MHz
	#power = null;		  		// power in W
	#powermw = null;			// power in mW
	#erp = null;
	#udtaeirp = null;			// Uncontrolled Duty/Time Average EIRP 
	#udtaeirpmw = null;
	#cdtaeirp = null;			// Controlled Duty/time Average EIRP
	#cdtaeirpmw = null;
	#gain = null;		   		// gain in log value
	#groundeffect = false;  	// calcluate using the ground effect
	#mod = 0.25;				// see the explanation in getMinDistanceControlled()
	#txtime = null;				// tx time on
	#rxtime = null;				// tx time off
	#dutycycle = null;			// duty cycle
	#dclabel = null;			// duty cycle label

	// elements related to display
	#radioname = null;			// radio name
	#feedtype = null;			// feedline type
	#feedlength = null;			// feedline length
	#feedloss = null;			// feedline loss
	#feedunit = null;			// feedline UOM
	#antennatype = null;		// antenna type

	// default constructor
	constructor(){}

	serialize(){
		const s = { "freq" : this.#freq ,
				"power" : this.#power ,
				"powermw" : this.#powermw ,
				"erp" : this.#erp ,
				"udtaeirp" : this.#udtaeirp,
				"cdtaeirp" : this.#cdtaeirp ,
				"gain" : this.#gain ,
				"groundeffect" : this.#groundeffect ,
				"mod" : this.#mod ,
				"txtime" : this.#txtime ,
				"rxtime" : this.#rxtime ,
				"dutycycle" : this.#dutycycle ,
				"dclabel" : this.#dclabel ,
				"radioname" : this.#radioname ,
				"feedtype" : this.#feedtype ,
				"feedlength" : this.#feedlength ,
				"feedloss" : this.#feedloss ,
				"feedunit" : this.#feedunit ,
				"antennatype" : this.#antennatype };
		return(JSON.stringify(s));
	}

	deseralize(sj){
		const s = JSON.parse(sj);
		this.#freq = s.freq;
		this.#power = s.power;
		this.#powermw = s.powermw;
		this.#erp = s.erp;
		this.#udtaeirp = s.udtaeirp;
		this.#udtaeirpmw = s.udtaeirp * 1000;
		this.#cdtaeirp = s.cdtaeirp;
		this.#cdtaeirpmw = s.cdtaeirp * 1000;
		this.#gain = s.gain;
		this.#groundeffect = s.groundeffect; 
		this.#mod = s.mod;
		this.#txtime = s.txtime;
		this.#rxtime = s.rxtime;
		this.#dutycycle = s.dutycycle;
		this.#dclabel = s.dclabel;
		this.#radioname = s.radioname;
		this.#feedtype = s.feedtype;
		this.#feedlength = s.feedlength;
		this.#feedloss = s.feedloss;
		this.#feedunit = s.feedunit;
		this.#antennatype = s.antennatype;
	}

	// Does the class hold enough data to compute a good value?
	isReady(){
		if(this.#freq && this.#gain && this.#power && this.#powermw){
   			return true;
		}
        return false;
    }

	isReadyQuick(){
		if( this.isReady() && this.#txtime && this.#rxtime ){
			return true;
		}
		return false;
	}

	isReadyGuided(){ 
		if( this.isReadyQuick() && this.#dutycycle && this.#radioname && this.#feedtype &&
			this.#feedlength && this.#feedloss && this.#antennatype ){
			return true;
		}
		return false;
	}

	// get and set freq
	setFreq(f){ this.#freq = parseFloat(f); }
	getFreq(){ return this.#freq; }

	// get and set power
	setPower(p){
		this.#power = parseFloat(p);
		this.#powermw = parseFloat(p) * 1000;
	}
	getPower(){ return this.#power; }
	getPowerMW(){ return this.#powermw; }
	setERP(p){ this.#erp = parseFloat(p); }
	getERP(){ return this.#erp; }
	setUncontrolledDTAEIRP(p){
		this.#udtaeirp = parseFloat(p);
		this.#udtaeirpmw = this.#udtaeirp * 1000;
	}
	getUncontrolledDTAEIRP(){ return this.#udtaeirp; }
	setControlledDTAEIRP(p){
		this.#cdtaeirp = parseFloat(p);
		this.#cdtaeirpmw = this.#cdtaeirp * 1000;
	}
	getControlledDTAEIRP(){ return this.#cdtaeirp; }
	setGain(dbi){ this.#gain = parseFloat(dbi); }
	getGainVal(){ return this.#gain; }
	getGainCalcDBI(){ return Math.pow(10, (parseFloat(this.#gain)/10)); }

	// turn ground effect on and off - this is more fun than sets
	groundEffectOn(){
		this.#groundeffect = true;
		this.#mod = 0.64;
	}
	groundEffectOff(){
		this.#groundeffect = false;
		this.#mod = 0.25;
	}
	getGroundEffect(){ return this.#groundeffect; }
	setGroundEffect(value){ this.#groundeffect = /^true$/i.test(value); }
	getRadioName() { return this.#radioname; }
	setRadioName(value) { this.#radioname = value; }
	getFeedType() { return this.#feedtype; }
	setFeedType(value) { this.#feedtype = value; }
	getFeedLength() { return this.#feedlength; }
	setFeedLength(value) { this.#feedlength = parseFloat(value); }
	getFeedLoss() { return this.#feedloss; }
	setFeedLoss(value) { this.#feedloss = parseFloat(value); }
	getFeedUnit() { return this.#feedunit; }
	setFeedUnit(value) { this.#feedunit = value; }
	getAntennaType() { return this.#antennatype; }
	setAntennaType(value) { this.#antennatype = value; }
	getTxTime(){ return this.#txtime; }
	setTxTime(value){ this.#txtime = parseFloat(value); }
	getRxTime(){ return this.#rxtime; }
	setRxTime(value){ this.#rxtime = parseFloat(value); }
	getDutyCycle() { return this.#dutycycle; }
	setDutyCycle(value){ this.#dutycycle = parseFloat(value); }
	getDutyCycleLabel(){ return this.#dclabel; }
	setDutyCycleLabel(value){ this.#dclabel = value; }

	// Calculation Functions

	// Return the minimum distance for controlled exposure in meters
	//
	// For the normal case, changing OET65 Function 4 to solve for R rather than S
	//	  R = Sqrt(  ( Pwr * Gain ) / ( 4 * Pi * S  ) )
	//
	// For the ground effect case, use OET65 Function 6 to solve for R with the EPA value of 1.6
	//	  R = Sqrt(  ( 1.6^2 * Pwr * Gain ) / ( 4 * Pi * S ) )
	//
	// Programagically these can collapse into a single Power * Gain modifier value
	//	  R = Sqrt(  ( Mod * Pwr * Gain) / ( Pi & S) )
	// where Mod is 0.25 in the non-ground-effect state (the 1/4 above) or 0.64 (1.6^2 / 4 above)
	//
	getMinDistanceControlled(){
		var S = getPwrDensityControlled(this.#freq);
		if(S == false){
			throw("frequency out of range");
		}
		var distCM = Math.sqrt( ( this.#mod * this.#cdtaeirpmw * this.#gain ) / ( Math.PI * S ) );
		return distCM / 100; // (cm -> m);
	}

	getMinDistanceUncontrolled(){
		var S = getPwrDensityUncontrolled(this.#freq);
		if(S == false){
			throw("frequency out of range");
		}
		var distCM = Math.sqrt( ( this.#mod * this.#udtaeirpmw * this.#gain ) / ( Math.PI * S ) );
		return distCM / 100; // (cm -> m);
	}

	getMinDistanceControlledFeet(){
		return this.getMinDistanceControlled() * 3.28084;
	}

	getMinDistanceUncontrolledFeet(){
		return this.getMinDistanceUncontrolled() * 3.28084;
	}
}

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
    document.getElementById("x-timestamp").innerText = now + " UTC";
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

    // storage variables are all private
    #freq = null;           // frequency in MHz
    #power = null;          // power in W
    #powermw = null;        // power in mW
    #gain = null;           // gain in log value
    #groundeffect = false;  // calcluate using the ground effect
    #mod = 0.25;            // see the explanation in getMinDistanceControlled()

    // default constructor
    constructor(){}

    // one-shot constructor
    //constructor(mhz, watts, gaindbi, groundeffectbool){
    //    this.setFreq(mhz);
    //    this.setPower(watts);
    //    this.setGainByDBI(gaindbi);
    //    
    //    if(groundeffectbool){
   //         this.groundEffectOn();
   //     }
   // }

    // get and set freq
    setFreq(f){
        this.#freq = parseFloat(f);
    }
    getFreq(){
        return this.#freq;
    }
    // get and set power
    setPower(p){
        this.#power = parseFloat(p);
        this.#powermw = parseFloat(p) * 1000;
    }
    getPower(){
        return this.#power;
    }
    getPowerMW(){
        return this.#powermw;
    }
    // get and set gain
    setGainByDBI(dbi){
        this.#gain = Math.pow(10, (parseFloat(dbi)/10));
    }
    setGainByDBD(dbd){
        this.#gain = Math.pow(10, ( parseFloat(dbd + 2.15) / 10));
    }
    getGainVal(){
        return this.#gain;
    }
    getGainDBI(){
        return Math.log10(this.#gain);
    }

    // turn ground effect on and off - this is more fun than sets
    groundEffectOn(){
        this.#groundeffect = true;
        this.#mod = 0.64;
    }
    groundEffectOff(){
        this.#groundeffect = false;
        this.#mod = 0.25;
    }
    getGroundEffect(){
        return this.#groundeffect;
    }

    // Calculation Functions

    // Return the minimum distance for controlled exposure in meters
    //
    // For the normal case, changing OET65 Function 4 to solve for R rather than S
    //      R = Sqrt(  ( Pwr * Gain ) / ( 4 * Pi * S  ) )
    //
    // For the ground effect case, use OET65 Function 6 to solve for R with the EPA value of 1.6
    //      R = Sqrt(  ( 1.6^2 * Pwr * Gain ) / ( 4 * Pi * S ) )
    //
    // Programagically these can collapse into a single Power * Gain modifier value
    //      R = Sqrt(  ( Mod * Pwr * Gain) / ( Pi & S) )
    // where Mod is 0.25 in the non-ground-effect state (the 1/4 above) or 0.64 (1.6^2 / 4 above)
    //
    getMinDistanceControlled(){
        var S = getPwrDensityControlled(this.#freq);
        if(S == false){
            throw("frequency out of range");
        }
       //THIS IS WRONG;
        
        console.log("mW: " + this.#powermw);
        console.log("gain: " + this.#gain);
        console.log("mod: " + this.#mod);
        var distCM = Math.sqrt( ( this.#mod * this.#powermw * this.#gain ) / ( Math.PI * S ) );
        console.log("distCM: " + distCM);
        return distCM / 100; // (cm -> m);
    }

    getMinDistanceUncontrolled(){

        var S = getPwrDensityUncontrolled(this.#freq);
        if(S == false){
            throw("frequency out of range");
        }
        var distCM = Math.sqrt( ( this.#mod * this.#powermw * this.#gain ) / ( Math.PI * S ) );
        return distCM / 100; // (cm -> m);
    }

    getMinDistanceControlledFeet(){
        return this.getMinDistanceControlled() * 3.28084;
    }

    getMinDistanceUncontrolledFeet(){
        return this.getMinDistanceUncontrolled() * 3.28084;
    }


    //
    // Does the class hold enough data to compute a good value?
    isReady(){
        if(this.#freq && this.#gain && this.#power && this.#powermw){
            return true;
        }
        return false;
    }
}
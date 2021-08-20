// Based on the GPLv1 code from Wayne Overbeck N6NB and published in the January, 1997 issue of CQ VHF, p. 33.
// Scraped out of http://www.arrl.org/rf-exposure-calculator and adjusted

function Calculate() {

    // Calculate the power at the antenna input
    var RadioW = document.getElementById("power").value;
    console.log("Radio Power: " + RadioW);
    var RadiodBW = 10 * Math.log10(RadioW);
    console.log("Radio Power dBW: " + RadiodBW);
    var FeedLen = document.getElementById("feedlength").value;
    console.log("Feedline Length: " + FeedLen);
    var FeedLenH = FeedLen / 100;
    console.log("Feedline Hundreds: " + FeedLenH);
    var FeedLossH = document.getElementById("feedloss").value;
    console.log("Feedline Loss per Hundred: " + FeedLossH);
    var FeedLoss = FeedLenH * FeedLossH;
    console.log("Feedline Loss: " + FeedLoss);
    var PowerAtAntennaDBW = RadiodBW - FeedLoss;
    console.log("Power at Antenna dbW: " + PowerAtAntennaDBW);

   
        
    //
    // user-entered values
    var watts = Math.pow(10,PowerAtAntennaDBW/10);
    console.log("Power at Antenna W: " + watts);

    var gain = document.getElementById("antennagain").value;
    console.log("Antenna Gain: " + gain);
    var freq = document.getElementById("frequency").value;
    console.log("Frequency: " + freq);
    var gndref = true;
    //
    // calculated values
    var Pwr;
    var Eirp;
    var CMaxDensity;
    var UMaxDensity;
    var Gf;
    var CMinDistance;
    var UMinDistance;
    var ModeDutyCycle;
    var TxMin;
    var RxMin;
    
    // Take ground into account as part of the calculations?
    //gndref = document.getElementById("chkGndRef").checked;
    
    // handle the mode duty cycle
    var dc = document.getElementById("dutycycle");
    ModeDutyCycle = dc.value;
    console.log("ModeDutyCycle: " + ModeDutyCycle);

    // handle the transmit mode duty cycle (transmit minutes)
    var tdct = document.getElementById("txtime");
    TxMin = parseInt(tdct.value);
    console.log("TxMin: " + TxMin);

    // handle the transmit mode duty cycle (receive minutes)
    var tdcr = document.getElementById("rxtime");
    RxMin = parseInt(tdcr.value);
    console.log("RxMin: " + RxMin);

    // calculate theoretical gain
    var TheoreticalERPDBW = PowerAtAntennaDBW + parseInt(gain);
    console.log("TheoreticalERPDBW: " + TheoreticalERPDBW);
    var TheoreticalERP = Math.pow(10,TheoreticalERPDBW/10);
    console.log("TheoreticalERP: " + TheoreticalERP);
    document.getElementById("erp").value = TheoreticalERP.toFixed(2);

    // calculate distances based on frequency
    if (freq < 1.34) {
        CMaxDensity = 100.0;
        UMaxDensity = 100.0;
     } else if (freq < 3) {
        CMaxDensity = 100.0;
        UMaxDensity = 180.0 / (Math.pow(freq, 2.0));
     } else if (freq < 30) {
        CMaxDensity = 900.0 / (Math.pow(freq, 2.0));
        UMaxDensity = 180.0 / (Math.pow(freq, 2.0));
     } else if (freq < 300.0) {
        CMaxDensity = 1.0;
        UMaxDensity = 0.2;
     } else if (freq < 1500.0) {
        CMaxDensity = freq / 300.0;
        UMaxDensity = freq / 1500.0;
     } else if (freq < 100000.0) {
        CMaxDensity = 5.0;
        UMaxDensity = 1.0;
     } else {
        alert("The FCC does not have exposure limits above 100 GHz");
        return;
     }

    console.log("CMaxDensity: " + CMaxDensity);
    console.log("UMaxDensity: " + UMaxDensity);

    // Adjust for ground
    if (gndref) {
        Gf = 0.64;
    } else {
        Gf = 0.25;
    }
    console.log("Gf:" + Gf);

    
    // compliance distance - for a controlled environment
    Pwr = 1000.0 * watts * ModeDutyCycle * TimeAvgPercent(TxMin, RxMin, 6);  // convert Power to milliwatts (over 6min period)
    console.log("Milliwats out duty + time:" + Pwr);
    Eirp = Pwr * Math.pow(10.0, gain / 10.0); // calculate EIRP in milliwatts (adjusting for antenna gain)
    console.log("Eirp: " + Eirp);
    document.getElementById("timeerp").value = ( Eirp / 1000 ).toFixed(2);
    CMinDistance = Math.sqrt((Gf * Eirp) / (CMaxDensity * Math.PI));
    CMinDistance = CMinDistance / 30.48;
    CMinDistanceMeter = CMinDistance*0.3048;
    document.getElementById("cmapd").value = CMaxDensity.toFixed(4);
    document.getElementById("cmsd").value = CMinDistance.toFixed(4);
    document.getElementById("cmsdm").value = CMinDistanceMeter.toFixed(4);

    // compliance distance - for an uncontrolled environment
    Pwr = 1000.0 * watts * ModeDutyCycle * TimeAvgPercent(TxMin, RxMin, 30);  // convert Power to milliwatts (over 30min period)
    console.log("Milliwats out duty + time:" + Pwr);
    Eirp = Pwr * Math.pow(10.0, gain / 10.0); // calculate EIRP in milliwatts (adjusting for antenna gain)
    console.log("Eirp: " + Eirp);
    UMinDistance = Math.sqrt((Gf * Eirp) / (UMaxDensity * Math.PI));
    console.log("UMinDistance: " + UMinDistance);
    UMinDistance = UMinDistance / 30.48;
    UMinDistanceMeter = UMinDistance*0.3048;
    document.getElementById("umapd").value = UMaxDensity.toFixed(4);
    document.getElementById("umsd").value = UMinDistance.toFixed(4);
    document.getElementById("umsdm").value = UMinDistanceMeter.toFixed(4);

};

function tryParseFloat(value) {
    return !isNaN(value);
};

function TimeAvgPercent(tx, rx, interval) {
    // interval is either 6min or 30min per spec in a controlled vs. uncontrolled environment respectively
    // derived variables
    var cycle = tx + rx;
    var remainder = interval % cycle;;
    var txcompletecycles = Math.floor( interval / cycle) * tx;; // tx minutes for complete cycles

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
// Form validators
// There's probably a better way do to do this....

proceedOK = false;

$('#radioname').on('input', function() {
	var input=$(this);
	var re = /^.+$/;
	var is_valid = re.test(input.val());
	if(is_valid){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#frequency').on('input', function() {
	var input=$(this);
    if(input.val() >= 0.3 && input.val() < 100000){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#power').on('input', function() {
	var input=$(this);
    if(input.val() > 0 && input.val() < 1500.1){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#feedtype').on('input', function() {
	var input=$(this);
	var re = /^.+$/;
	var is_valid = re.test(input.val());
	if(is_valid){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#feedlength').on('input', function() {
	var input=$(this);
    if(input.val() > 0 ){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#feedloss').on('input', function() {
	var input=$(this);
    if(input.val() > 0 && input.val() < 20){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#antennatype').on('input', function() {
	var input=$(this);
	var re = /^.+$/;
	var is_valid = re.test(input.val());
	if(is_valid){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#antennagain').on('input', function() {
	var input=$(this);
    if(input.val() > 0 && input.val() < 20){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#txtime').on('input', function() {
	var input=$(this);
	if(input.val() > 0 && input.val() < 30){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#rxtime').on('input', function() {
	var input=$(this);
	if(input.val() > 0 && input.val() < 30){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#dutycycle').on('input', function() {
	var input=$(this);
	var re = /^.+$/;
	var is_valid = re.test(input.val());
	if(is_valid){
		proceedOK = true;
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

// Oneshot calculator
function runOETCalc(){

    O = new OET65Calc();
    O.setFreq(parseFloat(document.getElementById("frequency").value));
    O.setGainByDBI(parseFloat(document.getElementById("antennagain").value));

    var pwrInAnt;
    var dutyCycle = parseFloat(document.getElementById("dutycycle").value);
    var timeavgmod;

	// Which form are we in? If it's the quick form, the power field is already adjusted
	// if it's the walkthrough, it's not
	if( ! document.getElementById("feedloss") ){
		pwrInAnt = document.getElementById("power").value;
		console.log("pwrInAnt: precalc: " + pwrInAnt);
		// Calculate and display the ERP
		var G = parseFloat(document.getElementById("antennagain").value);
		var P = parseFloat(W2dBW(pwrInAnt));
		var E = parseFloat(dBW2W( P + G ));
		document.getElementById("erp").value = E;
		console.log("pwrInAnt: calc: " + E);
	} else {
		var P = W2dBW(parseFloat(document.getElementById("power").value));
		var ALen = parseFloat(document.getElementById("feedlength").value);
		var ALossRate = parseFloat(document.getElementById("feedloss").value);
		var ALoss = ALossRate * ( ALen / 100);
		pwrInAnt = dBW2W( P - ALoss);
		console.log("pwrInAnt: calc: " + pwrInAnt);

		// Calculate and display the ERP
        var G = document.getElementById("antennagain").value;
        document.getElementById("erp").value = dBW2W(P - ALoss + G);
	}

	// Consider ground reflection effects
	var gre = document.getElementById("groundeffect");
	if(gre.checked){
		O.groundEffectOn();
	}

    // controlled access calculation
    timeavgmod = timeAvgPercent(
        parseFloat(document.getElementById("txtime").value),
        parseFloat(document.getElementById("rxtime").value),
        6   // see OET-65 Appendix A Table 1 averaging time
        );

    O.setPower(pwrInAnt * dutyCycle * timeavgmod);

	if( ! (O.isReady() && proceedOK )){
		// only reset the quick form
		if( ! document.getElementById("feedloss") ){
			document.getElementById("report").reset();
		}
		alert("Not all data is entered/valid");
	}
    document.getElementById("cmapd").value = getPwrDensityControlled(document.getElementById("frequency").value).toFixed(2);
    document.getElementById("cmsdm").value = O.getMinDistanceControlled().toFixed(2);
    document.getElementById("cmsdf").value = O.getMinDistanceControlledFeet().toFixed(2);
    document.getElementById("csteirpavg").value = O.getPower().toFixed(1);

    // uncontrolled access calculation
    timeavgmod = timeAvgPercent(
        parseFloat(document.getElementById("txtime").value),
        parseFloat(document.getElementById("rxtime").value),
        30   // see OET-65 Appendix A Table 1 averaging time
        );
    
    O.setPower(pwrInAnt * dutyCycle * timeavgmod);  
    document.getElementById("umapd").value = getPwrDensityUncontrolled(document.getElementById("frequency").value).toFixed(2);
    document.getElementById("umsdm").value = O.getMinDistanceUncontrolled().toFixed(2);
    document.getElementById("umsdf").value = O.getMinDistanceUncontrolledFeet().toFixed(2);
    document.getElementById("usteirpavg").value = O.getPower().toFixed(1);

	// jump back to the top of the document
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, Opera
    
}
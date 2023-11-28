//
// Copyright (C) 2021-2024 Jason D. McCormick
// Distributed under the terms of the MIT License available
// at https://raw.githubusercontent.com/jxmx/rf-exp-assess/main/LICENSE
//

// Form validators

O = new OET65Calc();

window.addEventListener("load", function(){
	if( window.localStorage.getItem("OET65")){
		O.deseralize(localStorage.getItem("OET65"));
		$('#radioname').val(O.getRadioName()).change();
		$('#frequency').val(O.getFreq()).change();
		$('#power').val(O.getPower()).change();
		$('#feedtype').val(O.getFeedType()).change();
		$('#feedlength').val(O.getFeedLength()).change();
		if( O.getFeedUnit() !== "m" ){
			$('#feedunit').val("ft").change();
			O.setFeedUnit("ft");
		}
		$('#feedunit').removeClass("is-invalid").addClass("is-valid");
		$('#feedloss').val(O.getFeedLoss()).change();
		$('#antennatype').val(O.getAntennaType()).change();
		if( O.getGainVal() ){
			$('#antennagain').val(O.getGainVal()).change();
		} else {
			O.setGain(2.2);
			$('#antennagain').val(2.2).change();
		}
		if( parseFloat(O.getTxTime()) > 0){
			$('#txtime').val(O.getTxTime()).change();
		} else {
			$('#txtime').val(0).change();
		}
		if( parseFloat(O.getRxTime()) > 0){
			$('#rxtime').val(O.getRxTime()).change();
		} else {
			$('#rxtime').val(0).change();
		}
		$('#groundeffect').prop("checked", O.getGroundEffect());
		$('#groundeffect').removeClass("is-invalid").addClass("is-valid");		
		$("#dutycycle").val(O.getDutyCycleLabel());
		if( O.getDutyCycleLabel() !== "ZZZ" ){
			$("#dutycycle").removeClass("is-invalid").addClass("is-valid");
		}
		$("#dutycyclepct").val(O.getDutyCycle() * 100).change();
	}
});

$('#radioname').on('change', function() {
	var input=$(this);
	var re = /^.+$/;
	var is_valid = re.test(input.val());
	if(is_valid){
		O.setRadioName(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setRadioName(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#frequency').on('change', function() {
	var input=$(this);
    if(input.val() >= 0.3 && input.val() < 100000){
		O.setFreq(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setFreq(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#power').on('change', function() {
	var input=$(this);
    if(input.val() > 0 && input.val() < 1500.1){
		O.setPower(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setPower(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#feedtype').on('change', function() {
	var input=$(this);
	var re = /^.+$/;
	var is_valid = re.test(input.val());
	if(is_valid){
		O.setFeedType(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setFeedType(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#feedlength').on('change', function() {
	var input=$(this);
    if(input.val() > 0 ){
		O.setFeedLength(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#feedloss').on('change', function() {
	var input=$(this);
    if(input.val() > 0 && input.val() < 20){
		O.setFeedLoss(input.val())
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		proceedOK= false;
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#antennatype').on('change', function() {
	var input=$(this);
	var re = /^.+$/;
	var is_valid = re.test(input.val());
	if(is_valid){
		O.setAntennaType(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setAntennaType(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#antennagain').on('change', function() {
	var input=$(this);
    if(input.val() > -30 && input.val() < 30){
		O.setGain(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setGain(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#txtime').on('change', function() {
	var input=$(this);
	if(input.val() > 0 && input.val() <= 30){
		O.setTxTime(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setTxTime(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#rxtime').on('change', function() {
	var input=$(this);
	if(input.val() > 0 && input.val() <= 30){
		O.setRxTime(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setRxTime(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#dutycycle').on('change', function() {
	var input=$(this);
	if(input.val() !== "ZZZ"){
		O.setDutyCycle($("#dutycycle option:selected").text());
		O.setDutyCycleLabel(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setDutyCycle(null);
		O.setDutyCycleLabel(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#dutycycle').on('change', function() {
	var input=$(this);
	if(input.val() !== "ZZZ"){
		O.setDutyCycle($("#dutycycle option:selected").text());
		O.setDutyCycleLabel(input.val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setDutyCycle(null);
		O.setDutyCycleLabel(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#feedunit').on('change', function() {
	var input=$(this);
	var re = /^.+$/;
    var is_valid = re.test(input.val());
	if(is_valid){
		O.setFeedUnit($("#feedunit option:selected").val());
		input.removeClass("is-invalid").addClass("is-valid");
	} else {
		O.setFeedUnit(null);
		input.removeClass("is-valid").addClass("is-invalid");
	}
});

$('#groundeffect').on('change', function() {
	O.setGroundEffect($('#groundeffect').prop("checked"));
	$(this).removeClass("is-invalid").addClass("is-valid");
});

// Oneshot calculator
function runOETCalc(){

    var pwrInAnt;
    var timeavgmod;

	// Which form are we in? If it's the quick form, the power field is already adjusted
	// if it's the walkthrough, it's not
	if( ! document.getElementById("feedloss") ){
		pwrInAnt = O.getPower();
		console.log("pwrInAnt: precalc: " + pwrInAnt);
		// Calculate and display the ERP
		var G = parseFloat(O.getGainCalcDBI());
		var P = parseFloat(W2dBW(O.getPower()));
		var E = parseFloat(dBW2W( P + G ));
		document.getElementById("erp").value = E;
		console.log("pwrInAnt: calc: " + E);
	} else {
		var P = parseFloat(W2dBW(O.getPower()));
		var ALen = parseFloat(O.getFeedLength());
		var ALossRate = parseFloat(O.getFeedLoss());
		var ALoss = ALossRate * ( ALen / 100);
		pwrInAnt = dBW2W( P - ALoss);
		console.log("pwrInAnt: calc: " + pwrInAnt);

		// Calculate and display the ERP
        var G = parseFloat(O.getGainCalcDBI());
        document.getElementById("erp").value = dBW2W(P - ALoss + G);
	}

	// Consider ground reflection effects
	var gre = document.getElementById("groundeffect");
	if(gre.checked){
		O.groundEffectOn();
	}

	OETReady = false;
	if( ! document.getElementById("feedloss") ) {
		OETReady = O.isReadyQuick();
	} else {
		OETReady = O.isReadyGuided();
	}

	if( ! OETReady ){
		// only reset the quick form
		if( ! document.getElementById("feedloss") ){
			document.getElementById("report").reset();
		}
		alert("Not all data is entered/valid");
		return;
	}

    // controlled access calculation
    var timeavgmod = timeAvgPercent(
        parseFloat(O.getTxTime()),
        parseFloat(O.getRxTime()),
        6   // see OET-65 Appendix A Table 1 averaging time
        );

    O.setControlledDTAEIRP(pwrInAnt * O.getDutyCycle() * timeavgmod);
    document.getElementById("cmapd").value = getPwrDensityControlled(O.getFreq()).toFixed(2);
    document.getElementById("cmsdm").value = O.getMinDistanceControlled().toFixed(2);
    document.getElementById("cmsdf").value = O.getMinDistanceControlledFeet().toFixed(2);
    document.getElementById("csteirpavg").value = O.getControlledDTAEIRP().toFixed(1);

    // uncontrolled access calculation
    timeavgmod = timeAvgPercent(
        parseFloat(O.getTxTime()),
        parseFloat(O.getRxTime()),
        30   // see OET-65 Appendix A Table 1 averaging time
        );
    O.setUncontrolledDTAEIRP(pwrInAnt * O.getDutyCycle() * timeavgmod);  
    document.getElementById("umapd").value = getPwrDensityUncontrolled(O.getFreq()).toFixed(2);
    document.getElementById("umsdm").value = O.getMinDistanceUncontrolled().toFixed(2);
    document.getElementById("umsdf").value = O.getMinDistanceUncontrolledFeet().toFixed(2);
    document.getElementById("usteirpavg").value = O.getUncontrolledDTAEIRP().toFixed(1);

	// jump back to the top of the document
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, Opera

	// save the current object
	localStorage.setItem("OET65", O.serialize());
}

function clearOETCalc(){
	localStorage.removeItem("OET65");
	$("#calculator").trigger("reset");
	$("#report").trigger("reset");
}

function goPrint(){
    localStorage.setItem("OET65", O.serialize());
    window.location = "print.html";
}


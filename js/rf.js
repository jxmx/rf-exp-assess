// All load hooks
window.addEventListener("load", function(){
    var fileName = location.href.split("/").slice(-1)[0];

    // calculate the form if we're on the display page
    if( fileName == "5.html" || fileName == "print.html"){
        runOETCalc();
    }

    // print the print page
    if( fileName == "print.html"){
        window.print();
    }
});

var postPrint = false;

window.addEventListener("beforeprint", function(){
    var fileName = location.href.split("/").slice(-1);
    if( fileName == "5.html"){
        document.getElementById("mainbody").style.display = "none";
        document.getElementById("not-printable").style.display = "contents";
    }
});

window.addEventListener("afterprint", function(){
    var fileName = location.href.split("/").slice(-1);    
    if( fileName == "5.html"){
        document.getElementById("mainbody").style.display = "contents";
        document.getElementById("not-printable").style.display = "none";
    }
    if( fileName == "print.html"){
        postPrint = true;
    }
});

window.addEventListener("focus", function(){
    var fileName = location.href.split("/").slice(-1); 

    if( fileName == "print.html" && postPrint){
        window.location = "5.html"
    }
});

// Nav intercepts to set/retrieve the cookies 
function nextClick(nextpg){
	let proceedOK = true;
	let allReportElements = $('#report').find('input, select, checkbox');
	for( let i=0; i < allReportElements.length; i++){
		if( ! $("#" + allReportElements[i].id).hasClass("is-valid") ){
			proceedOK = false;
		}
	}

	var fileName = location.href.split("/").slice(-1);
   	if( fileName == "5.html"){
		proceedOK = true;
	}

    if( proceedOK == true){
		localStorage.setItem("OET65", O.serialize());
        window.location = nextpg + ".html";
    } else {
        alert("Complete all fields to continue");
    }
    
}

function backClick(backpg){
    window.location = backpg + ".html";
}

function restartClick(){
	localStorage.removeItem("OET65");
    window.location = "index.html";
}

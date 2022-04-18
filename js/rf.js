// Deal with cookies first
function set_cookie ( name, value ) {
	var cookie_string = name + "=" + escape ( value );
	cookie_string += "; expires=0; SameSite=Strict;";
	document.cookie = cookie_string;
}

function get_cookie ( cookie_name ) {
	var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
	if ( results ) { 
	    return ( unescape ( results[2] ) ); 
	} else {
	    return null;
	};
};

function populateCookieFromForm ( cookieName ) {  
    var encodedCookie;
    var preCookieObj = '{';
    var allMainElements = $('#report').find('input, select, checkbox');
    console.log("Found elements: " + allMainElements.length);
    for (var i=0; i < allMainElements.length; i++) 
	{
        
        if( allMainElements[i].type == "checkbox"){
            console.log("Cookie Element: " + allMainElements[i].name + ":" + allMainElements[i].checked)
            preCookieObj = preCookieObj + '"' + allMainElements[i].name +'":"'+ allMainElements[i].checked +'",';
        } else {
            console.log("Cookie Element: " + allMainElements[i].name + ":" + allMainElements[i].value)
	        preCookieObj = preCookieObj + '"' + allMainElements[i].name +'":"'+ allMainElements[i].value +'",';     
        }
	};

    preCookieObj = preCookieObj.substring(0, preCookieObj.length - 1);
    preCookieObj = preCookieObj + '}';

    //<!-- btoa() encodes 'string' argument into Base64 encoding --> 
    encodedCookie = btoa( preCookieObj );
    set_cookie(cookieName, encodedCookie);
};

function populateFormFromCookie (cookieName) {
    if ( ! get_cookie ( cookieName ) )
	{
		//<!-- Do Nothing - No Cookie For this form set. -->
	} else {
	    //<!-- atob() decodes 'string' argument from Base64 encoding --> 
	    jSONCookieObj = atob( get_cookie ( cookieName ) ) ;     
	    jSONObj = JSON.parse( jSONCookieObj );2
	    var allMainElements = $('#report').find('input, select');

	    for (var i=0; i < allMainElements.length; i++)  {
			var elementName = allMainElements[i].name;
            var elementValue = jSONObj[elementName];
               
            if( elementValue === undefined){
                allMainElements[i].value = "";  
            } else {
                if( allMainElements[i].type == "checkbox" ){
                    if( elementValue == "true" ){
                        allMainElements[i].checked = true;
                    } else {
                        allMainElements[i].checked = false;
                    } 
                } else {
                    allMainElements[i].value = elementValue;
                }      
            }	
	    }
	}
}

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

// All load hooks
window.addEventListener("load", function(){
    populateFormFromCookie("RFExposure");
    proceedOK = true;
    var fileName = location.href.split("/").slice(-1);

    // calculate the form if we're on the display page
    if( fileName == "5.html" || fileName == "print.html"){
        var now = currentTimestamp();
        document.getElementById("x-timestamp").innerText = now + " UTC";
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
    if( proceedOK == true){
        populateCookieFromForm("RFExposure");
        window.location = nextpg + ".html";
    } else {
        alert("Fix form errors");
    }
    
}
function backClick(backpg){
    populateCookieFromForm("RFExposure");
    window.location = backpg + ".html";
}
function restartClick(backpg){
    set_cookie("RFExposure", "");
    window.location = backpg + ".html";
}
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
    var allMainElements = $('#report').find('input, select');
    console.log("Found elements: " + allMainElements.length);
    for (var i=0; i < allMainElements.length; i++) 
	{
        console.log("Cookie Element: " + allMainElements[i].name + ":" + allMainElements[i].value)
	    preCookieObj = preCookieObj + '"' + allMainElements[i].name +'":"'+ allMainElements[i].value +'",';     
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
	    jSONObj = JSON.parse( jSONCookieObj );
	    var allMainElements = $('#report').find('input, select');

	    for (var i=0; i < allMainElements.length; i++)  {
			var elementName = allMainElements[i].name;
			var elementValue = jSONObj[elementName];
            if( elementValue === undefined){
                allMainElements[i].value = "";  
            } else {
                allMainElements[i].value = elementValue;
            };
	    };
	};
};

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
    if( fileName == "5.html"){
        Calculate();
        var now = currentTimestamp();
        document.getElementById("x-timestamp").innerText = now + " UTC";
    }
});
 
function nextClick(nextpg){
    if( proceedOK == true){
        populateCookieFromForm("RFExposure");
        window.location = nextpg + ".html";
    } else {
        alert("Fix form errors");
    }
    
}

function backClick(backpg){
    window.location = backpg + ".html";
}

function restartClick(backpg){
    set_cookie("RFExposure", "");
    window.location = backpg + ".html";
}
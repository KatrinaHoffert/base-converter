$('#floatShowMe').bind("click", function(){
	// Only perform show me if field is valid
	if(/^-?[01]+\.?[01]*$/.test($('#bin').val()))
	{
		alert("Float show me");
	}
	else
	{
		blinkField('#floatSign, #floatExponent, #floatFraction');
	}
});

$('#doubleShowMe').bind("click", function(){
	if(/^-?[01]+\.?[01]*$/.test($('#bin').val()))
	{
		alert("Double show me");
	}
	else
	{
		blinkField('#doubleSign, #doubleExponent, #doubleFraction');
	}
});
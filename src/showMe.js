/**
 * Utility function for converting the binary fractional component into decimal. Assumes
 * that the input is in the form x.xxxx...
 */
function binaryFractionToDecimal(binary)
{
	var decimal = 0;

	if(binary.charAt(0) == '1')
	{
		decimal += 1;
	}

	for(var i = 2; i < binary.length; i++)
	{
		decimal += binary.charAt(i) * Math.pow(2, -i + 1);
	}

	return decimal;
}


/**
 * Creates the show me panel for demonstrating how the floating point representation.
 */
function baseShowMe(field, base, name)
{
	// Create the cover and popup as hidden, then fade it in
	jQuery('<div/>', {
		id: 'showMeCover',
		style: 'display: none;',
	}).appendTo('body');

	jQuery('<div/>', {
		id: 'showMePopup',
		style: 'display: none;',
	}).appendTo('#showMeCover');
	$('#showMeCover, #showMePopup').fadeIn(500);

	// Header
	$('#showMePopup').append('<span id="showMeClose">X</span><h2>Show me: ' + name + '</h2>');

	// Display base and value
	$('#showMePopup').append('<p><b>Base:</b> ' + String(base) + '</p>');
	$('#showMePopup').append('<p><b>Value:</b> <span class="binaryText">' + $(field).val() + '</span></p>');

	// TODO: Implement intro paragraph summarizing the base and its uses
	// Implement conversion to decimal
	// Implement conversion from decimal

	// Close when the background or close button is clicked
	$('#showMeCover, #showMeClose').on('click', function(e){
		// Only get clicks to the cover, not the popup
		if(e.target !== this)
		{
			return;
		}

		// Fade the show me out and then remove it
		$('#showMeCover, #showMePopup').fadeOut(500, function(){
			$('#showMeCover, #showMePopup').remove();
		});
	});
}


/**
 * Creates the show me panel for demonstrating how the floating point representation.
 */
function floatShowMe(signField, exponentField, fractionField, exponentBits, fractionBits, bias)
{
	// Create the cover and popup as hidden, then fade it in
	jQuery('<div/>', {
		id: 'showMeCover',
		style: 'display: none;',
	}).appendTo('body');

	jQuery('<div/>', {
		id: 'showMePopup',
		style: 'display: none;',
	}).appendTo('#showMeCover');
	$('#showMeCover, #showMePopup').fadeIn(500);

	// Header
	$('#showMePopup').append('<span id="showMeClose">X</span><h2>Show me: IEEE 754 floating point conversion</h2>');

	// Special case: Infinity
	if(/^1+$/.test($(exponentField).val()) && /^0+$/.test($(fractionField).val()))
	{
		$('#showMePopup').append('<p>The exponent field is as large as possible (all ones) while the fraction field is as small as possible (all zeros). This is the special case for infinity.</p>');
		if($(signField).val() == '1')
		{
			$('#showMePopup').append('<p>Since the sign bit is <span class="binaryText">1</span>, this becomes negative infinity.</p>');
		}
	}
	// Special case: NaN
	else if(/^1+$/.test($(exponentField).val()))
	{
		$('#showMePopup').append('<p>The exponent field is as large as possible (all ones) while the fraction field is <b>not</b> as small as possible (all zeros). This is the special case for NaN (not a number). This is generally used to signal errors, such as division by zero or trying to do arithmetic on something that isn\'t a number. The sign bit is generally ignored. Sometimes the value of the fraction is used as a "signal" to tell the program exactly why the value is NaN.</p>');
	}
	// Special case: zero
	else if(/^0+$/.test($(exponentField).val()) && /^0+$/.test($(fractionField).val()))
	{
		$('#showMePopup').append('<p>The exponent and fraction fields are all zero, which make up the special case for zero.</p>');
		if($(signField).val() == '1')
		{
			$('#showMePopup').append('<p>Since the sign bit is <span class="binaryText">1</span>, this becomes negative zero. The IEEE 754 specification has two values for zero, positive and negative zero. It is up to software to separate these (they\'re usually treated as equal).</p>');
		}
	}
	else
	{
		// Sign bit
		var negative;
		if($(signField).val() == '1')
		{
			negative = true;
			$('#showMePopup').append('<p><b>Sign bit:</b> <span class="binaryText">' + $(signField).val() + '</span> = Negative</p>');
		}
		else
		{
			negative = false;
			$('#showMePopup').append('<p><b>Sign bit:</b> <span class="binaryText">' + $(signField).val() + '</span> = Positive</p>');
		}

		// Exponent
		var exponent = binaryToDecimal($(exponentField).val()) - bias;
		// Not a subnormal
		if(!/^0+$/.test($(exponentField).val()))
		{
			$('#showMePopup').append('<p><b>Exponent:</b> <span class="binaryText">' + $(exponentField).val() + '</span> = ' + String(binaryToDecimal($(exponentField).val())) + '; subtract the bias (' + bias + ') to get ' + String(exponent) + '</p>');
		}
		else
		{
			$('#showMePopup').append('<p><b>Exponent:</b> <span class="binaryText">' + $(exponentField).val() + '</span> = ' + String(binaryToDecimal($(exponentField).val())) + '; This is the special case of a subnormal (exponent of zero and non-zero fraction)</p>');
		}

		// Fraction
		var binaryFraction = '';
		if(/^0+$/.test($(exponentField).val()))
		{
			// Subnormal
			binaryFraction = '0.' + $(fractionField).val();
			exponent = -bias + 1;
			$('#showMePopup').append('<p><b>Fraction:</b> <span class="binaryText">' + $(fractionField).val() + '</span>; this is a subnormal, so no leading <span class="binaryText">1</span> is added, leaving us with <span class="binaryText">' + binaryFraction + '</span></p><p>In addition, subnormals always have an exponent of ' + String(exponent) + '. This is because normally the smallest possible exponent is 2<sup>' + String(exponent) + '</sup>. In such a case, however, there is always a leading one. Since subnormals do not have a leading one, the exponent remains at ' + String(exponent) + ' and we get smaller numbers by inserting more zeroes after the decimal. This lets us go beyond the ' + String(exponentBits) + ' bits offered by the exponent field.</p>');
		}
		else
		{
			// Normal
			binaryFraction = '1.' + $(fractionField).val();
			$('#showMePopup').append('<p><b>Fraction:</b> <span class="binaryText">' + $(fractionField).val() + '</span>; add the implied leading <span class="binaryText">1</span> to get <span class="binaryText">' + binaryFraction + '</span></p>');
		}

		// Put it all together
		var fractionDecimal = String(binaryFractionToDecimal(binaryFraction));
		$('#showMePopup').append('<p>In decimal, the fraction component is ' + fractionDecimal + '.</p>');
		if(negative)
		{
			var actualValue = -1 * fractionDecimal * Math.pow(2, exponent);
			var equalsSign = '&asymp; ';
			if(actualValue == parseFloat($('#dec').val()))
			{
				equalsSign = '= ';
			}
			$('#showMePopup').append('<p>Since the sign bit is negtative, this number will also be negative, causing us to end up with -1 &times; ' + fractionDecimal + ' &times; 2<sup>' + exponent + '</sup> ' + equalsSign + actualValue + '.</p>');
		}
		else
		{
			var actualValue = fractionDecimal * Math.pow(2, exponent);
			var equalsSign = '&asymp; ';
			if(actualValue == parseFloat($('#dec').val()))
			{
				equalsSign = '= ';
			}
			$('#showMePopup').append('<p>This causes us to end up with ' + fractionDecimal + ' &times; 2<sup>' + exponent + '</sup> ' + equalsSign + actualValue + '.</p>');
		}
	}

	// Close when the background or close button is clicked
	$('#showMeCover, #showMeClose').on('click', function(e){
		// Only get clicks to the cover, not the popup
		if(e.target !== this)
		{
			return;
		}

		// Fade the show me out and then remove it
		$('#showMeCover, #showMePopup').fadeOut(500, function(){
			$('#showMeCover, #showMePopup').remove();
		});
	});
}

$('#floatShowMe').bind("click", function(){
	// Only perform show me if field is valid
	if(/^-?([01]+\.?[01]*|infinity|nan)$/i.test($('#bin').val()))
	{
		floatShowMe('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
	}
	else
	{
		blinkField('#floatSign, #floatExponent, #floatFraction');
	}
});

$('#doubleShowMe').bind("click", function(){
	if(/^-?([01]+\.?[01]*|infinity|nan)$/i.test($('#bin').val()))
	{
		floatShowMe('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
	}
	else
	{
		blinkField('#doubleSign, #doubleExponent, #doubleFraction');
	}
});

$('#binShowMe').bind("click", function(){
	if(/^-?[01]+\.?[01]*$/i.test($('#bin').val()))
	{
		baseShowMe('#bin', 2, 'Binary');
	}
	else
	{
		blinkField('#bin');
	}
});

$('#octShowMe').bind("click", function(){
	if(/^-?[0-7]+\.?[0-7]*$/i.test($('#bin').val()))
	{
		baseShowMe('#oct', 8, 'Octal');
	}
	else
	{
		blinkField('#oct');
	}
});

$('#duoShowMe').bind("click", function(){
	if(/^-?[0-9ABab]+\.?[0-9ABab]*$/i.test($('#duo').val()))
	{
		baseShowMe('#duo', 12, 'Duodecimal');
	}
	else
	{
		blinkField('#duo');
	}
});

$('#hexShowMe').bind("click", function(){
	if(/^-?[0-9A-Fa-f]+\.?[0-9A-Fa-f]*$/i.test($('#hex').val()))
	{
		baseShowMe('#hex', 16, 'Hexadecimal');
	}
	else
	{
		blinkField('#hex');
	}
});

$('#b64ShowMe').bind("click", function(){
	if(/^-?[0-9A-Za-z\+\/]+\.?[0-9A-Za-z\+\/]*$/i.test($('#b64').val()))
	{
		baseShowMe('#b64', 64, 'Base 64');
	}
	else
	{
		blinkField('#b64');
	}
});
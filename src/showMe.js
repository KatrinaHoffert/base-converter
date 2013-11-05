function floatShowMe(signField, exponentField, fractionField, exponentBits, fractionBits, bias)
{
	// Create the cover and popup
	jQuery('<div/>', {
		id: 'floatShowMeCover',
	}).appendTo('body');

	jQuery('<div/>', {
		id: 'floatShowMePopup',
	}).appendTo('#floatShowMeCover');

	// Header
	$('#floatShowMePopup').append('<span id="floatShowMeClose">X</span><h2>Show me: IEEE 754 floating point conversion</h2>');

	// Special case: Infinity
	if(/^1+$/.test($(exponentField).val()) && /^0+$/.test($(fractionField).val()))
	{
		$('#floatShowMePopup').append('<p>The exponent field is as large as possible (all ones) while the fraction field is as small as possible (all zeros). This is the special case for infinity.</p>');
		if($(signField).val() == '1')
		{
			$('#floatShowMePopup').append('<p>Since the sign bit is <span class="binaryText">1</span>, this becomes negative infinity.</p>');
		}
	}
	// Special case: NaN
	else if(/^1+$/.test($(exponentField).val()))
	{
		$('#floatShowMePopup').append('<p>The exponent field is as large as possible (all ones) while the fraction field is <b>not</b> as small as possible (all zeros). This is the special case for NaN (not a number). This is generally used to signal errors, such as division by zero or trying to do arithmetic on something that isn\'t a number. The sign bit is generally ignored. Sometimes the value of the fraction is used as a "signal" to tell the program exactly why the value is NaN.</p>');
	}
	// Special case: zero
	else if(/^0+$/.test($(exponentField).val()) && /^0+$/.test($(fractionField).val()))
	{
		$('#floatShowMePopup').append('<p>The exponent and fraction fields are all zero, which make up the special case for zero.</p>');
		if($(signField).val() == '1')
		{
			$('#floatShowMePopup').append('<p>Since the sign bit is <span class="binaryText">1</span>, this becomes negative zero. The IEEE 754 specification has two values for zero, positive and negative zero. It is up to software to separate these (they\'re usually treated as equal).</p>');
		}
	}
	else
	{
		// Sign bit
		var negative;
		if($(signField).val() == '1')
		{
			negative = true;
			$('#floatShowMePopup').append('<p><b>Sign bit:</b> <span class="binaryText">' + $(signField).val() + '</span> = Negative</p>');
		}
		else
		{
			negative = false;
			$('#floatShowMePopup').append('<p><b>Sign bit:</b> <span class="binaryText">' + $(signField).val() + '</span> = Positive</p>');
		}

		// Exponent
		var exponent = binaryToDecimal($(exponentField).val()) - bias;
		$('#floatShowMePopup').append('<p><b>Exponent:</b> <span class="binaryText">' + $(exponentField).val() + '</span> = ' + String(binaryToDecimal($(exponentField).val())) + '; subtract the bias (' + bias + ') to get ' + String(exponent) + '</p>');

		// Fraction
		var binaryFraction = '';
		if(/^0+$/.test($(exponentField).val()))
		{
			// Subnormal
			binaryFraction = '0.' + $(fractionField).val();
			$('#floatShowMePopup').append('<p><b>Fraction:</b> <span class="binaryText">' + $(fractionField).val() + '</span>; this is a subnormal, so no leading <span class="binaryText">1</span> is added, leaving us with <span class="binaryText">' + binaryFraction + '</span></p>');
		}
		else
		{
			// Normal
			binaryFraction = '1.' + $(fractionField).val();
			$('#floatShowMePopup').append('<p><b>Fraction:</b> <span class="binaryText">' + $(fractionField).val() + '</span>; add the implied leading <span class="binaryText">1</span> to get <span class="binaryText">' + binaryFraction + '</span></p>');
		}

		// TODO: Create converter for fraction component
		// Put it all together
		var fractionDecimal = 'xxx';
		$('#floatShowMePopup').append('<p>In decimal, the fraction component is ' + fractionDecimal + '.</p>');
		if(negative)
		{
			$('#floatShowMePopup').append('<p>Since the sign bit is negtative, this number will also be negative, causing us to end up with -1 &times; ' + fractionDecimal + ' &times; 2<sup>' + exponent + '</sup> = ' + $('#dec').val() + '.</p>');
		}
		else
		{
			$('#floatShowMePopup').append('<p>This causes us to end up with ' + fractionDecimal + ' &times; 2<sup>' + exponent + '</sup> = ' + $('#dec').val() + '.</p>');
		}
	}

	// Close when the background or close button is clicked
	$('#floatShowMeCover, #floatShowMeClose').on('click', function(e){
		// Only get clicks to the cover, not the popup
		if(e.target !== this)
		{
			return;
		}

		$('#floatShowMeCover').remove();
		$('#floatShowMePopup').remove();
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
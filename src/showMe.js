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
 * Converts the value in the decimal field into the specified base, showing the steps.
 */
function decimalToBaseShowMe(base)
{
	var integerPortion = Math.floor(Math.abs(parseFloat($('#dec').val())));
	var fractionPortion = Math.abs(parseFloat($('#dec').val()) % 1);

	$('#showMePopup').append('<p>Integer portion of the decimal is: ' + String(integerPortion) + '</p>');

	var integerBased = '';
	if(integerPortion !== 0)
	{
		// Create the table code
		var tableCode = '<table class="decimalToBaseTable">';

		// Creates rows in the form of [intPortion] / [base] = [result] [remainder]
		while(integerPortion !== 0)
		{
			var remainder = integerPortion % base;

			tableCode += '<tr><td>';
			tableCode += String(integerPortion);
			tableCode += '</td><td> / ';
			tableCode += String(base);
			tableCode += '</td><td> = ';

			integerPortion = Math.floor(integerPortion / base);

			tableCode += String(integerPortion);
			tableCode += '</td><td> remainder = ';
			tableCode += remainder;
			tableCode += '</td></tr>';

			// Add it to our string
			if(remainder < 10 && base != 64)
			{
				// Regular numbers
				integerBased = String(remainder) + integerBased;
			}
			else if(base != 64)
			{
				// Duo's A-B and hex's A-F
				integerBased = String.fromCharCode(remainder + 55) + integerBased;
			}
			else
			{
				// B64's mess
				if(remainder < 26)
				{
					integerBased = String.fromCharCode(remainder + 65) + integerBased;
				}
				else if(remainder < 52)
				{
					integerBased = String.fromCharCode(remainder + 97 - 26) + integerBased;
				}
				else if(remainder < 62)
				{
					integerBased = String(remainder - 52) + integerBased;
				}
				else if(remainder == 62)
				{
					integerBased = '+' + integerBased;
				}
				else if(remainder == 63)
				{
					integerBased = '/' + integerBased;
				}
			}
		}

		tableCode += '</table>';

		$('#showMePopup').append(tableCode);

		if(base < 10)
		{
			$('#showMePopup').append('<p>Now we read the remainders from bottom to top to get <span class="binaryText">' + integerBased + '</span></p>');
		}
		else if(base <= 16)
		{
			$('#showMePopup').append('<p>Now we read the remainders from bottom to top, replacing numbers greater than 9 with letters (so 10 = A, 11 = B, etc), to get <span class="binaryText">' + integerBased + '</span></p>');
		}
		else
		{
			$('#showMePopup').append('<p>Now we read the remainders from bottom to top, replacing all numbers with the characters in <a href="https://en.wikipedia.org/wiki/Base64#Base64table">this table</a>, to get <span class="binaryText">' + integerBased + '</span></p>');
		}
	}

	$('#showMePopup').append('<p title="This can be slightly inaccurate because numbers are represented in binary internally, and cannot be represented perfectly.">Fraction portion of the decimal is: ' + String(fractionPortion) + '</p>');

	var fractionBased = '';
	if(fractionPortion !== 0)
	{
		// Create the table code
		var tableCodeFrac = '<table class="decimalToBaseTable">';

		// Creates rows in the form of [fracPortion] * [base] = [result] [fraction]
		while(fractionPortion % 1 !== 0)
		{
			var fractionRemainder = Math.floor(fractionPortion * base);

			tableCodeFrac += '<tr><td>';
			tableCodeFrac += String(fractionPortion);
			tableCodeFrac += '</td><td> &times; ';
			tableCodeFrac += String(base);
			tableCodeFrac += '</td><td> = ';

			fractionPortion *= base;

			tableCodeFrac += String(fractionPortion);
			tableCodeFrac += '</td><td> whole component =  ';
			tableCodeFrac += fractionRemainder;
			tableCodeFrac += '</td></tr>';
			fractionPortion -= fractionRemainder;

			// Add it to our string
			if(fractionRemainder < 10 && base != 64)
			{
				// Regular numbers
				fractionBased += String(fractionRemainder);
			}
			else if(base != 64)
			{
				// Duo's A-B and hex's A-F
				fractionBased += String.fromCharCode(fractionRemainder + 55);
			}
			else
			{
				// B64's mess
				if(fractionRemainder < 26)
				{
					fractionBased += String.fromCharCode(fractionRemainder + 65);
				}
				else if(fractionRemainder < 52)
				{
					fractionBased += String.fromCharCode(fractionRemainder + 97 - 26);
				}
				else if(fractionRemainder < 62)
				{
					fractionBased += String(fractionRemainder - 52);
				}
				else if(fractionRemainder == 62)
				{
					fractionBased += '+';
				}
				else if(fractionRemainder == 63)
				{
					fractionBased += '/';
				}
			}
		}

		tableCodeFrac += '</table>';

		$('#showMePopup').append(tableCodeFrac);

		if(base < 10)
		{
			$('#showMePopup').append('<p>Now we read the remainders from top to bottom to get <span class="binaryText">' + fractionBased + '</span></p>');
		}
		else if(base <= 16)
		{
			$('#showMePopup').append('<p>Now we read the remainders from top to bottom, replacing numbers greater than 9 with letters (so 10 = A, 11 = B, etc), to get <span class="binaryText">' + fractionBased + '</span></p>');
		}
		else
		{
			$('#showMePopup').append('<p>Now we read the remainders from top to bottom, replacing all numbers with the characters in <a href="https://en.wikipedia.org/wiki/Base64#Base64table">this table</a>, to get <span class="binaryText">' + fractionBased + '</span></p>');
		}
	}

	// Put it all together
	if(integerBased === '')
	{
		integerBased = '0';
	}
	if(fractionBased === '')
	{
		fractionBased = '0';
	}

	$('#showMePopup').append('<p>Putting the integer and fraction portion together, we get <span class="binaryText">' + integerBased + '.' + fractionBased + '</span></p>');
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

	// Descriptions
	$('#showMePopup').append('<h3>Description</h3>');
	if(base == 2)
	{
		$('#showMePopup').append('<p>Binary is a simple numeric representation frequently used by machines because it can be easily expressed in terms of voltage: high voltage is a 1 and low voltage is a 0.</p>');
	}
	else if(base == 8)
	{
		$('#showMePopup').append('<p>Octal was useful when the word size was divisible by three (a word in a processor is the natural unit for data, measured in bits), since a single octal number represents three bits (since 2<sup>3</sup> = 8). However, most modern processors use 32 or 64 bit words, so octal has fallen out of use.</p>');
	}
	else if(base == 12)
	{
		$('#showMePopup').append('<p>While duodecimal isn\'t a common base in computer science, it has uses in mathematics, since 12 is divisible by 2, 3, 4, and 6 (compared to decimal, which is divisible only by 2 and 5). An advantage, for example, is that decimal numbers like 1/3 can be easily represented with terminating digits (1/3 in duodecimal = 0.4).</p>');
	}
	else if(base == 16)
	{
		$('#showMePopup').append('<p>Hexadecimal is a convenient base for concise representation of numbers that would be much longer in other bases. Thus, we can use it to represent binary numbers in a much more readable fashion. Hexadecimal has largely replaced octal in usefulness, since many modern processors have a word size that is a multiple of four (a word in a processor is the natural unit for data, measured in bits).</p>');
		$('#showMePopup').append('<p>Hexadecimal is also used to represent colour codes in HTML, since colours are usually represented with 8 bits of red, green, and blue respectively, which means you can represent each colour with 2 hexadecimal digits. A 24 bit colour (8 bits of each red, blue, and green) can be represented by six hexadecimal digits.</p>');
	}
	else if(base == 64)
	{
		$('#showMePopup').append('<p>Base64 is not generally used to represent numeric data, but rather to encode text or binary data. This is convenient because the encoding will use a set of characters (so we are guarenteed there won\'t be spaces in the encoding, for example). This would make it easy to figure out where text ends.</p>');
		$('#showMePopup').append('<p>Another use of base64 is storage of binary data as text. This can allow us to insert binary data into source code. An example would be inserting images directly into CSS (which defines the style of a website). Try <a href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAb4AAAGgCAMAAADij/IwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQCU/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAETjN/IAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAAMtJREFUeF7twQENAAAAwqD3T20ONyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBrNdZ+AAEdlnwUAAAAAElFTkSuQmCC">this link for example</a>. Note the URL. That\'s an entire image encoded in base64. The browser will then decode that back into raw numbers (which is all binary is, really) and read that in as a PNG image.</p>');
	}

	// From decimal
	$('#showMePopup').append('<h3>From decimal</h3>');
	decimalToBaseShowMe(base);

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
		var actualValue = '';
		var equalsSign = '';
		if(negative)
		{
			actualValue = -1 * fractionDecimal * Math.pow(2, exponent);
			equalsSign = '&asymp; ';
			if(actualValue == parseFloat($('#dec').val()))
			{
				equalsSign = '= ';
			}
			$('#showMePopup').append('<p>Since the sign bit is negtative, this number will also be negative, causing us to end up with -1 &times; ' + fractionDecimal + ' &times; 2<sup>' + exponent + '</sup> ' + equalsSign + actualValue + '.</p>');
		}
		else
		{
			actualValue = fractionDecimal * Math.pow(2, exponent);
			equalsSign = '&asymp; ';
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
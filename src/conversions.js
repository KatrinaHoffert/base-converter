/*
	Base converter: Convert between bases and floating point representations
	Copyright (C) 2013 Mike Hoffert

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

	----------------------------------------------------------------------

	A note for those reading this code in hopes of understanding the
	how to perform the conversions manually: don't. The code contains much
	error handling for dumb things the user can do and attempts to handle
	all the possible actions.

	The methods of converting numbers for a program are also much more
	complicated than with a human. For example, humans can easily understand
	that leading zeroes in a binary number should be ignored, whereas the
	program must be explicitely told to remove those.
*/

// For keeping track of if a field is currently blinking (invalid input)
var blinking = {
	'#dec': false,
	'#bin': false,
	'#oct': false,
	'#duo': false,
	'#hex': false,
	'#b64': false,
};

/**
 * Blanks the fields (for invalid input).
 */
function blankFields(fields)
{
	$(fields).val('');
}

/**
 * Causes the input field to blink. Necessary to keep track of whether a field
 * is currently blinking, otherwise we can end up chaining up a number of fade
 * events, causing the field to blink for an extended period of time.
 */
function blinkField(field)
{
	if(!blinking[field])
	{
		blinking[field] = true;
		$(field).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100, function(){
			blinking[field] = false;
		});
	}
}


/**
 * Simple utility function for converting positive integers into binary.
 */
function decimalToBinary(decimal)
{
	var binary = '';

	do
	{
		binary = String(decimal % 2) + binary;
		decimal = Math.floor(decimal / 2);
	}
	while(decimal > 0);

	return binary;
}


/**
 * Utility function to ensure output is in fixed decimal form instead
 * of scientific notation.
 * Written by outis: http://stackoverflow.com/a/1685917/1968462
 * TODO: Contemplate if this is still needed
 */
function toFixed(x)
{
	if(Math.abs(x) < 1.0)
	{
		var e = parseInt(x.toString().split('e-')[1]);
		if(e)
		{
			x *= Math.pow(10,e-1);
			x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
		}
	}
	else
	{
		var e = parseInt(x.toString().split('+')[1]);
		if(e > 20)
		{
			e -= 20;
			x /= Math.pow(10, e);
			x += (new Array(e + 1)).join('0');
		}
	}
	return x;
}


/**
 * Simply utility class for converting unsigned binary to integers.
 */
function binaryToDecimal(binary)
{
	var decimal = 0;

	for(var i = binary.length - 1; i >= 0; i--)
	{
		decimal += parseInt(binary.charAt(i)) * Math.pow(2, binary.length - i - 1);
	}

	return decimal;
}


/**
  * Converts the decimal number to the specified base and places
  * it in the specified field.
  */
function fromDecimal(base, field)
{
	// Special case for infinity and NaN
	if($('#dec').val().toLowerCase() == "infinity")
	{
		$(field).val("Infinity");
		return;
	}
	else if($('#dec').val().toLowerCase() == "-infinity")
	{
		$(field).val("-Infinity");
		return;
	}
	else if($('#dec').val().toLowerCase() == "nan")
	{
		$(field).val("NaN");
		return;
	}

	// Get the integer portion (note that Math.floor() works best on
	// positives)
	var decimal = Math.floor(Math.abs(parseFloat($('#dec').val())));
	var number = '';
	var negative = false;

	// Catch when number starts with decimal and no number
	if($('#dec').val().charAt(0) == '.')
	{
		$('#dec').val('0' + $('#dec').val());
	}

	// Sole case is when the input is just a negative sign without
	// the rest of the number (presumably the user is still typing)
	if(isNaN(decimal))
	{
		return;
	}

	// Math.floor() fucks up negatives. Also, extra check for that
	// elusive "negative zero" (since we are treating the integer and
	// fractional parts separately)
	if(parseFloat($('#dec').val()) < 0 || $('#dec').val().charAt(0) == '-')
	{
		negative = true;
	}

	do
	{
		// Prepend remainder
		var current = decimal % base;

		// Conversions for non-base 64
		if(base != 64)
		{
			if(current < 10)
			{
				number = String(current) + number;
			}
			else if($('#optionLowercase').is(':checked'))
			{
				number = String.fromCharCode(current + 87) + number;
			}
			else
			{
				number = String.fromCharCode(current + 55) + number;
			}
		}
		// Conversion for base 64
		else
		{
			if(current < 26)
			{
				number = String.fromCharCode(current + 65) + number;
			}
			else if(current < 52)
			{
				number = String.fromCharCode(current + 97 - 26) + number;
			}
			else if(current < 62)
			{
				number = String(current - 52) + number;
			}
			else if(current == 62)
			{
				number = '+' + number;
			}
			else if(current == 63)
			{
				number = '/' + number;
			}
		}
		// Perform integer division (note: can't use bitwise
		// operations as they operate on 32 bit numbers only)
		decimal = Math.floor(decimal / base);
	}
	while(decimal > 0);

	// Fraction portion
	var fractionPortion = Math.abs(parseFloat($('#dec').val()) % 1);
	var digits = 0;

	// Calculate the fractional portion up till we're either done or
	// we reached the maximum digits
	if(fractionPortion != 0)
	{
		number += '.';

		do
		{
			fractionPortion *= base;

			// All but base 64
			if(base != 64)
			{
				if(Math.floor(fractionPortion) < 10)
				{
					number += String(Math.floor(fractionPortion));
				}
				else if($('#optionLowercase').is(':checked'))
				{
					number += String.fromCharCode(Math.floor(fractionPortion) + 87);
				}
				else
				{
					number += String.fromCharCode(Math.floor(fractionPortion) + 55);
				}
			}
			// Base 64
			else
			{
				if(Math.floor(fractionPortion) < 26)
				{
					number += String.fromCharCode(Math.floor(fractionPortion) + 65);
				}
				else if(Math.floor(fractionPortion) < 52)
				{
					number += String.fromCharCode(Math.floor(fractionPortion) + 97 - 26);
				}
				else if(Math.floor(fractionPortion) < 62)
				{
					number += String(Math.floor(fractionPortion) - 52);
				}
				else if(Math.floor(fractionPortion) == 62)
				{
					number += '+';
				}
				else if(Math.floor(fractionPortion) == 63)
				{
					number += '/';
				}
			}

			fractionPortion = fractionPortion - Math.floor(fractionPortion);

			digits++;
		}
		while(fractionPortion != 0);
	}
	if(negative)
	{
		number = '-' + number;
	}

	$(field).val(number);
}

/**
 * Converts the number of the specified base in the specified field and
 * determines the decimal value from that.
 */
function toDecimal(base, field)
{
	// Special case for infinity and NaN
	if($(field).val().toLowerCase() == "infinity")
	{
		$('#dec').val("Infinity");
		return;
	}
	else if($(field).val().toLowerCase() == "-infinity")
	{
		$('#dec').val("-Infinity");
		return;
	}
	else if($(field).val().toLowerCase() == "nan")
	{
		$('#dec').val("NaN");
		return;
	}

	var number = $(field).val().split(".")[0];
	var decimal = 0;
	var negative = false;

	// Ensure number starts with leading zero instead of decimal
	if($(field).val().charAt(0) == '.')
	{
		if(base != 64)
		{
			$(field).val('0' + $(field).val());
		}
		else
		{
			$(field).val('A' + $(field).val());
		}
	}

	// Handle negatives (and the ellusive negative zero for floating
	// point support)
	if(number < 0 || number == 0 && $(field).val().charAt(0) == '-')
	{
		number = number.replace('-','');
		negative = true;
	}

	// Handle just the minus sign on its own
	if(number == '-')
	{
		return;
	}

	// Main portion
	for(var i = number.length - 1, pos = 0; i >= 0; i--)
	{
		var current = number.charAt(i);

		// Non-base 64
		if(base != 64)
		{
			if(!isNaN(parseInt(current)))
			{
				current = parseInt(current);
			}
			else if(current.charCodeAt(0) < 97)
			{
				current = current.charCodeAt(0) - 55;
			}
			else
			{
				current = current.charCodeAt(0) - 87;
			}
		}
		// Base 64
		else
		{
			if(!isNaN(parseInt(current)))
			{
				current = parseInt(current) + 52;
			}
			else if(current == '+')
			{
				current = 62;
			}
			else if(current == '/')
			{
				current = 63;
			}
			else if(current.charCodeAt(0) <= 90)
			{
				current = current.charCodeAt(0) - 65;
			}
			else if(current.charCodeAt(0) <= 122)
			{
				current = current.charCodeAt(0) - 97 + 26;
			}
		}

		decimal += current * Math.pow(base, pos);
		pos++;
	}

	// Fractional portion
	var fraction = $(field).val().split(".")[1];
	if(undefined != fraction)
	{
		for(var i = 0; i < fraction.length; i++)
		{
			var current = fraction.charAt(i);

			// Non-base 64
			if(base != 64)
			{
				if(!isNaN(parseInt(current)))
				{
					current = parseInt(current);
				}
				else if(current.charCodeAt(0) < 97)
				{
					current = current.charCodeAt(0) - 55;
				}
				else
				{
					current = current.charCodeAt(0) - 87;
				}
			}
			// Base 64
			else
			{
				if(!isNaN(parseInt(current)))
				{
					current = parseInt(current) + 52;
				}
				else if(current == '+')
				{
					current = 62;
				}
				else if(current == '/')
				{
					current = 63;
				}
				else if(current.charCodeAt(0) <= 90)
				{
					current = current.charCodeAt(0) - 65;
				}
				else if(current.charCodeAt(0) <= 122)
				{
					current = current.charCodeAt(0) - 97 + 26;
				}
			}

			decimal += current * Math.pow(base, -i - 1);
		}
	}
	
	if(negative)
	{
		decimal *= -1;
	}

	if(decimal == Number.POSITIVE_INFINITY)
	{
		$('#dec').val("Infinity");
		// Used so that if decimal becomes infinity, so will binary
		$(field).val("Infinity");
	}
	else if(decimal == Number.NEGATIVE_INFINITY)
	{
		$('#dec').val("-Infinity");
		$(field).val("-Infinity");
	}
	else
	{
		$('#dec').val(decimal.toPrecision());
	}
}


/**
 * Populates the single precision fields with data from the binary field.
 */
function toFloat(signField, exponentField, fractionField, exponentBits, fractionBits, bias)
{
	var binaryField = $('#bin').val();

	// Special case for infinity, -infinity, and NaN
	if(binaryField.toLowerCase() == 'infinity' || parseFloat($('#dec').val()) >= Math.pow(2, bias + 1))
	{
		// Sign bit
		$(signField).val('0');

		// Exponent
		var filler = '';
		for(var i = 0; i < exponentBits; i++)
		{
			filler += '1';
		}
		$(exponentField).val(filler);

		// Fraction
		filler = '';
		for(var i = 0; i < fractionBits; i++)
		{
			filler += '0';
		}
		$(fractionField).val(filler);

		return;
	}
	else if(binaryField.toLowerCase() == '-infinity'|| parseFloat($('#dec').val()) <= -Math.pow(2, bias + 1))
	{
		// Sign bit
		$(signField).val('1');

		// Exponent
		var filler = '';
		for(var i = 0; i < exponentBits; i++)
		{
			filler += '1';
		}
		$(exponentField).val(filler);

		// Fraction
		filler = '';
		for(var i = 0; i < fractionBits; i++)
		{
			filler += '0';
		}
		$(fractionField).val(filler);

		return;
	}
	else if(binaryField.toLowerCase() == 'nan')
	{
		// Sign bit
		$(signField).val('1');

		// Exponent
		var filler = '';
		for(var i = 0; i < exponentBits; i++)
		{
			filler += '1';
		}
		$(exponentField).val(filler);

		// Fraction
		filler = '';
		for(var i = 0; i < fractionBits; i++)
		{
			filler += '1';
		}
		$(fractionField).val(filler);

		return;
	}

	// Sign bit
	if(binaryField.charAt(0) == '-')
	{
		$(signField).val("1");
		// Ditch the
		binaryField = binaryField.split('-')[1];
	}
	else
	{
		$(signField).val("0");
	}

	// Special case: zero
	if(binaryField == '0' || binaryField == '0.')
	{
		var fieldSize = '';
		while(fieldSize.length < exponentBits)
		{
			fieldSize += '0';
		}
		$(exponentField).val(fieldSize)

		while(fieldSize.length < fractionBits)
		{
			fieldSize += '0';
		}
		$(fractionField).val(fieldSize);

		return;
	}

	// Exponent and fraction
	var split = binaryField.split(".");
	var normalized;
	var exponent;

	// Remove any leading zeros
	var zeros = 0;
	while(split[0].charAt(zeros) == '0' && zeros < split[0].length)
	{
		zeros++;
	}
	split[0] = split[0].slice(zeros);
	if(split[0] == '') split[0] = '0';

	// Check if there's valid places to the left
	if(split[0].length > 1 && parseInt(split[0]) != 0)
	{
		if(split[1] != undefined)
		{
			normalized = '1.' + split[0].slice(1, split[0].length) + split[1];
		}
		else
		{
			normalized = '1.' + split[0].slice(1, split[0].length);
		}
		exponent = split[0].slice(1, split[0].length).length;
	}
	// Otherwise check to the right
	else if(split[1] != undefined && split[1].length > 0 && parseInt(split[0]) == 0 && parseInt(split[1]) != 0)
	{
		for(var i = 0; i < split[1].length; i++)
		{
			// Find first occurance of a 1
			if(split[1].charAt(i) == 1)
			{
				// Last character in the string
				if(i == split[1].length - 1)
				{
					normalized = '1';
				}
				// Otherwise chain remaining characters
				else
				{
					normalized = '1.' + split[1].slice(i + 1);
				}
				exponent = -(i + 1);

				break;
			}
		}
	}
	// Otherwise we got the right position
	else
	{
		if(split[1] == undefined)
		{
			normalized = split[0];
		}
		else
		{
			normalized = split[0] + '.' + split[1];
		}
		exponent = 0;
	}

	// Now ditch that leading 1 and decimal to get the fraction
	normalized = normalized.slice(1);
	if(normalized.charAt(0) == '.')
	{
		normalized = normalized.slice(1);
	}

	// The exponent must be biased
	exponent += bias;

	// Special case: exponent exceeded; set to infinity
	if(exponent >= bias * 2 + 1)
	{
		$(exponentField).val(decimalToBinary(bias * 2 + 1));

		var alternateFraction = '1';
		while(alternateFraction.length < fractionBits)
		{
			alternateFraction += '0';
		}
		$(fractionField).val(alternateFraction);

		return;
	}

	// Special case: number too small
	// Subnormals (exponent must be less than zero, but also greater than the number of
	// bits available for subnormals)
	if(exponent <= 0 && exponent > -fractionBits && $('#optionSubnormals').is(':checked'))
	{
		// Set exponent to zeros
		var alternate = '';
		while(alternate.length < exponentBits)
		{
			alternate += '0';
		}
		$(exponentField).val(alternate);

		// Preface fraction field with correct number of zeroes
		alternate = '';
		while(alternate.length < Math.abs(exponent))
		{
			alternate += '0';
		}

		// And append the value that was previously normalized along
		// with the leading 1 that is no longer implied.
		alternate += '1' + normalized;
		alternate = alternate.substring(0, fractionBits);

		// Add any necessary extra zeros to end
		while(alternate.length < fractionBits)
		{
			alternate += '0';
		}

		$(fractionField).val(alternate);
		return;
	}
	// Small enough to degrade to zero (or subnormals not enabled)
	else if(exponent <= 0)
	{
		var alternate = '';
		while(alternate.length < exponentBits)
		{
			alternate += '0';
		}
		$(exponentField).val(alternate);

		while(alternate.length < fractionBits)
		{
			alternate += '0';
		}
		$(fractionField).val(alternate);

		return;
	}

	var binaryExponent = decimalToBinary(exponent);

	// Padd it if it's too short
	while(binaryExponent.length < exponentBits)
	{
		binaryExponent = '0' + binaryExponent;
	}

	$(exponentField).val(binaryExponent);

	// And the fraction may need to be truncated or padded
	if(normalized.length > fractionBits)
	{
		normalized = normalized.substring(0, fractionBits);
	}
	while(normalized.length < fractionBits)
	{
		normalized = normalized + '0';
	}

	$(fractionField).val(normalized);
}


/**
 * Converts the floating point representation to the binary field
 */
function fromFloat(signField, exponentField, fractionField, exponentBits, fractionBits, bias)
{
	// Special cases for infinity, -infinity, and NaN
	var fillerExponent = '';
	for(var i = 0; i < exponentBits; i++)
	{
		fillerExponent += '1';
	}
	var fillerFraction = '';
	for(var i = 0; i < fractionBits; i++)
	{
		fillerFraction += '0';
	}

	if($(signField).val() == '0' && $(exponentField).val() == fillerExponent && $(fractionField).val() == fillerFraction)
	{
		$('#bin').val("Infinity");
		return;
	}
	else if($(signField).val() == '1' && $(exponentField).val() == fillerExponent && $(fractionField).val() == fillerFraction)
	{
		$('#bin').val("-Infinity");
		return;
	}
	else if($(exponentField).val() == fillerExponent)
	{
		$('#bin').val("NaN");
		return;
	}

	// Regular operation
	var binary = '';

	// Sign bit
	if($(signField).val() == '1')
	{
		binary += '-';
	}

	// Special case for zero
	if(parseInt($(exponentField).val()) == 0 && (!$('#optionSubnormals').is(':checked') || parseInt($(fractionField).val()) == 0))
	{
		$('#bin').val(binary + '0');
		return;
	}
	// Special case for subnormals
	else if(parseInt($(exponentField).val()) == 0 && $('#optionSubnormals').is(':checked') && parseInt($(fractionField).val()) != 0)
	{
		// Create the many zeros that preface the subnormal number
		var padding = '';
		for(var i = 0; i < bias - 1; i++)
		{
			padding += '0';
		}

		// Put it together
		$('#bin').val(binary + '0.' + padding + $(fractionField).val());
		return;
	}

	// Figure out the exponent and remove the bias
	var exponent = binaryToDecimal($(exponentField).val());
	// Exponent is now the number of decimal places to shift
	exponent -= bias;

	// Get the fraction and add the implied 1 back. Note that the decimal
	// is "currently" considered to be AFTER this leading 1, which affects our
	// shifting calculations
	var fraction = '1' + $(fractionField).val();

	// Shift right
	if(exponent > 0)
	{
		// Generate padding if there's not enough numbers to shift on
		var padding = '';
		for(var i = 0; i < exponent - fraction.length + 1; i++)
		{
			padding += '0';
		}
		fraction += padding;

		// Add that decimal in the right place
		if(fraction.slice(exponent + 1) != '')
		{
			binary += fraction.slice(0, exponent + 1) + '.' + fraction.slice(exponent + 1);
		}
		else
		{
			binary += fraction.slice(0, exponent + 1);
		}
	}
	// Shift left
	else if(exponent < 0)
	{
		// Padding is different and located in front this time
		var padding = '';
		for(var i = 0; i < Math.abs(exponent); i++)
		{
			padding += '0';
		}
		fraction = padding + fraction;

		binary += fraction.slice(0, 1) + '.' + fraction.slice(1);
	}
	// No shifting needed
	else
	{
		binary += fraction.slice(0, 1) + '.' + fraction.slice(1);
	}

	$('#bin').val(binary);
}


/**
 * Detects changes to the various input fields, parsing for validity
 * and initiates the conversion.
 */
// Decimal
$('#dec').bind("keyup change", function(){
	// Not a valid decimal
	// So many different combinations of valid decimals, since we support e-notation
	// (scientific notation). Essentially, we have an optional minus sign, followed
	// by any number of digits, then an optional period and more digits. However, if
	// e-notation is used, there must be some number in front of the e.
	if(! /^((-?[0-9]*\.?[0-9]*|-?[0-9]+\.?[0-9]*e[\+-]?[0-9]*)|-?i?n?f?i?n?i?t?y?|n?a?n?)$/i.test($('#dec').val()))
	{
		// Flash field
		if($('#dec').val() != '')
		{
			blinkField('#dec');
		}
		blankFields('#bin, #oct, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
	// It's valid
	else if($('#dec').val() != '' && !/^-?(i|in|inf|infi|infin|infini|infinit)$/i.test($('#dec').val()) && !/^(n|na)$/i.test($('#dec').val()))
	{
		fromDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		// To catch the case where we entered a single negative sign, in which case the
		// other fields are blank
		if($('#bin').val() != '')
		{
			toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
			toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		}
	}
	// Empty string or something went wrong
	else
	{
		blankFields('#bin, #oct, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
});

// Binary
$('#bin').bind("keyup change", function(){
	// Not a valid binary number
	// Binary is easy! Negative sign, 1s and 0s, decimal, more 1s and 0s
	if(! /^(-?[01]*\.?[01]*|-?i?n?f?i?n?i?t?y?|n?a?n?)$/i.test($('#bin').val()))
	{
		// Flash field
		if($('#bin').val() != '')
		{
			blinkField('#bin');
		}
		blankFields('#dec, #oct, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
	// It's valid
	else if($('#bin').val() != '' && !/^-?(i|in|inf|infi|infin|infini|infinit)$/i.test($('#bin').val()) && !/^(n|na)$/i.test($('#bin').val()))
	{
		toDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		if($('#dec').val() != '')
		{
			toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
			toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		}
	}
	// Empty string or something went wrong
	else
	{
		blankFields('#dec, #oct, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
});

// Octal
$('#oct').bind("keyup change", function(){
	// Not a valid binary number
	// Like binary, but instead of 1s and 0s, we support a range from 0-7
	if(! /^(-?[0-7]*\.?[0-7]*|-?i?n?f?i?n?i?t?y?|n?a?n?)$/i.test($('#oct').val()))
	{
		// Flash field
		if($('#oct').val() != '')
		{
			blinkField('#oct');
		}
		blankFields('#dec, #bin, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
	// It's valid
	else if($('#oct').val() != '' && !/^-?(i|in|inf|infi|infin|infini|infinit)$/i.test($('#oct').val()) && !/^(n|na)$/i.test($('#oct').val()))
	{
		toDecimal(8, '#oct');
		fromDecimal(2, '#bin');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		if($('#bin').val() != '')
		{
			toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
			toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		}
	}
	// Empty string or something went wrong
	else
	{
		blankFields('#dec, #bin, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
});

// Duodecimal
$('#duo').bind("keyup change", function(){
	// Not a valid binary number
	// Slightly more complicated in how we support 0-9 and the characters A and B. We also
	// support the lowercase letters
	if(! /^(-?[0-9ABab]*\.?[0-9ABab]*|-?i?n?f?i?n?i?t?y?|n?a?n?)$/i.test($('#duo').val()))
	{
		// Flash field
		if($('#duo').val() != '')
		{
			blinkField('#duo');
		}
		blankFields('#dec, #bin, #oct, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
	// It's valid
	else if($('#duo').val() != '' && !/^-?(i|in|inf|infi|infin|infini|infinit)$/i.test($('#duo').val()) && !/^(n|na)$/i.test($('#duo').val()))
	{
		toDecimal(12, '#duo');
		fromDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		if($('#bin').val() != '')
		{
			toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
			toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		}
	}
	// Empty string or something went wrong
	else
	{
		blankFields('#dec, #bin, #oct, #hex, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
});

// Hexadecimal
$('#hex').bind("keyup change", function(){
	// Not a valid binary number
	// Pretty much the same as duodecimal, but 0-9 and A-F (and lowercase)
	if(! /^(-?[0-9A-Fa-f]*\.?[0-9A-Fa-f]*|-?i?n?f?i?n?i?t?y?|n?a?n?)$/i.test($('#hex').val()))
	{
		// Flash field
		if($('#hex').val() != '')
		{
			blinkField('#hex');
		}
		blankFields('#dec, #bin, #oct, #duo, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
	// It's valid
	else if($('#hex').val() != '' && !/^-?(i|in|inf|infi|infin|infini|infinit)$/i.test($('#hex').val()) && !/^(n|na)$/i.test($('#hex').val()))
	{
		toDecimal(16, '#hex');
		fromDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(64, '#b64');
		if($('#bin').val() != '')
		{
			toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
			toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		}
	}
	// Empty string or something went wrong
	else
	{
		blankFields('#dec, #bin, #oct, #duo, #b64, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
});

// Base 64
$('#b64').bind("keyup change", function(){
	// Not a valid binary number
	// Like hex, but 0-9, A-Z, a-z, +, and /. Note the need to escape the + and /.
	// Also note that b64 is case sensitive, so the support for both upper and
	// lowercase characters is mandatory
	if(! /^-?[0-9A-Za-z\+\/]*\.?[0-9A-Za-z\+\/]*$/.test($('#b64').val()))
	{
		// Flash field
		if($('#b64').val() != '')
		{
			blinkField('#b64');
		}
		blankFields('#dec, #bin, #oct, #duo, #hex, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
	// It's valid
	else if($('#b64').val() != '')
	{
		toDecimal(64, '#b64');
		fromDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		if($('#bin').val() != '')
		{
			toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
			toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		}				}
	// Empty string or something went wrong
	else
	{
		blankFields('#dec, #bin, #oct, #duo, #hex, #floatSign, #floatExponent, #floatFraction, #doubleSign, #doubleExponent, #doubleFraction');
	}
});

/**
 * Floating point representation changes
 */
// Float
$('#floatSign, #floatExponent, #floatFraction').bind("keyup change", function(){
	// Not a valid binary number
	// Simple 1s and 0s, although there must be a certain number. We support any number
	// up to the expected length, since this is just what makes the fields blink.
	// Further down we make sure the lengths are exact.
	if(! /^[01]?$/.test($('#floatSign').val()) || ! /^[01]{0,8}$/.test($('#floatExponent').val()) || ! /^[01]{0,23}$/.test($('#floatFraction').val()))
	{
		// Flash field
		blinkField('#floatSign, #floatExponent, #floatFraction');
		blankFields('#dec, #bin, #oct, #duo, #hex, #b64, #doubleSign, #doubleExponent, #doubleFraction');
	}
	// It's valid (must check lengths are correct)
	else if($('#floatSign').val() != '' && $('#floatExponent').val() != '' && $('#floatFraction').val() != '' && $('#floatSign').val().length == 1 && $('#floatExponent').val().length == 8 && $('#floatFraction').val().length == 23)
	{
		fromFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
		toDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
	}
	// Empty string or something went wrong
	else
	{
		blankFields('#dec, #bin, #oct, #duo, #hex, #b64, #doubleSign, #doubleExponent, #doubleFraction');
	}
});

// Double
$('#doubleSign, #doubleExponent, #doubleFraction').bind("keyup change", function(){
	// Not a valid binary number
	// Same as float, but with different lengths
	if(! /^[01]?$/.test($('#doubleSign').val()) || ! /^[01]{0,11}$/.test($('#doubleExponent').val()) || ! /^[01]{0,52}$/.test($('#doubleFraction').val()))
	{
		// Flash field
		blinkField('#doubleSign, #doubleExponent, #doubleFraction');
		blankFields('#dec, #bin, #oct, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction');
	}
	// It's valid (must check lengths are correct)
	else if($('#doubleSign').val() != '' && $('#doubleExponent').val() != '' && $('#doubleFraction').val() != '' && $('#doubleSign').val().length == 1 && $('#doubleExponent').val().length == 11 && $('#doubleFraction').val().length == 52)
	{
		fromFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		toDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
	}
	// Empty string or something went wrong
	else
	{
		blankFields('#dec, #bin, #oct, #duo, #hex, #b64, #floatSign, #floatExponent, #floatFraction');
	}
});

/**
 * Option changes
 */
$('#optionLowercase').bind("change", function(){
	// Recalculate the fields that use letters (but not the case-sensitive b64)
	fromDecimal(12, '#duo');
	fromDecimal(16, '#hex');
});

$('#optionSubnormals').bind("change", function(){
	// Only update if inputs aren't empty
	if($('#dec').val() != '')
	{
		toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
		toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
	}
});

$('#optionLimitToFloat').bind("click", function(){
	// Recalculate the converted values from the float (but only if there's a number to convert, ie, at least the binary field is valid)
	if(/^-?[01]+\.?[01]*$/.test($('#bin').val()))
	{
		fromFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
		toDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		toFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
	}
});

$('#optionLimitToDouble').bind("click", function(){
	if(/^-?[01]+\.?[01]*$/.test($('#bin').val()))
	{
		fromFloat('#doubleSign', '#doubleExponent', '#doubleFraction', 11, 52, 1023);
		toDecimal(2, '#bin');
		fromDecimal(8, '#oct');
		fromDecimal(12, '#duo');
		fromDecimal(16, '#hex');
		fromDecimal(64, '#b64');
		toFloat('#floatSign', '#floatExponent', '#floatFraction', 8, 23, 127);
	}
});

$('#optionShowFloats').bind("click", function(){
	// Show it the floats if we checked the box, hide otherwise
	$('#floatingPointWrapper').slideToggle('slow');
});
// Encoding documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#Encoding

import { Barcode } from '../abstract-barcode';
import type { BarcodeEncoded } from '../interface';
import encode from './encoder';
import type { EanOptions } from './interface';

class UPC extends Barcode {
	options: EanOptions;
	displayValue: boolean | undefined;
	constructor(input: string, options: EanOptions){
		// Add checksum if it does not exist
		if(input.search(/^[0-9]{11}$/) !== -1){
			input += checksum(input);
		}

		super(input)
		this.options = options

		this.displayValue = options.displayValue;

		// Make sure the font is not bigger than the space between the guard bars
		// if(options.fontSize > options.width * 10){
		// 	this.fontSize = options.width * 10;
		// }
		// else{
		// 	this.fontSize = options.fontSize;
		// }

		// Make the guard bars go down half the way of the text
		// this.guardHeight = options.height + this.fontSize / 2 + options.textMargin;
	}

	valid(){
		return this.input.search(/^[0-9]{12}$/) !== -1 && this.input[11] == checksum(this.input).toString()
	}

	encode(): BarcodeEncoded[] {
		if(this.options.flat){
			return this.flatEncoding();
		}
		else{
			return this.guardedEncoding();
		}
	}

	flatEncoding(): BarcodeEncoded[] {
		var result = "";

		result += "101";
		result += encode(this.input.substr(0, 6), "LLLLLL");
		result += "01010";
		result += encode(this.input.substr(6, 6), "RRRRRR");
		result += "101";

		return [{
			encoded: result,
			input: this.input
		}]
	}

	guardedEncoding(): BarcodeEncoded[]{
		const result: BarcodeEncoded[] = [];

		// Add the first digit
		if(this.displayValue){
			result.push({
				encoded: "00000000",
				input: this.input.substr(0, 1),
			});
		}

		// Add the guard bars
		result.push({
			encoded: "101" + encode(this.input[0], "L"),
			input: ''
		});

		// Add the left side
		result.push({
			encoded: encode(this.input.substr(1, 5), "LLLLL"),
			input: this.input.substr(1, 5),
		});

		// Add the middle bits
		result.push({
			encoded: "01010",
			input: ''
		});

		// Add the right side
		result.push({
			encoded: encode(this.input.substr(6, 5), "RRRRR"),
			input: this.input.substr(6, 5)
		});

		// Add the end bits
		result.push({
			encoded: encode(this.input[11], "R") + "101",
			input: ''
		});

		// Add the last digit
		if(this.displayValue){
			result.push({
				encoded: "00000000",
				input: this.input.substr(11, 1)
			});
		}

		return result;
	}
}

// Calulate the checksum digit
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Calculation_of_checksum_digit
export function checksum(number: string) {
	var result = 0;

	var i;
	for(i = 1; i < 11; i += 2){
		result += parseInt(number[i]);
	}
	for(i = 0; i < 11; i += 2){
		result += parseInt(number[i]) * 3;
	}

	return (10 - (result % 10)) % 10;
}

export default UPC;

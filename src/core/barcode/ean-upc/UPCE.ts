// Encoding documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#Encoding
//
// UPC-E documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#UPC-E

import { Barcode } from '../abstract-barcode';
import type { BarcodeEncoded } from '../interface';
import encode from './encoder';
import type { EanOptions } from './interface';
import { checksum } from './UPC';

const EXPANSIONS = [
	"XX00000XXX",
	"XX10000XXX",
	"XX20000XXX",
	"XXX00000XX",
	"XXXX00000X",
	"XXXXX00005",
	"XXXXX00006",
	"XXXXX00007",
	"XXXXX00008",
	"XXXXX00009"
];

const PARITIES = [
	["EEEOOO", "OOOEEE"],
	["EEOEOO", "OOEOEE"],
	["EEOOEO", "OOEEOE"],
	["EEOOOE", "OOEEEO"],
	["EOEEOO", "OEOOEE"],
	["EOOEEO", "OEEOOE"],
	["EOOOEE", "OEEEOO"],
	["EOEOEO", "OEOEOE"],
	["EOEOOE", "OEOEEO"],
	["EOOEOE", "OEEOEO"]
];

class UPCE extends Barcode {
	options: EanOptions;
	isValid: boolean;
	middleDigits?: string;
	upcA?: string;
	text?: string;
	displayValue: boolean | undefined;
	fontSize?: number;
	guardHeight: any;
	constructor(input: string, options: EanOptions){
		// Code may be 6 or 8 digits;
		// A 7 digit code is ambiguous as to whether the extra digit
		// is a UPC-A check or number system digit.
		super(input);
		this.options = options

		this.isValid = false;
		if(input.search(/^[0-9]{6}$/) !== -1){
			this.middleDigits = input;
			this.upcA = expandToUPCA(input, "0");
			this.text = input ||
				`${this.upcA[0]}${input}${this.upcA[this.upcA.length - 1]}`;
			this.isValid = true;
		}
		else if(input.search(/^[01][0-9]{7}$/) !== -1){
			this.middleDigits = input.substr(1, input.length - 1);
			this.upcA = expandToUPCA(this.middleDigits, input[0]);

			if(this.upcA[this.upcA.length - 1] === input[input.length - 1]){
				this.isValid = true;
			}
			else{
				// checksum mismatch
				return;
			}
		}
		else{
			return;
		}

		this.displayValue = options.displayValue;

		// // Make sure the font is not bigger than the space between the guard bars
		// if(options.fontSize > options.width * 10){
		// 	this.fontSize = options.width * 10;
		// }
		// else{
		// 	this.fontSize = options.fontSize;
		// }

		// // Make the guard bars go down half the way of the text
		// this.guardHeight = options.height + this.fontSize / 2 + options.textMargin;
	}

	valid(){
		return this.isValid;
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
		result += this.encodeMiddleDigits();
		result += "010101";

		return [{
			encoded: result,
			input: this.input
		}]
	}

	guardedEncoding(): BarcodeEncoded[] {
		const result: BarcodeEncoded[] = [];

		// Add the UPC-A number system digit beneath the quiet zone
		if(this.displayValue){
			result.push({
				encoded: "00000000",
				input: this.input[0]
			});
		}

		// Add the guard bars
		result.push({
			encoded: "101",
			input: ''
		});

		// Add the 6 UPC-E digits
		result.push({
			encoded: this.encodeMiddleDigits(),
			input: this.input.substr(1, 7),
		});

		// Add the end bits
		result.push({
			encoded: "010101",
			input: ''
		});

		// Add the UPC-A check digit beneath the quiet zone
		if(this.displayValue){
			result.push({
				encoded: "00000000",
				input: this.input[7],
			});
		}

		return result;
	}

	encodeMiddleDigits() {
		const numberSystem = this.upcA![0];
		const checkDigit = this.upcA![this.upcA!.length - 1];
		const parity = PARITIES[parseInt(checkDigit)][parseInt(numberSystem)];
		return encode(this.middleDigits!, parity);
	}
}

function expandToUPCA(middleDigits: string, numberSystem: any) {
	const lastUpcE = parseInt(middleDigits[middleDigits.length - 1]);
	const expansion = EXPANSIONS[lastUpcE];

	let result = "";
	let digitIndex = 0;
	for(let i = 0; i < expansion.length; i++) {
		let c = expansion[i];
		if (c === 'X') {
			result += middleDigits[digitIndex++];
		} else {
			result += c;
		}
	}

	result = `${numberSystem}${result}`;
	return `${result}${checksum(result)}`;
}

export default UPCE;

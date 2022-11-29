// Encoding documentation:
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Binary_encoding_of_data_digits_into_EAN-13_barcode

import { EAN13_STRUCTURE } from './constants';
import EAN from './EAN';
import type { EanOptions } from './interface';

// Calculate the checksum digit
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Calculation_of_checksum_digit
const checksum = (number: string) => {
	const res = number
		.substr(0, 12)
		.split('')
		.map((n) => +n)
		.reduce((sum, a, idx) => (
			idx % 2 ? sum + a * 3 : sum + a
		), 0);

	return (10 - (res % 10)) % 10;
};

class EAN13 extends EAN {
	lastChar: string | undefined;

	constructor(input: string, options: EanOptions) {
		// Add checksum if it does not exist
		if (input.search(/^[0-9]{12}$/) !== -1) {
			input += checksum(input);
		}

		super(input, options);

		// Adds a last character to the end of the barcode
		this.lastChar = options.lastChar;
	}

	valid() {
		return (
			this.input.search(/^[0-9]{13}$/) !== -1 && +this.input[12] === checksum(this.input)
		);
	}

	override leftText() {
		return super.leftText(1, 6);
	}

	override leftEncode() {
		const data = this.input.substr(1, 6);
		const structure = EAN13_STRUCTURE[this.input[0] as any];
		return super.leftEncode(data, structure);
	}

	override rightText() {
		return super.rightText(7, 6);
	}

	override rightEncode() {
		const data = this.input.substr(7, 6);
		return super.rightEncode(data, 'RRRRRR');
	}

	// The "standard" way of printing EAN13 barcodes with guard bars
	override encodeGuarded() {
		const data = super.encodeGuarded();

		// Extend data with left digit & last character
		if (this.options.displayValue) {
			data.unshift({
				encoded: '000000000000',
				input: this.input.substr(0, 1),
			});

			if (this.options.lastChar) {
				data.push({
					encoded: '00',
					input: '',
				});
				data.push({
					encoded: '00000',
					input: this.options.lastChar,
				});
			}
		}

		return data;
	}

}

export default EAN13;

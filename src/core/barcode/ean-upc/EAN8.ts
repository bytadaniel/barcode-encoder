// Encoding documentation:
// http://www.barcodeisland.com/ean8.phtml

import EAN from './EAN';
import type { EanOptions } from './interface';

// Calculate the checksum digit
const checksum = (number: string) => {
	const res = number
		.substr(0, 7)
		.split('')
		.map((n) => +n)
		.reduce((sum, a, idx) => (
			idx % 2 ? sum + a : sum + a * 3
		), 0);

	return (10 - (res % 10)) % 10;
};

class EAN8 extends EAN {

	constructor(input: string, options: EanOptions) {
		// Add checksum if it does not exist
		if (input.search(/^[0-9]{7}$/) !== -1) {
			input += checksum(input);
		}

		super(input, options);
	}

	valid() {
		return (
			this.input.search(/^[0-9]{8}$/) !== -1 &&
			+this.input[7] === checksum(this.input)
		);
	}

	override leftText() {
		return super.leftText(0, 4);
	}

	override leftEncode() {
		const input = this.input.substr(0, 4);
		return super.leftEncode(input, 'LLLL');
	}

	override rightText() {
		return super.rightText(4, 4);
	}

	override rightEncode() {
		const input = this.input.substr(4, 4);
		return super.rightEncode(input, 'RRRR');
	}

}

export default EAN8;

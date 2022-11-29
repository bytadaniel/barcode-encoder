// Encoding documentation:
// https://en.wikipedia.org/wiki/EAN_2#Encoding

import { Barcode } from '../abstract-barcode';
import type { BarcodeEncoded } from '../interface';
import { EAN2_STRUCTURE } from './constants';
import encode from './encoder';
import type { EanOptions } from './interface';

class EAN2 extends Barcode {
	options: EanOptions;

	constructor(input: string, options: EanOptions) {
		super(input);
		this.options = options
	}

	valid() {
		return this.input.search(/^[0-9]{2}$/) !== -1;
	}

	encode(): BarcodeEncoded[] {
		// Choose the structure based on the number mod 4
		const structure = EAN2_STRUCTURE[parseInt(this.input) % 4];
		return [{
			// Start bits + Encode the two digits with 01 in between
			encoded: '1011' + encode(this.input, structure, '01'),
			input: this.input
		}]
	}

}

export default EAN2;

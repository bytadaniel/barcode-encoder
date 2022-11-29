// Encoding documentation:
// https://en.wikipedia.org/wiki/EAN_5#Encoding

import { Barcode } from '../abstract-barcode';
import { EAN5_STRUCTURE } from './constants';
import encode from './encoder';
import type { EanOptions } from './interface';

const checksum = (data: string) => {
	const result = data
		.split('')
		.map(n => +n)
		.reduce((sum, a, idx) => {
			return idx % 2
				? sum + a * 9
				: sum + a * 3;
		}, 0);
	return result % 10;
};

class EAN5 extends Barcode {
	options: EanOptions;

	constructor(input: string, options: EanOptions) {
		super(input);
		this.options = options
	}

	valid() {
		return this.input.search(/^[0-9]{5}$/) !== -1;
	}

	encode() {
		const structure = EAN5_STRUCTURE[checksum(this.input)];
		return [{
			encoded: '1011' + encode(this.input, structure, '01'),
			input: this.input
		}]
	}

}

export default EAN5;

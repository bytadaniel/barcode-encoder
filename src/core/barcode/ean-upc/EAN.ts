import encode from './encoder';
import { Barcode } from '../abstract-barcode';
import type { BarcodeEncoded } from '../interface';
import { SIDE_BIN, MIDDLE_BIN } from './constants';
import type { EanOptions } from './interface';

// Base class for EAN8 & EAN13
class EAN extends Barcode {
	options: EanOptions;

	constructor(input: string, options: EanOptions) {
		super(input);
		this.options = options

		// // Make sure the font is not bigger than the space between the guard bars
		// this.fontSize = !options.flat && options.fontSize > options.width * 10
		// 	? options.width * 10
		// 	: options.fontSize;

		// // Make the guard bars go down half the way of the text
		// this.guardHeight = options.height + this.fontSize / 2 + options.textMargin;
	}

	public encode () {
		return this.options.flat
			? this.encodeFlat()
			: this.encodeGuarded();
	}

	leftText(from?: number, to?: number) {
		return !from ? this.input : this.input.substr(from, to);
	}

	leftEncode(input = '', structure?: any) {
		return encode(input, structure);
	}

	rightText(from?: number, to?: number) {
		return !from ? this.input : this.input.substr(from, to);
	}

	rightEncode(input = '', structure?: any) {
		return encode(input, structure);
	}

	encodeGuarded(): BarcodeEncoded[] {
		// const textOptions = { fontSize: this.fontSize };
		// const guardOptions = { height: this.guardHeight };

		return [
			{ encoded: SIDE_BIN, input: '' },
			{ encoded: this.leftEncode(), input: this.leftText() },
			{ encoded: MIDDLE_BIN, input: '' },
			{ encoded: this.rightEncode(), input: this.rightText() },
			{ encoded: SIDE_BIN, input: '' },
		];
	}

	encodeFlat(): BarcodeEncoded[] {
		const data = [
			SIDE_BIN,
			this.leftEncode(),
			MIDDLE_BIN,
			this.rightEncode(),
			SIDE_BIN
		];

		return [{
			encoded: data.join(''),
			input: this.input
		}]
	}

}

export default EAN;

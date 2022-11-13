import { Barcode } from '../core/abstract-barcode';
import { SHIFT, SET_A, SET_B, MODULO, STOP, FNC1, SET_BY_CODE, SWAP, BARS } from './constants';
import type { Code128Options } from './interface';

export type Code128Next = {
	result: string,
	checksum: number
}

// This is the master class,
// it does require the start code to be included in the string
export class Code128 extends Barcode {
	bytes: number[];
	options: Code128Options;

	constructor(input: string, options: Code128Options = {}) {
		super(input.substring(1));

		this.options = options

		// Get array of ascii codes from data
		this.bytes = input.split('').map(char => char.charCodeAt(0));
	}

	public valid() {
		// ASCII value ranges 0-127, 200-211
		return /^[\x00-\x7F\xC8-\xD3]+$/.test(this.input);
	}

	// The public encoding function
	public encode() {
		const bytes = this.bytes;
		// Remove the start code from the bytes and set its index
		const startIndex = this.bytes.shift()! - 105;
		// Get start set by index
		const startSet = SET_BY_CODE[startIndex as keyof typeof SET_BY_CODE];

		if (startSet === undefined) {
			throw new RangeError('The encoding does not start with a start character.');
		}

		if (this.shouldEncodeAsEan128() === true) {
			bytes.unshift(FNC1);
		}

		// Start encode with the right type
		const encodingResult = Code128.next(bytes, 1, startSet);

		return {
			input: this.input.replace(/[^\x20-\x7E]/g, ''),
			encoded: [
				// Add the start bits
				Code128.getBar(startIndex),
				// Add the encoded bits
				encodingResult.result,
				// Add the checksum
				Code128.getBar((encodingResult.checksum + startIndex) % MODULO),
				// Add the end bits
				Code128.getBar(STOP)
			].join('')
		};
	}

	// GS1-128/EAN-128
	public shouldEncodeAsEan128() {
		return this.options.ean128 || false
	}

	// Get a bar symbol by index
	public static getBar(index: keyof typeof BARS) {
		return BARS[index] ? BARS[index].toString() : '';
	}

	// Correct an index by a set and shift it from the bytes array
	public static correctIndex(bytes: number[], set: number) {
		if (set === SET_A) {
			const charCode = bytes.shift()!;
			return charCode < 32 ? charCode + 64 : charCode - 32;
		} else if (set === SET_B) {
			return bytes.shift()! - 32;
		} else {
			return (bytes.shift()! - 48) * 10 + bytes.shift()! - 48;
		}
	}

	public static next(bytes: number[], pos: number, set: number): Code128Next {
		if (!bytes.length) {
			return { result: '', checksum: 0 };
		}

		let nextCode: Code128Next, index: number;

		// Special characters
		if (bytes[0] >= 200){
			index = bytes.shift()! - 105;
			const nextSet = SWAP[index as keyof typeof SWAP];

			// Swap to other set
			if (nextSet !== undefined) {
				nextCode = Code128.next(bytes, pos + 1, nextSet);
			}
			// Continue on current set but encode a special character
			else {
				// Shift
				if ((set === SET_A || set === SET_B) && index === SHIFT) {
					// Convert the next character so that is encoded correctly
					bytes[0] = (set === SET_A)
						? bytes[0] > 95 ? bytes[0] - 96 : bytes[0]
						: bytes[0] < 32 ? bytes[0] + 96 : bytes[0];
				}
				nextCode = Code128.next(bytes, pos + 1, set);
			}
		}
		// Continue encoding
		else {
			index = Code128.correctIndex(bytes, set);
			nextCode = Code128.next(bytes, pos + 1, set);
		}

		// Get the correct binary encoding and calculate the weight
		const enc = Code128.getBar(index);
		const weight = index * pos;

		return {
			result: enc + nextCode.result,
			checksum: weight + nextCode.checksum
		};
	}
}

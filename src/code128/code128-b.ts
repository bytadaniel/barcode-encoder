import { Code128 } from './code128';
import { B_START_CHAR, B_CHARS } from './constants';
import type { Code128Options } from './interface';

export class Code128B extends Code128 {
	constructor(string: string, options: Code128Options = {}) {
		super(B_START_CHAR + string, options);
	}

	public override valid() {
		return (new RegExp(`^${B_CHARS}+$`)).test(this.input);
	}
}

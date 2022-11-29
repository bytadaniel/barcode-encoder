import { Code128 } from './code128';
import { C_START_CHAR, C_CHARS } from './constants';
import type { Code128Options } from './interface';

export class Code128C extends Code128 {
	constructor(string: string, options: Code128Options = {}) {
		super(C_START_CHAR + string, options);
	}

	public override valid() {
		return (new RegExp(`^${C_CHARS}+$`)).test(this.input);
	}
}

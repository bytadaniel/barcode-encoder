import { Code128 } from './code128';
import { A_START_CHAR, A_CHARS } from './constants';
import type { Code128Options } from './interface';

export class Code128A extends Code128 {
	constructor(string: string, options: Code128Options = {}) {
		super(A_START_CHAR + string, options);
	}

	public override valid() {
		return (new RegExp(`^${A_CHARS}+$`)).test(this.input);
	}
}

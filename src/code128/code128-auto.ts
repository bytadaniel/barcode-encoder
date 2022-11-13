import { Code128 } from './code128';
import type { Code128Options } from './interface';
import autoSelectModes from './helpers';

export class Code128Auto extends Code128 {
	constructor(data: string, options: Code128Options = {}){
    // ASCII value ranges 0-127, 200-211
		if (/^[\x00-\x7F\xC8-\xD3]+$/.test(data)) {
			super(autoSelectModes(data), options);
		} else{
			super(data, options);
		}
	}
}

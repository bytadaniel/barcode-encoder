import type { BarcodeEncoded } from "./interface";

export abstract class Barcode {
    input: string;

	constructor(input: string){
		this.input = input
	}

    public abstract valid(): boolean

    public abstract encode(): BarcodeEncoded
}

export interface BarcodeRef {
    new(): Barcode
}

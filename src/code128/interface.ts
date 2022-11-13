import type { BarcodeOptions } from "../core/interface";

export interface Code128Options extends BarcodeOptions {
    ean128?: boolean
}
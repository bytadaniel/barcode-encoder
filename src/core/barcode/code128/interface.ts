import type { BarcodeOptions } from '../interface'

export interface Code128Options extends BarcodeOptions {
    ean128?: boolean
}
import fs from 'fs'
import { createPdfStickers } from "../src";

(async function () {
	/**
	 * export interface StickerContract {
			sizeMM: Dimensions,
			barcode?: {
				input: string,
				type: BarcodeType
			},
			count?: number
			text?: string,
			spaceBetweenMM?: number,
			eac?: boolean
		}

		export interface StickersContract {
			stickers: StickerContract[],
			sticker: {
				stroke: boolean,
				eac: boolean,
				separateBarcodeAndInfo: boolean
				spaceBetweenMM: number
			},
			page: {
				sizeMM: Dimensions,
				offsetMM?: Dimensions
			}
		}
	 */
	const pdfStickers = await createPdfStickers({
		page: {
			sizeMM: { width: 52, height: 34 },
			offsetMM: { width: 0, height: 0 }
		},
		sticker: {
			stroke: true,
			eac: false,
			separateBarcodeAndInfo: false,
			spaceBetweenMM: 0
		},
		stickers: [
			{
				sizeMM: { width: 52, height: 34 },
				barcode: { input: '2008099808000', type: 'CODE128' },
				text: [
					'браслет малахит',
					'Артикул: 45253152 Цв.: ярко-зеленый / Раз.: 18-21',
					'Страна: Россия',
					'Бренд: scarlet flower',
					'',
					'Товар подлежит обязательной сертификации'
				].join('\n'),
				count: 25
			},
			{
				sizeMM: { width: 52, height: 34 },
				barcode: { input: '2008099808000', type: 'EAN13' },
				text: [
					'браслет малахит',
					'Артикул: 45253152 Цв.: ярко-зеленый / Раз.: 18-21',
					'Страна: Россия',
					'Бренд: scarlet flower',
					'',
					'Товар подлежит обязательной сертификации'
				].join('\n'),
				count: 25
			}
		]
	})

	fs.writeFileSync('/Users/mac/Desktop/barcode-test.pdf', pdfStickers);
})()

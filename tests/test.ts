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
			sizeMM: { width: 210, height: 297 },
			// offsetMM: { width: 10, height: 10 }
		},
		sticker: {
			eac: false,
			stroke: true,
			separateBarcodeAndInfo: false,
			spaceBetweenMM: 0
		},
		stickers: [
			{
				sizeMM: {
					width: 52,
					height: 34
				},
				barcode: {
					type: 'CODE128',
					input: '2008099808000'
				},
				text: 'Кроссовки Абибас\n' +
					'Артикул: 12345678\n' +
					'Цв.: белый/Раз.: 42\n' +
					'Поставщик: Ататюрк\n' +
					'Бренд: Абибас Импортед\n' +
					'Поставщик: Импортозаместительный импортозаместитель\n' +
					'Страна производства: Турция\n' +
					'Срок годности: 200 лет\n' +
					'Состав: шелк из шерсти мамонта\n' +
					'не бу\n' +
					'Товар не подлежит обязательной сертификации',
				count: 5
			}
		]
	})

	fs.writeFileSync('/Users/mac/Desktop/barcode-test.pdf', pdfStickers);
})()

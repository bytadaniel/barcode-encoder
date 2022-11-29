import fontkit from '@pdf-lib/fontkit'
import { PDFDocument } from "pdf-lib"
import { arrangeElementsOnPapers } from "../paper/arrange-elements-on-papers"
import * as utils from '../utils'
import * as sticker from './sticker'
import { FontNames } from '../core/font'
import type { Dimensions } from '../paper/interface'

type BarcodeType = 'EAN13' | 'CODE128'

export interface StickerContract {
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



export async function createPdfStickers (contract: StickersContract) {
	// console.time('createPdfStickers')

	const pdf = await PDFDocument.create()

	pdf.registerFontkit(fontkit)
	const font = await pdf.embedFont(FontNames.Roboto())
  
	/**
	 * Преобразование образов стикеров с количеством
	 * к конкретному количеству сущностей стикеров, которые запрашиваются
	 */
	const stickers = contract.stickers.reduce(
		(contracts, commonContract) => {
			for (let i = 0; i < (commonContract.count ?? 1); i++) {
				if (contract.sticker.separateBarcodeAndInfo) {
					contracts.push([
						{
							sizeMM: commonContract.sizeMM,
							...commonContract.barcode && { barcode: commonContract.barcode },
							...contract.sticker.spaceBetweenMM && { spaceBetweenMM: contract.sticker.spaceBetweenMM }
						},
						{
							sizeMM: commonContract.sizeMM,
							...commonContract.text && { text: commonContract.text },
							...contract.sticker.spaceBetweenMM && { spaceBetweenMM: contract.sticker.spaceBetweenMM }
						},
					])
				} else {
					contracts.push([
						{
							sizeMM: commonContract.sizeMM,
							...commonContract.barcode && { barcode: commonContract.barcode },
							...commonContract.text && { text: commonContract.text },
							...contract.sticker.spaceBetweenMM && { spaceBetweenMM: contract.sticker.spaceBetweenMM },
							...contract.sticker.eac && { eac: contract.sticker.eac }
						}
					])
				}
			}
			return contracts
		},
		[] as StickerContract[][]
	).flat()
  
	/**
	 * Преобразование сущностей стикеров к сущностям страниц
	 * Расположение стикеров на страницах в оптимальной форме
	 */
	const papers = arrangeElementsOnPapers(contract.page, stickers)

	/**
	 * Отрисовка страниц со стикерами в PDF файле
	 */
	for (const paper of papers) {
		const paperWidth = utils.mmToPx72(paper.sizeMM.width)
		const paperHeight = utils.mmToPx72(paper.sizeMM.height)

		const paperPaddingWidth = contract.page.offsetMM?.width ? utils.mmToPx72(contract.page.offsetMM.width) : 0
		const paperPaddingHeight = contract.page.offsetMM?.height ? utils.mmToPx72(contract.page.offsetMM.height) : 0

		const spaceBetween = contract.sticker.spaceBetweenMM ? utils.mmToPx72(contract.sticker.spaceBetweenMM) : 0

		const page = pdf.addPage([paperWidth, paperHeight])

		// Разметка оффсетов
		/*
		page.drawRectangle({
			x: 0,
			width: page.getWidth(),
			y: page.getHeight() - paperPaddingHeight,
			height: paperPaddingHeight,
			color: rgb(0, 1, 0),
			opacity: 0.5
		})
		page.drawRectangle({
			x: 0,
			width: page.getWidth(),
			y: 0,
			height: paperPaddingHeight,
			color: rgb(0, 1, 0),
			opacity: 0.5
		})
		page.drawRectangle({
			x: 0,
			width: paperPaddingWidth,
			y: 0,
			height: page.getHeight(),
			color: rgb(0, 1, 0),
			opacity: 0.5
		})
		page.drawRectangle({
			x: page.getWidth() - paperPaddingWidth,
			width: paperPaddingWidth,
			y: 0,
			height: page.getHeight(),
			color: rgb(0, 1, 0),
			opacity: 0.5
		})
		*/
		for (const [rowIndex, row] of paper.matrix.entries()) {
			for (const [columnIndex, elementWithCursor] of row.entries()) {
				const { element } = elementWithCursor

				const stickerWidth = utils.mmToPx72(element.sizeMM.width)
				const stickerHeight = utils.mmToPx72(element.sizeMM.height)

				const x = columnIndex * (stickerWidth + spaceBetween) + spaceBetween + paperPaddingWidth
				const y = page.getHeight() - paperPaddingHeight - ((rowIndex + 1) * (stickerHeight + spaceBetween))

				sticker.drawSticker(page, font, {
					x,
					y,
					width: stickerWidth,
					height: stickerHeight,
					...element.barcode && {
						barcode: element.barcode
					},
					...contract.sticker.stroke && {
						stroke: { width: 0 }
					},
					...element.text && {
						text: {
							text: element.text,
							horizontalAlignment: 'left'
						}
					},
					...element.eac && {
						eac: element.eac
					}
				})
			}
		}
	}

	// console.timeEnd('createPdfStickers')

	/**
	 * Вывод
	 */
	return pdf.save()
}
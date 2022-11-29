import type { PDFPage, PDFFont } from 'pdf-lib'
import { rgb } from 'pdf-lib'
import { EAN13 } from '../../core/barcode/ean-upc'
import { Code128 } from '../../core/barcode/code128'
import * as barcode from '../barcode'
import * as utils from '../../utils'

const barcodeAndTextHeightScaleMask = [
  0.35,  // barcode-height
  0.55, // text-height
]

const barcodeAndTextWidthScaleMask = [
  0.6,  // text-width
  0.3   // eac-width
]

export function drawSticker (page: PDFPage, font: PDFFont, options: {
    x: number,
    y: number,
    width: number,
    height: number,
    barcode?: {
      input: string,
      type: 'EAN13' | 'CODE128'
    },
    text?: {
      text: string,
      horizontalAlignment?: 'left' | 'center' | 'right'
    },
    stroke?: {
      width: number
    },
    _color?: any
  }) {
    let [
      barcodeHeightScale,
      textHeightScale,
    ] = barcodeAndTextHeightScaleMask

    let spaceBetweenHeightScale = (1 - (barcodeHeightScale + textHeightScale)) / (barcodeAndTextHeightScaleMask.length - 1 + 2)

    /**
     * Меняем масштабирование маски в 2 бизнес-кейсах
     */
    if (!options.barcode && options.text) {
      barcodeHeightScale = 0
      spaceBetweenHeightScale = 0.05
      textHeightScale = 0.9
    } else if (options.barcode && !options.text) {
      textHeightScale = 0
      spaceBetweenHeightScale = 0.15
      barcodeHeightScale = 0.7
    }

    const barcodeHeight = options.height * barcodeHeightScale
    const textHeight = options.height * textHeightScale
    const spaceBetweenHeight = options.height * spaceBetweenHeightScale

    let [
      textWidthScale,
      eacWidthScale
    ] = barcodeAndTextWidthScaleMask

    const contentWidthScale = textWidthScale + eacWidthScale
    const spaceBetweenWidthScale = (1 - contentWidthScale) / (barcodeAndTextWidthScaleMask.length - 1 + 2)

    const contentWidth = options.width * contentWidthScale
    const spaceBetweenWidth = options.width * spaceBetweenWidthScale

    // сеточная разметка (не удалять)
    // разметка контента
    /*
    page.drawRectangle({
      width: contentWidth,
      height: options.height,
      x: options.x + spaceBetweenWidth,
      y: options.y,
      color: rgb(1, 0, 0),
      opacity: 0.25
    })
    // разметка баркода
    page.drawRectangle({
      width: options.width,
      height: barcodeHeight,
      x: options.x,
      y: options.y + spaceBetweenHeight + textHeight + spaceBetweenHeight,
      color: rgb(1, 0, 0),
      opacity: 0.25
    })
    // разметка текста
    page.drawRectangle({
      width: options.width,
      height: textHeight,
      x: options.x,
      y: options.y + spaceBetweenHeight,
      color: rgb(1, 0, 0),
      opacity: 0.25
    })
    */

    /**
     * Draw background color on test stafe
     * @todo delete code
     */
     if (options._color) {
      page.drawRectangle({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        color: options._color,
      })
    }
  
    /**
     * Draw barcode
     */
    if (options.barcode) {
      const barcodeWidth = options.width * barcodeHeightScale
      // const barcodeHeight = options.height * barcodeScale
      switch (options.barcode.type) {
        case 'EAN13':
          barcode.drawBarcodeEan13(page, font, {
            encoded: new EAN13(options.barcode.input, { flat: true }).encode()[0].encoded,
            text: options.barcode.input,
            x: options.x + (options.width - barcodeWidth) / 2, // align center
            y: options.y - spaceBetweenHeight + (options.height - barcodeHeight), // top
            width: barcodeWidth,
            height: barcodeHeight,
          })
          break
        case 'CODE128':
          barcode.drawBarcodeCode128(page, font, {
            encoded: new Code128(options.barcode.input).encode()[0].encoded,
            text: options.barcode.input,
            x: options.x + (options.width - barcodeWidth) / 2, // align center
            y: options.y - spaceBetweenHeight + (options.height - barcodeHeight), // top
            width: barcodeWidth,
            height: barcodeHeight,
          })
      }
    }

    if (options.text) {
      const lines = options.text.text.split('\n')

      const fontSize = utils.searchFontSizeToFitRectangle(font, lines, contentWidth, textHeight)

      const lineHeight = font.heightAtSize(fontSize, { descender: false })
      const linePassHeight = lineHeight * 0.5
      const textComputedHeight = (lineHeight * lines.length) + (linePassHeight * (lines.length - 1)) // this height is nearest to fit textHeightScale

      for (const [lineIndex, line] of lines.reverse().entries()) {
        page.drawText(line, {
          x: options.x + spaceBetweenWidth,
          y: options.y + (lineIndex * (lineHeight + linePassHeight)) + (textHeight - textComputedHeight) + spaceBetweenHeight,
          font,
          size: fontSize
        })
      }
    }
  
    /**
     * Draw stroke if will need
     */
    if (options.stroke) {
      page.drawRectangle({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        borderColor: rgb(0, 0, 0),
        borderWidth: options.stroke.width,
        borderDashArray: [10, 5]
      })
    }
  }
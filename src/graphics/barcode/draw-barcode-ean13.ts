import type { PDFPage, PDFFont, RGB } from 'pdf-lib'
import { rgb } from 'pdf-lib'
import * as utils from '../../utils'

export function drawBarcodeEan13 (page: PDFPage, font: PDFFont, options: {
    encoded: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    _color?: RGB
}) {
  const barcodeHeightScale = 0.8
  const textWidthScale = 0.7
  const textHeightScale = 1 - barcodeHeightScale

  if (options._color) {
    page.drawRectangle({
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      color: options._color
    })
  }


  const barWidth = options.width / options.encoded.length
  const barHeight = options.height * barcodeHeightScale
    
  const textMaxHeight = options.height * textHeightScale
  const fontSize = Math.min(
    utils.searchFontSizeTextToFitWidth(font, options.text, options.width * textWidthScale),
    font.sizeAtHeight(textMaxHeight)
  )



  const textWidth = font.widthOfTextAtSize(options.text, fontSize)
  const textHeight = font.heightAtSize(fontSize)

  options.encoded.split('').forEach((char, index) => {
    const x = options.x + barWidth * index
    const y = options.y + (options.height - barHeight)
    if (char === '1') {
      page.drawRectangle({
        x,
        y,
        width: barWidth,
        height: barHeight,
        color: rgb(0, 0, 0)
      })
    }
  })

  page.moveTo(
    options.x + (options.width - textWidth) / 2, // x
    options.y + (options.height - barHeight - textHeight) // y
  )
  page.drawText(options.text, { size: fontSize })
}
import type { PDFPage, PDFFont, RGB } from 'pdf-lib'
import { rgb } from 'pdf-lib'
import * as utils from '../../utils'

export function drawBarcodeCode128 (page: PDFPage, font: PDFFont, options: {
    encoded: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    _color?: RGB
}) {
  const barcodeHeightScale = 0.6
  const barcodeWidthScale = 1.2
  const textWidthScale = 0.8
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


  const barWidth = options.width * barcodeWidthScale / options.encoded.length
  const barHeight = options.height * barcodeHeightScale
  const barcodeWidth = options.encoded.length * barWidth
    
  const textMaxHeight = options.height * textHeightScale
  const fontSize = Math.min(
    utils.searchFontSizeTextToFitWidth(font, options.text, options.width * textWidthScale),
    font.sizeAtHeight(textMaxHeight)
  )

  const textWidth = font.widthOfTextAtSize(options.text, fontSize)
  const textHeight = font.heightAtSize(fontSize)

  const unions = options.encoded.split('').reduce(
    (unions, char) => {
        char !== unions[unions.length - 1]?.[0] ? unions.push([char]) : unions[unions.length - 1].push(char)
        return unions
    },
    [] as string[][]
  )

  unions.reduce(
    (cursor, union) => {
      const x = options.x + ((options.width - barcodeWidth) / 2) + barWidth * cursor.index
      const y = options.y + (options.height - barHeight)
      if (union[0] === '1') {
        page.drawRectangle({
          x,
          y,
          width: barWidth * union.length,
          height: barHeight,
          color: rgb(0, 0, 0)
        })
      }

      cursor.index += union.length
      return cursor
    },
    { index: 0 } as { index: number }
  )

  // options.encoded.split('').forEach((char, index) => {
  //   const x = options.x + ((options.width - barcodeWidth) / 2) + barWidth * index
  //   const y = options.y + (options.height - barHeight)
  //   if (char === '1') {
  //     page.drawRectangle({
  //       x,
  //       y,
  //       width: barWidth,
  //       height: barHeight,
  //       color: rgb(0, 0, 0)
  //     })
  //   }
  // })

  page.moveTo(
    options.x + (options.width - textWidth) / 2, // x
    options.y + (options.height - barHeight - textHeight) // y
  )
  page.drawText(options.text, { size: fontSize })
}
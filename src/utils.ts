import type { PDFFont } from 'pdf-lib'

/**
 * Найти такой размер шрифта, с которым текст будет немного меньше или равен определенной ширине в пикселях
 * 
 * Длина текста считается БЕЗ учета переносов строки
 */
export function searchFontSizeTextToFitWidth (font: PDFFont, text: string, targetWidth: number) {
  let currentSize = 12
  let currentWidth = font.widthOfTextAtSize(text, currentSize)

  while (true) {
    let nextSize = currentSize
    if (currentWidth > targetWidth) nextSize = currentSize - 1
    if (currentWidth < targetWidth) nextSize = currentSize + 1
    if (currentWidth === targetWidth) break

    const nextWidth = font.widthOfTextAtSize(text, nextSize)

    if (currentWidth < targetWidth && nextWidth > targetWidth) break
    if (currentWidth > targetWidth && nextWidth < targetWidth) {
      currentWidth = nextWidth
      currentSize = nextSize
      break
    }

    currentSize = nextSize
    currentWidth = nextWidth
  }

  return currentSize
}
  
// Найти такой размер шрифта, с которым текст будет немного меньше или равен определенной высоте в пикселях
/**
 * @deprecated use font.sizeAtHeight
 * @param font
 * @param targetHeight 
 * @returns 
 */
export function searchFontSizeToFitHeight (font: PDFFont, targetHeight: number): number {
  let currentSize = 12
  let currentHeight = font.heightAtSize(currentSize)

  while (true) {
    let nextSize = currentSize

    if (currentHeight > targetHeight) nextSize -= 1
    if (currentHeight < targetHeight) nextSize += 1
    if (currentHeight === targetHeight) break

    const nextHeight = font.heightAtSize(nextSize)

    if (currentHeight < targetHeight && nextHeight > targetHeight) break
    if (currentHeight > targetHeight && nextHeight < targetHeight) {
      currentHeight = nextHeight
      currentSize = nextSize
      break
    }

    currentSize = nextSize
    currentHeight = nextHeight
  }

  return currentSize
}

export function searchFontSizeToFitRectangle (
  font: PDFFont,
  lines: string[],
  targetWidth: number,
  targetHeight: number
): number {
  const largestLine = [...lines].sort((a, b) => b.length - a.length)[0]

  let size = 12
  let width = font.widthOfTextAtSize(largestLine, size)
  let lineHeight = font.heightAtSize(size, { descender: true })
  let linePassHeight = lineHeight * 0.5
  let height = (lineHeight * lines.length) + (linePassHeight * (lines.length - 1))

  while (true) {
    let sizeCursor = size

    if (sizeCursor <= 0) throw new Error('Text lines cant be fited into the given width and height')

    const currentWidthOverfits = width > targetWidth
    const currentHeightOverfits = height > targetHeight
    let currentSizeOk = true

    if (currentHeightOverfits || currentWidthOverfits) {
      currentSizeOk = false
      sizeCursor -= 1
    } else if (!currentHeightOverfits && !currentWidthOverfits) {
      currentSizeOk = true
      sizeCursor += 1
    } else {
      // width and height currents equal to targets
      break
    }

    const nextWidth = font.widthOfTextAtSize(largestLine, sizeCursor)
    const nextLineHeight = font.heightAtSize(sizeCursor, { descender: false })
    const nextLinePassHeight = lineHeight * 0.5
    const nextHeight = (nextLineHeight * lines.length) + (nextLinePassHeight * (lines.length - 1))

    const nextWidthOverfits = nextWidth > targetWidth
    const nextHeightOverfits = nextHeight > targetHeight
    let nextSizeOk = true

    if (nextHeightOverfits || nextWidthOverfits) {
      nextSizeOk = false
    } else if (!nextHeightOverfits && !nextWidthOverfits) {
      nextSizeOk = true
    }

    if (currentSizeOk && !nextSizeOk) break
    if (!currentSizeOk && nextSizeOk) {
      size = sizeCursor
      break
    }

    size = sizeCursor
    width = nextWidth
    lineHeight = nextLineHeight
    linePassHeight = nextLinePassHeight
    height = nextHeight
  }

  return size
}

// Конвертер миллиметров в пиксели через замыкание dpi
function MM_TO_PX_DPI (dpi: number = 72) {
  const ONE_SM = 10 // mm
  const ONE_DPI = 0.393701 // px/sm
  return function (mm: number) {
    return dpi * ONE_DPI * 1/ONE_SM * mm
  }
}
// 72 DPI
export const mmToPx72 = MM_TO_PX_DPI(72)
// 300 DPI
export const mmToPx300 = MM_TO_PX_DPI(300)
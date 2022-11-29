import type { StickerContract, StickersContract } from "../graphics/create-pdf-stickers";
import type { Dimensions, ElementWithCursorState } from "./interface";
import { Stack } from "../core/Stack";

export class Paper {
  sizeMM: Dimensions;
  offsetMM: Dimensions;
  cursor: Dimensions;

  unusedElements: StickerContract[];
  matrix: ElementWithCursorState[][];

  constructor(pageContract: StickersContract['page']) {
    this.unusedElements = []
    this.matrix = []

    this.sizeMM = pageContract.sizeMM
    this.offsetMM = {
      width: pageContract.offsetMM?.width ?? 0,
      height: pageContract.offsetMM?.height ?? 0,
    }
    this.cursor = {
      width: 0,
      height: 0
    }
  }

  private organizeVertical(elements: StickerContract[]) {
    const stack = new Stack(elements.reverse())

    let canUseElement = true
    let isFirstElement = true

    while (stack.hasElements() && canUseElement) {
      const element = stack.get()!

      const spaceBetween = element.spaceBetweenMM ?? 0

      if (isFirstElement) {
        this.cursor.width += this.offsetMM.width + spaceBetween
        this.cursor.height += this.offsetMM.height + spaceBetween
        isFirstElement = false
      }

      const nextWidthCursorState = this.cursor.width + spaceBetween + element.sizeMM.width
      const nextHeightCursorState = this.cursor.height + spaceBetween + element.sizeMM.height

      const maxWidth = this.sizeMM.width - this.offsetMM.width
      const maxHeight = this.sizeMM.height - this.offsetMM.height

      const inBoundWidth = nextWidthCursorState <= maxWidth
      const inBoundHeight = nextHeightCursorState <= maxHeight

      // no rows
      if (!this.matrix.length) {
        this.matrix.push([])
      }

      if (inBoundHeight && inBoundWidth) {
        const elementWithCursor: ElementWithCursorState = {
          cursorState: {
            ...this.cursor
          },
          element
        }

        // пуш в последнюю колонку последней строки
        this.matrix[this.matrix.length-1].push(elementWithCursor)

        // сдвигаем курсор на следующую колонку этой же строки
        this.cursor.width += (element.sizeMM.width + spaceBetween)
        continue
      }

      // Когда курсор дошел до конца строки
      if (inBoundHeight && !inBoundWidth) {
        // сдвигаем курсор влево 
        this.cursor.width = 0
        // и в конец высоты первого элемента предыдущей строки
        const rowsWithFirstElement = this.matrix.map(rows => rows[0]).filter(c => c)
        let rowHeight = rowsWithFirstElement
          .map(el => el.element.sizeMM.height)
          .concat(this.offsetMM.height, rowsWithFirstElement.length * spaceBetween) // учитываем отступы и интервалы (без последнего интервала)
          .reduce((sum, height) => sum += height, 0)

        this.cursor.height = rowHeight + spaceBetween
        stack.add(element)

        // новая строка
        this.matrix.push([])
        continue
      }

      // невозможно добавить элемент куда-либо - выход
      if (!inBoundHeight || !inBoundWidth) {
        canUseElement = false
        stack.add(element) // return to queue
        break
      }

      // в случае непредусмотренных ситуаций
      canUseElement = false
      stack.add(element) // return to queue
      break
    }

    // высвобождаем очередь
    while (stack.hasElements()) {
      const element = stack.get()!
      this.unusedElements.push(element)
    }
  }

  public arrangeElementsOnPaper(elements: StickerContract[]) {
    this.organizeVertical(elements)
  }

  public getUnusedElements() {
    return this.unusedElements
  }
}
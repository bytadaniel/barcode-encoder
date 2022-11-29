import { groupBy } from 'lodash'
import type { StickerContract, StickersContract } from "../graphics/create-pdf-stickers"
import { Paper } from "./Paper"

export function arrangeElementsOnPapers (pageContract: StickersContract['page'], $elements: StickerContract[]) {
    const $elementGroups = Object.values(groupBy($elements, doc => `${doc.sizeMM.width}-${doc.sizeMM.height}`))
    let papers: Paper[] = []

    for (const $elementGroup of $elementGroups) {
        let elements = [...$elementGroup]
    
        do {
            const paper = new Paper(pageContract)
            paper.arrangeElementsOnPaper(elements)
    
            papers.push(paper)
    
            elements = paper.getUnusedElements() // переприсваиваем элементы для условия выхода
        } while (elements.length > 0)
    }

    return papers
}
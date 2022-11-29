import type { StickerContract } from "../graphics/create-pdf-stickers"

export interface Dimensions {
	width: number,
	height: number
}
  
export interface ElementWithCursorState {
	cursorState: Dimensions,
	element: StickerContract
}
/**
 * Простенькая реализация классического стэка
 */
export class Stack<T> {
	private readonly stack: T[] = []

	constructor (elements: T[]) {
		elements.forEach(e => this.add(e))
	}

	public get size () {
		return this.stack.length
	}

	public add (element: T) {
		this.stack.push(element)
	}

	public get () {
		return this.stack.pop()
	}

	public hasElements() {
		return this.size > 0
	}
}
import { Code128 } from '../src'


function getSVG(width: number, height: number, input: string) {
    const { encoded } = new Code128(input).encode()
    const unions = encoded
        .split('')
        .reduce(
            (unions, char) => {
                char !== unions[unions.length - 1]?.[0] ? unions.push([char]) : unions[unions.length - 1].push(char)
                return unions
            },
            [] as string[][]
        )
    
    const barWidthPc = Number((100 / encoded.length).toFixed(2))
    const white = '#fff'
    const black = '#000'
    
    const { rects } = unions.reduce((cursor, union) => {
        let color = white
    
        const unionWidth = Number(((barWidthPc / 100 * width) * union.length).toFixed(2))
        const unionHeight = 0.8 * height
        const x = cursor.x
    
        cursor.x = Number(Number(cursor.x + unionWidth).toFixed(2))
    
        if (union[0] === '1') color = black
        else if (union[0] === '0') color = white
    
        cursor.rects.push(`\t<rect width="${unionWidth}" height="${unionHeight}" x="${x}" fill="${color}"/>`)
    
        return cursor
    }, {
        x: 0,
        rects: []
    } as { x: number, rects: string[] })

    const textX = 0.10 * width
    const textY = 0.82 * height
    const textWidth = 0.80 * width
    const fontSize = 0.18 * height

    const svg = [
        `<svg width=${width} height=${height}>`,
        rects.join('\n'),
        `\t<text x="${textX}" y="${textY}" dominant-baseline="hanging" text-anchor="start" textLength="${textWidth}" font-size="${fontSize}">${input}</text>`,
        '</svg>'
    ].join('\n')

    return svg
}

console.log(getSVG(300, 150, '2008099808000'))
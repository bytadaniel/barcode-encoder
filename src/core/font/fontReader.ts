import fs from 'fs'
import path from 'path'
// import fontkit from '@pdf-lib/fontkit';

const FontPaths = {
    TimesRoman: path.resolve(__dirname, '../../assets/TimesRoman.ttf'),
    Roboto: path.resolve(__dirname, '../../assets/Roboto.ttf')
}

function fontLazyLoader (path: string) {
    let fontBytes: Buffer
    return function () {
        if (!fontBytes) {
            fontBytes = fs.readFileSync(path)
        }

        return fontBytes
    }
}

export const FontNames = {
    TimesRoman: fontLazyLoader(FontPaths.TimesRoman),
    Roboto: fontLazyLoader(FontPaths.Roboto)
}
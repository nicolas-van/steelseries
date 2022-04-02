import { createBuffer, PI } from './tools.js'

const brushedMetalTexture = function (color, radius, amount, monochrome, shine) {
  this.fill = function (startX, startY, endX, endY) {
    let i
    let x
    let y // loop counters
    let sinArr
    // alpha = color & 0xff000000;
    const alpha = 255
    const red = (color >> 16) & 0xff
    const green = (color >> 8) & 0xff
    const blue = color & 0xff
    let n = 0
    const variation = 255 * amount
    let indx
    let tr
    let tg
    let tb
    let f

    startX = Math.floor(startX)
    startY = Math.floor(startY)
    endX = Math.ceil(endX)
    endY = Math.ceil(endY)

    const width = endX - startX
    const height = endY - startY

    // Create output canvas
    const outCanvas = createBuffer(width, height)
    const outCanvasContext = outCanvas.getContext('2d')

    // Create pixel arrays
    const inPixels = outCanvasContext.createImageData(width, height)
    const outPixels = outCanvasContext.createImageData(width, height)

    // Precreate sin() values
    if (shine !== 0) {
      sinArr = []
      for (i = 0; i < width; i++) {
        sinArr[i] = (255 * shine * Math.sin((i / width) * PI)) | 0
      }
    }

    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        indx = y * width * 4 + x * 4
        tr = red
        tg = green
        tb = blue
        if (shine !== 0) {
          f = sinArr[x]
          tr += f
          tg += f
          tb += f
        }

        if (monochrome) {
          n = ((2 * Math.random() - 1) * variation) | 0
          inPixels.data[indx] = clamp(tr + n)
          inPixels.data[indx + 1] = clamp(tg + n)
          inPixels.data[indx + 2] = clamp(tb + n)
          inPixels.data[indx + 3] = alpha
        } else {
          inPixels.data[indx] = random(tr, variation)
          inPixels.data[indx + 1] = random(tg, variation)
          inPixels.data[indx + 2] = random(tb, variation)
          inPixels.data[indx + 3] = alpha
        }
      }
    }

    if (radius > 0) {
      horizontalBlur(inPixels, outPixels, width, height, radius, alpha)
      outCanvasContext.putImageData(outPixels, startX, startY)
    } else {
      outCanvasContext.putImageData(inPixels, startX, startY)
    }
    return outCanvas
  }

  function random (x, vari) {
    x += ((2 * Math.random() - 1) * vari) | 0
    return x < 0 ? 0 : x > 255 ? 255 : x
  }

  function clamp (C) {
    return C < 0 ? 0 : C > 255 ? 255 : C
  }

  function horizontalBlur (inPix, outPix, width, height, radius, alpha) {
    let x
    let y // loop counters
    let i
    let indx
    let totR
    let totG
    let totB

    if (radius >= width) {
      radius = width - 1
    }
    const mul = 1 / (radius * 2 + 1)
    indx = 0
    for (y = 0; y < height; y++) {
      totR = totG = totB = 0
      for (x = 0; x < radius; x++) {
        i = (indx + x) * 4
        totR += inPix.data[i]
        totG += inPix.data[i + 1]
        totB += inPix.data[i + 2]
      }
      for (x = 0; x < width; x++) {
        if (x > radius) {
          i = (indx - radius - 1) * 4
          totR -= inPix.data[i]
          totG -= inPix.data[i + 1]
          totB -= inPix.data[i + 2]
        }
        if (x + radius < width) {
          i = (indx + radius) * 4
          totR += inPix.data[i]
          totG += inPix.data[i + 1]
          totB += inPix.data[i + 2]
        }
        i = indx * 4
        outPix.data[i] = (totR * mul) | 0
        outPix.data[i + 1] = (totG * mul) | 0
        outPix.data[i + 2] = (totB * mul) | 0
        outPix.data[i + 3] = alpha
        indx++
      }
    }
  }

  return this
}

export default brushedMetalTexture

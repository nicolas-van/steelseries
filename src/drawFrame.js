import { rgbaColor, ConicalGradient, createBuffer, TWO_PI } from './tools'

const drawFrame = function (
  ctx,
  frameDesign,
  centerX,
  centerY,
  imageWidth,
  imageHeight
) {
  let radFBuffer
  let radFCtx
  let grad
  let outerX
  let innerX
  let fractions
  let colors
  const cacheKey = imageWidth.toString() + imageHeight + frameDesign.design

  // check if we have already created and cached this buffer, if not create it
  if (!drawFrame.cache[cacheKey]) {
    // Setup buffer
    radFBuffer = createBuffer(imageWidth, imageHeight)
    radFCtx = radFBuffer.getContext('2d')

    // outer gray frame
    radFCtx.fillStyle = '#848484'
    radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.5)'
    radFCtx.beginPath()
    radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true)
    radFCtx.closePath()
    radFCtx.fill()
    radFCtx.stroke()

    radFCtx.beginPath()
    radFCtx.arc(centerX, centerY, (imageWidth * 0.990654) / 2, 0, TWO_PI, true)
    radFCtx.closePath()

    // main gradient frame
    switch (frameDesign.design) {
      case 'metal':
        grad = radFCtx.createLinearGradient(
          0,
          imageWidth * 0.004672,
          0,
          imageHeight * 0.990654
        )
        grad.addColorStop(0, '#fefefe')
        grad.addColorStop(0.07, 'rgb(210, 210, 210)')
        grad.addColorStop(0.12, 'rgb(179, 179, 179)')
        grad.addColorStop(1, 'rgb(213, 213, 213)')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        break

      case 'brass':
        grad = radFCtx.createLinearGradient(
          0,
          imageWidth * 0.004672,
          0,
          imageHeight * 0.990654
        )
        grad.addColorStop(0, 'rgb(249, 243, 155)')
        grad.addColorStop(0.05, 'rgb(246, 226, 101)')
        grad.addColorStop(0.1, 'rgb(240, 225, 132)')
        grad.addColorStop(0.5, 'rgb(90, 57, 22)')
        grad.addColorStop(0.9, 'rgb(249, 237, 139)')
        grad.addColorStop(0.95, 'rgb(243, 226, 108)')
        grad.addColorStop(1, 'rgb(202, 182, 113)')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        break

      case 'steel':
        grad = radFCtx.createLinearGradient(
          0,
          imageWidth * 0.004672,
          0,
          imageHeight * 0.990654
        )
        grad.addColorStop(0, 'rgb(231, 237, 237)')
        grad.addColorStop(0.05, 'rgb(189, 199, 198)')
        grad.addColorStop(0.1, 'rgb(192, 201, 200)')
        grad.addColorStop(0.5, 'rgb(23, 31, 33)')
        grad.addColorStop(0.9, 'rgb(196, 205, 204)')
        grad.addColorStop(0.95, 'rgb(194, 204, 203)')
        grad.addColorStop(1, 'rgb(189, 201, 199)')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        break

      case 'gold':
        grad = radFCtx.createLinearGradient(
          0,
          imageWidth * 0.004672,
          0,
          imageHeight * 0.990654
        )
        grad.addColorStop(0, 'rgb(255, 255, 207)')
        grad.addColorStop(0.15, 'rgb(255, 237, 96)')
        grad.addColorStop(0.22, 'rgb(254, 199, 57)')
        grad.addColorStop(0.3, 'rgb(255, 249, 203)')
        grad.addColorStop(0.38, 'rgb(255, 199, 64)')
        grad.addColorStop(0.44, 'rgb(252, 194, 60)')
        grad.addColorStop(0.51, 'rgb(255, 204, 59)')
        grad.addColorStop(0.6, 'rgb(213, 134, 29)')
        grad.addColorStop(0.68, 'rgb(255, 201, 56)')
        grad.addColorStop(0.75, 'rgb(212, 135, 29)')
        grad.addColorStop(1, 'rgb(247, 238, 101)')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        break

      case 'anthracite':
        grad = radFCtx.createLinearGradient(
          0,
          0.004672 * imageHeight,
          0,
          0.995326 * imageHeight
        )
        grad.addColorStop(0, 'rgb(118, 117, 135)')
        grad.addColorStop(0.06, 'rgb(74, 74, 82)')
        grad.addColorStop(0.12, 'rgb(50, 50, 54)')
        grad.addColorStop(1, 'rgb(79, 79, 87)')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        break

      case 'tiltedGray':
        grad = radFCtx.createLinearGradient(
          0.233644 * imageWidth,
          0.084112 * imageHeight,
          0.81258 * imageWidth,
          0.910919 * imageHeight
        )
        grad.addColorStop(0, '#ffffff')
        grad.addColorStop(0.07, 'rgb(210, 210, 210)')
        grad.addColorStop(0.16, 'rgb(179, 179, 179)')
        grad.addColorStop(0.33, '#ffffff')
        grad.addColorStop(0.55, '#c5c5c5')
        grad.addColorStop(0.79, '#ffffff')
        grad.addColorStop(1, '#666666')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        break

      case 'tiltedBlack':
        grad = radFCtx.createLinearGradient(
          0.228971 * imageWidth,
          0.079439 * imageHeight,
          0.802547 * imageWidth,
          0.898591 * imageHeight
        )
        grad.addColorStop(0, '#666666')
        grad.addColorStop(0.21, '#000000')
        grad.addColorStop(0.47, '#666666')
        grad.addColorStop(0.99, '#000000')
        grad.addColorStop(1, '#000000')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        break

      case 'glossyMetal':
        grad = radFCtx.createRadialGradient(
          0.5 * imageWidth,
          0.5 * imageHeight,
          0,
          0.5 * imageWidth,
          0.5 * imageWidth,
          0.5 * imageWidth
        )
        grad.addColorStop(0, 'rgb(207, 207, 207)')
        grad.addColorStop(0.96, 'rgb(205, 204, 205)')
        grad.addColorStop(1, 'rgb(244, 244, 244)')
        radFCtx.fillStyle = grad
        radFCtx.fill()
        radFCtx.beginPath()
        radFCtx.arc(
          0.5 * imageWidth,
          0.5 * imageHeight,
          (0.973962 * imageWidth) / 2,
          0,
          TWO_PI
        )
        radFCtx.closePath()
        grad = radFCtx.createLinearGradient(
          0,
          imageHeight - 0.971962 * imageHeight,
          0,
          0.971962 * imageHeight
        )
        grad.addColorStop(0, 'rgb(249, 249, 249)')
        grad.addColorStop(0.23, 'rgb(200, 195, 191)')
        grad.addColorStop(0.36, '#ffffff')
        grad.addColorStop(0.59, 'rgb(29, 29, 29)')
        grad.addColorStop(0.76, 'rgb(200, 194, 192)')
        grad.addColorStop(1, 'rgb(209, 209, 209)')
        radFCtx.fillStyle = grad
        radFCtx.fill()

        radFCtx.beginPath()
        radFCtx.arc(
          0.5 * imageWidth,
          0.5 * imageHeight,
          (0.869158 * imageWidth) / 2,
          0,
          TWO_PI
        )
        radFCtx.closePath()
        radFCtx.fillStyle = '#f6f6f6'
        radFCtx.fill()

        radFCtx.beginPath()
        radFCtx.arc(
          0.5 * imageWidth,
          0.5 * imageHeight,
          (0.85 * imageWidth) / 2,
          0,
          TWO_PI
        )
        radFCtx.closePath()
        radFCtx.fillStyle = '#333333'
        radFCtx.fill()
        break

      case 'blackMetal':
        fractions = [0, 0.125, 0.347222, 0.5, 0.680555, 0.875, 1]

        colors = [
          new rgbaColor(254, 254, 254, 1),
          new rgbaColor(0, 0, 0, 1),
          new rgbaColor(153, 153, 153, 1),
          new rgbaColor(0, 0, 0, 1),
          new rgbaColor(153, 153, 153, 1),
          new rgbaColor(0, 0, 0, 1),
          new rgbaColor(254, 254, 254, 1)
        ]

        radFCtx.save()
        radFCtx.arc(
          centerX,
          centerY,
          (imageWidth * 0.990654) / 2,
          0,
          TWO_PI,
          true
        )
        radFCtx.clip()
        outerX = imageWidth * 0.495327
        innerX = imageWidth * 0.42056
        grad = new ConicalGradient(fractions, colors)
        grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX)
        // fade outer edge
        radFCtx.strokeStyle = '#848484'
        radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.8)'
        radFCtx.beginPath()
        radFCtx.lineWidth = imageWidth / 90
        radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true)
        radFCtx.closePath()
        radFCtx.stroke()
        radFCtx.restore()
        break

      case 'shinyMetal':
        fractions = [0, 0.125, 0.25, 0.347222, 0.5, 0.652777, 0.75, 0.875, 1]

        colors = [
          new rgbaColor(254, 254, 254, 1),
          new rgbaColor(210, 210, 210, 1),
          new rgbaColor(179, 179, 179, 1),
          new rgbaColor(238, 238, 238, 1),
          new rgbaColor(160, 160, 160, 1),
          new rgbaColor(238, 238, 238, 1),
          new rgbaColor(179, 179, 179, 1),
          new rgbaColor(210, 210, 210, 1),
          new rgbaColor(254, 254, 254, 1)
        ]

        radFCtx.save()
        radFCtx.arc(
          centerX,
          centerY,
          (imageWidth * 0.990654) / 2,
          0,
          TWO_PI,
          true
        )
        radFCtx.clip()
        outerX = imageWidth * 0.495327
        innerX = imageWidth * 0.42056
        grad = new ConicalGradient(fractions, colors)
        grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX)
        // fade outer edge
        radFCtx.strokeStyle = '#848484'
        radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.8)'
        radFCtx.beginPath()
        radFCtx.lineWidth = imageWidth / 90
        radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true)
        radFCtx.closePath()
        radFCtx.stroke()
        radFCtx.restore()
        break

      case 'chrome':
        fractions = [
          0,
          0.09,
          0.12,
          0.16,
          0.25,
          0.29,
          0.33,
          0.38,
          0.48,
          0.52,
          0.63,
          0.68,
          0.8,
          0.83,
          0.87,
          0.97,
          1
        ]

        colors = [
          new rgbaColor(255, 255, 255, 1),
          new rgbaColor(255, 255, 255, 1),
          new rgbaColor(136, 136, 138, 1),
          new rgbaColor(164, 185, 190, 1),
          new rgbaColor(158, 179, 182, 1),
          new rgbaColor(112, 112, 112, 1),
          new rgbaColor(221, 227, 227, 1),
          new rgbaColor(155, 176, 179, 1),
          new rgbaColor(156, 176, 177, 1),
          new rgbaColor(254, 255, 255, 1),
          new rgbaColor(255, 255, 255, 1),
          new rgbaColor(156, 180, 180, 1),
          new rgbaColor(198, 209, 211, 1),
          new rgbaColor(246, 248, 247, 1),
          new rgbaColor(204, 216, 216, 1),
          new rgbaColor(164, 188, 190, 1),
          new rgbaColor(255, 255, 255, 1)
        ]

        radFCtx.save()
        radFCtx.arc(
          centerX,
          centerY,
          (imageWidth * 0.990654) / 2,
          0,
          TWO_PI,
          true
        )
        radFCtx.clip()
        outerX = imageWidth * 0.495327
        innerX = imageWidth * 0.42056
        grad = new ConicalGradient(fractions, colors)
        grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX)
        // fade outer edge
        radFCtx.strokeStyle = '#848484'
        radFCtx.strokeStyle = 'rgba(132, 132, 132, 0.8)'
        radFCtx.beginPath()
        radFCtx.lineWidth = imageWidth / 90
        radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true)
        radFCtx.closePath()
        radFCtx.stroke()
        radFCtx.restore()

        break
    }

    // inner bright frame
    radFCtx.fillStyle = 'rgb(191, 191, 191)'
    radFCtx.beginPath()
    radFCtx.arc(centerX, centerY, (imageWidth * 0.841121) / 2, 0, TWO_PI, true)
    radFCtx.closePath()
    radFCtx.fill()

    // clip out center so it is transparent if the background is not visible
    radFCtx.globalCompositeOperation = 'destination-out'
    // Background ellipse
    radFCtx.beginPath()
    radFCtx.arc(centerX, centerY, (imageWidth * 0.83) / 2, 0, TWO_PI, true)
    radFCtx.closePath()
    radFCtx.fill()

    // cache the buffer
    drawFrame.cache[cacheKey] = radFBuffer
  }
  ctx.drawImage(drawFrame.cache[cacheKey], 0, 0)
  return this
}
drawFrame.cache = {}

export default drawFrame

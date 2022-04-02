import { TWO_PI, RAD_FACTOR } from './tools.js'

const drawRoseImage = function (
  ctx,
  centerX,
  centerY,
  imageWidth,
  imageHeight,
  backgroundColor
) {
  let fill = true
  let i
  let grad
  const symbolColor = backgroundColor.symbolColor.getRgbaColor()

  ctx.save()
  ctx.lineWidth = 1
  ctx.fillStyle = symbolColor
  ctx.strokeStyle = symbolColor
  ctx.translate(centerX, centerY)
  // broken ring
  for (i = 0; i < 360; i += 15) {
    fill = !fill

    ctx.beginPath()
    ctx.arc(
      0,
      0,
      imageWidth * 0.26,
      i * RAD_FACTOR,
      (i + 15) * RAD_FACTOR,
      false
    )
    ctx.arc(
      0,
      0,
      imageWidth * 0.23,
      (i + 15) * RAD_FACTOR,
      i * RAD_FACTOR,
      true
    )
    ctx.closePath()
    if (fill) {
      ctx.fill()
    }
    ctx.stroke()
  }

  ctx.translate(-centerX, -centerY)

  for (i = 0; i <= 360; i += 90) {
    // Small pointers
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.560747, imageHeight * 0.584112)
    ctx.lineTo(imageWidth * 0.640186, imageHeight * 0.644859)
    ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.560747)
    ctx.lineTo(imageWidth * 0.560747, imageHeight * 0.584112)
    ctx.closePath()
    ctx.fillStyle = symbolColor
    ctx.fill()
    ctx.stroke()
    // Large pointers
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.397196)
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.196261)
    ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.397196)
    ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.397196)
    ctx.closePath()
    grad = ctx.createLinearGradient(
      0.476635 * imageWidth,
      0,
      0.518691 * imageWidth,
      0
    )
    grad.addColorStop(0, 'rgb(222, 223, 218)')
    grad.addColorStop(0.48, 'rgb(222, 223, 218)')
    grad.addColorStop(0.49, symbolColor)
    grad.addColorStop(1, symbolColor)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.stroke()
    ctx.translate(centerX, centerY)
    ctx.rotate(i * RAD_FACTOR)
    ctx.translate(-centerX, -centerY)
  }

  // Central ring
  ctx.beginPath()
  ctx.translate(centerX, centerY)
  ctx.arc(0, 0, imageWidth * 0.1, 0, TWO_PI, false)
  ctx.lineWidth = imageWidth * 0.022
  ctx.stroke()
  ctx.translate(-centerX, -centerY)

  ctx.restore()
}

export default drawRoseImage

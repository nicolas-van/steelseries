import { TWO_PI } from './tools'

const drawRadialCustomImage = function (
  ctx,
  img,
  centerX,
  centerY,
  imageWidth,
  imageHeight
) {
  const drawWidth = imageWidth * 0.831775
  const drawHeight = imageHeight * 0.831775
  const x = (imageWidth - drawWidth) / 2
  const y = (imageHeight - drawHeight) / 2

  if (img !== null && img.height > 0 && img.width > 0) {
    ctx.save()
    // Set the clipping area
    ctx.beginPath()
    ctx.arc(centerX, centerY, (imageWidth * 0.831775) / 2, 0, TWO_PI, true)
    ctx.clip()
    // Add the image
    ctx.drawImage(img, x, y, drawWidth, drawHeight)
    ctx.restore()
  }
  return this
}

export default drawRadialCustomImage

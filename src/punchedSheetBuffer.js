import { drawToBuffer } from './tools'

const punchedSheetBuffer = drawToBuffer(15, 15, function (ctx) {
  const imageWidth = ctx.canvas.width
  const imageHeight = ctx.canvas.height
  let grad

  ctx.save()

  // BACK
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, imageWidth, imageHeight)
  ctx.closePath()
  ctx.restore()
  ctx.fillStyle = '#1D2123'
  ctx.fill()

  // ULB
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(0, imageHeight * 0.266666)
  ctx.bezierCurveTo(
    0,
    imageHeight * 0.4,
    imageWidth * 0.066666,
    imageHeight * 0.466666,
    imageWidth * 0.2,
    imageHeight * 0.466666
  )
  ctx.bezierCurveTo(
    imageWidth * 0.333333,
    imageHeight * 0.466666,
    imageWidth * 0.4,
    imageHeight * 0.4,
    imageWidth * 0.4,
    imageHeight * 0.266666
  )
  ctx.bezierCurveTo(
    imageWidth * 0.4,
    imageHeight * 0.133333,
    imageWidth * 0.333333,
    imageHeight * 0.066666,
    imageWidth * 0.2,
    imageHeight * 0.066666
  )
  ctx.bezierCurveTo(
    imageWidth * 0.066666,
    imageHeight * 0.066666,
    0,
    imageHeight * 0.133333,
    0,
    imageHeight * 0.266666
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(
    0,
    0.066666 * imageHeight,
    0,
    0.466666 * imageHeight
  )
  grad.addColorStop(0, '#000000')
  grad.addColorStop(1, '#444444')
  ctx.fillStyle = grad
  ctx.fill()

  // ULF
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(0, imageHeight * 0.2)
  ctx.bezierCurveTo(
    0,
    imageHeight * 0.333333,
    imageWidth * 0.066666,
    imageHeight * 0.4,
    imageWidth * 0.2,
    imageHeight * 0.4
  )
  ctx.bezierCurveTo(
    imageWidth * 0.333333,
    imageHeight * 0.4,
    imageWidth * 0.4,
    imageHeight * 0.333333,
    imageWidth * 0.4,
    imageHeight * 0.2
  )
  ctx.bezierCurveTo(
    imageWidth * 0.4,
    imageHeight * 0.066666,
    imageWidth * 0.333333,
    0,
    imageWidth * 0.2,
    0
  )
  ctx.bezierCurveTo(
    imageWidth * 0.066666,
    0,
    0,
    imageHeight * 0.066666,
    0,
    imageHeight * 0.2
  )
  ctx.closePath()
  ctx.fillStyle = '#050506'
  ctx.fill()

  // LRB
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(imageWidth * 0.466666, imageHeight * 0.733333)
  ctx.bezierCurveTo(
    imageWidth * 0.466666,
    imageHeight * 0.866666,
    imageWidth * 0.533333,
    imageHeight * 0.933333,
    imageWidth * 0.666666,
    imageHeight * 0.933333
  )
  ctx.bezierCurveTo(
    imageWidth * 0.8,
    imageHeight * 0.933333,
    imageWidth * 0.866666,
    imageHeight * 0.866666,
    imageWidth * 0.866666,
    imageHeight * 0.733333
  )
  ctx.bezierCurveTo(
    imageWidth * 0.866666,
    imageHeight * 0.6,
    imageWidth * 0.8,
    imageHeight * 0.533333,
    imageWidth * 0.666666,
    imageHeight * 0.533333
  )
  ctx.bezierCurveTo(
    imageWidth * 0.533333,
    imageHeight * 0.533333,
    imageWidth * 0.466666,
    imageHeight * 0.6,
    imageWidth * 0.466666,
    imageHeight * 0.733333
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(
    0,
    0.533333 * imageHeight,
    0,
    0.933333 * imageHeight
  )
  grad.addColorStop(0, '#000000')
  grad.addColorStop(1, '#444444')
  ctx.fillStyle = grad
  ctx.fill()

  // LRF
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(imageWidth * 0.466666, imageHeight * 0.666666)
  ctx.bezierCurveTo(
    imageWidth * 0.466666,
    imageHeight * 0.8,
    imageWidth * 0.533333,
    imageHeight * 0.866666,
    imageWidth * 0.666666,
    imageHeight * 0.866666
  )
  ctx.bezierCurveTo(
    imageWidth * 0.8,
    imageHeight * 0.866666,
    imageWidth * 0.866666,
    imageHeight * 0.8,
    imageWidth * 0.866666,
    imageHeight * 0.666666
  )
  ctx.bezierCurveTo(
    imageWidth * 0.866666,
    imageHeight * 0.533333,
    imageWidth * 0.8,
    imageHeight * 0.466666,
    imageWidth * 0.666666,
    imageHeight * 0.466666
  )
  ctx.bezierCurveTo(
    imageWidth * 0.533333,
    imageHeight * 0.466666,
    imageWidth * 0.466666,
    imageHeight * 0.533333,
    imageWidth * 0.466666,
    imageHeight * 0.666666
  )
  ctx.closePath()
  ctx.fillStyle = '#050506'
  ctx.fill()

  ctx.restore()
})

export default punchedSheetBuffer

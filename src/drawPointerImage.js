import { createBuffer, TWO_PI } from './tools.js'

const drawPointerImage = function (ctx, size, ptrType, ptrColor, lblColor) {
  let ptrBuffer
  let ptrCtx
  let grad
  let radius
  const cacheKey =
    size.toString() +
    ptrType.type +
    ptrColor.light.getHexColor() +
    ptrColor.medium.getHexColor()

  // check if we have already created and cached this buffer, if not create it
  if (!drawPointerImage.cache[cacheKey]) {
    // create a pointer buffer
    ptrBuffer = createBuffer(size, size)
    ptrCtx = ptrBuffer.getContext('2d')

    switch (ptrType.type) {
      case 'type2':
        grad = ptrCtx.createLinearGradient(
          0,
          size * 0.471962,
          0,
          size * 0.130841
        )
        grad.addColorStop(0, lblColor.getRgbaColor())
        grad.addColorStop(0.36, lblColor.getRgbaColor())
        grad.addColorStop(0.361, ptrColor.light.getRgbaColor())
        grad.addColorStop(1, ptrColor.light.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.518691, size * 0.471962)
        ptrCtx.lineTo(size * 0.509345, size * 0.462616)
        ptrCtx.lineTo(size * 0.509345, size * 0.341121)
        ptrCtx.lineTo(size * 0.504672, size * 0.130841)
        ptrCtx.lineTo(size * 0.495327, size * 0.130841)
        ptrCtx.lineTo(size * 0.490654, size * 0.341121)
        ptrCtx.lineTo(size * 0.490654, size * 0.462616)
        ptrCtx.lineTo(size * 0.481308, size * 0.471962)
        ptrCtx.closePath()
        ptrCtx.fill()
        break

      case 'type3':
        ptrCtx.beginPath()
        ptrCtx.rect(
          size * 0.495327,
          size * 0.130841,
          size * 0.009345,
          size * 0.373831
        )
        ptrCtx.closePath()
        ptrCtx.fillStyle = ptrColor.light.getRgbaColor()
        ptrCtx.fill()
        break

      case 'type4':
        grad = ptrCtx.createLinearGradient(
          0.467289 * size,
          0,
          0.528036 * size,
          0
        )
        grad.addColorStop(0, ptrColor.dark.getRgbaColor())
        grad.addColorStop(0.51, ptrColor.dark.getRgbaColor())
        grad.addColorStop(0.52, ptrColor.light.getRgbaColor())
        grad.addColorStop(1, ptrColor.light.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.5, size * 0.126168)
        ptrCtx.lineTo(size * 0.514018, size * 0.135514)
        ptrCtx.lineTo(size * 0.53271, size * 0.5)
        ptrCtx.lineTo(size * 0.523364, size * 0.602803)
        ptrCtx.lineTo(size * 0.476635, size * 0.602803)
        ptrCtx.lineTo(size * 0.467289, size * 0.5)
        ptrCtx.lineTo(size * 0.485981, size * 0.135514)
        ptrCtx.lineTo(size * 0.5, size * 0.126168)
        ptrCtx.closePath()
        ptrCtx.fill()
        break

      case 'type5':
        grad = ptrCtx.createLinearGradient(
          0.471962 * size,
          0,
          0.528036 * size,
          0
        )
        grad.addColorStop(0, ptrColor.light.getRgbaColor())
        grad.addColorStop(0.5, ptrColor.light.getRgbaColor())
        grad.addColorStop(0.5, ptrColor.medium.getRgbaColor())
        grad.addColorStop(1, ptrColor.medium.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.5, size * 0.495327)
        ptrCtx.lineTo(size * 0.528037, size * 0.495327)
        ptrCtx.lineTo(size * 0.5, size * 0.149532)
        ptrCtx.lineTo(size * 0.471962, size * 0.495327)
        ptrCtx.lineTo(size * 0.5, size * 0.495327)
        ptrCtx.closePath()
        ptrCtx.fill()

        ptrCtx.lineWidth = 1
        ptrCtx.lineCap = 'square'
        ptrCtx.lineJoin = 'miter'
        ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor()
        ptrCtx.stroke()
        break

      case 'type6':
        ptrCtx.fillStyle = ptrColor.medium.getRgbaColor()
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.481308, size * 0.485981)
        ptrCtx.lineTo(size * 0.481308, size * 0.392523)
        ptrCtx.lineTo(size * 0.485981, size * 0.317757)
        ptrCtx.lineTo(size * 0.495327, size * 0.130841)
        ptrCtx.lineTo(size * 0.504672, size * 0.130841)
        ptrCtx.lineTo(size * 0.514018, size * 0.317757)
        ptrCtx.lineTo(size * 0.518691, size * 0.38785)
        ptrCtx.lineTo(size * 0.518691, size * 0.485981)
        ptrCtx.lineTo(size * 0.504672, size * 0.485981)
        ptrCtx.lineTo(size * 0.504672, size * 0.38785)
        ptrCtx.lineTo(size * 0.5, size * 0.317757)
        ptrCtx.lineTo(size * 0.495327, size * 0.392523)
        ptrCtx.lineTo(size * 0.495327, size * 0.485981)
        ptrCtx.lineTo(size * 0.481308, size * 0.485981)
        ptrCtx.closePath()
        ptrCtx.fill()
        break

      case 'type7':
        grad = ptrCtx.createLinearGradient(
          0.481308 * size,
          0,
          0.518691 * size,
          0
        )
        grad.addColorStop(0, ptrColor.dark.getRgbaColor())
        grad.addColorStop(1, ptrColor.medium.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.490654, size * 0.130841)
        ptrCtx.lineTo(size * 0.481308, size * 0.5)
        ptrCtx.lineTo(size * 0.518691, size * 0.5)
        ptrCtx.lineTo(size * 0.504672, size * 0.130841)
        ptrCtx.lineTo(size * 0.490654, size * 0.130841)
        ptrCtx.closePath()
        ptrCtx.fill()
        break

      case 'type8':
        grad = ptrCtx.createLinearGradient(
          0.471962 * size,
          0,
          0.528036 * size,
          0
        )
        grad.addColorStop(0, ptrColor.light.getRgbaColor())
        grad.addColorStop(0.5, ptrColor.light.getRgbaColor())
        grad.addColorStop(0.5, ptrColor.medium.getRgbaColor())
        grad.addColorStop(1, ptrColor.medium.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor()
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.5, size * 0.53271)
        ptrCtx.lineTo(size * 0.53271, size * 0.5)
        ptrCtx.bezierCurveTo(
          size * 0.53271,
          size * 0.5,
          size * 0.509345,
          size * 0.457943,
          size * 0.5,
          size * 0.149532
        )
        ptrCtx.bezierCurveTo(
          size * 0.490654,
          size * 0.457943,
          size * 0.467289,
          size * 0.5,
          size * 0.467289,
          size * 0.5
        )
        ptrCtx.lineTo(size * 0.5, size * 0.53271)
        ptrCtx.closePath()
        ptrCtx.fill()
        ptrCtx.stroke()
        break

      case 'type9':
        grad = ptrCtx.createLinearGradient(
          0.471962 * size,
          0,
          0.528036 * size,
          0
        )
        grad.addColorStop(0, 'rgb(50, 50, 50)')
        grad.addColorStop(0.5, '#666666')
        grad.addColorStop(1, 'rgb(50, 50, 50)')
        ptrCtx.fillStyle = grad
        ptrCtx.strokeStyle = '#2E2E2E'
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.495327, size * 0.233644)
        ptrCtx.lineTo(size * 0.504672, size * 0.233644)
        ptrCtx.lineTo(size * 0.514018, size * 0.439252)
        ptrCtx.lineTo(size * 0.485981, size * 0.439252)
        ptrCtx.lineTo(size * 0.495327, size * 0.233644)
        ptrCtx.closePath()
        ptrCtx.moveTo(size * 0.490654, size * 0.130841)
        ptrCtx.lineTo(size * 0.471962, size * 0.471962)
        ptrCtx.lineTo(size * 0.471962, size * 0.528037)
        ptrCtx.bezierCurveTo(
          size * 0.471962,
          size * 0.528037,
          size * 0.476635,
          size * 0.602803,
          size * 0.476635,
          size * 0.602803
        )
        ptrCtx.bezierCurveTo(
          size * 0.476635,
          size * 0.607476,
          size * 0.481308,
          size * 0.607476,
          size * 0.5,
          size * 0.607476
        )
        ptrCtx.bezierCurveTo(
          size * 0.518691,
          size * 0.607476,
          size * 0.523364,
          size * 0.607476,
          size * 0.523364,
          size * 0.602803
        )
        ptrCtx.bezierCurveTo(
          size * 0.523364,
          size * 0.602803,
          size * 0.528037,
          size * 0.528037,
          size * 0.528037,
          size * 0.528037
        )
        ptrCtx.lineTo(size * 0.528037, size * 0.471962)
        ptrCtx.lineTo(size * 0.509345, size * 0.130841)
        ptrCtx.lineTo(size * 0.490654, size * 0.130841)
        ptrCtx.closePath()
        ptrCtx.fill()

        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.495327, size * 0.219626)
        ptrCtx.lineTo(size * 0.504672, size * 0.219626)
        ptrCtx.lineTo(size * 0.504672, size * 0.135514)
        ptrCtx.lineTo(size * 0.495327, size * 0.135514)
        ptrCtx.lineTo(size * 0.495327, size * 0.219626)
        ptrCtx.closePath()

        ptrCtx.fillStyle = ptrColor.medium.getRgbaColor()
        ptrCtx.fill()
        break

      case 'type10':
        // POINTER_TYPE10
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.5, size * 0.149532)
        ptrCtx.bezierCurveTo(
          size * 0.5,
          size * 0.149532,
          size * 0.443925,
          size * 0.490654,
          size * 0.443925,
          size * 0.5
        )
        ptrCtx.bezierCurveTo(
          size * 0.443925,
          size * 0.53271,
          size * 0.467289,
          size * 0.556074,
          size * 0.5,
          size * 0.556074
        )
        ptrCtx.bezierCurveTo(
          size * 0.53271,
          size * 0.556074,
          size * 0.556074,
          size * 0.53271,
          size * 0.556074,
          size * 0.5
        )
        ptrCtx.bezierCurveTo(
          size * 0.556074,
          size * 0.490654,
          size * 0.5,
          size * 0.149532,
          size * 0.5,
          size * 0.149532
        )
        ptrCtx.closePath()
        grad = ptrCtx.createLinearGradient(
          0.471962 * size,
          0,
          0.528036 * size,
          0
        )
        grad.addColorStop(0, ptrColor.light.getRgbaColor())
        grad.addColorStop(0.5, ptrColor.light.getRgbaColor())
        grad.addColorStop(0.5, ptrColor.medium.getRgbaColor())
        grad.addColorStop(1, ptrColor.medium.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.strokeStyle = ptrColor.medium.getRgbaColor()
        ptrCtx.lineWidth = 1
        ptrCtx.lineCap = 'square'
        ptrCtx.lineJoin = 'miter'
        ptrCtx.fill()
        ptrCtx.stroke()
        break

      case 'type11':
        // POINTER_TYPE11
        ptrCtx.beginPath()
        ptrCtx.moveTo(0.5 * size, 0.168224 * size)
        ptrCtx.lineTo(0.485981 * size, 0.5 * size)
        ptrCtx.bezierCurveTo(
          0.485981 * size,
          0.5 * size,
          0.481308 * size,
          0.584112 * size,
          0.5 * size,
          0.584112 * size
        )
        ptrCtx.bezierCurveTo(
          0.514018 * size,
          0.584112 * size,
          0.509345 * size,
          0.5 * size,
          0.509345 * size,
          0.5 * size
        )
        ptrCtx.lineTo(0.5 * size, 0.168224 * size)
        ptrCtx.closePath()
        grad = ptrCtx.createLinearGradient(
          0,
          0.168224 * size,
          0,
          0.584112 * size
        )
        grad.addColorStop(0, ptrColor.medium.getRgbaColor())
        grad.addColorStop(1, ptrColor.dark.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor()
        ptrCtx.fill()
        ptrCtx.stroke()
        break

      case 'type12':
        // POINTER_TYPE12
        ptrCtx.beginPath()
        ptrCtx.moveTo(0.5 * size, 0.168224 * size)
        ptrCtx.lineTo(0.485981 * size, 0.5 * size)
        ptrCtx.lineTo(0.5 * size, 0.504672 * size)
        ptrCtx.lineTo(0.509345 * size, 0.5 * size)
        ptrCtx.lineTo(0.5 * size, 0.168224 * size)
        ptrCtx.closePath()
        grad = ptrCtx.createLinearGradient(
          0,
          0.168224 * size,
          0,
          0.504672 * size
        )
        grad.addColorStop(0, ptrColor.medium.getRgbaColor())
        grad.addColorStop(1, ptrColor.dark.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor()
        ptrCtx.fill()
        ptrCtx.stroke()
        break

      case 'type13':
      // POINTER_TYPE13
      // eslint-disable-next-line no-fallthrough
      case 'type14':
        // POINTER_TYPE14 (same shape as 13)
        ptrCtx.beginPath()
        ptrCtx.moveTo(0.485981 * size, 0.168224 * size)
        ptrCtx.lineTo(0.5 * size, 0.130841 * size)
        ptrCtx.lineTo(0.509345 * size, 0.168224 * size)
        ptrCtx.lineTo(0.509345 * size, 0.509345 * size)
        ptrCtx.lineTo(0.485981 * size, 0.509345 * size)
        ptrCtx.lineTo(0.485981 * size, 0.168224 * size)
        ptrCtx.closePath()
        if (ptrType.type === 'type13') {
          // TYPE13
          grad = ptrCtx.createLinearGradient(0, 0.5 * size, 0, 0.130841 * size)
          grad.addColorStop(0, lblColor.getRgbaColor())
          grad.addColorStop(0.85, lblColor.getRgbaColor())
          grad.addColorStop(0.85, ptrColor.medium.getRgbaColor())
          grad.addColorStop(1, ptrColor.medium.getRgbaColor())
          ptrCtx.fillStyle = grad
        } else {
          // TYPE14
          grad = ptrCtx.createLinearGradient(
            0.485981 * size,
            0,
            0.509345 * size,
            0
          )
          grad.addColorStop(0, ptrColor.veryDark.getRgbaColor())
          grad.addColorStop(0.5, ptrColor.light.getRgbaColor())
          grad.addColorStop(1, ptrColor.veryDark.getRgbaColor())
          ptrCtx.fillStyle = grad
        }
        ptrCtx.fill()
        break

      case 'type15':
      // POINTER TYPE15 - Classic with crescent
      // eslint-disable-next-line no-fallthrough
      case 'type16':
        // POINTER TYPE16 - Classic without crescent
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.509345, size * 0.457943)
        ptrCtx.lineTo(size * 0.5015, size * 0.13)
        ptrCtx.lineTo(size * 0.4985, size * 0.13)
        ptrCtx.lineTo(size * 0.490654, size * 0.457943)
        ptrCtx.bezierCurveTo(
          size * 0.490654,
          size * 0.457943,
          size * 0.490654,
          size * 0.457943,
          size * 0.490654,
          size * 0.457943
        )
        ptrCtx.bezierCurveTo(
          size * 0.471962,
          size * 0.462616,
          size * 0.457943,
          size * 0.481308,
          size * 0.457943,
          size * 0.5
        )
        ptrCtx.bezierCurveTo(
          size * 0.457943,
          size * 0.518691,
          size * 0.471962,
          size * 0.537383,
          size * 0.490654,
          size * 0.542056
        )
        ptrCtx.bezierCurveTo(
          size * 0.490654,
          size * 0.542056,
          size * 0.490654,
          size * 0.542056,
          size * 0.490654,
          size * 0.542056
        )
        if (ptrType.type === 'type15') {
          ptrCtx.lineTo(size * 0.490654, size * 0.57)
          ptrCtx.bezierCurveTo(
            size * 0.46,
            size * 0.58,
            size * 0.46,
            size * 0.62,
            size * 0.490654,
            size * 0.63
          )
          ptrCtx.bezierCurveTo(
            size * 0.47,
            size * 0.62,
            size * 0.48,
            size * 0.59,
            size * 0.5,
            size * 0.59
          )
          ptrCtx.bezierCurveTo(
            size * 0.53,
            size * 0.59,
            size * 0.52,
            size * 0.62,
            size * 0.509345,
            size * 0.63
          )
          ptrCtx.bezierCurveTo(
            size * 0.54,
            size * 0.62,
            size * 0.54,
            size * 0.58,
            size * 0.509345,
            size * 0.57
          )
          ptrCtx.lineTo(size * 0.509345, size * 0.57)
        } else {
          ptrCtx.lineTo(size * 0.490654, size * 0.621495)
          ptrCtx.lineTo(size * 0.509345, size * 0.621495)
        }
        ptrCtx.lineTo(size * 0.509345, size * 0.542056)
        ptrCtx.bezierCurveTo(
          size * 0.509345,
          size * 0.542056,
          size * 0.509345,
          size * 0.542056,
          size * 0.509345,
          size * 0.542056
        )
        ptrCtx.bezierCurveTo(
          size * 0.528037,
          size * 0.537383,
          size * 0.542056,
          size * 0.518691,
          size * 0.542056,
          size * 0.5
        )
        ptrCtx.bezierCurveTo(
          size * 0.542056,
          size * 0.481308,
          size * 0.528037,
          size * 0.462616,
          size * 0.509345,
          size * 0.457943
        )
        ptrCtx.bezierCurveTo(
          size * 0.509345,
          size * 0.457943,
          size * 0.509345,
          size * 0.457943,
          size * 0.509345,
          size * 0.457943
        )
        ptrCtx.closePath()
        if (ptrType.type === 'type15') {
          grad = ptrCtx.createLinearGradient(0, 0, 0, size * 0.63)
        } else {
          grad = ptrCtx.createLinearGradient(0, 0, 0, size * 0.621495)
        }
        grad.addColorStop(0, ptrColor.medium.getRgbaColor())
        grad.addColorStop(0.388888, ptrColor.medium.getRgbaColor())
        grad.addColorStop(0.5, ptrColor.light.getRgbaColor())
        grad.addColorStop(0.611111, ptrColor.medium.getRgbaColor())
        grad.addColorStop(1, ptrColor.medium.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor()
        ptrCtx.fill()
        ptrCtx.stroke()
        // Draw the rings
        ptrCtx.beginPath()
        radius = (size * 0.06542) / 2
        ptrCtx.arc(size * 0.5, size * 0.5, radius, 0, TWO_PI)
        grad = ptrCtx.createLinearGradient(
          size * 0.5 - radius,
          size * 0.5 + radius,
          0,
          size * 0.5 + radius
        )
        grad.addColorStop(0, '#e6b35c')
        grad.addColorStop(0.01, '#e6b35c')
        grad.addColorStop(0.99, '#c48200')
        grad.addColorStop(1, '#c48200')
        ptrCtx.fillStyle = grad
        ptrCtx.closePath()
        ptrCtx.fill()
        ptrCtx.beginPath()
        radius = (size * 0.046728) / 2
        ptrCtx.arc(size * 0.5, size * 0.5, radius, 0, TWO_PI)
        grad = ptrCtx.createRadialGradient(
          size * 0.5,
          size * 0.5,
          0,
          size * 0.5,
          size * 0.5,
          radius
        )
        grad.addColorStop(0, '#c5c5c5')
        grad.addColorStop(0.19, '#c5c5c5')
        grad.addColorStop(0.22, '#000000')
        grad.addColorStop(0.8, '#000000')
        grad.addColorStop(0.99, '#707070')
        grad.addColorStop(1, '#707070')
        ptrCtx.fillStyle = grad
        ptrCtx.closePath()
        ptrCtx.fill()
        break

      case 'type1':
      /* falls through */
      default:
        grad = ptrCtx.createLinearGradient(
          0,
          size * 0.471962,
          0,
          size * 0.130841
        )
        grad.addColorStop(0, ptrColor.veryDark.getRgbaColor())
        grad.addColorStop(0.3, ptrColor.medium.getRgbaColor())
        grad.addColorStop(0.59, ptrColor.medium.getRgbaColor())
        grad.addColorStop(1, ptrColor.veryDark.getRgbaColor())
        ptrCtx.fillStyle = grad
        ptrCtx.beginPath()
        ptrCtx.moveTo(size * 0.518691, size * 0.471962)
        ptrCtx.bezierCurveTo(
          size * 0.514018,
          size * 0.457943,
          size * 0.509345,
          size * 0.415887,
          size * 0.509345,
          size * 0.401869
        )
        ptrCtx.bezierCurveTo(
          size * 0.504672,
          size * 0.383177,
          size * 0.5,
          size * 0.130841,
          size * 0.5,
          size * 0.130841
        )
        ptrCtx.bezierCurveTo(
          size * 0.5,
          size * 0.130841,
          size * 0.490654,
          size * 0.383177,
          size * 0.490654,
          size * 0.397196
        )
        ptrCtx.bezierCurveTo(
          size * 0.490654,
          size * 0.415887,
          size * 0.485981,
          size * 0.457943,
          size * 0.481308,
          size * 0.471962
        )
        ptrCtx.bezierCurveTo(
          size * 0.471962,
          size * 0.481308,
          size * 0.467289,
          size * 0.490654,
          size * 0.467289,
          size * 0.5
        )
        ptrCtx.bezierCurveTo(
          size * 0.467289,
          size * 0.518691,
          size * 0.481308,
          size * 0.53271,
          size * 0.5,
          size * 0.53271
        )
        ptrCtx.bezierCurveTo(
          size * 0.518691,
          size * 0.53271,
          size * 0.53271,
          size * 0.518691,
          size * 0.53271,
          size * 0.5
        )
        ptrCtx.bezierCurveTo(
          size * 0.53271,
          size * 0.490654,
          size * 0.528037,
          size * 0.481308,
          size * 0.518691,
          size * 0.471962
        )
        ptrCtx.closePath()
        ptrCtx.fill()
        break
    }
    // cache buffer
    drawPointerImage.cache[cacheKey] = ptrBuffer
  }
  ctx.drawImage(drawPointerImage.cache[cacheKey], 0, 0)
  return this
}
drawPointerImage.cache = {}

export default drawPointerImage

import drawFrame from './drawFrame'
import drawBackground from './drawBackground'
import drawRadialCustomImage from './drawRadialCustomImage'
import drawForeground from './drawForeground'
import {
  createBuffer,
  getCanvasContext,
  TWO_PI,
  PI,
  RAD_FACTOR,
  stdFontName
} from './tools'

import {
  BackgroundColor,
  ColorDef,
  FrameDesign,
  ForegroundType
} from './definitions'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

const Stopwatch = function (canvas, parameters) {
  parameters = parameters || {}
  let size = undefined === parameters.size ? 0 : parameters.size
  let frameDesign =
    undefined === parameters.frameDesign
      ? FrameDesign.METAL
      : parameters.frameDesign
  const frameVisible =
    undefined === parameters.frameVisible ? true : parameters.frameVisible
  let pointerColor =
    undefined === parameters.pointerColor
      ? ColorDef.BLACK
      : parameters.pointerColor
  let backgroundColor =
    undefined === parameters.backgroundColor
      ? BackgroundColor.LIGHT_GRAY
      : parameters.backgroundColor
  const backgroundVisible =
    undefined === parameters.backgroundVisible
      ? true
      : parameters.backgroundVisible
  let foregroundType =
    undefined === parameters.foregroundType
      ? ForegroundType.TYPE1
      : parameters.foregroundType
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const customLayer =
    undefined === parameters.customLayer ? null : parameters.customLayer

  let minutePointerAngle = 0
  let secondPointerAngle = 0
  let tickTimer
  const ANGLE_STEP = 6
  const self = this

  let start = 0
  let currentMilliSeconds = 0
  let minutes = 0
  let seconds = 0
  let milliSeconds = 0
  let running = false
  let lap = false
  // Get the canvas context
  const mainCtx = getCanvasContext(canvas)

  let initialized = false

  // Buffer for the frame
  let frameContext

  // Buffer for static background painting code
  let backgroundContext

  // Buffer for small pointer image painting code
  let smallPointerContext

  // Buffer for large pointer image painting code
  let largePointerContext

  // Buffer for static foreground painting code
  let foregroundContext

  const drawTickmarksImage = function (
    ctx,
    width,
    range,
    text_scale,
    text_dist_factor,
    x_offset,
    y_offset
  ) {
    const STD_FONT_SIZE = text_scale * width
    const STD_FONT = STD_FONT_SIZE + 'px ' + stdFontName
    const TEXT_WIDTH = width * 0.15
    const THIN_STROKE = 0.5
    const MEDIUM_STROKE = 1
    const THICK_STROKE = 1.5
    const TEXT_DISTANCE = text_dist_factor * width
    const MIN_LENGTH = Math.round(0.025 * width)
    const MED_LENGTH = Math.round(0.035 * width)
    const MAX_LENGTH = Math.round(0.045 * width)
    const TEXT_COLOR = backgroundColor.labelColor.getRgbaColor()
    const TICK_COLOR = backgroundColor.labelColor.getRgbaColor()
    const CENTER = width / 2
    // Create the ticks itself
    const RADIUS = width * 0.4
    let innerPoint
    let outerPoint
    let textPoint
    let counter = 0
    let numberCounter = 0
    let valueCounter // value for the tickmarks
    let sinValue = 0
    let cosValue = 0
    let alpha // angle for the tickmarks
    const ALPHA_START = -PI
    const ANGLE_STEPSIZE = TWO_PI / range

    ctx.width = ctx.height = width
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = STD_FONT

    for (
      alpha = ALPHA_START, valueCounter = 0;
      valueCounter <= range + 1;
      alpha -= ANGLE_STEPSIZE * 0.1, valueCounter += 0.1
    ) {
      ctx.lineWidth = THIN_STROKE
      sinValue = Math.sin(alpha)
      cosValue = Math.cos(alpha)

      // tickmark every 2 units
      if (counter % 2 === 0) {
        // ctx.lineWidth = THIN_STROKE;
        innerPoint = [
          CENTER + (RADIUS - MIN_LENGTH) * sinValue + x_offset,
          CENTER + (RADIUS - MIN_LENGTH) * cosValue + y_offset
        ]
        outerPoint = [
          CENTER + RADIUS * sinValue + x_offset,
          CENTER + RADIUS * cosValue + y_offset
        ]
        // Draw ticks
        ctx.strokeStyle = TICK_COLOR
        ctx.beginPath()
        ctx.moveTo(innerPoint[0], innerPoint[1])
        ctx.lineTo(outerPoint[0], outerPoint[1])
        ctx.closePath()
        ctx.stroke()
      }

      // Different tickmark every 10 units
      if (counter === 10 || counter === 0) {
        ctx.fillStyle = TEXT_COLOR
        ctx.lineWidth = MEDIUM_STROKE
        outerPoint = [
          CENTER + RADIUS * sinValue + x_offset,
          CENTER + RADIUS * cosValue + y_offset
        ]
        textPoint = [
          CENTER + (RADIUS - TEXT_DISTANCE) * sinValue + x_offset,
          CENTER + (RADIUS - TEXT_DISTANCE) * cosValue + y_offset
        ]

        // Draw text
        if (numberCounter === 5) {
          if (valueCounter !== range) {
            if (Math.round(valueCounter) !== 60) {
              ctx.fillText(
                Math.round(valueCounter),
                textPoint[0],
                textPoint[1],
                TEXT_WIDTH
              )
            }
          }
          ctx.lineWidth = THICK_STROKE
          innerPoint = [
            CENTER + (RADIUS - MAX_LENGTH) * sinValue + x_offset,
            CENTER + (RADIUS - MAX_LENGTH) * cosValue + y_offset
          ]
          numberCounter = 0
        } else {
          ctx.lineWidth = MEDIUM_STROKE
          innerPoint = [
            CENTER + (RADIUS - MED_LENGTH) * sinValue + x_offset,
            CENTER + (RADIUS - MED_LENGTH) * cosValue + y_offset
          ]
        }

        // Draw ticks
        ctx.strokeStyle = TICK_COLOR
        ctx.beginPath()
        ctx.moveTo(innerPoint[0], innerPoint[1])
        ctx.lineTo(outerPoint[0], outerPoint[1])
        ctx.closePath()
        ctx.stroke()

        counter = 0
        numberCounter++
      }
      counter++
    }
    ctx.restore()
  }

  const drawLargePointer = function (ctx) {
    let grad
    let radius

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.509345, imageWidth * 0.457943)
    ctx.lineTo(imageWidth * 0.5, imageWidth * 0.102803)
    ctx.lineTo(imageWidth * 0.490654, imageWidth * 0.457943)
    ctx.bezierCurveTo(
      imageWidth * 0.490654,
      imageWidth * 0.457943,
      imageWidth * 0.490654,
      imageWidth * 0.457943,
      imageWidth * 0.490654,
      imageWidth * 0.457943
    )
    ctx.bezierCurveTo(
      imageWidth * 0.471962,
      imageWidth * 0.462616,
      imageWidth * 0.457943,
      imageWidth * 0.481308,
      imageWidth * 0.457943,
      imageWidth * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.457943,
      imageWidth * 0.518691,
      imageWidth * 0.471962,
      imageWidth * 0.537383,
      imageWidth * 0.490654,
      imageWidth * 0.542056
    )
    ctx.bezierCurveTo(
      imageWidth * 0.490654,
      imageWidth * 0.542056,
      imageWidth * 0.490654,
      imageWidth * 0.542056,
      imageWidth * 0.490654,
      imageWidth * 0.542056
    )
    ctx.lineTo(imageWidth * 0.490654, imageWidth * 0.621495)
    ctx.lineTo(imageWidth * 0.509345, imageWidth * 0.621495)
    ctx.lineTo(imageWidth * 0.509345, imageWidth * 0.542056)
    ctx.bezierCurveTo(
      imageWidth * 0.509345,
      imageWidth * 0.542056,
      imageWidth * 0.509345,
      imageWidth * 0.542056,
      imageWidth * 0.509345,
      imageWidth * 0.542056
    )
    ctx.bezierCurveTo(
      imageWidth * 0.528037,
      imageWidth * 0.537383,
      imageWidth * 0.542056,
      imageWidth * 0.518691,
      imageWidth * 0.542056,
      imageWidth * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.542056,
      imageWidth * 0.481308,
      imageWidth * 0.528037,
      imageWidth * 0.462616,
      imageWidth * 0.509345,
      imageWidth * 0.457943
    )
    ctx.bezierCurveTo(
      imageWidth * 0.509345,
      imageWidth * 0.457943,
      imageWidth * 0.509345,
      imageWidth * 0.457943,
      imageWidth * 0.509345,
      imageWidth * 0.457943
    )
    ctx.closePath()
    grad = ctx.createLinearGradient(0, 0, 0, imageWidth * 0.621495)
    grad.addColorStop(0, pointerColor.medium.getRgbaColor())
    grad.addColorStop(0.388888, pointerColor.medium.getRgbaColor())
    grad.addColorStop(0.5, pointerColor.light.getRgbaColor())
    grad.addColorStop(0.611111, pointerColor.medium.getRgbaColor())
    grad.addColorStop(1, pointerColor.medium.getRgbaColor())
    ctx.fillStyle = grad
    ctx.strokeStyle = pointerColor.dark.getRgbaColor()
    ctx.fill()
    ctx.stroke()
    // Draw the rings
    ctx.beginPath()
    radius = (imageWidth * 0.06542) / 2
    ctx.arc(centerX, centerY, radius, 0, TWO_PI)
    grad = ctx.createLinearGradient(
      centerX - radius,
      centerX + radius,
      0,
      centerX + radius
    )
    grad.addColorStop(0, '#e6b35c')
    grad.addColorStop(0.01, '#e6b35c')
    grad.addColorStop(0.99, '#c48200')
    grad.addColorStop(1, '#c48200')
    ctx.fillStyle = grad
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    radius = (imageWidth * 0.046728) / 2
    ctx.arc(centerX, centerY, radius, 0, TWO_PI)
    grad = ctx.createRadialGradient(
      centerX,
      centerX,
      0,
      centerX,
      centerX,
      radius
    )
    grad.addColorStop(0, '#c5c5c5')
    grad.addColorStop(0.19, '#c5c5c5')
    grad.addColorStop(0.22, '#000000')
    grad.addColorStop(0.8, '#000000')
    grad.addColorStop(0.99, '#707070')
    grad.addColorStop(1, '#707070')
    ctx.fillStyle = grad
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const drawSmallPointer = function (ctx) {
    let radius

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.476635, imageWidth * 0.313084)
    ctx.bezierCurveTo(
      imageWidth * 0.476635,
      imageWidth * 0.322429,
      imageWidth * 0.485981,
      imageWidth * 0.331775,
      imageWidth * 0.495327,
      imageWidth * 0.336448
    )
    ctx.bezierCurveTo(
      imageWidth * 0.495327,
      imageWidth * 0.336448,
      imageWidth * 0.495327,
      imageWidth * 0.350467,
      imageWidth * 0.495327,
      imageWidth * 0.350467
    )
    ctx.lineTo(imageWidth * 0.504672, imageWidth * 0.350467)
    ctx.bezierCurveTo(
      imageWidth * 0.504672,
      imageWidth * 0.350467,
      imageWidth * 0.504672,
      imageWidth * 0.336448,
      imageWidth * 0.504672,
      imageWidth * 0.336448
    )
    ctx.bezierCurveTo(
      imageWidth * 0.514018,
      imageWidth * 0.331775,
      imageWidth * 0.523364,
      imageWidth * 0.322429,
      imageWidth * 0.523364,
      imageWidth * 0.313084
    )
    ctx.bezierCurveTo(
      imageWidth * 0.523364,
      imageWidth * 0.303738,
      imageWidth * 0.514018,
      imageWidth * 0.294392,
      imageWidth * 0.504672,
      imageWidth * 0.289719
    )
    ctx.bezierCurveTo(
      imageWidth * 0.504672,
      imageWidth * 0.289719,
      imageWidth * 0.5,
      imageWidth * 0.200934,
      imageWidth * 0.5,
      imageWidth * 0.200934
    )
    ctx.bezierCurveTo(
      imageWidth * 0.5,
      imageWidth * 0.200934,
      imageWidth * 0.495327,
      imageWidth * 0.289719,
      imageWidth * 0.495327,
      imageWidth * 0.289719
    )
    ctx.bezierCurveTo(
      imageWidth * 0.485981,
      imageWidth * 0.294392,
      imageWidth * 0.476635,
      imageWidth * 0.303738,
      imageWidth * 0.476635,
      imageWidth * 0.313084
    )
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, 0, imageWidth, 0)
    grad.addColorStop(0, pointerColor.medium.getRgbaColor())
    grad.addColorStop(0.388888, pointerColor.medium.getRgbaColor())
    grad.addColorStop(0.5, pointerColor.light.getRgbaColor())
    grad.addColorStop(0.611111, pointerColor.medium.getRgbaColor())
    grad.addColorStop(1, pointerColor.medium.getRgbaColor())
    ctx.fillStyle = grad
    ctx.strokeStyle = pointerColor.dark.getRgbaColor()
    ctx.fill()
    ctx.stroke()
    // Draw the rings
    ctx.beginPath()
    radius = (imageWidth * 0.037383) / 2
    ctx.arc(
      centerX,
      smallPointerY_Offset + smallPointerSize / 2,
      radius,
      0,
      TWO_PI
    )
    ctx.fillStyle = '#C48200'
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    radius = (imageWidth * 0.028037) / 2
    ctx.arc(
      centerX,
      smallPointerY_Offset + smallPointerSize / 2,
      radius,
      0,
      TWO_PI
    )
    ctx.fillStyle = '#999999'
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    radius = (imageWidth * 0.018691) / 2
    ctx.arc(
      centerX,
      smallPointerY_Offset + smallPointerSize / 2,
      radius,
      0,
      TWO_PI
    )
    ctx.fillStyle = '#000000'
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const calculateAngles = function () {
    currentMilliSeconds = new Date().getTime() - start
    secondPointerAngle = (currentMilliSeconds * ANGLE_STEP) / 1000
    minutePointerAngle = (secondPointerAngle % 10800) / 30

    minutes = (currentMilliSeconds / 60000) % 30
    seconds = (currentMilliSeconds / 1000) % 60
    milliSeconds = currentMilliSeconds % 1000
  }

  const init = function (parameters) {
    parameters = parameters || {}
    const drawFrame2 =
      undefined === parameters.frame ? false : parameters.frame
    const drawBackground2 =
      undefined === parameters.background ? false : parameters.background
    const drawPointers =
      undefined === parameters.pointers ? false : parameters.pointers
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground

    initialized = true

    if (drawFrame2 && frameVisible) {
      drawFrame(
        frameContext,
        frameDesign,
        centerX,
        centerY,
        imageWidth,
        imageHeight
      )
    }

    if (drawBackground2 && backgroundVisible) {
      // Create background in background buffer (backgroundBuffer)
      drawBackground(
        backgroundContext,
        backgroundColor,
        centerX,
        centerY,
        imageWidth,
        imageHeight
      )

      // Create custom layer in background buffer (backgroundBuffer)
      drawRadialCustomImage(
        backgroundContext,
        customLayer,
        centerX,
        centerY,
        imageWidth,
        imageHeight
      )

      drawTickmarksImage(backgroundContext, imageWidth, 60, 0.075, 0.1, 0, 0)
      drawTickmarksImage(
        backgroundContext,
        smallPointerSize,
        30,
        0.095,
        0.13,
        smallPointerX_Offset,
        smallPointerY_Offset
      )
    }
    if (drawPointers) {
      drawLargePointer(largePointerContext)
      drawSmallPointer(smallPointerContext)
    }

    if (drawForeground2 && foregroundVisible) {
      drawForeground(
        foregroundContext,
        foregroundType,
        imageWidth,
        imageHeight,
        false
      )
    }
  }

  const resetBuffers = function (buffers) {
    buffers = buffers || {}
    const resetFrame = undefined === buffers.frame ? false : buffers.frame
    const resetBackground =
      undefined === buffers.background ? false : buffers.background
    const resetPointers =
      undefined === buffers.pointers ? false : buffers.pointers
    const resetForeground =
      undefined === buffers.foreground ? false : buffers.foreground

    if (resetFrame) {
      frameBuffer.width = size
      frameBuffer.height = size
      frameContext = frameBuffer.getContext('2d')
    }

    if (resetBackground) {
      backgroundBuffer.width = size
      backgroundBuffer.height = size
      backgroundContext = backgroundBuffer.getContext('2d')
    }

    if (resetPointers) {
      smallPointerBuffer.width = size
      smallPointerBuffer.height = size
      smallPointerContext = smallPointerBuffer.getContext('2d')

      largePointerBuffer.width = size
      largePointerBuffer.height = size
      largePointerContext = largePointerBuffer.getContext('2d')
    }

    if (resetForeground) {
      foregroundBuffer.width = size
      foregroundBuffer.height = size
      foregroundContext = foregroundBuffer.getContext('2d')
    }
  }

  const tickTock = function () {
    if (!lap) {
      calculateAngles()
      self.repaint()
    }
    if (running) {
      tickTimer = setTimeout(tickTock, 200)
    }
  }

  //* *********************************** Public methods **************************************
  // Returns true if the stopwatch is running
  this.isRunning = function () {
    return running
  }

  // Starts the stopwatch
  this.start = function () {
    if (!running) {
      running = true
      start = new Date().getTime() - currentMilliSeconds
      tickTock()
    }
    return this
  }

  // Stops the stopwatch
  this.stop = function () {
    if (running) {
      running = false
      clearTimeout(tickTimer)
      // calculateAngles();
    }
    if (lap) {
      lap = false
      calculateAngles()
      this.repaint()
    }
    return this
  }

  // Resets the stopwatch
  this.reset = function () {
    if (running) {
      running = false
      lap = false
      clearTimeout(tickTimer)
    }
    start = new Date().getTime()
    calculateAngles()
    this.repaint()
    return this
  }

  // Laptimer, stop/restart stopwatch
  this.lap = function () {
    if (running && !lap) {
      lap = true
    } else if (lap) {
      lap = false
    }
    return this
  }

  this.getMeasuredTime = function () {
    return minutes + ':' + seconds + ':' + milliSeconds
  }

  this.setFrameDesign = function (newFrameDesign) {
    resetBuffers({
      frame: true
    })
    frameDesign = newFrameDesign
    init({
      frame: true
    })
    this.repaint()
    return this
  }

  this.setBackgroundColor = function (newBackgroundColor) {
    resetBuffers({
      background: true
    })
    backgroundColor = newBackgroundColor
    init({
      background: true
    })
    this.repaint()
    return this
  }

  this.setForegroundType = function (newForegroundType) {
    resetBuffers({
      foreground: true
    })
    foregroundType = newForegroundType
    init({
      foreground: true
    })
    this.repaint()
    return this
  }

  this.setPointerColor = function (newPointerColor) {
    resetBuffers({
      pointers: true
    })
    pointerColor = newPointerColor
    init({
      pointers: true
    })
    this.repaint()
    return this
  }

  this.repaint = function () {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        pointers: true,
        foreground: true
      })
    }

    mainCtx.clearRect(0, 0, imageWidth, imageHeight)

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0)
    }

    // Draw buffered image to visible canvas
    if (backgroundVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0)
    }

    // have to draw to a rotated temporary image area so we can translate in
    // absolute x, y values when drawing to main context
    const shadowOffset = imageWidth * 0.006

    const rotationAngle =
      (minutePointerAngle + 2 * Math.sin(minutePointerAngle * RAD_FACTOR)) *
      RAD_FACTOR
    const secRotationAngle =
      (secondPointerAngle + 2 * Math.sin(secondPointerAngle * RAD_FACTOR)) *
      RAD_FACTOR

    // Draw the minute pointer
    // Define rotation center
    mainCtx.save()
    mainCtx.translate(centerX, smallPointerY_Offset + smallPointerSize / 2)
    mainCtx.rotate(rotationAngle)
    mainCtx.translate(-centerX, -(smallPointerY_Offset + smallPointerSize / 2))
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset / 2
    mainCtx.shadowBlur = shadowOffset
    // Draw the pointer
    mainCtx.drawImage(smallPointerBuffer, 0, 0)
    mainCtx.restore()

    // Draw the second pointer
    // Define rotation center
    mainCtx.save()
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(secRotationAngle)
    mainCtx.translate(-centerX, -centerY)
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset / 2
    mainCtx.shadowBlur = shadowOffset
    // Draw the pointer
    mainCtx.drawImage(largePointerBuffer, 0, 0)
    // Undo the translations & shadow settings
    mainCtx.restore()

    // Draw the foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Has a size been specified?
  size =
    size === 0 ? Math.min(mainCtx.canvas.width, mainCtx.canvas.height) : size

  // Set the size - also clears it
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  const imageWidth = size
  const imageHeight = size

  const centerX = imageWidth / 2
  const centerY = imageHeight / 2

  const smallPointerSize = 0.285 * imageWidth
  const smallPointerX_Offset = centerX - smallPointerSize / 2
  const smallPointerY_Offset = 0.17 * imageWidth

  // Buffer for the frame
  const frameBuffer = createBuffer(size, size)
  frameContext = frameBuffer.getContext('2d')

  // Buffer for static background painting code
  const backgroundBuffer = createBuffer(size, size)
  backgroundContext = backgroundBuffer.getContext('2d')

  // Buffer for small pointer image painting code
  const smallPointerBuffer = createBuffer(size, size)
  smallPointerContext = smallPointerBuffer.getContext('2d')

  // Buffer for large pointer image painting code
  const largePointerBuffer = createBuffer(size, size)
  largePointerContext = largePointerBuffer.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  foregroundContext = foregroundBuffer.getContext('2d')

  // Visualize the component
  start = new Date().getTime()
  tickTock()

  if (parameters.running ?? false) {
    this.start()
  }

  return this
}

export default Stopwatch

export class StopwatchElement extends BaseElement {
  static get objectConstructor () { return Stopwatch }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 200 },
      running: { type: Boolean, defaultValue: false },
      frameDesign: { type: String, objectEnum: FrameDesign, defaultValue: 'METAL' },
      noFrameVisible: { type: Boolean, defaultValue: false },
      pointerColor: { type: String, objectEnum: ColorDef, defaultValue: 'BLACK' },
      backgroundColor: { type: String, objectEnum: BackgroundColor, defaultValue: 'DARK_GRAY' },
      noBackgroundVisible: { type: Boolean, defaultValue: false },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false }
    }
  }

  render () {
    return html`
      <canvas width="${this.size}" height="${this.size}"></canvas>
    `
  }
}

window.customElements.define('steelseries-stopwatch', StopwatchElement)

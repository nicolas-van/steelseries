import Tween from './tween.js'
import drawFrame from './drawFrame'
import drawBackground from './drawBackground'
import drawForeground from './drawForeground'
import {
  createBuffer,
  requestAnimFrame,
  getCanvasContext,
  HALF_PI,
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

const Level = function (canvas, parameters) {
  parameters = parameters || {}
  let size = undefined === parameters.size ? 0 : parameters.size
  const decimalsVisible =
    undefined === parameters.decimalsVisible
      ? false
      : parameters.decimalsVisible
  const textOrientationFixed =
    undefined === parameters.textOrientationFixed
      ? false
      : parameters.textOrientationFixed
  let frameDesign =
    undefined === parameters.frameDesign
      ? FrameDesign.METAL
      : parameters.frameDesign
  const frameVisible =
    undefined === parameters.frameVisible ? true : parameters.frameVisible
  let backgroundColor =
    undefined === parameters.backgroundColor
      ? BackgroundColor.DARK_GRAY
      : parameters.backgroundColor
  const backgroundVisible =
    undefined === parameters.backgroundVisible
      ? true
      : parameters.backgroundVisible
  let pointerColor =
    undefined === parameters.pointerColor
      ? ColorDef.RED
      : parameters.pointerColor
  let foregroundType =
    undefined === parameters.foregroundType
      ? ForegroundType.TYPE1
      : parameters.foregroundType
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const rotateFace =
    undefined === parameters.rotateFace ? false : parameters.rotateFace

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  let tween
  let repainting = false

  let value = parameters.value ?? 0
  let stepValue = 0
  let visibleValue = value
  const angleStep = TWO_PI / 360
  let angle = this.value
  const decimals = decimalsVisible ? 1 : 0

  const imageWidth = size
  const imageHeight = size

  const centerX = imageWidth / 2
  const centerY = imageHeight / 2

  let initialized = false

  // **************   Buffer creation  ********************
  // Buffer for all static background painting code
  const backgroundBuffer = createBuffer(size, size)
  let backgroundContext = backgroundBuffer.getContext('2d')

  // Buffer for pointer image painting code
  const pointerBuffer = createBuffer(size, size)
  let pointerContext = pointerBuffer.getContext('2d')

  // Buffer for step pointer image painting code
  const stepPointerBuffer = createBuffer(size, size)
  let stepPointerContext = stepPointerBuffer.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  let foregroundContext = foregroundBuffer.getContext('2d')

  // **************   Image creation  ********************
  const drawTickmarksImage = function (ctx) {
    let stdFont
    let smlFont
    let i

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.save()
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.translate(centerX, centerY)

    for (i = 0; i < 360; i++) {
      ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(imageWidth * 0.38, 0)
      ctx.lineTo(imageWidth * 0.37, 0)
      ctx.closePath()
      ctx.stroke()

      if (i % 5 === 0) {
        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.38, 0)
        ctx.lineTo(imageWidth * 0.36, 0)
        ctx.closePath()
        ctx.stroke()
      }

      if (i % 45 === 0) {
        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.38, 0)
        ctx.lineTo(imageWidth * 0.34, 0)
        ctx.closePath()
        ctx.stroke()
      }

      // Draw the labels
      if (imageWidth > 300) {
        stdFont = '14px ' + stdFont
        smlFont = '12px ' + stdFont
      }
      if (imageWidth <= 300) {
        stdFont = '12px ' + stdFont
        smlFont = '10px ' + stdFont
      }
      if (imageWidth <= 200) {
        stdFont = '10px ' + stdFont
        smlFont = '8px ' + stdFont
      }
      if (imageWidth <= 100) {
        stdFont = '8px ' + stdFont
        smlFont = '6px ' + stdFont
      }
      ctx.save()
      switch (i) {
        case 0:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR + HALF_PI)
          ctx.font = stdFont
          ctx.fillText('0\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR) + HALF_PI)
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.41, 0)
          ctx.rotate(i * RAD_FACTOR - HALF_PI)
          ctx.font = smlFont
          ctx.fillText('0%', 0, 0, imageWidth)
          break
        case 45:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR + 0.25 * PI)
          ctx.font = stdFont
          ctx.fillText('45\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR) + 0.25 * PI)
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.31, imageWidth * 0.085)
          ctx.rotate(i * RAD_FACTOR - 0.25 * PI)
          ctx.font = smlFont
          ctx.fillText('100%', 0, 0, imageWidth)
          break
        case 90:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR)
          ctx.font = stdFont
          ctx.fillText('90\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR))
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.21, 0)
          ctx.rotate(i * RAD_FACTOR)
          ctx.font = smlFont
          ctx.fillText('\u221E', 0, 0, imageWidth)
          break
        case 135:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR - 0.25 * PI)
          ctx.font = stdFont
          ctx.fillText('45\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR) - 0.25 * PI)
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.31, -imageWidth * 0.085)
          ctx.rotate(i * RAD_FACTOR + 0.25 * PI)
          ctx.font = smlFont
          ctx.fillText('100%', 0, 0, imageWidth)
          break
        case 180:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR - HALF_PI)
          ctx.font = stdFont
          ctx.fillText('0\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR) - HALF_PI)
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.41, 0)
          ctx.rotate(i * RAD_FACTOR + HALF_PI)
          ctx.font = smlFont
          ctx.fillText('0%', 0, 0, imageWidth)
          ctx.translate(-imageWidth * 0.41, 0)
          break
        case 225:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR - 0.75 * PI)
          ctx.font = stdFont
          ctx.fillText('45\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR) - 0.75 * PI)
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.31, imageWidth * 0.085)
          ctx.rotate(i * RAD_FACTOR + 0.75 * PI)
          ctx.font = smlFont
          ctx.fillText('100%', 0, 0, imageWidth)
          break
        case 270:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR - PI)
          ctx.font = stdFont
          ctx.fillText('90\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR) - PI)
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.21, 0)
          ctx.rotate(i * RAD_FACTOR - PI)
          ctx.font = smlFont
          ctx.fillText('\u221E', 0, 0, imageWidth)
          break
        case 315:
          ctx.translate(imageWidth * 0.31, 0)
          ctx.rotate(i * RAD_FACTOR - 1.25 * PI)
          ctx.font = stdFont
          ctx.fillText('45\u00B0', 0, 0, imageWidth)
          ctx.rotate(-(i * RAD_FACTOR) - 1.25 * PI)
          ctx.translate(-imageWidth * 0.31, 0)

          ctx.translate(imageWidth * 0.31, -imageWidth * 0.085)
          ctx.rotate(i * RAD_FACTOR + 1.25 * PI)
          ctx.font = smlFont
          ctx.fillText('100%', 0, 0, imageWidth)
          break
      }
      ctx.restore()

      ctx.rotate(angleStep)
    }
    ctx.translate(-centerX, -centerY)
    ctx.restore()
  }

  const drawMarkerImage = function (ctx) {
    ctx.save()

    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()

    // FRAMELEFT
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.200934, imageHeight * 0.434579)
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.434579)
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.560747)
    ctx.lineTo(imageWidth * 0.200934, imageHeight * 0.560747)
    ctx.lineWidth = 1
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.stroke()

    // TRIANGLELEFT
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.163551, imageHeight * 0.471962)
    ctx.lineTo(imageWidth * 0.205607, imageHeight * 0.5)
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.523364)
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.471962)
    ctx.closePath()
    ctx.fill()

    // FRAMERIGHT
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.799065, imageHeight * 0.434579)
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.434579)
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.560747)
    ctx.lineTo(imageWidth * 0.799065, imageHeight * 0.560747)
    ctx.lineWidth = 1
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.stroke()

    // TRIANGLERIGHT
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.836448, imageHeight * 0.471962)
    ctx.lineTo(imageWidth * 0.794392, imageHeight * 0.5)
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.523364)
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.471962)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  const drawPointerImage = function (ctx) {
    ctx.save()

    // POINTER_LEVEL
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.350467)
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.130841)
    ctx.lineTo(imageWidth * 0.476635, imageHeight * 0.350467)
    ctx.bezierCurveTo(
      imageWidth * 0.476635,
      imageHeight * 0.350467,
      imageWidth * 0.490654,
      imageHeight * 0.345794,
      imageWidth * 0.5,
      imageHeight * 0.345794
    )
    ctx.bezierCurveTo(
      imageWidth * 0.509345,
      imageHeight * 0.345794,
      imageWidth * 0.523364,
      imageHeight * 0.350467,
      imageWidth * 0.523364,
      imageHeight * 0.350467
    )
    ctx.closePath()
    const POINTER_LEVEL_GRADIENT = ctx.createLinearGradient(
      0,
      0.154205 * imageHeight,
      0,
      0.350466 * imageHeight
    )
    const tmpDarkColor = pointerColor.dark
    const tmpLightColor = pointerColor.light
    tmpDarkColor.setAlpha(0.70588)
    tmpLightColor.setAlpha(0.70588)
    POINTER_LEVEL_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor())
    POINTER_LEVEL_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor())
    POINTER_LEVEL_GRADIENT.addColorStop(0.59, tmpLightColor.getRgbaColor())
    POINTER_LEVEL_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor())
    ctx.fillStyle = POINTER_LEVEL_GRADIENT
    const strokeColor_POINTER_LEVEL = pointerColor.light.getRgbaColor()
    ctx.lineWidth = 1
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.strokeStyle = strokeColor_POINTER_LEVEL
    ctx.fill()
    ctx.stroke()

    tmpDarkColor.setAlpha(1)
    tmpLightColor.setAlpha(1)

    ctx.restore()
  }

  const drawStepPointerImage = function (ctx) {
    ctx.save()

    const tmpDarkColor = pointerColor.dark
    const tmpLightColor = pointerColor.light
    tmpDarkColor.setAlpha(0.70588)
    tmpLightColor.setAlpha(0.70588)

    // POINTER_LEVEL_LEFT
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.285046, imageHeight * 0.514018)
    ctx.lineTo(imageWidth * 0.21028, imageHeight * 0.5)
    ctx.lineTo(imageWidth * 0.285046, imageHeight * 0.481308)
    ctx.bezierCurveTo(
      imageWidth * 0.285046,
      imageHeight * 0.481308,
      imageWidth * 0.280373,
      imageHeight * 0.490654,
      imageWidth * 0.280373,
      imageHeight * 0.495327
    )
    ctx.bezierCurveTo(
      imageWidth * 0.280373,
      imageHeight * 0.504672,
      imageWidth * 0.285046,
      imageHeight * 0.514018,
      imageWidth * 0.285046,
      imageHeight * 0.514018
    )
    ctx.closePath()
    const POINTER_LEVEL_LEFT_GRADIENT = ctx.createLinearGradient(
      0.224299 * imageWidth,
      0,
      0.289719 * imageWidth,
      0
    )
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor())
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor())
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(
      0.59,
      tmpLightColor.getRgbaColor()
    )
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor())
    ctx.fillStyle = POINTER_LEVEL_LEFT_GRADIENT
    const strokeColor_POINTER_LEVEL_LEFT = pointerColor.light.getRgbaColor()
    ctx.lineWidth = 1
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.strokeStyle = strokeColor_POINTER_LEVEL_LEFT
    ctx.fill()
    ctx.stroke()

    // POINTER_LEVEL_RIGHT
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.714953, imageHeight * 0.514018)
    ctx.lineTo(imageWidth * 0.789719, imageHeight * 0.5)
    ctx.lineTo(imageWidth * 0.714953, imageHeight * 0.481308)
    ctx.bezierCurveTo(
      imageWidth * 0.714953,
      imageHeight * 0.481308,
      imageWidth * 0.719626,
      imageHeight * 0.490654,
      imageWidth * 0.719626,
      imageHeight * 0.495327
    )
    ctx.bezierCurveTo(
      imageWidth * 0.719626,
      imageHeight * 0.504672,
      imageWidth * 0.714953,
      imageHeight * 0.514018,
      imageWidth * 0.714953,
      imageHeight * 0.514018
    )
    ctx.closePath()
    const POINTER_LEVEL_RIGHT_GRADIENT = ctx.createLinearGradient(
      0.7757 * imageWidth,
      0,
      0.71028 * imageWidth,
      0
    )
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor())
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(
      0.3,
      tmpLightColor.getRgbaColor()
    )
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(
      0.59,
      tmpLightColor.getRgbaColor()
    )
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor())
    ctx.fillStyle = POINTER_LEVEL_RIGHT_GRADIENT
    const strokeColor_POINTER_LEVEL_RIGHT = pointerColor.light.getRgbaColor()
    ctx.lineWidth = 1
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.strokeStyle = strokeColor_POINTER_LEVEL_RIGHT
    ctx.fill()
    ctx.stroke()

    tmpDarkColor.setAlpha(1)
    tmpLightColor.setAlpha(1)

    ctx.restore()
  }

  // **************   Initialization  ********************
  // Draw all static painting code to background
  const init = function () {
    initialized = true

    if (frameVisible) {
      drawFrame(
        backgroundContext,
        frameDesign,
        centerX,
        centerY,
        imageWidth,
        imageHeight
      )
    }

    if (backgroundVisible) {
      drawBackground(
        backgroundContext,
        backgroundColor,
        centerX,
        centerY,
        imageWidth,
        imageHeight
      )
      drawTickmarksImage(backgroundContext)
    }

    drawMarkerImage(pointerContext)

    drawPointerImage(pointerContext)

    drawStepPointerImage(stepPointerContext)

    if (foregroundVisible) {
      drawForeground(
        foregroundContext,
        foregroundType,
        imageWidth,
        imageHeight,
        false
      )
    }
  }

  const resetBuffers = function () {
    backgroundBuffer.width = size
    backgroundBuffer.height = size
    backgroundContext = backgroundBuffer.getContext('2d')

    // Buffer for pointer image painting code
    pointerBuffer.width = size
    pointerBuffer.height = size
    pointerContext = pointerBuffer.getContext('2d')

    // Buffer for step pointer image painting code
    stepPointerBuffer.width = size
    stepPointerBuffer.height = size
    stepPointerContext = stepPointerBuffer.getContext('2d')

    // Buffer for static foreground painting code
    foregroundBuffer.width = size
    foregroundBuffer.height = size
    foregroundContext = foregroundBuffer.getContext('2d')
  }

  //* *********************************** Public methods **************************************
  this.setValue = function (newValue) {
    let targetValue
    newValue = parseFloat(newValue)
    targetValue = newValue < 0 ? 360 + newValue : newValue
    targetValue = newValue > 359.9 ? newValue - 360 : newValue

    if (value !== targetValue) {
      value = targetValue
      stepValue = 2 * ((Math.abs(value) * 10) % 10)
      if (stepValue > 10) {
        stepValue -= 20
      }

      if (value === 0) {
        visibleValue = 90
      }

      if (value > 0 && value <= 90) {
        visibleValue = 90 - value
      }

      if (value > 90 && value <= 180) {
        visibleValue = value - 90
      }

      if (value > 180 && value <= 270) {
        visibleValue = 270 - value
      }

      if (value > 270 && value <= 360) {
        visibleValue = value - 270
      }

      if (value < 0 && value >= -90) {
        visibleValue = 90 - Math.abs(value)
      }

      if (value < -90 && value >= -180) {
        visibleValue = Math.abs(value) - 90
      }

      if (value < -180 && value >= -270) {
        visibleValue = 270 - Math.abs(value)
      }

      if (value < -270 && value >= -360) {
        visibleValue = Math.abs(value) - 270
      }

      this.repaint()
    }
    return this
  }

  this.getValue = function () {
    return value
  }

  this.setValueAnimated = function (newValue, callback) {
    newValue = parseFloat(newValue)
    if (360 - newValue + value < newValue - value) {
      newValue = 360 - newValue
    }
    if (value !== newValue) {
      if (undefined !== tween && tween.isPlaying) {
        tween.stop()
      }

      // tween = new Tween(new Object(),'',Tween.elasticEaseOut,this.value,targetValue, 1);
      tween = new Tween({}, '', Tween.regularEaseInOut, value, newValue, 1)
      // tween = new Tween(new Object(), '', Tween.strongEaseInOut, this.value, targetValue, 1);

      const gauge = this

      tween.onMotionChanged = function (event) {
        value = event.target._pos
        stepValue = 2 * ((Math.abs(value) * 10) % 10)
        if (stepValue > 10) {
          stepValue -= 20
        }

        if (value === 0) {
          visibleValue = 90
        }

        if (value > 0 && value <= 90) {
          visibleValue = 90 - value
        }

        if (value > 90 && value <= 180) {
          visibleValue = value - 90
        }

        if (value > 180 && value <= 270) {
          visibleValue = 270 - value
        }

        if (value > 270 && value <= 360) {
          visibleValue = value - 270
        }

        if (value < 0 && value >= -90) {
          visibleValue = 90 - Math.abs(value)
        }

        if (value < -90 && value >= -180) {
          visibleValue = Math.abs(value) - 90
        }

        if (value < -180 && value >= -270) {
          visibleValue = 270 - Math.abs(value)
        }

        if (value < -270 && value >= -360) {
          visibleValue = Math.abs(value) - 270
        }

        if (!repainting) {
          repainting = true
          requestAnimFrame(gauge.repaint)
        }
      }

      // do we have a callback function to process?
      if (callback && typeof callback === 'function') {
        tween.onMotionFinished = callback
      }

      tween.start()
    }
    return this
  }

  this.setFrameDesign = function (newFrameDesign) {
    resetBuffers()
    frameDesign = newFrameDesign
    init()
    this.repaint()
    return this
  }

  this.setBackgroundColor = function (newBackgroundColor) {
    resetBuffers()
    backgroundColor = newBackgroundColor
    init()
    this.repaint()
    return this
  }

  this.setForegroundType = function (newForegroundType) {
    resetBuffers()
    foregroundType = newForegroundType
    init()
    this.repaint()
    return this
  }

  this.setPointerColor = function (newPointerColor) {
    resetBuffers()
    pointerColor = newPointerColor
    init()
    this.repaint()
    return this
  }

  this.repaint = function () {
    if (!initialized) {
      init()
    }

    mainCtx.save()
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    angle = HALF_PI + value * angleStep - HALF_PI
    if (rotateFace) {
      mainCtx.translate(centerX, centerY)
      mainCtx.rotate(-angle)
      mainCtx.translate(-centerX, -centerY)
    }
    // Draw buffered image to visible canvas
    if (frameVisible || backgroundVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0)
    }

    mainCtx.save()
    // Define rotation center
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(angle)

    // Draw pointer
    mainCtx.translate(-centerX, -centerY)
    mainCtx.drawImage(pointerBuffer, 0, 0)

    mainCtx.fillStyle = backgroundColor.labelColor.getRgbaColor()
    mainCtx.textAlign = 'center'
    mainCtx.textBaseline = 'middle'

    if (textOrientationFixed) {
      mainCtx.restore()
      if (decimalsVisible) {
        mainCtx.font = imageWidth * 0.1 + 'px ' + stdFontName
      } else {
        mainCtx.font = imageWidth * 0.15 + 'px ' + stdFontName
      }
      mainCtx.fillText(
        visibleValue.toFixed(decimals) + '\u00B0',
        centerX,
        centerY,
        imageWidth * 0.35
      )
    } else {
      if (decimalsVisible) {
        mainCtx.font = imageWidth * 0.15 + 'px ' + stdFontName
      } else {
        mainCtx.font = imageWidth * 0.2 + 'px ' + stdFontName
      }
      mainCtx.fillText(
        visibleValue.toFixed(decimals) + '\u00B0',
        centerX,
        centerY,
        imageWidth * 0.35
      )
      mainCtx.restore()
    }

    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(angle + stepValue * RAD_FACTOR)
    mainCtx.translate(-centerX, -centerY)
    mainCtx.drawImage(stepPointerBuffer, 0, 0)
    mainCtx.restore()

    // Draw foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }

    mainCtx.restore()

    repainting = false
  }

  // Visualize the component
  this.repaint()

  return this
}

export default Level

export class LevelElement extends BaseElement {
  static get objectConstructor () { return Level }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 200 },
      value: { type: Number, defaultValue: 0 },
      decimalsVisible: { type: Boolean, defaultValue: false },
      textOrientationFixed: { type: Boolean, defaultValue: false },
      frameDesign: { type: String, objectEnum: FrameDesign, defaultValue: 'METAL' },
      noFrameVisible: { type: Boolean, defaultValue: false },
      backgroundColor: { type: String, objectEnum: BackgroundColor, defaultValue: 'DARK_GRAY' },
      noBackgroundVisible: { type: Boolean, defaultValue: false },
      pointerColor: { type: String, objectEnum: ColorDef, defaultValue: 'RED' },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false },
      rotateFace: { type: Boolean, defaultValue: false }
    }
  }

  render () {
    return html`
      <canvas width="${this.size}" height="${this.size}"></canvas>
    `
  }
}

window.customElements.define('steelseries-level', LevelElement)


import drawFrame from './drawFrame'
import drawBackground from './drawBackground'
import drawRadialCustomImage from './drawRadialCustomImage'
import drawForeground from './drawForeground'
import drawRoseImage from './drawRoseImage'
import {
  createBuffer,
  getCanvasContext,
  HALF_PI,
  RAD_FACTOR
} from './tools'

import {
  BackgroundColor,
  ColorDef,
  KnobType,
  KnobStyle,
  FrameDesign,
  PointerType,
  ForegroundType
} from './definitions'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

const Compass = function (canvas, parameters) {
  parameters = parameters || {}
  let size = undefined === parameters.size ? 0 : parameters.size
  const frameDesign =
    undefined === parameters.frameDesign
      ? FrameDesign.METAL
      : parameters.frameDesign
  const frameVisible =
    undefined === parameters.frameVisible ? true : parameters.frameVisible
  const backgroundColor =
    undefined === parameters.backgroundColor
      ? BackgroundColor.DARK_GRAY
      : parameters.backgroundColor
  const backgroundVisible =
    undefined === parameters.backgroundVisible
      ? true
      : parameters.backgroundVisible
  const pointerType =
    undefined === parameters.pointerType
      ? PointerType.TYPE2
      : parameters.pointerType
  const pointerColor =
    undefined === parameters.pointerColor
      ? ColorDef.RED
      : parameters.pointerColor
  const knobType =
    undefined === parameters.knobType
      ? KnobType.STANDARD_KNOB
      : parameters.knobType
  const knobStyle =
    undefined === parameters.knobStyle
      ? KnobStyle.SILVER
      : parameters.knobStyle
  const foregroundType =
    undefined === parameters.foregroundType
      ? ForegroundType.TYPE1
      : parameters.foregroundType
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const pointSymbols =
    undefined === parameters.pointSymbols
      ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
      : parameters.pointSymbols
  const pointSymbolsVisible =
    undefined === parameters.pointSymbolsVisible
      ? true
      : parameters.pointSymbolsVisible
  const customLayer =
    undefined === parameters.customLayer ? null : parameters.customLayer
  const degreeScale =
    undefined === parameters.degreeScale ? false : parameters.degreeScale
  const roseVisible =
    undefined === parameters.roseVisible ? true : parameters.roseVisible
  const rotateFace =
    undefined === parameters.rotateFace ? false : parameters.rotateFace

  const value = parameters.value ?? 0
  const angleStep = RAD_FACTOR
  let angle

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  const imageWidth = size
  const imageHeight = size

  const centerX = imageWidth / 2
  const centerY = imageHeight / 2

  const shadowOffset = imageWidth * 0.006

  let initialized = false

  // **************   Buffer creation  ********************
  // Buffer for all static background painting code
  const backgroundBuffer = createBuffer(size, size)
  const backgroundContext = backgroundBuffer.getContext('2d')

  // Buffer for symbol/rose painting code
  const roseBuffer = createBuffer(size, size)
  const roseContext = roseBuffer.getContext('2d')

  // Buffer for pointer image painting code
  const pointerBuffer = createBuffer(size, size)
  const pointerContext = pointerBuffer.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  const foregroundContext = foregroundBuffer.getContext('2d')

  // **************   Image creation  ********************
  const drawTickmarksImage = function (ctx) {
    let val
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    let stdFont
    let smlFont
    let i

    ctx.save()
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.translate(centerX, centerY)

    if (!degreeScale) {
      stdFont = 0.12 * imageWidth + 'px serif'
      smlFont = 0.06 * imageWidth + 'px serif'

      for (i = 0; i < 360; i += 2.5) {
        if (i % 5 === 0) {
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(imageWidth * 0.38, 0)
          ctx.lineTo(imageWidth * 0.36, 0)
          ctx.closePath()
          ctx.stroke()
        }

        // Draw the labels
        ctx.save()
        switch (i) {
          case 0:
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[2], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 45:
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[3], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.29, 0)
            break
          case 90:
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[4], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 135:
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[5], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.29, 0)
            break
          case 180:
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[6], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 225:
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[7], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.29, 0)
            break
          case 270:
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[0], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 315:
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[1], 0, 0, imageWidth)
            ctx.translate(-imageWidth * 0.29, 0)
            break
        }
        ctx.restore()

        if (
          roseVisible &&
          (i === 0 ||
            i === 22.5 ||
            i === 45 ||
            i === 67.5 ||
            i === 90 ||
            i === 112.5 ||
            i === 135 ||
            i === 157.5 ||
            i === 180 ||
            i === 202.5 ||
            i === 225 ||
            i === 247.5 ||
            i === 270 ||
            i === 292.5 ||
            i === 315 ||
            i === 337.5 ||
            i === 360)
        ) {
          // ROSE_LINE
          ctx.save()
          ctx.beginPath()
          // indent the 16 half quadrant lines a bit for visual effect
          if (i % 45) {
            ctx.moveTo(imageWidth * 0.29, 0)
          } else {
            ctx.moveTo(imageWidth * 0.38, 0)
          }
          ctx.lineTo(imageWidth * 0.1, 0)
          ctx.closePath()
          ctx.restore()
          ctx.lineWidth = 1
          ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor()
          ctx.stroke()
        }
        ctx.rotate(angleStep * 2.5)
      }
    } else {
      stdFont = 0.08 * imageWidth + 'px serif'
      smlFont = imageWidth * 0.033 + 'px serif'

      ctx.rotate(angleStep * 10)

      for (i = 10; i <= 360; i += 10) {
        // Draw the labels
        ctx.save()
        if (pointSymbolsVisible) {
          switch (i) {
            case 360:
              ctx.translate(imageWidth * 0.35, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[2], 0, 0, imageWidth)
              ctx.translate(-imageWidth * 0.35, 0)
              break
            case 90:
              ctx.translate(imageWidth * 0.35, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[4], 0, 0, imageWidth)
              ctx.translate(-imageWidth * 0.35, 0)
              break
            case 180:
              ctx.translate(imageWidth * 0.35, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[6], 0, 0, imageWidth)
              ctx.translate(-imageWidth * 0.35, 0)
              break
            case 270:
              ctx.translate(imageWidth * 0.35, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[0], 0, 0, imageWidth)
              ctx.translate(-imageWidth * 0.35, 0)
              break
            default:
              val = (i + 90) % 360
              ctx.translate(imageWidth * 0.37, 0)
              ctx.rotate(HALF_PI)
              ctx.font = smlFont
              ctx.fillText('0'.substring(val >= 100) + val, 0, 0, imageWidth)
              ctx.translate(-imageWidth * 0.37, 0)
          }
        } else {
          val = (i + 90) % 360
          ctx.translate(imageWidth * 0.37, 0)
          ctx.rotate(HALF_PI)
          ctx.font = smlFont
          ctx.fillText('0'.substring(val >= 100) + val, 0, 0, imageWidth)
          ctx.translate(-imageWidth * 0.37, 0)
        }
        ctx.restore()
        ctx.rotate(angleStep * 10)
      }
    }
    ctx.translate(-centerX, -centerY)
    ctx.restore()
  }

  const drawPointerImage = function (ctx) {
    ctx.save()

    switch (pointerType.type) {
      case 'type2': {
        // NORTHPOINTER
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.53271, imageHeight * 0.453271)
        ctx.bezierCurveTo(
          imageWidth * 0.53271,
          imageHeight * 0.453271,
          imageWidth * 0.5,
          imageHeight * 0.149532,
          imageWidth * 0.5,
          imageHeight * 0.149532
        )
        ctx.bezierCurveTo(
          imageWidth * 0.5,
          imageHeight * 0.149532,
          imageWidth * 0.467289,
          imageHeight * 0.453271,
          imageWidth * 0.467289,
          imageHeight * 0.453271
        )
        ctx.bezierCurveTo(
          imageWidth * 0.453271,
          imageHeight * 0.462616,
          imageWidth * 0.443925,
          imageHeight * 0.481308,
          imageWidth * 0.443925,
          imageHeight * 0.5
        )
        ctx.bezierCurveTo(
          imageWidth * 0.443925,
          imageHeight * 0.5,
          imageWidth * 0.556074,
          imageHeight * 0.5,
          imageWidth * 0.556074,
          imageHeight * 0.5
        )
        ctx.bezierCurveTo(
          imageWidth * 0.556074,
          imageHeight * 0.481308,
          imageWidth * 0.546728,
          imageHeight * 0.462616,
          imageWidth * 0.53271,
          imageHeight * 0.453271
        )
        ctx.closePath()
        const NORTHPOINTER2_GRADIENT = ctx.createLinearGradient(
          0.471962 * imageWidth,
          0,
          0.528036 * imageWidth,
          0
        )
        NORTHPOINTER2_GRADIENT.addColorStop(
          0,
          pointerColor.light.getRgbaColor()
        )
        NORTHPOINTER2_GRADIENT.addColorStop(
          0.46,
          pointerColor.light.getRgbaColor()
        )
        NORTHPOINTER2_GRADIENT.addColorStop(
          0.47,
          pointerColor.medium.getRgbaColor()
        )
        NORTHPOINTER2_GRADIENT.addColorStop(
          1,
          pointerColor.medium.getRgbaColor()
        )
        ctx.fillStyle = NORTHPOINTER2_GRADIENT
        ctx.strokeStyle = pointerColor.dark.getRgbaColor()
        ctx.lineWidth = 1
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.fill()
        ctx.stroke()

        // SOUTHPOINTER
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.467289, imageHeight * 0.546728)
        ctx.bezierCurveTo(
          imageWidth * 0.467289,
          imageHeight * 0.546728,
          imageWidth * 0.5,
          imageHeight * 0.850467,
          imageWidth * 0.5,
          imageHeight * 0.850467
        )
        ctx.bezierCurveTo(
          imageWidth * 0.5,
          imageHeight * 0.850467,
          imageWidth * 0.53271,
          imageHeight * 0.546728,
          imageWidth * 0.53271,
          imageHeight * 0.546728
        )
        ctx.bezierCurveTo(
          imageWidth * 0.546728,
          imageHeight * 0.537383,
          imageWidth * 0.556074,
          imageHeight * 0.518691,
          imageWidth * 0.556074,
          imageHeight * 0.5
        )
        ctx.bezierCurveTo(
          imageWidth * 0.556074,
          imageHeight * 0.5,
          imageWidth * 0.443925,
          imageHeight * 0.5,
          imageWidth * 0.443925,
          imageHeight * 0.5
        )
        ctx.bezierCurveTo(
          imageWidth * 0.443925,
          imageHeight * 0.518691,
          imageWidth * 0.453271,
          imageHeight * 0.537383,
          imageWidth * 0.467289,
          imageHeight * 0.546728
        )
        ctx.closePath()
        const SOUTHPOINTER2_GRADIENT = ctx.createLinearGradient(
          0.471962 * imageWidth,
          0,
          0.528036 * imageWidth,
          0
        )
        SOUTHPOINTER2_GRADIENT.addColorStop(0, '#e3e5e8')
        SOUTHPOINTER2_GRADIENT.addColorStop(0.48, '#e3e5e8')
        SOUTHPOINTER2_GRADIENT.addColorStop(0.48, '#abb1b8')
        SOUTHPOINTER2_GRADIENT.addColorStop(1, '#abb1b8')
        ctx.fillStyle = SOUTHPOINTER2_GRADIENT
        const strokeColor_SOUTHPOINTER2 = '#abb1b8'
        ctx.strokeStyle = strokeColor_SOUTHPOINTER2
        ctx.lineWidth = 1
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.fill()
        ctx.stroke()
      }
        break

      case 'type3': {
        // NORTHPOINTER
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.149532)
        ctx.bezierCurveTo(
          imageWidth * 0.5,
          imageHeight * 0.149532,
          imageWidth * 0.443925,
          imageHeight * 0.490654,
          imageWidth * 0.443925,
          imageHeight * 0.5
        )
        ctx.bezierCurveTo(
          imageWidth * 0.443925,
          imageHeight * 0.53271,
          imageWidth * 0.467289,
          imageHeight * 0.556074,
          imageWidth * 0.5,
          imageHeight * 0.556074
        )
        ctx.bezierCurveTo(
          imageWidth * 0.53271,
          imageHeight * 0.556074,
          imageWidth * 0.556074,
          imageHeight * 0.53271,
          imageWidth * 0.556074,
          imageHeight * 0.5
        )
        ctx.bezierCurveTo(
          imageWidth * 0.556074,
          imageHeight * 0.490654,
          imageWidth * 0.5,
          imageHeight * 0.149532,
          imageWidth * 0.5,
          imageHeight * 0.149532
        )
        ctx.closePath()
        const NORTHPOINTER3_GRADIENT = ctx.createLinearGradient(
          0.471962 * imageWidth,
          0,
          0.528036 * imageWidth,
          0
        )
        NORTHPOINTER3_GRADIENT.addColorStop(
          0,
          pointerColor.light.getRgbaColor()
        )
        NORTHPOINTER3_GRADIENT.addColorStop(
          0.46,
          pointerColor.light.getRgbaColor()
        )
        NORTHPOINTER3_GRADIENT.addColorStop(
          0.47,
          pointerColor.medium.getRgbaColor()
        )
        NORTHPOINTER3_GRADIENT.addColorStop(
          1,
          pointerColor.medium.getRgbaColor()
        )
        ctx.fillStyle = NORTHPOINTER3_GRADIENT
        ctx.strokeStyle = pointerColor.dark.getRgbaColor()
        ctx.lineWidth = 1
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.fill()
        ctx.stroke()
      }
        break

      case 'type1:':
      /* falls through */
      default: {
        // NORTHPOINTER
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.495327)
        ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.495327)
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.149532)
        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.495327)
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.495327)
        ctx.closePath()
        const NORTHPOINTER1_GRADIENT = ctx.createLinearGradient(
          0.471962 * imageWidth,
          0,
          0.528036 * imageWidth,
          0
        )
        NORTHPOINTER1_GRADIENT.addColorStop(
          0,
          pointerColor.light.getRgbaColor()
        )
        NORTHPOINTER1_GRADIENT.addColorStop(
          0.46,
          pointerColor.light.getRgbaColor()
        )
        NORTHPOINTER1_GRADIENT.addColorStop(
          0.47,
          pointerColor.medium.getRgbaColor()
        )
        NORTHPOINTER1_GRADIENT.addColorStop(
          1,
          pointerColor.medium.getRgbaColor()
        )
        ctx.fillStyle = NORTHPOINTER1_GRADIENT
        ctx.strokeStyle = pointerColor.dark.getRgbaColor()
        ctx.lineWidth = 1
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.fill()
        ctx.stroke()

        // SOUTHPOINTER
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.504672)
        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.504672)
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.850467)
        ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.504672)
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.504672)
        ctx.closePath()
        const SOUTHPOINTER1_GRADIENT = ctx.createLinearGradient(
          0.471962 * imageWidth,
          0,
          0.528036 * imageWidth,
          0
        )
        SOUTHPOINTER1_GRADIENT.addColorStop(0, '#e3e5e8')
        SOUTHPOINTER1_GRADIENT.addColorStop(0.48, '#e3e5e8')
        SOUTHPOINTER1_GRADIENT.addColorStop(0.480099, '#abb1b8')
        SOUTHPOINTER1_GRADIENT.addColorStop(1, '#abb1b8')
        ctx.fillStyle = SOUTHPOINTER1_GRADIENT
        const strokeColor_SOUTHPOINTER = '#abb1b8'
        ctx.strokeStyle = strokeColor_SOUTHPOINTER
        ctx.lineWidth = 1
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.fill()
        ctx.stroke()
      }
        break
    }
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
      drawRadialCustomImage(
        backgroundContext,
        customLayer,
        centerX,
        centerY,
        imageWidth,
        imageHeight
      )

      if (roseVisible) {
        drawRoseImage(
          roseContext,
          centerX,
          centerY,
          imageWidth,
          imageHeight,
          backgroundColor
        )
      }

      drawTickmarksImage(roseContext)
    }

    drawPointerImage(pointerContext, false)

    if (foregroundVisible) {
      drawForeground(
        foregroundContext,
        foregroundType,
        imageWidth,
        imageHeight,
        true,
        knobType,
        knobStyle
      )
    }
  }

  const repaint = function () {
    if (!initialized) {
      init()
    }

    mainCtx.save()
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)
    // Define rotation center
    angle = HALF_PI + value * angleStep - HALF_PI

    if (backgroundVisible || frameVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0)
    }

    if (rotateFace) {
      mainCtx.save()
      mainCtx.translate(centerX, centerY)
      mainCtx.rotate(-angle)
      mainCtx.translate(-centerX, -centerY)
      if (backgroundVisible) {
        mainCtx.drawImage(roseBuffer, 0, 0)
      }
      mainCtx.restore()
    } else {
      if (backgroundVisible) {
        mainCtx.drawImage(roseBuffer, 0, 0)
      }
      mainCtx.translate(centerX, centerY)
      mainCtx.rotate(angle)
      mainCtx.translate(-centerX, -centerY)
    }
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset
    mainCtx.shadowBlur = shadowOffset * 2
    // Draw the pointer
    mainCtx.drawImage(pointerBuffer, 0, 0)
    // Undo the translations & shadow settings
    mainCtx.restore()

    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  repaint()

  return this
}

export default Compass

export class CompassElement extends BaseElement {
  static get objectConstructor () { return Compass }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 200 },
      value: { type: Number, defaultValue: 0 },
      real_value: { state: true },
      transitionTime: { type: Number, defaultValue: 500 },
      frameDesign: { type: String, objectEnum: FrameDesign, defaultValue: 'METAL' },
      noFrameVisible: { type: Boolean, defaultValue: false },
      backgroundColor: { type: String, objectEnum: BackgroundColor, defaultValue: 'DARK_GRAY' },
      noBackgroundVisible: { type: Boolean, defaultValue: false },
      pointerType: { type: String, objectEnum: PointerType, defaultValue: 'TYPE1' },
      pointerColor: { type: String, objectEnum: ColorDef, defaultValue: 'GRAY' },
      knobType: { type: String, objectEnum: KnobType, defaultValue: 'METAL_KNOB' },
      knobStyle: { type: String, objectEnum: KnobStyle, defaultValue: 'BLACK' },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false },
      pointSymbols: { type: Array, defaultValue: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] },
      noPointSymbolsVisible: { type: Boolean, defaultValue: false },
      degreeScale: { type: Boolean, defaultValue: false },
      noRoseVisible: { type: Boolean, defaultValue: false },
      rotateFace: { type: Boolean, defaultValue: false }
    }
  }

  constructor () {
    super()
    this._timer = timer(() => {})
    this._timer.stop()
  }

  connectedCallback () {
    super.connectedCallback()
    this.real_value = this.real_value ?? 0
  }

  render () {
    return html`
      <canvas width="${this.size}" height="${this.size}"></canvas>
    `
  }

  updated (changedProperties) {
    super.updated()
    if (changedProperties.has('value') || changedProperties.has('transitionTime')) {
      const transitionTime = this.transitionTime
      const originTime = now()
      const originValue = this.real_value
      const targetValue = this.value
      const timeScale = transitionTime <= 0 ? () => 1 : scaleLinear().domain([0, transitionTime]).clamp(true)
      const valueScale = scaleLinear().range([originValue, targetValue]).clamp(true)
      this._timer.restart((elapsedTime) => {
        const scaled = timeScale(elapsedTime)
        const eased = easeCubicInOut(scaled)
        const newValue = valueScale(eased)
        this.real_value = newValue
        if (now() >= originTime + transitionTime) {
          this._timer.stop()
        }
      })
    }
  }
}

window.customElements.define('steelseries-compass', CompassElement)

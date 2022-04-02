
import drawFrame from './drawFrame.js'
import drawBackground from './drawBackground.js'
import drawRadialCustomImage from './drawRadialCustomImage.js'
import drawForeground from './drawForeground.js'
import createLcdBackgroundImage from './createLcdBackgroundImage.js'
import drawTitleImage from './drawTitleImage.js'
import {
  createBuffer,
  getCanvasContext,
  TWO_PI,
  PI,
  lcdFontName,
  stdFontName
} from './tools.js'

import {
  BackgroundColor,
  LcdColor,
  KnobType,
  KnobStyle,
  FrameDesign,
  ForegroundType
} from './definitions.js'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

export function drawAltimeter (canvas, parameters) {
  parameters = parameters || {}
  // parameters
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
  const titleString =
    undefined === parameters.titleString ? '' : parameters.titleString
  const unitString =
    undefined === parameters.unitString ? '' : parameters.unitString
  const unitAltPos = parameters.unitAltPos ?? false
  const knobType =
    undefined === parameters.knobType
      ? KnobType.METAL_KNOB
      : parameters.knobType
  const knobStyle =
    undefined === parameters.knobStyle ? KnobStyle.BLACK : parameters.knobStyle
  const lcdColor =
    undefined === parameters.lcdColor ? LcdColor.BLACK : parameters.lcdColor
  const lcdVisible =
    undefined === parameters.lcdVisible ? true : parameters.lcdVisible
  const digitalFont =
    undefined === parameters.digitalFont ? false : parameters.digitalFont
  const foregroundType =
    undefined === parameters.foregroundType
      ? ForegroundType.TYPE1
      : parameters.foregroundType
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const customLayer =
    undefined === parameters.customLayer ? null : parameters.customLayer
  //
  const minValue = 0
  const maxValue = 10
  const value = parameters.value ?? minValue
  let value100 = 0
  let value1000 = 0
  let value10000 = 0
  let angleStep100ft
  let angleStep1000ft
  let angleStep10000ft
  const tickLabelPeriod = 1 // Draw value at every 10th tickmark
  const mainCtx = getCanvasContext(canvas) // Get the canvas context
  // Constants
  const TICKMARK_OFFSET = PI
  //
  let initialized = false
  // **************   Buffer creation  ********************
  // Buffer for the frame
  const frameBuffer = createBuffer(size, size)
  const frameContext = frameBuffer.getContext('2d')
  // Buffer for the background
  const backgroundBuffer = createBuffer(size, size)
  const backgroundContext = backgroundBuffer.getContext('2d')

  let lcdBuffer

  // Buffer for 10000ft pointer image painting code
  const pointer10000Buffer = createBuffer(size, size)
  const pointer10000Context = pointer10000Buffer.getContext('2d')

  // Buffer for 1000ft pointer image painting code
  const pointer1000Buffer = createBuffer(size, size)
  const pointer1000Context = pointer1000Buffer.getContext('2d')

  // Buffer for 100ft pointer image painting code
  const pointer100Buffer = createBuffer(size, size)
  const pointer100Context = pointer100Buffer.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  const foregroundContext = foregroundBuffer.getContext('2d')
  // End of variables

  // Get the canvas context and clear it
  mainCtx.save()
  // Has a size been specified?
  size =
    size === 0 ? Math.min(mainCtx.canvas.width, mainCtx.canvas.height) : size

  // Set the size
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  const imageWidth = size
  const imageHeight = size

  const centerX = imageWidth / 2
  const centerY = imageHeight / 2

  const unitStringPosY = unitAltPos ? imageHeight * 0.68 : false

  const stdFont = Math.floor(imageWidth * 0.09) + 'px ' + stdFontName

  // **************   Image creation  ********************
  const drawLcdText = function (value) {
    mainCtx.save()
    mainCtx.textAlign = 'right'
    mainCtx.textBaseline = 'middle'
    mainCtx.strokeStyle = lcdColor.textColor
    mainCtx.fillStyle = lcdColor.textColor

    if (
      lcdColor === LcdColor.STANDARD ||
      lcdColor === LcdColor.STANDARD_GREEN
    ) {
      mainCtx.shadowColor = 'gray'
      mainCtx.shadowOffsetX = imageWidth * 0.007
      mainCtx.shadowOffsetY = imageWidth * 0.007
      mainCtx.shadowBlur = imageWidth * 0.009
    }
    if (digitalFont) {
      mainCtx.font = Math.floor(imageWidth * 0.075) + 'px ' + lcdFontName
    } else {
      mainCtx.font = Math.floor(imageWidth * 0.075) + 'px bold ' + stdFontName
    }
    mainCtx.fillText(
      Math.round(value),
      (imageWidth + imageWidth * 0.4) / 2 - 4,
      imageWidth * 0.607,
      imageWidth * 0.4
    )
    mainCtx.restore()
  }

  const drawTickmarksImage = function (
    ctx,
    freeAreaAngle,
    offset,
    minVal,
    maxVal,
    angleStep
  ) {
    const MEDIUM_STROKE = Math.max(imageWidth * 0.012, 2)
    const THIN_STROKE = Math.max(imageWidth * 0.007, 1.5)
    const TEXT_DISTANCE = imageWidth * 0.13
    const MED_LENGTH = imageWidth * 0.05
    const MAX_LENGTH = imageWidth * 0.07
    const RADIUS = imageWidth * 0.4
    let counter = 0
    let sinValue = 0
    let cosValue = 0
    let alpha // angle for tickmarks
    let valueCounter // value for tickmarks
    const ALPHA_START = -offset - freeAreaAngle / 2

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = stdFont
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()

    for (
      alpha = ALPHA_START, valueCounter = 0;
      valueCounter <= 10;
      alpha -= angleStep * 0.1, valueCounter += 0.1
    ) {
      sinValue = Math.sin(alpha)
      cosValue = Math.cos(alpha)

      // tickmark every 2 units
      if (counter % 2 === 0) {
        ctx.lineWidth = THIN_STROKE
        // Draw ticks
        ctx.beginPath()
        ctx.moveTo(
          centerX + (RADIUS - MED_LENGTH) * sinValue,
          centerY + (RADIUS - MED_LENGTH) * cosValue
        )
        ctx.lineTo(centerX + RADIUS * sinValue, centerY + RADIUS * cosValue)
        ctx.closePath()
        ctx.stroke()
      }

      // Different tickmark every 10 units
      if (counter === 10 || counter === 0) {
        ctx.lineWidth = MEDIUM_STROKE

        // if gauge is full circle, avoid painting maxValue over minValue
        if (freeAreaAngle === 0) {
          if (Math.round(valueCounter) !== maxValue) {
            ctx.fillText(
              Math.round(valueCounter).toString(),
              centerX + (RADIUS - TEXT_DISTANCE) * sinValue,
              centerY + (RADIUS - TEXT_DISTANCE) * cosValue
            )
          }
        }
        counter = 0

        // Draw ticks
        ctx.beginPath()
        ctx.moveTo(
          centerX + (RADIUS - MAX_LENGTH) * sinValue,
          centerY + (RADIUS - MAX_LENGTH) * cosValue
        )
        ctx.lineTo(centerX + RADIUS * sinValue, centerY + RADIUS * cosValue)
        ctx.closePath()
        ctx.stroke()
      }
      counter++
    }
    ctx.restore()
  }

  const draw100ftPointer = function (ctx, shadow) {
    let grad

    if (shadow) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    } else {
      grad = ctx.createLinearGradient(
        0,
        imageHeight * 0.168224,
        0,
        imageHeight * 0.626168
      )
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.31, '#ffffff')
      grad.addColorStop(0.3101, '#ffffff')
      grad.addColorStop(0.32, '#202020')
      grad.addColorStop(1, '#202020')
      ctx.fillStyle = grad
    }

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962)
    ctx.bezierCurveTo(
      imageWidth * 0.514018,
      imageHeight * 0.471962,
      imageWidth * 0.509345,
      imageHeight * 0.467289,
      imageWidth * 0.509345,
      imageHeight * 0.467289
    )
    ctx.lineTo(imageWidth * 0.509345, imageHeight * 0.200934)
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.168224)
    ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.200934)
    ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.467289)
    ctx.bezierCurveTo(
      imageWidth * 0.490654,
      imageHeight * 0.467289,
      imageWidth * 0.481308,
      imageHeight * 0.471962,
      imageWidth * 0.481308,
      imageHeight * 0.471962
    )
    ctx.bezierCurveTo(
      imageWidth * 0.471962,
      imageHeight * 0.481308,
      imageWidth * 0.467289,
      imageHeight * 0.490654,
      imageWidth * 0.467289,
      imageHeight * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.467289,
      imageHeight * 0.514018,
      imageWidth * 0.476635,
      imageHeight * 0.528037,
      imageWidth * 0.490654,
      imageHeight * 0.53271
    )
    ctx.bezierCurveTo(
      imageWidth * 0.490654,
      imageHeight * 0.53271,
      imageWidth * 0.490654,
      imageHeight * 0.579439,
      imageWidth * 0.490654,
      imageHeight * 0.588785
    )
    ctx.bezierCurveTo(
      imageWidth * 0.485981,
      imageHeight * 0.593457,
      imageWidth * 0.481308,
      imageHeight * 0.59813,
      imageWidth * 0.481308,
      imageHeight * 0.607476
    )
    ctx.bezierCurveTo(
      imageWidth * 0.481308,
      imageHeight * 0.616822,
      imageWidth * 0.490654,
      imageHeight * 0.626168,
      imageWidth * 0.5,
      imageHeight * 0.626168
    )
    ctx.bezierCurveTo(
      imageWidth * 0.509345,
      imageHeight * 0.626168,
      imageWidth * 0.518691,
      imageHeight * 0.616822,
      imageWidth * 0.518691,
      imageHeight * 0.607476
    )
    ctx.bezierCurveTo(
      imageWidth * 0.518691,
      imageHeight * 0.59813,
      imageWidth * 0.514018,
      imageHeight * 0.593457,
      imageWidth * 0.504672,
      imageHeight * 0.588785
    )
    ctx.bezierCurveTo(
      imageWidth * 0.504672,
      imageHeight * 0.579439,
      imageWidth * 0.504672,
      imageHeight * 0.53271,
      imageWidth * 0.509345,
      imageHeight * 0.53271
    )
    ctx.bezierCurveTo(
      imageWidth * 0.523364,
      imageHeight * 0.528037,
      imageWidth * 0.53271,
      imageHeight * 0.514018,
      imageWidth * 0.53271,
      imageHeight * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.53271,
      imageHeight * 0.490654,
      imageWidth * 0.528037,
      imageHeight * 0.481308,
      imageWidth * 0.518691,
      imageHeight * 0.471962
    )
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const draw1000ftPointer = function (ctx) {
    const grad = ctx.createLinearGradient(
      0,
      imageHeight * 0.401869,
      0,
      imageHeight * 0.616822
    )
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.51, '#ffffff')
    grad.addColorStop(0.52, '#ffffff')
    grad.addColorStop(0.5201, '#202020')
    grad.addColorStop(0.53, '#202020')
    grad.addColorStop(1, '#202020')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962)
    ctx.bezierCurveTo(
      imageWidth * 0.514018,
      imageHeight * 0.462616,
      imageWidth * 0.528037,
      imageHeight * 0.401869,
      imageWidth * 0.528037,
      imageHeight * 0.401869
    )
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.331775)
    ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.401869)
    ctx.bezierCurveTo(
      imageWidth * 0.471962,
      imageHeight * 0.401869,
      imageWidth * 0.485981,
      imageHeight * 0.462616,
      imageWidth * 0.481308,
      imageHeight * 0.471962
    )
    ctx.bezierCurveTo(
      imageWidth * 0.471962,
      imageHeight * 0.481308,
      imageWidth * 0.467289,
      imageHeight * 0.490654,
      imageWidth * 0.467289,
      imageHeight * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.467289,
      imageHeight * 0.514018,
      imageWidth * 0.476635,
      imageHeight * 0.528037,
      imageWidth * 0.490654,
      imageHeight * 0.53271
    )
    ctx.bezierCurveTo(
      imageWidth * 0.490654,
      imageHeight * 0.53271,
      imageWidth * 0.462616,
      imageHeight * 0.574766,
      imageWidth * 0.462616,
      imageHeight * 0.593457
    )
    ctx.bezierCurveTo(
      imageWidth * 0.467289,
      imageHeight * 0.616822,
      imageWidth * 0.5,
      imageHeight * 0.612149,
      imageWidth * 0.5,
      imageHeight * 0.612149
    )
    ctx.bezierCurveTo(
      imageWidth * 0.5,
      imageHeight * 0.612149,
      imageWidth * 0.53271,
      imageHeight * 0.616822,
      imageWidth * 0.537383,
      imageHeight * 0.593457
    )
    ctx.bezierCurveTo(
      imageWidth * 0.537383,
      imageHeight * 0.574766,
      imageWidth * 0.509345,
      imageHeight * 0.53271,
      imageWidth * 0.509345,
      imageHeight * 0.53271
    )
    ctx.bezierCurveTo(
      imageWidth * 0.523364,
      imageHeight * 0.528037,
      imageWidth * 0.53271,
      imageHeight * 0.514018,
      imageWidth * 0.53271,
      imageHeight * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.53271,
      imageHeight * 0.490654,
      imageWidth * 0.528037,
      imageHeight * 0.481308,
      imageWidth * 0.518691,
      imageHeight * 0.471962
    )
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const draw10000ftPointer = function (ctx) {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962)
    ctx.bezierCurveTo(
      imageWidth * 0.514018,
      imageHeight * 0.471962,
      imageWidth * 0.514018,
      imageHeight * 0.467289,
      imageWidth * 0.514018,
      imageHeight * 0.467289
    )
    ctx.lineTo(imageWidth * 0.514018, imageHeight * 0.317757)
    ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.303738)
    ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.182242)
    ctx.lineTo(imageWidth * 0.53271, imageHeight * 0.116822)
    ctx.lineTo(imageWidth * 0.462616, imageHeight * 0.116822)
    ctx.lineTo(imageWidth * 0.495327, imageHeight * 0.182242)
    ctx.lineTo(imageWidth * 0.495327, imageHeight * 0.299065)
    ctx.lineTo(imageWidth * 0.485981, imageHeight * 0.317757)
    ctx.lineTo(imageWidth * 0.485981, imageHeight * 0.467289)
    ctx.bezierCurveTo(
      imageWidth * 0.485981,
      imageHeight * 0.467289,
      imageWidth * 0.485981,
      imageHeight * 0.471962,
      imageWidth * 0.481308,
      imageHeight * 0.471962
    )
    ctx.bezierCurveTo(
      imageWidth * 0.471962,
      imageHeight * 0.481308,
      imageWidth * 0.467289,
      imageHeight * 0.490654,
      imageWidth * 0.467289,
      imageHeight * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.467289,
      imageHeight * 0.518691,
      imageWidth * 0.481308,
      imageHeight * 0.53271,
      imageWidth * 0.5,
      imageHeight * 0.53271
    )
    ctx.bezierCurveTo(
      imageWidth * 0.518691,
      imageHeight * 0.53271,
      imageWidth * 0.53271,
      imageHeight * 0.518691,
      imageWidth * 0.53271,
      imageHeight * 0.5
    )
    ctx.bezierCurveTo(
      imageWidth * 0.53271,
      imageHeight * 0.490654,
      imageWidth * 0.528037,
      imageHeight * 0.481308,
      imageWidth * 0.518691,
      imageHeight * 0.471962
    )
    ctx.closePath()
    ctx.fill()
  }

  function calcAngleStep () {
    angleStep100ft = TWO_PI / (maxValue - minValue)
    angleStep1000ft = angleStep100ft / 10
    angleStep10000ft = angleStep1000ft / 10
  }

  function calcValues () {
    value100 = (value % 1000) / 100
    value1000 = (value % 10000) / 100
    value10000 = (value % 100000) / 100
  }

  // **************   Initialization  ********************
  // Draw all static painting code to background
  const init = function (parameters) {
    parameters = parameters || {}
    // Parameters
    const drawFrame2 =
      undefined === parameters.frame ? false : parameters.frame
    const drawBackground2 =
      undefined === parameters.background ? false : parameters.background
    const drawPointers =
      undefined === parameters.pointers ? false : parameters.pointers
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground

    initialized = true

    calcAngleStep()

    // Create frame in frame buffer (backgroundBuffer)
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

      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(
        backgroundContext,
        0,
        TICKMARK_OFFSET,
        0,
        10,
        angleStep100ft,
        tickLabelPeriod,
        0,
        true,
        true,
        null
      )

      // Create title in background buffer (backgroundBuffer)
      drawTitleImage(
        backgroundContext,
        imageWidth,
        imageHeight,
        titleString,
        unitString,
        backgroundColor,
        true,
        true,
        unitStringPosY
      )
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground2 && lcdVisible) {
      lcdBuffer = createLcdBackgroundImage(
        imageWidth * 0.4,
        imageHeight * 0.09,
        lcdColor
      )
      backgroundContext.drawImage(
        lcdBuffer,
        (imageWidth - imageWidth * 0.4) / 2,
        imageHeight * 0.56
      )
    }

    if (drawPointers) {
      // Create 100ft pointer in buffer
      draw100ftPointer(pointer100Context, false)
      // Create 1000ft pointer in buffer
      draw1000ftPointer(pointer1000Context, false)
      // Create 10000ft pointer in buffer
      draw10000ftPointer(pointer10000Context, false)
    }

    if (drawForeground2 && foregroundVisible) {
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
      init({
        frame: true,
        background: true,
        led: true,
        pointers: true,
        foreground: true
      })
    }

    // mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0)
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0)

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(value)
    }

    // re-calculate the spearate pointer values
    calcValues()

    let shadowOffset = imageWidth * 0.006 * 0.5

    mainCtx.save()
    // Draw 10000ft pointer
    // Define rotation center
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate((value10000 - minValue) * angleStep10000ft)
    mainCtx.translate(-centerX, -centerY)
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset
    mainCtx.shadowBlur = shadowOffset * 2
    // Draw the pointer
    mainCtx.drawImage(pointer10000Buffer, 0, 0)

    shadowOffset = imageWidth * 0.006 * 0.75
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset

    // Draw 1000ft pointer
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(
      (value1000 - minValue) * angleStep1000ft -
        (value10000 - minValue) * angleStep10000ft
    )
    mainCtx.translate(-centerX, -centerY)
    mainCtx.drawImage(pointer1000Buffer, 0, 0)

    shadowOffset = imageWidth * 0.006
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset

    // Draw 100ft pointer
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(
      (value100 - minValue) * angleStep100ft -
        (value1000 - minValue) * angleStep1000ft
    )
    mainCtx.translate(-centerX, -centerY)
    mainCtx.drawImage(pointer100Buffer, 0, 0)
    mainCtx.restore()

    // Draw the foregound
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  repaint()
}

export class AltimeterElement extends BaseElement {
  static get drawFunction () { return drawAltimeter }

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
      titleString: { type: String, defaultValue: '' },
      unitString: { type: String, defaultValue: '' },
      unitAltPos: { type: Boolean, defaultValue: false },
      knobType: { type: String, objectEnum: KnobType, defaultValue: 'METAL_KNOB' },
      knobStyle: { type: String, objectEnum: KnobStyle, defaultValue: 'BLACK' },
      lcdColor: { type: String, objectEnum: LcdColor, defaultValue: 'BLACK' },
      noLcdVisible: { type: Boolean, defaultValue: false },
      digitalFont: { type: Boolean, defaultValue: false },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false }
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

window.customElements.define('steelseries-altimeter', AltimeterElement)


import drawPointerImage from './drawPointerImage'
import drawFrame from './drawFrame'
import drawBackground from './drawBackground'
import drawRadialCustomImage from './drawRadialCustomImage'
import drawForeground from './drawForeground'
import createLcdBackgroundImage from './createLcdBackgroundImage'
import drawRoseImage from './drawRoseImage'
import {
  createBuffer,
  getCanvasContext,
  HALF_PI,
  TWO_PI,
  RAD_FACTOR,
  lcdFontName,
  stdFontName
} from './tools'

import {
  BackgroundColor,
  LcdColor,
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

const WindDirection = function (canvas, parameters) {
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
  const pointerTypeLatest =
    undefined === parameters.pointerTypeLatest
      ? PointerType.TYPE1
      : parameters.pointerTypeLatest
  const pointerTypeAverage =
    undefined === parameters.pointerTypeAverage
      ? PointerType.TYPE8
      : parameters.pointerTypeAverage
  const pointerColor =
    undefined === parameters.pointerColor
      ? ColorDef.RED
      : parameters.pointerColor
  const pointerColorAverage =
    undefined === parameters.pointerColorAverage
      ? ColorDef.BLUE
      : parameters.pointerColorAverage
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
    undefined === parameters.degreeScale ? true : parameters.degreeScale
  const degreeScaleHalf =
    undefined === parameters.degreeScaleHalf
      ? false
      : parameters.degreeScaleHalf
  const roseVisible =
    undefined === parameters.roseVisible ? false : parameters.roseVisible
  const lcdColor =
    undefined === parameters.lcdColor ? LcdColor.STANDARD : parameters.lcdColor
  const lcdVisible =
    undefined === parameters.lcdVisible ? true : parameters.lcdVisible
  const digitalFont =
    undefined === parameters.digitalFont ? false : parameters.digitalFont
  const section = undefined === parameters.section ? null : parameters.section
  const area = undefined === parameters.area ? null : parameters.area
  const lcdTitleStrings =
    undefined === parameters.lcdTitleStrings
      ? ['Latest', 'Average']
      : parameters.lcdTitleStrings
  const titleString =
    undefined === parameters.titleString ? '' : parameters.titleString
  const useColorLabels =
    undefined === parameters.useColorLabels ? false : parameters.useColorLabels

  const valueLatest = parameters.valueLatest ?? 0
  const valueAverage = parameters.valueAverage ?? 0
  const angleStep = RAD_FACTOR
  let angleLatest
  let angleAverage
  const rotationOffset = -HALF_PI
  const angleRange = TWO_PI
  const range = 360

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

  const lcdFontHeight = Math.floor(imageWidth / 10)
  const stdFont = lcdFontHeight + 'px ' + stdFontName
  const lcdFont = lcdFontHeight + 'px ' + lcdFontName
  const lcdWidth = imageWidth * 0.3
  const lcdHeight = imageHeight * 0.12
  const lcdPosX = (imageWidth - lcdWidth) / 2
  const lcdPosY1 = imageHeight * 0.32
  const lcdPosY2 = imageHeight * 0.565

  let initialized = false

  // **************   Buffer creation  ********************
  // Buffer for all static background painting code
  const backgroundBuffer = createBuffer(size, size)
  const backgroundContext = backgroundBuffer.getContext('2d')

  // Buffer for LCD displays
  let lcdBuffer

  // Buffer for latest pointer images painting code
  const pointerBufferLatest = createBuffer(size, size)
  const pointerContextLatest = pointerBufferLatest.getContext('2d')

  // Buffer for average pointer image
  const pointerBufferAverage = createBuffer(size, size)
  const pointerContextAverage = pointerBufferAverage.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  const foregroundContext = foregroundBuffer.getContext('2d')

  // **************   Image creation  ********************
  const drawLcdText = function (value, bLatest) {
    mainCtx.save()
    mainCtx.textAlign = 'center'
    mainCtx.strokeStyle = lcdColor.textColor
    mainCtx.fillStyle = lcdColor.textColor

    // convert value from -180,180 range into 0-360 range
    while (value < -180) {
      value += 360
    }
    if (!degreeScaleHalf && value < 0) {
      value += 360
    }

    if (degreeScaleHalf && value > 180) {
      value = -(360 - value)
    }

    if (value >= 0) {
      value = '00' + Math.round(value)
      value = value.substring(value.length, value.length - 3)
    } else {
      value = '00' + Math.abs(Math.round(value))
      value = '-' + value.substring(value.length, value.length - 3)
    }

    if (
      lcdColor === LcdColor.STANDARD ||
      lcdColor === LcdColor.STANDARD_GREEN
    ) {
      mainCtx.shadowColor = 'gray'
      mainCtx.shadowOffsetX = imageWidth * 0.007
      mainCtx.shadowOffsetY = imageWidth * 0.007
      mainCtx.shadowBlur = imageWidth * 0.007
    }
    mainCtx.font = digitalFont ? lcdFont : stdFont
    mainCtx.fillText(
      value + '\u00B0',
      imageWidth / 2 + lcdWidth * 0.05,
      (bLatest ? lcdPosY1 : lcdPosY2) + lcdHeight * 0.5 + lcdFontHeight * 0.38,
      lcdWidth * 0.9
    )

    mainCtx.restore()
  }

  const drawAreaSectionImage = function (ctx, start, stop, color, filled) {
    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = imageWidth * 0.035
    const startAngle = (angleRange / range) * start
    const stopAngle = startAngle + (stop - start) / (range / angleRange)
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationOffset)
    ctx.beginPath()
    if (filled) {
      ctx.moveTo(0, 0)
      ctx.arc(
        0,
        0,
        imageWidth * 0.365 - ctx.lineWidth / 2,
        startAngle,
        stopAngle,
        false
      )
    } else {
      ctx.arc(0, 0, imageWidth * 0.365, startAngle, stopAngle, false)
    }
    if (filled) {
      ctx.moveTo(0, 0)
      ctx.fill()
    } else {
      ctx.stroke()
    }

    ctx.translate(-centerX, -centerY)
    ctx.restore()
  }

  const drawTickmarksImage = function (ctx) {
    const OUTER_POINT = imageWidth * 0.38
    const MAJOR_INNER_POINT = imageWidth * 0.35
    // MED_INNER_POINT = imageWidth * 0.355,
    const MINOR_INNER_POINT = imageWidth * 0.36
    const TEXT_WIDTH = imageWidth * 0.1
    const TEXT_TRANSLATE_X = imageWidth * 0.31
    const CARDINAL_TRANSLATE_X = imageWidth * 0.36
    let stdFont
    let smlFont
    let i
    let val
    let to

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.save()
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.translate(centerX, centerY)

    if (!degreeScale) {
      stdFont = 0.12 * imageWidth + 'px serif'
      smlFont = 0.06 * imageWidth + 'px serif'

      // let angleStep = RAD_FACTOR;
      ctx.lineWidth = 1
      ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor()

      for (i = 0; i < 360; i += 2.5) {
        if (i % 5 === 0) {
          ctx.beginPath()
          ctx.moveTo(imageWidth * 0.38, 0)
          ctx.lineTo(imageWidth * 0.36, 0)
          ctx.closePath()
          ctx.stroke()
        }

        // Draw the labels
        ctx.save()
        switch (i) {
          case 0: // E
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[2], 0, 0)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 45: // SE
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[3], 0, 0)
            ctx.translate(-imageWidth * 0.29, 0)
            break
          case 90: // S
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[4], 0, 0)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 135: // SW
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[5], 0, 0)
            ctx.translate(-imageWidth * 0.29, 0)
            break
          case 180: // W
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[6], 0, 0)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 225: // NW
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[7], 0, 0)
            ctx.translate(-imageWidth * 0.29, 0)
            break
          case 270: // N
            ctx.translate(imageWidth * 0.35, 0)
            ctx.rotate(HALF_PI)
            ctx.font = stdFont
            ctx.fillText(pointSymbols[0], 0, 0)
            ctx.translate(-imageWidth * 0.35, 0)
            break
          case 315: // NE
            ctx.translate(imageWidth * 0.29, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(pointSymbols[1], 0, 0)
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
          ctx.stroke()
        }
        ctx.rotate(angleStep * 2.5)
      }
    } else {
      stdFont = Math.floor(0.1 * imageWidth) + 'px serif bold'
      smlFont = Math.floor(imageWidth * 0.04) + 'px ' + stdFontName

      ctx.rotate(angleStep * 5)
      for (i = 5; i <= 360; i += 5) {
        // Draw the labels
        ctx.save()
        if (pointSymbolsVisible) {
          switch (i) {
            case 360:
              ctx.translate(CARDINAL_TRANSLATE_X, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[2], 0, 0, TEXT_WIDTH)
              ctx.translate(-CARDINAL_TRANSLATE_X, 0)
              break
            case 90:
              ctx.translate(CARDINAL_TRANSLATE_X, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[4], 0, 0, TEXT_WIDTH)
              ctx.translate(-CARDINAL_TRANSLATE_X, 0)
              break
            case 180:
              ctx.translate(CARDINAL_TRANSLATE_X, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[6], 0, 0, TEXT_WIDTH)
              ctx.translate(-CARDINAL_TRANSLATE_X, 0)
              break
            case 270:
              ctx.translate(CARDINAL_TRANSLATE_X, 0)
              ctx.rotate(HALF_PI)
              ctx.font = stdFont
              ctx.fillText(pointSymbols[0], 0, 0, TEXT_WIDTH)
              ctx.translate(-CARDINAL_TRANSLATE_X, 0)
              break

            case 5:
            case 85:
            case 95:
            case 175:
            case 185:
            case 265:
            case 275:
            case 355:
              // leave room for ordinal labels
              break

            default:
              if ((i + 90) % 20) {
                ctx.lineWidth = (i + 90) % 5 ? 1.5 : 1
                ctx.beginPath()
                ctx.moveTo(OUTER_POINT, 0)
                to = (i + 90) % 10 ? MINOR_INNER_POINT : MAJOR_INNER_POINT
                ctx.lineTo(to, 0)
                ctx.closePath()
                ctx.stroke()
              } else {
                ctx.lineWidth = 1.5
                ctx.beginPath()
                ctx.moveTo(OUTER_POINT, 0)
                ctx.lineTo(MAJOR_INNER_POINT, 0)
                ctx.closePath()
                ctx.stroke()
                val = (i + 90) % 360
                ctx.translate(TEXT_TRANSLATE_X, 0)
                ctx.rotate(HALF_PI)
                ctx.font = smlFont
                ctx.fillText('0'.substring(val >= 100) + val, 0, 0, TEXT_WIDTH)
                ctx.translate(-TEXT_TRANSLATE_X, 0)
              }
          }
        } else {
          if ((i + 90) % 20) {
            ctx.lineWidth = (i + 90) % 5 ? 1.5 : 1
            ctx.beginPath()
            ctx.moveTo(OUTER_POINT, 0)
            to = (i + 90) % 10 ? MINOR_INNER_POINT : MAJOR_INNER_POINT
            ctx.lineTo(to, 0)
            ctx.closePath()
            ctx.stroke()
          } else {
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(OUTER_POINT, 0)
            ctx.lineTo(MAJOR_INNER_POINT, 0)
            ctx.closePath()
            ctx.stroke()
            val = (i + 90) % 360
            if (degreeScaleHalf) {
              // invert 180-360
              if (val > 180) {
                val = -(360 - val)
              }
            }
            ctx.translate(TEXT_TRANSLATE_X, 0)
            ctx.rotate(HALF_PI)
            ctx.font = smlFont
            ctx.fillText(val, 0, 0, TEXT_WIDTH)
            ctx.translate(-TEXT_TRANSLATE_X, 0)
          }
        }
        ctx.restore()
        ctx.rotate(angleStep * 5)
      }
    }
    ctx.translate(-centerX, -centerY)
    ctx.restore()
  }

  const drawLcdTitles = function (ctx) {
    if (lcdTitleStrings.length > 0) {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = useColorLabels
        ? pointerColor.medium.getRgbaColor()
        : backgroundColor.labelColor.getRgbaColor()
      ctx.font = 0.04 * imageWidth + 'px ' + stdFontName
      ctx.fillText(
        lcdTitleStrings[0],
        imageWidth / 2,
        imageHeight * 0.29,
        imageWidth * 0.3
      )
      ctx.fillStyle = useColorLabels
        ? pointerColorAverage.medium.getRgbaColor()
        : backgroundColor.labelColor.getRgbaColor()
      ctx.fillText(
        lcdTitleStrings[1],
        imageWidth / 2,
        imageHeight * 0.71,
        imageWidth * 0.3
      )
      if (titleString.length > 0) {
        ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()
        ctx.font = 0.0467 * imageWidth + 'px ' + stdFontName
        ctx.fillText(
          titleString,
          imageWidth / 2,
          imageHeight * 0.5,
          imageWidth * 0.3
        )
      }
    }
  }

  // **************   Initialization  ********************
  // Draw all static painting code to background

  const init = function (parameters) {
    parameters = parameters || {}
    const drawBackground2 =
      undefined === parameters.background ? false : parameters.background
    const drawPointer =
      undefined === parameters.pointer ? false : parameters.pointer
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground

    initialized = true

    if (drawBackground2 && frameVisible) {
      drawFrame(
        backgroundContext,
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

      // Create section in background buffer (backgroundBuffer)
      if (section !== null && section.length > 0) {
        let sectionIndex = section.length
        do {
          sectionIndex--
          drawAreaSectionImage(
            backgroundContext,
            section[sectionIndex].start,
            section[sectionIndex].stop,
            section[sectionIndex].color,
            false
          )
        } while (sectionIndex > 0)
      }

      // Create area in background buffer (backgroundBuffer)
      if (area !== null && area.length > 0) {
        let areaIndex = area.length
        do {
          areaIndex--
          drawAreaSectionImage(
            backgroundContext,
            area[areaIndex].start,
            area[areaIndex].stop,
            area[areaIndex].color,
            true
          )
        } while (areaIndex > 0)
      }

      drawTickmarksImage(backgroundContext)
    }

    if (drawBackground2 && roseVisible) {
      drawRoseImage(
        backgroundContext,
        centerX,
        centerY,
        imageWidth,
        imageHeight,
        backgroundColor
      )
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground2 && lcdVisible) {
      lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor)
      backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY1)
      backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY2)
      // Create title in background buffer (backgroundBuffer)
      drawLcdTitles(backgroundContext)
    }

    if (drawPointer) {
      drawPointerImage(
        pointerContextAverage,
        imageWidth,
        pointerTypeAverage,
        pointerColorAverage,
        backgroundColor.labelColor
      )
      drawPointerImage(
        pointerContextLatest,
        imageWidth,
        pointerTypeLatest,
        pointerColor,
        backgroundColor.labelColor
      )
    }

    if (drawForeground2 && foregroundVisible) {
      const knobVisible =
        !(pointerTypeLatest.type === 'type15' ||
        pointerTypeLatest.type === 'type16')
      drawForeground(
        foregroundContext,
        foregroundType,
        imageWidth,
        imageHeight,
        knobVisible,
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
        pointer: true,
        foreground: true
      })
    }

    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    if (frameVisible || backgroundVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0)
    }

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(valueLatest, true)
      drawLcdText(valueAverage, false)
    }

    // Define rotation angle
    angleAverage = valueAverage * angleStep

    // we have to draw to a rotated temporary image area so we can translate in
    // absolute x, y values when drawing to main context
    const shadowOffset = imageWidth * 0.006

    // Define rotation center
    mainCtx.save()
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(angleAverage)
    mainCtx.translate(-centerX, -centerY)
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset
    mainCtx.shadowBlur = shadowOffset * 2
    // Draw the pointer
    mainCtx.drawImage(pointerBufferAverage, 0, 0)
    // Define rotation angle difference for average pointer
    angleLatest = valueLatest * angleStep - angleAverage
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(angleLatest)
    mainCtx.translate(-centerX, -centerY)
    mainCtx.drawImage(pointerBufferLatest, 0, 0)
    mainCtx.restore()

    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  repaint()

  return this
}

export default WindDirection

export class WindDirectionElement extends BaseElement {
  static get objectConstructor () { return WindDirection }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 200 },
      valueLatest: { type: Number, defaultValue: 0 },
      valueAverage: { type: Number, defaultValue: 0 },
      real_valueLatest: { state: true },
      real_valueAverage: { state: true },
      transitionTime: { type: Number, defaultValue: 500 },
      frameDesign: { type: String, objectEnum: FrameDesign, defaultValue: 'METAL' },
      noFrameVisible: { type: Boolean, defaultValue: false },
      backgroundColor: { type: String, objectEnum: BackgroundColor, defaultValue: 'DARK_GRAY' },
      noBackgroundVisible: { type: Boolean, defaultValue: false },
      pointerTypeLatest: { type: String, objectEnum: PointerType, defaultValue: 'TYPE1' },
      pointerTypeAverage: { type: String, objectEnum: PointerType, defaultValue: 'TYPE8' },
      pointerColor: { type: String, objectEnum: ColorDef, defaultValue: 'RED' },
      pointerColorAverage: { type: String, objectEnum: ColorDef, defaultValue: 'BLUE' },
      knobType: { type: String, objectEnum: KnobType, defaultValue: 'STANDARD_KNOB' },
      knobStyle: { type: String, objectEnum: KnobStyle, defaultValue: 'SILVER' },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false },
      pointSymbols: { type: Array, defaultValue: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] },
      noPointSymbolsVisible: { type: Boolean, defaultValue: false },
      noDegreeScale: { type: Boolean, defaultValue: false },
      degreeScaleHalf: { type: Boolean, defaultValue: false },
      roseVisible: { type: Boolean, defaultValue: false },
      lcdColor: { type: String, objectEnum: LcdColor, defaultValue: 'STANDARD' },
      noLcdVisible: { type: Boolean, defaultValue: false },
      digitalFont: { type: Boolean, defaultValue: false },
      lcdTitleStrings: { type: Array, defaultValue: ['Latest', 'Average'] },
      titleString: { type: String, defaultValue: '' },
      useColorLabels: { type: Boolean, defaultValue: false }
    }
  }

  constructor () {
    super()
    this._timer = timer(() => {})
    this._timer.stop()
  }

  connectedCallback () {
    super.connectedCallback()
    this.real_valueLatest = this.real_valueLatest ?? 0
    this.real_valueAverage = this.real_valueAverage ?? 0
  }

  render () {
    return html`
      <canvas width="${this.size}" height="${this.size}"></canvas>
    `
  }

  updated (changedProperties) {
    super.updated()
    if (changedProperties.has('valueLatest') ||
    changedProperties.has('valueAverage') ||
    changedProperties.has('transitionTime')) {
      const transitionTime = this.transitionTime
      const originTime = now()
      const originValueLatest = this.real_valueLatest
      const targetValueLatest = this.valueLatest
      const originValueAverage = this.real_valueAverage
      const targetValueAverage = this.valueAverage
      const timeScale = transitionTime <= 0 ? () => 1 : scaleLinear().domain([0, transitionTime]).clamp(true)
      const valueLatestScale = scaleLinear().range([originValueLatest, targetValueLatest]).clamp(true)
      const valueAverageScale = scaleLinear().range([originValueAverage, targetValueAverage]).clamp(true)
      this._timer.restart((elapsedTime) => {
        const scaled = timeScale(elapsedTime)
        const eased = easeCubicInOut(scaled)
        this.real_valueLatest = valueLatestScale(eased)
        this.real_valueAverage = valueAverageScale(eased)
        if (now() >= originTime + transitionTime) {
          this._timer.stop()
        }
      })
    }
  }
}

window.customElements.define('steelseries-wind-direction', WindDirectionElement)

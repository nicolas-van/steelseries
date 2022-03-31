
import drawPointerImage from './drawPointerImage'
import drawFrame from './drawFrame'
import drawBackground from './drawBackground'
import drawForeground from './drawForeground'
import createKnobImage from './createKnobImage'
import createLedImage from './createLedImage'
import createMeasuredValueImage from './createMeasuredValueImage'
import {
  calcNiceNumber,
  createBuffer,
  getCanvasContext,
  HALF_PI,
  PI,
  doc,
  stdFontName
} from './tools'

import {
  BackgroundColor,
  ColorDef,
  LedColor,
  GaugeType,
  Orientation,
  KnobType,
  KnobStyle,
  FrameDesign,
  PointerType,
  ForegroundType,
  LabelNumberFormat
} from './definitions'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

const RadialVertical = function (canvas, parameters) {
  parameters = parameters || {}
  const orientation =
    undefined === parameters.orientation
      ? Orientation.NORTH
      : parameters.orientation
  let size = undefined === parameters.size ? 0 : parameters.size
  let minValue = undefined === parameters.minValue ? 0 : parameters.minValue
  let maxValue =
    undefined === parameters.maxValue ? minValue + 100 : parameters.maxValue
  const niceScale =
    undefined === parameters.niceScale ? true : parameters.niceScale
  let threshold =
    undefined === parameters.threshold
      ? (maxValue - minValue) / 2 + minValue
      : parameters.threshold
  const section = undefined === parameters.section ? null : parameters.section
  const area = undefined === parameters.area ? null : parameters.area
  const titleString =
    undefined === parameters.titleString ? '' : parameters.titleString
  const unitString =
    undefined === parameters.unitString ? '' : parameters.unitString
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
      ? PointerType.TYPE1
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
  const ledColor =
    undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor
  const ledVisible =
    undefined === parameters.ledVisible ? false : parameters.ledVisible
  const thresholdVisible =
    undefined === parameters.thresholdVisible
      ? true
      : parameters.thresholdVisible
  const minMeasuredValueVisible =
    undefined === parameters.minMeasuredValueVisible
      ? false
      : parameters.minMeasuredValueVisible
  const maxMeasuredValueVisible =
    undefined === parameters.maxMeasuredValueVisible
      ? false
      : parameters.maxMeasuredValueVisible
  const foregroundType =
    undefined === parameters.foregroundType
      ? ForegroundType.TYPE1
      : parameters.foregroundType
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const labelNumberFormat =
    undefined === parameters.labelNumberFormat
      ? LabelNumberFormat.STANDARD
      : parameters.labelNumberFormat
  const playAlarm =
    undefined === parameters.playAlarm ? false : parameters.playAlarm
  const alarmSound =
    undefined === parameters.alarmSound ? false : parameters.alarmSound

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  let audioElement

  // Create audio tag for alarm sound
  if (playAlarm && alarmSound !== false) {
    audioElement = doc.createElement('audio')
    audioElement.setAttribute('src', alarmSound)
    audioElement.setAttribute('preload', 'auto')
  }
  const gaugeType = GaugeType.TYPE5

  let value = parameters.value ?? minValue

  // Properties
  let minMeasuredValue = maxValue
  let maxMeasuredValue = minValue
  const imageWidth = size
  const imageHeight = size

  // Tickmark specific private variables
  let niceMinValue = minValue
  let niceMaxValue = maxValue
  let niceRange = maxValue - minValue
  let range = niceMaxValue - niceMinValue
  let minorTickSpacing = 0
  let majorTickSpacing = 0
  const maxNoOfMinorTicks = 10
  const maxNoOfMajorTicks = 10

  let rotationOffset = 1.25 * PI
  let angleRange = HALF_PI
  let angleStep = angleRange / range
  const shadowOffset = imageWidth * 0.006
  const pointerOffset = (imageWidth * 1.17) / 2

  let initialized = false

  let angle = rotationOffset + (value - minValue) * angleStep

  const centerX = imageWidth / 2
  const centerY = imageHeight * 0.733644

  // Misc
  const ledPosX = 0.455 * imageWidth
  const ledPosY = 0.51 * imageHeight

  // Method to calculate nice values for min, max and range for the tickmarks
  const calculate = function calculate () {
    if (niceScale) {
      niceRange = calcNiceNumber(maxValue - minValue, false)
      majorTickSpacing = calcNiceNumber(
        niceRange / (maxNoOfMajorTicks - 1),
        true
      )
      niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing
      niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing
      minorTickSpacing = calcNiceNumber(
        majorTickSpacing / (maxNoOfMinorTicks - 1),
        true
      )
      minValue = niceMinValue
      maxValue = niceMaxValue
      range = maxValue - minValue
    } else {
      niceRange = maxValue - minValue
      niceMinValue = minValue
      niceMaxValue = maxValue
      range = niceRange
      minorTickSpacing = 1
      majorTickSpacing = 10
    }
    // Make sure values are still in range
    value = value < minValue ? minValue : value > maxValue ? maxValue : value
    minMeasuredValue =
      minMeasuredValue < minValue
        ? minValue
        : minMeasuredValue > maxValue
          ? maxValue
          : minMeasuredValue
    maxMeasuredValue =
      maxMeasuredValue < minValue
        ? minValue
        : maxMeasuredValue > maxValue
          ? maxValue
          : maxMeasuredValue
    threshold =
      threshold < minValue
        ? minValue
        : threshold > maxValue
          ? maxValue
          : threshold

    rotationOffset = 1.25 * PI
    angleRange = HALF_PI
    angleStep = angleRange / range

    angle = rotationOffset + (value - minValue) * angleStep
  }

  // **************   Buffer creation  ********************
  // Buffer for the frame
  const frameBuffer = createBuffer(size, size)
  const frameContext = frameBuffer.getContext('2d')

  // Buffer for the background
  const backgroundBuffer = createBuffer(size, size)
  const backgroundContext = backgroundBuffer.getContext('2d')

  // Buffer for led on painting code
  const ledBufferOn = createBuffer(size * 0.093457, size * 0.093457)
  const ledContextOn = ledBufferOn.getContext('2d')

  // Buffer for led off painting code
  const ledBufferOff = createBuffer(size * 0.093457, size * 0.093457)
  const ledContextOff = ledBufferOff.getContext('2d')

  // Buffer for current led painting code
  const ledBuffer = ledBufferOff

  // Buffer for the minMeasuredValue indicator
  const minMeasuredValueBuffer = createBuffer(
    Math.ceil(size * 0.028037),
    Math.ceil(size * 0.028037)
  )
  const minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d')

  // Buffer for the maxMeasuredValue indicator
  const maxMeasuredValueBuffer = createBuffer(
    Math.ceil(size * 0.028037),
    Math.ceil(size * 0.028037)
  )
  const maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d')

  // Buffer for pointer image painting code
  const pointerBuffer = createBuffer(size, size)
  const pointerContext = pointerBuffer.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  const foregroundContext = foregroundBuffer.getContext('2d')

  // **************   Image creation  ********************
  const drawPostsImage = function (ctx) {
    if (gaugeType.type === 'type5') {
      ctx.save()
      if (orientation.type === 'west') {
        // Min post
        ctx.drawImage(
          createKnobImage(
            Math.ceil(imageHeight * 0.037383),
            KnobType.STANDARD_KNOB,
            knobStyle
          ),
          imageWidth * 0.44,
          imageHeight * 0.8
        )
        // Max post
        ctx.drawImage(
          createKnobImage(
            Math.ceil(imageHeight * 0.037383),
            KnobType.STANDARD_KNOB,
            knobStyle
          ),
          imageWidth * 0.44,
          imageHeight * 0.16
        )
      } else if (orientation.type === 'east') {
        // Min post
        ctx.drawImage(
          createKnobImage(
            Math.ceil(imageHeight * 0.037383),
            KnobType.STANDARD_KNOB,
            knobStyle
          ),
          imageWidth * 0.52,
          imageHeight * 0.8
        )
        // Max post
        ctx.drawImage(
          createKnobImage(
            Math.ceil(imageHeight * 0.037383),
            KnobType.STANDARD_KNOB,
            knobStyle
          ),
          imageWidth * 0.52,
          imageHeight * 0.16
        )
      } else {
        // Min post
        ctx.drawImage(
          createKnobImage(
            Math.ceil(imageHeight * 0.037383),
            KnobType.STANDARD_KNOB,
            knobStyle
          ),
          imageWidth * 0.2 - imageHeight * 0.037383,
          imageHeight * 0.446666
        )
        // Max post
        ctx.drawImage(
          createKnobImage(
            Math.ceil(imageHeight * 0.037383),
            KnobType.STANDARD_KNOB,
            knobStyle
          ),
          imageWidth * 0.8,
          imageHeight * 0.446666
        )
      }
      ctx.restore()
    }
  }

  const createThresholdImage = function () {
    const thresholdBuffer = doc.createElement('canvas')
    thresholdBuffer.width = Math.ceil(size * 0.046728)
    thresholdBuffer.height = Math.ceil(thresholdBuffer.width * 0.9)
    const thresholdCtx = thresholdBuffer.getContext('2d')

    thresholdCtx.save()
    const gradThreshold = thresholdCtx.createLinearGradient(
      0,
      0.1,
      0,
      thresholdBuffer.height * 0.9
    )
    gradThreshold.addColorStop(0, '#520000')
    gradThreshold.addColorStop(0.3, '#fc1d00')
    gradThreshold.addColorStop(0.59, '#fc1d00')
    gradThreshold.addColorStop(1, '#520000')
    thresholdCtx.fillStyle = gradThreshold

    thresholdCtx.beginPath()
    thresholdCtx.moveTo(thresholdBuffer.width * 0.5, 0.1)
    thresholdCtx.lineTo(
      thresholdBuffer.width * 0.9,
      thresholdBuffer.height * 0.9
    )
    thresholdCtx.lineTo(
      thresholdBuffer.width * 0.1,
      thresholdBuffer.height * 0.9
    )
    thresholdCtx.lineTo(thresholdBuffer.width * 0.5, 0.1)
    thresholdCtx.closePath()

    thresholdCtx.fill()
    thresholdCtx.strokeStyle = '#FFFFFF'
    thresholdCtx.stroke()

    thresholdCtx.restore()

    return thresholdBuffer
  }

  const drawAreaSectionImage = function (ctx, start, stop, color, filled) {
    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = imageWidth * 0.035
    const startAngle =
      (angleRange / range) * start - (angleRange / range) * minValue
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

  const drawTitleImage = function (ctx) {
    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()

    ctx.font = 0.046728 * imageWidth + 'px ' + stdFontName
    const titleWidth = ctx.measureText(titleString).width
    ctx.fillText(
      titleString,
      (imageWidth - titleWidth) / 2,
      imageHeight * 0.4,
      imageWidth * 0.3
    )
    const unitWidth = ctx.measureText(unitString).width
    ctx.fillText(
      unitString,
      (imageWidth - unitWidth) / 2,
      imageHeight * 0.47,
      imageWidth * 0.2
    )

    ctx.restore()
  }

  const drawTickmarksImage = function (ctx, labelNumberFormat) {
    backgroundColor.labelColor.setAlpha(1)
    ctx.save()

    if (Orientation.WEST === orientation) {
      ctx.translate(centerX, centerX)
      ctx.rotate(-HALF_PI)
      ctx.translate(-centerX, -centerX)
    }
    if (Orientation.EAST === orientation) {
      ctx.translate(centerX, centerX)
      ctx.rotate(HALF_PI)
      ctx.translate(-centerX, -centerX)
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const fontSize = Math.ceil(imageWidth * 0.04)
    ctx.font = fontSize + 'px ' + stdFontName
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationOffset)
    const rotationStep = angleStep * minorTickSpacing
    let textRotationAngle

    let valueCounter = minValue
    let majorTickCounter = maxNoOfMinorTicks - 1

    const OUTER_POINT = imageWidth * 0.44
    const MAJOR_INNER_POINT = imageWidth * 0.41
    const MED_INNER_POINT = imageWidth * 0.415
    const MINOR_INNER_POINT = imageWidth * 0.42
    const TEXT_TRANSLATE_X = imageWidth * 0.48
    const TEXT_WIDTH = imageWidth * 0.04
    const HALF_MAX_NO_OF_MINOR_TICKS = maxNoOfMinorTicks / 2
    const MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2))
    let i

    for (
      i = minValue;
      parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED;
      i += minorTickSpacing
    ) {
      textRotationAngle = +rotationStep + HALF_PI
      majorTickCounter++
      // Draw major tickmarks
      if (majorTickCounter === maxNoOfMinorTicks) {
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(OUTER_POINT, 0)
        ctx.lineTo(MAJOR_INNER_POINT, 0)
        ctx.closePath()
        ctx.stroke()
        ctx.save()
        ctx.translate(TEXT_TRANSLATE_X, 0)
        ctx.rotate(textRotationAngle)
        switch (labelNumberFormat.format) {
          case 'fractional':
            ctx.fillText(valueCounter.toFixed(2), 0, 0, TEXT_WIDTH)
            break

          case 'scientific':
            ctx.fillText(valueCounter.toPrecision(2), 0, 0, TEXT_WIDTH)
            break

          case 'standard':
          /* falls through */
          default:
            ctx.fillText(valueCounter.toFixed(0), 0, 0, TEXT_WIDTH)
            break
        }
        ctx.translate(-TEXT_TRANSLATE_X, 0)
        ctx.restore()

        valueCounter += majorTickSpacing
        majorTickCounter = 0
        ctx.rotate(rotationStep)
        continue
      }

      // Draw tickmark every minor tickmark spacing
      if (
        maxNoOfMinorTicks % 2 === 0 &&
        majorTickCounter === HALF_MAX_NO_OF_MINOR_TICKS
      ) {
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(OUTER_POINT, 0)
        ctx.lineTo(MED_INNER_POINT, 0)
        ctx.closePath()
        ctx.stroke()
      } else {
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(OUTER_POINT, 0)
        ctx.lineTo(MINOR_INNER_POINT, 0)
        ctx.closePath()
        ctx.stroke()
      }
      ctx.rotate(rotationStep)
    }

    ctx.translate(-centerX, -centerY)
    ctx.restore()
  }

  // **************   Initialization  ********************
  // Draw all static painting code to background
  const init = function (parameters) {
    parameters = parameters || {}
    const drawFrame2 =
      undefined === parameters.frame ? false : parameters.frame
    const drawBackground2 =
      undefined === parameters.background ? false : parameters.background
    const drawLed = undefined === parameters.led ? false : parameters.led
    const drawPointer =
      undefined === parameters.pointer ? false : parameters.pointer
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground

    initialized = true

    // Calculate the current min and max values and the range
    calculate()

    // Create frame in frame buffer (backgroundBuffer)
    if (drawFrame2 && frameVisible) {
      drawFrame(
        frameContext,
        frameDesign,
        centerX,
        size / 2,
        imageWidth,
        imageHeight
      )
    }

    // Create background in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
      drawBackground(
        backgroundContext,
        backgroundColor,
        centerX,
        size / 2,
        imageWidth,
        imageHeight
      )
    }

    // Draw LED ON in ledBuffer_ON
    if (drawLed) {
      ledContextOn.drawImage(
        createLedImage(Math.ceil(size * 0.093457), 1, ledColor),
        0,
        0
      )

      // Draw LED ON in ledBuffer_OFF
      ledContextOff.drawImage(
        createLedImage(Math.ceil(size * 0.093457), 0, ledColor),
        0,
        0
      )
    }

    // Draw min measured value indicator in minMeasuredValueBuffer
    if (minMeasuredValueVisible) {
      minMeasuredValueCtx.drawImage(
        createMeasuredValueImage(
          Math.ceil(size * 0.028037),
          ColorDef.BLUE.dark.getRgbaColor(),
          true,
          true
        ),
        0,
        0
      )
      minMeasuredValueCtx.restore()
    }

    // Draw max measured value indicator in maxMeasuredValueBuffer
    if (maxMeasuredValueVisible) {
      maxMeasuredValueCtx.drawImage(
        createMeasuredValueImage(
          Math.ceil(size * 0.028037),
          ColorDef.RED.medium.getRgbaColor(),
          true
        ),
        0,
        0
      )
      maxMeasuredValueCtx.restore()
    }

    // Create alignment posts in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
      drawPostsImage(backgroundContext)

      // Create section in background buffer (backgroundBuffer)
      if (section !== null && section.length > 0) {
        backgroundContext.save()
        if (Orientation.WEST === orientation) {
          backgroundContext.translate(centerX, centerX)
          backgroundContext.rotate(-HALF_PI)
          backgroundContext.translate(-centerX, -centerX)
        } else if (Orientation.EAST === orientation) {
          backgroundContext.translate(centerX, centerX)
          backgroundContext.rotate(HALF_PI)
          backgroundContext.translate(-centerX, -centerX)
        }
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
        backgroundContext.restore()
      }

      // Create area in background buffer (backgroundBuffer)
      if (area !== null && area.length > 0) {
        if (Orientation.WEST === orientation) {
          backgroundContext.translate(centerX, centerX)
          backgroundContext.rotate(-HALF_PI)
          backgroundContext.translate(-centerX, -centerX)
        }
        if (Orientation.EAST === orientation) {
          backgroundContext.translate(centerX, centerX)
          backgroundContext.rotate(HALF_PI)
          backgroundContext.translate(-centerX, -centerX)
        }
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
        backgroundContext.restore()
      }

      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat)

      // Create title in background buffer (backgroundBuffer)
      drawTitleImage(backgroundContext)
    }

    // Draw threshold image to background context
    if (thresholdVisible) {
      backgroundContext.save()
      if (Orientation.WEST === orientation) {
        backgroundContext.translate(centerX, centerX)
        backgroundContext.rotate(-HALF_PI)
        backgroundContext.translate(-centerX, -centerX)
      }
      if (Orientation.EAST === orientation) {
        backgroundContext.translate(centerX, centerX)
        backgroundContext.rotate(HALF_PI)
        backgroundContext.translate(-centerX, -centerX)
      }
      backgroundContext.translate(centerX, centerY)
      backgroundContext.rotate(
        rotationOffset + (threshold - minValue) * angleStep + HALF_PI
      )
      backgroundContext.translate(-centerX, -centerY)
      backgroundContext.drawImage(
        createThresholdImage(),
        imageWidth * 0.475,
        imageHeight * 0.32
      )
      backgroundContext.restore()
    }

    // Create pointer image in pointer buffer (contentBuffer)
    if (drawPointer) {
      drawPointerImage(
        pointerContext,
        imageWidth * 1.17,
        pointerType,
        pointerColor,
        backgroundColor.labelColor
      )
    }

    // Create foreground in foreground buffer (foregroundBuffer)
    if (drawForeground2 && foregroundVisible) {
      const knobVisible =
        !(pointerType.type === 'type15' || pointerType.type === 'type16')
      drawForeground(
        foregroundContext,
        foregroundType,
        imageWidth,
        imageHeight,
        knobVisible,
        knobType,
        knobStyle,
        gaugeType,
        orientation
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

    mainCtx.clearRect(0, 0, size, size)
    mainCtx.save()

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0)
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0)

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY)
    }

    if (Orientation.WEST === orientation) {
      mainCtx.translate(centerX, centerX)
      mainCtx.rotate(-HALF_PI)
      mainCtx.translate(-centerX, -centerX)
    }
    if (Orientation.EAST === orientation) {
      mainCtx.translate(centerX, centerX)
      mainCtx.rotate(HALF_PI)
      mainCtx.translate(-centerX, -centerX)
    }

    // Draw min measured value indicator
    if (minMeasuredValueVisible) {
      mainCtx.save()
      mainCtx.translate(centerX, centerY)
      mainCtx.rotate(
        rotationOffset + HALF_PI + (minMeasuredValue - minValue) * angleStep
      )
      mainCtx.translate(-centerX, -centerY)
      mainCtx.drawImage(
        minMeasuredValueBuffer,
        mainCtx.canvas.width * 0.4865,
        mainCtx.canvas.height * 0.27
      )
      mainCtx.restore()
    }

    // Draw max measured value indicator
    if (maxMeasuredValueVisible) {
      mainCtx.save()
      mainCtx.translate(centerX, centerY)
      mainCtx.rotate(
        rotationOffset + HALF_PI + (maxMeasuredValue - minValue) * angleStep
      )
      mainCtx.translate(-centerX, -centerY)
      mainCtx.drawImage(
        maxMeasuredValueBuffer,
        mainCtx.canvas.width * 0.4865,
        mainCtx.canvas.height * 0.27
      )
      mainCtx.restore()
    }

    angle = rotationOffset + HALF_PI + (value - minValue) * angleStep

    // Define rotation center
    mainCtx.save()
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(angle)
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset
    mainCtx.shadowBlur = shadowOffset * 2
    // Draw pointer
    mainCtx.translate(-pointerOffset, -pointerOffset)
    mainCtx.drawImage(pointerBuffer, 0, 0)
    // Undo the translations & shadow settings
    mainCtx.restore()

    // Draw foreground
    if (foregroundVisible) {
      if (Orientation.WEST === orientation) {
        mainCtx.translate(centerX, centerX)
        mainCtx.rotate(HALF_PI)
        mainCtx.translate(-centerX, -centerX)
      } else if (Orientation.EAST === orientation) {
        mainCtx.translate(centerX, centerX)
        mainCtx.rotate(-HALF_PI)
        mainCtx.translate(-centerX, -centerX)
      }
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
    mainCtx.restore()
  }

  // Visualize the component
  repaint()

  return this
}

export default RadialVertical

export class RadialVerticalElement extends BaseElement {
  static get objectConstructor () { return RadialVertical }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 200 },
      orientation: { type: String, objectEnum: Orientation, defaultValue: 'NORTH' },
      value: { type: Number, defaultValue: 0 },
      real_value: { state: true },
      transitionTime: { type: Number, defaultValue: 500 },
      minValue: { type: Number, defaultValue: 0 },
      maxValue: { type: Number, defaultValue: 100 },
      threshold: { type: Number, defaultValue: 50 },
      noNiceScale: { type: Boolean, defaultValue: false },
      titleString: { type: String, defaultValue: '' },
      unitString: { type: String, defaultValue: '' },
      frameDesign: { type: String, objectEnum: FrameDesign, defaultValue: 'METAL' },
      noFrameVisible: { type: Boolean, defaultValue: false },
      backgroundColor: { type: String, objectEnum: BackgroundColor, defaultValue: 'DARK_GRAY' },
      noBackgroundVisible: { type: Boolean, defaultValue: false },
      pointerType: { type: String, objectEnum: PointerType, defaultValue: 'TYPE1' },
      pointerColor: { type: String, objectEnum: ColorDef, defaultValue: 'RED' },
      knobType: { type: String, objectEnum: KnobType, defaultValue: 'METAL_KNOB' },
      knobStyle: { type: String, objectEnum: KnobStyle, defaultValue: 'BLACK' },
      thresholdVisible: { type: Boolean, defaultValue: false },
      minMeasuredValueVisible: { type: Boolean, defaultValue: false },
      maxMeasuredValueVisible: { type: Boolean, defaultValue: false },
      labelNumberFormat: { type: String, objectEnum: LabelNumberFormat, defaultValue: 'STANDARD' },
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
    this.real_value = this.real_value ?? this.minValue
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

window.customElements.define('steelseries-radial-vertical', RadialVerticalElement)

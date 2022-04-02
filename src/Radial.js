
import drawPointerImage from './drawPointerImage.js'
import drawFrame from './drawFrame.js'
import drawBackground from './drawBackground.js'
import drawRadialCustomImage from './drawRadialCustomImage.js'
import drawForeground from './drawForeground.js'
import createKnobImage from './createKnobImage.js'
import createLedImage from './createLedImage.js'
import createLcdBackgroundImage from './createLcdBackgroundImage.js'
import createMeasuredValueImage from './createMeasuredValueImage.js'
import createTrendIndicator from './createTrendIndicator.js'
import drawTitleImage from './drawTitleImage.js'
import {
  calcNiceNumber,
  createBuffer,
  getCanvasContext,
  HALF_PI,
  TWO_PI,
  PI,
  RAD_FACTOR,
  doc,
  lcdFontName,
  stdFontName
} from './tools.js'

import {
  BackgroundColor,
  LcdColor,
  ColorDef,
  LedColor,
  GaugeType,
  KnobType,
  KnobStyle,
  FrameDesign,
  PointerType,
  ForegroundType,
  LabelNumberFormat,
  TickLabelOrientation,
  TrendState
} from './definitions.js'

import { drawOdometer } from './Odometer.js'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

export function drawRadial (canvas, parameters) {
  parameters = parameters || {}
  const gaugeType =
    undefined === parameters.gaugeType ? GaugeType.TYPE4 : parameters.gaugeType
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
  const lcdColor =
    undefined === parameters.lcdColor ? LcdColor.STANDARD : parameters.lcdColor
  const lcdVisible =
    undefined === parameters.lcdVisible ? true : parameters.lcdVisible
  const lcdDecimals =
    undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals
  const digitalFont =
    undefined === parameters.digitalFont ? false : parameters.digitalFont
  const fractionalScaleDecimals =
    undefined === parameters.fractionalScaleDecimals
      ? 1
      : parameters.fractionalScaleDecimals
  const ledColor =
    undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor
  const ledVisible =
    undefined === parameters.ledVisible ? false : parameters.ledVisible
  const userLedColor =
    undefined === parameters.userLedColor
      ? LedColor.GREEN_LED
      : parameters.userLedColor
  const userLedVisible =
    undefined === parameters.userLedVisible ? false : parameters.userLedVisible
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
  const customLayer =
    undefined === parameters.customLayer ? null : parameters.customLayer
  const tickLabelOrientation =
    undefined === parameters.tickLabelOrientation
      ? gaugeType === GaugeType.TYPE1
        ? TickLabelOrientation.TANGENT
        : TickLabelOrientation.NORMAL
      : parameters.tickLabelOrientation
  const trendVisible =
    undefined === parameters.trendVisible ? false : parameters.trendVisible
  const trendColors =
    undefined === parameters.trendColors
      ? [LedColor.RED_LED, LedColor.GREEN_LED, LedColor.CYAN_LED]
      : parameters.trendColors
  const useOdometer =
    undefined === parameters.useOdometer ? false : parameters.useOdometer
  const odometerParams =
    undefined === parameters.odometerParams ? {} : parameters.odometerParams

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  // Create audio tag for alarm sound
  let audioElement
  if (playAlarm && alarmSound !== false) {
    audioElement = doc.createElement('audio')
    audioElement.setAttribute('src', alarmSound)
    audioElement.setAttribute('preload', 'auto')
  }

  let value = parameters.value ?? minValue

  // Properties
  let minMeasuredValue = maxValue
  let maxMeasuredValue = minValue

  const trendIndicator = TrendState.OFF
  const trendSize = size * 0.06
  const trendPosX = size * 0.29
  const trendPosY = size * 0.36

  // GaugeType specific private variables
  let freeAreaAngle
  let rotationOffset
  let angleRange
  let angleStep

  let angle = rotationOffset + (value - minValue) * angleStep

  const imageWidth = size
  const imageHeight = size

  const centerX = imageWidth / 2
  const centerY = imageHeight / 2

  // Misc
  const ledSize = size * 0.093457
  const ledPosX = 0.6 * imageWidth
  const ledPosY = 0.4 * imageHeight
  const userLedPosX =
    gaugeType === GaugeType.TYPE3 ? 0.6 * imageWidth : centerX - ledSize / 2
  const userLedPosY =
    gaugeType === GaugeType.TYPE3 ? 0.72 * imageHeight : 0.75 * imageHeight
  const lcdFontHeight = Math.floor(imageWidth / 10)
  const stdFont = lcdFontHeight + 'px ' + stdFontName
  const lcdFont = lcdFontHeight + 'px ' + lcdFontName
  const lcdHeight = imageHeight * 0.13
  const lcdWidth = imageWidth * 0.4
  const lcdPosX = (imageWidth - lcdWidth) / 2
  const lcdPosY = imageHeight * 0.57
  let odoPosX
  const odoPosY = imageHeight * 0.61
  const shadowOffset = imageWidth * 0.006

  // Constants
  let initialized = false

  // Tickmark specific private variables
  let niceMinValue = minValue
  let niceMaxValue = maxValue
  let niceRange = maxValue - minValue
  let range = niceMaxValue - niceMinValue
  let minorTickSpacing = 0
  let majorTickSpacing = 0
  const maxNoOfMinorTicks = 10
  const maxNoOfMajorTicks = 10

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
      majorTickSpacing = calcNiceNumber(
        niceRange / (maxNoOfMajorTicks - 1),
        true
      )
      minorTickSpacing = calcNiceNumber(
        majorTickSpacing / (maxNoOfMinorTicks - 1),
        true
      )
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

    switch (gaugeType.type) {
      case 'type1':
        freeAreaAngle = 0
        rotationOffset = PI
        angleRange = HALF_PI
        angleStep = angleRange / range
        break

      case 'type2':
        freeAreaAngle = 0
        rotationOffset = PI
        angleRange = PI
        angleStep = angleRange / range
        break

      case 'type3':
        freeAreaAngle = 0
        rotationOffset = HALF_PI
        angleRange = 1.5 * PI
        angleStep = angleRange / range
        break

      case 'type4':
      /* falls through */
      default:
        freeAreaAngle = 60 * RAD_FACTOR
        rotationOffset = HALF_PI + freeAreaAngle / 2
        angleRange = TWO_PI - freeAreaAngle
        angleStep = angleRange / range
        break
    }
    angle = rotationOffset + (value - minValue) * angleStep
  }

  // **************   Buffer creation  ********************
  // Buffer for the frame
  const frameBuffer = createBuffer(size, size)
  const frameContext = frameBuffer.getContext('2d')

  // Buffer for the background
  const backgroundBuffer = createBuffer(size, size)
  const backgroundContext = backgroundBuffer.getContext('2d')

  let lcdBuffer

  // Buffer for led on painting code
  const ledBufferOn = createBuffer(ledSize, ledSize)
  const ledContextOn = ledBufferOn.getContext('2d')

  // Buffer for led off painting code
  const ledBufferOff = createBuffer(ledSize, ledSize)
  const ledContextOff = ledBufferOff.getContext('2d')

  // Buffer for current led painting code
  const ledBuffer = ledBufferOff

  // Buffer for user led on painting code
  const userLedBufferOn = createBuffer(ledSize, ledSize)
  const userLedContextOn = userLedBufferOn.getContext('2d')

  // Buffer for user led off painting code
  const userLedBufferOff = createBuffer(ledSize, ledSize)
  const userLedContextOff = userLedBufferOff.getContext('2d')

  // Buffer for current user led painting code
  const userLedBuffer = userLedBufferOff

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

  // Buffers for trend indicators
  let trendUpBuffer
  let trendSteadyBuffer
  let trendDownBuffer
  let trendOffBuffer

  // Buffer for odometer
  let odoBuffer
  let odoContext
  if (useOdometer && lcdVisible) {
    odoBuffer = createBuffer(10, 10) // size doesn't matter, it will get reset by odometer code
    odoContext = odoBuffer.getContext('2d')
  }

  // **************   Image creation  ********************
  const drawLcdText = function (ctx, value) {
    ctx.restore()
    ctx.save()
    ctx.textAlign = 'right'
    ctx.strokeStyle = lcdColor.textColor
    ctx.fillStyle = lcdColor.textColor

    if (
      lcdColor === LcdColor.STANDARD ||
      lcdColor === LcdColor.STANDARD_GREEN
    ) {
      ctx.shadowColor = 'gray'
      ctx.shadowOffsetX = imageWidth * 0.007
      ctx.shadowOffsetY = imageWidth * 0.007
      ctx.shadowBlur = imageWidth * 0.007
    }
    if (digitalFont) {
      ctx.font = lcdFont
    } else {
      ctx.font = stdFont
    }
    ctx.fillText(
      value.toFixed(lcdDecimals),
      lcdPosX + lcdWidth - lcdWidth * 0.05,
      lcdPosY + lcdHeight * 0.5 + lcdFontHeight * 0.38,
      lcdWidth * 0.9
    )

    ctx.restore()
  }

  const drawPostsImage = function (ctx) {
    ctx.save()

    if (gaugeType.type === 'type1') {
      // Draw max center top post
      ctx.drawImage(
        createKnobImage(
          Math.ceil(imageHeight * 0.037383),
          KnobType.STANDARD_KNOB,
          knobStyle
        ),
        imageWidth * 0.523364,
        imageHeight * 0.130841
      )
    }

    if (gaugeType.type === 'type1' || gaugeType.type === 'type2') {
      // Draw min left post
      ctx.drawImage(
        createKnobImage(
          Math.ceil(imageHeight * 0.037383),
          KnobType.STANDARD_KNOB,
          knobStyle
        ),
        imageWidth * 0.130841,
        imageHeight * 0.514018
      )
    }

    if (gaugeType.type === 'type2' || gaugeType.type === 'type3') {
      // Draw max right post
      ctx.drawImage(
        createKnobImage(
          Math.ceil(imageHeight * 0.037383),
          KnobType.STANDARD_KNOB,
          knobStyle
        ),
        imageWidth * 0.831775,
        imageHeight * 0.514018
      )
    }

    if (gaugeType.type === 'type3') {
      // Draw min center bottom post
      ctx.drawImage(
        createKnobImage(
          Math.ceil(imageHeight * 0.037383),
          KnobType.STANDARD_KNOB,
          knobStyle
        ),
        imageWidth * 0.523364,
        imageHeight * 0.831775
      )
    }

    if (gaugeType.type === 'type4') {
      // Min post
      ctx.drawImage(
        createKnobImage(
          Math.ceil(imageHeight * 0.037383),
          KnobType.STANDARD_KNOB,
          knobStyle
        ),
        imageWidth * 0.336448,
        imageHeight * 0.803738
      )

      // Max post
      ctx.drawImage(
        createKnobImage(
          Math.ceil(imageHeight * 0.037383),
          KnobType.STANDARD_KNOB,
          knobStyle
        ),
        imageWidth * 0.626168,
        imageHeight * 0.803738
      )
    }

    ctx.restore()
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
    if (start < minValue) {
      start = minValue
    } else if (start > maxValue) {
      start = maxValue
    }
    if (stop < minValue) {
      stop = minValue
    } else if (stop > maxValue) {
      stop = maxValue
    }
    if (start >= stop) {
      return
    }
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

  const drawTickmarksImage = function (ctx, labelNumberFormat) {
    const fontSize = Math.ceil(imageWidth * 0.04)
    let alpha = rotationOffset // Tracks total rotation
    const rotationStep = angleStep * minorTickSpacing
    let textRotationAngle
    let valueCounter = minValue
    let majorTickCounter = maxNoOfMinorTicks - 1
    const OUTER_POINT = imageWidth * 0.38
    const MAJOR_INNER_POINT = imageWidth * 0.35
    const MED_INNER_POINT = imageWidth * 0.355
    const MINOR_INNER_POINT = imageWidth * 0.36
    const TEXT_TRANSLATE_X = imageWidth * 0.3
    let TEXT_WIDTH = imageWidth * 0.1
    const HALF_MAX_NO_OF_MINOR_TICKS = maxNoOfMinorTicks / 2
    const MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2))
    let i

    backgroundColor.labelColor.setAlpha(1)
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = fontSize + 'px ' + stdFontName
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationOffset)

    if (gaugeType.type === 'type1' || gaugeType.type === 'type2') {
      TEXT_WIDTH = imageWidth * 0.04
    }

    for (
      i = minValue;
      parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED;
      i += minorTickSpacing
    ) {
      textRotationAngle = rotationStep + HALF_PI
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

        switch (tickLabelOrientation.type) {
          case 'horizontal':
            textRotationAngle = -alpha
            break

          case 'tangent':
            textRotationAngle = alpha <= HALF_PI + PI ? PI : 0
            break

          case 'normal':
          /* falls through */
          default:
            textRotationAngle = HALF_PI
            break
        }
        ctx.rotate(textRotationAngle)

        switch (labelNumberFormat.format) {
          case 'fractional':
            ctx.fillText(
              valueCounter.toFixed(fractionalScaleDecimals),
              0,
              0,
              TEXT_WIDTH
            )
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
        alpha += rotationStep
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
      alpha += rotationStep
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
    const drawUserLed =
      undefined === parameters.userLed ? false : parameters.userLed
    const drawPointer =
      undefined === parameters.pointer ? false : parameters.pointer
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground
    const drawTrend = undefined === parameters.trend ? false : parameters.trend
    const drawOdo = undefined === parameters.odo ? false : parameters.odo

    initialized = true

    // Calculate the current min and max values and the range
    calculate()

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

    // Create background in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
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
    }

    if (drawLed) {
      // Draw LED ON in ledBuffer_ON
      ledContextOn.drawImage(
        createLedImage(Math.ceil(size * 0.093457), 1, ledColor),
        0,
        0
      )

      // Draw LED OFF in ledBuffer_OFF
      ledContextOff.drawImage(
        createLedImage(Math.ceil(size * 0.093457), 0, ledColor),
        0,
        0
      )
    }

    if (drawUserLed) {
      // Draw user LED ON in userLedBuffer_ON
      userLedContextOn.drawImage(
        createLedImage(Math.ceil(size * 0.093457), 1, userLedColor),
        0,
        0
      )

      // Draw user LED OFF in userLedBuffer_OFF
      userLedContextOff.drawImage(
        createLedImage(Math.ceil(size * 0.093457), 0, userLedColor),
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
    }

    // Create alignment posts in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
      drawPostsImage(backgroundContext)

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

      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat)

      // Create title in background buffer (backgroundBuffer)
      drawTitleImage(
        backgroundContext,
        imageWidth,
        imageHeight,
        titleString,
        unitString,
        backgroundColor,
        true,
        true
      )
    }

    // Draw threshold image to background context
    if (drawBackground2 && thresholdVisible) {
      backgroundContext.save()
      backgroundContext.translate(centerX, centerY)
      backgroundContext.rotate(
        rotationOffset + (threshold - minValue) * angleStep + HALF_PI
      )
      backgroundContext.translate(-centerX, -centerY)
      backgroundContext.drawImage(
        createThresholdImage(),
        imageWidth * 0.475,
        imageHeight * 0.13
      )
      backgroundContext.translate(centerX, centerY)
      backgroundContext.restore()
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground2 && lcdVisible) {
      if (useOdometer && drawOdo) {
        drawOdometer('', {
          _context: odoContext,
          height: size * 0.075,
          decimals: odometerParams.decimals,
          digits:
            odometerParams.digits === undefined ? 5 : odometerParams.digits,
          valueForeColor: odometerParams.valueForeColor,
          valueBackColor: odometerParams.valueBackColor,
          decimalForeColor: odometerParams.decimalForeColor,
          decimalBackColor: odometerParams.decimalBackColor,
          font: odometerParams.font,
          value: value
        })
        odoPosX = (imageWidth - odoBuffer.width) / 2
      } else if (!useOdometer) {
        lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor)
        backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY)
      }
    }

    // Create pointer image in pointer buffer (contentBuffer)
    if (drawPointer) {
      drawPointerImage(
        pointerContext,
        imageWidth,
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
        gaugeType
      )
    }

    // Create the trend indicator buffers
    if (drawTrend && trendVisible) {
      trendUpBuffer = createTrendIndicator(
        trendSize,
        TrendState.UP,
        trendColors
      )
      trendSteadyBuffer = createTrendIndicator(
        trendSize,
        TrendState.STEADY,
        trendColors
      )
      trendDownBuffer = createTrendIndicator(
        trendSize,
        TrendState.DOWN,
        trendColors
      )
      trendOffBuffer = createTrendIndicator(
        trendSize,
        TrendState.OFF,
        trendColors
      )
    }
  }

  const repaint = function () {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        userLed: true,
        pointer: true,
        trend: true,
        foreground: true,
        odo: true
      })
    }
    mainCtx.clearRect(0, 0, size, size)

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0)
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0)

    // Draw lcd display
    if (lcdVisible) {
      if (useOdometer) {
        mainCtx.drawImage(odoBuffer, odoPosX, odoPosY)
      } else {
        drawLcdText(mainCtx, value)
      }
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY)
    }

    // Draw user led
    if (userLedVisible) {
      mainCtx.drawImage(userLedBuffer, userLedPosX, userLedPosY)
    }

    // Draw the trend indicator
    if (trendVisible) {
      switch (trendIndicator.state) {
        case 'up':
          mainCtx.drawImage(trendUpBuffer, trendPosX, trendPosY)
          break
        case 'steady':
          mainCtx.drawImage(trendSteadyBuffer, trendPosX, trendPosY)
          break
        case 'down':
          mainCtx.drawImage(trendDownBuffer, trendPosX, trendPosY)
          break
        case 'off':
          mainCtx.drawImage(trendOffBuffer, trendPosX, trendPosY)
          break
      }
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
        mainCtx.canvas.height * 0.105
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
        mainCtx.canvas.height * 0.105
      )
      mainCtx.restore()
    }

    angle = rotationOffset + HALF_PI + (value - minValue) * angleStep

    // Define rotation center
    mainCtx.save()
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(angle)
    mainCtx.translate(-centerX, -centerY)
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset
    mainCtx.shadowBlur = shadowOffset * 2
    // Draw the pointer
    mainCtx.drawImage(pointerBuffer, 0, 0)
    // Undo the translations & shadow settings
    mainCtx.restore()

    // Draw foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  repaint()
}

export class RadialElement extends BaseElement {
  static get drawFunction () { return drawRadial }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 200 },
      value: { type: Number, defaultValue: 0 },
      real_value: { state: true },
      transitionTime: { type: Number, defaultValue: 500 },
      minValue: { type: Number, defaultValue: 0 },
      maxValue: { type: Number, defaultValue: 100 },
      threshold: { type: Number, defaultValue: 50 },
      gaugeType: { type: String, objectEnum: GaugeType, defaultValue: 'TYPE1' },
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
      lcdColor: { type: String, objectEnum: LcdColor, defaultValue: 'STANDARD' },
      noLcdVisible: { type: Boolean, defaultValue: false },
      lcdDecimals: { type: Number, defaultValue: 2 },
      digitalFont: { type: Boolean, defaultValue: false },
      fractionalScaleDecimals: { type: Number, defaultValue: 1 },
      thresholdVisible: { type: Boolean, defaultValue: false },
      minMeasuredValueVisible: { type: Boolean, defaultValue: false },
      maxMeasuredValueVisible: { type: Boolean, defaultValue: false },
      labelNumberFormat: { type: String, objectEnum: LabelNumberFormat, defaultValue: 'STANDARD' },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false },
      tickLabelOrientation: { type: String, objectEnum: TickLabelOrientation, defaultValue: 'TANGENT' },
      trendVisible: { type: Boolean, defaultValue: false },
      useOdometer: { type: Boolean, defaultValue: false }
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

window.customElements.define('steelseries-radial', RadialElement)

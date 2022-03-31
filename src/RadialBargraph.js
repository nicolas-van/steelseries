
import drawFrame from './drawFrame'
import drawBackground from './drawBackground'
import drawRadialCustomImage from './drawRadialCustomImage'
import drawForeground from './drawForeground'
import createLedImage from './createLedImage'
import createLcdBackgroundImage from './createLcdBackgroundImage'
import createTrendIndicator from './createTrendIndicator'
import drawTitleImage from './drawTitleImage'
import {
  calcNiceNumber,
  createBuffer,
  customColorDef,
  getCanvasContext,
  HALF_PI,
  TWO_PI,
  PI,
  RAD_FACTOR,
  DEG_FACTOR,
  doc,
  lcdFontName,
  stdFontName
} from './tools'

import {
  BackgroundColor,
  LcdColor,
  ColorDef,
  LedColor,
  GaugeType,
  FrameDesign,
  ForegroundType,
  LabelNumberFormat,
  TickLabelOrientation,
  TrendState
} from './definitions'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

const RadialBargraph = function (canvas, parameters) {
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
  const useSectionColors =
    undefined === parameters.useSectionColors
      ? false
      : parameters.useSectionColors
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
  const valueColor =
    undefined === parameters.valueColor ? ColorDef.RED : parameters.valueColor
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
  const customLayer =
    undefined === parameters.customLayer ? null : parameters.customLayer
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
  const labelNumberFormat =
    undefined === parameters.labelNumberFormat
      ? LabelNumberFormat.STANDARD
      : parameters.labelNumberFormat
  const foregroundType =
    undefined === parameters.foregroundType
      ? ForegroundType.TYPE1
      : parameters.foregroundType
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const playAlarm =
    undefined === parameters.playAlarm ? false : parameters.playAlarm
  const alarmSound =
    undefined === parameters.alarmSound ? false : parameters.alarmSound
  const valueGradient =
    undefined === parameters.valueGradient ? null : parameters.valueGradient
  const useValueGradient =
    undefined === parameters.useValueGradient
      ? false
      : parameters.useValueGradient
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

  let value = parameters.value ?? minValue
  let minMeasuredValue = minValue
  let maxMeasuredValue = maxValue
  let range = maxValue - minValue

  // GaugeType specific private variables
  let freeAreaAngle
  let rotationOffset
  let bargraphOffset
  let angleRange
  let degAngleRange
  let angleStep

  let sectionAngles = []
  let isSectionsVisible = false
  let isGradientVisible = false

  const imageWidth = size
  const imageHeight = size

  const centerX = imageWidth / 2
  const centerY = imageHeight / 2

  // Misc
  const lcdFontHeight = Math.floor(imageWidth / 10)
  const stdFont = lcdFontHeight + 'px ' + stdFontName
  const lcdFont = lcdFontHeight + 'px ' + lcdFontName
  const lcdHeight = imageHeight * 0.13
  const lcdWidth = imageWidth * 0.4
  const lcdPosX = (imageWidth - lcdWidth) / 2
  const lcdPosY = imageHeight / 2 - lcdHeight / 2

  // Constants
  const ACTIVE_LED_POS_X = imageWidth * 0.116822
  const ACTIVE_LED_POS_Y = imageWidth * 0.485981
  const LED_SIZE = Math.ceil(size * 0.093457)
  // let LED_POS_X = imageWidth * 0.453271;
  const LED_POS_X = imageWidth * 0.53
  const LED_POS_Y = imageHeight * 0.61
  const USER_LED_POS_X =
    gaugeType === GaugeType.TYPE3 ? 0.7 * imageWidth : centerX - LED_SIZE / 2
  const USER_LED_POS_Y =
    gaugeType === GaugeType.TYPE3 ? 0.61 * imageHeight : 0.75 * imageHeight

  const trendIndicator = TrendState.OFF
  const trendSize = size * 0.06
  const trendPosX = size * 0.38
  const trendPosY = size * 0.57

  switch (gaugeType.type) {
    case 'type1':
      freeAreaAngle = 0
      rotationOffset = PI
      bargraphOffset = 0
      angleRange = HALF_PI
      degAngleRange = angleRange * DEG_FACTOR
      angleStep = angleRange / range
      break

    case 'type2':
      freeAreaAngle = 0
      rotationOffset = PI
      bargraphOffset = 0
      angleRange = PI
      degAngleRange = angleRange * DEG_FACTOR
      angleStep = angleRange / range
      break

    case 'type3':
      freeAreaAngle = 0
      rotationOffset = HALF_PI
      bargraphOffset = -HALF_PI
      angleRange = 1.5 * PI
      degAngleRange = angleRange * DEG_FACTOR
      angleStep = angleRange / range
      break

    case 'type4':
    /* falls through */
    default:
      freeAreaAngle = 60 * RAD_FACTOR
      rotationOffset = HALF_PI + freeAreaAngle / 2
      bargraphOffset = -TWO_PI / 6
      angleRange = TWO_PI - freeAreaAngle
      degAngleRange = angleRange * DEG_FACTOR
      angleStep = angleRange / range
      break
  }

  // Buffer for the frame
  const frameBuffer = createBuffer(size, size)
  const frameContext = frameBuffer.getContext('2d')

  // Buffer for static background painting code
  const backgroundBuffer = createBuffer(size, size)
  const backgroundContext = backgroundBuffer.getContext('2d')

  let lcdBuffer

  // Buffer for active bargraph led
  const activeLedBuffer = createBuffer(
    Math.ceil(size * 0.060747),
    Math.ceil(size * 0.023364)
  )
  const activeLedContext = activeLedBuffer.getContext('2d')

  // Buffer for led on painting code
  const ledBufferOn = createBuffer(LED_SIZE, LED_SIZE)
  const ledContextOn = ledBufferOn.getContext('2d')

  // Buffer for led off painting code
  const ledBufferOff = createBuffer(LED_SIZE, LED_SIZE)
  const ledContextOff = ledBufferOff.getContext('2d')

  // Buffer for current led painting code
  const ledBuffer = ledBufferOff

  // Buffer for user led on painting code
  const userLedBufferOn = createBuffer(LED_SIZE, LED_SIZE)
  const userLedContextOn = userLedBufferOn.getContext('2d')

  // Buffer for user led off painting code
  const userLedBufferOff = createBuffer(LED_SIZE, LED_SIZE)
  const userLedContextOff = userLedBufferOff.getContext('2d')

  // Buffer for current user led painting code
  const userLedBuffer = userLedBufferOff

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  const foregroundContext = foregroundBuffer.getContext('2d')

  // Buffers for trend indicators
  let trendUpBuffer
  let trendSteadyBuffer
  let trendDownBuffer
  let trendOffBuffer

  let initialized = false

  // Tickmark specific private variables
  let niceMinValue = minValue
  let niceMaxValue = maxValue
  let niceRange = maxValue - minValue
  range = niceMaxValue - niceMinValue
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
      // minorTickSpacing = 1;
      // majorTickSpacing = 10;
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

      case 'type4': // fall through
      /* falls through */
      default:
        freeAreaAngle = 60 * RAD_FACTOR
        rotationOffset = HALF_PI + freeAreaAngle / 2
        angleRange = TWO_PI - freeAreaAngle
        angleStep = angleRange / range
        break
    }
  }

  //* ******************************** Private methods *********************************
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
    const drawValue = undefined === parameters.value ? false : parameters.value
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground
    const drawTrend = undefined === parameters.trend ? false : parameters.trend

    initialized = true

    calculate()

    // Create frame in frame buffer (frameBuffer)
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
      ledContextOn.drawImage(createLedImage(LED_SIZE, 1, ledColor), 0, 0)

      // Draw LED OFF in ledBuffer_OFF
      ledContextOff.drawImage(createLedImage(LED_SIZE, 0, ledColor), 0, 0)
    }

    if (drawUserLed) {
      // Draw user LED ON in userLedBuffer_ON
      userLedContextOn.drawImage(
        createLedImage(Math.ceil(LED_SIZE), 1, userLedColor),
        0,
        0
      )

      // Draw user LED OFF in userLedBuffer_OFF
      userLedContextOff.drawImage(
        createLedImage(Math.ceil(LED_SIZE), 0, userLedColor),
        0,
        0
      )
    }

    if (drawBackground2) {
      // Create bargraphtrack in background buffer (backgroundBuffer)
      drawBargraphTrackImage(backgroundContext)
    }

    // Create tickmarks in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
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

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground2 && lcdVisible) {
      lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor)
      backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY)
    }

    // Convert Section values into angles
    isSectionsVisible = false
    if (useSectionColors && section !== null && section.length > 0) {
      isSectionsVisible = true
      let sectionIndex = section.length
      sectionAngles = []
      do {
        sectionIndex--
        sectionAngles.push({
          start:
            ((section[sectionIndex].start + Math.abs(minValue)) /
              (maxValue - minValue)) *
            degAngleRange,
          stop:
            ((section[sectionIndex].stop + Math.abs(minValue)) /
              (maxValue - minValue)) *
            degAngleRange,
          color: customColorDef(section[sectionIndex].color)
        })
      } while (sectionIndex > 0)
    }

    // Use a gradient for the valueColor?
    isGradientVisible = false
    if (useValueGradient && valueGradient !== null) {
      // force section colors off!
      isSectionsVisible = false
      isGradientVisible = true
    }

    // Create an image of an active led in active led buffer (activeLedBuffer)
    if (drawValue) {
      drawActiveLed(activeLedContext, valueColor)
    }

    // Create foreground in foreground buffer (foregroundBuffer)
    if (drawForeground2 && foregroundVisible) {
      drawForeground(
        foregroundContext,
        foregroundType,
        imageWidth,
        imageHeight,
        false
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

  const drawBargraphTrackImage = function (ctx) {
    ctx.save()

    // Bargraphtrack

    // Frame
    ctx.save()
    ctx.lineWidth = size * 0.085
    ctx.beginPath()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationOffset - 4 * RAD_FACTOR)
    ctx.translate(-centerX, -centerY)
    ctx.arc(
      centerX,
      centerY,
      imageWidth * 0.35514,
      0,
      angleRange + 8 * RAD_FACTOR,
      false
    )
    ctx.rotate(-rotationOffset)
    const ledTrackFrameGradient = ctx.createLinearGradient(
      0,
      0.107476 * imageHeight,
      0,
      0.897195 * imageHeight
    )
    ledTrackFrameGradient.addColorStop(0, '#000000')
    ledTrackFrameGradient.addColorStop(0.22, '#333333')
    ledTrackFrameGradient.addColorStop(0.76, '#333333')
    ledTrackFrameGradient.addColorStop(1, '#cccccc')
    ctx.strokeStyle = ledTrackFrameGradient
    ctx.stroke()
    ctx.restore()

    // Main
    ctx.save()
    ctx.lineWidth = size * 0.075
    ctx.beginPath()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationOffset - 4 * RAD_FACTOR)
    ctx.translate(-centerX, -centerY)
    ctx.arc(
      centerX,
      centerY,
      imageWidth * 0.35514,
      0,
      angleRange + 8 * RAD_FACTOR,
      false
    )
    ctx.rotate(-rotationOffset)
    const ledTrackMainGradient = ctx.createLinearGradient(
      0,
      0.112149 * imageHeight,
      0,
      0.892523 * imageHeight
    )
    ledTrackMainGradient.addColorStop(0, '#111111')
    ledTrackMainGradient.addColorStop(1, '#333333')
    ctx.strokeStyle = ledTrackMainGradient
    ctx.stroke()
    ctx.restore()

    // Draw inactive leds
    const ledCenterX = (imageWidth * 0.116822 + imageWidth * 0.060747) / 2
    const ledCenterY = (imageWidth * 0.485981 + imageWidth * 0.023364) / 2
    const ledOffGradient = ctx.createRadialGradient(
      ledCenterX,
      ledCenterY,
      0,
      ledCenterX,
      ledCenterY,
      0.030373 * imageWidth
    )
    ledOffGradient.addColorStop(0, '#3c3c3c')
    ledOffGradient.addColorStop(1, '#323232')
    let angle = 0
    for (angle = 0; angle <= degAngleRange; angle += 5) {
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle * RAD_FACTOR + bargraphOffset)
      ctx.translate(-centerX, -centerY)
      ctx.beginPath()
      ctx.rect(
        imageWidth * 0.116822,
        imageWidth * 0.485981,
        imageWidth * 0.060747,
        imageWidth * 0.023364
      )
      ctx.closePath()
      ctx.fillStyle = ledOffGradient
      ctx.fill()
      ctx.restore()
    }

    ctx.restore()
  }

  const drawActiveLed = function (ctx, color) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.closePath()
    const ledCenterX = ctx.canvas.width / 2
    const ledCenterY = ctx.canvas.height / 2
    const ledGradient = mainCtx.createRadialGradient(
      ledCenterX,
      ledCenterY,
      0,
      ledCenterX,
      ledCenterY,
      ctx.canvas.width / 2
    )
    ledGradient.addColorStop(0, color.light.getRgbaColor())
    ledGradient.addColorStop(1, color.dark.getRgbaColor())
    ctx.fillStyle = ledGradient
    ctx.fill()
    ctx.restore()
  }

  const drawLcdText = function (ctx, value) {
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

  const drawTickmarksImage = function (ctx, labelNumberFormat) {
    let alpha = rotationOffset // Tracks total rotation
    const rotationStep = angleStep * minorTickSpacing
    let textRotationAngle
    const fontSize = Math.ceil(imageWidth * 0.04)
    let valueCounter = minValue
    let majorTickCounter = maxNoOfMinorTicks - 1
    const TEXT_TRANSLATE_X = imageWidth * 0.28
    let TEXT_WIDTH = imageWidth * 0.1
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
      TEXT_WIDTH = imageWidth * 0.0375
    }

    for (
      i = minValue;
      parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED;
      i += minorTickSpacing
    ) {
      textRotationAngle = +rotationStep + HALF_PI
      majorTickCounter++
      // Draw major tickmarks
      if (majorTickCounter === maxNoOfMinorTicks) {
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
      ctx.rotate(rotationStep)
      alpha += rotationStep
    }

    ctx.translate(-centerX, -centerY)
    ctx.restore()
  }

  const repaint = function () {
    const activeLedAngle =
      ((value - minValue) / (maxValue - minValue)) * degAngleRange
    let activeLedColor
    let lastActiveLedColor = valueColor
    let angle
    let i
    let currentValue
    let gradRange
    let fraction

    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        userLed: true,
        value: true,
        trend: true,
        foreground: true
      })
    }

    mainCtx.clearRect(0, 0, size, size)

    // Draw frame image
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0)
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0)

    // Draw active leds
    for (angle = 0; angle <= activeLedAngle; angle += 5) {
      // check for LED color
      activeLedColor = valueColor
      // Use a gradient for value colors?
      if (isGradientVisible) {
        // Convert angle back to value
        currentValue =
          minValue + (angle / degAngleRange) * (maxValue - minValue)
        gradRange = valueGradient.getEnd() - valueGradient.getStart()
        fraction = (currentValue - minValue) / gradRange
        fraction = Math.max(Math.min(fraction, 1), 0)
        activeLedColor = customColorDef(
          valueGradient.getColorAt(fraction).getRgbaColor()
        )
      } else if (isSectionsVisible) {
        for (i = 0; i < sectionAngles.length; i++) {
          if (
            angle >= sectionAngles[i].start &&
            angle < sectionAngles[i].stop
          ) {
            activeLedColor = sectionAngles[i].color
            break
          }
        }
      }
      // Has LED color changed? If so redraw the buffer
      if (
        lastActiveLedColor.medium.getHexColor() !==
        activeLedColor.medium.getHexColor()
      ) {
        drawActiveLed(activeLedContext, activeLedColor)
        lastActiveLedColor = activeLedColor
      }
      mainCtx.save()
      mainCtx.translate(centerX, centerY)
      mainCtx.rotate(angle * RAD_FACTOR + bargraphOffset)
      mainCtx.translate(-centerX, -centerY)
      mainCtx.drawImage(activeLedBuffer, ACTIVE_LED_POS_X, ACTIVE_LED_POS_Y)
      mainCtx.restore()
    }

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(mainCtx, value)
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, LED_POS_X, LED_POS_Y)
    }

    // Draw user led
    if (userLedVisible) {
      mainCtx.drawImage(userLedBuffer, USER_LED_POS_X, USER_LED_POS_Y)
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

    // Draw foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  repaint()

  return this
}

export default RadialBargraph

export class RadialBargraphElement extends BaseElement {
  static get objectConstructor () { return RadialBargraph }

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
      valueColor: { type: String, objectEnum: ColorDef, defaultValue: 'RED' },
      lcdColor: { type: String, objectEnum: LcdColor, defaultValue: 'STANDARD' },
      noLcdVisible: { type: Boolean, defaultValue: false },
      lcdDecimals: { type: Number, defaultValue: 2 },
      digitalFont: { type: Boolean, defaultValue: false },
      fractionalScaleDecimals: { type: Number, defaultValue: 1 },
      labelNumberFormat: { type: String, objectEnum: LabelNumberFormat, defaultValue: 'STANDARD' },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false },
      tickLabelOrientation: { type: String, objectEnum: TickLabelOrientation, defaultValue: 'TANGENT' },
      trendVisible: { type: Boolean, defaultValue: false }
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

window.customElements.define('steelseries-radial-bargraph', RadialBargraphElement)

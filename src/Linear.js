
import drawLinearBackgroundImage from './drawLinearBackgroundImage'
import drawLinearForegroundImage from './drawLinearForegroundImage'
import drawLinearFrameImage from './drawLinearFrameImage'
import createLedImage from './createLedImage'
import createLcdBackgroundImage from './createLcdBackgroundImage'
import createMeasuredValueImage from './createMeasuredValueImage'
import drawTitleImage from './drawTitleImage'
import {
  calcNiceNumber,
  createBuffer,
  getCanvasContext,
  HALF_PI,
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
  LabelNumberFormat
} from './definitions'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

const Linear = function (canvas, parameters) {
  parameters = parameters || {}
  let gaugeType =
    undefined === parameters.gaugeType ? GaugeType.TYPE1 : parameters.gaugeType
  let width = undefined === parameters.width ? 0 : parameters.width
  let height = undefined === parameters.height ? 0 : parameters.height
  let minValue = undefined === parameters.minValue ? 0 : parameters.minValue
  let maxValue =
    undefined === parameters.maxValue ? minValue + 100 : parameters.maxValue
  const niceScale =
    undefined === parameters.niceScale ? true : parameters.niceScale
  let threshold =
    undefined === parameters.threshold
      ? (maxValue - minValue) / 2 + minValue
      : parameters.threshold
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
  const labelNumberFormat =
    undefined === parameters.labelNumberFormat
      ? LabelNumberFormat.STANDARD
      : parameters.labelNumberFormat
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const playAlarm =
    undefined === parameters.playAlarm ? false : parameters.playAlarm
  const alarmSound =
    undefined === parameters.alarmSound ? false : parameters.alarmSound

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)
  // Has a size been specified?
  if (width === 0) {
    width = mainCtx.canvas.width
  }
  if (height === 0) {
    height = mainCtx.canvas.height
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = width
  mainCtx.canvas.height = height

  const imageWidth = width
  const imageHeight = height
  let audioElement

  // Create audio tag for alarm sound
  if (playAlarm && alarmSound !== false) {
    audioElement = doc.createElement('audio')
    audioElement.setAttribute('src', alarmSound)
    // audioElement.setAttribute('src', 'js/alarm.mp3');
    audioElement.setAttribute('preload', 'auto')
  }

  let value = parameters.value ?? minValue

  // Properties
  let minMeasuredValue = maxValue
  let maxMeasuredValue = minValue

  // Check gaugeType is 1 or 2
  if (gaugeType.type !== 'type1' && gaugeType.type !== 'type2') {
    gaugeType = GaugeType.TYPE1
  }

  const vertical = width <= height

  // Constants
  let ledPosX
  let ledPosY
  const ledSize = Math.round((vertical ? height : width) * 0.05)
  const minMaxIndSize = Math.round((vertical ? width : height) * 0.05)
  let stdFont
  let lcdFont

  // Misc
  if (vertical) {
    ledPosX = imageWidth / 2 - ledSize / 2
    ledPosY = (gaugeType.type === 'type1' ? 0.053 : 0.038) * imageHeight
    stdFont = Math.floor(imageHeight / 22) + 'px ' + stdFontName
    lcdFont = Math.floor(imageHeight / 22) + 'px ' + lcdFontName
  } else {
    ledPosX = 0.89 * imageWidth
    ledPosY = imageHeight / 2 - ledSize / 2
    stdFont = Math.floor(imageHeight / 10) + 'px ' + stdFontName
    lcdFont = Math.floor(imageHeight / 10) + 'px ' + lcdFontName
  }

  let initialized = false

  // Tickmark specific private variables
  let niceMinValue = minValue
  let niceMaxValue = maxValue
  let niceRange = maxValue - minValue
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
    } else {
      niceRange = maxValue - minValue
      niceMinValue = minValue
      niceMaxValue = maxValue
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
  }

  // **************   Buffer creation  ********************
  // Buffer for the frame
  const frameBuffer = createBuffer(width, height)
  const frameContext = frameBuffer.getContext('2d')

  // Buffer for the background
  const backgroundBuffer = createBuffer(width, height)
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

  // Buffer for the minMeasuredValue indicator
  const minMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize)
  const minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d')

  // Buffer for the maxMeasuredValue indicator
  const maxMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize)
  const maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(width, height)
  const foregroundContext = foregroundBuffer.getContext('2d')

  // **************   Image creation  ********************
  const drawLcdText = function (ctx, value, vertical) {
    ctx.save()
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = lcdColor.textColor
    ctx.fillStyle = lcdColor.textColor

    if (
      lcdColor === LcdColor.STANDARD ||
      lcdColor === LcdColor.STANDARD_GREEN
    ) {
      ctx.shadowColor = 'gray'
      if (vertical) {
        ctx.shadowOffsetX = imageHeight * 0.003
        ctx.shadowOffsetY = imageHeight * 0.003
        ctx.shadowBlur = imageHeight * 0.004
      } else {
        ctx.shadowOffsetX = imageHeight * 0.007
        ctx.shadowOffsetY = imageHeight * 0.007
        ctx.shadowBlur = imageHeight * 0.009
      }
    }

    let lcdTextX
    let lcdTextY
    let lcdTextWidth

    if (digitalFont) {
      ctx.font = lcdFont
    } else {
      ctx.font = stdFont
    }

    if (vertical) {
      lcdTextX =
        (imageWidth - imageWidth * 0.571428) / 2 + imageWidth * 0.571428 - 2
      lcdTextY = imageHeight * 0.88 + 1 + (imageHeight * 0.055 - 2) / 2
      lcdTextWidth = imageWidth * 0.7 - 2
    } else {
      lcdTextX = imageWidth * 0.695 + imageWidth * 0.18 - 2
      lcdTextY = imageHeight * 0.22 + 1 + (imageHeight * 0.15 - 2) / 2
      lcdTextWidth = imageHeight * 0.22 - 2
    }

    ctx.fillText(value.toFixed(lcdDecimals), lcdTextX, lcdTextY, lcdTextWidth)

    ctx.restore()
  }

  const createThresholdImage = function (vertical) {
    const thresholdBuffer = doc.createElement('canvas')
    const thresholdCtx = thresholdBuffer.getContext('2d')
    thresholdBuffer.height = thresholdBuffer.width = minMaxIndSize

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

    if (vertical) {
      thresholdCtx.beginPath()
      thresholdCtx.moveTo(0.1, thresholdBuffer.height * 0.5)
      thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1)
      thresholdCtx.lineTo(
        thresholdBuffer.width * 0.9,
        thresholdBuffer.height * 0.9
      )
      thresholdCtx.closePath()
    } else {
      thresholdCtx.beginPath()
      thresholdCtx.moveTo(0.1, 0.1)
      thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1)
      thresholdCtx.lineTo(
        thresholdBuffer.width * 0.5,
        thresholdBuffer.height * 0.9
      )
      thresholdCtx.closePath()
    }

    thresholdCtx.fill()
    thresholdCtx.strokeStyle = '#FFFFFF'
    thresholdCtx.stroke()

    thresholdCtx.restore()

    return thresholdBuffer
  }

  const drawTickmarksImage = function (ctx, labelNumberFormat, vertical) {
    backgroundColor.labelColor.setAlpha(1)
    ctx.save()
    ctx.textBaseline = 'middle'
    const TEXT_WIDTH = imageWidth * 0.1
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()

    let valueCounter = minValue
    let majorTickCounter = maxNoOfMinorTicks - 1
    let tickCounter
    let currentPos
    let scaleBoundsX
    let scaleBoundsY
    let scaleBoundsW
    let scaleBoundsH
    let tickSpaceScaling = 1

    let minorTickStart
    let minorTickStop
    let mediumTickStart
    let mediumTickStop
    let majorTickStart
    let majorTickStop
    if (vertical) {
      minorTickStart = 0.34 * imageWidth
      minorTickStop = 0.36 * imageWidth
      mediumTickStart = 0.33 * imageWidth
      mediumTickStop = 0.36 * imageWidth
      majorTickStart = 0.32 * imageWidth
      majorTickStop = 0.36 * imageWidth
      ctx.textAlign = 'right'
      scaleBoundsX = 0
      scaleBoundsY = imageHeight * 0.12864
      scaleBoundsW = 0
      if (gaugeType.type === 'type1') {
        scaleBoundsH = imageHeight * 0.856796 - imageHeight * 0.12864
      } else {
        scaleBoundsH = imageHeight * 0.7475 - imageHeight * 0.12864
      }
      tickSpaceScaling = scaleBoundsH / (maxValue - minValue)
    } else {
      minorTickStart = 0.65 * imageHeight
      minorTickStop = 0.63 * imageHeight
      mediumTickStart = 0.66 * imageHeight
      mediumTickStop = 0.63 * imageHeight
      majorTickStart = 0.67 * imageHeight
      majorTickStop = 0.63 * imageHeight
      ctx.textAlign = 'center'
      scaleBoundsY = 0
      if (gaugeType.type === 'type1') {
        scaleBoundsX = imageWidth * 0.142857
        scaleBoundsW = imageWidth * 0.871012 - scaleBoundsX
      } else {
        scaleBoundsX = imageWidth * 0.19857
        scaleBoundsW = imageWidth * 0.82 - scaleBoundsX
      }
      scaleBoundsH = 0
      tickSpaceScaling = scaleBoundsW / (maxValue - minValue)
    }

    let labelCounter
    for (
      labelCounter = minValue, tickCounter = 0;
      labelCounter <= maxValue;
      labelCounter += minorTickSpacing, tickCounter += minorTickSpacing
    ) {
      // Calculate the bounds of the scaling
      if (vertical) {
        currentPos =
          scaleBoundsY + scaleBoundsH - tickCounter * tickSpaceScaling
      } else {
        currentPos = scaleBoundsX + tickCounter * tickSpaceScaling
      }

      majorTickCounter++

      // Draw tickmark every major tickmark spacing
      if (majorTickCounter === maxNoOfMinorTicks) {
        // Draw the major tickmarks
        ctx.lineWidth = 1.5
        drawLinearTicks(
          ctx,
          majorTickStart,
          majorTickStop,
          currentPos,
          vertical
        )

        // Draw the standard tickmark labels
        if (vertical) {
          // Vertical orientation
          switch (labelNumberFormat.format) {
            case 'fractional':
              ctx.fillText(
                valueCounter.toFixed(2),
                imageWidth * 0.28,
                currentPos,
                TEXT_WIDTH
              )
              break

            case 'scientific':
              ctx.fillText(
                valueCounter.toPrecision(2),
                imageWidth * 0.28,
                currentPos,
                TEXT_WIDTH
              )
              break

            case 'standard':
            /* falls through */
            default:
              ctx.fillText(
                valueCounter.toFixed(0),
                imageWidth * 0.28,
                currentPos,
                TEXT_WIDTH
              )
              break
          }
        } else {
          // Horizontal orientation
          switch (labelNumberFormat.format) {
            case 'fractional':
              ctx.fillText(
                valueCounter.toFixed(2),
                currentPos,
                imageHeight * 0.73,
                TEXT_WIDTH
              )
              break

            case 'scientific':
              ctx.fillText(
                valueCounter.toPrecision(2),
                currentPos,
                imageHeight * 0.73,
                TEXT_WIDTH
              )
              break

            case 'standard':
            /* falls through */
            default:
              ctx.fillText(
                valueCounter.toFixed(0),
                currentPos,
                imageHeight * 0.73,
                TEXT_WIDTH
              )
              break
          }
        }

        valueCounter += majorTickSpacing
        majorTickCounter = 0
        continue
      }

      // Draw tickmark every minor tickmark spacing
      if (
        maxNoOfMinorTicks % 2 === 0 &&
        majorTickCounter === maxNoOfMinorTicks / 2
      ) {
        ctx.lineWidth = 1
        drawLinearTicks(
          ctx,
          mediumTickStart,
          mediumTickStop,
          currentPos,
          vertical
        )
      } else {
        ctx.lineWidth = 0.5
        drawLinearTicks(
          ctx,
          minorTickStart,
          minorTickStop,
          currentPos,
          vertical
        )
      }
    }

    ctx.restore()
  }

  const drawLinearTicks = function (
    ctx,
    tickStart,
    tickStop,
    currentPos,
    vertical
  ) {
    if (vertical) {
      // Vertical orientation
      ctx.beginPath()
      ctx.moveTo(tickStart, currentPos)
      ctx.lineTo(tickStop, currentPos)
      ctx.closePath()
      ctx.stroke()
    } else {
      // Horizontal orientation
      ctx.beginPath()
      ctx.moveTo(currentPos, tickStart)
      ctx.lineTo(currentPos, tickStop)
      ctx.closePath()
      ctx.stroke()
    }
  }

  // **************   Initialization  ********************
  const init = function (parameters) {
    parameters = parameters || {}
    const drawFrame2 =
      undefined === parameters.frame ? false : parameters.frame
    const drawBackground2 =
      undefined === parameters.background ? false : parameters.background
    const drawLed = undefined === parameters.led ? false : parameters.led
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground

    let yOffset
    let yRange
    let valuePos

    initialized = true

    // Calculate the current min and max values and the range
    calculate()

    // Create frame in frame buffer (backgroundBuffer)
    if (drawFrame2 && frameVisible) {
      drawLinearFrameImage(
        frameContext,
        frameDesign,
        imageWidth,
        imageHeight,
        vertical
      )
    }

    // Create background in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
      drawLinearBackgroundImage(
        backgroundContext,
        backgroundColor,
        imageWidth,
        imageHeight,
        vertical
      )
    }

    // draw Thermometer outline
    if (drawBackground2 && gaugeType.type === 'type2') {
      drawBackgroundImage(backgroundContext)
    }

    if (drawLed) {
      if (vertical) {
        // Draw LED ON in ledBuffer_ON
        ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0)

        // Draw LED ON in ledBuffer_OFF
        ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0)
      } else {
        // Draw LED ON in ledBuffer_ON
        ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0)

        // Draw LED ON in ledBuffer_OFF
        ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0)
      }
    }

    // Draw min measured value indicator in minMeasuredValueBuffer
    if (minMeasuredValueVisible) {
      if (vertical) {
        minMeasuredValueCtx.drawImage(
          createMeasuredValueImage(
            minMaxIndSize,
            ColorDef.BLUE.dark.getRgbaColor(),
            false,
            vertical
          ),
          0,
          0
        )
      } else {
        minMeasuredValueCtx.drawImage(
          createMeasuredValueImage(
            minMaxIndSize,
            ColorDef.BLUE.dark.getRgbaColor(),
            false,
            vertical
          ),
          0,
          0
        )
      }
    }

    // Draw max measured value indicator in maxMeasuredValueBuffer
    if (maxMeasuredValueVisible) {
      if (vertical) {
        maxMeasuredValueCtx.drawImage(
          createMeasuredValueImage(
            minMaxIndSize,
            ColorDef.RED.medium.getRgbaColor(),
            false,
            vertical
          ),
          0,
          0
        )
      } else {
        maxMeasuredValueCtx.drawImage(
          createMeasuredValueImage(
            minMaxIndSize,
            ColorDef.RED.medium.getRgbaColor(),
            false,
            vertical
          ),
          0,
          0
        )
      }
    }

    // Create alignment posts in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat, vertical)

      // Create title in background buffer (backgroundBuffer)
      if (vertical) {
        drawTitleImage(
          backgroundContext,
          imageWidth,
          imageHeight,
          titleString,
          unitString,
          backgroundColor,
          vertical,
          null,
          lcdVisible,
          gaugeType
        )
      } else {
        drawTitleImage(
          backgroundContext,
          imageWidth,
          imageHeight,
          titleString,
          unitString,
          backgroundColor,
          vertical,
          null,
          lcdVisible,
          gaugeType
        )
      }
    }

    // Draw threshold image to background context
    if (drawBackground2 && thresholdVisible) {
      backgroundContext.save()
      if (vertical) {
        // Vertical orientation
        yOffset = gaugeType.type === 'type1' ? 0.856796 : 0.7475
        yRange = yOffset - 0.12864
        valuePos =
          imageHeight * yOffset -
          (imageHeight * yRange * (threshold - minValue)) /
            (maxValue - minValue)
        backgroundContext.translate(
          imageWidth * 0.365,
          valuePos - minMaxIndSize / 2
        )
      } else {
        // Horizontal orientation
        yOffset = gaugeType.type === 'type1' ? 0.871012 : 0.82
        yRange = yOffset - (gaugeType.type === 'type1' ? 0.142857 : 0.19857)
        valuePos =
          (imageWidth * yRange * (threshold - minValue)) /
          (maxValue - minValue)
        backgroundContext.translate(
          imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) -
            minMaxIndSize / 2 +
            valuePos,
          imageHeight * 0.58
        )
      }
      backgroundContext.drawImage(createThresholdImage(vertical), 0, 0)
      backgroundContext.restore()
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground2 && lcdVisible) {
      if (vertical) {
        lcdBuffer = createLcdBackgroundImage(
          imageWidth * 0.571428,
          imageHeight * 0.055,
          lcdColor
        )
        backgroundContext.drawImage(
          lcdBuffer,
          (imageWidth - imageWidth * 0.571428) / 2,
          imageHeight * 0.88
        )
      } else {
        lcdBuffer = createLcdBackgroundImage(
          imageWidth * 0.18,
          imageHeight * 0.15,
          lcdColor
        )
        backgroundContext.drawImage(
          lcdBuffer,
          imageWidth * 0.695,
          imageHeight * 0.22
        )
      }
    }

    // add thermometer stem foreground
    if (drawForeground2 && gaugeType.type === 'type2') {
      drawForegroundImage(foregroundContext)
    }

    // Create foreground in foreground buffer (foregroundBuffer)
    if (drawForeground2 && foregroundVisible) {
      drawLinearForegroundImage(
        foregroundContext,
        imageWidth,
        imageHeight,
        vertical,
        false
      )
    }
  }

  const drawValue = function (ctx, imageWidth, imageHeight) {
    let top // position of max value
    let bottom // position of min value
    const labelColor = backgroundColor.labelColor
    let fullSize
    let valueSize
    let valueTop
    let valueStartX
    let valueStartY
    let valueStopX
    let valueStopY
    let valueBackgroundStartX
    let valueBackgroundStartY
    let valueBackgroundStopX
    let valueBackgroundStopY
    let valueBorderStartX
    let valueBorderStartY
    let valueBorderStopX
    let valueBorderStopY
    let valueForegroundStartX
    let valueForegroundStartY
    let valueForegroundStopX
    let valueForegroundStopY

    // Orientation dependend definitions
    if (vertical) {
      // Vertical orientation
      top = imageHeight * 0.12864 // position of max value
      if (gaugeType.type === 'type1') {
        bottom = imageHeight * 0.856796 // position of min value
      } else {
        bottom = imageHeight * 0.7475
      }
      fullSize = bottom - top
      valueSize = (fullSize * (value - minValue)) / (maxValue - minValue)
      valueTop = bottom - valueSize
      valueBackgroundStartX = 0
      valueBackgroundStartY = top
      valueBackgroundStopX = 0
      valueBackgroundStopY = bottom
    } else {
      // Horizontal orientation
      if (gaugeType.type === 'type1') {
        top = imageWidth * 0.871012 // position of max value
        bottom = imageWidth * 0.142857 // position of min value
      } else {
        top = imageWidth * 0.82 // position of max value
        bottom = imageWidth * 0.19857 // position of min value
      }
      fullSize = top - bottom
      valueSize = (fullSize * (value - minValue)) / (maxValue - minValue)
      valueTop = bottom
      valueBackgroundStartX = top
      valueBackgroundStartY = 0
      valueBackgroundStopX = bottom
      valueBackgroundStopY = 0
    }
    if (gaugeType.type === 'type1') {
      const darker =
        backgroundColor === BackgroundColor.CARBON ||
        backgroundColor === BackgroundColor.PUNCHED_SHEET ||
        backgroundColor === BackgroundColor.STAINLESS ||
        backgroundColor === BackgroundColor.BRUSHED_STAINLESS ||
        backgroundColor === BackgroundColor.TURNED
          ? 0.3
          : 0
      const valueBackgroundTrackGradient = ctx.createLinearGradient(
        valueBackgroundStartX,
        valueBackgroundStartY,
        valueBackgroundStopX,
        valueBackgroundStopY
      )
      labelColor.setAlpha(0.05 + darker)
      valueBackgroundTrackGradient.addColorStop(0, labelColor.getRgbaColor())
      labelColor.setAlpha(0.15 + darker)
      valueBackgroundTrackGradient.addColorStop(
        0.48,
        labelColor.getRgbaColor()
      )
      labelColor.setAlpha(0.15 + darker)
      valueBackgroundTrackGradient.addColorStop(
        0.49,
        labelColor.getRgbaColor()
      )
      labelColor.setAlpha(0.05 + darker)
      valueBackgroundTrackGradient.addColorStop(1, labelColor.getRgbaColor())
      ctx.fillStyle = valueBackgroundTrackGradient

      if (vertical) {
        ctx.fillRect(
          imageWidth * 0.435714,
          top,
          imageWidth * 0.142857,
          fullSize
        )
      } else {
        ctx.fillRect(
          imageWidth * 0.142857,
          imageHeight * 0.435714,
          fullSize,
          imageHeight * 0.142857
        )
      }

      if (vertical) {
        // Vertical orientation
        valueBorderStartX = 0
        valueBorderStartY = top
        valueBorderStopX = 0
        valueBorderStopY = top + fullSize
      } else {
        // Horizontal orientation
        valueBorderStartX = imageWidth * 0.142857 + fullSize
        valueBorderStartY = 0
        valueBorderStopX = imageWidth * 0.142857
        valueBorderStopY = 0
      }
      const valueBorderGradient = ctx.createLinearGradient(
        valueBorderStartX,
        valueBorderStartY,
        valueBorderStopX,
        valueBorderStopY
      )
      labelColor.setAlpha(0.3 + darker)
      valueBorderGradient.addColorStop(0, labelColor.getRgbaColor())
      labelColor.setAlpha(0.69)
      valueBorderGradient.addColorStop(0.48, labelColor.getRgbaColor())
      labelColor.setAlpha(0.7)
      valueBorderGradient.addColorStop(0.49, labelColor.getRgbaColor())
      labelColor.setAlpha(0.4)
      valueBorderGradient.addColorStop(1, labelColor.getRgbaColor())
      ctx.fillStyle = valueBorderGradient
      if (vertical) {
        ctx.fillRect(
          imageWidth * 0.435714,
          top,
          imageWidth * 0.007142,
          fullSize
        )
        ctx.fillRect(
          imageWidth * 0.571428,
          top,
          imageWidth * 0.007142,
          fullSize
        )
      } else {
        ctx.fillRect(
          imageWidth * 0.142857,
          imageHeight * 0.435714,
          fullSize,
          imageHeight * 0.007142
        )
        ctx.fillRect(
          imageWidth * 0.142857,
          imageHeight * 0.571428,
          fullSize,
          imageHeight * 0.007142
        )
      }
    }
    if (vertical) {
      // Vertical orientation
      if (gaugeType.type === 'type1') {
        valueStartX = imageWidth * 0.45
        valueStartY = 0
        valueStopX = imageWidth * 0.45 + imageWidth * 0.114285
        valueStopY = 0
      } else {
        valueStartX = imageWidth / 2 - (imageHeight * 0.0486) / 2
        valueStartY = 0
        valueStopX = valueStartX + imageHeight * 0.053
        valueStopY = 0
      }
    } else {
      // Horizontal orientation
      if (gaugeType.type === 'type1') {
        valueStartX = 0
        valueStartY = imageHeight * 0.45
        valueStopX = 0
        valueStopY = imageHeight * 0.45 + imageHeight * 0.114285
      } else {
        valueStartX = 0
        valueStartY = imageHeight / 2 - imageWidth * 0.025
        valueStopX = 0
        valueStopY = valueStartY + imageWidth * 0.053
      }
    }

    const valueBackgroundGradient = ctx.createLinearGradient(
      valueStartX,
      valueStartY,
      valueStopX,
      valueStopY
    )
    valueBackgroundGradient.addColorStop(0, valueColor.medium.getRgbaColor())
    valueBackgroundGradient.addColorStop(1, valueColor.light.getRgbaColor())
    ctx.fillStyle = valueBackgroundGradient
    const thermoTweak =
      gaugeType.type === 'type1'
        ? 0
        : vertical
          ? imageHeight * 0.05
          : imageWidth * 0.05
    if (vertical) {
      ctx.fillRect(
        valueStartX,
        valueTop,
        valueStopX - valueStartX,
        valueSize + thermoTweak
      )
    } else {
      ctx.fillRect(
        valueTop - thermoTweak,
        valueStartY,
        valueSize + thermoTweak,
        valueStopY - valueStartY
      )
    }

    if (gaugeType.type === 'type1') {
      // The light effect on the value
      if (vertical) {
        // Vertical orientation
        valueForegroundStartX = imageWidth * 0.45
        valueForegroundStartY = 0
        valueForegroundStopX = valueForegroundStartX + imageWidth * 0.05
        valueForegroundStopY = 0
      } else {
        // Horizontal orientation
        valueForegroundStartX = 0
        valueForegroundStartY = imageHeight * 0.45
        valueForegroundStopX = 0
        valueForegroundStopY = valueForegroundStartY + imageHeight * 0.05
      }
      const valueForegroundGradient = ctx.createLinearGradient(
        valueForegroundStartX,
        valueForegroundStartY,
        valueForegroundStopX,
        valueForegroundStopY
      )
      valueForegroundGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
      valueForegroundGradient.addColorStop(0.98, 'rgba(255, 255, 255, 0.0)')
      ctx.fillStyle = valueForegroundGradient
      if (vertical) {
        ctx.fillRect(
          valueForegroundStartX,
          valueTop,
          valueForegroundStopX,
          valueSize
        )
      } else {
        ctx.fillRect(
          valueTop,
          valueForegroundStartY,
          valueSize,
          valueForegroundStopY - valueForegroundStartY
        )
      }
    }
  }

  const drawForegroundImage = function (ctx) {
    const foreSize = vertical ? imageHeight : imageWidth

    ctx.save()
    if (vertical) {
      ctx.translate(imageWidth / 2, 0)
    } else {
      ctx.translate(imageWidth / 2, imageHeight / 2)
      ctx.rotate(HALF_PI)
      ctx.translate(0, -imageWidth / 2 + imageWidth * 0.05)
    }

    // draw bulb
    ctx.beginPath()
    ctx.moveTo(-0.049 * foreSize, 0.825 * foreSize)
    ctx.bezierCurveTo(
      -0.049 * foreSize,
      0.7975 * foreSize,
      -0.0264 * foreSize,
      0.775 * foreSize,
      0.0013 * foreSize,
      0.775 * foreSize
    )
    ctx.bezierCurveTo(
      0.0264 * foreSize,
      0.775 * foreSize,
      0.049 * foreSize,
      0.7975 * foreSize,
      0.049 * foreSize,
      0.825 * foreSize
    )
    ctx.bezierCurveTo(
      0.049 * foreSize,
      0.85 * foreSize,
      0.0264 * foreSize,
      0.8725 * foreSize,
      0.0013 * foreSize,
      0.8725 * foreSize
    )
    ctx.bezierCurveTo(
      -0.0264 * foreSize,
      0.8725 * foreSize,
      -0.049 * foreSize,
      0.85 * foreSize,
      -0.049 * foreSize,
      0.825 * foreSize
    )
    ctx.closePath()
    let grad = ctx.createRadialGradient(
      0 * foreSize,
      0.825 * foreSize,
      0,
      0 * foreSize,
      0.825 * foreSize,
      0.049 * foreSize
    )
    grad.addColorStop(0, valueColor.medium.getRgbaColor())
    grad.addColorStop(0.3, valueColor.medium.getRgbaColor())
    grad.addColorStop(1, valueColor.light.getRgbaColor())
    ctx.fillStyle = grad
    ctx.fill()

    // draw bulb highlight
    ctx.beginPath()
    if (vertical) {
      ctx.moveTo(-0.0365 * foreSize, 0.8075 * foreSize)
      ctx.bezierCurveTo(
        -0.0365 * foreSize,
        0.7925 * foreSize,
        -0.0214 * foreSize,
        0.7875 * foreSize,
        -0.0214 * foreSize,
        0.7825 * foreSize
      )
      ctx.bezierCurveTo(
        0.0189 * foreSize,
        0.785 * foreSize,
        0.0365 * foreSize,
        0.7925 * foreSize,
        0.0365 * foreSize,
        0.8075 * foreSize
      )
      ctx.bezierCurveTo(
        0.0365 * foreSize,
        0.8175 * foreSize,
        0.0214 * foreSize,
        0.815 * foreSize,
        0.0013 * foreSize,
        0.8125 * foreSize
      )
      ctx.bezierCurveTo(
        -0.0189 * foreSize,
        0.8125 * foreSize,
        -0.0365 * foreSize,
        0.8175 * foreSize,
        -0.0365 * foreSize,
        0.8075 * foreSize
      )
      grad = ctx.createRadialGradient(
        0,
        0.8 * foreSize,
        0,
        0,
        0.8 * foreSize,
        0.0377 * foreSize
      )
    } else {
      ctx.beginPath()
      ctx.moveTo(-0.0214 * foreSize, 0.86 * foreSize)
      ctx.bezierCurveTo(
        -0.0365 * foreSize,
        0.86 * foreSize,
        -0.0415 * foreSize,
        0.845 * foreSize,
        -0.0465 * foreSize,
        0.825 * foreSize
      )
      ctx.bezierCurveTo(
        -0.0465 * foreSize,
        0.805 * foreSize,
        -0.0365 * foreSize,
        0.7875 * foreSize,
        -0.0214 * foreSize,
        0.7875 * foreSize
      )
      ctx.bezierCurveTo(
        -0.0113 * foreSize,
        0.7875 * foreSize,
        -0.0163 * foreSize,
        0.8025 * foreSize,
        -0.0163 * foreSize,
        0.8225 * foreSize
      )
      ctx.bezierCurveTo(
        -0.0163 * foreSize,
        0.8425 * foreSize,
        -0.0113 * foreSize,
        0.86 * foreSize,
        -0.0214 * foreSize,
        0.86 * foreSize
      )
      grad = ctx.createRadialGradient(
        -0.03 * foreSize,
        0.8225 * foreSize,
        0,
        -0.03 * foreSize,
        0.8225 * foreSize,
        0.0377 * foreSize
      )
    }
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)')
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.05)')
    ctx.fillStyle = grad
    ctx.closePath()
    ctx.fill()

    // stem highlight
    ctx.beginPath()
    ctx.moveTo(-0.0214 * foreSize, 0.115 * foreSize)
    ctx.bezierCurveTo(
      -0.0214 * foreSize,
      0.1075 * foreSize,
      -0.0163 * foreSize,
      0.1025 * foreSize,
      -0.0113 * foreSize,
      0.1025 * foreSize
    )
    ctx.bezierCurveTo(
      -0.0113 * foreSize,
      0.1025 * foreSize,
      -0.0113 * foreSize,
      0.1025 * foreSize,
      -0.0113 * foreSize,
      0.1025 * foreSize
    )
    ctx.bezierCurveTo(
      -0.0038 * foreSize,
      0.1025 * foreSize,
      0.0013 * foreSize,
      0.1075 * foreSize,
      0.0013 * foreSize,
      0.115 * foreSize
    )
    ctx.bezierCurveTo(
      0.0013 * foreSize,
      0.115 * foreSize,
      0.0013 * foreSize,
      0.76 * foreSize,
      0.0013 * foreSize,
      0.76 * foreSize
    )
    ctx.bezierCurveTo(
      0.0013 * foreSize,
      0.7675 * foreSize,
      -0.0038 * foreSize,
      0.7725 * foreSize,
      -0.0113 * foreSize,
      0.7725 * foreSize
    )
    ctx.bezierCurveTo(
      -0.0113 * foreSize,
      0.7725 * foreSize,
      -0.0113 * foreSize,
      0.7725 * foreSize,
      -0.0113 * foreSize,
      0.7725 * foreSize
    )
    ctx.bezierCurveTo(
      -0.0163 * foreSize,
      0.7725 * foreSize,
      -0.0214 * foreSize,
      0.7675 * foreSize,
      -0.0214 * foreSize,
      0.76 * foreSize
    )
    ctx.bezierCurveTo(
      -0.0214 * foreSize,
      0.76 * foreSize,
      -0.0214 * foreSize,
      0.115 * foreSize,
      -0.0214 * foreSize,
      0.115 * foreSize
    )
    ctx.closePath()
    grad = ctx.createLinearGradient(
      -0.0189 * foreSize,
      0,
      0.0013 * foreSize,
      0
    )
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.1)')
    grad.addColorStop(0.34, 'rgba(255, 255, 255, 0.5)')
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.1)')
    ctx.fillStyle = grad
    ctx.fill()

    ctx.restore()
  }

  const drawBackgroundImage = function (ctx) {
    const backSize = vertical ? imageHeight : imageWidth
    ctx.save()
    if (vertical) {
      ctx.translate(imageWidth / 2, 0)
    } else {
      ctx.translate(imageWidth / 2, imageHeight / 2)
      ctx.rotate(HALF_PI)
      ctx.translate(0, -imageWidth / 2 + imageWidth * 0.05)
    }
    ctx.beginPath()
    ctx.moveTo(-0.0516 * backSize, 0.825 * backSize)
    ctx.bezierCurveTo(
      -0.0516 * backSize,
      0.8525 * backSize,
      -0.0289 * backSize,
      0.875 * backSize,
      0.0013 * backSize,
      0.875 * backSize
    )
    ctx.bezierCurveTo(
      0.0289 * backSize,
      0.875 * backSize,
      0.0516 * backSize,
      0.8525 * backSize,
      0.0516 * backSize,
      0.825 * backSize
    )
    ctx.bezierCurveTo(
      0.0516 * backSize,
      0.8075 * backSize,
      0.044 * backSize,
      0.7925 * backSize,
      0.0314 * backSize,
      0.7825 * backSize
    )
    ctx.bezierCurveTo(
      0.0314 * backSize,
      0.7825 * backSize,
      0.0314 * backSize,
      0.12 * backSize,
      0.0314 * backSize,
      0.12 * backSize
    )
    ctx.bezierCurveTo(
      0.0314 * backSize,
      0.1025 * backSize,
      0.0189 * backSize,
      0.0875 * backSize,
      0.0013 * backSize,
      0.0875 * backSize
    )
    ctx.bezierCurveTo(
      -0.0163 * backSize,
      0.0875 * backSize,
      -0.0289 * backSize,
      0.1025 * backSize,
      -0.0289 * backSize,
      0.12 * backSize
    )
    ctx.bezierCurveTo(
      -0.0289 * backSize,
      0.12 * backSize,
      -0.0289 * backSize,
      0.7825 * backSize,
      -0.0289 * backSize,
      0.7825 * backSize
    )
    ctx.bezierCurveTo(
      -0.0415 * backSize,
      0.79 * backSize,
      -0.0516 * backSize,
      0.805 * backSize,
      -0.0516 * backSize,
      0.825 * backSize
    )
    ctx.closePath()
    const grad = ctx.createLinearGradient(
      -0.0163 * backSize,
      0,
      0.0289 * backSize,
      0
    )
    grad.addColorStop(0, 'rgba(226, 226, 226, 0.5)')
    grad.addColorStop(0.5, 'rgba(226, 226, 226, 0.2)')
    grad.addColorStop(1, 'rgba(226, 226, 226, 0.5)')
    ctx.fillStyle = grad
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(153, 153, 153, 0.5)'
    ctx.stroke()
    ctx.restore()
  }

  const repaint = function () {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        foreground: true
      })
    }

    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0)
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0)

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(mainCtx, value, vertical)
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY)
    }

    let valuePos
    let yOffset
    let yRange
    let minMaxX
    let minMaxY
    // Draw min measured value indicator
    if (minMeasuredValueVisible) {
      if (vertical) {
        yOffset = gaugeType.type === 'type1' ? 0.856796 : 0.7475
        yRange = yOffset - 0.12864
        valuePos =
          imageHeight * yOffset -
          (imageHeight * yRange * (minMeasuredValue - minValue)) /
            (maxValue - minValue)
        minMaxX = imageWidth * 0.34 - minMeasuredValueBuffer.width
        minMaxY = valuePos - minMeasuredValueBuffer.height / 2
      } else {
        yOffset = gaugeType.type === 'type1' ? 0.871012 : 0.82
        yRange = yOffset - (gaugeType.type === 'type1' ? 0.142857 : 0.19857)
        valuePos =
          (imageWidth * yRange * (minMeasuredValue - minValue)) /
          (maxValue - minValue)
        minMaxX =
          imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) -
          minMeasuredValueBuffer.height / 2 +
          valuePos
        minMaxY = imageHeight * 0.65
      }
      mainCtx.drawImage(minMeasuredValueBuffer, minMaxX, minMaxY)
    }

    // Draw max measured value indicator
    if (maxMeasuredValueVisible) {
      if (vertical) {
        valuePos =
          imageHeight * yOffset -
          (imageHeight * yRange * (maxMeasuredValue - minValue)) /
            (maxValue - minValue)
        minMaxX = imageWidth * 0.34 - maxMeasuredValueBuffer.width
        minMaxY = valuePos - maxMeasuredValueBuffer.height / 2
      } else {
        yOffset = gaugeType.type === 'type1' ? 0.871012 : 0.8
        yRange = yOffset - (gaugeType.type === 'type1' ? 0.14857 : 0.19857)
        valuePos =
          (imageWidth * yRange * (maxMeasuredValue - minValue)) /
          (maxValue - minValue)
        minMaxX =
          imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) -
          maxMeasuredValueBuffer.height / 2 +
          valuePos
        minMaxY = imageHeight * 0.65
      }
      mainCtx.drawImage(maxMeasuredValueBuffer, minMaxX, minMaxY)
    }

    mainCtx.save()
    drawValue(mainCtx, imageWidth, imageHeight)
    mainCtx.restore()

    // Draw foreground
    if (foregroundVisible || gaugeType.type === 'type2') {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  repaint()

  return this
}

export default Linear

export class LinearElement extends BaseElement {
  static get objectConstructor () { return Linear }

  static get properties () {
    return {
      width: { type: Number, defaultValue: 125 },
      height: { type: Number, defaultValue: 200 },
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
      thresholdVisible: { type: Boolean, defaultValue: false },
      minMeasuredValueVisible: { type: Boolean, defaultValue: false },
      maxMeasuredValueVisible: { type: Boolean, defaultValue: false },
      labelNumberFormat: { type: String, objectEnum: LabelNumberFormat, defaultValue: 'STANDARD' },
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
      <canvas width="${this.width}" height="${this.height}"></canvas>
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

window.customElements.define('steelseries-linear', LinearElement)

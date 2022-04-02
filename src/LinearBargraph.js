
import drawLinearBackgroundImage from './drawLinearBackgroundImage.js'
import drawLinearForegroundImage from './drawLinearForegroundImage.js'
import drawLinearFrameImage from './drawLinearFrameImage.js'
import createLedImage from './createLedImage.js'
import createLcdBackgroundImage from './createLcdBackgroundImage.js'
import createMeasuredValueImage from './createMeasuredValueImage.js'
import drawTitleImage from './drawTitleImage.js'
import {
  calcNiceNumber,
  createBuffer,
  customColorDef,
  getCanvasContext,
  doc,
  lcdFontName,
  stdFontName
} from './tools.js'

import {
  BackgroundColor,
  LcdColor,
  ColorDef,
  LedColor,
  FrameDesign,
  LabelNumberFormat
} from './definitions.js'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

export function drawLinearBargraph (canvas, parameters) {
  parameters = parameters || {}
  let width = undefined === parameters.width ? 0 : parameters.width
  let height = undefined === parameters.height ? 0 : parameters.height
  let minValue = undefined === parameters.minValue ? 0 : parameters.minValue
  let maxValue =
    undefined === parameters.maxValue ? minValue + 100 : parameters.maxValue
  const section = undefined === parameters.section ? null : parameters.section
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
  const valueGradient =
    undefined === parameters.valueGradient ? null : parameters.valueGradient
  const useValueGradient =
    undefined === parameters.useValueGradient
      ? false
      : parameters.useValueGradient

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
    audioElement.setAttribute('preload', 'auto')
  }

  let value = parameters.value ?? minValue

  // Properties
  let minMeasuredValue = maxValue
  let maxMeasuredValue = minValue

  let isSectionsVisible = false
  let isGradientVisible = false
  let sectionPixels = []

  const vertical = width <= height

  // Constants
  let ledPosX
  let ledPosY
  const ledSize = Math.round((vertical ? height : width) * 0.05)
  const minMaxIndSize = Math.round((vertical ? width : height) * 0.05)
  let stdFont
  let lcdFont

  if (vertical) {
    ledPosX = imageWidth / 2 - ledSize / 2
    ledPosY = 0.053 * imageHeight
    stdFont = Math.floor(imageHeight / 22) + 'px ' + stdFontName
    lcdFont = Math.floor(imageHeight / 22) + 'px ' + lcdFontName
  } else {
    ledPosX = 0.89 * imageWidth
    ledPosY = imageHeight / 1.95 - ledSize / 2
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

  // Buffer for active bargraph led
  const activeLedBuffer = doc.createElement('canvas')
  if (vertical) {
    activeLedBuffer.width = imageWidth * 0.121428
    activeLedBuffer.height = imageHeight * 0.012135
  } else {
    activeLedBuffer.width = imageWidth * 0.012135
    activeLedBuffer.height = imageHeight * 0.121428
  }
  const activeLedContext = activeLedBuffer.getContext('2d')

  // Buffer for active bargraph led
  const inActiveLedBuffer = doc.createElement('canvas')
  if (vertical) {
    inActiveLedBuffer.width = imageWidth * 0.121428
    inActiveLedBuffer.height = imageHeight * 0.012135
  } else {
    inActiveLedBuffer.width = imageWidth * 0.012135
    inActiveLedBuffer.height = imageHeight * 0.121428
  }
  const inActiveLedContext = inActiveLedBuffer.getContext('2d')

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
        ctx.shadowOffsetX = imageWidth * 0.007
        ctx.shadowOffsetY = imageWidth * 0.007
        ctx.shadowBlur = imageWidth * 0.009
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
        (imageWidth - imageWidth * 0.571428) / 2 +
        1 +
        imageWidth * 0.571428 -
        2
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
    thresholdBuffer.height = thresholdBuffer.width = minMaxIndSize
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
      scaleBoundsH = imageHeight * 0.856796 - imageHeight * 0.12864
      tickSpaceScaling = scaleBoundsH / (maxValue - minValue)
    } else {
      minorTickStart = 0.65 * imageHeight
      minorTickStop = 0.63 * imageHeight
      mediumTickStart = 0.66 * imageHeight
      mediumTickStop = 0.63 * imageHeight
      majorTickStart = 0.67 * imageHeight
      majorTickStop = 0.63 * imageHeight
      ctx.textAlign = 'center'
      scaleBoundsX = imageWidth * 0.142857
      scaleBoundsY = 0
      scaleBoundsW = imageWidth * 0.871012 - imageWidth * 0.142857
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
    const drawBargraphLed =
      undefined === parameters.bargraphled ? false : parameters.bargraphled

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
      let valuePos
      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat, vertical)

      // Draw threshold image to background context
      if (thresholdVisible) {
        backgroundContext.save()
        if (vertical) {
          // Vertical orientation
          valuePos =
            imageHeight * 0.856796 -
            (imageHeight * 0.728155 * (threshold - minValue)) /
              (maxValue - minValue)
          backgroundContext.translate(
            imageWidth * 0.365,
            valuePos - minMaxIndSize / 2
          )
        } else {
          // Horizontal orientation
          valuePos =
            ((imageWidth * 0.856796 - imageWidth * 0.12864) *
              (threshold - minValue)) /
            (maxValue - minValue)
          backgroundContext.translate(
            imageWidth * 0.142857 - minMaxIndSize / 2 + valuePos,
            imageHeight * 0.58
          )
        }
        backgroundContext.drawImage(createThresholdImage(vertical), 0, 0)
        backgroundContext.restore()
      }

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
          lcdVisible
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
          lcdVisible
        )
      }
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

    // Draw leds of bargraph
    if (drawBargraphLed) {
      drawInActiveLed(inActiveLedContext)
      drawActiveLed(activeLedContext, valueColor)
    }

    // Convert Section values into pixels
    isSectionsVisible = false
    if (section !== null && section.length > 0) {
      isSectionsVisible = true
      let sectionIndex = section.length
      let top
      let bottom
      let fullSize
      let ledWidth2

      if (vertical) {
        // Vertical orientation
        top = imageHeight * 0.12864 // position of max value
        bottom = imageHeight * 0.856796 // position of min value
        fullSize = bottom - top
        ledWidth2 = 0
      } else {
        // Horizontal orientation
        top = imageWidth * 0.856796 // position of max value
        bottom = imageWidth * 0.12864
        fullSize = top - bottom
        ledWidth2 = (imageWidth * 0.012135) / 2
      }
      sectionPixels = []
      do {
        sectionIndex--
        sectionPixels.push({
          start:
            ((section[sectionIndex].start + Math.abs(minValue)) /
              (maxValue - minValue)) *
              fullSize -
            ledWidth2,
          stop:
            ((section[sectionIndex].stop + Math.abs(minValue)) /
              (maxValue - minValue)) *
              fullSize -
            ledWidth2,
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
    let valueBackgroundStartX
    let valueBackgroundStartY
    let valueBackgroundStopX
    let valueBackgroundStopY
    let valueBorderStartX
    let valueBorderStartY
    let valueBorderStopX
    let valueBorderStopY
    let currentValue
    let gradRange
    let fraction

    // Orientation dependend definitions
    if (vertical) {
      // Vertical orientation
      top = imageHeight * 0.12864 // position of max value
      bottom = imageHeight * 0.856796 // position of min value
      fullSize = bottom - top
      valueBackgroundStartX = 0
      valueBackgroundStartY = top
      valueBackgroundStopX = 0
      valueBackgroundStopY = top + fullSize * 1.014
    } else {
      // Horizontal orientation
      top = imageWidth * 0.856796 // position of max value
      bottom = imageWidth * 0.12864
      fullSize = top - bottom
      valueBackgroundStartX = imageWidth * 0.13
      valueBackgroundStartY = imageHeight * 0.435714
      valueBackgroundStopX = valueBackgroundStartX + fullSize * 1.035
      valueBackgroundStopY = valueBackgroundStartY
    }

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
    labelColor.setAlpha(0.047058 + darker)
    valueBackgroundTrackGradient.addColorStop(0, labelColor.getRgbaColor())
    labelColor.setAlpha(0.145098 + darker)
    valueBackgroundTrackGradient.addColorStop(0.48, labelColor.getRgbaColor())
    labelColor.setAlpha(0.149019 + darker)
    valueBackgroundTrackGradient.addColorStop(0.49, labelColor.getRgbaColor())
    labelColor.setAlpha(0.047058 + darker)
    valueBackgroundTrackGradient.addColorStop(1, labelColor.getRgbaColor())
    ctx.fillStyle = valueBackgroundTrackGradient

    if (vertical) {
      ctx.fillRect(
        imageWidth * 0.435714,
        top,
        imageWidth * 0.15,
        fullSize * 1.014
      )
    } else {
      ctx.fillRect(
        valueBackgroundStartX,
        valueBackgroundStartY,
        fullSize * 1.035,
        imageHeight * 0.152857
      )
    }

    if (vertical) {
      // Vertical orientation
      valueBorderStartX = 0
      valueBorderStartY = top
      valueBorderStopX = 0
      valueBorderStopY = top + fullSize * 1.014
    } else {
      // Horizontal orientation                ;
      valueBorderStartX = valueBackgroundStartX
      valueBorderStartY = 0
      valueBorderStopX = valueBackgroundStopX
      valueBorderStopY = 0
    }

    const valueBorderGradient = ctx.createLinearGradient(
      valueBorderStartX,
      valueBorderStartY,
      valueBorderStopX,
      valueBorderStopY
    )
    labelColor.setAlpha(0.298039 + darker)
    valueBorderGradient.addColorStop(0, labelColor.getRgbaColor())
    labelColor.setAlpha(0.686274 + darker)
    valueBorderGradient.addColorStop(0.48, labelColor.getRgbaColor())
    labelColor.setAlpha(0.698039 + darker)
    valueBorderGradient.addColorStop(0.49, labelColor.getRgbaColor())
    labelColor.setAlpha(0.4 + darker)
    valueBorderGradient.addColorStop(1, labelColor.getRgbaColor())
    ctx.fillStyle = valueBorderGradient
    if (vertical) {
      ctx.fillRect(
        imageWidth * 0.435714,
        top,
        imageWidth * 0.007142,
        fullSize * 1.014
      )
      ctx.fillRect(
        imageWidth * 0.571428,
        top,
        imageWidth * 0.007142,
        fullSize * 1.014
      )
    } else {
      ctx.fillRect(
        imageWidth * 0.13,
        imageHeight * 0.435714,
        fullSize * 1.035,
        imageHeight * 0.007142
      )
      ctx.fillRect(
        imageWidth * 0.13,
        imageHeight * 0.571428,
        fullSize * 1.035,
        imageHeight * 0.007142
      )
    }

    // Prepare led specific variables
    let ledX
    let ledY
    let ledW
    let ledH
    let activeLeds
    let inactiveLeds
    if (vertical) {
      // VERTICAL
      ledX = imageWidth * 0.45
      ledY = imageHeight * 0.851941
      ledW = imageWidth * 0.121428
      ledH = imageHeight * 0.012135
    } else {
      // HORIZONTAL
      ledX = imageWidth * 0.142857
      ledY = imageHeight * 0.45
      ledW = imageWidth * 0.012135
      ledH = imageHeight * 0.121428
    }

    let translateX
    let translateY
    let activeLedColor
    let lastActiveLedColor = valueColor
    let i
    // Draw the value
    if (vertical) {
      // Draw the inactive leds
      inactiveLeds = fullSize
      for (translateY = 0; translateY <= inactiveLeds; translateY += ledH + 1) {
        ctx.translate(0, -translateY)
        ctx.drawImage(inActiveLedBuffer, ledX, ledY)
        ctx.translate(0, translateY)
      }
      // Draw the active leds in dependence on the current value
      activeLeds = ((value - minValue) / (maxValue - minValue)) * fullSize
      for (translateY = 0; translateY <= activeLeds; translateY += ledH + 1) {
        // check for LED color
        activeLedColor = valueColor
        // Use a gradient for value colors?
        if (isGradientVisible) {
          // Convert pixel back to value
          currentValue =
            minValue + (translateY / fullSize) * (maxValue - minValue)
          gradRange = valueGradient.getEnd() - valueGradient.getStart()
          fraction = (currentValue - minValue) / gradRange
          fraction = Math.max(Math.min(fraction, 1), 0)
          activeLedColor = customColorDef(
            valueGradient.getColorAt(fraction).getRgbaColor()
          )
        } else if (isSectionsVisible) {
          for (i = 0; i < sectionPixels.length; i++) {
            if (
              translateY >= sectionPixels[i].start &&
              translateY < sectionPixels[i].stop
            ) {
              activeLedColor = sectionPixels[i].color
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
        // Draw LED
        ctx.translate(0, -translateY)
        ctx.drawImage(activeLedBuffer, ledX, ledY)
        ctx.translate(0, translateY)
      }
    } else {
      // Draw the inactive leds
      inactiveLeds = fullSize
      for (
        translateX = -(ledW / 2);
        translateX <= inactiveLeds;
        translateX += ledW + 1
      ) {
        ctx.translate(translateX, 0)
        ctx.drawImage(inActiveLedBuffer, ledX, ledY)
        ctx.translate(-translateX, 0)
      }
      // Draw the active leds in dependence on the current value
      activeLeds = ((value - minValue) / (maxValue - minValue)) * fullSize
      for (
        translateX = -(ledW / 2);
        translateX <= activeLeds;
        translateX += ledW + 1
      ) {
        // check for LED color
        activeLedColor = valueColor
        if (isGradientVisible) {
          // Convert pixel back to value
          currentValue =
            minValue + (translateX / fullSize) * (maxValue - minValue)
          gradRange = valueGradient.getEnd() - valueGradient.getStart()
          fraction = (currentValue - minValue) / gradRange
          fraction = Math.max(Math.min(fraction, 1), 0)
          activeLedColor = customColorDef(
            valueGradient.getColorAt(fraction).getRgbaColor()
          )
        } else if (isSectionsVisible) {
          for (i = 0; i < sectionPixels.length; i++) {
            if (
              translateX >= sectionPixels[i].start &&
              translateX < sectionPixels[i].stop
            ) {
              activeLedColor = sectionPixels[i].color
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
        ctx.translate(translateX, 0)
        ctx.drawImage(activeLedBuffer, ledX, ledY)
        ctx.translate(-translateX, 0)
      }
    }
  }

  const drawInActiveLed = function (ctx) {
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
    ledGradient.addColorStop(0, '#3c3c3c')
    ledGradient.addColorStop(1, '#323232')
    ctx.fillStyle = ledGradient
    ctx.fill()
    ctx.restore()
  }

  const drawActiveLed = function (ctx, color) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.closePath()
    const ledCenterX = ctx.canvas.width / 2
    const ledCenterY = ctx.canvas.height / 2
    let outerRadius
    if (vertical) {
      outerRadius = ctx.canvas.width / 2
    } else {
      outerRadius = ctx.canvas.height / 2
    }
    const ledGradient = mainCtx.createRadialGradient(
      ledCenterX,
      ledCenterY,
      0,
      ledCenterX,
      ledCenterY,
      outerRadius
    )
    ledGradient.addColorStop(0, color.light.getRgbaColor())
    ledGradient.addColorStop(1, color.dark.getRgbaColor())
    ctx.fillStyle = ledGradient
    ctx.fill()
    ctx.restore()
  }

  const repaint = function () {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        pointer: true,
        foreground: true,
        bargraphled: true
      })
    }

    // mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0)
    }

    // Draw buffered image to visible canvas
    if (backgroundVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0)
    }

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(mainCtx, value, vertical)
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY)
    }
    let valuePos
    let minMaxX
    let minMaxY
    // Draw min measured value indicator
    if (minMeasuredValueVisible) {
      if (vertical) {
        valuePos =
          imageHeight * 0.856796 -
          (imageHeight * 0.728155 * (minMeasuredValue - minValue)) /
            (maxValue - minValue)
        minMaxX = imageWidth * 0.34 - minMeasuredValueBuffer.width
        minMaxY = valuePos - minMeasuredValueBuffer.height / 2
      } else {
        valuePos =
          ((imageWidth * 0.856796 - imageWidth * 0.12864) *
            (minMeasuredValue - minValue)) /
          (maxValue - minValue)
        minMaxX =
          imageWidth * 0.142857 - minMeasuredValueBuffer.height / 2 + valuePos
        minMaxY = imageHeight * 0.65
      }
      mainCtx.drawImage(minMeasuredValueBuffer, minMaxX, minMaxY)
    }

    // Draw max measured value indicator
    if (maxMeasuredValueVisible) {
      if (vertical) {
        valuePos =
          imageHeight * 0.856796 -
          (imageHeight * 0.728155 * (maxMeasuredValue - minValue)) /
            (maxValue - minValue)
        minMaxX = imageWidth * 0.34 - maxMeasuredValueBuffer.width
        minMaxY = valuePos - maxMeasuredValueBuffer.height / 2
      } else {
        valuePos =
          ((imageWidth * 0.856796 - imageWidth * 0.12864) *
            (maxMeasuredValue - minValue)) /
          (maxValue - minValue)
        minMaxX =
          imageWidth * 0.142857 - maxMeasuredValueBuffer.height / 2 + valuePos
        minMaxY = imageHeight * 0.65
      }
      mainCtx.drawImage(maxMeasuredValueBuffer, minMaxX, minMaxY)
    }

    mainCtx.save()
    drawValue(mainCtx, imageWidth, imageHeight)
    mainCtx.restore()

    // Draw foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  repaint()
}

export class LinearBargraphElement extends BaseElement {
  static get drawFunction () { return drawLinearBargraph }

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

window.customElements.define('steelseries-linear-bargraph', LinearBargraphElement)

import createLcdBackgroundImage from './createLcdBackgroundImage.js'
import {
  roundedRectangle,
  createBuffer,
  getColorValues,
  hsbToRgb,
  rgbToHsb,
  getCanvasContext,
  lcdFontName,
  stdFontName
} from './tools.js'

import { LcdColor } from './definitions.js'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

export function drawDisplaySingle (canvas, parameters) {
  parameters = parameters || {}
  let width = undefined === parameters.width ? 0 : parameters.width
  let height = undefined === parameters.height ? 0 : parameters.height
  const lcdColor =
    undefined === parameters.lcdColor ? LcdColor.STANDARD : parameters.lcdColor
  const lcdDecimals =
    undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals
  const unitString =
    undefined === parameters.unitString ? '' : parameters.unitString
  const unitStringVisible =
    undefined === parameters.unitStringVisible
      ? false
      : parameters.unitStringVisible
  const headerString =
    undefined === parameters.headerString ? '' : parameters.headerString
  const headerStringVisible =
    undefined === parameters.headerStringVisible
      ? false
      : parameters.headerStringVisible
  const digitalFont =
    undefined === parameters.digitalFont ? false : parameters.digitalFont
  const valuesNumeric =
    undefined === parameters.valuesNumeric ? true : parameters.valuesNumeric
  let value = undefined === parameters.value ? 0 : parameters.value
  const section = undefined === parameters.section ? null : parameters.section

  value = valuesNumeric ? parseFloat(value) : value

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

  const fontHeight = Math.floor(imageHeight / 1.5)
  const stdFont = fontHeight + 'px ' + stdFontName
  const lcdFont = fontHeight + 'px ' + lcdFontName

  let initialized = false

  // **************   Buffer creation  ********************
  // Buffer for the lcd
  let lcdBuffer
  const sectionBuffer = []
  const sectionForegroundColor = []

  // **************   Image creation  ********************
  const drawLcdText = function (value, color) {
    mainCtx.save()
    mainCtx.textAlign = 'right'
    // mainCtx.textBaseline = 'top';
    mainCtx.strokeStyle = color
    mainCtx.fillStyle = color

    mainCtx.beginPath()
    mainCtx.rect(2, 0, imageWidth - 4, imageHeight)
    mainCtx.closePath()
    mainCtx.clip()

    if (
      (lcdColor === LcdColor.STANDARD ||
        lcdColor === LcdColor.STANDARD_GREEN) &&
      section === null
    ) {
      mainCtx.shadowColor = 'gray'
      mainCtx.shadowOffsetX = imageHeight * 0.035
      mainCtx.shadowOffsetY = imageHeight * 0.035
      mainCtx.shadowBlur = imageHeight * 0.055
    }

    mainCtx.font = digitalFont ? lcdFont : stdFont

    if (valuesNumeric) {
      // Numeric value
      let unitWidth = 0
      if (unitStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName
        unitWidth = mainCtx.measureText(unitString).width
      }
      mainCtx.font = digitalFont ? lcdFont : stdFont
      const lcdText = value.toFixed(lcdDecimals)
      let vPos = 0.38
      if (headerStringVisible) {
        vPos = 0.52
      }

      mainCtx.fillText(
        lcdText,
        imageWidth - unitWidth - 4,
        imageHeight * 0.5 + fontHeight * vPos
      )

      if (unitStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName
        mainCtx.fillText(
          unitString,
          imageWidth - 2,
          imageHeight * 0.5 + fontHeight * vPos
        )
      }
      if (headerStringVisible) {
        mainCtx.textAlign = 'center'
        mainCtx.font = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName
        mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.3)
      }
    } else {
      // Text value
      mainCtx.fillText(
        value,
        imageWidth - 2,
        imageHeight * 0.5 + fontHeight * 0.38
      )
    }
    mainCtx.restore()
  }

  const createLcdSectionImage = function (width, height, color, lcdColor) {
    const lcdSectionBuffer = createBuffer(width, height)
    const lcdCtx = lcdSectionBuffer.getContext('2d')

    lcdCtx.save()
    const xB = 0
    const yB = 0
    const wB = width
    const hB = height
    const rB = Math.min(width, height) * 0.095

    const lcdBackground = lcdCtx.createLinearGradient(0, yB, 0, yB + hB)

    lcdBackground.addColorStop(0, '#4c4c4c')
    lcdBackground.addColorStop(0.08, '#666666')
    lcdBackground.addColorStop(0.92, '#666666')
    lcdBackground.addColorStop(1, '#e6e6e6')
    lcdCtx.fillStyle = lcdBackground

    roundedRectangle(lcdCtx, xB, yB, wB, hB, rB)

    lcdCtx.fill()
    lcdCtx.restore()

    lcdCtx.save()

    const rgb = getColorValues(color)
    const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2])

    const rgbStart = getColorValues(lcdColor.gradientStartColor)
    const hsbStart = rgbToHsb(rgbStart[0], rgbStart[1], rgbStart[2])
    const rgbFraction1 = getColorValues(lcdColor.gradientFraction1Color)
    const hsbFraction1 = rgbToHsb(
      rgbFraction1[0],
      rgbFraction1[1],
      rgbFraction1[2]
    )
    const rgbFraction2 = getColorValues(lcdColor.gradientFraction2Color)
    const hsbFraction2 = rgbToHsb(
      rgbFraction2[0],
      rgbFraction2[1],
      rgbFraction2[2]
    )
    const rgbFraction3 = getColorValues(lcdColor.gradientFraction3Color)
    const hsbFraction3 = rgbToHsb(
      rgbFraction3[0],
      rgbFraction3[1],
      rgbFraction3[2]
    )
    const rgbStop = getColorValues(lcdColor.gradientStopColor)
    const hsbStop = rgbToHsb(rgbStop[0], rgbStop[1], rgbStop[2])

    const startColor = hsbToRgb(hsb[0], hsb[1], hsbStart[2] - 0.31)
    const fraction1Color = hsbToRgb(hsb[0], hsb[1], hsbFraction1[2] - 0.31)
    const fraction2Color = hsbToRgb(hsb[0], hsb[1], hsbFraction2[2] - 0.31)
    const fraction3Color = hsbToRgb(hsb[0], hsb[1], hsbFraction3[2] - 0.31)
    const stopColor = hsbToRgb(hsb[0], hsb[1], hsbStop[2] - 0.31)

    const xF = 1
    const yF = 1
    const wF = width - 2
    const hF = height - 2
    const rF = rB - 1
    const lcdForeground = lcdCtx.createLinearGradient(0, yF, 0, yF + hF)
    lcdForeground.addColorStop(
      0,
      'rgb(' + startColor[0] + ', ' + startColor[1] + ', ' + startColor[2] + ')'
    )
    lcdForeground.addColorStop(
      0.03,
      'rgb(' +
        fraction1Color[0] +
        ',' +
        fraction1Color[1] +
        ',' +
        fraction1Color[2] +
        ')'
    )
    lcdForeground.addColorStop(
      0.49,
      'rgb(' +
        fraction2Color[0] +
        ',' +
        fraction2Color[1] +
        ',' +
        fraction2Color[2] +
        ')'
    )
    lcdForeground.addColorStop(
      0.5,
      'rgb(' +
        fraction3Color[0] +
        ',' +
        fraction3Color[1] +
        ',' +
        fraction3Color[2] +
        ')'
    )
    lcdForeground.addColorStop(
      1,
      'rgb(' + stopColor[0] + ',' + stopColor[1] + ',' + stopColor[2] + ')'
    )
    lcdCtx.fillStyle = lcdForeground

    roundedRectangle(lcdCtx, xF, yF, wF, hF, rF)

    lcdCtx.fill()
    lcdCtx.restore()

    return lcdSectionBuffer
  }

  const createSectionForegroundColor = function (sectionColor) {
    const rgbSection = getColorValues(sectionColor)
    const hsbSection = rgbToHsb(rgbSection[0], rgbSection[1], rgbSection[2])
    const sectionForegroundRgb = hsbToRgb(hsbSection[0], 0.57, 0.83)
    return (
      'rgb(' +
      sectionForegroundRgb[0] +
      ', ' +
      sectionForegroundRgb[1] +
      ', ' +
      sectionForegroundRgb[2] +
      ')'
    )
  }

  // **************   Initialization  ********************
  const init = function () {
    let sectionIndex
    initialized = true

    // Create lcd background if selected in background buffer (backgroundBuffer)
    lcdBuffer = createLcdBackgroundImage(width, height, lcdColor)

    if (section !== null && section.length > 0) {
      for (sectionIndex = 0; sectionIndex < section.length; sectionIndex++) {
        sectionBuffer[sectionIndex] = createLcdSectionImage(
          width,
          height,
          section[sectionIndex].color,
          lcdColor
        )
        sectionForegroundColor[sectionIndex] = createSectionForegroundColor(
          section[sectionIndex].color
        )
      }
    }
  }

  const repaint = function () {
    if (!initialized) {
      init()
    }

    // mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    let lcdBackgroundBuffer = lcdBuffer
    let lcdTextColor = lcdColor.textColor
    let sectionIndex
    // Draw sections
    if (section !== null && section.length > 0) {
      for (sectionIndex = 0; sectionIndex < section.length; sectionIndex++) {
        if (
          value >= section[sectionIndex].start &&
          value <= section[sectionIndex].stop
        ) {
          lcdBackgroundBuffer = sectionBuffer[sectionIndex]
          lcdTextColor = sectionForegroundColor[sectionIndex]
          break
        }
      }
    }

    // Draw lcd background
    mainCtx.drawImage(lcdBackgroundBuffer, 0, 0)

    // Draw lcd text
    drawLcdText(value, lcdTextColor)
  }

  // Visualize the component
  repaint()
}

export class DisplaySingleElement extends BaseElement {
  static get drawFunction () { return drawDisplaySingle }

  static get properties () {
    return {
      width: { type: Number, defaultValue: 200 },
      height: { type: Number, defaultValue: 80 },
      value: { type: String, defaultValue: '' },
      valuesNumeric: { type: Boolean, defaultValue: false },
      lcdDecimals: { type: Number, defaultValue: 2 },
      lcdColor: { type: String, objectEnum: LcdColor, defaultValue: 'STANDARD' },
      headerString: { type: String, defaultValue: '' },
      headerStringVisible: { type: Boolean, defaultValue: false },
      noLinkAltValue: { type: Boolean, defaultValue: false },
      unitString: { type: String, defaultValue: '' },
      unitStringVisible: { type: Boolean, defaultValue: false },
      digitalFont: { type: Boolean, defaultValue: false }
    }
  }

  render () {
    return html`
      <canvas width="${this.width}" height="${this.height}"></canvas>
    `
  }
}

window.customElements.define('steelseries-display-single', DisplaySingleElement)

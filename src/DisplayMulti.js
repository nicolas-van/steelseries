import createLcdBackgroundImage from './createLcdBackgroundImage.js'
import { getCanvasContext, lcdFontName, stdFontName } from './tools.js'

import { LcdColor } from './definitions.js'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

export function drawDisplayMulti (canvas, parameters) {
  parameters = parameters || {}
  let width = undefined === parameters.width ? 0 : parameters.width
  let height = undefined === parameters.height ? 0 : parameters.height
  const lcdColor =
    undefined === parameters.lcdColor ? LcdColor.STANDARD : parameters.lcdColor
  const lcdDecimals =
    undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals
  const headerString =
    undefined === parameters.headerString ? '' : parameters.headerString
  const headerStringVisible =
    undefined === parameters.headerStringVisible
      ? false
      : parameters.headerStringVisible
  const detailString =
    undefined === parameters.detailString ? '' : parameters.detailString
  const detailStringVisible =
    undefined === parameters.detailStringVisible
      ? false
      : parameters.detailStringVisible
  const unitString =
    undefined === parameters.unitString ? '' : parameters.unitString
  const unitStringVisible =
    undefined === parameters.unitStringVisible
      ? false
      : parameters.unitStringVisible
  const digitalFont =
    undefined === parameters.digitalFont ? false : parameters.digitalFont
  const valuesNumeric =
    undefined === parameters.valuesNumeric ? true : parameters.valuesNumeric
  let value = undefined === parameters.value ? 0 : parameters.value
  let altValue = undefined === parameters.altValue ? 0 : parameters.altValue

  value = valuesNumeric ? parseFloat(value) : value
  altValue = valuesNumeric ? parseFloat(altValue) : altValue

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

  const stdFont = Math.floor(imageHeight / 1.875) + 'px ' + stdFontName
  const lcdFont = Math.floor(imageHeight / 1.875) + 'px ' + lcdFontName
  const stdAltFont = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName
  const lcdAltFont = Math.floor(imageHeight / 3.5) + 'px ' + lcdFontName

  let initialized = false

  // **************   Buffer creation  ********************
  // Buffer for the lcd
  let lcdBuffer

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
      mainCtx.shadowOffsetX = imageHeight * 0.025
      mainCtx.shadowOffsetY = imageHeight * 0.025
      mainCtx.shadowBlur = imageHeight * 0.05
    }

    if (valuesNumeric) {
      // Numeric value
      if (headerStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName
      } else {
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName
      }
      let unitWidth = 0
      if (unitStringVisible) {
        if (headerStringVisible) {
          mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName
          unitWidth = mainCtx.measureText(unitString).width
        } else {
          mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName
          unitWidth = mainCtx.measureText(unitString).width
        }
      }
      mainCtx.font = digitalFont ? lcdFont : stdFont
      const valueText = value.toFixed(lcdDecimals)
      if (headerStringVisible) {
        mainCtx.fillText(
          valueText,
          imageWidth - unitWidth - 4,
          imageHeight * 0.5
        )
      } else {
        mainCtx.fillText(
          valueText,
          imageWidth - unitWidth - 4,
          imageHeight * 0.38
        )
      }

      if (unitStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName
        mainCtx.fillText(unitString, imageWidth - 2, imageHeight * 0.55)
      }

      let altValueText = altValue.toFixed(lcdDecimals)
      if (detailStringVisible) {
        altValueText = detailString + altValueText
      }
      if (digitalFont) {
        mainCtx.font = lcdAltFont
      } else {
        if (headerStringVisible) {
          mainCtx.font = Math.floor(imageHeight / 5) + 'px ' + stdFontName
        } else {
          mainCtx.font = stdAltFont
        }
      }
      mainCtx.textAlign = 'center'
      if (headerStringVisible) {
        mainCtx.fillText(altValueText, imageWidth / 2, imageHeight * 0.83)
        mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.16)
      } else {
        mainCtx.fillText(altValueText, imageWidth / 2, imageHeight * 0.8)
      }
    } else {
      if (headerStringVisible) {
        // Text value
        mainCtx.font = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName
        mainCtx.fillText(value, imageWidth - 2, imageHeight * 0.48)

        // mainCtx.font = stdAltFont;
        mainCtx.font = Math.floor(imageHeight / 5) + 'px ' + stdFontName
        mainCtx.textAlign = 'center'
        mainCtx.fillText(altValue, imageWidth / 2, imageHeight * 0.83)
        mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.17)
      } else {
        // Text value
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName
        mainCtx.fillText(value, imageWidth - 2, imageHeight * 0.38)

        mainCtx.font = stdAltFont
        mainCtx.textAlign = 'center'
        mainCtx.fillText(altValue, imageWidth / 2, imageHeight * 0.8)
      }
    }
    mainCtx.restore()
  }

  // **************   Initialization  ********************
  const init = function () {
    initialized = true

    // Create lcd background if selected in background buffer (backgroundBuffer)
    lcdBuffer = createLcdBackgroundImage(width, height, lcdColor)
  }

  const repaint = function () {
    if (!initialized) {
      init()
    }

    // mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    // Draw lcd background
    mainCtx.drawImage(lcdBuffer, 0, 0)

    // Draw lcd text
    drawLcdText(value)
  }

  // Visualize the component
  repaint()
}

export class DisplayMultiElement extends BaseElement {
  static get drawFunction () { return drawDisplayMulti }

  static get properties () {
    return {
      width: { type: Number, defaultValue: 200 },
      height: { type: Number, defaultValue: 80 },
      value: { type: String, defaultValue: '' },
      altValue: { type: String, defaultValue: '' },
      valuesNumeric: { type: Boolean, defaultValue: false },
      lcdDecimals: { type: Number, defaultValue: 2 },
      lcdColor: { type: String, objectEnum: LcdColor, defaultValue: 'STANDARD' },
      headerString: { type: String, defaultValue: '' },
      headerStringVisible: { type: Boolean, defaultValue: false },
      detailString: { type: String, defaultValue: '' },
      detailStringVisible: { type: Boolean, defaultValue: false },
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

window.customElements.define('steelseries-display-multi', DisplayMultiElement)

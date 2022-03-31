import createLedImage from './createLedImage'
import { getCanvasContext, doc } from './tools'

import { LedColor } from './definitions'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

const Led = function (canvas, parameters) {
  parameters = parameters || {}
  let size = undefined === parameters.size ? 0 : parameters.size
  const ledColor =
    undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  let initialized = false

  // Buffer for led on painting code
  const ledBufferOn = doc.createElement('canvas')
  ledBufferOn.width = size
  ledBufferOn.height = size
  const ledContextOn = ledBufferOn.getContext('2d')

  // Buffer for led off painting code
  const ledBufferOff = doc.createElement('canvas')
  ledBufferOff.width = size
  ledBufferOff.height = size
  const ledContextOff = ledBufferOff.getContext('2d')

  // Buffer for current led painting code
  const ledBuffer = parameters.ledOn ?? false ? ledBufferOn : ledBufferOff

  const init = function () {
    initialized = true

    // Draw LED ON in ledBuffer_ON
    ledContextOn.clearRect(
      0,
      0,
      ledContextOn.canvas.width,
      ledContextOn.canvas.height
    )
    ledContextOn.drawImage(createLedImage(size, 1, ledColor), 0, 0)

    // Draw LED ON in ledBuffer_OFF
    ledContextOff.clearRect(
      0,
      0,
      ledContextOff.canvas.width,
      ledContextOff.canvas.height
    )
    ledContextOff.drawImage(createLedImage(size, 0, ledColor), 0, 0)
  }

  const repaint = function () {
    if (!initialized) {
      init()
    }

    mainCtx.save()
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)

    mainCtx.drawImage(ledBuffer, 0, 0)

    mainCtx.restore()
  }

  repaint()

  return this
}

export default Led

export class LedElement extends BaseElement {
  static get objectConstructor () { return Led }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 50 },
      ledOn: { type: Boolean, defaultValue: false },
      ledColor: { type: String, objectEnum: LedColor, defaultValue: 'RED_LED' }
    }
  }

  render () {
    return html`
      <canvas width="${this.size}" height="${this.size}"></canvas>
    `
  }
}

window.customElements.define('steelseries-led', LedElement)

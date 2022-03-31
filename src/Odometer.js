import Tween from './tween.js'
import { createBuffer, requestAnimFrame, getCanvasContext } from './tools'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeLinear } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

const Odometer = function (canvas, parameters) {
  parameters = parameters || {}

  // parameters
  const _context =
    undefined === parameters._context ? null : parameters._context
  let height = undefined === parameters.height ? 0 : parameters.height
  const digits = undefined === parameters.digits ? 6 : parameters.digits
  const decimals = undefined === parameters.decimals ? 1 : parameters.decimals
  const decimalBackColor =
    undefined === parameters.decimalBackColor
      ? '#F0F0F0'
      : parameters.decimalBackColor
  const decimalForeColor =
    undefined === parameters.decimalForeColor
      ? '#F01010'
      : parameters.decimalForeColor
  const font = undefined === parameters.font ? 'sans-serif' : parameters.font
  let value = undefined === parameters.value ? 0 : parameters.value
  const valueBackColor =
    undefined === parameters.valueBackColor
      ? '#050505'
      : parameters.valueBackColor
  const valueForeColor =
    undefined === parameters.valueForeColor
      ? '#F8F8F8'
      : parameters.valueForeColor
  const wobbleFactor =
    undefined === parameters.wobbleFactor ? 0 : parameters.wobbleFactor
  //
  let initialized = false
  let tween
  let ctx
  let repainting = false
  const wobble = []
  // End of variables

  // Get the canvas context and clear it
  if (_context) {
    ctx = _context
  } else {
    ctx = getCanvasContext(canvas)
  }

  // Has a height been specified?
  if (height === 0) {
    height = ctx.canvas.height
  }

  // Cannot display negative values yet
  if (value < 0) {
    value = 0
  }

  const digitHeight = Math.floor(height * 0.85)
  const stdFont = '600 ' + digitHeight + 'px ' + font

  const digitWidth = Math.floor(height * 0.68)
  const width = digitWidth * (digits + decimals)
  const columnHeight = digitHeight * 11
  const verticalSpace = columnHeight / 12
  const zeroOffset = verticalSpace * 0.81

  // Resize and clear the main context
  ctx.canvas.width = width
  ctx.canvas.height = height

  // Create buffers
  const backgroundBuffer = createBuffer(width, height)
  const backgroundContext = backgroundBuffer.getContext('2d')

  const foregroundBuffer = createBuffer(width, height)
  const foregroundContext = foregroundBuffer.getContext('2d')

  const digitBuffer = createBuffer(digitWidth, columnHeight * 1.1)
  const digitContext = digitBuffer.getContext('2d')

  const decimalBuffer = createBuffer(digitWidth, columnHeight * 1.1)
  const decimalContext = decimalBuffer.getContext('2d')

  function init () {
    let i

    initialized = true

    // Create the foreground
    foregroundContext.rect(0, 0, width, height)
    const grad = foregroundContext.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)')
    grad.addColorStop(0.1, 'rgba(0, 0, 0, 0.4)')
    grad.addColorStop(0.33, 'rgba(255, 255, 255, 0.45)')
    grad.addColorStop(0.46, 'rgba(255, 255, 255, 0)')
    grad.addColorStop(0.9, 'rgba(0, 0, 0, 0.4)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 1)')
    foregroundContext.fillStyle = grad
    foregroundContext.fill()

    // Create a digit column
    // background
    digitContext.rect(0, 0, digitWidth, columnHeight * 1.1)
    digitContext.fillStyle = valueBackColor
    digitContext.fill()
    // edges
    digitContext.strokeStyle = '#f0f0f0'
    digitContext.lineWidth = '1px' // height * 0.1 + 'px';
    digitContext.moveTo(0, 0)
    digitContext.lineTo(0, columnHeight * 1.1)
    digitContext.stroke()
    digitContext.strokeStyle = '#202020'
    digitContext.moveTo(digitWidth, 0)
    digitContext.lineTo(digitWidth, columnHeight * 1.1)
    digitContext.stroke()
    // numerals
    digitContext.textAlign = 'center'
    digitContext.textBaseline = 'middle'
    digitContext.font = stdFont
    digitContext.fillStyle = valueForeColor
    // put the digits 901234567890 vertically into the buffer
    for (i = 9; i < 21; i++) {
      digitContext.fillText(
        i % 10,
        digitWidth * 0.5,
        verticalSpace * (i - 9) + verticalSpace / 2
      )
    }

    // Create a decimal column
    if (decimals > 0) {
      // background
      decimalContext.rect(0, 0, digitWidth, columnHeight * 1.1)
      decimalContext.fillStyle = decimalBackColor
      decimalContext.fill()
      // edges
      decimalContext.strokeStyle = '#f0f0f0'
      decimalContext.lineWidth = '1px' // height * 0.1 + 'px';
      decimalContext.moveTo(0, 0)
      decimalContext.lineTo(0, columnHeight * 1.1)
      decimalContext.stroke()
      decimalContext.strokeStyle = '#202020'
      decimalContext.moveTo(digitWidth, 0)
      decimalContext.lineTo(digitWidth, columnHeight * 1.1)
      decimalContext.stroke()
      // numerals
      decimalContext.textAlign = 'center'
      decimalContext.textBaseline = 'middle'
      decimalContext.font = stdFont
      decimalContext.fillStyle = decimalForeColor
      // put the digits 901234567890 vertically into the buffer
      for (i = 9; i < 21; i++) {
        decimalContext.fillText(
          i % 10,
          digitWidth * 0.5,
          verticalSpace * (i - 9) + verticalSpace / 2
        )
      }
    }
    // wobble factors
    for (i = 0; i < digits + decimals; i++) {
      wobble[i] =
        Math.random() * wobbleFactor * height - (wobbleFactor * height) / 2
    }
  }

  function drawDigits () {
    let pos = 1
    let val = value
    let i
    let num
    let numb
    let frac
    let prevNum

    // do not use Math.pow() - rounding errors!
    for (i = 0; i < decimals; i++) {
      val *= 10
    }

    numb = Math.floor(val)
    frac = val - numb
    numb = String(numb)
    prevNum = 9

    for (i = 0; i < decimals + digits; i++) {
      num = +numb.substring(numb.length - i - 1, numb.length - i) || 0
      if (prevNum !== 9) {
        frac = 0
      }
      if (i < decimals) {
        backgroundContext.drawImage(
          decimalBuffer,
          width - digitWidth * pos,
          -(verticalSpace * (num + frac) + zeroOffset + wobble[i])
        )
      } else {
        backgroundContext.drawImage(
          digitBuffer,
          width - digitWidth * pos,
          -(verticalSpace * (num + frac) + zeroOffset + wobble[i])
        )
      }
      pos++
      prevNum = num
    }
  }

  this.setValueAnimated = function (newVal, callback) {
    const gauge = this
    newVal = parseFloat(newVal)

    if (newVal < 0) {
      newVal = 0
    }
    if (value !== newVal) {
      if (undefined !== tween && tween.isPlaying) {
        tween.stop()
      }

      tween = new Tween({}, '', Tween.strongEaseOut, value, newVal, 2)
      tween.onMotionChanged = function (event) {
        value = event.target._pos
        if (!repainting) {
          repainting = true
          requestAnimFrame(gauge.repaint)
        }
      }

      // do we have a callback function to process?
      if (callback && typeof callback === 'function') {
        tween.onMotionFinished = callback
      }

      tween.start()
    }
    this.repaint()
    return this
  }

  this.setValue = function (newVal) {
    value = parseFloat(newVal)
    if (value < 0) {
      value = 0
    }
    this.repaint()
    return this
  }

  this.getValue = function () {
    return value
  }

  this.repaint = function () {
    if (!initialized) {
      init()
    }

    // draw digits
    drawDigits()

    // draw the foreground
    backgroundContext.drawImage(foregroundBuffer, 0, 0)

    // paint back to the main context
    ctx.drawImage(backgroundBuffer, 0, 0)

    repainting = false
  }

  this.repaint()
}

export default Odometer

export class OdometerElement extends BaseElement {
  static get objectConstructor () { return Odometer }

  static get properties () {
    return {
      height: { type: Number, defaultValue: 50 },
      value: { type: Number, defaultValue: 0 },
      real_value: { state: true },
      transitionTime: { type: Number, defaultValue: 500 },
      digits: { type: Number, defaultValue: 6 },
      decimals: { type: Number, defaultValue: 1 },
      decimalBackColor: { type: String, defaultValue: '#F0F0F0' },
      decimalForeColor: { type: String, defaultValue: '#F01010' },
      font: { type: String, defaultValue: 'sans-serif' },
      valueBackColor: { type: String, defaultValue: '#050505' },
      valueForeColor: { type: String, defaultValue: '#F8F8F8' }
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
        const eased = easeLinear(scaled)
        const newValue = valueScale(eased)
        this.real_value = newValue
        if (now() >= originTime + transitionTime) {
          this._timer.stop()
        }
      })
    }
  }
}

window.customElements.define('steelseries-odometer', OdometerElement)

import { rgbaColor, gradientWrapper, getCanvasContext } from './tools.js'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { easeCubicInOut } from 'd3-ease'
import { timer, now } from 'd3-timer'
import { scaleLinear } from 'd3-scale'

export function drawBattery (canvas, parameters) {
  parameters = parameters || {}
  let size = undefined === parameters.size ? 0 : parameters.size
  const value = undefined === parameters.value ? 50 : parameters.value

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)

  // Has a size been specified?
  if (size === 0) {
    size = mainCtx.canvas.width
  }

  const imageWidth = size
  const imageHeight = Math.ceil(size * 0.45)

  // Set the size - also clears the canvas
  mainCtx.canvas.width = imageWidth
  mainCtx.canvas.height = imageHeight

  const createBatteryImage = function (ctx, imageWidth, imageHeight, value) {
    let grad

    // Background
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.025, imageHeight * 0.055555)
    ctx.lineTo(imageWidth * 0.9, imageHeight * 0.055555)
    ctx.lineTo(imageWidth * 0.9, imageHeight * 0.944444)
    ctx.lineTo(imageWidth * 0.025, imageHeight * 0.944444)
    ctx.lineTo(imageWidth * 0.025, imageHeight * 0.055555)
    ctx.closePath()
    //
    ctx.beginPath()
    ctx.moveTo(imageWidth * 0.925, 0)
    ctx.lineTo(0, 0)
    ctx.lineTo(0, imageHeight)
    ctx.lineTo(imageWidth * 0.925, imageHeight)
    ctx.lineTo(imageWidth * 0.925, imageHeight * 0.722222)
    ctx.bezierCurveTo(
      imageWidth * 0.925,
      imageHeight * 0.722222,
      imageWidth * 0.975,
      imageHeight * 0.722222,
      imageWidth * 0.975,
      imageHeight * 0.722222
    )
    ctx.bezierCurveTo(
      imageWidth,
      imageHeight * 0.722222,
      imageWidth,
      imageHeight * 0.666666,
      imageWidth,
      imageHeight * 0.666666
    )
    ctx.bezierCurveTo(
      imageWidth,
      imageHeight * 0.666666,
      imageWidth,
      imageHeight * 0.333333,
      imageWidth,
      imageHeight * 0.333333
    )
    ctx.bezierCurveTo(
      imageWidth,
      imageHeight * 0.333333,
      imageWidth,
      imageHeight * 0.277777,
      imageWidth * 0.975,
      imageHeight * 0.277777
    )
    ctx.bezierCurveTo(
      imageWidth * 0.975,
      imageHeight * 0.277777,
      imageWidth * 0.925,
      imageHeight * 0.277777,
      imageWidth * 0.925,
      imageHeight * 0.277777
    )
    ctx.lineTo(imageWidth * 0.925, 0)
    ctx.closePath()
    //
    grad = ctx.createLinearGradient(0, 0, 0, imageHeight)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(1, '#7e7e7e')
    ctx.fillStyle = grad
    ctx.fill()

    // Main
    ctx.beginPath()
    let end = Math.max(
      imageWidth * 0.875 * (value / 100),
      Math.ceil(imageWidth * 0.01)
    )
    ctx.rect(
      imageWidth * 0.025,
      imageWidth * 0.025,
      end,
      imageHeight * 0.888888
    )
    ctx.closePath()
    const BORDER_FRACTIONS = [0, 0.4, 1]
    const BORDER_COLORS = [
      new rgbaColor(177, 25, 2, 1), // 0xB11902
      new rgbaColor(219, 167, 21, 1), // 0xDBA715
      new rgbaColor(121, 162, 75, 1) // 0x79A24B
    ]
    const border = new gradientWrapper(0, 100, BORDER_FRACTIONS, BORDER_COLORS)
    ctx.fillStyle = border.getColorAt(value / 100).getRgbColor()
    ctx.fill()
    ctx.beginPath()
    end = Math.max(end - imageWidth * 0.05, 0)
    ctx.rect(imageWidth * 0.05, imageWidth * 0.05, end, imageHeight * 0.777777)
    ctx.closePath()
    const LIQUID_COLORS_DARK = [
      new rgbaColor(198, 39, 5, 1), // 0xC62705
      new rgbaColor(228, 189, 32, 1), // 0xE4BD20
      new rgbaColor(163, 216, 102, 1) // 0xA3D866
    ]

    const LIQUID_COLORS_LIGHT = [
      new rgbaColor(246, 121, 48, 1), // 0xF67930
      new rgbaColor(246, 244, 157, 1), // 0xF6F49D
      new rgbaColor(223, 233, 86, 1) // 0xDFE956
    ]
    const LIQUID_GRADIENT_FRACTIONS = [0, 0.4, 1]
    const liquidDark = new gradientWrapper(
      0,
      100,
      LIQUID_GRADIENT_FRACTIONS,
      LIQUID_COLORS_DARK
    )
    const liquidLight = new gradientWrapper(
      0,
      100,
      LIQUID_GRADIENT_FRACTIONS,
      LIQUID_COLORS_LIGHT
    )
    grad = ctx.createLinearGradient(
      imageWidth * 0.05,
      0,
      imageWidth * 0.875,
      0
    )
    grad.addColorStop(0, liquidDark.getColorAt(value / 100).getRgbColor())
    grad.addColorStop(0.5, liquidLight.getColorAt(value / 100).getRgbColor())
    grad.addColorStop(1, liquidDark.getColorAt(value / 100).getRgbColor())
    ctx.fillStyle = grad
    ctx.fill()

    // Foreground
    ctx.beginPath()
    ctx.rect(
      imageWidth * 0.025,
      imageWidth * 0.025,
      imageWidth * 0.875,
      imageHeight * 0.444444
    )
    ctx.closePath()
    grad = ctx.createLinearGradient(
      imageWidth * 0.025,
      imageWidth * 0.025,
      imageWidth * 0.875,
      imageHeight * 0.444444
    )
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)')
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)')
    ctx.fillStyle = grad
    ctx.fill()
  }

  const repaint = function () {
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height)
    createBatteryImage(mainCtx, imageWidth, imageHeight, value)
  }

  // Visualize the component
  repaint()
}

export class BatteryElement extends BaseElement {
  static get drawFunction () { return drawBattery }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 80 },
      value: { type: Number, defaultValue: 0 },
      real_value: { state: true },
      transitionTime: { type: Number, defaultValue: 500 }
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
      <canvas width="${this.size}" height="${Math.ceil(this.size * 0.45)}"></canvas>
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

window.customElements.define('steelseries-battery', BatteryElement)

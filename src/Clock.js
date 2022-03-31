import drawFrame from './drawFrame'
import drawBackground from './drawBackground'
import drawRadialCustomImage from './drawRadialCustomImage'
import drawForeground from './drawForeground'
import { createBuffer, getCanvasContext, TWO_PI, RAD_FACTOR } from './tools'

import {
  BackgroundColor,
  ColorDef,
  FrameDesign,
  PointerType,
  ForegroundType
} from './definitions'

import { html } from 'lit'
import BaseElement from './BaseElement.js'

import { timer } from 'd3-timer'

const Clock = function (canvas, parameters) {
  parameters = parameters || {}
  let size = undefined === parameters.size ? 0 : parameters.size
  let frameDesign =
    undefined === parameters.frameDesign
      ? FrameDesign.METAL
      : parameters.frameDesign
  const frameVisible =
    undefined === parameters.frameVisible ? true : parameters.frameVisible
  let pointerType =
    undefined === parameters.pointerType
      ? PointerType.TYPE1
      : parameters.pointerType
  let pointerColor =
    undefined === parameters.pointerColor
      ? pointerType === PointerType.TYPE1
        ? ColorDef.GRAY
        : ColorDef.BLACK
      : parameters.pointerColor
  let backgroundColor =
    undefined === parameters.backgroundColor
      ? pointerType === PointerType.TYPE1
        ? BackgroundColor.ANTHRACITE
        : BackgroundColor.LIGHT_GRAY
      : parameters.backgroundColor
  const backgroundVisible =
    undefined === parameters.backgroundVisible
      ? true
      : parameters.backgroundVisible
  let foregroundType =
    undefined === parameters.foregroundType
      ? ForegroundType.TYPE1
      : parameters.foregroundType
  const foregroundVisible =
    undefined === parameters.foregroundVisible
      ? true
      : parameters.foregroundVisible
  const customLayer =
    undefined === parameters.customLayer ? null : parameters.customLayer
  let isAutomatic =
    undefined === parameters.isAutomatic ? false : parameters.isAutomatic
  let hour = undefined === parameters.hour ? 11 : parameters.hour
  let minute = undefined === parameters.minute ? 5 : parameters.minute
  let second = undefined === parameters.second ? 0 : parameters.second
  let secondMovesContinuous =
    undefined === parameters.secondMovesContinuous
      ? false
      : parameters.secondMovesContinuous
  let timeZoneOffsetHour =
    undefined === parameters.timeZoneOffsetHour
      ? 0
      : parameters.timeZoneOffsetHour
  let timeZoneOffsetMinute =
    undefined === parameters.timeZoneOffsetMinute
      ? 0
      : parameters.timeZoneOffsetMinute
  let secondPointerVisible =
    undefined === parameters.secondPointerVisible
      ? true
      : parameters.secondPointerVisible

  // GaugeType specific private variables
  let objDate = new Date()
  let minutePointerAngle
  let hourPointerAngle
  let secondPointerAngle
  let tickTimer
  let tickInterval = secondMovesContinuous ? 100 : 1000
  tickInterval = secondPointerVisible ? tickInterval : 100

  const self = this

  // Constants
  const ANGLE_STEP = 6

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas)
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size
  mainCtx.canvas.height = size

  const imageWidth = size
  const imageHeight = size

  const centerX = imageWidth / 2
  const centerY = imageHeight / 2

  let initialized = false

  // Buffer for the frame
  const frameBuffer = createBuffer(size, size)
  let frameContext = frameBuffer.getContext('2d')

  // Buffer for static background painting code
  const backgroundBuffer = createBuffer(size, size)
  let backgroundContext = backgroundBuffer.getContext('2d')

  // Buffer for hour pointer image painting code
  const hourBuffer = createBuffer(size, size)
  let hourContext = hourBuffer.getContext('2d')

  // Buffer for minute pointer image painting code
  const minuteBuffer = createBuffer(size, size)
  let minuteContext = minuteBuffer.getContext('2d')

  // Buffer for second pointer image painting code
  const secondBuffer = createBuffer(size, size)
  let secondContext = secondBuffer.getContext('2d')

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size)
  let foregroundContext = foregroundBuffer.getContext('2d')

  const drawTickmarksImage = function (ctx, ptrType) {
    let tickAngle
    let SMALL_TICK_HEIGHT
    let BIG_TICK_HEIGHT
    let INNER_POINT
    const OUTER_POINT = imageWidth * 0.405
    ctx.save()
    ctx.translate(centerX, centerY)

    switch (ptrType.type) {
      case 'type1':
        // Draw minutes tickmarks
        SMALL_TICK_HEIGHT = imageWidth * 0.074766
        INNER_POINT = OUTER_POINT - SMALL_TICK_HEIGHT
        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
        ctx.lineWidth = imageWidth * 0.014018

        for (tickAngle = 0; tickAngle < 360; tickAngle += 30) {
          ctx.beginPath()
          ctx.moveTo(OUTER_POINT, 0)
          ctx.lineTo(INNER_POINT, 0)
          ctx.closePath()
          ctx.stroke()
          ctx.rotate(30 * RAD_FACTOR)
        }

        // Draw hours tickmarks
        BIG_TICK_HEIGHT = imageWidth * 0.126168
        INNER_POINT = OUTER_POINT - BIG_TICK_HEIGHT
        ctx.lineWidth = imageWidth * 0.03271

        for (tickAngle = 0; tickAngle < 360; tickAngle += 90) {
          ctx.beginPath()
          ctx.moveTo(OUTER_POINT, 0)
          ctx.lineTo(INNER_POINT, 0)
          ctx.closePath()
          ctx.stroke()
          ctx.rotate(90 * RAD_FACTOR)
        }
        break

      case 'type2':
      /* falls through */
      default:
        // Draw minutes tickmarks
        SMALL_TICK_HEIGHT = imageWidth * 0.037383
        INNER_POINT = OUTER_POINT - SMALL_TICK_HEIGHT
        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
        ctx.lineWidth = imageWidth * 0.009345

        for (tickAngle = 0; tickAngle < 360; tickAngle += 6) {
          ctx.beginPath()
          ctx.moveTo(OUTER_POINT, 0)
          ctx.lineTo(INNER_POINT, 0)
          ctx.closePath()
          ctx.stroke()
          ctx.rotate(6 * RAD_FACTOR)
        }

        // Draw hours tickmarks
        BIG_TICK_HEIGHT = imageWidth * 0.084112
        INNER_POINT = OUTER_POINT - BIG_TICK_HEIGHT
        ctx.lineWidth = imageWidth * 0.028037

        for (tickAngle = 0; tickAngle < 360; tickAngle += 30) {
          ctx.beginPath()
          ctx.moveTo(OUTER_POINT, 0)
          ctx.lineTo(INNER_POINT, 0)
          ctx.closePath()
          ctx.stroke()
          ctx.rotate(30 * RAD_FACTOR)
        }
        break
    }
    ctx.translate(-centerX, -centerY)
    ctx.restore()
  }

  const drawHourPointer = function (ctx, ptrType) {
    ctx.save()
    let grad

    switch (ptrType.type) {
      case 'type2':
        ctx.beginPath()
        ctx.lineWidth = imageWidth * 0.046728
        ctx.moveTo(centerX, imageWidth * 0.289719)
        ctx.lineTo(centerX, imageWidth * 0.289719 + imageWidth * 0.224299)
        ctx.strokeStyle = pointerColor.medium.getRgbaColor()
        ctx.closePath()
        ctx.stroke()
        break

      case 'type1':
      /* falls through */
      default:
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.471962, imageHeight * 0.560747)
        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.214953)
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.182242)
        ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.214953)
        ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.560747)
        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.560747)
        ctx.closePath()
        grad = ctx.createLinearGradient(
          imageWidth * 0.471962,
          imageHeight * 0.560747,
          imageWidth * 0.528037,
          imageHeight * 0.214953
        )
        grad.addColorStop(1, pointerColor.veryLight.getRgbaColor())
        grad.addColorStop(0, pointerColor.light.getRgbaColor())
        ctx.fillStyle = grad
        ctx.strokeStyle = pointerColor.light.getRgbaColor()
        ctx.fill()
        ctx.stroke()
        break
    }
    ctx.restore()
  }

  const drawMinutePointer = function (ctx, ptrType) {
    ctx.save()
    let grad

    switch (ptrType.type) {
      case 'type2':
        ctx.beginPath()
        ctx.lineWidth = imageWidth * 0.03271
        ctx.moveTo(centerX, imageWidth * 0.116822)
        ctx.lineTo(centerX, imageWidth * 0.116822 + imageWidth * 0.38785)
        ctx.strokeStyle = pointerColor.medium.getRgbaColor()
        ctx.closePath()
        ctx.stroke()
        break

      case 'type1':
      /* falls through */
      default:
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.574766)
        ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.135514)
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.107476)
        ctx.lineTo(imageWidth * 0.476635, imageHeight * 0.140186)
        ctx.lineTo(imageWidth * 0.476635, imageHeight * 0.574766)
        ctx.lineTo(imageWidth * 0.518691, imageHeight * 0.574766)
        ctx.closePath()
        grad = ctx.createLinearGradient(
          imageWidth * 0.518691,
          imageHeight * 0.574766,
          imageWidth * 0.476635,
          imageHeight * 0.140186
        )
        grad.addColorStop(1, pointerColor.veryLight.getRgbaColor())
        grad.addColorStop(0, pointerColor.light.getRgbaColor())
        ctx.fillStyle = grad
        ctx.strokeStyle = pointerColor.light.getRgbaColor()
        ctx.fill()
        ctx.stroke()
        break
    }
    ctx.restore()
  }

  const drawSecondPointer = function (ctx, ptrType) {
    ctx.save()
    let grad

    switch (ptrType.type) {
      case 'type2':
        // top rectangle
        ctx.lineWidth = imageWidth * 0.009345
        ctx.beginPath()
        ctx.moveTo(centerX, imageWidth * 0.09813)
        ctx.lineTo(centerX, imageWidth * 0.09813 + imageWidth * 0.126168)
        ctx.closePath()
        ctx.stroke()
        // bottom rectangle
        ctx.lineWidth = imageWidth * 0.018691
        ctx.beginPath()
        ctx.moveTo(centerX, imageWidth * 0.308411)
        ctx.lineTo(centerX, imageWidth * 0.308411 + imageWidth * 0.191588)
        ctx.closePath()
        ctx.stroke()
        // circle
        ctx.lineWidth = imageWidth * 0.016
        ctx.beginPath()
        ctx.arc(
          centerX,
          imageWidth * 0.26,
          (imageWidth * 0.085) / 2,
          0,
          TWO_PI
        )
        ctx.closePath()
        ctx.stroke()
        break

      case 'type1':
      /* falls through */
      default:
        ctx.beginPath()
        ctx.moveTo(imageWidth * 0.509345, imageHeight * 0.116822)
        ctx.lineTo(imageWidth * 0.509345, imageHeight * 0.574766)
        ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.574766)
        ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.116822)
        ctx.lineTo(imageWidth * 0.509345, imageHeight * 0.116822)
        ctx.closePath()
        grad = ctx.createLinearGradient(
          imageWidth * 0.509345,
          imageHeight * 0.116822,
          imageWidth * 0.490654,
          imageHeight * 0.574766
        )
        grad.addColorStop(0, ColorDef.RED.light.getRgbaColor())
        grad.addColorStop(0.47, ColorDef.RED.medium.getRgbaColor())
        grad.addColorStop(1, ColorDef.RED.dark.getRgbaColor())
        ctx.fillStyle = grad
        ctx.strokeStyle = ColorDef.RED.dark.getRgbaColor()
        ctx.fill()
        ctx.stroke()
        break
    }
    ctx.restore()
  }

  const drawKnob = function (ctx) {
    // draw the knob
    ctx.beginPath()
    ctx.arc(centerX, centerY, imageWidth * 0.045, 0, TWO_PI)
    ctx.closePath()
    const grad = ctx.createLinearGradient(
      centerX - (imageWidth * 0.045) / 2,
      centerY - (imageWidth * 0.045) / 2,
      centerX + (imageWidth * 0.045) / 2,
      centerY + (imageWidth * 0.045) / 2
    )
    grad.addColorStop(0, '#eef0f2')
    grad.addColorStop(1, '#65696d')
    ctx.fillStyle = grad
    ctx.fill()
  }

  const drawTopKnob = function (ctx, ptrType) {
    let grad

    ctx.save()

    switch (ptrType.type) {
      case 'type2':
        // draw knob
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(centerX, centerY, (imageWidth * 0.088785) / 2, 0, TWO_PI)
        ctx.closePath()
        ctx.fill()
        break

      case 'type1':
      /* falls through */
      default:
        // draw knob
        grad = ctx.createLinearGradient(
          centerX - (imageWidth * 0.027) / 2,
          centerY - (imageWidth * 0.027) / 2,
          centerX + (imageWidth * 0.027) / 2,
          centerY + (imageWidth * 0.027) / 2
        )
        grad.addColorStop(0, '#f3f4f7')
        grad.addColorStop(0.11, '#f3f5f7')
        grad.addColorStop(0.12, '#f1f3f5')
        grad.addColorStop(0.2, '#c0c5cb')
        grad.addColorStop(0.2, '#bec3c9')
        grad.addColorStop(1, '#bec3c9')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(centerX, centerY, imageWidth * 0.027, 0, TWO_PI)
        ctx.closePath()
        ctx.fill()
        break
    }

    ctx.restore()
  }

  const calculateAngles = function (hour, minute, second) {
    secondPointerAngle = second * ANGLE_STEP * RAD_FACTOR
    minutePointerAngle = minute * ANGLE_STEP * RAD_FACTOR
    hourPointerAngle = (hour + minute / 60) * ANGLE_STEP * 5 * RAD_FACTOR
  }

  const tickTock = function () {
    if (isAutomatic) {
      objDate = new Date()
    } else {
      objDate.setHours(hour)
      objDate.setMinutes(minute)
      objDate.setSeconds(second)
    }
    // Seconds
    second =
      objDate.getSeconds() +
      (secondMovesContinuous ? objDate.getMilliseconds() / 1000 : 0)

    // Hours
    if (timeZoneOffsetHour !== 0) {
      hour = objDate.getUTCHours() + timeZoneOffsetHour
    } else {
      hour = objDate.getHours()
    }
    hour = hour % 12

    // Minutes
    if (timeZoneOffsetMinute !== 0) {
      minute = objDate.getUTCMinutes() + timeZoneOffsetMinute
    } else {
      minute = objDate.getMinutes()
    }
    if (minute > 60) {
      minute -= 60
      hour++
    }
    if (minute < 0) {
      minute += 60
      hour--
    }
    hour = hour % 12
    // Calculate angles from current hour and minute values
    calculateAngles(hour, minute, second)

    if (isAutomatic) {
      tickTimer = setTimeout(tickTock, tickInterval)
    }

    self.repaint()
  }

  // **************   Initialization  ********************
  // Draw all static painting code to background
  const init = function (parameters) {
    parameters = parameters || {}
    const drawFrame2 =
      undefined === parameters.frame ? false : parameters.frame
    const drawBackground2 =
      undefined === parameters.background ? false : parameters.background
    const drawPointers =
      undefined === parameters.pointers ? false : parameters.pointers
    const drawForeground2 =
      undefined === parameters.foreground ? false : parameters.foreground

    initialized = true

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

    if (drawBackground2 && backgroundVisible) {
      // Create background in background buffer (backgroundBuffer)
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

      drawTickmarksImage(backgroundContext, pointerType)
    }

    if (drawPointers) {
      drawHourPointer(hourContext, pointerType)
      drawMinutePointer(minuteContext, pointerType)
      drawSecondPointer(secondContext, pointerType)
    }

    if (drawForeground2 && foregroundVisible) {
      drawTopKnob(foregroundContext, pointerType)
      drawForeground(
        foregroundContext,
        foregroundType,
        imageWidth,
        imageHeight,
        false
      )
    }
  }

  const resetBuffers = function (buffers) {
    buffers = buffers || {}
    const resetFrame = undefined === buffers.frame ? false : buffers.frame
    const resetBackground =
      undefined === buffers.background ? false : buffers.background
    const resetPointers =
      undefined === buffers.pointers ? false : buffers.pointers
    const resetForeground =
      undefined === buffers.foreground ? false : buffers.foreground

    if (resetFrame) {
      frameBuffer.width = size
      frameBuffer.height = size
      frameContext = frameBuffer.getContext('2d')
    }

    if (resetBackground) {
      backgroundBuffer.width = size
      backgroundBuffer.height = size
      backgroundContext = backgroundBuffer.getContext('2d')
    }

    if (resetPointers) {
      hourBuffer.width = size
      hourBuffer.height = size
      hourContext = hourBuffer.getContext('2d')

      minuteBuffer.width = size
      minuteBuffer.height = size
      minuteContext = minuteBuffer.getContext('2d')

      secondBuffer.width = size
      secondBuffer.height = size
      secondContext = secondBuffer.getContext('2d')
    }

    if (resetForeground) {
      foregroundBuffer.width = size
      foregroundBuffer.height = size
      foregroundContext = foregroundBuffer.getContext('2d')
    }
  }

  //* *********************************** Public methods **************************************
  this.getAutomatic = function () {
    return isAutomatic
  }

  this.setAutomatic = function (newValue) {
    newValue = !!newValue
    if (isAutomatic && !newValue) {
      // stop the clock!
      clearTimeout(tickTimer)
      isAutomatic = newValue
    } else if (!isAutomatic && newValue) {
      // start the clock
      isAutomatic = newValue
      tickTock()
    }
    return this
  }

  this.getHour = function () {
    return hour
  }

  this.setHour = function (newValue) {
    newValue = parseInt(newValue, 10) % 12
    if (hour !== newValue) {
      hour = newValue
      calculateAngles(hour, minute, second)
      this.repaint()
    }
    return this
  }

  this.getMinute = function () {
    return minute
  }

  this.setMinute = function (newValue) {
    newValue = parseInt(newValue, 10) % 60
    if (minute !== newValue) {
      minute = newValue
      calculateAngles(hour, minute, second)
      this.repaint()
    }
    return this
  }

  this.getSecond = function () {
    return second
  }

  this.setSecond = function (newValue) {
    newValue = parseInt(newValue, 10) % 60
    if (second !== newValue) {
      second = newValue
      calculateAngles(hour, minute, second)
      this.repaint()
    }
    return this
  }

  this.getTimeZoneOffsetHour = function () {
    return timeZoneOffsetHour
  }

  this.setTimeZoneOffsetHour = function (newValue) {
    timeZoneOffsetHour = parseInt(newValue, 10)
    this.repaint()
    return this
  }

  this.getTimeZoneOffsetMinute = function () {
    return timeZoneOffsetMinute
  }

  this.setTimeZoneOffsetMinute = function (newValue) {
    timeZoneOffsetMinute = parseInt(newValue, 10)
    this.repaint()
    return this
  }

  this.getSecondPointerVisible = function () {
    return secondPointerVisible
  }

  this.setSecondPointerVisible = function (newValue) {
    secondPointerVisible = !!newValue
    this.repaint()
    return this
  }

  this.getSecondMovesContinuous = function () {
    return secondMovesContinuous
  }

  this.setSecondMovesContinuous = function (newValue) {
    secondMovesContinuous = !!newValue
    tickInterval = secondMovesContinuous ? 100 : 1000
    tickInterval = secondPointerVisible ? tickInterval : 100
    return this
  }

  this.setFrameDesign = function (newFrameDesign) {
    resetBuffers({
      frame: true
    })
    frameDesign = newFrameDesign
    init({
      frame: true
    })
    this.repaint()
    return this
  }

  this.setBackgroundColor = function (newBackgroundColor) {
    resetBuffers({
      frame: true,
      background: true
    })
    backgroundColor = newBackgroundColor
    init({
      frame: true,
      background: true
    })
    this.repaint()
    return this
  }

  this.setForegroundType = function (newForegroundType) {
    resetBuffers({
      foreground: true
    })
    foregroundType = newForegroundType
    init({
      foreground: true
    })
    this.repaint()
    return this
  }

  this.setPointerType = function (newPointerType) {
    resetBuffers({
      background: true,
      foreground: true,
      pointers: true
    })
    pointerType = newPointerType
    if (pointerType.type === 'type1') {
      pointerColor = ColorDef.GRAY
      backgroundColor = BackgroundColor.ANTHRACITE
    } else {
      pointerColor = ColorDef.BLACK
      backgroundColor = BackgroundColor.LIGHT_GRAY
    }
    init({
      background: true,
      foreground: true,
      pointers: true
    })
    this.repaint()
    return this
  }

  this.setPointerColor = function (newPointerColor) {
    resetBuffers({
      pointers: true
    })
    pointerColor = newPointerColor
    init({
      pointers: true
    })
    this.repaint()
    return this
  }

  this.repaint = function () {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        pointers: true,
        foreground: true
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

    // have to draw to a rotated temporary image area so we can translate in
    // absolute x, y values when drawing to main context
    const shadowOffset = imageWidth * 0.006

    // draw hour pointer
    // Define rotation center
    mainCtx.save()
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(hourPointerAngle)
    mainCtx.translate(-centerX, -centerY)
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset
    mainCtx.shadowBlur = shadowOffset * 2
    // Draw the pointer
    mainCtx.drawImage(hourBuffer, 0, 0)

    // draw minute pointer
    // Define rotation center
    mainCtx.translate(centerX, centerY)
    mainCtx.rotate(minutePointerAngle - hourPointerAngle)
    mainCtx.translate(-centerX, -centerY)
    mainCtx.drawImage(minuteBuffer, 0, 0)
    mainCtx.restore()

    if (pointerType.type === 'type1') {
      drawKnob(mainCtx)
    }

    if (secondPointerVisible) {
      // draw second pointer
      // Define rotation center
      mainCtx.save()
      mainCtx.translate(centerX, centerY)
      mainCtx.rotate(secondPointerAngle)
      mainCtx.translate(-centerX, -centerY)
      // Set the pointer shadow params
      mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset
      mainCtx.shadowBlur = shadowOffset * 2
      // Draw the pointer
      mainCtx.drawImage(secondBuffer, 0, 0)
      mainCtx.restore()
    }

    // Draw foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0)
    }
  }

  // Visualize the component
  tickTock()

  return this
}

export default Clock

export class ClockElement extends BaseElement {
  static get objectConstructor () { return Clock }

  static get properties () {
    return {
      size: { type: Number, defaultValue: 200 },
      isCurrentTime: { type: Boolean, defaultValue: false },
      hour: { type: Number, defaultValue: 0 },
      real_hour: { state: true },
      minute: { type: Number, defaultValue: 0 },
      real_minute: { state: true },
      second: { type: Number, defaultValue: 0 },
      real_second: { state: true },
      frameDesign: { type: String, objectEnum: FrameDesign, defaultValue: 'METAL' },
      noFrameVisible: { type: Boolean, defaultValue: false },
      pointerType: { type: String, objectEnum: PointerType, defaultValue: 'TYPE1' },
      pointerColor: { type: String, objectEnum: ColorDef, defaultValue: 'GRAY' },
      backgroundColor: { type: String, objectEnum: BackgroundColor, defaultValue: 'ANTHRACITE' },
      noBackgroundVisible: { type: Boolean, defaultValue: false },
      foregroundType: { type: String, objectEnum: ForegroundType, defaultValue: 'TYPE1' },
      noForegroundVisible: { type: Boolean, defaultValue: false },
      timeZoneOffsetHour: { type: Number, defaultValue: 0 },
      timeZoneOffsetMinute: { type: Number, defaultValue: 0 },
      noSecondPointerVisible: { type: Boolean, defaultValue: false }
    }
  }

  constructor () {
    super()
    this._timer = timer(() => {})
    this._timer.stop()
  }

  connectedCallback () {
    super.connectedCallback()
    this.real_hour = this.hour
    this.real_minute = this.minute
    this.real_second = this.second
  }

  render () {
    return html`
      <canvas width="${this.size}" height="${this.size}"></canvas>
    `
  }

  updated (changedProperties) {
    super.updated()
    if (changedProperties.has('hour') ||
    changedProperties.has('minute') ||
    changedProperties.has('second') ||
    changedProperties.has('isCurrentTime')) {
      if (this.isCurrentTime) {
        this._timer.restart(() => {
          const date = new Date()
          const hour = date.getHours()
          const minute = date.getMinutes()
          const second = date.getSeconds()
          if (this.real_hour !== hour ||
            this.real_minute !== minute ||
            this.real_second !== second) {
            this.real_hour = hour
            this.real_minute = minute
            this.real_second = second
          }
        })
      } else {
        this._timer.stop()
        this.real_hour = this.hour
        this.real_minute = this.minute
        this.real_second = this.second
      }
    }
  }
}

window.customElements.define('steelseries-clock', ClockElement)

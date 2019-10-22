
import Tween from "./tween.js";
import drawFrame from "./drawFrame";
import drawBackground from "./drawBackground";
import drawRadialCustomImage from "./drawRadialCustomImage";
import drawForeground from "./drawForeground";
import drawRoseImage from "./drawRoseImage";
import {
createBuffer, 
getShortestAngle, 
requestAnimFrame, 
getCanvasContext,
HALF_PI,
RAD_FACTOR,
} from "./tools";

import {
  backgroundColor as BackgroundColor,
  lcdColor as LcdColor,
  color as ColorDef,
  ledColor as LedColor,
  gaugeType as GaugeType,
  orientation as Orientation,
  knobType as KnobType,
  knobStyle as KnobStyle,
  frameDesign as FrameDesign,
  pointerType as PointerType,
  foregroundType as ForegroundType,
  labelNumberFormat as LabelNumberFormat,
  tickLabelOrientation as TickLabelOrientation,
  trendState as TrendState,
  } from "./definitions";

var Compass = function(canvas, parameters) {
  parameters = parameters || {};
  var size = (undefined === parameters.size ? 0 : parameters.size),
    frameDesign = (undefined === parameters.frameDesign ? FrameDesign.METAL : parameters.frameDesign),
    frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
    backgroundColor = (undefined === parameters.backgroundColor ? BackgroundColor.DARK_GRAY : parameters.backgroundColor),
    backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
    pointerType = (undefined === parameters.pointerType ? PointerType.TYPE2 : parameters.pointerType),
    pointerColor = (undefined === parameters.pointerColor ? ColorDef.RED : parameters.pointerColor),
    knobType = (undefined === parameters.knobType ? KnobType.STANDARD_KNOB : parameters.knobType),
    knobStyle = (undefined === parameters.knobStyle ? KnobStyle.SILVER : parameters.knobStyle),
    foregroundType = (undefined === parameters.foregroundType ? ForegroundType.TYPE1 : parameters.foregroundType),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    pointSymbols = (undefined === parameters.pointSymbols ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] : parameters.pointSymbols),
    pointSymbolsVisible = (undefined === parameters.pointSymbolsVisible ? true : parameters.pointSymbolsVisible),
    customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
    degreeScale = (undefined === parameters.degreeScale ? false : parameters.degreeScale),
    roseVisible = (undefined === parameters.roseVisible ? true : parameters.roseVisible),
    rotateFace = (undefined === parameters.rotateFace ? false : parameters.rotateFace);

  var tween;
  var repainting = false;
  var value = 0;
  var angleStep = RAD_FACTOR;
  var angle = this.value;

  // Get the canvas context and clear it
  var mainCtx = getCanvasContext(canvas);
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size;
  mainCtx.canvas.height = size;

  var imageWidth = size;
  var imageHeight = size;

  var centerX = imageWidth / 2;
  var centerY = imageHeight / 2;

  var shadowOffset = imageWidth * 0.006;

  var initialized = false;

  // **************   Buffer creation  ********************
  // Buffer for all static background painting code
  var backgroundBuffer = createBuffer(size, size);
  var backgroundContext = backgroundBuffer.getContext('2d');

  // Buffer for symbol/rose painting code
  var roseBuffer = createBuffer(size, size);
  var roseContext = roseBuffer.getContext('2d');

  // Buffer for pointer image painting code
  var pointerBuffer = createBuffer(size, size);
  var pointerContext = pointerBuffer.getContext('2d');

  // Buffer for static foreground painting code
  var foregroundBuffer = createBuffer(size, size);
  var foregroundContext = foregroundBuffer.getContext('2d');

  // **************   Image creation  ********************
  var drawTickmarksImage = function(ctx) {
    var val;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var stdFont, smlFont, i;

    ctx.save();
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.translate(centerX, centerY);

    if (!degreeScale) {

      stdFont = 0.12 * imageWidth + 'px serif';
      smlFont = 0.06 * imageWidth + 'px serif';

      for (i = 0; 360 > i; i += 2.5) {

        if (0 === i % 5) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.38, 0);
          ctx.lineTo(imageWidth * 0.36, 0);
          ctx.closePath();
          ctx.stroke();
        }

        // Draw the labels
        ctx.save();
        switch (i) {
          case 0:
            ctx.translate(imageWidth * 0.35, 0);
            ctx.rotate(HALF_PI);
            ctx.font = stdFont;
            ctx.fillText(pointSymbols[2], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.35, 0);
            break;
          case 45:
            ctx.translate(imageWidth * 0.29, 0);
            ctx.rotate(HALF_PI);
            ctx.font = smlFont;
            ctx.fillText(pointSymbols[3], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.29, 0);
            break;
          case 90:
            ctx.translate(imageWidth * 0.35, 0);
            ctx.rotate(HALF_PI);
            ctx.font = stdFont;
            ctx.fillText(pointSymbols[4], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.35, 0);
            break;
          case 135:
            ctx.translate(imageWidth * 0.29, 0);
            ctx.rotate(HALF_PI);
            ctx.font = smlFont;
            ctx.fillText(pointSymbols[5], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.29, 0);
            break;
          case 180:
            ctx.translate(imageWidth * 0.35, 0);
            ctx.rotate(HALF_PI);
            ctx.font = stdFont;
            ctx.fillText(pointSymbols[6], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.35, 0);
            break;
          case 225:
            ctx.translate(imageWidth * 0.29, 0);
            ctx.rotate(HALF_PI);
            ctx.font = smlFont;
            ctx.fillText(pointSymbols[7], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.29, 0);
            break;
          case 270:
            ctx.translate(imageWidth * 0.35, 0);
            ctx.rotate(HALF_PI);
            ctx.font = stdFont;
            ctx.fillText(pointSymbols[0], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.35, 0);
            break;
          case 315:
            ctx.translate(imageWidth * 0.29, 0);
            ctx.rotate(HALF_PI);
            ctx.font = smlFont;
            ctx.fillText(pointSymbols[1], 0, 0, imageWidth);
            ctx.translate(-imageWidth * 0.29, 0);
            break;
        }
        ctx.restore();

        if (roseVisible && (0 === i || 22.5 === i || 45 === i || 67.5 === i || 90 === i || 112.5 === i || 135 === i || 157.5 === i || 180 === i || 202.5 === i || 225 === i || 247.5 === i || 270 === i || 292.5 === i || 315 === i || 337.5 === i || 360 === i)) {
          // ROSE_LINE
          ctx.save();
          ctx.beginPath();
          // indent the 16 half quadrant lines a bit for visual effect
          if (i % 45) {
            ctx.moveTo(imageWidth * 0.29, 0);
          } else {
            ctx.moveTo(imageWidth * 0.38, 0);
          }
          ctx.lineTo(imageWidth * 0.1, 0);
          ctx.closePath();
          ctx.restore();
          ctx.lineWidth = 1;
          ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
          ctx.stroke();
        }
        ctx.rotate(angleStep * 2.5);
      }
    } else {
      stdFont = 0.08 * imageWidth + 'px serif';
      smlFont = imageWidth * 0.033 + 'px serif';

      ctx.rotate(angleStep * 10);

      for (i = 10; 360 >= i; i += 10) {
        // Draw the labels
        ctx.save();
        if (pointSymbolsVisible) {
          switch (i) {
            case 360:
              ctx.translate(imageWidth * 0.35, 0);
              ctx.rotate(HALF_PI);
              ctx.font = stdFont;
              ctx.fillText(pointSymbols[2], 0, 0, imageWidth);
              ctx.translate(-imageWidth * 0.35, 0);
              break;
            case 90:
              ctx.translate(imageWidth * 0.35, 0);
              ctx.rotate(HALF_PI);
              ctx.font = stdFont;
              ctx.fillText(pointSymbols[4], 0, 0, imageWidth);
              ctx.translate(-imageWidth * 0.35, 0);
              break;
            case 180:
              ctx.translate(imageWidth * 0.35, 0);
              ctx.rotate(HALF_PI);
              ctx.font = stdFont;
              ctx.fillText(pointSymbols[6], 0, 0, imageWidth);
              ctx.translate(-imageWidth * 0.35, 0);
              break;
            case 270:
              ctx.translate(imageWidth * 0.35, 0);
              ctx.rotate(HALF_PI);
              ctx.font = stdFont;
              ctx.fillText(pointSymbols[0], 0, 0, imageWidth);
              ctx.translate(-imageWidth * 0.35, 0);
              break;
            default:
              val = (i + 90) % 360;
              ctx.translate(imageWidth * 0.37, 0);
              ctx.rotate(HALF_PI);
              ctx.font = smlFont;
              ctx.fillText(('0'.substring(val >= 100) + val), 0, 0, imageWidth);
              ctx.translate(-imageWidth * 0.37, 0);
          }
        } else {
          val = (i + 90) % 360;
          ctx.translate(imageWidth * 0.37, 0);
          ctx.rotate(HALF_PI);
          ctx.font = smlFont;
          ctx.fillText(('0'.substring(val >= 100) + val), 0, 0, imageWidth);
          ctx.translate(-imageWidth * 0.37, 0);
        }
        ctx.restore();
        ctx.rotate(angleStep * 10);
      }

    }
    ctx.translate(-centerX, -centerY);
    ctx.restore();
  };

  var drawPointerImage = function(ctx) {
    ctx.save();

    switch (pointerType.type) {
      case 'type2':
        // NORTHPOINTER
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.532710, imageHeight * 0.453271);
        ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.453271, imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.5, imageHeight * 0.149532);
        ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.467289, imageHeight * 0.453271, imageWidth * 0.467289, imageHeight * 0.453271);
        ctx.bezierCurveTo(imageWidth * 0.453271, imageHeight * 0.462616, imageWidth * 0.443925, imageHeight * 0.481308, imageWidth * 0.443925, imageHeight * 0.5);
        ctx.bezierCurveTo(imageWidth * 0.443925, imageHeight * 0.5, imageWidth * 0.556074, imageHeight * 0.5, imageWidth * 0.556074, imageHeight * 0.5);
        ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.481308, imageWidth * 0.546728, imageHeight * 0.462616, imageWidth * 0.532710, imageHeight * 0.453271);
        ctx.closePath();
        var NORTHPOINTER2_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
        NORTHPOINTER2_GRADIENT.addColorStop(0, pointerColor.light.getRgbaColor());
        NORTHPOINTER2_GRADIENT.addColorStop(0.46, pointerColor.light.getRgbaColor());
        NORTHPOINTER2_GRADIENT.addColorStop(0.47, pointerColor.medium.getRgbaColor());
        NORTHPOINTER2_GRADIENT.addColorStop(1, pointerColor.medium.getRgbaColor());
        ctx.fillStyle = NORTHPOINTER2_GRADIENT;
        ctx.strokeStyle = pointerColor.dark.getRgbaColor();
        ctx.lineWidth = 1;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.fill();
        ctx.stroke();

        // SOUTHPOINTER
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.467289, imageHeight * 0.546728);
        ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.546728, imageWidth * 0.5, imageHeight * 0.850467, imageWidth * 0.5, imageHeight * 0.850467);
        ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.850467, imageWidth * 0.532710, imageHeight * 0.546728, imageWidth * 0.532710, imageHeight * 0.546728);
        ctx.bezierCurveTo(imageWidth * 0.546728, imageHeight * 0.537383, imageWidth * 0.556074, imageHeight * 0.518691, imageWidth * 0.556074, imageHeight * 0.5);
        ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.5, imageWidth * 0.443925, imageHeight * 0.5, imageWidth * 0.443925, imageHeight * 0.5);
        ctx.bezierCurveTo(imageWidth * 0.443925, imageHeight * 0.518691, imageWidth * 0.453271, imageHeight * 0.537383, imageWidth * 0.467289, imageHeight * 0.546728);
        ctx.closePath();
        var SOUTHPOINTER2_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
        SOUTHPOINTER2_GRADIENT.addColorStop(0, '#e3e5e8');
        SOUTHPOINTER2_GRADIENT.addColorStop(0.48, '#e3e5e8');
        SOUTHPOINTER2_GRADIENT.addColorStop(0.48, '#abb1b8');
        SOUTHPOINTER2_GRADIENT.addColorStop(1, '#abb1b8');
        ctx.fillStyle = SOUTHPOINTER2_GRADIENT;
        var strokeColor_SOUTHPOINTER2 = '#abb1b8';
        ctx.strokeStyle = strokeColor_SOUTHPOINTER2;
        ctx.lineWidth = 1;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.fill();
        ctx.stroke();
        break;

      case 'type3':
        // NORTHPOINTER
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.149532);
        ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.443925, imageHeight * 0.490654, imageWidth * 0.443925, imageHeight * 0.5);
        ctx.bezierCurveTo(imageWidth * 0.443925, imageHeight * 0.532710, imageWidth * 0.467289, imageHeight * 0.556074, imageWidth * 0.5, imageHeight * 0.556074);
        ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.556074, imageWidth * 0.556074, imageHeight * 0.532710, imageWidth * 0.556074, imageHeight * 0.5);
        ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.490654, imageWidth * 0.5, imageHeight * 0.149532, imageWidth * 0.5, imageHeight * 0.149532);
        ctx.closePath();
        var NORTHPOINTER3_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
        NORTHPOINTER3_GRADIENT.addColorStop(0, pointerColor.light.getRgbaColor());
        NORTHPOINTER3_GRADIENT.addColorStop(0.46, pointerColor.light.getRgbaColor());
        NORTHPOINTER3_GRADIENT.addColorStop(0.47, pointerColor.medium.getRgbaColor());
        NORTHPOINTER3_GRADIENT.addColorStop(1, pointerColor.medium.getRgbaColor());
        ctx.fillStyle = NORTHPOINTER3_GRADIENT;
        ctx.strokeStyle = pointerColor.dark.getRgbaColor();
        ctx.lineWidth = 1;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.fill();
        ctx.stroke();
        break;

      case 'type1:':
        /* falls through */
      default:
        // NORTHPOINTER
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.495327);
        ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.495327);
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.149532);
        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.495327);
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.495327);
        ctx.closePath();
        var NORTHPOINTER1_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
        NORTHPOINTER1_GRADIENT.addColorStop(0, pointerColor.light.getRgbaColor());
        NORTHPOINTER1_GRADIENT.addColorStop(0.46, pointerColor.light.getRgbaColor());
        NORTHPOINTER1_GRADIENT.addColorStop(0.47, pointerColor.medium.getRgbaColor());
        NORTHPOINTER1_GRADIENT.addColorStop(1, pointerColor.medium.getRgbaColor());
        ctx.fillStyle = NORTHPOINTER1_GRADIENT;
        ctx.strokeStyle = pointerColor.dark.getRgbaColor();
        ctx.lineWidth = 1;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.fill();
        ctx.stroke();

        // SOUTHPOINTER
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.504672);
        ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.504672);
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.850467);
        ctx.lineTo(imageWidth * 0.528037, imageHeight * 0.504672);
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.504672);
        ctx.closePath();
        var SOUTHPOINTER1_GRADIENT = ctx.createLinearGradient(0.471962 * imageWidth, 0, 0.528036 * imageWidth, 0);
        SOUTHPOINTER1_GRADIENT.addColorStop(0, '#e3e5e8');
        SOUTHPOINTER1_GRADIENT.addColorStop(0.48, '#e3e5e8');
        SOUTHPOINTER1_GRADIENT.addColorStop(0.480099, '#abb1b8');
        SOUTHPOINTER1_GRADIENT.addColorStop(1, '#abb1b8');
        ctx.fillStyle = SOUTHPOINTER1_GRADIENT;
        var strokeColor_SOUTHPOINTER = '#abb1b8';
        ctx.strokeStyle = strokeColor_SOUTHPOINTER;
        ctx.lineWidth = 1;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.fill();
        ctx.stroke();
        break;
    }
    ctx.restore();
  };

  // **************   Initialization  ********************
  // Draw all static painting code to background
  var init = function() {
    initialized = true;

    if (frameVisible) {
      drawFrame(backgroundContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
    }

    if (backgroundVisible) {
      drawBackground(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
      drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);

      if (roseVisible) {
        drawRoseImage(roseContext, centerX, centerY, imageWidth, imageHeight, backgroundColor);
      }

      drawTickmarksImage(roseContext);
    }

    drawPointerImage(pointerContext, false);

    if (foregroundVisible) {
      drawForeground(foregroundContext, foregroundType, imageWidth, imageHeight, true, knobType, knobStyle);
    }
  };

  var resetBuffers = function() {
    // Buffer for all static background painting code
    backgroundBuffer.width = size;
    backgroundBuffer.height = size;
    backgroundContext = backgroundBuffer.getContext('2d');

    // Buffer for symbols/rose painting code
    roseBuffer.width = size;
    roseBuffer.height = size;
    roseContext = roseBuffer.getContext('2d');

    // Buffer for pointer image painting code
    pointerBuffer.width = size;
    pointerBuffer.height = size;
    pointerContext = pointerBuffer.getContext('2d');

    // Buffer for static foreground painting code
    foregroundBuffer.width = size;
    foregroundBuffer.height = size;
    foregroundContext = foregroundBuffer.getContext('2d');
  };

  //************************************ Public methods **************************************
  this.setValue = function(newValue) {
    newValue = parseFloat(newValue) % 360;
    if (value !== newValue) {
      value = newValue;
      this.repaint();
    }
    return this;
  };

  this.getValue = function() {
    return value;
  };

  this.setValueAnimated = function(newValue, callback) {
    var targetValue = newValue % 360;
    var gauge = this;
    var diff;
    if (value !== targetValue) {
      if (undefined !== tween && tween.isPlaying) {
        tween.stop();
      }

      diff = getShortestAngle(value, targetValue);
      if (rotateFace) {
        tween = new Tween({}, '', Tween.regularEaseInOut, value, value + diff, 2);
      } else {
        tween = new Tween({}, '', Tween.elasticEaseOut, value, value + diff, 2);
      }
      tween.onMotionChanged = function(event) {
        value = event.target._pos % 360;
        if (!repainting) {
          repainting = true;
          requestAnimFrame(gauge.repaint);
        }
      };

      // do we have a callback function to process?
      if (callback && typeof(callback) === "function") {
        tween.onMotionFinished = callback;
      }

      tween.start();
    }
    return this;
  };

  this.setFrameDesign = function(newFrameDesign) {
    resetBuffers();
    frameDesign = newFrameDesign;
    init();
    this.repaint();
    return this;
  };

  this.setBackgroundColor = function(newBackgroundColor) {
    resetBuffers();
    backgroundColor = newBackgroundColor;
    init();
    this.repaint();
    return this;
  };

  this.setForegroundType = function(newForegroundType) {
    resetBuffers();
    foregroundType = newForegroundType;
    init();
    this.repaint();
    return this;
  };

  this.setPointerColor = function(newPointerColor) {
    resetBuffers();
    pointerColor = newPointerColor;
    init();
    this.repaint();
    return this;
  };

  this.setPointerType = function(newPointerType) {
    resetBuffers();
    pointerType = newPointerType;
    init();
    this.repaint();
    return this;
  };

  this.setPointSymbols = function(newPointSymbols) {
    resetBuffers();
    pointSymbols = newPointSymbols;
    init();
    this.repaint();
    return this;
  };

  this.repaint = function() {
    if (!initialized) {
      init();
    }

    mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
    // Define rotation center
    angle = HALF_PI + value * angleStep - HALF_PI;

    if (backgroundVisible || frameVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0);
    }

    if (rotateFace) {
      mainCtx.save();
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate(-angle);
      mainCtx.translate(-centerX, -centerY);
      if (backgroundVisible) {
        mainCtx.drawImage(roseBuffer, 0, 0);
      }
      mainCtx.restore();
    } else {
      if (backgroundVisible) {
        mainCtx.drawImage(roseBuffer, 0, 0);
      }
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate(angle);
      mainCtx.translate(-centerX, -centerY);
    }
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
    mainCtx.shadowBlur = shadowOffset * 2;
    // Draw the pointer
    mainCtx.drawImage(pointerBuffer, 0, 0);
    // Undo the translations & shadow settings
    mainCtx.restore();

    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0);
    }

    repainting = false;
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default Compass;
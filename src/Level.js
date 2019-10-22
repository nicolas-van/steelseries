import Tween from "./tween.js";
import drawFrame from "./drawFrame";
import drawBackground from "./drawBackground";
import drawForeground from "./drawForeground";
import {
createBuffer, 
requestAnimFrame, 
getCanvasContext,
HALF_PI,
TWO_PI,
PI,
RAD_FACTOR,
stdFontName,
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

var level = function(canvas, parameters) {
  parameters = parameters || {};
  var size = (undefined === parameters.size ? 0 : parameters.size),
    decimalsVisible = (undefined === parameters.decimalsVisible ? false : parameters.decimalsVisible),
    textOrientationFixed = (undefined === parameters.textOrientationFixed ? false : parameters.textOrientationFixed),
    frameDesign = (undefined === parameters.frameDesign ? FrameDesign.METAL : parameters.frameDesign),
    frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
    backgroundColor = (undefined === parameters.backgroundColor ? BackgroundColor.DARK_GRAY : parameters.backgroundColor),
    backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
    pointerColor = (undefined === parameters.pointerColor ? ColorDef.RED : parameters.pointerColor),
    foregroundType = (undefined === parameters.foregroundType ? ForegroundType.TYPE1 : parameters.foregroundType),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    rotateFace = (undefined === parameters.rotateFace ? false : parameters.rotateFace);

  // Get the canvas context and clear it
  var mainCtx = getCanvasContext(canvas);
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size;
  mainCtx.canvas.height = size;

  var tween;
  var repainting = false;

  var value = 0;
  var stepValue = 0;
  var visibleValue = 0;
  var angleStep = TWO_PI / 360;
  var angle = this.value;
  var decimals = decimalsVisible ? 1 : 0;

  var imageWidth = size;
  var imageHeight = size;

  var centerX = imageWidth / 2;
  var centerY = imageHeight / 2;

  var initialized = false;

  // **************   Buffer creation  ********************
  // Buffer for all static background painting code
  var backgroundBuffer = createBuffer(size, size);
  var backgroundContext = backgroundBuffer.getContext('2d');

  // Buffer for pointer image painting code
  var pointerBuffer = createBuffer(size, size);
  var pointerContext = pointerBuffer.getContext('2d');

  // Buffer for step pointer image painting code
  var stepPointerBuffer = createBuffer(size, size);
  var stepPointerContext = stepPointerBuffer.getContext('2d');

  // Buffer for static foreground painting code
  var foregroundBuffer = createBuffer(size, size);
  var foregroundContext = foregroundBuffer.getContext('2d');

  // **************   Image creation  ********************
  var drawTickmarksImage = function(ctx) {
    var stdFont, smlFont, i;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.translate(centerX, centerY);

    for (i = 0; 360 > i; i++) {
      ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(imageWidth * 0.38, 0);
      ctx.lineTo(imageWidth * 0.37, 0);
      ctx.closePath();
      ctx.stroke();

      if (0 === i % 5) {
        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.38, 0);
        ctx.lineTo(imageWidth * 0.36, 0);
        ctx.closePath();
        ctx.stroke();
      }

      if (0 === i % 45) {
        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.38, 0);
        ctx.lineTo(imageWidth * 0.34, 0);
        ctx.closePath();
        ctx.stroke();
      }

      // Draw the labels
      if (300 < imageWidth) {
        stdFont = '14px ' + stdFont;
        smlFont = '12px ' + stdFont;
      }
      if (300 >= imageWidth) {
        stdFont = '12px ' + stdFont;
        smlFont = '10px ' + stdFont;
      }
      if (200 >= imageWidth) {
        stdFont = '10px ' + stdFont;
        smlFont = '8px ' + stdFont;
      }
      if (100 >= imageWidth) {
        stdFont = '8px ' + stdFont;
        smlFont = '6px ' + stdFont;
      }
      ctx.save();
      switch (i) {
        case 0:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR) + HALF_PI);
          ctx.font = stdFont;
          ctx.fillText('0\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR) + HALF_PI);
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.41, 0);
          ctx.rotate((i * RAD_FACTOR) - HALF_PI);
          ctx.font = smlFont;
          ctx.fillText('0%', 0, 0, imageWidth);
          break;
        case 45:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR) + 0.25 * PI);
          ctx.font = stdFont;
          ctx.fillText('45\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR) + 0.25 * PI);
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.31, imageWidth * 0.085);
          ctx.rotate((i * RAD_FACTOR) - 0.25 * PI);
          ctx.font = smlFont;
          ctx.fillText('100%', 0, 0, imageWidth);
          break;
        case 90:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR));
          ctx.font = stdFont;
          ctx.fillText('90\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR));
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.21, 0);
          ctx.rotate((i * RAD_FACTOR));
          ctx.font = smlFont;
          ctx.fillText('\u221E', 0, 0, imageWidth);
          break;
        case 135:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR) - 0.25 * PI);
          ctx.font = stdFont;
          ctx.fillText('45\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR) - 0.25 * PI);
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.31, -imageWidth * 0.085);
          ctx.rotate((i * RAD_FACTOR) + 0.25 * PI);
          ctx.font = smlFont;
          ctx.fillText('100%', 0, 0, imageWidth);
          break;
        case 180:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR) - HALF_PI);
          ctx.font = stdFont;
          ctx.fillText('0\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR) - HALF_PI);
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.41, 0);
          ctx.rotate((i * RAD_FACTOR) + HALF_PI);
          ctx.font = smlFont;
          ctx.fillText('0%', 0, 0, imageWidth);
          ctx.translate(-imageWidth * 0.41, 0);
          break;
        case 225:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR) - 0.75 * PI);
          ctx.font = stdFont;
          ctx.fillText('45\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR) - 0.75 * PI);
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.31, imageWidth * 0.085);
          ctx.rotate((i * RAD_FACTOR) + 0.75 * PI);
          ctx.font = smlFont;
          ctx.fillText('100%', 0, 0, imageWidth);
          break;
        case 270:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR) - PI);
          ctx.font = stdFont;
          ctx.fillText('90\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR) - PI);
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.21, 0);
          ctx.rotate((i * RAD_FACTOR) - PI);
          ctx.font = smlFont;
          ctx.fillText('\u221E', 0, 0, imageWidth);
          break;
        case 315:
          ctx.translate(imageWidth * 0.31, 0);
          ctx.rotate((i * RAD_FACTOR) - 1.25 * PI);
          ctx.font = stdFont;
          ctx.fillText('45\u00B0', 0, 0, imageWidth);
          ctx.rotate(-(i * RAD_FACTOR) - 1.25 * PI);
          ctx.translate(-imageWidth * 0.31, 0);

          ctx.translate(imageWidth * 0.31, -imageWidth * 0.085);
          ctx.rotate((i * RAD_FACTOR) + 1.25 * PI);
          ctx.font = smlFont;
          ctx.fillText('100%', 0, 0, imageWidth);
          break;
      }
      ctx.restore();

      ctx.rotate(angleStep);
    }
    ctx.translate(-centerX, -centerY);
    ctx.restore();
  };

  var drawMarkerImage = function(ctx) {
    ctx.save();

    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();

    // FRAMELEFT
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.200934, imageHeight * 0.434579);
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.434579);
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.560747);
    ctx.lineTo(imageWidth * 0.200934, imageHeight * 0.560747);
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();

    // TRIANGLELEFT
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.163551, imageHeight * 0.471962);
    ctx.lineTo(imageWidth * 0.205607, imageHeight * 0.5);
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.523364);
    ctx.lineTo(imageWidth * 0.163551, imageHeight * 0.471962);
    ctx.closePath();
    ctx.fill();

    // FRAMERIGHT
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.799065, imageHeight * 0.434579);
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.434579);
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.560747);
    ctx.lineTo(imageWidth * 0.799065, imageHeight * 0.560747);
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();

    // TRIANGLERIGHT
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.836448, imageHeight * 0.471962);
    ctx.lineTo(imageWidth * 0.794392, imageHeight * 0.5);
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.523364);
    ctx.lineTo(imageWidth * 0.836448, imageHeight * 0.471962);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  var drawPointerImage = function(ctx) {
    ctx.save();

    // POINTER_LEVEL
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.350467);
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.130841);
    ctx.lineTo(imageWidth * 0.476635, imageHeight * 0.350467);
    ctx.bezierCurveTo(imageWidth * 0.476635, imageHeight * 0.350467, imageWidth * 0.490654, imageHeight * 0.345794, imageWidth * 0.5, imageHeight * 0.345794);
    ctx.bezierCurveTo(imageWidth * 0.509345, imageHeight * 0.345794, imageWidth * 0.523364, imageHeight * 0.350467, imageWidth * 0.523364, imageHeight * 0.350467);
    ctx.closePath();
    var POINTER_LEVEL_GRADIENT = ctx.createLinearGradient(0, 0.154205 * imageHeight, 0, 0.350466 * imageHeight);
    var tmpDarkColor = pointerColor.dark;
    var tmpLightColor = pointerColor.light;
    tmpDarkColor.setAlpha(0.70588);
    tmpLightColor.setAlpha(0.70588);
    POINTER_LEVEL_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor());
    POINTER_LEVEL_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor());
    POINTER_LEVEL_GRADIENT.addColorStop(0.59, tmpLightColor.getRgbaColor());
    POINTER_LEVEL_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor());
    ctx.fillStyle = POINTER_LEVEL_GRADIENT;
    var strokeColor_POINTER_LEVEL = pointerColor.light.getRgbaColor();
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = strokeColor_POINTER_LEVEL;
    ctx.fill();
    ctx.stroke();

    tmpDarkColor.setAlpha(1);
    tmpLightColor.setAlpha(1);

    ctx.restore();
  };

  var drawStepPointerImage = function(ctx) {
    ctx.save();

    var tmpDarkColor = pointerColor.dark;
    var tmpLightColor = pointerColor.light;
    tmpDarkColor.setAlpha(0.70588);
    tmpLightColor.setAlpha(0.70588);

    // POINTER_LEVEL_LEFT
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.285046, imageHeight * 0.514018);
    ctx.lineTo(imageWidth * 0.210280, imageHeight * 0.5);
    ctx.lineTo(imageWidth * 0.285046, imageHeight * 0.481308);
    ctx.bezierCurveTo(imageWidth * 0.285046, imageHeight * 0.481308, imageWidth * 0.280373, imageHeight * 0.490654, imageWidth * 0.280373, imageHeight * 0.495327);
    ctx.bezierCurveTo(imageWidth * 0.280373, imageHeight * 0.504672, imageWidth * 0.285046, imageHeight * 0.514018, imageWidth * 0.285046, imageHeight * 0.514018);
    ctx.closePath();
    var POINTER_LEVEL_LEFT_GRADIENT = ctx.createLinearGradient(0.224299 * imageWidth, 0, 0.289719 * imageWidth, 0);
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor());
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor());
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(0.59, tmpLightColor.getRgbaColor());
    POINTER_LEVEL_LEFT_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor());
    ctx.fillStyle = POINTER_LEVEL_LEFT_GRADIENT;
    var strokeColor_POINTER_LEVEL_LEFT = pointerColor.light.getRgbaColor();
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = strokeColor_POINTER_LEVEL_LEFT;
    ctx.fill();
    ctx.stroke();

    // POINTER_LEVEL_RIGHT
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.714953, imageHeight * 0.514018);
    ctx.lineTo(imageWidth * 0.789719, imageHeight * 0.5);
    ctx.lineTo(imageWidth * 0.714953, imageHeight * 0.481308);
    ctx.bezierCurveTo(imageWidth * 0.714953, imageHeight * 0.481308, imageWidth * 0.719626, imageHeight * 0.490654, imageWidth * 0.719626, imageHeight * 0.495327);
    ctx.bezierCurveTo(imageWidth * 0.719626, imageHeight * 0.504672, imageWidth * 0.714953, imageHeight * 0.514018, imageWidth * 0.714953, imageHeight * 0.514018);
    ctx.closePath();
    var POINTER_LEVEL_RIGHT_GRADIENT = ctx.createLinearGradient(0.775700 * imageWidth, 0, 0.71028 * imageWidth, 0);
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(0, tmpDarkColor.getRgbaColor());
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(0.3, tmpLightColor.getRgbaColor());
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(0.59, tmpLightColor.getRgbaColor());
    POINTER_LEVEL_RIGHT_GRADIENT.addColorStop(1, tmpDarkColor.getRgbaColor());
    ctx.fillStyle = POINTER_LEVEL_RIGHT_GRADIENT;
    var strokeColor_POINTER_LEVEL_RIGHT = pointerColor.light.getRgbaColor();
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = strokeColor_POINTER_LEVEL_RIGHT;
    ctx.fill();
    ctx.stroke();

    tmpDarkColor.setAlpha(1);
    tmpLightColor.setAlpha(1);

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
      drawTickmarksImage(backgroundContext);
    }

    drawMarkerImage(pointerContext);

    drawPointerImage(pointerContext);

    drawStepPointerImage(stepPointerContext);

    if (foregroundVisible) {
      drawForeground(foregroundContext, foregroundType, imageWidth, imageHeight, false);
    }
  };

  var resetBuffers = function() {
    backgroundBuffer.width = size;
    backgroundBuffer.height = size;
    backgroundContext = backgroundBuffer.getContext('2d');

    // Buffer for pointer image painting code
    pointerBuffer.width = size;
    pointerBuffer.height = size;
    pointerContext = pointerBuffer.getContext('2d');

    // Buffer for step pointer image painting code
    stepPointerBuffer.width = size;
    stepPointerBuffer.height = size;
    stepPointerContext = stepPointerBuffer.getContext('2d');

    // Buffer for static foreground painting code
    foregroundBuffer.width = size;
    foregroundBuffer.height = size;
    foregroundContext = foregroundBuffer.getContext('2d');
  };

  //************************************ Public methods **************************************
  this.setValue = function(newValue) {
    var targetValue;
    newValue = parseFloat(newValue);
    targetValue = 0 > newValue ? (360 + newValue) : newValue;
    targetValue = 359.9 < newValue ? (newValue - 360) : newValue;

    if (value !== targetValue) {
      value = targetValue;
      stepValue = 2 * ((Math.abs(value) * 10) % 10);
      if (10 < stepValue) {
        stepValue -= 20;
      }

      if (0 === value) {
        visibleValue = 90;
      }

      if (0 < value && 90 >= value) {
        visibleValue = (90 - value);
      }

      if (90 < value && 180 >= value) {
        visibleValue = (value - 90);
      }

      if (180 < value && 270 >= value) {
        visibleValue = (270 - value);
      }

      if (270 < value && 360 >= value) {
        visibleValue = (value - 270);
      }

      if (0 > value && value >= -90) {
        visibleValue = (90 - Math.abs(value));
      }

      if (value < -90 && value >= -180) {
        visibleValue = Math.abs(value) - 90;
      }

      if (value < -180 && value >= -270) {
        visibleValue = 270 - Math.abs(value);
      }

      if (value < -270 && value >= -360) {
        visibleValue = Math.abs(value) - 270;
      }

      this.repaint();
    }
    return this;
  };

  this.getValue = function() {
    return value;
  };

  this.setValueAnimated = function(newValue, callback) {
    newValue = parseFloat(newValue);
    if (360 - newValue + value < newValue - value) {
      newValue = 360 - newValue;
    }
    if (value !== newValue) {
      if (undefined !== tween && tween.isPlaying) {
        tween.stop();
      }

      //tween = new Tween(new Object(),'',Tween.elasticEaseOut,this.value,targetValue, 1);
      tween = new Tween({}, '', Tween.regularEaseInOut, value, newValue, 1);
      //tween = new Tween(new Object(), '', Tween.strongEaseInOut, this.value, targetValue, 1);

      var gauge = this;

      tween.onMotionChanged = function(event) {
        value = event.target._pos;
        stepValue = 2 * ((Math.abs(value) * 10) % 10);
        if (10 < stepValue) {
          stepValue -= 20;
        }

        if (0 === value) {
          visibleValue = 90;
        }

        if (0 < value && 90 >= value) {
          visibleValue = (90 - value);
        }

        if (90 < value && 180 >= value) {
          visibleValue = (value - 90);
        }

        if (180 < value && 270 >= value) {
          visibleValue = (270 - value);
        }

        if (270 < value && 360 >= value) {
          visibleValue = (value - 270);
        }

        if (0 > value && value >= -90) {
          visibleValue = (90 - Math.abs(value));
        }

        if (value < -90 && value >= -180) {
          visibleValue = Math.abs(value) - 90;
        }

        if (value < -180 && value >= -270) {
          visibleValue = 270 - Math.abs(value);
        }

        if (value < -270 && value >= -360) {
          visibleValue = Math.abs(value) - 270;
        }

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

  this.repaint = function() {
    if (!initialized) {
      init();
    }

    mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    angle = HALF_PI + value * angleStep - HALF_PI;
    if (rotateFace) {
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate(-angle);
      mainCtx.translate(-centerX, -centerY);
    }
    // Draw buffered image to visible canvas
    if (frameVisible || backgroundVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0);
    }

    mainCtx.save();
    // Define rotation center
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate(angle);

    // Draw pointer
    mainCtx.translate(-centerX, -centerY);
    mainCtx.drawImage(pointerBuffer, 0, 0);

    mainCtx.fillStyle = backgroundColor.labelColor.getRgbaColor();
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';

    if (textOrientationFixed) {
      mainCtx.restore();
      if (decimalsVisible) {
        mainCtx.font = imageWidth * 0.1 + 'px ' + stdFontName;
      } else {
        mainCtx.font = imageWidth * 0.15 + 'px ' + stdFontName;
      }
      mainCtx.fillText(visibleValue.toFixed(decimals) + '\u00B0', centerX, centerY, imageWidth * 0.35);
    } else {
      if (decimalsVisible) {
        mainCtx.font = imageWidth * 0.15 + 'px ' + stdFontName;
      } else {
        mainCtx.font = imageWidth * 0.2 + 'px ' + stdFontName;
      }
      mainCtx.fillText(visibleValue.toFixed(decimals) + '\u00B0', centerX, centerY, imageWidth * 0.35);
      mainCtx.restore();
    }

    mainCtx.translate(centerX, centerY);
    mainCtx.rotate(angle + stepValue * RAD_FACTOR);
    mainCtx.translate(-centerX, -centerY);
    mainCtx.drawImage(stepPointerBuffer, 0, 0);
    mainCtx.restore();

    // Draw foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0);
    }

    mainCtx.restore();

    repainting = false;
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default level;

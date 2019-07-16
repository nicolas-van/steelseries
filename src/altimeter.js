import Tween from "./tween.js";
import drawRadialFrameImage from "./drawRadialFrameImage";
import drawRadialBackgroundImage from "./drawRadialBackgroundImage";
import drawRadialCustomImage from "./drawRadialCustomImage";
import drawRadialForegroundImage from "./drawRadialForegroundImage";
import createLcdBackgroundImage from "./createLcdBackgroundImage";
import drawTitleImage from "./drawTitleImage";
import {
createBuffer,
requestAnimFrame, 
getCanvasContext,
TWO_PI,
PI,
lcdFontName,
stdFontName,
} from "./tools";


var altimeter = function(canvas, parameters) {
  parameters = parameters || {};
  // parameters
  var size = (undefined === parameters.size ? 0 : parameters.size),
    frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
    frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
    backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
    backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
    titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
    unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
    unitAltPos = (undefined === parameters.unitAltPos ? false : true),
    knobType = (undefined === parameters.knobType ? steelseries.KnobType.METAL_KNOB : parameters.knobType),
    knobStyle = (undefined === parameters.knobStyle ? steelseries.KnobStyle.BLACK : parameters.knobStyle),
    lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.BLACK : parameters.lcdColor),
    lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
    digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
    foregroundType = (undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
    //
    minValue = 0,
    maxValue = 10,
    value = minValue,
    value100 = 0,
    value1000 = 0,
    value10000 = 0,
    angleStep100ft, angleStep1000ft, angleStep10000ft,
    tickLabelPeriod = 1, // Draw value at every 10th tickmark
    tween,
    repainting = false,
    imageWidth, imageHeight,
    centerX, centerY,
    stdFont,
    mainCtx = getCanvasContext(canvas), // Get the canvas context
    // Constants
    TICKMARK_OFFSET = PI,
    //
    initialized = false,
    // **************   Buffer creation  ********************
    // Buffer for the frame
    frameBuffer = createBuffer(size, size),
    frameContext = frameBuffer.getContext('2d'),
    // Buffer for the background
    backgroundBuffer = createBuffer(size, size),
    backgroundContext = backgroundBuffer.getContext('2d'),

    lcdBuffer,

    // Buffer for 10000ft pointer image painting code
    pointer10000Buffer = createBuffer(size, size),
    pointer10000Context = pointer10000Buffer.getContext('2d'),

    // Buffer for 1000ft pointer image painting code
    pointer1000Buffer = createBuffer(size, size),
    pointer1000Context = pointer1000Buffer.getContext('2d'),

    // Buffer for 100ft pointer image painting code
    pointer100Buffer = createBuffer(size, size),
    pointer100Context = pointer100Buffer.getContext('2d'),

    // Buffer for static foreground painting code
    foregroundBuffer = createBuffer(size, size),
    foregroundContext = foregroundBuffer.getContext('2d');
  // End of variables

  // Get the canvas context and clear it
  mainCtx.save();
  // Has a size been specified?
  size = (size === 0 ? Math.min(mainCtx.canvas.width, mainCtx.canvas.height) : size);

  // Set the size
  mainCtx.canvas.width = size;
  mainCtx.canvas.height = size;

  imageWidth = size;
  imageHeight = size;

  centerX = imageWidth / 2;
  centerY = imageHeight / 2;

  var unitStringPosY = unitAltPos ? imageHeight * 0.68 : false;


  stdFont = Math.floor(imageWidth * 0.09) + 'px ' + stdFontName;

  // **************   Image creation  ********************
  var drawLcdText = function(value) {
    mainCtx.save();
    mainCtx.textAlign = 'right';
    mainCtx.textBaseline = 'middle';
    mainCtx.strokeStyle = lcdColor.textColor;
    mainCtx.fillStyle = lcdColor.textColor;

    if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
      mainCtx.shadowColor = 'gray';
      mainCtx.shadowOffsetX = imageWidth * 0.007;
      mainCtx.shadowOffsetY = imageWidth * 0.007;
      mainCtx.shadowBlur = imageWidth * 0.009;
    }
    if (digitalFont) {
      mainCtx.font = Math.floor(imageWidth * 0.075) + 'px ' + lcdFontName;
    } else {
      mainCtx.font = Math.floor(imageWidth * 0.075) + 'px bold ' + stdFontName;
    }
    mainCtx.fillText(Math.round(value), (imageWidth + (imageWidth * 0.4)) / 2 - 4, imageWidth * 0.607, imageWidth * 0.4);
    mainCtx.restore();
  };

  var drawTickmarksImage = function(ctx, freeAreaAngle, offset, minVal, maxVal, angleStep) {
    var MEDIUM_STROKE = Math.max(imageWidth * 0.012, 2),
      THIN_STROKE = Math.max(imageWidth * 0.007, 1.5),
      TEXT_DISTANCE = imageWidth * 0.13,
      MED_LENGTH = imageWidth * 0.05,
      MAX_LENGTH = imageWidth * 0.07,
      RADIUS = imageWidth * 0.4,
      counter = 0,
      tickCounter = 0,
      sinValue = 0,
      cosValue = 0,
      alpha, // angle for tickmarks
      valueCounter, // value for tickmarks
      ALPHA_START = -offset - (freeAreaAngle / 2);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = stdFont;
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();

    for (alpha = ALPHA_START, valueCounter = 0; valueCounter <= 10; alpha -= angleStep * 0.1, valueCounter += 0.1) {
      sinValue = Math.sin(alpha);
      cosValue = Math.cos(alpha);

      // tickmark every 2 units
      if (counter % 2 === 0) {
        ctx.lineWidth = THIN_STROKE;
        // Draw ticks
        ctx.beginPath();
        ctx.moveTo(centerX + (RADIUS - MED_LENGTH) * sinValue, centerY + (RADIUS - MED_LENGTH) * cosValue);
        ctx.lineTo(centerX + RADIUS * sinValue, centerY + RADIUS * cosValue);
        ctx.closePath();
        ctx.stroke();
      }

      // Different tickmark every 10 units
      if (counter === 10 || counter === 0) {
        ctx.lineWidth = MEDIUM_STROKE;

        // if gauge is full circle, avoid painting maxValue over minValue
        if (freeAreaAngle === 0) {
          if (Math.round(valueCounter) !== maxValue) {
            ctx.fillText(Math.round(valueCounter).toString(), centerX + (RADIUS - TEXT_DISTANCE) * sinValue, centerY + (RADIUS - TEXT_DISTANCE) * cosValue);
          }
        }
        counter = 0;
        tickCounter++;

        // Draw ticks
        ctx.beginPath();
        ctx.moveTo(centerX + (RADIUS - MAX_LENGTH) * sinValue, centerY + (RADIUS - MAX_LENGTH) * cosValue);
        ctx.lineTo(centerX + RADIUS * sinValue, centerY + RADIUS * cosValue);
        ctx.closePath();
        ctx.stroke();
      }
      counter++;
    }
    ctx.restore();
  };

  var draw100ftPointer = function(ctx, shadow) {
    var grad;

    if (shadow) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    } else {
      grad = ctx.createLinearGradient(0, imageHeight * 0.168224, 0, imageHeight * 0.626168);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.31, '#ffffff');
      grad.addColorStop(0.3101, '#ffffff');
      grad.addColorStop(0.32, '#202020');
      grad.addColorStop(1, '#202020');
      ctx.fillStyle = grad;
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962);
    ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.471962, imageWidth * 0.509345, imageHeight * 0.467289, imageWidth * 0.509345, imageHeight * 0.467289);
    ctx.lineTo(imageWidth * 0.509345, imageHeight * 0.200934);
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.168224);
    ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.200934);
    ctx.lineTo(imageWidth * 0.490654, imageHeight * 0.467289);
    ctx.bezierCurveTo(imageWidth * 0.490654, imageHeight * 0.467289, imageWidth * 0.481308, imageHeight * 0.471962, imageWidth * 0.481308, imageHeight * 0.471962);
    ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.467289, imageHeight * 0.490654, imageWidth * 0.467289, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.514018, imageWidth * 0.476635, imageHeight * 0.528037, imageWidth * 0.490654, imageHeight * 0.532710);
    ctx.bezierCurveTo(imageWidth * 0.490654, imageHeight * 0.532710, imageWidth * 0.490654, imageHeight * 0.579439, imageWidth * 0.490654, imageHeight * 0.588785);
    ctx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.593457, imageWidth * 0.481308, imageHeight * 0.598130, imageWidth * 0.481308, imageHeight * 0.607476);
    ctx.bezierCurveTo(imageWidth * 0.481308, imageHeight * 0.616822, imageWidth * 0.490654, imageHeight * 0.626168, imageWidth * 0.5, imageHeight * 0.626168);
    ctx.bezierCurveTo(imageWidth * 0.509345, imageHeight * 0.626168, imageWidth * 0.518691, imageHeight * 0.616822, imageWidth * 0.518691, imageHeight * 0.607476);
    ctx.bezierCurveTo(imageWidth * 0.518691, imageHeight * 0.598130, imageWidth * 0.514018, imageHeight * 0.593457, imageWidth * 0.504672, imageHeight * 0.588785);
    ctx.bezierCurveTo(imageWidth * 0.504672, imageHeight * 0.579439, imageWidth * 0.504672, imageHeight * 0.532710, imageWidth * 0.509345, imageHeight * 0.532710);
    ctx.bezierCurveTo(imageWidth * 0.523364, imageHeight * 0.528037, imageWidth * 0.532710, imageHeight * 0.514018, imageWidth * 0.532710, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.490654, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.518691, imageHeight * 0.471962);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  var draw1000ftPointer = function(ctx) {
    var grad;

    grad = ctx.createLinearGradient(0, imageHeight * 0.401869, 0, imageHeight * 0.616822);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.51, '#ffffff');
    grad.addColorStop(0.52, '#ffffff');
    grad.addColorStop(0.5201, '#202020');
    grad.addColorStop(0.53, '#202020');
    grad.addColorStop(1, '#202020');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962);
    ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.462616, imageWidth * 0.528037, imageHeight * 0.401869, imageWidth * 0.528037, imageHeight * 0.401869);
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.331775);
    ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.401869);
    ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.401869, imageWidth * 0.485981, imageHeight * 0.462616, imageWidth * 0.481308, imageHeight * 0.471962);
    ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.467289, imageHeight * 0.490654, imageWidth * 0.467289, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.514018, imageWidth * 0.476635, imageHeight * 0.528037, imageWidth * 0.490654, imageHeight * 0.532710);
    ctx.bezierCurveTo(imageWidth * 0.490654, imageHeight * 0.532710, imageWidth * 0.462616, imageHeight * 0.574766, imageWidth * 0.462616, imageHeight * 0.593457);
    ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.616822, imageWidth * 0.5, imageHeight * 0.612149, imageWidth * 0.5, imageHeight * 0.612149);
    ctx.bezierCurveTo(imageWidth * 0.5, imageHeight * 0.612149, imageWidth * 0.532710, imageHeight * 0.616822, imageWidth * 0.537383, imageHeight * 0.593457);
    ctx.bezierCurveTo(imageWidth * 0.537383, imageHeight * 0.574766, imageWidth * 0.509345, imageHeight * 0.532710, imageWidth * 0.509345, imageHeight * 0.532710);
    ctx.bezierCurveTo(imageWidth * 0.523364, imageHeight * 0.528037, imageWidth * 0.532710, imageHeight * 0.514018, imageWidth * 0.532710, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.490654, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.518691, imageHeight * 0.471962);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  var draw10000ftPointer = function(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.518691, imageHeight * 0.471962);
    ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.471962, imageWidth * 0.514018, imageHeight * 0.467289, imageWidth * 0.514018, imageHeight * 0.467289);
    ctx.lineTo(imageWidth * 0.514018, imageHeight * 0.317757);
    ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.303738);
    ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.182242);
    ctx.lineTo(imageWidth * 0.532710, imageHeight * 0.116822);
    ctx.lineTo(imageWidth * 0.462616, imageHeight * 0.116822);
    ctx.lineTo(imageWidth * 0.495327, imageHeight * 0.182242);
    ctx.lineTo(imageWidth * 0.495327, imageHeight * 0.299065);
    ctx.lineTo(imageWidth * 0.485981, imageHeight * 0.317757);
    ctx.lineTo(imageWidth * 0.485981, imageHeight * 0.467289);
    ctx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.467289, imageWidth * 0.485981, imageHeight * 0.471962, imageWidth * 0.481308, imageHeight * 0.471962);
    ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.467289, imageHeight * 0.490654, imageWidth * 0.467289, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.518691, imageWidth * 0.481308, imageHeight * 0.532710, imageWidth * 0.5, imageHeight * 0.532710);
    ctx.bezierCurveTo(imageWidth * 0.518691, imageHeight * 0.532710, imageWidth * 0.532710, imageHeight * 0.518691, imageWidth * 0.532710, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.490654, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.518691, imageHeight * 0.471962);
    ctx.closePath();
    ctx.fill();
  };

  function calcAngleStep() {
    angleStep100ft = (TWO_PI) / (maxValue - minValue);
    angleStep1000ft = angleStep100ft / 10;
    angleStep10000ft = angleStep1000ft / 10;
  }

  function calcValues() {
    value100 = (value % 1000) / 100;
    value1000 = (value % 10000) / 100;
    value10000 = (value % 100000) / 100;
  }

  // **************   Initialization  ********************
  // Draw all static painting code to background
  var init = function(parameters) {
    parameters = parameters || {};
    // Parameters
    var drawFrame = (undefined === parameters.frame ? false : parameters.frame),
      drawBackground = (undefined === parameters.background ? false : parameters.background),
      drawPointers = (undefined === parameters.pointers ? false : parameters.pointers),
      drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);

    initialized = true;

    calcAngleStep();

    // Create frame in frame buffer (backgroundBuffer)
    if (drawFrame && frameVisible) {
      drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
    }

    if (drawBackground && backgroundVisible) {
      // Create background in background buffer (backgroundBuffer)
      drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);

      // Create custom layer in background buffer (backgroundBuffer)
      drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);

      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, 0, TICKMARK_OFFSET, 0, 10, angleStep100ft, tickLabelPeriod, 0, true, true, null);

      // Create title in background buffer (backgroundBuffer)
      drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, true, true, unitStringPosY);
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground && lcdVisible) {
      lcdBuffer = createLcdBackgroundImage(imageWidth * 0.4, imageHeight * 0.09, lcdColor);
      backgroundContext.drawImage(lcdBuffer, (imageWidth - (imageWidth * 0.4)) / 2, imageHeight * 0.56);
    }

    if (drawPointers) {
      // Create 100ft pointer in buffer
      draw100ftPointer(pointer100Context, false);
      // Create 1000ft pointer in buffer
      draw1000ftPointer(pointer1000Context, false);
      // Create 10000ft pointer in buffer
      draw10000ftPointer(pointer10000Context, false);
    }

    if (drawForeground && foregroundVisible) {
      drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, true, knobType, knobStyle);
    }
  };

  var resetBuffers = function(buffers) {
    buffers = buffers || {};
    var resetFrame = (undefined === buffers.frame ? false : buffers.frame),
      resetBackground = (undefined === buffers.background ? false : buffers.background),
      resetPointers = (undefined === buffers.pointers ? false : buffers.pointers),
      resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);

    if (resetFrame) {
      frameBuffer.width = size;
      frameBuffer.height = size;
      frameContext = frameBuffer.getContext('2d');
    }

    if (resetBackground) {
      backgroundBuffer.width = size;
      backgroundBuffer.height = size;
      backgroundContext = backgroundBuffer.getContext('2d');
    }

    if (resetPointers) {
      pointer100Buffer.width = size;
      pointer100Buffer.height = size;
      pointer100Context = pointer100Buffer.getContext('2d');

      pointer1000Buffer.width = size;
      pointer1000Buffer.height = size;
      pointer1000Context = pointer1000Buffer.getContext('2d');

      pointer10000Buffer.width = size;
      pointer10000Buffer.height = size;
      pointer10000Context = pointer10000Buffer.getContext('2d');
    }

    if (resetForeground) {
      foregroundBuffer.width = size;
      foregroundBuffer.height = size;
      foregroundContext = foregroundBuffer.getContext('2d');
    }
  };

  //************************************ Public methods **************************************
  this.setValue = function(newValue) {
    value = parseFloat(newValue);
    this.repaint();
  };

  this.getValue = function() {
    return value;
  };

  this.setValueAnimated = function(newValue, callback) {
    newValue = parseFloat(newValue);
    var targetValue = (newValue < minValue ? minValue : newValue),
      gauge = this,
      time;

    if (value !== targetValue) {
      if (undefined !== tween && tween.isPlaying) {
        tween.stop();
      }
      // Allow 5 secs per 10,000ft
      time = Math.max(Math.abs(value - targetValue) / 10000 * 5, 1);
      tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
      //tween = new Tween(new Object(), '', Tween.strongEaseInOut, value, targetValue, 1);
      tween.onMotionChanged = function(event) {
        value = event.target._pos;
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
    resetBuffers({
      frame: true
    });
    frameDesign = newFrameDesign;
    init({
      frame: true
    });
    this.repaint();
    return this;
  };

  this.setBackgroundColor = function(newBackgroundColor) {
    resetBuffers({
      background: true,
      pointer: true // type2 & 13 depend on background
    });
    backgroundColor = newBackgroundColor;
    init({
      background: true, // type2 & 13 depend on background
      pointer: true
    });
    this.repaint();
    return this;
  };

  this.setForegroundType = function(newForegroundType) {
    resetBuffers({
      foreground: true
    });
    foregroundType = newForegroundType;
    init({
      foreground: true
    });
    this.repaint();
    return this;
  };

  this.setLcdColor = function(newLcdColor) {
    lcdColor = newLcdColor;
    resetBuffers({
      background: true
    });
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.setTitleString = function(title) {
    titleString = title;
    resetBuffers({
      background: true
    });
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.setUnitString = function(unit) {
    unitString = unit;
    resetBuffers({
      background: true
    });
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.repaint = function() {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        pointers: true,
        foreground: true
      });
    }

    //mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0);
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0);

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(value);
    }

    // re-calculate the spearate pointer values
    calcValues();

    var shadowOffset = imageWidth * 0.006 * 0.5;

    mainCtx.save();
    //Draw 10000ft pointer
    // Define rotation center
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate((value10000 - minValue) * angleStep10000ft);
    mainCtx.translate(-centerX, -centerY);
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
    mainCtx.shadowBlur = shadowOffset * 2;
    // Draw the pointer
    mainCtx.drawImage(pointer10000Buffer, 0, 0);

    shadowOffset = imageWidth * 0.006 * 0.75;
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;

    //Draw 1000ft pointer
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate((value1000 - minValue) * angleStep1000ft - (value10000 - minValue) * angleStep10000ft);
    mainCtx.translate(-centerX, -centerY);
    mainCtx.drawImage(pointer1000Buffer, 0, 0);

    shadowOffset = imageWidth * 0.006;
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;

    //Draw 100ft pointer
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate((value100 - minValue) * angleStep100ft - (value1000 - minValue) * angleStep1000ft);
    mainCtx.translate(-centerX, -centerY);
    mainCtx.drawImage(pointer100Buffer, 0, 0);
    mainCtx.restore();

    //Draw the foregound
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0);
    }

    repainting = false;
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default altimeter;
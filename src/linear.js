import Tween from "./tween.js";
import drawLinearBackgroundImage from "./drawLinearBackgroundImage";
import drawLinearForegroundImage from "./drawLinearForegroundImage";
import drawLinearFrameImage from "./drawLinearFrameImage";
import createLedImage from "./createLedImage";
import createLcdBackgroundImage from "./createLcdBackgroundImage";
import createMeasuredValueImage from "./createMeasuredValueImage";
import drawTitleImage from "./drawTitleImage";
import {
calcNiceNumber, 
createBuffer, 
requestAnimFrame, 
getCanvasContext,
HALF_PI,
doc,
lcdFontName,
stdFontName,
} from "./tools";

var linear = function(canvas, parameters) {
  parameters = parameters || {};
  var gaugeType = (undefined === parameters.gaugeType ? steelseries.GaugeType.TYPE1 : parameters.gaugeType),
    width = (undefined === parameters.width ? 0 : parameters.width),
    height = (undefined === parameters.height ? 0 : parameters.height),
    minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
    maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
    niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
    threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue : parameters.threshold),
    titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
    unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
    frameDesign = (undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign),
    frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
    backgroundColor = (undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor),
    backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
    valueColor = (undefined === parameters.valueColor ? steelseries.ColorDef.RED : parameters.valueColor),
    lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
    lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
    lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
    digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
    ledColor = (undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor),
    ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
    thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
    thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
    minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
    maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
    labelNumberFormat = (undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
    alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
    fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);

  // Get the canvas context and clear it
  var mainCtx = getCanvasContext(canvas);
  // Has a size been specified?
  if (width === 0) {
    width = mainCtx.canvas.width;
  }
  if (height === 0) {
    height = mainCtx.canvas.height;
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = width;
  mainCtx.canvas.height = height;

  var imageWidth = width;
  var imageHeight = height;

  // Create audio tag for alarm sound
  if (playAlarm && alarmSound !== false) {
    var audioElement = doc.createElement('audio');
    audioElement.setAttribute('src', alarmSound);
    //audioElement.setAttribute('src', 'js/alarm.mp3');
    audioElement.setAttribute('preload', 'auto');
  }

  var self = this;
  var value = minValue;

  // Properties
  var minMeasuredValue = maxValue;
  var maxMeasuredValue = minValue;

  // Check gaugeType is 1 or 2
  if (gaugeType.type !== 'type1' && gaugeType.type !== 'type2') {
    gaugeType = steelseries.GaugeType.TYPE1;
  }

  var tween;
  var ledBlinking = false;
  var repainting = false;

  var ledTimerId = 0;

  var vertical = width <= height;

  // Constants
  var ledPosX;
  var ledPosY;
  var ledSize = Math.round((vertical ? height : width) * 0.05);
  var minMaxIndSize = Math.round((vertical ? width : height) * 0.05);
  var stdFont;
  var lcdFont;

  // Misc
  if (vertical) {
    ledPosX = imageWidth / 2 - ledSize / 2;
    ledPosY = (gaugeType.type === 'type1' ? 0.053 : 0.038) * imageHeight;
    stdFont = Math.floor(imageHeight / 22) + 'px ' + stdFontName;
    lcdFont = Math.floor(imageHeight / 22) + 'px ' + lcdFontName;
  } else {
    ledPosX = 0.89 * imageWidth;
    ledPosY = imageHeight / 2 - ledSize / 2;
    stdFont = Math.floor(imageHeight / 10) + 'px ' + stdFontName;
    lcdFont = Math.floor(imageHeight / 10) + 'px ' + lcdFontName;
  }

  var initialized = false;

  // Tickmark specific private variables
  var niceMinValue = minValue;
  var niceMaxValue = maxValue;
  var niceRange = maxValue - minValue;
  var range = niceMaxValue - niceMinValue;
  var minorTickSpacing = 0;
  var majorTickSpacing = 0;
  var maxNoOfMinorTicks = 10;
  var maxNoOfMajorTicks = 10;

  // Method to calculate nice values for min, max and range for the tickmarks
  var calculate = function calculate() {
    if (niceScale) {
      niceRange = calcNiceNumber(maxValue - minValue, false);
      majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
      niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
      niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
      minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
      minValue = niceMinValue;
      maxValue = niceMaxValue;
      range = maxValue - minValue;
    } else {
      niceRange = (maxValue - minValue);
      niceMinValue = minValue;
      niceMaxValue = maxValue;
      range = niceRange;
      minorTickSpacing = 1;
      majorTickSpacing = 10;
    }
    // Make sure values are still in range
    value = value < minValue ? minValue : value > maxValue ? maxValue : value;
    minMeasuredValue = minMeasuredValue < minValue ? minValue : minMeasuredValue > maxValue ? maxValue : minMeasuredValue;
    maxMeasuredValue = maxMeasuredValue < minValue ? minValue : maxMeasuredValue > maxValue ? maxValue : maxMeasuredValue;
    threshold = threshold < minValue ? minValue : threshold > maxValue ? maxValue : threshold;
  };

  // **************   Buffer creation  ********************
  // Buffer for the frame
  var frameBuffer = createBuffer(width, height);
  var frameContext = frameBuffer.getContext('2d');

  // Buffer for the background
  var backgroundBuffer = createBuffer(width, height);
  var backgroundContext = backgroundBuffer.getContext('2d');

  var lcdBuffer;

  // Buffer for led on painting code
  var ledBufferOn = createBuffer(ledSize, ledSize);
  var ledContextOn = ledBufferOn.getContext('2d');

  // Buffer for led off painting code
  var ledBufferOff = createBuffer(ledSize, ledSize);
  var ledContextOff = ledBufferOff.getContext('2d');

  // Buffer for current led painting code
  var ledBuffer = ledBufferOff;

  // Buffer for the minMeasuredValue indicator
  var minMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize);
  var minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d');

  // Buffer for the maxMeasuredValue indicator
  var maxMeasuredValueBuffer = createBuffer(minMaxIndSize, minMaxIndSize);
  var maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d');

  // Buffer for static foreground painting code
  var foregroundBuffer = createBuffer(width, height);
  var foregroundContext = foregroundBuffer.getContext('2d');

  // **************   Image creation  ********************
  var drawLcdText = function(ctx, value, vertical) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = lcdColor.textColor;
    ctx.fillStyle = lcdColor.textColor;

    if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
      ctx.shadowColor = 'gray';
      if (vertical) {
        ctx.shadowOffsetX = imageHeight * 0.003;
        ctx.shadowOffsetY = imageHeight * 0.003;
        ctx.shadowBlur = imageHeight * 0.004;
      } else {
        ctx.shadowOffsetX = imageHeight * 0.007;
        ctx.shadowOffsetY = imageHeight * 0.007;
        ctx.shadowBlur = imageHeight * 0.009;
      }
    }

    var lcdTextX;
    var lcdTextY;
    var lcdTextWidth;

    if (digitalFont) {
      ctx.font = lcdFont;
    } else {
      ctx.font = stdFont;
    }

    if (vertical) {
      lcdTextX = (imageWidth - (imageWidth * 0.571428)) / 2 + imageWidth * 0.571428 - 2;
      lcdTextY = imageHeight * 0.88 + 1 + (imageHeight * 0.055 - 2) / 2;
      lcdTextWidth = imageWidth * 0.7 - 2;
    } else {
      lcdTextX = (imageWidth * 0.695) + imageWidth * 0.18 - 2;
      lcdTextY = (imageHeight * 0.22) + 1 + (imageHeight * 0.15 - 2) / 2;
      lcdTextWidth = imageHeight * 0.22 - 2;
    }

    ctx.fillText(value.toFixed(lcdDecimals), lcdTextX, lcdTextY, lcdTextWidth);

    ctx.restore();
  };

  var createThresholdImage = function(vertical) {
    var thresholdBuffer = doc.createElement('canvas');
    var thresholdCtx = thresholdBuffer.getContext('2d');
    thresholdBuffer.height = thresholdBuffer.width = minMaxIndSize;

    thresholdCtx.save();
    var gradThreshold = thresholdCtx.createLinearGradient(0, 0.1, 0, thresholdBuffer.height * 0.9);
    gradThreshold.addColorStop(0, '#520000');
    gradThreshold.addColorStop(0.3, '#fc1d00');
    gradThreshold.addColorStop(0.59, '#fc1d00');
    gradThreshold.addColorStop(1, '#520000');
    thresholdCtx.fillStyle = gradThreshold;

    if (vertical) {
      thresholdCtx.beginPath();
      thresholdCtx.moveTo(0.1, thresholdBuffer.height * 0.5);
      thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1);
      thresholdCtx.lineTo(thresholdBuffer.width * 0.9, thresholdBuffer.height * 0.9);
      thresholdCtx.closePath();
    } else {
      thresholdCtx.beginPath();
      thresholdCtx.moveTo(0.1, 0.1);
      thresholdCtx.lineTo(thresholdBuffer.width * 0.9, 0.1);
      thresholdCtx.lineTo(thresholdBuffer.width * 0.5, thresholdBuffer.height * 0.9);
      thresholdCtx.closePath();
    }

    thresholdCtx.fill();
    thresholdCtx.strokeStyle = '#FFFFFF';
    thresholdCtx.stroke();

    thresholdCtx.restore();

    return thresholdBuffer;
  };

  var drawTickmarksImage = function(ctx, labelNumberFormat, vertical) {
    backgroundColor.labelColor.setAlpha(1);
    ctx.save();
    ctx.textBaseline = 'middle';
    var TEXT_WIDTH = imageWidth * 0.1;
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();

    var valueCounter = minValue;
    var majorTickCounter = maxNoOfMinorTicks - 1;
    var tickCounter;
    var currentPos;
    var scaleBoundsX;
    var scaleBoundsY;
    var scaleBoundsW;
    var scaleBoundsH;
    var tickSpaceScaling = 1;

    var minorTickStart;
    var minorTickStop;
    var mediumTickStart;
    var mediumTickStop;
    var majorTickStart;
    var majorTickStop;
    if (vertical) {
      minorTickStart = (0.34 * imageWidth);
      minorTickStop = (0.36 * imageWidth);
      mediumTickStart = (0.33 * imageWidth);
      mediumTickStop = (0.36 * imageWidth);
      majorTickStart = (0.32 * imageWidth);
      majorTickStop = (0.36 * imageWidth);
      ctx.textAlign = 'right';
      scaleBoundsX = 0;
      scaleBoundsY = imageHeight * 0.128640;
      scaleBoundsW = 0;
      if (gaugeType.type === 'type1') {
        scaleBoundsH = (imageHeight * 0.856796 - imageHeight * 0.128640);
      } else {
        scaleBoundsH = (imageHeight * 0.7475 - imageHeight * 0.128640);
      }
      tickSpaceScaling = scaleBoundsH / (maxValue - minValue);
    } else {
      minorTickStart = (0.65 * imageHeight);
      minorTickStop = (0.63 * imageHeight);
      mediumTickStart = (0.66 * imageHeight);
      mediumTickStop = (0.63 * imageHeight);
      majorTickStart = (0.67 * imageHeight);
      majorTickStop = (0.63 * imageHeight);
      ctx.textAlign = 'center';
      scaleBoundsY = 0;
      if (gaugeType.type === 'type1') {
        scaleBoundsX = imageWidth * 0.142857;
        scaleBoundsW = (imageWidth * 0.871012 - scaleBoundsX);
      } else {
        scaleBoundsX = imageWidth * 0.19857;
        scaleBoundsW = (imageWidth * 0.82 - scaleBoundsX);
      }
      scaleBoundsH = 0;
      tickSpaceScaling = scaleBoundsW / (maxValue - minValue);
    }

    var labelCounter;
    for (labelCounter = minValue, tickCounter = 0; labelCounter <= maxValue; labelCounter += minorTickSpacing, tickCounter += minorTickSpacing) {

      // Calculate the bounds of the scaling
      if (vertical) {
        currentPos = scaleBoundsY + scaleBoundsH - tickCounter * tickSpaceScaling;
      } else {
        currentPos = scaleBoundsX + tickCounter * tickSpaceScaling;
      }

      majorTickCounter++;

      // Draw tickmark every major tickmark spacing
      if (majorTickCounter === maxNoOfMinorTicks) {

        // Draw the major tickmarks
        ctx.lineWidth = 1.5;
        drawLinearTicks(ctx, majorTickStart, majorTickStop, currentPos, vertical);

        // Draw the standard tickmark labels
        if (vertical) {
          // Vertical orientation
          switch (labelNumberFormat.format) {
            case 'fractional':
              ctx.fillText((valueCounter.toFixed(2)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
              break;

            case 'scientific':
              ctx.fillText((valueCounter.toPrecision(2)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
              break;

            case 'standard':
              /* falls through */
            default:
              ctx.fillText((valueCounter.toFixed(0)), imageWidth * 0.28, currentPos, TEXT_WIDTH);
              break;
          }
        } else {
          // Horizontal orientation
          switch (labelNumberFormat.format) {
            case 'fractional':
              ctx.fillText((valueCounter.toFixed(2)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
              break;

            case 'scientific':
              ctx.fillText((valueCounter.toPrecision(2)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
              break;

            case 'standard':
              /* falls through */
            default:
              ctx.fillText((valueCounter.toFixed(0)), currentPos, (imageHeight * 0.73), TEXT_WIDTH);
              break;
          }
        }

        valueCounter += majorTickSpacing;
        majorTickCounter = 0;
        continue;
      }

      // Draw tickmark every minor tickmark spacing
      if (0 === maxNoOfMinorTicks % 2 && majorTickCounter === (maxNoOfMinorTicks / 2)) {
        ctx.lineWidth = 1;
        drawLinearTicks(ctx, mediumTickStart, mediumTickStop, currentPos, vertical);
      } else {
        ctx.lineWidth = 0.5;
        drawLinearTicks(ctx, minorTickStart, minorTickStop, currentPos, vertical);
      }
    }

    ctx.restore();
  };

  var drawLinearTicks = function(ctx, tickStart, tickStop, currentPos, vertical) {
    if (vertical) {
      // Vertical orientation
      ctx.beginPath();
      ctx.moveTo(tickStart, currentPos);
      ctx.lineTo(tickStop, currentPos);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Horizontal orientation
      ctx.beginPath();
      ctx.moveTo(currentPos, tickStart);
      ctx.lineTo(currentPos, tickStop);
      ctx.closePath();
      ctx.stroke();
    }
  };

  // **************   Initialization  ********************
  var init = function(parameters) {
    parameters = parameters || {};
    var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
    var drawBackground = (undefined === parameters.background ? false : parameters.background);
    var drawLed = (undefined === parameters.led ? false : parameters.led);
    var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);

    var yOffset;
    var yRange;
    var valuePos;

    initialized = true;

    // Calculate the current min and max values and the range
    calculate();

    // Create frame in frame buffer (backgroundBuffer)
    if (drawFrame && frameVisible) {
      drawLinearFrameImage(frameContext, frameDesign, imageWidth, imageHeight, vertical);
    }

    // Create background in background buffer (backgroundBuffer)
    if (drawBackground && backgroundVisible) {
      drawLinearBackgroundImage(backgroundContext, backgroundColor, imageWidth, imageHeight, vertical);
    }

    // draw Thermometer outline
    if (drawBackground && gaugeType.type === 'type2') {
      drawBackgroundImage(backgroundContext);
    }

    if (drawLed) {
      if (vertical) {
        // Draw LED ON in ledBuffer_ON
        ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0);

        // Draw LED ON in ledBuffer_OFF
        ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0);
      } else {
        // Draw LED ON in ledBuffer_ON
        ledContextOn.drawImage(createLedImage(ledSize, 1, ledColor), 0, 0);

        // Draw LED ON in ledBuffer_OFF
        ledContextOff.drawImage(createLedImage(ledSize, 0, ledColor), 0, 0);
      }
    }

    // Draw min measured value indicator in minMeasuredValueBuffer
    if (minMeasuredValueVisible) {
      if (vertical) {
        minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
      } else {
        minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
      }
    }

    // Draw max measured value indicator in maxMeasuredValueBuffer
    if (maxMeasuredValueVisible) {
      if (vertical) {
        maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
      } else {
        maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, steelseries.ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
      }
    }

    // Create alignment posts in background buffer (backgroundBuffer)
    if (drawBackground && backgroundVisible) {

      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat, vertical);

      // Create title in background buffer (backgroundBuffer)
      if (vertical) {
        drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible, gaugeType);
      } else {
        drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible, gaugeType);
      }
    }

    // Draw threshold image to background context
    if (drawBackground && thresholdVisible) {
      backgroundContext.save();
      if (vertical) {
        // Vertical orientation
        yOffset = (gaugeType.type === 'type1' ? 0.856796 : 0.7475);
        yRange = yOffset - 0.128640;
        valuePos = imageHeight * yOffset - (imageHeight * yRange) * (threshold - minValue) / (maxValue - minValue);
        backgroundContext.translate(imageWidth * 0.365, valuePos - minMaxIndSize / 2);
      } else {
        // Horizontal orientation
        yOffset = (gaugeType.type === 'type1' ? 0.871012 : 0.82);
        yRange = yOffset - (gaugeType.type === 'type1' ? 0.142857 : 0.19857);
        valuePos = imageWidth * yRange * (threshold - minValue) / (maxValue - minValue);
        backgroundContext.translate(imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) - minMaxIndSize / 2 + valuePos, imageHeight * 0.58);
      }
      backgroundContext.drawImage(createThresholdImage(vertical), 0, 0);
      backgroundContext.restore();
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground && lcdVisible) {
      if (vertical) {
        lcdBuffer = createLcdBackgroundImage(imageWidth * 0.571428, imageHeight * 0.055, lcdColor);
        backgroundContext.drawImage(lcdBuffer, ((imageWidth - (imageWidth * 0.571428)) / 2), imageHeight * 0.88);
      } else {
        lcdBuffer = createLcdBackgroundImage(imageWidth * 0.18, imageHeight * 0.15, lcdColor);
        backgroundContext.drawImage(lcdBuffer, imageWidth * 0.695, imageHeight * 0.22);
      }
    }

    // add thermometer stem foreground
    if (drawForeground && gaugeType.type === 'type2') {
      drawForegroundImage(foregroundContext);
    }

    // Create foreground in foreground buffer (foregroundBuffer)
    if (drawForeground && foregroundVisible) {
      drawLinearForegroundImage(foregroundContext, imageWidth, imageHeight, vertical, false);
    }
  };

  var resetBuffers = function(buffers) {
    buffers = buffers || {};
    var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
    var resetBackground = (undefined === buffers.background ? false : buffers.background);
    var resetLed = (undefined === buffers.led ? false : buffers.led);
    var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);

    if (resetFrame) {
      frameBuffer.width = width;
      frameBuffer.height = height;
      frameContext = frameBuffer.getContext('2d');
    }

    if (resetBackground) {
      backgroundBuffer.width = width;
      backgroundBuffer.height = height;
      backgroundContext = backgroundBuffer.getContext('2d');
    }

    if (resetLed) {
      ledBufferOn.width = Math.ceil(width * 0.093457);
      ledBufferOn.height = Math.ceil(height * 0.093457);
      ledContextOn = ledBufferOn.getContext('2d');

      ledBufferOff.width = Math.ceil(width * 0.093457);
      ledBufferOff.height = Math.ceil(height * 0.093457);
      ledContextOff = ledBufferOff.getContext('2d');

      // Buffer for current led painting code
      ledBuffer = ledBufferOff;
    }

    if (resetForeground) {
      foregroundBuffer.width = width;
      foregroundBuffer.height = height;
      foregroundContext = foregroundBuffer.getContext('2d');
    }
  };

  var blink = function(blinking) {
    if (blinking) {
      ledTimerId = setInterval(toggleAndRepaintLed, 1000);
    } else {
      clearInterval(ledTimerId);
      ledBuffer = ledBufferOff;
    }
  };

  var toggleAndRepaintLed = function() {
    if (ledVisible) {
      if (ledBuffer === ledBufferOn) {
        ledBuffer = ledBufferOff;
      } else {
        ledBuffer = ledBufferOn;
      }
      if (!repainting) {
        repainting = true;
        requestAnimFrame(self.repaint);
      }
    }
  };

  var drawValue = function(ctx, imageWidth, imageHeight) {
    var top; // position of max value
    var bottom; // position of min value
    var labelColor = backgroundColor.labelColor;
    var fullSize;
    var valueSize, valueTop;
    var valueStartX, valueStartY, valueStopX, valueStopY;
    var valueBackgroundStartX, valueBackgroundStartY, valueBackgroundStopX, valueBackgroundStopY;
    var valueBorderStartX, valueBorderStartY, valueBorderStopX, valueBorderStopY;
    var valueForegroundStartX, valueForegroundStartY, valueForegroundStopX, valueForegroundStopY;

    // Orientation dependend definitions
    if (vertical) {
      // Vertical orientation
      top = imageHeight * 0.128640; // position of max value
      if (gaugeType.type === 'type1') {
        bottom = imageHeight * 0.856796; // position of min value
      } else {
        bottom = imageHeight * 0.7475;
      }
      fullSize = bottom - top;
      valueSize = fullSize * (value - minValue) / (maxValue - minValue);
      valueTop = bottom - valueSize;
      valueBackgroundStartX = 0;
      valueBackgroundStartY = top;
      valueBackgroundStopX = 0;
      valueBackgroundStopY = bottom;
    } else {
      // Horizontal orientation
      if (gaugeType.type === 'type1') {
        top = imageWidth * 0.871012; // position of max value
        bottom = imageWidth * 0.142857; // position of min value
      } else {
        top = imageWidth * 0.82; // position of max value
        bottom = imageWidth * 0.19857; // position of min value
      }
      fullSize = top - bottom;
      valueSize = fullSize * (value - minValue) / (maxValue - minValue);
      valueTop = bottom;
      valueBackgroundStartX = top;
      valueBackgroundStartY = 0;
      valueBackgroundStopX = bottom;
      valueBackgroundStopY = 0;
    }
    if (gaugeType.type === 'type1') {
      var darker = (backgroundColor === steelseries.BackgroundColor.CARBON ||
        backgroundColor === steelseries.BackgroundColor.PUNCHED_SHEET ||
        backgroundColor === steelseries.BackgroundColor.STAINLESS ||
        backgroundColor === steelseries.BackgroundColor.BRUSHED_STAINLESS ||
        backgroundColor === steelseries.BackgroundColor.TURNED) ? 0.3 : 0;
      var valueBackgroundTrackGradient = ctx.createLinearGradient(valueBackgroundStartX, valueBackgroundStartY, valueBackgroundStopX, valueBackgroundStopY);
      labelColor.setAlpha(0.05 + darker);
      valueBackgroundTrackGradient.addColorStop(0, labelColor.getRgbaColor());
      labelColor.setAlpha(0.15 + darker);
      valueBackgroundTrackGradient.addColorStop(0.48, labelColor.getRgbaColor());
      labelColor.setAlpha(0.15 + darker);
      valueBackgroundTrackGradient.addColorStop(0.49, labelColor.getRgbaColor());
      labelColor.setAlpha(0.05 + darker);
      valueBackgroundTrackGradient.addColorStop(1, labelColor.getRgbaColor());
      ctx.fillStyle = valueBackgroundTrackGradient;

      if (vertical) {
        ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.142857, fullSize);
      } else {
        ctx.fillRect(imageWidth * 0.142857, imageHeight * 0.435714, fullSize, imageHeight * 0.142857);
      }

      if (vertical) {
        // Vertical orientation
        valueBorderStartX = 0;
        valueBorderStartY = top;
        valueBorderStopX = 0;
        valueBorderStopY = top + fullSize;
      } else {
        // Horizontal orientation
        valueBorderStartX = imageWidth * 0.142857 + fullSize;
        valueBorderStartY = 0;
        valueBorderStopX = imageWidth * 0.142857;
        valueBorderStopY = 0;
      }
      var valueBorderGradient = ctx.createLinearGradient(valueBorderStartX, valueBorderStartY, valueBorderStopX, valueBorderStopY);
      labelColor.setAlpha(0.3 + darker);
      valueBorderGradient.addColorStop(0, labelColor.getRgbaColor());
      labelColor.setAlpha(0.69);
      valueBorderGradient.addColorStop(0.48, labelColor.getRgbaColor());
      labelColor.setAlpha(0.7);
      valueBorderGradient.addColorStop(0.49, labelColor.getRgbaColor());
      labelColor.setAlpha(0.4);
      valueBorderGradient.addColorStop(1, labelColor.getRgbaColor());
      ctx.fillStyle = valueBorderGradient;
      if (vertical) {
        ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.007142, fullSize);
        ctx.fillRect(imageWidth * 0.571428, top, imageWidth * 0.007142, fullSize);
      } else {
        ctx.fillRect(imageWidth * 0.142857, imageHeight * 0.435714, fullSize, imageHeight * 0.007142);
        ctx.fillRect(imageWidth * 0.142857, imageHeight * 0.571428, fullSize, imageHeight * 0.007142);
      }
    }
    if (vertical) {
      // Vertical orientation
      if (gaugeType.type === 'type1') {
        valueStartX = imageWidth * 0.45;
        valueStartY = 0;
        valueStopX = imageWidth * 0.45 + imageWidth * 0.114285;
        valueStopY = 0;
      } else {
        valueStartX = imageWidth / 2 - imageHeight * 0.0486 / 2;
        valueStartY = 0;
        valueStopX = valueStartX + imageHeight * 0.053;
        valueStopY = 0;
      }
    } else {
      // Horizontal orientation
      if (gaugeType.type === 'type1') {
        valueStartX = 0;
        valueStartY = imageHeight * 0.45;
        valueStopX = 0;
        valueStopY = imageHeight * 0.45 + imageHeight * 0.114285;
      } else {
        valueStartX = 0;
        valueStartY = imageHeight / 2 - imageWidth * 0.0250;
        valueStopX = 0;
        valueStopY = valueStartY + imageWidth * 0.053;
      }
    }

    var valueBackgroundGradient = ctx.createLinearGradient(valueStartX, valueStartY, valueStopX, valueStopY);
    valueBackgroundGradient.addColorStop(0, valueColor.medium.getRgbaColor());
    valueBackgroundGradient.addColorStop(1, valueColor.light.getRgbaColor());
    ctx.fillStyle = valueBackgroundGradient;
    var thermoTweak = (gaugeType.type === 'type1' ? 0 : (vertical ? imageHeight * 0.05 : imageWidth * 0.05));
    if (vertical) {
      ctx.fillRect(valueStartX, valueTop, valueStopX - valueStartX, valueSize + thermoTweak);
    } else {
      ctx.fillRect(valueTop - thermoTweak, valueStartY, valueSize + thermoTweak, valueStopY - valueStartY);
    }

    if (gaugeType.type === 'type1') {
      // The light effect on the value
      if (vertical) {
        // Vertical orientation
        valueForegroundStartX = imageWidth * 0.45;
        valueForegroundStartY = 0;
        valueForegroundStopX = valueForegroundStartX + imageWidth * 0.05;
        valueForegroundStopY = 0;
      } else {
        // Horizontal orientation
        valueForegroundStartX = 0;
        valueForegroundStartY = imageHeight * 0.45;
        valueForegroundStopX = 0;
        valueForegroundStopY = valueForegroundStartY + imageHeight * 0.05;
      }
      var valueForegroundGradient = ctx.createLinearGradient(valueForegroundStartX, valueForegroundStartY, valueForegroundStopX, valueForegroundStopY);
      valueForegroundGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      valueForegroundGradient.addColorStop(0.98, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = valueForegroundGradient;
      if (vertical) {
        ctx.fillRect(valueForegroundStartX, valueTop, valueForegroundStopX, valueSize);
      } else {
        ctx.fillRect(valueTop, valueForegroundStartY, valueSize, valueForegroundStopY - valueForegroundStartY);
      }
    }
  };

  var drawForegroundImage = function(ctx) {
    var foreSize = (vertical ? imageHeight : imageWidth);

    ctx.save();
    if (vertical) {
      ctx.translate(imageWidth / 2, 0);
    } else {
      ctx.translate(imageWidth / 2, imageHeight / 2);
      ctx.rotate(HALF_PI);
      ctx.translate(0, -imageWidth / 2 + imageWidth * 0.05);
    }

    // draw bulb
    ctx.beginPath();
    ctx.moveTo(-0.0490 * foreSize, 0.825 * foreSize);
    ctx.bezierCurveTo(-0.0490 * foreSize, 0.7975 * foreSize, -0.0264 * foreSize, 0.775 * foreSize, 0.0013 * foreSize, 0.775 * foreSize);
    ctx.bezierCurveTo(0.0264 * foreSize, 0.775 * foreSize, 0.0490 * foreSize, 0.7975 * foreSize, 0.0490 * foreSize, 0.825 * foreSize);
    ctx.bezierCurveTo(0.0490 * foreSize, 0.85 * foreSize, 0.0264 * foreSize, 0.8725 * foreSize, 0.0013 * foreSize, 0.8725 * foreSize);
    ctx.bezierCurveTo(-0.0264 * foreSize, 0.8725 * foreSize, -0.0490 * foreSize, 0.85 * foreSize, -0.0490 * foreSize, 0.825 * foreSize);
    ctx.closePath();
    var grad = ctx.createRadialGradient(0 * foreSize, 0.825 * foreSize, 0, 0 * foreSize, 0.825 * foreSize, 0.0490 * foreSize);
    grad.addColorStop(0, valueColor.medium.getRgbaColor());
    grad.addColorStop(0.3, valueColor.medium.getRgbaColor());
    grad.addColorStop(1, valueColor.light.getRgbaColor());
    ctx.fillStyle = grad;
    ctx.fill();

    // draw bulb highlight
    ctx.beginPath();
    if (vertical) {
      ctx.moveTo(-0.0365 * foreSize, 0.8075 * foreSize);
      ctx.bezierCurveTo(-0.0365 * foreSize, 0.7925 * foreSize, -0.0214 * foreSize, 0.7875 * foreSize, -0.0214 * foreSize, 0.7825 * foreSize);
      ctx.bezierCurveTo(0.0189 * foreSize, 0.785 * foreSize, 0.0365 * foreSize, 0.7925 * foreSize, 0.0365 * foreSize, 0.8075 * foreSize);
      ctx.bezierCurveTo(0.0365 * foreSize, 0.8175 * foreSize, 0.0214 * foreSize, 0.815 * foreSize, 0.0013 * foreSize, 0.8125 * foreSize);
      ctx.bezierCurveTo(-0.0189 * foreSize, 0.8125 * foreSize, -0.0365 * foreSize, 0.8175 * foreSize, -0.0365 * foreSize, 0.8075 * foreSize);
      grad = ctx.createRadialGradient(0, 0.8 * foreSize, 0, 0, 0.8 * foreSize, 0.0377 * foreSize);
    } else {
      ctx.beginPath();
      ctx.moveTo(-0.0214 * foreSize, 0.86 * foreSize);
      ctx.bezierCurveTo(-0.0365 * foreSize, 0.86 * foreSize, -0.0415 * foreSize, 0.845 * foreSize, -0.0465 * foreSize, 0.825 * foreSize);
      ctx.bezierCurveTo(-0.0465 * foreSize, 0.805 * foreSize, -0.0365 * foreSize, 0.7875 * foreSize, -0.0214 * foreSize, 0.7875 * foreSize);
      ctx.bezierCurveTo(-0.0113 * foreSize, 0.7875 * foreSize, -0.0163 * foreSize, 0.8025 * foreSize, -0.0163 * foreSize, 0.8225 * foreSize);
      ctx.bezierCurveTo(-0.0163 * foreSize, 0.8425 * foreSize, -0.0113 * foreSize, 0.86 * foreSize, -0.0214 * foreSize, 0.86 * foreSize);
      grad = ctx.createRadialGradient(-0.03 * foreSize, 0.8225 * foreSize, 0, -0.03 * foreSize, 0.8225 * foreSize, 0.0377 * foreSize);
    }
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = grad;
    ctx.closePath();
    ctx.fill();

    // stem highlight
    ctx.beginPath();
    ctx.moveTo(-0.0214 * foreSize, 0.115 * foreSize);
    ctx.bezierCurveTo(-0.0214 * foreSize, 0.1075 * foreSize, -0.0163 * foreSize, 0.1025 * foreSize, -0.0113 * foreSize, 0.1025 * foreSize);
    ctx.bezierCurveTo(-0.0113 * foreSize, 0.1025 * foreSize, -0.0113 * foreSize, 0.1025 * foreSize, -0.0113 * foreSize, 0.1025 * foreSize);
    ctx.bezierCurveTo(-0.0038 * foreSize, 0.1025 * foreSize, 0.0013 * foreSize, 0.1075 * foreSize, 0.0013 * foreSize, 0.115 * foreSize);
    ctx.bezierCurveTo(0.0013 * foreSize, 0.115 * foreSize, 0.0013 * foreSize, 0.76 * foreSize, 0.0013 * foreSize, 0.76 * foreSize);
    ctx.bezierCurveTo(0.0013 * foreSize, 0.7675 * foreSize, -0.0038 * foreSize, 0.7725 * foreSize, -0.0113 * foreSize, 0.7725 * foreSize);
    ctx.bezierCurveTo(-0.0113 * foreSize, 0.7725 * foreSize, -0.0113 * foreSize, 0.7725 * foreSize, -0.0113 * foreSize, 0.7725 * foreSize);
    ctx.bezierCurveTo(-0.0163 * foreSize, 0.7725 * foreSize, -0.0214 * foreSize, 0.7675 * foreSize, -0.0214 * foreSize, 0.76 * foreSize);
    ctx.bezierCurveTo(-0.0214 * foreSize, 0.76 * foreSize, -0.0214 * foreSize, 0.115 * foreSize, -0.0214 * foreSize, 0.115 * foreSize);
    ctx.closePath();
    grad = ctx.createLinearGradient(-0.0189 * foreSize, 0, 0.0013 * foreSize, 0);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(0.34, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  };

  var drawBackgroundImage = function(ctx) {
    var backSize = (vertical ? imageHeight : imageWidth);
    ctx.save();
    if (vertical) {
      ctx.translate(imageWidth / 2, 0);
    } else {
      ctx.translate(imageWidth / 2, imageHeight / 2);
      ctx.rotate(HALF_PI);
      ctx.translate(0, -imageWidth / 2 + imageWidth * 0.05);
    }
    ctx.beginPath();
    ctx.moveTo(-0.0516 * backSize, 0.825 * backSize);
    ctx.bezierCurveTo(-0.0516 * backSize, 0.8525 * backSize, -0.0289 * backSize, 0.875 * backSize, 0.0013 * backSize, 0.875 * backSize);
    ctx.bezierCurveTo(0.0289 * backSize, 0.875 * backSize, 0.0516 * backSize, 0.8525 * backSize, 0.0516 * backSize, 0.825 * backSize);
    ctx.bezierCurveTo(0.0516 * backSize, 0.8075 * backSize, 0.0440 * backSize, 0.7925 * backSize, 0.0314 * backSize, 0.7825 * backSize);
    ctx.bezierCurveTo(0.0314 * backSize, 0.7825 * backSize, 0.0314 * backSize, 0.12 * backSize, 0.0314 * backSize, 0.12 * backSize);
    ctx.bezierCurveTo(0.0314 * backSize, 0.1025 * backSize, 0.0189 * backSize, 0.0875 * backSize, 0.0013 * backSize, 0.0875 * backSize);
    ctx.bezierCurveTo(-0.0163 * backSize, 0.0875 * backSize, -0.0289 * backSize, 0.1025 * backSize, -0.0289 * backSize, 0.12 * backSize);
    ctx.bezierCurveTo(-0.0289 * backSize, 0.12 * backSize, -0.0289 * backSize, 0.7825 * backSize, -0.0289 * backSize, 0.7825 * backSize);
    ctx.bezierCurveTo(-0.0415 * backSize, 0.79 * backSize, -0.0516 * backSize, 0.805 * backSize, -0.0516 * backSize, 0.825 * backSize);
    ctx.closePath();
    var grad = ctx.createLinearGradient(-0.0163 * backSize, 0, 0.0289 * backSize, 0);
    grad.addColorStop(0, 'rgba(226, 226, 226, 0.5)');
    grad.addColorStop(0.5, 'rgba(226, 226, 226, 0.2)');
    grad.addColorStop(1, 'rgba(226, 226, 226, 0.5)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(153, 153, 153, 0.5)';
    ctx.stroke();
    ctx.restore();
  };

  //************************************ Public methods **************************************
  this.setValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
    if (value !== targetValue) {
      value = targetValue;

      if (value > maxMeasuredValue) {
        maxMeasuredValue = value;
      }
      if (value < minMeasuredValue) {
        minMeasuredValue = value;
      }

      if ((value >= threshold && !ledBlinking && thresholdRising) ||
        (value <= threshold && !ledBlinking && !thresholdRising)) {
        ledBlinking = true;
        blink(ledBlinking);
        if (playAlarm) {
          audioElement.play();
        }
      } else if ((value < threshold && ledBlinking && thresholdRising) ||
        (value > threshold && ledBlinking && !thresholdRising)) {
        ledBlinking = false;
        blink(ledBlinking);
        if (playAlarm) {
          audioElement.pause();
        }
      }

      this.repaint();
    }
    return this;
  };

  this.getValue = function() {
    return value;
  };

  this.setValueAnimated = function(newValue, callback) {
    var targetValue,
      gauge = this,
      time;
    newValue = parseFloat(newValue);
    targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
    if (value !== targetValue) {
      if (undefined !== tween && tween.isPlaying) {
        tween.stop();
      }

      time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
      time = Math.max(time, fullScaleDeflectionTime / 5);
      tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, time);
      //tween = new Tween({}, '', Tween.regularEaseInOut, value, targetValue, 1);

      tween.onMotionChanged = function(event) {
        value = event.target._pos;
        if (value > maxMeasuredValue) {
          maxMeasuredValue = value;
        }
        if (value < minMeasuredValue) {
          minMeasuredValue = value;
        }

        if ((value >= threshold && !ledBlinking && thresholdRising) ||
          (value <= threshold && !ledBlinking && !thresholdRising)) {
          ledBlinking = true;
          blink(ledBlinking);
          if (playAlarm) {
            audioElement.play();
          }
        } else if ((value < threshold && ledBlinking && thresholdRising) ||
          (value > threshold && ledBlinking && !thresholdRising)) {
          ledBlinking = false;
          blink(ledBlinking);
          if (playAlarm) {
            audioElement.pause();
          }
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

  this.resetMinMeasuredValue = function() {
    minMeasuredValue = value;
    this.repaint();
    return this;
  };

  this.resetMaxMeasuredValue = function() {
    maxMeasuredValue = value;
    this.repaint();
    return this;
  };

  this.setMinMeasuredValueVisible = function(visible) {
    minMeasuredValueVisible = !!visible;
    this.repaint();
    return this;
  };

  this.setMaxMeasuredValueVisible = function(visible) {
    maxMeasuredValueVisible = !!visible;
    this.repaint();
    return this;
  };

  this.setThreshold = function(threshVal) {
    threshVal = parseFloat(threshVal);
    var targetValue = (threshVal < minValue ? minValue : (threshVal > maxValue ? maxValue : threshVal));
    threshold = targetValue;
    resetBuffers({
      background: true
    });
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.setThresholdVisible = function(visible) {
    thresholdVisible = !!visible;
    this.repaint();
    return this;
  };

  this.setThresholdRising = function(rising) {
    thresholdRising = !!rising;
    // reset existing threshold alerts
    ledBlinking = !ledBlinking;
    blink(ledBlinking);
    this.repaint();
    return this;
  };

  this.setLcdDecimals = function(decimals) {
    lcdDecimals = parseInt(decimals, 10);
    this.repaint();
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
      background: true
    });
    backgroundColor = newBackgroundColor;
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.setValueColor = function(newValueColor) {
    resetBuffers({
      foreground: true
    });
    valueColor = newValueColor;
    init({
      foreground: true
    });
    this.repaint();
    return this;
  };

  this.setLedColor = function(newLedColor) {
    resetBuffers({
      led: true
    });
    ledColor = newLedColor;
    init({
      led: true
    });
    this.repaint();
    return this;
  };

  this.setLedVisible = function(visible) {
    ledVisible = !!visible;
    this.repaint();
    return this;
  };

  this.setLcdColor = function(newLcdColor) {
    resetBuffers({
      background: true
    });
    lcdColor = newLcdColor;
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.setMaxMeasuredValue = function(newVal) {
    newVal = parseFloat(newVal);
    var targetValue = (newVal < minValue ? minValue : (newVal > maxValue ? maxValue : newVal));
    maxMeasuredValue = targetValue;
    this.repaint();
    return this;
  };

  this.setMinMeasuredValue = function(newVal) {
    newVal = parseFloat(newVal);
    var targetValue = (newVal < minValue ? minValue : (newVal > maxValue ? maxValue : newVal));
    minMeasuredValue = targetValue;
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

  this.setMinValue = function(newVal) {
    resetBuffers({
      background: true
    });
    minValue = parseFloat(newVal);
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.getMinValue = function() {
    return minValue;
  };

  this.setMaxValue = function(newVal) {
    resetBuffers({
      background: true
    });
    maxValue = parseFloat(newVal);
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.getMaxValue = function() {
    return maxValue;
  };

  this.repaint = function() {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        foreground: true
      });
    }

    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0);
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0);

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(mainCtx, value, vertical);
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
    }

    var valuePos;
    var yOffset;
    var yRange;
    var minMaxX, minMaxY;
    // Draw min measured value indicator
    if (minMeasuredValueVisible) {
      if (vertical) {
        yOffset = (gaugeType.type === 'type1' ? 0.856796 : 0.7475);
        yRange = (yOffset - 0.128640);
        valuePos = imageHeight * yOffset - (imageHeight * yRange) * (minMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * 0.34 - minMeasuredValueBuffer.width;
        minMaxY = valuePos - minMeasuredValueBuffer.height / 2;
      } else {
        yOffset = (gaugeType.type === 'type1' ? 0.871012 : 0.82);
        yRange = yOffset - (gaugeType.type === 'type1' ? 0.142857 : 0.19857);
        valuePos = (imageWidth * yRange) * (minMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) - minMeasuredValueBuffer.height / 2 + valuePos;
        minMaxY = imageHeight * 0.65;
      }
      mainCtx.drawImage(minMeasuredValueBuffer, minMaxX, minMaxY);
    }

    // Draw max measured value indicator
    if (maxMeasuredValueVisible) {
      if (vertical) {
        valuePos = imageHeight * yOffset - (imageHeight * yRange) * (maxMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * 0.34 - maxMeasuredValueBuffer.width;
        minMaxY = valuePos - maxMeasuredValueBuffer.height / 2;
      } else {
        yOffset = (gaugeType.type === 'type1' ? 0.871012 : 0.8);
        yRange = yOffset - (gaugeType.type === 'type1' ? 0.14857 : 0.19857);
        valuePos = (imageWidth * yRange) * (maxMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * (gaugeType.type === 'type1' ? 0.142857 : 0.19857) - maxMeasuredValueBuffer.height / 2 + valuePos;
        minMaxY = imageHeight * 0.65;
      }
      mainCtx.drawImage(maxMeasuredValueBuffer, minMaxX, minMaxY);
    }

    mainCtx.save();
    drawValue(mainCtx, imageWidth, imageHeight);
    mainCtx.restore();

    // Draw foreground
    if (foregroundVisible || gaugeType.type === 'type2') {
      mainCtx.drawImage(foregroundBuffer, 0, 0);
    }

    repainting = false;
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default linear;
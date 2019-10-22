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
customColorDef, 
requestAnimFrame, 
getCanvasContext,
doc,
lcdFontName,
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

var LinearBargraph = function(canvas, parameters) {
  parameters = parameters || {};
  var width = (undefined === parameters.width ? 0 : parameters.width),
    height = (undefined === parameters.height ? 0 : parameters.height),
    minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
    maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
    section = (undefined === parameters.section ? null : parameters.section),
    useSectionColors = (undefined === parameters.useSectionColors ? false : parameters.useSectionColors),
    niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
    threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue : parameters.threshold),
    titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
    unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
    frameDesign = (undefined === parameters.frameDesign ? FrameDesign.METAL : parameters.frameDesign),
    frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
    backgroundColor = (undefined === parameters.backgroundColor ? BackgroundColor.DARK_GRAY : parameters.backgroundColor),
    backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
    valueColor = (undefined === parameters.valueColor ? ColorDef.RED : parameters.valueColor),
    lcdColor = (undefined === parameters.lcdColor ? LcdColor.STANDARD : parameters.lcdColor),
    lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
    lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
    digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
    ledColor = (undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor),
    ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
    thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
    thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
    minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
    maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
    labelNumberFormat = (undefined === parameters.labelNumberFormat ? LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
    alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
    valueGradient = (undefined === parameters.valueGradient ? null : parameters.valueGradient),
    useValueGradient = (undefined === parameters.useValueGradient ? false : parameters.useValueGradient),
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
    audioElement.setAttribute('preload', 'auto');
  }

  var self = this;
  var value = minValue;

  // Properties
  var minMeasuredValue = maxValue;
  var maxMeasuredValue = minValue;

  var tween;
  var ledBlinking = false;
  var repainting = false;
  var isSectionsVisible = false;
  var isGradientVisible = false;
  var sectionPixels = [];
  var ledTimerId = 0;

  var vertical = width <= height;

  // Constants
  var ledPosX;
  var ledPosY;
  var ledSize = Math.round((vertical ? height : width) * 0.05);
  var minMaxIndSize = Math.round((vertical ? width : height) * 0.05);
  var stdFont;
  var lcdFont;

  if (vertical) {
    ledPosX = imageWidth / 2 - ledSize / 2;
    ledPosY = 0.053 * imageHeight;
    stdFont = Math.floor(imageHeight / 22) + 'px ' + stdFontName;
    lcdFont = Math.floor(imageHeight / 22) + 'px ' + lcdFontName;
  } else {
    ledPosX = 0.89 * imageWidth;
    ledPosY = imageHeight / 1.95 - ledSize / 2;
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

  // Buffer for active bargraph led
  var activeLedBuffer = doc.createElement('canvas');
  if (vertical) {
    activeLedBuffer.width = imageWidth * 0.121428;
    activeLedBuffer.height = imageHeight * 0.012135;
  } else {
    activeLedBuffer.width = imageWidth * 0.012135;
    activeLedBuffer.height = imageHeight * 0.121428;
  }
  var activeLedContext = activeLedBuffer.getContext('2d');

  // Buffer for active bargraph led
  var inActiveLedBuffer = doc.createElement('canvas');
  if (vertical) {
    inActiveLedBuffer.width = imageWidth * 0.121428;
    inActiveLedBuffer.height = imageHeight * 0.012135;
  } else {
    inActiveLedBuffer.width = imageWidth * 0.012135;
    inActiveLedBuffer.height = imageHeight * 0.121428;
  }
  var inActiveLedContext = inActiveLedBuffer.getContext('2d');

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

    if (lcdColor === LcdColor.STANDARD || lcdColor === LcdColor.STANDARD_GREEN) {
      ctx.shadowColor = 'gray';
      if (vertical) {
        ctx.shadowOffsetX = imageWidth * 0.007;
        ctx.shadowOffsetY = imageWidth * 0.007;
        ctx.shadowBlur = imageWidth * 0.009;
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
      lcdTextX = (imageWidth - (imageWidth * 0.571428)) / 2 + 1 + imageWidth * 0.571428 - 2;
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
    thresholdBuffer.height = thresholdBuffer.width = minMaxIndSize;
    var thresholdCtx = thresholdBuffer.getContext('2d');

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
      scaleBoundsH = (imageHeight * 0.856796 - imageHeight * 0.128640);
      tickSpaceScaling = scaleBoundsH / (maxValue - minValue);
    } else {
      minorTickStart = (0.65 * imageHeight);
      minorTickStop = (0.63 * imageHeight);
      mediumTickStart = (0.66 * imageHeight);
      mediumTickStop = (0.63 * imageHeight);
      majorTickStart = (0.67 * imageHeight);
      majorTickStop = (0.63 * imageHeight);
      ctx.textAlign = 'center';
      scaleBoundsX = imageWidth * 0.142857;
      scaleBoundsY = 0;
      scaleBoundsW = (imageWidth * 0.871012 - imageWidth * 0.142857);
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
    var drawBargraphLed = (undefined === parameters.bargraphled ? false : parameters.bargraphled);

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
        minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
      } else {
        minMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, ColorDef.BLUE.dark.getRgbaColor(), false, vertical), 0, 0);
      }
    }

    // Draw max measured value indicator in maxMeasuredValueBuffer
    if (maxMeasuredValueVisible) {
      if (vertical) {
        maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
      } else {
        maxMeasuredValueCtx.drawImage(createMeasuredValueImage(minMaxIndSize, ColorDef.RED.medium.getRgbaColor(), false, vertical), 0, 0);
      }
    }

    // Create alignment posts in background buffer (backgroundBuffer)
    if (drawBackground && backgroundVisible) {
      var valuePos;
      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat, vertical);

      // Draw threshold image to background context
      if (thresholdVisible) {
        backgroundContext.save();
        if (vertical) {
          // Vertical orientation
          valuePos = imageHeight * 0.856796 - (imageHeight * 0.728155) * (threshold - minValue) / (maxValue - minValue);
          backgroundContext.translate(imageWidth * 0.365, valuePos - minMaxIndSize / 2);
        } else {
          // Horizontal orientation
          valuePos = (imageWidth * 0.856796 - imageWidth * 0.128640) * (threshold - minValue) / (maxValue - minValue);
          backgroundContext.translate(imageWidth * 0.142857 - minMaxIndSize / 2 + valuePos, imageHeight * 0.58);
        }
        backgroundContext.drawImage(createThresholdImage(vertical), 0, 0);
        backgroundContext.restore();
      }

      // Create title in background buffer (backgroundBuffer)
      if (vertical) {
        drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible);
      } else {
        drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, null, lcdVisible);
      }
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

    // Draw leds of bargraph
    if (drawBargraphLed) {
      drawInActiveLed(inActiveLedContext);
      drawActiveLed(activeLedContext, valueColor);
    }

    // Convert Section values into pixels
    isSectionsVisible = false;
    if (null !== section && 0 < section.length) {
      isSectionsVisible = true;
      var sectionIndex = section.length;
      var top, bottom, fullSize, ledWidth2;

      if (vertical) {
        // Vertical orientation
        top = imageHeight * 0.128640; // position of max value
        bottom = imageHeight * 0.856796; // position of min value
        fullSize = bottom - top;
        ledWidth2 = 0;
      } else {
        // Horizontal orientation
        top = imageWidth * 0.856796; // position of max value
        bottom = imageWidth * 0.128640;
        fullSize = top - bottom;
        ledWidth2 = imageWidth * 0.012135 / 2;
      }
      sectionPixels = [];
      do {
        sectionIndex--;
        sectionPixels.push({
          start: (((section[sectionIndex].start + Math.abs(minValue)) / (maxValue - minValue)) * fullSize - ledWidth2),
          stop: (((section[sectionIndex].stop + Math.abs(minValue)) / (maxValue - minValue)) * fullSize - ledWidth2),
          color: customColorDef(section[sectionIndex].color)
        });
      } while (0 < sectionIndex);
    }

    // Use a gradient for the valueColor?
    isGradientVisible = false;
    if (useValueGradient && valueGradient !== null) {
      // force section colors off!
      isSectionsVisible = false;
      isGradientVisible = true;
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
    var resetBargraphLed = (undefined === buffers.bargraphled ? false : buffers.bargraphled);
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

    if (resetBargraphLed) {
      if (vertical) {
        activeLedBuffer.width = width * 0.121428;
        activeLedBuffer.height = height * 0.012135;
      } else {
        activeLedBuffer.width = width * 0.012135;
        activeLedBuffer.height = height * 0.121428;
      }
      activeLedContext = activeLedBuffer.getContext('2d');

      // Buffer for active bargraph led
      if (vertical) {
        inActiveLedBuffer.width = width * 0.121428;
        inActiveLedBuffer.height = height * 0.012135;
      } else {
        inActiveLedBuffer.width = width * 0.012135;
        inActiveLedBuffer.height = height * 0.121428;
      }
      inActiveLedContext = inActiveLedBuffer.getContext('2d');
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
    var valueSize;
    var valueTop;
    var valueBackgroundStartX;
    var valueBackgroundStartY;
    var valueBackgroundStopX;
    var valueBackgroundStopY;
    var valueBorderStartX;
    var valueBorderStartY;
    var valueBorderStopX;
    var valueBorderStopY;
    var currentValue;
    var gradRange;
    var fraction;

    // Orientation dependend definitions
    if (vertical) {
      // Vertical orientation
      top = imageHeight * 0.128640; // position of max value
      bottom = imageHeight * 0.856796; // position of min value
      fullSize = bottom - top;
      valueSize = fullSize * (value - minValue) / (maxValue - minValue);
      valueTop = top + fullSize - valueSize;
      valueBackgroundStartX = 0;
      valueBackgroundStartY = top;
      valueBackgroundStopX = 0;
      valueBackgroundStopY = top + fullSize * 1.014;
    } else {
      // Horizontal orientation
      top = imageWidth * 0.856796; // position of max value
      bottom = imageWidth * 0.128640;
      fullSize = top - bottom;
      valueSize = fullSize * (value - minValue) / (maxValue - minValue);
      valueTop = bottom;
      valueBackgroundStartX = imageWidth * 0.13;
      valueBackgroundStartY = imageHeight * 0.435714;
      valueBackgroundStopX = valueBackgroundStartX + fullSize * 1.035;
      valueBackgroundStopY = valueBackgroundStartY;
    }

    var darker = (backgroundColor === BackgroundColor.CARBON ||
      backgroundColor === BackgroundColor.PUNCHED_SHEET ||
      backgroundColor === BackgroundColor.STAINLESS ||
      backgroundColor === BackgroundColor.BRUSHED_STAINLESS ||
      backgroundColor === BackgroundColor.TURNED) ? 0.3 : 0;

    var valueBackgroundTrackGradient = ctx.createLinearGradient(valueBackgroundStartX, valueBackgroundStartY, valueBackgroundStopX, valueBackgroundStopY);
    labelColor.setAlpha(0.047058 + darker);
    valueBackgroundTrackGradient.addColorStop(0, labelColor.getRgbaColor());
    labelColor.setAlpha(0.145098 + darker);
    valueBackgroundTrackGradient.addColorStop(0.48, labelColor.getRgbaColor());
    labelColor.setAlpha(0.149019 + darker);
    valueBackgroundTrackGradient.addColorStop(0.49, labelColor.getRgbaColor());
    labelColor.setAlpha(0.047058 + darker);
    valueBackgroundTrackGradient.addColorStop(1, labelColor.getRgbaColor());
    ctx.fillStyle = valueBackgroundTrackGradient;

    if (vertical) {
      ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.15, fullSize * 1.014);
    } else {
      ctx.fillRect(valueBackgroundStartX, valueBackgroundStartY, fullSize * 1.035, imageHeight * 0.152857);
    }

    if (vertical) {
      // Vertical orientation
      valueBorderStartX = 0;
      valueBorderStartY = top;
      valueBorderStopX = 0;
      valueBorderStopY = top + fullSize * 1.014;
    } else {
      // Horizontal orientation                ;
      valueBorderStartX = valueBackgroundStartX;
      valueBorderStartY = 0;
      valueBorderStopX = valueBackgroundStopX;
      valueBorderStopY = 0;
    }

    var valueBorderGradient = ctx.createLinearGradient(valueBorderStartX, valueBorderStartY, valueBorderStopX, valueBorderStopY);
    labelColor.setAlpha(0.298039 + darker);
    valueBorderGradient.addColorStop(0, labelColor.getRgbaColor());
    labelColor.setAlpha(0.686274 + darker);
    valueBorderGradient.addColorStop(0.48, labelColor.getRgbaColor());
    labelColor.setAlpha(0.698039 + darker);
    valueBorderGradient.addColorStop(0.49, labelColor.getRgbaColor());
    labelColor.setAlpha(0.4 + darker);
    valueBorderGradient.addColorStop(1, labelColor.getRgbaColor());
    ctx.fillStyle = valueBorderGradient;
    if (vertical) {
      ctx.fillRect(imageWidth * 0.435714, top, imageWidth * 0.007142, fullSize * 1.014);
      ctx.fillRect(imageWidth * 0.571428, top, imageWidth * 0.007142, fullSize * 1.014);
    } else {
      ctx.fillRect(imageWidth * 0.13, imageHeight * 0.435714, fullSize * 1.035, imageHeight * 0.007142);
      ctx.fillRect(imageWidth * 0.13, imageHeight * 0.571428, fullSize * 1.035, imageHeight * 0.007142);
    }

    // Prepare led specific variables
    var ledX;
    var ledY;
    var ledW;
    var ledH;
    var ledCenterX;
    var ledCenterY;
    var activeLeds;
    var inactiveLeds;
    if (vertical) {
      // VERTICAL
      ledX = imageWidth * 0.45;
      ledY = imageHeight * 0.851941;
      ledW = imageWidth * 0.121428;
      ledH = imageHeight * 0.012135;
      ledCenterX = (ledX + ledW) / 2;
      ledCenterY = (ledY + ledH) / 2;
    } else {
      // HORIZONTAL
      ledX = imageWidth * 0.142857;
      ledY = imageHeight * 0.45;
      ledW = imageWidth * 0.012135;
      ledH = imageHeight * 0.121428;
      ledCenterX = (ledX + ledW) / 2;
      ledCenterY = (ledY + ledH) / 2;
    }

    var translateX, translateY;
    var activeLedColor;
    var lastActiveLedColor = valueColor;
    var i;
    // Draw the value
    if (vertical) {
      // Draw the inactive leds
      inactiveLeds = fullSize;
      for (translateY = 0; translateY <= inactiveLeds; translateY += ledH + 1) {
        ctx.translate(0, -translateY);
        ctx.drawImage(inActiveLedBuffer, ledX, ledY);
        ctx.translate(0, translateY);
      }
      // Draw the active leds in dependence on the current value
      activeLeds = ((value - minValue) / (maxValue - minValue)) * fullSize;
      for (translateY = 0; translateY <= activeLeds; translateY += ledH + 1) {
        //check for LED color
        activeLedColor = valueColor;
        // Use a gradient for value colors?
        if (isGradientVisible) {
          // Convert pixel back to value
          currentValue = minValue + (translateY / fullSize) * (maxValue - minValue);
          gradRange = valueGradient.getEnd() - valueGradient.getStart();
          fraction = (currentValue - minValue) / gradRange;
          fraction = Math.max(Math.min(fraction, 1), 0);
          activeLedColor = customColorDef(valueGradient.getColorAt(fraction).getRgbaColor());
        } else if (isSectionsVisible) {
          for (i = 0; i < sectionPixels.length; i++) {
            if (translateY >= sectionPixels[i].start && translateY < sectionPixels[i].stop) {
              activeLedColor = sectionPixels[i].color;
              break;
            }
          }
        }
        // Has LED color changed? If so redraw the buffer
        if (lastActiveLedColor.medium.getHexColor() !== activeLedColor.medium.getHexColor()) {
          drawActiveLed(activeLedContext, activeLedColor);
          lastActiveLedColor = activeLedColor;
        }
        // Draw LED
        ctx.translate(0, -translateY);
        ctx.drawImage(activeLedBuffer, ledX, ledY);
        ctx.translate(0, translateY);
      }
    } else {
      // Draw the inactive leds
      inactiveLeds = fullSize;
      for (translateX = -(ledW / 2); translateX <= inactiveLeds; translateX += ledW + 1) {
        ctx.translate(translateX, 0);
        ctx.drawImage(inActiveLedBuffer, ledX, ledY);
        ctx.translate(-translateX, 0);
      }
      // Draw the active leds in dependence on the current value
      activeLeds = ((value - minValue) / (maxValue - minValue)) * fullSize;
      for (translateX = -(ledW / 2); translateX <= activeLeds; translateX += ledW + 1) {
        //check for LED color
        activeLedColor = valueColor;
        if (isGradientVisible) {
          // Convert pixel back to value
          currentValue = minValue + (translateX / fullSize) * (maxValue - minValue);
          gradRange = valueGradient.getEnd() - valueGradient.getStart();
          fraction = (currentValue - minValue) / gradRange;
          fraction = Math.max(Math.min(fraction, 1), 0);
          activeLedColor = customColorDef(valueGradient.getColorAt(fraction).getRgbaColor());
        } else if (isSectionsVisible) {
          for (i = 0; i < sectionPixels.length; i++) {
            if (translateX >= sectionPixels[i].start && translateX < sectionPixels[i].stop) {
              activeLedColor = sectionPixels[i].color;
              break;
            }
          }
        }
        // Has LED color changed? If so redraw the buffer
        if (lastActiveLedColor.medium.getHexColor() !== activeLedColor.medium.getHexColor()) {
          drawActiveLed(activeLedContext, activeLedColor);
          lastActiveLedColor = activeLedColor;
        }
        ctx.translate(translateX, 0);
        ctx.drawImage(activeLedBuffer, ledX, ledY);
        ctx.translate(-translateX, 0);
      }
    }
  };

  var drawInActiveLed = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();
    var ledCenterX = (ctx.canvas.width / 2);
    var ledCenterY = (ctx.canvas.height / 2);
    var ledGradient = mainCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, ctx.canvas.width / 2);
    ledGradient.addColorStop(0, '#3c3c3c');
    ledGradient.addColorStop(1, '#323232');
    ctx.fillStyle = ledGradient;
    ctx.fill();
    ctx.restore();
  };

  var drawActiveLed = function(ctx, color) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();
    var ledCenterX = (ctx.canvas.width / 2);
    var ledCenterY = (ctx.canvas.height / 2);
    var outerRadius;
    if (vertical) {
      outerRadius = ctx.canvas.width / 2;
    } else {
      outerRadius = ctx.canvas.height / 2;
    }
    var ledGradient = mainCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, outerRadius);
    ledGradient.addColorStop(0, color.light.getRgbaColor());
    ledGradient.addColorStop(1, color.dark.getRgbaColor());
    ctx.fillStyle = ledGradient;
    ctx.fill();
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
      //tween = new Tween(new Object(), '', Tween.strongEaseInOut, value, targetValue, 1);
      tween.onMotionChanged = function(event) {
        value = event.target._pos;

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

        if (value > maxMeasuredValue) {
          maxMeasuredValue = value;
        }
        if (value < minMeasuredValue) {
          minMeasuredValue = value;
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
      bargraphled: true
    });
    valueColor = newValueColor;
    init({
      bargraphled: true
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

  this.setSection = function(areaSec) {
    section = areaSec;
    init();
    this.repaint();
    return this;
  };

  this.setSectionActive = function(value) {
    useSectionColors = value;
    init();
    this.repaint();
    return this;
  };

  this.setGradient = function(grad) {
    valueGradient = grad;
    init();
    this.repaint();
    return this;
  };

  this.setGradientActive = function(value) {
    useValueGradient = value;
    init();
    this.repaint();
    return this;
  };

  this.setMaxMeasuredValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
    if (maxMeasuredValue !== targetValue) {
      maxMeasuredValue = targetValue;
      this.repaint();
    }
    return this;
  };

  this.setMinMeasuredValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
    if (minMeasuredValue !== targetValue) {
      minMeasuredValue = targetValue;
      this.repaint();
    }
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

  this.setMinValue = function(newValue) {
    minValue = parseFloat(newValue);
    resetBuffers({
      background: true
    });
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.getMinValue = function() {
    return minValue;
  };

  this.setMaxValue = function(newValue) {
    maxValue = parseFloat(newValue);
    resetBuffers({
      background: true
    });
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.getMaxValue = function() {
    return maxValue;
  };

  this.setThreshold = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
    if (threshold !== targetValue) {
      threshold = targetValue;
      resetBuffers({
        background: true
      });
      init({
        background: true
      });
      this.repaint();
    }
    return this;
  };

  this.setThresholdVisible = function(visible) {
    thresholdVisible = !!visible;
    this.repaint();
    return this;
  };

  this.repaint = function() {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        pointer: true,
        foreground: true,
        bargraphled: true
      });
    }

    //mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0);
    }

    // Draw buffered image to visible canvas
    if (backgroundVisible) {
      mainCtx.drawImage(backgroundBuffer, 0, 0);
    }

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(mainCtx, value, vertical);
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
    }
    var valuePos;
    var minMaxX, minMaxY;
    // Draw min measured value indicator
    if (minMeasuredValueVisible) {
      if (vertical) {
        valuePos = imageHeight * 0.856796 - (imageHeight * 0.728155) * (minMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * 0.34 - minMeasuredValueBuffer.width;
        minMaxY = valuePos - minMeasuredValueBuffer.height / 2;
      } else {
        valuePos = ((imageWidth * 0.856796) - (imageWidth * 0.128640)) * (minMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * 0.142857 - minMeasuredValueBuffer.height / 2 + valuePos;
        minMaxY = imageHeight * 0.65;
      }
      mainCtx.drawImage(minMeasuredValueBuffer, minMaxX, minMaxY);
    }

    // Draw max measured value indicator
    if (maxMeasuredValueVisible) {
      if (vertical) {
        valuePos = imageHeight * 0.856796 - (imageHeight * 0.728155) * (maxMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * 0.34 - maxMeasuredValueBuffer.width;
        minMaxY = valuePos - maxMeasuredValueBuffer.height / 2;
      } else {
        valuePos = ((imageWidth * 0.856796) - (imageWidth * 0.128640)) * (maxMeasuredValue - minValue) / (maxValue - minValue);
        minMaxX = imageWidth * 0.142857 - maxMeasuredValueBuffer.height / 2 + valuePos;
        minMaxY = imageHeight * 0.65;
      }
      mainCtx.drawImage(maxMeasuredValueBuffer, minMaxX, minMaxY);
    }

    mainCtx.save();
    drawValue(mainCtx, imageWidth, imageHeight);
    mainCtx.restore();

    // Draw foreground
    if (foregroundVisible) {
      mainCtx.drawImage(foregroundBuffer, 0, 0);
    }

    repainting = false;
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default LinearBargraph;

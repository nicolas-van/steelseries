import Tween from "./tween.js";
import drawPointerImage from "./drawPointerImage";
import drawRadialFrameImage from "./drawRadialFrameImage";
import drawRadialBackgroundImage from "./drawRadialBackgroundImage";
import drawRadialForegroundImage from "./drawRadialForegroundImage";
import createKnobImage from "./createKnobImage";
import createLedImage from "./createLedImage";
import createMeasuredValueImage from "./createMeasuredValueImage";
import {
calcNiceNumber, 
createBuffer, 
requestAnimFrame, 
getCanvasContext,
HALF_PI,
PI,
doc,
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

var radialVertical = function(canvas, parameters) {
  parameters = parameters || {};
  var orientation = (undefined === parameters.orientation ? Orientation.NORTH : parameters.orientation),
    size = (undefined === parameters.size ? 0 : parameters.size),
    minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
    maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
    niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
    threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue : parameters.threshold),
    section = (undefined === parameters.section ? null : parameters.section),
    area = (undefined === parameters.area ? null : parameters.area),
    titleString = (undefined === parameters.titleString ? '' : parameters.titleString),
    unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
    frameDesign = (undefined === parameters.frameDesign ? FrameDesign.METAL : parameters.frameDesign),
    frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible),
    backgroundColor = (undefined === parameters.backgroundColor ? BackgroundColor.DARK_GRAY : parameters.backgroundColor),
    backgroundVisible = (undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible),
    pointerType = (undefined === parameters.pointerType ? PointerType.TYPE1 : parameters.pointerType),
    pointerColor = (undefined === parameters.pointerColor ? ColorDef.RED : parameters.pointerColor),
    knobType = (undefined === parameters.knobType ? KnobType.STANDARD_KNOB : parameters.knobType),
    knobStyle = (undefined === parameters.knobStyle ? KnobStyle.SILVER : parameters.knobStyle),
    ledColor = (undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor),
    ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
    thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
    thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
    minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
    maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
    foregroundType = (undefined === parameters.foregroundType ? ForegroundType.TYPE1 : parameters.foregroundType),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    labelNumberFormat = (undefined === parameters.labelNumberFormat ? LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
    playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
    alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
    fullScaleDeflectionTime = (undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime);

  // Get the canvas context and clear it
  var mainCtx = getCanvasContext(canvas);
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size;
  mainCtx.canvas.height = size;

  // Create audio tag for alarm sound
  if (playAlarm && alarmSound !== false) {
    var audioElement = doc.createElement('audio');
    audioElement.setAttribute('src', alarmSound);
    audioElement.setAttribute('preload', 'auto');
  }
  var gaugeType = GaugeType.TYPE5;

  var self = this;
  var value = minValue;

  // Properties
  var minMeasuredValue = maxValue;
  var maxMeasuredValue = minValue;
  var imageWidth = size;
  var imageHeight = size;

  var ledBlinking = false;

  var ledTimerId = 0;
  var tween;
  var repainting = false;

  // Tickmark specific private variables
  var niceMinValue = minValue;
  var niceMaxValue = maxValue;
  var niceRange = maxValue - minValue;
  var range = niceMaxValue - niceMinValue;
  var minorTickSpacing = 0;
  var majorTickSpacing = 0;
  var maxNoOfMinorTicks = 10;
  var maxNoOfMajorTicks = 10;

  var freeAreaAngle = 0;
  var rotationOffset = 1.25 * PI;
  var tickmarkOffset = 1.25 * PI;
  var angleRange = HALF_PI;
  var angleStep = angleRange / range;
  var shadowOffset = imageWidth * 0.006;
  var pointerOffset = imageWidth * 1.17 / 2;

  var initialized = false;

  var angle = rotationOffset + (value - minValue) * angleStep;

  var centerX = imageWidth / 2;
  var centerY = imageHeight * 0.733644;

  // Misc
  var ledPosX = 0.455 * imageWidth;
  var ledPosY = 0.51 * imageHeight;

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

    freeAreaAngle = 0;
    rotationOffset = 1.25 * PI;
    tickmarkOffset = 1.25 * PI;
    angleRange = HALF_PI;
    angleStep = angleRange / range;

    angle = rotationOffset + (value - minValue) * angleStep;
  };

  // **************   Buffer creation  ********************
  // Buffer for the frame
  var frameBuffer = createBuffer(size, size);
  var frameContext = frameBuffer.getContext('2d');

  // Buffer for the background
  var backgroundBuffer = createBuffer(size, size);
  var backgroundContext = backgroundBuffer.getContext('2d');

  // Buffer for led on painting code
  var ledBufferOn = createBuffer(size * 0.093457, size * 0.093457);
  var ledContextOn = ledBufferOn.getContext('2d');

  // Buffer for led off painting code
  var ledBufferOff = createBuffer(size * 0.093457, size * 0.093457);
  var ledContextOff = ledBufferOff.getContext('2d');

  // Buffer for current led painting code
  var ledBuffer = ledBufferOff;

  // Buffer for the minMeasuredValue indicator
  var minMeasuredValueBuffer = createBuffer(Math.ceil(size * 0.028037), Math.ceil(size * 0.028037));
  var minMeasuredValueCtx = minMeasuredValueBuffer.getContext('2d');

  // Buffer for the maxMeasuredValue indicator
  var maxMeasuredValueBuffer = createBuffer(Math.ceil(size * 0.028037), Math.ceil(size * 0.028037));
  var maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext('2d');

  // Buffer for pointer image painting code
  var pointerBuffer = createBuffer(size, size);
  var pointerContext = pointerBuffer.getContext('2d');

  // Buffer for static foreground painting code
  var foregroundBuffer = createBuffer(size, size);
  var foregroundContext = foregroundBuffer.getContext('2d');

  // **************   Image creation  ********************
  var drawPostsImage = function(ctx) {
    if ('type5' === gaugeType.type) {
      ctx.save();
      if (orientation.type === 'west') {
        // Min post
        ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.44, imageHeight * 0.80);
        // Max post
        ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.44, imageHeight * 0.16);
      } else if (orientation.type === 'east') {
        // Min post
        ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.52, imageHeight * 0.80);
        // Max post
        ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.52, imageHeight * 0.16);
      } else {
        // Min post
        ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.2 - imageHeight * 0.037383, imageHeight * 0.446666);
        // Max post
        ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.8, imageHeight * 0.446666);
      }
      ctx.restore();
    }
  };

  var createThresholdImage = function() {
    var thresholdBuffer = doc.createElement('canvas');
    thresholdBuffer.width = Math.ceil(size * 0.046728);
    thresholdBuffer.height = Math.ceil(thresholdBuffer.width * 0.9);
    var thresholdCtx = thresholdBuffer.getContext('2d');

    thresholdCtx.save();
    var gradThreshold = thresholdCtx.createLinearGradient(0, 0.1, 0, thresholdBuffer.height * 0.9);
    gradThreshold.addColorStop(0, '#520000');
    gradThreshold.addColorStop(0.3, '#fc1d00');
    gradThreshold.addColorStop(0.59, '#fc1d00');
    gradThreshold.addColorStop(1, '#520000');
    thresholdCtx.fillStyle = gradThreshold;

    thresholdCtx.beginPath();
    thresholdCtx.moveTo(thresholdBuffer.width * 0.5, 0.1);
    thresholdCtx.lineTo(thresholdBuffer.width * 0.9, thresholdBuffer.height * 0.9);
    thresholdCtx.lineTo(thresholdBuffer.width * 0.1, thresholdBuffer.height * 0.9);
    thresholdCtx.lineTo(thresholdBuffer.width * 0.5, 0.1);
    thresholdCtx.closePath();

    thresholdCtx.fill();
    thresholdCtx.strokeStyle = '#FFFFFF';
    thresholdCtx.stroke();

    thresholdCtx.restore();

    return thresholdBuffer;
  };

  var drawAreaSectionImage = function(ctx, start, stop, color, filled) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = imageWidth * 0.035;
    var startAngle = (angleRange / range * start - angleRange / range * minValue);
    var stopAngle = startAngle + (stop - start) / (range / angleRange);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationOffset);
    ctx.beginPath();
    if (filled) {
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, imageWidth * 0.365 - ctx.lineWidth / 2, startAngle, stopAngle, false);
    } else {
      ctx.arc(0, 0, imageWidth * 0.365, startAngle, stopAngle, false);
    }
    if (filled) {
      ctx.moveTo(0, 0);
      ctx.fill();
    } else {
      ctx.stroke();
    }

    ctx.translate(-centerX, -centerY);
    ctx.restore();
  };

  var drawTitleImage = function(ctx) {
    var titleWidth, unitWidth;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();

    ctx.font = 0.046728 * imageWidth + 'px ' + stdFontName;
    titleWidth = ctx.measureText(titleString).width;
    ctx.fillText(titleString, (imageWidth - titleWidth) / 2, imageHeight * 0.4, imageWidth * 0.3);
    unitWidth = ctx.measureText(unitString).width;
    ctx.fillText(unitString, (imageWidth - unitWidth) / 2, imageHeight * 0.47, imageWidth * 0.2);

    ctx.restore();
  };

  var drawTickmarksImage = function(ctx, labelNumberFormat) {
    backgroundColor.labelColor.setAlpha(1);
    ctx.save();

    if (Orientation.WEST === orientation) {
      ctx.translate(centerX, centerX);
      ctx.rotate(-HALF_PI);
      ctx.translate(-centerX, -centerX);
    }
    if (Orientation.EAST === orientation) {
      ctx.translate(centerX, centerX);
      ctx.rotate(HALF_PI);
      ctx.translate(-centerX, -centerX);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var fontSize = Math.ceil(imageWidth * 0.04);
    ctx.font = fontSize + 'px ' + stdFontName;
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationOffset);
    var rotationStep = angleStep * minorTickSpacing;
    var textRotationAngle;

    var valueCounter = minValue;
    var majorTickCounter = maxNoOfMinorTicks - 1;

    var OUTER_POINT = imageWidth * 0.44;
    var MAJOR_INNER_POINT = imageWidth * 0.41;
    var MED_INNER_POINT = imageWidth * 0.415;
    var MINOR_INNER_POINT = imageWidth * 0.42;
    var TEXT_TRANSLATE_X = imageWidth * 0.48;
    var TEXT_WIDTH = imageWidth * 0.04;
    var HALF_MAX_NO_OF_MINOR_TICKS = maxNoOfMinorTicks / 2;
    var MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2));
    var i;

    for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
      textRotationAngle = +rotationStep + HALF_PI;
      majorTickCounter++;
      // Draw major tickmarks
      if (majorTickCounter === maxNoOfMinorTicks) {
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(OUTER_POINT, 0);
        ctx.lineTo(MAJOR_INNER_POINT, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.save();
        ctx.translate(TEXT_TRANSLATE_X, 0);
        ctx.rotate(textRotationAngle);
        switch (labelNumberFormat.format) {
          case 'fractional':
            ctx.fillText((valueCounter.toFixed(2)), 0, 0, TEXT_WIDTH);
            break;

          case 'scientific':
            ctx.fillText((valueCounter.toPrecision(2)), 0, 0, TEXT_WIDTH);
            break;

          case 'standard':
            /* falls through */
          default:
            ctx.fillText((valueCounter.toFixed(0)), 0, 0, TEXT_WIDTH);
            break;
        }
        ctx.translate(-TEXT_TRANSLATE_X, 0);
        ctx.restore();

        valueCounter += majorTickSpacing;
        majorTickCounter = 0;
        ctx.rotate(rotationStep);
        continue;
      }

      // Draw tickmark every minor tickmark spacing
      if (0 === maxNoOfMinorTicks % 2 && majorTickCounter === (HALF_MAX_NO_OF_MINOR_TICKS)) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(OUTER_POINT, 0);
        ctx.lineTo(MED_INNER_POINT, 0);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(OUTER_POINT, 0);
        ctx.lineTo(MINOR_INNER_POINT, 0);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.rotate(rotationStep);
    }

    /*
     // Logarithmic scale
     var tmp = 0.1;
     var minValueLog10 = 0.1;
     var maxValueLog10 = parseInt(Math.pow(10, Math.ceil(Math.log10(maxValue))));
     var drawLabel = true;
     angleStep = angleRange / (maxValueLog10 - minValueLog10)
     for (var scaleFactor = minValueLog10 ; scaleFactor <= maxValueLog10 ; scaleFactor *= 10)
     {
     for (var i = parseFloat((1 * scaleFactor).toFixed(1)) ; i < parseFloat((10 * scaleFactor).toFixed(1)) ; i += scaleFactor)
     {
     textRotationAngle =+ rotationStep + HALF_PI;

     if(drawLabel)
     {
     ctx.lineWidth = 1.5;
     ctx.beginPath();
     ctx.moveTo(imageWidth * 0.38,0);
     ctx.lineTo(imageWidth * 0.35,0);
     ctx.closePath();
     ctx.stroke();
     ctx.save();
     ctx.translate(imageWidth * 0.31, 0);
     ctx.rotate(textRotationAngle);
     ctx.fillText(parseFloat((i).toFixed(1)), 0, 0, imageWidth * 0.0375);
     ctx.translate(-imageWidth * 0.31, 0);
     ctx.restore();
     drawLabel = false;
     }
     else
     {
     ctx.lineWidth = 0.5;
     ctx.beginPath();
     ctx.moveTo(imageWidth * 0.38,0);
     ctx.lineTo(imageWidth * 0.36,0);
     ctx.closePath();
     ctx.stroke();
     }
     //doc.write('log10 scale value: ' + parseFloat((i).toFixed(1)) + '<br>');
     //Math.log10(parseFloat((i).toFixed(1)));

     ctx.rotate(rotationStep);
     }
     tmp = 0.1;
     drawLabel = true;
     }
     */

    ctx.translate(-centerX, -centerY);
    ctx.restore();
  };

  // **************   Initialization  ********************
  // Draw all static painting code to background
  var init = function(parameters) {
    parameters = parameters || {};
    var drawFrame = (undefined === parameters.frame ? false : parameters.frame);
    var drawBackground = (undefined === parameters.background ? false : parameters.background);
    var drawLed = (undefined === parameters.led ? false : parameters.led);
    var drawPointer = (undefined === parameters.pointer ? false : parameters.pointer);
    var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);

    initialized = true;

    // Calculate the current min and max values and the range
    calculate();

    // Create frame in frame buffer (backgroundBuffer)
    if (drawFrame && frameVisible) {
      drawRadialFrameImage(frameContext, frameDesign, centerX, size / 2, imageWidth, imageHeight);
    }

    // Create background in background buffer (backgroundBuffer)
    if (drawBackground && backgroundVisible) {
      drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, size / 2, imageWidth, imageHeight);
    }

    // Draw LED ON in ledBuffer_ON
    if (drawLed) {
      ledContextOn.drawImage(createLedImage(Math.ceil(size * 0.093457), 1, ledColor), 0, 0);

      // Draw LED ON in ledBuffer_OFF
      ledContextOff.drawImage(createLedImage(Math.ceil(size * 0.093457), 0, ledColor), 0, 0);
    }

    // Draw min measured value indicator in minMeasuredValueBuffer
    if (minMeasuredValueVisible) {
      minMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), ColorDef.BLUE.dark.getRgbaColor(), true, true), 0, 0);
      minMeasuredValueCtx.restore();
    }

    // Draw max measured value indicator in maxMeasuredValueBuffer
    if (maxMeasuredValueVisible) {
      maxMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), ColorDef.RED.medium.getRgbaColor(), true), 0, 0);
      maxMeasuredValueCtx.restore();
    }

    // Create alignment posts in background buffer (backgroundBuffer)
    if (drawBackground && backgroundVisible) {
      drawPostsImage(backgroundContext);

      // Create section in background buffer (backgroundBuffer)
      if (null !== section && 0 < section.length) {
        backgroundContext.save();
        if (Orientation.WEST === orientation) {
          backgroundContext.translate(centerX, centerX);
          backgroundContext.rotate(-HALF_PI);
          backgroundContext.translate(-centerX, -centerX);
        } else if (Orientation.EAST === orientation) {
          backgroundContext.translate(centerX, centerX);
          backgroundContext.rotate(HALF_PI);
          backgroundContext.translate(-centerX, -centerX);
        }
        var sectionIndex = section.length;
        do {
          sectionIndex--;
          drawAreaSectionImage(backgroundContext, section[sectionIndex].start, section[sectionIndex].stop, section[sectionIndex].color, false);
        }
        while (0 < sectionIndex);
        backgroundContext.restore();
      }

      // Create area in background buffer (backgroundBuffer)
      if (null !== area && 0 < area.length) {
        if (Orientation.WEST === orientation) {
          backgroundContext.translate(centerX, centerX);
          backgroundContext.rotate(-HALF_PI);
          backgroundContext.translate(-centerX, -centerX);
        }
        if (Orientation.EAST === orientation) {
          backgroundContext.translate(centerX, centerX);
          backgroundContext.rotate(HALF_PI);
          backgroundContext.translate(-centerX, -centerX);
        }
        var areaIndex = area.length;
        do {
          areaIndex--;
          drawAreaSectionImage(backgroundContext, area[areaIndex].start, area[areaIndex].stop, area[areaIndex].color, true);
        }
        while (0 < areaIndex);
        backgroundContext.restore();
      }

      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat);

      // Create title in background buffer (backgroundBuffer)
      drawTitleImage(backgroundContext);
    }

    // Draw threshold image to background context
    if (thresholdVisible) {
      backgroundContext.save();
      if (Orientation.WEST === orientation) {
        backgroundContext.translate(centerX, centerX);
        backgroundContext.rotate(-HALF_PI);
        backgroundContext.translate(-centerX, -centerX);
      }
      if (Orientation.EAST === orientation) {
        backgroundContext.translate(centerX, centerX);
        backgroundContext.rotate(HALF_PI);
        backgroundContext.translate(-centerX, -centerX);
      }
      backgroundContext.translate(centerX, centerY);
      backgroundContext.rotate(rotationOffset + (threshold - minValue) * angleStep + HALF_PI);
      backgroundContext.translate(-centerX, -centerY);
      backgroundContext.drawImage(createThresholdImage(), imageWidth * 0.475, imageHeight * 0.32);
      backgroundContext.restore();
    }

    // Create pointer image in pointer buffer (contentBuffer)
    if (drawPointer) {
      drawPointerImage(pointerContext, imageWidth * 1.17, pointerType, pointerColor, backgroundColor.labelColor);

    }

    // Create foreground in foreground buffer (foregroundBuffer)
    if (drawForeground && foregroundVisible) {
      var knobVisible = (pointerType.type === 'type15' || pointerType.type === 'type16' ? false : true);
      drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, knobVisible, knobType, knobStyle, gaugeType, orientation);
    }
  };

  var resetBuffers = function(buffers) {
    buffers = buffers || {};
    var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
    var resetBackground = (undefined === buffers.background ? false : buffers.background);
    var resetLed = (undefined === buffers.led ? false : buffers.led);
    var resetPointer = (undefined === buffers.pointer ? false : buffers.pointer);
    var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);

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

    if (resetLed) {
      ledBufferOn.width = Math.ceil(size * 0.093457);
      ledBufferOn.height = Math.ceil(size * 0.093457);
      ledContextOn = ledBufferOn.getContext('2d');

      ledBufferOff.width = Math.ceil(size * 0.093457);
      ledBufferOff.height = Math.ceil(size * 0.093457);
      ledContextOff = ledBufferOff.getContext('2d');

      // Buffer for current led painting code
      ledBuffer = ledBufferOff;
    }

    if (resetPointer) {
      pointerBuffer.width = size;
      pointerBuffer.height = size;
      pointerContext = pointerBuffer.getContext('2d');
    }

    if (resetForeground) {
      foregroundBuffer.width = size;
      foregroundBuffer.height = size;
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
    newValue = parseFloat(newValue);
    var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue)),
      gauge = this,
      time;

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

  this.setMaxMeasuredValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
    maxMeasuredValue = targetValue;
    this.repaint();
    return this;
  };

  this.setMinMeasuredValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
    minMeasuredValue = targetValue;
    this.repaint();
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
      pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false) // type2 & 13 depend on background
    });
    backgroundColor = newBackgroundColor;
    init({
      background: true,
      pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false) // type2 & 13 depend on background
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

  this.setPointerType = function(newPointerType) {
    resetBuffers({
      pointer: true,
      foreground: true // Required as type15 does not need a knob
    });
    pointerType = newPointerType;
    init({
      pointer: true,
      foreground: true
    });
    this.repaint();
    return this;
  };

  this.setPointerColor = function(newPointerColor) {
    resetBuffers({
      pointer: true
    });
    pointerColor = newPointerColor;
    init({
      pointer: true
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

  this.repaint = function() {
    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        pointer: true,
        foreground: true
      });
    }

    mainCtx.clearRect(0, 0, size, size);
    mainCtx.save();

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0);
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0);

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
    }

    if (Orientation.WEST === orientation) {
      mainCtx.translate(centerX, centerX);
      mainCtx.rotate(-HALF_PI);
      mainCtx.translate(-centerX, -centerX);
    }
    if (Orientation.EAST === orientation) {
      mainCtx.translate(centerX, centerX);
      mainCtx.rotate(HALF_PI);
      mainCtx.translate(-centerX, -centerX);
    }

    // Draw min measured value indicator
    if (minMeasuredValueVisible) {
      mainCtx.save();
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate(rotationOffset + HALF_PI + (minMeasuredValue - minValue) * angleStep);
      mainCtx.translate(-centerX, -centerY);
      mainCtx.drawImage(minMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.27);
      mainCtx.restore();
    }

    // Draw max measured value indicator
    if (maxMeasuredValueVisible) {
      mainCtx.save();
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate(rotationOffset + HALF_PI + (maxMeasuredValue - minValue) * angleStep);
      mainCtx.translate(-centerX, -centerY);
      mainCtx.drawImage(maxMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.27);
      mainCtx.restore();
    }

    angle = rotationOffset + HALF_PI + (value - minValue) * angleStep;

    // Define rotation center
    mainCtx.save();
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate(angle);
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
    mainCtx.shadowBlur = shadowOffset * 2;
    // Draw pointer
    mainCtx.translate(-pointerOffset, -pointerOffset);
    mainCtx.drawImage(pointerBuffer, 0, 0);
    // Undo the translations & shadow settings
    mainCtx.restore();

    // Draw foreground
    if (foregroundVisible) {
      if (Orientation.WEST === orientation) {
        mainCtx.translate(centerX, centerX);
        mainCtx.rotate(HALF_PI);
        mainCtx.translate(-centerX, -centerX);
      } else if (Orientation.EAST === orientation) {
        mainCtx.translate(centerX, centerX);
        mainCtx.rotate(-HALF_PI);
        mainCtx.translate(-centerX, -centerX);
      }
      mainCtx.drawImage(foregroundBuffer, 0, 0);
    }
    mainCtx.restore();

    repainting = false;
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default radialVertical;

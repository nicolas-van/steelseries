import Tween from "./tween.js";
import drawPointerImage from "./drawPointerImage";
import drawRadialFrameImage from "./drawRadialFrameImage";
import drawRadialBackgroundImage from "./drawRadialBackgroundImage";
import drawRadialCustomImage from "./drawRadialCustomImage";
import drawRadialForegroundImage from "./drawRadialForegroundImage";
import createKnobImage from "./createKnobImage";
import createLedImage from "./createLedImage";
import createLcdBackgroundImage from "./createLcdBackgroundImage";
import createMeasuredValueImage from "./createMeasuredValueImage";
import createTrendIndicator from "./createTrendIndicator";
import drawTitleImage from "./drawTitleImage";
import {
calcNiceNumber, 
createBuffer, 
requestAnimFrame, 
getCanvasContext,
HALF_PI,
TWO_PI,
PI,
RAD_FACTOR,
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

import Odometer from './Odometer';

var Radial = function(canvas, parameters) {
  parameters = parameters || {};
  var gaugeType = (undefined === parameters.gaugeType ? GaugeType.TYPE4 : parameters.gaugeType),
    size = (undefined === parameters.size ? 0 : parameters.size),
    minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
    maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
    niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
    threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue : parameters.threshold),
    thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
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
    lcdColor = (undefined === parameters.lcdColor ? LcdColor.STANDARD : parameters.lcdColor),
    lcdVisible = (undefined === parameters.lcdVisible ? true : parameters.lcdVisible),
    lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
    digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
    fractionalScaleDecimals = (undefined === parameters.fractionalScaleDecimals ? 1 : parameters.fractionalScaleDecimals),
    ledColor = (undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor),
    ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
    userLedColor = (undefined === parameters.userLedColor ? LedColor.GREEN_LED : parameters.userLedColor),
    userLedVisible = (undefined === parameters.userLedVisible ? false : parameters.userLedVisible),
    thresholdVisible = (undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible),
    minMeasuredValueVisible = (undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible),
    maxMeasuredValueVisible = (undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible),
    foregroundType = (undefined === parameters.foregroundType ? ForegroundType.TYPE1 : parameters.foregroundType),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    labelNumberFormat = (undefined === parameters.labelNumberFormat ? LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
    playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
    alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
    customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
    tickLabelOrientation = (undefined === parameters.tickLabelOrientation ? (gaugeType === GaugeType.TYPE1 ? TickLabelOrientation.TANGENT : TickLabelOrientation.NORMAL) : parameters.tickLabelOrientation),
    trendVisible = (undefined === parameters.trendVisible ? false : parameters.trendVisible),
    trendColors = (undefined === parameters.trendColors ? [LedColor.RED_LED, LedColor.GREEN_LED, LedColor.CYAN_LED] : parameters.trendColors),
    useOdometer = (undefined === parameters.useOdometer ? false : parameters.useOdometer),
    odometerParams = (undefined === parameters.odometerParams ? {} : parameters.odometerParams),
    odometerUseValue = (undefined === parameters.odometerUseValue ? false : parameters.odometerUseValue),
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
  var audioElement;
  if (playAlarm && alarmSound !== false) {
    audioElement = doc.createElement('audio');
    audioElement.setAttribute('src', alarmSound);
    audioElement.setAttribute('preload', 'auto');
  }

  var value = minValue;
  var odoValue = minValue;
  var self = this;

  // Properties
  var minMeasuredValue = maxValue;
  var maxMeasuredValue = minValue;

  var ledBlinking = false;
  var userLedBlinking = false;

  var ledTimerId = 0;
  var userLedTimerId = 0;
  var tween;
  var repainting = false;

  var trendIndicator = TrendState.OFF;
  var trendSize = size * 0.06;
  var trendPosX = size * 0.29;
  var trendPosY = size * 0.36;

  // GaugeType specific private variables
  var freeAreaAngle;
  var rotationOffset;
  var tickmarkOffset;
  var angleRange;
  var angleStep;

  var angle = rotationOffset + (value - minValue) * angleStep;

  var imageWidth = size;
  var imageHeight = size;

  var centerX = imageWidth / 2;
  var centerY = imageHeight / 2;

  // Misc
  var ledSize = size * 0.093457;
  var ledPosX = 0.6 * imageWidth;
  var ledPosY = 0.4 * imageHeight;
  var userLedPosX = gaugeType === GaugeType.TYPE3 ? 0.6 * imageWidth : centerX - ledSize / 2;
  var userLedPosY = gaugeType === GaugeType.TYPE3 ? 0.72 * imageHeight : 0.75 * imageHeight;
  var lcdFontHeight = Math.floor(imageWidth / 10);
  var stdFont = lcdFontHeight + 'px ' + stdFontName;
  var lcdFont = lcdFontHeight + 'px ' + lcdFontName;
  var lcdHeight = imageHeight * 0.13;
  var lcdWidth = imageWidth * 0.4;
  var lcdPosX = (imageWidth - lcdWidth) / 2;
  var lcdPosY = imageHeight * 0.57;
  var odoPosX, odoPosY = imageHeight * 0.61;
  var shadowOffset = imageWidth * 0.006;

  // Constants
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
      majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
      minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
    }
    // Make sure values are still in range
    value = value < minValue ? minValue : value > maxValue ? maxValue : value;
    minMeasuredValue = minMeasuredValue < minValue ? minValue : minMeasuredValue > maxValue ? maxValue : minMeasuredValue;
    maxMeasuredValue = maxMeasuredValue < minValue ? minValue : maxMeasuredValue > maxValue ? maxValue : maxMeasuredValue;
    threshold = threshold < minValue ? minValue : threshold > maxValue ? maxValue : threshold;

    switch (gaugeType.type) {
      case 'type1':
        freeAreaAngle = 0;
        rotationOffset = PI;
        tickmarkOffset = HALF_PI;
        angleRange = HALF_PI;
        angleStep = angleRange / range;
        break;

      case 'type2':
        freeAreaAngle = 0;
        rotationOffset = PI;
        tickmarkOffset = HALF_PI;
        angleRange = PI;
        angleStep = angleRange / range;
        break;

      case 'type3':
        freeAreaAngle = 0;
        rotationOffset = HALF_PI;
        tickmarkOffset = 0;
        angleRange = 1.5 * PI;
        angleStep = angleRange / range;
        break;

      case 'type4':
        /* falls through */
      default:
        freeAreaAngle = 60 * RAD_FACTOR;
        rotationOffset = HALF_PI + (freeAreaAngle / 2);
        tickmarkOffset = 0;
        angleRange = TWO_PI - freeAreaAngle;
        angleStep = angleRange / range;
        break;
    }
    angle = rotationOffset + (value - minValue) * angleStep;
  };

  // **************   Buffer creation  ********************
  // Buffer for the frame
  var frameBuffer = createBuffer(size, size);
  var frameContext = frameBuffer.getContext('2d');

  // Buffer for the background
  var backgroundBuffer = createBuffer(size, size);
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

  // Buffer for user led on painting code
  var userLedBufferOn = createBuffer(ledSize, ledSize);
  var userLedContextOn = userLedBufferOn.getContext('2d');

  // Buffer for user led off painting code
  var userLedBufferOff = createBuffer(ledSize, ledSize);
  var userLedContextOff = userLedBufferOff.getContext('2d');

  // Buffer for current user led painting code
  var userLedBuffer = userLedBufferOff;

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

  // Buffers for trend indicators
  var trendUpBuffer, trendSteadyBuffer, trendDownBuffer, trendOffBuffer;

  // Buffer for odometer
  var odoGauge, odoBuffer, odoContext;
  if (useOdometer && lcdVisible) {
    odoBuffer = createBuffer(10, 10); // size doesn't matter, it will get reset by odometer code
    odoContext = odoBuffer.getContext('2d');
  }

  // **************   Image creation  ********************
  var drawLcdText = function(ctx, value) {
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'right';
    ctx.strokeStyle = lcdColor.textColor;
    ctx.fillStyle = lcdColor.textColor;

    if (lcdColor === LcdColor.STANDARD || lcdColor === LcdColor.STANDARD_GREEN) {
      ctx.shadowColor = 'gray';
      ctx.shadowOffsetX = imageWidth * 0.007;
      ctx.shadowOffsetY = imageWidth * 0.007;
      ctx.shadowBlur = imageWidth * 0.007;
    }
    if (digitalFont) {
      ctx.font = lcdFont;
    } else {
      ctx.font = stdFont;
    }
    ctx.fillText(value.toFixed(lcdDecimals), lcdPosX + lcdWidth - lcdWidth * 0.05, lcdPosY + lcdHeight * 0.5 + lcdFontHeight * 0.38, lcdWidth * 0.9);

    ctx.restore();
  };

  var drawPostsImage = function(ctx) {
    ctx.save();

    if ('type1' === gaugeType.type) {
      // Draw max center top post
      ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.523364, imageHeight * 0.130841);
    }

    if ('type1' === gaugeType.type || 'type2' === gaugeType.type) {
      // Draw min left post
      ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.130841, imageHeight * 0.514018);
    }

    if ('type2' === gaugeType.type || 'type3' === gaugeType.type) {
      // Draw max right post
      ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.831775, imageHeight * 0.514018);
    }

    if ('type3' === gaugeType.type) {
      // Draw min center bottom post
      ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.523364, imageHeight * 0.831775);
    }

    if ('type4' === gaugeType.type) {
      // Min post
      ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.336448, imageHeight * 0.803738);

      // Max post
      ctx.drawImage(createKnobImage(Math.ceil(imageHeight * 0.037383), KnobType.STANDARD_KNOB, knobStyle), imageWidth * 0.626168, imageHeight * 0.803738);
    }

    ctx.restore();

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
    if (start < minValue) {
      start = minValue;
    } else if (start > maxValue) {
      start = maxValue;
    }
    if (stop < minValue) {
      stop = minValue;
    } else if (stop > maxValue) {
      stop = maxValue;
    }
    if (start >= stop) {
      return;
    }
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

  var drawTickmarksImage = function(ctx, labelNumberFormat) {
    var fontSize = Math.ceil(imageWidth * 0.04),
      alpha = rotationOffset, // Tracks total rotation
      rotationStep = angleStep * minorTickSpacing,
      textRotationAngle,
      valueCounter = minValue,
      majorTickCounter = maxNoOfMinorTicks - 1,
      OUTER_POINT = imageWidth * 0.38,
      MAJOR_INNER_POINT = imageWidth * 0.35,
      MED_INNER_POINT = imageWidth * 0.355,
      MINOR_INNER_POINT = imageWidth * 0.36,
      TEXT_TRANSLATE_X = imageWidth * 0.3,
      TEXT_WIDTH = imageWidth * 0.1,
      HALF_MAX_NO_OF_MINOR_TICKS = maxNoOfMinorTicks / 2,
      MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2)),
      i;

    backgroundColor.labelColor.setAlpha(1);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fontSize + 'px ' + stdFontName;
    ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationOffset);

    if (gaugeType.type === 'type1' || gaugeType.type === 'type2') {
      TEXT_WIDTH = imageWidth * 0.04;
    }

    for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
      textRotationAngle = rotationStep + HALF_PI;
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

        switch (tickLabelOrientation.type) {
          case 'horizontal':
            textRotationAngle = -alpha;
            break;

          case 'tangent':
            textRotationAngle = (alpha <= HALF_PI + PI ? PI : 0);
            break;

          case 'normal':
            /* falls through */
          default:
            textRotationAngle = HALF_PI;
            break;
        }
        ctx.rotate(textRotationAngle);

        switch (labelNumberFormat.format) {
          case 'fractional':
            ctx.fillText((valueCounter.toFixed(fractionalScaleDecimals)), 0, 0, TEXT_WIDTH);
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
        alpha += rotationStep;
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
      alpha += rotationStep;
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
    var drawUserLed = (undefined === parameters.userLed ? false : parameters.userLed);
    var drawPointer = (undefined === parameters.pointer ? false : parameters.pointer);
    var drawForeground = (undefined === parameters.foreground ? false : parameters.foreground);
    var drawTrend = (undefined === parameters.trend ? false : parameters.trend);
    var drawOdo = (undefined === parameters.odo ? false : parameters.odo);

    initialized = true;

    // Calculate the current min and max values and the range
    calculate();

    // Create frame in frame buffer (backgroundBuffer)
    if (drawFrame && frameVisible) {
      drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
    }

    // Create background in background buffer (backgroundBuffer)
    if (drawBackground && backgroundVisible) {
      drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);

      // Create custom layer in background buffer (backgroundBuffer)
      drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
    }

    if (drawLed) {
      // Draw LED ON in ledBuffer_ON
      ledContextOn.drawImage(createLedImage(Math.ceil(size * 0.093457), 1, ledColor), 0, 0);

      // Draw LED OFF in ledBuffer_OFF
      ledContextOff.drawImage(createLedImage(Math.ceil(size * 0.093457), 0, ledColor), 0, 0);
    }

    if (drawUserLed) {
      // Draw user LED ON in userLedBuffer_ON
      userLedContextOn.drawImage(createLedImage(Math.ceil(size * 0.093457), 1, userLedColor), 0, 0);

      // Draw user LED OFF in userLedBuffer_OFF
      userLedContextOff.drawImage(createLedImage(Math.ceil(size * 0.093457), 0, userLedColor), 0, 0);
    }

    // Draw min measured value indicator in minMeasuredValueBuffer
    if (minMeasuredValueVisible) {
      minMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), ColorDef.BLUE.dark.getRgbaColor(), true, true), 0, 0);
    }

    // Draw max measured value indicator in maxMeasuredValueBuffer
    if (maxMeasuredValueVisible) {
      maxMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * 0.028037), ColorDef.RED.medium.getRgbaColor(), true), 0, 0);
    }

    // Create alignment posts in background buffer (backgroundBuffer)
    if (drawBackground && backgroundVisible) {
      drawPostsImage(backgroundContext);

      // Create section in background buffer (backgroundBuffer)
      if (null !== section && 0 < section.length) {
        var sectionIndex = section.length;
        do {
          sectionIndex--;
          drawAreaSectionImage(backgroundContext, section[sectionIndex].start, section[sectionIndex].stop, section[sectionIndex].color, false);
        }
        while (0 < sectionIndex);
      }

      // Create area in background buffer (backgroundBuffer)
      if (null !== area && 0 < area.length) {
        var areaIndex = area.length;
        do {
          areaIndex--;
          drawAreaSectionImage(backgroundContext, area[areaIndex].start, area[areaIndex].stop, area[areaIndex].color, true);
        }
        while (0 < areaIndex);
      }

      // Create tickmarks in background buffer (backgroundBuffer)
      drawTickmarksImage(backgroundContext, labelNumberFormat);

      // Create title in background buffer (backgroundBuffer)
      drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, true, true);
    }

    // Draw threshold image to background context
    if (drawBackground && thresholdVisible) {
      backgroundContext.save();
      backgroundContext.translate(centerX, centerY);
      backgroundContext.rotate(rotationOffset + (threshold - minValue) * angleStep + HALF_PI);
      backgroundContext.translate(-centerX, -centerY);
      backgroundContext.drawImage(createThresholdImage(), imageWidth * 0.475, imageHeight * 0.13);
      backgroundContext.translate(centerX, centerY);
      backgroundContext.restore();
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground && lcdVisible) {
      if (useOdometer && drawOdo) {
        odoGauge = new Odometer('', {
          _context: odoContext,
          height: size * 0.075,
          decimals: odometerParams.decimals,
          digits: (odometerParams.digits === undefined ? 5 : odometerParams.digits),
          valueForeColor: odometerParams.valueForeColor,
          valueBackColor: odometerParams.valueBackColor,
          decimalForeColor: odometerParams.decimalForeColor,
          decimalBackColor: odometerParams.decimalBackColor,
          font: odometerParams.font,
          value: value
        });
        odoPosX = (imageWidth - odoBuffer.width) / 2;
      } else if (!useOdometer) {
        lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
        backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY);
      }
    }

    // Create pointer image in pointer buffer (contentBuffer)
    if (drawPointer) {
      drawPointerImage(pointerContext, imageWidth, pointerType, pointerColor, backgroundColor.labelColor);
    }

    // Create foreground in foreground buffer (foregroundBuffer)
    if (drawForeground && foregroundVisible) {
      var knobVisible = (pointerType.type === 'type15' || pointerType.type === 'type16' ? false : true);
      drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, knobVisible, knobType, knobStyle, gaugeType);
    }

    // Create the trend indicator buffers
    if (drawTrend && trendVisible) {
      trendUpBuffer = createTrendIndicator(trendSize, TrendState.UP, trendColors);
      trendSteadyBuffer = createTrendIndicator(trendSize, TrendState.STEADY, trendColors);
      trendDownBuffer = createTrendIndicator(trendSize, TrendState.DOWN, trendColors);
      trendOffBuffer = createTrendIndicator(trendSize, TrendState.OFF, trendColors);
    }
  };

  var resetBuffers = function(buffers) {
    buffers = buffers || {};
    var resetFrame = (undefined === buffers.frame ? false : buffers.frame);
    var resetBackground = (undefined === buffers.background ? false : buffers.background);
    var resetLed = (undefined === buffers.led ? false : buffers.led);
    var resetUserLed = (undefined === buffers.userLed ? false : buffers.userLed);
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

    if (resetUserLed) {
      userLedBufferOn.width = Math.ceil(size * 0.093457);
      userLedBufferOn.height = Math.ceil(size * 0.093457);
      userLedContextOn = userLedBufferOn.getContext('2d');

      userLedBufferOff.width = Math.ceil(size * 0.093457);
      userLedBufferOff.height = Math.ceil(size * 0.093457);
      userLedContextOff = userLedBufferOff.getContext('2d');

      // Buffer for current user led painting code
      userLedBuffer = userLedBufferOff;
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

  var toggleAndRepaintUserLed = function() {
    if (userLedVisible) {
      if (userLedBuffer === userLedBufferOn) {
        userLedBuffer = userLedBufferOff;
      } else {
        userLedBuffer = userLedBufferOn;
      }
      if (!repainting) {
        repainting = true;
        requestAnimFrame(self.repaint);
      }
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

  var blinkUser = function(blinking) {
    if (blinking) {
      userLedTimerId = setInterval(toggleAndRepaintUserLed, 1000);
    } else {
      clearInterval(userLedTimerId);
      userLedBuffer = userLedBufferOff;
    }
  };

  //************************************ Public methods **************************************
  this.setValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
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

  this.setOdoValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = (newValue < 0 ? 0 : newValue);
    if (odoValue !== targetValue) {
      odoValue = targetValue;
      this.repaint();
    }
    return this;
  };

  this.getOdoValue = function() {
    return odoValue;
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

  this.resetMinMeasuredValue = function() {
    minMeasuredValue = value;
    this.repaint();
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
    var targetValue = newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue);
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

  this.setArea = function(areaVal) {
    area = areaVal;
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
      background: true,
      pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false) // type2 & 13 depend on background
    });
    backgroundColor = newBackgroundColor;
    init({
      background: true, // type2 & 13 depend on background
      pointer: (pointerType.type === 'type2' || pointerType.type === 'type13' ? true : false)
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
      foreground: true
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

  this.setUserLedColor = function(newLedColor) {
    resetBuffers({
      userLed: true
    });
    userLedColor = newLedColor;
    init({
      userLed: true
    });
    this.repaint();
    return this;
  };

  this.toggleUserLed = function() {
    if (userLedBuffer === userLedBufferOn) {
      userLedBuffer = userLedBufferOff;
    } else {
      userLedBuffer = userLedBufferOn;
    }
    this.repaint();
    return this;
  };

  this.setUserLedOnOff = function(on) {
    if (true === on) {
      userLedBuffer = userLedBufferOn;
    } else {
      userLedBuffer = userLedBufferOff;
    }
    this.repaint();
    return this;
  };

  this.blinkUserLed = function(blink) {
    if (blink) {
      if (!userLedBlinking) {
        blinkUser(true);
        userLedBlinking = true;
      }
    } else {
      if (userLedBlinking) {
        clearInterval(userLedTimerId);
        userLedBlinking = false;
      }
    }
    return this;
  };

  this.setLedVisible = function(visible) {
    ledVisible = !!visible;
    this.repaint();
    return this;
  };

  this.setUserLedVisible = function(visible) {
    userLedVisible = !!visible;
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

  this.setTrend = function(newValue) {
    trendIndicator = newValue;
    this.repaint();
    return this;
  };

  this.setTrendVisible = function(visible) {
    trendVisible = !!visible;
    this.repaint();
    return this;
  };

  this.setFractionalScaleDecimals = function(decimals) {
    fractionalScaleDecimals = parseInt(decimals, 10);
    resetBuffers({
      background: true
    });
    init({
      background: true
    });
    this.repaint();
    return this;
  };

  this.setLabelNumberFormat = function(format) {
    labelNumberFormat = format;
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
        userLed: true,
        pointer: true,
        trend: true,
        foreground: true,
        odo: true
      });
    }
    mainCtx.clearRect(0, 0, size, size);

    // Draw frame
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0);
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0);

    // Draw lcd display
    if (lcdVisible) {
      if (useOdometer) {
        odoGauge.setValue(odometerUseValue ? value : odoValue);
        mainCtx.drawImage(odoBuffer, odoPosX, odoPosY);
      } else {
        drawLcdText(mainCtx, value);
      }
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, ledPosX, ledPosY);
    }

    // Draw user led
    if (userLedVisible) {
      mainCtx.drawImage(userLedBuffer, userLedPosX, userLedPosY);
    }

    // Draw the trend indicator
    if (trendVisible) {
      switch (trendIndicator.state) {
        case 'up':
          mainCtx.drawImage(trendUpBuffer, trendPosX, trendPosY);
          break;
        case 'steady':
          mainCtx.drawImage(trendSteadyBuffer, trendPosX, trendPosY);
          break;
        case 'down':
          mainCtx.drawImage(trendDownBuffer, trendPosX, trendPosY);
          break;
        case 'off':
          mainCtx.drawImage(trendOffBuffer, trendPosX, trendPosY);
          break;
      }
    }

    // Draw min measured value indicator
    if (minMeasuredValueVisible) {
      mainCtx.save();
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate(rotationOffset + HALF_PI + (minMeasuredValue - minValue) * angleStep);
      mainCtx.translate(-centerX, -centerY);
      mainCtx.drawImage(minMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.105);
      mainCtx.restore();
    }

    // Draw max measured value indicator
    if (maxMeasuredValueVisible) {
      mainCtx.save();
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate(rotationOffset + HALF_PI + (maxMeasuredValue - minValue) * angleStep);
      mainCtx.translate(-centerX, -centerY);
      mainCtx.drawImage(maxMeasuredValueBuffer, mainCtx.canvas.width * 0.4865, mainCtx.canvas.height * 0.105);
      mainCtx.restore();
    }

    angle = rotationOffset + HALF_PI + (value - minValue) * angleStep;

    // Define rotation center
    mainCtx.save();
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate(angle);
    mainCtx.translate(-centerX, -centerY);
    // Set the pointer shadow params
    mainCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
    mainCtx.shadowBlur = shadowOffset * 2;
    // Draw the pointer
    mainCtx.drawImage(pointerBuffer, 0, 0);
    // Undo the translations & shadow settings
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

export default Radial;

import Tween from "./tween.js";
import drawFrame from "./drawFrame";
import drawBackground from "./drawBackground";
import drawRadialCustomImage from "./drawRadialCustomImage";
import drawForeground from "./drawForeground";
import createLedImage from "./createLedImage";
import createLcdBackgroundImage from "./createLcdBackgroundImage";
import createTrendIndicator from "./createTrendIndicator";
import drawTitleImage from "./drawTitleImage";
import {
calcNiceNumber, 
createBuffer, 
customColorDef, 
requestAnimFrame, 
getCanvasContext,
HALF_PI,
TWO_PI,
PI,
RAD_FACTOR,
DEG_FACTOR,
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

var RadialBargraph = function(canvas, parameters) {
  parameters = parameters || {};
  var gaugeType = (undefined === parameters.gaugeType ? GaugeType.TYPE4 : parameters.gaugeType),
    size = (undefined === parameters.size ? 0 : parameters.size),
    minValue = (undefined === parameters.minValue ? 0 : parameters.minValue),
    maxValue = (undefined === parameters.maxValue ? (minValue + 100) : parameters.maxValue),
    niceScale = (undefined === parameters.niceScale ? true : parameters.niceScale),
    threshold = (undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue : parameters.threshold),
    thresholdRising = (undefined === parameters.thresholdRising ? true : parameters.thresholdRising),
    section = (undefined === parameters.section ? null : parameters.section),
    useSectionColors = (undefined === parameters.useSectionColors ? false : parameters.useSectionColors),
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
    fractionalScaleDecimals = (undefined === parameters.fractionalScaleDecimals ? 1 : parameters.fractionalScaleDecimals),
    customLayer = (undefined === parameters.customLayer ? null : parameters.customLayer),
    ledColor = (undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor),
    ledVisible = (undefined === parameters.ledVisible ? true : parameters.ledVisible),
    userLedColor = (undefined === parameters.userLedColor ? LedColor.GREEN_LED : parameters.userLedColor),
    userLedVisible = (undefined === parameters.userLedVisible ? false : parameters.userLedVisible),
    labelNumberFormat = (undefined === parameters.labelNumberFormat ? LabelNumberFormat.STANDARD : parameters.labelNumberFormat),
    foregroundType = (undefined === parameters.foregroundType ? ForegroundType.TYPE1 : parameters.foregroundType),
    foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible),
    playAlarm = (undefined === parameters.playAlarm ? false : parameters.playAlarm),
    alarmSound = (undefined === parameters.alarmSound ? false : parameters.alarmSound),
    valueGradient = (undefined === parameters.valueGradient ? null : parameters.valueGradient),
    useValueGradient = (undefined === parameters.useValueGradient ? false : parameters.useValueGradient),
    tickLabelOrientation = (undefined === parameters.tickLabelOrientation ? (gaugeType === GaugeType.TYPE1 ? TickLabelOrientation.TANGENT : TickLabelOrientation.NORMAL) : parameters.tickLabelOrientation),
    trendVisible = (undefined === parameters.trendVisible ? false : parameters.trendVisible),
    trendColors = (undefined === parameters.trendColors ? [LedColor.RED_LED, LedColor.GREEN_LED, LedColor.CYAN_LED] : parameters.trendColors),
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

  var value = minValue;
  var minMeasuredValue = minValue;
  var maxMeasuredValue = maxValue;
  var range = maxValue - minValue;
  var ledBlinking = false;
  var ledTimerId = 0;
  var userLedBlinking = false;
  var userLedTimerId = 0;
  var tween;
  var self = this;
  var repainting = false;

  // GaugeType specific private variables
  var freeAreaAngle;
  var rotationOffset;
  var bargraphOffset;
  var tickmarkOffset;
  var angleRange;
  var degAngleRange;
  var angleStep;
  var angle;

  var sectionAngles = [];
  var isSectionsVisible = false;
  var isGradientVisible = false;

  var imageWidth = size;
  var imageHeight = size;

  var centerX = imageWidth / 2;
  var centerY = imageHeight / 2;

  // Misc
  var lcdFontHeight = Math.floor(imageWidth / 10);
  var stdFont = lcdFontHeight + 'px ' + stdFontName;
  var lcdFont = lcdFontHeight + 'px ' + lcdFontName;
  var lcdHeight = imageHeight * 0.13;
  var lcdWidth = imageWidth * 0.4;
  var lcdPosX = (imageWidth - lcdWidth) / 2;
  var lcdPosY = imageHeight / 2 - lcdHeight / 2;

  // Constants
  var ACTIVE_LED_POS_X = imageWidth * 0.116822;
  var ACTIVE_LED_POS_Y = imageWidth * 0.485981;
  var LED_SIZE = Math.ceil(size * 0.093457);
  //var LED_POS_X = imageWidth * 0.453271;
  var LED_POS_X = imageWidth * 0.53;
  var LED_POS_Y = imageHeight * 0.61;
  var USER_LED_POS_X = gaugeType === GaugeType.TYPE3 ? 0.7 * imageWidth : centerX - LED_SIZE / 2;
  var USER_LED_POS_Y = gaugeType === GaugeType.TYPE3 ? 0.61 * imageHeight : 0.75 * imageHeight;

  var trendIndicator = TrendState.OFF;
  var trendSize = size * 0.06;
  var trendPosX = size * 0.38;
  var trendPosY = size * 0.57;

  switch (gaugeType.type) {
    case 'type1':
      freeAreaAngle = 0;
      rotationOffset = PI;
      bargraphOffset = 0;
      tickmarkOffset = HALF_PI;
      angleRange = HALF_PI;
      degAngleRange = angleRange * DEG_FACTOR;
      angleStep = angleRange / range;
      break;

    case 'type2':
      freeAreaAngle = 0;
      rotationOffset = PI;
      bargraphOffset = 0;
      tickmarkOffset = HALF_PI;
      angleRange = PI;
      degAngleRange = angleRange * DEG_FACTOR;
      angleStep = angleRange / range;
      break;

    case 'type3':
      freeAreaAngle = 0;
      rotationOffset = HALF_PI;
      bargraphOffset = -HALF_PI;
      tickmarkOffset = 0;
      angleRange = 1.5 * PI;
      degAngleRange = angleRange * DEG_FACTOR;
      angleStep = angleRange / range;
      break;

    case 'type4':
      /* falls through */
    default:
      freeAreaAngle = 60 * RAD_FACTOR;
      rotationOffset = HALF_PI + (freeAreaAngle / 2);
      bargraphOffset = -TWO_PI / 6;
      tickmarkOffset = 0;
      angleRange = TWO_PI - freeAreaAngle;
      degAngleRange = angleRange * DEG_FACTOR;
      angleStep = angleRange / range;
      break;
  }

  // Buffer for the frame
  var frameBuffer = createBuffer(size, size);
  var frameContext = frameBuffer.getContext('2d');

  // Buffer for static background painting code
  var backgroundBuffer = createBuffer(size, size);
  var backgroundContext = backgroundBuffer.getContext('2d');

  var lcdBuffer;

  // Buffer for active bargraph led
  var activeLedBuffer = createBuffer(Math.ceil(size * 0.060747), Math.ceil(size * 0.023364));
  var activeLedContext = activeLedBuffer.getContext('2d');

  // Buffer for led on painting code
  var ledBufferOn = createBuffer(LED_SIZE, LED_SIZE);
  var ledContextOn = ledBufferOn.getContext('2d');

  // Buffer for led off painting code
  var ledBufferOff = createBuffer(LED_SIZE, LED_SIZE);
  var ledContextOff = ledBufferOff.getContext('2d');

  // Buffer for current led painting code
  var ledBuffer = ledBufferOff;

  // Buffer for user led on painting code
  var userLedBufferOn = createBuffer(LED_SIZE, LED_SIZE);
  var userLedContextOn = userLedBufferOn.getContext('2d');

  // Buffer for user led off painting code
  var userLedBufferOff = createBuffer(LED_SIZE, LED_SIZE);
  var userLedContextOff = userLedBufferOff.getContext('2d');

  // Buffer for current user led painting code
  var userLedBuffer = userLedBufferOff;
  // Buffer for the background of the led
  var ledBackground;

  // Buffer for static foreground painting code
  var foregroundBuffer = createBuffer(size, size);
  var foregroundContext = foregroundBuffer.getContext('2d');

  // Buffers for trend indicators
  var trendUpBuffer, trendSteadyBuffer, trendDownBuffer, trendOffBuffer;

  var initialized = false;

  // Tickmark specific private variables
  var niceMinValue = minValue;
  var niceMaxValue = maxValue;
  var niceRange = maxValue - minValue;
  range = niceMaxValue - niceMinValue;
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
      //minorTickSpacing = 1;
      //majorTickSpacing = 10;
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

      case 'type4': // fall through
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

  //********************************* Private methods *********************************
  // Draw all static painting code to background
  var init = function(parameters) {
    parameters = parameters || {};
    var drawFrame2 = (undefined === parameters.frame ? false : parameters.frame);
    var drawBackground2 = (undefined === parameters.background ? false : parameters.background);
    var drawLed = (undefined === parameters.led ? false : parameters.led);
    var drawUserLed = (undefined === parameters.userLed ? false : parameters.userLed);
    var drawValue = (undefined === parameters.value ? false : parameters.value);
    var drawForeground2 = (undefined === parameters.foreground ? false : parameters.foreground);
    var drawTrend = (undefined === parameters.trend ? false : parameters.trend);

    initialized = true;

    calculate();

    // Create frame in frame buffer (frameBuffer)
    if (drawFrame2 && frameVisible) {
      drawFrame(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
    }

    // Create background in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
      drawBackground(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);

      // Create custom layer in background buffer (backgroundBuffer)
      drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
    }

    if (drawLed) {
      // Draw LED ON in ledBuffer_ON
      ledContextOn.drawImage(createLedImage(LED_SIZE, 1, ledColor), 0, 0);

      // Draw LED OFF in ledBuffer_OFF
      ledContextOff.drawImage(createLedImage(LED_SIZE, 0, ledColor), 0, 0);

      // Buffer the background of the led for blinking
      ledBackground = backgroundContext.getImageData(LED_POS_X, LED_POS_Y, LED_SIZE, LED_SIZE);
    }

    if (drawUserLed) {
      // Draw user LED ON in userLedBuffer_ON
      userLedContextOn.drawImage(createLedImage(Math.ceil(LED_SIZE), 1, userLedColor), 0, 0);

      // Draw user LED OFF in userLedBuffer_OFF
      userLedContextOff.drawImage(createLedImage(Math.ceil(LED_SIZE), 0, userLedColor), 0, 0);
    }

    if (drawBackground2) {
      // Create bargraphtrack in background buffer (backgroundBuffer)
      drawBargraphTrackImage(backgroundContext);
    }

    // Create tickmarks in background buffer (backgroundBuffer)
    if (drawBackground2 && backgroundVisible) {
      drawTickmarksImage(backgroundContext, labelNumberFormat);

      // Create title in background buffer (backgroundBuffer)
      drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, true, true);
    }

    // Create lcd background if selected in background buffer (backgroundBuffer)
    if (drawBackground2 && lcdVisible) {
      lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
      backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY);
    }

    // Convert Section values into angles
    isSectionsVisible = false;
    if (useSectionColors && null !== section && 0 < section.length) {
      isSectionsVisible = true;
      var sectionIndex = section.length;
      sectionAngles = [];
      do {
        sectionIndex--;
        sectionAngles.push({
          start: (((section[sectionIndex].start + Math.abs(minValue)) / (maxValue - minValue)) * degAngleRange),
          stop: (((section[sectionIndex].stop + Math.abs(minValue)) / (maxValue - minValue)) * degAngleRange),
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

    // Create an image of an active led in active led buffer (activeLedBuffer)
    if (drawValue) {
      drawActiveLed(activeLedContext, valueColor);
    }

    // Create foreground in foreground buffer (foregroundBuffer)
    if (drawForeground2 && foregroundVisible) {
      drawForeground(foregroundContext, foregroundType, imageWidth, imageHeight, false);
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
    var resetValue = (undefined === buffers.value ? false : buffers.value);
    var resetForeground = (undefined === buffers.foreground ? false : buffers.foreground);

    // Buffer for the frame
    if (resetFrame) {
      frameBuffer.width = size;
      frameBuffer.height = size;
      frameContext = frameBuffer.getContext('2d');
    }

    // Buffer for static background painting code
    if (resetBackground) {
      backgroundBuffer.width = size;
      backgroundBuffer.height = size;
      backgroundContext = backgroundBuffer.getContext('2d');
    }

    // Buffer for active bargraph led
    if (resetValue) {
      activeLedBuffer.width = Math.ceil(size * 0.060747);
      activeLedBuffer.height = Math.ceil(size * 0.023364);
      activeLedContext = activeLedBuffer.getContext('2d');
    }

    if (resetLed) {
      // Buffer for led on painting code
      ledBufferOn.width = Math.ceil(LED_SIZE);
      ledBufferOn.height = Math.ceil(LED_SIZE);
      ledContextOn = ledBufferOn.getContext('2d');

      // Buffer for led off painting code
      ledBufferOff.width = Math.ceil(LED_SIZE);
      ledBufferOff.height = Math.ceil(LED_SIZE);
      ledContextOff = ledBufferOff.getContext('2d');

      // Buffer for current led painting code
      ledBuffer = ledBufferOff;
    }

    if (resetUserLed) {
      userLedBufferOn.width = Math.ceil(LED_SIZE);
      userLedBufferOn.height = Math.ceil(LED_SIZE);
      userLedContextOn = userLedBufferOn.getContext('2d');

      userLedBufferOff.width = Math.ceil(LED_SIZE);
      userLedBufferOff.height = Math.ceil(LED_SIZE);
      userLedContextOff = userLedBufferOff.getContext('2d');

      // Buffer for current user led painting code
      userLedBuffer = userLedBufferOff;
    }

    // Buffer for static foreground painting code
    if (resetForeground) {
      foregroundBuffer.width = size;
      foregroundBuffer.height = size;
      foregroundContext = foregroundBuffer.getContext('2d');
    }
  };

  var drawBargraphTrackImage = function(ctx) {

    ctx.save();

    // Bargraphtrack

    // Frame
    ctx.save();
    ctx.lineWidth = size * 0.085;
    ctx.beginPath();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationOffset - 4 * RAD_FACTOR);
    ctx.translate(-centerX, -centerY);
    ctx.arc(centerX, centerY, imageWidth * 0.355140, 0, angleRange + 8 * RAD_FACTOR, false);
    ctx.rotate(-rotationOffset);
    var ledTrackFrameGradient = ctx.createLinearGradient(0, 0.107476 * imageHeight, 0, 0.897195 * imageHeight);
    ledTrackFrameGradient.addColorStop(0, '#000000');
    ledTrackFrameGradient.addColorStop(0.22, '#333333');
    ledTrackFrameGradient.addColorStop(0.76, '#333333');
    ledTrackFrameGradient.addColorStop(1, '#cccccc');
    ctx.strokeStyle = ledTrackFrameGradient;
    ctx.stroke();
    ctx.restore();

    // Main
    ctx.save();
    ctx.lineWidth = size * 0.075;
    ctx.beginPath();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationOffset - 4 * RAD_FACTOR);
    ctx.translate(-centerX, -centerY);
    ctx.arc(centerX, centerY, imageWidth * 0.355140, 0, angleRange + 8 * RAD_FACTOR, false);
    ctx.rotate(-rotationOffset);
    var ledTrackMainGradient = ctx.createLinearGradient(0, 0.112149 * imageHeight, 0, 0.892523 * imageHeight);
    ledTrackMainGradient.addColorStop(0, '#111111');
    ledTrackMainGradient.addColorStop(1, '#333333');
    ctx.strokeStyle = ledTrackMainGradient;
    ctx.stroke();
    ctx.restore();

    // Draw inactive leds
    var ledCenterX = (imageWidth * 0.116822 + imageWidth * 0.060747) / 2;
    var ledCenterY = (imageWidth * 0.485981 + imageWidth * 0.023364) / 2;
    var ledOffGradient = ctx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, 0.030373 * imageWidth);
    ledOffGradient.addColorStop(0, '#3c3c3c');
    ledOffGradient.addColorStop(1, '#323232');
    var angle = 0;
    for (angle = 0; angle <= degAngleRange; angle += 5) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((angle * RAD_FACTOR) + bargraphOffset);
      ctx.translate(-centerX, -centerY);
      ctx.beginPath();
      ctx.rect(imageWidth * 0.116822, imageWidth * 0.485981, imageWidth * 0.060747, imageWidth * 0.023364);
      ctx.closePath();
      ctx.fillStyle = ledOffGradient;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  var drawActiveLed = function(ctx, color) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();
    var ledCenterX = (ctx.canvas.width / 2);
    var ledCenterY = (ctx.canvas.height / 2);
    var ledGradient = mainCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, ctx.canvas.width / 2);
    ledGradient.addColorStop(0, color.light.getRgbaColor());
    ledGradient.addColorStop(1, color.dark.getRgbaColor());
    ctx.fillStyle = ledGradient;
    ctx.fill();
    ctx.restore();
  };

  var drawLcdText = function(ctx, value) {

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

  var drawTickmarksImage = function(ctx, labelNumberFormat) {
    var alpha = rotationOffset, // Tracks total rotation
      rotationStep = angleStep * minorTickSpacing,
      textRotationAngle,
      fontSize = Math.ceil(imageWidth * 0.04),
      valueCounter = minValue,
      majorTickCounter = maxNoOfMinorTicks - 1,
      TEXT_TRANSLATE_X = imageWidth * 0.28,
      TEXT_WIDTH = imageWidth * 0.1,
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
      TEXT_WIDTH = imageWidth * 0.0375;
    }

    for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
      textRotationAngle = +rotationStep + HALF_PI;
      majorTickCounter++;
      // Draw major tickmarks
      if (majorTickCounter === maxNoOfMinorTicks) {
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
      ctx.rotate(rotationStep);
      alpha += rotationStep;
    }

    ctx.translate(-centerX, -centerY);
    ctx.restore();
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

  //********************************* Public methods *********************************
  this.setValue = function(newValue) {
    newValue = parseFloat(newValue);
    var targetValue = (newValue < minValue ? minValue : (newValue > maxValue ? maxValue : newValue));
    if (value !== targetValue) {
      value = targetValue;
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
      //tween = new Tween(new Object(), '', Tween.strongEaseInOut, this.value, targetValue, 1);
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
      led: true
    });
    backgroundColor = newBackgroundColor;
    init({
      background: true,
      led: true
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

  this.setValueColor = function(newValueColor) {
    resetBuffers({
      value: true
    });
    valueColor = newValueColor;
    init({
      value: true
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

  this.setLcdDecimals = function(decimals) {
    lcdDecimals = parseInt(decimals, 10);
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

  this.setMinValue = function(newValue) {
    minValue = newValue;
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
    maxValue = newValue;
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

  this.setThresholdRising = function(rising) {
    thresholdRising = !!rising;
    // reset existing threshold alerts
    ledBlinking = !ledBlinking;
    blink(ledBlinking);
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
    var activeLedAngle = ((value - minValue) / (maxValue - minValue)) * degAngleRange,
      activeLedColor,
      lastActiveLedColor = valueColor,
      angle, i,
      currentValue,
      gradRange,
      fraction;

    if (!initialized) {
      init({
        frame: true,
        background: true,
        led: true,
        userLed: true,
        value: true,
        trend: true,
        foreground: true
      });
    }

    mainCtx.clearRect(0, 0, size, size);

    // Draw frame image
    if (frameVisible) {
      mainCtx.drawImage(frameBuffer, 0, 0);
    }

    // Draw buffered image to visible canvas
    mainCtx.drawImage(backgroundBuffer, 0, 0);

    // Draw active leds
    for (angle = 0; angle <= activeLedAngle; angle += 5) {
      //check for LED color
      activeLedColor = valueColor;
      // Use a gradient for value colors?
      if (isGradientVisible) {
        // Convert angle back to value
        currentValue = minValue + (angle / degAngleRange) * (maxValue - minValue);
        gradRange = valueGradient.getEnd() - valueGradient.getStart();
        fraction = (currentValue - minValue) / gradRange;
        fraction = Math.max(Math.min(fraction, 1), 0);
        activeLedColor = customColorDef(valueGradient.getColorAt(fraction).getRgbaColor());
      } else if (isSectionsVisible) {
        for (i = 0; i < sectionAngles.length; i++) {
          if (angle >= sectionAngles[i].start && angle < sectionAngles[i].stop) {
            activeLedColor = sectionAngles[i].color;
            break;
          }
        }
      }
      // Has LED color changed? If so redraw the buffer
      if (lastActiveLedColor.medium.getHexColor() !== activeLedColor.medium.getHexColor()) {
        drawActiveLed(activeLedContext, activeLedColor);
        lastActiveLedColor = activeLedColor;
      }
      mainCtx.save();
      mainCtx.translate(centerX, centerY);
      mainCtx.rotate((angle * RAD_FACTOR) + bargraphOffset);
      mainCtx.translate(-centerX, -centerY);
      mainCtx.drawImage(activeLedBuffer, ACTIVE_LED_POS_X, ACTIVE_LED_POS_Y);
      mainCtx.restore();
    }

    // Draw lcd display
    if (lcdVisible) {
      drawLcdText(mainCtx, value);
    }

    // Draw led
    if (ledVisible) {
      mainCtx.drawImage(ledBuffer, LED_POS_X, LED_POS_Y);
    }

    // Draw user led
    if (userLedVisible) {
      mainCtx.drawImage(userLedBuffer, USER_LED_POS_X, USER_LED_POS_Y);
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

export default RadialBargraph;

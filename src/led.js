
import createLedImage from "./createLedImage";
import {
getCanvasContext,
doc,
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

var led = function(canvas, parameters) {
  parameters = parameters || {};
  var size = (undefined === parameters.size ? 0 : parameters.size),
    ledColor = (undefined === parameters.ledColor ? LedColor.RED_LED : parameters.ledColor);

  var ledBlinking = false;
  var ledTimerId = 0;

  // Get the canvas context and clear it
  var mainCtx = getCanvasContext(canvas);
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size;
  mainCtx.canvas.height = size;

  var initialized = false;

  // Buffer for led on painting code
  var ledBufferOn = doc.createElement('canvas');
  ledBufferOn.width = size;
  ledBufferOn.height = size;
  var ledContextOn = ledBufferOn.getContext('2d');

  // Buffer for led off painting code
  var ledBufferOff = doc.createElement('canvas');
  ledBufferOff.width = size;
  ledBufferOff.height = size;
  var ledContextOff = ledBufferOff.getContext('2d');

  // Buffer for current led painting code
  var ledBuffer = ledBufferOff;

  var init = function() {
    initialized = true;

    // Draw LED ON in ledBuffer_ON
    ledContextOn.clearRect(0, 0, ledContextOn.canvas.width, ledContextOn.canvas.height);
    ledContextOn.drawImage(createLedImage(size, 1, ledColor), 0, 0);

    // Draw LED ON in ledBuffer_OFF
    ledContextOff.clearRect(0, 0, ledContextOff.canvas.width, ledContextOff.canvas.height);
    ledContextOff.drawImage(createLedImage(size, 0, ledColor), 0, 0);
  };

  this.toggleLed = function() {
    if (ledBuffer === ledBufferOn) {
      ledBuffer = ledBufferOff;
    } else {
      ledBuffer = ledBufferOn;
    }
    repaint();
    return this;
  };

  this.setLedColor = function(newColor) {
    ledColor = newColor;
    initialized = false;
    repaint();
    return this;
  };

  this.setLedOnOff = function(on) {
    if (!!on) {
      ledBuffer = ledBufferOn;
    } else {
      ledBuffer = ledBufferOff;
    }
    repaint();
    return this;
  };

  this.blink = function(blink) {
    if (!!blink) {
      if (!ledBlinking) {
        ledTimerId = setInterval(this.toggleLed, 1000);
        ledBlinking = true;
      }
    } else {
      if (ledBlinking) {
        clearInterval(ledTimerId);
        ledBlinking = false;
        ledBuffer = ledBufferOff;
      }
    }
    return this;
  };

  var repaint = function() {
    if (!initialized) {
      init();
    }

    mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    mainCtx.drawImage(ledBuffer, 0, 0);

    mainCtx.restore();
  };

  repaint();

  return this;
};

export default led;

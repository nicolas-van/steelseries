import Tween from './tween.js';
import {
  createBuffer,
  requestAnimFrame,
  getCanvasContext,
  TWO_PI,
  RAD_FACTOR,
} from './tools';

const Odometer = function(canvas, parameters) {
  parameters = parameters || {};

  // parameters
  const _context = (undefined === parameters._context ? null : parameters._context);
  let height = (undefined === parameters.height ? 0 : parameters.height);
  const digits = (undefined === parameters.digits ? 6 : parameters.digits);
  const decimals = (undefined === parameters.decimals ? 1 : parameters.decimals);
  const decimalBackColor = (undefined === parameters.decimalBackColor ? '#F0F0F0' : parameters.decimalBackColor);
  const decimalForeColor = (undefined === parameters.decimalForeColor ? '#F01010' : parameters.decimalForeColor);
  const font = (undefined === parameters.font ? 'sans-serif' : parameters.font);
  let value = (undefined === parameters.value ? 0 : parameters.value);
  const valueBackColor = (undefined === parameters.valueBackColor ? '#050505' : parameters.valueBackColor);
  const valueForeColor = (undefined === parameters.valueForeColor ? '#F8F8F8' : parameters.valueForeColor);
  const wobbleFactor = (undefined === parameters.wobbleFactor ? 0.07 : parameters.wobbleFactor);
  //
  let initialized = false;
  let tween; let ctx;
  let repainting = false;
  let digitHeight; let digitWidth; let stdFont;
  let width; let columnHeight; let verticalSpace; let zeroOffset;
  const wobble = [];
  // buffers
  let backgroundBuffer; let backgroundContext;
  let foregroundBuffer; let foregroundContext;
  let digitBuffer; let digitContext;
  let decimalBuffer; let decimalContext;
  // End of variables

  // Get the canvas context and clear it
  if (_context) {
    ctx = _context;
  } else {
    ctx = getCanvasContext(canvas);
  }

  // Has a height been specified?
  if (height === 0) {
    height = ctx.canvas.height;
  }

  // Cannot display negative values yet
  if (value < 0) {
    value = 0;
  }

  digitHeight = Math.floor(height * 0.85);
  stdFont = '600 ' + digitHeight + 'px ' + font;

  digitWidth = Math.floor(height * 0.68);
  width = digitWidth * (digits + decimals);
  columnHeight = digitHeight * 11;
  verticalSpace = columnHeight / 12;
  zeroOffset = verticalSpace * 0.81;

  // Resize and clear the main context
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  // Create buffers
  backgroundBuffer = createBuffer(width, height);
  backgroundContext = backgroundBuffer.getContext('2d');

  foregroundBuffer = createBuffer(width, height);
  foregroundContext = foregroundBuffer.getContext('2d');

  digitBuffer = createBuffer(digitWidth, columnHeight * 1.1);
  digitContext = digitBuffer.getContext('2d');

  decimalBuffer = createBuffer(digitWidth, columnHeight * 1.1);
  decimalContext = decimalBuffer.getContext('2d');

  function init() {
    let grad; let i;

    initialized = true;

    // Create the foreground
    foregroundContext.rect(0, 0, width, height);
    grad = foregroundContext.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.1, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(0.33, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.46, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.9, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    foregroundContext.fillStyle = grad;
    foregroundContext.fill();

    // Create a digit column
    // background
    digitContext.rect(0, 0, digitWidth, columnHeight * 1.1);
    digitContext.fillStyle = valueBackColor;
    digitContext.fill();
    // edges
    digitContext.strokeStyle = '#f0f0f0';
    digitContext.lineWidth = '1px'; // height * 0.1 + 'px';
    digitContext.moveTo(0, 0);
    digitContext.lineTo(0, columnHeight * 1.1);
    digitContext.stroke();
    digitContext.strokeStyle = '#202020';
    digitContext.moveTo(digitWidth, 0);
    digitContext.lineTo(digitWidth, columnHeight * 1.1);
    digitContext.stroke();
    // numerals
    digitContext.textAlign = 'center';
    digitContext.textBaseline = 'middle';
    digitContext.font = stdFont;
    digitContext.fillStyle = valueForeColor;
    // put the digits 901234567890 vertically into the buffer
    for (i = 9; i < 21; i++) {
      digitContext.fillText(i % 10, digitWidth * 0.5, verticalSpace * (i - 9) + verticalSpace / 2);
    }

    // Create a decimal column
    if (decimals > 0) {
      // background
      decimalContext.rect(0, 0, digitWidth, columnHeight * 1.1);
      decimalContext.fillStyle = decimalBackColor;
      decimalContext.fill();
      // edges
      decimalContext.strokeStyle = '#f0f0f0';
      decimalContext.lineWidth = '1px'; // height * 0.1 + 'px';
      decimalContext.moveTo(0, 0);
      decimalContext.lineTo(0, columnHeight * 1.1);
      decimalContext.stroke();
      decimalContext.strokeStyle = '#202020';
      decimalContext.moveTo(digitWidth, 0);
      decimalContext.lineTo(digitWidth, columnHeight * 1.1);
      decimalContext.stroke();
      // numerals
      decimalContext.textAlign = 'center';
      decimalContext.textBaseline = 'middle';
      decimalContext.font = stdFont;
      decimalContext.fillStyle = decimalForeColor;
      // put the digits 901234567890 vertically into the buffer
      for (i = 9; i < 21; i++) {
        decimalContext.fillText(i % 10, digitWidth * 0.5, verticalSpace * (i - 9) + verticalSpace / 2);
      }
    }
    // wobble factors
    for (i = 0; i < (digits + decimals); i++) {
      wobble[i] = Math.random() * wobbleFactor * height - wobbleFactor * height / 2;
    }
  }

  function drawDigits() {
    let pos = 1;
    let val = value;
    let i; let num; let numb; let frac; let prevNum;

    // do not use Math.pow() - rounding errors!
    for (i = 0; i < decimals; i++) {
      val *= 10;
    }

    numb = Math.floor(val);
    frac = val - numb;
    numb = String(numb);
    prevNum = 9;

    for (i = 0; i < decimals + digits; i++) {
      num = +numb.substring(numb.length - i - 1, numb.length - i) || 0;
      if (prevNum !== 9) {
        frac = 0;
      }
      if (i < decimals) {
        backgroundContext.drawImage(decimalBuffer, width - digitWidth * pos, -(verticalSpace * (num + frac) + zeroOffset + wobble[i]));
      } else {
        backgroundContext.drawImage(digitBuffer, width - digitWidth * pos, -(verticalSpace * (num + frac) + zeroOffset + wobble[i]));
      }
      pos++;
      prevNum = num;
    }
  }

  this.setValueAnimated = function(newVal, callback) {
    const gauge = this;
    newVal = parseFloat(newVal);

    if (newVal < 0) {
      newVal = 0;
    }
    if (value !== newVal) {
      if (undefined !== tween && tween.isPlaying) {
        tween.stop();
      }

      tween = new Tween({}, '', Tween.strongEaseOut, value, newVal, 2);
      tween.onMotionChanged = function(event) {
        value = event.target._pos;
        if (!repainting) {
          repainting = true;
          requestAnimFrame(gauge.repaint);
        }
      };

      // do we have a callback function to process?
      if (callback && typeof(callback) === 'function') {
        tween.onMotionFinished = callback;
      }

      tween.start();
    }
    this.repaint();
    return this;
  };

  this.setValue = function(newVal) {
    value = parseFloat(newVal);
    if (value < 0) {
      value = 0;
    }
    this.repaint();
    return this;
  };

  this.getValue = function() {
    return value;
  };

  this.repaint = function() {
    if (!initialized) {
      init();
    }

    // draw digits
    drawDigits();

    // draw the foreground
    backgroundContext.drawImage(foregroundBuffer, 0, 0);

    // paint back to the main context
    ctx.drawImage(backgroundBuffer, 0, 0);

    repainting = false;
  };

  this.repaint();
};

export default Odometer;

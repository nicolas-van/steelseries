import Tween from './tween.js';
import drawFrame from './drawFrame';
import drawForeground from './drawForeground';
import {
  createBuffer,
  requestAnimFrame,
  getCanvasContext,
  HALF_PI,
  TWO_PI,
  PI,
  RAD_FACTOR,
  stdFontName,
} from './tools';

import {
  BackgroundColor,
  LcdColor,
  ColorDef,
  LedColor,
  GaugeType,
  Orientation,
  KnobType,
  KnobStyle,
  FrameDesign,
  PointerType,
  ForegroundType,
  LabelNumberFormat,
  TickLabelOrientation,
  TrendState,
} from './definitions';

const Horizon = function(canvas, parameters) {
  parameters = parameters || {};
  let size = (undefined === parameters.size ? 0 : parameters.size);
  let frameDesign = (undefined === parameters.frameDesign ? FrameDesign.METAL : parameters.frameDesign);
  const frameVisible = (undefined === parameters.frameVisible ? true : parameters.frameVisible);
  let foregroundType = (undefined === parameters.foregroundType ? ForegroundType.TYPE1 : parameters.foregroundType);
  const foregroundVisible = (undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible);
  const pointerColor = (undefined === parameters.pointerColor ? ColorDef.WHITE : parameters.pointerColor);

  let tweenRoll;
  let tweenPitch;
  let repainting = false;
  let roll = 0;
  let pitch = 0;
  const pitchPixel = (PI * size) / 360;
  let pitchOffset = 0;
  let upsidedown = false;

  // Get the canvas context and clear it
  const mainCtx = getCanvasContext(canvas);
  // Has a size been specified?
  if (size === 0) {
    size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height);
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = size;
  mainCtx.canvas.height = size;

  const imageWidth = size;
  const imageHeight = size;

  const centerX = imageWidth / 2;
  const centerY = imageHeight / 2;

  let initialized = false;

  // **************   Buffer creation  ********************
  // Buffer for all static background painting code
  const backgroundBuffer = createBuffer(size, size);
  let backgroundContext = backgroundBuffer.getContext('2d');

  // Buffer for pointer image painting code
  const valueBuffer = createBuffer(size, size * PI);
  let valueContext = valueBuffer.getContext('2d');

  // Buffer for indicator painting code
  const indicatorBuffer = createBuffer(size * 0.037383, size * 0.056074);
  let indicatorContext = indicatorBuffer.getContext('2d');

  // Buffer for static foreground painting code
  const foregroundBuffer = createBuffer(size, size);
  let foregroundContext = foregroundBuffer.getContext('2d');

  // **************   Image creation  ********************
  const drawHorizonBackgroundImage = function(ctx) {
    ctx.save();

    const imgWidth = size;
    const imgHeight = size * PI;
    let y;

    // HORIZON
    ctx.beginPath();
    ctx.rect(0, 0, imgWidth, imgHeight);
    ctx.closePath();
    const HORIZON_GRADIENT = ctx.createLinearGradient(0, 0, 0, imgHeight);
    HORIZON_GRADIENT.addColorStop(0, '#7fd5f0');
    HORIZON_GRADIENT.addColorStop(0.5, '#7fd5f0');
    HORIZON_GRADIENT.addColorStop(0.5, '#3c4439');
    HORIZON_GRADIENT.addColorStop(1, '#3c4439');
    ctx.fillStyle = HORIZON_GRADIENT;
    ctx.fill();

    ctx.lineWidth = 1;
    const stepSizeY = imgHeight / 360 * 5;
    let stepTen = false;
    let step = 10;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = imgWidth * 0.04;
    ctx.font = fontSize + 'px ' + stdFontName;
    ctx.fillStyle = '#37596e';
    for (y = imgHeight / 2 - stepSizeY; y > 0; y -= stepSizeY) {
      if (step <= 90) {
        if (stepTen) {
          ctx.fillText(step, (imgWidth - (imgWidth * 0.2)) / 2 - 8, y, imgWidth * 0.375);
          ctx.fillText(step, imgWidth - (imgWidth - (imgWidth * 0.2)) / 2 + 8, y, imgWidth * 0.375);
          ctx.beginPath();
          ctx.moveTo((imgWidth - (imgWidth * 0.2)) / 2, y);
          ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.2)) / 2, y);
          ctx.closePath();
          step += 10;
        } else {
          ctx.beginPath();
          ctx.moveTo((imgWidth - (imgWidth * 0.1)) / 2, y);
          ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.1)) / 2, y);
          ctx.closePath();
        }
        ctx.stroke();
      }
      stepTen ^= true;
    }
    stepTen = false;
    step = 10;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, imgHeight / 2);
    ctx.lineTo(imgWidth, imgHeight / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    for (y = imgHeight / 2 + stepSizeY; y <= imgHeight; y += stepSizeY) {
      if (step <= 90) {
        if (stepTen) {
          ctx.fillText(-step, (imgWidth - (imgWidth * 0.2)) / 2 - 8, y, imgWidth * 0.375);
          ctx.fillText(-step, imgWidth - (imgWidth - (imgWidth * 0.2)) / 2 + 8, y, imgWidth * 0.375);
          ctx.beginPath();
          ctx.moveTo((imgWidth - (imgWidth * 0.2)) / 2, y);
          ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.2)) / 2, y);
          ctx.closePath();
          step += 10;
        } else {
          ctx.beginPath();
          ctx.moveTo((imgWidth - (imgWidth * 0.1)) / 2, y);
          ctx.lineTo(imgWidth - (imgWidth - (imgWidth * 0.1)) / 2, y);
          ctx.closePath();
        }
        ctx.stroke();
      }
      stepTen ^= true;
    }

    ctx.restore();
  };

  const drawHorizonForegroundImage = function(ctx) {
    ctx.save();

    ctx.fillStyle = pointerColor.light.getRgbaColor();

    // CENTERINDICATOR
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.476635, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.476635, imageHeight * 0.514018, imageWidth * 0.485981, imageHeight * 0.523364, imageWidth * 0.5, imageHeight * 0.523364);
    ctx.bezierCurveTo(imageWidth * 0.514018, imageHeight * 0.523364, imageWidth * 0.523364, imageHeight * 0.514018, imageWidth * 0.523364, imageHeight * 0.5);
    ctx.bezierCurveTo(imageWidth * 0.523364, imageHeight * 0.485981, imageWidth * 0.514018, imageHeight * 0.476635, imageWidth * 0.5, imageHeight * 0.476635);
    ctx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.476635, imageWidth * 0.476635, imageHeight * 0.485981, imageWidth * 0.476635, imageHeight * 0.5);
    ctx.closePath();
    ctx.moveTo(imageWidth * 0.415887, imageHeight * 0.504672);
    ctx.lineTo(imageWidth * 0.415887, imageHeight * 0.495327);
    ctx.bezierCurveTo(imageWidth * 0.415887, imageHeight * 0.495327, imageWidth * 0.467289, imageHeight * 0.495327, imageWidth * 0.467289, imageHeight * 0.495327);
    ctx.bezierCurveTo(imageWidth * 0.471962, imageHeight * 0.481308, imageWidth * 0.481308, imageHeight * 0.471962, imageWidth * 0.495327, imageHeight * 0.467289);
    ctx.bezierCurveTo(imageWidth * 0.495327, imageHeight * 0.467289, imageWidth * 0.495327, imageHeight * 0.415887, imageWidth * 0.495327, imageHeight * 0.415887);
    ctx.lineTo(imageWidth * 0.504672, imageHeight * 0.415887);
    ctx.bezierCurveTo(imageWidth * 0.504672, imageHeight * 0.415887, imageWidth * 0.504672, imageHeight * 0.467289, imageWidth * 0.504672, imageHeight * 0.467289);
    ctx.bezierCurveTo(imageWidth * 0.518691, imageHeight * 0.471962, imageWidth * 0.528037, imageHeight * 0.481308, imageWidth * 0.532710, imageHeight * 0.495327);
    ctx.bezierCurveTo(imageWidth * 0.532710, imageHeight * 0.495327, imageWidth * 0.584112, imageHeight * 0.495327, imageWidth * 0.584112, imageHeight * 0.495327);
    ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.504672);
    ctx.bezierCurveTo(imageWidth * 0.584112, imageHeight * 0.504672, imageWidth * 0.532710, imageHeight * 0.504672, imageWidth * 0.532710, imageHeight * 0.504672);
    ctx.bezierCurveTo(imageWidth * 0.528037, imageHeight * 0.518691, imageWidth * 0.518691, imageHeight * 0.532710, imageWidth * 0.5, imageHeight * 0.532710);
    ctx.bezierCurveTo(imageWidth * 0.481308, imageHeight * 0.532710, imageWidth * 0.471962, imageHeight * 0.518691, imageWidth * 0.467289, imageHeight * 0.504672);
    ctx.bezierCurveTo(imageWidth * 0.467289, imageHeight * 0.504672, imageWidth * 0.415887, imageHeight * 0.504672, imageWidth * 0.415887, imageHeight * 0.504672);
    ctx.closePath();
    ctx.fill();

    // Tickmarks
    const step = 5;
    const stepRad = 5 * RAD_FACTOR;
    ctx.translate(centerX, centerY);
    ctx.rotate(-HALF_PI);
    ctx.translate(-centerX, -centerY);
    let angle;
    for (angle = -90; angle <= 90; angle += step) {
      if (angle % 45 === 0 || angle === 0) {
        ctx.strokeStyle = pointerColor.medium.getRgbaColor();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.088785);
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.113);
        ctx.closePath();
        ctx.stroke();
      } else if (angle % 15 === 0) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.088785);
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.103785);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(imageWidth * 0.5, imageHeight * 0.088785);
        ctx.lineTo(imageWidth * 0.5, imageHeight * 0.093785);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.translate(centerX, centerY);
      ctx.rotate(stepRad, centerX, centerY);
      ctx.translate(-centerX, -centerY);
    }

    ctx.restore();
  };

  const drawIndicatorImage = function(ctx) {
    ctx.save();

    const imgWidth = imageWidth * 0.037383;
    const imgHeight = imageHeight * 0.056074;

    ctx.beginPath();
    ctx.moveTo(imgWidth * 0.5, 0);
    ctx.lineTo(0, imgHeight);
    ctx.lineTo(imgWidth, imgHeight);
    ctx.closePath();

    ctx.fillStyle = pointerColor.light.getRgbaColor();
    ctx.fill();
    ctx.strokeStyle = pointerColor.medium.getRgbaColor();
    ctx.stroke();

    ctx.restore();
  };

  // **************   Initialization  ********************
  // Draw all static painting code to background
  const init = function() {
    initialized = true;

    if (frameVisible) {
      drawFrame(backgroundContext, frameDesign, centerX, centerY, imageWidth, imageHeight);
    }

    drawHorizonBackgroundImage(valueContext);

    drawIndicatorImage(indicatorContext);

    drawHorizonForegroundImage(foregroundContext);

    if (foregroundVisible) {
      drawForeground(foregroundContext, foregroundType, imageWidth, imageHeight, true, KnobType, KnobStyle, GaugeType);
    }
  };

  const resetBuffers = function() {
    // Buffer for all static background painting code
    backgroundBuffer.width = size;
    backgroundBuffer.height = size;
    backgroundContext = backgroundBuffer.getContext('2d');

    // Buffer for pointer image painting code
    valueBuffer.width = size;
    valueBuffer.height = size * PI;
    valueContext = valueBuffer.getContext('2d');

    // Buffer for the indicator
    indicatorBuffer.width = size * 0.037383;
    indicatorBuffer.height = size * 0.056074;
    indicatorContext = indicatorBuffer.getContext('2d');

    // Buffer for static foreground painting code
    foregroundBuffer.width = size;
    foregroundBuffer.height = size;
    foregroundContext = foregroundBuffer.getContext('2d');
  };

  //* *********************************** Public methods **************************************
  this.setRoll = function(newRoll) {
    newRoll = parseFloat(newRoll) % 360;
    if (roll !== newRoll) {
      roll = newRoll;
      this.repaint();
    }
    return this;
  };

  this.getRoll = function() {
    return roll;
  };

  this.setRollAnimated = function(newRoll, callback) {
    const gauge = this;
    newRoll = parseFloat(newRoll) % 360;
    if (roll !== newRoll) {
      if (undefined !== tweenRoll && tweenRoll.isPlaying) {
        tweenRoll.stop();
      }

      tweenRoll = new Tween({}, '', Tween.regularEaseInOut, roll, newRoll, 1);

      tweenRoll.onMotionChanged = function(event) {
        roll = event.target._pos;
        if (!repainting) {
          repainting = true;
          requestAnimFrame(gauge.repaint);
        }
      };

      // do we have a callback function to process?
      if (callback && typeof(callback) === 'function') {
        tweenRoll.onMotionFinished = callback;
      }

      tweenRoll.start();
    }
    return this;
  };

  this.setPitch = function(newPitch) {
    // constrain to range -180..180
    // normal range -90..90 and -180..-90/90..180 indicate inverted
    newPitch = ((parseFloat(newPitch) + 180 - pitchOffset) % 360) - 180;
    // pitch = -(newPitch + pitchOffset) % 180;
    if (pitch !== newPitch) {
      pitch = newPitch;
      if (pitch > 90) {
        pitch = 90 - (pitch - 90);
        if (!upsidedown) {
          this.setRoll(roll - 180);
        }
        upsidedown = true;
      } else if (pitch < -90) {
        pitch = -90 + (-90 - pitch);
        if (!upsidedown) {
          this.setRoll(roll + 180);
        }
        upsidedown = true;
      } else {
        upsidedown = false;
      }
      this.repaint();
    }
    return this;
  };

  this.getPitch = function() {
    return pitch;
  };

  this.setPitchAnimated = function(newPitch, callback) {
    const gauge = this;
    newPitch = parseFloat(newPitch);
    // perform all range checking in setPitch()
    if (pitch !== newPitch) {
      if (undefined !== tweenPitch && tweenPitch.isPlaying) {
        tweenPitch.stop();
      }
      tweenPitch = new Tween({}, '', Tween.regularEaseInOut, pitch, newPitch, 1);
      tweenPitch.onMotionChanged = function(event) {
        pitch = event.target._pos;
        if (pitch > 90) {
          pitch = 90 - (pitch - 90);
          if (!upsidedown) {
            this.setRoll(roll - 180);
          }
          upsidedown = true;
        } else if (pitch < -90) {
          pitch = -90 + (-90 - pitch);
          if (!upsidedown) {
            this.setRoll(roll + 180);
          }
          upsidedown = true;
        } else {
          upsidedown = false;
        }
        if (!repainting) {
          repainting = true;
          requestAnimFrame(gauge.repaint);
        }
        gauge.setPitch(event.target._pos);
      };

      // do we have a callback function to process?
      if (callback && typeof(callback) === 'function') {
        tweenPitch.onMotionFinished = callback;
      }

      tweenPitch.start();
    }
    return this;
  };

  this.setPitchOffset = function(newPitchOffset) {
    pitchOffset = parseFloat(newPitchOffset);
    this.repaint();
    return this;
  };

  this.setFrameDesign = function(newFrameDesign) {
    resetBuffers();
    frameDesign = newFrameDesign;
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

  this.repaint = function() {
    if (!initialized) {
      init();
    }

    mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    mainCtx.drawImage(backgroundBuffer, 0, 0);

    mainCtx.save();

    // Set the clipping area
    mainCtx.beginPath();
    mainCtx.arc(centerX, centerY, imageWidth * 0.831775 / 2, 0, TWO_PI, true);
    mainCtx.closePath();
    mainCtx.clip();

    // Rotate around roll
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate(-(roll * RAD_FACTOR));
    mainCtx.translate(-centerX, 0);
    // Translate about dive
    mainCtx.translate(0, (pitch * pitchPixel));

    // Draw horizon
    mainCtx.drawImage(valueBuffer, 0, -valueBuffer.height / 2);

    // Draw the scale and angle indicator
    mainCtx.translate(0, -(pitch * pitchPixel) - centerY);
    mainCtx.drawImage(indicatorBuffer, (imageWidth * 0.5 - indicatorBuffer.width / 2), (imageWidth * 0.107476));
    mainCtx.restore();

    mainCtx.drawImage(foregroundBuffer, 0, 0);

    mainCtx.restore();
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default Horizon;

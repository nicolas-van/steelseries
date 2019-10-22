
import {
getCanvasContext,
TWO_PI,
doc,
} from "./tools";

var trafficlight = function(canvas, parameters) {
  parameters = parameters || {};
  var width = (undefined === parameters.width ? 0 : parameters.width),
    height = (undefined === parameters.height ? 0 : parameters.height),
    //
    mainCtx = getCanvasContext(canvas),
    prefHeight, imageWidth, imageHeight,
    redOn = false,
    yellowOn = false,
    greenOn = false,
    initialized = false,
    housingBuffer = doc.createElement('canvas'),
    housingCtx = housingBuffer.getContext('2d'),
    lightGreenBuffer = doc.createElement('canvas'),
    lightGreenCtx = lightGreenBuffer.getContext('2d'),
    greenOnBuffer = doc.createElement('canvas'),
    greenOnCtx = greenOnBuffer.getContext('2d'),
    greenOffBuffer = doc.createElement('canvas'),
    greenOffCtx = greenOffBuffer.getContext('2d'),
    lightYellowBuffer = doc.createElement('canvas'),
    lightYellowCtx = lightYellowBuffer.getContext('2d'),
    yellowOnBuffer = doc.createElement('canvas'),
    yellowOnCtx = yellowOnBuffer.getContext('2d'),
    yellowOffBuffer = doc.createElement('canvas'),
    yellowOffCtx = yellowOffBuffer.getContext('2d'),
    lightRedBuffer = doc.createElement('canvas'),
    lightRedCtx = lightRedBuffer.getContext('2d'),
    redOnBuffer = doc.createElement('canvas'),
    redOnCtx = redOnBuffer.getContext('2d'),
    redOffBuffer = doc.createElement('canvas'),
    redOffCtx = redOffBuffer.getContext('2d');
  // End of variables

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

  prefHeight = width < (height * 0.352517) ? (width * 2.836734) : height;
  imageWidth = prefHeight * 0.352517;
  imageHeight = prefHeight;

  housingBuffer.width = imageWidth;
  housingBuffer.height = imageHeight;

  lightGreenBuffer.width = imageWidth;
  lightGreenBuffer.height = imageHeight;

  greenOnBuffer.width = imageWidth;
  greenOnBuffer.height = imageHeight;

  greenOffBuffer.width = imageWidth;
  greenOffBuffer.height = imageHeight;

  lightYellowBuffer.width = imageWidth;
  lightYellowBuffer.height = imageHeight;

  yellowOnBuffer.width = imageWidth;
  yellowOnBuffer.height = imageHeight;

  yellowOffBuffer.width = imageWidth;
  yellowOffBuffer.height = imageHeight;

  lightRedBuffer.width = imageWidth;
  lightRedBuffer.height = imageHeight;

  redOnBuffer.width = imageWidth;
  redOnBuffer.height = imageHeight;

  redOffBuffer.width = imageWidth;
  redOffBuffer.height = imageHeight;

  var drawHousing = function(ctx) {
    var housingFill, housingFrontFill;

    ctx.save();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0.107142 * imageWidth, 0);
    ctx.lineTo(imageWidth - 0.107142 * imageWidth, 0);
    ctx.quadraticCurveTo(imageWidth, 0, imageWidth, 0.107142 * imageWidth);
    ctx.lineTo(imageWidth, imageHeight - 0.107142 * imageWidth);
    ctx.quadraticCurveTo(imageWidth, imageHeight, imageWidth - 0.107142 * imageWidth, imageHeight);
    ctx.lineTo(0.107142 * imageWidth, imageHeight);
    ctx.quadraticCurveTo(0, imageHeight, 0, imageHeight - 0.107142 * imageWidth);
    ctx.lineTo(0, 0.107142 * imageWidth);
    ctx.quadraticCurveTo(0, 0, 0.107142 * imageWidth, imageHeight);
    ctx.closePath();
    housingFill = ctx.createLinearGradient(0.040816 * imageWidth, 0.007194 * imageHeight, 0.952101 * imageWidth, 0.995882 * imageHeight);
    housingFill.addColorStop(0, 'rgb(152, 152, 154)');
    housingFill.addColorStop(0.01, 'rgb(152, 152, 154)');
    housingFill.addColorStop(0.09, '#333333');
    housingFill.addColorStop(0.24, 'rgb(152, 152, 154)');
    housingFill.addColorStop(0.55, 'rgb(31, 31, 31)');
    housingFill.addColorStop(0.78, '#363636');
    housingFill.addColorStop(0.98, '#000000');
    housingFill.addColorStop(1, '#000000');
    ctx.fillStyle = housingFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0.030612 * imageWidth + 0.084183 * imageWidth, 0.010791 * imageHeight);
    ctx.lineTo(0.030612 * imageWidth + 0.938775 * imageWidth - 0.084183 * imageWidth, 0.010791 * imageHeight);
    ctx.quadraticCurveTo(0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight, 0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight + 0.084183 * imageWidth);
    ctx.lineTo(0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight - 0.084183 * imageWidth);
    ctx.quadraticCurveTo(0.030612 * imageWidth + 0.938775 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight, 0.030612 * imageWidth + 0.938775 * imageWidth - 0.084183 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight);
    ctx.lineTo(0.030612 * imageWidth + 0.084183 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight);
    ctx.quadraticCurveTo(0.030612 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight, 0.030612 * imageWidth, 0.010791 * imageHeight + 0.978417 * imageHeight - 0.084183 * imageWidth);
    ctx.lineTo(0.030612 * imageWidth, 0.010791 * imageHeight + 0.084183 * imageWidth);
    ctx.quadraticCurveTo(0.030612 * imageWidth, 0.010791 * imageHeight, 0.030612 * imageWidth + 0.084183 * imageWidth, 0.010791 * imageHeight);
    ctx.closePath();
    housingFrontFill = ctx.createLinearGradient(-0.132653 * imageWidth, -0.053956 * imageHeight, 2.061408 * imageWidth, 0.667293 * imageHeight);
    housingFrontFill.addColorStop(0, '#000000');
    housingFrontFill.addColorStop(0.01, '#000000');
    housingFrontFill.addColorStop(0.16, '#373735');
    housingFrontFill.addColorStop(0.31, '#000000');
    housingFrontFill.addColorStop(0.44, '#303030');
    housingFrontFill.addColorStop(0.65, '#000000');
    housingFrontFill.addColorStop(0.87, '#363636');
    housingFrontFill.addColorStop(0.98, '#000000');
    housingFrontFill.addColorStop(1, '#000000');
    ctx.fillStyle = housingFrontFill;
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  var drawLightGreen = function(ctx) {
    var lightGreenFrameFill, lightGreenInnerFill, lightGreenEffectFill, lightGreenInnerShadowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.805755 * imageHeight, 0.397959 * imageWidth, 0, TWO_PI, false);
    lightGreenFrameFill = ctx.createLinearGradient(0, 0.665467 * imageHeight, 0, 0.946043 * imageHeight);
    lightGreenFrameFill.addColorStop(0, '#ffffff');
    lightGreenFrameFill.addColorStop(0.05, 'rgb(204, 204, 204)');
    lightGreenFrameFill.addColorStop(0.1, 'rgb(153, 153, 153)');
    lightGreenFrameFill.addColorStop(0.17, '#666666');
    lightGreenFrameFill.addColorStop(0.27, '#333333');
    lightGreenFrameFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightGreenFrameFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1.083333, 1);
    ctx.beginPath();
    ctx.arc(0.461538 * imageWidth, 0.816546 * imageHeight, 0.367346 * imageWidth, 0, TWO_PI, false);
    lightGreenInnerFill = ctx.createLinearGradient(0, 0.687050 * imageHeight, 0, 0.946043 * imageHeight);
    lightGreenInnerFill.addColorStop(0, '#000000');
    lightGreenInnerFill.addColorStop(0.35, '#040404');
    lightGreenInnerFill.addColorStop(0.66, '#000000');
    lightGreenInnerFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightGreenInnerFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
    lightGreenEffectFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.362244 * imageWidth);
    lightGreenEffectFill.addColorStop(0, '#000000');
    lightGreenEffectFill.addColorStop(0.88, '#000000');
    lightGreenEffectFill.addColorStop(0.95, 'rgb(94, 94, 94)');
    lightGreenEffectFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightGreenEffectFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
    lightGreenInnerShadowFill = ctx.createLinearGradient(0, 0.687050 * imageHeight, 0, 0.917266 * imageHeight);
    lightGreenInnerShadowFill.addColorStop(0, '#000000');
    lightGreenInnerShadowFill.addColorStop(1, 'rgba(1, 1, 1, 0)');
    ctx.fillStyle = lightGreenInnerShadowFill;
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  var drawGreenOn = function(ctx) {
    var greenOnFill, greenOnGlowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    greenOnFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth);
    greenOnFill.addColorStop(0, 'rgb(85, 185, 123)');
    greenOnFill.addColorStop(1, 'rgb(0, 31, 0)');
    ctx.fillStyle = greenOnFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0.812949 * imageHeight);
    ctx.bezierCurveTo(0, 0.910071 * imageHeight, 0.224489 * imageWidth, 0.989208 * imageHeight, 0.5 * imageWidth, 0.989208 * imageHeight);
    ctx.bezierCurveTo(0.775510 * imageWidth, 0.989208 * imageHeight, imageWidth, 0.910071 * imageHeight, imageWidth, 0.809352 * imageHeight);
    ctx.bezierCurveTo(0.908163 * imageWidth, 0.751798 * imageHeight, 0.704081 * imageWidth, 0.687050 * imageHeight, 0.5 * imageWidth, 0.687050 * imageHeight);
    ctx.bezierCurveTo(0.285714 * imageWidth, 0.687050 * imageHeight, 0.081632 * imageWidth, 0.751798 * imageHeight, 0, 0.812949 * imageHeight);
    ctx.closePath();
    greenOnGlowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.515306 * imageWidth);
    greenOnGlowFill.addColorStop(0, 'rgb(65, 187, 126)');
    greenOnGlowFill.addColorStop(1, 'rgba(4, 37, 8, 0)');
    ctx.fillStyle = greenOnGlowFill;
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  var drawGreenOff = function(ctx) {
    var greenOffFill, greenOffInnerShadowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    greenOffFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth);
    greenOffFill.addColorStop(0, 'rgba(0, 255, 0, 0.25)');
    greenOffFill.addColorStop(1, 'rgba(0, 255, 0, 0.05)');
    ctx.fillStyle = greenOffFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    greenOffInnerShadowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.809352 * imageHeight, 0, 0.5 * imageWidth, 0.809352 * imageHeight, 0.326530 * imageWidth);
    greenOffInnerShadowFill.addColorStop(0, 'rgba(1, 1, 1, 0)');
    greenOffInnerShadowFill.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
    greenOffInnerShadowFill.addColorStop(0.5501, 'rgba(0, 0, 0, 0)');
    greenOffInnerShadowFill.addColorStop(0.78, 'rgba(0, 0, 0, 0.12)');
    greenOffInnerShadowFill.addColorStop(0.79, 'rgba(0, 0, 0, 0.12)');
    greenOffInnerShadowFill.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = greenOffInnerShadowFill;
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = ctx.createPattern(hatchBuffer, 'repeat');
    ctx.fill();

    ctx.restore();
  };

  var drawLightYellow = function(ctx) {
    var lightYellowFrameFill, lightYellowInnerFill, lightYellowEffectFill, lightYellowInnerShadowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.496402 * imageHeight, 0.397959 * imageWidth, 0, TWO_PI, false);
    lightYellowFrameFill = ctx.createLinearGradient(0, 0.356115 * imageHeight, 0, 0.636690 * imageHeight);
    lightYellowFrameFill.addColorStop(0, '#ffffff');
    lightYellowFrameFill.addColorStop(0.05, 'rgb(204, 204, 204)');
    lightYellowFrameFill.addColorStop(0.1, 'rgb(153, 153, 153)');
    lightYellowFrameFill.addColorStop(0.17, '#666666');
    lightYellowFrameFill.addColorStop(0.27, '#333333');
    lightYellowFrameFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightYellowFrameFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1.083333, 1);
    ctx.beginPath();
    ctx.arc(0.461538 * imageWidth, 0.507194 * imageHeight, 0.367346 * imageWidth, 0, TWO_PI, false);
    lightYellowInnerFill = ctx.createLinearGradient(0, 0.377697 * imageHeight, 0, 0.636690 * imageHeight);
    lightYellowInnerFill.addColorStop(0, '#000000');
    lightYellowInnerFill.addColorStop(0.35, '#040404');
    lightYellowInnerFill.addColorStop(0.66, '#000000');
    lightYellowInnerFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightYellowInnerFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
    lightYellowEffectFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.362244 * imageWidth);
    lightYellowEffectFill.addColorStop(0, '#000000');
    lightYellowEffectFill.addColorStop(0.88, '#000000');
    lightYellowEffectFill.addColorStop(0.95, '#5e5e5e');
    lightYellowEffectFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightYellowEffectFill;
    ctx.fill();
    ctx.restore();

    //lIGHT_YELLOW_4_E_INNER_SHADOW_3_4
    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
    lightYellowInnerShadowFill = ctx.createLinearGradient(0, 0.377697 * imageHeight, 0, 0.607913 * imageHeight);
    lightYellowInnerShadowFill.addColorStop(0, '#000000');
    lightYellowInnerShadowFill.addColorStop(1, 'rgba(1, 1, 1, 0)');
    ctx.fillStyle = lightYellowInnerShadowFill;
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  var drawYellowOn = function(ctx) {
    var yellowOnFill, yellowOnGlowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    yellowOnFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth);
    yellowOnFill.addColorStop(0, '#fed434');
    yellowOnFill.addColorStop(1, '#82330c');
    ctx.fillStyle = yellowOnFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0.503597 * imageHeight);
    ctx.bezierCurveTo(0, 0.600719 * imageHeight, 0.224489 * imageWidth, 0.679856 * imageHeight, 0.5 * imageWidth, 0.679856 * imageHeight);
    ctx.bezierCurveTo(0.775510 * imageWidth, 0.679856 * imageHeight, imageWidth, 0.600719 * imageHeight, imageWidth, 0.5 * imageHeight);
    ctx.bezierCurveTo(0.908163 * imageWidth, 0.442446 * imageHeight, 0.704081 * imageWidth, 0.377697 * imageHeight, 0.5 * imageWidth, 0.377697 * imageHeight);
    ctx.bezierCurveTo(0.285714 * imageWidth, 0.377697 * imageHeight, 0.081632 * imageWidth, 0.442446 * imageHeight, 0, 0.503597 * imageHeight);
    ctx.closePath();
    yellowOnGlowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.515306 * imageWidth);
    yellowOnGlowFill.addColorStop(0, '#fed434');
    yellowOnGlowFill.addColorStop(1, 'rgba(130, 51, 12, 0)');
    ctx.fillStyle = yellowOnGlowFill;
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  var drawYellowOff = function(ctx) {
    var yellowOffFill, yellowOffInnerShadowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    yellowOffFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth);
    yellowOffFill.addColorStop(0, 'rgba(255, 255, 0, 0.25)');
    yellowOffFill.addColorStop(1, 'rgba(255, 255, 0, 0.05)');
    ctx.fillStyle = yellowOffFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    yellowOffInnerShadowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.5 * imageHeight, 0, 0.5 * imageWidth, 0.5 * imageHeight, 0.326530 * imageWidth);
    yellowOffInnerShadowFill.addColorStop(0, 'rgba(1, 1, 1, 0)');
    yellowOffInnerShadowFill.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
    yellowOffInnerShadowFill.addColorStop(0.5501, 'rgba(0, 0, 0, 0)');
    yellowOffInnerShadowFill.addColorStop(0.78, 'rgba(0, 0, 0, 0.12)');
    yellowOffInnerShadowFill.addColorStop(0.79, 'rgba(0, 0, 0, 0.13)');
    yellowOffInnerShadowFill.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = yellowOffInnerShadowFill;
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = ctx.createPattern(hatchBuffer, 'repeat');
    ctx.fill();

    ctx.restore();
  };

  var drawLightRed = function(ctx) {
    var lightRedFrameFill, lightRedInnerFill, lightRedEffectFill, lightRedInnerShadowFill;

    ctx.save();

    //lIGHT_RED_7_E_FRAME_0_1
    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.187050 * imageHeight, 0.397959 * imageWidth, 0, TWO_PI, false);
    lightRedFrameFill = ctx.createLinearGradient((0.5 * imageWidth), (0.046762 * imageHeight), ((0.500000) * imageWidth), ((0.327338) * imageHeight));
    lightRedFrameFill.addColorStop(0, '#ffffff');
    lightRedFrameFill.addColorStop(0.05, '#cccccc');
    lightRedFrameFill.addColorStop(0.1, '#999999');
    lightRedFrameFill.addColorStop(0.17, '#666666');
    lightRedFrameFill.addColorStop(0.27, '#333333');
    lightRedFrameFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightRedFrameFill;
    ctx.fill();
    ctx.restore();

    //lIGHT_RED_7_E_INNER_CLIP_1_2
    ctx.save();
    ctx.scale(1.083333, 1);
    ctx.beginPath();
    ctx.arc(0.461538 * imageWidth, 0.197841 * imageHeight, 0.367346 * imageWidth, 0, TWO_PI, false);
    lightRedInnerFill = ctx.createLinearGradient((0.5 * imageWidth), (0.068345 * imageHeight), ((0.500000) * imageWidth), ((0.327338) * imageHeight));
    lightRedInnerFill.addColorStop(0, '#000000');
    lightRedInnerFill.addColorStop(0.35, '#040404');
    lightRedInnerFill.addColorStop(0.66, '#000000');
    lightRedInnerFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightRedInnerFill;
    ctx.fill();
    ctx.restore();

    //lIGHT_RED_7_E_LIGHT_EFFECT_2_3
    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
    lightRedEffectFill = ctx.createRadialGradient((0.5) * imageWidth, ((0.190647) * imageHeight), 0, ((0.5) * imageWidth), ((0.190647) * imageHeight), 0.362244 * imageWidth);
    lightRedEffectFill.addColorStop(0, '#000000');
    lightRedEffectFill.addColorStop(0.88, '#000000');
    lightRedEffectFill.addColorStop(0.95, '#5e5e5e');
    lightRedEffectFill.addColorStop(1, '#010101');
    ctx.fillStyle = lightRedEffectFill;
    ctx.fill();
    ctx.restore();

    //lIGHT_RED_7_E_INNER_SHADOW_3_4
    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.357142 * imageWidth, 0, TWO_PI, false);
    lightRedInnerShadowFill = ctx.createLinearGradient((0.5 * imageWidth), (0.068345 * imageHeight), ((0.500000) * imageWidth), ((0.298561) * imageHeight));
    lightRedInnerShadowFill.addColorStop(0, '#000000');
    lightRedInnerShadowFill.addColorStop(1, 'rgba(1, 1, 1, 0)');
    ctx.fillStyle = lightRedInnerShadowFill;
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  var drawRedOn = function(ctx) {
    var redOnFill, redOnGlowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    redOnFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth);
    redOnFill.addColorStop(0, '#ff0000');
    redOnFill.addColorStop(1, '#410004');
    ctx.fillStyle = redOnFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0.194244 * imageHeight);
    ctx.bezierCurveTo(0, 0.291366 * imageHeight, 0.224489 * imageWidth, 0.370503 * imageHeight, 0.5 * imageWidth, 0.370503 * imageHeight);
    ctx.bezierCurveTo(0.775510 * imageWidth, 0.370503 * imageHeight, imageWidth, 0.291366 * imageHeight, imageWidth, 0.190647 * imageHeight);
    ctx.bezierCurveTo(0.908163 * imageWidth, 0.133093 * imageHeight, 0.704081 * imageWidth, 0.068345 * imageHeight, 0.5 * imageWidth, 0.068345 * imageHeight);
    ctx.bezierCurveTo(0.285714 * imageWidth, 0.068345 * imageHeight, 0.081632 * imageWidth, 0.133093 * imageHeight, 0, 0.194244 * imageHeight);
    ctx.closePath();
    redOnGlowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.515306 * imageWidth);
    redOnGlowFill.addColorStop(0, '#ff0000');
    redOnGlowFill.addColorStop(1, 'rgba(118, 5, 1, 0)');
    ctx.fillStyle = redOnGlowFill;
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  var drawRedOff = function(ctx) {
    var redOffFill, redOffInnerShadowFill;

    ctx.save();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    redOffFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth);
    redOffFill.addColorStop(0, 'rgba(255, 0, 0, 0.25)');
    redOffFill.addColorStop(1, 'rgba(255, 0, 0, 0.05)');
    ctx.fillStyle = redOffFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1, 1);
    ctx.beginPath();
    ctx.arc(0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth, 0, TWO_PI, false);
    redOffInnerShadowFill = ctx.createRadialGradient(0.5 * imageWidth, 0.190647 * imageHeight, 0, 0.5 * imageWidth, 0.190647 * imageHeight, 0.326530 * imageWidth);
    redOffInnerShadowFill.addColorStop(0, 'rgba(1, 1, 1, 0)');
    redOffInnerShadowFill.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
    redOffInnerShadowFill.addColorStop(0.5501, 'rgba(0, 0, 0, 0)');
    redOffInnerShadowFill.addColorStop(0.78, 'rgba(0, 0, 0, 0.12)');
    redOffInnerShadowFill.addColorStop(0.79, 'rgba(0, 0, 0, 0.13)');
    redOffInnerShadowFill.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = redOffInnerShadowFill;
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = ctx.createPattern(hatchBuffer, 'repeat');
    ctx.fill();

    ctx.restore();
  };

  function drawToBuffer(width, height, drawFunction) {
    var buffer = doc.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    drawFunction(buffer.getContext('2d'));
    return buffer;
  }

  var hatchBuffer = drawToBuffer(2, 2, function(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.lineTo(0, 0, 1, 0);
    ctx.lineTo(0, 1, 0, 1);
    ctx.stroke();
    ctx.restore();
  });

  var init = function() {
    initialized = true;

    drawHousing(housingCtx);
    drawLightGreen(lightGreenCtx);
    drawGreenOn(greenOnCtx);
    drawGreenOff(greenOffCtx);
    drawLightYellow(lightYellowCtx);
    drawYellowOn(yellowOnCtx);
    drawYellowOff(yellowOffCtx);
    drawLightRed(lightRedCtx);
    drawRedOn(redOnCtx);
    drawRedOff(redOffCtx);
  };

  // **************   P U B L I C   M E T H O D S   ********************************
  this.setRedOn = function(on) {
    redOn = !!on;
    this.repaint();
  };

  this.isRedOn = function() {
    return redOn;
  };

  this.setYellowOn = function(on) {
    yellowOn = !!on;
    this.repaint();
  };

  this.isYellowOn = function() {
    return yellowOn;
  };

  this.setGreenOn = function(on) {
    greenOn = !!on;
    this.repaint();
  };

  this.isGreenOn = function() {
    return greenOn;
  };

  this.repaint = function() {
    if (!initialized) {
      init();
    }

    mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    // housing
    mainCtx.drawImage(housingBuffer, 0, 0);

    // Green light
    mainCtx.drawImage(lightGreenBuffer, 0, 0);

    if (greenOn) {
      mainCtx.drawImage(greenOnBuffer, 0, 0);
    }

    mainCtx.drawImage(greenOffBuffer, 0, 0);

    // Yellow light
    mainCtx.drawImage(lightYellowBuffer, 0, 0);

    if (yellowOn) {
      mainCtx.drawImage(yellowOnBuffer, 0, 0);
    }

    mainCtx.drawImage(yellowOffBuffer, 0, 0);

    // Red light
    mainCtx.drawImage(lightRedBuffer, 0, 0);

    if (redOn) {
      mainCtx.drawImage(redOnBuffer, 0, 0);
    }

    mainCtx.drawImage(redOffBuffer, 0, 0);
    mainCtx.restore();
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default trafficlight;
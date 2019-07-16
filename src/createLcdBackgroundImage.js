
import {
roundedRectangle, 
createBuffer, 
} from "./tools";

var createLcdBackgroundImage = function(width, height, lcdColor) {
  var lcdBuffer, lcdCtx,
    xB = 0,
    yB = 0,
    wB = width,
    hB = height,
    rB = Math.min(width, height) * 0.095,
    grad,
    xF = 1,
    yF = 1,
    wF = width - 2,
    hF = height - 2,
    rF = rB - 1,
    cacheKey = width.toString() + height + JSON.stringify(lcdColor);

  // check if we have already created and cached this buffer, if not create it
  if (!createLcdBackgroundImage.cache[cacheKey]) {
    lcdBuffer = createBuffer(width, height);
    lcdCtx = lcdBuffer.getContext('2d');
    // background
    grad = lcdCtx.createLinearGradient(0, yB, 0, yB + hB);
    grad.addColorStop(0, '#4c4c4c');
    grad.addColorStop(0.08, '#666666');
    grad.addColorStop(0.92, '#666666');
    grad.addColorStop(1, '#e6e6e6');
    lcdCtx.fillStyle = grad;
    roundedRectangle(lcdCtx, xB, yB, wB, hB, rB);
    lcdCtx.fill();

    // foreground
    grad = lcdCtx.createLinearGradient(0, yF, 0, yF + hF);
    grad.addColorStop(0, lcdColor.gradientStartColor);
    grad.addColorStop(0.03, lcdColor.gradientFraction1Color);
    grad.addColorStop(0.49, lcdColor.gradientFraction2Color);
    grad.addColorStop(0.5, lcdColor.gradientFraction3Color);
    grad.addColorStop(1, lcdColor.gradientStopColor);
    lcdCtx.fillStyle = grad;
    roundedRectangle(lcdCtx, xF, yF, wF, hF, rF);
    lcdCtx.fill();
    // cache the buffer
    createLcdBackgroundImage.cache[cacheKey] = lcdBuffer;
  }
  return createLcdBackgroundImage.cache[cacheKey];
};
createLcdBackgroundImage.cache = {};

export default createLcdBackgroundImage;

import {
  doc,
} from './tools';

var createMeasuredValueImage = function(size, indicatorColor, radial, vertical) {
  let indicatorBuffer; let indicatorCtx;
  const cacheKey = size.toString() + indicatorColor + radial + vertical;

  // check if we have already created and cached this buffer, if so return it and exit
  if (!createMeasuredValueImage.cache[cacheKey]) {
    indicatorBuffer = doc.createElement('canvas');
    indicatorCtx = indicatorBuffer.getContext('2d');
    indicatorBuffer.width = size;
    indicatorBuffer.height = size;
    indicatorCtx.fillStyle = indicatorColor;
    if (radial) {
      indicatorCtx.beginPath();
      indicatorCtx.moveTo(size * 0.5, size);
      indicatorCtx.lineTo(0, 0);
      indicatorCtx.lineTo(size, 0);
      indicatorCtx.closePath();
      indicatorCtx.fill();
    } else {
      if (vertical) {
        indicatorCtx.beginPath();
        indicatorCtx.moveTo(size, size * 0.5);
        indicatorCtx.lineTo(0, 0);
        indicatorCtx.lineTo(0, size);
        indicatorCtx.closePath();
        indicatorCtx.fill();
      } else {
        indicatorCtx.beginPath();
        indicatorCtx.moveTo(size * 0.5, 0);
        indicatorCtx.lineTo(size, size);
        indicatorCtx.lineTo(0, size);
        indicatorCtx.closePath();
        indicatorCtx.fill();
      }
    }
    // cache the buffer
    createMeasuredValueImage.cache[cacheKey] = indicatorBuffer;
  }
  return createMeasuredValueImage.cache[cacheKey];
};
createMeasuredValueImage.cache = {};

export default createMeasuredValueImage;

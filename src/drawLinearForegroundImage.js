import {createBuffer} from './tools';

const drawLinearForegroundImage = function(
    ctx,
    imageWidth,
    imageHeight,
    vertical
) {
  let linFgBuffer;
  let linFgCtx;
  let foregroundGradient;
  let frameWidth;
  let fgOffset;
  let fgOffset2;
  const cacheKey = imageWidth.toString() + imageHeight + vertical;

  // check if we have already created and cached this buffer, if not create it
  if (!drawLinearForegroundImage.cache[cacheKey]) {
    // Setup buffer
    linFgBuffer = createBuffer(imageWidth, imageHeight);
    linFgCtx = linFgBuffer.getContext('2d');

    frameWidth =
      Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight) * 0.04;
    frameWidth = Math.min(
        frameWidth,
        (vertical ? imageWidth : imageHeight) * 0.1
    );
    fgOffset = frameWidth * 1.3;
    fgOffset2 = fgOffset * 1.33;

    linFgCtx.beginPath();
    linFgCtx.moveTo(fgOffset, imageHeight - fgOffset);
    linFgCtx.lineTo(imageWidth - fgOffset, imageHeight - fgOffset);
    linFgCtx.bezierCurveTo(
        imageWidth - fgOffset,
        imageHeight - fgOffset,
        imageWidth - fgOffset2,
        imageHeight * 0.7,
        imageWidth - fgOffset2,
        imageHeight * 0.5
    );
    linFgCtx.bezierCurveTo(
        imageWidth - fgOffset2,
        fgOffset2,
        imageWidth - fgOffset,
        fgOffset,
        imageWidth - frameWidth,
        fgOffset
    );
    linFgCtx.lineTo(fgOffset, fgOffset);
    linFgCtx.bezierCurveTo(
        fgOffset,
        fgOffset,
        fgOffset2,
        imageHeight * 0.285714,
        fgOffset2,
        imageHeight * 0.5
    );
    linFgCtx.bezierCurveTo(
        fgOffset2,
        imageHeight * 0.7,
        fgOffset,
        imageHeight - fgOffset,
        frameWidth,
        imageHeight - fgOffset
    );
    linFgCtx.closePath();

    foregroundGradient = linFgCtx.createLinearGradient(
        0,
        imageHeight - frameWidth,
        0,
        frameWidth
    );
    foregroundGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(0.06, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(0.07, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(0.12, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(0.17, 'rgba(255, 255, 255, 0.013546)');
    foregroundGradient.addColorStop(0.1701, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(0.79, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(0.84, 'rgba(255, 255, 255, 0.082217)');
    foregroundGradient.addColorStop(0.93, 'rgba(255, 255, 255, 0.288702)');
    foregroundGradient.addColorStop(0.94, 'rgba(255, 255, 255, 0.298039)');
    foregroundGradient.addColorStop(0.96, 'rgba(255, 255, 255, 0.119213)');
    foregroundGradient.addColorStop(0.97, 'rgba(255, 255, 255, 0)');
    foregroundGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    linFgCtx.fillStyle = foregroundGradient;
    linFgCtx.fill();

    // cache the buffer
    drawLinearForegroundImage.cache[cacheKey] = linFgBuffer;
  }
  ctx.drawImage(drawLinearForegroundImage.cache[cacheKey], 0, 0);
  return this;
};
drawLinearForegroundImage.cache = {};

export default drawLinearForegroundImage;

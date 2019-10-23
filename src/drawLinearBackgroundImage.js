import carbonBuffer from './carbonBuffer';
import punchedSheetBuffer from './punchedSheetBuffer';
import brushedMetalTexture from './brushedMetalTexture';
import {
  rgbaColor,
  ConicalGradient,
  roundedRectangle,
  createBuffer,
  TWO_PI,
} from './tools';

const drawLinearBackgroundImage = function(
    ctx,
    backgroundColor,
    imageWidth,
    imageHeight,
    vertical
) {
  let i;
  let end;
  let grad;
  let fractions;
  let colors;
  let frameWidth;
  let linBBuffer;
  let linBCtx;
  let radius;
  let turnRadius;
  let centerX;
  let centerY;
  let stepSize;
  let mono;
  let textureColor;
  let texture;
  const cacheKey =
    imageWidth.toString() + imageHeight + vertical + backgroundColor.name;

  // check if we have already created and cached this buffer, if not create it
  if (!drawLinearBackgroundImage.cache[cacheKey]) {
    frameWidth =
      Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight) * 0.04;
    frameWidth =
      Math.ceil(
          Math.min(frameWidth, (vertical ? imageWidth : imageHeight) * 0.1)
      ) - 1;

    const CORNER_RADIUS = Math.floor(
        (vertical ? imageWidth : imageHeight) * 0.028571
    );
    // Setup buffer
    linBBuffer = createBuffer(imageWidth, imageHeight);
    linBCtx = linBBuffer.getContext('2d');
    linBCtx.lineWidth = 0;

    roundedRectangle(
        linBCtx,
        frameWidth,
        frameWidth,
        imageWidth - frameWidth * 2,
        imageHeight - frameWidth * 2,
        CORNER_RADIUS
    );

    // If the backgroundColor is a texture fill it with the texture instead of the gradient
    if (
      backgroundColor.name === 'CARBON' ||
      backgroundColor.name === 'PUNCHED_SHEET' ||
      backgroundColor.name === 'STAINLESS' ||
      backgroundColor.name === 'BRUSHED_METAL' ||
      backgroundColor.name === 'BRUSHED_STAINLESS' ||
      backgroundColor.name === 'TURNED'
    ) {
      if (backgroundColor.name === 'CARBON') {
        linBCtx.fillStyle = linBCtx.createPattern(carbonBuffer, 'repeat');
        linBCtx.fill();
      }

      if (backgroundColor.name === 'PUNCHED_SHEET') {
        linBCtx.fillStyle = linBCtx.createPattern(punchedSheetBuffer, 'repeat');
        linBCtx.fill();
      }

      if (
        backgroundColor.name === 'STAINLESS' ||
        backgroundColor.name === 'TURNED'
      ) {
        // Define the fraction of the conical gradient paint
        fractions = [
          0,
          0.03,
          0.1,
          0.14,
          0.24,
          0.33,
          0.38,
          0.5,
          0.62,
          0.67,
          0.76,
          0.81,
          0.85,
          0.97,
          1,
        ];

        // Define the colors of the conical gradient paint
        colors = [
          new rgbaColor('#FDFDFD'),
          new rgbaColor('#FDFDFD'),
          new rgbaColor('#B2B2B4'),
          new rgbaColor('#ACACAE'),
          new rgbaColor('#FDFDFD'),
          new rgbaColor('#8E8E8E'),
          new rgbaColor('#8E8E8E'),
          new rgbaColor('#FDFDFD'),
          new rgbaColor('#8E8E8E'),
          new rgbaColor('#8E8E8E'),
          new rgbaColor('#FDFDFD'),
          new rgbaColor('#ACACAE'),
          new rgbaColor('#B2B2B4'),
          new rgbaColor('#FDFDFD'),
          new rgbaColor('#FDFDFD'),
        ];
        grad = new ConicalGradient(fractions, colors);
        // Set a clip as we will be drawing outside the required area
        linBCtx.clip();
        grad.fillRect(
            linBCtx,
            imageWidth / 2,
            imageHeight / 2,
            imageWidth - frameWidth * 2,
            imageHeight - frameWidth * 2,
            imageWidth / 2,
            imageHeight / 2
        );
        // Add an additional inner shadow to fade out brightness at the top
        grad = linBCtx.createLinearGradient(
            0,
            frameWidth,
            0,
            imageHeight - frameWidth * 2
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
        grad.addColorStop(0.1, 'rgba(0, 0, 0, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        linBCtx.fillStyle = grad;
        linBCtx.fill();

        if (backgroundColor.name === 'TURNED') {
          // Define the turning radius
          radius =
            Math.sqrt(
                (imageWidth - frameWidth * 2) * (imageWidth - frameWidth * 2) +
                (imageHeight - frameWidth * 2) * (imageHeight - frameWidth * 2)
            ) / 2;
          turnRadius = radius * 0.55;
          centerX = imageWidth / 2;
          centerY = imageHeight / 2;
          // Step size proporational to radius
          stepSize = (TWO_PI / 360) * (400 / radius);

          // Save before we start
          linBCtx.save();

          // Set a clip as we will be drawing outside the required area
          roundedRectangle(
              linBCtx,
              frameWidth,
              frameWidth,
              imageWidth - frameWidth * 2,
              imageHeight - frameWidth * 2,
              CORNER_RADIUS
          );
          linBCtx.clip();

          // set the style for the turnings
          linBCtx.lineWidth = 0.5;
          end = TWO_PI - stepSize * 0.3;
          // Step the engine round'n'round
          for (i = 0; i < end; i += stepSize) {
            // draw a 'turn'
            linBCtx.strokeStyle = 'rgba(240, 240, 255, 0.25)';
            linBCtx.beginPath();
            linBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
            linBCtx.stroke();
            // rotate the 'piece'
            linBCtx.translate(centerX, centerY);
            linBCtx.rotate(stepSize * 0.3);
            linBCtx.translate(-centerX, -centerY);
            // draw a 'turn'
            linBCtx.strokeStyle = 'rgba(25, 10, 10, 0.1)';
            linBCtx.beginPath();
            linBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
            linBCtx.stroke();
            linBCtx.translate(centerX, centerY);
            linBCtx.rotate(-stepSize * 0.3);
            linBCtx.translate(-centerX, -centerY);

            // rotate the 'piece'
            linBCtx.translate(centerX, centerY);
            linBCtx.rotate(stepSize);
            linBCtx.translate(-centerX, -centerY);
          }
          // Restore canvas now we are done
          linBCtx.restore();
        }
      }
      // Add an additional inner shadow to make the look more realistic
      grad = linBCtx.createLinearGradient(
          frameWidth,
          frameWidth,
          imageWidth - frameWidth * 2,
          imageHeight - frameWidth * 2
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      linBCtx.fillStyle = grad;
      roundedRectangle(
          linBCtx,
          frameWidth,
          frameWidth,
          imageWidth - frameWidth * 2,
          imageHeight - frameWidth * 2,
          CORNER_RADIUS
      );
      linBCtx.fill();

      if (
        backgroundColor.name === 'BRUSHED_METAL' ||
        backgroundColor.name === 'BRUSHED_STAINLESS'
      ) {
        mono = backgroundColor.name === 'BRUSHED_METAL' ? true : false;
        textureColor = parseInt(
            backgroundColor.gradientStop.getHexColor().substr(-6),
            16
        );
        texture = brushedMetalTexture(textureColor, 5, 0.1, mono, 0.5);
        linBCtx.fillStyle = linBCtx.createPattern(
            texture.fill(0, 0, imageWidth, imageHeight),
            'no-repeat'
        );
        linBCtx.fill();
      }
    } else {
      grad = linBCtx.createLinearGradient(
          0,
          frameWidth,
          0,
          imageHeight - frameWidth * 2
      );
      grad.addColorStop(0, backgroundColor.gradientStart.getRgbaColor());
      grad.addColorStop(0.4, backgroundColor.gradientFraction.getRgbaColor());
      grad.addColorStop(1, backgroundColor.gradientStop.getRgbaColor());
      linBCtx.fillStyle = grad;
      linBCtx.fill();
    }
    // Add a simple inner shadow
    colors = [
      'rgba(0, 0, 0, 0.30)',
      'rgba(0, 0, 0, 0.20)',
      'rgba(0, 0, 0, 0.13)',
      'rgba(0, 0, 0, 0.09)',
      'rgba(0, 0, 0, 0.06)',
      'rgba(0, 0, 0, 0.04)',
      'rgba(0, 0, 0, 0.03)',
    ];
    for (i = 0; i < 7; i++) {
      linBCtx.strokeStyle = colors[i];
      roundedRectangle(
          linBCtx,
          frameWidth + i,
          frameWidth + i,
          imageWidth - frameWidth * 2 - 2 * i,
          imageHeight - frameWidth * 2 - 2 * i,
          CORNER_RADIUS
      );
      linBCtx.stroke();
    }
    // cache the buffer
    drawLinearBackgroundImage.cache[cacheKey] = linBBuffer;
  }
  ctx.drawImage(drawLinearBackgroundImage.cache[cacheKey], 0, 0);
  return this;
};
drawLinearBackgroundImage.cache = {};

export default drawLinearBackgroundImage;

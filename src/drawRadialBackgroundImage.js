
import carbonBuffer from "./carbonBuffer";
import punchedSheetBuffer from "./punchedSheetBuffer";
import brushedMetalTexture from "./brushedMetalTexture";
import {
RgbaColor, 
ConicalGradient, 
createBuffer, 
TWO_PI,
RAD_FACTOR,
} from "./tools";

var drawRadialBackgroundImage = function(ctx, backgroundColor, centerX, centerY, imageWidth, imageHeight) {
  var radBBuffer, radBCtx,
    grad, fractions, colors,
    backgroundOffsetX = imageWidth * 0.831775 / 2,
    mono, textureColor, texture,
    radius, turnRadius, stepSize,
    end, i,
    cacheKey = imageWidth.toString() + imageHeight + backgroundColor.name;

  // check if we have already created and cached this buffer, if not create it
  if (!drawRadialBackgroundImage.cache[cacheKey]) {
    // Setup buffer
    radBBuffer = createBuffer(imageWidth, imageHeight);
    radBCtx = radBBuffer.getContext('2d');

    // Background ellipse
    radBCtx.beginPath();
    radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
    radBCtx.closePath();

    // If the backgroundColor is a texture fill it with the texture instead of the gradient
    if (backgroundColor.name === 'CARBON' || backgroundColor.name === 'PUNCHED_SHEET' ||
      backgroundColor.name === 'BRUSHED_METAL' || backgroundColor.name === 'BRUSHED_STAINLESS') {

      if (backgroundColor.name === 'CARBON') {
        radBCtx.fillStyle = radBCtx.createPattern(carbonBuffer, 'repeat');
        radBCtx.fill();
      }

      if (backgroundColor.name === 'PUNCHED_SHEET') {
        radBCtx.fillStyle = radBCtx.createPattern(punchedSheetBuffer, 'repeat');
        radBCtx.fill();
      }

      // Add another inner shadow to make the look more realistic
      grad = radBCtx.createLinearGradient(backgroundOffsetX, 0, imageWidth - backgroundOffsetX, 0);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      radBCtx.fillStyle = grad;
      radBCtx.beginPath();
      radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
      radBCtx.closePath();
      radBCtx.fill();

      if (backgroundColor.name === 'BRUSHED_METAL' || backgroundColor.name === 'BRUSHED_STAINLESS') {
        mono = (backgroundColor.name === 'BRUSHED_METAL' ? true : false);
        textureColor = parseInt(backgroundColor.gradientStop.getHexColor().substr(-6), 16);
        texture = brushedMetalTexture(textureColor, 5, 0.1, mono, 0.5);
        radBCtx.fillStyle = radBCtx.createPattern(texture.fill(0, 0, imageWidth, imageHeight), 'no-repeat');
        radBCtx.fill();
      }
    } else if (backgroundColor.name === 'STAINLESS' || backgroundColor.name === 'TURNED') {
      // Define the fractions of the conical gradient paint
      fractions = [0,
        0.03,
        0.10,
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
        1
      ];

      // Define the colors of the conical gradient paint
      colors = [new RgbaColor('#FDFDFD'),
        new RgbaColor('#FDFDFD'),
        new RgbaColor('#B2B2B4'),
        new RgbaColor('#ACACAE'),
        new RgbaColor('#FDFDFD'),
        new RgbaColor('#8E8E8E'),
        new RgbaColor('#8E8E8E'),
        new RgbaColor('#FDFDFD'),
        new RgbaColor('#8E8E8E'),
        new RgbaColor('#8E8E8E'),
        new RgbaColor('#FDFDFD'),
        new RgbaColor('#ACACAE'),
        new RgbaColor('#B2B2B4'),
        new RgbaColor('#FDFDFD'),
        new RgbaColor('#FDFDFD')
      ];

      grad = new ConicalGradient(fractions, colors);
      grad.fillCircle(radBCtx, centerX, centerY, 0, backgroundOffsetX);

      if (backgroundColor.name === 'TURNED') {
        // Define the turning radius
        radius = backgroundOffsetX;
        turnRadius = radius * 0.55;
        // Step size proporational to radius
        stepSize = RAD_FACTOR * (500 / radius);
        // Save before we start
        radBCtx.save();
        // restrict the turnings to the desired area
        radBCtx.beginPath();
        radBCtx.arc(centerX, centerY, radius, 0, TWO_PI);
        radBCtx.closePath();
        radBCtx.clip();
        // set the style for the turnings
        radBCtx.lineWidth = 0.5;
        end = TWO_PI - stepSize * 0.3;
        // Step the engine round'n'round
        for (i = 0; i < end; i += stepSize) {
          // draw a 'turn'
          radBCtx.strokeStyle = 'rgba(240, 240, 255, 0.25)';
          radBCtx.beginPath();
          radBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
          radBCtx.stroke();
          // rotate the 'piece' a fraction to draw 'shadow'
          radBCtx.translate(centerX, centerY);
          radBCtx.rotate(stepSize * 0.3);
          radBCtx.translate(-centerX, -centerY);
          // draw a 'turn'
          radBCtx.strokeStyle = 'rgba(25, 10, 10, 0.1)';
          radBCtx.beginPath();
          radBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
          radBCtx.stroke();
          // now rotate on to the next 'scribe' position minus the 'fraction'
          radBCtx.translate(centerX, centerY);
          radBCtx.rotate(stepSize - stepSize * 0.3);
          radBCtx.translate(-centerX, -centerY);
        }
        // Restore canvas now we are done
        radBCtx.restore();
      }
    } else {
      grad = radBCtx.createLinearGradient(0, imageWidth * 0.084112, 0, backgroundOffsetX * 2);
      grad.addColorStop(0, backgroundColor.gradientStart.getRgbaColor());
      grad.addColorStop(0.4, backgroundColor.gradientFraction.getRgbaColor());
      grad.addColorStop(1, backgroundColor.gradientStop.getRgbaColor());
      radBCtx.fillStyle = grad;
      radBCtx.fill();
    }
    // Inner shadow
    grad = radBCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, backgroundOffsetX);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.71, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.86, 'rgba(0, 0, 0, 0.03)');
    grad.addColorStop(0.92, 'rgba(0, 0, 0, 0.07)');
    grad.addColorStop(0.97, 'rgba(0, 0, 0, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    radBCtx.fillStyle = grad;

    radBCtx.beginPath();
    radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
    radBCtx.closePath();
    radBCtx.fill();

    // cache the buffer
    drawRadialBackgroundImage.cache[cacheKey] = radBBuffer;
  }
  ctx.drawImage(drawRadialBackgroundImage.cache[cacheKey], 0, 0);
  return this;
};
drawRadialBackgroundImage.cache = {};

export default drawRadialBackgroundImage;
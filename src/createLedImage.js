
import {
  setAlpha,
  createBuffer,
  TWO_PI,
} from './tools';

const createLedImage = function(size, state, ledColor) {
  let ledBuffer; let ledCtx;
  // Bug in Chrome browser, radialGradients do not draw correctly if the center is not an integer value
  const ledCenterX = 2 * Math.round(size / 4);
  const ledCenterY = 2 * Math.round(size / 4);
  let grad;
  const cacheKey = size.toString() + state + ledColor.outerColor_ON;

  // check if we have already created and cached this buffer, if not create it
  if (!createLedImage.cache[cacheKey]) {
    ledBuffer = createBuffer(size, size);
    ledCtx = ledBuffer.getContext('2d');

    switch (state) {
      case 0: // LED OFF
        // OFF Gradient
        grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
        grad.addColorStop(0, ledColor.innerColor1_OFF);
        grad.addColorStop(0.2, ledColor.innerColor2_OFF);
        grad.addColorStop(1, ledColor.outerColor_OFF);
        ledCtx.fillStyle = grad;

        ledCtx.beginPath();
        ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
        ledCtx.closePath();
        ledCtx.fill();

        // InnerShadow
        grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ledCtx.fillStyle = grad;

        ledCtx.beginPath();
        ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
        ledCtx.closePath();
        ledCtx.fill();

        // LightReflex
        grad = ledCtx.createLinearGradient(0, 0.35 * size, 0, 0.35 * size + 0.15 * size);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ledCtx.fillStyle = grad;

        ledCtx.beginPath();
        ledCtx.arc(ledCenterX, 0.35 * size + 0.2 * size / 2, size * 0.2, 0, TWO_PI, true);
        ledCtx.closePath();
        ledCtx.fill();
        break;

      case 1: // LED ON
        // ON Gradient
        grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
        grad.addColorStop(0, ledColor.innerColor1_ON);
        grad.addColorStop(0.2, ledColor.innerColor2_ON);
        grad.addColorStop(1, ledColor.outerColor_ON);
        ledCtx.fillStyle = grad;

        ledCtx.beginPath();
        ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
        ledCtx.closePath();
        ledCtx.fill();

        // InnerShadow
        grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * 0.5 / 2);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ledCtx.fillStyle = grad;

        ledCtx.beginPath();
        ledCtx.arc(ledCenterX, ledCenterY, size * 0.5 / 2, 0, TWO_PI, true);
        ledCtx.closePath();
        ledCtx.fill();

        // LightReflex
        grad = ledCtx.createLinearGradient(0, 0.35 * size, 0, 0.35 * size + 0.15 * size);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ledCtx.fillStyle = grad;

        ledCtx.beginPath();
        ledCtx.arc(ledCenterX, 0.35 * size + 0.2 * size / 2, size * 0.2, 0, TWO_PI, true);
        ledCtx.closePath();
        ledCtx.fill();

        // Corona
        grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size / 2);
        grad.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
        grad.addColorStop(0.6, setAlpha(ledColor.coronaColor, 0.4));
        grad.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.25));
        grad.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.15));
        grad.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05));
        grad.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
        ledCtx.fillStyle = grad;

        ledCtx.beginPath();
        ledCtx.arc(ledCenterX, ledCenterY, size / 2, 0, TWO_PI, true);
        ledCtx.closePath();
        ledCtx.fill();
        break;
    }
    // cache the buffer
    createLedImage.cache[cacheKey] = ledBuffer;
  }
  return createLedImage.cache[cacheKey];
};
createLedImage.cache = {};

export default createLedImage;

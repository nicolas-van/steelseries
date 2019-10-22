
import {
  createBuffer,
  TWO_PI,
} from './tools';

var createKnobImage = function(size, knob, style) {
  let knobBuffer; let knobCtx;
  const maxPostCenterX = size / 2;
  const maxPostCenterY = size / 2;
  let grad;
  const cacheKey = size.toString() + knob.type + style.style;

  // check if we have already created and cached this buffer, if not create it
  if (!createKnobImage.cache[cacheKey]) {
    knobBuffer = createBuffer(size * 1.18889, size * 1.18889);
    knobCtx = knobBuffer.getContext('2d');

    switch (knob.type) {
      case 'metalKnob':
        // METALKNOB_FRAME
        knobCtx.beginPath();
        knobCtx.moveTo(0, size * 0.5);
        knobCtx.bezierCurveTo(0, size * 0.222222, size * 0.222222, 0, size * 0.5, 0);
        knobCtx.bezierCurveTo(size * 0.777777, 0, size, size * 0.222222, size, size * 0.5);
        knobCtx.bezierCurveTo(size, size * 0.777777, size * 0.777777, size, size * 0.5, size);
        knobCtx.bezierCurveTo(size * 0.222222, size, 0, size * 0.777777, 0, size * 0.5);
        knobCtx.closePath();
        grad = knobCtx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, 'rgb(92, 95, 101)');
        grad.addColorStop(0.47, 'rgb(46, 49, 53)');
        grad.addColorStop(1, 'rgb(22, 23, 26)');
        knobCtx.fillStyle = grad;
        knobCtx.fill();

        // METALKNOB_MAIN
        knobCtx.beginPath();
        knobCtx.moveTo(size * 0.055555, size * 0.5);
        knobCtx.bezierCurveTo(size * 0.055555, size * 0.277777, size * 0.277777, size * 0.055555, size * 0.5, size * 0.055555);
        knobCtx.bezierCurveTo(size * 0.722222, size * 0.055555, size * 0.944444, size * 0.277777, size * 0.944444, size * 0.5);
        knobCtx.bezierCurveTo(size * 0.944444, size * 0.722222, size * 0.722222, size * 0.944444, size * 0.5, size * 0.944444);
        knobCtx.bezierCurveTo(size * 0.277777, size * 0.944444, size * 0.055555, size * 0.722222, size * 0.055555, size * 0.5);
        knobCtx.closePath();
        grad = knobCtx.createLinearGradient(0, 0.055555 * size, 0, 0.944443 * size);
        switch (style.style) {
          case 'black':
            grad.addColorStop(0, 'rgb(43, 42, 47)');
            grad.addColorStop(1, 'rgb(26, 27, 32)');
            break;

          case 'brass':
            grad.addColorStop(0, 'rgb(150, 110, 54)');
            grad.addColorStop(1, 'rgb(124, 95, 61)');
            break;

          case 'silver':
            /* falls through */
          default:
            grad.addColorStop(0, 'rgb(204, 204, 204)');
            grad.addColorStop(1, 'rgb(87, 92, 98)');
            break;
        }
        knobCtx.fillStyle = grad;
        knobCtx.fill();

        // METALKNOB_LOWERHL
        knobCtx.beginPath();
        knobCtx.moveTo(size * 0.777777, size * 0.833333);
        knobCtx.bezierCurveTo(size * 0.722222, size * 0.722222, size * 0.611111, size * 0.666666, size * 0.5, size * 0.666666);
        knobCtx.bezierCurveTo(size * 0.388888, size * 0.666666, size * 0.277777, size * 0.722222, size * 0.222222, size * 0.833333);
        knobCtx.bezierCurveTo(size * 0.277777, size * 0.888888, size * 0.388888, size * 0.944444, size * 0.5, size * 0.944444);
        knobCtx.bezierCurveTo(size * 0.611111, size * 0.944444, size * 0.722222, size * 0.888888, size * 0.777777, size * 0.833333);
        knobCtx.closePath();
        grad = knobCtx.createRadialGradient((0.555555) * size, ((0.944444) * size), 0, ((0.555555) * size), ((0.944444) * size), 0.388888 * size);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        knobCtx.fillStyle = grad;
        knobCtx.fill();

        // METALKNOB_UPPERHL
        knobCtx.beginPath();
        knobCtx.moveTo(size * 0.944444, size * 0.277777);
        knobCtx.bezierCurveTo(size * 0.833333, size * 0.111111, size * 0.666666, 0, size * 0.5, 0);
        knobCtx.bezierCurveTo(size * 0.333333, 0, size * 0.166666, size * 0.111111, size * 0.055555, size * 0.277777);
        knobCtx.bezierCurveTo(size * 0.166666, size * 0.333333, size * 0.333333, size * 0.388888, size * 0.5, size * 0.388888);
        knobCtx.bezierCurveTo(size * 0.666666, size * 0.388888, size * 0.833333, size * 0.333333, size * 0.944444, size * 0.277777);
        knobCtx.closePath();
        grad = knobCtx.createRadialGradient(0.5 * size, 0, 0, ((0.5) * size), 0, 0.583333 * size);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.749019)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        knobCtx.fillStyle = grad;
        knobCtx.fill();

        // METALKNOB_INNERFRAME
        knobCtx.beginPath();
        knobCtx.moveTo(size * 0.277777, size * 0.555555);
        knobCtx.bezierCurveTo(size * 0.277777, size * 0.388888, size * 0.388888, size * 0.277777, size * 0.5, size * 0.277777);
        knobCtx.bezierCurveTo(size * 0.611111, size * 0.277777, size * 0.777777, size * 0.388888, size * 0.777777, size * 0.555555);
        knobCtx.bezierCurveTo(size * 0.777777, size * 0.666666, size * 0.611111, size * 0.777777, size * 0.5, size * 0.777777);
        knobCtx.bezierCurveTo(size * 0.388888, size * 0.777777, size * 0.277777, size * 0.666666, size * 0.277777, size * 0.555555);
        knobCtx.closePath();
        grad = knobCtx.createLinearGradient(0, 0.277777 * size, 0, 0.722221 * size);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(1, 'rgb(204, 204, 204)');
        knobCtx.fillStyle = grad;
        knobCtx.fill();

        // METALKNOB_INNERBACKGROUND
        knobCtx.beginPath();
        knobCtx.moveTo(size * 0.333333, size * 0.555555);
        knobCtx.bezierCurveTo(size * 0.333333, size * 0.444444, size * 0.388888, size * 0.333333, size * 0.5, size * 0.333333);
        knobCtx.bezierCurveTo(size * 0.611111, size * 0.333333, size * 0.722222, size * 0.444444, size * 0.722222, size * 0.555555);
        knobCtx.bezierCurveTo(size * 0.722222, size * 0.611111, size * 0.611111, size * 0.722222, size * 0.5, size * 0.722222);
        knobCtx.bezierCurveTo(size * 0.388888, size * 0.722222, size * 0.333333, size * 0.611111, size * 0.333333, size * 0.555555);
        knobCtx.closePath();
        grad = knobCtx.createLinearGradient(0, 0.333333 * size, 0, 0.666666 * size);
        grad.addColorStop(0, 'rgb(10, 9, 1)');
        grad.addColorStop(1, 'rgb(42, 41, 37)');
        knobCtx.fillStyle = grad;
        knobCtx.fill();
        break;

      case 'standardKnob':
        grad = knobCtx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, 'rgb(180, 180, 180)');
        grad.addColorStop(0.46, 'rgb(63, 63, 63)');
        grad.addColorStop(1, 'rgb(40, 40, 40)');
        knobCtx.fillStyle = grad;
        knobCtx.beginPath();
        knobCtx.arc(maxPostCenterX, maxPostCenterY, size / 2, 0, TWO_PI, true);
        knobCtx.closePath();
        knobCtx.fill();
        grad = knobCtx.createLinearGradient(0, size - size * 0.77, 0, size - size * 0.77 + size * 0.77);
        switch (style.style) {
          case 'black':
            grad.addColorStop(0, 'rgb(191, 191, 191)');
            grad.addColorStop(0.5, 'rgb(45, 44, 49)');
            grad.addColorStop(1, 'rgb(125, 126, 128)');
            break;

          case 'brass':
            grad.addColorStop(0, 'rgb(223, 208, 174)');
            grad.addColorStop(0.5, 'rgb(123, 95, 63)');
            grad.addColorStop(1, 'rgb(207, 190, 157)');
            break;

          case 'silver':
            /* falls through */
          default:
            grad.addColorStop(0, 'rgb(215, 215, 215)');
            grad.addColorStop(0.5, 'rgb(116, 116, 116)');
            grad.addColorStop(1, 'rgb(215, 215, 215)');
            break;
        }
        knobCtx.fillStyle = grad;
        knobCtx.beginPath();
        knobCtx.arc(maxPostCenterX, maxPostCenterY, size * 0.77 / 2, 0, TWO_PI, true);
        knobCtx.closePath();
        knobCtx.fill();

        grad = knobCtx.createRadialGradient(maxPostCenterX, maxPostCenterY, 0, maxPostCenterX, maxPostCenterY, size * 0.77 / 2);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.76, 'rgba(0, 0, 0, 0.01)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        knobCtx.fillStyle = grad;
        knobCtx.beginPath();
        knobCtx.arc(maxPostCenterX, maxPostCenterY, size * 0.77 / 2, 0, TWO_PI, true);
        knobCtx.closePath();
        knobCtx.fill();
        break;
    }

    // cache the buffer
    createKnobImage.cache[cacheKey] = knobBuffer;
  }
  return createKnobImage.cache[cacheKey];
};
createKnobImage.cache = {};

export default createKnobImage;

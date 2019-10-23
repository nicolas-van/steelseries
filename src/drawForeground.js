
import createKnobImage from './createKnobImage';
import {
  createBuffer,
} from './tools';

import {
  GaugeType,
  Orientation,
} from './definitions';

var drawForeground = function(ctx, foregroundType, imageWidth, imageHeight, withCenterKnob, knob, style, gaugeType, orientation) {
  let radFgBuffer; let radFgCtx;
  const knobSize = Math.ceil(imageHeight * 0.084112);
  let knobX = imageWidth * 0.5 - knobSize / 2;
  let knobY = imageHeight * 0.5 - knobSize / 2;
  const shadowOffset = imageWidth * 0.008;
  let gradHighlight; let gradHighlight2;
  const cacheKey = foregroundType.type + imageWidth + imageHeight + withCenterKnob + (knob !== undefined ? knob.type : '-') +
    (style !== undefined ? style.style : '-') + (orientation !== undefined ? orientation.type : '-');

  // check if we have already created and cached this buffer, if so return it and exit
  if (!drawForeground.cache[cacheKey]) {
    // Setup buffer
    radFgBuffer = createBuffer(imageWidth, imageHeight);
    radFgCtx = radFgBuffer.getContext('2d');

    // center post
    if (withCenterKnob) {
      // Set the pointer shadow params
      radFgCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      radFgCtx.shadowOffsetX = radFgCtx.shadowOffsetY = shadowOffset;
      radFgCtx.shadowBlur = shadowOffset * 2;

      if (gaugeType === GaugeType.TYPE5) {
        if (Orientation.WEST === orientation) {
          knobX = imageWidth * 0.733644 - knobSize / 2;
          radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY);
        } else if (Orientation.EAST === orientation) {
          knobX = imageWidth * (1 - 0.733644) - knobSize / 2;
          radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY);
        } else {
          knobY = imageHeight * 0.733644 - knobSize / 2;
          radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, imageHeight * 0.6857);
        }
      } else {
        radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY);
      }
      // Undo shadow drawing
      radFgCtx.shadowOffsetX = radFgCtx.shadowOffsetY = 0;
      radFgCtx.shadowBlur = 0;
    }

    // highlight
    switch (foregroundType.type) {
      case 'type2':
        radFgCtx.beginPath();
        radFgCtx.moveTo(imageWidth * 0.135514, imageHeight * 0.696261);
        radFgCtx.bezierCurveTo(imageWidth * 0.214953, imageHeight * 0.588785, imageWidth * 0.317757, imageHeight * 0.5, imageWidth * 0.462616, imageHeight * 0.425233);
        radFgCtx.bezierCurveTo(imageWidth * 0.612149, imageHeight * 0.345794, imageWidth * 0.733644, imageHeight * 0.317757, imageWidth * 0.873831, imageHeight * 0.322429);
        radFgCtx.bezierCurveTo(imageWidth * 0.766355, imageHeight * 0.112149, imageWidth * 0.528037, imageHeight * 0.023364, imageWidth * 0.313084, imageHeight * 0.130841);
        radFgCtx.bezierCurveTo(imageWidth * 0.098130, imageHeight * 0.238317, imageWidth * 0.028037, imageHeight * 0.485981, imageWidth * 0.135514, imageHeight * 0.696261);
        radFgCtx.closePath();
        gradHighlight = radFgCtx.createLinearGradient(0.313084 * imageWidth, 0.135514 * imageHeight, 0.495528 * imageWidth, 0.493582 * imageHeight);
        gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
        gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
        break;

      case 'type3':
        radFgCtx.beginPath();
        radFgCtx.moveTo(imageWidth * 0.084112, imageHeight * 0.509345);
        radFgCtx.bezierCurveTo(imageWidth * 0.210280, imageHeight * 0.556074, imageWidth * 0.462616, imageHeight * 0.560747, imageWidth * 0.5, imageHeight * 0.560747);
        radFgCtx.bezierCurveTo(imageWidth * 0.537383, imageHeight * 0.560747, imageWidth * 0.794392, imageHeight * 0.560747, imageWidth * 0.915887, imageHeight * 0.509345);
        radFgCtx.bezierCurveTo(imageWidth * 0.915887, imageHeight * 0.275700, imageWidth * 0.738317, imageHeight * 0.084112, imageWidth * 0.5, imageHeight * 0.084112);
        radFgCtx.bezierCurveTo(imageWidth * 0.261682, imageHeight * 0.084112, imageWidth * 0.084112, imageHeight * 0.275700, imageWidth * 0.084112, imageHeight * 0.509345);
        radFgCtx.closePath();
        gradHighlight = radFgCtx.createLinearGradient(0, 0.093457 * imageHeight, 0, 0.556073 * imageHeight);
        gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
        gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
        break;

      case 'type4':
        radFgCtx.beginPath();
        radFgCtx.moveTo(imageWidth * 0.677570, imageHeight * 0.242990);
        radFgCtx.bezierCurveTo(imageWidth * 0.771028, imageHeight * 0.308411, imageWidth * 0.822429, imageHeight * 0.411214, imageWidth * 0.813084, imageHeight * 0.528037);
        radFgCtx.bezierCurveTo(imageWidth * 0.799065, imageHeight * 0.654205, imageWidth * 0.719626, imageHeight * 0.757009, imageWidth * 0.593457, imageHeight * 0.799065);
        radFgCtx.bezierCurveTo(imageWidth * 0.485981, imageHeight * 0.831775, imageWidth * 0.369158, imageHeight * 0.808411, imageWidth * 0.285046, imageHeight * 0.728971);
        radFgCtx.bezierCurveTo(imageWidth * 0.275700, imageHeight * 0.719626, imageWidth * 0.252336, imageHeight * 0.714953, imageWidth * 0.233644, imageHeight * 0.728971);
        radFgCtx.bezierCurveTo(imageWidth * 0.214953, imageHeight * 0.747663, imageWidth * 0.219626, imageHeight * 0.771028, imageWidth * 0.228971, imageHeight * 0.775700);
        radFgCtx.bezierCurveTo(imageWidth * 0.331775, imageHeight * 0.878504, imageWidth * 0.476635, imageHeight * 0.915887, imageWidth * 0.616822, imageHeight * 0.869158);
        radFgCtx.bezierCurveTo(imageWidth * 0.771028, imageHeight * 0.822429, imageWidth * 0.873831, imageHeight * 0.691588, imageWidth * 0.887850, imageHeight * 0.532710);
        radFgCtx.bezierCurveTo(imageWidth * 0.897196, imageHeight * 0.387850, imageWidth * 0.836448, imageHeight * 0.257009, imageWidth * 0.719626, imageHeight * 0.182242);
        radFgCtx.bezierCurveTo(imageWidth * 0.705607, imageHeight * 0.172897, imageWidth * 0.682242, imageHeight * 0.163551, imageWidth * 0.663551, imageHeight * 0.186915);
        radFgCtx.bezierCurveTo(imageWidth * 0.654205, imageHeight * 0.205607, imageWidth * 0.668224, imageHeight * 0.238317, imageWidth * 0.677570, imageHeight * 0.242990);
        radFgCtx.closePath();
        gradHighlight = radFgCtx.createRadialGradient((0.5) * imageWidth, ((0.5) * imageHeight), 0, ((0.5) * imageWidth), ((0.5) * imageHeight), 0.387850 * imageWidth);
        gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradHighlight.addColorStop(0.82, 'rgba(255, 255, 255, 0)');
        gradHighlight.addColorStop(0.83, 'rgba(255, 255, 255, 0)');
        gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

        radFgCtx.beginPath();
        radFgCtx.moveTo(imageWidth * 0.261682, imageHeight * 0.224299);
        radFgCtx.bezierCurveTo(imageWidth * 0.285046, imageHeight * 0.238317, imageWidth * 0.252336, imageHeight * 0.285046, imageWidth * 0.242990, imageHeight * 0.317757);
        radFgCtx.bezierCurveTo(imageWidth * 0.242990, imageHeight * 0.350467, imageWidth * 0.271028, imageHeight * 0.383177, imageWidth * 0.271028, imageHeight * 0.397196);
        radFgCtx.bezierCurveTo(imageWidth * 0.275700, imageHeight * 0.415887, imageWidth * 0.261682, imageHeight * 0.457943, imageWidth * 0.238317, imageHeight * 0.509345);
        radFgCtx.bezierCurveTo(imageWidth * 0.224299, imageHeight * 0.542056, imageWidth * 0.177570, imageHeight * 0.612149, imageWidth * 0.158878, imageHeight * 0.612149);
        radFgCtx.bezierCurveTo(imageWidth * 0.144859, imageHeight * 0.612149, imageWidth * 0.088785, imageHeight * 0.546728, imageWidth * 0.130841, imageHeight * 0.369158);
        radFgCtx.bezierCurveTo(imageWidth * 0.140186, imageHeight * 0.336448, imageWidth * 0.214953, imageHeight * 0.200934, imageWidth * 0.261682, imageHeight * 0.224299);
        radFgCtx.closePath();
        gradHighlight2 = radFgCtx.createLinearGradient(0.130841 * imageWidth, 0.369158 * imageHeight, 0.273839 * imageWidth, 0.412877 * imageHeight);
        gradHighlight2.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
        gradHighlight2.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
        radFgCtx.fillStyle = gradHighlight2;
        radFgCtx.fill();
        break;

      case 'type5':
        radFgCtx.beginPath();
        radFgCtx.moveTo(imageWidth * 0.084112, imageHeight * 0.5);
        radFgCtx.bezierCurveTo(imageWidth * 0.084112, imageHeight * 0.271028, imageWidth * 0.271028, imageHeight * 0.084112, imageWidth * 0.5, imageHeight * 0.084112);
        radFgCtx.bezierCurveTo(imageWidth * 0.700934, imageHeight * 0.084112, imageWidth * 0.864485, imageHeight * 0.224299, imageWidth * 0.906542, imageHeight * 0.411214);
        radFgCtx.bezierCurveTo(imageWidth * 0.911214, imageHeight * 0.439252, imageWidth * 0.911214, imageHeight * 0.518691, imageWidth * 0.845794, imageHeight * 0.537383);
        radFgCtx.bezierCurveTo(imageWidth * 0.794392, imageHeight * 0.546728, imageWidth * 0.551401, imageHeight * 0.411214, imageWidth * 0.392523, imageHeight * 0.457943);
        radFgCtx.bezierCurveTo(imageWidth * 0.168224, imageHeight * 0.509345, imageWidth * 0.135514, imageHeight * 0.775700, imageWidth * 0.093457, imageHeight * 0.593457);
        radFgCtx.bezierCurveTo(imageWidth * 0.088785, imageHeight * 0.560747, imageWidth * 0.084112, imageHeight * 0.532710, imageWidth * 0.084112, imageHeight * 0.5);
        radFgCtx.closePath();
        gradHighlight = radFgCtx.createLinearGradient(0, 0.084112 * imageHeight, 0, 0.644859 * imageHeight);
        gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
        gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
        break;

      case 'type1':
        /* falls through */
      default:
        radFgCtx.beginPath();
        radFgCtx.moveTo(imageWidth * 0.084112, imageHeight * 0.509345);
        radFgCtx.bezierCurveTo(imageWidth * 0.205607, imageHeight * 0.448598, imageWidth * 0.336448, imageHeight * 0.415887, imageWidth * 0.5, imageHeight * 0.415887);
        radFgCtx.bezierCurveTo(imageWidth * 0.672897, imageHeight * 0.415887, imageWidth * 0.789719, imageHeight * 0.443925, imageWidth * 0.915887, imageHeight * 0.509345);
        radFgCtx.bezierCurveTo(imageWidth * 0.915887, imageHeight * 0.275700, imageWidth * 0.738317, imageHeight * 0.084112, imageWidth * 0.5, imageHeight * 0.084112);
        radFgCtx.bezierCurveTo(imageWidth * 0.261682, imageHeight * 0.084112, imageWidth * 0.084112, imageHeight * 0.275700, imageWidth * 0.084112, imageHeight * 0.509345);
        radFgCtx.closePath();
        gradHighlight = radFgCtx.createLinearGradient(0, 0.088785 * imageHeight, 0, 0.490654 * imageHeight);
        gradHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.275)');
        gradHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
        break;
    }
    radFgCtx.fillStyle = gradHighlight;
    radFgCtx.fill();

    // cache the buffer
    drawForeground.cache[cacheKey] = radFgBuffer;
  }
  ctx.drawImage(drawForeground.cache[cacheKey], 0, 0);
  return this;
};
drawForeground.cache = {};

export default drawForeground;

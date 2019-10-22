
import {
  TWO_PI,
  RAD_FACTOR,
} from './tools';

const drawRoseImage = function(ctx, centerX, centerY, imageWidth, imageHeight, backgroundColor) {
  let fill = true;
  let i; let grad;
  const symbolColor = backgroundColor.symbolColor.getRgbaColor();

  ctx.save();
  ctx.lineWidth = 1;
  ctx.fillStyle = symbolColor;
  ctx.strokeStyle = symbolColor;
  ctx.translate(centerX, centerY);
  // broken ring
  for (i = 0; i < 360; i += 15) {
    fill = !fill;

    ctx.beginPath();
    ctx.arc(0, 0, imageWidth * 0.26, i * RAD_FACTOR, (i + 15) * RAD_FACTOR, false);
    ctx.arc(0, 0, imageWidth * 0.23, (i + 15) * RAD_FACTOR, i * RAD_FACTOR, true);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    ctx.stroke();
  }

  ctx.translate(-centerX, -centerY);

  /*
          // PATH1_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.560747, imageHeight * 0.584112);
          ctx.lineTo(imageWidth * 0.640186, imageHeight * 0.644859);
          ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.560747);
          ctx.lineTo(imageWidth * 0.560747, imageHeight * 0.584112);
          ctx.closePath();
          ctx.fillStyle = fillColorPath;
          ctx.fill();
          ctx.stroke();

          // PATH2_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.411214, imageHeight * 0.560747);
          ctx.lineTo(imageWidth * 0.355140, imageHeight * 0.644859);
          ctx.lineTo(imageWidth * 0.439252, imageHeight * 0.588785);
          ctx.lineTo(imageWidth * 0.411214, imageHeight * 0.560747);
          ctx.closePath();
          ctx.fillStyle = fillColorPath;
          ctx.fill();
          ctx.stroke();

          // PATH3_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.584112, imageHeight * 0.443925);
          ctx.lineTo(imageWidth * 0.640186, imageHeight * 0.359813);
          ctx.lineTo(imageWidth * 0.560747, imageHeight * 0.420560);
          ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.443925);
          ctx.closePath();
          ctx.fillStyle = fillColorPath;
          ctx.fill();
          ctx.stroke();

          // PATH4_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.439252, imageHeight * 0.415887);
          ctx.lineTo(imageWidth * 0.355140, imageHeight * 0.359813);
          ctx.lineTo(imageWidth * 0.415887, imageHeight * 0.439252);
          ctx.lineTo(imageWidth * 0.439252, imageHeight * 0.415887);
          ctx.closePath();
          ctx.fillStyle = fillColorPath;
          ctx.fill();
          ctx.stroke();

          // PATH5_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.397196);
          ctx.lineTo(imageWidth * 0.5, imageHeight * 0.196261);
          ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.397196);
          ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.397196);
          ctx.closePath();
          var PATH5_2_GRADIENT = ctx.createLinearGradient(0.476635 * imageWidth, 0, 0.518691 * imageWidth, 0);
          PATH5_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
          PATH5_2_GRADIENT.addColorStop(0.48, 'rgb(222, 223, 218)');
          PATH5_2_GRADIENT.addColorStop(0.49, backgroundColor.symbolColor.getRgbaColor());
          PATH5_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
          ctx.fillStyle = PATH5_2_GRADIENT;
          ctx.fill();
          ctx.stroke();

          // PATH6_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.471962, imageHeight * 0.607476);
          ctx.lineTo(imageWidth * 0.5, imageHeight * 0.813084);
          ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.607476);
          ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.607476);
          ctx.closePath();
          var PATH6_2_GRADIENT = ctx.createLinearGradient(0.518691 * imageWidth, 0, (0.518691 + -0.037383) * imageWidth, 0);
          PATH6_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
          PATH6_2_GRADIENT.addColorStop(0.56, 'rgb(222, 223, 218)');
          PATH6_2_GRADIENT.addColorStop(0.5601, backgroundColor.symbolColor.getRgbaColor());
          PATH6_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
          ctx.fillStyle = PATH6_2_GRADIENT;
          ctx.lineWidth = 1;
          ctx.lineCap = 'square';
          ctx.lineJoin = 'miter';
          ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
          ctx.fill();
          ctx.stroke();

          // PATH7_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.602803, imageHeight * 0.528037);
          ctx.lineTo(imageWidth * 0.803738, imageHeight * 0.5);
          ctx.lineTo(imageWidth * 0.602803, imageHeight * 0.476635);
          ctx.lineTo(imageWidth * 0.602803, imageHeight * 0.528037);
          ctx.closePath();
          var PATH7_2_GRADIENT = ctx.createLinearGradient(0, 0.485981 * imageHeight, 0, 0.514018 * imageHeight);
          PATH7_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
          PATH7_2_GRADIENT.addColorStop(0.48, 'rgb(222, 223, 218)');
          PATH7_2_GRADIENT.addColorStop(0.49, backgroundColor.symbolColor.getRgbaColor());
          PATH7_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
          ctx.fillStyle = PATH7_2_GRADIENT;
          ctx.fill();
          ctx.stroke();

          // PATH8_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.392523, imageHeight * 0.476635);
          ctx.lineTo(imageWidth * 0.191588, imageHeight * 0.5);
          ctx.lineTo(imageWidth * 0.392523, imageHeight * 0.528037);
          ctx.lineTo(imageWidth * 0.392523, imageHeight * 0.476635);
          ctx.closePath();
          var PATH8_2_GRADIENT = ctx.createLinearGradient(0, 0.528037 * imageHeight, 0, 0.485981 * imageHeight);
          PATH8_2_GRADIENT.addColorStop(0, 'rgb(222, 223, 218)');
          PATH8_2_GRADIENT.addColorStop(0.52, 'rgb(222, 223, 218)');
          PATH8_2_GRADIENT.addColorStop(0.53, backgroundColor.symbolColor.getRgbaColor());
          PATH8_2_GRADIENT.addColorStop(1, backgroundColor.symbolColor.getRgbaColor());
          ctx.fillStyle = PATH8_2_GRADIENT;
          ctx.fill();
          ctx.stroke();

          // PATH9_2
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imageWidth * 0.406542, imageHeight * 0.504672);
          ctx.bezierCurveTo(imageWidth * 0.406542, imageHeight * 0.453271, imageWidth * 0.448598, imageHeight * 0.411214, imageWidth * 0.5, imageHeight * 0.411214);
          ctx.bezierCurveTo(imageWidth * 0.546728, imageHeight * 0.411214, imageWidth * 0.588785, imageHeight * 0.453271, imageWidth * 0.588785, imageHeight * 0.504672);
          ctx.bezierCurveTo(imageWidth * 0.588785, imageHeight * 0.551401, imageWidth * 0.546728, imageHeight * 0.593457, imageWidth * 0.5, imageHeight * 0.593457);
          ctx.bezierCurveTo(imageWidth * 0.448598, imageHeight * 0.593457, imageWidth * 0.406542, imageHeight * 0.551401, imageWidth * 0.406542, imageHeight * 0.504672);
          ctx.closePath();
          ctx.moveTo(imageWidth * 0.387850, imageHeight * 0.504672);
          ctx.bezierCurveTo(imageWidth * 0.387850, imageHeight * 0.560747, imageWidth * 0.439252, imageHeight * 0.612149, imageWidth * 0.5, imageHeight * 0.612149);
          ctx.bezierCurveTo(imageWidth * 0.556074, imageHeight * 0.612149, imageWidth * 0.607476, imageHeight * 0.560747, imageWidth * 0.607476, imageHeight * 0.504672);
          ctx.bezierCurveTo(imageWidth * 0.607476, imageHeight * 0.443925, imageWidth * 0.556074, imageHeight * 0.392523, imageWidth * 0.5, imageHeight * 0.392523);
          ctx.bezierCurveTo(imageWidth * 0.439252, imageHeight * 0.392523, imageWidth * 0.387850, imageHeight * 0.443925, imageWidth * 0.387850, imageHeight * 0.504672);
          ctx.closePath();
          ctx.fillStyle = fillColorPath;
          ctx.lineWidth = 1;
          ctx.lineCap = 'square';
          ctx.lineJoin = 'miter';
          ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
  */
  // Replacement code, not quite the same but much smaller!

  for (i = 0; 360 >= i; i += 90) {
    // Small pointers
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.560747, imageHeight * 0.584112);
    ctx.lineTo(imageWidth * 0.640186, imageHeight * 0.644859);
    ctx.lineTo(imageWidth * 0.584112, imageHeight * 0.560747);
    ctx.lineTo(imageWidth * 0.560747, imageHeight * 0.584112);
    ctx.closePath();
    ctx.fillStyle = symbolColor;
    ctx.fill();
    ctx.stroke();
    // Large pointers
    ctx.beginPath();
    ctx.moveTo(imageWidth * 0.523364, imageHeight * 0.397196);
    ctx.lineTo(imageWidth * 0.5, imageHeight * 0.196261);
    ctx.lineTo(imageWidth * 0.471962, imageHeight * 0.397196);
    ctx.lineTo(imageWidth * 0.523364, imageHeight * 0.397196);
    ctx.closePath();
    grad = ctx.createLinearGradient(0.476635 * imageWidth, 0, 0.518691 * imageWidth, 0);
    grad.addColorStop(0, 'rgb(222, 223, 218)');
    grad.addColorStop(0.48, 'rgb(222, 223, 218)');
    grad.addColorStop(0.49, symbolColor);
    grad.addColorStop(1, symbolColor);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();
    ctx.translate(centerX, centerY);
    ctx.rotate(i * RAD_FACTOR);
    ctx.translate(-centerX, -centerY);
  }

  // Central ring
  ctx.beginPath();
  ctx.translate(centerX, centerY);
  ctx.arc(0, 0, imageWidth * 0.1, 0, TWO_PI, false);
  ctx.lineWidth = imageWidth * 0.022;
  ctx.stroke();
  ctx.translate(-centerX, -centerY);

  ctx.restore();
};

export default drawRoseImage;


import {
drawToBuffer, 
} from "./tools";

var carbonBuffer = drawToBuffer(12, 12, function(ctx) {
  var imageWidth = ctx.canvas.width,
    imageHeight = ctx.canvas.height,
    offsetX = 0,
    offsetY = 0,
    grad;

  ctx.save();

  // RULB
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, imageWidth * 0.5, imageHeight * 0.5);
  ctx.closePath();
  ctx.restore();

  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, 'rgb(35, 35, 35)');
  grad.addColorStop(1, 'rgb(23, 23, 23)');
  ctx.fillStyle = grad;
  ctx.fill();

  // RULF
  ctx.save();
  ctx.beginPath();
  ctx.rect(imageWidth * 0.083333, 0, imageWidth * 0.333333, imageHeight * 0.416666);
  ctx.closePath();
  ctx.restore();
  offsetX = 0.083333;
  offsetY = 0;
  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, 'rgb(38, 38, 38)');
  grad.addColorStop(1, 'rgb(30, 30, 30)');
  ctx.fillStyle = grad;
  ctx.fill();

  // RLRB
  ctx.save();
  ctx.beginPath();
  ctx.rect(imageWidth * 0.5, imageHeight * 0.5, imageWidth * 0.5, imageHeight * 0.5);
  ctx.closePath();
  ctx.restore();
  offsetX = 0.5;
  offsetY = 0.5;
  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, 'rgb(35, 35, 35)');
  grad.addColorStop(1, 'rgb(23, 23, 23)');
  ctx.fillStyle = grad;
  ctx.fill();

  // RLRF
  ctx.save();
  ctx.beginPath();
  ctx.rect(imageWidth * 0.583333, imageHeight * 0.5, imageWidth * 0.333333, imageHeight * 0.416666);
  ctx.closePath();
  ctx.restore();
  offsetX = 0.583333;
  offsetY = 0.5;
  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, 'rgb(38, 38, 38)');
  grad.addColorStop(1, 'rgb(30, 30, 30)');
  ctx.fillStyle = grad;
  ctx.fill();

  // RURB
  ctx.save();
  ctx.beginPath();
  ctx.rect(imageWidth * 0.5, 0, imageWidth * 0.5, imageHeight * 0.5);
  ctx.closePath();
  ctx.restore();
  offsetX = 0.5;
  offsetY = 0;
  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, '#303030');
  grad.addColorStop(1, 'rgb(40, 40, 40)');
  ctx.fillStyle = grad;
  ctx.fill();

  // RURF
  ctx.save();
  ctx.beginPath();
  ctx.rect(imageWidth * 0.583333, imageHeight * 0.083333, imageWidth * 0.333333, imageHeight * 0.416666);
  ctx.closePath();
  ctx.restore();
  offsetX = 0.583333;
  offsetY = 0.083333;
  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, 'rgb(53, 53, 53)');
  grad.addColorStop(1, 'rgb(45, 45, 45)');
  ctx.fillStyle = grad;
  ctx.fill();

  // RLLB
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, imageHeight * 0.5, imageWidth * 0.5, imageHeight * 0.5);
  ctx.closePath();
  ctx.restore();
  offsetX = 0;
  offsetY = 0.5;
  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.5 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, '#303030');
  grad.addColorStop(1, '#282828');
  ctx.fillStyle = grad;
  ctx.fill();

  // RLLF
  ctx.save();
  ctx.beginPath();
  ctx.rect(imageWidth * 0.083333, imageHeight * 0.583333, imageWidth * 0.333333, imageHeight * 0.416666);
  ctx.closePath();
  ctx.restore();
  offsetX = 0.083333;
  offsetY = 0.583333;
  grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, 0.416666 * imageHeight + offsetY * imageHeight);
  grad.addColorStop(0, '#353535');
  grad.addColorStop(1, '#2d2d2d');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
});

export default carbonBuffer;
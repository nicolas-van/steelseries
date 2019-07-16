
import {
TWO_PI,
} from "./tools";

var drawRadialCustomImage = function(ctx, img, centerX, centerY, imageWidth, imageHeight) {
  var drawWidth = imageWidth * 0.831775,
    drawHeight = imageHeight * 0.831775,
    x = (imageWidth - drawWidth) / 2,
    y = (imageHeight - drawHeight) / 2;

  if (img !== null && img.height > 0 && img.width > 0) {
    ctx.save();
    // Set the clipping area
    ctx.beginPath();
    ctx.arc(centerX, centerY, imageWidth * 0.831775 / 2, 0, TWO_PI, true);
    ctx.clip();
    // Add the image
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    ctx.restore();
  }
  return this;
};

export default drawRadialCustomImage;
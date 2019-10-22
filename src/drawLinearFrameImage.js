
import {
  rgbaColor,
  ConicalGradient,
  roundedRectangle,
  createBuffer,
} from './tools';

var drawLinearFrameImage = function(ctx, frameDesign, imageWidth, imageHeight, vertical) {
  let frameWidth;
  let linFBuffer; let linFCtx;
  let OUTER_FRAME_CORNER_RADIUS;
  let FRAME_MAIN_CORNER_RADIUS;
  let SUBTRACT_CORNER_RADIUS;
  let grad;
  let fractions = [];
  let colors = [];
  const cacheKey = imageWidth.toString() + imageHeight + frameDesign.design + vertical;

  // check if we have already created and cached this buffer, if not create it
  if (!drawLinearFrameImage.cache[cacheKey]) {
    frameWidth = Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight) * 0.04;
    frameWidth = Math.ceil(Math.min(frameWidth, (vertical ? imageWidth : imageHeight) * 0.1));

    // Setup buffer
    linFBuffer = createBuffer(imageWidth, imageHeight);
    linFCtx = linFBuffer.getContext('2d');

    // Calculate corner radii
    if (vertical) {
      OUTER_FRAME_CORNER_RADIUS = Math.ceil(imageWidth * 0.05);
      FRAME_MAIN_CORNER_RADIUS = OUTER_FRAME_CORNER_RADIUS - 1;
      SUBTRACT_CORNER_RADIUS = Math.floor(imageWidth * 0.028571);
    } else {
      OUTER_FRAME_CORNER_RADIUS = Math.ceil(imageHeight * 0.05);
      FRAME_MAIN_CORNER_RADIUS = OUTER_FRAME_CORNER_RADIUS - 1;
      SUBTRACT_CORNER_RADIUS = Math.floor(imageHeight * 0.028571);
    }

    roundedRectangle(linFCtx, 0, 0, imageWidth, imageHeight, OUTER_FRAME_CORNER_RADIUS);
    linFCtx.fillStyle = '#838383';
    linFCtx.fill();

    roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, FRAME_MAIN_CORNER_RADIUS);

    // main gradient frame
    switch (frameDesign.design) {
      case 'metal':
        grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
        grad.addColorStop(0, '#fefefe');
        grad.addColorStop(0.07, 'rgb(210, 210, 210)');
        grad.addColorStop(0.12, 'rgb(179, 179, 179)');
        grad.addColorStop(1, 'rgb(213, 213, 213)');
        linFCtx.fillStyle = grad;
        linFCtx.fill();
        break;

      case 'brass':
        grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
        grad.addColorStop(0, 'rgb(249, 243, 155)');
        grad.addColorStop(0.05, 'rgb(246, 226, 101)');
        grad.addColorStop(0.10, 'rgb(240, 225, 132)');
        grad.addColorStop(0.50, 'rgb(90, 57, 22)');
        grad.addColorStop(0.90, 'rgb(249, 237, 139)');
        grad.addColorStop(0.95, 'rgb(243, 226, 108)');
        grad.addColorStop(1, 'rgb(202, 182, 113)');
        linFCtx.fillStyle = grad;
        linFCtx.fill();
        break;

      case 'steel':
        grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
        grad.addColorStop(0, 'rgb(231, 237, 237)');
        grad.addColorStop(0.05, 'rgb(189, 199, 198)');
        grad.addColorStop(0.10, 'rgb(192, 201, 200)');
        grad.addColorStop(0.50, 'rgb(23, 31, 33)');
        grad.addColorStop(0.90, 'rgb(196, 205, 204)');
        grad.addColorStop(0.95, 'rgb(194, 204, 203)');
        grad.addColorStop(1, 'rgb(189, 201, 199)');
        linFCtx.fillStyle = grad;
        linFCtx.fill();
        break;

      case 'gold':
        grad = linFCtx.createLinearGradient(0, imageWidth * 0.004672, 0, imageHeight * 0.990654);
        grad.addColorStop(0, 'rgb(255, 255, 207)');
        grad.addColorStop(0.15, 'rgb(255, 237, 96)');
        grad.addColorStop(0.22, 'rgb(254, 199, 57)');
        grad.addColorStop(0.3, 'rgb(255, 249, 203)');
        grad.addColorStop(0.38, 'rgb(255, 199, 64)');
        grad.addColorStop(0.44, 'rgb(252, 194, 60)');
        grad.addColorStop(0.51, 'rgb(255, 204, 59)');
        grad.addColorStop(0.6, 'rgb(213, 134, 29)');
        grad.addColorStop(0.68, 'rgb(255, 201, 56)');
        grad.addColorStop(0.75, 'rgb(212, 135, 29)');
        grad.addColorStop(1, 'rgb(247, 238, 101)');
        linFCtx.fillStyle = grad;
        linFCtx.fill();
        break;

      case 'anthracite':
        grad = linFCtx.createLinearGradient(0, 0.004672 * imageHeight, 0, 0.995326 * imageHeight);
        grad.addColorStop(0, 'rgb(118, 117, 135)');
        grad.addColorStop(0.06, 'rgb(74, 74, 82)');
        grad.addColorStop(0.12, 'rgb(50, 50, 54)');
        grad.addColorStop(1, 'rgb(79, 79, 87)');
        linFCtx.fillStyle = grad;
        linFCtx.fill();
        break;

      case 'tiltedGray':
        grad = linFCtx.createLinearGradient(0.233644 * imageWidth, 0.084112 * imageHeight, 0.81258 * imageWidth, 0.910919 * imageHeight);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.07, 'rgb(210, 210, 210)');
        grad.addColorStop(0.16, 'rgb(179, 179, 179)');
        grad.addColorStop(0.33, '#ffffff');
        grad.addColorStop(0.55, '#c5c5c5');
        grad.addColorStop(0.79, '#ffffff');
        grad.addColorStop(1, '#666666');
        linFCtx.fillStyle = grad;
        linFCtx.fill();
        break;

      case 'tiltedBlack':
        grad = linFCtx.createLinearGradient(0.228971 * imageWidth, 0.079439 * imageHeight, 0.802547 * imageWidth, 0.898591 * imageHeight);
        grad.addColorStop(0, '#666666');
        grad.addColorStop(0.21, '#000000');
        grad.addColorStop(0.47, '#666666');
        grad.addColorStop(0.99, '#000000');
        grad.addColorStop(1, '#000000');
        linFCtx.fillStyle = grad;
        linFCtx.fill();
        break;

      case 'glossyMetal':
        // The smaller side is important for the contour gradient
        // Java version uses a contour gradient for the outer frame rim
        // but this is only 1 pixel wide, so a plain color fill is essentially
        // the same.
        /*
                    var frameMainFractions4 = [
                                                0,
                                                (imageWidth >= imageHeight ? 32 / imageHeight : 32 / imageWidth) * 0.04,
                                                1
                                                ];
                    var frameMainColors4 = [
                                            new rgbaColor(244, 244, 244, 1),
                                            new rgbaColor(207, 207, 207, 1),
                                            new rgbaColor(207, 207, 207, 1)
                                            ];
                    var frameMainGradient4 = new contourGradient(linFCtx, 0, 0, imageWidth,  imageHeight, frameMainFractions4, frameMainColors4);
                    // Outer frame rim
                    roundedRectangle(linFCtx, 1, 1, imageWidth-2, imageHeight-2, OUTER_FRAME_CORNER_RADIUS);
                    linFCtx.clip();
                    frameMainGradient4.paintContext();
        */
        // Outer frame rim
        //                roundedRectangle(linFCtx, 1, 1, imageWidth-2, imageHeight-2, OUTER_FRAME_CORNER_RADIUS);
        //                linFCtx.clip();
        //                linFCtx.fillStyle = '#cfcfcf';
        //                linFCtx.fill();

        // Main frame
        //                roundedRectangle(linFCtx, 2, 2, imageWidth - 4, imageHeight - 4, FRAME_MAIN_CORNER_RADIUS);
        //                linFCtx.clip();
        roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
        linFCtx.clip();
        grad = linFCtx.createLinearGradient(0, 1, 0, imageHeight - 2);
        // The fractions from the Java version of linear gauge
        /*
                    grad.addColorStop(0, 'rgb(249, 249, 249)');
                    grad.addColorStop(0.1, 'rgb(200, 195, 191)');
                    grad.addColorStop(0.26, '#ffffff');
                    grad.addColorStop(0.73, 'rgb(29, 29, 29)');
                    grad.addColorStop(1, 'rgb(209, 209, 209)');
        */
        // Modified fractions from the radial gauge - looks better imho
        grad.addColorStop(0, 'rgb(249, 249, 249)');
        grad.addColorStop(0.2, 'rgb(200, 195, 191)');
        grad.addColorStop(0.3, '#ffffff');
        grad.addColorStop(0.6, 'rgb(29, 29, 29)');
        grad.addColorStop(0.8, 'rgb(200, 194, 192)');
        grad.addColorStop(1, 'rgb(209, 209, 209)');
        linFCtx.fillStyle = grad;
        linFCtx.fill();

        // Inner frame bright
        roundedRectangle(linFCtx, frameWidth - 2, frameWidth - 2, imageWidth - (frameWidth - 2) * 2, imageHeight - (frameWidth - 2) * 2, SUBTRACT_CORNER_RADIUS);
        linFCtx.clip();
        linFCtx.fillStyle = '#f6f6f6';
        linFCtx.fill();

        // Inner frame dark
        roundedRectangle(linFCtx, frameWidth - 1, frameWidth - 1, imageWidth - (frameWidth - 1) * 2, imageHeight - (frameWidth - 1) * 2, SUBTRACT_CORNER_RADIUS);
        linFCtx.clip();
        linFCtx.fillStyle = '#333333';
        //                linFCtx.fill();
        break;

      case 'blackMetal':
        fractions = [0,
          0.125,
          0.347222,
          0.5,
          0.680555,
          0.875,
          1,
        ];

        colors = [new rgbaColor('#FFFFFF'),
          new rgbaColor('#000000'),
          new rgbaColor('#999999'),
          new rgbaColor('#000000'),
          new rgbaColor('#999999'),
          new rgbaColor('#000000'),
          new rgbaColor('#FFFFFF'),
        ];
        // Set the clip
        linFCtx.beginPath();
        roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
        linFCtx.closePath();
        linFCtx.clip();
        grad = new ConicalGradient(fractions, colors);
        grad.fillRect(linFCtx, imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, frameWidth, frameWidth);
        break;

      case 'shinyMetal':
        fractions = [0,
          0.125,
          0.25,
          0.347222,
          0.5,
          0.652777,
          0.75,
          0.875,
          1,
        ];

        colors = [new rgbaColor('#FFFFFF'),
          new rgbaColor('#D2D2D2'),
          new rgbaColor('#B3B3B3'),
          new rgbaColor('#EEEEEE'),
          new rgbaColor('#A0A0A0'),
          new rgbaColor('#EEEEEE'),
          new rgbaColor('#B3B3B3'),
          new rgbaColor('#D2D2D2'),
          new rgbaColor('#FFFFFF'),
        ];
        // Set the clip
        linFCtx.beginPath();
        roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
        linFCtx.closePath();
        linFCtx.clip();
        grad = new ConicalGradient(fractions, colors);
        grad.fillRect(linFCtx, imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, frameWidth, frameWidth);
        break;

      case 'chrome':
        fractions = [0,
          0.09,
          0.12,
          0.16,
          0.25,
          0.29,
          0.33,
          0.38,
          0.48,
          0.52,
          0.63,
          0.68,
          0.8,
          0.83,
          0.87,
          0.97,
          1,
        ];

        colors = [new rgbaColor('#FFFFFF'),
          new rgbaColor('#FFFFFF'),
          new rgbaColor('#888890'),
          new rgbaColor('#A4B9BE'),
          new rgbaColor('#9EB3B6'),
          new rgbaColor('#707070'),
          new rgbaColor('#DDE3E3'),
          new rgbaColor('#9BB0B3'),
          new rgbaColor('#9CB0B1'),
          new rgbaColor('#FEFFFF'),
          new rgbaColor('#FFFFFF'),
          new rgbaColor('#9CB4B4'),
          new rgbaColor('#C6D1D3'),
          new rgbaColor('#F6F8F7'),
          new rgbaColor('#CCD8D8'),
          new rgbaColor('#A4BCBE'),
          new rgbaColor('#FFFFFF'),
        ];
        // Set the clip
        linFCtx.beginPath();
        roundedRectangle(linFCtx, 1, 1, imageWidth - 2, imageHeight - 2, OUTER_FRAME_CORNER_RADIUS);
        linFCtx.closePath();
        linFCtx.clip();
        grad = new ConicalGradient(fractions, colors);
        grad.fillRect(linFCtx, imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, frameWidth, frameWidth);
        break;
    }

    roundedRectangle(linFCtx, frameWidth, frameWidth, imageWidth - (frameWidth) * 2, imageHeight - (frameWidth) * 2, SUBTRACT_CORNER_RADIUS);
    linFCtx.fillStyle = 'rgb(192, 192, 192)';

    // clip out the center of the frame for transparent backgrounds
    linFCtx.globalCompositeOperation = 'destination-out';
    roundedRectangle(linFCtx, frameWidth, frameWidth, imageWidth - frameWidth * 2, imageHeight - frameWidth * 2, SUBTRACT_CORNER_RADIUS);
    linFCtx.fill();

    // cache the buffer
    drawLinearFrameImage.cache[cacheKey] = linFBuffer;
  }
  ctx.drawImage(drawLinearFrameImage.cache[cacheKey], 0, 0);
  return this;
};
drawLinearFrameImage.cache = {};

export default drawLinearFrameImage;

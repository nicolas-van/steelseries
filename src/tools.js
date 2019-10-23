import {ColorDef} from './constants';

export const HALF_PI = Math.PI * 0.5;
export const TWO_PI = Math.PI * 2;
export const PI = Math.PI;
export const RAD_FACTOR = Math.PI / 180;
export const DEG_FACTOR = 180 / Math.PI;
export const doc = document;
export const lcdFontName = 'LCDMono2Ultra,Arial,Verdana,sans-serif';
export const stdFontName = 'Arial,Verdana,sans-serif';

export const rgbaColor = function(r, g, b, a) {
  let red;
  let green;
  let blue;
  let alpha;

  if (arguments.length === 1) {
    // hexadecimal input #112233
    b = parseInt(r.substr(5, 2), 16);
    g = parseInt(r.substr(3, 2), 16);
    r = parseInt(r.substr(1, 2), 16);
    a = 1;
  } else if (arguments.length === 3) {
    a = 1;
  }

  function validateColors() {
    red = range(r, 255);
    green = range(g, 255);
    blue = range(b, 255);
    alpha = range(a, 1);
  }

  validateColors();

  this.getRed = function() {
    return red;
  };

  this.setRed = function(r) {
    red = range(r, 255);
  };

  this.getGreen = function() {
    return green;
  };

  this.setGreen = function(g) {
    green = range(g, 255);
  };

  this.getBlue = function() {
    return blue;
  };

  this.setBlue = function(b) {
    blue = range(b, 255);
  };

  this.getAlpha = function() {
    return alpha;
  };

  this.setAlpha = function(a) {
    alpha = range(a, 1);
  };

  this.getRgbaColor = function() {
    return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
  };

  this.getRgbColor = function() {
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
  };

  this.getHexColor = function() {
    return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
  };
};

export const ConicalGradient = function(fractions, colors) {
  const limit = fractions.length - 1;
  let i;

  // Pre-multipy fractions array into range -PI to PI
  for (i = 0; i <= limit; i++) {
    fractions[i] = TWO_PI * fractions[i] - PI;
  }

  this.fillCircle = function(ctx, centerX, centerY, innerX, outerX) {
    let angle;
    const radius = Math.ceil(outerX);
    const diameter = radius * 2;
    let x;
    let y;
    let dx;
    let dy;
    let dy2;
    let distance;
    let indx;
    let pixColor;

    // Create pixel array
    const pixels = ctx.createImageData(diameter, diameter);
    const alpha = 255;

    for (y = 0; y < diameter; y++) {
      dy = radius - y;
      dy2 = dy * dy;
      for (x = 0; x < diameter; x++) {
        dx = x - radius;
        distance = Math.sqrt(dx * dx + dy2);
        if (distance <= radius && distance >= innerX) {
          // pixels are transparent by default, so only paint the ones we need
          angle = Math.atan2(dx, dy);
          for (i = 0; i < limit; i++) {
            if (angle >= fractions[i] && angle < fractions[i + 1]) {
              pixColor = getColorFromFraction(
                  colors[i],
                  colors[i + 1],
                  fractions[i + 1] - fractions[i],
                  angle - fractions[i],
                  true
              );
            }
          }
          // The pixel array is addressed as 4 elements per pixel [r,g,b,a]
          // plot is 180 rotated from orginal method, so apply a simple invert (diameter - y)
          indx = (diameter - y) * diameter * 4 + x * 4;
          pixels.data[indx] = pixColor[0];
          pixels.data[indx + 1] = pixColor[1];
          pixels.data[indx + 2] = pixColor[2];
          pixels.data[indx + 3] = alpha;
        }
      }
    }

    // Create a new buffer to apply the raw data so we can rotate it
    const buffer = createBuffer(diameter, diameter);
    const bufferCtx = buffer.getContext('2d');
    bufferCtx.putImageData(pixels, 0, 0);
    // Apply the image buffer
    ctx.drawImage(buffer, centerX - radius, centerY - radius);
  };

  this.fillRect = function(
      ctx,
      centerX,
      centerY,
      width,
      height,
      thicknessX,
      thicknessY
  ) {
    let angle;
    let x;
    let y;
    let dx;
    let dy;
    let indx;
    let pixColor;

    width = Math.ceil(width);
    height = Math.ceil(height);
    const width2 = width / 2;
    const height2 = height / 2;
    thicknessX = Math.ceil(thicknessX);
    thicknessY = Math.ceil(thicknessY);

    // Create pixel array
    const pixels = ctx.createImageData(width, height);
    const alpha = 255;

    for (y = 0; y < height; y++) {
      dy = height2 - y;
      for (x = 0; x < width; x++) {
        if (y > thicknessY && y <= height - thicknessY) {
          // we are in the range where we only draw the sides
          if (x > thicknessX && x < width - thicknessX) {
            // we are in the empty 'middle', jump to the next edge
            x = width - thicknessX;
          }
        }
        dx = x - width2;
        angle = Math.atan2(dx, dy);
        for (i = 0; i < limit; i++) {
          if (angle >= fractions[i] && angle < fractions[i + 1]) {
            pixColor = getColorFromFraction(
                colors[i],
                colors[i + 1],
                fractions[i + 1] - fractions[i],
                angle - fractions[i],
                true
            );
          }
        }
        // The pixel array is addressed as 4 elements per pixel [r,g,b,a]
        // plot is 180 rotated from orginal method, so apply a simple invert (height - y)
        indx = (height - y) * width * 4 + x * 4;
        pixels.data[indx] = pixColor[0];
        pixels.data[indx + 1] = pixColor[0];
        pixels.data[indx + 2] = pixColor[0];
        pixels.data[indx + 3] = alpha;
      }
    }
    // Create a new buffer to apply the raw data so we can clip it when drawing to canvas
    const buffer = createBuffer(width, height);
    const bufferCtx = buffer.getContext('2d');
    bufferCtx.putImageData(pixels, 0, 0);

    // draw the buffer back to the canvas
    ctx.drawImage(buffer, centerX - width2, centerY - height2);
  };
};

export const gradientWrapper = function(start, end, fractions, colors) {
  this.getColorAt = function(fraction) {
    let lowerLimit = 0;
    let lowerIndex = 0;
    let upperLimit = 1;
    let upperIndex = 1;
    let i;

    fraction = fraction < 0 ? 0 : fraction > 1 ? 1 : fraction;

    for (i = 0; i < fractions.length; i++) {
      if (fractions[i] < fraction && lowerLimit < fractions[i]) {
        lowerLimit = fractions[i];
        lowerIndex = i;
      }
      if (fractions[i] === fraction) {
        return colors[i];
      }
      if (fractions[i] > fraction && upperLimit >= fractions[i]) {
        upperLimit = fractions[i];
        upperIndex = i;
      }
    }
    const interpolationFraction = (fraction - lowerLimit) / (upperLimit - lowerLimit);
    return getColorFromFraction(
        colors[lowerIndex],
        colors[upperIndex],
        1,
        interpolationFraction
    );
  };

  this.getStart = function() {
    return start;
  };

  this.getEnd = function() {
    return end;
  };
};

export function setAlpha(hex, alpha) {
  const hexColor = '#' === hex.charAt(0) ? hex.substring(1, 7) : hex;
  const red = parseInt(hexColor.substring(0, 2), 16);
  const green = parseInt(hexColor.substring(2, 4), 16);
  const blue = parseInt(hexColor.substring(4, 6), 16);
  const color = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';

  return color;
}

export function getColorFromFraction(
    sourceColor,
    destinationColor,
    range,
    fraction,
    returnRawData
) {
  const INT_TO_FLOAT = 1 / 255;
  const sourceRed = sourceColor.getRed();
  const sourceGreen = sourceColor.getGreen();
  const sourceBlue = sourceColor.getBlue();
  const sourceAlpha = sourceColor.getAlpha();

  const deltaRed = destinationColor.getRed() - sourceRed;
  const deltaGreen = destinationColor.getGreen() - sourceGreen;
  const deltaBlue = destinationColor.getBlue() - sourceBlue;
  const deltaAlpha =
    destinationColor.getAlpha() * INT_TO_FLOAT - sourceAlpha * INT_TO_FLOAT;

  const fractionRed = (deltaRed / range) * fraction;
  const fractionGreen = (deltaGreen / range) * fraction;
  const fractionBlue = (deltaBlue / range) * fraction;
  const fractionAlpha = (deltaAlpha / range) * fraction;

  returnRawData = returnRawData || false;
  if (returnRawData) {
    return [
      (sourceRed + fractionRed).toFixed(0),
      (sourceGreen + fractionGreen).toFixed(0),
      (sourceBlue + fractionBlue).toFixed(0),
      sourceAlpha + fractionAlpha,
    ];
  } else {
    return new rgbaColor(
        (sourceRed + fractionRed).toFixed(0),
        (sourceGreen + fractionGreen).toFixed(0),
        (sourceBlue + fractionBlue).toFixed(0),
        sourceAlpha + fractionAlpha
    );
  }
}

export function Section(start, stop, color) {
  return {
    start: start,
    stop: stop,
    color: color,
  };
}

Math.log10 = function(value) {
  return Math.log(value) / Math.LN10;
};

export function calcNiceNumber(range, round) {
  const exponent = Math.floor(Math.log10(range)); // exponent of range
  const fraction = range / Math.pow(10, exponent); // fractional part of range
  let niceFraction; // nice, rounded fraction

  if (round) {
    if (1.5 > fraction) {
      niceFraction = 1;
    } else if (3 > fraction) {
      niceFraction = 2;
    } else if (7 > fraction) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  } else {
    if (1 >= fraction) {
      niceFraction = 1;
    } else if (2 >= fraction) {
      niceFraction = 2;
    } else if (5 >= fraction) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  }
  return niceFraction * Math.pow(10, exponent);
}

export function roundedRectangle(ctx, x, y, w, h, radius) {
  const r = x + w;
  const b = y + h;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(r - radius, y);
  ctx.quadraticCurveTo(r, y, r, y + radius);
  ctx.lineTo(r, y + h - radius);
  ctx.quadraticCurveTo(r, b, r - radius, b);
  ctx.lineTo(x + radius, b);
  ctx.quadraticCurveTo(x, b, x, b - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  //        ctx.stroke();
}

export function createBuffer(width, height) {
  const buffer = doc.createElement('canvas');
  buffer.width = width;
  buffer.height = height;
  return buffer;
}

export function drawToBuffer(width, height, drawFunction) {
  const buffer = doc.createElement('canvas');
  buffer.width = width;
  buffer.height = height;
  drawFunction(buffer.getContext('2d'));
  return buffer;
}

export function getColorValues(color) {
  const lookupBuffer = drawToBuffer(1, 1, function(ctx) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(0, 0, 1, 1);
    ctx.fill();
  });
  const colorData = lookupBuffer.getContext('2d').getImageData(0, 0, 2, 2).data;

  return [colorData[0], colorData[1], colorData[2], colorData[3]];
}

export function customColorDef(color) {
  const values = getColorValues(color);
  const rgbaCol = new rgbaColor(values[0], values[1], values[2], values[3]);

  const VERY_DARK = darker(rgbaCol, 0.32);
  const DARK = darker(rgbaCol, 0.62);
  const LIGHT = lighter(rgbaCol, 0.84);
  const LIGHTER = lighter(rgbaCol, 0.94);
  const VERY_LIGHT = lighter(rgbaCol, 1);

  return new ColorDef(VERY_DARK, DARK, rgbaCol, LIGHT, LIGHTER, VERY_LIGHT);
}

export function rgbToHsl(red, green, blue) {
  let hue;
  let saturation;
  let delta;

  red /= 255;
  green /= 255;
  blue /= 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    hue = saturation = 0; // achromatic
  } else {
    delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      case blue:
        hue = (red - green) / delta + 4;
        break;
    }
    hue /= 6;
  }
  return [hue, saturation, lightness];
}

export function hsbToRgb(hue, saturation, brightness) {
  let r;
  let g;
  let b;
  const i = Math.floor(hue * 6);
  const f = hue * 6 - i;
  const p = brightness * (1 - saturation);
  const q = brightness * (1 - f * saturation);
  const t = brightness * (1 - (1 - f) * saturation);

  switch (i % 6) {
    case 0:
      r = brightness;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = brightness;
      b = p;
      break;
    case 2:
      r = p;
      g = brightness;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = brightness;
      break;
    case 4:
      r = t;
      g = p;
      b = brightness;
      break;
    case 5:
      r = brightness;
      g = p;
      b = q;
      break;
  }

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

export function rgbToHsb(r, g, b) {
  let hue;

  r = r / 255;
  g = g / 255;
  b = b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = max;
  const delta = max - min;
  const saturation = max === 0 ? 0 : delta / max;

  if (max === min) {
    hue = 0; // achromatic
  } else {
    switch (max) {
      case r:
        hue = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      case b:
        hue = (r - g) / delta + 4;
        break;
    }
    hue /= 6;
  }
  return [hue, saturation, brightness];
}

export function range(value, limit) {
  return value < 0 ? 0 : value > limit ? limit : value;
}

export function darker(color, fraction) {
  let red = Math.floor(color.getRed() * (1 - fraction));
  let green = Math.floor(color.getGreen() * (1 - fraction));
  let blue = Math.floor(color.getBlue() * (1 - fraction));

  red = range(red, 255);
  green = range(green, 255);
  blue = range(blue, 255);

  return new rgbaColor(red, green, blue, color.getAlpha());
}

export function lighter(color, fraction) {
  let red = Math.round(color.getRed() * (1 + fraction));
  let green = Math.round(color.getGreen() * (1 + fraction));
  let blue = Math.round(color.getBlue() * (1 + fraction));

  red = range(red, 255);
  green = range(green, 255);
  blue = range(blue, 255);

  return new rgbaColor(red, green, blue, color.getAlpha());
}

export function wrap(value, lower, upper) {
  if (upper <= lower) {
    throw new Error('Rotary bounds are of negative or zero size');
  }

  const distance = upper - lower;
  const times = Math.floor((value - lower) / distance);

  return value - times * distance;
}

export function getShortestAngle(from, to) {
  return wrap(to - from, -180, 180);
}

// shim layer
export const requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 16);
    }
  );
})();

export function getCanvasContext(elementOrId) {
  const element =
    typeof elementOrId === 'string' || elementOrId instanceof String ?
      doc.getElementById(elementOrId) :
      elementOrId;
  return element.getContext('2d');
}



import {
ColorDef,
} from "./constants";

export var HALF_PI = Math.PI * 0.5,
TWO_PI = Math.PI * 2,
PI = Math.PI,
RAD_FACTOR = Math.PI / 180,
DEG_FACTOR = 180 / Math.PI,
doc = document,
lcdFontName = 'LCDMono2Ultra,Arial,Verdana,sans-serif',
stdFontName = 'Arial,Verdana,sans-serif';

export var rgbaColor = function(r, g, b, a) {
  var red, green, blue, alpha;

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

export var ConicalGradient = function(fractions, colors) {
  var limit = fractions.length - 1,
    i;

  // Pre-multipy fractions array into range -PI to PI
  for (i = 0; i <= limit; i++) {
    fractions[i] = TWO_PI * fractions[i] - PI;
  }

  this.fillCircle = function(ctx, centerX, centerY, innerX, outerX) {
    var angle,
      radius = Math.ceil(outerX),
      diameter = radius * 2,
      pixels, alpha,
      x, y, dx, dy, dy2, distance,
      indx, pixColor,
      buffer, bufferCtx;

    // Original Version using rotated lines
    /*
                ctx.save();
                ctx.lineWidth = 1.5;
                ctx.translate(centerX, centerY);
                ctx.rotate(rotationOffset);
                ctx.translate(-centerX, -centerY);
                for (i = 0, size = fractions.length - 1; i < size; i++) {
                    startAngle = TWO_PI * fractions[i];
                    stopAngle = TWO_PI * fractions[i + 1];
                    range = stopAngle - startAngle;
                    startColor = colors[i];
                    stopColor = colors[i + 1];
                    for (angle = startAngle; angle < stopAngle; angle += angleStep) {
                        ctx.beginPath();
                        ctx.fillStyle = getColorFromFraction(startColor, stopColor, range, (angle - startAngle)).getRgbaColor();
                        ctx.strokeStyle = ctx.fillStyle;
                        if (innerX > 0) {
                            ctx.arc(centerX, centerY, innerX, angle + angleStep, angle, true);
                        } else {
                            ctx.moveTo(centerX, centerY);
                        }
                        ctx.arc(centerX, centerY, outerX, angle, angle + angleStep);
                        ctx.fill();
                        ctx.stroke();
                    }
                }
    */
    // End - Original Version

    // Create pixel array
    pixels = ctx.createImageData(diameter, diameter);
    alpha = 255;

    for (y = 0; y < diameter; y++) {
      dy = radius - y;
      dy2 = dy * dy;
      for (x = 0; x < diameter; x++) {
        dx = x - radius;
        distance = Math.sqrt((dx * dx) + dy2);
        if (distance <= radius && distance >= innerX) { // pixels are transparent by default, so only paint the ones we need
          angle = Math.atan2(dx, dy);
          for (i = 0; i < limit; i++) {
            if (angle >= fractions[i] && angle < fractions[i + 1]) {
              pixColor = getColorFromFraction(colors[i], colors[i + 1], fractions[i + 1] - fractions[i], angle - fractions[i], true);
            }
          }
          // The pixel array is addressed as 4 elements per pixel [r,g,b,a]
          indx = ((diameter - y) * diameter * 4) + (x * 4); // plot is 180 rotated from orginal method, so apply a simple invert (diameter - y)
          pixels.data[indx] = pixColor[0];
          pixels.data[indx + 1] = pixColor[1];
          pixels.data[indx + 2] = pixColor[2];
          pixels.data[indx + 3] = alpha;
        }
      }
    }

    // Create a new buffer to apply the raw data so we can rotate it
    buffer = createBuffer(diameter, diameter);
    bufferCtx = buffer.getContext('2d');
    bufferCtx.putImageData(pixels, 0, 0);
    // Apply the image buffer
    ctx.drawImage(buffer, centerX - radius, centerY - radius);
  };

  this.fillRect = function(ctx, centerX, centerY, width, height, thicknessX, thicknessY) {
    var angle,
      width2,
      height2,
      pixels, alpha,
      x, y, dx, dy,
      indx,
      pixColor,
      buffer, bufferCtx;

    width = Math.ceil(width);
    height = Math.ceil(height);
    width2 = width / 2;
    height2 = height / 2;
    thicknessX = Math.ceil(thicknessX);
    thicknessY = Math.ceil(thicknessY);

    // Create pixel array
    pixels = ctx.createImageData(width, height);
    alpha = 255;

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
            pixColor = getColorFromFraction(colors[i], colors[i + 1], fractions[i + 1] - fractions[i], angle - fractions[i], true);
          }
        }
        // The pixel array is addressed as 4 elements per pixel [r,g,b,a]
        indx = ((height - y) * width * 4) + (x * 4); // plot is 180 rotated from orginal method, so apply a simple invert (height - y)
        pixels.data[indx] = pixColor[0];
        pixels.data[indx + 1] = pixColor[0];
        pixels.data[indx + 2] = pixColor[0];
        pixels.data[indx + 3] = alpha;
      }
    }
    // Create a new buffer to apply the raw data so we can clip it when drawing to canvas
    buffer = createBuffer(width, height);
    bufferCtx = buffer.getContext('2d');
    bufferCtx.putImageData(pixels, 0, 0);

    // draw the buffer back to the canvas
    ctx.drawImage(buffer, centerX - width2, centerY - height2);
  };

};

export var gradientWrapper = function(start, end, fractions, colors) {

  this.getColorAt = function(fraction) {
    var lowerLimit = 0,
      lowerIndex = 0,
      upperLimit = 1,
      upperIndex = 1,
      i,
      interpolationFraction;

    fraction = (fraction < 0 ? 0 : (fraction > 1 ? 1 : fraction));

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
    interpolationFraction = (fraction - lowerLimit) / (upperLimit - lowerLimit);
    return getColorFromFraction(colors[lowerIndex], colors[upperIndex], 1, interpolationFraction);
  };

  this.getStart = function() {
    return start;
  };

  this.getEnd = function() {
    return end;
  };
};

export function setAlpha(hex, alpha) {
  var hexColor = ('#' === hex.charAt(0)) ? hex.substring(1, 7) : hex,
    red = parseInt((hexColor).substring(0, 2), 16),
    green = parseInt((hexColor).substring(2, 4), 16),
    blue = parseInt((hexColor).substring(4, 6), 16),
    color = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';

  return color;
}

export function getColorFromFraction(sourceColor, destinationColor, range, fraction, returnRawData) {
  var INT_TO_FLOAT = 1 / 255,
    sourceRed = sourceColor.getRed(),
    sourceGreen = sourceColor.getGreen(),
    sourceBlue = sourceColor.getBlue(),
    sourceAlpha = sourceColor.getAlpha(),

    deltaRed = destinationColor.getRed() - sourceRed,
    deltaGreen = destinationColor.getGreen() - sourceGreen,
    deltaBlue = destinationColor.getBlue() - sourceBlue,
    deltaAlpha = destinationColor.getAlpha() * INT_TO_FLOAT - sourceAlpha * INT_TO_FLOAT,

    fractionRed = deltaRed / range * fraction,
    fractionGreen = deltaGreen / range * fraction,
    fractionBlue = deltaBlue / range * fraction,
    fractionAlpha = deltaAlpha / range * fraction;

  returnRawData = returnRawData || false;
  if (returnRawData) {
    return [(sourceRed + fractionRed).toFixed(0), (sourceGreen + fractionGreen).toFixed(0), (sourceBlue + fractionBlue).toFixed(0), sourceAlpha + fractionAlpha];
  } else {
    return new rgbaColor((sourceRed + fractionRed).toFixed(0), (sourceGreen + fractionGreen).toFixed(0), (sourceBlue + fractionBlue).toFixed(0), sourceAlpha + fractionAlpha);
  }
}

export function section(start, stop, color) {
  return {
    start: start,
    stop: stop,
    color: color
  };
}

Math.log10 = function(value) {
  return (Math.log(value) / Math.LN10);
};

export function calcNiceNumber(range, round) {
  var exponent = Math.floor(Math.log10(range)), // exponent of range
    fraction = range / Math.pow(10, exponent), // fractional part of range
    niceFraction; // nice, rounded fraction

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
  var r = x + w,
    b = y + h;
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
  var buffer = doc.createElement('canvas');
  buffer.width = width;
  buffer.height = height;
  return buffer;
}

export function drawToBuffer(width, height, drawFunction) {
  var buffer = doc.createElement('canvas');
  buffer.width = width;
  buffer.height = height;
  drawFunction(buffer.getContext('2d'));
  return buffer;
}

export function getColorValues(color) {
  var colorData,
    lookupBuffer = drawToBuffer(1, 1, function(ctx) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(0, 0, 1, 1);
      ctx.fill();
    });
  colorData = lookupBuffer.getContext('2d').getImageData(0, 0, 2, 2).data;

  /*
  for (var i = 0; i < data.length; i += 4) {
      var red = data[i];       // red
      var green = data[i + 1]; // green
      var blue = data[i + 2];  // blue
      //var alpha = data[i + 3]; // alpha
      console.log(red + ', ' + green + ', ' + blue);
  }
  */

  return [colorData[0], colorData[1], colorData[2], colorData[3]];
}

export function customColorDef(color) {
  var VERY_DARK,
    DARK,
    LIGHT,
    LIGHTER,
    VERY_LIGHT,
    values = getColorValues(color),
    rgbaCol = new rgbaColor(values[0], values[1], values[2], values[3]);

  VERY_DARK = darker(rgbaCol, 0.32);
  DARK = darker(rgbaCol, 0.62);
  LIGHT = lighter(rgbaCol, 0.84);
  LIGHTER = lighter(rgbaCol, 0.94);
  VERY_LIGHT = lighter(rgbaCol, 1);

  return new ColorDef(VERY_DARK, DARK, rgbaCol, LIGHT, LIGHTER, VERY_LIGHT);
}

export function rgbToHsl(red, green, blue) {
  var min, max, hue, saturation, lightness, delta;

  red /= 255;
  green /= 255;
  blue /= 255;

  max = Math.max(red, green, blue);
  min = Math.min(red, green, blue);
  lightness = (max + min) / 2;

  if (max === min) {
    hue = saturation = 0; // achromatic
  } else {
    delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
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

/* These functions are not currently used
    function hslToRgb(hue, saturation, lightness) {
        var red, green, blue, p, q;

        function hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }

        if (saturation === 0) {
            red = green = blue = lightness; // achromatic
        } else {
            q = (lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation);
            p = 2 * lightness - q;
            red = hue2rgb(p, q, hue + 1 / 3);
            green = hue2rgb(p, q, hue);
            blue = hue2rgb(p, q, hue - 1 / 3);
        }

        return [Math.floor(red * 255), Math.floor(green * 255), Math.floor(blue * 255)];
    }

    function hsbToHsl(hue, saturation, brightness) {
        var lightness = (brightness - saturation) / 2;
        lightness = range(lightness, 1);
        return [hue, saturation, lightness];
    }

    function hslToHsb(hue, saturation, lightness) {
        var brightness = (lightness * 2) + saturation;
        return [hue, saturation, brightness];
    }
*/

export function hsbToRgb(hue, saturation, brightness) {
  var r, g, b,
    i = Math.floor(hue * 6),
    f = hue * 6 - i,
    p = brightness * (1 - saturation),
    q = brightness * (1 - f * saturation),
    t = brightness * (1 - (1 - f) * saturation);

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
  var min, max, hue, saturation, brightness, delta;

  r = r / 255;
  g = g / 255;
  b = b / 255;
  max = Math.max(r, g, b);
  min = Math.min(r, g, b);
  brightness = max;
  delta = max - min;
  saturation = max === 0 ? 0 : delta / max;

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
  return (value < 0 ? 0 : (value > limit ? limit : value));
}

export function darker(color, fraction) {
  var red = Math.floor(color.getRed() * (1 - fraction)),
    green = Math.floor(color.getGreen() * (1 - fraction)),
    blue = Math.floor(color.getBlue() * (1 - fraction));

  red = range(red, 255);
  green = range(green, 255);
  blue = range(blue, 255);

  return new rgbaColor(red, green, blue, color.getAlpha());
}

export function lighter(color, fraction) {
  var red = Math.round(color.getRed() * (1 + fraction)),
    green = Math.round(color.getGreen() * (1 + fraction)),
    blue = Math.round(color.getBlue() * (1 + fraction));

  red = range(red, 255);
  green = range(green, 255);
  blue = range(blue, 255);

  return new rgbaColor(red, green, blue, color.getAlpha());
}

export function wrap(value, lower, upper) {
  var distance, times;
  if (upper <= lower) {
    throw 'Rotary bounds are of negative or zero size';
  }

  distance = upper - lower;
  times = Math.floor((value - lower) / distance);

  return value - (times * distance);
}

export function getShortestAngle(from, to) {
  return wrap((to - from), -180, 180);
}

// shim layer
export var requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 16);
    };
}());

export function getCanvasContext(elementOrId) {
  var element = (typeof elementOrId === 'string' || elementOrId instanceof String) ?
    doc.getElementById(elementOrId) : elementOrId;
  return element.getContext('2d');
}

/*
    function blur(ctx, width, height, radius) {
    // This function is too CPU expensive
    // leave disabled for now :(

        // Cheap'n'cheerful blur filter, just applies horizontal and vertical blurs
        // Only works for square canvas's at present

        var j, x, y,      // loop counters
            i,
            end,
            totR, totG, totB, totA,
            // Create a temporary buffer
            tempBuffer = createBuffer(width, height),
            tempCtx = tempBuffer.getContext('2d'),
            // pixel data
            inPix, outPix,
            mul,
            indx;

        ctx.save();

        for (j = 0; j < 2; j++) {
            // Get access to the pixel data
            inPix = ctx.getImageData(0, 0, (j === 0 ? width : height), (j === 0 ? height : width));
            outPix = ctx.createImageData((j === 0 ? width : height), (j === 0 ? height : width));

            if (j === 0) { // Horizontal blur
                if (radius >= width) {
                    radius = width - 1;
                }
            } else { // Vertical blur
                if (radius >= height) {
                    radius = height - 1;
                }
            }
            mul = 1 / (radius * 2 + 1);
            indx = 0;
            for (y = 0, end = (j === 0 ? height : width); y < end; y++) {
                totR = totG = totB = totA = 0;
                for (x = 0; x < radius ; x++) {
                    i = (indx + x) * 4;
                    totR += inPix.data[i];
                    totG += inPix.data[i + 1];
                    totB += inPix.data[i + 2];
                    totA += inPix.data[i + 3];
                }
                for (x = 0; x < (j === 0 ? width : height); x++) {
                    if (x > radius) {
                        i = (indx - radius - 1) * 4;
                        totR -= inPix.data[i];
                        totG -= inPix.data[i + 1];
                        totB -= inPix.data[i + 2];
                        totA -= inPix.data[i + 3];
                    }
                    if (x + radius < width) {
                        i = (indx + radius) * 4;
                        totR += inPix.data[i];
                        totG += inPix.data[i + 1];
                        totB += inPix.data[i + 2];
                        totA += inPix.data[i + 3];
                    }
                    i = indx * 4;
                    outPix.data[i] = (totR * mul) | 0;
                    outPix.data[i + 1] = (totG * mul) | 0;
                    outPix.data[i + 2] = (totB * mul) | 0;
                    outPix.data[i + 3] = (totA * mul) | 0;
                    indx++;
                }
            }
            // Write the output pixel data back to the temp buffer
            tempCtx.clearRect(0, 0, width, height);
            tempCtx.putImageData(outPix, 0, 0);
            if (j === 0) {
                // Clear the input canvas
                ctx.clearRect(0, 0, width, height);
                // Rotate image by 90 degrees
                ctx.translate(width / 2, height / 2);
                ctx.rotate(HALF_PI);
                ctx.translate(-width / 2, -height / 2);
                // Write the buffer back
                ctx.drawImage(tempBuffer, 0, 0);
            }
        }
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-PI);
        ctx.translate(-width / 2, -height / 2);
        // Clear the input canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempBuffer, 0, 0);
        ctx.restore();

    }
*/

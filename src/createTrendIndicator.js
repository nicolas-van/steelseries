
import {
setAlpha, 
createBuffer, 
TWO_PI,
} from "./tools";

var createTrendIndicator = function(width, onSection, colors) {
  var height = width * 2,
    trendBuffer, trendCtx,
    fill,
    cacheKey = onSection.state + width + JSON.stringify(colors),

    drawUpArrow = function() {
      // draw up arrow (red)
      var ledColor = colors[0];

      if (onSection.state === 'up') {
        fill = trendCtx.createRadialGradient(0.5 * width, 0.2 * height, 0, 0.5 * width, 0.2 * height, 0.5 * width);
        fill.addColorStop(0, ledColor.innerColor1_ON);
        fill.addColorStop(0.2, ledColor.innerColor2_ON);
        fill.addColorStop(1, ledColor.outerColor_ON);
      } else {
        fill = trendCtx.createLinearGradient(0, 0, 0, 0.5 * height);
        fill.addColorStop(0, '#323232');
        fill.addColorStop(1, '#5c5c5c');
      }
      trendCtx.fillStyle = fill;
      trendCtx.beginPath();
      trendCtx.moveTo(0.5 * width, 0);
      trendCtx.lineTo(width, 0.2 * height);
      trendCtx.lineTo(0.752 * width, 0.2 * height);
      trendCtx.lineTo(0.752 * width, 0.37 * height);
      trendCtx.lineTo(0.252 * width, 0.37 * height);
      trendCtx.lineTo(0.252 * width, 0.2 * height);
      trendCtx.lineTo(0, 0.2 * height);
      trendCtx.closePath();
      trendCtx.fill();
      if (onSection.state !== 'up') {
        // Inner shadow
        trendCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        trendCtx.beginPath();
        trendCtx.moveTo(0, 0.2 * height);
        trendCtx.lineTo(0.5 * width, 0);
        trendCtx.lineTo(width, 0.2 * height);
        trendCtx.moveTo(0.252 * width, 0.2 * height);
        trendCtx.lineTo(0.252 * width, 0.37 * height);
        trendCtx.stroke();
        // Inner highlight
        trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        trendCtx.beginPath();
        trendCtx.moveTo(0.252 * width, 0.37 * height);
        trendCtx.lineTo(0.752 * width, 0.37 * height);
        trendCtx.lineTo(0.752 * width, 0.2 * height);
        trendCtx.lineTo(width, 0.2 * height);
        trendCtx.stroke();
      } else {
        // draw halo
        fill = trendCtx.createRadialGradient(0.5 * width, 0.2 * height, 0, 0.5 * width, 0.2 * height, 0.7 * width);
        fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
        fill.addColorStop(0.5, setAlpha(ledColor.coronaColor, 0.3));
        fill.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.2));
        fill.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.1));
        fill.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05));
        fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
        trendCtx.fillStyle = fill;

        trendCtx.beginPath();
        trendCtx.arc(0.5 * width, 0.2 * height, 0.7 * width, 0, TWO_PI, true);
        trendCtx.closePath();
        trendCtx.fill();
      }
    },

    drawEquals = function() {
      // draw equal symbol
      var ledColor = colors[1];

      trendCtx.beginPath();
      if (onSection.state === 'steady') {
        fill = ledColor.outerColor_ON;
        trendCtx.fillStyle = fill;
        trendCtx.rect(0.128 * width, 0.41 * height, 0.744 * width, 0.074 * height);
        trendCtx.rect(0.128 * width, 0.516 * height, 0.744 * width, 0.074 * height);
        trendCtx.closePath();
        trendCtx.fill();
      } else {
        fill = trendCtx.createLinearGradient(0, 0.41 * height, 0, 0.41 * height + 0.074 * height);
        fill.addColorStop(0, '#323232');
        fill.addColorStop(1, '#5c5c5c');
        trendCtx.fillStyle = fill;
        trendCtx.rect(0.128 * width, 0.41 * height, 0.744 * width, 0.074 * height);
        trendCtx.closePath();
        trendCtx.fill();
        fill = trendCtx.createLinearGradient(0, 0.516 * height, 0, 0.516 * height + 0.074 * height);
        fill.addColorStop(0, '#323232');
        fill.addColorStop(1, '#5c5c5c');
        trendCtx.fillStyle = fill;
        trendCtx.rect(0.128 * width, 0.516 * height, 0.744 * width, 0.074 * height);
        trendCtx.closePath();
        trendCtx.fill();
      }
      if (onSection.state !== 'steady') {
        // inner shadow
        trendCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        trendCtx.beginPath();
        trendCtx.moveTo(0.128 * width, 0.41 * height + 0.074 * height);
        trendCtx.lineTo(0.128 * width, 0.41 * height);
        trendCtx.lineTo(0.128 * width + 0.744 * width, 0.41 * height);
        trendCtx.stroke();
        trendCtx.beginPath();
        trendCtx.moveTo(0.128 * width, 0.516 * height + 0.074 * height);
        trendCtx.lineTo(0.128 * width, 0.516 * height);
        trendCtx.lineTo(0.128 * width + 0.744 * width, 0.516 * height);
        trendCtx.stroke();
        // inner highlight
        trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        trendCtx.beginPath();
        trendCtx.moveTo(0.128 * width + 0.744 * width, 0.41 * height);
        trendCtx.lineTo(0.128 * width + 0.744 * width, 0.41 * height + 0.074 * height);
        trendCtx.lineTo(0.128 * width, 0.41 * height + 0.074 * height);
        trendCtx.stroke();
        trendCtx.beginPath();
        trendCtx.moveTo(0.128 * width + 0.744 * width, 0.516 * height);
        trendCtx.lineTo(0.128 * width + 0.744 * width, 0.516 * height + 0.074 * height);
        trendCtx.lineTo(0.128 * width, 0.516 * height + 0.074 * height);
        trendCtx.stroke();
      } else {
        // draw halo
        fill = trendCtx.createRadialGradient(0.5 * width, 0.5 * height, 0, 0.5 * width, 0.5 * height, 0.7 * width);
        fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
        fill.addColorStop(0.5, setAlpha(ledColor.coronaColor, 0.3));
        fill.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.2));
        fill.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.1));
        fill.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05));
        fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
        trendCtx.fillStyle = fill;
        trendCtx.beginPath();
        trendCtx.arc(0.5 * width, 0.5 * height, 0.7 * width, 0, TWO_PI, true);
        trendCtx.closePath();
        trendCtx.fill();
      }
    },

    drawDownArrow = function() {
      // draw down arrow
      var ledColor = colors[2];
      if (onSection.state === 'down') {
        fill = trendCtx.createRadialGradient(0.5 * width, 0.8 * height, 0, 0.5 * width, 0.8 * height, 0.5 * width);
        fill.addColorStop(0, ledColor.innerColor1_ON);
        fill.addColorStop(0.2, ledColor.innerColor2_ON);
        fill.addColorStop(1, ledColor.outerColor_ON);
      } else {
        fill = trendCtx.createLinearGradient(0, 0.63 * height, 0, height);
        fill.addColorStop(0, '#323232');
        fill.addColorStop(1, '#5c5c5c');
      }
      trendCtx.beginPath();
      trendCtx.fillStyle = fill;
      trendCtx.moveTo(0.5 * width, height);
      trendCtx.lineTo(width, 0.8 * height);
      trendCtx.lineTo(0.725 * width, 0.8 * height);
      trendCtx.lineTo(0.725 * width, 0.63 * height);
      trendCtx.lineTo(0.252 * width, 0.63 * height);
      trendCtx.lineTo(0.252 * width, 0.8 * height);
      trendCtx.lineTo(0, 0.8 * height);
      trendCtx.closePath();
      trendCtx.fill();
      if (onSection.state !== 'down') {
        // Inner shadow
        trendCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        trendCtx.beginPath();
        trendCtx.moveTo(0, 0.8 * height);
        trendCtx.lineTo(0.252 * width, 0.8 * height);
        trendCtx.moveTo(0.252 * width, 0.63 * height);
        trendCtx.lineTo(0.752 * width, 0.63 * height);
        trendCtx.stroke();
        trendCtx.beginPath();
        trendCtx.moveTo(0.752 * width, 0.8 * height);
        trendCtx.lineTo(width, 0.8 * height);
        trendCtx.stroke();
        // Inner highlight
        trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        trendCtx.beginPath();
        trendCtx.moveTo(0, 0.8 * height);
        trendCtx.lineTo(0.5 * width, height);
        trendCtx.lineTo(width, 0.8 * height);
        trendCtx.stroke();
        trendCtx.beginPath();
        trendCtx.moveTo(0.752 * width, 0.8 * height);
        trendCtx.lineTo(0.752 * width, 0.63 * height);
        trendCtx.stroke();
      } else {
        // draw halo
        fill = trendCtx.createRadialGradient(0.5 * width, 0.8 * height, 0, 0.5 * width, 0.8 * height, 0.7 * width);
        fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
        fill.addColorStop(0.5, setAlpha(ledColor.coronaColor, 0.3));
        fill.addColorStop(0.7, setAlpha(ledColor.coronaColor, 0.2));
        fill.addColorStop(0.8, setAlpha(ledColor.coronaColor, 0.1));
        fill.addColorStop(0.85, setAlpha(ledColor.coronaColor, 0.05));
        fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
        trendCtx.fillStyle = fill;
        trendCtx.beginPath();
        trendCtx.arc(0.5 * width, 0.8 * height, 0.7 * width, 0, TWO_PI, true);
        trendCtx.closePath();
        trendCtx.fill();
      }
    };

  // Check if we have already cached this indicator, if not create it
  if (!createTrendIndicator.cache[cacheKey]) {
    // create oversized buffer for the glow
    trendBuffer = createBuffer(width * 2, width * 4);
    trendCtx = trendBuffer.getContext('2d');
    trendCtx.translate(width * 0.5, width * 0.5);
    // Must draw the active section last so the 'glow' is on top
    switch (onSection.state) {
      case 'up':
        drawDownArrow();
        drawEquals();
        drawUpArrow();
        break;
      case 'steady':
        drawDownArrow();
        drawUpArrow();
        drawEquals();
        break;
      case 'down':
        /* falls through */
      default:
        drawUpArrow();
        drawEquals();
        drawDownArrow();
        break;
    }
    // cache the buffer
    createTrendIndicator.cache[cacheKey] = trendBuffer;
  }
  return createTrendIndicator.cache[cacheKey];
};
createTrendIndicator.cache = {};

export default createTrendIndicator;

import createLcdBackgroundImage from "./createLcdBackgroundImage";
import {
getCanvasContext,
lcdFontName,
stdFontName,
} from "./tools";

var displayMulti = function(canvas, parameters) {
  parameters = parameters || {};
  var width = (undefined === parameters.width ? 0 : parameters.width),
    height = (undefined === parameters.height ? 0 : parameters.height),
    lcdColor = (undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor),
    lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
    headerString = (undefined === parameters.headerString ? '' : parameters.headerString),
    headerStringVisible = (undefined === parameters.headerStringVisible ? false : parameters.headerStringVisible),
    detailString = (undefined === parameters.detailString ? '' : parameters.detailString),
    detailStringVisible = (undefined === parameters.detailStringVisible ? false : parameters.detailStringVisible),
    linkAltValue = (undefined === parameters.linkAltValue ? true : parameters.linkAltValue),
    unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
    unitStringVisible = (undefined === parameters.unitStringVisible ? false : parameters.unitStringVisible),
    digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
    valuesNumeric = (undefined === parameters.valuesNumeric ? true : parameters.valuesNumeric),
    value = (undefined === parameters.value ? 0 : parameters.value),
    altValue = (undefined === parameters.altValue ? 0 : parameters.altValue);

  // Get the canvas context and clear it
  var mainCtx = getCanvasContext(canvas);
  // Has a size been specified?
  if (width === 0) {
    width = mainCtx.canvas.width;
  }
  if (height === 0) {
    height = mainCtx.canvas.height;
  }

  // Set the size - also clears the canvas
  mainCtx.canvas.width = width;
  mainCtx.canvas.height = height;

  var imageWidth = width;
  var imageHeight = height;

  var stdFont = Math.floor(imageHeight / 1.875) + 'px ' + stdFontName;
  var lcdFont = Math.floor(imageHeight / 1.875) + 'px ' + lcdFontName;
  var stdAltFont = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName;
  var lcdAltFont = Math.floor(imageHeight / 3.5) + 'px ' + lcdFontName;

  var initialized = false;

  // **************   Buffer creation  ********************
  // Buffer for the lcd
  var lcdBuffer;

  // **************   Image creation  ********************
  var drawLcdText = function(value) {
    mainCtx.save();
    mainCtx.textAlign = 'right';
    mainCtx.textBaseline = 'middle';
    mainCtx.strokeStyle = lcdColor.textColor;
    mainCtx.fillStyle = lcdColor.textColor;

    if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
      mainCtx.shadowColor = 'gray';
      mainCtx.shadowOffsetX = imageHeight * 0.025;
      mainCtx.shadowOffsetY = imageHeight * 0.025;
      mainCtx.shadowBlur = imageHeight * 0.05;
    }

    if (valuesNumeric) {
      // Numeric value
      if (headerStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName;
      } else {
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
      }
      var unitWidth = 0;
      if (unitStringVisible) {
        if (headerStringVisible) {
          mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName;
          unitWidth = mainCtx.measureText(unitString).width;
        } else {
          mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
          unitWidth = mainCtx.measureText(unitString).width;
        }
      }
      mainCtx.font = digitalFont ? lcdFont : stdFont;
      var valueText = value.toFixed(lcdDecimals);
      if (headerStringVisible) {
        mainCtx.fillText(valueText, imageWidth - unitWidth - 4, imageHeight * 0.5);
      } else {
        mainCtx.fillText(valueText, imageWidth - unitWidth - 4, imageHeight * 0.38);
      }

      if (unitStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 3) + 'px ' + stdFontName;
        mainCtx.fillText(unitString, imageWidth - 2, imageHeight * 0.55);
      }

      var altValueText = altValue.toFixed(lcdDecimals);
      if (detailStringVisible) {
        altValueText = detailString + altValueText;
      }
      if (digitalFont) {
        mainCtx.font = lcdAltFont;
      } else {
        if (headerStringVisible) {
          mainCtx.font = Math.floor(imageHeight / 5) + 'px ' + stdFontName;
        } else {
          mainCtx.font = stdAltFont;
        }
      }
      mainCtx.textAlign = 'center';
      if (headerStringVisible) {
        mainCtx.fillText(altValueText, imageWidth / 2, imageHeight * 0.83);
        mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.16);
      } else {
        mainCtx.fillText(altValueText, imageWidth / 2, imageHeight * 0.8);
      }
    } else {
      if (headerStringVisible) {
        // Text value
        mainCtx.font = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName;
        mainCtx.fillText(value, imageWidth - 2, imageHeight * 0.48);

        //mainCtx.font = stdAltFont;
        mainCtx.font = Math.floor(imageHeight / 5) + 'px ' + stdFontName;
        mainCtx.textAlign = 'center';
        mainCtx.fillText(altValue, imageWidth / 2, imageHeight * 0.83);
        mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.17);
      } else {
        // Text value
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
        mainCtx.fillText(value, imageWidth - 2, imageHeight * 0.38);

        mainCtx.font = stdAltFont;
        mainCtx.textAlign = 'center';
        mainCtx.fillText(altValue, imageWidth / 2, imageHeight * 0.8);
      }
    }
    mainCtx.restore();
  };

  // **************   Initialization  ********************
  var init = function() {
    initialized = true;

    // Create lcd background if selected in background buffer (backgroundBuffer)
    lcdBuffer = createLcdBackgroundImage(width, height, lcdColor);
  };

  // **************   Public methods  ********************
  this.setValue = function(newValue) {
    if (value !== newValue) {
      if (linkAltValue) {
        altValue = value;
      }
      value = newValue;
      this.repaint();
    }
    return this;
  };

  this.setAltValue = function(altValueNew) {
    if (altValue !== altValueNew) {
      altValue = altValueNew;
      this.repaint();
    }
    return this;
  };

  this.setLcdColor = function(newLcdColor) {
    lcdColor = newLcdColor;
    init();
    this.repaint();
    return this;
  };

  this.repaint = function() {
    if (!initialized) {
      init();
    }

    //mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    // Draw lcd background
    mainCtx.drawImage(lcdBuffer, 0, 0);

    // Draw lcd text
    drawLcdText(value);
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default displayMulti;
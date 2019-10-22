
import createLcdBackgroundImage from "./createLcdBackgroundImage";
import {
roundedRectangle, 
createBuffer, 
getColorValues, 
hsbToRgb, 
rgbToHsb, 
requestAnimFrame, 
getCanvasContext,
lcdFontName,
stdFontName,
} from "./tools";

import {
  backgroundColor as BackgroundColor,
  lcdColor as LcdColor,
  color as ColorDef,
  ledColor as LedColor,
  gaugeType as GaugeType,
  orientation as Orientation,
  knobType as KnobType,
  knobStyle as KnobStyle,
  frameDesign as FrameDesign,
  pointerType as PointerType,
  foregroundType as ForegroundType,
  labelNumberFormat as LabelNumberFormat,
  tickLabelOrientation as TickLabelOrientation,
  trendState as TrendState,
  } from "./definitions";

var DisplaySingle = function(canvas, parameters) {
  parameters = parameters || {};
  var width = (undefined === parameters.width ? 0 : parameters.width),
    height = (undefined === parameters.height ? 0 : parameters.height),
    lcdColor = (undefined === parameters.lcdColor ? LcdColor.STANDARD : parameters.lcdColor),
    lcdDecimals = (undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals),
    unitString = (undefined === parameters.unitString ? '' : parameters.unitString),
    unitStringVisible = (undefined === parameters.unitStringVisible ? false : parameters.unitStringVisible),
    headerString = (undefined === parameters.headerString ? '' : parameters.headerString),
    headerStringVisible = (undefined === parameters.headerStringVisible ? false : parameters.headerStringVisible),
    digitalFont = (undefined === parameters.digitalFont ? false : parameters.digitalFont),
    valuesNumeric = (undefined === parameters.valuesNumeric ? true : parameters.valuesNumeric),
    value = (undefined === parameters.value ? 0 : parameters.value),
    alwaysScroll = (undefined === parameters.alwaysScroll ? false : parameters.alwaysScroll),
    autoScroll = (undefined === parameters.autoScroll ? false : parameters.autoScroll),
    section = (undefined === parameters.section ? null : parameters.section);

  var scrolling = false;
  var scrollX = 0;
  var scrollTimer;
  var repainting = false;

  var self = this;

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
  var textWidth = 0;

  var fontHeight = Math.floor(imageHeight / 1.5);
  var stdFont = fontHeight + 'px ' + stdFontName;
  var lcdFont = fontHeight + 'px ' + lcdFontName;

  var initialized = false;

  // **************   Buffer creation  ********************
  // Buffer for the lcd
  var lcdBuffer;
  var sectionBuffer = [];
  var sectionForegroundColor = [];

  // **************   Image creation  ********************
  var drawLcdText = function(value, color) {
    mainCtx.save();
    mainCtx.textAlign = 'right';
    //mainCtx.textBaseline = 'top';
    mainCtx.strokeStyle = color;
    mainCtx.fillStyle = color;

    mainCtx.beginPath();
    mainCtx.rect(2, 0, imageWidth - 4, imageHeight);
    mainCtx.closePath();
    mainCtx.clip();

    if ((lcdColor === LcdColor.STANDARD || lcdColor === LcdColor.STANDARD_GREEN) &&
      section === null) {
      mainCtx.shadowColor = 'gray';
      mainCtx.shadowOffsetX = imageHeight * 0.035;
      mainCtx.shadowOffsetY = imageHeight * 0.035;
      mainCtx.shadowBlur = imageHeight * 0.055;
    }

    mainCtx.font = digitalFont ? lcdFont : stdFont;

    if (valuesNumeric) {
      // Numeric value
      var unitWidth = 0;
      textWidth = 0;
      if (unitStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
        unitWidth = mainCtx.measureText(unitString).width;
      }
      mainCtx.font = digitalFont ? lcdFont : stdFont;
      var lcdText = value.toFixed(lcdDecimals);
      textWidth = mainCtx.measureText(lcdText).width;
      var vPos = 0.38;
      if (headerStringVisible) {
        vPos = 0.52;
      }

      mainCtx.fillText(lcdText, imageWidth - unitWidth - 4 - scrollX, imageHeight * 0.5 + fontHeight * vPos);

      if (unitStringVisible) {
        mainCtx.font = Math.floor(imageHeight / 2.5) + 'px ' + stdFontName;
        mainCtx.fillText(unitString, imageWidth - 2 - scrollX, imageHeight * 0.5 + fontHeight * vPos);
      }
      if (headerStringVisible) {
        mainCtx.textAlign = 'center';
        mainCtx.font = Math.floor(imageHeight / 3.5) + 'px ' + stdFontName;
        mainCtx.fillText(headerString, imageWidth / 2, imageHeight * 0.3);
      }
    } else {
      // Text value
      textWidth = mainCtx.measureText(value).width;
      if (alwaysScroll || (autoScroll && textWidth > imageWidth - 4)) {
        if (!scrolling) {
          if (textWidth > imageWidth * 0.8) {
            scrollX = imageWidth - textWidth - imageWidth * 0.2; // leave 20% blank leading space to give time to read start of message
          } else {
            scrollX = 0;
          }
          scrolling = true;
          clearTimeout(scrollTimer); // kill any pending animate
          scrollTimer = setTimeout(animate, 200);
        }
      } else if (autoScroll && textWidth <= imageWidth - 4) {
        scrollX = 0;
        scrolling = false;
      }
      mainCtx.fillText(value, imageWidth - 2 - scrollX, imageHeight * 0.5 + fontHeight * 0.38);
    }
    mainCtx.restore();
  };

  var createLcdSectionImage = function(width, height, color, lcdColor) {
    var lcdSectionBuffer = createBuffer(width, height);
    var lcdCtx = lcdSectionBuffer.getContext('2d');

    lcdCtx.save();
    var xB = 0;
    var yB = 0;
    var wB = width;
    var hB = height;
    var rB = Math.min(width, height) * 0.095;

    var lcdBackground = lcdCtx.createLinearGradient(0, yB, 0, yB + hB);

    lcdBackground.addColorStop(0, '#4c4c4c');
    lcdBackground.addColorStop(0.08, '#666666');
    lcdBackground.addColorStop(0.92, '#666666');
    lcdBackground.addColorStop(1, '#e6e6e6');
    lcdCtx.fillStyle = lcdBackground;

    roundedRectangle(lcdCtx, xB, yB, wB, hB, rB);

    lcdCtx.fill();
    lcdCtx.restore();

    lcdCtx.save();

    var rgb = getColorValues(color);
    var hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);

    var rgbStart = getColorValues(lcdColor.gradientStartColor);
    var hsbStart = rgbToHsb(rgbStart[0], rgbStart[1], rgbStart[2]);
    var rgbFraction1 = getColorValues(lcdColor.gradientFraction1Color);
    var hsbFraction1 = rgbToHsb(rgbFraction1[0], rgbFraction1[1], rgbFraction1[2]);
    var rgbFraction2 = getColorValues(lcdColor.gradientFraction2Color);
    var hsbFraction2 = rgbToHsb(rgbFraction2[0], rgbFraction2[1], rgbFraction2[2]);
    var rgbFraction3 = getColorValues(lcdColor.gradientFraction3Color);
    var hsbFraction3 = rgbToHsb(rgbFraction3[0], rgbFraction3[1], rgbFraction3[2]);
    var rgbStop = getColorValues(lcdColor.gradientStopColor);
    var hsbStop = rgbToHsb(rgbStop[0], rgbStop[1], rgbStop[2]);

    var startColor = hsbToRgb(hsb[0], hsb[1], hsbStart[2] - 0.31);
    var fraction1Color = hsbToRgb(hsb[0], hsb[1], hsbFraction1[2] - 0.31);
    var fraction2Color = hsbToRgb(hsb[0], hsb[1], hsbFraction2[2] - 0.31);
    var fraction3Color = hsbToRgb(hsb[0], hsb[1], hsbFraction3[2] - 0.31);
    var stopColor = hsbToRgb(hsb[0], hsb[1], hsbStop[2] - 0.31);

    var xF = 1;
    var yF = 1;
    var wF = width - 2;
    var hF = height - 2;
    var rF = rB - 1;
    var lcdForeground = lcdCtx.createLinearGradient(0, yF, 0, yF + hF);
    lcdForeground.addColorStop(0, 'rgb(' + startColor[0] + ', ' + startColor[1] + ', ' + startColor[2] + ')');
    lcdForeground.addColorStop(0.03, 'rgb(' + fraction1Color[0] + ',' + fraction1Color[1] + ',' + fraction1Color[2] + ')');
    lcdForeground.addColorStop(0.49, 'rgb(' + fraction2Color[0] + ',' + fraction2Color[1] + ',' + fraction2Color[2] + ')');
    lcdForeground.addColorStop(0.5, 'rgb(' + fraction3Color[0] + ',' + fraction3Color[1] + ',' + fraction3Color[2] + ')');
    lcdForeground.addColorStop(1, 'rgb(' + stopColor[0] + ',' + stopColor[1] + ',' + stopColor[2] + ')');
    lcdCtx.fillStyle = lcdForeground;

    roundedRectangle(lcdCtx, xF, yF, wF, hF, rF);

    lcdCtx.fill();
    lcdCtx.restore();

    return lcdSectionBuffer;
  };

  var createSectionForegroundColor = function(sectionColor) {
    var rgbSection = getColorValues(sectionColor);
    var hsbSection = rgbToHsb(rgbSection[0], rgbSection[1], rgbSection[2]);
    var sectionForegroundRgb = hsbToRgb(hsbSection[0], 0.57, 0.83);
    return 'rgb(' + sectionForegroundRgb[0] + ', ' + sectionForegroundRgb[1] + ', ' + sectionForegroundRgb[2] + ')';
  };

  var animate = function() {
    if (scrolling) {
      if (scrollX > imageWidth) {
        scrollX = -textWidth;
      }
      scrollX += 2;
      scrollTimer = setTimeout(animate, 50);
    } else {
      scrollX = 0;
    }
    if (!repainting) {
      repainting = true;
      requestAnimFrame(self.repaint);
    }
  };

  // **************   Initialization  ********************
  var init = function() {
    var sectionIndex;
    initialized = true;

    // Create lcd background if selected in background buffer (backgroundBuffer)
    lcdBuffer = createLcdBackgroundImage(width, height, lcdColor);

    if (null !== section && 0 < section.length) {
      for (sectionIndex = 0; sectionIndex < section.length; sectionIndex++) {
        sectionBuffer[sectionIndex] = createLcdSectionImage(width, height, section[sectionIndex].color, lcdColor);
        sectionForegroundColor[sectionIndex] = createSectionForegroundColor(section[sectionIndex].color);
      }
    }

  };

  // **************   Public methods  ********************
  this.setValue = function(newValue) {
    if (value !== newValue) {
      value = newValue;
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

  this.setSection = function(newSection) {
    section = newSection;
    init({
      background: true,
      foreground: true
    });
    this.repaint();
    return this;
  };

  this.setScrolling = function(scroll) {
    if (scroll) {
      if (scrolling) {
        return;
      } else {
        scrolling = scroll;
        animate();
      }
    } else { //disable scrolling
      scrolling = scroll;
    }
    return this;
  };

  this.repaint = function() {
    if (!initialized) {
      init();
    }

    //mainCtx.save();
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    var lcdBackgroundBuffer = lcdBuffer;
    var lcdTextColor = lcdColor.textColor;
    var sectionIndex;
    // Draw sections
    if (null !== section && 0 < section.length) {
      for (sectionIndex = 0; sectionIndex < section.length; sectionIndex++) {
        if (value >= section[sectionIndex].start && value <= section[sectionIndex].stop) {
          lcdBackgroundBuffer = sectionBuffer[sectionIndex];
          lcdTextColor = sectionForegroundColor[sectionIndex];
          break;
        }
      }
    }

    // Draw lcd background
    mainCtx.drawImage(lcdBackgroundBuffer, 0, 0);

    // Draw lcd text
    drawLcdText(value, lcdTextColor);

    repainting = false;
  };

  // Visualize the component
  this.repaint();

  return this;
};

export default DisplaySingle;


var BackgroundColorDef;
(function() {
  BackgroundColorDef = function(gradientStart, gradientFraction, gradientStop, labelColor, symbolColor, name) {
    this.gradientStart = gradientStart;
    this.gradientFraction = gradientFraction;
    this.gradientStop = gradientStop;
    this.labelColor = labelColor;
    this.symbolColor = symbolColor;
    this.name = name;
  };
}());
export {BackgroundColorDef};

var LcdColorDef;
(function() {
  LcdColorDef = function(gradientStartColor, gradientFraction1Color, gradientFraction2Color, gradientFraction3Color, gradientStopColor, textColor) {
    this.gradientStartColor = gradientStartColor;
    this.gradientFraction1Color = gradientFraction1Color;
    this.gradientFraction2Color = gradientFraction2Color;
    this.gradientFraction3Color = gradientFraction3Color;
    this.gradientStopColor = gradientStopColor;
    this.textColor = textColor;
  };
}());
export {LcdColorDef};

var ColorDef;
(function() {
  ColorDef = function(veryDark, dark, medium, light, lighter, veryLight) {
    this.veryDark = veryDark;
    this.dark = dark;
    this.medium = medium;
    this.light = light;
    this.lighter = lighter;
    this.veryLight = veryLight;
  };
}());
export {ColorDef};

var LedColorDef;
(function() {
  LedColorDef = function(innerColor1_ON, innerColor2_ON, outerColor_ON, coronaColor, innerColor1_OFF, innerColor2_OFF, outerColor_OFF) {
    this.innerColor1_ON = innerColor1_ON;
    this.innerColor2_ON = innerColor2_ON;
    this.outerColor_ON = outerColor_ON;
    this.coronaColor = coronaColor;
    this.innerColor1_OFF = innerColor1_OFF;
    this.innerColor2_OFF = innerColor2_OFF;
    this.outerColor_OFF = outerColor_OFF;
  };
}());
export {LedColorDef};

var GaugeTypeDef;
(function() {
  GaugeTypeDef = function(type) {
    this.type = type;
  };
}());
export {GaugeTypeDef};

var OrientationDef;
(function() {
  OrientationDef = function(type) {
    this.type = type;
  };
}());
export {OrientationDef};

var KnobTypeDef;
(function() {
  KnobTypeDef = function(type) {
    this.type = type;
  };
}());
export {KnobTypeDef};

var KnobStyleDef;
(function() {
  KnobStyleDef = function(style) {
    this.style = style;
  };
}());
export {KnobStyleDef};

var FrameDesignDef;
(function() {
  FrameDesignDef = function(design) {
    this.design = design;
  };
}());
export {FrameDesignDef};

var PointerTypeDef;
(function() {
  PointerTypeDef = function(type) {
    this.type = type;
  };
}());
export {PointerTypeDef};

var ForegroundTypeDef;
(function() {
  ForegroundTypeDef = function(type) {
    this.type = type;
  };
}());
export {ForegroundTypeDef};

var LabelNumberFormatDef;
(function() {
  LabelNumberFormatDef = function(format) {
    this.format = format;
  };
}());
export {LabelNumberFormatDef};

var TickLabelOrientationDef;
(function() {
  TickLabelOrientationDef = function(type) {
    this.type = type;
  };
}());
export {TickLabelOrientationDef};

var TrendStateDef;
(function() {
  TrendStateDef = function(state) {
    this.state = state;
  };
}());
export {TrendStateDef};

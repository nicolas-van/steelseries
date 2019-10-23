let BackgroundColorDef;
(function() {
  BackgroundColorDef = function(
      gradientStart,
      gradientFraction,
      gradientStop,
      labelColor,
      symbolColor,
      name
  ) {
    this.gradientStart = gradientStart;
    this.gradientFraction = gradientFraction;
    this.gradientStop = gradientStop;
    this.labelColor = labelColor;
    this.symbolColor = symbolColor;
    this.name = name;
  };
})();
export {BackgroundColorDef};

let LcdColorDef;
(function() {
  LcdColorDef = function(
      gradientStartColor,
      gradientFraction1Color,
      gradientFraction2Color,
      gradientFraction3Color,
      gradientStopColor,
      textColor
  ) {
    this.gradientStartColor = gradientStartColor;
    this.gradientFraction1Color = gradientFraction1Color;
    this.gradientFraction2Color = gradientFraction2Color;
    this.gradientFraction3Color = gradientFraction3Color;
    this.gradientStopColor = gradientStopColor;
    this.textColor = textColor;
  };
})();
export {LcdColorDef};

let ColorDef;
(function() {
  ColorDef = function(veryDark, dark, medium, light, lighter, veryLight) {
    this.veryDark = veryDark;
    this.dark = dark;
    this.medium = medium;
    this.light = light;
    this.lighter = lighter;
    this.veryLight = veryLight;
  };
})();
export {ColorDef};

let LedColorDef;
(function() {
  LedColorDef = function(
      innerColor1_ON,
      innerColor2_ON,
      outerColor_ON,
      coronaColor,
      innerColor1_OFF,
      innerColor2_OFF,
      outerColor_OFF
  ) {
    this.innerColor1_ON = innerColor1_ON;
    this.innerColor2_ON = innerColor2_ON;
    this.outerColor_ON = outerColor_ON;
    this.coronaColor = coronaColor;
    this.innerColor1_OFF = innerColor1_OFF;
    this.innerColor2_OFF = innerColor2_OFF;
    this.outerColor_OFF = outerColor_OFF;
  };
})();
export {LedColorDef};

let GaugeTypeDef;
(function() {
  GaugeTypeDef = function(type) {
    this.type = type;
  };
})();
export {GaugeTypeDef};

let OrientationDef;
(function() {
  OrientationDef = function(type) {
    this.type = type;
  };
})();
export {OrientationDef};

let KnobTypeDef;
(function() {
  KnobTypeDef = function(type) {
    this.type = type;
  };
})();
export {KnobTypeDef};

let KnobStyleDef;
(function() {
  KnobStyleDef = function(style) {
    this.style = style;
  };
})();
export {KnobStyleDef};

let FrameDesignDef;
(function() {
  FrameDesignDef = function(design) {
    this.design = design;
  };
})();
export {FrameDesignDef};

let PointerTypeDef;
(function() {
  PointerTypeDef = function(type) {
    this.type = type;
  };
})();
export {PointerTypeDef};

let ForegroundTypeDef;
(function() {
  ForegroundTypeDef = function(type) {
    this.type = type;
  };
})();
export {ForegroundTypeDef};

let LabelNumberFormatDef;
(function() {
  LabelNumberFormatDef = function(format) {
    this.format = format;
  };
})();
export {LabelNumberFormatDef};

let TickLabelOrientationDef;
(function() {
  TickLabelOrientationDef = function(type) {
    this.type = type;
  };
})();
export {TickLabelOrientationDef};

let TrendStateDef;
(function() {
  TrendStateDef = function(state) {
    this.state = state;
  };
})();
export {TrendStateDef};

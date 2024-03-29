# Changelog

## 2.0

* Complete rewrite of the API to use web components.

## 1.0

* Re-packaging of the library for NPM

## 0.X

v0.14.17
> RadialVertical
  * Added missing methods: setMinVal getMinVal setMaxVal getMaxVal setMinMeasuredValue setMaxMeasuredValue
> Radial, RadialBargraph, RadialVertical, Linear, LinearBargraph
  * Added some range checking on re-scale for: value, minMeasuredValue, maxMeasuredValue, threshold

v0.14.16
> Added a workaround for bug in Chrome browser radialGradients

v0.14.15
> Radial
  * Fixed the 'non-scaling' of the scale numbers - Issue #17

v0.14.14
> Altimeter
  * Added optional title and unit strings, and corresponding set methods.

v0.14.13
> windDirection
  * Fixed bug in .setValueAnimatedAverage() that was overwriting the latest value.
> Fixed 'this' error in setAlpha()

v0.14.12
> DisplayMulti
  * Fixed alternate value updates via .setAltValue()

v0.14.11
> Linear gauges background
  * Further improvements to appeance

v0.14.10
> Linear Gauges background
  * Fixed a minor bug in the inner shadow drawing

v0.14.9
> RadialBargraph & LinearBargraph
  * Fixed gradient drawing when gauge min value <> 0

v0.14.8
> Clock
  * Clock.setSecond() method was broken, now fixed.
  * Fixed time-zone offset handling.

v0.14.7
> Added an optional callback function as a second parameter to all value animation functions .setXxxAnimated(value, callback)
  The callback will be executed on completion on the gauge value animation.

v0.14.6
> Minor code tidy, no functional changes
> Added source map for minified version

v0.14.5
> All gauges will now accept the canvas parameter as both an ID string as before, and now also as a canvas object.

v0.14.4
> Some white space tidying, and yet another attempt to make the WindDirection gauge show 000 for 0 rather than 360!

v0.14.3
> Updated a number of Canvas drawing routines that were using an 'illegal' .clip() call with a parameter.
  These were throwing exceptions in FireFox version 21+

v0.14.2
> Updated the minimised version
> LinearBargraph
  * Added missing fix for scale issues when the minValue is non-zero in horizontal gauges

v0.14.1
> RadialBargraph, LinearBargraph
  * Fixed scale issues when the minValue is non-zero
> Radial, RadialBargraph, RadialVertical, Linear, LinearBargraph
  * Fixed default threshold value to be mid-scale when minValue is non-zero

v0.14.0
> Radial, RadialBargraph, RadialVertical, Linear
  * Added initialisation parameter thresholdRising [def: true], to change the threshold from the default rising
    alert to a falling alert.
  * Added method setThresholdRising(bool)
> Radial, RadialBargraph
  * Added methods to set the threshold and user LED visibility: .setLedVisible(bool), .setUserLedVisible(bool)
> RadialVertical, Linear, LinearBargraph
 * Added method to set the threshold LED visibility: .setLedVisible(bool)

v0.13.0
> Radial, RadialBargraph
  * Added an additional "user" LED...
    Initialisation parameters: userLedColor, userLedVisible [def: false]
    Additional methods: .setUserLedColor(), .toggleUserLed(), .setUserLedOnOff(), .blinkUserLed()
> RadialBargraph
  * Fixed trend indicator display bug
> Radial, RadialBargraph, RadialVertical, Level, Compass, WindDirection,
> Horizon, Led, Clock, StopWatch, Altimeter
  * Removed default 'size' value, now if no 'size' value is passed, the gauges take their size from the canvas. This
    makes it easy to specify the gauge size from the HTML or CSS. Takes: size = min(width, height)
> Linear, LinearBargraph, DisplaySingle, DisplayMulti,
> TrafficLight, Lightbulb
  * Removed default 'width' & 'height', if no values are passed, the gauges take these values from the canvas. This
    makes it easy to specify the gauge size from the HTML or CSS.
> Battery
  * Removed default 'size' value, now if no 'size' value is passed, the gauge takes its size from the canvas. This
    makes it easy to specify the gauge size from the HTML or CSS. Takes: size = canvas.width
> Odometer
  * Removed default 'height' value, now if no 'height' value is passed, the gauge takes its height from the canvas. This
    makes it easy to specify the gauge size from the HTML or CSS.
> WindDirection, Compass
  * Added degreeScaleHalf:true|[false] parameter, this changes the gauge from using 0 -> 360 to -180 -> +180,
    useful for apparent wind.
  * Added pointSymbolsVisible:[true]|false parameter, useful for apparent wind, points must be hidden to show negative
    degree values when using degreeScaleHalf
> DisplaySingle, DisplayMulti
  * Added headerString:'text' and headerStringVisible:true|[false] parameters, puts some static header text on
    the display panel above the value.
> DisplayMulti
  * Added detailString:'text' and detailStringVisible:true|[false] parameters, adds a prefix string to the 'oldValue'
  * Added linkAltValue:[true]|false parameter, optionally unlinks the 'altValue' so it can be set independently
  * Added altValue:<value> parameter and setAltValue() method to set the alternative (minor) value when linkAltValue = false
> Level, Compass
  * Added rotateFace:true|[false] parameter, when set the indicator is fixed and the dial face rotates.
> VerticalRadial
  * Added steelseries.Orientation.EAST option
> Tween
  * fixed bug in .playing()

v0.12.1
> Radial, RadialBargraph, RadialVertical, Linear, LinearBargraph, WindDirection
  * Added initialisation parameter 'fullScaleDeflectionTime' default 2.5 seconds
  * Change deflection time to be a proportion of fullScaleDeflectionTime, with a minimum value of fullScaleDeflectionTime/5
> WindDirection
  * Fixed cut'n'paste error in setValueAnimatedAverage to affected value=360

v0.12.0
> Linear & LinearBargraph
  * Fixed bug that stopped min/max/threshold indicators displaying correctly on gauges with
    scales that did not have a minimum value of zero.
> All Gauges
  * Added ability for all 'set' methods to be chained. So for example you can now use code like...
    gauge.setMinValue(5).setMaxValue(25).setValue(10);

v0.11.15
> * Added playAlarm() to all setValueAnimated() methods where it was missing.

v0.11.14
> * Added parseFloat value checks to set() and setAnimated() methods

v0.11.13
> DisplaySingle
  * Added configuation parameter alwaysScroll [false]|true
> WindDirection
  * Fixed bug in changing pointer types that did not redraw the knob if required.

v0.11.12
> General
  * Removed all remaining 'shadow' drawing code, now relying on native browser capabilities.

v0.11.11
> Radial & RadialVertical
  * Simplified the pointer shadow drawing - note shadows do not display correctly in the
    Chrome browser because of a bug http://code.google.com/p/chromium/issues/detail?id=90001

v0.11.10
> General
  * Changed Conical gradient to use Gerrits raster scan rather than line rotation,
    changed the .fill() method to .fillCircle() and added .fillRect()
  * Some general typo fixes and minor code restructuring

v0.11.9
> General
  * Added requestAnimationFrame processing to setValueAnimted() in:
    Radial, RadialBargrahp, RadialVertical, Linear, LinearBargraph, DisplaySingle,
    Level, Compass, WindDirection, Level, Horizon, and Odometer.

v0.11.8
> General
  * Fixed drawRadialForegroundImage() image caching, which treated radialBargraph gauge
    types as different in error. Fixed the cacheKey used.

v0.11.7
> Radial
  * Added .setFractionalScaleDecimals() and .setLabelNumberFormat()
> RadialBargraph
  * Added .setFractionalScaleDecimals(), .setLabelNumberFormat() and .setLcdDecimals()

v0.11.6
> Radial
  * Fixed setValueAnimated() whereby it did not stop a tween already playing

v0.11.5
> WindDirection
  * Fixed 360 degree value handling (sort-of!)
> General
  * Added lots of missing buffer resets to most gauges

v0.11.4
> General
  * More shadow tweaking - the Canvas shadow really is a bit too transparent!

v0.11.3
> Radial
  * added check for 'knob' parameter in drawRadialForegroundImage()

v0.11.2
> Radial
  * Fixed Odometer being reinitialised every time the background was redrawn
  * Fixed background changes drawing LCD background when Odometer visisble
  * Disabled pointer shadow blurring, it was causing performance issues in some browsers
> Odometer
  * Added setValueAnimated() method
> RadialBargraph
  * Fixed issue with LED halo still displaying when LED was off
> General
  * Added full caching to: trendIndicator, MaxMinIndicators, LCDbackground, LEDimage,
    LinearForeground, LinearBackground, LinearFrame,
    RadialForeground, RadialBackground, RadialFrame, and RadialPointers
  * Stopped some variable leakage to the global scope
  * Some code styling changes and fixes for minor syntax niggles

v0.11.1
> WindDirection
  * Added 'useColorLabels' initialisation parameter

v0.11.0
> Odometer
  * Added new gauge odometer type
> Radial
  * Added optional odometer in place of LCD display.
    New initialisation parameters:
    - useOdometer: use an odometer instead of an LCD, still obeys LCDvisible. Default=false
    - odometerParams: pass a set of parameters in an object to over-ride the defaults. The height parameter will be ignored. Default={}
    - odometerUseValue: if true display the current gauge 'value' in the odometer, otherwise the odometer
      value is set independently. Default=false
    New methods:
    - .setOdoValue()
    - .getOdoValue()

v0.10.2
> WindDirection
  * Added setLcdTitleStrings() method

v0.10.1a
> Linear
  * Fixes stupid or/and error on gaugeType checking!

v0.10.1
> Linear
  * Added range check to gaugeType, forcing default = TYPE1 if anything other than TYPE1 or TYPE2 is supplied
    as a parameter.
  * Change frame width scaling calculations to use a ratio of the diagonal length or min of width/height depending
    on which is the smaller
  * Fixed error in foreground scaling

v0.10.0
> Linear
  * Added gaugeType initialisation parameter - switches to Linear a 'thermometer' type gauge
  * Altered scaling factors of Linear and LinearBargraph, frame width now proportional to gauge size

v0.9.17
> Radial/RadialBargraph
  * Fixed radial sector/area drawing instructions so they work with Chrome Dev build 19
> General Changes
  * Change background visible logic so that the LCD background display is controlled solely by lcdVisible parameter.

v0.9.16
> Radial
  * Added range checking to section/area drawing code
  * Added initialisation parameter 'trendColors', takes an array of 3x LED colors for Up/Steady/Down
    Default: [steelseries.LedColor.RED_LED, steelseries.LedColor.GREEN_LED, steelseries.LedColor.CYAN_LED]
> RadialBargraph
  * Added TrendIndicator as per Radial implementation
> WindDirection
  * Added range checking to section/area drawing code
> General Changes
  * Added initialisation parameters foregroundVisible','backgroundVisible','foregroundVisible' to all gauge components
  * Extracted the digital font name to a variable at the top of the script to make it easier to
    change in the future.

v0.9.15
> Radial/RadialBargraph/DisplaySingle/WindDirection
  * Changed LCD font positioning code to make appearance consistent across browsers
    Tested on Chrome 16, IE9, FF 9

>v0.9.14
> Radial
  * Fixed missing repaint() calls on setMaxValue/setMinValue setTitleString/setUnitString public methods

v0.9.13
> Radial
  * Changed TrendIndicator 'glow' as the canvas 'shadow' effect did not really work well

v0.9.12
> Linear/LinearBargraph
  * Added missing darker value track for the TURNED background
  * Fixed up misalignment of bargraph track backgrounds
  * Changed so zero value lights first LED to be consistent with RadialBargraphs

v0.9.11
> Radial
  * Fixed misalignment of threshold indicator
> RadialVertical
  * Fixed min/max indicators not displaying in correct place in orientation:North, and
    not displaying at all in orientation:West
> TrafficLight
  * Fixed typo bug that caused component to not work correct in InternetExplorer
> General Changes
  * Added new LCD colours AMBER and LIGHTBLUE

v0.9.10
> General Changes
  * Added pointer TYPE16 - the same as Gerrits stopwatch pointer,
    and TYPE15 without the crescent - as it was very easy to do!
  * Added 'glow' to the trend indicator

v0.9.9
> General Changes
  * Added TURNED background pattern to Radial and Linear gauges
  * Added TYPE15 crescent pointer based on stopwatch pointer
  * Added shadow blurring to all pointers

v0.9.8b
> General Changes
  * Fixed bug in title/unit centring on Radial gauges

v0.9.8a
> General Changes
  * Fixed bug introduced into radialVertical
  * Minor tweak to the TrenIndicator

v0.9.8
> Radial
  * Tweaked the trend indicator, switched segments from dark colour to gray background when 'off'
  * Tweaked the conicalGradient frames to smooth the outer non anti-aliased edge

> General Changes
  * Changed conicalGradient() from using line sections to arc segments so it scales to very large/small gauges better

v0.9.7
> Radial
  * Added optional trend indicator
    Initialisation param: trendVisible
    Methods: setTrendVisible(bool), setTrend(state)
    States: steelseries.TrendState.UP|STEADY|DOWN|OFF

> RadialBargraph
  * Fixed the LED track backround, it was being drawn at a fixed size, it now scales with the gauge

> WindDirection
  * Fixed bug in some of the redraw routines that caused the frame to be dropped in some circumstances

> General Changes
  * Changed drawRadialForeground() to clear the buffer before drawing as the semi-transparent foregrounds
    added together if re-drawn.

v0.9.6
> RadialBargraph
  * Stopped setMaxValue() from redrawing the foreground buffer

v0.9.5
> WindDirection
  * LCD panels slightly reduced in size

> General Changes
  * Brushed Metal texture routine is now 75% faster

v0.9.4
> Radial/RadialBargraph
  * Tweaks to LCD text positioning

> General Changes
  * Added BRUSHED_METAL and BRUSHED_STAINLESS background colours

v0.9.3
> RadialVertical
  * Changed to use the standard Radial drawRadialPointer() function rather than its own
    custom version

> Radial/RadialBargraph
  * Reduced height of LCD panel slightly, and moved panel a little lower on Radial gauges

> Linear
  * Fixed error in frame radius for the 'Metal' frames
  * Added Stainless background, and made bar track less transparent on 'material' backgrounds

> WindDirection
  * Changed vale ranges from 0-359 to 0-360 to allow for software using 0 for 'calm' and '360'
    for North.

v0.9.2
> General Changes
  * Added STAINLESS background colour to Radial gauges (not linear yet)

v0.9.1
> General Changes
  * Fixed minor drawing error of pointer type 4
  * Added pointer type14
  * Optimised conicalGradient to calculate a step size relevant to gauge size
  * Code size reduction exercise continues

v0.9.0
> General Changes
  * Added section handling to DisplaySingle
  * Added a demo html page to show the new feature

v0.8.9
> General Changes
  * Added TrafficLight component and LightBulb component to the lib.
  * Also added two html demo pages for the two new components to the repo


-------------------------
v0.8.8
> General Changes
  * Added tickLabelOrientation to Radial and RadialBargraph initialisation parameters. Accepts
    steelseries.TickLabelOrientation.NORMAL|TANGENT|HORIZONTAL.
  * Changed default tickLabelOrientation for TYPE1 Radial gauges to TANGENT
  * Added GLOSSY_METAL frame type

> Clock
  * Changed/Fixed TZ handling, if TZ offsets = zero clock shows local time, if a TZ offset is defined
    then the clock will display UTC + offset(s)

-------------------------
v0.8.7
> General Changes
  * Added new Altimeter component

-------------------------
v0.8.6
> General Changes
  * Bug fix to GradientWrapper()
  * Bug fix to radial drawTitles() function

> Radial/LinearBargraph
  * Added gradient colouring to the value bar LEDs
  * Added the following initialisation parameters:
    - useSectionColors: bool, valueGradient: steelseries.gradientWrapper(), useValueGradient: bool
  * Added the following methods:
    - setSectionColorsActive(bool), setValueGradient(steelseries.gradientWrapper), setValueGradientActive(bool)

-------------------------
v0.8.5
> StopWatch
  * Cosmetic improvement to seconds pointer
  * Bug fix to the certain lap()/reset() combinations

-------------------------
v0.8.4
> Radial/LinearBargraph
  * Fixed a bug with section recalculation when the gauge range was changed via setMin/Max()

> General Changes
  * Added StopWatch component
    - supports start(), stop(), reset(), and lap() methods
  * Fixed a bug in drawRadialForeground() that prevented the foreground changing on some gauges

-------------------------
v0.8.3
> RadialBargraph
  * Added section parameter handling, any defined sections will colour the bargraph
  * setSection() method now functional

> LinearBargraph
  * Added section parameter handling, any defined sections will colour the bargraph
  * setSection() method now functional

> General Changes
  * Added some value checking to the commonly called setValue() type methods to avoid
    unnecessary component redraws

-------------------------
v0.8.2
> General Changes
  * Added Battery component
  * More code tidying

-------------------------
v0.8.1
> General Changes
  * Added shadow to the central knob

> Clock
  * Brand new component.
  * Setting Pointer type to 1 or 2 sets pointer style, scale, and background colour to defaults
    so if you wish to change pointer colour, or background colour, do so after setting the pointer type.

-------------------------
v0.8.0
> Radial
  * Added parameter frameVisible
  * Added parameter fractionalScaleDecimals
  * Added parameter customLayer - add watermarks to gauges
  * Added pointer shadow
  * Added LCD text shadow (STANDARD & STANDARD_GREEN only)
  * Stopped sections and areas overlapping
  * Added method setMaxMeasuredValue()
  * Added method setMinMeasuredValue()
  * Added method setTitleString()
  * Added method setUnitString()
  * Added method setMinValue()
  * Added method getMinValue()
  * Added method setMaxValue()
  * Added method getMaxValue()
  * Added method setThreshold()
  * Added method setArea()
  * Added method setSection()

> RadialBargraph
  * Added parameter frameVisible
  * Added parameter fractionalScaleDecimals
  * Added parameter customLayer - add watermarks to gauges
  * Added LCD text shadow (STANDARD & STANDARD_GREEN only)
  * Added method setMinValue()
  * Added method getMinValue()
  * Added method setMaxValue()
  * Added method getMaxValue()
  * Added method setTitleString()
  * Added method setUnitString()

> RadialVertical
  * Added parameter frameVisible
  * Added pointer shadow
  * Stopped sections and areas overlapping

> Linear
  * Added parameter frameVisible
  * Added LCD text shadow (STANDARD & STANDARD_GREEN only)
  * Moved 'units' when in vertical format
  * Added method setMaxMeasuredValue()
  * Added method setMinMeasuredValue()
  * Added method setTitleString()
  * Added method setUnitString()
  * Added method setMinValue()
  * Added method getMinValue()
  * Added method setMaxValue()
  * Added method getMaxValue()
  * Added method setThreshold()

> LinearBargraph
  * Added parameter frameVisible
  * Added LCD text shadow (STANDARD & STANDARD_GREEN only)
  * Moved 'units' when in vertical format
  * Added method setMaxMeasuredValue()
  * Added method setMinMeasuredValue()
  * Added method setTitleString()
  * Added method setUnitString()
  * Added method setMinValue()
  * Added method getMinValue()
  * Added method setMaxValue()
  * Added method getMaxValue()
  * Added method setThreshold()

> DisplaySingle
  * Added parameter autoScroll - scrolls if text too wide for display, otherwise static
  * Added LCD text shadow (STANDARD & STANDARD_GREEN only)

> DisplayMulti
  * Added LCD text shadow (STANDARD & STANDARD_GREEN only)

> Level
  * Added parameter frameVisible
  * Fixed corrupted degree and infinity symbols

> Compass
  * Added parameter frameVisible
  * Added parameter pointSymbols - localise "N","NE","E" text
  * Added parameter customLayer - add watermarks to gauges
  * Added parameter degreeScale - replace NE,SE,SW,NW with numeric degree scale
  * Added parameter roseVisible - hide the central rose, useful to display custom watermarks
  * Added pointer shadow
  * Pointer now moves the 'shortest angular distance' to a new animated value
  * Added method setPointerType()
  * Added method setPointSymbols()

> WindDirection
  * Brand new component!
  * Dual pointer/LCD gauge for displaying current and average directions on 360 degree scale

> Horizon
  * Added parameter frameVisible
  * Fixed, this component did not work correctly in version 0.7.3

> General Changes
  * Added pointer types 11, 12, and 13 to Radial (not VerticalRadial)
  * Radial/RadialVertical setting background also forces pointer refresh (for types 2 & 13 which depend on background color)
  * Removed duplicated public/private versions of repaint() functions.

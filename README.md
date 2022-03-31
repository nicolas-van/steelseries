
# Steelseries Gauges

[![Build Status](https://travis-ci.org/nicolas-van/steelseries.svg?branch=master)](https://travis-ci.org/nicolas-van/steelseries) [![npm version](https://img.shields.io/npm/v/steelseries.svg)](https://www.npmjs.com/package/steelseries) [![](https://github.com/nicolas-van/steelseries/workflows/Node%20CI/badge.svg)](https://github.com/nicolas-van/steelseries/actions) [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/steelseries) [![](https://data.jsdelivr.com/v1/package/npm/steelseries/badge)](https://www.jsdelivr.com/package/npm/steelseries)

![gauges](./gauges.gif)
      
The steelseries library is a collection of animated gauges components related to navigation.

These components are packed as web components, which means they do not necessitate knowledge in Javascript
in order to be used on web pages. Just include the following snippet in your HTML file:

```
  <script type="module" src="https://cdn.jsdelivr.net/npm/steelseries@2.0.0/dist/steelseries.bundled.min.js">&lt;/script>
```

Then select one of the compoments displayed [in the documentation](https://nicolas-van.github.io/steelseries/), adjust the parameters as you see fit and copy paste the resulting
code in your HTML. That's it, the component should now display correctly on your web page.

[See the documentation here](https://nicolas-van.github.io/steelseries/).

This project is a re-packaging of [HanSolo's SteelSeries-Canvas](https://github.com/HanSolo/SteelSeries-Canvas).

## Development

### Installation

#### Using jsdelivr

https://www.jsdelivr.com/package/npm/steelseries

#### Using npm

```bash
npm install steelseries
```

```javascript
import "steelseries"
```

### Example code

```html
<steelseries-compass value="75"></steelseries-compass>
```

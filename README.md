
# Steelseries Gauges

[![Build Status](https://travis-ci.org/nicolas-van/steelseries.svg?branch=master)](https://travis-ci.org/nicolas-van/steelseries) [![npm version](https://img.shields.io/npm/v/steelseries.svg)](https://www.npmjs.com/package/steelseries) [![](https://github.com/nicolas-van/steelseries/workflows/Node%20CI/badge.svg)](https://github.com/nicolas-van/steelseries/actions)

A collection of gauge components for JavaScript.

[See the demo here](https://nicolas-van.github.io/steelseries/).

![gauges](./gauges.gif)

This project is a re-packaging of [HanSolo's SteelSeries-Canvas](https://github.com/HanSolo/SteelSeries-Canvas).

## Installation

### Using npm

```bash
npm install steelseries
```

```javascript
import * as steelseries from "steelseries";
```

### Using a CDN

Use unpkg: https://unpkg.com/steelseries .

## Example

```html
<!DOCTYPE html>
<html>
  <body>
    <div>
      <canvas id="myCanvas"></canvas>
    </div>

    <script src="./index.js"></script>
  </body>
</html>
```

```javascript
import { Compass } from "steelseries";

const compass = new Compass(document.querySelector("#myCanvas"), {
  size: 200
});
```

## Documentation

Unfortunately there is no formal documentation :) . But you can take a look at the [Demo Website](https://nicolas-van.github.io/steelseries/) and [it's source code](https://github.com/nicolas-van/steelseries/tree/master/srcdocs).

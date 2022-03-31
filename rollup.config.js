/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/steelseries.js',
  output: {
    file: 'dist/steelseries.bundled.js',
    format: 'esm'
  },
  plugins: [
    resolve()
  ]
}

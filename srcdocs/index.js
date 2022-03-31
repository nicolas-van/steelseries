
import { generateDocumentation } from './doc-generator.js'
import '@vanillawc/wc-markdown'

window.customElements.define('steelseries-doc-altimeter', generateDocumentation('steelseries-altimeter', { value: 100 }))

window.customElements.define('steelseries-doc-battery', generateDocumentation('steelseries-battery', { value: 75 }))

window.customElements.define('steelseries-doc-clock', generateDocumentation('steelseries-clock', { isCurrentTime: true }))

window.customElements.define('steelseries-doc-compass', generateDocumentation('steelseries-compass', { value: 75 }))

window.customElements.define('steelseries-doc-display-multi', generateDocumentation('steelseries-display-multi', { value: 'text1', altValue: 'text2' }))

window.customElements.define('steelseries-doc-display-single', generateDocumentation('steelseries-display-single', { value: 'text' }))

window.customElements.define('steelseries-doc-horizon', generateDocumentation('steelseries-horizon', { roll: 10, pitch: 10 }))

window.customElements.define('steelseries-doc-led', generateDocumentation('steelseries-led', { ledOn: true, blinking: true }))

window.customElements.define('steelseries-doc-level', generateDocumentation('steelseries-level', { value: 10 }))

window.customElements.define('steelseries-doc-lightbulb', generateDocumentation('steelseries-lightbulb', { lightOn: true }))

window.customElements.define('steelseries-doc-linear', generateDocumentation('steelseries-linear', { value: 75 }))

window.customElements.define('steelseries-doc-linear-bargraph', generateDocumentation('steelseries-linear-bargraph', { value: 75 }))

window.customElements.define('steelseries-doc-odometer', generateDocumentation('steelseries-odometer', { value: 75.55 }))

window.customElements.define('steelseries-doc-radial', generateDocumentation('steelseries-radial', { value: 75, gaugeType: 'TYPE3' }))

window.customElements.define('steelseries-doc-radial-bargraph', generateDocumentation('steelseries-radial-bargraph', { value: 75, gaugeType: 'TYPE3' }))

window.customElements.define('steelseries-doc-radial-vertical', generateDocumentation('steelseries-radial-vertical', { value: 75 }))

window.customElements.define('steelseries-doc-stopwatch', generateDocumentation('steelseries-stopwatch', { running: true }))

window.customElements.define('steelseries-doc-trafficlight', generateDocumentation('steelseries-trafficlight', { redOn: true, yellowOn: true, greenOn: true }))

window.customElements.define('steelseries-doc-wind-direction', generateDocumentation('steelseries-wind-direction', { valueLatest: 25, valueAverage: 75 }))

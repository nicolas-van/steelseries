
import { generateDocumentation } from './doc-generator.js'
import '@vanillawc/wc-markdown'

window.customElements.define('steelseries-doc-altimeter', generateDocumentation('steelseries-altimeter', { value: 100 }))

window.customElements.define('steelseries-doc-battery', generateDocumentation('steelseries-battery', { value: 75 }))

window.customElements.define('steelseries-doc-clock', generateDocumentation('steelseries-clock'))

window.customElements.define('steelseries-doc-compass', generateDocumentation('steelseries-compass', { value: 75 }))

window.customElements.define('steelseries-doc-display-multi', generateDocumentation('steelseries-display-multi', { value: 'text1', altValue: 'text2' }))

window.customElements.define('steelseries-doc-display-single', generateDocumentation('steelseries-display-single', { value: 'text' }))

window.customElements.define('steelseries-doc-horizon', generateDocumentation('steelseries-horizon', { roll: 10, pitch: 10 }))

window.customElements.define('steelseries-doc-led', generateDocumentation('steelseries-led', { ledOn: true, blinking: true }))

window.customElements.define('steelseries-doc-level', generateDocumentation('steelseries-level', { value: 10 }))

window.customElements.define('steelseries-doc-lightbulb', generateDocumentation('steelseries-lightbulb', { lightOn: true }))

window.customElements.define('steelseries-doc-linear', generateDocumentation('steelseries-linear', { value: 75 }))

window.customElements.define('steelseries-doc-linear-bargraph', generateDocumentation('steelseries-linear-bargraph', { value: 75 }))

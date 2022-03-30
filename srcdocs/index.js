
import { generateDocumentation } from './doc-generator.js'
import '@vanillawc/wc-markdown'

window.customElements.define('steelseries-doc-altimeter', generateDocumentation('steelseries-altimeter', { value: 100 }))

window.customElements.define('steelseries-doc-battery', generateDocumentation('steelseries-battery', { value: 75 }))

window.customElements.define('steelseries-doc-clock', generateDocumentation('steelseries-clock'))

window.customElements.define('steelseries-doc-compass', generateDocumentation('steelseries-compass', { value: 75 }))

window.customElements.define('steelseries-doc-display-multi', generateDocumentation('steelseries-display-multi', { value: 'text1', altValue: 'text2' }))

window.customElements.define('steelseries-doc-display-single', generateDocumentation('steelseries-display-single', { value: 'text' }))

window.customElements.define('steelseries-doc-horizon', generateDocumentation('steelseries-horizon'))


import { generateDocumentation } from './doc-generator.js'
import '@vanillawc/wc-markdown'

window.customElements.define('steelseries-doc-altimeter', generateDocumentation('steelseries-altimeter'))

window.customElements.define('steelseries-doc-battery', generateDocumentation('steelseries-battery'))

window.customElements.define('steelseries-doc-clock', generateDocumentation('steelseries-clock'))

window.customElements.define('steelseries-doc-compass', generateDocumentation('steelseries-compass'))

window.customElements.define('steelseries-doc-display-multi', generateDocumentation('steelseries-display-multi'))


import { generateDocumentation } from './doc-generator.js'
import '@vanillawc/wc-markdown'

const AltimeterDoc = generateDocumentation('steelseries-altimeter')
window.customElements.define('steelseries-doc-altimeter', AltimeterDoc)

const BatteryDoc = generateDocumentation('steelseries-battery')
window.customElements.define('steelseries-doc-battery', BatteryDoc)

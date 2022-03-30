
import { generateDocumentation } from './doc-generator.js'
import '@vanillawc/wc-markdown/index.js'

const AltimeterDoc = generateDocumentation('steelseries-altimeter')
window.customElements.define('steelseries-doc-altimeter', AltimeterDoc)


import { generateDocumentation } from './doc-generator.js'

const AltimeterDoc = generateDocumentation('steelseries-altimeter')
window.customElements.define('steelseries-doc-altimeter', AltimeterDoc)

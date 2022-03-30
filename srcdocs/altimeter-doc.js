
import { LitElement, html } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import '../src/steelseries.js'
import { constructCode } from './helpers'

export class AltimeterDocElement extends LitElement {
  static get properties () {
    return {
      size: { type: Number },
      value: { type: Number },
      animated: { type: Boolean },
      frameDesign: { type: String },
      frameVisible: { type: Boolean },
      backgroundColor: { type: String },
      backgroundVisible: { type: Boolean },
      titleString: { type: String },
      unitString: { type: String },
      unitAltPos: { type: Boolean },
      knobType: { type: String },
      knobStyle: { type: String },
      lcdColor: { type: String },
      lcdVisible: { type: Boolean },
      digitalFont: { type: Boolean },
      foregroundType: { type: String },
      foregroundVisible: { type: Boolean }
    }
  }

  constructor () {
    super()
    this.size = 200
    this.value = 0
    this.frameDesign = 'METAL'
    this.frameVisible = true
    this.backgroundColor = 'DARK_GRAY'
    this.backgroundVisible = true
    this.titleString = ''
    this.unitString = ''
    this.unitAltPos = false
    this.knobType = 'METAL_KNOB'
    this.knobStyle = 'BLACK'
    this.lcdColor = 'BLACK'
    this.lcdVisible = true
    this.digitalFont = false
    this.foregroundType = 'TYPE1'
    this.foregroundVisible = true
  }

  createRenderRoot () {
    return this
  }

  render () {
    const htm = constructCode('steelseries-altimeter', this, ['value', 'size'])
    return html`
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Altimeter</h2>
          <div class="text-center">
            ${unsafeHTML(htm)}
          </div>
          <div class="card">
            <div class="card-body">
              <pre><code>${htm}</code></pre>
            </div>
          </div>
          
          <div class="accordion" id="parametersAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                  Parameters
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#parametersAccordion">
                <div class="accordion-body">
                  <div class="mb-3">
                    <label class="form-label">value</label>
                    <input type="number" class="form-control" value="${this.value}" @change=${(e) => { this.value = parseFloat(e.target.value) }}>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">size</label>
                    <input type="number" class="form-control" value="${this.size}" @change=${(e) => { this.size = parseFloat(e.target.value) }}>
                  </div>
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" ?checked="${this.backgroundVisible}" @change=${(e) => { this.backgroundVisible = e.target.checked }}>
                    <label class="form-check-label">backgroundVisible</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

window.customElements.define('steelseries-doc-altimeter', AltimeterDocElement)

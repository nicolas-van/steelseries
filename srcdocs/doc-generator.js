
import { LitElement, html } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import '../src/steelseries.js'

export function generateDocumentation (elementName) {
  const sampleElement = document.createElement(elementName)
  const properties = sampleElement.constructor.properties
  const keys = Object.keys(properties)
  const defaultValues = Object.fromEntries(keys.map((key) => {
    return [key, properties[key].defaultValue]
  }))
  return class DocGenerator extends LitElement {
    static get properties () {
      return {
        values: { state: true }
      }
    }

    constructor () {
      super()
      this.values = { ...defaultValues }
    }

    createRenderRoot () {
      return this
    }

    render () {
      const htm = (() => {
        let htm = `<${elementName}`
        for (const key of keys) {
          if (properties[key].type === Boolean) {
            if (this.values[key]) {
              htm += ` ${key}`
            }
          } else {
            if (this.values[key] !== defaultValues[key]) {
              htm += ` ${key}="${this.values[key]}"`
            }
          }
        }
        htm += `></${elementName}>`
        return htm
      })()
      return html`
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">&lt;${elementName}&gt;</h2>
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
                    <div class="row">
                      ${keys.map((key) => {
                        return html` 
                          <div class="col-md-4 mb-3">
                            ${(() => {
                              if (properties[key].objectEnum) {
                                return html`
                                  <label class="form-label">${key}</label>
                                  <select class="form-select" @change=${(e) => { this.updateValue(key, e.target.value) }}>
                                    ${Object.keys(properties[key].objectEnum).map((el) => {
                                      return html`
                                        <option value=${el} ?selected=${this.values[key] === el}>${el}</option>
                                      `
                                    })}
                                  </select>
                                `
                              } else if (properties[key].type === String) {
                                return html`
                                  <label class="form-label">${key}</label>
                                  <input type="text" class="form-control" value="${this.values[key]}" @change=${(e) => { this.updateValue(key, e.target.value) }}>
                                `
                              } else if (properties[key].type === Number) {
                                return html`
                                  <label class="form-label">${key}</label>
                                  <input type="number" class="form-control" value="${this.values[key]}" @change=${(e) => { this.updateValue(key, parseFloat(e.target.value)) }}>
                                `
                              } else if (properties[key].type === Boolean) {
                                return html`
                                  <div class="form-check">
                                    <input type="checkbox" class="form-check-input" ?checked="${this.values[key]}" @change=${(e) => { this.updateValue(key, e.target.checked) }}>
                                    <label class="form-check-label">${key}</label>
                                  </div>
                                `
                              } else {
                                throw new Error('Invalid state')
                              }
                            })()}
                          </div>
                        `
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }

    updateValue (key, value) {
      const cloned = { ...this.values }
      cloned[key] = value
      this.values = cloned
    }
  }
}


import { LitElement } from 'lit'
import { assert } from './tools'

export default class BaseElement extends LitElement {
  constructor () {
    super()
    this._properties = this.constructor.properties
    this._keys = Object.keys(this._properties).filter((k) => !this._properties[k].state)
    for (const key of this._keys) {
      assert('defaultValue' in this._properties[key])
      this[key] = this._properties[key].defaultValue
    }
  }

  buildPair (key) {
    let value = this[key]

    // for animations
    const realKey = `real_${key}`
    if (realKey in this._properties) {
      value = this[realKey]
    }

    if (this._properties[key].type === Boolean && key.startsWith('no')) {
      value = !value
      key = key.slice(2)
      key = key[0].toLowerCase() + key.slice(1)
    } else if (this._properties[key].objectEnum) {
      const possibilities = new Set(Object.keys(this._properties[key].objectEnum))
      assert(possibilities.has(value), `Unknown value ${value} for key ${key}, possible values are: ${possibilities.keys()}`)
      value = this._properties[key].objectEnum[value]
    }
    return [key, value]
  }

  updated () {
    const canvas = this.renderRoot.querySelector('canvas')
    const Constructor = this.constructor.objectConstructor
    const params = Object.fromEntries(this._keys.map((el) => this.buildPair(el)))
    new Constructor(canvas, params)
  }
}

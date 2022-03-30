
export function constructCode (elem, values, keysToAlwaysShow = []) {
  const baseElem = document.createElement(elem)
  const keys = Object.keys(baseElem.constructor.properties)
  let htm = `<${elem}`
  for (const key of keys) {
    if (baseElem[key] !== values[key] || keysToAlwaysShow.includes(key)) {
      htm += ` ${key}="${values[key]}"`
    }
  }
  htm += `></${elem}>`
  return htm
}

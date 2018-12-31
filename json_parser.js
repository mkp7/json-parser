const parsers = [parseNull, parseBool, parseNumber, parseString, parseArray, parseObject]

// return [null || data:string, remainning_string: string]
function parseString (string) {
  const exp = /^\s*"((\\(["\\\/bfnrt]|u[a-fA-F0-9]{4})|[^"\\\0-\x1F\x7F]+)*)"\s*/
  let match = exp.exec(string)
  if (match === null) return null
  return [match[1], string.slice(match[0].length)]
}

// return [null || data:number, remainning_string: string]
function parseNumber (string) {
  const exp = /^\s*(-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?)\s*/
  let match = exp.exec(string)
  if (match === null) return null
  return [parseFloat(match[1]), string.slice(match[0].length)]
}

// return [null || data:null, remainning_string: string]
function parseNull (string) {
  let match = /^\s*(null)\s*/.exec(string)
  if (match === null) return null
  return [null, string.slice(match[0].length)]
}

// return [null || data:null, remainning_string: string]
function parseBool (string) {
  let match = /^\s*(true)\s*/.exec(string)
  if (match !== null) return [true, string.slice(match[0].length)]
  match = /^\s*(false)\s*/.exec(string)
  if (match !== null) return [false, string.slice(match[0].length)]
  return null
}

// return [null || data:object, remainning_string: string]
function parseObject (string) {
  let match = /^\s*\{\s*/.exec(string)
  if (match !== null) {
    string = string.slice(match[0].length)
    if (string[0] === '}') return [[], string.slice(/^\}\s*/.exec(string)[0].length)]
    let [data, key, value] = [{}, '', parseString(string.slice(0))]
    if (value === null || !value[1] || value[1][0] !== ':') return null
    key = value[0]; value = parseValue(value[1].slice(1))
    while (value !== null && value[1] && value[1][0] === ',') {
      data[key] = value[0]
      value = parseString(value[1].slice(1))
      if (value === null || !value[1] || value[1][0] !== ':') return null
      key = value[0]; value = parseValue(value[1].slice(1))
    }
    if (value === null || !value[1] || value[1][0] !== '}') return null
    data[key] = value[0]
    return [data, value[1].slice(/^\}\s*/.exec(value[1])[0].length)]
  }
  return null
}

// return [null || data:array, remainning_string: string]
function parseArray (string) {
  let match = /^\s*\[\s*/.exec(string)
  if (match !== null) {
    string = string.slice(match[0].length)
    if (string[0] === ']') return [[], string.slice(/^\]\s*/.exec(string)[0].length)]
    let [data, value] = [[], parseValue(string)]
    while (value !== null && value[1] && value[1][0] === ',') {
      data.push(value[0])
      value = parseValue(value[1].slice(1))
    }
    if (value === null || !value[1] || value[1][0] !== ']') return null
    data.push(value[0])
    return [data, value[1].slice(/^\]\s*/.exec(value[1])[0].length)]
  }
  return null
}

// return [null || data:array, remainning_string: string]
function parseValue (string) {
  return parsers.slice(1).reduce((a, f) => (a === null ? f(string) : a), parsers[0](string))
}

// return [null || data:mapped data]
function parseJson (string) {
  let data = parseValue(string)
  return (data !== null && !data[1]) ? [true, data[0]] : [false, string]
}

module.exports = parseJson

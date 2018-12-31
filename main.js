'use strict'

const parseJson = require('./json_parser.js')

let inputString = ''

process.stdin.on('data', function (inputStdin) {
  inputString += inputStdin
})

process.stdin.on('end', function () {
  main(inputString)
})

function main (inputString) {
  let [parsed, data] = parseJson(inputString)
  if (parsed) console.log(JSON.stringify(data, null, 4))
  else console.log('invalid json')
}

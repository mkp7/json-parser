let assert = require('assert')
let fs = require("fs")
const parseJson = require("../json_parser.js")

describe('parseJson', () => {
  const passes = fs.readdirSync("./cases")
  describe('Valid JSON', () => {
    const cases = passes.filter(f => /pass\w+\.json/.test(f))
    cases.forEach(f => {
      it(`should parse ${f}`, () => {
        assert.equal(parseJson(fs.readFileSync(`./cases/${f}`, "utf8"))[0], true)
      })
    })
  })

  const fails = fs.readdirSync("./cases")
  describe('Invalid JSON', () => {
    const cases = fails.filter(f => /fail\w+\.json/.test(f))
    cases.forEach(f => {
      it(`should not parse ${f}`, () => {
        assert.equal(parseJson(fs.readFileSync(`./cases/${f}`, "utf8"))[0], false)
      })
    })
  })
})

"use strict"

const parseJson = require("./json_parser.js")

let inputString = ""

process.stdin.on("data", function(inputStdin) {
	inputString += inputStdin
})

process.stdin.on("end", function() {
	main(inputString)
})

function main(inputString) {
	console.log(parseJson(inputString))
}

"use strict"

process.stdin.resume()
process.stdin.setEncoding("utf-8")

let inputString = ""

process.stdin.on("data", function(inputStdin) {
	inputString += inputStdin
})

process.stdin.on("end", function() {
	main()
})


// function parseNextString(i, string) {

// }

// function parseNextNumber(i, string) {

// }

// function parseNextTrue(i, string) {

// }

// function parseNextFalse(i, string) {

// }

// function parseNextNull(i, string) {

// }

// function parseNextArray(i, string) {

// }

// function parseNextObject(i, string) {

// }

// whitespace checker

function main() {
	let whitespaces = [" ", "\t", "\n", "\r"]
	for (let c of inputString) {
		if (!whitespaces.some(w => w === c)) {
			process.stdout.write(c)
		}
	}
	process.stdout.write("\n")
}
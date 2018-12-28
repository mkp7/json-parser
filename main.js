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

const whitespaces = [" ", "\t", "\n", "\r"]
const pdigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

function stringParser(string) {
	if (string && string[0] !== "\"") {
		return null
	}
	let j = 1
	while (j < string.length && !(string[j-1] !== "\\" && string[j] === "\"")) {
		j++
	}

	return [string.slice(0,j+1), string.slice(j+1)]
}

function tokenParser(string) {
	let isString = stringParser(string)
	if(isString) {
		if(!isString[1]) {
			return isString[0]
		}
		return isString[0] + removeWhitespaces(isString[1])
	}

	let i = 0

	while(i < string.length && whitespaces.every(w => w !== string[i]) && string[i] !== "\"") {
		i++
	}

	if(i == string.length) {
		return string.slice(0, i)
	}

	return string.slice(0, i) + removeWhitespaces(string.slice(i))
}

function removeWhitespaces(string) {
	let i = 0
	while (i < string.length && whitespaces.some(w => w === string[i])) {
		i++
	}

	if (i == string.length) {
		return string.slice(i)
	}

	return tokenParser(string.slice(i))
}

// return [valid:bool, data:string, remainning string: string]
function parseString(string) {
	let i = 0

	if (string[i] !== "\"") {
		return [false, null, string]
	}
	i++

	if (string[i] === "\"") {
		return [true, "", string.slice(i+1)]
	}

	let j = i
	while (!(string[j] !== "\\" && string[j + 1] === "\"")) {
		j++
	}

	const data = string.slice(i, j + 1)
	j += 2

	return [true, data, string.slice(j)]
}

// return [valid:bool, data:number, remainning string: string]
function parseNumber(string) {
	let j = 0
	if (string[j] === "-") {
		j++
		if (!pdigits.some(d => d === string[j])) {
			return [false, null, string]
		}
	}

	if (string[j] === "0" && string[j + 1] === ".") {
		j += 2
		if (!pdigits.some(d => d === string[j])) {
			return [false, null, string]
		}
	}

	while (pdigits.some(d => d === string[j])) {
		j++
	}
	if (string[j] === ".") {
		j++
	}

	while (pdigits.some(d => d === string[j])) {
		j++
	}

	if (string[j] === "e" || string[j] === "E") {
		j++
		if (string[j] === "+" || string[j] === "-") {
			j++
		}

		if (!pdigits.some(d => d === string[j])) {
			return [false, null, string]
		}
	}

	while (pdigits.some(d => d === string[j])) {
		j++
	}

	if (j === 0) {
		return [false, null, string]
	}

	const data = parseFloat(string.slice(0, j))

	return [true, data, string.slice(j)]
}

// return [valid:bool, data:null, remainning string: string]
function parseNull(string) {
	if (string.length >= 4 && string.slice(0, 4) === "null") {
		return [true, null, string.slice(4)]
	}

	return [false, null, string]
}

// return [valid:bool, data:null, remainning string: string]
function parseBool(string) {
	if (string.length >= 4 && string.slice(0, 4) === "true") {
		return [true, true, string.slice(4)]
	}

	if (string.length >= 5 && string.slice(0, 5) === "false") {
		return [true, false, string.slice(5)]
	}

	return [false, null, string]
}

// return [valid:bool, data:object, remainning string: string]
function parseObject(string) {
	if (string[0] === "{") {
		let i = 1
		if(string[i] === "}") {
			return [true, {}, string.slice(i+1)]
		}

		let dataObj = {}, key = ""
		let [status, data, str] = parseString(string.slice(i))

		i = 0

		if (!status || !str || str[i] !== ":") {
			return [false, null, string]
		}
		key = data;
		[status, data, str] = parsePartialJson(str.slice(i+1))

		while (status && str && str[0] === ",") {
			dataObj[key] = data;

			[status, data, str] = parseString(str.slice(1))

			if (!status || !str || str[0] !== ":") {
				return [false, null, string]
			}
			key = data;
			[status, data, str] = parsePartialJson(str.slice(1))
		}
		dataObj[key] = data

		i = 0
		if(str[i] !== "}") {
			return [false, data, str]
		}
		i++

		return [true, dataObj, str.slice(i)]
	}

	return [false, null, string]
}
// return [valid:bool, data:array, remainning string: string]
function parseArray(string) {
	if (string && string[0] === "[") {
		let i = 1

		if(string.length >= 2 && string[i] === "]") {
			return [true, [], string.slice(i+1)]
		}

		let dataArr = []
		let [status, data, str] = parsePartialJson(string.slice(i))
		while (status && str && str[0] === ",") {
			dataArr.push(data);
			[status, data, str] = parsePartialJson(str.slice(1))
		}
		dataArr.push(data)

		i = 0
		if(str[i] !== "]") {
			return [false, data, str]
		}
		i++

		return [true, dataArr, str.slice(i)]
	}
	return [false, null, string]
}

const parsers = [parseNull, parseBool, parseNumber, parseString, parseArray, parseObject]
function parsePartialJson(string) {
	for(let p of parsers) {
		let [status, data, str] = p(string)
		if (status) {
			return [status, data, str]
		}
	}
	return [false, null, string]
}

// return [valid:bool, data:mapped data]
function parseJson(string) {
	let status, data, str
	for(let p of parsers) {
		[status, data, str] = p(string)
		if (status && !str) {
			return [true, data]
		}
	}

	return [false, string]
}

function main() {
	console.log(parseJson(tokenParser(inputString)))
}

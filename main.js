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

// function removeWhitespaces(string) {
// 	let i = 0
// 	while (whitespaces.some(w => w === string[i])) {
// 		i++
// 	}

// 	return string.slice(i)
// }

// return [valid:bool, data:string, remainning string: string]
function parseString(string) {
	let i = 0
	while (whitespaces.some(w => w === string[i])) {
		i++
	}

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

	while (whitespaces.some(w => w === string[j])) {
		j++
	}

	return [true, data, string.slice(j)]
}

// return [valid:bool, data:number, remainning string: string]
function parseNumber(string) {
	let i = 0
	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	let j = i
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

	if (j === i) {
		return [false, null, string]
	}

	const data = parseFloat(string.slice(i, j))

	while (whitespaces.some(w => w === string[j])) {
		j++
	}

	return [true, data, string.slice(j)]
}

// return [valid:bool, data:bool, remainning string: string]
function parseTrue(string) {
	let i = 0
	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	if ((string.length - i) >= 4 && string.slice(i, i + 4) === "true") {
		i += 4
		while (whitespaces.some(w => w === string[i])) {
			i++
		}

		return [true, true, string.slice(i)]
	}

	return [false, null, string]
}

// return [valid:bool, data:bool, remainning string: string]
function parseFalse(string) {
	let i = 0
	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	if ((string.length - i) >= 5 && string.slice(i, i + 5) === "false") {
		i += 5
		while (whitespaces.some(w => w === string[i])) {
			i++
		}

		return [true, false, string.slice(i)]
	}

	return [false, null, string]
}

// return [valid:bool, data:null, remainning string: string]
function parseNull(string) {
	let i = 0
	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	if ((string.length - i) >= 4 && string.slice(i, i + 4) === "null") {
		i += 4
		while (whitespaces.some(w => w === string[i])) {
			i++
		}

		return [true, null, string.slice(i)]
	}

	return [false, null, string]
}

// return [valid:bool, data:object, remainning string: string]
function parseObject(string) {
	let i = 0

	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	if (string[i] !== "{") {
		return [false, null, string]
	}
	i++

	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	if(string[i] === "}") {
		return [true, {}, string.slice(i+1)]
	}

	let dataObj = {}, key = ""
	let [status, data, str] = parseString(string.slice(i))
	
	i = 0

	while (whitespaces.some(w => w === str[i])) {
		i++
	}
	
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

	while (whitespaces.some(w => w === str[i])) {
		i++
	}

	return [true, dataObj, str.slice(i)]
}
// return [valid:bool, data:array, remainning string: string]
function parseArray(string) {
	let i = 0

	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	if (string[i] !== "[") {
		return [false, null, string]
	}
	i++

	while (whitespaces.some(w => w === string[i])) {
		i++
	}

	if(string[i] === "]") {
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

	while (whitespaces.some(w => w === str[i])) {
		i++
	}

	return [true, dataArr, str.slice(i)]
}

function parsePartialJson(string) {
	let [status, data, str] = parseNull(string)

	if (status) {
		return [status, data, str]
	}
	[status, data, str] = parseTrue(string)

	if (status) {
		return [status, data, str]
	}
	[status, data, str] = parseFalse(string)

	if (status) {
		return [status, data, str]
	}
	[status, data, str] = parseNumber(string)

	if (status) {
		return [status, data, str]
	}
	[status, data, str] = parseString(string)

	if (status) {
		return [status, data, str]
	}
	[status, data, str] = parseArray(string)

	if (status) {
		return [status, data, str]
	}
	[status, data, str] = parseObject(string)

	// if (status) {
	return [status, data, str]
	// }
}

// return [valid:bool, data:mapped data]
function parseJson(string) {
	let [status, data, str] = parseNull(string)

	if (status && !str) {
		return [true, data]
	}
	[status, data, str] = parseTrue(string)

	if (status && !str) {
		return [true, data]
	}
	[status, data, str] = parseFalse(string)

	if (status && !str) {
		return [true, data]
	}
	[status, data, str] = parseNumber(string)

	if (status && !str) {
		return [true, data]
	}
	[status, data, str] = parseString(string)

	if (status && !str) {
		return [true, data]
	}
	[status, data, str] = parseArray(string)

	if (status && !str) {
		return [true, data]
	}
	[status, data, str] = parseObject(string)

	if (status && !str) {
		return [true, data]
	}

	return [false, string]
}

function main() {

	console.log(parseJson(inputString)[1])
	console.log(JSON.parse(inputString))

}
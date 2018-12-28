const whitespaces = [" ", "\t", "\n", "\r"]
const pdigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

function parseWhitespace(string) {
	let i = 0
	while (i < string.length && whitespaces.some(w => w === string[i])) i++

	return string.slice(i)
}

// return [null || data:string, remainning string: string]
function parseString(string) {
	string = parseWhitespace(string)
	if (string[0] !== "\"") return null
	if (string[1] === "\"") return ["", parseWhitespace(string.slice(2))]

	let j = 1
	while (!(string[j] !== "\\" && string[j + 1] === "\"")) j++
	const data = string.slice(1, j + 1)

	return [data, parseWhitespace(string.slice(j+2))]
}

// return [null || data:number, remainning string: string]
function parseNumber(string) {
	string = parseWhitespace(string)
	let j = 0
	if (string[j] === "-") {
		j++
		if (!pdigits.some(d => d === string[j])) return null
	}

	if (string[j] === "0" && string[j + 1] === ".") {
		j += 2
		if (!pdigits.some(d => d === string[j])) return null
	}

	while (pdigits.some(d => d === string[j])) j++
	if (string[j] === ".") j++

	while (pdigits.some(d => d === string[j])) j++

	if (string[j] === "e" || string[j] === "E") {
		j++
		if (string[j] === "+" || string[j] === "-") j++

		if (!pdigits.some(d => d === string[j])) return null
	}

	while (pdigits.some(d => d === string[j])) j++

	if (j === 0) return null

	const data = parseFloat(string.slice(0, j))

	return [data, parseWhitespace(string.slice(j))]
}

// return [null || data:null, remainning string: string]
function parseNull(string) {
	string = parseWhitespace(string)
	if (string.length >= 4 && string.slice(0, 4) === "null") {
		return [null, parseWhitespace(string.slice(4))]
	}

	return null
}

// return [null || data:null, remainning string: string]
function parseBool(string) {
	string = parseWhitespace(string)
	if (string.length >= 4 && string.slice(0, 4) === "true") {
		return [true, parseWhitespace(string.slice(4))]
	}

	if (string.length >= 5 && string.slice(0, 5) === "false") {
		return [false, parseWhitespace(string.slice(5))]
	}

	return null
}

// return [null || data:object, remainning string: string]
function parseObject(string) {
	string = parseWhitespace(string)
	if (string[0] === "{") {
		string = parseWhitespace(string.slice(1))
		if(string[0] === "}") {
			return [{}, parseWhitespace(string.slice(1))]
		}

		let dataObj = {}, key = ""
		let parse = parseString(string.slice(0))

		let i = 0

		if (parse === null || !parse[1] || parse[1][i] !== ":") {
			return null
		}
		key = parse[0]
		parse = parseValue(parse[1].slice(i+1))

		while (parse !== null && parse[1] && parse[1][0] === ",") {
			dataObj[key] = parse[0]

			parse = parseString(parse[1].slice(1))

			if (parse === null || !parse[1] || parse[1][0] !== ":") {
				return null
			}
			key = parse[0]
			parse = parseValue(parse[1].slice(1))
		}
		dataObj[key] = parse[0]

		i = 0
		if(parse[1][i] !== "}") {
			return null
		}
		i++

		return [dataObj, parseWhitespace(parse[1].slice(i))]
	}

	return null
}
// return [null || data:array, remainning string: string]
function parseArray(string) {
	string = parseWhitespace(string)
	if (string && string[0] === "[") {
		string = parseWhitespace(string.slice(1))
		if(string && string[0] === "]") {
			return [[], parseWhitespace(string.slice(1))]
		}

		let dataArr = []
		let parse = parseValue(string)
		while (parse !== null && parse[1] && parse[1][0] === ",") {
			dataArr.push(parse[0])
			parse = parseValue(parse[1].slice(1))
		}
		dataArr.push(parse[0])

		if(parse[1][0] !== "]") {
			return null
		}

		return [dataArr, parseWhitespace(parse[1].slice(1))]
	}
	return null
}

const parsers = [parseNull, parseBool, parseNumber, parseString, parseArray, parseObject]
// return [null || data:array, remainning string: string]
function parseValue(string) {
	for(let p of parsers) {
		let parse = p(string)
		if (parse !== null) return parse
	}

	return null
}

// return [null || data:mapped data]
function parseJson(string) {
	let parse = parseValue(string)
	if (parse !== null && !parse[1]) return [true, parse[0]]

	return [false, string]
}

module.exports = parseJson

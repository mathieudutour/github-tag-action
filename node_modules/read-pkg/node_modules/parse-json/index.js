import {codeFrameColumns} from '@babel/code-frame';
import indexToPosition from 'index-to-position';

const getCodePoint = character => `\\u{${character.codePointAt(0).toString(16)}}`;

export class JSONError extends Error {
	name = 'JSONError';
	fileName;
	codeFrame;
	rawCodeFrame;
	#message;

	constructor(message) {
		// We cannot pass message to `super()`, otherwise the message accessor will be overridden.
		// https://262.ecma-international.org/14.0/#sec-error-message
		super();

		this.#message = message;
		Error.captureStackTrace?.(this, JSONError);
	}

	get message() {
		const {fileName, codeFrame} = this;
		return `${this.#message}${fileName ? ` in ${fileName}` : ''}${codeFrame ? `\n\n${codeFrame}\n` : ''}`;
	}

	set message(message) {
		this.#message = message;
	}
}

const generateCodeFrame = (string, location, highlightCode = true) =>
	codeFrameColumns(string, {start: location}, {highlightCode});

const getErrorLocation = (string, message) => {
	const match = message.match(/in JSON at position (?<index>\d+)(?: \(line (?<line>\d+) column (?<column>\d+)\))?$/);

	if (!match) {
		return;
	}

	let {index, line, column} = match.groups;

	if (line && column) {
		return {line: Number(line), column: Number(column)};
	}

	index = Number(index);

	// The error location can be out of bounds.
	if (index === string.length) {
		const {line, column} = indexToPosition(string, string.length - 1, {oneBased: true});
		return {line, column: column + 1};
	}

	return indexToPosition(string, index, {oneBased: true});
};

const addCodePointToUnexpectedToken = message => message.replace(
	// TODO[engine:node@>=20]: The token always quoted after Node.js 20
	/(?<=^Unexpected token )(?<quote>')?(.)\k<quote>/,
	(_, _quote, token) => `"${token}"(${getCodePoint(token)})`,
);

export default function parseJson(string, reviver, fileName) {
	if (typeof reviver === 'string') {
		fileName = reviver;
		reviver = undefined;
	}

	let message;
	try {
		return JSON.parse(string, reviver);
	} catch (error) {
		message = error.message;
	}

	let location;
	if (string) {
		location = getErrorLocation(string, message);
		message = addCodePointToUnexpectedToken(message);
	} else {
		message += ' while parsing empty string';
	}

	const jsonError = new JSONError(message);

	jsonError.fileName = fileName;

	if (location) {
		jsonError.codeFrame = generateCodeFrame(string, location);
		jsonError.rawCodeFrame = generateCodeFrame(string, location, /* highlightCode */ false);
	}

	throw jsonError;
}

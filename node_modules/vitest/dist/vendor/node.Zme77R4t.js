import { resolve, relative, basename, dirname, join, extname, normalize, toNamespacedPath } from 'pathe';
import { parseAstAsync, loadConfigFromFile, searchForWorkspaceRoot, version as version$2, createServer, mergeConfig } from 'vite';
import path$8 from 'node:path';
import url, { fileURLToPath } from 'node:url';
import process$2 from 'node:process';
import fs$8, { promises, existsSync, readFileSync } from 'node:fs';
import { c as configFiles, d as defaultPort, e as extraInlineDeps, a as defaultBrowserPort, E as EXIT_CODE_RESTART, w as workspacesFiles, C as CONFIG_NAMES } from './constants.i1PoEnhr.js';
import { c as commonjsGlobal, g as getDefaultExportFromCjs } from './_commonjsHelpers.jjO7Zipk.js';
import require$$0 from 'os';
import p$1 from 'path';
import { a as micromatch_1, m as mm } from './index.xL8XjTLv.js';
import require$$0$1 from 'stream';
import require$$2 from 'events';
import require$$0$2 from 'fs';
import c from 'picocolors';
import { ViteNodeRunner } from 'vite-node/client';
import { SnapshotManager } from '@vitest/snapshot/manager';
import { ViteNodeServer } from 'vite-node/server';
import { r as removeUndefinedValues, a as isWindows } from './index.rJjbcrrp.js';
import { g as getCoverageProvider, C as CoverageProviderMap } from './coverage.E7sG1b3r.js';
import { rootDir } from '../path.js';
import v8 from 'node:v8';
import * as nodeos from 'node:os';
import nodeos__default from 'node:os';
import EventEmitter from 'node:events';
import Tinypool$1, { Tinypool } from 'tinypool';
import { c as createBirpc } from './index.cAUulNDf.js';
import { g as groupBy, A as AggregateErrorPonyfill, b as slash$1, t as toArray, a as isPrimitive, d as deepMerge, n as noop$1, c as stdout } from './base.QYERqzkH.js';
import { MessageChannel } from 'node:worker_threads';
import { createDefer, shuffle, highlight, inspect, positionToOffset, lineSplitRE, toArray as toArray$1, notNullish } from '@vitest/utils';
import { writeFile, rm } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { execa } from 'execa';
import { TraceMap, generatedPositionFor, parseErrorStacktrace } from '@vitest/utils/source-map';
import ge from 'module';
import { ancestor, findNodeAround } from 'acorn-walk';
import { generateHash, calculateSuiteHash, someTasksAreOnly, interpretTaskModes, getTasks, hasFailed, getTests } from '@vitest/runner/utils';
import { R as ReportersMap, B as BenchmarkReportsMap, s as stripAnsi, a as ansiStyles, b as sliceAnsi, d as divider, F as F_POINTER, c as cliTruncate } from './reporters.cA9x-5v-.js';
import { resolveModule, isPackageExists } from 'local-pkg';
import { isCI, provider as provider$1 } from 'std-env';
import crypto, { createHash } from 'node:crypto';
import { slash as slash$2, normalizeRequestId, cleanUrl } from 'vite-node/utils';
import require$$0$3 from 'assert';
import MagicString from 'magic-string';
import { esmWalker } from '@vitest/utils/ast';
import { stripLiteral } from 'strip-literal';
import { createRequire } from 'node:module';
import { g as getEnvPackageName } from './environments.sU0TD7wX.js';
import readline from 'node:readline';
import require$$0$4 from 'readline';

function _mergeNamespaces(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  });
  return Object.freeze(n);
}

var version$1 = "1.2.2";

/*
How it works:
`this.#head` is an instance of `Node` which keeps track of its current value and nests another instance of `Node` that keeps the value that comes after it. When a value is provided to `.enqueue()`, the code needs to iterate through `this.#head`, going deeper and deeper to find the last value. However, iterating through every single item is slow. This problem is solved by saving a reference to the last value as `this.#tail` so that it can reference it to add a new value.
*/

class Node {
	value;
	next;

	constructor(value) {
		this.value = value;
	}
}

class Queue {
	#head;
	#tail;
	#size;

	constructor() {
		this.clear();
	}

	enqueue(value) {
		const node = new Node(value);

		if (this.#head) {
			this.#tail.next = node;
			this.#tail = node;
		} else {
			this.#head = node;
			this.#tail = node;
		}

		this.#size++;
	}

	dequeue() {
		const current = this.#head;
		if (!current) {
			return;
		}

		this.#head = this.#head.next;
		this.#size--;
		return current.value;
	}

	clear() {
		this.#head = undefined;
		this.#tail = undefined;
		this.#size = 0;
	}

	get size() {
		return this.#size;
	}

	* [Symbol.iterator]() {
		let current = this.#head;

		while (current) {
			yield current.value;
			current = current.next;
		}
	}
}

function pLimit(concurrency) {
	if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
		throw new TypeError('Expected `concurrency` to be a number from 1 and up');
	}

	const queue = new Queue();
	let activeCount = 0;

	const next = () => {
		activeCount--;

		if (queue.size > 0) {
			queue.dequeue()();
		}
	};

	const run = async (fn, resolve, args) => {
		activeCount++;

		const result = (async () => fn(...args))();

		resolve(result);

		try {
			await result;
		} catch {}

		next();
	};

	const enqueue = (fn, resolve, args) => {
		queue.enqueue(run.bind(undefined, fn, resolve, args));

		(async () => {
			// This function needs to wait until the next microtask before comparing
			// `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
			// when the run function is dequeued and called. The comparison in the if-statement
			// needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
			await Promise.resolve();

			if (activeCount < concurrency && queue.size > 0) {
				queue.dequeue()();
			}
		})();
	};

	const generator = (fn, ...args) => new Promise(resolve => {
		enqueue(fn, resolve, args);
	});

	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount,
		},
		pendingCount: {
			get: () => queue.size,
		},
		clearQueue: {
			value: () => {
				queue.clear();
			},
		},
	});

	return generator;
}

class EndError extends Error {
	constructor(value) {
		super();
		this.value = value;
	}
}

// The input can also be a promise, so we await it.
const testElement = async (element, tester) => tester(await element);

// The input can also be a promise, so we `Promise.all()` them both.
const finder = async element => {
	const values = await Promise.all(element);
	if (values[1] === true) {
		throw new EndError(values[0]);
	}

	return false;
};

async function pLocate(
	iterable,
	tester,
	{
		concurrency = Number.POSITIVE_INFINITY,
		preserveOrder = true,
	} = {},
) {
	const limit = pLimit(concurrency);

	// Start all the promises concurrently with optional limit.
	const items = [...iterable].map(element => [element, limit(testElement, element, tester)]);

	// Check the promises either serially or concurrently.
	const checkLimit = pLimit(preserveOrder ? 1 : Number.POSITIVE_INFINITY);

	try {
		await Promise.all(items.map(element => checkLimit(finder, element)));
	} catch (error) {
		if (error instanceof EndError) {
			return error.value;
		}

		throw error;
	}
}

const typeMappings = {
	directory: 'isDirectory',
	file: 'isFile',
};

function checkType(type) {
	if (Object.hasOwnProperty.call(typeMappings, type)) {
		return;
	}

	throw new Error(`Invalid type specified: ${type}`);
}

const matchType = (type, stat) => stat[typeMappings[type]]();

const toPath$1 = urlOrPath => urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

async function locatePath(
	paths,
	{
		cwd = process$2.cwd(),
		type = 'file',
		allowSymlinks = true,
		concurrency,
		preserveOrder,
	} = {},
) {
	checkType(type);
	cwd = toPath$1(cwd);

	const statFunction = allowSymlinks ? promises.stat : promises.lstat;

	return pLocate(paths, async path_ => {
		try {
			const stat = await statFunction(path$8.resolve(cwd, path_));
			return matchType(type, stat);
		} catch {
			return false;
		}
	}, {concurrency, preserveOrder});
}

const toPath = urlOrPath => urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

const findUpStop = Symbol('findUpStop');

async function findUpMultiple(name, options = {}) {
	let directory = path$8.resolve(toPath(options.cwd) || '');
	const {root} = path$8.parse(directory);
	const stopAt = path$8.resolve(directory, options.stopAt || root);
	const limit = options.limit || Number.POSITIVE_INFINITY;
	const paths = [name].flat();

	const runMatcher = async locateOptions => {
		if (typeof name !== 'function') {
			return locatePath(paths, locateOptions);
		}

		const foundPath = await name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath([foundPath], locateOptions);
		}

		return foundPath;
	};

	const matches = [];
	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const foundPath = await runMatcher({...options, cwd: directory});

		if (foundPath === findUpStop) {
			break;
		}

		if (foundPath) {
			matches.push(path$8.resolve(directory, foundPath));
		}

		if (directory === stopAt || matches.length >= limit) {
			break;
		}

		directory = path$8.dirname(directory);
	}

	return matches;
}

async function findUp(name, options = {}) {
	const matches = await findUpMultiple(name, {...options, limit: 1});
	return matches[0];
}

var tasks = {};

var utils$b = {};

var array$1 = {};

Object.defineProperty(array$1, "__esModule", { value: true });
array$1.splitWhen = array$1.flatten = void 0;
function flatten(items) {
    return items.reduce((collection, item) => [].concat(collection, item), []);
}
array$1.flatten = flatten;
function splitWhen(items, predicate) {
    const result = [[]];
    let groupIndex = 0;
    for (const item of items) {
        if (predicate(item)) {
            groupIndex++;
            result[groupIndex] = [];
        }
        else {
            result[groupIndex].push(item);
        }
    }
    return result;
}
array$1.splitWhen = splitWhen;

var errno$1 = {};

Object.defineProperty(errno$1, "__esModule", { value: true });
errno$1.isEnoentCodeError = void 0;
function isEnoentCodeError(error) {
    return error.code === 'ENOENT';
}
errno$1.isEnoentCodeError = isEnoentCodeError;

var fs$7 = {};

Object.defineProperty(fs$7, "__esModule", { value: true });
fs$7.createDirentFromStats = void 0;
let DirentFromStats$1 = class DirentFromStats {
    constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
};
function createDirentFromStats$1(name, stats) {
    return new DirentFromStats$1(name, stats);
}
fs$7.createDirentFromStats = createDirentFromStats$1;

var path$7 = {};

Object.defineProperty(path$7, "__esModule", { value: true });
path$7.convertPosixPathToPattern = path$7.convertWindowsPathToPattern = path$7.convertPathToPattern = path$7.escapePosixPath = path$7.escapeWindowsPath = path$7.escape = path$7.removeLeadingDotSegment = path$7.makeAbsolute = path$7.unixify = void 0;
const os = require$$0;
const path$6 = p$1;
const IS_WINDOWS_PLATFORM = os.platform() === 'win32';
const LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2; // ./ or .\\
/**
 * All non-escaped special characters.
 * Posix: ()*?[]{|}, !+@ before (, ! at the beginning, \\ before non-special characters.
 * Windows: (){}[], !+@ before (, ! at the beginning.
 */
const POSIX_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
const WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()[\]{}]|^!|[!+@](?=\())/g;
/**
 * The device path (\\.\ or \\?\).
 * https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats#dos-device-paths
 */
const DOS_DEVICE_PATH_RE = /^\\\\([.?])/;
/**
 * All backslashes except those escaping special characters.
 * Windows: !()+@{}
 * https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions
 */
const WINDOWS_BACKSLASHES_RE = /\\(?![!()+@[\]{}])/g;
/**
 * Designed to work only with simple paths: `dir\\file`.
 */
function unixify(filepath) {
    return filepath.replace(/\\/g, '/');
}
path$7.unixify = unixify;
function makeAbsolute(cwd, filepath) {
    return path$6.resolve(cwd, filepath);
}
path$7.makeAbsolute = makeAbsolute;
function removeLeadingDotSegment(entry) {
    // We do not use `startsWith` because this is 10x slower than current implementation for some cases.
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (entry.charAt(0) === '.') {
        const secondCharactery = entry.charAt(1);
        if (secondCharactery === '/' || secondCharactery === '\\') {
            return entry.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
        }
    }
    return entry;
}
path$7.removeLeadingDotSegment = removeLeadingDotSegment;
path$7.escape = IS_WINDOWS_PLATFORM ? escapeWindowsPath : escapePosixPath;
function escapeWindowsPath(pattern) {
    return pattern.replace(WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE, '\\$2');
}
path$7.escapeWindowsPath = escapeWindowsPath;
function escapePosixPath(pattern) {
    return pattern.replace(POSIX_UNESCAPED_GLOB_SYMBOLS_RE, '\\$2');
}
path$7.escapePosixPath = escapePosixPath;
path$7.convertPathToPattern = IS_WINDOWS_PLATFORM ? convertWindowsPathToPattern : convertPosixPathToPattern;
function convertWindowsPathToPattern(filepath) {
    return escapeWindowsPath(filepath)
        .replace(DOS_DEVICE_PATH_RE, '//$1')
        .replace(WINDOWS_BACKSLASHES_RE, '/');
}
path$7.convertWindowsPathToPattern = convertWindowsPathToPattern;
function convertPosixPathToPattern(filepath) {
    return escapePosixPath(filepath);
}
path$7.convertPosixPathToPattern = convertPosixPathToPattern;

var pattern$1 = {};

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob$1 = function isExtglob(str) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  var match;
  while ((match = /(\\).|([@?!+*]\(.*\))/g.exec(str))) {
    if (match[2]) return true;
    str = str.slice(match.index + match[0].length);
  }

  return false;
};

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isExtglob = isExtglob$1;
var chars = { '{': '}', '(': ')', '[': ']'};
var strictCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  var pipeIndex = -2;
  var closeSquareIndex = -2;
  var closeCurlyIndex = -2;
  var closeParenIndex = -2;
  var backSlashIndex = -2;
  while (index < str.length) {
    if (str[index] === '*') {
      return true;
    }

    if (str[index + 1] === '?' && /[\].+)]/.test(str[index])) {
      return true;
    }

    if (closeSquareIndex !== -1 && str[index] === '[' && str[index + 1] !== ']') {
      if (closeSquareIndex < index) {
        closeSquareIndex = str.indexOf(']', index);
      }
      if (closeSquareIndex > index) {
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
      }
    }

    if (closeCurlyIndex !== -1 && str[index] === '{' && str[index + 1] !== '}') {
      closeCurlyIndex = str.indexOf('}', index);
      if (closeCurlyIndex > index) {
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
          return true;
        }
      }
    }

    if (closeParenIndex !== -1 && str[index] === '(' && str[index + 1] === '?' && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ')') {
      closeParenIndex = str.indexOf(')', index);
      if (closeParenIndex > index) {
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
          return true;
        }
      }
    }

    if (pipeIndex !== -1 && str[index] === '(' && str[index + 1] !== '|') {
      if (pipeIndex < index) {
        pipeIndex = str.indexOf('|', index);
      }
      if (pipeIndex !== -1 && str[pipeIndex + 1] !== ')') {
        closeParenIndex = str.indexOf(')', pipeIndex);
        if (closeParenIndex > pipeIndex) {
          backSlashIndex = str.indexOf('\\', pipeIndex);
          if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
            return true;
          }
        }
      }
    }

    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

var relaxedCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) {
      return true;
    }

    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

var isGlob$1 = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob(str)) {
    return true;
  }

  var check = strictCheck;

  // optionally relax check
  if (options && options.strict === false) {
    check = relaxedCheck;
  }

  return check(str);
};

var isGlob = isGlob$1;
var pathPosixDirname = p$1.posix.dirname;
var isWin32 = require$$0.platform() === 'win32';

var slash = '/';
var backslash = /\\/g;
var enclosure = /[\{\[].*[\}\]]$/;
var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

/**
 * @param {string} str
 * @param {Object} opts
 * @param {boolean} [opts.flipBackslashes=true]
 * @returns {string}
 */
var globParent$1 = function globParent(str, opts) {
  var options = Object.assign({ flipBackslashes: true }, opts);

  // flip windows path separators
  if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
    str = str.replace(backslash, slash);
  }

  // special case for strings ending in enclosure containing path separator
  if (enclosure.test(str)) {
    str += slash;
  }

  // preserves full path in case of trailing path separator
  str += 'a';

  // remove path parts that are globby
  do {
    str = pathPosixDirname(str);
  } while (isGlob(str) || globby.test(str));

  // remove escape chars and return result
  return str.replace(escaped, '$1');
};

Object.defineProperty(pattern$1, "__esModule", { value: true });
pattern$1.removeDuplicateSlashes = pattern$1.matchAny = pattern$1.convertPatternsToRe = pattern$1.makeRe = pattern$1.getPatternParts = pattern$1.expandBraceExpansion = pattern$1.expandPatternsWithBraceExpansion = pattern$1.isAffectDepthOfReadingPattern = pattern$1.endsWithSlashGlobStar = pattern$1.hasGlobStar = pattern$1.getBaseDirectory = pattern$1.isPatternRelatedToParentDirectory = pattern$1.getPatternsOutsideCurrentDirectory = pattern$1.getPatternsInsideCurrentDirectory = pattern$1.getPositivePatterns = pattern$1.getNegativePatterns = pattern$1.isPositivePattern = pattern$1.isNegativePattern = pattern$1.convertToNegativePattern = pattern$1.convertToPositivePattern = pattern$1.isDynamicPattern = pattern$1.isStaticPattern = void 0;
const path$5 = p$1;
const globParent = globParent$1;
const micromatch = micromatch_1;
const GLOBSTAR = '**';
const ESCAPE_SYMBOL = '\\';
const COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
const REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
const REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
const GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
const BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;
/**
 * Matches a sequence of two or more consecutive slashes, excluding the first two slashes at the beginning of the string.
 * The latter is due to the presence of the device path at the beginning of the UNC path.
 */
const DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;
function isStaticPattern(pattern, options = {}) {
    return !isDynamicPattern(pattern, options);
}
pattern$1.isStaticPattern = isStaticPattern;
function isDynamicPattern(pattern, options = {}) {
    /**
     * A special case with an empty string is necessary for matching patterns that start with a forward slash.
     * An empty string cannot be a dynamic pattern.
     * For example, the pattern `/lib/*` will be spread into parts: '', 'lib', '*'.
     */
    if (pattern === '') {
        return false;
    }
    /**
     * When the `caseSensitiveMatch` option is disabled, all patterns must be marked as dynamic, because we cannot check
     * filepath directly (without read directory).
     */
    if (options.caseSensitiveMatch === false || pattern.includes(ESCAPE_SYMBOL)) {
        return true;
    }
    if (COMMON_GLOB_SYMBOLS_RE.test(pattern) || REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern) || REGEX_GROUP_SYMBOLS_RE.test(pattern)) {
        return true;
    }
    if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern)) {
        return true;
    }
    if (options.braceExpansion !== false && hasBraceExpansion(pattern)) {
        return true;
    }
    return false;
}
pattern$1.isDynamicPattern = isDynamicPattern;
function hasBraceExpansion(pattern) {
    const openingBraceIndex = pattern.indexOf('{');
    if (openingBraceIndex === -1) {
        return false;
    }
    const closingBraceIndex = pattern.indexOf('}', openingBraceIndex + 1);
    if (closingBraceIndex === -1) {
        return false;
    }
    const braceContent = pattern.slice(openingBraceIndex, closingBraceIndex);
    return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
}
function convertToPositivePattern(pattern) {
    return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
}
pattern$1.convertToPositivePattern = convertToPositivePattern;
function convertToNegativePattern(pattern) {
    return '!' + pattern;
}
pattern$1.convertToNegativePattern = convertToNegativePattern;
function isNegativePattern(pattern) {
    return pattern.startsWith('!') && pattern[1] !== '(';
}
pattern$1.isNegativePattern = isNegativePattern;
function isPositivePattern(pattern) {
    return !isNegativePattern(pattern);
}
pattern$1.isPositivePattern = isPositivePattern;
function getNegativePatterns(patterns) {
    return patterns.filter(isNegativePattern);
}
pattern$1.getNegativePatterns = getNegativePatterns;
function getPositivePatterns$1(patterns) {
    return patterns.filter(isPositivePattern);
}
pattern$1.getPositivePatterns = getPositivePatterns$1;
/**
 * Returns patterns that can be applied inside the current directory.
 *
 * @example
 * // ['./*', '*', 'a/*']
 * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
 */
function getPatternsInsideCurrentDirectory(patterns) {
    return patterns.filter((pattern) => !isPatternRelatedToParentDirectory(pattern));
}
pattern$1.getPatternsInsideCurrentDirectory = getPatternsInsideCurrentDirectory;
/**
 * Returns patterns to be expanded relative to (outside) the current directory.
 *
 * @example
 * // ['../*', './../*']
 * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
 */
function getPatternsOutsideCurrentDirectory(patterns) {
    return patterns.filter(isPatternRelatedToParentDirectory);
}
pattern$1.getPatternsOutsideCurrentDirectory = getPatternsOutsideCurrentDirectory;
function isPatternRelatedToParentDirectory(pattern) {
    return pattern.startsWith('..') || pattern.startsWith('./..');
}
pattern$1.isPatternRelatedToParentDirectory = isPatternRelatedToParentDirectory;
function getBaseDirectory(pattern) {
    return globParent(pattern, { flipBackslashes: false });
}
pattern$1.getBaseDirectory = getBaseDirectory;
function hasGlobStar(pattern) {
    return pattern.includes(GLOBSTAR);
}
pattern$1.hasGlobStar = hasGlobStar;
function endsWithSlashGlobStar(pattern) {
    return pattern.endsWith('/' + GLOBSTAR);
}
pattern$1.endsWithSlashGlobStar = endsWithSlashGlobStar;
function isAffectDepthOfReadingPattern(pattern) {
    const basename = path$5.basename(pattern);
    return endsWithSlashGlobStar(pattern) || isStaticPattern(basename);
}
pattern$1.isAffectDepthOfReadingPattern = isAffectDepthOfReadingPattern;
function expandPatternsWithBraceExpansion(patterns) {
    return patterns.reduce((collection, pattern) => {
        return collection.concat(expandBraceExpansion(pattern));
    }, []);
}
pattern$1.expandPatternsWithBraceExpansion = expandPatternsWithBraceExpansion;
function expandBraceExpansion(pattern) {
    const patterns = micromatch.braces(pattern, { expand: true, nodupes: true, keepEscaping: true });
    /**
     * Sort the patterns by length so that the same depth patterns are processed side by side.
     * `a/{b,}/{c,}/*` – `['a///*', 'a/b//*', 'a//c/*', 'a/b/c/*']`
     */
    patterns.sort((a, b) => a.length - b.length);
    /**
     * Micromatch can return an empty string in the case of patterns like `{a,}`.
     */
    return patterns.filter((pattern) => pattern !== '');
}
pattern$1.expandBraceExpansion = expandBraceExpansion;
function getPatternParts(pattern, options) {
    let { parts } = micromatch.scan(pattern, Object.assign(Object.assign({}, options), { parts: true }));
    /**
     * The scan method returns an empty array in some cases.
     * See micromatch/picomatch#58 for more details.
     */
    if (parts.length === 0) {
        parts = [pattern];
    }
    /**
     * The scan method does not return an empty part for the pattern with a forward slash.
     * This is another part of micromatch/picomatch#58.
     */
    if (parts[0].startsWith('/')) {
        parts[0] = parts[0].slice(1);
        parts.unshift('');
    }
    return parts;
}
pattern$1.getPatternParts = getPatternParts;
function makeRe(pattern, options) {
    return micromatch.makeRe(pattern, options);
}
pattern$1.makeRe = makeRe;
function convertPatternsToRe(patterns, options) {
    return patterns.map((pattern) => makeRe(pattern, options));
}
pattern$1.convertPatternsToRe = convertPatternsToRe;
function matchAny(entry, patternsRe) {
    return patternsRe.some((patternRe) => patternRe.test(entry));
}
pattern$1.matchAny = matchAny;
/**
 * This package only works with forward slashes as a path separator.
 * Because of this, we cannot use the standard `path.normalize` method, because on Windows platform it will use of backslashes.
 */
function removeDuplicateSlashes(pattern) {
    return pattern.replace(DOUBLE_SLASH_RE, '/');
}
pattern$1.removeDuplicateSlashes = removeDuplicateSlashes;

var stream$4 = {};

/*
 * merge2
 * https://github.com/teambition/merge2
 *
 * Copyright (c) 2014-2020 Teambition
 * Licensed under the MIT license.
 */
const Stream = require$$0$1;
const PassThrough = Stream.PassThrough;
const slice = Array.prototype.slice;

var merge2_1 = merge2$1;

function merge2$1 () {
  const streamsQueue = [];
  const args = slice.call(arguments);
  let merging = false;
  let options = args[args.length - 1];

  if (options && !Array.isArray(options) && options.pipe == null) {
    args.pop();
  } else {
    options = {};
  }

  const doEnd = options.end !== false;
  const doPipeError = options.pipeError === true;
  if (options.objectMode == null) {
    options.objectMode = true;
  }
  if (options.highWaterMark == null) {
    options.highWaterMark = 64 * 1024;
  }
  const mergedStream = PassThrough(options);

  function addStream () {
    for (let i = 0, len = arguments.length; i < len; i++) {
      streamsQueue.push(pauseStreams(arguments[i], options));
    }
    mergeStream();
    return this
  }

  function mergeStream () {
    if (merging) {
      return
    }
    merging = true;

    let streams = streamsQueue.shift();
    if (!streams) {
      process.nextTick(endStream);
      return
    }
    if (!Array.isArray(streams)) {
      streams = [streams];
    }

    let pipesCount = streams.length + 1;

    function next () {
      if (--pipesCount > 0) {
        return
      }
      merging = false;
      mergeStream();
    }

    function pipe (stream) {
      function onend () {
        stream.removeListener('merge2UnpipeEnd', onend);
        stream.removeListener('end', onend);
        if (doPipeError) {
          stream.removeListener('error', onerror);
        }
        next();
      }
      function onerror (err) {
        mergedStream.emit('error', err);
      }
      // skip ended stream
      if (stream._readableState.endEmitted) {
        return next()
      }

      stream.on('merge2UnpipeEnd', onend);
      stream.on('end', onend);

      if (doPipeError) {
        stream.on('error', onerror);
      }

      stream.pipe(mergedStream, { end: false });
      // compatible for old stream
      stream.resume();
    }

    for (let i = 0; i < streams.length; i++) {
      pipe(streams[i]);
    }

    next();
  }

  function endStream () {
    merging = false;
    // emit 'queueDrain' when all streams merged.
    mergedStream.emit('queueDrain');
    if (doEnd) {
      mergedStream.end();
    }
  }

  mergedStream.setMaxListeners(0);
  mergedStream.add = addStream;
  mergedStream.on('unpipe', function (stream) {
    stream.emit('merge2UnpipeEnd');
  });

  if (args.length) {
    addStream.apply(null, args);
  }
  return mergedStream
}

// check and pause streams for pipe.
function pauseStreams (streams, options) {
  if (!Array.isArray(streams)) {
    // Backwards-compat with old-style streams
    if (!streams._readableState && streams.pipe) {
      streams = streams.pipe(PassThrough(options));
    }
    if (!streams._readableState || !streams.pause || !streams.pipe) {
      throw new Error('Only readable stream can be merged.')
    }
    streams.pause();
  } else {
    for (let i = 0, len = streams.length; i < len; i++) {
      streams[i] = pauseStreams(streams[i], options);
    }
  }
  return streams
}

Object.defineProperty(stream$4, "__esModule", { value: true });
stream$4.merge = void 0;
const merge2 = merge2_1;
function merge(streams) {
    const mergedStream = merge2(streams);
    streams.forEach((stream) => {
        stream.once('error', (error) => mergedStream.emit('error', error));
    });
    mergedStream.once('close', () => propagateCloseEventToSources(streams));
    mergedStream.once('end', () => propagateCloseEventToSources(streams));
    return mergedStream;
}
stream$4.merge = merge;
function propagateCloseEventToSources(streams) {
    streams.forEach((stream) => stream.emit('close'));
}

var string$1 = {};

Object.defineProperty(string$1, "__esModule", { value: true });
string$1.isEmpty = string$1.isString = void 0;
function isString(input) {
    return typeof input === 'string';
}
string$1.isString = isString;
function isEmpty(input) {
    return input === '';
}
string$1.isEmpty = isEmpty;

Object.defineProperty(utils$b, "__esModule", { value: true });
utils$b.string = utils$b.stream = utils$b.pattern = utils$b.path = utils$b.fs = utils$b.errno = utils$b.array = void 0;
const array = array$1;
utils$b.array = array;
const errno = errno$1;
utils$b.errno = errno;
const fs$6 = fs$7;
utils$b.fs = fs$6;
const path$4 = path$7;
utils$b.path = path$4;
const pattern = pattern$1;
utils$b.pattern = pattern;
const stream$3 = stream$4;
utils$b.stream = stream$3;
const string = string$1;
utils$b.string = string;

Object.defineProperty(tasks, "__esModule", { value: true });
tasks.convertPatternGroupToTask = tasks.convertPatternGroupsToTasks = tasks.groupPatternsByBaseDirectory = tasks.getNegativePatternsAsPositive = tasks.getPositivePatterns = tasks.convertPatternsToTasks = tasks.generate = void 0;
const utils$a = utils$b;
function generate(input, settings) {
    const patterns = processPatterns(input, settings);
    const ignore = processPatterns(settings.ignore, settings);
    const positivePatterns = getPositivePatterns(patterns);
    const negativePatterns = getNegativePatternsAsPositive(patterns, ignore);
    const staticPatterns = positivePatterns.filter((pattern) => utils$a.pattern.isStaticPattern(pattern, settings));
    const dynamicPatterns = positivePatterns.filter((pattern) => utils$a.pattern.isDynamicPattern(pattern, settings));
    const staticTasks = convertPatternsToTasks(staticPatterns, negativePatterns, /* dynamic */ false);
    const dynamicTasks = convertPatternsToTasks(dynamicPatterns, negativePatterns, /* dynamic */ true);
    return staticTasks.concat(dynamicTasks);
}
tasks.generate = generate;
function processPatterns(input, settings) {
    let patterns = input;
    /**
     * The original pattern like `{,*,**,a/*}` can lead to problems checking the depth when matching entry
     * and some problems with the micromatch package (see fast-glob issues: #365, #394).
     *
     * To solve this problem, we expand all patterns containing brace expansion. This can lead to a slight slowdown
     * in matching in the case of a large set of patterns after expansion.
     */
    if (settings.braceExpansion) {
        patterns = utils$a.pattern.expandPatternsWithBraceExpansion(patterns);
    }
    /**
     * If the `baseNameMatch` option is enabled, we must add globstar to patterns, so that they can be used
     * at any nesting level.
     *
     * We do this here, because otherwise we have to complicate the filtering logic. For example, we need to change
     * the pattern in the filter before creating a regular expression. There is no need to change the patterns
     * in the application. Only on the input.
     */
    if (settings.baseNameMatch) {
        patterns = patterns.map((pattern) => pattern.includes('/') ? pattern : `**/${pattern}`);
    }
    /**
     * This method also removes duplicate slashes that may have been in the pattern or formed as a result of expansion.
     */
    return patterns.map((pattern) => utils$a.pattern.removeDuplicateSlashes(pattern));
}
/**
 * Returns tasks grouped by basic pattern directories.
 *
 * Patterns that can be found inside (`./`) and outside (`../`) the current directory are handled separately.
 * This is necessary because directory traversal starts at the base directory and goes deeper.
 */
function convertPatternsToTasks(positive, negative, dynamic) {
    const tasks = [];
    const patternsOutsideCurrentDirectory = utils$a.pattern.getPatternsOutsideCurrentDirectory(positive);
    const patternsInsideCurrentDirectory = utils$a.pattern.getPatternsInsideCurrentDirectory(positive);
    const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsOutsideCurrentDirectory);
    const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsInsideCurrentDirectory);
    tasks.push(...convertPatternGroupsToTasks(outsideCurrentDirectoryGroup, negative, dynamic));
    /*
     * For the sake of reducing future accesses to the file system, we merge all tasks within the current directory
     * into a global task, if at least one pattern refers to the root (`.`). In this case, the global task covers the rest.
     */
    if ('.' in insideCurrentDirectoryGroup) {
        tasks.push(convertPatternGroupToTask('.', patternsInsideCurrentDirectory, negative, dynamic));
    }
    else {
        tasks.push(...convertPatternGroupsToTasks(insideCurrentDirectoryGroup, negative, dynamic));
    }
    return tasks;
}
tasks.convertPatternsToTasks = convertPatternsToTasks;
function getPositivePatterns(patterns) {
    return utils$a.pattern.getPositivePatterns(patterns);
}
tasks.getPositivePatterns = getPositivePatterns;
function getNegativePatternsAsPositive(patterns, ignore) {
    const negative = utils$a.pattern.getNegativePatterns(patterns).concat(ignore);
    const positive = negative.map(utils$a.pattern.convertToPositivePattern);
    return positive;
}
tasks.getNegativePatternsAsPositive = getNegativePatternsAsPositive;
function groupPatternsByBaseDirectory(patterns) {
    const group = {};
    return patterns.reduce((collection, pattern) => {
        const base = utils$a.pattern.getBaseDirectory(pattern);
        if (base in collection) {
            collection[base].push(pattern);
        }
        else {
            collection[base] = [pattern];
        }
        return collection;
    }, group);
}
tasks.groupPatternsByBaseDirectory = groupPatternsByBaseDirectory;
function convertPatternGroupsToTasks(positive, negative, dynamic) {
    return Object.keys(positive).map((base) => {
        return convertPatternGroupToTask(base, positive[base], negative, dynamic);
    });
}
tasks.convertPatternGroupsToTasks = convertPatternGroupsToTasks;
function convertPatternGroupToTask(base, positive, negative, dynamic) {
    return {
        dynamic,
        positive,
        negative,
        base,
        patterns: [].concat(positive, negative.map(utils$a.pattern.convertToNegativePattern))
    };
}
tasks.convertPatternGroupToTask = convertPatternGroupToTask;

var async$7 = {};

var async$6 = {};

var out$3 = {};

var async$5 = {};

var async$4 = {};

var out$2 = {};

var async$3 = {};

var out$1 = {};

var async$2 = {};

Object.defineProperty(async$2, "__esModule", { value: true });
async$2.read = void 0;
function read$3(path, settings, callback) {
    settings.fs.lstat(path, (lstatError, lstat) => {
        if (lstatError !== null) {
            callFailureCallback$2(callback, lstatError);
            return;
        }
        if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
            callSuccessCallback$2(callback, lstat);
            return;
        }
        settings.fs.stat(path, (statError, stat) => {
            if (statError !== null) {
                if (settings.throwErrorOnBrokenSymbolicLink) {
                    callFailureCallback$2(callback, statError);
                    return;
                }
                callSuccessCallback$2(callback, lstat);
                return;
            }
            if (settings.markSymbolicLink) {
                stat.isSymbolicLink = () => true;
            }
            callSuccessCallback$2(callback, stat);
        });
    });
}
async$2.read = read$3;
function callFailureCallback$2(callback, error) {
    callback(error);
}
function callSuccessCallback$2(callback, result) {
    callback(null, result);
}

var sync$7 = {};

Object.defineProperty(sync$7, "__esModule", { value: true });
sync$7.read = void 0;
function read$2(path, settings) {
    const lstat = settings.fs.lstatSync(path);
    if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
        return lstat;
    }
    try {
        const stat = settings.fs.statSync(path);
        if (settings.markSymbolicLink) {
            stat.isSymbolicLink = () => true;
        }
        return stat;
    }
    catch (error) {
        if (!settings.throwErrorOnBrokenSymbolicLink) {
            return lstat;
        }
        throw error;
    }
}
sync$7.read = read$2;

var settings$3 = {};

var fs$5 = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createFileSystemAdapter = exports.FILE_SYSTEM_ADAPTER = void 0;
	const fs = require$$0$2;
	exports.FILE_SYSTEM_ADAPTER = {
	    lstat: fs.lstat,
	    stat: fs.stat,
	    lstatSync: fs.lstatSync,
	    statSync: fs.statSync
	};
	function createFileSystemAdapter(fsMethods) {
	    if (fsMethods === undefined) {
	        return exports.FILE_SYSTEM_ADAPTER;
	    }
	    return Object.assign(Object.assign({}, exports.FILE_SYSTEM_ADAPTER), fsMethods);
	}
	exports.createFileSystemAdapter = createFileSystemAdapter; 
} (fs$5));

Object.defineProperty(settings$3, "__esModule", { value: true });
const fs$4 = fs$5;
let Settings$2 = class Settings {
    constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLink = this._getValue(this._options.followSymbolicLink, true);
        this.fs = fs$4.createFileSystemAdapter(this._options.fs);
        this.markSymbolicLink = this._getValue(this._options.markSymbolicLink, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
    }
    _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
    }
};
settings$3.default = Settings$2;

Object.defineProperty(out$1, "__esModule", { value: true });
out$1.statSync = out$1.stat = out$1.Settings = void 0;
const async$1 = async$2;
const sync$6 = sync$7;
const settings_1$3 = settings$3;
out$1.Settings = settings_1$3.default;
function stat(path, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        async$1.read(path, getSettings$2(), optionsOrSettingsOrCallback);
        return;
    }
    async$1.read(path, getSettings$2(optionsOrSettingsOrCallback), callback);
}
out$1.stat = stat;
function statSync(path, optionsOrSettings) {
    const settings = getSettings$2(optionsOrSettings);
    return sync$6.read(path, settings);
}
out$1.statSync = statSync;
function getSettings$2(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1$3.default) {
        return settingsOrOptions;
    }
    return new settings_1$3.default(settingsOrOptions);
}

/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

let promise;

var queueMicrotask_1 = typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(typeof window !== 'undefined' ? window : commonjsGlobal)
  // reuse resolved promise, and allocate it lazily
  : cb => (promise || (promise = Promise.resolve()))
    .then(cb)
    .catch(err => setTimeout(() => { throw err }, 0));

/*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

var runParallel_1 = runParallel;

const queueMicrotask$1 = queueMicrotask_1;

function runParallel (tasks, cb) {
  let results, pending, keys;
  let isSync = true;

  if (Array.isArray(tasks)) {
    results = [];
    pending = tasks.length;
  } else {
    keys = Object.keys(tasks);
    results = {};
    pending = keys.length;
  }

  function done (err) {
    function end () {
      if (cb) cb(err, results);
      cb = null;
    }
    if (isSync) queueMicrotask$1(end);
    else end();
  }

  function each (i, err, result) {
    results[i] = result;
    if (--pending === 0 || err) {
      done(err);
    }
  }

  if (!pending) {
    // empty
    done(null);
  } else if (keys) {
    // object
    keys.forEach(function (key) {
      tasks[key](function (err, result) { each(key, err, result); });
    });
  } else {
    // array
    tasks.forEach(function (task, i) {
      task(function (err, result) { each(i, err, result); });
    });
  }

  isSync = false;
}

var constants = {};

Object.defineProperty(constants, "__esModule", { value: true });
constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES = void 0;
const NODE_PROCESS_VERSION_PARTS = process.versions.node.split('.');
if (NODE_PROCESS_VERSION_PARTS[0] === undefined || NODE_PROCESS_VERSION_PARTS[1] === undefined) {
    throw new Error(`Unexpected behavior. The 'process.versions.node' variable has invalid value: ${process.versions.node}`);
}
const MAJOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[0], 10);
const MINOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[1], 10);
const SUPPORTED_MAJOR_VERSION = 10;
const SUPPORTED_MINOR_VERSION = 10;
const IS_MATCHED_BY_MAJOR = MAJOR_VERSION > SUPPORTED_MAJOR_VERSION;
const IS_MATCHED_BY_MAJOR_AND_MINOR = MAJOR_VERSION === SUPPORTED_MAJOR_VERSION && MINOR_VERSION >= SUPPORTED_MINOR_VERSION;
/**
 * IS `true` for Node.js 10.10 and greater.
 */
constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES = IS_MATCHED_BY_MAJOR || IS_MATCHED_BY_MAJOR_AND_MINOR;

var utils$9 = {};

var fs$3 = {};

Object.defineProperty(fs$3, "__esModule", { value: true });
fs$3.createDirentFromStats = void 0;
class DirentFromStats {
    constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
}
function createDirentFromStats(name, stats) {
    return new DirentFromStats(name, stats);
}
fs$3.createDirentFromStats = createDirentFromStats;

Object.defineProperty(utils$9, "__esModule", { value: true });
utils$9.fs = void 0;
const fs$2 = fs$3;
utils$9.fs = fs$2;

var common$6 = {};

Object.defineProperty(common$6, "__esModule", { value: true });
common$6.joinPathSegments = void 0;
function joinPathSegments$1(a, b, separator) {
    /**
     * The correct handling of cases when the first segment is a root (`/`, `C:/`) or UNC path (`//?/C:/`).
     */
    if (a.endsWith(separator)) {
        return a + b;
    }
    return a + separator + b;
}
common$6.joinPathSegments = joinPathSegments$1;

Object.defineProperty(async$3, "__esModule", { value: true });
async$3.readdir = async$3.readdirWithFileTypes = async$3.read = void 0;
const fsStat$5 = out$1;
const rpl = runParallel_1;
const constants_1$1 = constants;
const utils$8 = utils$9;
const common$5 = common$6;
function read$1(directory, settings, callback) {
    if (!settings.stats && constants_1$1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        readdirWithFileTypes$1(directory, settings, callback);
        return;
    }
    readdir$1(directory, settings, callback);
}
async$3.read = read$1;
function readdirWithFileTypes$1(directory, settings, callback) {
    settings.fs.readdir(directory, { withFileTypes: true }, (readdirError, dirents) => {
        if (readdirError !== null) {
            callFailureCallback$1(callback, readdirError);
            return;
        }
        const entries = dirents.map((dirent) => ({
            dirent,
            name: dirent.name,
            path: common$5.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        }));
        if (!settings.followSymbolicLinks) {
            callSuccessCallback$1(callback, entries);
            return;
        }
        const tasks = entries.map((entry) => makeRplTaskEntry(entry, settings));
        rpl(tasks, (rplError, rplEntries) => {
            if (rplError !== null) {
                callFailureCallback$1(callback, rplError);
                return;
            }
            callSuccessCallback$1(callback, rplEntries);
        });
    });
}
async$3.readdirWithFileTypes = readdirWithFileTypes$1;
function makeRplTaskEntry(entry, settings) {
    return (done) => {
        if (!entry.dirent.isSymbolicLink()) {
            done(null, entry);
            return;
        }
        settings.fs.stat(entry.path, (statError, stats) => {
            if (statError !== null) {
                if (settings.throwErrorOnBrokenSymbolicLink) {
                    done(statError);
                    return;
                }
                done(null, entry);
                return;
            }
            entry.dirent = utils$8.fs.createDirentFromStats(entry.name, stats);
            done(null, entry);
        });
    };
}
function readdir$1(directory, settings, callback) {
    settings.fs.readdir(directory, (readdirError, names) => {
        if (readdirError !== null) {
            callFailureCallback$1(callback, readdirError);
            return;
        }
        const tasks = names.map((name) => {
            const path = common$5.joinPathSegments(directory, name, settings.pathSegmentSeparator);
            return (done) => {
                fsStat$5.stat(path, settings.fsStatSettings, (error, stats) => {
                    if (error !== null) {
                        done(error);
                        return;
                    }
                    const entry = {
                        name,
                        path,
                        dirent: utils$8.fs.createDirentFromStats(name, stats)
                    };
                    if (settings.stats) {
                        entry.stats = stats;
                    }
                    done(null, entry);
                });
            };
        });
        rpl(tasks, (rplError, entries) => {
            if (rplError !== null) {
                callFailureCallback$1(callback, rplError);
                return;
            }
            callSuccessCallback$1(callback, entries);
        });
    });
}
async$3.readdir = readdir$1;
function callFailureCallback$1(callback, error) {
    callback(error);
}
function callSuccessCallback$1(callback, result) {
    callback(null, result);
}

var sync$5 = {};

Object.defineProperty(sync$5, "__esModule", { value: true });
sync$5.readdir = sync$5.readdirWithFileTypes = sync$5.read = void 0;
const fsStat$4 = out$1;
const constants_1 = constants;
const utils$7 = utils$9;
const common$4 = common$6;
function read(directory, settings) {
    if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        return readdirWithFileTypes(directory, settings);
    }
    return readdir(directory, settings);
}
sync$5.read = read;
function readdirWithFileTypes(directory, settings) {
    const dirents = settings.fs.readdirSync(directory, { withFileTypes: true });
    return dirents.map((dirent) => {
        const entry = {
            dirent,
            name: dirent.name,
            path: common$4.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        };
        if (entry.dirent.isSymbolicLink() && settings.followSymbolicLinks) {
            try {
                const stats = settings.fs.statSync(entry.path);
                entry.dirent = utils$7.fs.createDirentFromStats(entry.name, stats);
            }
            catch (error) {
                if (settings.throwErrorOnBrokenSymbolicLink) {
                    throw error;
                }
            }
        }
        return entry;
    });
}
sync$5.readdirWithFileTypes = readdirWithFileTypes;
function readdir(directory, settings) {
    const names = settings.fs.readdirSync(directory);
    return names.map((name) => {
        const entryPath = common$4.joinPathSegments(directory, name, settings.pathSegmentSeparator);
        const stats = fsStat$4.statSync(entryPath, settings.fsStatSettings);
        const entry = {
            name,
            path: entryPath,
            dirent: utils$7.fs.createDirentFromStats(name, stats)
        };
        if (settings.stats) {
            entry.stats = stats;
        }
        return entry;
    });
}
sync$5.readdir = readdir;

var settings$2 = {};

var fs$1 = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createFileSystemAdapter = exports.FILE_SYSTEM_ADAPTER = void 0;
	const fs = require$$0$2;
	exports.FILE_SYSTEM_ADAPTER = {
	    lstat: fs.lstat,
	    stat: fs.stat,
	    lstatSync: fs.lstatSync,
	    statSync: fs.statSync,
	    readdir: fs.readdir,
	    readdirSync: fs.readdirSync
	};
	function createFileSystemAdapter(fsMethods) {
	    if (fsMethods === undefined) {
	        return exports.FILE_SYSTEM_ADAPTER;
	    }
	    return Object.assign(Object.assign({}, exports.FILE_SYSTEM_ADAPTER), fsMethods);
	}
	exports.createFileSystemAdapter = createFileSystemAdapter; 
} (fs$1));

Object.defineProperty(settings$2, "__esModule", { value: true });
const path$3 = p$1;
const fsStat$3 = out$1;
const fs = fs$1;
let Settings$1 = class Settings {
    constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, false);
        this.fs = fs.createFileSystemAdapter(this._options.fs);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path$3.sep);
        this.stats = this._getValue(this._options.stats, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
        this.fsStatSettings = new fsStat$3.Settings({
            followSymbolicLink: this.followSymbolicLinks,
            fs: this.fs,
            throwErrorOnBrokenSymbolicLink: this.throwErrorOnBrokenSymbolicLink
        });
    }
    _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
    }
};
settings$2.default = Settings$1;

Object.defineProperty(out$2, "__esModule", { value: true });
out$2.Settings = out$2.scandirSync = out$2.scandir = void 0;
const async = async$3;
const sync$4 = sync$5;
const settings_1$2 = settings$2;
out$2.Settings = settings_1$2.default;
function scandir(path, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        async.read(path, getSettings$1(), optionsOrSettingsOrCallback);
        return;
    }
    async.read(path, getSettings$1(optionsOrSettingsOrCallback), callback);
}
out$2.scandir = scandir;
function scandirSync(path, optionsOrSettings) {
    const settings = getSettings$1(optionsOrSettings);
    return sync$4.read(path, settings);
}
out$2.scandirSync = scandirSync;
function getSettings$1(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1$2.default) {
        return settingsOrOptions;
    }
    return new settings_1$2.default(settingsOrOptions);
}

var queue = {exports: {}};

function reusify$1 (Constructor) {
  var head = new Constructor();
  var tail = head;

  function get () {
    var current = head;

    if (current.next) {
      head = current.next;
    } else {
      head = new Constructor();
      tail = head;
    }

    current.next = null;

    return current
  }

  function release (obj) {
    tail.next = obj;
    tail = obj;
  }

  return {
    get: get,
    release: release
  }
}

var reusify_1 = reusify$1;

/* eslint-disable no-var */

var reusify = reusify_1;

function fastqueue (context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  if (concurrency < 1) {
    throw new Error('fastqueue concurrency must be greater than 1')
  }

  var cache = reusify(Task);
  var queueHead = null;
  var queueTail = null;
  var _running = 0;
  var errorHandler = null;

  var self = {
    push: push,
    drain: noop,
    saturated: noop,
    pause: pause,
    paused: false,
    concurrency: concurrency,
    running: running,
    resume: resume,
    idle: idle,
    length: length,
    getQueue: getQueue,
    unshift: unshift,
    empty: noop,
    kill: kill,
    killAndDrain: killAndDrain,
    error: error
  };

  return self

  function running () {
    return _running
  }

  function pause () {
    self.paused = true;
  }

  function length () {
    var current = queueHead;
    var counter = 0;

    while (current) {
      current = current.next;
      counter++;
    }

    return counter
  }

  function getQueue () {
    var current = queueHead;
    var tasks = [];

    while (current) {
      tasks.push(current.value);
      current = current.next;
    }

    return tasks
  }

  function resume () {
    if (!self.paused) return
    self.paused = false;
    for (var i = 0; i < self.concurrency; i++) {
      _running++;
      release();
    }
  }

  function idle () {
    return _running === 0 && self.length() === 0
  }

  function push (value, done) {
    var current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;
    current.errorHandler = errorHandler;

    if (_running === self.concurrency || self.paused) {
      if (queueTail) {
        queueTail.next = current;
        queueTail = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function unshift (value, done) {
    var current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;

    if (_running === self.concurrency || self.paused) {
      if (queueHead) {
        current.next = queueHead;
        queueHead = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function release (holder) {
    if (holder) {
      cache.release(holder);
    }
    var next = queueHead;
    if (next) {
      if (!self.paused) {
        if (queueTail === queueHead) {
          queueTail = null;
        }
        queueHead = next.next;
        next.next = null;
        worker.call(context, next.value, next.worked);
        if (queueTail === null) {
          self.empty();
        }
      } else {
        _running--;
      }
    } else if (--_running === 0) {
      self.drain();
    }
  }

  function kill () {
    queueHead = null;
    queueTail = null;
    self.drain = noop;
  }

  function killAndDrain () {
    queueHead = null;
    queueTail = null;
    self.drain();
    self.drain = noop;
  }

  function error (handler) {
    errorHandler = handler;
  }
}

function noop () {}

function Task () {
  this.value = null;
  this.callback = noop;
  this.next = null;
  this.release = noop;
  this.context = null;
  this.errorHandler = null;

  var self = this;

  this.worked = function worked (err, result) {
    var callback = self.callback;
    var errorHandler = self.errorHandler;
    var val = self.value;
    self.value = null;
    self.callback = noop;
    if (self.errorHandler) {
      errorHandler(err, val);
    }
    callback.call(self.context, err, result);
    self.release(self);
  };
}

function queueAsPromised (context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  function asyncWrapper (arg, cb) {
    worker.call(this, arg)
      .then(function (res) {
        cb(null, res);
      }, cb);
  }

  var queue = fastqueue(context, asyncWrapper, concurrency);

  var pushCb = queue.push;
  var unshiftCb = queue.unshift;

  queue.push = push;
  queue.unshift = unshift;
  queue.drained = drained;

  return queue

  function push (value) {
    var p = new Promise(function (resolve, reject) {
      pushCb(value, function (err, result) {
        if (err) {
          reject(err);
          return
        }
        resolve(result);
      });
    });

    // Let's fork the promise chain to
    // make the error bubble up to the user but
    // not lead to a unhandledRejection
    p.catch(noop);

    return p
  }

  function unshift (value) {
    var p = new Promise(function (resolve, reject) {
      unshiftCb(value, function (err, result) {
        if (err) {
          reject(err);
          return
        }
        resolve(result);
      });
    });

    // Let's fork the promise chain to
    // make the error bubble up to the user but
    // not lead to a unhandledRejection
    p.catch(noop);

    return p
  }

  function drained () {
    var previousDrain = queue.drain;

    var p = new Promise(function (resolve) {
      queue.drain = function () {
        previousDrain();
        resolve();
      };
    });

    return p
  }
}

queue.exports = fastqueue;
queue.exports.promise = queueAsPromised;

var queueExports = queue.exports;

var common$3 = {};

Object.defineProperty(common$3, "__esModule", { value: true });
common$3.joinPathSegments = common$3.replacePathSegmentSeparator = common$3.isAppliedFilter = common$3.isFatalError = void 0;
function isFatalError(settings, error) {
    if (settings.errorFilter === null) {
        return true;
    }
    return !settings.errorFilter(error);
}
common$3.isFatalError = isFatalError;
function isAppliedFilter(filter, value) {
    return filter === null || filter(value);
}
common$3.isAppliedFilter = isAppliedFilter;
function replacePathSegmentSeparator(filepath, separator) {
    return filepath.split(/[/\\]/).join(separator);
}
common$3.replacePathSegmentSeparator = replacePathSegmentSeparator;
function joinPathSegments(a, b, separator) {
    if (a === '') {
        return b;
    }
    /**
     * The correct handling of cases when the first segment is a root (`/`, `C:/`) or UNC path (`//?/C:/`).
     */
    if (a.endsWith(separator)) {
        return a + b;
    }
    return a + separator + b;
}
common$3.joinPathSegments = joinPathSegments;

var reader$1 = {};

Object.defineProperty(reader$1, "__esModule", { value: true });
const common$2 = common$3;
let Reader$1 = class Reader {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._root = common$2.replacePathSegmentSeparator(_root, _settings.pathSegmentSeparator);
    }
};
reader$1.default = Reader$1;

Object.defineProperty(async$4, "__esModule", { value: true });
const events_1 = require$$2;
const fsScandir$2 = out$2;
const fastq = queueExports;
const common$1 = common$3;
const reader_1$4 = reader$1;
class AsyncReader extends reader_1$4.default {
    constructor(_root, _settings) {
        super(_root, _settings);
        this._settings = _settings;
        this._scandir = fsScandir$2.scandir;
        this._emitter = new events_1.EventEmitter();
        this._queue = fastq(this._worker.bind(this), this._settings.concurrency);
        this._isFatalError = false;
        this._isDestroyed = false;
        this._queue.drain = () => {
            if (!this._isFatalError) {
                this._emitter.emit('end');
            }
        };
    }
    read() {
        this._isFatalError = false;
        this._isDestroyed = false;
        setImmediate(() => {
            this._pushToQueue(this._root, this._settings.basePath);
        });
        return this._emitter;
    }
    get isDestroyed() {
        return this._isDestroyed;
    }
    destroy() {
        if (this._isDestroyed) {
            throw new Error('The reader is already destroyed');
        }
        this._isDestroyed = true;
        this._queue.killAndDrain();
    }
    onEntry(callback) {
        this._emitter.on('entry', callback);
    }
    onError(callback) {
        this._emitter.once('error', callback);
    }
    onEnd(callback) {
        this._emitter.once('end', callback);
    }
    _pushToQueue(directory, base) {
        const queueItem = { directory, base };
        this._queue.push(queueItem, (error) => {
            if (error !== null) {
                this._handleError(error);
            }
        });
    }
    _worker(item, done) {
        this._scandir(item.directory, this._settings.fsScandirSettings, (error, entries) => {
            if (error !== null) {
                done(error, undefined);
                return;
            }
            for (const entry of entries) {
                this._handleEntry(entry, item.base);
            }
            done(null, undefined);
        });
    }
    _handleError(error) {
        if (this._isDestroyed || !common$1.isFatalError(this._settings, error)) {
            return;
        }
        this._isFatalError = true;
        this._isDestroyed = true;
        this._emitter.emit('error', error);
    }
    _handleEntry(entry, base) {
        if (this._isDestroyed || this._isFatalError) {
            return;
        }
        const fullpath = entry.path;
        if (base !== undefined) {
            entry.path = common$1.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common$1.isAppliedFilter(this._settings.entryFilter, entry)) {
            this._emitEntry(entry);
        }
        if (entry.dirent.isDirectory() && common$1.isAppliedFilter(this._settings.deepFilter, entry)) {
            this._pushToQueue(fullpath, base === undefined ? undefined : entry.path);
        }
    }
    _emitEntry(entry) {
        this._emitter.emit('entry', entry);
    }
}
async$4.default = AsyncReader;

Object.defineProperty(async$5, "__esModule", { value: true });
const async_1$4 = async$4;
class AsyncProvider {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1$4.default(this._root, this._settings);
        this._storage = [];
    }
    read(callback) {
        this._reader.onError((error) => {
            callFailureCallback(callback, error);
        });
        this._reader.onEntry((entry) => {
            this._storage.push(entry);
        });
        this._reader.onEnd(() => {
            callSuccessCallback(callback, this._storage);
        });
        this._reader.read();
    }
}
async$5.default = AsyncProvider;
function callFailureCallback(callback, error) {
    callback(error);
}
function callSuccessCallback(callback, entries) {
    callback(null, entries);
}

var stream$2 = {};

Object.defineProperty(stream$2, "__esModule", { value: true });
const stream_1$5 = require$$0$1;
const async_1$3 = async$4;
class StreamProvider {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1$3.default(this._root, this._settings);
        this._stream = new stream_1$5.Readable({
            objectMode: true,
            read: () => { },
            destroy: () => {
                if (!this._reader.isDestroyed) {
                    this._reader.destroy();
                }
            }
        });
    }
    read() {
        this._reader.onError((error) => {
            this._stream.emit('error', error);
        });
        this._reader.onEntry((entry) => {
            this._stream.push(entry);
        });
        this._reader.onEnd(() => {
            this._stream.push(null);
        });
        this._reader.read();
        return this._stream;
    }
}
stream$2.default = StreamProvider;

var sync$3 = {};

var sync$2 = {};

Object.defineProperty(sync$2, "__esModule", { value: true });
const fsScandir$1 = out$2;
const common = common$3;
const reader_1$3 = reader$1;
class SyncReader extends reader_1$3.default {
    constructor() {
        super(...arguments);
        this._scandir = fsScandir$1.scandirSync;
        this._storage = [];
        this._queue = new Set();
    }
    read() {
        this._pushToQueue(this._root, this._settings.basePath);
        this._handleQueue();
        return this._storage;
    }
    _pushToQueue(directory, base) {
        this._queue.add({ directory, base });
    }
    _handleQueue() {
        for (const item of this._queue.values()) {
            this._handleDirectory(item.directory, item.base);
        }
    }
    _handleDirectory(directory, base) {
        try {
            const entries = this._scandir(directory, this._settings.fsScandirSettings);
            for (const entry of entries) {
                this._handleEntry(entry, base);
            }
        }
        catch (error) {
            this._handleError(error);
        }
    }
    _handleError(error) {
        if (!common.isFatalError(this._settings, error)) {
            return;
        }
        throw error;
    }
    _handleEntry(entry, base) {
        const fullpath = entry.path;
        if (base !== undefined) {
            entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
            this._pushToStorage(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
            this._pushToQueue(fullpath, base === undefined ? undefined : entry.path);
        }
    }
    _pushToStorage(entry) {
        this._storage.push(entry);
    }
}
sync$2.default = SyncReader;

Object.defineProperty(sync$3, "__esModule", { value: true });
const sync_1$3 = sync$2;
class SyncProvider {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new sync_1$3.default(this._root, this._settings);
    }
    read() {
        return this._reader.read();
    }
}
sync$3.default = SyncProvider;

var settings$1 = {};

Object.defineProperty(settings$1, "__esModule", { value: true });
const path$2 = p$1;
const fsScandir = out$2;
class Settings {
    constructor(_options = {}) {
        this._options = _options;
        this.basePath = this._getValue(this._options.basePath, undefined);
        this.concurrency = this._getValue(this._options.concurrency, Number.POSITIVE_INFINITY);
        this.deepFilter = this._getValue(this._options.deepFilter, null);
        this.entryFilter = this._getValue(this._options.entryFilter, null);
        this.errorFilter = this._getValue(this._options.errorFilter, null);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path$2.sep);
        this.fsScandirSettings = new fsScandir.Settings({
            followSymbolicLinks: this._options.followSymbolicLinks,
            fs: this._options.fs,
            pathSegmentSeparator: this._options.pathSegmentSeparator,
            stats: this._options.stats,
            throwErrorOnBrokenSymbolicLink: this._options.throwErrorOnBrokenSymbolicLink
        });
    }
    _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
    }
}
settings$1.default = Settings;

Object.defineProperty(out$3, "__esModule", { value: true });
out$3.Settings = out$3.walkStream = out$3.walkSync = out$3.walk = void 0;
const async_1$2 = async$5;
const stream_1$4 = stream$2;
const sync_1$2 = sync$3;
const settings_1$1 = settings$1;
out$3.Settings = settings_1$1.default;
function walk(directory, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        new async_1$2.default(directory, getSettings()).read(optionsOrSettingsOrCallback);
        return;
    }
    new async_1$2.default(directory, getSettings(optionsOrSettingsOrCallback)).read(callback);
}
out$3.walk = walk;
function walkSync(directory, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    const provider = new sync_1$2.default(directory, settings);
    return provider.read();
}
out$3.walkSync = walkSync;
function walkStream(directory, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    const provider = new stream_1$4.default(directory, settings);
    return provider.read();
}
out$3.walkStream = walkStream;
function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1$1.default) {
        return settingsOrOptions;
    }
    return new settings_1$1.default(settingsOrOptions);
}

var reader = {};

Object.defineProperty(reader, "__esModule", { value: true });
const path$1 = p$1;
const fsStat$2 = out$1;
const utils$6 = utils$b;
class Reader {
    constructor(_settings) {
        this._settings = _settings;
        this._fsStatSettings = new fsStat$2.Settings({
            followSymbolicLink: this._settings.followSymbolicLinks,
            fs: this._settings.fs,
            throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks
        });
    }
    _getFullEntryPath(filepath) {
        return path$1.resolve(this._settings.cwd, filepath);
    }
    _makeEntry(stats, pattern) {
        const entry = {
            name: pattern,
            path: pattern,
            dirent: utils$6.fs.createDirentFromStats(pattern, stats)
        };
        if (this._settings.stats) {
            entry.stats = stats;
        }
        return entry;
    }
    _isFatalError(error) {
        return !utils$6.errno.isEnoentCodeError(error) && !this._settings.suppressErrors;
    }
}
reader.default = Reader;

var stream$1 = {};

Object.defineProperty(stream$1, "__esModule", { value: true });
const stream_1$3 = require$$0$1;
const fsStat$1 = out$1;
const fsWalk$2 = out$3;
const reader_1$2 = reader;
class ReaderStream extends reader_1$2.default {
    constructor() {
        super(...arguments);
        this._walkStream = fsWalk$2.walkStream;
        this._stat = fsStat$1.stat;
    }
    dynamic(root, options) {
        return this._walkStream(root, options);
    }
    static(patterns, options) {
        const filepaths = patterns.map(this._getFullEntryPath, this);
        const stream = new stream_1$3.PassThrough({ objectMode: true });
        stream._write = (index, _enc, done) => {
            return this._getEntry(filepaths[index], patterns[index], options)
                .then((entry) => {
                if (entry !== null && options.entryFilter(entry)) {
                    stream.push(entry);
                }
                if (index === filepaths.length - 1) {
                    stream.end();
                }
                done();
            })
                .catch(done);
        };
        for (let i = 0; i < filepaths.length; i++) {
            stream.write(i);
        }
        return stream;
    }
    _getEntry(filepath, pattern, options) {
        return this._getStat(filepath)
            .then((stats) => this._makeEntry(stats, pattern))
            .catch((error) => {
            if (options.errorFilter(error)) {
                return null;
            }
            throw error;
        });
    }
    _getStat(filepath) {
        return new Promise((resolve, reject) => {
            this._stat(filepath, this._fsStatSettings, (error, stats) => {
                return error === null ? resolve(stats) : reject(error);
            });
        });
    }
}
stream$1.default = ReaderStream;

Object.defineProperty(async$6, "__esModule", { value: true });
const fsWalk$1 = out$3;
const reader_1$1 = reader;
const stream_1$2 = stream$1;
class ReaderAsync extends reader_1$1.default {
    constructor() {
        super(...arguments);
        this._walkAsync = fsWalk$1.walk;
        this._readerStream = new stream_1$2.default(this._settings);
    }
    dynamic(root, options) {
        return new Promise((resolve, reject) => {
            this._walkAsync(root, options, (error, entries) => {
                if (error === null) {
                    resolve(entries);
                }
                else {
                    reject(error);
                }
            });
        });
    }
    async static(patterns, options) {
        const entries = [];
        const stream = this._readerStream.static(patterns, options);
        // After #235, replace it with an asynchronous iterator.
        return new Promise((resolve, reject) => {
            stream.once('error', reject);
            stream.on('data', (entry) => entries.push(entry));
            stream.once('end', () => resolve(entries));
        });
    }
}
async$6.default = ReaderAsync;

var provider = {};

var deep = {};

var partial = {};

var matcher = {};

Object.defineProperty(matcher, "__esModule", { value: true });
const utils$5 = utils$b;
class Matcher {
    constructor(_patterns, _settings, _micromatchOptions) {
        this._patterns = _patterns;
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this._storage = [];
        this._fillStorage();
    }
    _fillStorage() {
        for (const pattern of this._patterns) {
            const segments = this._getPatternSegments(pattern);
            const sections = this._splitSegmentsIntoSections(segments);
            this._storage.push({
                complete: sections.length <= 1,
                pattern,
                segments,
                sections
            });
        }
    }
    _getPatternSegments(pattern) {
        const parts = utils$5.pattern.getPatternParts(pattern, this._micromatchOptions);
        return parts.map((part) => {
            const dynamic = utils$5.pattern.isDynamicPattern(part, this._settings);
            if (!dynamic) {
                return {
                    dynamic: false,
                    pattern: part
                };
            }
            return {
                dynamic: true,
                pattern: part,
                patternRe: utils$5.pattern.makeRe(part, this._micromatchOptions)
            };
        });
    }
    _splitSegmentsIntoSections(segments) {
        return utils$5.array.splitWhen(segments, (segment) => segment.dynamic && utils$5.pattern.hasGlobStar(segment.pattern));
    }
}
matcher.default = Matcher;

Object.defineProperty(partial, "__esModule", { value: true });
const matcher_1 = matcher;
class PartialMatcher extends matcher_1.default {
    match(filepath) {
        const parts = filepath.split('/');
        const levels = parts.length;
        const patterns = this._storage.filter((info) => !info.complete || info.segments.length > levels);
        for (const pattern of patterns) {
            const section = pattern.sections[0];
            /**
             * In this case, the pattern has a globstar and we must read all directories unconditionally,
             * but only if the level has reached the end of the first group.
             *
             * fixtures/{a,b}/**
             *  ^ true/false  ^ always true
            */
            if (!pattern.complete && levels > section.length) {
                return true;
            }
            const match = parts.every((part, index) => {
                const segment = pattern.segments[index];
                if (segment.dynamic && segment.patternRe.test(part)) {
                    return true;
                }
                if (!segment.dynamic && segment.pattern === part) {
                    return true;
                }
                return false;
            });
            if (match) {
                return true;
            }
        }
        return false;
    }
}
partial.default = PartialMatcher;

Object.defineProperty(deep, "__esModule", { value: true });
const utils$4 = utils$b;
const partial_1 = partial;
class DeepFilter {
    constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
    }
    getFilter(basePath, positive, negative) {
        const matcher = this._getMatcher(positive);
        const negativeRe = this._getNegativePatternsRe(negative);
        return (entry) => this._filter(basePath, entry, matcher, negativeRe);
    }
    _getMatcher(patterns) {
        return new partial_1.default(patterns, this._settings, this._micromatchOptions);
    }
    _getNegativePatternsRe(patterns) {
        const affectDepthOfReadingPatterns = patterns.filter(utils$4.pattern.isAffectDepthOfReadingPattern);
        return utils$4.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
    }
    _filter(basePath, entry, matcher, negativeRe) {
        if (this._isSkippedByDeep(basePath, entry.path)) {
            return false;
        }
        if (this._isSkippedSymbolicLink(entry)) {
            return false;
        }
        const filepath = utils$4.path.removeLeadingDotSegment(entry.path);
        if (this._isSkippedByPositivePatterns(filepath, matcher)) {
            return false;
        }
        return this._isSkippedByNegativePatterns(filepath, negativeRe);
    }
    _isSkippedByDeep(basePath, entryPath) {
        /**
         * Avoid unnecessary depth calculations when it doesn't matter.
         */
        if (this._settings.deep === Infinity) {
            return false;
        }
        return this._getEntryLevel(basePath, entryPath) >= this._settings.deep;
    }
    _getEntryLevel(basePath, entryPath) {
        const entryPathDepth = entryPath.split('/').length;
        if (basePath === '') {
            return entryPathDepth;
        }
        const basePathDepth = basePath.split('/').length;
        return entryPathDepth - basePathDepth;
    }
    _isSkippedSymbolicLink(entry) {
        return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
    }
    _isSkippedByPositivePatterns(entryPath, matcher) {
        return !this._settings.baseNameMatch && !matcher.match(entryPath);
    }
    _isSkippedByNegativePatterns(entryPath, patternsRe) {
        return !utils$4.pattern.matchAny(entryPath, patternsRe);
    }
}
deep.default = DeepFilter;

var entry$1 = {};

Object.defineProperty(entry$1, "__esModule", { value: true });
const utils$3 = utils$b;
class EntryFilter {
    constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this.index = new Map();
    }
    getFilter(positive, negative) {
        const positiveRe = utils$3.pattern.convertPatternsToRe(positive, this._micromatchOptions);
        const negativeRe = utils$3.pattern.convertPatternsToRe(negative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true }));
        return (entry) => this._filter(entry, positiveRe, negativeRe);
    }
    _filter(entry, positiveRe, negativeRe) {
        const filepath = utils$3.path.removeLeadingDotSegment(entry.path);
        if (this._settings.unique && this._isDuplicateEntry(filepath)) {
            return false;
        }
        if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
            return false;
        }
        if (this._isSkippedByAbsoluteNegativePatterns(filepath, negativeRe)) {
            return false;
        }
        const isDirectory = entry.dirent.isDirectory();
        const isMatched = this._isMatchToPatterns(filepath, positiveRe, isDirectory) && !this._isMatchToPatterns(filepath, negativeRe, isDirectory);
        if (this._settings.unique && isMatched) {
            this._createIndexRecord(filepath);
        }
        return isMatched;
    }
    _isDuplicateEntry(filepath) {
        return this.index.has(filepath);
    }
    _createIndexRecord(filepath) {
        this.index.set(filepath, undefined);
    }
    _onlyFileFilter(entry) {
        return this._settings.onlyFiles && !entry.dirent.isFile();
    }
    _onlyDirectoryFilter(entry) {
        return this._settings.onlyDirectories && !entry.dirent.isDirectory();
    }
    _isSkippedByAbsoluteNegativePatterns(entryPath, patternsRe) {
        if (!this._settings.absolute) {
            return false;
        }
        const fullpath = utils$3.path.makeAbsolute(this._settings.cwd, entryPath);
        return utils$3.pattern.matchAny(fullpath, patternsRe);
    }
    _isMatchToPatterns(filepath, patternsRe, isDirectory) {
        // Trying to match files and directories by patterns.
        const isMatched = utils$3.pattern.matchAny(filepath, patternsRe);
        // A pattern with a trailling slash can be used for directory matching.
        // To apply such pattern, we need to add a tralling slash to the path.
        if (!isMatched && isDirectory) {
            return utils$3.pattern.matchAny(filepath + '/', patternsRe);
        }
        return isMatched;
    }
}
entry$1.default = EntryFilter;

var error = {};

Object.defineProperty(error, "__esModule", { value: true });
const utils$2 = utils$b;
class ErrorFilter {
    constructor(_settings) {
        this._settings = _settings;
    }
    getFilter() {
        return (error) => this._isNonFatalError(error);
    }
    _isNonFatalError(error) {
        return utils$2.errno.isEnoentCodeError(error) || this._settings.suppressErrors;
    }
}
error.default = ErrorFilter;

var entry = {};

Object.defineProperty(entry, "__esModule", { value: true });
const utils$1 = utils$b;
class EntryTransformer {
    constructor(_settings) {
        this._settings = _settings;
    }
    getTransformer() {
        return (entry) => this._transform(entry);
    }
    _transform(entry) {
        let filepath = entry.path;
        if (this._settings.absolute) {
            filepath = utils$1.path.makeAbsolute(this._settings.cwd, filepath);
            filepath = utils$1.path.unixify(filepath);
        }
        if (this._settings.markDirectories && entry.dirent.isDirectory()) {
            filepath += '/';
        }
        if (!this._settings.objectMode) {
            return filepath;
        }
        return Object.assign(Object.assign({}, entry), { path: filepath });
    }
}
entry.default = EntryTransformer;

Object.defineProperty(provider, "__esModule", { value: true });
const path = p$1;
const deep_1 = deep;
const entry_1 = entry$1;
const error_1 = error;
const entry_2 = entry;
class Provider {
    constructor(_settings) {
        this._settings = _settings;
        this.errorFilter = new error_1.default(this._settings);
        this.entryFilter = new entry_1.default(this._settings, this._getMicromatchOptions());
        this.deepFilter = new deep_1.default(this._settings, this._getMicromatchOptions());
        this.entryTransformer = new entry_2.default(this._settings);
    }
    _getRootDirectory(task) {
        return path.resolve(this._settings.cwd, task.base);
    }
    _getReaderOptions(task) {
        const basePath = task.base === '.' ? '' : task.base;
        return {
            basePath,
            pathSegmentSeparator: '/',
            concurrency: this._settings.concurrency,
            deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
            entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
            errorFilter: this.errorFilter.getFilter(),
            followSymbolicLinks: this._settings.followSymbolicLinks,
            fs: this._settings.fs,
            stats: this._settings.stats,
            throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
            transform: this.entryTransformer.getTransformer()
        };
    }
    _getMicromatchOptions() {
        return {
            dot: this._settings.dot,
            matchBase: this._settings.baseNameMatch,
            nobrace: !this._settings.braceExpansion,
            nocase: !this._settings.caseSensitiveMatch,
            noext: !this._settings.extglob,
            noglobstar: !this._settings.globstar,
            posix: true,
            strictSlashes: false
        };
    }
}
provider.default = Provider;

Object.defineProperty(async$7, "__esModule", { value: true });
const async_1$1 = async$6;
const provider_1$2 = provider;
class ProviderAsync extends provider_1$2.default {
    constructor() {
        super(...arguments);
        this._reader = new async_1$1.default(this._settings);
    }
    async read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = await this.api(root, task, options);
        return entries.map((entry) => options.transform(entry));
    }
    api(root, task, options) {
        if (task.dynamic) {
            return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
    }
}
async$7.default = ProviderAsync;

var stream = {};

Object.defineProperty(stream, "__esModule", { value: true });
const stream_1$1 = require$$0$1;
const stream_2 = stream$1;
const provider_1$1 = provider;
class ProviderStream extends provider_1$1.default {
    constructor() {
        super(...arguments);
        this._reader = new stream_2.default(this._settings);
    }
    read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const source = this.api(root, task, options);
        const destination = new stream_1$1.Readable({ objectMode: true, read: () => { } });
        source
            .once('error', (error) => destination.emit('error', error))
            .on('data', (entry) => destination.emit('data', options.transform(entry)))
            .once('end', () => destination.emit('end'));
        destination
            .once('close', () => source.destroy());
        return destination;
    }
    api(root, task, options) {
        if (task.dynamic) {
            return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
    }
}
stream.default = ProviderStream;

var sync$1 = {};

var sync = {};

Object.defineProperty(sync, "__esModule", { value: true });
const fsStat = out$1;
const fsWalk = out$3;
const reader_1 = reader;
class ReaderSync extends reader_1.default {
    constructor() {
        super(...arguments);
        this._walkSync = fsWalk.walkSync;
        this._statSync = fsStat.statSync;
    }
    dynamic(root, options) {
        return this._walkSync(root, options);
    }
    static(patterns, options) {
        const entries = [];
        for (const pattern of patterns) {
            const filepath = this._getFullEntryPath(pattern);
            const entry = this._getEntry(filepath, pattern, options);
            if (entry === null || !options.entryFilter(entry)) {
                continue;
            }
            entries.push(entry);
        }
        return entries;
    }
    _getEntry(filepath, pattern, options) {
        try {
            const stats = this._getStat(filepath);
            return this._makeEntry(stats, pattern);
        }
        catch (error) {
            if (options.errorFilter(error)) {
                return null;
            }
            throw error;
        }
    }
    _getStat(filepath) {
        return this._statSync(filepath, this._fsStatSettings);
    }
}
sync.default = ReaderSync;

Object.defineProperty(sync$1, "__esModule", { value: true });
const sync_1$1 = sync;
const provider_1 = provider;
class ProviderSync extends provider_1.default {
    constructor() {
        super(...arguments);
        this._reader = new sync_1$1.default(this._settings);
    }
    read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = this.api(root, task, options);
        return entries.map(options.transform);
    }
    api(root, task, options) {
        if (task.dynamic) {
            return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
    }
}
sync$1.default = ProviderSync;

var settings = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DEFAULT_FILE_SYSTEM_ADAPTER = void 0;
	const fs = require$$0$2;
	const os = require$$0;
	/**
	 * The `os.cpus` method can return zero. We expect the number of cores to be greater than zero.
	 * https://github.com/nodejs/node/blob/7faeddf23a98c53896f8b574a6e66589e8fb1eb8/lib/os.js#L106-L107
	 */
	const CPU_COUNT = Math.max(os.cpus().length, 1);
	exports.DEFAULT_FILE_SYSTEM_ADAPTER = {
	    lstat: fs.lstat,
	    lstatSync: fs.lstatSync,
	    stat: fs.stat,
	    statSync: fs.statSync,
	    readdir: fs.readdir,
	    readdirSync: fs.readdirSync
	};
	class Settings {
	    constructor(_options = {}) {
	        this._options = _options;
	        this.absolute = this._getValue(this._options.absolute, false);
	        this.baseNameMatch = this._getValue(this._options.baseNameMatch, false);
	        this.braceExpansion = this._getValue(this._options.braceExpansion, true);
	        this.caseSensitiveMatch = this._getValue(this._options.caseSensitiveMatch, true);
	        this.concurrency = this._getValue(this._options.concurrency, CPU_COUNT);
	        this.cwd = this._getValue(this._options.cwd, process.cwd());
	        this.deep = this._getValue(this._options.deep, Infinity);
	        this.dot = this._getValue(this._options.dot, false);
	        this.extglob = this._getValue(this._options.extglob, true);
	        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, true);
	        this.fs = this._getFileSystemMethods(this._options.fs);
	        this.globstar = this._getValue(this._options.globstar, true);
	        this.ignore = this._getValue(this._options.ignore, []);
	        this.markDirectories = this._getValue(this._options.markDirectories, false);
	        this.objectMode = this._getValue(this._options.objectMode, false);
	        this.onlyDirectories = this._getValue(this._options.onlyDirectories, false);
	        this.onlyFiles = this._getValue(this._options.onlyFiles, true);
	        this.stats = this._getValue(this._options.stats, false);
	        this.suppressErrors = this._getValue(this._options.suppressErrors, false);
	        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, false);
	        this.unique = this._getValue(this._options.unique, true);
	        if (this.onlyDirectories) {
	            this.onlyFiles = false;
	        }
	        if (this.stats) {
	            this.objectMode = true;
	        }
	        // Remove the cast to the array in the next major (#404).
	        this.ignore = [].concat(this.ignore);
	    }
	    _getValue(option, value) {
	        return option === undefined ? value : option;
	    }
	    _getFileSystemMethods(methods = {}) {
	        return Object.assign(Object.assign({}, exports.DEFAULT_FILE_SYSTEM_ADAPTER), methods);
	    }
	}
	exports.default = Settings; 
} (settings));

const taskManager = tasks;
const async_1 = async$7;
const stream_1 = stream;
const sync_1 = sync$1;
const settings_1 = settings;
const utils = utils$b;
async function FastGlob(source, options) {
    assertPatternsInput(source);
    const works = getWorks(source, async_1.default, options);
    const result = await Promise.all(works);
    return utils.array.flatten(result);
}
// https://github.com/typescript-eslint/typescript-eslint/issues/60
// eslint-disable-next-line no-redeclare
(function (FastGlob) {
    FastGlob.glob = FastGlob;
    FastGlob.globSync = sync;
    FastGlob.globStream = stream;
    FastGlob.async = FastGlob;
    function sync(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, sync_1.default, options);
        return utils.array.flatten(works);
    }
    FastGlob.sync = sync;
    function stream(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, stream_1.default, options);
        /**
         * The stream returned by the provider cannot work with an asynchronous iterator.
         * To support asynchronous iterators, regardless of the number of tasks, we always multiplex streams.
         * This affects performance (+25%). I don't see best solution right now.
         */
        return utils.stream.merge(works);
    }
    FastGlob.stream = stream;
    function generateTasks(source, options) {
        assertPatternsInput(source);
        const patterns = [].concat(source);
        const settings = new settings_1.default(options);
        return taskManager.generate(patterns, settings);
    }
    FastGlob.generateTasks = generateTasks;
    function isDynamicPattern(source, options) {
        assertPatternsInput(source);
        const settings = new settings_1.default(options);
        return utils.pattern.isDynamicPattern(source, settings);
    }
    FastGlob.isDynamicPattern = isDynamicPattern;
    function escapePath(source) {
        assertPatternsInput(source);
        return utils.path.escape(source);
    }
    FastGlob.escapePath = escapePath;
    function convertPathToPattern(source) {
        assertPatternsInput(source);
        return utils.path.convertPathToPattern(source);
    }
    FastGlob.convertPathToPattern = convertPathToPattern;
    (function (posix) {
        function escapePath(source) {
            assertPatternsInput(source);
            return utils.path.escapePosixPath(source);
        }
        posix.escapePath = escapePath;
        function convertPathToPattern(source) {
            assertPatternsInput(source);
            return utils.path.convertPosixPathToPattern(source);
        }
        posix.convertPathToPattern = convertPathToPattern;
    })(FastGlob.posix || (FastGlob.posix = {}));
    (function (win32) {
        function escapePath(source) {
            assertPatternsInput(source);
            return utils.path.escapeWindowsPath(source);
        }
        win32.escapePath = escapePath;
        function convertPathToPattern(source) {
            assertPatternsInput(source);
            return utils.path.convertWindowsPathToPattern(source);
        }
        win32.convertPathToPattern = convertPathToPattern;
    })(FastGlob.win32 || (FastGlob.win32 = {}));
})(FastGlob || (FastGlob = {}));
function getWorks(source, _Provider, options) {
    const patterns = [].concat(source);
    const settings = new settings_1.default(options);
    const tasks = taskManager.generate(patterns, settings);
    const provider = new _Provider(settings);
    return tasks.map(provider.read, provider);
}
function assertPatternsInput(input) {
    const source = [].concat(input);
    const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
    if (!isValidSource) {
        throw new TypeError('Patterns must be a string (non empty) or an array of strings');
    }
}
var out = FastGlob;

var fg = /*@__PURE__*/getDefaultExportFromCjs(out);

const envsOrder = [
  "node",
  "jsdom",
  "happy-dom",
  "edge-runtime"
];
function getTransformMode(patterns, filename) {
  if (patterns.web && mm.isMatch(filename, patterns.web))
    return "web";
  if (patterns.ssr && mm.isMatch(filename, patterns.ssr))
    return "ssr";
  return void 0;
}
async function groupFilesByEnv(files) {
  const filesWithEnv = await Promise.all(files.map(async ([project, file]) => {
    var _a, _b;
    const code = await promises.readFile(file, "utf-8");
    let env = (_a = code.match(/@(?:vitest|jest)-environment\s+?([\w-]+)\b/)) == null ? void 0 : _a[1];
    if (!env) {
      for (const [glob, target] of project.config.environmentMatchGlobs || []) {
        if (mm.isMatch(file, glob, { cwd: project.config.root })) {
          env = target;
          break;
        }
      }
    }
    env || (env = project.config.environment || "node");
    const transformMode = getTransformMode(project.config.testTransformMode, file);
    const envOptions = JSON.parse(((_b = code.match(/@(?:vitest|jest)-environment-options\s+?(.+)/)) == null ? void 0 : _b[1]) || "null");
    const envKey = env === "happy-dom" ? "happyDOM" : env;
    const environment = {
      name: env,
      transformMode,
      options: envOptions ? { [envKey]: envOptions } : null
    };
    return {
      file,
      project,
      environment
    };
  }));
  return groupBy(filesWithEnv, ({ environment }) => environment.name);
}

function createMethodsRPC(project) {
  const ctx = project.ctx;
  return {
    snapshotSaved(snapshot) {
      ctx.snapshot.add(snapshot);
    },
    resolveSnapshotPath(testPath) {
      return ctx.snapshot.resolvePath(testPath);
    },
    async getSourceMap(id, force) {
      if (force) {
        const mod = project.server.moduleGraph.getModuleById(id);
        if (mod)
          project.server.moduleGraph.invalidateModule(mod);
      }
      const r = await project.vitenode.transformRequest(id);
      return r == null ? void 0 : r.map;
    },
    fetch(id, transformMode) {
      return project.vitenode.fetchModule(id, transformMode);
    },
    resolveId(id, importer, transformMode) {
      return project.vitenode.resolveId(id, importer, transformMode);
    },
    transform(id, environment) {
      return project.vitenode.transformModule(id, environment);
    },
    onPathsCollected(paths) {
      ctx.state.collectPaths(paths);
      return ctx.report("onPathsCollected", paths);
    },
    onCollected(files) {
      ctx.state.collectFiles(files);
      return ctx.report("onCollected", files);
    },
    onAfterSuiteRun(meta) {
      var _a;
      (_a = ctx.coverageProvider) == null ? void 0 : _a.onAfterSuiteRun(meta);
    },
    onTaskUpdate(packs) {
      ctx.state.updateTasks(packs);
      return ctx.report("onTaskUpdate", packs);
    },
    onUserConsoleLog(log) {
      ctx.state.updateUserLog(log);
      ctx.report("onUserConsoleLog", log);
    },
    onUnhandledError(err, type) {
      ctx.state.catchError(err, type);
    },
    onFinished(files) {
      return ctx.report("onFinished", files, ctx.state.getUnhandledErrors());
    },
    onCancel(reason) {
      ctx.cancelCurrentRun(reason);
    },
    getCountOfFailedTests() {
      return ctx.state.getCountOfFailedTests();
    }
  };
}

function createChildProcessChannel$1(project) {
  const emitter = new EventEmitter();
  const cleanup = () => emitter.removeAllListeners();
  const events = { message: "message", response: "response" };
  const channel = {
    onMessage: (callback) => emitter.on(events.message, callback),
    postMessage: (message) => emitter.emit(events.response, message)
  };
  const rpc = createBirpc(
    createMethodsRPC(project),
    {
      eventNames: ["onCancel"],
      serialize: v8.serialize,
      deserialize: (v) => v8.deserialize(Buffer.from(v)),
      post(v) {
        emitter.emit(events.message, v);
      },
      on(fn) {
        emitter.on(events.response, fn);
      }
    }
  );
  project.ctx.onCancel((reason) => rpc.onCancel(reason));
  return { channel, cleanup };
}
function stringifyRegex$1(input) {
  if (typeof input === "string")
    return input;
  return `$$vitest:${input.toString()}`;
}
function createForksPool(ctx, { execArgv, env }) {
  var _a;
  const numCpus = typeof nodeos.availableParallelism === "function" ? nodeos.availableParallelism() : nodeos.cpus().length;
  const threadsCount = ctx.config.watch ? Math.max(Math.floor(numCpus / 2), 1) : Math.max(numCpus - 1, 1);
  const poolOptions = ((_a = ctx.config.poolOptions) == null ? void 0 : _a.forks) ?? {};
  const maxThreads = poolOptions.maxForks ?? ctx.config.maxWorkers ?? threadsCount;
  const minThreads = poolOptions.minForks ?? ctx.config.minWorkers ?? threadsCount;
  const worker = resolve(ctx.distPath, "workers/forks.js");
  const options = {
    runtime: "child_process",
    filename: resolve(ctx.distPath, "worker.js"),
    maxThreads,
    minThreads,
    env,
    execArgv: [
      ...poolOptions.execArgv ?? [],
      ...execArgv
    ],
    terminateTimeout: ctx.config.teardownTimeout,
    concurrentTasksPerWorker: 1
  };
  const isolated = poolOptions.isolate ?? true;
  if (isolated)
    options.isolateWorkers = true;
  if (poolOptions.singleFork || !ctx.config.fileParallelism) {
    options.maxThreads = 1;
    options.minThreads = 1;
  }
  const pool = new Tinypool(options);
  const runWithFiles = (name) => {
    let id = 0;
    async function runFiles(project, config, files, environment, invalidates = []) {
      ctx.state.clearFiles(project, files);
      const { channel, cleanup } = createChildProcessChannel$1(project);
      const workerId = ++id;
      const data = {
        pool: "forks",
        worker,
        config,
        files,
        invalidates,
        environment,
        workerId,
        projectName: project.getName(),
        providedContext: project.getProvidedContext()
      };
      try {
        await pool.run(data, { name, channel });
      } catch (error) {
        if (error instanceof Error && /Failed to terminate worker/.test(error.message))
          ctx.state.addProcessTimeoutCause(`Failed to terminate worker while running ${files.join(", ")}.`);
        else if (ctx.isCancelling && error instanceof Error && /The task has been cancelled/.test(error.message))
          ctx.state.cancelFiles(files, ctx.config.root, project.config.name);
        else
          throw error;
      } finally {
        cleanup();
      }
    }
    return async (specs, invalidates) => {
      ctx.onCancel(() => pool.cancelPendingTasks());
      const configs = /* @__PURE__ */ new Map();
      const getConfig = (project) => {
        if (configs.has(project))
          return configs.get(project);
        const _config = project.getSerializableConfig();
        const config = {
          ..._config,
          // v8 serialize does not support regex
          testNamePattern: _config.testNamePattern ? stringifyRegex$1(_config.testNamePattern) : void 0
        };
        configs.set(project, config);
        return config;
      };
      const workspaceMap = /* @__PURE__ */ new Map();
      for (const [project, file] of specs) {
        const workspaceFiles = workspaceMap.get(file) ?? [];
        workspaceFiles.push(project);
        workspaceMap.set(file, workspaceFiles);
      }
      const singleFork = specs.filter(([project]) => {
        var _a2, _b;
        return (_b = (_a2 = project.config.poolOptions) == null ? void 0 : _a2.forks) == null ? void 0 : _b.singleFork;
      });
      const multipleForks = specs.filter(([project]) => {
        var _a2, _b;
        return !((_b = (_a2 = project.config.poolOptions) == null ? void 0 : _a2.forks) == null ? void 0 : _b.singleFork);
      });
      if (multipleForks.length) {
        const filesByEnv = await groupFilesByEnv(multipleForks);
        const files = Object.values(filesByEnv).flat();
        const results = [];
        if (isolated) {
          results.push(...await Promise.allSettled(files.map(({ file, environment, project }) => runFiles(project, getConfig(project), [file], environment, invalidates))));
        } else {
          const grouped = groupBy(files, ({ project, environment }) => project.getName() + environment.name + JSON.stringify(environment.options));
          for (const group of Object.values(grouped)) {
            results.push(...await Promise.allSettled(group.map(({ file, environment, project }) => runFiles(project, getConfig(project), [file], environment, invalidates))));
            await new Promise((resolve2) => pool.queueSize === 0 ? resolve2() : pool.once("drain", resolve2));
            await pool.recycleWorkers();
          }
        }
        const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason);
        if (errors.length > 0)
          throw new AggregateError(errors, "Errors occurred while running tests. For more information, see serialized error.");
      }
      if (singleFork.length) {
        const filesByEnv = await groupFilesByEnv(singleFork);
        const envs = envsOrder.concat(
          Object.keys(filesByEnv).filter((env2) => !envsOrder.includes(env2))
        );
        for (const env2 of envs) {
          const files = filesByEnv[env2];
          if (!(files == null ? void 0 : files.length))
            continue;
          const filesByOptions = groupBy(files, ({ project, environment }) => project.getName() + JSON.stringify(environment.options));
          for (const files2 of Object.values(filesByOptions)) {
            await pool.recycleWorkers();
            const filenames = files2.map((f) => f.file);
            await runFiles(files2[0].project, getConfig(files2[0].project), filenames, files2[0].environment, invalidates);
          }
        }
      }
    };
  };
  return {
    name: "forks",
    runTests: runWithFiles("run"),
    close: () => pool.destroy()
  };
}

function createWorkerChannel$1(project) {
  const channel = new MessageChannel();
  const port = channel.port2;
  const workerPort = channel.port1;
  const rpc = createBirpc(
    createMethodsRPC(project),
    {
      eventNames: ["onCancel"],
      post(v) {
        port.postMessage(v);
      },
      on(fn) {
        port.on("message", fn);
      }
    }
  );
  project.ctx.onCancel((reason) => rpc.onCancel(reason));
  return { workerPort, port };
}
function createThreadsPool(ctx, { execArgv, env }) {
  var _a;
  const numCpus = typeof nodeos.availableParallelism === "function" ? nodeos.availableParallelism() : nodeos.cpus().length;
  const threadsCount = ctx.config.watch ? Math.max(Math.floor(numCpus / 2), 1) : Math.max(numCpus - 1, 1);
  const poolOptions = ((_a = ctx.config.poolOptions) == null ? void 0 : _a.threads) ?? {};
  const maxThreads = poolOptions.maxThreads ?? ctx.config.maxWorkers ?? threadsCount;
  const minThreads = poolOptions.minThreads ?? ctx.config.minWorkers ?? threadsCount;
  const worker = resolve(ctx.distPath, "workers/threads.js");
  const options = {
    filename: resolve(ctx.distPath, "worker.js"),
    // TODO: investigate further
    // It seems atomics introduced V8 Fatal Error https://github.com/vitest-dev/vitest/issues/1191
    useAtomics: poolOptions.useAtomics ?? false,
    maxThreads,
    minThreads,
    env,
    execArgv: [
      ...poolOptions.execArgv ?? [],
      ...execArgv
    ],
    terminateTimeout: ctx.config.teardownTimeout,
    concurrentTasksPerWorker: 1
  };
  const isolated = poolOptions.isolate ?? true;
  if (isolated)
    options.isolateWorkers = true;
  if (poolOptions.singleThread || !ctx.config.fileParallelism) {
    options.maxThreads = 1;
    options.minThreads = 1;
  }
  const pool = new Tinypool$1(options);
  const runWithFiles = (name) => {
    let id = 0;
    async function runFiles(project, config, files, environment, invalidates = []) {
      ctx.state.clearFiles(project, files);
      const { workerPort, port } = createWorkerChannel$1(project);
      const workerId = ++id;
      const data = {
        pool: "threads",
        worker,
        port: workerPort,
        config,
        files,
        invalidates,
        environment,
        workerId,
        projectName: project.getName(),
        providedContext: project.getProvidedContext()
      };
      try {
        await pool.run(data, { transferList: [workerPort], name });
      } catch (error) {
        if (error instanceof Error && /Failed to terminate worker/.test(error.message))
          ctx.state.addProcessTimeoutCause(`Failed to terminate worker while running ${files.join(", ")}. 
See https://vitest.dev/guide/common-errors.html#failed-to-terminate-worker for troubleshooting.`);
        else if (ctx.isCancelling && error instanceof Error && /The task has been cancelled/.test(error.message))
          ctx.state.cancelFiles(files, ctx.config.root, project.config.name);
        else
          throw error;
      } finally {
        port.close();
        workerPort.close();
      }
    }
    return async (specs, invalidates) => {
      ctx.onCancel(() => pool.cancelPendingTasks());
      const configs = /* @__PURE__ */ new Map();
      const getConfig = (project) => {
        if (configs.has(project))
          return configs.get(project);
        const config = project.getSerializableConfig();
        configs.set(project, config);
        return config;
      };
      const workspaceMap = /* @__PURE__ */ new Map();
      for (const [project, file] of specs) {
        const workspaceFiles = workspaceMap.get(file) ?? [];
        workspaceFiles.push(project);
        workspaceMap.set(file, workspaceFiles);
      }
      const singleThreads = specs.filter(([project]) => {
        var _a2, _b;
        return (_b = (_a2 = project.config.poolOptions) == null ? void 0 : _a2.threads) == null ? void 0 : _b.singleThread;
      });
      const multipleThreads = specs.filter(([project]) => {
        var _a2, _b;
        return !((_b = (_a2 = project.config.poolOptions) == null ? void 0 : _a2.threads) == null ? void 0 : _b.singleThread);
      });
      if (multipleThreads.length) {
        const filesByEnv = await groupFilesByEnv(multipleThreads);
        const files = Object.values(filesByEnv).flat();
        const results = [];
        if (isolated) {
          results.push(...await Promise.allSettled(files.map(({ file, environment, project }) => runFiles(project, getConfig(project), [file], environment, invalidates))));
        } else {
          const grouped = groupBy(files, ({ project, environment }) => project.getName() + environment.name + JSON.stringify(environment.options));
          for (const group of Object.values(grouped)) {
            results.push(...await Promise.allSettled(group.map(({ file, environment, project }) => runFiles(project, getConfig(project), [file], environment, invalidates))));
            await new Promise((resolve2) => pool.queueSize === 0 ? resolve2() : pool.once("drain", resolve2));
            await pool.recycleWorkers();
          }
        }
        const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason);
        if (errors.length > 0)
          throw new AggregateErrorPonyfill(errors, "Errors occurred while running tests. For more information, see serialized error.");
      }
      if (singleThreads.length) {
        const filesByEnv = await groupFilesByEnv(singleThreads);
        const envs = envsOrder.concat(
          Object.keys(filesByEnv).filter((env2) => !envsOrder.includes(env2))
        );
        for (const env2 of envs) {
          const files = filesByEnv[env2];
          if (!(files == null ? void 0 : files.length))
            continue;
          const filesByOptions = groupBy(files, ({ project, environment }) => project.getName() + JSON.stringify(environment.options));
          for (const files2 of Object.values(filesByOptions)) {
            await pool.recycleWorkers();
            const filenames = files2.map((f) => f.file);
            await runFiles(files2[0].project, getConfig(files2[0].project), filenames, files2[0].environment, invalidates);
          }
        }
      }
    };
  };
  return {
    name: "threads",
    runTests: runWithFiles("run"),
    close: () => pool.destroy()
  };
}

function createBrowserPool(ctx) {
  const providers = /* @__PURE__ */ new Set();
  const waitForTest = async (provider, id) => {
    const defer = createDefer();
    ctx.state.browserTestPromises.set(id, defer);
    const off = provider.catchError((error) => {
      if (id !== "no-isolate") {
        Object.defineProperty(error, "VITEST_TEST_PATH", {
          value: id
        });
      }
      defer.reject(error);
    });
    try {
      return await defer;
    } finally {
      off();
    }
  };
  const runTests = async (project, files) => {
    var _a;
    ctx.state.clearFiles(project, files);
    let isCancelled = false;
    project.ctx.onCancel(() => {
      isCancelled = true;
    });
    const provider = project.browserProvider;
    providers.add(provider);
    const resolvedUrls = (_a = project.browser) == null ? void 0 : _a.resolvedUrls;
    const origin = (resolvedUrls == null ? void 0 : resolvedUrls.local[0]) ?? (resolvedUrls == null ? void 0 : resolvedUrls.network[0]);
    const paths = files.map((file) => relative(project.config.root, file));
    if (project.config.browser.isolate) {
      for (const path of paths) {
        if (isCancelled) {
          ctx.state.cancelFiles(files.slice(paths.indexOf(path)), ctx.config.root, project.config.name);
          break;
        }
        const url = new URL("/", origin);
        url.searchParams.append("path", path);
        url.searchParams.set("id", path);
        await provider.openPage(url.toString());
        await waitForTest(provider, path);
      }
    } else {
      const url = new URL("/", origin);
      url.searchParams.set("id", "no-isolate");
      paths.forEach((path) => url.searchParams.append("path", path));
      await provider.openPage(url.toString());
      await waitForTest(provider, "no-isolate");
    }
  };
  const runWorkspaceTests = async (specs) => {
    const groupedFiles = /* @__PURE__ */ new Map();
    for (const [project, file] of specs) {
      const files = groupedFiles.get(project) || [];
      files.push(file);
      groupedFiles.set(project, files);
    }
    for (const [project, files] of groupedFiles.entries())
      await runTests(project, files);
  };
  return {
    name: "browser",
    async close() {
      ctx.state.browserTestPromises.clear();
      await Promise.all([...providers].map((provider) => provider.close()));
      providers.clear();
    },
    runTests: runWorkspaceTests
  };
}

function getDefaultThreadsCount(config) {
  const numCpus = typeof nodeos.availableParallelism === "function" ? nodeos.availableParallelism() : nodeos.cpus().length;
  return config.watch ? Math.max(Math.floor(numCpus / 2), 1) : Math.max(numCpus - 1, 1);
}
function getWorkerMemoryLimit(config) {
  var _a, _b, _c, _d;
  const memoryLimit = (_b = (_a = config.poolOptions) == null ? void 0 : _a.vmThreads) == null ? void 0 : _b.memoryLimit;
  if (memoryLimit)
    return memoryLimit;
  return 1 / (((_d = (_c = config.poolOptions) == null ? void 0 : _c.vmThreads) == null ? void 0 : _d.maxThreads) ?? getDefaultThreadsCount(config));
}
function stringToBytes(input, percentageReference) {
  if (input === null || input === void 0)
    return input;
  if (typeof input === "string") {
    if (Number.isNaN(Number.parseFloat(input.slice(-1)))) {
      let [, numericString, trailingChars] = input.match(/(.*?)([^0-9.-]+)$/i) || [];
      if (trailingChars && numericString) {
        const numericValue = Number.parseFloat(numericString);
        trailingChars = trailingChars.toLowerCase();
        switch (trailingChars) {
          case "%":
            input = numericValue / 100;
            break;
          case "kb":
          case "k":
            return numericValue * 1e3;
          case "kib":
            return numericValue * 1024;
          case "mb":
          case "m":
            return numericValue * 1e3 * 1e3;
          case "mib":
            return numericValue * 1024 * 1024;
          case "gb":
          case "g":
            return numericValue * 1e3 * 1e3 * 1e3;
          case "gib":
            return numericValue * 1024 * 1024 * 1024;
        }
      }
    } else {
      input = Number.parseFloat(input);
    }
  }
  if (typeof input === "number") {
    if (input <= 1 && input > 0) {
      if (percentageReference) {
        return Math.floor(input * percentageReference);
      } else {
        throw new Error(
          "For a percentage based memory limit a percentageReference must be supplied"
        );
      }
    } else if (input > 1) {
      return Math.floor(input);
    } else {
      throw new Error('Unexpected numerical input for "memoryLimit"');
    }
  }
  return null;
}

const suppressWarningsPath$1 = resolve(rootDir, "./suppress-warnings.cjs");
function createWorkerChannel(project) {
  const channel = new MessageChannel();
  const port = channel.port2;
  const workerPort = channel.port1;
  const rpc = createBirpc(
    createMethodsRPC(project),
    {
      eventNames: ["onCancel"],
      post(v) {
        port.postMessage(v);
      },
      on(fn) {
        port.on("message", fn);
      }
    }
  );
  project.ctx.onCancel((reason) => rpc.onCancel(reason));
  return { workerPort, port };
}
function createVmThreadsPool(ctx, { execArgv, env }) {
  var _a;
  const numCpus = typeof nodeos.availableParallelism === "function" ? nodeos.availableParallelism() : nodeos.cpus().length;
  const threadsCount = ctx.config.watch ? Math.max(Math.floor(numCpus / 2), 1) : Math.max(numCpus - 1, 1);
  const poolOptions = ((_a = ctx.config.poolOptions) == null ? void 0 : _a.vmThreads) ?? {};
  const maxThreads = poolOptions.maxThreads ?? ctx.config.maxWorkers ?? threadsCount;
  const minThreads = poolOptions.minThreads ?? ctx.config.minWorkers ?? threadsCount;
  const worker = resolve(ctx.distPath, "workers/vmThreads.js");
  const options = {
    filename: resolve(ctx.distPath, "worker.js"),
    // TODO: investigate further
    // It seems atomics introduced V8 Fatal Error https://github.com/vitest-dev/vitest/issues/1191
    useAtomics: poolOptions.useAtomics ?? false,
    maxThreads,
    minThreads,
    env,
    execArgv: [
      "--experimental-import-meta-resolve",
      "--experimental-vm-modules",
      "--require",
      suppressWarningsPath$1,
      ...poolOptions.execArgv ?? [],
      ...execArgv
    ],
    terminateTimeout: ctx.config.teardownTimeout,
    concurrentTasksPerWorker: 1,
    maxMemoryLimitBeforeRecycle: getMemoryLimit$1(ctx.config) || void 0
  };
  if (poolOptions.singleThread || !ctx.config.fileParallelism) {
    options.maxThreads = 1;
    options.minThreads = 1;
  }
  const pool = new Tinypool$1(options);
  const runWithFiles = (name) => {
    let id = 0;
    async function runFiles(project, config, files, environment, invalidates = []) {
      ctx.state.clearFiles(project, files);
      const { workerPort, port } = createWorkerChannel(project);
      const workerId = ++id;
      const data = {
        pool: "vmThreads",
        worker,
        port: workerPort,
        config,
        files,
        invalidates,
        environment,
        workerId,
        projectName: project.getName(),
        providedContext: project.getProvidedContext()
      };
      try {
        await pool.run(data, { transferList: [workerPort], name });
      } catch (error) {
        if (error instanceof Error && /Failed to terminate worker/.test(error.message))
          ctx.state.addProcessTimeoutCause(`Failed to terminate worker while running ${files.join(", ")}. 
See https://vitest.dev/guide/common-errors.html#failed-to-terminate-worker for troubleshooting.`);
        else if (ctx.isCancelling && error instanceof Error && /The task has been cancelled/.test(error.message))
          ctx.state.cancelFiles(files, ctx.config.root, project.config.name);
        else
          throw error;
      } finally {
        port.close();
        workerPort.close();
      }
    }
    return async (specs, invalidates) => {
      ctx.onCancel(() => pool.cancelPendingTasks());
      const configs = /* @__PURE__ */ new Map();
      const getConfig = (project) => {
        if (configs.has(project))
          return configs.get(project);
        const config = project.getSerializableConfig();
        configs.set(project, config);
        return config;
      };
      const filesByEnv = await groupFilesByEnv(specs);
      const promises = Object.values(filesByEnv).flat();
      const results = await Promise.allSettled(promises.map(({ file, environment, project }) => runFiles(project, getConfig(project), [file], environment, invalidates)));
      const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason);
      if (errors.length > 0)
        throw new AggregateErrorPonyfill(errors, "Errors occurred while running tests. For more information, see serialized error.");
    };
  };
  return {
    name: "vmThreads",
    runTests: runWithFiles("run"),
    close: () => pool.destroy()
  };
}
function getMemoryLimit$1(config) {
  const memory = nodeos.totalmem();
  const limit = getWorkerMemoryLimit(config);
  if (typeof memory === "number") {
    return stringToBytes(
      limit,
      config.watch ? memory / 2 : memory
    );
  }
  if (typeof limit === "number" && limit > 1 || typeof limit === "string" && limit.at(-1) !== "%")
    return stringToBytes(limit);
  return null;
}

const A=r=>r!==null&&typeof r=="object",a=(r,t)=>Object.assign(new Error(`[${r}]: ${t}`),{code:r}),_$1="ERR_INVALID_PACKAGE_CONFIG",E$1="ERR_INVALID_PACKAGE_TARGET",I$1="ERR_PACKAGE_PATH_NOT_EXPORTED",R$1=/^\d+$/,O=/^(\.{1,2}|node_modules)$/i,w=/\/|\\/;var h$1=(r=>(r.Export="exports",r.Import="imports",r))(h$1||{});const f=(r,t,e,o,c)=>{if(t==null)return [];if(typeof t=="string"){const[n,...i]=t.split(w);if(n===".."||i.some(l=>O.test(l)))throw a(E$1,`Invalid "${r}" target "${t}" defined in the package config`);return [c?t.replace(/\*/g,c):t]}if(Array.isArray(t))return t.flatMap(n=>f(r,n,e,o,c));if(A(t)){for(const n of Object.keys(t)){if(R$1.test(n))throw a(_$1,"Cannot contain numeric property keys");if(n==="default"||o.includes(n))return f(r,t[n],e,o,c)}return []}throw a(E$1,`Invalid "${r}" target "${t}"`)},s="*",m=(r,t)=>{const e=r.indexOf(s),o=t.indexOf(s);return e===o?t.length>r.length:o>e};function d(r,t){if(!t.includes(s)&&r.hasOwnProperty(t))return [t];let e,o;for(const c of Object.keys(r))if(c.includes(s)){const[n,i,l]=c.split(s);if(l===void 0&&t.startsWith(n)&&t.endsWith(i)){const g=t.slice(n.length,-i.length||void 0);g&&(!e||m(e,c))&&(e=c,o=g);}}return [e,o]}const p=r=>Object.keys(r).reduce((t,e)=>{const o=e===""||e[0]!==".";if(t===void 0||t===o)return o;throw a(_$1,'"exports" cannot contain some keys starting with "." and some not')},void 0),u=/^\w+:/,v=(r,t,e)=>{if(!r)throw new Error('"exports" is required');t=t===""?".":`./${t}`,(typeof r=="string"||Array.isArray(r)||A(r)&&p(r))&&(r={".":r});const[o,c]=d(r,t),n=f(h$1.Export,r[o],t,e,c);if(n.length===0)throw a(I$1,t==="."?'No "exports" main defined':`Package subpath '${t}' is not defined by "exports"`);for(const i of n)if(!i.startsWith("./")&&!u.test(i))throw a(E$1,`Invalid "exports" target "${i}" defined in the package config`);return n};

function B(e){return e.startsWith("\\\\?\\")?e:e.replace(/\\/g,"/")}const x=e=>{const o=require$$0$2[e];return function(i,...n){const t=`${e}:${n.join(":")}`;let l=i==null?void 0:i.get(t);return l===void 0&&(l=Reflect.apply(o,require$$0$2,n),i==null||i.set(t,l)),l}},E=x("existsSync"),ae=x("realpathSync"),ke=x("readFileSync"),P=x("statSync"),Z=(e,o,i)=>{for(;;){const n=p$1.posix.join(e,o);if(E(i,n))return n;const t=p$1.dirname(e);if(t===e)return;e=t;}},h=/^\.{1,2}(\/.*)?$/,W=e=>{const o=B(e);return h.test(o)?o:`./${o}`};function be(e,o=!1){const i=e.length;let n=0,t="",l=0,s=16,m=0,r=0,b=0,v=0,c=0;function L(u,g){let f=0,$=0;for(;f<u||!g;){let O=e.charCodeAt(n);if(O>=48&&O<=57)$=$*16+O-48;else if(O>=65&&O<=70)$=$*16+O-65+10;else if(O>=97&&O<=102)$=$*16+O-97+10;else break;n++,f++;}return f<u&&($=-1),$}function T(u){n=u,t="",l=0,s=16,c=0;}function w(){let u=n;if(e.charCodeAt(n)===48)n++;else for(n++;n<e.length&&N(e.charCodeAt(n));)n++;if(n<e.length&&e.charCodeAt(n)===46)if(n++,n<e.length&&N(e.charCodeAt(n)))for(n++;n<e.length&&N(e.charCodeAt(n));)n++;else return c=3,e.substring(u,n);let g=n;if(n<e.length&&(e.charCodeAt(n)===69||e.charCodeAt(n)===101))if(n++,(n<e.length&&e.charCodeAt(n)===43||e.charCodeAt(n)===45)&&n++,n<e.length&&N(e.charCodeAt(n))){for(n++;n<e.length&&N(e.charCodeAt(n));)n++;g=n;}else c=3;return e.substring(u,g)}function k(){let u="",g=n;for(;;){if(n>=i){u+=e.substring(g,n),c=2;break}const f=e.charCodeAt(n);if(f===34){u+=e.substring(g,n),n++;break}if(f===92){if(u+=e.substring(g,n),n++,n>=i){c=2;break}switch(e.charCodeAt(n++)){case 34:u+='"';break;case 92:u+="\\";break;case 47:u+="/";break;case 98:u+="\b";break;case 102:u+="\f";break;case 110:u+=`
`;break;case 114:u+="\r";break;case 116:u+="	";break;case 117:const O=L(4,!0);O>=0?u+=String.fromCharCode(O):c=4;break;default:c=5;}g=n;continue}if(f>=0&&f<=31)if(_(f)){u+=e.substring(g,n),c=2;break}else c=6;n++;}return u}function A(){if(t="",c=0,l=n,r=m,v=b,n>=i)return l=i,s=17;let u=e.charCodeAt(n);if(J(u)){do n++,t+=String.fromCharCode(u),u=e.charCodeAt(n);while(J(u));return s=15}if(_(u))return n++,t+=String.fromCharCode(u),u===13&&e.charCodeAt(n)===10&&(n++,t+=`
`),m++,b=n,s=14;switch(u){case 123:return n++,s=1;case 125:return n++,s=2;case 91:return n++,s=3;case 93:return n++,s=4;case 58:return n++,s=6;case 44:return n++,s=5;case 34:return n++,t=k(),s=10;case 47:const g=n-1;if(e.charCodeAt(n+1)===47){for(n+=2;n<i&&!_(e.charCodeAt(n));)n++;return t=e.substring(g,n),s=12}if(e.charCodeAt(n+1)===42){n+=2;const f=i-1;let $=!1;for(;n<f;){const O=e.charCodeAt(n);if(O===42&&e.charCodeAt(n+1)===47){n+=2,$=!0;break}n++,_(O)&&(O===13&&e.charCodeAt(n)===10&&n++,m++,b=n);}return $||(n++,c=1),t=e.substring(g,n),s=13}return t+=String.fromCharCode(u),n++,s=16;case 45:if(t+=String.fromCharCode(u),n++,n===i||!N(e.charCodeAt(n)))return s=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return t+=w(),s=11;default:for(;n<i&&U(u);)n++,u=e.charCodeAt(n);if(l!==n){switch(t=e.substring(l,n),t){case"true":return s=8;case"false":return s=9;case"null":return s=7}return s=16}return t+=String.fromCharCode(u),n++,s=16}}function U(u){if(J(u)||_(u))return !1;switch(u){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return !1}return !0}function F(){let u;do u=A();while(u>=12&&u<=15);return u}return {setPosition:T,getPosition:()=>n,scan:o?F:A,getToken:()=>s,getTokenValue:()=>t,getTokenOffset:()=>l,getTokenLength:()=>n-l,getTokenStartLine:()=>r,getTokenStartCharacter:()=>l-v,getTokenError:()=>c}}function J(e){return e===32||e===9}function _(e){return e===10||e===13}function N(e){return e>=48&&e<=57}var q;(function(e){e[e.lineFeed=10]="lineFeed",e[e.carriageReturn=13]="carriageReturn",e[e.space=32]="space",e[e._0=48]="_0",e[e._1=49]="_1",e[e._2=50]="_2",e[e._3=51]="_3",e[e._4=52]="_4",e[e._5=53]="_5",e[e._6=54]="_6",e[e._7=55]="_7",e[e._8=56]="_8",e[e._9=57]="_9",e[e.a=97]="a",e[e.b=98]="b",e[e.c=99]="c",e[e.d=100]="d",e[e.e=101]="e",e[e.f=102]="f",e[e.g=103]="g",e[e.h=104]="h",e[e.i=105]="i",e[e.j=106]="j",e[e.k=107]="k",e[e.l=108]="l",e[e.m=109]="m",e[e.n=110]="n",e[e.o=111]="o",e[e.p=112]="p",e[e.q=113]="q",e[e.r=114]="r",e[e.s=115]="s",e[e.t=116]="t",e[e.u=117]="u",e[e.v=118]="v",e[e.w=119]="w",e[e.x=120]="x",e[e.y=121]="y",e[e.z=122]="z",e[e.A=65]="A",e[e.B=66]="B",e[e.C=67]="C",e[e.D=68]="D",e[e.E=69]="E",e[e.F=70]="F",e[e.G=71]="G",e[e.H=72]="H",e[e.I=73]="I",e[e.J=74]="J",e[e.K=75]="K",e[e.L=76]="L",e[e.M=77]="M",e[e.N=78]="N",e[e.O=79]="O",e[e.P=80]="P",e[e.Q=81]="Q",e[e.R=82]="R",e[e.S=83]="S",e[e.T=84]="T",e[e.U=85]="U",e[e.V=86]="V",e[e.W=87]="W",e[e.X=88]="X",e[e.Y=89]="Y",e[e.Z=90]="Z",e[e.asterisk=42]="asterisk",e[e.backslash=92]="backslash",e[e.closeBrace=125]="closeBrace",e[e.closeBracket=93]="closeBracket",e[e.colon=58]="colon",e[e.comma=44]="comma",e[e.dot=46]="dot",e[e.doubleQuote=34]="doubleQuote",e[e.minus=45]="minus",e[e.openBrace=123]="openBrace",e[e.openBracket=91]="openBracket",e[e.plus=43]="plus",e[e.slash=47]="slash",e[e.formFeed=12]="formFeed",e[e.tab=9]="tab";})(q||(q={}));var I;(function(e){e.DEFAULT={allowTrailingComma:!1};})(I||(I={}));function Te(e,o=[],i=I.DEFAULT){let n=null,t=[];const l=[];function s(r){Array.isArray(t)?t.push(r):n!==null&&(t[n]=r);}return we(e,{onObjectBegin:()=>{const r={};s(r),l.push(t),t=r,n=null;},onObjectProperty:r=>{n=r;},onObjectEnd:()=>{t=l.pop();},onArrayBegin:()=>{const r=[];s(r),l.push(t),t=r,n=null;},onArrayEnd:()=>{t=l.pop();},onLiteralValue:s,onError:(r,b,v)=>{o.push({error:r,offset:b,length:v});}},i),t[0]}function we(e,o,i=I.DEFAULT){const n=be(e,!1),t=[];function l(a){return a?()=>a(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}function s(a){return a?()=>a(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>t.slice()):()=>!0}function m(a){return a?j=>a(j,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}function r(a){return a?j=>a(j,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>t.slice()):()=>!0}const b=s(o.onObjectBegin),v=r(o.onObjectProperty),c=l(o.onObjectEnd),L=s(o.onArrayBegin),T=l(o.onArrayEnd),w=r(o.onLiteralValue),k=m(o.onSeparator),A=l(o.onComment),U=m(o.onError),F=i&&i.disallowComments,u=i&&i.allowTrailingComma;function g(){for(;;){const a=n.scan();switch(n.getTokenError()){case 4:f(14);break;case 5:f(15);break;case 3:f(13);break;case 1:F||f(11);break;case 2:f(12);break;case 6:f(16);break}switch(a){case 12:case 13:F?f(10):A();break;case 16:f(1);break;case 15:case 14:break;default:return a}}}function f(a,j=[],Y=[]){if(U(a),j.length+Y.length>0){let y=n.getToken();for(;y!==17;){if(j.indexOf(y)!==-1){g();break}else if(Y.indexOf(y)!==-1)break;y=g();}}}function $(a){const j=n.getTokenValue();return a?w(j):(v(j),t.push(j)),g(),!0}function O(){switch(n.getToken()){case 11:const a=n.getTokenValue();let j=Number(a);isNaN(j)&&(f(2),j=0),w(j);break;case 7:w(null);break;case 8:w(!0);break;case 9:w(!1);break;default:return !1}return g(),!0}function ce(){return n.getToken()!==10?(f(3,[],[2,5]),!1):($(!1),n.getToken()===6?(k(":"),g(),V()||f(4,[],[2,5])):f(5,[],[2,5]),t.pop(),!0)}function fe(){b(),g();let a=!1;for(;n.getToken()!==2&&n.getToken()!==17;){if(n.getToken()===5){if(a||f(4,[],[]),k(","),g(),n.getToken()===2&&u)break}else a&&f(6,[],[]);ce()||f(4,[],[2,5]),a=!0;}return c(),n.getToken()!==2?f(7,[2],[]):g(),!0}function pe(){L(),g();let a=!0,j=!1;for(;n.getToken()!==4&&n.getToken()!==17;){if(n.getToken()===5){if(j||f(4,[],[]),k(","),g(),n.getToken()===4&&u)break}else j&&f(6,[],[]);a?(t.push(0),a=!1):t[t.length-1]++,V()||f(4,[],[4,5]),j=!0;}return T(),a||t.pop(),n.getToken()!==4?f(8,[4],[]):g(),!0}function V(){switch(n.getToken()){case 3:return pe();case 1:return fe();case 10:return $(!0);default:return O()}}return g(),n.getToken()===17?i.allowEmptyContent?!0:(f(4,[],[]),!1):V()?(n.getToken()!==17&&f(9,[],[]),!0):(f(4,[],[]),!1)}var K;(function(e){e[e.None=0]="None",e[e.UnexpectedEndOfComment=1]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=2]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=3]="UnexpectedEndOfNumber",e[e.InvalidUnicode=4]="InvalidUnicode",e[e.InvalidEscapeCharacter=5]="InvalidEscapeCharacter",e[e.InvalidCharacter=6]="InvalidCharacter";})(K||(K={}));var C;(function(e){e[e.OpenBraceToken=1]="OpenBraceToken",e[e.CloseBraceToken=2]="CloseBraceToken",e[e.OpenBracketToken=3]="OpenBracketToken",e[e.CloseBracketToken=4]="CloseBracketToken",e[e.CommaToken=5]="CommaToken",e[e.ColonToken=6]="ColonToken",e[e.NullKeyword=7]="NullKeyword",e[e.TrueKeyword=8]="TrueKeyword",e[e.FalseKeyword=9]="FalseKeyword",e[e.StringLiteral=10]="StringLiteral",e[e.NumericLiteral=11]="NumericLiteral",e[e.LineCommentTrivia=12]="LineCommentTrivia",e[e.BlockCommentTrivia=13]="BlockCommentTrivia",e[e.LineBreakTrivia=14]="LineBreakTrivia",e[e.Trivia=15]="Trivia",e[e.Unknown=16]="Unknown",e[e.EOF=17]="EOF";})(C||(C={}));const ve=Te;var ee;(function(e){e[e.InvalidSymbol=1]="InvalidSymbol",e[e.InvalidNumberFormat=2]="InvalidNumberFormat",e[e.PropertyNameExpected=3]="PropertyNameExpected",e[e.ValueExpected=4]="ValueExpected",e[e.ColonExpected=5]="ColonExpected",e[e.CommaExpected=6]="CommaExpected",e[e.CloseBraceExpected=7]="CloseBraceExpected",e[e.CloseBracketExpected=8]="CloseBracketExpected",e[e.EndOfFileExpected=9]="EndOfFileExpected",e[e.InvalidCommentToken=10]="InvalidCommentToken",e[e.UnexpectedEndOfComment=11]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=12]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=13]="UnexpectedEndOfNumber",e[e.InvalidUnicode=14]="InvalidUnicode",e[e.InvalidEscapeCharacter=15]="InvalidEscapeCharacter",e[e.InvalidCharacter=16]="InvalidCharacter";})(ee||(ee={}));const ne=(e,o)=>ve(ke(o,e,"utf8")),M=Symbol("implicitBaseUrl"),Oe=()=>{const{findPnpApi:e}=ge;return e&&e(process.cwd())},R=(e,o,i,n)=>{const t=`resolveFromPackageJsonPath:${e}:${o}:${i}`;if(n!=null&&n.has(t))return n.get(t);const l=ne(e,n);if(!l)return;let s=o||"tsconfig.json";if(!i&&l.exports)try{const[m]=v(l.exports,o,["require","types"]);s=m;}catch{return !1}else !o&&l.tsconfig&&(s=l.tsconfig);return s=p$1.join(e,"..",s),n==null||n.set(t,s),s},G="package.json",z="tsconfig.json",je=(e,o,i)=>{let n=e;if(e===".."&&(n=p$1.join(n,z)),e[0]==="."&&(n=p$1.resolve(o,n)),p$1.isAbsolute(n)){if(E(i,n)){if(P(i,n).isFile())return n}else if(!n.endsWith(".json")){const T=`${n}.json`;if(E(i,T))return T}return}const[t,...l]=e.split("/"),s=t[0]==="@"?`${t}/${l.shift()}`:t,m=l.join("/"),r=Oe();if(r){const{resolveRequest:T}=r;try{if(s===e){const w=T(p$1.join(s,G),o);if(w){const k=R(w,m,!1,i);if(k&&E(i,k))return k}}else {let w;try{w=T(e,o,{extensions:[".json"]});}catch{w=T(p$1.join(e,z),o);}if(w)return w}}catch{}}const b=Z(o,p$1.join("node_modules",s),i);if(!b||!P(i,b).isDirectory())return;const v=p$1.join(b,G);if(E(i,v)){const T=R(v,m,!1,i);if(T===!1)return;if(T&&E(i,T)&&P(i,T).isFile())return T}const c=p$1.join(b,m),L=c.endsWith(".json");if(!L){const T=`${c}.json`;if(E(i,T))return T}if(E(i,c)){if(P(i,c).isDirectory()){const T=p$1.join(c,G);if(E(i,T)){const k=R(T,"",!0,i);if(k&&E(i,k))return k}const w=p$1.join(c,z);if(E(i,w))return w}else if(L)return c}},Ae=(e,o,i,n)=>{const t=je(e,o,n);if(!t)throw new Error(`File '${e}' not found.`);if(i.has(t))throw new Error(`Circularity detected while resolving configuration: ${t}`);i.add(t);const l=p$1.dirname(t),s=te(t,n,i);delete s.references;const{compilerOptions:m}=s;if(m){const r=["baseUrl","outDir"];for(const b of r){const v=m[b];v&&(m[b]=B(p$1.relative(o,p$1.join(l,v)))||"./");}}return s.files&&(s.files=s.files.map(r=>B(p$1.relative(o,p$1.join(l,r))))),s.include&&(s.include=s.include.map(r=>B(p$1.relative(o,p$1.join(l,r))))),s.exclude&&(s.exclude=s.exclude.map(r=>B(p$1.relative(o,p$1.join(l,r))))),s},te=(e,o,i=new Set)=>{let n;try{n=ae(o,e);}catch{throw new Error(`Cannot resolve tsconfig at path: ${e}`)}let t=ne(n,o)||{};if(typeof t!="object")throw new SyntaxError(`Failed to parse tsconfig at: ${e}`);const l=p$1.dirname(n);if(t.compilerOptions){const{compilerOptions:s}=t;s.paths&&!s.baseUrl&&(s[M]=l);}if(t.extends){const s=Array.isArray(t.extends)?t.extends:[t.extends];delete t.extends;for(const m of s.reverse()){const r=Ae(m,l,i,o),b={...r,...t,compilerOptions:{...r.compilerOptions,...t.compilerOptions}};r.watchOptions&&(b.watchOptions={...r.watchOptions,...t.watchOptions}),t=b;}}if(t.compilerOptions){const{compilerOptions:s}=t,m=["baseUrl","rootDir"];for(const b of m){const v=s[b];if(v){const c=p$1.resolve(l,v),L=W(p$1.relative(l,c));s[b]=L;}}const{outDir:r}=s;r&&(Array.isArray(t.exclude)||(t.exclude=[]),t.exclude.includes(r)||t.exclude.push(r),s.outDir=W(r));}else t.compilerOptions={};if(t.files&&(t.files=t.files.map(W)),t.include&&(t.include=t.include.map(B)),t.watchOptions){const{watchOptions:s}=t;s.excludeDirectories&&(s.excludeDirectories=s.excludeDirectories.map(m=>B(p$1.resolve(l,m))));}return t},ie=(e,o=new Map)=>te(e,o),$e=(e=process.cwd(),o="tsconfig.json",i=new Map)=>{const n=Z(B(e),o,i);if(!n)return null;const t=ie(n,i);return {path:n,config:t}};p$1.posix;process.platform==="win32";

const __dirname$1 = url.fileURLToPath(new URL(".", import.meta.url));
const newLineRegExp = /\r?\n/;
const errCodeRegExp = /error TS(?<errCode>\d+)/;
async function makeTscErrorInfo(errInfo) {
  var _a;
  const [errFilePathPos = "", ...errMsgRawArr] = errInfo.split(":");
  if (!errFilePathPos || errMsgRawArr.length === 0 || errMsgRawArr.join("").length === 0)
    return ["unknown filepath", null];
  const errMsgRaw = errMsgRawArr.join("").trim();
  const [errFilePath, errPos] = errFilePathPos.slice(0, -1).split("(");
  if (!errFilePath || !errPos)
    return ["unknown filepath", null];
  const [errLine, errCol] = errPos.split(",");
  if (!errLine || !errCol)
    return [errFilePath, null];
  const execArr = errCodeRegExp.exec(errMsgRaw);
  if (!execArr)
    return [errFilePath, null];
  const errCodeStr = ((_a = execArr.groups) == null ? void 0 : _a.errCode) ?? "";
  if (!errCodeStr)
    return [errFilePath, null];
  const line = Number(errLine);
  const col = Number(errCol);
  const errCode = Number(errCodeStr);
  return [
    errFilePath,
    {
      filePath: errFilePath,
      errCode,
      line,
      column: col,
      errMsg: errMsgRaw.slice(`error TS${errCode} `.length)
    }
  ];
}
async function getTsconfig(root, config) {
  const configName = config.tsconfig ? basename(config.tsconfig) : void 0;
  const configSearchPath = config.tsconfig ? dirname(resolve(root, config.tsconfig)) : root;
  const tsconfig = $e(configSearchPath, configName);
  if (!tsconfig)
    throw new Error("no tsconfig.json found");
  const tempConfigPath = join(dirname(tsconfig.path), "tsconfig.vitest-temp.json");
  try {
    const tmpTsConfig = { ...tsconfig.config };
    tmpTsConfig.compilerOptions = tmpTsConfig.compilerOptions || {};
    tmpTsConfig.compilerOptions.emitDeclarationOnly = false;
    tmpTsConfig.compilerOptions.incremental = true;
    tmpTsConfig.compilerOptions.tsBuildInfoFile = join(
      process.versions.pnp ? join(nodeos__default.tmpdir(), "vitest") : __dirname$1,
      "tsconfig.tmp.tsbuildinfo"
    );
    const tsconfigFinalContent = JSON.stringify(tmpTsConfig, null, 2);
    await writeFile(tempConfigPath, tsconfigFinalContent);
    return { path: tempConfigPath, config: tmpTsConfig };
  } catch (err) {
    throw new Error("failed to write tsconfig.temp.json", { cause: err });
  }
}
async function getRawErrsMapFromTsCompile(tscErrorStdout) {
  const rawErrsMap = /* @__PURE__ */ new Map();
  const infos = await Promise.all(
    tscErrorStdout.split(newLineRegExp).reduce((prev, next) => {
      if (!next)
        return prev;
      else if (!next.startsWith(" "))
        prev.push(next);
      else
        prev[prev.length - 1] += `
${next}`;
      return prev;
    }, []).map((errInfoLine) => makeTscErrorInfo(errInfoLine))
  );
  infos.forEach(([errFilePath, errInfo]) => {
    var _a;
    if (!errInfo)
      return;
    if (!rawErrsMap.has(errFilePath))
      rawErrsMap.set(errFilePath, [errInfo]);
    else
      (_a = rawErrsMap.get(errFilePath)) == null ? void 0 : _a.push(errInfo);
  });
  return rawErrsMap;
}

function createIndexMap(source) {
  const map = /* @__PURE__ */ new Map();
  let index = 0;
  let line = 1;
  let column = 1;
  for (const char of source) {
    map.set(`${line}:${column}`, index++);
    if (char === "\n" || char === "\r\n") {
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return map;
}

async function collectTests(ctx, filepath) {
  const request = await ctx.vitenode.transformRequest(filepath, filepath);
  if (!request)
    return null;
  const ast = await parseAstAsync(request.code);
  const testFilepath = relative(ctx.config.root, filepath);
  const file = {
    filepath,
    type: "suite",
    id: generateHash(`${testFilepath}${ctx.config.name || ""}`),
    name: testFilepath,
    mode: "run",
    tasks: [],
    start: ast.start,
    end: ast.end,
    projectName: ctx.getName(),
    meta: { typecheck: true }
  };
  const definitions = [];
  const getName = (callee) => {
    var _a, _b, _c;
    if (!callee)
      return null;
    if (callee.type === "Identifier")
      return callee.name;
    if (callee.type === "MemberExpression") {
      if ((_b = (_a = callee.object) == null ? void 0 : _a.name) == null ? void 0 : _b.startsWith("__vite_ssr_"))
        return getName(callee.property);
      return getName((_c = callee.object) == null ? void 0 : _c.property);
    }
    return null;
  };
  ancestor(ast, {
    CallExpression(node) {
      var _a;
      const { callee } = node;
      const name = getName(callee);
      if (!name)
        return;
      if (!["it", "test", "describe", "suite"].includes(name))
        return;
      const { arguments: [{ value: message }] } = node;
      const property = (_a = callee == null ? void 0 : callee.property) == null ? void 0 : _a.name;
      let mode = !property || property === name ? "run" : property;
      if (!["run", "skip", "todo", "only", "skipIf", "runIf"].includes(mode))
        throw new Error(`${name}.${mode} syntax is not supported when testing types`);
      if (mode === "skipIf" || mode === "runIf")
        mode = "skip";
      definitions.push({
        start: node.start,
        end: node.end,
        name: message,
        type: name === "it" || name === "test" ? "test" : "suite",
        mode
      });
    }
  });
  let lastSuite = file;
  const updateLatestSuite = (index) => {
    const suite = lastSuite;
    while (lastSuite !== file && lastSuite.end < index)
      lastSuite = suite.suite;
    return lastSuite;
  };
  definitions.sort((a, b) => a.start - b.start).forEach((definition) => {
    const latestSuite = updateLatestSuite(definition.start);
    let mode = definition.mode;
    if (latestSuite.mode !== "run")
      mode = latestSuite.mode;
    if (definition.type === "suite") {
      const task2 = {
        type: definition.type,
        id: "",
        suite: latestSuite,
        file,
        tasks: [],
        mode,
        name: definition.name,
        end: definition.end,
        start: definition.start,
        projectName: ctx.getName(),
        meta: {
          typecheck: true
        }
      };
      definition.task = task2;
      latestSuite.tasks.push(task2);
      lastSuite = task2;
      return;
    }
    const task = {
      type: definition.type,
      id: "",
      suite: latestSuite,
      file,
      mode,
      context: {},
      // not used in typecheck
      name: definition.name,
      end: definition.end,
      start: definition.start,
      meta: {
        typecheck: true
      }
    };
    definition.task = task;
    latestSuite.tasks.push(task);
  });
  calculateSuiteHash(file);
  const hasOnly = someTasksAreOnly(file);
  interpretTaskModes(file, ctx.config.testNamePattern, hasOnly, false, ctx.config.allowOnly);
  return {
    file,
    parsed: request.code,
    filepath,
    map: request.map,
    definitions
  };
}

class TypeCheckError extends Error {
  constructor(message, stacks) {
    super(message);
    this.message = message;
    this.stacks = stacks;
  }
  name = "TypeCheckError";
}
class Typechecker {
  constructor(ctx) {
    this.ctx = ctx;
  }
  _onParseStart;
  _onParseEnd;
  _onWatcherRerun;
  _result = {
    files: [],
    sourceErrors: [],
    time: 0
  };
  _startTime = 0;
  _output = "";
  _tests = {};
  tempConfigPath;
  allowJs;
  process;
  files = [];
  setFiles(files) {
    this.files = files;
  }
  onParseStart(fn) {
    this._onParseStart = fn;
  }
  onParseEnd(fn) {
    this._onParseEnd = fn;
  }
  onWatcherRerun(fn) {
    this._onWatcherRerun = fn;
  }
  async collectFileTests(filepath) {
    return collectTests(this.ctx, filepath);
  }
  getFiles() {
    return this.files.filter((filename) => {
      const extension = extname(filename);
      return extension !== ".js" || this.allowJs;
    });
  }
  async collectTests() {
    const tests = (await Promise.all(
      this.getFiles().map((filepath) => this.collectFileTests(filepath))
    )).reduce((acc, data) => {
      if (!data)
        return acc;
      acc[data.filepath] = data;
      return acc;
    }, {});
    this._tests = tests;
    return tests;
  }
  markPassed(file) {
    var _a;
    if (!((_a = file.result) == null ? void 0 : _a.state)) {
      file.result = {
        state: "pass"
      };
    }
    const markTasks = (tasks) => {
      var _a2;
      for (const task of tasks) {
        if ("tasks" in task)
          markTasks(task.tasks);
        if (!((_a2 = task.result) == null ? void 0 : _a2.state) && task.mode === "run") {
          task.result = {
            state: "pass"
          };
        }
      }
    };
    markTasks(file.tasks);
  }
  async prepareResults(output) {
    const typeErrors = await this.parseTscLikeOutput(output);
    const testFiles = new Set(this.getFiles());
    if (!this._tests)
      this._tests = await this.collectTests();
    const sourceErrors = [];
    const files = [];
    testFiles.forEach((path) => {
      const { file, definitions, map, parsed } = this._tests[path];
      const errors = typeErrors.get(path);
      files.push(file);
      if (!errors) {
        this.markPassed(file);
        return;
      }
      const sortedDefinitions = [...definitions.sort((a, b) => b.start - a.start)];
      const traceMap = map && new TraceMap(map);
      const indexMap = createIndexMap(parsed);
      const markState = (task, state) => {
        task.result = {
          state: task.mode === "run" || task.mode === "only" ? state : task.mode
        };
        if (task.suite)
          markState(task.suite, state);
      };
      errors.forEach(({ error, originalError }) => {
        var _a;
        const processedPos = traceMap ? generatedPositionFor(traceMap, {
          line: originalError.line,
          column: originalError.column,
          source: basename(path)
        }) : originalError;
        const line = processedPos.line ?? originalError.line;
        const column = processedPos.column ?? originalError.column;
        const index = indexMap.get(`${line}:${column}`);
        const definition = index != null && sortedDefinitions.find((def) => def.start <= index && def.end >= index);
        const suite = definition ? definition.task : file;
        const state = suite.mode === "run" || suite.mode === "only" ? "fail" : suite.mode;
        const errors2 = ((_a = suite.result) == null ? void 0 : _a.errors) || [];
        suite.result = {
          state,
          errors: errors2
        };
        errors2.push(error);
        if (state === "fail" && suite.suite)
          markState(suite.suite, "fail");
      });
      this.markPassed(file);
    });
    typeErrors.forEach((errors, path) => {
      if (!testFiles.has(path))
        sourceErrors.push(...errors.map(({ error }) => error));
    });
    return {
      files,
      sourceErrors,
      time: performance.now() - this._startTime
    };
  }
  async parseTscLikeOutput(output) {
    const errorsMap = await getRawErrsMapFromTsCompile(output);
    const typesErrors = /* @__PURE__ */ new Map();
    errorsMap.forEach((errors, path) => {
      const filepath = resolve(this.ctx.config.root, path);
      const suiteErrors = errors.map((info) => {
        const limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        const errMsg = info.errMsg.replace(/\r?\n\s*(Type .* has no call signatures)/g, " $1");
        const error = new TypeCheckError(errMsg, [
          {
            file: filepath,
            line: info.line,
            column: info.column,
            method: ""
          }
        ]);
        Error.stackTraceLimit = limit;
        return {
          originalError: info,
          error: {
            name: error.name,
            nameStr: String(error.name),
            message: errMsg,
            stacks: error.stacks,
            stack: "",
            stackStr: ""
          }
        };
      });
      typesErrors.set(filepath, suiteErrors);
    });
    return typesErrors;
  }
  async clear() {
    if (this.tempConfigPath)
      await rm(this.tempConfigPath, { force: true });
  }
  async stop() {
    var _a;
    await this.clear();
    (_a = this.process) == null ? void 0 : _a.kill();
  }
  async ensurePackageInstalled(ctx, checker) {
    if (checker !== "tsc" && checker !== "vue-tsc")
      return;
    const packageName = checker === "tsc" ? "typescript" : "vue-tsc";
    await ctx.packageInstaller.ensureInstalled(packageName, ctx.config.root);
  }
  async prepare() {
    const { root, typecheck } = this.ctx.config;
    const { config, path } = await getTsconfig(root, typecheck);
    this.tempConfigPath = path;
    this.allowJs = typecheck.allowJs || config.allowJs || false;
  }
  getExitCode() {
    var _a;
    return ((_a = this.process) == null ? void 0 : _a.exitCode) != null && this.process.exitCode;
  }
  getOutput() {
    return this._output;
  }
  async start() {
    var _a, _b, _c;
    if (!this.tempConfigPath)
      throw new Error("tsconfig was not initialized");
    const { root, watch, typecheck } = this.ctx.config;
    const args = ["--noEmit", "--pretty", "false", "-p", this.tempConfigPath];
    if (watch)
      args.push("--watch");
    if (typecheck.allowJs)
      args.push("--allowJs", "--checkJs");
    this._output = "";
    this._startTime = performance.now();
    const child = execa(typecheck.checker, args, {
      cwd: root,
      stdout: "pipe",
      reject: false
    });
    this.process = child;
    await ((_a = this._onParseStart) == null ? void 0 : _a.call(this));
    let rerunTriggered = false;
    (_b = child.stdout) == null ? void 0 : _b.on("data", (chunk) => {
      var _a2;
      this._output += chunk;
      if (!watch)
        return;
      if (this._output.includes("File change detected") && !rerunTriggered) {
        (_a2 = this._onWatcherRerun) == null ? void 0 : _a2.call(this);
        this._startTime = performance.now();
        this._result.sourceErrors = [];
        this._result.files = [];
        this._tests = null;
        rerunTriggered = true;
      }
      if (/Found \w+ errors*. Watching for/.test(this._output)) {
        rerunTriggered = false;
        this.prepareResults(this._output).then((result) => {
          var _a3;
          this._result = result;
          (_a3 = this._onParseEnd) == null ? void 0 : _a3.call(this, result);
        });
        this._output = "";
      }
    });
    if (!watch) {
      await child;
      this._result = await this.prepareResults(this._output);
      await ((_c = this._onParseEnd) == null ? void 0 : _c.call(this, this._result));
    }
  }
  getResult() {
    return this._result;
  }
  getTestFiles() {
    return Object.values(this._tests || {}).map((i) => i.file);
  }
  getTestPacks() {
    return Object.values(this._tests || {}).map(({ file }) => getTasks(file)).flat().map((i) => [i.id, i.result, { typecheck: true }]);
  }
}

function createTypecheckPool(ctx) {
  const promisesMap = /* @__PURE__ */ new WeakMap();
  const rerunTriggered = /* @__PURE__ */ new WeakMap();
  async function onParseEnd(project, { files, sourceErrors }) {
    var _a;
    const checker = project.typechecker;
    await ctx.report("onTaskUpdate", checker.getTestPacks());
    if (!project.config.typecheck.ignoreSourceErrors)
      sourceErrors.forEach((error) => ctx.state.catchError(error, "Unhandled Source Error"));
    const processError = !hasFailed(files) && !sourceErrors.length && checker.getExitCode();
    if (processError) {
      const error = new Error(checker.getOutput());
      error.stack = "";
      ctx.state.catchError(error, "Typecheck Error");
    }
    (_a = promisesMap.get(project)) == null ? void 0 : _a.resolve();
    rerunTriggered.set(project, false);
    if (ctx.config.watch && !ctx.runningPromise) {
      await ctx.report("onFinished", files);
      await ctx.report("onWatcherStart", files, [
        ...project.config.typecheck.ignoreSourceErrors ? [] : sourceErrors,
        ...ctx.state.getUnhandledErrors()
      ]);
    }
  }
  async function createWorkspaceTypechecker(project, files) {
    const checker = project.typechecker ?? new Typechecker(project);
    if (project.typechecker)
      return checker;
    project.typechecker = checker;
    checker.setFiles(files);
    checker.onParseStart(async () => {
      ctx.state.collectFiles(checker.getTestFiles());
      await ctx.report("onCollected");
    });
    checker.onParseEnd((result) => onParseEnd(project, result));
    checker.onWatcherRerun(async () => {
      rerunTriggered.set(project, true);
      if (!ctx.runningPromise) {
        ctx.state.clearErrors();
        await ctx.report("onWatcherRerun", files, "File change detected. Triggering rerun.");
      }
      await checker.collectTests();
      ctx.state.collectFiles(checker.getTestFiles());
      await ctx.report("onTaskUpdate", checker.getTestPacks());
      await ctx.report("onCollected");
    });
    await checker.prepare();
    await checker.collectTests();
    checker.start();
    return checker;
  }
  async function runTests(specs) {
    const specsByProject = groupBy(specs, ([project]) => project.getName());
    const promises = [];
    for (const name in specsByProject) {
      const project = specsByProject[name][0][0];
      const files = specsByProject[name].map(([_, file]) => file);
      const promise = createDefer();
      const _p = new Promise((resolve) => {
        const _i = setInterval(() => {
          if (!project.typechecker || rerunTriggered.get(project)) {
            resolve(true);
            clearInterval(_i);
          }
        });
        setTimeout(() => {
          resolve(false);
          clearInterval(_i);
        }, 500).unref();
      });
      const triggered = await _p;
      if (project.typechecker && !triggered) {
        ctx.state.collectFiles(project.typechecker.getTestFiles());
        await ctx.report("onCollected");
        await onParseEnd(project, project.typechecker.getResult());
        continue;
      }
      promises.push(promise);
      promisesMap.set(project, promise);
      createWorkspaceTypechecker(project, files);
    }
    await Promise.all(promises);
  }
  return {
    name: "typescript",
    runTests,
    async close() {
      const promises = ctx.projects.map((project) => {
        var _a;
        return (_a = project.typechecker) == null ? void 0 : _a.stop();
      });
      await Promise.all(promises);
    }
  };
}

const suppressWarningsPath = resolve(rootDir, "./suppress-warnings.cjs");
function createChildProcessChannel(project) {
  const emitter = new EventEmitter();
  const cleanup = () => emitter.removeAllListeners();
  const events = { message: "message", response: "response" };
  const channel = {
    onMessage: (callback) => emitter.on(events.message, callback),
    postMessage: (message) => emitter.emit(events.response, message)
  };
  const rpc = createBirpc(
    createMethodsRPC(project),
    {
      eventNames: ["onCancel"],
      serialize: v8.serialize,
      deserialize: (v) => v8.deserialize(Buffer.from(v)),
      post(v) {
        emitter.emit(events.message, v);
      },
      on(fn) {
        emitter.on(events.response, fn);
      }
    }
  );
  project.ctx.onCancel((reason) => rpc.onCancel(reason));
  return { channel, cleanup };
}
function stringifyRegex(input) {
  if (typeof input === "string")
    return input;
  return `$$vitest:${input.toString()}`;
}
function createVmForksPool(ctx, { execArgv, env }) {
  var _a;
  const numCpus = typeof nodeos.availableParallelism === "function" ? nodeos.availableParallelism() : nodeos.cpus().length;
  const threadsCount = ctx.config.watch ? Math.max(Math.floor(numCpus / 2), 1) : Math.max(numCpus - 1, 1);
  const poolOptions = ((_a = ctx.config.poolOptions) == null ? void 0 : _a.vmForks) ?? {};
  const maxThreads = poolOptions.maxForks ?? ctx.config.maxWorkers ?? threadsCount;
  const minThreads = poolOptions.maxForks ?? ctx.config.minWorkers ?? threadsCount;
  const worker = resolve(ctx.distPath, "workers/vmForks.js");
  const options = {
    runtime: "child_process",
    filename: resolve(ctx.distPath, "worker.js"),
    maxThreads,
    minThreads,
    env,
    execArgv: [
      "--experimental-import-meta-resolve",
      "--experimental-vm-modules",
      "--require",
      suppressWarningsPath,
      ...poolOptions.execArgv ?? [],
      ...execArgv
    ],
    terminateTimeout: ctx.config.teardownTimeout,
    concurrentTasksPerWorker: 1,
    maxMemoryLimitBeforeRecycle: getMemoryLimit(ctx.config) || void 0
  };
  if (poolOptions.singleFork || !ctx.config.fileParallelism) {
    options.maxThreads = 1;
    options.minThreads = 1;
  }
  const pool = new Tinypool$1(options);
  const runWithFiles = (name) => {
    let id = 0;
    async function runFiles(project, config, files, environment, invalidates = []) {
      ctx.state.clearFiles(project, files);
      const { channel, cleanup } = createChildProcessChannel(project);
      const workerId = ++id;
      const data = {
        pool: "forks",
        worker,
        config,
        files,
        invalidates,
        environment,
        workerId,
        projectName: project.getName(),
        providedContext: project.getProvidedContext()
      };
      try {
        await pool.run(data, { name, channel });
      } catch (error) {
        if (error instanceof Error && /Failed to terminate worker/.test(error.message))
          ctx.state.addProcessTimeoutCause(`Failed to terminate worker while running ${files.join(", ")}.`);
        else if (ctx.isCancelling && error instanceof Error && /The task has been cancelled/.test(error.message))
          ctx.state.cancelFiles(files, ctx.config.root, project.config.name);
        else
          throw error;
      } finally {
        cleanup();
      }
    }
    return async (specs, invalidates) => {
      ctx.onCancel(() => pool.cancelPendingTasks());
      const configs = /* @__PURE__ */ new Map();
      const getConfig = (project) => {
        if (configs.has(project))
          return configs.get(project);
        const _config = project.getSerializableConfig();
        const config = {
          ..._config,
          // v8 serialize does not support regex
          testNamePattern: _config.testNamePattern ? stringifyRegex(_config.testNamePattern) : void 0
        };
        configs.set(project, config);
        return config;
      };
      const filesByEnv = await groupFilesByEnv(specs);
      const promises = Object.values(filesByEnv).flat();
      const results = await Promise.allSettled(promises.map(({ file, environment, project }) => runFiles(project, getConfig(project), [file], environment, invalidates)));
      const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason);
      if (errors.length > 0)
        throw new AggregateErrorPonyfill(errors, "Errors occurred while running tests. For more information, see serialized error.");
    };
  };
  return {
    name: "vmForks",
    runTests: runWithFiles("run"),
    close: () => pool.destroy()
  };
}
function getMemoryLimit(config) {
  const memory = nodeos.totalmem();
  const limit = getWorkerMemoryLimit(config);
  if (typeof memory === "number") {
    return stringToBytes(
      limit,
      config.watch ? memory / 2 : memory
    );
  }
  if (typeof limit === "number" && limit > 1 || typeof limit === "string" && limit.at(-1) !== "%")
    return stringToBytes(limit);
  return null;
}

const builtinPools = ["forks", "threads", "browser", "vmThreads", "vmForks", "typescript"];
function createPool(ctx) {
  const pools = {
    forks: null,
    threads: null,
    browser: null,
    vmThreads: null,
    vmForks: null,
    typescript: null
  };
  function getDefaultPoolName(project, file) {
    if (project.config.browser.enabled)
      return "browser";
    if (project.config.typecheck.enabled) {
      for (const glob of project.config.typecheck.include) {
        if (mm.isMatch(file, glob, { cwd: project.config.root }))
          return "typescript";
      }
    }
    return project.config.pool;
  }
  function getPoolName([project, file]) {
    for (const [glob, pool] of project.config.poolMatchGlobs) {
      if (pool === "browser")
        throw new Error('Since Vitest 0.31.0 "browser" pool is not supported in "poolMatchGlobs". You can create a workspace to run some of your tests in browser in parallel. Read more: https://vitest.dev/guide/workspace');
      if (mm.isMatch(file, glob, { cwd: project.config.root }))
        return pool;
    }
    return getDefaultPoolName(project, file);
  }
  const potentialConditions = /* @__PURE__ */ new Set(["production", "development", ...ctx.server.config.resolve.conditions]);
  const conditions = [...potentialConditions].filter((condition) => {
    if (condition === "production")
      return ctx.server.config.isProduction;
    if (condition === "development")
      return !ctx.server.config.isProduction;
    return true;
  }).flatMap((c) => ["--conditions", c]);
  const execArgv = process.execArgv.filter(
    (execArg) => execArg.startsWith("--cpu-prof") || execArg.startsWith("--heap-prof") || execArg.startsWith("--diagnostic-dir")
  );
  async function runTests(files, invalidate) {
    const options = {
      execArgv: [
        ...execArgv,
        ...conditions
      ],
      env: {
        TEST: "true",
        VITEST: "true",
        NODE_ENV: process.env.NODE_ENV || "test",
        VITEST_MODE: ctx.config.watch ? "WATCH" : "RUN",
        ...process.env,
        ...ctx.config.env
      }
    };
    const customPools = /* @__PURE__ */ new Map();
    async function resolveCustomPool(filepath) {
      if (customPools.has(filepath))
        return customPools.get(filepath);
      const pool = await ctx.runner.executeId(filepath);
      if (typeof pool.default !== "function")
        throw new Error(`Custom pool "${filepath}" must export a function as default export`);
      const poolInstance = await pool.default(ctx, options);
      if (typeof (poolInstance == null ? void 0 : poolInstance.name) !== "string")
        throw new Error(`Custom pool "${filepath}" should return an object with "name" property`);
      if (typeof (poolInstance == null ? void 0 : poolInstance.runTests) !== "function")
        throw new Error(`Custom pool "${filepath}" should return an object with "runTests" method`);
      customPools.set(filepath, poolInstance);
      return poolInstance;
    }
    const filesByPool = {
      forks: [],
      threads: [],
      browser: [],
      vmThreads: [],
      vmForks: [],
      typescript: []
    };
    const factories = {
      browser: () => createBrowserPool(ctx),
      vmThreads: () => createVmThreadsPool(ctx, options),
      threads: () => createThreadsPool(ctx, options),
      forks: () => createForksPool(ctx, options),
      vmForks: () => createVmForksPool(ctx, options),
      typescript: () => createTypecheckPool(ctx)
    };
    for (const spec of files) {
      const pool = getPoolName(spec);
      filesByPool[pool] ?? (filesByPool[pool] = []);
      filesByPool[pool].push(spec);
    }
    const Sequencer = ctx.config.sequence.sequencer;
    const sequencer = new Sequencer(ctx);
    async function sortSpecs(specs) {
      if (ctx.config.shard)
        specs = await sequencer.shard(specs);
      return sequencer.sort(specs);
    }
    await Promise.all(Object.entries(filesByPool).map(async (entry) => {
      var _a;
      const [pool, files2] = entry;
      if (!files2.length)
        return null;
      const specs = await sortSpecs(files2);
      if (pool in factories) {
        const factory = factories[pool];
        pools[pool] ?? (pools[pool] = factory());
        return pools[pool].runTests(specs, invalidate);
      }
      const poolHandler = await resolveCustomPool(pool);
      pools[_a = poolHandler.name] ?? (pools[_a] = poolHandler);
      return poolHandler.runTests(specs, invalidate);
    }));
  }
  return {
    name: "default",
    runTests,
    async close() {
      await Promise.all(Object.values(pools).map((p) => {
        var _a;
        return (_a = p == null ? void 0 : p.close) == null ? void 0 : _a.call(p);
      }));
    }
  };
}

async function loadCustomReporterModule(path, runner) {
  let customReporterModule;
  try {
    customReporterModule = await runner.executeId(path);
  } catch (customReporterModuleError) {
    throw new Error(`Failed to load custom Reporter from ${path}`, { cause: customReporterModuleError });
  }
  if (customReporterModule.default === null || customReporterModule.default === void 0)
    throw new Error(`Custom reporter loaded from ${path} was not the default export`);
  return customReporterModule.default;
}
function createReporters(reporterReferences, ctx) {
  const runner = ctx.runner;
  const promisedReporters = reporterReferences.map(async (referenceOrInstance) => {
    if (typeof referenceOrInstance === "string") {
      if (referenceOrInstance === "html") {
        await ctx.packageInstaller.ensureInstalled("@vitest/ui", runner.root);
        const CustomReporter = await loadCustomReporterModule("@vitest/ui/reporter", runner);
        return new CustomReporter();
      } else if (referenceOrInstance in ReportersMap) {
        const BuiltinReporter = ReportersMap[referenceOrInstance];
        return new BuiltinReporter();
      } else {
        const CustomReporter = await loadCustomReporterModule(referenceOrInstance, runner);
        return new CustomReporter();
      }
    }
    return referenceOrInstance;
  });
  return Promise.all(promisedReporters);
}
function createBenchmarkReporters(reporterReferences, runner) {
  const promisedReporters = reporterReferences.map(async (referenceOrInstance) => {
    if (typeof referenceOrInstance === "string") {
      if (referenceOrInstance in BenchmarkReportsMap) {
        const BuiltinReporter = BenchmarkReportsMap[referenceOrInstance];
        return new BuiltinReporter();
      } else {
        const CustomReporter = await loadCustomReporterModule(referenceOrInstance, runner);
        return new CustomReporter();
      }
    }
    return referenceOrInstance;
  });
  return Promise.all(promisedReporters);
}

function isAggregateError(err) {
  if (typeof AggregateError !== "undefined" && err instanceof AggregateError)
    return true;
  return err instanceof Error && "errors" in err;
}
class StateManager {
  filesMap = /* @__PURE__ */ new Map();
  pathsSet = /* @__PURE__ */ new Set();
  browserTestPromises = /* @__PURE__ */ new Map();
  idMap = /* @__PURE__ */ new Map();
  taskFileMap = /* @__PURE__ */ new WeakMap();
  errorsSet = /* @__PURE__ */ new Set();
  processTimeoutCauses = /* @__PURE__ */ new Set();
  catchError(err, type) {
    if (isAggregateError(err))
      return err.errors.forEach((error) => this.catchError(error, type));
    if (err === Object(err))
      err.type = type;
    else
      err = { type, message: err };
    const _err = err;
    if (_err && typeof _err === "object" && _err.code === "VITEST_PENDING") {
      const task = this.idMap.get(_err.taskId);
      if (task) {
        task.mode = "skip";
        task.result ?? (task.result = { state: "skip" });
        task.result.state = "skip";
      }
      return;
    }
    this.errorsSet.add(err);
  }
  clearErrors() {
    this.errorsSet.clear();
  }
  getUnhandledErrors() {
    return Array.from(this.errorsSet.values());
  }
  addProcessTimeoutCause(cause) {
    this.processTimeoutCauses.add(cause);
  }
  getProcessTimeoutCauses() {
    return Array.from(this.processTimeoutCauses.values());
  }
  getPaths() {
    return Array.from(this.pathsSet);
  }
  getFiles(keys) {
    if (keys)
      return keys.map((key) => this.filesMap.get(key)).filter(Boolean).flat();
    return Array.from(this.filesMap.values()).flat();
  }
  getFilepaths() {
    return Array.from(this.filesMap.keys());
  }
  getFailedFilepaths() {
    return this.getFiles().filter((i) => {
      var _a;
      return ((_a = i.result) == null ? void 0 : _a.state) === "fail";
    }).map((i) => i.filepath);
  }
  collectPaths(paths = []) {
    paths.forEach((path) => {
      this.pathsSet.add(path);
    });
  }
  collectFiles(files = []) {
    files.forEach((file) => {
      const existing = this.filesMap.get(file.filepath) || [];
      const otherProject = existing.filter((i) => i.projectName !== file.projectName);
      otherProject.push(file);
      this.filesMap.set(file.filepath, otherProject);
      this.updateId(file);
    });
  }
  // this file is reused by ws-client, and shoult not rely on heavy dependencies like workspace
  clearFiles(_project, paths = []) {
    const project = _project;
    paths.forEach((path) => {
      const files = this.filesMap.get(path);
      if (!files)
        return;
      const filtered = files.filter((file) => file.projectName !== project.config.name);
      if (!filtered.length)
        this.filesMap.delete(path);
      else
        this.filesMap.set(path, filtered);
    });
  }
  updateId(task) {
    if (this.idMap.get(task.id) === task)
      return;
    this.idMap.set(task.id, task);
    if (task.type === "suite") {
      task.tasks.forEach((task2) => {
        this.updateId(task2);
      });
    }
  }
  updateTasks(packs) {
    for (const [id, result, meta] of packs) {
      const task = this.idMap.get(id);
      if (task) {
        task.result = result;
        task.meta = meta;
        if ((result == null ? void 0 : result.state) === "skip")
          task.mode = "skip";
      }
    }
  }
  updateUserLog(log) {
    const task = log.taskId && this.idMap.get(log.taskId);
    if (task) {
      if (!task.logs)
        task.logs = [];
      task.logs.push(log);
    }
  }
  getCountOfFailedTests() {
    return Array.from(this.idMap.values()).filter((t) => {
      var _a;
      return ((_a = t.result) == null ? void 0 : _a.state) === "fail";
    }).length;
  }
  cancelFiles(files, root, projectName) {
    this.collectFiles(files.map((filepath) => ({
      filepath,
      name: relative(root, filepath),
      id: filepath,
      mode: "skip",
      type: "suite",
      result: {
        state: "skip"
      },
      meta: {},
      // Cancelled files have not yet collected tests
      tasks: [],
      projectName
    })));
  }
}

var _a, _b;
const defaultInclude = ["**/*.{test,spec}.?(c|m)[jt]s?(x)"];
const defaultExclude = ["**/node_modules/**", "**/dist/**", "**/cypress/**", "**/.{idea,git,cache,output,temp}/**", "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*"];
const benchmarkConfigDefaults = {
  include: ["**/*.{bench,benchmark}.?(c|m)[jt]s?(x)"],
  exclude: defaultExclude,
  includeSource: [],
  reporters: ["default"]
};
const defaultCoverageExcludes = [
  "coverage/**",
  "dist/**",
  "**/[.]**",
  "packages/*/test?(s)/**",
  "**/*.d.ts",
  "**/virtual:*",
  "**/__x00__*",
  "**/\0*",
  "cypress/**",
  "test?(s)/**",
  "test?(-*).?(c|m)[jt]s?(x)",
  "**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)",
  "**/__tests__/**",
  "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
  "**/vitest.{workspace,projects}.[jt]s?(on)",
  "**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}"
];
const coverageConfigDefaults = {
  provider: "v8",
  enabled: false,
  all: true,
  clean: true,
  cleanOnRerun: true,
  reportsDirectory: "./coverage",
  exclude: defaultCoverageExcludes,
  reportOnFailure: false,
  reporter: [["text", {}], ["html", {}], ["clover", {}], ["json", {}]],
  extension: [".js", ".cjs", ".mjs", ".ts", ".mts", ".cts", ".tsx", ".jsx", ".vue", ".svelte", ".marko"],
  allowExternal: false,
  processingConcurrency: Math.min(20, ((_b = (_a = nodeos__default).availableParallelism) == null ? void 0 : _b.call(_a)) ?? nodeos__default.cpus().length)
};
const fakeTimersDefaults = {
  loopLimit: 1e4,
  shouldClearNativeTimers: true,
  toFake: [
    "setTimeout",
    "clearTimeout",
    "setInterval",
    "clearInterval",
    "setImmediate",
    "clearImmediate",
    "Date"
  ]
};
const config = {
  allowOnly: !isCI,
  isolate: true,
  watch: !isCI,
  globals: false,
  environment: "node",
  pool: "threads",
  clearMocks: false,
  restoreMocks: false,
  mockReset: false,
  include: defaultInclude,
  exclude: defaultExclude,
  testTimeout: 5e3,
  hookTimeout: 1e4,
  teardownTimeout: 1e4,
  watchExclude: ["**/node_modules/**", "**/dist/**"],
  forceRerunTriggers: [
    "**/package.json/**",
    "**/{vitest,vite}.config.*/**"
  ],
  update: false,
  reporters: [],
  silent: false,
  hideSkippedTests: false,
  api: false,
  ui: false,
  uiBase: "/__vitest__/",
  open: !isCI,
  css: {
    include: []
  },
  coverage: coverageConfigDefaults,
  fakeTimers: fakeTimersDefaults,
  maxConcurrency: 5,
  dangerouslyIgnoreUnhandledErrors: false,
  typecheck: {
    checker: "tsc",
    include: ["**/*.{test,spec}-d.?(c|m)[jt]s?(x)"],
    exclude: defaultExclude
  },
  slowTestThreshold: 300,
  disableConsoleIntercept: false
};
const configDefaults = Object.freeze(config);

class FilesStatsCache {
  cache = /* @__PURE__ */ new Map();
  getStats(key) {
    return this.cache.get(key);
  }
  async populateStats(root, specs) {
    const promises = specs.map((spec) => {
      const key = `${spec[0].getName()}:${relative(root, spec[1])}`;
      return this.updateStats(spec[1], key);
    });
    await Promise.all(promises);
  }
  async updateStats(fsPath, key) {
    if (!fs$8.existsSync(fsPath))
      return;
    const stats = await fs$8.promises.stat(fsPath);
    this.cache.set(key, { size: stats.size });
  }
  removeStats(fsPath) {
    this.cache.forEach((_, key) => {
      if (key.endsWith(fsPath))
        this.cache.delete(key);
    });
  }
}

class ResultsCache {
  cache = /* @__PURE__ */ new Map();
  workspacesKeyMap = /* @__PURE__ */ new Map();
  cachePath = null;
  version = version$1;
  root = "/";
  getCachePath() {
    return this.cachePath;
  }
  setConfig(root, config) {
    this.root = root;
    if (config)
      this.cachePath = resolve(config.dir, "results.json");
  }
  getResults(key) {
    return this.cache.get(key);
  }
  async readFromCache() {
    if (!this.cachePath)
      return;
    if (!fs$8.existsSync(this.cachePath))
      return;
    const resultsCache = await fs$8.promises.readFile(this.cachePath, "utf8");
    const { results, version: version2 } = JSON.parse(resultsCache || "[]");
    if (Number(version2.split(".")[1]) >= 30) {
      this.cache = new Map(results);
      this.version = version2;
      results.forEach(([spec]) => {
        const [projectName, relativePath] = spec.split(":");
        const keyMap = this.workspacesKeyMap.get(relativePath) || [];
        keyMap.push(projectName);
        this.workspacesKeyMap.set(relativePath, keyMap);
      });
    }
  }
  updateResults(files) {
    files.forEach((file) => {
      const result = file.result;
      if (!result)
        return;
      const duration = result.duration || 0;
      const relativePath = relative(this.root, file.filepath);
      this.cache.set(`${file.projectName || ""}:${relativePath}`, {
        duration: duration >= 0 ? duration : 0,
        failed: result.state === "fail"
      });
    });
  }
  removeFromCache(filepath) {
    this.cache.forEach((_, key) => {
      if (key.endsWith(filepath))
        this.cache.delete(key);
    });
  }
  async writeToCache() {
    if (!this.cachePath)
      return;
    const results = Array.from(this.cache.entries());
    const cacheDirname = dirname(this.cachePath);
    if (!fs$8.existsSync(cacheDirname))
      await fs$8.promises.mkdir(cacheDirname, { recursive: true });
    const cache = JSON.stringify({
      version: this.version,
      results
    });
    await fs$8.promises.writeFile(this.cachePath, cache);
  }
}

class VitestCache {
  results = new ResultsCache();
  stats = new FilesStatsCache();
  getFileTestResults(key) {
    return this.results.getResults(key);
  }
  getFileStats(key) {
    return this.stats.getStats(key);
  }
  static resolveCacheDir(root, dir, projectName) {
    const baseDir = slash$1(dir || "node_modules/.vitest");
    return projectName ? resolve(root, baseDir, crypto.createHash("md5").update(projectName, "utf-8").digest("hex")) : resolve(root, baseDir);
  }
  static async clearCache(options) {
    var _a, _b, _c;
    const root = resolve(options.root || process.cwd());
    const configPath = options.config === false ? false : options.config ? resolve(root, options.config) : await findUp(configFiles, { cwd: root });
    const config = configPath ? (_a = await loadConfigFromFile({ command: "serve", mode: "test" }, configPath)) == null ? void 0 : _a.config : void 0;
    const cache = (_b = config == null ? void 0 : config.test) == null ? void 0 : _b.cache;
    const projectName = (_c = config == null ? void 0 : config.test) == null ? void 0 : _c.name;
    if (cache === false)
      throw new Error("Cache is disabled");
    const cachePath = VitestCache.resolveCacheDir(root, cache == null ? void 0 : cache.dir, projectName);
    let cleared = false;
    if (fs$8.existsSync(cachePath)) {
      fs$8.rmSync(cachePath, { recursive: true, force: true });
      cleared = true;
    }
    return { dir: cachePath, cleared };
  }
}

class BaseSequencer {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  // async so it can be extended by other sequelizers
  async shard(files) {
    const { config } = this.ctx;
    const { index, count } = config.shard;
    const shardSize = Math.ceil(files.length / count);
    const shardStart = shardSize * (index - 1);
    const shardEnd = shardSize * index;
    return [...files].map((spec) => {
      const fullPath = resolve(slash$2(config.root), slash$2(spec[1]));
      const specPath = fullPath == null ? void 0 : fullPath.slice(config.root.length);
      return {
        spec,
        hash: createHash("sha1").update(specPath).digest("hex")
      };
    }).sort((a, b) => a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0).slice(shardStart, shardEnd).map(({ spec }) => spec);
  }
  // async so it can be extended by other sequelizers
  async sort(files) {
    const cache = this.ctx.cache;
    return [...files].sort((a, b) => {
      const keyA = `${a[0].getName()}:${relative(this.ctx.config.root, a[1])}`;
      const keyB = `${b[0].getName()}:${relative(this.ctx.config.root, b[1])}`;
      const aState = cache.getFileTestResults(keyA);
      const bState = cache.getFileTestResults(keyB);
      if (!aState || !bState) {
        const statsA = cache.getFileStats(keyA);
        const statsB = cache.getFileStats(keyB);
        if (!statsA || !statsB)
          return !statsA && statsB ? -1 : !statsB && statsA ? 1 : 0;
        return statsB.size - statsA.size;
      }
      if (aState.failed && !bState.failed)
        return -1;
      if (!aState.failed && bState.failed)
        return 1;
      return bState.duration - aState.duration;
    });
  }
}

class RandomSequencer extends BaseSequencer {
  async sort(files) {
    const { sequence } = this.ctx.config;
    return shuffle(files, sequence.seed);
  }
}

function resolvePath(path, root) {
  return normalize(
    resolveModule(path, { paths: [root] }) ?? resolve(root, path)
  );
}
function resolveApiServerConfig(options) {
  let api;
  if (options.ui && !options.api)
    api = { port: defaultPort };
  else if (options.api === true)
    api = { port: defaultPort };
  else if (typeof options.api === "number")
    api = { port: options.api };
  if (typeof options.api === "object") {
    if (api) {
      if (options.api.port)
        api.port = options.api.port;
      if (options.api.strictPort)
        api.strictPort = options.api.strictPort;
      if (options.api.host)
        api.host = options.api.host;
    } else {
      api = { ...options.api };
    }
  }
  if (api) {
    if (!api.port && !api.middlewareMode)
      api.port = defaultPort;
  } else {
    api = { middlewareMode: true };
  }
  return api;
}
function resolveConfig(mode, options, viteConfig) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J;
  if (options.dom) {
    if (((_a = viteConfig.test) == null ? void 0 : _a.environment) != null && viteConfig.test.environment !== "happy-dom") {
      console.warn(
        c.yellow(
          `${c.inverse(c.yellow(" Vitest "))} Your config.test.environment ("${viteConfig.test.environment}") conflicts with --dom flag ("happy-dom"), ignoring "${viteConfig.test.environment}"`
        )
      );
    }
    options.environment = "happy-dom";
  }
  const resolved = {
    ...configDefaults,
    ...options,
    root: viteConfig.root,
    mode
  };
  resolved.inspect = Boolean(resolved.inspect);
  resolved.inspectBrk = Boolean(resolved.inspectBrk);
  if (viteConfig.base !== "/")
    resolved.base = viteConfig.base;
  if (options.shard) {
    if (resolved.watch)
      throw new Error("You cannot use --shard option with enabled watch");
    const [indexString, countString] = options.shard.split("/");
    const index = Math.abs(Number.parseInt(indexString, 10));
    const count = Math.abs(Number.parseInt(countString, 10));
    if (Number.isNaN(count) || count <= 0)
      throw new Error("--shard <count> must be a positive number");
    if (Number.isNaN(index) || index <= 0 || index > count)
      throw new Error("--shard <index> must be a positive number less then <count>");
    resolved.shard = { index, count };
  }
  if (resolved.maxWorkers)
    resolved.maxWorkers = Number(resolved.maxWorkers);
  if (resolved.minWorkers)
    resolved.minWorkers = Number(resolved.minWorkers);
  resolved.fileParallelism ?? (resolved.fileParallelism = true);
  if (!resolved.fileParallelism) {
    resolved.maxWorkers = 1;
    resolved.minWorkers = 1;
  }
  if (resolved.inspect || resolved.inspectBrk) {
    const isSingleThread = resolved.pool === "threads" && ((_c = (_b = resolved.poolOptions) == null ? void 0 : _b.threads) == null ? void 0 : _c.singleThread);
    const isSingleFork = resolved.pool === "forks" && ((_e = (_d = resolved.poolOptions) == null ? void 0 : _d.forks) == null ? void 0 : _e.singleFork);
    if (resolved.fileParallelism && !isSingleThread && !isSingleFork) {
      const inspectOption = `--inspect${resolved.inspectBrk ? "-brk" : ""}`;
      throw new Error(`You cannot use ${inspectOption} without "--no-file-parallelism", "poolOptions.threads.singleThread" or "poolOptions.forks.singleFork"`);
    }
  }
  if (resolved.coverage.provider === "c8")
    throw new Error('"coverage.provider: c8" is not supported anymore. Use "coverage.provider: v8" instead');
  if (resolved.coverage.provider === "v8" && resolved.coverage.enabled && isBrowserEnabled(resolved))
    throw new Error("@vitest/coverage-v8 does not work with --browser. Use @vitest/coverage-istanbul instead");
  resolved.deps ?? (resolved.deps = {});
  (_f = resolved.deps).moduleDirectories ?? (_f.moduleDirectories = []);
  resolved.deps.moduleDirectories = resolved.deps.moduleDirectories.map((dir) => {
    if (!dir.startsWith("/"))
      dir = `/${dir}`;
    if (!dir.endsWith("/"))
      dir += "/";
    return normalize(dir);
  });
  if (!resolved.deps.moduleDirectories.includes("/node_modules/"))
    resolved.deps.moduleDirectories.push("/node_modules/");
  (_g = resolved.deps).optimizer ?? (_g.optimizer = {});
  (_h = resolved.deps.optimizer).ssr ?? (_h.ssr = {});
  (_i = resolved.deps.optimizer.ssr).enabled ?? (_i.enabled = true);
  (_j = resolved.deps.optimizer).web ?? (_j.web = {});
  (_k = resolved.deps.optimizer.web).enabled ?? (_k.enabled = true);
  (_l = resolved.deps).web ?? (_l.web = {});
  (_m = resolved.deps.web).transformAssets ?? (_m.transformAssets = true);
  (_n = resolved.deps.web).transformCss ?? (_n.transformCss = true);
  (_o = resolved.deps.web).transformGlobPattern ?? (_o.transformGlobPattern = []);
  resolved.server ?? (resolved.server = {});
  (_p = resolved.server).deps ?? (_p.deps = {});
  const deprecatedDepsOptions = ["inline", "external", "fallbackCJS"];
  deprecatedDepsOptions.forEach((option) => {
    if (resolved.deps[option] === void 0)
      return;
    if (option === "fallbackCJS") {
      console.warn(c.yellow(`${c.inverse(c.yellow(" Vitest "))} "deps.${option}" is deprecated. Use "server.deps.${option}" instead`));
    } else {
      const transformMode = resolved.environment === "happy-dom" || resolved.environment === "jsdom" ? "web" : "ssr";
      console.warn(
        c.yellow(
          `${c.inverse(c.yellow(" Vitest "))} "deps.${option}" is deprecated. If you rely on vite-node directly, use "server.deps.${option}" instead. Otherwise, consider using "deps.optimizer.${transformMode}.${option === "external" ? "exclude" : "include"}"`
        )
      );
    }
    if (resolved.server.deps[option] === void 0)
      resolved.server.deps[option] = resolved.deps[option];
  });
  if (resolved.cliExclude)
    resolved.exclude.push(...resolved.cliExclude);
  if (resolved.server.deps.inline !== true) {
    const ssrOptions = viteConfig.ssr;
    if ((ssrOptions == null ? void 0 : ssrOptions.noExternal) === true && resolved.server.deps.inline == null) {
      resolved.server.deps.inline = true;
    } else {
      (_q = resolved.server.deps).inline ?? (_q.inline = []);
      resolved.server.deps.inline.push(...extraInlineDeps);
    }
  }
  (_r = resolved.server.deps).moduleDirectories ?? (_r.moduleDirectories = []);
  resolved.server.deps.moduleDirectories.push(...resolved.deps.moduleDirectories);
  if (resolved.runner)
    resolved.runner = resolvePath(resolved.runner, resolved.root);
  resolved.testNamePattern = resolved.testNamePattern ? resolved.testNamePattern instanceof RegExp ? resolved.testNamePattern : new RegExp(resolved.testNamePattern) : void 0;
  if (resolved.snapshotFormat && "plugins" in resolved.snapshotFormat)
    resolved.snapshotFormat.plugins = [];
  const UPDATE_SNAPSHOT = resolved.update || process.env.UPDATE_SNAPSHOT;
  resolved.snapshotOptions = {
    expand: resolved.expandSnapshotDiff ?? false,
    snapshotFormat: resolved.snapshotFormat || {},
    updateSnapshot: isCI && !UPDATE_SNAPSHOT ? "none" : UPDATE_SNAPSHOT ? "all" : "new",
    resolveSnapshotPath: options.resolveSnapshotPath,
    // resolved inside the worker
    snapshotEnvironment: null
  };
  if (options.resolveSnapshotPath)
    delete resolved.resolveSnapshotPath;
  resolved.pool ?? (resolved.pool = "threads");
  if (process.env.VITEST_MAX_THREADS) {
    resolved.poolOptions = {
      ...resolved.poolOptions,
      threads: {
        ...(_s = resolved.poolOptions) == null ? void 0 : _s.threads,
        maxThreads: Number.parseInt(process.env.VITEST_MAX_THREADS)
      },
      vmThreads: {
        ...(_t = resolved.poolOptions) == null ? void 0 : _t.vmThreads,
        maxThreads: Number.parseInt(process.env.VITEST_MAX_THREADS)
      }
    };
  }
  if (process.env.VITEST_MIN_THREADS) {
    resolved.poolOptions = {
      ...resolved.poolOptions,
      threads: {
        ...(_u = resolved.poolOptions) == null ? void 0 : _u.threads,
        minThreads: Number.parseInt(process.env.VITEST_MIN_THREADS)
      },
      vmThreads: {
        ...(_v = resolved.poolOptions) == null ? void 0 : _v.vmThreads,
        minThreads: Number.parseInt(process.env.VITEST_MIN_THREADS)
      }
    };
  }
  if (process.env.VITEST_MAX_FORKS) {
    resolved.poolOptions = {
      ...resolved.poolOptions,
      forks: {
        ...(_w = resolved.poolOptions) == null ? void 0 : _w.forks,
        maxForks: Number.parseInt(process.env.VITEST_MAX_FORKS)
      },
      vmForks: {
        ...(_x = resolved.poolOptions) == null ? void 0 : _x.vmForks,
        maxForks: Number.parseInt(process.env.VITEST_MAX_FORKS)
      }
    };
  }
  if (process.env.VITEST_MIN_FORKS) {
    resolved.poolOptions = {
      ...resolved.poolOptions,
      forks: {
        ...(_y = resolved.poolOptions) == null ? void 0 : _y.forks,
        minForks: Number.parseInt(process.env.VITEST_MIN_FORKS)
      },
      vmForks: {
        ...(_z = resolved.poolOptions) == null ? void 0 : _z.vmForks,
        minForks: Number.parseInt(process.env.VITEST_MIN_FORKS)
      }
    };
  }
  if (resolved.workspace) {
    resolved.workspace = options.workspace && options.workspace[0] === "." ? resolve(process.cwd(), options.workspace) : resolvePath(resolved.workspace, resolved.root);
  }
  if (!builtinPools.includes(resolved.pool))
    resolved.pool = resolvePath(resolved.pool, resolved.root);
  resolved.poolMatchGlobs = (resolved.poolMatchGlobs || []).map(([glob, pool]) => {
    if (!builtinPools.includes(pool))
      pool = resolvePath(pool, resolved.root);
    return [glob, pool];
  });
  if (mode === "benchmark") {
    resolved.benchmark = {
      ...benchmarkConfigDefaults,
      ...resolved.benchmark
    };
    resolved.coverage.enabled = false;
    resolved.include = resolved.benchmark.include;
    resolved.exclude = resolved.benchmark.exclude;
    resolved.includeSource = resolved.benchmark.includeSource;
    const reporters = Array.from(/* @__PURE__ */ new Set([
      ...toArray(resolved.benchmark.reporters),
      // @ts-expect-error reporter is CLI flag
      ...toArray(options.reporter)
    ])).filter(Boolean);
    if (reporters.length)
      resolved.benchmark.reporters = reporters;
    else
      resolved.benchmark.reporters = ["default"];
    if (options.outputFile)
      resolved.benchmark.outputFile = options.outputFile;
  }
  resolved.setupFiles = toArray(resolved.setupFiles || []).map(
    (file) => resolvePath(file, resolved.root)
  );
  resolved.globalSetup = toArray(resolved.globalSetup || []).map(
    (file) => resolvePath(file, resolved.root)
  );
  resolved.coverage.exclude.push(...resolved.setupFiles.map((file) => `${resolved.coverage.allowExternal ? "**/" : ""}${relative(resolved.root, file)}`));
  resolved.forceRerunTriggers = [
    ...resolved.forceRerunTriggers,
    ...resolved.setupFiles
  ];
  if (resolved.diff) {
    resolved.diff = resolvePath(resolved.diff, resolved.root);
    resolved.forceRerunTriggers.push(resolved.diff);
  }
  resolved.api = resolveApiServerConfig(options);
  if (options.related)
    resolved.related = toArray(options.related).map((file) => resolve(resolved.root, file));
  if (mode !== "benchmark") {
    const cliReporters = toArray(resolved.reporter || []).map((reporter) => {
      if (/^\.\.?\//.test(reporter))
        return resolve(process.cwd(), reporter);
      return reporter;
    });
    const reporters = cliReporters.length ? cliReporters : resolved.reporters;
    resolved.reporters = Array.from(new Set(toArray(reporters))).filter(Boolean);
  }
  if (!resolved.reporters.length)
    resolved.reporters.push("default");
  if (resolved.changed)
    resolved.passWithNoTests ?? (resolved.passWithNoTests = true);
  resolved.css ?? (resolved.css = {});
  if (typeof resolved.css === "object") {
    (_A = resolved.css).modules ?? (_A.modules = {});
    (_B = resolved.css.modules).classNameStrategy ?? (_B.classNameStrategy = "stable");
  }
  resolved.cache ?? (resolved.cache = { dir: "" });
  if (resolved.cache)
    resolved.cache.dir = VitestCache.resolveCacheDir(resolved.root, resolved.cache.dir, resolved.name);
  resolved.sequence ?? (resolved.sequence = {});
  if (!((_C = resolved.sequence) == null ? void 0 : _C.sequencer)) {
    resolved.sequence.sequencer = resolved.sequence.shuffle ? RandomSequencer : BaseSequencer;
  }
  (_D = resolved.sequence).hooks ?? (_D.hooks = "parallel");
  if (resolved.sequence.sequencer === RandomSequencer)
    (_E = resolved.sequence).seed ?? (_E.seed = Date.now());
  resolved.typecheck = {
    ...configDefaults.typecheck,
    ...resolved.typecheck
  };
  resolved.environmentMatchGlobs = (resolved.environmentMatchGlobs || []).map((i) => [resolve(resolved.root, i[0]), i[1]]);
  resolved.typecheck ?? (resolved.typecheck = {});
  (_F = resolved.typecheck).enabled ?? (_F.enabled = false);
  if (resolved.typecheck.enabled)
    console.warn(c.yellow("Testing types with tsc and vue-tsc is an experimental feature.\nBreaking changes might not follow SemVer, please pin Vitest's version when using it."));
  resolved.browser ?? (resolved.browser = {});
  (_G = resolved.browser).enabled ?? (_G.enabled = false);
  (_H = resolved.browser).headless ?? (_H.headless = isCI);
  (_I = resolved.browser).slowHijackESM ?? (_I.slowHijackESM = false);
  (_J = resolved.browser).isolate ?? (_J.isolate = true);
  if (resolved.browser.enabled && provider$1 === "stackblitz")
    resolved.browser.provider = "none";
  resolved.browser.api = resolveApiServerConfig(resolved.browser) || {
    port: defaultBrowserPort
  };
  resolved.testTransformMode ?? (resolved.testTransformMode = {});
  return resolved;
}
function isBrowserEnabled(config) {
  var _a;
  return Boolean((_a = config.browser) == null ? void 0 : _a.enabled);
}

const ESC$2 = '\u001B[';
const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';
const isTerminalApp = process.env.TERM_PROGRAM === 'Apple_Terminal';

const ansiEscapes = {};

ansiEscapes.cursorTo = (x, y) => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	if (typeof y !== 'number') {
		return ESC$2 + (x + 1) + 'G';
	}

	return ESC$2 + (y + 1) + ';' + (x + 1) + 'H';
};

ansiEscapes.cursorMove = (x, y) => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	let returnValue = '';

	if (x < 0) {
		returnValue += ESC$2 + (-x) + 'D';
	} else if (x > 0) {
		returnValue += ESC$2 + x + 'C';
	}

	if (y < 0) {
		returnValue += ESC$2 + (-y) + 'A';
	} else if (y > 0) {
		returnValue += ESC$2 + y + 'B';
	}

	return returnValue;
};

ansiEscapes.cursorUp = (count = 1) => ESC$2 + count + 'A';
ansiEscapes.cursorDown = (count = 1) => ESC$2 + count + 'B';
ansiEscapes.cursorForward = (count = 1) => ESC$2 + count + 'C';
ansiEscapes.cursorBackward = (count = 1) => ESC$2 + count + 'D';

ansiEscapes.cursorLeft = ESC$2 + 'G';
ansiEscapes.cursorSavePosition = isTerminalApp ? '\u001B7' : ESC$2 + 's';
ansiEscapes.cursorRestorePosition = isTerminalApp ? '\u001B8' : ESC$2 + 'u';
ansiEscapes.cursorGetPosition = ESC$2 + '6n';
ansiEscapes.cursorNextLine = ESC$2 + 'E';
ansiEscapes.cursorPrevLine = ESC$2 + 'F';
ansiEscapes.cursorHide = ESC$2 + '?25l';
ansiEscapes.cursorShow = ESC$2 + '?25h';

ansiEscapes.eraseLines = count => {
	let clear = '';

	for (let i = 0; i < count; i++) {
		clear += ansiEscapes.eraseLine + (i < count - 1 ? ansiEscapes.cursorUp() : '');
	}

	if (count) {
		clear += ansiEscapes.cursorLeft;
	}

	return clear;
};

ansiEscapes.eraseEndLine = ESC$2 + 'K';
ansiEscapes.eraseStartLine = ESC$2 + '1K';
ansiEscapes.eraseLine = ESC$2 + '2K';
ansiEscapes.eraseDown = ESC$2 + 'J';
ansiEscapes.eraseUp = ESC$2 + '1J';
ansiEscapes.eraseScreen = ESC$2 + '2J';
ansiEscapes.scrollUp = ESC$2 + 'S';
ansiEscapes.scrollDown = ESC$2 + 'T';

ansiEscapes.clearScreen = '\u001Bc';

ansiEscapes.clearTerminal = process.platform === 'win32' ?
	`${ansiEscapes.eraseScreen}${ESC$2}0f` :
	// 1. Erases the screen (Only done in case `2` is not supported)
	// 2. Erases the whole screen including scrollback buffer
	// 3. Moves cursor to the top-left position
	// More info: https://www.real-world-systems.com/docs/ANSIcode.html
	`${ansiEscapes.eraseScreen}${ESC$2}3J${ESC$2}H`;

ansiEscapes.beep = BEL;

ansiEscapes.link = (text, url) => {
	return [
		OSC,
		'8',
		SEP,
		SEP,
		url,
		BEL,
		text,
		OSC,
		'8',
		SEP,
		SEP,
		BEL
	].join('');
};

ansiEscapes.image = (buffer, options = {}) => {
	let returnValue = `${OSC}1337;File=inline=1`;

	if (options.width) {
		returnValue += `;width=${options.width}`;
	}

	if (options.height) {
		returnValue += `;height=${options.height}`;
	}

	if (options.preserveAspectRatio === false) {
		returnValue += ';preserveAspectRatio=0';
	}

	return returnValue + ':' + buffer.toString('base64') + BEL;
};

ansiEscapes.iTerm = {
	setCwd: (cwd = process.cwd()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,

	annotation: (message, options = {}) => {
		let returnValue = `${OSC}1337;`;

		const hasX = typeof options.x !== 'undefined';
		const hasY = typeof options.y !== 'undefined';
		if ((hasX || hasY) && !(hasX && hasY && typeof options.length !== 'undefined')) {
			throw new Error('`x`, `y` and `length` must be defined when `x` or `y` is defined');
		}

		message = message.replace(/\|/g, '');

		returnValue += options.isHidden ? 'AddHiddenAnnotation=' : 'AddAnnotation=';

		if (options.length > 0) {
			returnValue +=
					(hasX ?
						[message, options.length, options.x, options.y] :
						[options.length, message]).join('|');
		} else {
			returnValue += message;
		}

		return returnValue + BEL;
	}
};

var onetime$2 = {exports: {}};

var mimicFn$2 = {exports: {}};

const mimicFn$1 = (to, from) => {
	for (const prop of Reflect.ownKeys(from)) {
		Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
	}

	return to;
};

mimicFn$2.exports = mimicFn$1;
// TODO: Remove this for the next major release
mimicFn$2.exports.default = mimicFn$1;

var mimicFnExports = mimicFn$2.exports;

const mimicFn = mimicFnExports;

const calledFunctions = new WeakMap();

const onetime = (function_, options = {}) => {
	if (typeof function_ !== 'function') {
		throw new TypeError('Expected a function');
	}

	let returnValue;
	let callCount = 0;
	const functionName = function_.displayName || function_.name || '<anonymous>';

	const onetime = function (...arguments_) {
		calledFunctions.set(onetime, ++callCount);

		if (callCount === 1) {
			returnValue = function_.apply(this, arguments_);
			function_ = null;
		} else if (options.throw === true) {
			throw new Error(`Function \`${functionName}\` can only be called once`);
		}

		return returnValue;
	};

	mimicFn(onetime, function_);
	calledFunctions.set(onetime, callCount);

	return onetime;
};

onetime$2.exports = onetime;
// TODO: Remove this for the next major release
onetime$2.exports.default = onetime;

onetime$2.exports.callCount = function_ => {
	if (!calledFunctions.has(function_)) {
		throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
	}

	return calledFunctions.get(function_);
};

var onetimeExports = onetime$2.exports;
var onetime$1 = /*@__PURE__*/getDefaultExportFromCjs(onetimeExports);

var signalExit$1 = {exports: {}};

var signals$1 = {exports: {}};

var hasRequiredSignals;

function requireSignals () {
	if (hasRequiredSignals) return signals$1.exports;
	hasRequiredSignals = 1;
	(function (module) {
		// This is not the set of all possible signals.
		//
		// It IS, however, the set of all signals that trigger
		// an exit on either Linux or BSD systems.  Linux is a
		// superset of the signal names supported on BSD, and
		// the unknown signals just fail to register, so we can
		// catch that easily enough.
		//
		// Don't bother with SIGKILL.  It's uncatchable, which
		// means that we can't fire any callbacks anyway.
		//
		// If a user does happen to register a handler on a non-
		// fatal signal like SIGWINCH or something, and then
		// exit, it'll end up firing `process.emit('exit')`, so
		// the handler will be fired anyway.
		//
		// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
		// artificially, inherently leave the process in a
		// state from which it is not safe to try and enter JS
		// listeners.
		module.exports = [
		  'SIGABRT',
		  'SIGALRM',
		  'SIGHUP',
		  'SIGINT',
		  'SIGTERM'
		];

		if (process.platform !== 'win32') {
		  module.exports.push(
		    'SIGVTALRM',
		    'SIGXCPU',
		    'SIGXFSZ',
		    'SIGUSR2',
		    'SIGTRAP',
		    'SIGSYS',
		    'SIGQUIT',
		    'SIGIOT'
		    // should detect profiler and enable/disable accordingly.
		    // see #21
		    // 'SIGPROF'
		  );
		}

		if (process.platform === 'linux') {
		  module.exports.push(
		    'SIGIO',
		    'SIGPOLL',
		    'SIGPWR',
		    'SIGSTKFLT',
		    'SIGUNUSED'
		  );
		} 
	} (signals$1));
	return signals$1.exports;
}

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
// grab a reference to node's real process object right away
var process$1 = commonjsGlobal.process;

const processOk = function (process) {
  return process &&
    typeof process === 'object' &&
    typeof process.removeListener === 'function' &&
    typeof process.emit === 'function' &&
    typeof process.reallyExit === 'function' &&
    typeof process.listeners === 'function' &&
    typeof process.kill === 'function' &&
    typeof process.pid === 'number' &&
    typeof process.on === 'function'
};

// some kind of non-node environment, just no-op
/* istanbul ignore if */
if (!processOk(process$1)) {
  signalExit$1.exports = function () {
    return function () {}
  };
} else {
  var assert = require$$0$3;
  var signals = requireSignals();
  var isWin = /^win/i.test(process$1.platform);

  var EE = require$$2;
  /* istanbul ignore if */
  if (typeof EE !== 'function') {
    EE = EE.EventEmitter;
  }

  var emitter;
  if (process$1.__signal_exit_emitter__) {
    emitter = process$1.__signal_exit_emitter__;
  } else {
    emitter = process$1.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }

  // Because this emitter is a global, we have to check to see if a
  // previous version of this library failed to enable infinite listeners.
  // I know what you're about to say.  But literally everything about
  // signal-exit is a compromise with evil.  Get used to it.
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }

  signalExit$1.exports = function (cb, opts) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return function () {}
    }
    assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

    if (loaded === false) {
      load();
    }

    var ev = 'exit';
    if (opts && opts.alwaysLast) {
      ev = 'afterexit';
    }

    var remove = function () {
      emitter.removeListener(ev, cb);
      if (emitter.listeners('exit').length === 0 &&
          emitter.listeners('afterexit').length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);

    return remove
  };

  var unload = function unload () {
    if (!loaded || !processOk(commonjsGlobal.process)) {
      return
    }
    loaded = false;

    signals.forEach(function (sig) {
      try {
        process$1.removeListener(sig, sigListeners[sig]);
      } catch (er) {}
    });
    process$1.emit = originalProcessEmit;
    process$1.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExit$1.exports.unload = unload;

  var emit = function emit (event, code, signal) {
    /* istanbul ignore if */
    if (emitter.emitted[event]) {
      return
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };

  // { <signal>: <listener fn>, ... }
  var sigListeners = {};
  signals.forEach(function (sig) {
    sigListeners[sig] = function listener () {
      /* istanbul ignore if */
      if (!processOk(commonjsGlobal.process)) {
        return
      }
      // If there are no other listeners, an exit is coming!
      // Simplest way: remove us and then re-send the signal.
      // We know that this will kill the process, so we can
      // safely emit now.
      var listeners = process$1.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit('exit', null, sig);
        /* istanbul ignore next */
        emit('afterexit', null, sig);
        /* istanbul ignore next */
        if (isWin && sig === 'SIGHUP') {
          // "SIGHUP" throws an `ENOSYS` error on Windows,
          // so use a supported signal instead
          sig = 'SIGINT';
        }
        /* istanbul ignore next */
        process$1.kill(process$1.pid, sig);
      }
    };
  });

  signalExit$1.exports.signals = function () {
    return signals
  };

  var loaded = false;

  var load = function load () {
    if (loaded || !processOk(commonjsGlobal.process)) {
      return
    }
    loaded = true;

    // This is the number of onSignalExit's that are in play.
    // It's important so that we can count the correct number of
    // listeners on signals, and don't wait for the other one to
    // handle it instead of us.
    emitter.count += 1;

    signals = signals.filter(function (sig) {
      try {
        process$1.on(sig, sigListeners[sig]);
        return true
      } catch (er) {
        return false
      }
    });

    process$1.emit = processEmit;
    process$1.reallyExit = processReallyExit;
  };
  signalExit$1.exports.load = load;

  var originalProcessReallyExit = process$1.reallyExit;
  var processReallyExit = function processReallyExit (code) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return
    }
    process$1.exitCode = code || /* istanbul ignore next */ 0;
    emit('exit', process$1.exitCode, null);
    /* istanbul ignore next */
    emit('afterexit', process$1.exitCode, null);
    /* istanbul ignore next */
    originalProcessReallyExit.call(process$1, process$1.exitCode);
  };

  var originalProcessEmit = process$1.emit;
  var processEmit = function processEmit (ev, arg) {
    if (ev === 'exit' && processOk(commonjsGlobal.process)) {
      /* istanbul ignore else */
      if (arg !== undefined) {
        process$1.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      /* istanbul ignore next */
      emit('exit', process$1.exitCode, null);
      /* istanbul ignore next */
      emit('afterexit', process$1.exitCode, null);
      /* istanbul ignore next */
      return ret
    } else {
      return originalProcessEmit.apply(this, arguments)
    }
  };
}

var signalExitExports = signalExit$1.exports;
var signalExit = /*@__PURE__*/getDefaultExportFromCjs(signalExitExports);

const restoreCursor = onetime$1(() => {
	signalExit(() => {
		process$2.stderr.write('\u001B[?25h');
	}, {alwaysLast: true});
});

let isHidden = false;

const cliCursor = {};

cliCursor.show = (writableStream = process$2.stderr) => {
	if (!writableStream.isTTY) {
		return;
	}

	isHidden = false;
	writableStream.write('\u001B[?25h');
};

cliCursor.hide = (writableStream = process$2.stderr) => {
	if (!writableStream.isTTY) {
		return;
	}

	restoreCursor();
	isHidden = true;
	writableStream.write('\u001B[?25l');
};

cliCursor.toggle = (force, writableStream) => {
	if (force !== undefined) {
		isHidden = force;
	}

	if (isHidden) {
		cliCursor.show(writableStream);
	} else {
		cliCursor.hide(writableStream);
	}
};

var eastasianwidth = {exports: {}};

(function (module) {
	var eaw = {};

	{
	  module.exports = eaw;
	}

	eaw.eastAsianWidth = function(character) {
	  var x = character.charCodeAt(0);
	  var y = (character.length == 2) ? character.charCodeAt(1) : 0;
	  var codePoint = x;
	  if ((0xD800 <= x && x <= 0xDBFF) && (0xDC00 <= y && y <= 0xDFFF)) {
	    x &= 0x3FF;
	    y &= 0x3FF;
	    codePoint = (x << 10) | y;
	    codePoint += 0x10000;
	  }

	  if ((0x3000 == codePoint) ||
	      (0xFF01 <= codePoint && codePoint <= 0xFF60) ||
	      (0xFFE0 <= codePoint && codePoint <= 0xFFE6)) {
	    return 'F';
	  }
	  if ((0x20A9 == codePoint) ||
	      (0xFF61 <= codePoint && codePoint <= 0xFFBE) ||
	      (0xFFC2 <= codePoint && codePoint <= 0xFFC7) ||
	      (0xFFCA <= codePoint && codePoint <= 0xFFCF) ||
	      (0xFFD2 <= codePoint && codePoint <= 0xFFD7) ||
	      (0xFFDA <= codePoint && codePoint <= 0xFFDC) ||
	      (0xFFE8 <= codePoint && codePoint <= 0xFFEE)) {
	    return 'H';
	  }
	  if ((0x1100 <= codePoint && codePoint <= 0x115F) ||
	      (0x11A3 <= codePoint && codePoint <= 0x11A7) ||
	      (0x11FA <= codePoint && codePoint <= 0x11FF) ||
	      (0x2329 <= codePoint && codePoint <= 0x232A) ||
	      (0x2E80 <= codePoint && codePoint <= 0x2E99) ||
	      (0x2E9B <= codePoint && codePoint <= 0x2EF3) ||
	      (0x2F00 <= codePoint && codePoint <= 0x2FD5) ||
	      (0x2FF0 <= codePoint && codePoint <= 0x2FFB) ||
	      (0x3001 <= codePoint && codePoint <= 0x303E) ||
	      (0x3041 <= codePoint && codePoint <= 0x3096) ||
	      (0x3099 <= codePoint && codePoint <= 0x30FF) ||
	      (0x3105 <= codePoint && codePoint <= 0x312D) ||
	      (0x3131 <= codePoint && codePoint <= 0x318E) ||
	      (0x3190 <= codePoint && codePoint <= 0x31BA) ||
	      (0x31C0 <= codePoint && codePoint <= 0x31E3) ||
	      (0x31F0 <= codePoint && codePoint <= 0x321E) ||
	      (0x3220 <= codePoint && codePoint <= 0x3247) ||
	      (0x3250 <= codePoint && codePoint <= 0x32FE) ||
	      (0x3300 <= codePoint && codePoint <= 0x4DBF) ||
	      (0x4E00 <= codePoint && codePoint <= 0xA48C) ||
	      (0xA490 <= codePoint && codePoint <= 0xA4C6) ||
	      (0xA960 <= codePoint && codePoint <= 0xA97C) ||
	      (0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
	      (0xD7B0 <= codePoint && codePoint <= 0xD7C6) ||
	      (0xD7CB <= codePoint && codePoint <= 0xD7FB) ||
	      (0xF900 <= codePoint && codePoint <= 0xFAFF) ||
	      (0xFE10 <= codePoint && codePoint <= 0xFE19) ||
	      (0xFE30 <= codePoint && codePoint <= 0xFE52) ||
	      (0xFE54 <= codePoint && codePoint <= 0xFE66) ||
	      (0xFE68 <= codePoint && codePoint <= 0xFE6B) ||
	      (0x1B000 <= codePoint && codePoint <= 0x1B001) ||
	      (0x1F200 <= codePoint && codePoint <= 0x1F202) ||
	      (0x1F210 <= codePoint && codePoint <= 0x1F23A) ||
	      (0x1F240 <= codePoint && codePoint <= 0x1F248) ||
	      (0x1F250 <= codePoint && codePoint <= 0x1F251) ||
	      (0x20000 <= codePoint && codePoint <= 0x2F73F) ||
	      (0x2B740 <= codePoint && codePoint <= 0x2FFFD) ||
	      (0x30000 <= codePoint && codePoint <= 0x3FFFD)) {
	    return 'W';
	  }
	  if ((0x0020 <= codePoint && codePoint <= 0x007E) ||
	      (0x00A2 <= codePoint && codePoint <= 0x00A3) ||
	      (0x00A5 <= codePoint && codePoint <= 0x00A6) ||
	      (0x00AC == codePoint) ||
	      (0x00AF == codePoint) ||
	      (0x27E6 <= codePoint && codePoint <= 0x27ED) ||
	      (0x2985 <= codePoint && codePoint <= 0x2986)) {
	    return 'Na';
	  }
	  if ((0x00A1 == codePoint) ||
	      (0x00A4 == codePoint) ||
	      (0x00A7 <= codePoint && codePoint <= 0x00A8) ||
	      (0x00AA == codePoint) ||
	      (0x00AD <= codePoint && codePoint <= 0x00AE) ||
	      (0x00B0 <= codePoint && codePoint <= 0x00B4) ||
	      (0x00B6 <= codePoint && codePoint <= 0x00BA) ||
	      (0x00BC <= codePoint && codePoint <= 0x00BF) ||
	      (0x00C6 == codePoint) ||
	      (0x00D0 == codePoint) ||
	      (0x00D7 <= codePoint && codePoint <= 0x00D8) ||
	      (0x00DE <= codePoint && codePoint <= 0x00E1) ||
	      (0x00E6 == codePoint) ||
	      (0x00E8 <= codePoint && codePoint <= 0x00EA) ||
	      (0x00EC <= codePoint && codePoint <= 0x00ED) ||
	      (0x00F0 == codePoint) ||
	      (0x00F2 <= codePoint && codePoint <= 0x00F3) ||
	      (0x00F7 <= codePoint && codePoint <= 0x00FA) ||
	      (0x00FC == codePoint) ||
	      (0x00FE == codePoint) ||
	      (0x0101 == codePoint) ||
	      (0x0111 == codePoint) ||
	      (0x0113 == codePoint) ||
	      (0x011B == codePoint) ||
	      (0x0126 <= codePoint && codePoint <= 0x0127) ||
	      (0x012B == codePoint) ||
	      (0x0131 <= codePoint && codePoint <= 0x0133) ||
	      (0x0138 == codePoint) ||
	      (0x013F <= codePoint && codePoint <= 0x0142) ||
	      (0x0144 == codePoint) ||
	      (0x0148 <= codePoint && codePoint <= 0x014B) ||
	      (0x014D == codePoint) ||
	      (0x0152 <= codePoint && codePoint <= 0x0153) ||
	      (0x0166 <= codePoint && codePoint <= 0x0167) ||
	      (0x016B == codePoint) ||
	      (0x01CE == codePoint) ||
	      (0x01D0 == codePoint) ||
	      (0x01D2 == codePoint) ||
	      (0x01D4 == codePoint) ||
	      (0x01D6 == codePoint) ||
	      (0x01D8 == codePoint) ||
	      (0x01DA == codePoint) ||
	      (0x01DC == codePoint) ||
	      (0x0251 == codePoint) ||
	      (0x0261 == codePoint) ||
	      (0x02C4 == codePoint) ||
	      (0x02C7 == codePoint) ||
	      (0x02C9 <= codePoint && codePoint <= 0x02CB) ||
	      (0x02CD == codePoint) ||
	      (0x02D0 == codePoint) ||
	      (0x02D8 <= codePoint && codePoint <= 0x02DB) ||
	      (0x02DD == codePoint) ||
	      (0x02DF == codePoint) ||
	      (0x0300 <= codePoint && codePoint <= 0x036F) ||
	      (0x0391 <= codePoint && codePoint <= 0x03A1) ||
	      (0x03A3 <= codePoint && codePoint <= 0x03A9) ||
	      (0x03B1 <= codePoint && codePoint <= 0x03C1) ||
	      (0x03C3 <= codePoint && codePoint <= 0x03C9) ||
	      (0x0401 == codePoint) ||
	      (0x0410 <= codePoint && codePoint <= 0x044F) ||
	      (0x0451 == codePoint) ||
	      (0x2010 == codePoint) ||
	      (0x2013 <= codePoint && codePoint <= 0x2016) ||
	      (0x2018 <= codePoint && codePoint <= 0x2019) ||
	      (0x201C <= codePoint && codePoint <= 0x201D) ||
	      (0x2020 <= codePoint && codePoint <= 0x2022) ||
	      (0x2024 <= codePoint && codePoint <= 0x2027) ||
	      (0x2030 == codePoint) ||
	      (0x2032 <= codePoint && codePoint <= 0x2033) ||
	      (0x2035 == codePoint) ||
	      (0x203B == codePoint) ||
	      (0x203E == codePoint) ||
	      (0x2074 == codePoint) ||
	      (0x207F == codePoint) ||
	      (0x2081 <= codePoint && codePoint <= 0x2084) ||
	      (0x20AC == codePoint) ||
	      (0x2103 == codePoint) ||
	      (0x2105 == codePoint) ||
	      (0x2109 == codePoint) ||
	      (0x2113 == codePoint) ||
	      (0x2116 == codePoint) ||
	      (0x2121 <= codePoint && codePoint <= 0x2122) ||
	      (0x2126 == codePoint) ||
	      (0x212B == codePoint) ||
	      (0x2153 <= codePoint && codePoint <= 0x2154) ||
	      (0x215B <= codePoint && codePoint <= 0x215E) ||
	      (0x2160 <= codePoint && codePoint <= 0x216B) ||
	      (0x2170 <= codePoint && codePoint <= 0x2179) ||
	      (0x2189 == codePoint) ||
	      (0x2190 <= codePoint && codePoint <= 0x2199) ||
	      (0x21B8 <= codePoint && codePoint <= 0x21B9) ||
	      (0x21D2 == codePoint) ||
	      (0x21D4 == codePoint) ||
	      (0x21E7 == codePoint) ||
	      (0x2200 == codePoint) ||
	      (0x2202 <= codePoint && codePoint <= 0x2203) ||
	      (0x2207 <= codePoint && codePoint <= 0x2208) ||
	      (0x220B == codePoint) ||
	      (0x220F == codePoint) ||
	      (0x2211 == codePoint) ||
	      (0x2215 == codePoint) ||
	      (0x221A == codePoint) ||
	      (0x221D <= codePoint && codePoint <= 0x2220) ||
	      (0x2223 == codePoint) ||
	      (0x2225 == codePoint) ||
	      (0x2227 <= codePoint && codePoint <= 0x222C) ||
	      (0x222E == codePoint) ||
	      (0x2234 <= codePoint && codePoint <= 0x2237) ||
	      (0x223C <= codePoint && codePoint <= 0x223D) ||
	      (0x2248 == codePoint) ||
	      (0x224C == codePoint) ||
	      (0x2252 == codePoint) ||
	      (0x2260 <= codePoint && codePoint <= 0x2261) ||
	      (0x2264 <= codePoint && codePoint <= 0x2267) ||
	      (0x226A <= codePoint && codePoint <= 0x226B) ||
	      (0x226E <= codePoint && codePoint <= 0x226F) ||
	      (0x2282 <= codePoint && codePoint <= 0x2283) ||
	      (0x2286 <= codePoint && codePoint <= 0x2287) ||
	      (0x2295 == codePoint) ||
	      (0x2299 == codePoint) ||
	      (0x22A5 == codePoint) ||
	      (0x22BF == codePoint) ||
	      (0x2312 == codePoint) ||
	      (0x2460 <= codePoint && codePoint <= 0x24E9) ||
	      (0x24EB <= codePoint && codePoint <= 0x254B) ||
	      (0x2550 <= codePoint && codePoint <= 0x2573) ||
	      (0x2580 <= codePoint && codePoint <= 0x258F) ||
	      (0x2592 <= codePoint && codePoint <= 0x2595) ||
	      (0x25A0 <= codePoint && codePoint <= 0x25A1) ||
	      (0x25A3 <= codePoint && codePoint <= 0x25A9) ||
	      (0x25B2 <= codePoint && codePoint <= 0x25B3) ||
	      (0x25B6 <= codePoint && codePoint <= 0x25B7) ||
	      (0x25BC <= codePoint && codePoint <= 0x25BD) ||
	      (0x25C0 <= codePoint && codePoint <= 0x25C1) ||
	      (0x25C6 <= codePoint && codePoint <= 0x25C8) ||
	      (0x25CB == codePoint) ||
	      (0x25CE <= codePoint && codePoint <= 0x25D1) ||
	      (0x25E2 <= codePoint && codePoint <= 0x25E5) ||
	      (0x25EF == codePoint) ||
	      (0x2605 <= codePoint && codePoint <= 0x2606) ||
	      (0x2609 == codePoint) ||
	      (0x260E <= codePoint && codePoint <= 0x260F) ||
	      (0x2614 <= codePoint && codePoint <= 0x2615) ||
	      (0x261C == codePoint) ||
	      (0x261E == codePoint) ||
	      (0x2640 == codePoint) ||
	      (0x2642 == codePoint) ||
	      (0x2660 <= codePoint && codePoint <= 0x2661) ||
	      (0x2663 <= codePoint && codePoint <= 0x2665) ||
	      (0x2667 <= codePoint && codePoint <= 0x266A) ||
	      (0x266C <= codePoint && codePoint <= 0x266D) ||
	      (0x266F == codePoint) ||
	      (0x269E <= codePoint && codePoint <= 0x269F) ||
	      (0x26BE <= codePoint && codePoint <= 0x26BF) ||
	      (0x26C4 <= codePoint && codePoint <= 0x26CD) ||
	      (0x26CF <= codePoint && codePoint <= 0x26E1) ||
	      (0x26E3 == codePoint) ||
	      (0x26E8 <= codePoint && codePoint <= 0x26FF) ||
	      (0x273D == codePoint) ||
	      (0x2757 == codePoint) ||
	      (0x2776 <= codePoint && codePoint <= 0x277F) ||
	      (0x2B55 <= codePoint && codePoint <= 0x2B59) ||
	      (0x3248 <= codePoint && codePoint <= 0x324F) ||
	      (0xE000 <= codePoint && codePoint <= 0xF8FF) ||
	      (0xFE00 <= codePoint && codePoint <= 0xFE0F) ||
	      (0xFFFD == codePoint) ||
	      (0x1F100 <= codePoint && codePoint <= 0x1F10A) ||
	      (0x1F110 <= codePoint && codePoint <= 0x1F12D) ||
	      (0x1F130 <= codePoint && codePoint <= 0x1F169) ||
	      (0x1F170 <= codePoint && codePoint <= 0x1F19A) ||
	      (0xE0100 <= codePoint && codePoint <= 0xE01EF) ||
	      (0xF0000 <= codePoint && codePoint <= 0xFFFFD) ||
	      (0x100000 <= codePoint && codePoint <= 0x10FFFD)) {
	    return 'A';
	  }

	  return 'N';
	};

	eaw.characterLength = function(character) {
	  var code = this.eastAsianWidth(character);
	  if (code == 'F' || code == 'W' || code == 'A') {
	    return 2;
	  } else {
	    return 1;
	  }
	};

	// Split a string considering surrogate-pairs.
	function stringToArray(string) {
	  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
	}

	eaw.length = function(string) {
	  var characters = stringToArray(string);
	  var len = 0;
	  for (var i = 0; i < characters.length; i++) {
	    len = len + this.characterLength(characters[i]);
	  }
	  return len;
	};

	eaw.slice = function(text, start, end) {
	  textLen = eaw.length(text);
	  start = start ? start : 0;
	  end = end ? end : 1;
	  if (start < 0) {
	      start = textLen + start;
	  }
	  if (end < 0) {
	      end = textLen + end;
	  }
	  var result = '';
	  var eawLen = 0;
	  var chars = stringToArray(text);
	  for (var i = 0; i < chars.length; i++) {
	    var char = chars[i];
	    var charLen = eaw.length(char);
	    if (eawLen >= start - (charLen == 2 ? 1 : 0)) {
	        if (eawLen + charLen <= end) {
	            result += char;
	        } else {
	            break;
	        }
	    }
	    eawLen += charLen;
	  }
	  return result;
	}; 
} (eastasianwidth));

var eastasianwidthExports = eastasianwidth.exports;
var eastAsianWidth = /*@__PURE__*/getDefaultExportFromCjs(eastasianwidthExports);

var emojiRegex = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

var emojiRegex$1 = /*@__PURE__*/getDefaultExportFromCjs(emojiRegex);

function stringWidth(string, options = {}) {
	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	options = {
		ambiguousIsNarrow: true,
		...options
	};

	string = stripAnsi(string);

	if (string.length === 0) {
		return 0;
	}

	string = string.replace(emojiRegex$1(), '  ');

	const ambiguousCharacterWidth = options.ambiguousIsNarrow ? 1 : 2;
	let width = 0;

	for (const character of string) {
		const codePoint = character.codePointAt(0);

		// Ignore control characters
		if (codePoint <= 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (codePoint >= 0x300 && codePoint <= 0x36F) {
			continue;
		}

		const code = eastAsianWidth.eastAsianWidth(character);
		switch (code) {
			case 'F':
			case 'W':
				width += 2;
				break;
			case 'A':
				width += ambiguousCharacterWidth;
				break;
			default:
				width += 1;
		}
	}

	return width;
}

const ESCAPES = new Set([
	'\u001B',
	'\u009B',
]);

const END_CODE = 39;
const ANSI_ESCAPE_BELL = '\u0007';
const ANSI_CSI = '[';
const ANSI_OSC = ']';
const ANSI_SGR_TERMINATOR = 'm';
const ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;

const wrapAnsiCode = code => `${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
const wrapAnsiHyperlink = uri => `${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${uri}${ANSI_ESCAPE_BELL}`;

// Calculate the length of words split on ' ', ignoring
// the extra characters added by ansi escape codes
const wordLengths = string => string.split(' ').map(character => stringWidth(character));

// Wrap a long word across multiple rows
// Ansi escape codes do not count towards length
const wrapWord = (rows, word, columns) => {
	const characters = [...word];

	let isInsideEscape = false;
	let isInsideLinkEscape = false;
	let visible = stringWidth(stripAnsi(rows[rows.length - 1]));

	for (const [index, character] of characters.entries()) {
		const characterLength = stringWidth(character);

		if (visible + characterLength <= columns) {
			rows[rows.length - 1] += character;
		} else {
			rows.push(character);
			visible = 0;
		}

		if (ESCAPES.has(character)) {
			isInsideEscape = true;
			isInsideLinkEscape = characters.slice(index + 1).join('').startsWith(ANSI_ESCAPE_LINK);
		}

		if (isInsideEscape) {
			if (isInsideLinkEscape) {
				if (character === ANSI_ESCAPE_BELL) {
					isInsideEscape = false;
					isInsideLinkEscape = false;
				}
			} else if (character === ANSI_SGR_TERMINATOR) {
				isInsideEscape = false;
			}

			continue;
		}

		visible += characterLength;

		if (visible === columns && index < characters.length - 1) {
			rows.push('');
			visible = 0;
		}
	}

	// It's possible that the last row we copy over is only
	// ansi escape characters, handle this edge-case
	if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
		rows[rows.length - 2] += rows.pop();
	}
};

// Trims spaces from a string ignoring invisible sequences
const stringVisibleTrimSpacesRight = string => {
	const words = string.split(' ');
	let last = words.length;

	while (last > 0) {
		if (stringWidth(words[last - 1]) > 0) {
			break;
		}

		last--;
	}

	if (last === words.length) {
		return string;
	}

	return words.slice(0, last).join(' ') + words.slice(last).join('');
};

// The wrap-ansi module can be invoked in either 'hard' or 'soft' wrap mode
//
// 'hard' will never allow a string to take up more than columns characters
//
// 'soft' allows long words to expand past the column length
const exec = (string, columns, options = {}) => {
	if (options.trim !== false && string.trim() === '') {
		return '';
	}

	let returnValue = '';
	let escapeCode;
	let escapeUrl;

	const lengths = wordLengths(string);
	let rows = [''];

	for (const [index, word] of string.split(' ').entries()) {
		if (options.trim !== false) {
			rows[rows.length - 1] = rows[rows.length - 1].trimStart();
		}

		let rowLength = stringWidth(rows[rows.length - 1]);

		if (index !== 0) {
			if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
				// If we start with a new word but the current row length equals the length of the columns, add a new row
				rows.push('');
				rowLength = 0;
			}

			if (rowLength > 0 || options.trim === false) {
				rows[rows.length - 1] += ' ';
				rowLength++;
			}
		}

		// In 'hard' wrap mode, the length of a line is never allowed to extend past 'columns'
		if (options.hard && lengths[index] > columns) {
			const remainingColumns = (columns - rowLength);
			const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
			const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
			if (breaksStartingNextLine < breaksStartingThisLine) {
				rows.push('');
			}

			wrapWord(rows, word, columns);
			continue;
		}

		if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
			if (options.wordWrap === false && rowLength < columns) {
				wrapWord(rows, word, columns);
				continue;
			}

			rows.push('');
		}

		if (rowLength + lengths[index] > columns && options.wordWrap === false) {
			wrapWord(rows, word, columns);
			continue;
		}

		rows[rows.length - 1] += word;
	}

	if (options.trim !== false) {
		rows = rows.map(row => stringVisibleTrimSpacesRight(row));
	}

	const pre = [...rows.join('\n')];

	for (const [index, character] of pre.entries()) {
		returnValue += character;

		if (ESCAPES.has(character)) {
			const {groups} = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(pre.slice(index).join('')) || {groups: {}};
			if (groups.code !== undefined) {
				const code = Number.parseFloat(groups.code);
				escapeCode = code === END_CODE ? undefined : code;
			} else if (groups.uri !== undefined) {
				escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
			}
		}

		const code = ansiStyles.codes.get(Number(escapeCode));

		if (pre[index + 1] === '\n') {
			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink('');
			}

			if (escapeCode && code) {
				returnValue += wrapAnsiCode(code);
			}
		} else if (character === '\n') {
			if (escapeCode && code) {
				returnValue += wrapAnsiCode(escapeCode);
			}

			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink(escapeUrl);
			}
		}
	}

	return returnValue;
};

// For each newline, invoke the method separately
function wrapAnsi(string, columns, options) {
	return String(string)
		.normalize()
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map(line => exec(line, columns, options))
		.join('\n');
}

const defaultTerminalHeight = 24;

const getWidth = stream => {
	const {columns} = stream;

	if (!columns) {
		return 80;
	}

	return columns;
};

const fitToTerminalHeight = (stream, text) => {
	const terminalHeight = stream.rows || defaultTerminalHeight;
	const lines = text.split('\n');

	const toRemove = lines.length - terminalHeight;
	if (toRemove <= 0) {
		return text;
	}

	return sliceAnsi(
		text,
		stripAnsi(lines.slice(0, toRemove).join('\n')).length + 1,
	);
};

function createLogUpdate(stream, {showCursor = false} = {}) {
	let previousLineCount = 0;
	let previousWidth = getWidth(stream);
	let previousOutput = '';

	const render = (...arguments_) => {
		if (!showCursor) {
			cliCursor.hide();
		}

		let output = arguments_.join(' ') + '\n';
		output = fitToTerminalHeight(stream, output);
		const width = getWidth(stream);
		if (output === previousOutput && previousWidth === width) {
			return;
		}

		previousOutput = output;
		previousWidth = width;
		output = wrapAnsi(output, width, {
			trim: false,
			hard: true,
			wordWrap: false,
		});
		stream.write(ansiEscapes.eraseLines(previousLineCount) + output);
		previousLineCount = output.split('\n').length;
	};

	render.clear = () => {
		stream.write(ansiEscapes.eraseLines(previousLineCount));
		previousOutput = '';
		previousWidth = getWidth(stream);
		previousLineCount = 0;
	};

	render.done = () => {
		previousOutput = '';
		previousWidth = getWidth(stream);
		previousLineCount = 0;

		if (!showCursor) {
			cliCursor.show();
		}
	};

	return render;
}

createLogUpdate(process$2.stdout);

createLogUpdate(process$2.stderr);

var version = "1.2.2";

const HIGHLIGHT_SUPPORTED_EXTS = new Set(["js", "ts"].flatMap((lang) => [
  `.${lang}`,
  `.m${lang}`,
  `.c${lang}`,
  `.${lang}x`,
  `.m${lang}x`,
  `.c${lang}x`
]));
function highlightCode(id, source, colors) {
  const ext = extname(id);
  if (!HIGHLIGHT_SUPPORTED_EXTS.has(ext))
    return source;
  const isJsx = ext.endsWith("x");
  return highlight(source, { jsx: isJsx, colors: colors || c });
}

async function printError(error, project, options) {
  const { showCodeFrame = true, fullStack = false, type } = options;
  const logger = options.logger;
  let e = error;
  if (isPrimitive(e)) {
    e = {
      message: String(error).split(/\n/g)[0],
      stack: String(error)
    };
  }
  if (!e) {
    const error2 = new Error("unknown error");
    e = {
      message: e ?? error2.message,
      stack: error2.stack
    };
  }
  if (!project)
    return printErrorMessage(e, logger);
  const parserOptions = {
    // only browser stack traces require remapping
    getSourceMap: (file) => project.getBrowserSourceMapModuleById(file),
    frameFilter: project.config.onStackTrace
  };
  if (fullStack)
    parserOptions.ignoreStackEntries = [];
  const stacks = parseErrorStacktrace(e, parserOptions);
  const nearest = error instanceof TypeCheckError ? error.stacks[0] : stacks.find(
    (stack) => {
      try {
        return project.server && project.getModuleById(stack.file) && existsSync(stack.file);
      } catch {
        return false;
      }
    }
  );
  const errorProperties = getErrorProperties(e);
  if (type)
    printErrorType(type, project.ctx);
  printErrorMessage(e, logger);
  if (e.codeFrame)
    logger.error(`${e.codeFrame}
`);
  if (e.diff)
    displayDiff(e.diff, logger.console);
  if (e.frame) {
    logger.error(c.yellow(e.frame));
  } else {
    printStack(project, stacks, nearest, errorProperties, (s) => {
      if (showCodeFrame && s === nearest && nearest) {
        const sourceCode = readFileSync(nearest.file, "utf-8");
        logger.error(generateCodeFrame(sourceCode.length > 1e5 ? sourceCode : logger.highlight(nearest.file, sourceCode), 4, s));
      }
    });
  }
  const testPath = e.VITEST_TEST_PATH;
  const testName = e.VITEST_TEST_NAME;
  const afterEnvTeardown = e.VITEST_AFTER_ENV_TEARDOWN;
  if (testPath)
    logger.error(c.red(`This error originated in "${c.bold(testPath)}" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.`));
  if (testName) {
    logger.error(c.red(`The latest test that might've caused the error is "${c.bold(testName)}". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.`));
  }
  if (afterEnvTeardown) {
    logger.error(c.red("This error was caught after test environment was torn down. Make sure to cancel any running tasks before test finishes:\n- cancel timeouts using clearTimeout and clearInterval\n- wait for promises to resolve using the await keyword"));
  }
  if (typeof e.cause === "object" && e.cause && "name" in e.cause) {
    e.cause.name = `Caused by: ${e.cause.name}`;
    await printError(e.cause, project, { fullStack, showCodeFrame: false, logger: options.logger });
  }
  handleImportOutsideModuleError(e.stack || e.stackStr || "", logger);
}
function printErrorType(type, ctx) {
  ctx.logger.error(`
${c.red(divider(c.bold(c.inverse(` ${type} `))))}`);
}
const skipErrorProperties = /* @__PURE__ */ new Set([
  "nameStr",
  "stack",
  "cause",
  "stacks",
  "stackStr",
  "type",
  "showDiff",
  "diff",
  "codeFrame",
  "actual",
  "expected",
  "diffOptions",
  "VITEST_TEST_NAME",
  "VITEST_TEST_PATH",
  "VITEST_AFTER_ENV_TEARDOWN",
  ...Object.getOwnPropertyNames(Error.prototype),
  ...Object.getOwnPropertyNames(Object.prototype)
]);
function getErrorProperties(e) {
  const errorObject = /* @__PURE__ */ Object.create(null);
  if (e.name === "AssertionError")
    return errorObject;
  for (const key of Object.getOwnPropertyNames(e)) {
    if (!skipErrorProperties.has(key))
      errorObject[key] = e[key];
  }
  return errorObject;
}
const esmErrors = [
  "Cannot use import statement outside a module",
  "Unexpected token 'export'"
];
function handleImportOutsideModuleError(stack, logger) {
  if (!esmErrors.some((e) => stack.includes(e)))
    return;
  const path = normalize(stack.split("\n")[0].trim());
  let name = path.split("/node_modules/").pop() || "";
  if (name == null ? void 0 : name.startsWith("@"))
    name = name.split("/").slice(0, 2).join("/");
  else
    name = name.split("/")[0];
  if (name)
    printModuleWarningForPackage(logger, path, name);
  else
    printModuleWarningForSourceCode(logger, path);
}
function printModuleWarningForPackage(logger, path, name) {
  logger.error(c.yellow(
    `Module ${path} seems to be an ES Module but shipped in a CommonJS package. You might want to create an issue to the package ${c.bold(`"${name}"`)} asking them to ship the file in .mjs extension or add "type": "module" in their package.json.

As a temporary workaround you can try to inline the package by updating your config:

` + c.gray(c.dim("// vitest.config.js")) + "\n" + c.green(`export default {
  test: {
    server: {
      deps: {
        inline: [
          ${c.yellow(c.bold(`"${name}"`))}
        ]
      }
    }
  }
}
`)
  ));
}
function printModuleWarningForSourceCode(logger, path) {
  logger.error(c.yellow(
    `Module ${path} seems to be an ES Module but shipped in a CommonJS package. To fix this issue, change the file extension to .mjs or add "type": "module" in your package.json.`
  ));
}
function displayDiff(diff, console) {
  if (diff)
    console.error(`
${diff}
`);
}
function printErrorMessage(error, logger) {
  const errorName = error.name || error.nameStr || "Unknown Error";
  if (!error.message) {
    logger.error(error);
    return;
  }
  if (error.message.length > 5e3) {
    logger.error(`${c.red(c.bold(errorName))}: ${error.message}`);
  } else {
    logger.error(c.red(`${c.bold(errorName)}: ${error.message}`));
  }
}
function printStack(project, stack, highlight, errorProperties, onStack) {
  const logger = project.ctx.logger;
  for (const frame of stack) {
    const color = frame === highlight ? c.cyan : c.gray;
    const path = relative(project.config.root, frame.file);
    logger.error(color(` ${c.dim(F_POINTER)} ${[frame.method, `${path}:${c.dim(`${frame.line}:${frame.column}`)}`].filter(Boolean).join(" ")}`));
    onStack == null ? void 0 : onStack(frame);
  }
  if (stack.length)
    logger.error();
  const hasProperties = Object.keys(errorProperties).length > 0;
  if (hasProperties) {
    logger.error(c.red(c.dim(divider())));
    const propertiesString = inspect(errorProperties);
    logger.error(c.red(c.bold("Serialized Error:")), c.gray(propertiesString));
  }
}
function generateCodeFrame(source, indent = 0, loc, range = 2) {
  var _a;
  const start = typeof loc === "object" ? positionToOffset(source, loc.line, loc.column) : loc;
  const end = start;
  const lines = source.split(lineSplitRE);
  const nl = /\r\n/.test(source) ? 2 : 1;
  let count = 0;
  let res = [];
  const columns = ((_a = process.stdout) == null ? void 0 : _a.columns) || 80;
  function lineNo(no = "") {
    return c.gray(`${String(no).padStart(3, " ")}| `);
  }
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + nl;
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length)
          continue;
        const lineLength = lines[j].length;
        if (lineLength > 200)
          return "";
        res.push(lineNo(j + 1) + cliTruncate(lines[j].replace(/\t/g, " "), columns - 5 - indent));
        if (j === i) {
          const pad = start - (count - lineLength) + (nl - 1);
          const length = Math.max(1, end > count ? lineLength - pad : end - start);
          res.push(lineNo() + " ".repeat(pad) + c.red("^".repeat(length)));
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(1, Math.min(end - count, lineLength));
            res.push(lineNo() + c.red("^".repeat(length)));
          }
          count += lineLength + 1;
        }
      }
      break;
    }
  }
  if (indent)
    res = res.map((line) => " ".repeat(indent) + line);
  return res.join("\n");
}

const ESC$1 = "\x1B[";
const ERASE_DOWN = `${ESC$1}J`;
const ERASE_SCROLLBACK = `${ESC$1}3J`;
const CURSOR_TO_START = `${ESC$1}1;1H`;
const CLEAR_SCREEN = "\x1Bc";
class Logger {
  constructor(ctx, console = globalThis.console) {
    this.ctx = ctx;
    this.console = console;
    this._highlights.clear();
  }
  outputStream = process.stdout;
  errorStream = process.stderr;
  logUpdate = createLogUpdate(process.stdout);
  _clearScreenPending;
  _highlights = /* @__PURE__ */ new Map();
  log(...args) {
    this._clearScreen();
    this.console.log(...args);
  }
  error(...args) {
    this._clearScreen();
    this.console.error(...args);
  }
  warn(...args) {
    this._clearScreen();
    this.console.warn(...args);
  }
  clearFullScreen(message) {
    if (this.ctx.server.config.clearScreen === false) {
      this.console.log(message);
      return;
    }
    this.console.log(`${ERASE_SCROLLBACK}${CLEAR_SCREEN}${message}`);
  }
  clearScreen(message, force = false) {
    if (this.ctx.server.config.clearScreen === false) {
      this.console.log(message);
      return;
    }
    this._clearScreenPending = message;
    if (force)
      this._clearScreen();
  }
  _clearScreen() {
    if (this._clearScreenPending == null)
      return;
    const log = this._clearScreenPending;
    this._clearScreenPending = void 0;
    this.console.log(`${CURSOR_TO_START}${ERASE_DOWN}${log}`);
  }
  printError(err, options = {}) {
    const { fullStack = false, type } = options;
    const project = options.project ?? this.ctx.getCoreWorkspaceProject() ?? this.ctx.projects[0];
    return printError(err, project, {
      fullStack,
      type,
      showCodeFrame: true,
      logger: this
    });
  }
  clearHighlightCache(filename) {
    if (filename)
      this._highlights.delete(filename);
    else
      this._highlights.clear();
  }
  highlight(filename, source) {
    if (this._highlights.has(filename))
      return this._highlights.get(filename);
    const code = highlightCode(filename, source);
    this._highlights.set(filename, code);
    return code;
  }
  printNoTestFound(filters) {
    var _a;
    const config = this.ctx.config;
    const comma = c.dim(", ");
    if (filters == null ? void 0 : filters.length)
      this.console.error(c.dim("filter:  ") + c.yellow(filters.join(comma)));
    const projectsFilter = toArray(config.project);
    if (projectsFilter.length)
      this.console.error(c.dim("projects: ") + c.yellow(projectsFilter.join(comma)));
    this.ctx.projects.forEach((project) => {
      const config2 = project.config;
      const name = project.getName();
      const output = project.isCore() || !name ? "" : `[${name}]`;
      if (output)
        this.console.error(c.bgCyan(`${output} Config`));
      if (config2.include)
        this.console.error(c.dim("include: ") + c.yellow(config2.include.join(comma)));
      if (config2.exclude)
        this.console.error(c.dim("exclude:  ") + c.yellow(config2.exclude.join(comma)));
      if (config2.typecheck.enabled) {
        this.console.error(c.dim("typecheck include: ") + c.yellow(config2.typecheck.include.join(comma)));
        this.console.error(c.dim("typecheck exclude: ") + c.yellow(config2.typecheck.exclude.join(comma)));
      }
    });
    if (config.watchExclude)
      this.console.error(c.dim("watch exclude:  ") + c.yellow(config.watchExclude.join(comma)));
    if (config.watch && (config.changed || ((_a = config.related) == null ? void 0 : _a.length))) {
      this.log(`No affected ${config.mode} files found
`);
    } else {
      if (config.passWithNoTests)
        this.log(`No ${config.mode} files found, exiting with code 0
`);
      else
        this.error(c.red(`
No ${config.mode} files found, exiting with code 1`));
    }
  }
  printBanner() {
    var _a, _b, _c;
    this.log();
    const versionTest = this.ctx.config.watch ? c.blue(`v${version}`) : c.cyan(`v${version}`);
    const mode = this.ctx.config.watch ? c.blue(" DEV ") : c.cyan(" RUN ");
    this.log(`${c.inverse(c.bold(mode))} ${versionTest} ${c.gray(this.ctx.config.root)}`);
    if (this.ctx.config.sequence.sequencer === RandomSequencer)
      this.log(c.gray(`      Running tests with seed "${this.ctx.config.sequence.seed}"`));
    this.ctx.projects.forEach((project) => {
      if (!project.browser)
        return;
      const name = project.getName();
      const output = project.isCore() ? "" : ` [${name}]`;
      const resolvedUrls = project.browser.resolvedUrls;
      const origin = (resolvedUrls == null ? void 0 : resolvedUrls.local[0]) ?? (resolvedUrls == null ? void 0 : resolvedUrls.network[0]);
      this.log(c.dim(c.green(`     ${output} Browser runner started at ${new URL("/", origin)}`)));
    });
    if (this.ctx.config.ui)
      this.log(c.dim(c.green(`      UI started at http://${((_a = this.ctx.config.api) == null ? void 0 : _a.host) || "localhost"}:${c.bold(`${this.ctx.server.config.server.port}`)}${this.ctx.config.uiBase}`)));
    else if ((_b = this.ctx.config.api) == null ? void 0 : _b.port)
      this.log(c.dim(c.green(`      API started at http://${((_c = this.ctx.config.api) == null ? void 0 : _c.host) || "localhost"}:${c.bold(`${this.ctx.config.api.port}`)}`)));
    if (this.ctx.coverageProvider)
      this.log(c.dim("      Coverage enabled with ") + c.yellow(this.ctx.coverageProvider.name));
    this.log();
  }
  async printUnhandledErrors(errors) {
    const errorMessage = c.red(c.bold(
      `
Vitest caught ${errors.length} unhandled error${errors.length > 1 ? "s" : ""} during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.`
    ));
    this.log(c.red(divider(c.bold(c.inverse(" Unhandled Errors ")))));
    this.log(errorMessage);
    await Promise.all(errors.map(async (err) => {
      await this.printError(err, { fullStack: true, type: err.type || "Unhandled Error" });
    }));
    this.log(c.red(divider()));
  }
  async printSourceTypeErrors(errors) {
    const errorMessage = c.red(c.bold(
      `
Vitest found ${errors.length} error${errors.length > 1 ? "s" : ""} not related to your test files.`
    ));
    this.log(c.red(divider(c.bold(c.inverse(" Source Errors ")))));
    this.log(errorMessage);
    await Promise.all(errors.map(async (err) => {
      await this.printError(err, { fullStack: true });
    }));
    this.log(c.red(divider()));
  }
}

function CoverageTransform(ctx) {
  return {
    name: "vitest:coverage-transform",
    transform(srcCode, id) {
      var _a, _b;
      return (_b = (_a = ctx.coverageProvider) == null ? void 0 : _a.onFileTransform) == null ? void 0 : _b.call(_a, srcCode, normalizeRequestId(id), this);
    }
  };
}

const API_NOT_FOUND_ERROR = `There are some problems in resolving the mocks API.
You may encounter this issue when importing the mocks API from another module other than 'vitest'.
To fix this issue you can either:
- import the mocks API directly from 'vitest'
- enable the 'globals' options`;
const API_NOT_FOUND_CHECK = `
if (typeof globalThis.vi === "undefined" && typeof globalThis.vitest === "undefined") { throw new Error(${JSON.stringify(API_NOT_FOUND_ERROR)}) }
`;
function isIdentifier(node) {
  return node.type === "Identifier";
}
function transformImportSpecifiers(node) {
  const dynamicImports = node.specifiers.map((specifier) => {
    if (specifier.type === "ImportDefaultSpecifier")
      return `default: ${specifier.local.name}`;
    if (specifier.type === "ImportSpecifier") {
      const local = specifier.local.name;
      const imported = specifier.imported.name;
      if (local === imported)
        return local;
      return `${imported}: ${local}`;
    }
    return null;
  }).filter(Boolean).join(", ");
  if (!dynamicImports.length)
    return "";
  return `{ ${dynamicImports} }`;
}
function getBetterEnd(code, node) {
  let end = node.end;
  if (code[node.end] === ";")
    end += 1;
  if (code[node.end + 1] === "\n")
    end += 1;
  return end;
}
const regexpHoistable = /\b(vi|vitest)\s*\.\s*(mock|unmock|hoisted)\(/;
const hashbangRE = /^#!.*\n/;
function hoistMocks(code, id, parse, colors) {
  var _a;
  const needHoisting = regexpHoistable.test(code);
  if (!needHoisting)
    return;
  const s = new MagicString(code);
  let ast;
  try {
    ast = parse(code);
  } catch (err) {
    console.error(`Cannot parse ${id}:
${err.message}`);
    return;
  }
  const hoistIndex = ((_a = code.match(hashbangRE)) == null ? void 0 : _a[0].length) ?? 0;
  let hoistedVitestImports = "";
  let uid = 0;
  const idToImportMap = /* @__PURE__ */ new Map();
  const transformImportDeclaration = (node) => {
    const source = node.source.value;
    const importId = `__vi_import_${uid++}__`;
    const hasSpecifiers = node.specifiers.length > 0;
    const code2 = hasSpecifiers ? `const ${importId} = await import('${source}')
` : `await import('${source}')
`;
    return {
      code: code2,
      id: importId
    };
  };
  function defineImport(node) {
    if (node.source.value === "vitest") {
      const code2 = `const ${transformImportSpecifiers(node)} = await import('vitest')
`;
      hoistedVitestImports += code2;
      s.remove(node.start, getBetterEnd(code2, node));
      return;
    }
    const declaration = transformImportDeclaration(node);
    if (!declaration)
      return null;
    s.appendLeft(hoistIndex, declaration.code);
    return declaration.id;
  }
  for (const node of ast.body) {
    if (node.type === "ImportDeclaration") {
      const importId = defineImport(node);
      if (!importId)
        continue;
      s.remove(node.start, getBetterEnd(code, node));
      for (const spec of node.specifiers) {
        if (spec.type === "ImportSpecifier") {
          idToImportMap.set(
            spec.local.name,
            `${importId}.${spec.imported.name}`
          );
        } else if (spec.type === "ImportDefaultSpecifier") {
          idToImportMap.set(spec.local.name, `${importId}.default`);
        } else {
          idToImportMap.set(spec.local.name, importId);
        }
      }
    }
  }
  const declaredConst = /* @__PURE__ */ new Set();
  const hoistedNodes = [];
  function createSyntaxError(node, message) {
    const _error = new SyntaxError(message);
    Error.captureStackTrace(_error, createSyntaxError);
    return {
      name: "SyntaxError",
      message: _error.message,
      stack: _error.stack,
      frame: generateCodeFrame(highlightCode(id, code, colors), 4, node.start + 1)
    };
  }
  function assertNotDefaultExport(node, error) {
    var _a2;
    const defaultExport = (_a2 = findNodeAround(ast, node.start, "ExportDefaultDeclaration")) == null ? void 0 : _a2.node;
    if ((defaultExport == null ? void 0 : defaultExport.declaration) === node || (defaultExport == null ? void 0 : defaultExport.declaration.type) === "AwaitExpression" && defaultExport.declaration.argument === node)
      throw createSyntaxError(defaultExport, error);
  }
  function assertNotNamedExport(node, error) {
    var _a2;
    const nodeExported = (_a2 = findNodeAround(ast, node.start, "ExportNamedDeclaration")) == null ? void 0 : _a2.node;
    if ((nodeExported == null ? void 0 : nodeExported.declaration) === node)
      throw createSyntaxError(nodeExported, error);
  }
  function getVariableDeclaration(node) {
    var _a2, _b;
    const declarationNode = (_a2 = findNodeAround(ast, node.start, "VariableDeclaration")) == null ? void 0 : _a2.node;
    const init = (_b = declarationNode == null ? void 0 : declarationNode.declarations[0]) == null ? void 0 : _b.init;
    if (init && (init === node || init.type === "AwaitExpression" && init.argument === node))
      return declarationNode;
  }
  esmWalker(ast, {
    onIdentifier(id2, info, parentStack) {
      const binding = idToImportMap.get(id2.name);
      if (!binding)
        return;
      if (info.hasBindingShortcut) {
        s.appendLeft(id2.end, `: ${binding}`);
      } else if (info.classDeclaration) {
        if (!declaredConst.has(id2.name)) {
          declaredConst.add(id2.name);
          const topNode = parentStack[parentStack.length - 2];
          s.prependRight(topNode.start, `const ${id2.name} = ${binding};
`);
        }
      } else if (
        // don't transform class name identifier
        !info.classExpression
      ) {
        s.update(id2.start, id2.end, binding);
      }
    },
    onCallExpression(node) {
      var _a2;
      if (node.callee.type === "MemberExpression" && isIdentifier(node.callee.object) && (node.callee.object.name === "vi" || node.callee.object.name === "vitest") && isIdentifier(node.callee.property)) {
        const methodName = node.callee.property.name;
        if (methodName === "mock" || methodName === "unmock") {
          const method = `${node.callee.object.name}.${methodName}`;
          assertNotDefaultExport(node, `Cannot export the result of "${method}". Remove export declaration because "${method}" doesn't return anything.`);
          const declarationNode = getVariableDeclaration(node);
          if (declarationNode)
            assertNotNamedExport(declarationNode, `Cannot export the result of "${method}". Remove export declaration because "${method}" doesn't return anything.`);
          hoistedNodes.push(node);
        }
        if (methodName === "hoisted") {
          assertNotDefaultExport(node, "Cannot export hoisted variable. You can control hoisting behavior by placing the import from this file first.");
          const declarationNode = getVariableDeclaration(node);
          if (declarationNode) {
            assertNotNamedExport(declarationNode, "Cannot export hoisted variable. You can control hoisting behavior by placing the import from this file first.");
            hoistedNodes.push(declarationNode);
          } else {
            const awaitedExpression = (_a2 = findNodeAround(ast, node.start, "AwaitExpression")) == null ? void 0 : _a2.node;
            hoistedNodes.push((awaitedExpression == null ? void 0 : awaitedExpression.argument) === node ? awaitedExpression : node);
          }
        }
      }
    }
  });
  function getNodeName(node) {
    const callee = node.callee || {};
    if (callee.type === "MemberExpression" && isIdentifier(callee.property) && isIdentifier(callee.object))
      return `${callee.object.name}.${callee.property.name}()`;
    return '"hoisted method"';
  }
  function getNodeCall(node) {
    if (node.type === "CallExpression")
      return node;
    if (node.type === "VariableDeclaration") {
      const { declarations } = node;
      const init = declarations[0].init;
      if (init)
        return getNodeCall(init);
    }
    if (node.type === "AwaitExpression") {
      const { argument } = node;
      if (argument.type === "CallExpression")
        return getNodeCall(argument);
    }
    return node;
  }
  function createError(outsideNode, insideNode) {
    const outsideCall = getNodeCall(outsideNode);
    const insideCall = getNodeCall(insideNode);
    throw createSyntaxError(
      insideCall,
      `Cannot call ${getNodeName(insideCall)} inside ${getNodeName(outsideCall)}: both methods are hoisted to the top of the file and not actually called inside each other.`
    );
  }
  for (let i = 0; i < hoistedNodes.length; i++) {
    const node = hoistedNodes[i];
    for (let j = i + 1; j < hoistedNodes.length; j++) {
      const otherNode = hoistedNodes[j];
      if (node.start >= otherNode.start && node.end <= otherNode.end)
        throw createError(otherNode, node);
      if (otherNode.start >= node.start && otherNode.end <= node.end)
        throw createError(node, otherNode);
    }
  }
  const hoistedCode = hoistedNodes.map((node) => {
    const end = getBetterEnd(code, node);
    const nodeCode = s.slice(node.start, end);
    s.remove(node.start, end);
    return `${nodeCode}${nodeCode.endsWith("\n") ? "" : "\n"}`;
  }).join("");
  if (hoistedCode || hoistedVitestImports) {
    s.prepend(
      hoistedVitestImports + (!hoistedVitestImports && hoistedCode ? API_NOT_FOUND_CHECK : "") + hoistedCode
    );
  }
  return {
    ast,
    code: s.toString(),
    map: s.generateMap({ hires: "boundary", source: id })
  };
}

function MocksPlugin() {
  return {
    name: "vitest:mocks",
    enforce: "post",
    transform(code, id) {
      return hoistMocks(code, id, this.parse);
    }
  };
}

function resolveOptimizerConfig(_testOptions, viteOptions, testConfig) {
  var _a;
  const testOptions = _testOptions || {};
  const newConfig = {};
  const [major, minor, fix] = version$2.split(".").map(Number);
  const allowed = major >= 5 || major === 4 && minor >= 4 || major === 4 && minor === 3 && fix >= 2;
  if (!allowed && (testOptions == null ? void 0 : testOptions.enabled) === true)
    console.warn(`Vitest: "deps.optimizer" is only available in Vite >= 4.3.2, current Vite version: ${version$2}`);
  else
    testOptions.enabled ?? (testOptions.enabled = true);
  if (!allowed || (testOptions == null ? void 0 : testOptions.enabled) !== true) {
    newConfig.cacheDir = void 0;
    newConfig.optimizeDeps = {
      // experimental in Vite >2.9.2, entries remains to help with older versions
      disabled: true,
      entries: []
    };
  } else {
    const root = testConfig.root ?? process.cwd();
    const cacheDir = testConfig.cache !== false ? (_a = testConfig.cache) == null ? void 0 : _a.dir : void 0;
    const currentInclude = testOptions.include || (viteOptions == null ? void 0 : viteOptions.include) || [];
    const exclude = [
      "vitest",
      // Ideally, we shouldn't optimize react in test mode, otherwise we need to optimize _every_ dependency that uses react.
      "react",
      "vue",
      ...testOptions.exclude || (viteOptions == null ? void 0 : viteOptions.exclude) || []
    ];
    const runtime = currentInclude.filter((n) => n.endsWith("jsx-dev-runtime"));
    exclude.push(...runtime);
    const include = (testOptions.include || (viteOptions == null ? void 0 : viteOptions.include) || []).filter((n) => !exclude.includes(n));
    newConfig.cacheDir = cacheDir ?? VitestCache.resolveCacheDir(root, cacheDir, testConfig.name);
    newConfig.optimizeDeps = {
      ...viteOptions,
      ...testOptions,
      noDiscovery: true,
      disabled: false,
      entries: [],
      exclude,
      include
    };
  }
  return newConfig;
}
function deleteDefineConfig(viteConfig) {
  const defines = {};
  if (viteConfig.define) {
    delete viteConfig.define["import.meta.vitest"];
    delete viteConfig.define["process.env"];
    delete viteConfig.define.process;
    delete viteConfig.define.global;
  }
  for (const key in viteConfig.define) {
    const val = viteConfig.define[key];
    let replacement;
    try {
      replacement = typeof val === "string" ? JSON.parse(val) : val;
    } catch {
      continue;
    }
    if (key.startsWith("import.meta.env.")) {
      const envKey = key.slice("import.meta.env.".length);
      process.env[envKey] = replacement;
      delete viteConfig.define[key];
    } else if (key.startsWith("process.env.")) {
      const envKey = key.slice("process.env.".length);
      process.env[envKey] = replacement;
      delete viteConfig.define[key];
    } else if (!key.includes(".")) {
      defines[key] = replacement;
      delete viteConfig.define[key];
    }
  }
  return defines;
}
function hijackVitePluginInject(viteConfig) {
  const processEnvPlugin = viteConfig.plugins.find((p) => p.name === "vite:client-inject");
  if (processEnvPlugin) {
    const originalTransform = processEnvPlugin.transform;
    processEnvPlugin.transform = function transform(code, id, options) {
      return originalTransform.call(this, code, id, { ...options, ssr: true });
    };
  }
}
function resolveFsAllow(projectRoot, rootConfigFile) {
  if (!rootConfigFile)
    return [searchForWorkspaceRoot(projectRoot), rootDir];
  return [dirname(rootConfigFile), searchForWorkspaceRoot(projectRoot), rootDir];
}

async function createBrowserServer(project, configFile) {
  var _a;
  const root = project.config.root;
  await project.ctx.packageInstaller.ensureInstalled("@vitest/browser", root);
  const configPath = typeof configFile === "string" ? configFile : false;
  const server = await createServer({
    ...project.options,
    // spread project config inlined in root workspace config
    logLevel: "error",
    mode: project.config.mode,
    configFile: configPath,
    // watch is handled by Vitest
    server: {
      hmr: false,
      watch: {
        ignored: ["**/**"]
      }
    },
    plugins: [
      ...((_a = project.options) == null ? void 0 : _a.plugins) || [],
      (await import('@vitest/browser')).default(project, "/"),
      CoverageTransform(project.ctx),
      {
        enforce: "post",
        name: "vitest:browser:config",
        async config(config) {
          var _a2, _b, _c;
          const server2 = resolveApiServerConfig(((_a2 = config.test) == null ? void 0 : _a2.browser) || {}) || {
            port: defaultBrowserPort
          };
          server2.middlewareMode = false;
          config.server = {
            ...config.server,
            ...server2
          };
          (_b = config.server).fs ?? (_b.fs = {});
          config.server.fs.allow = config.server.fs.allow || [];
          config.server.fs.allow.push(
            ...resolveFsAllow(
              project.ctx.config.root,
              project.ctx.server.config.configFile
            )
          );
          return {
            resolve: {
              alias: (_c = config.test) == null ? void 0 : _c.alias
            },
            server: {
              watch: null
            }
          };
        }
      },
      MocksPlugin()
    ]
  });
  await server.listen();
  (await import('../chunks/api-setup.srzH0bDf.js')).setup(project, server);
  return server;
}

const builtinProviders = ["webdriverio", "playwright", "none"];
async function getBrowserProvider(options, project) {
  if (options.provider == null || builtinProviders.includes(options.provider)) {
    await project.ctx.packageInstaller.ensureInstalled("@vitest/browser", project.config.root);
    const providers = await project.runner.executeId("@vitest/browser/providers");
    const provider = options.provider || "webdriverio";
    return providers[provider];
  }
  let customProviderModule;
  try {
    customProviderModule = await project.runner.executeId(options.provider);
  } catch (error) {
    throw new Error(`Failed to load custom BrowserProvider from ${options.provider}`, { cause: error });
  }
  if (customProviderModule.default == null)
    throw new Error(`Custom BrowserProvider loaded from ${options.provider} was not the default export`);
  return customProviderModule.default;
}

function generateCssFilenameHash(filepath) {
  return createHash("md5").update(filepath).digest("hex").slice(0, 6);
}
function generateScopedClassName(strategy, name, filename) {
  if (strategy === "scoped")
    return null;
  if (strategy === "non-scoped")
    return name;
  const hash = generateCssFilenameHash(filename);
  return `_${name}_${hash}`;
}

const cssLangs = "\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)";
const cssLangRE = new RegExp(cssLangs);
const cssModuleRE = new RegExp(`\\.module${cssLangs}`);
const cssInlineRE = /[?&]inline(&|$)/;
function isCSS(id) {
  return cssLangRE.test(id);
}
function isCSSModule(id) {
  return cssModuleRE.test(id);
}
function isInline(id) {
  return cssInlineRE.test(id);
}
function getCSSModuleProxyReturn(strategy, filename) {
  if (strategy === "non-scoped")
    return "style";
  const hash = generateCssFilenameHash(filename);
  return `\`_\${style}_${hash}\``;
}
function CSSEnablerPlugin(ctx) {
  const shouldProcessCSS = (id) => {
    const { css } = ctx.config;
    if (typeof css === "boolean")
      return css;
    if (toArray(css.exclude).some((re) => re.test(id)))
      return false;
    if (toArray(css.include).some((re) => re.test(id)))
      return true;
    return false;
  };
  return [
    {
      name: "vitest:css-disable",
      enforce: "pre",
      transform(code, id) {
        if (!isCSS(id))
          return;
        if (!shouldProcessCSS(id))
          return { code: "" };
      }
    },
    {
      name: "vitest:css-empty-post",
      enforce: "post",
      transform(_, id) {
        var _a;
        if (!isCSS(id) || shouldProcessCSS(id))
          return;
        if (isCSSModule(id) && !isInline(id)) {
          const scopeStrategy = typeof ctx.config.css !== "boolean" && ((_a = ctx.config.css.modules) == null ? void 0 : _a.classNameStrategy) || "stable";
          const proxyReturn = getCSSModuleProxyReturn(scopeStrategy, relative(ctx.config.root, id));
          const code = `export default new Proxy(Object.create(null), {
            get(_, style) {
              return ${proxyReturn};
            },
          })`;
          return { code };
        }
        return { code: 'export default ""' };
      }
    }
  ];
}

function SsrReplacerPlugin() {
  return {
    name: "vitest:ssr-replacer",
    enforce: "pre",
    transform(code, id) {
      if (!/\bimport\.meta\.env\b/.test(code))
        return null;
      let s = null;
      const cleanCode = stripLiteral(code);
      const envs = cleanCode.matchAll(/\bimport\.meta\.env\b/g);
      for (const env of envs) {
        s || (s = new MagicString(code));
        const startIndex = env.index;
        const endIndex = startIndex + env[0].length;
        s.overwrite(startIndex, endIndex, "__vite_ssr_import_meta__.env");
      }
      if (s) {
        return {
          code: s.toString(),
          map: s.generateMap({
            hires: "boundary",
            // Remove possible query parameters, e.g. vue's "?vue&type=script&src=true&lang.ts"
            source: cleanUrl(id)
          })
        };
      }
    }
  };
}

function VitestResolver(ctx) {
  return {
    name: "vitest:resolve-root",
    enforce: "pre",
    async resolveId(id) {
      if (id === "vitest" || id.startsWith("@vitest/")) {
        return this.resolve(
          id,
          join(ctx.config.root, "index.html"),
          { skipSelf: true }
        );
      }
    }
  };
}

function VitestOptimizer() {
  return {
    name: "vitest:normalize-optimizer",
    config: {
      order: "post",
      handler(viteConfig) {
        var _a, _b, _c, _d, _e;
        const testConfig = viteConfig.test || {};
        const webOptimizer = resolveOptimizerConfig((_b = (_a = testConfig.deps) == null ? void 0 : _a.optimizer) == null ? void 0 : _b.web, viteConfig.optimizeDeps, testConfig);
        const ssrOptimizer = resolveOptimizerConfig((_d = (_c = testConfig.deps) == null ? void 0 : _c.optimizer) == null ? void 0 : _d.ssr, (_e = viteConfig.ssr) == null ? void 0 : _e.optimizeDeps, testConfig);
        viteConfig.cacheDir = webOptimizer.cacheDir || ssrOptimizer.cacheDir || viteConfig.cacheDir;
        viteConfig.optimizeDeps = webOptimizer.optimizeDeps;
        viteConfig.ssr ?? (viteConfig.ssr = {});
        viteConfig.ssr.optimizeDeps = ssrOptimizer.optimizeDeps;
      }
    }
  };
}

const metaUrlLength = "import.meta.url".length;
const locationString = "self.location".padEnd(metaUrlLength, " ");
function NormalizeURLPlugin() {
  return {
    name: "vitest:normalize-url",
    enforce: "post",
    transform(code, id, options) {
      const ssr = (options == null ? void 0 : options.ssr) === true;
      if (ssr || !code.includes("new URL") || !code.includes("import.meta.url"))
        return;
      const cleanString = stripLiteral(code);
      const assetImportMetaUrlRE = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g;
      let updatedCode = code;
      let match;
      while (match = assetImportMetaUrlRE.exec(cleanString)) {
        const { 0: exp, index } = match;
        const metaUrlIndex = index + exp.indexOf("import.meta.url");
        updatedCode = updatedCode.slice(0, metaUrlIndex) + locationString + updatedCode.slice(metaUrlIndex + metaUrlLength);
      }
      return {
        code: updatedCode,
        map: null
      };
    }
  };
}

function WorkspaceVitestPlugin(project, options) {
  return [
    {
      name: "vitest:project",
      enforce: "pre",
      options() {
        this.meta.watchMode = false;
      },
      config(viteConfig) {
        var _a, _b, _c;
        const defines = deleteDefineConfig(viteConfig);
        const testConfig = viteConfig.test || {};
        const root = testConfig.root || viteConfig.root || options.root;
        let name = testConfig.name;
        if (!name) {
          if (typeof options.workspacePath === "string")
            name = basename(options.workspacePath.endsWith("/") ? options.workspacePath.slice(0, -1) : dirname(options.workspacePath));
          else
            name = options.workspacePath.toString();
        }
        const config = {
          root,
          resolve: {
            // by default Vite resolves `module` field, which not always a native ESM module
            // setting this option can bypass that and fallback to cjs version
            mainFields: [],
            alias: testConfig.alias,
            conditions: ["node"]
          },
          esbuild: {
            sourcemap: "external",
            // Enables using ignore hint for coverage providers with @preserve keyword
            legalComments: "inline"
          },
          server: {
            // disable watch mode in workspaces,
            // because it is handled by the top-level watcher
            watch: null,
            open: false,
            hmr: false,
            preTransformRequests: false,
            middlewareMode: true,
            fs: {
              allow: resolveFsAllow(
                project.ctx.config.root,
                project.ctx.server.config.configFile
              )
            }
          },
          test: {
            name
          }
        };
        config.test.defines = defines;
        const classNameStrategy = typeof testConfig.css !== "boolean" && ((_b = (_a = testConfig.css) == null ? void 0 : _a.modules) == null ? void 0 : _b.classNameStrategy) || "stable";
        if (classNameStrategy !== "scoped") {
          config.css ?? (config.css = {});
          (_c = config.css).modules ?? (_c.modules = {});
          if (config.css.modules) {
            config.css.modules.generateScopedName = (name2, filename) => {
              const root2 = project.config.root;
              return generateScopedClassName(classNameStrategy, name2, relative(root2, filename));
            };
          }
        }
        return config;
      },
      configResolved(viteConfig) {
        hijackVitePluginInject(viteConfig);
      },
      async configureServer(server) {
        try {
          const options2 = deepMerge(
            {},
            configDefaults,
            server.config.test || {}
          );
          await project.setServer(options2, server);
        } catch (err) {
          await project.ctx.logger.printError(err, { fullStack: true });
          process.exit(1);
        }
        await server.watcher.close();
      }
    },
    SsrReplacerPlugin(),
    ...CSSEnablerPlugin(project),
    CoverageTransform(project.ctx),
    MocksPlugin(),
    VitestResolver(project.ctx),
    VitestOptimizer(),
    NormalizeURLPlugin()
  ];
}

async function createViteServer(inlineConfig) {
  const error = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("WebSocket server error:"))
      return;
    error(...args);
  };
  const server = await createServer({
    logLevel: "error",
    ...inlineConfig
  });
  console.error = error;
  return server;
}

async function loadGlobalSetupFiles(runner, globalSetup) {
  const globalSetupFiles = toArray$1(globalSetup);
  return Promise.all(globalSetupFiles.map((file) => loadGlobalSetupFile(file, runner)));
}
async function loadGlobalSetupFile(file, runner) {
  const m = await runner.executeFile(file);
  for (const exp of ["default", "setup", "teardown"]) {
    if (m[exp] != null && typeof m[exp] !== "function")
      throw new Error(`invalid export in globalSetup file ${file}: ${exp} must be a function`);
  }
  if (m.default) {
    return {
      file,
      setup: m.default
    };
  } else if (m.setup || m.teardown) {
    return {
      file,
      setup: m.setup,
      teardown: m.teardown
    };
  } else {
    throw new Error(`invalid globalSetup file ${file}. Must export setup, teardown or have a default export`);
  }
}

async function initializeProject(workspacePath, ctx, options) {
  var _a;
  const project = new WorkspaceProject(workspacePath, ctx, options);
  const configFile = options.extends ? resolve(dirname(options.workspaceConfigPath), options.extends) : typeof workspacePath === "number" || workspacePath.endsWith("/") ? false : workspacePath;
  const root = options.root || (typeof workspacePath === "number" ? void 0 : workspacePath.endsWith("/") ? workspacePath : dirname(workspacePath));
  const config = {
    ...options,
    root,
    logLevel: "error",
    configFile,
    // this will make "mode": "test" | "benchmark" inside defineConfig
    mode: ((_a = options.test) == null ? void 0 : _a.mode) || options.mode || ctx.config.mode,
    plugins: [
      ...options.plugins || [],
      WorkspaceVitestPlugin(project, { ...options, root, workspacePath })
    ]
  };
  await createViteServer(config);
  return project;
}
class WorkspaceProject {
  constructor(path, ctx, options) {
    this.path = path;
    this.ctx = ctx;
    this.options = options;
  }
  configOverride;
  config;
  server;
  vitenode;
  runner;
  browser;
  typechecker;
  closingPromise;
  browserProvider;
  testFilesList = null;
  _globalSetups;
  _provided = {};
  getName() {
    return this.config.name || "";
  }
  isCore() {
    return this.ctx.getCoreWorkspaceProject() === this;
  }
  provide = (key, value) => {
    try {
      structuredClone(value);
    } catch (err) {
      throw new Error(`Cannot provide "${key}" because it's not serializable.`, {
        cause: err
      });
    }
    this._provided[key] = value;
  };
  getProvidedContext() {
    if (this.isCore())
      return this._provided;
    return {
      ...this.ctx.getCoreWorkspaceProject().getProvidedContext(),
      ...this._provided
    };
  }
  async initializeGlobalSetup() {
    var _a;
    if (this._globalSetups)
      return;
    this._globalSetups = await loadGlobalSetupFiles(this.runner, this.config.globalSetup);
    try {
      for (const globalSetupFile of this._globalSetups) {
        const teardown = await ((_a = globalSetupFile.setup) == null ? void 0 : _a.call(globalSetupFile, { provide: this.provide, config: this.config }));
        if (teardown == null || !!globalSetupFile.teardown)
          continue;
        if (typeof teardown !== "function")
          throw new Error(`invalid return value in globalSetup file ${globalSetupFile.file}. Must return a function`);
        globalSetupFile.teardown = teardown;
      }
    } catch (e) {
      this.logger.error(`
${c.red(divider(c.bold(c.inverse(" Error during global setup "))))}`);
      await this.logger.printError(e);
      process.exit(1);
    }
  }
  async teardownGlobalSetup() {
    var _a;
    if (!this._globalSetups)
      return;
    for (const globalSetupFile of [...this._globalSetups].reverse()) {
      try {
        await ((_a = globalSetupFile.teardown) == null ? void 0 : _a.call(globalSetupFile));
      } catch (error) {
        this.logger.error(`error during global teardown of ${globalSetupFile.file}`, error);
        await this.logger.printError(error);
        process.exitCode = 1;
      }
    }
  }
  get logger() {
    return this.ctx.logger;
  }
  // it's possible that file path was imported with different queries (?raw, ?url, etc)
  getModulesByFilepath(file) {
    var _a;
    const set = this.server.moduleGraph.getModulesByFile(file) || ((_a = this.browser) == null ? void 0 : _a.moduleGraph.getModulesByFile(file));
    return set || /* @__PURE__ */ new Set();
  }
  getModuleById(id) {
    var _a;
    return this.server.moduleGraph.getModuleById(id) || ((_a = this.browser) == null ? void 0 : _a.moduleGraph.getModuleById(id));
  }
  getSourceMapModuleById(id) {
    var _a, _b;
    const mod = this.server.moduleGraph.getModuleById(id);
    return ((_a = mod == null ? void 0 : mod.ssrTransformResult) == null ? void 0 : _a.map) || ((_b = mod == null ? void 0 : mod.transformResult) == null ? void 0 : _b.map);
  }
  getBrowserSourceMapModuleById(id) {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.browser) == null ? void 0 : _a.moduleGraph.getModuleById(id)) == null ? void 0 : _b.transformResult) == null ? void 0 : _c.map;
  }
  get reporters() {
    return this.ctx.reporters;
  }
  async globTestFiles(filters = []) {
    const dir = this.config.dir || this.config.root;
    const { include, exclude, includeSource } = this.config;
    const typecheck = this.config.typecheck;
    const [testFiles, typecheckTestFiles] = await Promise.all([
      typecheck.enabled && typecheck.only ? [] : this.globAllTestFiles(include, exclude, includeSource, dir),
      typecheck.enabled ? this.globFiles(typecheck.include, typecheck.exclude, dir) : []
    ]);
    return this.filterFiles([...testFiles, ...typecheckTestFiles], filters, dir);
  }
  async globAllTestFiles(include, exclude, includeSource, cwd) {
    if (this.testFilesList)
      return this.testFilesList;
    const testFiles = await this.globFiles(include, exclude, cwd);
    if (includeSource == null ? void 0 : includeSource.length) {
      const files = await this.globFiles(includeSource, exclude, cwd);
      await Promise.all(files.map(async (file) => {
        try {
          const code = await promises.readFile(file, "utf-8");
          if (this.isInSourceTestFile(code))
            testFiles.push(file);
        } catch {
          return null;
        }
      }));
    }
    this.testFilesList = testFiles;
    return testFiles;
  }
  isTestFile(id) {
    return this.testFilesList && this.testFilesList.includes(id);
  }
  async globFiles(include, exclude, cwd) {
    const globOptions = {
      dot: true,
      cwd,
      ignore: exclude
    };
    const files = await fg(include, globOptions);
    return files.map((file) => resolve(cwd, file));
  }
  async isTargetFile(id, source) {
    var _a;
    const relativeId = relative(this.config.dir || this.config.root, id);
    if (mm.isMatch(relativeId, this.config.exclude))
      return false;
    if (mm.isMatch(relativeId, this.config.include))
      return true;
    if (((_a = this.config.includeSource) == null ? void 0 : _a.length) && mm.isMatch(relativeId, this.config.includeSource)) {
      source = source || await promises.readFile(id, "utf-8");
      return this.isInSourceTestFile(source);
    }
    return false;
  }
  isInSourceTestFile(code) {
    return code.includes("import.meta.vitest");
  }
  filterFiles(testFiles, filters = [], dir) {
    if (filters.length && process.platform === "win32")
      filters = filters.map((f) => toNamespacedPath(f));
    if (filters.length) {
      return testFiles.filter((t) => {
        const testFile = relative(dir, t).toLocaleLowerCase();
        return filters.some((f) => {
          const relativePath = f.endsWith("/") ? join(relative(dir, f), "/") : relative(dir, f);
          return testFile.includes(f.toLocaleLowerCase()) || testFile.includes(relativePath.toLocaleLowerCase());
        });
      });
    }
    return testFiles;
  }
  async initBrowserServer(configFile) {
    var _a;
    if (!this.isBrowserEnabled())
      return;
    await ((_a = this.browser) == null ? void 0 : _a.close());
    this.browser = await createBrowserServer(this, configFile);
  }
  static createBasicProject(ctx) {
    const project = new WorkspaceProject(ctx.config.name || ctx.config.root, ctx);
    project.vitenode = ctx.vitenode;
    project.server = ctx.server;
    project.runner = ctx.runner;
    project.config = ctx.config;
    return project;
  }
  static async createCoreProject(ctx) {
    const project = WorkspaceProject.createBasicProject(ctx);
    await project.initBrowserServer(ctx.server.config.configFile);
    return project;
  }
  async setServer(options, server) {
    this.config = resolveConfig(this.ctx.mode, options, server.config);
    this.server = server;
    this.vitenode = new ViteNodeServer(server, this.config.server);
    const node = this.vitenode;
    this.runner = new ViteNodeRunner({
      root: server.config.root,
      base: server.config.base,
      fetchModule(id) {
        return node.fetchModule(id);
      },
      resolveId(id, importer) {
        return node.resolveId(id, importer);
      }
    });
    await this.initBrowserServer(this.server.config.configFile);
  }
  isBrowserEnabled() {
    return isBrowserEnabled(this.config);
  }
  getSerializableConfig() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
    const optimizer = (_a = this.config.deps) == null ? void 0 : _a.optimizer;
    const poolOptions = this.config.poolOptions;
    const isolate = (_d = (_c = (_b = this.server) == null ? void 0 : _b.config) == null ? void 0 : _c.test) == null ? void 0 : _d.isolate;
    return deepMerge({
      ...this.config,
      coverage: this.ctx.config.coverage,
      poolOptions: {
        forks: {
          singleFork: ((_e = poolOptions == null ? void 0 : poolOptions.forks) == null ? void 0 : _e.singleFork) ?? ((_g = (_f = this.ctx.config.poolOptions) == null ? void 0 : _f.forks) == null ? void 0 : _g.singleFork) ?? false,
          isolate: ((_h = poolOptions == null ? void 0 : poolOptions.forks) == null ? void 0 : _h.isolate) ?? isolate ?? ((_j = (_i = this.ctx.config.poolOptions) == null ? void 0 : _i.forks) == null ? void 0 : _j.isolate) ?? true
        },
        threads: {
          singleThread: ((_k = poolOptions == null ? void 0 : poolOptions.threads) == null ? void 0 : _k.singleThread) ?? ((_m = (_l = this.ctx.config.poolOptions) == null ? void 0 : _l.threads) == null ? void 0 : _m.singleThread) ?? false,
          isolate: ((_n = poolOptions == null ? void 0 : poolOptions.threads) == null ? void 0 : _n.isolate) ?? isolate ?? ((_p = (_o = this.ctx.config.poolOptions) == null ? void 0 : _o.threads) == null ? void 0 : _p.isolate) ?? true
        },
        vmThreads: {
          singleThread: ((_q = poolOptions == null ? void 0 : poolOptions.vmThreads) == null ? void 0 : _q.singleThread) ?? ((_s = (_r = this.ctx.config.poolOptions) == null ? void 0 : _r.vmThreads) == null ? void 0 : _s.singleThread) ?? false
        }
      },
      reporters: [],
      deps: {
        ...this.config.deps,
        optimizer: {
          web: {
            enabled: ((_t = optimizer == null ? void 0 : optimizer.web) == null ? void 0 : _t.enabled) ?? true
          },
          ssr: {
            enabled: ((_u = optimizer == null ? void 0 : optimizer.ssr) == null ? void 0 : _u.enabled) ?? true
          }
        }
      },
      snapshotOptions: {
        ...this.config.snapshotOptions,
        resolveSnapshotPath: void 0
      },
      onConsoleLog: void 0,
      onStackTrace: void 0,
      sequence: {
        ...this.ctx.config.sequence,
        sequencer: void 0
      },
      benchmark: {
        ...this.config.benchmark,
        reporters: []
      },
      inspect: this.ctx.config.inspect,
      inspectBrk: this.ctx.config.inspectBrk,
      alias: []
    }, this.ctx.configOverride || {});
  }
  close() {
    var _a, _b;
    if (!this.closingPromise) {
      this.closingPromise = Promise.all([
        this.server.close(),
        (_a = this.typechecker) == null ? void 0 : _a.stop(),
        (_b = this.browser) == null ? void 0 : _b.close()
      ].filter(Boolean)).then(() => this._provided = {});
    }
    return this.closingPromise;
  }
  async initBrowserProvider() {
    if (!this.isBrowserEnabled())
      return;
    if (this.browserProvider)
      return;
    const Provider = await getBrowserProvider(this.config.browser, this);
    this.browserProvider = new Provider();
    const browser = this.config.browser.name;
    const supportedBrowsers = this.browserProvider.getSupportedBrowsers();
    if (!browser)
      throw new Error(`[${this.getName()}] Browser name is required. Please, set \`test.browser.name\` option manually.`);
    if (supportedBrowsers.length && !supportedBrowsers.includes(browser))
      throw new Error(`[${this.getName()}] Browser "${browser}" is not supported by the browser provider "${this.browserProvider.name}". Supported browsers: ${supportedBrowsers.join(", ")}.`);
    const providerOptions = this.config.browser.providerOptions;
    await this.browserProvider.initialize(this, { browser, options: providerOptions });
  }
}

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
class VitestPackageInstaller {
  async ensureInstalled(dependency, root) {
    if (process.env.VITEST_SKIP_INSTALL_CHECKS)
      return true;
    if (process.versions.pnp) {
      const targetRequire = createRequire(__dirname);
      try {
        targetRequire.resolve(dependency, { paths: [root, __dirname] });
        return true;
      } catch (error) {
      }
    }
    if (isPackageExists(dependency, { paths: [root, __dirname] }))
      return true;
    const promptInstall = !isCI && process.stdout.isTTY;
    process.stderr.write(c.red(`${c.inverse(c.red(" MISSING DEPENDENCY "))} Cannot find dependency '${dependency}'

`));
    if (!promptInstall)
      return false;
    const prompts = await Promise.resolve().then(function () { return index; });
    const { install } = await prompts.prompt({
      type: "confirm",
      name: "install",
      message: c.reset(`Do you want to install ${c.green(dependency)}?`)
    });
    if (install) {
      await (await import('../chunks/install-pkg.LE8oaA1t.js')).installPackage(dependency, { dev: true });
      process.stderr.write(c.yellow(`
Package ${dependency} installed, re-run the command to start.
`));
      process.exit(EXIT_CODE_RESTART);
      return true;
    }
    return false;
  }
}

const WATCHER_DEBOUNCE = 100;
class Vitest {
  constructor(mode, options = {}) {
    this.mode = mode;
    this.logger = new Logger(this);
    this.packageInstaller = options.packageInstaller || new VitestPackageInstaller();
  }
  config = void 0;
  configOverride = {};
  server = void 0;
  state = void 0;
  snapshot = void 0;
  cache = void 0;
  reporters = void 0;
  coverageProvider;
  browserProvider;
  logger;
  pool;
  vitenode = void 0;
  invalidates = /* @__PURE__ */ new Set();
  changedTests = /* @__PURE__ */ new Set();
  filenamePattern;
  runningPromise;
  closingPromise;
  isCancelling = false;
  isFirstRun = true;
  restartsCount = 0;
  runner = void 0;
  packageInstaller;
  coreWorkspaceProject;
  resolvedProjects = [];
  projects = [];
  projectsTestFiles = /* @__PURE__ */ new Map();
  distPath;
  _onRestartListeners = [];
  _onClose = [];
  _onSetServer = [];
  _onCancelListeners = [];
  async setServer(options, server, cliOptions) {
    var _a, _b, _c, _d;
    (_a = this.unregisterWatcher) == null ? void 0 : _a.call(this);
    clearTimeout(this._rerunTimer);
    this.restartsCount += 1;
    (_c = (_b = this.pool) == null ? void 0 : _b.close) == null ? void 0 : _c.call(_b);
    this.pool = void 0;
    this.coverageProvider = void 0;
    this.runningPromise = void 0;
    this.projectsTestFiles.clear();
    const resolved = resolveConfig(this.mode, options, server.config);
    this.server = server;
    this.config = resolved;
    this.state = new StateManager();
    this.cache = new VitestCache();
    this.snapshot = new SnapshotManager({ ...resolved.snapshotOptions });
    if (this.config.watch)
      this.registerWatcher();
    this.vitenode = new ViteNodeServer(server, this.config.server);
    const projectVitestPath = await this.vitenode.resolveId("vitest");
    const vitestDir = projectVitestPath ? resolve(projectVitestPath.id, "../..") : rootDir;
    this.distPath = join(vitestDir, "dist");
    const node = this.vitenode;
    this.runner = new ViteNodeRunner({
      root: server.config.root,
      base: server.config.base,
      fetchModule(id) {
        return node.fetchModule(id);
      },
      resolveId(id, importer) {
        return node.resolveId(id, importer);
      }
    });
    if (this.config.watch) {
      const serverRestart = server.restart;
      server.restart = async (...args) => {
        await Promise.all(this._onRestartListeners.map((fn) => fn()));
        await serverRestart(...args);
        this.unregisterWatcher();
        this.registerWatcher();
      };
      server.watcher.on("change", async (file) => {
        file = normalize(file);
        const isConfig = file === server.config.configFile;
        if (isConfig) {
          await Promise.all(this._onRestartListeners.map((fn) => fn("config")));
          await serverRestart();
          this.unregisterWatcher();
          this.registerWatcher();
        }
      });
    }
    this.reporters = resolved.mode === "benchmark" ? await createBenchmarkReporters(toArray((_d = resolved.benchmark) == null ? void 0 : _d.reporters), this.runner) : await createReporters(resolved.reporters, this);
    this.cache.results.setConfig(resolved.root, resolved.cache);
    try {
      await this.cache.results.readFromCache();
    } catch {
    }
    await Promise.all(this._onSetServer.map((fn) => fn()));
    const projects = await this.resolveWorkspace(cliOptions);
    this.projects = projects;
    this.resolvedProjects = projects;
    const filteredProjects = toArray(resolved.project);
    if (filteredProjects.length)
      this.projects = this.projects.filter((p) => filteredProjects.includes(p.getName()));
    if (!this.coreWorkspaceProject)
      this.coreWorkspaceProject = WorkspaceProject.createBasicProject(this);
    if (this.config.testNamePattern)
      this.configOverride.testNamePattern = this.config.testNamePattern;
  }
  async createCoreProject() {
    this.coreWorkspaceProject = await WorkspaceProject.createCoreProject(this);
    return this.coreWorkspaceProject;
  }
  getCoreWorkspaceProject() {
    return this.coreWorkspaceProject;
  }
  getProjectByTaskId(taskId) {
    var _a;
    const task = this.state.idMap.get(taskId);
    const projectName = task.projectName || ((_a = task == null ? void 0 : task.file) == null ? void 0 : _a.projectName);
    return this.projects.find((p) => p.getName() === projectName) || this.getCoreWorkspaceProject() || this.projects[0];
  }
  async getWorkspaceConfigPath() {
    if (this.config.workspace)
      return this.config.workspace;
    const configDir = this.server.config.configFile ? dirname(this.server.config.configFile) : this.config.root;
    const rootFiles = await promises.readdir(configDir);
    const workspaceConfigName = workspacesFiles.find((configFile) => {
      return rootFiles.includes(configFile);
    });
    if (!workspaceConfigName)
      return null;
    return join(configDir, workspaceConfigName);
  }
  async resolveWorkspace(cliOptions) {
    const workspaceConfigPath = await this.getWorkspaceConfigPath();
    if (!workspaceConfigPath)
      return [await this.createCoreProject()];
    const workspaceModule = await this.runner.executeFile(workspaceConfigPath);
    if (!workspaceModule.default || !Array.isArray(workspaceModule.default))
      throw new Error(`Workspace config file ${workspaceConfigPath} must export a default array of project paths.`);
    const workspaceGlobMatches = [];
    const projectsOptions = [];
    for (const project of workspaceModule.default) {
      if (typeof project === "string")
        workspaceGlobMatches.push(project.replace("<rootDir>", this.config.root));
      else
        projectsOptions.push(project);
    }
    const globOptions = {
      absolute: true,
      dot: true,
      onlyFiles: false,
      markDirectories: true,
      cwd: this.config.root,
      ignore: ["**/node_modules/**", "**/*.timestamp-*"]
    };
    const workspacesFs = await fg(workspaceGlobMatches, globOptions);
    const resolvedWorkspacesPaths = await Promise.all(workspacesFs.filter((file) => {
      if (file.endsWith("/")) {
        const hasWorkspaceWithConfig = workspacesFs.some((file2) => {
          return file2 !== file && `${dirname(file2)}/` === file;
        });
        return !hasWorkspaceWithConfig;
      }
      const filename = basename(file);
      return CONFIG_NAMES.some((configName) => filename.startsWith(configName));
    }).map(async (filepath) => {
      if (filepath.endsWith("/")) {
        const filesInside = await promises.readdir(filepath);
        const configFile = configFiles.find((config) => filesInside.includes(config));
        return configFile ? join(filepath, configFile) : filepath;
      }
      return filepath;
    }));
    const workspacesByFolder = resolvedWorkspacesPaths.reduce((configByFolder, filepath) => {
      const dir = filepath.endsWith("/") ? filepath.slice(0, -1) : dirname(filepath);
      configByFolder[dir] ?? (configByFolder[dir] = []);
      configByFolder[dir].push(filepath);
      return configByFolder;
    }, {});
    const filteredWorkspaces = Object.values(workspacesByFolder).map((configFiles2) => {
      if (configFiles2.length === 1)
        return configFiles2[0];
      const vitestConfig = configFiles2.find((configFile) => basename(configFile).startsWith("vitest.config"));
      return vitestConfig || configFiles2[0];
    });
    const overridesOptions = [
      "logHeapUsage",
      "allowOnly",
      "sequence",
      "testTimeout",
      "pool",
      "globals",
      "expandSnapshotDiff",
      "disableConsoleIntercept",
      "retry",
      "testNamePattern",
      "passWithNoTests",
      "bail",
      "isolate"
    ];
    const cliOverrides = overridesOptions.reduce((acc, name) => {
      if (name in cliOptions)
        acc[name] = cliOptions[name];
      return acc;
    }, {});
    const projects = filteredWorkspaces.map(async (workspacePath) => {
      if (this.server.config.configFile === workspacePath)
        return this.createCoreProject();
      return initializeProject(workspacePath, this, { workspaceConfigPath, test: cliOverrides });
    });
    projectsOptions.forEach((options, index) => {
      projects.push(initializeProject(index, this, mergeConfig(options, { workspaceConfigPath, test: cliOverrides })));
    });
    if (!projects.length)
      return [await this.createCoreProject()];
    const resolvedProjects = await Promise.all(projects);
    const names = /* @__PURE__ */ new Set();
    for (const project of resolvedProjects) {
      const name = project.getName();
      if (names.has(name))
        throw new Error(`Project name "${name}" is not unique. All projects in a workspace should have unique names.`);
      names.add(name);
    }
    return resolvedProjects;
  }
  async initCoverageProvider() {
    if (this.coverageProvider !== void 0)
      return;
    this.coverageProvider = await getCoverageProvider(this.config.coverage, this.runner);
    if (this.coverageProvider) {
      await this.coverageProvider.initialize(this);
      this.config.coverage = this.coverageProvider.resolveOptions();
    }
    return this.coverageProvider;
  }
  async initBrowserProviders() {
    return Promise.all(this.projects.map((w) => w.initBrowserProvider()));
  }
  async start(filters) {
    var _a, _b;
    this._onClose = [];
    try {
      await this.initCoverageProvider();
      await ((_a = this.coverageProvider) == null ? void 0 : _a.clean(this.config.coverage.clean));
      await this.initBrowserProviders();
    } finally {
      await this.report("onInit", this);
    }
    const files = await this.filterTestsBySource(
      await this.globTestFiles(filters)
    );
    if (!files.length) {
      await this.reportCoverage(true);
      this.logger.printNoTestFound(filters);
      if (!this.config.watch || !(this.config.changed || ((_b = this.config.related) == null ? void 0 : _b.length))) {
        const exitCode = this.config.passWithNoTests ? 0 : 1;
        process.exit(exitCode);
      }
    }
    this.config.changed = false;
    this.config.related = void 0;
    if (files.length) {
      await this.cache.stats.populateStats(this.config.root, files);
      await this.runFiles(files, true);
    }
    if (this.config.watch)
      await this.report("onWatcherStart");
  }
  async getTestDependencies(filepath, deps = /* @__PURE__ */ new Set()) {
    const addImports = async ([project, filepath2]) => {
      if (deps.has(filepath2))
        return;
      deps.add(filepath2);
      const mod = project.server.moduleGraph.getModuleById(filepath2);
      const transformed = (mod == null ? void 0 : mod.ssrTransformResult) || await project.vitenode.transformRequest(filepath2);
      if (!transformed)
        return;
      const dependencies = [...transformed.deps || [], ...transformed.dynamicDeps || []];
      await Promise.all(dependencies.map(async (dep) => {
        const path = await project.server.pluginContainer.resolveId(dep, filepath2, { ssr: true });
        const fsPath = path && !path.external && path.id.split("?")[0];
        if (fsPath && !fsPath.includes("node_modules") && !deps.has(fsPath) && existsSync(fsPath))
          await addImports([project, fsPath]);
      }));
    };
    await addImports(filepath);
    deps.delete(filepath[1]);
    return deps;
  }
  async filterTestsBySource(specs) {
    if (this.config.changed && !this.config.related) {
      const { VitestGit } = await import('../chunks/node-git.Hw101KjS.js');
      const vitestGit = new VitestGit(this.config.root);
      const related2 = await vitestGit.findChangedFiles({
        changedSince: this.config.changed
      });
      if (!related2) {
        this.logger.error(c.red("Could not find Git root. Have you initialized git with `git init`?\n"));
        process.exit(1);
      }
      this.config.related = Array.from(new Set(related2));
    }
    const related = this.config.related;
    if (!related)
      return specs;
    const forceRerunTriggers = this.config.forceRerunTriggers;
    if (forceRerunTriggers.length && mm(related, forceRerunTriggers).length)
      return specs;
    if (!this.config.watch && !related.length)
      return [];
    const testGraphs = await Promise.all(
      specs.map(async (spec) => {
        const deps = await this.getTestDependencies(spec);
        return [spec, deps];
      })
    );
    const runningTests = [];
    for (const [filepath, deps] of testGraphs) {
      if (related.some((path) => path === filepath[1] || deps.has(path)))
        runningTests.push(filepath);
    }
    return runningTests;
  }
  getProjectsByTestFile(file) {
    const projects = this.projectsTestFiles.get(file);
    if (!projects)
      return [];
    return Array.from(projects).map((project) => [project, file]);
  }
  async initializeGlobalSetup(paths) {
    const projects = new Set(paths.map(([project]) => project));
    const coreProject = this.getCoreWorkspaceProject();
    if (!projects.has(coreProject))
      projects.add(coreProject);
    for await (const project of projects)
      await project.initializeGlobalSetup();
  }
  async runFiles(paths, allTestsRun) {
    const filepaths = paths.map(([, file]) => file);
    this.state.collectPaths(filepaths);
    await this.report("onPathsCollected", filepaths);
    await this.runningPromise;
    this._onCancelListeners = [];
    this.isCancelling = false;
    this.runningPromise = (async () => {
      var _a;
      if (!this.pool)
        this.pool = createPool(this);
      const invalidates = Array.from(this.invalidates);
      this.invalidates.clear();
      this.snapshot.clear();
      this.state.clearErrors();
      if (!this.isFirstRun && this.config.coverage.cleanOnRerun)
        await ((_a = this.coverageProvider) == null ? void 0 : _a.clean());
      await this.initializeGlobalSetup(paths);
      try {
        await this.pool.runTests(paths, invalidates);
      } catch (err) {
        this.state.catchError(err, "Unhandled Error");
      }
      const files = this.state.getFiles();
      if (hasFailed(files))
        process.exitCode = 1;
      this.cache.results.updateResults(files);
      await this.cache.results.writeToCache();
    })().finally(async () => {
      const specs = Array.from(new Set(paths.map(([, p]) => p)));
      await this.report("onFinished", this.state.getFiles(specs), this.state.getUnhandledErrors());
      await this.reportCoverage(allTestsRun);
      this.runningPromise = void 0;
      this.isFirstRun = false;
    });
    return await this.runningPromise;
  }
  async cancelCurrentRun(reason) {
    this.isCancelling = true;
    await Promise.all(this._onCancelListeners.splice(0).map((listener) => listener(reason)));
  }
  async rerunFiles(files = this.state.getFilepaths(), trigger) {
    if (this.filenamePattern) {
      const filteredFiles = await this.globTestFiles([this.filenamePattern]);
      files = files.filter((file) => filteredFiles.some((f) => f[1] === file));
    }
    await this.report("onWatcherRerun", files, trigger);
    await this.runFiles(files.flatMap((file) => this.getProjectsByTestFile(file)), !trigger);
    await this.report("onWatcherStart", this.state.getFiles(files));
  }
  async changeProjectName(pattern) {
    if (pattern === "")
      delete this.configOverride.project;
    else
      this.configOverride.project = pattern;
    this.projects = this.resolvedProjects.filter((p) => p.getName() === pattern);
    const files = (await this.globTestFiles()).map(([, file]) => file);
    await this.rerunFiles(files, "change project filter");
  }
  async changeNamePattern(pattern, files = this.state.getFilepaths(), trigger) {
    if (pattern === "")
      this.filenamePattern = void 0;
    this.configOverride.testNamePattern = pattern ? new RegExp(pattern) : void 0;
    await this.rerunFiles(files, trigger);
  }
  async changeFilenamePattern(pattern) {
    this.filenamePattern = pattern;
    const files = this.state.getFilepaths();
    const trigger = this.filenamePattern ? "change filename pattern" : "reset filename pattern";
    await this.rerunFiles(files, trigger);
  }
  async rerunFailed() {
    await this.rerunFiles(this.state.getFailedFilepaths(), "rerun failed");
  }
  async updateSnapshot(files) {
    files = files || [
      ...this.state.getFailedFilepaths(),
      ...this.snapshot.summary.uncheckedKeysByFile.map((s) => s.filePath)
    ];
    this.configOverride.snapshotOptions = {
      updateSnapshot: "all",
      // environment is resolved inside a worker thread
      snapshotEnvironment: null
    };
    try {
      await this.rerunFiles(files, "update snapshot");
    } finally {
      delete this.configOverride.snapshotOptions;
    }
  }
  _rerunTimer;
  async scheduleRerun(triggerId) {
    const currentCount = this.restartsCount;
    clearTimeout(this._rerunTimer);
    await this.runningPromise;
    clearTimeout(this._rerunTimer);
    if (this.restartsCount !== currentCount)
      return;
    this._rerunTimer = setTimeout(async () => {
      if (this.changedTests.size === 0) {
        this.invalidates.clear();
        return;
      }
      if (this.restartsCount !== currentCount)
        return;
      this.isFirstRun = false;
      this.snapshot.clear();
      let files = Array.from(this.changedTests);
      if (this.filenamePattern) {
        const filteredFiles = await this.globTestFiles([this.filenamePattern]);
        files = files.filter((file) => filteredFiles.some((f) => f[1] === file));
        if (files.length === 0)
          return;
      }
      this.changedTests.clear();
      const triggerIds = new Set(triggerId.map((id) => relative(this.config.root, id)));
      const triggerLabel = Array.from(triggerIds).join(", ");
      await this.report("onWatcherRerun", files, triggerLabel);
      await this.runFiles(files.flatMap((file) => this.getProjectsByTestFile(file)), false);
      await this.report("onWatcherStart", this.state.getFiles(files));
    }, WATCHER_DEBOUNCE);
  }
  getModuleProjects(filepath) {
    return this.projects.filter((project) => {
      return project.getModulesByFilepath(filepath).size;
    });
  }
  unregisterWatcher = noop$1;
  registerWatcher() {
    const updateLastChanged = (filepath) => {
      const projects = this.getModuleProjects(filepath);
      projects.forEach(({ server, browser }) => {
        const serverMods = server.moduleGraph.getModulesByFile(filepath);
        serverMods == null ? void 0 : serverMods.forEach((mod) => server.moduleGraph.invalidateModule(mod));
        if (browser) {
          const browserMods = browser.moduleGraph.getModulesByFile(filepath);
          browserMods == null ? void 0 : browserMods.forEach((mod) => browser.moduleGraph.invalidateModule(mod));
        }
      });
    };
    const onChange = (id) => {
      id = slash$1(id);
      this.logger.clearHighlightCache(id);
      updateLastChanged(id);
      const needsRerun = this.handleFileChanged(id);
      if (needsRerun.length)
        this.scheduleRerun(needsRerun);
    };
    const onUnlink = (id) => {
      id = slash$1(id);
      this.logger.clearHighlightCache(id);
      this.invalidates.add(id);
      if (this.state.filesMap.has(id)) {
        this.state.filesMap.delete(id);
        this.cache.results.removeFromCache(id);
        this.cache.stats.removeStats(id);
        this.changedTests.delete(id);
        this.report("onTestRemoved", id);
      }
    };
    const onAdd = async (id) => {
      id = slash$1(id);
      updateLastChanged(id);
      const matchingProjects = [];
      await Promise.all(this.projects.map(async (project) => {
        if (await project.isTargetFile(id))
          matchingProjects.push(project);
      }));
      if (matchingProjects.length > 0) {
        this.projectsTestFiles.set(id, new Set(matchingProjects));
        this.changedTests.add(id);
        this.scheduleRerun([id]);
      } else {
        const needsRerun = this.handleFileChanged(id);
        if (needsRerun.length)
          this.scheduleRerun(needsRerun);
      }
    };
    const watcher = this.server.watcher;
    if (this.config.forceRerunTriggers.length)
      watcher.add(this.config.forceRerunTriggers);
    watcher.unwatch(this.config.watchExclude);
    watcher.on("change", onChange);
    watcher.on("unlink", onUnlink);
    watcher.on("add", onAdd);
    this.unregisterWatcher = () => {
      watcher.off("change", onChange);
      watcher.off("unlink", onUnlink);
      watcher.off("add", onAdd);
      this.unregisterWatcher = noop$1;
    };
  }
  /**
   * @returns A value indicating whether rerun is needed (changedTests was mutated)
   */
  handleFileChanged(filepath) {
    if (this.changedTests.has(filepath) || this.invalidates.has(filepath))
      return [];
    if (mm.isMatch(filepath, this.config.forceRerunTriggers)) {
      this.state.getFilepaths().forEach((file) => this.changedTests.add(file));
      return [filepath];
    }
    const projects = this.getModuleProjects(filepath);
    if (!projects.length) {
      if (this.state.filesMap.has(filepath) || this.projects.some((project) => project.isTestFile(filepath))) {
        this.changedTests.add(filepath);
        return [filepath];
      }
      return [];
    }
    const files = [];
    for (const project of projects) {
      const mods = project.getModulesByFilepath(filepath);
      if (!mods.size)
        continue;
      this.invalidates.add(filepath);
      if (this.state.filesMap.has(filepath) || project.isTestFile(filepath)) {
        this.changedTests.add(filepath);
        files.push(filepath);
        continue;
      }
      let rerun = false;
      for (const mod of mods) {
        mod.importers.forEach((i) => {
          if (!i.file)
            return;
          const heedsRerun = this.handleFileChanged(i.file);
          if (heedsRerun)
            rerun = true;
        });
      }
      if (rerun)
        files.push(filepath);
    }
    return files;
  }
  async reportCoverage(allTestsRun) {
    if (!this.config.coverage.reportOnFailure && this.state.getCountOfFailedTests() > 0)
      return;
    if (this.coverageProvider)
      await this.coverageProvider.reportCoverage({ allTestsRun });
  }
  async close() {
    if (!this.closingPromise) {
      this.closingPromise = (async () => {
        const teardownProjects = [...this.projects];
        if (!teardownProjects.includes(this.coreWorkspaceProject))
          teardownProjects.push(this.coreWorkspaceProject);
        for await (const project of teardownProjects.reverse())
          await project.teardownGlobalSetup();
        const closePromises = this.projects.map((w) => w.close().then(() => w.server = void 0));
        if (!this.projects.includes(this.coreWorkspaceProject))
          closePromises.push(this.coreWorkspaceProject.close().then(() => this.server = void 0));
        if (this.pool) {
          closePromises.push((async () => {
            var _a, _b;
            await ((_b = (_a = this.pool) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a));
            this.pool = void 0;
          })());
        }
        closePromises.push(...this._onClose.map((fn) => fn()));
        return Promise.allSettled(closePromises).then((results) => {
          results.filter((r) => r.status === "rejected").forEach((err) => {
            this.logger.error("error during close", err.reason);
          });
        });
      })();
    }
    return this.closingPromise;
  }
  /**
   * Close the thread pool and exit the process
   */
  async exit(force = false) {
    setTimeout(() => {
      this.report("onProcessTimeout").then(() => {
        console.warn(`close timed out after ${this.config.teardownTimeout}ms`);
        this.state.getProcessTimeoutCauses().forEach((cause) => console.warn(cause));
        if (!this.pool) {
          const runningServers = [this.server, ...this.projects.map((p) => p.server)].filter(Boolean).length;
          if (runningServers === 1)
            console.warn("Tests closed successfully but something prevents Vite server from exiting");
          else if (runningServers > 1)
            console.warn(`Tests closed successfully but something prevents ${runningServers} Vite servers from exiting`);
          else
            console.warn("Tests closed successfully but something prevents the main process from exiting");
          console.warn('You can try to identify the cause by enabling "hanging-process" reporter. See https://vitest.dev/config/#reporters');
        }
        process.exit();
      });
    }, this.config.teardownTimeout).unref();
    await this.close();
    if (force)
      process.exit();
  }
  async report(name, ...args) {
    await Promise.all(this.reporters.map((r) => {
      var _a;
      return (_a = r[name]) == null ? void 0 : _a.call(
        r,
        ...args
      );
    }));
  }
  async globTestFiles(filters = []) {
    const files = [];
    await Promise.all(this.projects.map(async (project) => {
      const specs = await project.globTestFiles(filters);
      specs.forEach((file) => {
        files.push([project, file]);
        const projects = this.projectsTestFiles.get(file) || /* @__PURE__ */ new Set();
        projects.add(project);
        this.projectsTestFiles.set(file, projects);
      });
    }));
    return files;
  }
  // The server needs to be running for communication
  shouldKeepServer() {
    var _a;
    return !!((_a = this.config) == null ? void 0 : _a.watch);
  }
  onServerRestart(fn) {
    this._onRestartListeners.push(fn);
  }
  onAfterSetServer(fn) {
    this._onSetServer.push(fn);
  }
  onCancel(fn) {
    this._onCancelListeners.push(fn);
  }
  onClose(fn) {
    this._onClose.push(fn);
  }
}

async function VitestPlugin(options = {}, ctx = new Vitest("test")) {
  const userConfig = deepMerge({}, options);
  const getRoot = () => {
    var _a;
    return ((_a = ctx.config) == null ? void 0 : _a.root) || options.root || process.cwd();
  };
  async function UIPlugin() {
    await ctx.packageInstaller.ensureInstalled("@vitest/ui", getRoot());
    return (await import('@vitest/ui')).default(ctx);
  }
  return [
    {
      name: "vitest",
      enforce: "pre",
      options() {
        this.meta.watchMode = false;
      },
      async config(viteConfig) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
        if (options.watch) {
          options = deepMerge({}, userConfig);
        }
        const testConfig = deepMerge(
          {},
          configDefaults,
          options,
          removeUndefinedValues(viteConfig.test ?? {})
        );
        testConfig.api = resolveApiServerConfig(testConfig);
        testConfig.poolOptions ?? (testConfig.poolOptions = {});
        (_a = testConfig.poolOptions).threads ?? (_a.threads = {});
        (_b = testConfig.poolOptions).forks ?? (_b.forks = {});
        testConfig.poolOptions.threads.isolate = ((_d = (_c = options.poolOptions) == null ? void 0 : _c.threads) == null ? void 0 : _d.isolate) ?? options.isolate ?? testConfig.poolOptions.threads.isolate ?? ((_e = viteConfig.test) == null ? void 0 : _e.isolate);
        testConfig.poolOptions.forks.isolate = ((_g = (_f = options.poolOptions) == null ? void 0 : _f.forks) == null ? void 0 : _g.isolate) ?? options.isolate ?? testConfig.poolOptions.forks.isolate ?? ((_h = viteConfig.test) == null ? void 0 : _h.isolate);
        const defines = deleteDefineConfig(viteConfig);
        options.defines = defines;
        let open = false;
        if (testConfig.ui && testConfig.open)
          open = testConfig.uiBase ?? "/__vitest__/";
        const config = {
          root: ((_i = viteConfig.test) == null ? void 0 : _i.root) || options.root,
          esbuild: viteConfig.esbuild === false ? false : {
            sourcemap: "external",
            // Enables using ignore hint for coverage providers with @preserve keyword
            legalComments: "inline"
          },
          resolve: {
            // by default Vite resolves `module` field, which not always a native ESM module
            // setting this option can bypass that and fallback to cjs version
            mainFields: [],
            alias: testConfig.alias,
            conditions: ["node"]
          },
          server: {
            ...testConfig.api,
            watch: {
              ignored: testConfig.watchExclude
            },
            open,
            hmr: false,
            preTransformRequests: false,
            fs: {
              allow: resolveFsAllow(getRoot(), testConfig.config)
            }
          },
          test: {
            poolOptions: testConfig.poolOptions
          }
        };
        if (((_j = viteConfig.ssr) == null ? void 0 : _j.noExternal) !== true) {
          const inline = (_l = (_k = testConfig.server) == null ? void 0 : _k.deps) == null ? void 0 : _l.inline;
          if (inline === true) {
            config.ssr = { noExternal: true };
          } else {
            const noExternal = (_m = viteConfig.ssr) == null ? void 0 : _m.noExternal;
            const noExternalArray = typeof noExternal !== "undefined" ? toArray(noExternal) : void 0;
            const uniqueInline = inline && noExternalArray ? inline.filter((dep) => !noExternalArray.includes(dep)) : inline;
            config.ssr = {
              noExternal: uniqueInline
            };
          }
        }
        if (process.platform === "darwin" && process.env.VITE_TEST_WATCHER_DEBUG) {
          config.server.watch.useFsEvents = false;
          config.server.watch.usePolling = false;
        }
        const classNameStrategy = typeof testConfig.css !== "boolean" && ((_o = (_n = testConfig.css) == null ? void 0 : _n.modules) == null ? void 0 : _o.classNameStrategy) || "stable";
        if (classNameStrategy !== "scoped") {
          config.css ?? (config.css = {});
          (_p = config.css).modules ?? (_p.modules = {});
          if (config.css.modules) {
            config.css.modules.generateScopedName = (name, filename) => {
              const root = getRoot();
              return generateScopedClassName(classNameStrategy, name, relative(root, filename));
            };
          }
        }
        return config;
      },
      async configResolved(viteConfig) {
        var _a, _b, _c;
        const viteConfigTest = viteConfig.test || {};
        if (viteConfigTest.watch === false)
          viteConfigTest.run = true;
        if ("alias" in viteConfigTest)
          delete viteConfigTest.alias;
        options = deepMerge(
          {},
          configDefaults,
          viteConfigTest,
          options
        );
        options.api = resolveApiServerConfig(options);
        const { PROD, DEV, ...envs } = viteConfig.env;
        (_a = process.env).PROD ?? (_a.PROD = PROD ? "1" : "");
        (_b = process.env).DEV ?? (_b.DEV = DEV ? "1" : "");
        for (const name in envs)
          (_c = process.env)[name] ?? (_c[name] = envs[name]);
        if (!options.watch)
          viteConfig.server.watch = null;
        hijackVitePluginInject(viteConfig);
      },
      async configureServer(server) {
        if (options.watch && process.env.VITE_TEST_WATCHER_DEBUG) {
          server.watcher.on("ready", () => {
            console.log("[debug] watcher is ready");
          });
        }
        try {
          await ctx.setServer(options, server, userConfig);
          if (options.api && options.watch)
            (await import('../chunks/api-setup.srzH0bDf.js')).setup(ctx);
        } catch (err) {
          await ctx.logger.printError(err, { fullStack: true });
          process.exit(1);
        }
        if (!options.watch)
          await server.watcher.close();
      }
    },
    SsrReplacerPlugin(),
    ...CSSEnablerPlugin(ctx),
    CoverageTransform(ctx),
    options.ui ? await UIPlugin() : null,
    MocksPlugin(),
    VitestResolver(ctx),
    VitestOptimizer(),
    NormalizeURLPlugin()
  ].filter(notNullish);
}

async function createVitest(mode, options, viteOverrides = {}, vitestOptions = {}) {
  var _a;
  const ctx = new Vitest(mode, vitestOptions);
  const root = resolve(options.root || process.cwd());
  const configPath = options.config === false ? false : options.config ? resolve(root, options.config) : await findUp(configFiles, { cwd: root });
  options.config = configPath;
  const config = {
    logLevel: "error",
    configFile: configPath,
    // this will make "mode": "test" | "benchmark" inside defineConfig
    mode: options.mode || mode,
    plugins: await VitestPlugin(options, ctx)
  };
  const server = await createViteServer(mergeConfig(config, mergeConfig(viteOverrides, { root: options.root })));
  if ((_a = ctx.config.api) == null ? void 0 : _a.port)
    await server.listen();
  return ctx;
}

var prompts$2 = {};

var kleur;
var hasRequiredKleur;

function requireKleur () {
	if (hasRequiredKleur) return kleur;
	hasRequiredKleur = 1;

	const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

	const $ = {
		enabled: !NODE_DISABLE_COLORS && TERM !== 'dumb' && FORCE_COLOR !== '0',

		// modifiers
		reset: init(0, 0),
		bold: init(1, 22),
		dim: init(2, 22),
		italic: init(3, 23),
		underline: init(4, 24),
		inverse: init(7, 27),
		hidden: init(8, 28),
		strikethrough: init(9, 29),

		// colors
		black: init(30, 39),
		red: init(31, 39),
		green: init(32, 39),
		yellow: init(33, 39),
		blue: init(34, 39),
		magenta: init(35, 39),
		cyan: init(36, 39),
		white: init(37, 39),
		gray: init(90, 39),
		grey: init(90, 39),

		// background colors
		bgBlack: init(40, 49),
		bgRed: init(41, 49),
		bgGreen: init(42, 49),
		bgYellow: init(43, 49),
		bgBlue: init(44, 49),
		bgMagenta: init(45, 49),
		bgCyan: init(46, 49),
		bgWhite: init(47, 49)
	};

	function run(arr, str) {
		let i=0, tmp, beg='', end='';
		for (; i < arr.length; i++) {
			tmp = arr[i];
			beg += tmp.open;
			end += tmp.close;
			if (str.includes(tmp.close)) {
				str = str.replace(tmp.rgx, tmp.close + tmp.open);
			}
		}
		return beg + str + end;
	}

	function chain(has, keys) {
		let ctx = { has, keys };

		ctx.reset = $.reset.bind(ctx);
		ctx.bold = $.bold.bind(ctx);
		ctx.dim = $.dim.bind(ctx);
		ctx.italic = $.italic.bind(ctx);
		ctx.underline = $.underline.bind(ctx);
		ctx.inverse = $.inverse.bind(ctx);
		ctx.hidden = $.hidden.bind(ctx);
		ctx.strikethrough = $.strikethrough.bind(ctx);

		ctx.black = $.black.bind(ctx);
		ctx.red = $.red.bind(ctx);
		ctx.green = $.green.bind(ctx);
		ctx.yellow = $.yellow.bind(ctx);
		ctx.blue = $.blue.bind(ctx);
		ctx.magenta = $.magenta.bind(ctx);
		ctx.cyan = $.cyan.bind(ctx);
		ctx.white = $.white.bind(ctx);
		ctx.gray = $.gray.bind(ctx);
		ctx.grey = $.grey.bind(ctx);

		ctx.bgBlack = $.bgBlack.bind(ctx);
		ctx.bgRed = $.bgRed.bind(ctx);
		ctx.bgGreen = $.bgGreen.bind(ctx);
		ctx.bgYellow = $.bgYellow.bind(ctx);
		ctx.bgBlue = $.bgBlue.bind(ctx);
		ctx.bgMagenta = $.bgMagenta.bind(ctx);
		ctx.bgCyan = $.bgCyan.bind(ctx);
		ctx.bgWhite = $.bgWhite.bind(ctx);

		return ctx;
	}

	function init(open, close) {
		let blk = {
			open: `\x1b[${open}m`,
			close: `\x1b[${close}m`,
			rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
		};
		return function (txt) {
			if (this !== void 0 && this.has !== void 0) {
				this.has.includes(open) || (this.has.push(open),this.keys.push(blk));
				return txt === void 0 ? this : $.enabled ? run(this.keys, txt+'') : txt+'';
			}
			return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt+'') : txt+'';
		};
	}

	kleur = $;
	return kleur;
}

var action$1;
var hasRequiredAction$1;

function requireAction$1 () {
	if (hasRequiredAction$1) return action$1;
	hasRequiredAction$1 = 1;

	action$1 = (key, isSelect) => {
	  if (key.meta && key.name !== 'escape') return;
	  
	  if (key.ctrl) {
	    if (key.name === 'a') return 'first';
	    if (key.name === 'c') return 'abort';
	    if (key.name === 'd') return 'abort';
	    if (key.name === 'e') return 'last';
	    if (key.name === 'g') return 'reset';
	  }
	  
	  if (isSelect) {
	    if (key.name === 'j') return 'down';
	    if (key.name === 'k') return 'up';
	  }

	  if (key.name === 'return') return 'submit';
	  if (key.name === 'enter') return 'submit'; // ctrl + J
	  if (key.name === 'backspace') return 'delete';
	  if (key.name === 'delete') return 'deleteForward';
	  if (key.name === 'abort') return 'abort';
	  if (key.name === 'escape') return 'exit';
	  if (key.name === 'tab') return 'next';
	  if (key.name === 'pagedown') return 'nextPage';
	  if (key.name === 'pageup') return 'prevPage';
	  // TODO create home() in prompt types (e.g. TextPrompt)
	  if (key.name === 'home') return 'home';
	  // TODO create end() in prompt types (e.g. TextPrompt)
	  if (key.name === 'end') return 'end';

	  if (key.name === 'up') return 'up';
	  if (key.name === 'down') return 'down';
	  if (key.name === 'right') return 'right';
	  if (key.name === 'left') return 'left';

	  return false;
	};
	return action$1;
}

var strip$1;
var hasRequiredStrip$1;

function requireStrip$1 () {
	if (hasRequiredStrip$1) return strip$1;
	hasRequiredStrip$1 = 1;

	strip$1 = str => {
	  const pattern = [
	    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
	    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
	  ].join('|');

	  const RGX = new RegExp(pattern, 'g');
	  return typeof str === 'string' ? str.replace(RGX, '') : str;
	};
	return strip$1;
}

var src;
var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;

	const ESC = '\x1B';
	const CSI = `${ESC}[`;
	const beep = '\u0007';

	const cursor = {
	  to(x, y) {
	    if (!y) return `${CSI}${x + 1}G`;
	    return `${CSI}${y + 1};${x + 1}H`;
	  },
	  move(x, y) {
	    let ret = '';

	    if (x < 0) ret += `${CSI}${-x}D`;
	    else if (x > 0) ret += `${CSI}${x}C`;

	    if (y < 0) ret += `${CSI}${-y}A`;
	    else if (y > 0) ret += `${CSI}${y}B`;

	    return ret;
	  },
	  up: (count = 1) => `${CSI}${count}A`,
	  down: (count = 1) => `${CSI}${count}B`,
	  forward: (count = 1) => `${CSI}${count}C`,
	  backward: (count = 1) => `${CSI}${count}D`,
	  nextLine: (count = 1) => `${CSI}E`.repeat(count),
	  prevLine: (count = 1) => `${CSI}F`.repeat(count),
	  left: `${CSI}G`,
	  hide: `${CSI}?25l`,
	  show: `${CSI}?25h`,
	  save: `${ESC}7`,
	  restore: `${ESC}8`
	};

	const scroll = {
	  up: (count = 1) => `${CSI}S`.repeat(count),
	  down: (count = 1) => `${CSI}T`.repeat(count)
	};

	const erase = {
	  screen: `${CSI}2J`,
	  up: (count = 1) => `${CSI}1J`.repeat(count),
	  down: (count = 1) => `${CSI}J`.repeat(count),
	  line: `${CSI}2K`,
	  lineEnd: `${CSI}K`,
	  lineStart: `${CSI}1K`,
	  lines(count) {
	    let clear = '';
	    for (let i = 0; i < count; i++)
	      clear += this.line + (i < count - 1 ? cursor.up() : '');
	    if (count)
	      clear += cursor.left;
	    return clear;
	  }
	};

	src = { cursor, scroll, erase, beep };
	return src;
}

var clear$1;
var hasRequiredClear$1;

function requireClear$1 () {
	if (hasRequiredClear$1) return clear$1;
	hasRequiredClear$1 = 1;

	const strip = requireStrip$1();
	const { erase, cursor } = requireSrc();

	const width = str => [...strip(str)].length;

	/**
	 * @param {string} prompt
	 * @param {number} perLine
	 */
	clear$1 = function(prompt, perLine) {
	  if (!perLine) return erase.line + cursor.to(0);

	  let rows = 0;
	  const lines = prompt.split(/\r?\n/);
	  for (let line of lines) {
	    rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine);
	  }

	  return erase.lines(rows);
	};
	return clear$1;
}

var figures_1$1;
var hasRequiredFigures$1;

function requireFigures$1 () {
	if (hasRequiredFigures$1) return figures_1$1;
	hasRequiredFigures$1 = 1;

	 const main = {
	  arrowUp: '↑',
	  arrowDown: '↓',
	  arrowLeft: '←',
	  arrowRight: '→',
	  radioOn: '◉',
	  radioOff: '◯',
	  tick: '✔',	
	  cross: '✖',	
	  ellipsis: '…',	
	  pointerSmall: '›',	
	  line: '─',	
	  pointer: '❯'	
	};	
	const win = {
	  arrowUp: main.arrowUp,
	  arrowDown: main.arrowDown,
	  arrowLeft: main.arrowLeft,
	  arrowRight: main.arrowRight,
	  radioOn: '(*)',
	  radioOff: '( )',	
	  tick: '√',	
	  cross: '×',	
	  ellipsis: '...',	
	  pointerSmall: '»',	
	  line: '─',	
	  pointer: '>'	
	};	
	const figures = process.platform === 'win32' ? win : main;	

	 figures_1$1 = figures;
	return figures_1$1;
}

var style$1;
var hasRequiredStyle$1;

function requireStyle$1 () {
	if (hasRequiredStyle$1) return style$1;
	hasRequiredStyle$1 = 1;

	const c = requireKleur();
	const figures = requireFigures$1();

	// rendering user input.
	const styles = Object.freeze({
	  password: { scale: 1, render: input => '*'.repeat(input.length) },
	  emoji: { scale: 2, render: input => '😃'.repeat(input.length) },
	  invisible: { scale: 0, render: input => '' },
	  default: { scale: 1, render: input => `${input}` }
	});
	const render = type => styles[type] || styles.default;

	// icon to signalize a prompt.
	const symbols = Object.freeze({
	  aborted: c.red(figures.cross),
	  done: c.green(figures.tick),
	  exited: c.yellow(figures.cross),
	  default: c.cyan('?')
	});

	const symbol = (done, aborted, exited) =>
	  aborted ? symbols.aborted : exited ? symbols.exited : done ? symbols.done : symbols.default;

	// between the question and the user's input.
	const delimiter = completing =>
	  c.gray(completing ? figures.ellipsis : figures.pointerSmall);

	const item = (expandable, expanded) =>
	  c.gray(expandable ? (expanded ? figures.pointerSmall : '+') : figures.line);

	style$1 = {
	  styles,
	  render,
	  symbols,
	  symbol,
	  delimiter,
	  item
	};
	return style$1;
}

var lines$1;
var hasRequiredLines$1;

function requireLines$1 () {
	if (hasRequiredLines$1) return lines$1;
	hasRequiredLines$1 = 1;

	const strip = requireStrip$1();

	/**
	 * @param {string} msg
	 * @param {number} perLine
	 */
	lines$1 = function (msg, perLine) {
	  let lines = String(strip(msg) || '').split(/\r?\n/);

	  if (!perLine) return lines.length;
	  return lines.map(l => Math.ceil(l.length / perLine))
	      .reduce((a, b) => a + b);
	};
	return lines$1;
}

var wrap$1;
var hasRequiredWrap$1;

function requireWrap$1 () {
	if (hasRequiredWrap$1) return wrap$1;
	hasRequiredWrap$1 = 1;

	/**
	 * @param {string} msg The message to wrap
	 * @param {object} opts
	 * @param {number|string} [opts.margin] Left margin
	 * @param {number} opts.width Maximum characters per line including the margin
	 */
	wrap$1 = (msg, opts = {}) => {
	  const tab = Number.isSafeInteger(parseInt(opts.margin))
	    ? new Array(parseInt(opts.margin)).fill(' ').join('')
	    : (opts.margin || '');

	  const width = opts.width;

	  return (msg || '').split(/\r?\n/g)
	    .map(line => line
	      .split(/\s+/g)
	      .reduce((arr, w) => {
	        if (w.length + tab.length >= width || arr[arr.length - 1].length + w.length + 1 < width)
	          arr[arr.length - 1] += ` ${w}`;
	        else arr.push(`${tab}${w}`);
	        return arr;
	      }, [ tab ])
	      .join('\n'))
	    .join('\n');
	};
	return wrap$1;
}

var entriesToDisplay$1;
var hasRequiredEntriesToDisplay$1;

function requireEntriesToDisplay$1 () {
	if (hasRequiredEntriesToDisplay$1) return entriesToDisplay$1;
	hasRequiredEntriesToDisplay$1 = 1;

	/**
	 * Determine what entries should be displayed on the screen, based on the
	 * currently selected index and the maximum visible. Used in list-based
	 * prompts like `select` and `multiselect`.
	 *
	 * @param {number} cursor the currently selected entry
	 * @param {number} total the total entries available to display
	 * @param {number} [maxVisible] the number of entries that can be displayed
	 */
	entriesToDisplay$1 = (cursor, total, maxVisible)  => {
	  maxVisible = maxVisible || total;

	  let startIndex = Math.min(total- maxVisible, cursor - Math.floor(maxVisible / 2));
	  if (startIndex < 0) startIndex = 0;

	  let endIndex = Math.min(startIndex + maxVisible, total);

	  return { startIndex, endIndex };
	};
	return entriesToDisplay$1;
}

var util$1;
var hasRequiredUtil$1;

function requireUtil$1 () {
	if (hasRequiredUtil$1) return util$1;
	hasRequiredUtil$1 = 1;

	util$1 = {
	  action: requireAction$1(),
	  clear: requireClear$1(),
	  style: requireStyle$1(),
	  strip: requireStrip$1(),
	  figures: requireFigures$1(),
	  lines: requireLines$1(),
	  wrap: requireWrap$1(),
	  entriesToDisplay: requireEntriesToDisplay$1()
	};
	return util$1;
}

var prompt$2;
var hasRequiredPrompt$1;

function requirePrompt$1 () {
	if (hasRequiredPrompt$1) return prompt$2;
	hasRequiredPrompt$1 = 1;

	const readline = require$$0$4;
	const { action } = requireUtil$1();
	const EventEmitter = require$$2;
	const { beep, cursor } = requireSrc();
	const color = requireKleur();

	/**
	 * Base prompt skeleton
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class Prompt extends EventEmitter {
	  constructor(opts={}) {
	    super();

	    this.firstRender = true;
	    this.in = opts.stdin || process.stdin;
	    this.out = opts.stdout || process.stdout;
	    this.onRender = (opts.onRender || (() => void 0)).bind(this);
	    const rl = readline.createInterface({ input:this.in, escapeCodeTimeout:50 });
	    readline.emitKeypressEvents(this.in, rl);

	    if (this.in.isTTY) this.in.setRawMode(true);
	    const isSelect = [ 'SelectPrompt', 'MultiselectPrompt' ].indexOf(this.constructor.name) > -1;
	    const keypress = (str, key) => {
	      let a = action(key, isSelect);
	      if (a === false) {
	        this._ && this._(str, key);
	      } else if (typeof this[a] === 'function') {
	        this[a](key);
	      } else {
	        this.bell();
	      }
	    };

	    this.close = () => {
	      this.out.write(cursor.show);
	      this.in.removeListener('keypress', keypress);
	      if (this.in.isTTY) this.in.setRawMode(false);
	      rl.close();
	      this.emit(this.aborted ? 'abort' : this.exited ? 'exit' : 'submit', this.value);
	      this.closed = true;
	    };

	    this.in.on('keypress', keypress);
	  }

	  fire() {
	    this.emit('state', {
	      value: this.value,
	      aborted: !!this.aborted,
	      exited: !!this.exited
	    });
	  }

	  bell() {
	    this.out.write(beep);
	  }

	  render() {
	    this.onRender(color);
	    if (this.firstRender) this.firstRender = false;
	  }
	}

	prompt$2 = Prompt;
	return prompt$2;
}

var text$1;
var hasRequiredText$1;

function requireText$1 () {
	if (hasRequiredText$1) return text$1;
	hasRequiredText$1 = 1;
	const color = requireKleur();
	const Prompt = requirePrompt$1();
	const { erase, cursor } = requireSrc();
	const { style, clear, lines, figures } = requireUtil$1();

	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.initial] Default value
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */
	class TextPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.msg = opts.message;
	    this.initial = opts.initial || ``;
	    this.validator = opts.validate || (() => true);
	    this.value = ``;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.clear = clear(``, this.out.columns);
	    this.render();
	  }

	  set value(v) {
	    if (!v && this.initial) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(this.initial));
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(v);
	    }
	    this._value = v;
	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  reset() {
	    this.value = ``;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.value = this.value || this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.red = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  async validate() {
	    let valid = await this.validator(this.value);
	    if (typeof valid === `string`) {
	      this.errorMsg = valid;
	      valid = false;
	    }
	    this.error = !valid;
	  }

	  async submit() {
	    this.value = this.value || this.initial;
	    this.cursorOffset = 0;
	    this.cursor = this.rendered.length;
	    await this.validate();
	    if (this.error) {
	      this.red = true;
	      this.fire();
	      this.render();
	      return;
	    }
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  next() {
	    if (!this.placeholder) return this.bell();
	    this.value = this.initial;
	    this.cursor = this.rendered.length;
	    this.fire();
	    this.render();
	  }

	  moveCursor(n) {
	    if (this.placeholder) return;
	    this.cursor = this.cursor+n;
	    this.cursorOffset += n;
	  }

	  _(c, key) {
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${c}${s2}`;
	    this.red = false;
	    this.cursor = this.placeholder ? 0 : s1.length+1;
	    this.render();
	  }

	  delete() {
	    if (this.isCursorAtStart()) return this.bell();
	    let s1 = this.value.slice(0, this.cursor-1);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${s2}`;
	    this.red = false;
	    if (this.isCursorAtStart()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	      this.moveCursor(-1);
	    }
	    this.render();
	  }

	  deleteForward() {
	    if(this.cursor*this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor+1);
	    this.value = `${s1}${s2}`;
	    this.red = false;
	    if (this.isCursorAtEnd()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	    }
	    this.render();
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length;
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0 || this.placeholder) return this.bell();
	    this.moveCursor(-1);
	    this.render();
	  }

	  right() {
	    if (this.cursor*this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    this.moveCursor(1);
	    this.render();
	  }

	  isCursorAtStart() {
	    return this.cursor === 0 || (this.placeholder && this.cursor === 1);
	  }

	  isCursorAtEnd() {
	    return this.cursor === this.rendered.length || (this.placeholder && this.cursor === this.rendered.length + 1)
	  }

	  render() {
	    if (this.closed) return;
	    if (!this.firstRender) {
	      if (this.outputError)
	        this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }
	    super.render();
	    this.outputError = '';

	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      this.red ? color.red(this.rendered) : this.rendered
	    ].join(` `);

	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`)
	          .reduce((a, l, i) => a + `\n${i ? ' ' : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore + cursor.move(this.cursorOffset, 0));
	  }
	}

	text$1 = TextPrompt;
	return text$1;
}

var select$1;
var hasRequiredSelect$1;

function requireSelect$1 () {
	if (hasRequiredSelect$1) return select$1;
	hasRequiredSelect$1 = 1;

	const color = requireKleur();
	const Prompt = requirePrompt$1();
	const { style, clear, figures, wrap, entriesToDisplay } = requireUtil$1();
	const { cursor } = requireSrc();

	/**
	 * SelectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {Number} [opts.initial] Index of default value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 */
	class SelectPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.hint = opts.hint || '- Use arrow-keys. Return to submit.';
	    this.warn = opts.warn || '- This option is disabled';
	    this.cursor = opts.initial || 0;
	    this.choices = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string')
	        ch = {title: ch, value: idx};
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        description: ch && ch.description,
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = (this.choices[this.cursor] || {}).value;
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  moveCursor(n) {
	    this.cursor = n;
	    this.value = this.choices[n].value;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(0);
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    if (!this.selection.disabled) {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    } else
	      this.bell();
	  }

	  first() {
	    this.moveCursor(0);
	    this.render();
	  }

	  last() {
	    this.moveCursor(this.choices.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.moveCursor(this.choices.length - 1);
	    } else {
	      this.moveCursor(this.cursor - 1);
	    }
	    this.render();
	  }

	  down() {
	    if (this.cursor === this.choices.length - 1) {
	      this.moveCursor(0);
	    } else {
	      this.moveCursor(this.cursor + 1);
	    }
	    this.render();
	  }

	  next() {
	    this.moveCursor((this.cursor + 1) % this.choices.length);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') return this.submit();
	  }

	  get selection() {
	    return this.choices[this.cursor];
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let { startIndex, endIndex } = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage);

	    // Print prompt
	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.done ? this.selection.title : this.selection.disabled
	          ? color.yellow(this.warn) : color.gray(this.hint)
	    ].join(' ');

	    // Print choices
	    if (!this.done) {
	      this.outputText += '\n';
	      for (let i = startIndex; i < endIndex; i++) {
	        let title, prefix, desc = '', v = this.choices[i];

	        // Determine whether to display "more choices" indicators
	        if (i === startIndex && startIndex > 0) {
	          prefix = figures.arrowUp;
	        } else if (i === endIndex - 1 && endIndex < this.choices.length) {
	          prefix = figures.arrowDown;
	        } else {
	          prefix = ' ';
	        }

	        if (v.disabled) {
	          title = this.cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	          prefix = (this.cursor === i ? color.bold().gray(figures.pointer) + ' ' : '  ') + prefix;
	        } else {
	          title = this.cursor === i ? color.cyan().underline(v.title) : v.title;
	          prefix = (this.cursor === i ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;
	          if (v.description && this.cursor === i) {
	            desc = ` - ${v.description}`;
	            if (prefix.length + title.length + desc.length >= this.out.columns
	                || v.description.split(/\r?\n/).length > 1) {
	              desc = '\n' + wrap(v.description, { margin: 3, width: this.out.columns });
	            }
	          }
	        }

	        this.outputText += `${prefix} ${title}${color.gray(desc)}\n`;
	      }
	    }

	    this.out.write(this.outputText);
	  }
	}

	select$1 = SelectPrompt;
	return select$1;
}

var toggle$1;
var hasRequiredToggle$1;

function requireToggle$1 () {
	if (hasRequiredToggle$1) return toggle$1;
	hasRequiredToggle$1 = 1;
	const color = requireKleur();
	const Prompt = requirePrompt$1();
	const { style, clear } = requireUtil$1();
	const { cursor, erase } = requireSrc();

	/**
	 * TogglePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial=false] Default value
	 * @param {String} [opts.active='no'] Active label
	 * @param {String} [opts.inactive='off'] Inactive label
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class TogglePrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = !!opts.initial;
	    this.active = opts.active || 'on';
	    this.inactive = opts.inactive || 'off';
	    this.initialValue = this.value;
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  deactivate() {
	    if (this.value === false) return this.bell();
	    this.value = false;
	    this.render();
	  }

	  activate() {
	    if (this.value === true) return this.bell();
	    this.value = true;
	    this.render();
	  }

	  delete() {
	    this.deactivate();
	  }
	  left() {
	    this.deactivate();
	  }
	  right() {
	    this.activate();
	  }
	  down() {
	    this.deactivate();
	  }
	  up() {
	    this.activate();
	  }

	  next() {
	    this.value = !this.value;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.value = !this.value;
	    } else if (c === '1') {
	      this.value = true;
	    } else if (c === '0') {
	      this.value = false;
	    } else return this.bell();
	    this.render();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      this.value ? this.inactive : color.cyan().underline(this.inactive),
	      color.gray('/'),
	      this.value ? color.cyan().underline(this.active) : this.active
	    ].join(' ');

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	toggle$1 = TogglePrompt;
	return toggle$1;
}

var datepart$1;
var hasRequiredDatepart$1;

function requireDatepart$1 () {
	if (hasRequiredDatepart$1) return datepart$1;
	hasRequiredDatepart$1 = 1;

	class DatePart {
	  constructor({token, date, parts, locales}) {
	    this.token = token;
	    this.date = date || new Date();
	    this.parts = parts || [this];
	    this.locales = locales || {};
	  }

	  up() {}

	  down() {}

	  next() {
	    const currentIdx = this.parts.indexOf(this);
	    return this.parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  setTo(val) {}

	  prev() {
	    let parts = [].concat(this.parts).reverse();
	    const currentIdx = parts.indexOf(this);
	    return parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  toString() {
	    return String(this.date);
	  }
	}

	datepart$1 = DatePart;
	return datepart$1;
}

var meridiem$1;
var hasRequiredMeridiem$1;

function requireMeridiem$1 () {
	if (hasRequiredMeridiem$1) return meridiem$1;
	hasRequiredMeridiem$1 = 1;

	const DatePart = requireDatepart$1();

	class Meridiem extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours((this.date.getHours() + 12) % 24);
	  }

	  down() {
	    this.up();
	  }

	  toString() {
	    let meridiem = this.date.getHours() > 12 ? 'pm' : 'am';
	    return /\A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
	  }
	}

	meridiem$1 = Meridiem;
	return meridiem$1;
}

var day$1;
var hasRequiredDay$1;

function requireDay$1 () {
	if (hasRequiredDay$1) return day$1;
	hasRequiredDay$1 = 1;

	const DatePart = requireDatepart$1();

	const pos = n => {
	  n = n % 10;
	  return n === 1 ? 'st'
	       : n === 2 ? 'nd'
	       : n === 3 ? 'rd'
	       : 'th';
	};

	class Day extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setDate(this.date.getDate() + 1);
	  }

	  down() {
	    this.date.setDate(this.date.getDate() - 1);
	  }

	  setTo(val) {
	    this.date.setDate(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let date = this.date.getDate();
	    let day = this.date.getDay();
	    return this.token === 'DD' ? String(date).padStart(2, '0')
	         : this.token === 'Do' ? date + pos(date)
	         : this.token === 'd' ? day + 1
	         : this.token === 'ddd' ? this.locales.weekdaysShort[day]
	         : this.token === 'dddd' ? this.locales.weekdays[day]
	         : date;
	  }
	}

	day$1 = Day;
	return day$1;
}

var hours$1;
var hasRequiredHours$1;

function requireHours$1 () {
	if (hasRequiredHours$1) return hours$1;
	hasRequiredHours$1 = 1;

	const DatePart = requireDatepart$1();

	class Hours extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours(this.date.getHours() + 1);
	  }

	  down() {
	    this.date.setHours(this.date.getHours() - 1);
	  }

	  setTo(val) {
	    this.date.setHours(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let hours = this.date.getHours();
	    if (/h/.test(this.token))
	      hours = (hours % 12) || 12;
	    return this.token.length > 1 ? String(hours).padStart(2, '0') : hours;
	  }
	}

	hours$1 = Hours;
	return hours$1;
}

var milliseconds$1;
var hasRequiredMilliseconds$1;

function requireMilliseconds$1 () {
	if (hasRequiredMilliseconds$1) return milliseconds$1;
	hasRequiredMilliseconds$1 = 1;

	const DatePart = requireDatepart$1();

	class Milliseconds extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
	  }

	  down() {
	    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
	  }

	  setTo(val) {
	    this.date.setMilliseconds(parseInt(val.substr(-(this.token.length))));
	  }

	  toString() {
	    return String(this.date.getMilliseconds()).padStart(4, '0')
	                                              .substr(0, this.token.length);
	  }
	}

	milliseconds$1 = Milliseconds;
	return milliseconds$1;
}

var minutes$1;
var hasRequiredMinutes$1;

function requireMinutes$1 () {
	if (hasRequiredMinutes$1) return minutes$1;
	hasRequiredMinutes$1 = 1;

	const DatePart = requireDatepart$1();

	class Minutes extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMinutes(this.date.getMinutes() + 1);
	  }

	  down() {
	    this.date.setMinutes(this.date.getMinutes() - 1);
	  }

	  setTo(val) {
	    this.date.setMinutes(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let m = this.date.getMinutes();
	    return this.token.length > 1 ? String(m).padStart(2, '0') : m;
	  }
	}

	minutes$1 = Minutes;
	return minutes$1;
}

var month$1;
var hasRequiredMonth$1;

function requireMonth$1 () {
	if (hasRequiredMonth$1) return month$1;
	hasRequiredMonth$1 = 1;

	const DatePart = requireDatepart$1();

	class Month extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMonth(this.date.getMonth() + 1);
	  }

	  down() {
	    this.date.setMonth(this.date.getMonth() - 1);
	  }

	  setTo(val) {
	    val = parseInt(val.substr(-2)) - 1;
	    this.date.setMonth(val < 0 ? 0 : val);
	  }

	  toString() {
	    let month = this.date.getMonth();
	    let tl = this.token.length;
	    return tl === 2 ? String(month + 1).padStart(2, '0')
	           : tl === 3 ? this.locales.monthsShort[month]
	             : tl === 4 ? this.locales.months[month]
	               : String(month + 1);
	  }
	}

	month$1 = Month;
	return month$1;
}

var seconds$1;
var hasRequiredSeconds$1;

function requireSeconds$1 () {
	if (hasRequiredSeconds$1) return seconds$1;
	hasRequiredSeconds$1 = 1;

	const DatePart = requireDatepart$1();

	class Seconds extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setSeconds(this.date.getSeconds() + 1);
	  }

	  down() {
	    this.date.setSeconds(this.date.getSeconds() - 1);
	  }

	  setTo(val) {
	    this.date.setSeconds(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let s = this.date.getSeconds();
	    return this.token.length > 1 ? String(s).padStart(2, '0') : s;
	  }
	}

	seconds$1 = Seconds;
	return seconds$1;
}

var year$1;
var hasRequiredYear$1;

function requireYear$1 () {
	if (hasRequiredYear$1) return year$1;
	hasRequiredYear$1 = 1;

	const DatePart = requireDatepart$1();

	class Year extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setFullYear(this.date.getFullYear() + 1);
	  }

	  down() {
	    this.date.setFullYear(this.date.getFullYear() - 1);
	  }

	  setTo(val) {
	    this.date.setFullYear(val.substr(-4));
	  }

	  toString() {
	    let year = String(this.date.getFullYear()).padStart(4, '0');
	    return this.token.length === 2 ? year.substr(-2) : year;
	  }
	}

	year$1 = Year;
	return year$1;
}

var dateparts$1;
var hasRequiredDateparts$1;

function requireDateparts$1 () {
	if (hasRequiredDateparts$1) return dateparts$1;
	hasRequiredDateparts$1 = 1;

	dateparts$1 = {
	  DatePart: requireDatepart$1(),
	  Meridiem: requireMeridiem$1(),
	  Day: requireDay$1(),
	  Hours: requireHours$1(),
	  Milliseconds: requireMilliseconds$1(),
	  Minutes: requireMinutes$1(),
	  Month: requireMonth$1(),
	  Seconds: requireSeconds$1(),
	  Year: requireYear$1(),
	};
	return dateparts$1;
}

var date$1;
var hasRequiredDate$1;

function requireDate$1 () {
	if (hasRequiredDate$1) return date$1;
	hasRequiredDate$1 = 1;

	const color = requireKleur();
	const Prompt = requirePrompt$1();
	const { style, clear, figures } = requireUtil$1();
	const { erase, cursor } = requireSrc();
	const { DatePart, Meridiem, Day, Hours, Milliseconds, Minutes, Month, Seconds, Year } = requireDateparts$1();

	const regex = /\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g;
	const regexGroups = {
	  1: ({token}) => token.replace(/\\(.)/g, '$1'),
	  2: (opts) => new Day(opts), // Day // TODO
	  3: (opts) => new Month(opts), // Month
	  4: (opts) => new Year(opts), // Year
	  5: (opts) => new Meridiem(opts), // AM/PM // TODO (special)
	  6: (opts) => new Hours(opts), // Hours
	  7: (opts) => new Minutes(opts), // Minutes
	  8: (opts) => new Seconds(opts), // Seconds
	  9: (opts) => new Milliseconds(opts), // Fractional seconds
	};

	const dfltLocales = {
	  months: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
	  monthsShort: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
	  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
	  weekdaysShort: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',')
	};


	/**
	 * DatePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Number} [opts.initial] Index of default value
	 * @param {String} [opts.mask] The format mask
	 * @param {object} [opts.locales] The date locales
	 * @param {String} [opts.error] The error message shown on invalid value
	 * @param {Function} [opts.validate] Function to validate the submitted value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class DatePrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = 0;
	    this.typed = '';
	    this.locales = Object.assign(dfltLocales, opts.locales);
	    this._date = opts.initial || new Date();
	    this.errorMsg = opts.error || 'Please Enter A Valid Value';
	    this.validator = opts.validate || (() => true);
	    this.mask = opts.mask || 'YYYY-MM-DD HH:mm:ss';
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  get value() {
	    return this.date
	  }

	  get date() {
	    return this._date;
	  }

	  set date(date) {
	    if (date) this._date.setTime(date.getTime());
	  }

	  set mask(mask) {
	    let result;
	    this.parts = [];
	    while(result = regex.exec(mask)) {
	      let match = result.shift();
	      let idx = result.findIndex(gr => gr != null);
	      this.parts.push(idx in regexGroups
	        ? regexGroups[idx]({ token: result[idx] || match, date: this.date, parts: this.parts, locales: this.locales })
	        : result[idx] || match);
	    }

	    let parts = this.parts.reduce((arr, i) => {
	      if (typeof i === 'string' && typeof arr[arr.length - 1] === 'string')
	        arr[arr.length - 1] += i;
	      else arr.push(i);
	      return arr;
	    }, []);

	    this.parts.splice(0);
	    this.parts.push(...parts);
	    this.reset();
	  }

	  moveCursor(n) {
	    this.typed = '';
	    this.cursor = n;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(this.parts.findIndex(p => p instanceof DatePart));
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  async validate() {
	    let valid = await this.validator(this.value);
	    if (typeof valid === 'string') {
	      this.errorMsg = valid;
	      valid = false;
	    }
	    this.error = !valid;
	  }

	  async submit() {
	    await this.validate();
	    if (this.error) {
	      this.color = 'red';
	      this.fire();
	      this.render();
	      return;
	    }
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  up() {
	    this.typed = '';
	    this.parts[this.cursor].up();
	    this.render();
	  }

	  down() {
	    this.typed = '';
	    this.parts[this.cursor].down();
	    this.render();
	  }

	  left() {
	    let prev = this.parts[this.cursor].prev();
	    if (prev == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(prev));
	    this.render();
	  }

	  right() {
	    let next = this.parts[this.cursor].next();
	    if (next == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(next));
	    this.render();
	  }

	  next() {
	    let next = this.parts[this.cursor].next();
	    this.moveCursor(next
	      ? this.parts.indexOf(next)
	      : this.parts.findIndex((part) => part instanceof DatePart));
	    this.render();
	  }

	  _(c) {
	    if (/\d/.test(c)) {
	      this.typed += c;
	      this.parts[this.cursor].setTo(this.typed);
	      this.render();
	    }
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    // Print prompt
	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.parts.reduce((arr, p, idx) => arr.concat(idx === this.cursor && !this.done ? color.cyan().underline(p.toString()) : p), [])
	          .join('')
	    ].join(' ');

	    // Print error
	    if (this.error) {
	      this.outputText += this.errorMsg.split('\n').reduce(
	          (a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	date$1 = DatePrompt;
	return date$1;
}

var number$1;
var hasRequiredNumber$1;

function requireNumber$1 () {
	if (hasRequiredNumber$1) return number$1;
	hasRequiredNumber$1 = 1;
	const color = requireKleur();
	const Prompt = requirePrompt$1();
	const { cursor, erase } = requireSrc();
	const { style, figures, clear, lines } = requireUtil$1();

	const isNumber = /[0-9]/;
	const isDef = any => any !== undefined;
	const round = (number, precision) => {
	  let factor = Math.pow(10, precision);
	  return Math.round(number * factor) / factor;
	};

	/**
	 * NumberPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {Number} [opts.initial] Default value
	 * @param {Number} [opts.max=+Infinity] Max value
	 * @param {Number} [opts.min=-Infinity] Min value
	 * @param {Boolean} [opts.float=false] Parse input as floats
	 * @param {Number} [opts.round=2] Round floats to x decimals
	 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */
	class NumberPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.msg = opts.message;
	    this.initial = isDef(opts.initial) ? opts.initial : '';
	    this.float = !!opts.float;
	    this.round = opts.round || 2;
	    this.inc = opts.increment || 1;
	    this.min = isDef(opts.min) ? opts.min : -Infinity;
	    this.max = isDef(opts.max) ? opts.max : Infinity;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;
	    this.validator = opts.validate || (() => true);
	    this.color = `cyan`;
	    this.value = ``;
	    this.typed = ``;
	    this.lastHit = 0;
	    this.render();
	  }

	  set value(v) {
	    if (!v && v !== 0) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(`${this.initial}`));
	      this._value = ``;
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(`${round(v, this.round)}`);
	      this._value = round(v, this.round);
	    }
	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  parse(x) {
	    return this.float ? parseFloat(x) : parseInt(x);
	  }

	  valid(c) {
	    return c === `-` || c === `.` && this.float || isNumber.test(c)
	  }

	  reset() {
	    this.typed = ``;
	    this.value = ``;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    let x = this.value;
	    this.value = x !== `` ? x : this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write(`\n`);
	    this.close();
	  }

	  async validate() {
	    let valid = await this.validator(this.value);
	    if (typeof valid === `string`) {
	      this.errorMsg = valid;
	      valid = false;
	    }
	    this.error = !valid;
	  }

	  async submit() {
	    await this.validate();
	    if (this.error) {
	      this.color = `red`;
	      this.fire();
	      this.render();
	      return;
	    }
	    let x = this.value;
	    this.value = x !== `` ? x : this.initial;
	    this.done = true;
	    this.aborted = false;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write(`\n`);
	    this.close();
	  }

	  up() {
	    this.typed = ``;
	    if(this.value === '') {
	      this.value = this.min - this.inc;
	    }
	    if (this.value >= this.max) return this.bell();
	    this.value += this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  down() {
	    this.typed = ``;
	    if(this.value === '') {
	      this.value = this.min + this.inc;
	    }
	    if (this.value <= this.min) return this.bell();
	    this.value -= this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  delete() {
	    let val = this.value.toString();
	    if (val.length === 0) return this.bell();
	    this.value = this.parse((val = val.slice(0, -1))) || ``;
	    if (this.value !== '' && this.value < this.min) {
	      this.value = this.min;
	    }
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  next() {
	    this.value = this.initial;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (!this.valid(c)) return this.bell();

	    const now = Date.now();
	    if (now - this.lastHit > 1000) this.typed = ``; // 1s elapsed
	    this.typed += c;
	    this.lastHit = now;
	    this.color = `cyan`;

	    if (c === `.`) return this.fire();

	    this.value = Math.min(this.parse(this.typed), this.max);
	    if (this.value > this.max) this.value = this.max;
	    if (this.value < this.min) this.value = this.min;
	    this.fire();
	    this.render();
	  }

	  render() {
	    if (this.closed) return;
	    if (!this.firstRender) {
	      if (this.outputError)
	        this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }
	    super.render();
	    this.outputError = '';

	    // Print prompt
	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      !this.done || (!this.done && !this.placeholder)
	          ? color[this.color]().underline(this.rendered) : this.rendered
	    ].join(` `);

	    // Print error
	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`)
	          .reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore);
	  }
	}

	number$1 = NumberPrompt;
	return number$1;
}

var multiselect$1;
var hasRequiredMultiselect$1;

function requireMultiselect$1 () {
	if (hasRequiredMultiselect$1) return multiselect$1;
	hasRequiredMultiselect$1 = 1;

	const color = requireKleur();
	const { cursor } = requireSrc();
	const Prompt = requirePrompt$1();
	const { clear, figures, style, wrap, entriesToDisplay } = requireUtil$1();

	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class MultiselectPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = opts.cursor || 0;
	    this.scrollIndex = opts.cursor || 0;
	    this.hint = opts.hint || '';
	    this.warn = opts.warn || '- This option is disabled -';
	    this.minSelected = opts.min;
	    this.showMinError = false;
	    this.maxChoices = opts.max;
	    this.instructions = opts.instructions;
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string')
	        ch = {title: ch, value: idx};
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        description: ch && ch.description,
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.clear = clear('', this.out.columns);
	    if (!opts.overrideRender) {
	      this.render();
	    }
	  }

	  reset() {
	    this.value.map(v => !v.selected);
	    this.cursor = 0;
	    this.fire();
	    this.render();
	  }

	  selected() {
	    return this.value.filter(v => v.selected);
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    const selected = this.value
	      .filter(e => e.selected);
	    if (this.minSelected && selected.length < this.minSelected) {
	      this.showMinError = true;
	      this.render();
	    } else {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length - 1;
	    this.render();
	  }
	  next() {
	    this.cursor = (this.cursor + 1) % this.value.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.value.length - 1;
	    } else {
	      this.cursor--;
	    }
	    this.render();
	  }

	  down() {
	    if (this.cursor === this.value.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }
	    this.render();
	  }

	  left() {
	    this.value[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.value[this.cursor].selected = true;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.value[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  toggleAll() {
	    if (this.maxChoices !== undefined || this.value[this.cursor].disabled) {
	      return this.bell();
	    }

	    const newSelected = !this.value[this.cursor].selected;
	    this.value.filter(v => !v.disabled).forEach(v => v.selected = newSelected);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else if (c === 'a') {
	      this.toggleAll();
	    } else {
	      return this.bell();
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }
	      return '\nInstructions:\n'
	        + `    ${figures.arrowUp}/${figures.arrowDown}: Highlight option\n`
	        + `    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection\n`
	        + (this.maxChoices === undefined ? `    a: Toggle all\n` : '')
	        + `    enter/return: Complete answer`;
	    }
	    return '';
	  }

	  renderOption(cursor, v, i, arrowIndicator) {
	    const prefix = (v.selected ? color.green(figures.radioOn) : figures.radioOff) + ' ' + arrowIndicator + ' ';
	    let title, desc;

	    if (v.disabled) {
	      title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	    } else {
	      title = cursor === i ? color.cyan().underline(v.title) : v.title;
	      if (cursor === i && v.description) {
	        desc = ` - ${v.description}`;
	        if (prefix.length + title.length + desc.length >= this.out.columns
	          || v.description.split(/\r?\n/).length > 1) {
	          desc = '\n' + wrap(v.description, { margin: prefix.length, width: this.out.columns });
	        }
	      }
	    }

	    return prefix + title + color.gray(desc || '');
	  }

	  // shared with autocompleteMultiselect
	  paginateOptions(options) {
	    if (options.length === 0) {
	      return color.red('No matches for this query.');
	    }

	    let { startIndex, endIndex } = entriesToDisplay(this.cursor, options.length, this.optionsPerPage);
	    let prefix, styledOptions = [];

	    for (let i = startIndex; i < endIndex; i++) {
	      if (i === startIndex && startIndex > 0) {
	        prefix = figures.arrowUp;
	      } else if (i === endIndex - 1 && endIndex < options.length) {
	        prefix = figures.arrowDown;
	      } else {
	        prefix = ' ';
	      }
	      styledOptions.push(this.renderOption(this.cursor, options[i], i, prefix));
	    }

	    return '\n' + styledOptions.join('\n');
	  }

	  // shared with autocomleteMultiselect
	  renderOptions(options) {
	    if (!this.done) {
	      return this.paginateOptions(options);
	    }
	    return '';
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value
	        .filter(e => e.selected)
	        .map(v => v.title)
	        .join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions()];

	    if (this.value[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }
	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render();

	    // print prompt
	    let prompt = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.renderDoneOrInstructions()
	    ].join(' ');
	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }
	    prompt += this.renderOptions(this.value);

	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }
	}

	multiselect$1 = MultiselectPrompt;
	return multiselect$1;
}

var autocomplete$1;
var hasRequiredAutocomplete$1;

function requireAutocomplete$1 () {
	if (hasRequiredAutocomplete$1) return autocomplete$1;
	hasRequiredAutocomplete$1 = 1;

	const color = requireKleur();
	const Prompt = requirePrompt$1();
	const { erase, cursor } = requireSrc();
	const { style, clear, figures, wrap, entriesToDisplay } = requireUtil$1();

	const getVal = (arr, i) => arr[i] && (arr[i].value || arr[i].title || arr[i]);
	const getTitle = (arr, i) => arr[i] && (arr[i].title || arr[i].value || arr[i]);
	const getIndex = (arr, valOrTitle) => {
	  const index = arr.findIndex(el => el.value === valOrTitle || el.title === valOrTitle);
	  return index > -1 ? index : undefined;
	};

	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of auto-complete choices objects
	 * @param {Function} [opts.suggest] Filter function. Defaults to sort by title
	 * @param {Number} [opts.limit=10] Max number of results to show
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.fallback] Fallback message - initial to default value
	 * @param {String} [opts.initial] Index of the default value
	 * @param {Boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.noMatches] The no matches found label
	 */
	class AutocompletePrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.suggest = opts.suggest;
	    this.choices = opts.choices;
	    this.initial = typeof opts.initial === 'number'
	      ? opts.initial
	      : getIndex(opts.choices, opts.initial);
	    this.select = this.initial || opts.cursor || 0;
	    this.i18n = { noMatches: opts.noMatches || 'no matches found' };
	    this.fallback = opts.fallback || this.initial;
	    this.clearFirst = opts.clearFirst || false;
	    this.suggestions = [];
	    this.input = '';
	    this.limit = opts.limit || 10;
	    this.cursor = 0;
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.render = this.render.bind(this);
	    this.complete = this.complete.bind(this);
	    this.clear = clear('', this.out.columns);
	    this.complete(this.render);
	    this.render();
	  }

	  set fallback(fb) {
	    this._fb = Number.isSafeInteger(parseInt(fb)) ? parseInt(fb) : fb;
	  }

	  get fallback() {
	    let choice;
	    if (typeof this._fb === 'number')
	      choice = this.choices[this._fb];
	    else if (typeof this._fb === 'string')
	      choice = { title: this._fb };
	    return choice || this._fb || { title: this.i18n.noMatches };
	  }

	  moveSelect(i) {
	    this.select = i;
	    if (this.suggestions.length > 0)
	      this.value = getVal(this.suggestions, i);
	    else this.value = this.fallback.value;
	    this.fire();
	  }

	  async complete(cb) {
	    const p = (this.completing = this.suggest(this.input, this.choices));
	    const suggestions = await p;

	    if (this.completing !== p) return;
	    this.suggestions = suggestions
	      .map((s, i, arr) => ({ title: getTitle(arr, i), value: getVal(arr, i), description: s.description }));
	    this.completing = false;
	    const l = Math.max(suggestions.length - 1, 0);
	    this.moveSelect(Math.min(l, this.select));

	    cb && cb();
	  }

	  reset() {
	    this.input = '';
	    this.complete(() => {
	      this.moveSelect(this.initial !== void 0 ? this.initial : 0);
	      this.render();
	    });
	    this.render();
	  }

	  exit() {
	    if (this.clearFirst && this.input.length > 0) {
	      this.reset();
	    } else {
	      this.done = this.exited = true; 
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${c}${s2}`;
	    this.cursor = s1.length+1;
	    this.complete(this.render);
	    this.render();
	  }

	  delete() {
	    if (this.cursor === 0) return this.bell();
	    let s1 = this.input.slice(0, this.cursor-1);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.cursor = this.cursor-1;
	    this.render();
	  }

	  deleteForward() {
	    if(this.cursor*this.scale >= this.rendered.length) return this.bell();
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor+1);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.render();
	  }

	  first() {
	    this.moveSelect(0);
	    this.render();
	  }

	  last() {
	    this.moveSelect(this.suggestions.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.select === 0) {
	      this.moveSelect(this.suggestions.length - 1);
	    } else {
	      this.moveSelect(this.select - 1);
	    }
	    this.render();
	  }

	  down() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else {
	      this.moveSelect(this.select + 1);
	    }
	    this.render();
	  }

	  next() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else this.moveSelect(this.select + 1);
	    this.render();
	  }

	  nextPage() {
	    this.moveSelect(Math.min(this.select + this.limit, this.suggestions.length - 1));
	    this.render();
	  }

	  prevPage() {
	    this.moveSelect(Math.max(this.select - this.limit, 0));
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0) return this.bell();
	    this.cursor = this.cursor-1;
	    this.render();
	  }

	  right() {
	    if (this.cursor*this.scale >= this.rendered.length) return this.bell();
	    this.cursor = this.cursor+1;
	    this.render();
	  }

	  renderOption(v, hovered, isStart, isEnd) {
	    let desc;
	    let prefix = isStart ? figures.arrowUp : isEnd ? figures.arrowDown : ' ';
	    let title = hovered ? color.cyan().underline(v.title) : v.title;
	    prefix = (hovered ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;
	    if (v.description) {
	      desc = ` - ${v.description}`;
	      if (prefix.length + title.length + desc.length >= this.out.columns
	        || v.description.split(/\r?\n/).length > 1) {
	        desc = '\n' + wrap(v.description, { margin: 3, width: this.out.columns });
	      }
	    }
	    return prefix + ' ' + title + color.gray(desc || '');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let { startIndex, endIndex } = entriesToDisplay(this.select, this.choices.length, this.limit);

	    this.outputText = [
	      style.symbol(this.done, this.aborted, this.exited),
	      color.bold(this.msg),
	      style.delimiter(this.completing),
	      this.done && this.suggestions[this.select]
	        ? this.suggestions[this.select].title
	        : this.rendered = this.transform.render(this.input)
	    ].join(' ');

	    if (!this.done) {
	      const suggestions = this.suggestions
	        .slice(startIndex, endIndex)
	        .map((item, i) =>  this.renderOption(item,
	          this.select === i + startIndex,
	          i === 0 && startIndex > 0,
	          i + startIndex === endIndex - 1 && endIndex < this.choices.length))
	        .join('\n');
	      this.outputText += `\n` + (suggestions || color.gray(this.fallback.title));
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	autocomplete$1 = AutocompletePrompt;
	return autocomplete$1;
}

var autocompleteMultiselect$1;
var hasRequiredAutocompleteMultiselect$1;

function requireAutocompleteMultiselect$1 () {
	if (hasRequiredAutocompleteMultiselect$1) return autocompleteMultiselect$1;
	hasRequiredAutocompleteMultiselect$1 = 1;

	const color = requireKleur();
	const { cursor } = requireSrc();
	const MultiselectPrompt = requireMultiselect$1();
	const { clear, style, figures } = requireUtil$1();
	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class AutocompleteMultiselectPrompt extends MultiselectPrompt {
	  constructor(opts={}) {
	    opts.overrideRender = true;
	    super(opts);
	    this.inputValue = '';
	    this.clear = clear('', this.out.columns);
	    this.filteredOptions = this.value;
	    this.render();
	  }

	  last() {
	    this.cursor = this.filteredOptions.length - 1;
	    this.render();
	  }
	  next() {
	    this.cursor = (this.cursor + 1) % this.filteredOptions.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.filteredOptions.length - 1;
	    } else {
	      this.cursor--;
	    }
	    this.render();
	  }

	  down() {
	    if (this.cursor === this.filteredOptions.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }
	    this.render();
	  }

	  left() {
	    this.filteredOptions[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.filteredOptions[this.cursor].selected = true;
	    this.render();
	  }

	  delete() {
	    if (this.inputValue.length) {
	      this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1);
	      this.updateFilteredOptions();
	    }
	  }

	  updateFilteredOptions() {
	    const currentHighlight = this.filteredOptions[this.cursor];
	    this.filteredOptions = this.value
	      .filter(v => {
	        if (this.inputValue) {
	          if (typeof v.title === 'string') {
	            if (v.title.toLowerCase().includes(this.inputValue.toLowerCase())) {
	              return true;
	            }
	          }
	          if (typeof v.value === 'string') {
	            if (v.value.toLowerCase().includes(this.inputValue.toLowerCase())) {
	              return true;
	            }
	          }
	          return false;
	        }
	        return true;
	      });
	    const newHighlightIndex = this.filteredOptions.findIndex(v => v === currentHighlight);
	    this.cursor = newHighlightIndex < 0 ? 0 : newHighlightIndex;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.filteredOptions[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  handleInputChange(c) {
	    this.inputValue = this.inputValue + c;
	    this.updateFilteredOptions();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else {
	      this.handleInputChange(c);
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }
	      return `
Instructions:
    ${figures.arrowUp}/${figures.arrowDown}: Highlight option
    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection
    [a,b,c]/delete: Filter choices
    enter/return: Complete answer
`;
	    }
	    return '';
	  }

	  renderCurrentInput() {
	    return `
Filtered results for: ${this.inputValue ? this.inputValue : color.gray('Enter something to filter')}\n`;
	  }

	  renderOption(cursor, v, i) {
	    let title;
	    if (v.disabled) title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	    else title = cursor === i ? color.cyan().underline(v.title) : v.title;
	    return (v.selected ? color.green(figures.radioOn) : figures.radioOff) + '  ' + title
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value
	        .filter(e => e.selected)
	        .map(v => v.title)
	        .join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions(), this.renderCurrentInput()];

	    if (this.filteredOptions.length && this.filteredOptions[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }
	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render();

	    // print prompt

	    let prompt = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.renderDoneOrInstructions()
	    ].join(' ');

	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }
	    prompt += this.renderOptions(this.filteredOptions);

	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }
	}

	autocompleteMultiselect$1 = AutocompleteMultiselectPrompt;
	return autocompleteMultiselect$1;
}

var confirm$1;
var hasRequiredConfirm$1;

function requireConfirm$1 () {
	if (hasRequiredConfirm$1) return confirm$1;
	hasRequiredConfirm$1 = 1;
	const color = requireKleur();
	const Prompt = requirePrompt$1();
	const { style, clear } = requireUtil$1();
	const { erase, cursor } = requireSrc();

	/**
	 * ConfirmPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial] Default value (true/false)
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.yes] The "Yes" label
	 * @param {String} [opts.yesOption] The "Yes" option when choosing between yes/no
	 * @param {String} [opts.no] The "No" label
	 * @param {String} [opts.noOption] The "No" option when choosing between yes/no
	 */
	class ConfirmPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = opts.initial;
	    this.initialValue = !!opts.initial;
	    this.yesMsg = opts.yes || 'yes';
	    this.yesOption = opts.yesOption || '(Y/n)';
	    this.noMsg = opts.no || 'no';
	    this.noOption = opts.noOption || '(y/N)';
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.value = this.value || false;
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    if (c.toLowerCase() === 'y') {
	      this.value = true;
	      return this.submit();
	    }
	    if (c.toLowerCase() === 'n') {
	      this.value = false;
	      return this.submit();
	    }
	    return this.bell();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      this.done ? (this.value ? this.yesMsg : this.noMsg)
	          : color.gray(this.initialValue ? this.yesOption : this.noOption)
	    ].join(' ');

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	confirm$1 = ConfirmPrompt;
	return confirm$1;
}

var elements$1;
var hasRequiredElements$1;

function requireElements$1 () {
	if (hasRequiredElements$1) return elements$1;
	hasRequiredElements$1 = 1;

	elements$1 = {
	  TextPrompt: requireText$1(),
	  SelectPrompt: requireSelect$1(),
	  TogglePrompt: requireToggle$1(),
	  DatePrompt: requireDate$1(),
	  NumberPrompt: requireNumber$1(),
	  MultiselectPrompt: requireMultiselect$1(),
	  AutocompletePrompt: requireAutocomplete$1(),
	  AutocompleteMultiselectPrompt: requireAutocompleteMultiselect$1(),
	  ConfirmPrompt: requireConfirm$1()
	};
	return elements$1;
}

var hasRequiredPrompts$1;

function requirePrompts$1 () {
	if (hasRequiredPrompts$1) return prompts$2;
	hasRequiredPrompts$1 = 1;
	(function (exports) {
		const $ = exports;
		const el = requireElements$1();
		const noop = v => v;

		function toPrompt(type, args, opts={}) {
		  return new Promise((res, rej) => {
		    const p = new el[type](args);
		    const onAbort = opts.onAbort || noop;
		    const onSubmit = opts.onSubmit || noop;
		    const onExit = opts.onExit || noop;
		    p.on('state', args.onState || noop);
		    p.on('submit', x => res(onSubmit(x)));
		    p.on('exit', x => res(onExit(x)));
		    p.on('abort', x => rej(onAbort(x)));
		  });
		}

		/**
		 * Text prompt
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.text = args => toPrompt('TextPrompt', args);

		/**
		 * Password prompt with masked input
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.password = args => {
		  args.style = 'password';
		  return $.text(args);
		};

		/**
		 * Prompt where input is invisible, like sudo
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.invisible = args => {
		  args.style = 'invisible';
		  return $.text(args);
		};

		/**
		 * Number prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.number = args => toPrompt('NumberPrompt', args);

		/**
		 * Date prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.date = args => toPrompt('DatePrompt', args);

		/**
		 * Classic yes/no prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.confirm = args => toPrompt('ConfirmPrompt', args);

		/**
		 * List prompt, split intput string by `seperator`
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {string} [args.separator] String separator
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input, in form of an `Array`
		 */
		$.list = args => {
		  const sep = args.separator || ',';
		  return toPrompt('TextPrompt', args, {
		    onSubmit: str => str.split(sep).map(s => s.trim())
		  });
		};

		/**
		 * Toggle/switch prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {string} [args.active="on"] Text for `active` state
		 * @param {string} [args.inactive="off"] Text for `inactive` state
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.toggle = args => toPrompt('TogglePrompt', args);

		/**
		 * Interactive select prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
		 * @param {number} [args.initial] Index of default value
		 * @param {String} [args.hint] Hint to display
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.select = args => toPrompt('SelectPrompt', args);

		/**
		 * Interactive multi-select / autocompleteMultiselect prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
		 * @param {number} [args.max] Max select
		 * @param {string} [args.hint] Hint to display user
		 * @param {Number} [args.cursor=0] Cursor start position
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.multiselect = args => {
		  args.choices = [].concat(args.choices || []);
		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);
		  return toPrompt('MultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		$.autocompleteMultiselect = args => {
		  args.choices = [].concat(args.choices || []);
		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);
		  return toPrompt('AutocompleteMultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		const byTitle = (input, choices) => Promise.resolve(
		  choices.filter(item => item.title.slice(0, input.length).toLowerCase() === input.toLowerCase())
		);

		/**
		 * Interactive auto-complete prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of auto-complete choices objects `[{ title, value }, ...]`
		 * @param {Function} [args.suggest] Function to filter results based on user input. Defaults to sort by `title`
		 * @param {number} [args.limit=10] Max number of results to show
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {String} [args.initial] Index of the default value
		 * @param {boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
		 * @param {String} [args.fallback] Fallback message - defaults to initial value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.autocomplete = args => {
		  args.suggest = args.suggest || byTitle;
		  args.choices = [].concat(args.choices || []);
		  return toPrompt('AutocompletePrompt', args);
		}; 
	} (prompts$2));
	return prompts$2;
}

var lib;
var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;

	const prompts = requirePrompts$1();

	const passOn = ['suggest', 'format', 'onState', 'validate', 'onRender', 'type'];
	const noop = () => {};

	/**
	 * Prompt for a series of questions
	 * @param {Array|Object} questions Single question object or Array of question objects
	 * @param {Function} [onSubmit] Callback function called on prompt submit
	 * @param {Function} [onCancel] Callback function called on cancel/abort
	 * @returns {Object} Object with values from user input
	 */
	async function prompt(questions=[], { onSubmit=noop, onCancel=noop }={}) {
	  const answers = {};
	  const override = prompt._override || {};
	  questions = [].concat(questions);
	  let answer, question, quit, name, type, lastPrompt;

	  const getFormattedAnswer = async (question, answer, skipValidation = false) => {
	    if (!skipValidation && question.validate && question.validate(answer) !== true) {
	      return;
	    }
	    return question.format ? await question.format(answer, answers) : answer
	  };

	  for (question of questions) {
	    ({ name, type } = question);

	    // evaluate type first and skip if type is a falsy value
	    if (typeof type === 'function') {
	      type = await type(answer, { ...answers }, question);
	      question['type'] = type;
	    }
	    if (!type) continue;

	    // if property is a function, invoke it unless it's a special function
	    for (let key in question) {
	      if (passOn.includes(key)) continue;
	      let value = question[key];
	      question[key] = typeof value === 'function' ? await value(answer, { ...answers }, lastPrompt) : value;
	    }

	    lastPrompt = question;

	    if (typeof question.message !== 'string') {
	      throw new Error('prompt message is required');
	    }

	    // update vars in case they changed
	    ({ name, type } = question);

	    if (prompts[type] === void 0) {
	      throw new Error(`prompt type (${type}) is not defined`);
	    }

	    if (override[question.name] !== undefined) {
	      answer = await getFormattedAnswer(question, override[question.name]);
	      if (answer !== undefined) {
	        answers[name] = answer;
	        continue;
	      }
	    }

	    try {
	      // Get the injected answer if there is one or prompt the user
	      answer = prompt._injected ? getInjectedAnswer(prompt._injected, question.initial) : await prompts[type](question);
	      answers[name] = answer = await getFormattedAnswer(question, answer, true);
	      quit = await onSubmit(question, answer, answers);
	    } catch (err) {
	      quit = !(await onCancel(question, answers));
	    }

	    if (quit) return answers;
	  }

	  return answers;
	}

	function getInjectedAnswer(injected, deafultValue) {
	  const answer = injected.shift();
	    if (answer instanceof Error) {
	      throw answer;
	    }

	    return (answer === undefined) ? deafultValue : answer;
	}

	function inject(answers) {
	  prompt._injected = (prompt._injected || []).concat(answers);
	}

	function override(answers) {
	  prompt._override = Object.assign({}, answers);
	}

	lib = Object.assign(prompt, { prompt, prompts, inject, override });
	return lib;
}

var prompts$1 = {};

var action;
var hasRequiredAction;

function requireAction () {
	if (hasRequiredAction) return action;
	hasRequiredAction = 1;

	action = (key, isSelect) => {
	  if (key.meta && key.name !== 'escape') return;

	  if (key.ctrl) {
	    if (key.name === 'a') return 'first';
	    if (key.name === 'c') return 'abort';
	    if (key.name === 'd') return 'abort';
	    if (key.name === 'e') return 'last';
	    if (key.name === 'g') return 'reset';
	  }

	  if (isSelect) {
	    if (key.name === 'j') return 'down';
	    if (key.name === 'k') return 'up';
	  }

	  if (key.name === 'return') return 'submit';
	  if (key.name === 'enter') return 'submit'; // ctrl + J

	  if (key.name === 'backspace') return 'delete';
	  if (key.name === 'delete') return 'deleteForward';
	  if (key.name === 'abort') return 'abort';
	  if (key.name === 'escape') return 'exit';
	  if (key.name === 'tab') return 'next';
	  if (key.name === 'pagedown') return 'nextPage';
	  if (key.name === 'pageup') return 'prevPage'; // TODO create home() in prompt types (e.g. TextPrompt)

	  if (key.name === 'home') return 'home'; // TODO create end() in prompt types (e.g. TextPrompt)

	  if (key.name === 'end') return 'end';
	  if (key.name === 'up') return 'up';
	  if (key.name === 'down') return 'down';
	  if (key.name === 'right') return 'right';
	  if (key.name === 'left') return 'left';
	  return false;
	};
	return action;
}

var strip;
var hasRequiredStrip;

function requireStrip () {
	if (hasRequiredStrip) return strip;
	hasRequiredStrip = 1;

	strip = str => {
	  const pattern = ['[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)', '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'].join('|');
	  const RGX = new RegExp(pattern, 'g');
	  return typeof str === 'string' ? str.replace(RGX, '') : str;
	};
	return strip;
}

var clear;
var hasRequiredClear;

function requireClear () {
	if (hasRequiredClear) return clear;
	hasRequiredClear = 1;

	function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

	const strip = requireStrip();

	const _require = requireSrc(),
	      erase = _require.erase,
	      cursor = _require.cursor;

	const width = str => [...strip(str)].length;
	/**
	 * @param {string} prompt
	 * @param {number} perLine
	 */


	clear = function (prompt, perLine) {
	  if (!perLine) return erase.line + cursor.to(0);
	  let rows = 0;
	  const lines = prompt.split(/\r?\n/);

	  var _iterator = _createForOfIteratorHelper(lines),
	      _step;

	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      let line = _step.value;
	      rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine);
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }

	  return erase.lines(rows);
	};
	return clear;
}

var figures_1;
var hasRequiredFigures;

function requireFigures () {
	if (hasRequiredFigures) return figures_1;
	hasRequiredFigures = 1;

	const main = {
	  arrowUp: '↑',
	  arrowDown: '↓',
	  arrowLeft: '←',
	  arrowRight: '→',
	  radioOn: '◉',
	  radioOff: '◯',
	  tick: '✔',
	  cross: '✖',
	  ellipsis: '…',
	  pointerSmall: '›',
	  line: '─',
	  pointer: '❯'
	};
	const win = {
	  arrowUp: main.arrowUp,
	  arrowDown: main.arrowDown,
	  arrowLeft: main.arrowLeft,
	  arrowRight: main.arrowRight,
	  radioOn: '(*)',
	  radioOff: '( )',
	  tick: '√',
	  cross: '×',
	  ellipsis: '...',
	  pointerSmall: '»',
	  line: '─',
	  pointer: '>'
	};
	const figures = process.platform === 'win32' ? win : main;
	figures_1 = figures;
	return figures_1;
}

var style;
var hasRequiredStyle;

function requireStyle () {
	if (hasRequiredStyle) return style;
	hasRequiredStyle = 1;

	const c = requireKleur();

	const figures = requireFigures(); // rendering user input.


	const styles = Object.freeze({
	  password: {
	    scale: 1,
	    render: input => '*'.repeat(input.length)
	  },
	  emoji: {
	    scale: 2,
	    render: input => '😃'.repeat(input.length)
	  },
	  invisible: {
	    scale: 0,
	    render: input => ''
	  },
	  default: {
	    scale: 1,
	    render: input => `${input}`
	  }
	});

	const render = type => styles[type] || styles.default; // icon to signalize a prompt.


	const symbols = Object.freeze({
	  aborted: c.red(figures.cross),
	  done: c.green(figures.tick),
	  exited: c.yellow(figures.cross),
	  default: c.cyan('?')
	});

	const symbol = (done, aborted, exited) => aborted ? symbols.aborted : exited ? symbols.exited : done ? symbols.done : symbols.default; // between the question and the user's input.


	const delimiter = completing => c.gray(completing ? figures.ellipsis : figures.pointerSmall);

	const item = (expandable, expanded) => c.gray(expandable ? expanded ? figures.pointerSmall : '+' : figures.line);

	style = {
	  styles,
	  render,
	  symbols,
	  symbol,
	  delimiter,
	  item
	};
	return style;
}

var lines;
var hasRequiredLines;

function requireLines () {
	if (hasRequiredLines) return lines;
	hasRequiredLines = 1;

	const strip = requireStrip();
	/**
	 * @param {string} msg
	 * @param {number} perLine
	 */


	lines = function (msg, perLine) {
	  let lines = String(strip(msg) || '').split(/\r?\n/);
	  if (!perLine) return lines.length;
	  return lines.map(l => Math.ceil(l.length / perLine)).reduce((a, b) => a + b);
	};
	return lines;
}

var wrap;
var hasRequiredWrap;

function requireWrap () {
	if (hasRequiredWrap) return wrap;
	hasRequiredWrap = 1;
	/**
	 * @param {string} msg The message to wrap
	 * @param {object} opts
	 * @param {number|string} [opts.margin] Left margin
	 * @param {number} opts.width Maximum characters per line including the margin
	 */

	wrap = (msg, opts = {}) => {
	  const tab = Number.isSafeInteger(parseInt(opts.margin)) ? new Array(parseInt(opts.margin)).fill(' ').join('') : opts.margin || '';
	  const width = opts.width;
	  return (msg || '').split(/\r?\n/g).map(line => line.split(/\s+/g).reduce((arr, w) => {
	    if (w.length + tab.length >= width || arr[arr.length - 1].length + w.length + 1 < width) arr[arr.length - 1] += ` ${w}`;else arr.push(`${tab}${w}`);
	    return arr;
	  }, [tab]).join('\n')).join('\n');
	};
	return wrap;
}

var entriesToDisplay;
var hasRequiredEntriesToDisplay;

function requireEntriesToDisplay () {
	if (hasRequiredEntriesToDisplay) return entriesToDisplay;
	hasRequiredEntriesToDisplay = 1;
	/**
	 * Determine what entries should be displayed on the screen, based on the
	 * currently selected index and the maximum visible. Used in list-based
	 * prompts like `select` and `multiselect`.
	 *
	 * @param {number} cursor the currently selected entry
	 * @param {number} total the total entries available to display
	 * @param {number} [maxVisible] the number of entries that can be displayed
	 */

	entriesToDisplay = (cursor, total, maxVisible) => {
	  maxVisible = maxVisible || total;
	  let startIndex = Math.min(total - maxVisible, cursor - Math.floor(maxVisible / 2));
	  if (startIndex < 0) startIndex = 0;
	  let endIndex = Math.min(startIndex + maxVisible, total);
	  return {
	    startIndex,
	    endIndex
	  };
	};
	return entriesToDisplay;
}

var util;
var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util;
	hasRequiredUtil = 1;

	util = {
	  action: requireAction(),
	  clear: requireClear(),
	  style: requireStyle(),
	  strip: requireStrip(),
	  figures: requireFigures(),
	  lines: requireLines(),
	  wrap: requireWrap(),
	  entriesToDisplay: requireEntriesToDisplay()
	};
	return util;
}

var prompt$1;
var hasRequiredPrompt;

function requirePrompt () {
	if (hasRequiredPrompt) return prompt$1;
	hasRequiredPrompt = 1;

	const readline = require$$0$4;

	const _require = requireUtil(),
	      action = _require.action;

	const EventEmitter = require$$2;

	const _require2 = requireSrc(),
	      beep = _require2.beep,
	      cursor = _require2.cursor;

	const color = requireKleur();
	/**
	 * Base prompt skeleton
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class Prompt extends EventEmitter {
	  constructor(opts = {}) {
	    super();
	    this.firstRender = true;
	    this.in = opts.stdin || process.stdin;
	    this.out = opts.stdout || process.stdout;

	    this.onRender = (opts.onRender || (() => void 0)).bind(this);

	    const rl = readline.createInterface({
	      input: this.in,
	      escapeCodeTimeout: 50
	    });
	    readline.emitKeypressEvents(this.in, rl);
	    if (this.in.isTTY) this.in.setRawMode(true);
	    const isSelect = ['SelectPrompt', 'MultiselectPrompt'].indexOf(this.constructor.name) > -1;

	    const keypress = (str, key) => {
	      let a = action(key, isSelect);

	      if (a === false) {
	        this._ && this._(str, key);
	      } else if (typeof this[a] === 'function') {
	        this[a](key);
	      } else {
	        this.bell();
	      }
	    };

	    this.close = () => {
	      this.out.write(cursor.show);
	      this.in.removeListener('keypress', keypress);
	      if (this.in.isTTY) this.in.setRawMode(false);
	      rl.close();
	      this.emit(this.aborted ? 'abort' : this.exited ? 'exit' : 'submit', this.value);
	      this.closed = true;
	    };

	    this.in.on('keypress', keypress);
	  }

	  fire() {
	    this.emit('state', {
	      value: this.value,
	      aborted: !!this.aborted,
	      exited: !!this.exited
	    });
	  }

	  bell() {
	    this.out.write(beep);
	  }

	  render() {
	    this.onRender(color);
	    if (this.firstRender) this.firstRender = false;
	  }

	}

	prompt$1 = Prompt;
	return prompt$1;
}

var text;
var hasRequiredText;

function requireText () {
	if (hasRequiredText) return text;
	hasRequiredText = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt();

	const _require = requireSrc(),
	      erase = _require.erase,
	      cursor = _require.cursor;

	const _require2 = requireUtil(),
	      style = _require2.style,
	      clear = _require2.clear,
	      lines = _require2.lines,
	      figures = _require2.figures;
	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.initial] Default value
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */


	class TextPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.msg = opts.message;
	    this.initial = opts.initial || ``;

	    this.validator = opts.validate || (() => true);

	    this.value = ``;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.clear = clear(``, this.out.columns);
	    this.render();
	  }

	  set value(v) {
	    if (!v && this.initial) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(this.initial));
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(v);
	    }

	    this._value = v;
	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  reset() {
	    this.value = ``;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.value = this.value || this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.red = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  validate() {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      let valid = yield _this.validator(_this.value);

	      if (typeof valid === `string`) {
	        _this.errorMsg = valid;
	        valid = false;
	      }

	      _this.error = !valid;
	    })();
	  }

	  submit() {
	    var _this2 = this;

	    return _asyncToGenerator(function* () {
	      _this2.value = _this2.value || _this2.initial;
	      _this2.cursorOffset = 0;
	      _this2.cursor = _this2.rendered.length;
	      yield _this2.validate();

	      if (_this2.error) {
	        _this2.red = true;

	        _this2.fire();

	        _this2.render();

	        return;
	      }

	      _this2.done = true;
	      _this2.aborted = false;

	      _this2.fire();

	      _this2.render();

	      _this2.out.write('\n');

	      _this2.close();
	    })();
	  }

	  next() {
	    if (!this.placeholder) return this.bell();
	    this.value = this.initial;
	    this.cursor = this.rendered.length;
	    this.fire();
	    this.render();
	  }

	  moveCursor(n) {
	    if (this.placeholder) return;
	    this.cursor = this.cursor + n;
	    this.cursorOffset += n;
	  }

	  _(c, key) {
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${c}${s2}`;
	    this.red = false;
	    this.cursor = this.placeholder ? 0 : s1.length + 1;
	    this.render();
	  }

	  delete() {
	    if (this.isCursorAtStart()) return this.bell();
	    let s1 = this.value.slice(0, this.cursor - 1);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${s2}`;
	    this.red = false;

	    if (this.isCursorAtStart()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	      this.moveCursor(-1);
	    }

	    this.render();
	  }

	  deleteForward() {
	    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor + 1);
	    this.value = `${s1}${s2}`;
	    this.red = false;

	    if (this.isCursorAtEnd()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	    }

	    this.render();
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length;
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0 || this.placeholder) return this.bell();
	    this.moveCursor(-1);
	    this.render();
	  }

	  right() {
	    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    this.moveCursor(1);
	    this.render();
	  }

	  isCursorAtStart() {
	    return this.cursor === 0 || this.placeholder && this.cursor === 1;
	  }

	  isCursorAtEnd() {
	    return this.cursor === this.rendered.length || this.placeholder && this.cursor === this.rendered.length + 1;
	  }

	  render() {
	    if (this.closed) return;

	    if (!this.firstRender) {
	      if (this.outputError) this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }

	    super.render();
	    this.outputError = '';
	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.red ? color.red(this.rendered) : this.rendered].join(` `);

	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`).reduce((a, l, i) => a + `\n${i ? ' ' : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore + cursor.move(this.cursorOffset, 0));
	  }

	}

	text = TextPrompt;
	return text;
}

var select;
var hasRequiredSelect;

function requireSelect () {
	if (hasRequiredSelect) return select;
	hasRequiredSelect = 1;

	const color = requireKleur();

	const Prompt = requirePrompt();

	const _require = requireUtil(),
	      style = _require.style,
	      clear = _require.clear,
	      figures = _require.figures,
	      wrap = _require.wrap,
	      entriesToDisplay = _require.entriesToDisplay;

	const _require2 = requireSrc(),
	      cursor = _require2.cursor;
	/**
	 * SelectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {Number} [opts.initial] Index of default value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 */


	class SelectPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.hint = opts.hint || '- Use arrow-keys. Return to submit.';
	    this.warn = opts.warn || '- This option is disabled';
	    this.cursor = opts.initial || 0;
	    this.choices = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string') ch = {
	        title: ch,
	        value: idx
	      };
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        description: ch && ch.description,
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = (this.choices[this.cursor] || {}).value;
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  moveCursor(n) {
	    this.cursor = n;
	    this.value = this.choices[n].value;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(0);
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    if (!this.selection.disabled) {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    } else this.bell();
	  }

	  first() {
	    this.moveCursor(0);
	    this.render();
	  }

	  last() {
	    this.moveCursor(this.choices.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.moveCursor(this.choices.length - 1);
	    } else {
	      this.moveCursor(this.cursor - 1);
	    }

	    this.render();
	  }

	  down() {
	    if (this.cursor === this.choices.length - 1) {
	      this.moveCursor(0);
	    } else {
	      this.moveCursor(this.cursor + 1);
	    }

	    this.render();
	  }

	  next() {
	    this.moveCursor((this.cursor + 1) % this.choices.length);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') return this.submit();
	  }

	  get selection() {
	    return this.choices[this.cursor];
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let _entriesToDisplay = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage),
	        startIndex = _entriesToDisplay.startIndex,
	        endIndex = _entriesToDisplay.endIndex; // Print prompt


	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.done ? this.selection.title : this.selection.disabled ? color.yellow(this.warn) : color.gray(this.hint)].join(' '); // Print choices

	    if (!this.done) {
	      this.outputText += '\n';

	      for (let i = startIndex; i < endIndex; i++) {
	        let title,
	            prefix,
	            desc = '',
	            v = this.choices[i]; // Determine whether to display "more choices" indicators

	        if (i === startIndex && startIndex > 0) {
	          prefix = figures.arrowUp;
	        } else if (i === endIndex - 1 && endIndex < this.choices.length) {
	          prefix = figures.arrowDown;
	        } else {
	          prefix = ' ';
	        }

	        if (v.disabled) {
	          title = this.cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	          prefix = (this.cursor === i ? color.bold().gray(figures.pointer) + ' ' : '  ') + prefix;
	        } else {
	          title = this.cursor === i ? color.cyan().underline(v.title) : v.title;
	          prefix = (this.cursor === i ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;

	          if (v.description && this.cursor === i) {
	            desc = ` - ${v.description}`;

	            if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
	              desc = '\n' + wrap(v.description, {
	                margin: 3,
	                width: this.out.columns
	              });
	            }
	          }
	        }

	        this.outputText += `${prefix} ${title}${color.gray(desc)}\n`;
	      }
	    }

	    this.out.write(this.outputText);
	  }

	}

	select = SelectPrompt;
	return select;
}

var toggle;
var hasRequiredToggle;

function requireToggle () {
	if (hasRequiredToggle) return toggle;
	hasRequiredToggle = 1;

	const color = requireKleur();

	const Prompt = requirePrompt();

	const _require = requireUtil(),
	      style = _require.style,
	      clear = _require.clear;

	const _require2 = requireSrc(),
	      cursor = _require2.cursor,
	      erase = _require2.erase;
	/**
	 * TogglePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial=false] Default value
	 * @param {String} [opts.active='no'] Active label
	 * @param {String} [opts.inactive='off'] Inactive label
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class TogglePrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = !!opts.initial;
	    this.active = opts.active || 'on';
	    this.inactive = opts.inactive || 'off';
	    this.initialValue = this.value;
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  deactivate() {
	    if (this.value === false) return this.bell();
	    this.value = false;
	    this.render();
	  }

	  activate() {
	    if (this.value === true) return this.bell();
	    this.value = true;
	    this.render();
	  }

	  delete() {
	    this.deactivate();
	  }

	  left() {
	    this.deactivate();
	  }

	  right() {
	    this.activate();
	  }

	  down() {
	    this.deactivate();
	  }

	  up() {
	    this.activate();
	  }

	  next() {
	    this.value = !this.value;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.value = !this.value;
	    } else if (c === '1') {
	      this.value = true;
	    } else if (c === '0') {
	      this.value = false;
	    } else return this.bell();

	    this.render();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();
	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.value ? this.inactive : color.cyan().underline(this.inactive), color.gray('/'), this.value ? color.cyan().underline(this.active) : this.active].join(' ');
	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	toggle = TogglePrompt;
	return toggle;
}

var datepart;
var hasRequiredDatepart;

function requireDatepart () {
	if (hasRequiredDatepart) return datepart;
	hasRequiredDatepart = 1;

	class DatePart {
	  constructor({
	    token,
	    date,
	    parts,
	    locales
	  }) {
	    this.token = token;
	    this.date = date || new Date();
	    this.parts = parts || [this];
	    this.locales = locales || {};
	  }

	  up() {}

	  down() {}

	  next() {
	    const currentIdx = this.parts.indexOf(this);
	    return this.parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  setTo(val) {}

	  prev() {
	    let parts = [].concat(this.parts).reverse();
	    const currentIdx = parts.indexOf(this);
	    return parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  toString() {
	    return String(this.date);
	  }

	}

	datepart = DatePart;
	return datepart;
}

var meridiem;
var hasRequiredMeridiem;

function requireMeridiem () {
	if (hasRequiredMeridiem) return meridiem;
	hasRequiredMeridiem = 1;

	const DatePart = requireDatepart();

	class Meridiem extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours((this.date.getHours() + 12) % 24);
	  }

	  down() {
	    this.up();
	  }

	  toString() {
	    let meridiem = this.date.getHours() > 12 ? 'pm' : 'am';
	    return /\A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
	  }

	}

	meridiem = Meridiem;
	return meridiem;
}

var day;
var hasRequiredDay;

function requireDay () {
	if (hasRequiredDay) return day;
	hasRequiredDay = 1;

	const DatePart = requireDatepart();

	const pos = n => {
	  n = n % 10;
	  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
	};

	class Day extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setDate(this.date.getDate() + 1);
	  }

	  down() {
	    this.date.setDate(this.date.getDate() - 1);
	  }

	  setTo(val) {
	    this.date.setDate(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let date = this.date.getDate();
	    let day = this.date.getDay();
	    return this.token === 'DD' ? String(date).padStart(2, '0') : this.token === 'Do' ? date + pos(date) : this.token === 'd' ? day + 1 : this.token === 'ddd' ? this.locales.weekdaysShort[day] : this.token === 'dddd' ? this.locales.weekdays[day] : date;
	  }

	}

	day = Day;
	return day;
}

var hours;
var hasRequiredHours;

function requireHours () {
	if (hasRequiredHours) return hours;
	hasRequiredHours = 1;

	const DatePart = requireDatepart();

	class Hours extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours(this.date.getHours() + 1);
	  }

	  down() {
	    this.date.setHours(this.date.getHours() - 1);
	  }

	  setTo(val) {
	    this.date.setHours(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let hours = this.date.getHours();
	    if (/h/.test(this.token)) hours = hours % 12 || 12;
	    return this.token.length > 1 ? String(hours).padStart(2, '0') : hours;
	  }

	}

	hours = Hours;
	return hours;
}

var milliseconds;
var hasRequiredMilliseconds;

function requireMilliseconds () {
	if (hasRequiredMilliseconds) return milliseconds;
	hasRequiredMilliseconds = 1;

	const DatePart = requireDatepart();

	class Milliseconds extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
	  }

	  down() {
	    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
	  }

	  setTo(val) {
	    this.date.setMilliseconds(parseInt(val.substr(-this.token.length)));
	  }

	  toString() {
	    return String(this.date.getMilliseconds()).padStart(4, '0').substr(0, this.token.length);
	  }

	}

	milliseconds = Milliseconds;
	return milliseconds;
}

var minutes;
var hasRequiredMinutes;

function requireMinutes () {
	if (hasRequiredMinutes) return minutes;
	hasRequiredMinutes = 1;

	const DatePart = requireDatepart();

	class Minutes extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMinutes(this.date.getMinutes() + 1);
	  }

	  down() {
	    this.date.setMinutes(this.date.getMinutes() - 1);
	  }

	  setTo(val) {
	    this.date.setMinutes(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let m = this.date.getMinutes();
	    return this.token.length > 1 ? String(m).padStart(2, '0') : m;
	  }

	}

	minutes = Minutes;
	return minutes;
}

var month;
var hasRequiredMonth;

function requireMonth () {
	if (hasRequiredMonth) return month;
	hasRequiredMonth = 1;

	const DatePart = requireDatepart();

	class Month extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMonth(this.date.getMonth() + 1);
	  }

	  down() {
	    this.date.setMonth(this.date.getMonth() - 1);
	  }

	  setTo(val) {
	    val = parseInt(val.substr(-2)) - 1;
	    this.date.setMonth(val < 0 ? 0 : val);
	  }

	  toString() {
	    let month = this.date.getMonth();
	    let tl = this.token.length;
	    return tl === 2 ? String(month + 1).padStart(2, '0') : tl === 3 ? this.locales.monthsShort[month] : tl === 4 ? this.locales.months[month] : String(month + 1);
	  }

	}

	month = Month;
	return month;
}

var seconds;
var hasRequiredSeconds;

function requireSeconds () {
	if (hasRequiredSeconds) return seconds;
	hasRequiredSeconds = 1;

	const DatePart = requireDatepart();

	class Seconds extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setSeconds(this.date.getSeconds() + 1);
	  }

	  down() {
	    this.date.setSeconds(this.date.getSeconds() - 1);
	  }

	  setTo(val) {
	    this.date.setSeconds(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let s = this.date.getSeconds();
	    return this.token.length > 1 ? String(s).padStart(2, '0') : s;
	  }

	}

	seconds = Seconds;
	return seconds;
}

var year;
var hasRequiredYear;

function requireYear () {
	if (hasRequiredYear) return year;
	hasRequiredYear = 1;

	const DatePart = requireDatepart();

	class Year extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setFullYear(this.date.getFullYear() + 1);
	  }

	  down() {
	    this.date.setFullYear(this.date.getFullYear() - 1);
	  }

	  setTo(val) {
	    this.date.setFullYear(val.substr(-4));
	  }

	  toString() {
	    let year = String(this.date.getFullYear()).padStart(4, '0');
	    return this.token.length === 2 ? year.substr(-2) : year;
	  }

	}

	year = Year;
	return year;
}

var dateparts;
var hasRequiredDateparts;

function requireDateparts () {
	if (hasRequiredDateparts) return dateparts;
	hasRequiredDateparts = 1;

	dateparts = {
	  DatePart: requireDatepart(),
	  Meridiem: requireMeridiem(),
	  Day: requireDay(),
	  Hours: requireHours(),
	  Milliseconds: requireMilliseconds(),
	  Minutes: requireMinutes(),
	  Month: requireMonth(),
	  Seconds: requireSeconds(),
	  Year: requireYear()
	};
	return dateparts;
}

var date;
var hasRequiredDate;

function requireDate () {
	if (hasRequiredDate) return date;
	hasRequiredDate = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt();

	const _require = requireUtil(),
	      style = _require.style,
	      clear = _require.clear,
	      figures = _require.figures;

	const _require2 = requireSrc(),
	      erase = _require2.erase,
	      cursor = _require2.cursor;

	const _require3 = requireDateparts(),
	      DatePart = _require3.DatePart,
	      Meridiem = _require3.Meridiem,
	      Day = _require3.Day,
	      Hours = _require3.Hours,
	      Milliseconds = _require3.Milliseconds,
	      Minutes = _require3.Minutes,
	      Month = _require3.Month,
	      Seconds = _require3.Seconds,
	      Year = _require3.Year;

	const regex = /\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g;
	const regexGroups = {
	  1: ({
	    token
	  }) => token.replace(/\\(.)/g, '$1'),
	  2: opts => new Day(opts),
	  // Day // TODO
	  3: opts => new Month(opts),
	  // Month
	  4: opts => new Year(opts),
	  // Year
	  5: opts => new Meridiem(opts),
	  // AM/PM // TODO (special)
	  6: opts => new Hours(opts),
	  // Hours
	  7: opts => new Minutes(opts),
	  // Minutes
	  8: opts => new Seconds(opts),
	  // Seconds
	  9: opts => new Milliseconds(opts) // Fractional seconds

	};
	const dfltLocales = {
	  months: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
	  monthsShort: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
	  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
	  weekdaysShort: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',')
	};
	/**
	 * DatePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Number} [opts.initial] Index of default value
	 * @param {String} [opts.mask] The format mask
	 * @param {object} [opts.locales] The date locales
	 * @param {String} [opts.error] The error message shown on invalid value
	 * @param {Function} [opts.validate] Function to validate the submitted value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */

	class DatePrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = 0;
	    this.typed = '';
	    this.locales = Object.assign(dfltLocales, opts.locales);
	    this._date = opts.initial || new Date();
	    this.errorMsg = opts.error || 'Please Enter A Valid Value';

	    this.validator = opts.validate || (() => true);

	    this.mask = opts.mask || 'YYYY-MM-DD HH:mm:ss';
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  get value() {
	    return this.date;
	  }

	  get date() {
	    return this._date;
	  }

	  set date(date) {
	    if (date) this._date.setTime(date.getTime());
	  }

	  set mask(mask) {
	    let result;
	    this.parts = [];

	    while (result = regex.exec(mask)) {
	      let match = result.shift();
	      let idx = result.findIndex(gr => gr != null);
	      this.parts.push(idx in regexGroups ? regexGroups[idx]({
	        token: result[idx] || match,
	        date: this.date,
	        parts: this.parts,
	        locales: this.locales
	      }) : result[idx] || match);
	    }

	    let parts = this.parts.reduce((arr, i) => {
	      if (typeof i === 'string' && typeof arr[arr.length - 1] === 'string') arr[arr.length - 1] += i;else arr.push(i);
	      return arr;
	    }, []);
	    this.parts.splice(0);
	    this.parts.push(...parts);
	    this.reset();
	  }

	  moveCursor(n) {
	    this.typed = '';
	    this.cursor = n;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(this.parts.findIndex(p => p instanceof DatePart));
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  validate() {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      let valid = yield _this.validator(_this.value);

	      if (typeof valid === 'string') {
	        _this.errorMsg = valid;
	        valid = false;
	      }

	      _this.error = !valid;
	    })();
	  }

	  submit() {
	    var _this2 = this;

	    return _asyncToGenerator(function* () {
	      yield _this2.validate();

	      if (_this2.error) {
	        _this2.color = 'red';

	        _this2.fire();

	        _this2.render();

	        return;
	      }

	      _this2.done = true;
	      _this2.aborted = false;

	      _this2.fire();

	      _this2.render();

	      _this2.out.write('\n');

	      _this2.close();
	    })();
	  }

	  up() {
	    this.typed = '';
	    this.parts[this.cursor].up();
	    this.render();
	  }

	  down() {
	    this.typed = '';
	    this.parts[this.cursor].down();
	    this.render();
	  }

	  left() {
	    let prev = this.parts[this.cursor].prev();
	    if (prev == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(prev));
	    this.render();
	  }

	  right() {
	    let next = this.parts[this.cursor].next();
	    if (next == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(next));
	    this.render();
	  }

	  next() {
	    let next = this.parts[this.cursor].next();
	    this.moveCursor(next ? this.parts.indexOf(next) : this.parts.findIndex(part => part instanceof DatePart));
	    this.render();
	  }

	  _(c) {
	    if (/\d/.test(c)) {
	      this.typed += c;
	      this.parts[this.cursor].setTo(this.typed);
	      this.render();
	    }
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render(); // Print prompt

	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.parts.reduce((arr, p, idx) => arr.concat(idx === this.cursor && !this.done ? color.cyan().underline(p.toString()) : p), []).join('')].join(' '); // Print error

	    if (this.error) {
	      this.outputText += this.errorMsg.split('\n').reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	date = DatePrompt;
	return date;
}

var number;
var hasRequiredNumber;

function requireNumber () {
	if (hasRequiredNumber) return number;
	hasRequiredNumber = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt();

	const _require = requireSrc(),
	      cursor = _require.cursor,
	      erase = _require.erase;

	const _require2 = requireUtil(),
	      style = _require2.style,
	      figures = _require2.figures,
	      clear = _require2.clear,
	      lines = _require2.lines;

	const isNumber = /[0-9]/;

	const isDef = any => any !== undefined;

	const round = (number, precision) => {
	  let factor = Math.pow(10, precision);
	  return Math.round(number * factor) / factor;
	};
	/**
	 * NumberPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {Number} [opts.initial] Default value
	 * @param {Number} [opts.max=+Infinity] Max value
	 * @param {Number} [opts.min=-Infinity] Min value
	 * @param {Boolean} [opts.float=false] Parse input as floats
	 * @param {Number} [opts.round=2] Round floats to x decimals
	 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */


	class NumberPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.msg = opts.message;
	    this.initial = isDef(opts.initial) ? opts.initial : '';
	    this.float = !!opts.float;
	    this.round = opts.round || 2;
	    this.inc = opts.increment || 1;
	    this.min = isDef(opts.min) ? opts.min : -Infinity;
	    this.max = isDef(opts.max) ? opts.max : Infinity;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;

	    this.validator = opts.validate || (() => true);

	    this.color = `cyan`;
	    this.value = ``;
	    this.typed = ``;
	    this.lastHit = 0;
	    this.render();
	  }

	  set value(v) {
	    if (!v && v !== 0) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(`${this.initial}`));
	      this._value = ``;
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(`${round(v, this.round)}`);
	      this._value = round(v, this.round);
	    }

	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  parse(x) {
	    return this.float ? parseFloat(x) : parseInt(x);
	  }

	  valid(c) {
	    return c === `-` || c === `.` && this.float || isNumber.test(c);
	  }

	  reset() {
	    this.typed = ``;
	    this.value = ``;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    let x = this.value;
	    this.value = x !== `` ? x : this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write(`\n`);
	    this.close();
	  }

	  validate() {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      let valid = yield _this.validator(_this.value);

	      if (typeof valid === `string`) {
	        _this.errorMsg = valid;
	        valid = false;
	      }

	      _this.error = !valid;
	    })();
	  }

	  submit() {
	    var _this2 = this;

	    return _asyncToGenerator(function* () {
	      yield _this2.validate();

	      if (_this2.error) {
	        _this2.color = `red`;

	        _this2.fire();

	        _this2.render();

	        return;
	      }

	      let x = _this2.value;
	      _this2.value = x !== `` ? x : _this2.initial;
	      _this2.done = true;
	      _this2.aborted = false;
	      _this2.error = false;

	      _this2.fire();

	      _this2.render();

	      _this2.out.write(`\n`);

	      _this2.close();
	    })();
	  }

	  up() {
	    this.typed = ``;

	    if (this.value === '') {
	      this.value = this.min - this.inc;
	    }

	    if (this.value >= this.max) return this.bell();
	    this.value += this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  down() {
	    this.typed = ``;

	    if (this.value === '') {
	      this.value = this.min + this.inc;
	    }

	    if (this.value <= this.min) return this.bell();
	    this.value -= this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  delete() {
	    let val = this.value.toString();
	    if (val.length === 0) return this.bell();
	    this.value = this.parse(val = val.slice(0, -1)) || ``;

	    if (this.value !== '' && this.value < this.min) {
	      this.value = this.min;
	    }

	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  next() {
	    this.value = this.initial;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (!this.valid(c)) return this.bell();
	    const now = Date.now();
	    if (now - this.lastHit > 1000) this.typed = ``; // 1s elapsed

	    this.typed += c;
	    this.lastHit = now;
	    this.color = `cyan`;
	    if (c === `.`) return this.fire();
	    this.value = Math.min(this.parse(this.typed), this.max);
	    if (this.value > this.max) this.value = this.max;
	    if (this.value < this.min) this.value = this.min;
	    this.fire();
	    this.render();
	  }

	  render() {
	    if (this.closed) return;

	    if (!this.firstRender) {
	      if (this.outputError) this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }

	    super.render();
	    this.outputError = ''; // Print prompt

	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), !this.done || !this.done && !this.placeholder ? color[this.color]().underline(this.rendered) : this.rendered].join(` `); // Print error

	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`).reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore);
	  }

	}

	number = NumberPrompt;
	return number;
}

var multiselect;
var hasRequiredMultiselect;

function requireMultiselect () {
	if (hasRequiredMultiselect) return multiselect;
	hasRequiredMultiselect = 1;

	const color = requireKleur();

	const _require = requireSrc(),
	      cursor = _require.cursor;

	const Prompt = requirePrompt();

	const _require2 = requireUtil(),
	      clear = _require2.clear,
	      figures = _require2.figures,
	      style = _require2.style,
	      wrap = _require2.wrap,
	      entriesToDisplay = _require2.entriesToDisplay;
	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class MultiselectPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = opts.cursor || 0;
	    this.scrollIndex = opts.cursor || 0;
	    this.hint = opts.hint || '';
	    this.warn = opts.warn || '- This option is disabled -';
	    this.minSelected = opts.min;
	    this.showMinError = false;
	    this.maxChoices = opts.max;
	    this.instructions = opts.instructions;
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string') ch = {
	        title: ch,
	        value: idx
	      };
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        description: ch && ch.description,
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.clear = clear('', this.out.columns);

	    if (!opts.overrideRender) {
	      this.render();
	    }
	  }

	  reset() {
	    this.value.map(v => !v.selected);
	    this.cursor = 0;
	    this.fire();
	    this.render();
	  }

	  selected() {
	    return this.value.filter(v => v.selected);
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    const selected = this.value.filter(e => e.selected);

	    if (this.minSelected && selected.length < this.minSelected) {
	      this.showMinError = true;
	      this.render();
	    } else {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length - 1;
	    this.render();
	  }

	  next() {
	    this.cursor = (this.cursor + 1) % this.value.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.value.length - 1;
	    } else {
	      this.cursor--;
	    }

	    this.render();
	  }

	  down() {
	    if (this.cursor === this.value.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }

	    this.render();
	  }

	  left() {
	    this.value[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.value[this.cursor].selected = true;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.value[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  toggleAll() {
	    if (this.maxChoices !== undefined || this.value[this.cursor].disabled) {
	      return this.bell();
	    }

	    const newSelected = !this.value[this.cursor].selected;
	    this.value.filter(v => !v.disabled).forEach(v => v.selected = newSelected);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else if (c === 'a') {
	      this.toggleAll();
	    } else {
	      return this.bell();
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }

	      return '\nInstructions:\n' + `    ${figures.arrowUp}/${figures.arrowDown}: Highlight option\n` + `    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection\n` + (this.maxChoices === undefined ? `    a: Toggle all\n` : '') + `    enter/return: Complete answer`;
	    }

	    return '';
	  }

	  renderOption(cursor, v, i, arrowIndicator) {
	    const prefix = (v.selected ? color.green(figures.radioOn) : figures.radioOff) + ' ' + arrowIndicator + ' ';
	    let title, desc;

	    if (v.disabled) {
	      title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	    } else {
	      title = cursor === i ? color.cyan().underline(v.title) : v.title;

	      if (cursor === i && v.description) {
	        desc = ` - ${v.description}`;

	        if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
	          desc = '\n' + wrap(v.description, {
	            margin: prefix.length,
	            width: this.out.columns
	          });
	        }
	      }
	    }

	    return prefix + title + color.gray(desc || '');
	  } // shared with autocompleteMultiselect


	  paginateOptions(options) {
	    if (options.length === 0) {
	      return color.red('No matches for this query.');
	    }

	    let _entriesToDisplay = entriesToDisplay(this.cursor, options.length, this.optionsPerPage),
	        startIndex = _entriesToDisplay.startIndex,
	        endIndex = _entriesToDisplay.endIndex;

	    let prefix,
	        styledOptions = [];

	    for (let i = startIndex; i < endIndex; i++) {
	      if (i === startIndex && startIndex > 0) {
	        prefix = figures.arrowUp;
	      } else if (i === endIndex - 1 && endIndex < options.length) {
	        prefix = figures.arrowDown;
	      } else {
	        prefix = ' ';
	      }

	      styledOptions.push(this.renderOption(this.cursor, options[i], i, prefix));
	    }

	    return '\n' + styledOptions.join('\n');
	  } // shared with autocomleteMultiselect


	  renderOptions(options) {
	    if (!this.done) {
	      return this.paginateOptions(options);
	    }

	    return '';
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value.filter(e => e.selected).map(v => v.title).join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions()];

	    if (this.value[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }

	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render(); // print prompt

	    let prompt = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.renderDoneOrInstructions()].join(' ');

	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }

	    prompt += this.renderOptions(this.value);
	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }

	}

	multiselect = MultiselectPrompt;
	return multiselect;
}

var autocomplete;
var hasRequiredAutocomplete;

function requireAutocomplete () {
	if (hasRequiredAutocomplete) return autocomplete;
	hasRequiredAutocomplete = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt();

	const _require = requireSrc(),
	      erase = _require.erase,
	      cursor = _require.cursor;

	const _require2 = requireUtil(),
	      style = _require2.style,
	      clear = _require2.clear,
	      figures = _require2.figures,
	      wrap = _require2.wrap,
	      entriesToDisplay = _require2.entriesToDisplay;

	const getVal = (arr, i) => arr[i] && (arr[i].value || arr[i].title || arr[i]);

	const getTitle = (arr, i) => arr[i] && (arr[i].title || arr[i].value || arr[i]);

	const getIndex = (arr, valOrTitle) => {
	  const index = arr.findIndex(el => el.value === valOrTitle || el.title === valOrTitle);
	  return index > -1 ? index : undefined;
	};
	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of auto-complete choices objects
	 * @param {Function} [opts.suggest] Filter function. Defaults to sort by title
	 * @param {Number} [opts.limit=10] Max number of results to show
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.fallback] Fallback message - initial to default value
	 * @param {String} [opts.initial] Index of the default value
	 * @param {Boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.noMatches] The no matches found label
	 */


	class AutocompletePrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.suggest = opts.suggest;
	    this.choices = opts.choices;
	    this.initial = typeof opts.initial === 'number' ? opts.initial : getIndex(opts.choices, opts.initial);
	    this.select = this.initial || opts.cursor || 0;
	    this.i18n = {
	      noMatches: opts.noMatches || 'no matches found'
	    };
	    this.fallback = opts.fallback || this.initial;
	    this.clearFirst = opts.clearFirst || false;
	    this.suggestions = [];
	    this.input = '';
	    this.limit = opts.limit || 10;
	    this.cursor = 0;
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.render = this.render.bind(this);
	    this.complete = this.complete.bind(this);
	    this.clear = clear('', this.out.columns);
	    this.complete(this.render);
	    this.render();
	  }

	  set fallback(fb) {
	    this._fb = Number.isSafeInteger(parseInt(fb)) ? parseInt(fb) : fb;
	  }

	  get fallback() {
	    let choice;
	    if (typeof this._fb === 'number') choice = this.choices[this._fb];else if (typeof this._fb === 'string') choice = {
	      title: this._fb
	    };
	    return choice || this._fb || {
	      title: this.i18n.noMatches
	    };
	  }

	  moveSelect(i) {
	    this.select = i;
	    if (this.suggestions.length > 0) this.value = getVal(this.suggestions, i);else this.value = this.fallback.value;
	    this.fire();
	  }

	  complete(cb) {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      const p = _this.completing = _this.suggest(_this.input, _this.choices);

	      const suggestions = yield p;
	      if (_this.completing !== p) return;
	      _this.suggestions = suggestions.map((s, i, arr) => ({
	        title: getTitle(arr, i),
	        value: getVal(arr, i),
	        description: s.description
	      }));
	      _this.completing = false;
	      const l = Math.max(suggestions.length - 1, 0);

	      _this.moveSelect(Math.min(l, _this.select));

	      cb && cb();
	    })();
	  }

	  reset() {
	    this.input = '';
	    this.complete(() => {
	      this.moveSelect(this.initial !== void 0 ? this.initial : 0);
	      this.render();
	    });
	    this.render();
	  }

	  exit() {
	    if (this.clearFirst && this.input.length > 0) {
	      this.reset();
	    } else {
	      this.done = this.exited = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${c}${s2}`;
	    this.cursor = s1.length + 1;
	    this.complete(this.render);
	    this.render();
	  }

	  delete() {
	    if (this.cursor === 0) return this.bell();
	    let s1 = this.input.slice(0, this.cursor - 1);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.cursor = this.cursor - 1;
	    this.render();
	  }

	  deleteForward() {
	    if (this.cursor * this.scale >= this.rendered.length) return this.bell();
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor + 1);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.render();
	  }

	  first() {
	    this.moveSelect(0);
	    this.render();
	  }

	  last() {
	    this.moveSelect(this.suggestions.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.select === 0) {
	      this.moveSelect(this.suggestions.length - 1);
	    } else {
	      this.moveSelect(this.select - 1);
	    }

	    this.render();
	  }

	  down() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else {
	      this.moveSelect(this.select + 1);
	    }

	    this.render();
	  }

	  next() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else this.moveSelect(this.select + 1);

	    this.render();
	  }

	  nextPage() {
	    this.moveSelect(Math.min(this.select + this.limit, this.suggestions.length - 1));
	    this.render();
	  }

	  prevPage() {
	    this.moveSelect(Math.max(this.select - this.limit, 0));
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0) return this.bell();
	    this.cursor = this.cursor - 1;
	    this.render();
	  }

	  right() {
	    if (this.cursor * this.scale >= this.rendered.length) return this.bell();
	    this.cursor = this.cursor + 1;
	    this.render();
	  }

	  renderOption(v, hovered, isStart, isEnd) {
	    let desc;
	    let prefix = isStart ? figures.arrowUp : isEnd ? figures.arrowDown : ' ';
	    let title = hovered ? color.cyan().underline(v.title) : v.title;
	    prefix = (hovered ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;

	    if (v.description) {
	      desc = ` - ${v.description}`;

	      if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
	        desc = '\n' + wrap(v.description, {
	          margin: 3,
	          width: this.out.columns
	        });
	      }
	    }

	    return prefix + ' ' + title + color.gray(desc || '');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let _entriesToDisplay = entriesToDisplay(this.select, this.choices.length, this.limit),
	        startIndex = _entriesToDisplay.startIndex,
	        endIndex = _entriesToDisplay.endIndex;

	    this.outputText = [style.symbol(this.done, this.aborted, this.exited), color.bold(this.msg), style.delimiter(this.completing), this.done && this.suggestions[this.select] ? this.suggestions[this.select].title : this.rendered = this.transform.render(this.input)].join(' ');

	    if (!this.done) {
	      const suggestions = this.suggestions.slice(startIndex, endIndex).map((item, i) => this.renderOption(item, this.select === i + startIndex, i === 0 && startIndex > 0, i + startIndex === endIndex - 1 && endIndex < this.choices.length)).join('\n');
	      this.outputText += `\n` + (suggestions || color.gray(this.fallback.title));
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	autocomplete = AutocompletePrompt;
	return autocomplete;
}

var autocompleteMultiselect;
var hasRequiredAutocompleteMultiselect;

function requireAutocompleteMultiselect () {
	if (hasRequiredAutocompleteMultiselect) return autocompleteMultiselect;
	hasRequiredAutocompleteMultiselect = 1;

	const color = requireKleur();

	const _require = requireSrc(),
	      cursor = _require.cursor;

	const MultiselectPrompt = requireMultiselect();

	const _require2 = requireUtil(),
	      clear = _require2.clear,
	      style = _require2.style,
	      figures = _require2.figures;
	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class AutocompleteMultiselectPrompt extends MultiselectPrompt {
	  constructor(opts = {}) {
	    opts.overrideRender = true;
	    super(opts);
	    this.inputValue = '';
	    this.clear = clear('', this.out.columns);
	    this.filteredOptions = this.value;
	    this.render();
	  }

	  last() {
	    this.cursor = this.filteredOptions.length - 1;
	    this.render();
	  }

	  next() {
	    this.cursor = (this.cursor + 1) % this.filteredOptions.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.filteredOptions.length - 1;
	    } else {
	      this.cursor--;
	    }

	    this.render();
	  }

	  down() {
	    if (this.cursor === this.filteredOptions.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }

	    this.render();
	  }

	  left() {
	    this.filteredOptions[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.filteredOptions[this.cursor].selected = true;
	    this.render();
	  }

	  delete() {
	    if (this.inputValue.length) {
	      this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1);
	      this.updateFilteredOptions();
	    }
	  }

	  updateFilteredOptions() {
	    const currentHighlight = this.filteredOptions[this.cursor];
	    this.filteredOptions = this.value.filter(v => {
	      if (this.inputValue) {
	        if (typeof v.title === 'string') {
	          if (v.title.toLowerCase().includes(this.inputValue.toLowerCase())) {
	            return true;
	          }
	        }

	        if (typeof v.value === 'string') {
	          if (v.value.toLowerCase().includes(this.inputValue.toLowerCase())) {
	            return true;
	          }
	        }

	        return false;
	      }

	      return true;
	    });
	    const newHighlightIndex = this.filteredOptions.findIndex(v => v === currentHighlight);
	    this.cursor = newHighlightIndex < 0 ? 0 : newHighlightIndex;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.filteredOptions[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  handleInputChange(c) {
	    this.inputValue = this.inputValue + c;
	    this.updateFilteredOptions();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else {
	      this.handleInputChange(c);
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }

	      return `
Instructions:
    ${figures.arrowUp}/${figures.arrowDown}: Highlight option
    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection
    [a,b,c]/delete: Filter choices
    enter/return: Complete answer
`;
	    }

	    return '';
	  }

	  renderCurrentInput() {
	    return `
Filtered results for: ${this.inputValue ? this.inputValue : color.gray('Enter something to filter')}\n`;
	  }

	  renderOption(cursor, v, i) {
	    let title;
	    if (v.disabled) title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);else title = cursor === i ? color.cyan().underline(v.title) : v.title;
	    return (v.selected ? color.green(figures.radioOn) : figures.radioOff) + '  ' + title;
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value.filter(e => e.selected).map(v => v.title).join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions(), this.renderCurrentInput()];

	    if (this.filteredOptions.length && this.filteredOptions[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }

	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render(); // print prompt

	    let prompt = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.renderDoneOrInstructions()].join(' ');

	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }

	    prompt += this.renderOptions(this.filteredOptions);
	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }

	}

	autocompleteMultiselect = AutocompleteMultiselectPrompt;
	return autocompleteMultiselect;
}

var confirm;
var hasRequiredConfirm;

function requireConfirm () {
	if (hasRequiredConfirm) return confirm;
	hasRequiredConfirm = 1;

	const color = requireKleur();

	const Prompt = requirePrompt();

	const _require = requireUtil(),
	      style = _require.style,
	      clear = _require.clear;

	const _require2 = requireSrc(),
	      erase = _require2.erase,
	      cursor = _require2.cursor;
	/**
	 * ConfirmPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial] Default value (true/false)
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.yes] The "Yes" label
	 * @param {String} [opts.yesOption] The "Yes" option when choosing between yes/no
	 * @param {String} [opts.no] The "No" label
	 * @param {String} [opts.noOption] The "No" option when choosing between yes/no
	 */


	class ConfirmPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = opts.initial;
	    this.initialValue = !!opts.initial;
	    this.yesMsg = opts.yes || 'yes';
	    this.yesOption = opts.yesOption || '(Y/n)';
	    this.noMsg = opts.no || 'no';
	    this.noOption = opts.noOption || '(y/N)';
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.value = this.value || false;
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    if (c.toLowerCase() === 'y') {
	      this.value = true;
	      return this.submit();
	    }

	    if (c.toLowerCase() === 'n') {
	      this.value = false;
	      return this.submit();
	    }

	    return this.bell();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();
	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.done ? this.value ? this.yesMsg : this.noMsg : color.gray(this.initialValue ? this.yesOption : this.noOption)].join(' ');
	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	confirm = ConfirmPrompt;
	return confirm;
}

var elements;
var hasRequiredElements;

function requireElements () {
	if (hasRequiredElements) return elements;
	hasRequiredElements = 1;

	elements = {
	  TextPrompt: requireText(),
	  SelectPrompt: requireSelect(),
	  TogglePrompt: requireToggle(),
	  DatePrompt: requireDate(),
	  NumberPrompt: requireNumber(),
	  MultiselectPrompt: requireMultiselect(),
	  AutocompletePrompt: requireAutocomplete(),
	  AutocompleteMultiselectPrompt: requireAutocompleteMultiselect(),
	  ConfirmPrompt: requireConfirm()
	};
	return elements;
}

var hasRequiredPrompts;

function requirePrompts () {
	if (hasRequiredPrompts) return prompts$1;
	hasRequiredPrompts = 1;
	(function (exports) {

		const $ = exports;

		const el = requireElements();

		const noop = v => v;

		function toPrompt(type, args, opts = {}) {
		  return new Promise((res, rej) => {
		    const p = new el[type](args);
		    const onAbort = opts.onAbort || noop;
		    const onSubmit = opts.onSubmit || noop;
		    const onExit = opts.onExit || noop;
		    p.on('state', args.onState || noop);
		    p.on('submit', x => res(onSubmit(x)));
		    p.on('exit', x => res(onExit(x)));
		    p.on('abort', x => rej(onAbort(x)));
		  });
		}
		/**
		 * Text prompt
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.text = args => toPrompt('TextPrompt', args);
		/**
		 * Password prompt with masked input
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.password = args => {
		  args.style = 'password';
		  return $.text(args);
		};
		/**
		 * Prompt where input is invisible, like sudo
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.invisible = args => {
		  args.style = 'invisible';
		  return $.text(args);
		};
		/**
		 * Number prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.number = args => toPrompt('NumberPrompt', args);
		/**
		 * Date prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.date = args => toPrompt('DatePrompt', args);
		/**
		 * Classic yes/no prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.confirm = args => toPrompt('ConfirmPrompt', args);
		/**
		 * List prompt, split intput string by `seperator`
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {string} [args.separator] String separator
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input, in form of an `Array`
		 */


		$.list = args => {
		  const sep = args.separator || ',';
		  return toPrompt('TextPrompt', args, {
		    onSubmit: str => str.split(sep).map(s => s.trim())
		  });
		};
		/**
		 * Toggle/switch prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {string} [args.active="on"] Text for `active` state
		 * @param {string} [args.inactive="off"] Text for `inactive` state
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.toggle = args => toPrompt('TogglePrompt', args);
		/**
		 * Interactive select prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
		 * @param {number} [args.initial] Index of default value
		 * @param {String} [args.hint] Hint to display
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.select = args => toPrompt('SelectPrompt', args);
		/**
		 * Interactive multi-select / autocompleteMultiselect prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
		 * @param {number} [args.max] Max select
		 * @param {string} [args.hint] Hint to display user
		 * @param {Number} [args.cursor=0] Cursor start position
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.multiselect = args => {
		  args.choices = [].concat(args.choices || []);

		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);

		  return toPrompt('MultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		$.autocompleteMultiselect = args => {
		  args.choices = [].concat(args.choices || []);

		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);

		  return toPrompt('AutocompleteMultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		const byTitle = (input, choices) => Promise.resolve(choices.filter(item => item.title.slice(0, input.length).toLowerCase() === input.toLowerCase()));
		/**
		 * Interactive auto-complete prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of auto-complete choices objects `[{ title, value }, ...]`
		 * @param {Function} [args.suggest] Function to filter results based on user input. Defaults to sort by `title`
		 * @param {number} [args.limit=10] Max number of results to show
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {String} [args.initial] Index of the default value
		 * @param {boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
		 * @param {String} [args.fallback] Fallback message - defaults to initial value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.autocomplete = args => {
		  args.suggest = args.suggest || byTitle;
		  args.choices = [].concat(args.choices || []);
		  return toPrompt('AutocompletePrompt', args);
		}; 
	} (prompts$1));
	return prompts$1;
}

var dist;
var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const prompts = requirePrompts();

	const passOn = ['suggest', 'format', 'onState', 'validate', 'onRender', 'type'];

	const noop = () => {};
	/**
	 * Prompt for a series of questions
	 * @param {Array|Object} questions Single question object or Array of question objects
	 * @param {Function} [onSubmit] Callback function called on prompt submit
	 * @param {Function} [onCancel] Callback function called on cancel/abort
	 * @returns {Object} Object with values from user input
	 */


	function prompt() {
	  return _prompt.apply(this, arguments);
	}

	function _prompt() {
	  _prompt = _asyncToGenerator(function* (questions = [], {
	    onSubmit = noop,
	    onCancel = noop
	  } = {}) {
	    const answers = {};
	    const override = prompt._override || {};
	    questions = [].concat(questions);
	    let answer, question, quit, name, type, lastPrompt;

	    const getFormattedAnswer = /*#__PURE__*/function () {
	      var _ref = _asyncToGenerator(function* (question, answer, skipValidation = false) {
	        if (!skipValidation && question.validate && question.validate(answer) !== true) {
	          return;
	        }

	        return question.format ? yield question.format(answer, answers) : answer;
	      });

	      return function getFormattedAnswer(_x, _x2) {
	        return _ref.apply(this, arguments);
	      };
	    }();

	    var _iterator = _createForOfIteratorHelper(questions),
	        _step;

	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        question = _step.value;
	        var _question = question;
	        name = _question.name;
	        type = _question.type;

	        // evaluate type first and skip if type is a falsy value
	        if (typeof type === 'function') {
	          type = yield type(answer, _objectSpread({}, answers), question);
	          question['type'] = type;
	        }

	        if (!type) continue; // if property is a function, invoke it unless it's a special function

	        for (let key in question) {
	          if (passOn.includes(key)) continue;
	          let value = question[key];
	          question[key] = typeof value === 'function' ? yield value(answer, _objectSpread({}, answers), lastPrompt) : value;
	        }

	        lastPrompt = question;

	        if (typeof question.message !== 'string') {
	          throw new Error('prompt message is required');
	        } // update vars in case they changed


	        var _question2 = question;
	        name = _question2.name;
	        type = _question2.type;

	        if (prompts[type] === void 0) {
	          throw new Error(`prompt type (${type}) is not defined`);
	        }

	        if (override[question.name] !== undefined) {
	          answer = yield getFormattedAnswer(question, override[question.name]);

	          if (answer !== undefined) {
	            answers[name] = answer;
	            continue;
	          }
	        }

	        try {
	          // Get the injected answer if there is one or prompt the user
	          answer = prompt._injected ? getInjectedAnswer(prompt._injected, question.initial) : yield prompts[type](question);
	          answers[name] = answer = yield getFormattedAnswer(question, answer, true);
	          quit = yield onSubmit(question, answer, answers);
	        } catch (err) {
	          quit = !(yield onCancel(question, answers));
	        }

	        if (quit) return answers;
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }

	    return answers;
	  });
	  return _prompt.apply(this, arguments);
	}

	function getInjectedAnswer(injected, deafultValue) {
	  const answer = injected.shift();

	  if (answer instanceof Error) {
	    throw answer;
	  }

	  return answer === undefined ? deafultValue : answer;
	}

	function inject(answers) {
	  prompt._injected = (prompt._injected || []).concat(answers);
	}

	function override(answers) {
	  prompt._override = Object.assign({}, answers);
	}

	dist = Object.assign(prompt, {
	  prompt,
	  prompts,
	  inject,
	  override
	});
	return dist;
}

function isNodeLT(tar) {
  tar = (Array.isArray(tar) ? tar : tar.split('.')).map(Number);
  let i=0, src=process.versions.node.split('.').map(Number);
  for (; i < tar.length; i++) {
    if (src[i] > tar[i]) return false;
    if (tar[i] > src[i]) return true;
  }
  return false;
}

var prompts =
  isNodeLT('8.6.0')
    ? requireDist()
    : requireLib();

var prompt = /*@__PURE__*/getDefaultExportFromCjs(prompts);

var index = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: prompt
}, [prompts]);

const MAX_RESULT_COUNT = 10;
const SELECTION_MAX_INDEX = 7;
const ESC = "\x1B[";
class WatchFilter {
  filterRL;
  currentKeyword = void 0;
  message;
  results = [];
  selectionIndex = -1;
  onKeyPress;
  constructor(message) {
    this.message = message;
    this.filterRL = readline.createInterface({ input: process.stdin, escapeCodeTimeout: 50 });
    readline.emitKeypressEvents(process.stdin, this.filterRL);
    if (process.stdin.isTTY)
      process.stdin.setRawMode(true);
  }
  async filter(filterFunc) {
    stdout().write(this.promptLine());
    const resultPromise = createDefer();
    this.onKeyPress = this.filterHandler(filterFunc, (result) => {
      resultPromise.resolve(result);
    });
    process.stdin.on("keypress", this.onKeyPress);
    try {
      return await resultPromise;
    } finally {
      this.close();
    }
  }
  filterHandler(filterFunc, onSubmit) {
    return async (str, key) => {
      var _a, _b;
      switch (true) {
        case key.sequence === "\x7F":
          if (this.currentKeyword && ((_a = this.currentKeyword) == null ? void 0 : _a.length) > 1)
            this.currentKeyword = (_b = this.currentKeyword) == null ? void 0 : _b.slice(0, -1);
          else
            this.currentKeyword = void 0;
          break;
        case ((key == null ? void 0 : key.ctrl) && (key == null ? void 0 : key.name) === "c"):
        case (key == null ? void 0 : key.name) === "escape":
          this.cancel();
          onSubmit(void 0);
          break;
        case (key == null ? void 0 : key.name) === "enter":
        case (key == null ? void 0 : key.name) === "return":
          onSubmit(this.results[this.selectionIndex] || this.currentKeyword || "");
          this.currentKeyword = void 0;
          break;
        case (key == null ? void 0 : key.name) === "up":
          if (this.selectionIndex && this.selectionIndex > 0)
            this.selectionIndex--;
          else
            this.selectionIndex = -1;
          break;
        case (key == null ? void 0 : key.name) === "down":
          if (this.selectionIndex < this.results.length - 1)
            this.selectionIndex++;
          else if (this.selectionIndex >= this.results.length - 1)
            this.selectionIndex = this.results.length - 1;
          break;
        case (!(key == null ? void 0 : key.ctrl) && !(key == null ? void 0 : key.meta)):
          if (this.currentKeyword === void 0)
            this.currentKeyword = str;
          else
            this.currentKeyword += str || "";
          break;
      }
      if (this.currentKeyword)
        this.results = await filterFunc(this.currentKeyword);
      this.render();
    };
  }
  render() {
    let printStr = this.promptLine();
    if (!this.currentKeyword) {
      printStr += "\nPlease input filter pattern";
    } else if (this.currentKeyword && this.results.length === 0) {
      printStr += "\nPattern matches no results";
    } else {
      const resultCountLine = this.results.length === 1 ? `Pattern matches ${this.results.length} result` : `Pattern matches ${this.results.length} results`;
      let resultBody = "";
      if (this.results.length > MAX_RESULT_COUNT) {
        const offset = this.selectionIndex > SELECTION_MAX_INDEX ? this.selectionIndex - SELECTION_MAX_INDEX : 0;
        const displayResults = this.results.slice(offset, MAX_RESULT_COUNT + offset);
        const remainingResultCount = this.results.length - offset - displayResults.length;
        resultBody = `${displayResults.map((result, index) => index + offset === this.selectionIndex ? c.green(` \u203A ${result}`) : c.dim(` \u203A ${result}`)).join("\n")}`;
        if (remainingResultCount > 0)
          resultBody += `
${c.dim(`   ...and ${remainingResultCount} more ${remainingResultCount === 1 ? "result" : "results"}`)}`;
      } else {
        resultBody = this.results.map((result, index) => index === this.selectionIndex ? c.green(` \u203A ${result}`) : c.dim(` \u203A ${result}`)).join("\n");
      }
      printStr += `
${resultCountLine}
${resultBody}`;
    }
    this.eraseAndPrint(printStr);
    this.restoreCursor();
  }
  keywordOffset() {
    return `? ${this.message} \u203A `.length + 1;
  }
  promptLine() {
    return `${c.cyan("?")} ${c.bold(this.message)} \u203A ${this.currentKeyword || ""}`;
  }
  eraseAndPrint(str) {
    let rows = 0;
    const lines = str.split(/\r?\n/);
    for (const line of lines)
      rows += 1 + Math.floor(Math.max(stripAnsi(line).length - 1, 0) / stdout().columns);
    stdout().write(`${ESC}1G`);
    stdout().write(`${ESC}J`);
    stdout().write(str);
    stdout().write(`${ESC}${rows - 1}A`);
  }
  close() {
    this.filterRL.close();
    if (this.onKeyPress)
      process.stdin.removeListener("keypress", this.onKeyPress);
    if (process.stdin.isTTY)
      process.stdin.setRawMode(false);
  }
  restoreCursor() {
    var _a;
    const cursortPos = this.keywordOffset() + (((_a = this.currentKeyword) == null ? void 0 : _a.length) || 0);
    stdout().write(`${ESC}${cursortPos}G`);
  }
  cancel() {
    stdout().write(`${ESC}J`);
  }
}

const keys = [
  [["a", "return"], "rerun all tests"],
  ["r", "rerun current pattern tests"],
  ["f", "rerun only failed tests"],
  ["u", "update snapshot"],
  ["p", "filter by a filename"],
  ["t", "filter by a test name regex pattern"],
  ["w", "filter by a project name"],
  ["q", "quit"]
];
const cancelKeys = ["space", "c", "h", ...keys.map((key) => key[0]).flat()];
function printShortcutsHelp() {
  stdout().write(
    `
${c.bold("  Watch Usage")}
${keys.map((i) => c.dim("  press ") + c.reset([i[0]].flat().map(c.bold).join(", ")) + c.dim(` to ${i[1]}`)).join("\n")}
`
  );
}
function registerConsoleShortcuts(ctx) {
  let latestFilename = "";
  async function _keypressHandler(str, key) {
    if (str === "" || str === "\x1B" || key && key.ctrl && key.name === "c") {
      if (!ctx.isCancelling) {
        ctx.logger.logUpdate.clear();
        ctx.logger.log(c.red("Cancelling test run. Press CTRL+c again to exit forcefully.\n"));
        process.exitCode = 130;
        await ctx.cancelCurrentRun("keyboard-input");
        await ctx.runningPromise;
      }
      return ctx.exit(true);
    }
    if (!isWindows && key && key.ctrl && key.name === "z") {
      process.kill(process.ppid, "SIGTSTP");
      process.kill(process.pid, "SIGTSTP");
      return;
    }
    const name = key == null ? void 0 : key.name;
    if (ctx.runningPromise) {
      if (cancelKeys.includes(name))
        await ctx.cancelCurrentRun("keyboard-input");
      return;
    }
    if (name === "q")
      return ctx.exit(true);
    if (name === "h")
      return printShortcutsHelp();
    if (name === "u")
      return ctx.updateSnapshot();
    if (name === "a" || name === "return")
      return ctx.changeNamePattern("");
    if (name === "r")
      return ctx.rerunFiles();
    if (name === "f")
      return ctx.rerunFailed();
    if (name === "w")
      return inputProjectName();
    if (name === "t")
      return inputNamePattern();
    if (name === "p")
      return inputFilePattern();
  }
  async function keypressHandler(str, key) {
    await _keypressHandler(str, key);
  }
  async function inputNamePattern() {
    off();
    const watchFilter = new WatchFilter("Input test name pattern (RegExp)");
    const filter = await watchFilter.filter((str) => {
      const files = ctx.state.getFiles();
      const tests = getTests(files);
      try {
        const reg = new RegExp(str);
        return tests.map((test) => test.name).filter((testName) => testName.match(reg));
      } catch {
        return [];
      }
    });
    on();
    await ctx.changeNamePattern((filter == null ? void 0 : filter.trim()) || "", void 0, "change pattern");
  }
  async function inputProjectName() {
    off();
    const { filter = "" } = await prompt([{
      name: "filter",
      type: "text",
      message: "Input a single project name",
      initial: toArray(ctx.configOverride.project)[0] || ""
    }]);
    on();
    await ctx.changeProjectName(filter.trim());
  }
  async function inputFilePattern() {
    off();
    const watchFilter = new WatchFilter("Input filename pattern");
    const filter = await watchFilter.filter(async (str) => {
      const files = await ctx.globTestFiles([str]);
      return files.map(
        (file) => relative(ctx.config.root, file[1])
      );
    });
    on();
    latestFilename = (filter == null ? void 0 : filter.trim()) || "";
    await ctx.changeFilenamePattern(latestFilename);
  }
  let rl;
  function on() {
    off();
    rl = readline.createInterface({ input: process.stdin, escapeCodeTimeout: 50 });
    readline.emitKeypressEvents(process.stdin, rl);
    if (process.stdin.isTTY)
      process.stdin.setRawMode(true);
    process.stdin.on("keypress", keypressHandler);
  }
  function off() {
    rl == null ? void 0 : rl.close();
    rl = void 0;
    process.stdin.removeListener("keypress", keypressHandler);
    if (process.stdin.isTTY)
      process.stdin.setRawMode(false);
  }
  on();
  return function cleanup() {
    off();
  };
}

async function startVitest(mode, cliFilters = [], options = {}, viteOverrides, vitestOptions) {
  var _a, _b;
  process.env.TEST = "true";
  process.env.VITEST = "true";
  (_a = process.env).NODE_ENV ?? (_a.NODE_ENV = "test");
  if (options.run)
    options.watch = false;
  const root = resolve(options.root || process.cwd());
  if (typeof options.coverage === "boolean")
    options.coverage = { enabled: options.coverage };
  if (typeof options.browser === "boolean")
    options.browser = { enabled: options.browser };
  if (typeof options.browser === "string")
    options.browser = { enabled: true, name: options.browser };
  if (typeof options.browser === "object" && !("enabled" in options.browser))
    options.browser.enabled = true;
  if (typeof options.typecheck === "boolean")
    options.typecheck = { enabled: true };
  if (typeof ((_b = options.typecheck) == null ? void 0 : _b.only) === "boolean") {
    options.typecheck ?? (options.typecheck = {});
    options.typecheck.only = true;
    options.typecheck.enabled = true;
  }
  const ctx = await createVitest(mode, options, viteOverrides, vitestOptions);
  if (mode === "test" && ctx.config.coverage.enabled) {
    const provider = ctx.config.coverage.provider || "v8";
    const requiredPackages = CoverageProviderMap[provider];
    if (requiredPackages) {
      if (!await ctx.packageInstaller.ensureInstalled(requiredPackages, root)) {
        process.exitCode = 1;
        return ctx;
      }
    }
  }
  const environmentPackage = getEnvPackageName(ctx.config.environment);
  if (environmentPackage && !await ctx.packageInstaller.ensureInstalled(environmentPackage, root)) {
    process.exitCode = 1;
    return ctx;
  }
  let stdinCleanup;
  if (process.stdin.isTTY && ctx.config.watch)
    stdinCleanup = registerConsoleShortcuts(ctx);
  ctx.onServerRestart((reason) => {
    ctx.report("onServerRestart", reason);
    if (process.env.VITEST_CLI_WRAPPER)
      process.exit(EXIT_CODE_RESTART);
  });
  ctx.onAfterSetServer(() => {
    ctx.start(cliFilters);
  });
  try {
    await ctx.start(cliFilters);
  } catch (e) {
    process.exitCode = 1;
    await ctx.logger.printError(e, { fullStack: true, type: "Unhandled Error" });
    ctx.logger.error("\n\n");
    return ctx;
  }
  if (ctx.shouldKeepServer())
    return ctx;
  stdinCleanup == null ? void 0 : stdinCleanup();
  await ctx.close();
  return ctx;
}

export { BaseSequencer as B, VitestPlugin as V, WorkspaceProject as W, createMethodsRPC as a, VitestPackageInstaller as b, createVitest as c, registerConsoleShortcuts as r, startVitest as s, version$1 as v };

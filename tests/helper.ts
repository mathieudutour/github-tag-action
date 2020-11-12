export function setInput(key, value) {
  process.env[`INPUT_${key.toUpperCase()}`] = value;
}

export function setInputs(map) {
  Object.keys(map).forEach(key => setInput(key, map[key]));
}

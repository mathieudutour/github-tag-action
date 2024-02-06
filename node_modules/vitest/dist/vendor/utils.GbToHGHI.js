import { parseRegexp } from '@vitest/utils';

function createThreadsRpcOptions({ port }) {
  return {
    post: (v) => {
      port.postMessage(v);
    },
    on: (fn) => {
      port.addListener("message", fn);
    }
  };
}
function createForksRpcOptions(nodeV8) {
  return {
    serialize: nodeV8.serialize,
    deserialize: (v) => nodeV8.deserialize(Buffer.from(v)),
    post(v) {
      process.send(v);
    },
    on(fn) {
      process.on("message", (message, ...extras) => {
        if (message == null ? void 0 : message.__tinypool_worker_message__)
          return;
        return fn(message, ...extras);
      });
    }
  };
}
function parsePossibleRegexp(str) {
  const prefix = "$$vitest:";
  if (typeof str === "string" && str.startsWith(prefix))
    return parseRegexp(str.slice(prefix.length));
  return str;
}
function unwrapForksConfig(config) {
  if (config.testNamePattern)
    config.testNamePattern = parsePossibleRegexp(config.testNamePattern);
  return config;
}

export { createThreadsRpcOptions as a, createForksRpcOptions as c, unwrapForksConfig as u };

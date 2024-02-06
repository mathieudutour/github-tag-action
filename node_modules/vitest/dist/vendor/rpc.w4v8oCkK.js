import { getSafeTimers } from '@vitest/utils';
import { c as createBirpc } from './index.cAUulNDf.js';
import { g as getWorkerState } from './global.CkGT_TMy.js';

const { get } = Reflect;
function withSafeTimers(fn) {
  var _a;
  const { setTimeout, clearTimeout, nextTick, setImmediate, clearImmediate } = getSafeTimers();
  const currentSetTimeout = globalThis.setTimeout;
  const currentClearTimeout = globalThis.clearTimeout;
  const currentSetImmediate = globalThis.setImmediate;
  const currentClearImmediate = globalThis.clearImmediate;
  const currentNextTick = (_a = globalThis.process) == null ? void 0 : _a.nextTick;
  try {
    globalThis.setTimeout = setTimeout;
    globalThis.clearTimeout = clearTimeout;
    globalThis.setImmediate = setImmediate;
    globalThis.clearImmediate = clearImmediate;
    if (globalThis.process)
      globalThis.process.nextTick = nextTick;
    const result = fn();
    return result;
  } finally {
    globalThis.setTimeout = currentSetTimeout;
    globalThis.clearTimeout = currentClearTimeout;
    globalThis.setImmediate = currentSetImmediate;
    globalThis.clearImmediate = currentClearImmediate;
    if (globalThis.process) {
      nextTick(() => {
        globalThis.process.nextTick = currentNextTick;
      });
    }
  }
}
const promises = /* @__PURE__ */ new Set();
async function rpcDone() {
  if (!promises.size)
    return;
  const awaitable = Array.from(promises);
  return Promise.all(awaitable);
}
function createRuntimeRpc(options) {
  let setCancel = (_reason) => {
  };
  const onCancel = new Promise((resolve) => {
    setCancel = resolve;
  });
  const rpc2 = createSafeRpc(createBirpc(
    {
      onCancel: setCancel
    },
    {
      eventNames: ["onUserConsoleLog", "onFinished", "onCollected", "onCancel"],
      ...options
    }
  ));
  return {
    rpc: rpc2,
    onCancel
  };
}
function createSafeRpc(rpc2) {
  return new Proxy(rpc2, {
    get(target, p, handler) {
      const sendCall = get(target, p, handler);
      const safeSendCall = (...args) => withSafeTimers(async () => {
        const result = sendCall(...args);
        promises.add(result);
        try {
          return await result;
        } finally {
          promises.delete(result);
        }
      });
      safeSendCall.asEvent = sendCall.asEvent;
      return safeSendCall;
    }
  });
}
function rpc() {
  const { rpc: rpc2 } = getWorkerState();
  return rpc2;
}

export { rpcDone as a, createRuntimeRpc as c, rpc as r };

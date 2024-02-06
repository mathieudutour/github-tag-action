import { setSafeTimers } from '@vitest/utils';
import { r as resetRunOnceCounter } from './run-once.Olz_Zkd8.js';

let globalSetup = false;
async function setupCommonEnv(config) {
  resetRunOnceCounter();
  setupDefines(config.defines);
  if (globalSetup)
    return;
  globalSetup = true;
  setSafeTimers();
  if (config.globals)
    (await import('../chunks/integrations-globals.J_6tnlri.js')).registerApiGlobally();
}
function setupDefines(defines) {
  for (const key in defines)
    globalThis[key] = defines[key];
}
async function loadDiffConfig(config, executor) {
  if (typeof config.diff !== "string")
    return;
  const diffModule = await executor.executeId(config.diff);
  if (diffModule && typeof diffModule.default === "object" && diffModule.default != null)
    return diffModule.default;
  else
    throw new Error(`invalid diff config file ${config.diff}. Must have a default export with config object`);
}

export { loadDiffConfig as l, setupCommonEnv as s };

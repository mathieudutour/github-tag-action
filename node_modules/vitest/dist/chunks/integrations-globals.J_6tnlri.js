import { g as globalApis } from '../vendor/constants.i1PoEnhr.js';
import { V as VitestIndex } from '../vendor/index.LgG0iblq.js';
import '@vitest/runner';
import '../vendor/benchmark.IlKmJkUU.js';
import '@vitest/runner/utils';
import '@vitest/utils';
import '../vendor/index.rJjbcrrp.js';
import 'pathe';
import 'std-env';
import '../vendor/global.CkGT_TMy.js';
import '../vendor/run-once.Olz_Zkd8.js';
import '../vendor/vi.PPwhENHF.js';
import 'chai';
import '../vendor/_commonjsHelpers.jjO7Zipk.js';
import '@vitest/expect';
import '@vitest/snapshot';
import '@vitest/utils/error';
import '../vendor/tasks.IknbGB2n.js';
import '@vitest/utils/source-map';
import '../vendor/base.QYERqzkH.js';
import '../vendor/date.Ns1pGd_X.js';
import '@vitest/spy';

function registerApiGlobally() {
  globalApis.forEach((api) => {
    globalThis[api] = VitestIndex[api];
  });
}

export { registerApiGlobally };

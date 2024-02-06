import { normalize } from 'pathe';
import cac from 'cac';
import c from 'picocolors';
import { v as version, s as startVitest } from './vendor/node.Zme77R4t.js';
import './vendor/index.rJjbcrrp.js';
import { d as divider } from './vendor/reporters.cA9x-5v-.js';
import { t as toArray } from './vendor/base.QYERqzkH.js';
import 'vite';
import 'node:path';
import 'node:url';
import 'node:process';
import 'node:fs';
import './vendor/constants.i1PoEnhr.js';
import './vendor/_commonjsHelpers.jjO7Zipk.js';
import 'os';
import 'path';
import './vendor/index.xL8XjTLv.js';
import 'util';
import 'stream';
import 'events';
import 'fs';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'vite-node/server';
import './vendor/coverage.E7sG1b3r.js';
import './path.js';
import 'node:v8';
import 'node:os';
import 'node:events';
import 'tinypool';
import './vendor/index.cAUulNDf.js';
import 'node:worker_threads';
import '@vitest/utils';
import 'node:fs/promises';
import 'node:perf_hooks';
import 'execa';
import '@vitest/utils/source-map';
import 'module';
import 'acorn-walk';
import '@vitest/runner/utils';
import 'local-pkg';
import 'std-env';
import 'node:crypto';
import 'vite-node/utils';
import 'assert';
import 'magic-string';
import '@vitest/utils/ast';
import 'strip-literal';
import 'node:module';
import './vendor/environments.sU0TD7wX.js';
import 'node:console';
import 'node:readline';
import 'readline';
import './vendor/global.CkGT_TMy.js';
import './chunks/runtime-console.Iloo9fIt.js';
import 'node:stream';
import './vendor/date.Ns1pGd_X.js';
import './vendor/tasks.IknbGB2n.js';

const cli = cac("vitest");
cli.version(version).option("-r, --root <path>", "Root path").option("-c, --config <path>", "Path to config file").option("-u, --update", "Update snapshot").option("-w, --watch", "Enable watch mode").option("-t, --testNamePattern <pattern>", "Run tests with full names matching the specified regexp pattern").option("--dir <path>", "Base directory to scan for the test files").option("--ui", "Enable UI").option("--open", "Open UI automatically (default: !process.env.CI))").option("--api [api]", "Serve API, available options: --api.port <port>, --api.host [host] and --api.strictPort").option("--silent", "Silent console output from tests").option("--hideSkippedTests", "Hide logs for skipped tests").option("--reporter <name>", "Specify reporters").option("--outputFile <filename/-s>", "Write test results to a file when supporter reporter is also specified, use cac's dot notation for individual outputs of multiple reporters").option("--coverage", "Enable coverage report").option("--coverage.all", "Whether to include all files, including the untested ones into report", { default: true }).option("--run", "Disable watch mode").option("--mode <name>", "Override Vite mode (default: test)").option("--workspace <path>", "Path to a workspace configuration file").option("--isolate", "Run every test file in isolation. To disable isolation, use --no-isolate (default: true)").option("--globals", "Inject apis globally").option("--dom", "Mock browser API with happy-dom").option("--browser [options]", "Run tests in the browser (default: false)").option("--pool <pool>", "Specify pool, if not running in the browser (default: threads)").option("--poolOptions <options>", "Specify pool options").option("--poolOptions.threads.isolate", "Isolate tests in threads pool (default: true)").option("--poolOptions.forks.isolate", "Isolate tests in forks pool (default: true)").option("--fileParallelism", "Should all test files run in parallel. Use --no-file-parallelism to disable (default: true)").option("--maxWorkers <workers>", "Maximum number of workers to run tests in").option("--minWorkers <workers>", "Minimum number of workers to run tests in").option("--environment <env>", "Specify runner environment, if not running in the browser (default: node)").option("--passWithNoTests", "Pass when no tests found").option("--logHeapUsage", "Show the size of heap for each test").option("--allowOnly", "Allow tests and suites that are marked as only (default: !process.env.CI)").option("--dangerouslyIgnoreUnhandledErrors", "Ignore any unhandled errors that occur").option("--shard <shard>", "Test suite shard to execute in a format of <index>/<count>").option("--changed [since]", "Run tests that are affected by the changed files (default: false)").option("--sequence <options>", "Define in what order to run tests (use --sequence.shuffle to run tests in random order, use --sequence.concurrent to run tests in parallel)").option("--segfaultRetry <times>", "Return tests on segment fault (default: 0)", { default: 0 }).option("--no-color", "Removes colors from the console output").option("--inspect", "Enable Node.js inspector").option("--inspect-brk", "Enable Node.js inspector with break").option("--test-timeout <time>", "Default timeout of a test in milliseconds (default: 5000)").option("--bail <number>", "Stop test execution when given number of tests have failed (default: 0)").option("--retry <times>", "Retry the test specific number of times if it fails (default: 0)").option("--diff <path>", "Path to a diff config that will be used to generate diff interface").option("--exclude <glob>", "Additional file globs to be excluded from test").option("--expand-snapshot-diff", "Show full diff when snapshot fails").option("--disable-console-intercept", "Disable automatic interception of console logging (default: `false`)").option("--typecheck [options]", "Custom options for typecheck pool").option("--typecheck.enabled", "Enable typechecking alongside tests (default: false)").option("--typecheck.only", "Run only typecheck tests. This automatically enables typecheck (default: false)").option("--project <name>", "The name of the project to run if you are using Vitest workspace feature. This can be repeated for multiple projects: --project=1 --project=2").help();
cli.command("run [...filters]").action(run);
cli.command("related [...filters]").action(runRelated);
cli.command("watch [...filters]").action(watch);
cli.command("dev [...filters]").action(watch);
cli.command("bench [...filters]").action(benchmark);
cli.command("typecheck [...filters]").action(() => {
  throw new Error(`Running typecheck via "typecheck" command is removed. Please use "--typecheck" to run your regular tests alongside typechecking, or "--typecheck.only" to run only typecheck tests.`);
});
cli.command("[...filters]").action((filters, options) => start("test", filters, options));
try {
  cli.parse();
} catch (originalError) {
  const fullArguments = cli.rawArgs.join(" ");
  const conflictingArgs = [];
  for (const arg of cli.rawArgs) {
    if (arg.startsWith("--") && !arg.includes(".") && fullArguments.includes(`${arg}.`)) {
      const dotArgs = cli.rawArgs.filter((rawArg) => rawArg.startsWith(arg) && rawArg.includes("."));
      conflictingArgs.push({ arg, dotArgs });
    }
  }
  if (conflictingArgs.length === 0)
    throw originalError;
  const error = conflictingArgs.map(({ arg, dotArgs }) => `A boolean argument "${arg}" was used with dot notation arguments "${dotArgs.join(" ")}".
Please specify the "${arg}" argument with dot notation as well: "${arg}.enabled"`).join("\n");
  throw new Error(error);
}
async function runRelated(relatedFiles, argv) {
  argv.related = relatedFiles;
  argv.passWithNoTests ?? (argv.passWithNoTests = true);
  await start("test", [], argv);
}
async function watch(cliFilters, options) {
  options.watch = true;
  await start("test", cliFilters, options);
}
async function run(cliFilters, options) {
  options.run = true;
  await start("test", cliFilters, options);
}
async function benchmark(cliFilters, options) {
  console.warn(c.yellow("Benchmarking is an experimental feature.\nBreaking changes might not follow SemVer, please pin Vitest's version when using it."));
  await start("benchmark", cliFilters, options);
}
function normalizeCliOptions(argv) {
  if (argv.root)
    argv.root = normalize(argv.root);
  else
    delete argv.root;
  if (argv.config)
    argv.config = normalize(argv.config);
  else
    delete argv.config;
  if (argv.workspace)
    argv.workspace = normalize(argv.workspace);
  else
    delete argv.workspace;
  if (argv.dir)
    argv.dir = normalize(argv.dir);
  else
    delete argv.dir;
  if (argv.exclude) {
    argv.cliExclude = toArray(argv.exclude);
    delete argv.exclude;
  }
  if (argv.coverage) {
    const coverage = argv.coverage;
    if (coverage.exclude)
      coverage.exclude = toArray(coverage.exclude);
    if (coverage.include)
      coverage.include = toArray(coverage.include);
    if (coverage.ignoreClassMethods)
      coverage.ignoreClassMethods = toArray(coverage.ignoreClassMethods);
  }
  return argv;
}
async function start(mode, cliFilters, options) {
  try {
    process.title = "node (vitest)";
  } catch {
  }
  try {
    const ctx = await startVitest(mode, cliFilters.map(normalize), normalizeCliOptions(options));
    if (!(ctx == null ? void 0 : ctx.shouldKeepServer()))
      await (ctx == null ? void 0 : ctx.exit());
    return ctx;
  } catch (e) {
    console.error(`
${c.red(divider(c.bold(c.inverse(" Unhandled Error "))))}`);
    console.error(e);
    console.error("\n\n");
    process.exit(1);
  }
}

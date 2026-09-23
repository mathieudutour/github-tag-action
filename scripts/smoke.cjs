// Exercise the shipped bundle without access to this checkout's node_modules.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const net = require('node:net');
const { spawn, execFileSync } = require('node:child_process');
const yaml = require('js-yaml');

async function main() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tag-action-smoke-'));
  const bundle = path.join(temporary, 'bundle');
  const checkout = path.join(temporary, 'checkout');
  fs.cpSync(path.join(__dirname, '../dist'), bundle, { recursive: true });
  fs.mkdirSync(checkout);
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: checkout,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  git('init');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'tag.gpgsign', 'false');
  git('config', 'user.name', 'Smoke');
  git('config', 'user.email', 'smoke@example.invalid');
  fs.writeFileSync(path.join(checkout, 'file'), 'initial');
  git('add', 'file');
  git('commit', '-m', 'chore: initial');
  git('tag', 'v1.0.0');
  const base = git('rev-parse', 'HEAD');
  fs.appendFileSync(path.join(checkout, 'file'), '\nchange');
  git('commit', '-am', 'feat!: new API');
  const head = git('rev-parse', 'HEAD');
  let mode = 'normal';
  let requests = [];
  const server = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const route = req.url;
    requests.push({
      route,
      method: req.method,
      body: body ? JSON.parse(body) : undefined,
    });
    res.setHeader('Content-Type', 'application/json');
    if (mode === 'auth') {
      res.writeHead(403);
      res.end('{}');
      return;
    }
    if (route.includes('/compare/')) {
      if (mode === 'fallback') {
        res.writeHead(503);
        res.end('{}');
        return;
      }
      res.end(
        JSON.stringify({
          commits:
            mode === 'empty'
              ? []
              : [{ sha: head, commit: { message: 'feat!: new API' } }],
        })
      );
      return;
    }
    if (route.includes('/tags?')) {
      res.end(JSON.stringify([{ name: 'v1.0.0', commit: { sha: base } }]));
      return;
    }
    if (route.endsWith('/git/refs') && req.method === 'POST') {
      if (mode === 'write-error') {
        res.writeHead(500);
        res.end('{}');
        return;
      }
      res.writeHead(201);
      res.end('{}');
      return;
    }
    res.writeHead(404);
    res.end('{}');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let proxyConnections = 0;
  const proxy = http.createServer();
  proxy.on('connect', (req, socket, head) => {
    proxyConnections++;
    const upstream = net.connect(server.address().port, '127.0.0.1', () => {
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head.length) upstream.write(head);
      socket.pipe(upstream);
      upstream.pipe(socket);
    });
    socket.on('error', () => upstream.destroy());
    upstream.on('error', () => socket.destroy());
  });
  await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
  const defaults = yaml.load(
    fs.readFileSync(path.join(__dirname, '../action.yml'), 'utf8')
  ).inputs;
  const env = { ...process.env };
  for (const key of Object.keys(env))
    if (
      key.startsWith('INPUT_') ||
      /^(NODE_PATH|NODE_OPTIONS|HTTPS?_PROXY|ALL_PROXY|https?_proxy|all_proxy|no_proxy)$/.test(
        key
      )
    )
      delete env[key];
  for (const [key, input] of Object.entries(defaults))
    if (input.default !== undefined)
      env[`INPUT_${key.toUpperCase()}`] = input.default;
  Object.assign(env, {
    GITHUB_REF: 'refs/heads/main',
    GITHUB_SHA: head,
    GITHUB_EVENT_NAME: 'push',
    GITHUB_REPOSITORY: 'smoke/repository',
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_API_URL: `http://127.0.0.1:${server.address().port}`,
    INPUT_GITHUB_TOKEN: 'smoke-token',
    INPUT_WORKING_DIRECTORY: checkout,
    NO_PROXY: '*',
  });
  async function run(inputs = {}) {
    requests = [];
    const outputFile = path.join(temporary, 'outputs');
    fs.writeFileSync(outputFile, '');
    const child = spawn(process.execPath, [path.join(bundle, 'index.js')], {
      cwd: temporary,
      env: { ...env, GITHUB_OUTPUT: outputFile, ...inputs },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let text = '';
    child.stdout.on('data', (data) => {
      text += data;
    });
    child.stderr.on('data', (data) => {
      text += data;
    });
    const timeout = setTimeout(() => child.kill(), 15000);
    const code = await new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('exit', resolve);
    });
    clearTimeout(timeout);
    const outputs = {};
    const lines = fs.readFileSync(outputFile, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(\w+)<<(.+)$/);
      if (!match) continue;
      const value = [];
      while (++i < lines.length && lines[i] !== match[2]) value.push(lines[i]);
      outputs[match[1]] = value.join('\n');
    }
    return { code, text, outputs };
  }
  try {
    let result = await run();
    assert.equal(result.code, 0, result.text);
    assert.equal(result.outputs.new_version, '2.0.0');
    assert.match(result.outputs.changelog, /BREAKING/);
    assert.deepEqual(requests.find((r) => r.method === 'POST').body, {
      ref: 'refs/tags/v2.0.0',
      sha: head,
    });
    result = await run({
      INPUT_DRY_RUN: 'true',
      INPUT_COMMIT_ANALYZER_PRESET: 'angular',
    });
    assert.equal(result.code, 0, result.text);
    assert.equal(requests.filter((r) => r.method === 'POST').length, 0);
    mode = 'empty';
    result = await run();
    assert.equal(result.code, 0, result.text);
    assert.equal(result.outputs.new_tag, undefined);
    assert.equal(requests.filter((r) => r.method === 'POST').length, 0);
    mode = 'fallback';
    result = await run({ INPUT_DRY_RUN: 'true' });
    assert.equal(result.code, 0, result.text);
    assert.equal(result.outputs.new_version, '2.0.0');
    assert.equal(
      requests.filter((r) => r.route.includes('/compare/')).length,
      3
    );
    const shallow = path.join(temporary, 'shallow');
    git('clone', '--depth=1', pathToFileURL(checkout).href, shallow);
    result = await run({ INPUT_WORKING_DIRECTORY: shallow });
    assert.equal(result.code, 1);
    assert.match(result.text, /Cannot retrieve commits/);
    assert.equal(result.outputs.new_tag, '');
    mode = 'normal';
    result = await run({
      INPUT_PUSH: 'false',
      INPUT_CUSTOM_TAG: 'local-build',
      INPUT_TAG_PREFIX: '',
    });
    assert.equal(result.code, 0, result.text);
    assert.equal(git('rev-parse', 'local-build'), head);
    assert.equal(requests.filter((r) => r.method === 'POST').length, 0);
    result = await run({
      INPUT_CREATE_LOCAL_TAG: 'true',
      INPUT_DRY_RUN: 'true',
      INPUT_CUSTOM_TAG: 'dry-local',
    });
    assert.equal(result.code, 0, result.text);
    assert.equal(git('tag', '--list', 'vdry-local'), '');
    result = await run({
      INPUT_DRY_RUN: 'true',
      GITHUB_API_URL: 'http://api.smoke.invalid',
      HTTP_PROXY: `http://127.0.0.1:${proxy.address().port}`,
      NO_PROXY: '',
    });
    assert.equal(result.code, 0, result.text);
    assert.equal(result.outputs.new_version, '2.0.0');
    assert.ok(proxyConnections > 0);
    mode = 'write-error';
    result = await run({ INPUT_SOFT_FAIL: 'true' });
    assert.equal(result.code, 0, result.text);
    assert.equal(result.outputs.new_tag, '');
    assert.equal(result.outputs.changelog, '');
    assert.equal(requests.filter((r) => r.method === 'POST').length, 1);
    mode = 'auth';
    result = await run({ INPUT_SOFT_FAIL: 'true' });
    assert.equal(result.code, 0, result.text);
    assert.equal(result.outputs.new_tag, '');
    assert.match(result.text, /warning/);
    result = await run();
    assert.equal(result.code, 1);
    assert.match(result.text, /contents: write/);
    console.log(
      `Bundle smoke passed on ${process.version}: isolated presets/templates, REST writes, dry run, zero commits, retry/local fallback, local tags, HTTP proxy, shallow-history rejection, and soft failure.`
    );
  } finally {
    await new Promise((resolve) => proxy.close(resolve));
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

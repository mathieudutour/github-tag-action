const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const ncc = require('@vercel/ncc');

async function build() {
  const root = path.join(__dirname, '..');
  const result = await ncc(path.join(root, 'lib/main.js'), {
    license: 'licenses.txt',
    quiet: true,
  });
  let code = result.code;
  const assets = new Map();
  for (const [name, asset] of Object.entries(result.assets)) {
    // ncc's numbered template names depend on asynchronous loader ordering.
    // Name templates by content so builds on different runtimes agree.
    const target = name.endsWith('.hbs')
      ? `template-${createHash('sha256')
          .update(asset.source)
          .digest('hex')}.hbs`
      : name;
    code = code.replaceAll(JSON.stringify(name), JSON.stringify(target));
    assets.set(target, asset.source);
  }
  const output = path.join(root, 'dist');
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output);
  fs.writeFileSync(path.join(output, 'index.js'), code);
  for (const [name, source] of [...assets].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    fs.mkdirSync(path.dirname(path.join(output, name)), { recursive: true });
    fs.writeFileSync(path.join(output, name), source);
  }
  console.log(`Built dist/index.js and ${assets.size} assets.`);
}
build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

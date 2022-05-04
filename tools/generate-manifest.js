const fs = require('fs');
const path = require('path');

const root = path.resolve();
const lib = path.join(root, 'lib');

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.join(root, 'package.json'));

const writeJSONSync = (p, content) =>
  fs.writeFileSync(p, JSON.stringify(content, null, 2));

const name = () => `@cometa/${pkg.name.replace('cometa-', '')}`;

const fields = (...names) =>
  names.reduce(
    (acc, name) => (pkg[name] ? { ...acc, [name]: pkg[name] } : acc),
    {},
  );

const manifest = {
  name: name(),
  ...fields('version', 'description'),
  main: `./source/cjs/index.js`,
  module: `./source/esm/index.js`,
  typings: `./source/typings/index.d.ts`,
  sideEffects: false,
  ...fields(
    'license',
    'author',
    'homepage',
    'repository',
    'bugs',
    'dependencies',
    'peerDependencies',
    'keywords',
  ),
};

writeJSONSync(path.join(lib, 'package.json'), manifest);

pkg.entrypoints?.forEach((entrypoint) => {
  const alias = {
    name: `@cometa/${name()}/${entrypoint}`,
    main: `../source/cjs/${entrypoint}/index.js`,
    module: `../source/esm/${entrypoint}/index.js`,
    typings: `../source/typings/${entrypoint}/index.d.ts`,
    sideEffects: false,
  };

  const dist = path.join(lib, entrypoint);
  fs.mkdirSync(dist);

  writeJSONSync(path.join(dist, 'package.json'), alias);
});

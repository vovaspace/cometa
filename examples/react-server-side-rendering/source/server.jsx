/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import path from 'path';
import fs from 'fs';

import express from 'express';
import { Duplex } from 'stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createScope } from '@cometa/core/scope';

import { App } from './App';
import { ServerProvider } from './internal/server';
import { createSaltModel, SaltModelProvider } from './modules/Salt';

const client = path.resolve('./build/client');
const stats = JSON.parse(fs.readFileSync(path.join(client, 'stats.json')));
const app = express();

class CometaDuplex extends Duplex {
  constructor(scope) {
    super();
    this.scope = scope;
    this.state = null;
  }

  update(next) {
    this.state = next;
  }

  // eslint-disable-next-line class-methods-use-this
  _read() {}

  _write(chunk, encoding, callback) {
    const next = this.scope.dehydrate();

    if (this.state !== next) {
      this.state = next;
      this.push(
        `
        <script>
          window.state = ${this.state};
          if (typeof window.scope !== 'undefined')
            window.scope.hydrate(window.state);
        </script>
      `,
        'utf-8',
      );
    }

    this.push(chunk, encoding);
    callback();
  }

  _final() {
    this.push(null);
  }
}

app.get('/', async (req, res) => {
  const {
    query: { salt },
  } = req;

  res.setHeader('Content-type', 'text/html');
  res.write('<!doctype html><html><head>');

  const scope = createScope();
  const duplex = new CometaDuplex(scope);

  const saltModel = scope.within(() => createSaltModel());
  saltModel.salt.set(salt);

  const stream = renderToPipeableStream(
    <ServerProvider scope={scope}>
      <SaltModelProvider.Pure value={saltModel}>
        <App />
      </SaltModelProvider.Pure>
    </ServerProvider>,
    {
      bootstrapScripts: stats.assetsByChunkName.main,
      onCompleteShell: () => {
        const state = scope.dehydrate();
        duplex.update(state);
        res.write(`<script>window.state = ${state};</script>`);
        res.write('</head><body><div id="root">');

        res.statusCode = 200;
      },
    },
  );

  stream.pipe(duplex).pipe(res);
});

app.use(express.static(client));

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.info(`Server is listening on :3000`);
});

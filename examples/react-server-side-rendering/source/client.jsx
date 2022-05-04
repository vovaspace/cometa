import { createScope } from '@cometa/core/scope';
import { hydrateRoot } from 'react-dom';
import { App } from './App';
import { ClientProvider } from './internal/client';
import { createSaltModel, SaltModelProvider } from './modules/Salt';

const root = hydrateRoot(document.getElementById('root'));

window.scope = createScope();
window.scope.hydrate(window.state);

const salt = new URLSearchParams(window.location.search).get('salt');
const saltModel = window.scope.within(() => createSaltModel());
saltModel.salt.set(salt);

root.render(
  <ClientProvider scope={window.scope}>
    <SaltModelProvider.Pure value={saltModel}>
      <App />
    </SaltModelProvider.Pure>
  </ClientProvider>,
);

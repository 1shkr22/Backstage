/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import githubScaffolderModule from '@backstage/plugin-scaffolder-backend-module-github';

import { awsScaffolderActionsModule } from './plugins/scaffolder/awsActionsModule';
import { customAuth } from './auth/githubResolver'

const backend = createBackend();

// --------------------
// core backend plugins
// --------------------
backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// --------------------
// scaffolder plugins
// --------------------
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(githubScaffolderModule);
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);

backend.add(awsScaffolderActionsModule);

// --------------------
// techdocs
// --------------------
backend.add(import('@backstage/plugin-techdocs-backend'));

// --------------------
// auth
// --------------------
backend.add(import('@backstage/plugin-auth-backend'));
//backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
//backend.add(import('./auth/githubResolver'));
backend.add(customAuth);

// --------------------
// catalog
// --------------------
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));
backend.add(import('@backstage/plugin-catalog-backend-module-aws/alpha'));

// --------------------
// permissions
// --------------------
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// --------------------
// search
// --------------------
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// --------------------
// kubernetes
// --------------------
backend.add(import('@backstage/plugin-kubernetes-backend'));

// --------------------
// notifications & signals
// --------------------
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

backend.start();

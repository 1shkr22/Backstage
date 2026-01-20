import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';

import { awsEcrCreateAction } from './awsEcrCreate';
import { awsEcsRegisterTaskDefAction } from './awsEcsRegisterTaskDef';
import { awsEcsCreateServiceAction } from './awsEcsCreateService';
import { awsEventBridgeCreateCron } from './awsEventBridgeCreateCron';

import { awsElbv2CreateTargetGroupAction } from './awsElbv2CreateTargetGroup';
import { awsElbv2CreateAlbAction } from './awsElbv2CreateAlb';
import { awsElbv2CreateListenerAction } from './awsElbv2CreateListener';

export const awsScaffolderActionsModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'aws-actions',

  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(
          awsEcrCreateAction,
          awsEcsRegisterTaskDefAction,
          awsEcsCreateServiceAction,
          awsEventBridgeCreateCron,

          awsElbv2CreateTargetGroupAction,
          awsElbv2CreateAlbAction,
          awsElbv2CreateListenerAction,
        );
      },
    });
  },
});

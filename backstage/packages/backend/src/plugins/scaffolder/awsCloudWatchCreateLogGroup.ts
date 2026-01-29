// packages/backend/src/plugins/scaffolder/actions/custom/awsCloudWatchCreateLogGroup.ts
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { CloudWatchLogsClient, CreateLogGroupCommand } from '@aws-sdk/client-cloudwatch-logs';
import { z } from 'zod';

export const awsCloudWatchCreateLogGroupAction = createTemplateAction({
  id: 'aws:cloudwatch:create-log-group',
  description: 'Creates a CloudWatch Log Group',
  schema: {
    input: zImpl => zImpl.object({
      logGroupName: zImpl.string(),
      region: zImpl.string(),
    }),
  },
  async handler(ctx) {
    const client = new CloudWatchLogsClient({ region: ctx.input.region });
    
    try {
      await client.send(new CreateLogGroupCommand({
        logGroupName: ctx.input.logGroupName,
      }));
      ctx.logger.info(`Created Log Group: ${ctx.input.logGroupName}`);
    } catch (e: any) {
      // Ignore if it already exists to be idempotent
      if (e.name === 'ResourceAlreadyExistsException') {
        ctx.logger.info(`Log Group ${ctx.input.logGroupName} already exists, skipping creation.`);
      } else {
        throw e;
      }
    }
  },
});
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ECRClient, CreateRepositoryCommand } from '@aws-sdk/client-ecr';

export const awsEcrCreateAction = createTemplateAction({
  id: 'aws:ecr:create',
  description: 'Create an ECR repository',

  schema: {
    input: z =>
      z.object({
        repositoryName: z.string(),
        region: z.string(),
      }),
  },

  async handler(ctx) {
    const client = new ECRClient({ region: ctx.input.region });

    await client.send(
      new CreateRepositoryCommand({
        repositoryName: ctx.input.repositoryName,
        imageScanningConfiguration: { scanOnPush: true },
      }),
    );

    ctx.logger.info(`ECR repo created: ${ctx.input.repositoryName}`);
  },
});

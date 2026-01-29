import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ECSClient, CreateServiceCommand } from '@aws-sdk/client-ecs';

export const awsEcsCreateServiceAction = createTemplateAction({
  id: 'aws:ecs:create-service',

  schema: {
    input: zImpl =>
      zImpl.object({
        cluster: zImpl.string(),
        serviceName: zImpl.string(),
        taskDefinition: zImpl.string(),
        region: zImpl.string(),
        subnets: zImpl.array(zImpl.string()),
        securityGroups: zImpl.array(zImpl.string()),

        loadBalancers: zImpl
          .array(
            zImpl.object({
              targetGroupArn: zImpl.string(),
              containerName: zImpl.string(),
              containerPort: zImpl.number(),
            }),
          )
          .optional(),
        tags: zImpl.array(zImpl.object({
          key: zImpl.string(),
          value: zImpl.string(),
        })).optional(),  
      }).passthrough(),
  },

  async handler(ctx) {
    const ecs = new ECSClient({ region: ctx.input.region });
    const {
      cluster,
      serviceName,
      taskDefinition,
      subnets,
      securityGroups,
      loadBalancers,
      tags,
    } = ctx.input;

    if (!taskDefinition || typeof taskDefinition !== 'string') {
      throw new Error(
        `create-service failed: taskDefinition was not resolved. Value: ${JSON.stringify(taskDefinition)}`,
      );
    }

    await ecs.send(
      new CreateServiceCommand({
        cluster,
        serviceName,
        taskDefinition,
        desiredCount: 1,
        launchType: 'FARGATE',
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets,
            securityGroups,
            assignPublicIp: 'DISABLED',
          },
        },

        loadBalancers:
          loadBalancers && loadBalancers.length > 0
            ? loadBalancers
            : undefined,
        tags: tags,
        enableECSManagedTags: true,
        propagateTags: 'SERVICE',    
      }),
    );

    ctx.logger.info(`ECS service created: ${serviceName}`);
  },
});
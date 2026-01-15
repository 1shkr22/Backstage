import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  ECSClient,
  RegisterTaskDefinitionCommand,
} from '@aws-sdk/client-ecs';
import { z } from 'zod'; 

export const awsEcsRegisterTaskDefAction = createTemplateAction({
  id: 'aws:ecs:register-task-def',

  schema: {
    input: (_z) =>
      z.object({
        family: z.string(),
        containerName: z.string(),
        image: z.string(),
        cpu: z.string(),
        memory: z.string(),
        region: z.string(),
        executionRoleArn: z.string(),
        taskRoleArn: z.string().optional(),
      }),
  },

  async handler(ctx) {
    const ecs = new ECSClient({ region: ctx.input.region });

    const res = await ecs.send(
      new RegisterTaskDefinitionCommand({
        family: ctx.input.family,
        requiresCompatibilities: ['FARGATE'],
        networkMode: 'awsvpc',
        cpu: ctx.input.cpu,
        memory: ctx.input.memory,
        executionRoleArn: ctx.input.executionRoleArn,
        taskRoleArn: ctx.input.taskRoleArn,
        runtimePlatform: {
          operatingSystemFamily: 'LINUX',
          cpuArchitecture: 'X86_64',
        },
        containerDefinitions: [
          {
            name: ctx.input.containerName,
            image: ctx.input.image,
            essential: true,
            portMappings: [{ containerPort: 3000 }],
          },
        ],
      }),
    );

    const taskDefArn = String(res.taskDefinition?.taskDefinitionArn ?? '');

    if (!taskDefArn) {
      throw new Error('taskDefinitionArn not returned from ECS');
    }

    ctx.logger.info(`Registered Task Definition ARN: ${taskDefArn}`);

    ctx.output('taskDefinitionArn', taskDefArn);
  },
});
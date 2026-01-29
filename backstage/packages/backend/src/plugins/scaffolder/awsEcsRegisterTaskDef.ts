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
        taskRoleArn: z.string(),
        containerPort: z.number(),
        command: z.array(z.string()).optional(),
        environmentFiles: z.array(z.object({
            value: z.string(),
            type: z.literal('s3').default('s3') 
        })),
        logConfiguration: z.object({
            logDriver: z.enum(['awslogs', 'splunk', 'awsfirelens', 'json-file', 'syslog', 'journald', 'gelf', 'fluentd']), 
            options: z.record(z.string())
        }),
        tags: z.array(z.object({
          key: z.string(),
          value: z.string(),
        })).optional(),
      }),
  },

  async handler(ctx) {
    const ecs = new ECSClient({ region: ctx.input.region });
    const { 
        family, containerName, image, cpu, memory, executionRoleArn, taskRoleArn, 
        containerPort, command, environmentFiles, logConfiguration, tags 
    } = ctx.input;

    const res = await ecs.send(
      new RegisterTaskDefinitionCommand({
        family,
        requiresCompatibilities: ['FARGATE'],
        networkMode: 'awsvpc',
        cpu,
        memory,
        executionRoleArn,
        taskRoleArn,
        runtimePlatform: {
          operatingSystemFamily: 'LINUX',
          cpuArchitecture: 'X86_64',
        },
        containerDefinitions: [
          {
            name: containerName,
            image: image,
            essential: true,
            portMappings: [{ containerPort: containerPort, }],
            command: command && command.length > 0 ? command : undefined,
            environmentFiles,
            logConfiguration,
          },
        ],
        tags: tags,
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
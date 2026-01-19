import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
} from '@aws-sdk/client-eventbridge';
import { z } from 'zod';

export const awsEventBridgeCreateCron = createTemplateAction({
  id: 'aws:eventbridge:create-cron',

  schema: {
    input: (_z) =>
      z.object({
        ruleName: z.string(),
        scheduleExpression: z.string(),
        region: z.string(),

        clusterArn: z.string(),
        taskDefinitionArn: z.string(),
        roleArn: z.string(),

        subnets: z.array(z.string()),
        securityGroups: z.array(z.string()),

        timezone: z.enum(['UTC', 'IST']).default('UTC'),
      }),
  },

  async handler(ctx) {
    const client = new EventBridgeClient({
      region: ctx.input.region,
    });

    let scheduleExpression = ctx.input.scheduleExpression;

    if (
      ctx.input.timezone === 'IST' &&
      scheduleExpression.startsWith('cron(')
    ) {
      const cronBody = scheduleExpression.slice(5, -1); 
      const [min, hour, dom, mon, dow, year] = cronBody.split(' ');

      let utcMinute = Number(min) - 30;
      let utcHour = Number(hour) - 5;

      if (utcMinute < 0) {
        utcMinute += 60;
        utcHour -= 1;
      }

      if (utcHour < 0) {
        utcHour += 24;
      }

      scheduleExpression = `cron(${utcMinute} ${utcHour} ${dom} ${mon} ${dow} ${year})`;

      ctx.logger.info(
        `Converted IST cron to UTC: ${scheduleExpression}`,
      );
    }

    await client.send(
      new PutRuleCommand({
        Name: ctx.input.ruleName,
        ScheduleExpression: scheduleExpression, 
        State: 'ENABLED',
      }),
    );

    ctx.logger.info(
      `EventBridge rule created/updated: ${ctx.input.ruleName}`,
    );

    await client.send(
      new PutTargetsCommand({
        Rule: ctx.input.ruleName,
        Targets: [
          {
            Id: 'EcsCronTarget',
            Arn: ctx.input.clusterArn,
            RoleArn: ctx.input.roleArn,
            EcsParameters: {
              TaskDefinitionArn: ctx.input.taskDefinitionArn,
              LaunchType: 'FARGATE',
              TaskCount: 1,
              NetworkConfiguration: {
                awsvpcConfiguration: {
                  AssignPublicIp: 'DISABLED',
                  Subnets: ctx.input.subnets,
                  SecurityGroups: ctx.input.securityGroups,
                },
              },
            },
          },
        ],
      }),
    );

    ctx.logger.info(
      `ECS task target attached to rule: ${ctx.input.ruleName}`,
    );
  },
});

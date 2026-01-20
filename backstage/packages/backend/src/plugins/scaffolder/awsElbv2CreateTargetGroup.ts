import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  ElasticLoadBalancingV2Client,
  CreateTargetGroupCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2';

export const awsElbv2CreateTargetGroupAction = createTemplateAction({
  id: 'aws:elbv2:create-target-group',

  schema: {
    input: z =>
      z.object({
        name: z.string(),
        port: z.number(),
        protocol: z.enum(['HTTP', 'HTTPS']),
        vpcId: z.string(),
        healthCheckPath: z.string(),
        region: z.string(),
      }),
  },

  async handler(ctx) {
    const client = new ElasticLoadBalancingV2Client({
      region: ctx.input.region,
    });

    const res = await client.send(
      new CreateTargetGroupCommand({
        Name: ctx.input.name,
        Protocol: ctx.input.protocol,
        Port: ctx.input.port,
        VpcId: ctx.input.vpcId,
        TargetType: 'ip',
        HealthCheckProtocol: 'HTTP',
        HealthCheckPath: ctx.input.healthCheckPath,
        ProtocolVersion: 'HTTP1',
      }),
    );

    const targetGroupArn =
      res.TargetGroups?.[0]?.TargetGroupArn;

    if (!targetGroupArn) {
      throw new Error('TargetGroupArn not returned');
    }

    ctx.output('targetGroupArn', targetGroupArn);
    ctx.logger.info(`targetGroupArn: ${targetGroupArn}`)
    ctx.logger.info(`Target group created: ${ctx.input.name}`);
  },
});

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  ElasticLoadBalancingV2Client,
  CreateListenerCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2';

export const awsElbv2CreateListenerAction = createTemplateAction({
  id: 'aws:elbv2:create-listener',

  schema: {
    input: z =>
      z.object({
        loadBalancerArn: z.string().or(z.any()),
        port: z.number(),
        protocol: z.enum(['HTTP', 'HTTPS']),
        targetGroupArn: z.string().or(z.any()),
        region: z.string(),
        certificateArn: z.string().optional(),
      }),
  },

  async handler(ctx) {
    const client = new ElasticLoadBalancingV2Client({
      region: ctx.input.region,
    });

    await client.send(
      new CreateListenerCommand({
        LoadBalancerArn: ctx.input.loadBalancerArn,
        Port: ctx.input.port,
        Protocol: ctx.input.protocol,
        Certificates: ctx.input.certificateArn
          ? [{ CertificateArn: ctx.input.certificateArn }]
          : undefined,
        DefaultActions: [
          {
            Type: 'forward',
            TargetGroupArn: ctx.input.targetGroupArn,
          },
        ],
      }),
    );

    ctx.logger.info(
      `Listener created on port ${ctx.input.port}`,
    );
  },
});

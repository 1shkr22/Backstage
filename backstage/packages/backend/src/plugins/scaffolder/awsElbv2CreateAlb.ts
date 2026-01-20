import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  ElasticLoadBalancingV2Client,
  CreateLoadBalancerCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2';

export const awsElbv2CreateAlbAction = createTemplateAction({
  id: 'aws:elbv2:create-alb',

  schema: {
    input: z =>
      z.object({
        name: z.string(),
        subnets: z.array(z.string()),
        securityGroups: z.array(z.string()),
        region: z.string(),
      }),
  },

  async handler(ctx) {
    const client = new ElasticLoadBalancingV2Client({
      region: ctx.input.region,
    });

    const res = await client.send(
      new CreateLoadBalancerCommand({
        Name: ctx.input.name,
        Type: 'application',
        Scheme: 'internet-facing',
        Subnets: ctx.input.subnets,
        SecurityGroups: ctx.input.securityGroups,
      }),
    );

    const lb = res.LoadBalancers?.[0];

    if (!lb?.LoadBalancerArn || !lb?.DNSName) {
      throw new Error('ALB details not returned');
    }

    ctx.output('loadBalancerArn', lb.LoadBalancerArn);
    ctx.output('dnsName', lb.DNSName);

    ctx.logger.info(`loadBalancerArn: ${lb.LoadBalancerArn}`)
    ctx.logger.info(`dnsName: ${lb.DNSName}`)
    ctx.logger.info(`ALB created: ${ctx.input.name}`);
  },
});

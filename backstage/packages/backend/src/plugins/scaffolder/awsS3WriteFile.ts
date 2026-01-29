// packages/backend/src/plugins/scaffolder/actions/custom/awsS3WriteFile.ts
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';

export const awsS3WriteFileAction = createTemplateAction({
  id: 'aws:s3:write-file',
  description: 'Writes text content to a file in S3',
  schema: {
    input: (z) => z.object({
      region: z.string(),
      bucketName: z.string(),
      path: z.string(), 
      content: z.string(),
    }),
  },
  async handler(ctx) {
    const client = new S3Client({ region: ctx.input.region });
    const { bucketName, path, content } = ctx.input;

    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: content,
      ContentType: 'text/plain',
      // ServerSideEncryption: 'AES256', // Optional: Enforce encryption
    }));

    ctx.logger.info(`Successfully uploaded file to s3://${bucketName}/${path}`);
  },
});
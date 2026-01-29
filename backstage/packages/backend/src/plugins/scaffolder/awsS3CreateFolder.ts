// packages/backend/src/plugins/scaffolder/actions/custom/awsS3CreateFolder.ts
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';

export const awsS3CreateFolderAction = createTemplateAction({
  id: 'aws:s3:create-folder',
  description: 'Creates a folder in an S3 bucket',
  schema: {
    input: zImpl => zImpl.object({
      bucketName: zImpl.string(),
      folderPath: zImpl.string(),
      region: zImpl.string(),
    }),
  },
  async handler(ctx) {
    const client = new S3Client({ region: ctx.input.region });
    const key = ctx.input.folderPath.endsWith('/') ? ctx.input.folderPath : `${ctx.input.folderPath}/`;

    await client.send(new PutObjectCommand({
      Bucket: ctx.input.bucketName,
      Key: key,
    }));

    ctx.logger.info(`Created S3 folder: s3://${ctx.input.bucketName}/${key}`);
  },
});
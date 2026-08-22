import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  status() {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const bucket = this.config.get<string>('S3_BUCKET');
    return {
      configured: Boolean(endpoint && bucket),
      bucket: bucket ?? null,
      provider: 'liara-object-storage',
    };
  }

  async ping() {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.config.get<string>('S3_SECRET_KEY');
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      return { ok: false, reason: 'not_configured' };
    }
    const client = new S3Client({
      region: this.config.get('S3_REGION') ?? 'us-east-1',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
    await client.send(new ListBucketsCommand({}));
    return { ok: true };
  }
}

import {
  ObjectCannedACL,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';

export interface S3PutObjectCommandParams {
  Bucket: string;
  Key: string;
  Body: any;
  ACL: ObjectCannedACL;
  Metadata?: Record<string, string>;
}

/* There are a few gotchyas I've discovered when working with the AWS SDK for S3 and Digital Ocean Spaces:
  1. The 'Bucket' property is the name of the bucket, not the full path to the bucket.
  2. The 'Key' property is the full path to the file, including the file name. Do not include a leading forward slash.
  3. Remember that NEXTJS environment variables are not available in the browser by default, so we need to use NEXT_PUBLIC_ to make them available.
*/

// This should not be used directly but instead create an interactor that uses this class to upload files to the S3/Spaces resource.
export class SpacesFileUploader {
  private client: S3Client = new S3Client({
    endpoint: process.env.NEXT_PUBLIC_SPACES_ENDPOINT,
    forcePathStyle: false,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_SPACES_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.NEXT_PUBLIC_SPACES_SECRET_KEY as string,
    },
  });

  public async uploadObject(params: S3PutObjectCommandParams): Promise<PutObjectCommandOutput> {
    try {
      const data = await this.client.send(new PutObjectCommand(params));
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

// This encapsulates boiler plate logic to upload images (event or avatar to S3)
// It will return the cdnResolve path if successfully uploaded. Then forms can use it to send to the server.

import { S3PutObjectCommandParams, SpacesFileUploader } from '../spaces-file-uploader';
import { generateFilename } from './generate-filename';

export enum ImageType {
  EVENT = 'event_images',
  USER = 'user_avatars',
}

export interface SpacesImageInteractorParams {
  file: File;
  objectNameSeed: string;
  imageType: ImageType;
}

export const SpacesImageInteractor = {
  upload: async ({
    file,
    imageType,
    objectNameSeed,
  }: SpacesImageInteractorParams): Promise<string> => {
    const randomFileName: string = generateFilename(objectNameSeed);

    // Setup file params
    const fileParams: S3PutObjectCommandParams = {
      Bucket: process.env.NEXT_PUBLIC_SPACES_AVATAR_BUCKET_PATH!,
      Key: `${imageType}/${randomFileName}`,
      Body: file,
      ACL: 'public-read',
    };

    const cdnResolvePath = `${process.env.NEXT_PUBLIC_SPACES_AVATAR_CDN_PATH}/${imageType}/${randomFileName}`;

    try {
      console.info('Attempting to load image to s3');
      const upLoader: SpacesFileUploader = new SpacesFileUploader();
      await upLoader.uploadObject(fileParams);
      console.log('image uploaded', cdnResolvePath);
      return cdnResolvePath;
    } catch (e: any) {
      console.error('S3 upload error', e.message);
      throw new Error('S3 upload error', e.message);
    }
  },
};

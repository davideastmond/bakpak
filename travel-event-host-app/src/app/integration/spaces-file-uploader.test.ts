import { SpacesFileUploader } from './spaces-file-uploader';
let mockValue: any;

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => mockValue),
    PutObjectCommand: jest.fn(),
  };
});

describe('SpacesFileUploader', () => {
  describe('OK case', () => {
    beforeAll(() => {
      mockValue = {
        send: jest.fn().mockResolvedValue({ status: 'ok' }),
      };
    });

    test('it should send correctly', async () => {
      const uploader = new SpacesFileUploader();
      const params = {
        Bucket: 'bucket',
        Key: 'somekey',
        ACL: 'public-read' as any,
        Body: 'somebody',
      };

      const res = await uploader.uploadObject(params);
      expect(res).toBeDefined();
      expect((res as any).status).toBe('ok');
    });
  });

  describe('error case', () => {
    beforeAll(() => {
      mockValue = {
        send: jest.fn().mockImplementation(() => Promise.reject(new Error('custom error'))),
      };
    });

    test('it should throw an error', async () => {
      const uploader = new SpacesFileUploader();
      const params = {
        Bucket: 'bucket',
        Key: 'somekey',
        ACL: 'public-read' as any,
        Body: 'somebody',
      };
      await expect(uploader.uploadObject(params)).rejects.toThrow('custom error');
    });
  });
});

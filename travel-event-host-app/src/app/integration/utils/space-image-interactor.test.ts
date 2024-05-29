import { SpacesFileUploader } from '../spaces-file-uploader';
import { ImageType, SpacesImageInteractor } from './spaces-image-interactor';

describe('space-image-interactor', () => {
  test('should return a cdn resolve path string', async () => {
    // Arrange
    const file = new File([''], 'filename');
    const imageType = ImageType.USER;
    const objectNameSeed = '123';

    const SpacesFileUploaderSpy = jest
      .spyOn(SpacesFileUploader.prototype, 'uploadObject')
      .mockResolvedValue({} as any);

    // Act
    const cdResolvePath = await SpacesImageInteractor.upload({ file, imageType, objectNameSeed });
    expect(SpacesFileUploaderSpy).toHaveBeenCalled();
    expect(cdResolvePath).toBeDefined();
  });
  test('should throw an error if the uploader fails', async () => {
    // Arrange
    const file = new File([''], 'filename');
    const imageType = ImageType.USER;
    const objectNameSeed = '123';

    jest
      .spyOn(SpacesFileUploader.prototype, 'uploadObject')
      .mockRejectedValue(new Error('Failed to upload'));

    // Act
    await expect(
      SpacesImageInteractor.upload({ file, imageType, objectNameSeed }),
    ).rejects.toThrow();
  });
});

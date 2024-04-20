import { SampleImageLoader } from './sample-image-loader';

describe('sample-image-loader', () => {
  it('should load an image file', () => {
    // Arrange
    const e = {
      target: {
        files: [
          {
            type: 'image/png',
            size: 1000,
          },
        ],
      },
    };
    const setFormValuesFunction = jest.fn();
    const setImagePreviewFunction = jest.fn();
    const onLoadFn = jest.fn();
    const fileReader = {
      onload: onLoadFn(),
      readAsDataURL: jest.fn(),
    };
    const FileReader = jest.fn(() => fileReader);
    (global as any).FileReader = FileReader;
    // Act
    SampleImageLoader.load(e as any, setFormValuesFunction, setImagePreviewFunction);
    // Assert
    expect(setFormValuesFunction).toHaveBeenCalled();
    expect(onLoadFn).toHaveBeenCalled();
    expect(fileReader.readAsDataURL).toHaveBeenCalledWith(e.target.files[0]);
  });

  it('should throw an error when the file is not an image', () => {
    // Arrange
    const e = {
      target: {
        files: [
          {
            type: 'text/plain',
          },
        ],
      },
    };
    const setFormValuesFunction = jest.fn();
    const setImagePreviewFunction = jest.fn();
    // Act
    // Assert
    expect(() =>
      SampleImageLoader.load(e as any, setFormValuesFunction, setImagePreviewFunction),
    ).toThrow('File is not an image');
  });

  it('should throw an error when the file is too large', () => {
    // Arrange
    const e = {
      target: {
        files: [
          {
            type: 'image/png',
            size: 3000000,
          },
        ],
      },
    };
    const setFormValuesFunction = jest.fn();
    const setImagePreviewFunction = jest.fn();
    // Act
    // Assert
    expect(() =>
      SampleImageLoader.load(e as any, setFormValuesFunction, setImagePreviewFunction),
    ).toThrow('Image file is too large. It must be less than 2MB.');
  });
});

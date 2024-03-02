import React from 'react';

const MAX_FILE_SIZE: number = 2097152;
export const SampleImageLoader = {
  load: (
    e: React.ChangeEvent<HTMLInputElement>,
    setFormValuesFunction: React.Dispatch<React.SetStateAction<any>>,
    setImagePreviewFunction: React.Dispatch<React.SetStateAction<any>>,
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image')) {
        throw new Error('File is not an image');
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image file is too large. It must be less than 2MB.');
      }
      setFormValuesFunction((prev: any) => ({
        ...prev,
        imageFile: file,
      }));

      const fileReader = new FileReader();
      fileReader.onload = (fileReaderEvent) => {
        setImagePreviewFunction(fileReaderEvent.target?.result);
      };

      fileReader.readAsDataURL(file);
    }
  },
};

import mongoose from 'mongoose';

export function generateFilename(id: string): string {
  const randomMongoId = new mongoose.Types.ObjectId();
  return `${id}-${randomMongoId.toString()}`;
}

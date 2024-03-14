import mongoose from 'mongoose';

export const isValidMongoId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

import { SecureUser } from '@/lib/definitions/secure-user';
import { connectMongoDB } from '@/lib/mongodb';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { profileUpdateValidationSchema } from '@/lib/yup-validators/profile-update/profile-update-validator';
import { userScopesValidator } from '@/lib/yup-validators/users/user-scopes-validator';
import { UserRepository } from '@/schemas/user';

import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectMongoDB();

  const { id } = params;
  if (!isValidMongoId(id))
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const scopes = searchParams.getAll('scope');

  // Validate the scopes
  try {
    await userScopesValidator.validate(scopes, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(e, { status: 400 });
  }

  let userFound: Partial<SecureUser> | undefined = undefined;

  if (scopes.length > 0) {
    userFound = await UserRepository.findById(id).select(scopes.join(' '));
  } else {
    userFound = await UserRepository.findById(id).select('-password -admin -email');
  }

  if (userFound) return NextResponse.json(userFound, { status: 200 });
  return NextResponse.json({ message: `User ${id} not found.` }, { status: 404 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!isValidMongoId(id))
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });

  const requestBody = await req.json();
  try {
    await profileUpdateValidationSchema.validate(requestBody, { abortEarly: false });
  } catch (validationError: any) {
    return NextResponse.json(validationError, { status: 400 });
  }

  // We expect firstName, lastName, bio, imageUrl from the request body and they shall be patched 😏
  // Bio can be an empty string. imageUrl can be null.
  const { firstName, lastName, bio, imageUrl, deleteImageUrl } = requestBody;

  const user = await UserRepository.findById(id);
  if (!user) return NextResponse.json({ message: `User ${id} not found.` }, { status: 404 });

  user.firstName = firstName;
  user.lastName = lastName;
  user.bio = bio;

  if (imageUrl) user.imageUrl = imageUrl;

  if (deleteImageUrl) user.imageUrl = undefined;
  await user.save();
  return NextResponse.json({ message: `User ${id} updated.` }, { status: 200 });
}

import { connectMongoDB } from '@/lib/mongodb';
import { UserRepository } from '@/schemas/user';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { registrationValidationSchema } from '../../endpoint-validation/schemas/registration-validation.schema';

export async function POST(req: NextRequest) {
  const requestBody = await req.json();

  // TODO: Validation. Needs to be refactored. it should be middleware
  try {
    await registrationValidationSchema.validate(requestBody, { abortEarly: false });
  } catch (validationError: any) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const { email, password, firstName, lastName, location } = requestBody;
  const hashedPassword = await bcrypt.hash(password, 10);

  await connectMongoDB();
  const existingUser = await UserRepository.findOne({
    email: email,
  });

  if (existingUser) {
    return NextResponse.json(
      { message: 'Unable to create account. Please try again with a different e-mail address.' },
      { status: 403 },
    );
  }

  const newUser = await UserRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    location,
  });

  return NextResponse.json({ message: newUser.id }, { status: 201 });
}

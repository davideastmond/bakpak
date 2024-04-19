import { userIdValidator } from '@/app/api/endpoint-validation/schemas/user-id-validator.schema';
import { connectMongoDB } from '@/lib/mongodb';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { EventRepository } from '@/schemas/user-event';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const requestBody = await req.json();
  // Validate request body for userId
  try {
    await userIdValidator.validate(requestBody, { abortEarly: false });
  } catch (error: any) {
    return NextResponse.json(error, { status: 500 });
  }

  if (!isValidMongoId(id))
    return NextResponse.json({ message: `Invalid ObjectId format ${id}` }, { status: 400 });

  const { userId } = requestBody;

  await connectMongoDB();
  const event = await EventRepository.findById(id);
  if (!event) return NextResponse.json({ message: 'Event does not exist' }, { status: 400 });

  if (!event.participants.some((p) => p.userId === userId)) {
    event.participants.push({ userId, timeStamp: new Date() });
    await event.save();
    return NextResponse.json({ message: 'User registered' }, { status: 200 });
  }
  return NextResponse.json({ message: 'User already present' }, { status: 409 });
}

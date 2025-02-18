import { userIdValidator } from '@/app/api/endpoint-validation/schemas/user-id-validator.schema';
import { connectMongoDB } from '@/lib/mongodb';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { EventRepository } from '@/schemas/user-event';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const requestBody = await req.json();
  // TODO: This needs to be middleware
  try {
    await userIdValidator.validate(requestBody, { abortEarly: false });
  } catch (e) {
    return NextResponse.json(e, { status: 400 });
  }

  const { id } = params;
  if (!isValidMongoId(id))
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });

  await connectMongoDB();
  const event = await EventRepository.findById(id);
  if (!event) return NextResponse.json({ message: `Event ${id} not found` }, { status: 404 });

  const { userId } = requestBody;

  if (event.participants.some((p) => p.userId === userId)) {
    event.participants = event.participants.filter((p) => p.userId !== userId);
    await event.save();
    return NextResponse.json({ message: 'User unregistered' }, { status: 200 });
  }

  return NextResponse.json({ message: `User ${userId} not found on event ${id}` }, { status: 400 });
}

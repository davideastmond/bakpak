import { connectMongoDB } from '@/lib/mongodb';
import {
  eventCreateValidationSchema,
  eventLocationRouteValidationSchema,
} from '@/lib/yup-validators/event/event-create-validation.schema';
import { EventRepository } from '@/schemas/user-event';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await connectMongoDB();
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

  if (!isValidObjectId) {
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });
  }

  const eventFound = await EventRepository.findById(id);
  if (eventFound) return NextResponse.json(eventFound, { status: 200 });
  return NextResponse.json({ message: `Event with id ${id} not found` }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await connectMongoDB();
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) {
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });
  }

  const requestBody = await req.json();

  // Perform validation on basic fields
  const { title, description, startDate, endDate, imageUrl, categories, location } = requestBody;
  try {
    await eventCreateValidationSchema.validate(requestBody, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(e, { status: 400 });
  }

  // There is a location, validate it
  if (location) {
    try {
      await eventLocationRouteValidationSchema.validate({ location }, { abortEarly: false });
    } catch (e: any) {
      return NextResponse.json(e, { status: 400 });
    }
  }

  const userEvent = await EventRepository.findById(id);
  if (!userEvent)
    return NextResponse.json({ message: `Event with id ${id} not found` }, { status: 404 });
  userEvent.title = title;
  userEvent.description = description;
  userEvent.startDate = dayjs(startDate).toDate();
  userEvent.endDate = dayjs(endDate).toDate();
  userEvent.categories = categories;

  if (location) userEvent.location = location;

  userEvent.imageUrl = imageUrl;
  await userEvent.save();

  return NextResponse.json({ message: `Event with id ${id} updated` }, { status: 200 });
}

import { connectMongoDB } from '@/lib/mongodb';
import { createNewMessageValidator } from '@/lib/yup-validators/messages/messages-validator';
import { MessageThreadRepository } from '@/schemas/messaging/message-thread.schema';
import { UserRepository } from '@/schemas/user';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import authOptions from '../../auth/auth-options';

export async function POST(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  // Do some validation. We expect initiator, recipients and message to be present.
  try {
    await createNewMessageValidator.validate(requestBody);
  } catch (e: any) {
    return NextResponse.json(e, { status: 400 });
  }
  // Extract the data from the body
  const { initiator, recipients, message } = requestBody;

  await connectMongoDB();
  // grab the initiator
  const initiatorUser = await UserRepository.findById(initiator);
  if (!initiatorUser) {
    return NextResponse.json({ message: 'Initiator not found' }, { status: 404 });
  }

  // Find the recipients. There should be at least one!
  const recipientUsers = await UserRepository.find({ _id: { $in: recipients } });
  if (recipientUsers.length === 0) {
    return NextResponse.json({ message: 'No recipients found' }, { status: 404 });
  }

  // Create a new thread, but first check if there is already a thread between these users
  const existingThread = await MessageThreadRepository.findOne({
    originator: initiator,
    recipients: { $all: recipients },
  });

  if (existingThread) {
    existingThread.messages.push({
      parentThreadId: existingThread._id,
      sender: initiator,
      body: message,
      timestamp: new Date(),
      recipients: [...recipientUsers, initiatorUser].map((user) => user._id),
      readStatus: {
        ...recipientUsers.reduce((acc, user) => ({ ...acc, [user._id]: false }), {}),
        [session.user._id]: true,
      },
    });
    console.log(existingThread.messages);
    await existingThread.save();

    return NextResponse.json({ status: 'success', id: existingThread._id }, { status: 201 });
  }

  const newThread = await MessageThreadRepository.create({
    originator: initiatorUser._id,
    recipients: [...recipientUsers, initiatorUser].map((user) => user._id),
    createdDate: new Date(),
    updatedDate: new Date(),
  });

  newThread.messages.push({
    parentThreadId: newThread._id,
    sender: initiatorUser._id,
    body: message,
    timestamp: new Date(),
    recipients: [...recipientUsers.map((user) => user._id), initiatorUser._id],
    readStatus: {
      ...recipientUsers.reduce((acc, user) => ({ ...acc, [user._id]: false }), {}),
      [session.user._id]: true,
    },
  });

  console.log(newThread.messages);
  await newThread.save();

  return NextResponse.json({ status: 'success', id: newThread._id }, { status: 201 });
}

export async function GET(req: NextRequest, res: NextResponse) {
  // Get the user id from the session (we don't need to pass the userId in the query params because only the authenticated user can access their own threads)
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectMongoDB();
  const threads = await MessageThreadRepository.find({ recipients: session.user._id });

  return NextResponse.json(threads, { status: 200 });
}

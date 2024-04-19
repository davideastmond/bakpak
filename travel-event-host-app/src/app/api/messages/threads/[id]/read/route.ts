import authOptions from '@/app/api/auth/auth-options';
import { connectMongoDB } from '@/lib/mongodb';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { Message } from '@/models/messaging/message.model';
import { MessageThreadRepository } from '@/schemas/messaging/message-thread.schema';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// This handles marking a thread as read for some specific user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!isValidMongoId(id))
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Connect to db and find the thread in question
  await connectMongoDB();

  const threadContext = await MessageThreadRepository.findById(id);
  if (!threadContext)
    return NextResponse.json({ message: `Thread ${id} not found` }, { status: 404 });

  // All the messages in that thread need to be searched for the user and marked as read
  threadContext.messages.forEach((message: Message) => {
    if (message.recipients.includes(session.user._id)) {
      message.readStatus[session.user._id] = true;
    }
  });
  threadContext.markModified('messages');
  await threadContext.save();
  return NextResponse.json(threadContext, { status: 200 });
}

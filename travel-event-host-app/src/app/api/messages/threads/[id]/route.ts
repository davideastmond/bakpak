import authOptions from '@/app/api/auth/auth-options';
import { connectMongoDB } from '@/lib/mongodb';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { postMessageToThreadValidator } from '@/lib/yup-validators/messages/messages-validator';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { MessageThreadRepository } from '@/schemas/messaging/message-thread.schema';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!isValidMongoId(id))
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const requestBody = await req.json();
  // Validate the requestBody with a yup validator
  try {
    await postMessageToThreadValidator.validate(requestBody, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(e, { status: 400 });
  }
  await connectMongoDB();
  const { content } = requestBody;

  // We need to find the thread and post the message
  // TODO: Notifications? what do we do about them

  const threadContext: MessageThread | null = await MessageThreadRepository.findById(id);
  if (!threadContext)
    return NextResponse.json({ message: `Thread ${id} not found` }, { status: 404 });

  threadContext.messages.push({
    parentThreadId: id,
    sender: session.user._id,
    body: content,
    recipients: threadContext.recipients,
    timestamp: new Date(),
    readStatus: {
      ...threadContext.recipients.reduce((acc, user) => ({ ...acc, [user]: false }), {}),
      [session.user._id]: true,
    },
  } as any);

  await (threadContext as any).save();
  return NextResponse.json(threadContext, { status: 200 });
}

export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  /* The philosophy of message threads when some user wants to delete it on the client side 
    is to delete the requesting user from the recipients list (instead of deleting the whole thread)
  */

  // TODO: We can push a "user left thread" message to the thread stream
  // Because users who have left will not be associated with the thread anymore
  // and their avatar data will not be available to the thread
  const { id } = params;
  if (!isValidMongoId(id))
    return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  /* The id of the thread is in the URL (params) and the user who should
   be removed from the recipients list is in the session object.
   We should validate that the requesting user is part of the recipients list 
   */

  await connectMongoDB();
  const threadContext: MessageThread | null = await MessageThreadRepository.findById(id);

  if (!threadContext)
    return NextResponse.json({ message: `Thread ${id} not found` }, { status: 404 });

  if (!threadContext.recipients.includes(session.user._id))
    return NextResponse.json(
      { message: `user: ${session.user._id} not in threadContext: ${id}` },
      { status: 400 },
    );

  threadContext.recipients = threadContext.recipients.filter(
    (userId) => userId !== session.user._id,
  );
  await (threadContext as any).save();

  return NextResponse.json(threadContext, { status: 200 });
}

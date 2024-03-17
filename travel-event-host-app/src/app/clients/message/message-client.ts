import { MessageThread } from '@/models/messaging/message-thread.model';

export interface CreateAndPostMessageArgs {
  initiator: string; // mongoId
  recipients: string[]; // mongoIds
  message: string;
}
export const MessageClient = {
  getMessageThreadContextById: async (threadId: string): Promise<void> => {
    // Gets data about thread
  },

  getAllThreadContexts: async (): Promise<MessageThread[]> => {
    const endpoint = `/api/messages/threads`;
    const req = await fetch(endpoint);
    if (!req.ok) {
      throw new Error('Error: Cannot fetch threads');
    }
    const res = await req.json();
    return res as MessageThread[];
  },

  createThreadAndPostMessage: async ({
    initiator,
    recipients,
    message,
  }: CreateAndPostMessageArgs): Promise<{ status: string; id: string }> => {
    // This should return a thread ID
    const endpoint = '/api/messages/threads';
    const req = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initiator, message, recipients }),
    });
    if (!req.ok) {
      throw new Error('Error: Cannot create thread');
    }
    const response = await req.json();
    return response as { status: string; id: string };
  },
  postMessageToThread: async ({
    threadId,
    content,
  }: {
    threadId: string;
    content: string;
  }): Promise<MessageThread> => {
    const endpoint = `/api/messages/threads/${threadId}`;

    const req = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!req.ok) throw new Error('Error: Cannot post message');
    const response = await req.json();
    return response as MessageThread; // If successful, this returns an updated thread
  },
};

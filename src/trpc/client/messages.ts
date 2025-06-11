import { client } from '@/trpc/client/api';
import { MessageEvent } from '@/models/events';

const publishMessage = (message: MessageEvent) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return (client as any).messages.publish.mutate(message);
};

export {
    publishMessage,
};
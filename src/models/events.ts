import { z } from 'zod';
import { event } from '@innobridge/qatar';
import { Message } from '@/models/messages';
import { connection } from '@innobridge/usermanagement';

const BaseEventSchema = z.object({
    type: z.string(),
    userIds: z.array(z.string()),
});

const MessageEventSchema = BaseEventSchema.extend({
    type: z.literal('message'),
    message: z.object({
        chatId: z.string(),
        messageId: z.string(),
        userIds: z.array(z.string()),
        senderId: z.string(),
        content: z.string(),
        createdAt: z.number(),
    }),
});

interface MessageEvent extends event.BaseEvent {
    type: 'message';
    message: Message
}

interface ConnectionRequestEvent extends event.BaseEvent {
    type: 'connectionRequest';
    connectionRequest: connection.ConnectionRequest;
};

export {
    BaseEventSchema,
    MessageEventSchema,
    MessageEvent,
    ConnectionRequestEvent
};
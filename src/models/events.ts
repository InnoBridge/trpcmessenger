import { z } from 'zod';
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

interface BaseEvent {
    type: string;
    userIds: string[];
}

interface MessageEvent extends BaseEvent {
    type: 'message';
    message: Message
}

interface ConnectionRequestEvent extends BaseEvent {
    type: 'connectionRequest';
    connectionRequest: connection.ConnectionRequest;
};

export {
    BaseEventSchema,
    MessageEventSchema,
    BaseEvent,
    MessageEvent,
    ConnectionRequestEvent
};
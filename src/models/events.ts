import { z } from 'zod';
import { chats } from '@innobridge/lexi';
import { connection } from '@innobridge/usermanagement';

const BaseEventSchema = z.object({
    type: z.string(),
    userIds: z.array(z.string()),
});

// const MessageEventSchema = BaseEventSchema.extend({
//     type: z.literal('message'),
//     message: z.object({
//         chatId: z.string(),
//         messageId: z.string(),
//         userIds: z.array(z.string()),
//         senderId: z.string(),
//         content: z.string(),
//         createdAt: z.number(),
//     }),
// });

interface BaseEvent {
    type: string;
    userIds: string[];
}

interface ChatMessageEvent extends BaseEvent {
    type: 'chatMessage';
    chat: chats.Chat;
    message: chats.Message;
};

interface ChatDeletionEvent extends BaseEvent {
    type: 'chatDeletion';
    chatId: string;
};

interface ConnectionRequestEvent extends BaseEvent {
    type: 'connectionRequest';
    connectionRequest: connection.ConnectionRequest;
};

interface ConnectionDeletionEvent extends BaseEvent {
    type: 'connectionDeletion';
    connectionId: number;
};

export {
    BaseEventSchema,
    BaseEvent,
    ChatMessageEvent,
    ChatDeletionEvent,
    ConnectionRequestEvent,
    ConnectionDeletionEvent
};
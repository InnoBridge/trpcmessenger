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

enum ScheduleAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}

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

interface ConnectionRequestAcceptedEvent extends BaseEvent {
    type: 'connectionRequestAccepted';
    connectionRequest: connection.ConnectionRequest;
    connection: connection.Connection;
};

interface ConnectionDeletionEvent extends BaseEvent {
    type: 'connectionDeletion';
    connectionId: number;
};

interface ScheduleEvent extends BaseEvent {
    type: 'schedule';
    action: ScheduleAction;
    eventId?: string;
};

export {
    BaseEventSchema,
    ScheduleAction,
    BaseEvent,
    ChatMessageEvent,
    ChatDeletionEvent,
    ConnectionRequestEvent,
    ConnectionRequestAcceptedEvent,
    ConnectionDeletionEvent,
    ScheduleEvent
};
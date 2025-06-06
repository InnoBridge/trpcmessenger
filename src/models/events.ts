import { z } from 'zod';

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

export {
    BaseEventSchema,
    MessageEventSchema,
};
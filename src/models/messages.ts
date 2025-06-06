import { z } from 'zod';

const MessageSchema = z.object({
    chatId: z.string(),
    messageId: z.string(),
    userIds: z.array(z.string()),
    senderId: z.string(),
    content: z.string(),
    createdAt: z.number(),
});

export {
    MessageSchema,
};
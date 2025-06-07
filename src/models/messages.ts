import { z } from 'zod';

const MessageSchema = z.object({
    chatId: z.string(),
    messageId: z.string(),
    userIds: z.array(z.string()),
    senderId: z.string(),
    content: z.string(),
    createdAt: z.number(),
});

interface Message {
    chatId: string;
    messageId: string;
    userIds: string[];
    senderId: string;
    content: string;
    createdAt: number;
};

export {
    MessageSchema,
    Message
};
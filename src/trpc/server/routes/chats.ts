import { z } from 'zod';
import { trpc } from '@/trpc/server/trpc';
import { chatsApi, chats } from '@innobridge/lexi';
import {
    queueApi
} from '@innobridge/qatar';
import { connectionsApi } from '@innobridge/usermanagement';
import { PaginatedResult } from '@/models/pagination';
import { ChatDeletionEvent, ChatMessageEvent } from '@/models/events';
import { ChatMessagePair } from '@/models/chats';
import { randomUUID } from 'crypto';

const {
    getConnectionById
} = connectionsApi;

const { publishEvent } = queueApi;

const getChatByConnectionId = trpc.procedure
    .input(z.object({ connectionId: z.number() }))
    .query(async ({ input }): Promise<any> => {
        return await chatsApi.getChatByConnectionId(input.connectionId);
    });

const getChatByChatId = trpc.procedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input }): Promise<any> => {
        return await chatsApi.getChatByChatId(input.chatId);
    });

const getChatsByUserId = trpc.procedure
    .input(z.object({
        userId: z.string(),
        updatedAfter: z.number().optional(),
        page: z.number().default(0),
        limit: z.number().default(20)
    }))
    .query(async ({ input }): Promise<any> => {
        const offset = input.page * input.limit;
        const data = await chatsApi.getChatsByUserId(
            input.userId,
            input.updatedAfter,
            input.limit,
            offset
        );
        // Get total count (you'll need to add this API method)
        const totalChat = await chatsApi.getChatsByUserId(input.userId, input.updatedAfter);
        const totalCount = totalChat!.length;

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / input.limit);
        const hasNext = (input.page + 1) * input.limit < totalCount;

        return {
            data,
            pagination: {
                totalCount,
                totalPages,
                currentPage: input.page,
                hasNext
            }
        } as PaginatedResult<chats.Chat>;
    });

const deleteChat = trpc.procedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ input }): Promise<void> => {
        try {
            const chat = await chatsApi.getChatByChatId(input.chatId);
            await chatsApi.deleteChat(chat!.chatId);
            const chatDeletion: ChatDeletionEvent = {
                type: 'chatDeletion',
                userIds: [chat!.userId1, chat!.userId2],
                chatId: chat!.chatId,
            };
            await publishEvent(chatDeletion);
        } catch (error) {
            console.error(`❌ Error deleting chat:`, input.chatId, error);
            throw new Error('Failed to delete chat');
        }
    });

const getMessagesByChatId = trpc.procedure
    .input(z.object({ 
        chatId: z.string(),
        createdAfter: z.number().optional(),
        page: z.number().default(0),
        limit: z.number().default(20)
    }))
    .query(async ({ input }): Promise<any> => {
        const offset = input.page * input.limit;
        const data = await chatsApi.getMessagesByChatId(
            input.chatId,
            input.createdAfter,
            input.limit,
            offset
        );
        // Get total count (you'll need to add this API method)
        const totalMessages = await chatsApi.getMessagesByChatId(input.chatId, input.createdAfter);
        const totalCount = totalMessages!.length;

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / input.limit);
        const hasNext = (input.page + 1) * input.limit < totalCount;

        return {
            data,
            pagination: {
                totalCount,
                totalPages,
                currentPage: input.page,
                hasNext
            }
        } as PaginatedResult<chats.Message>;
    });

const getMessagesByUserId = trpc.procedure
    .input(z.object({ 
        userId: z.string(),
        createdAfter: z.number().optional(),
        page: z.number().default(0),
        limit: z.number().default(20)
    }))
    .query(async ({ input }): Promise<any> => {
        const offset = input.page * input.limit;
        const data = await chatsApi.getMessagesByUserId(
            input.userId,
            input.createdAfter,
            input.limit,
            offset
        );
        // Get total count (you'll need to add this API method)
        const totalMessages = await chatsApi.getMessagesByUserId(input.userId, input.createdAfter);
        const totalCount = totalMessages!.length;

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / input.limit);
        const hasNext = (input.page + 1) * input.limit < totalCount;

        return {
            data,
            pagination: {
                totalCount,
                totalPages,
                currentPage: input.page,
                hasNext
            }
        } as PaginatedResult<chats.Message>;
    });

const createMessage = trpc.procedure
    .input(z.object({
        connectionId: z.number(),
        senderId: z.string(),
        content: z.string()
    }))
    .mutation(async ({ input }): Promise<any> => {
        const { connectionId, senderId, content } = input;
        try {
            let chat = await chatsApi.getChatByConnectionId(connectionId);

            if (!chat) {
                const connection = await getConnectionById(connectionId);
                if (!connection) {
                    throw new Error(`Connection not found for ID: ${connectionId}`);
                }

                const chatId = randomUUID();
                chat = await chatsApi.addChat(
                    chatId, 
                    connection.connectionId, 
                    connection.userId1,
                    connection.userId2
                );
            }
            
            const messageId = randomUUID();
            const message = await chatsApi.addMessage(
                messageId,
                chat.chatId,
                senderId,
                content
            );

            const receiverId = chat.userId1 === senderId ? chat.userId2 : chat.userId1;

            const chatMessageEvent: ChatMessageEvent = {
                type: 'chatMessage',
                userIds: [receiverId],
                chat: chat,
                message: message
            };

            await publishEvent(chatMessageEvent);
            return {
                chat,
                message
            } as ChatMessagePair;
        } catch (error: any) {
            console.error(`❌ Error sending message:`, error.message);
            throw new Error('Failed to send message');
        }
    });

const chatsRouter = trpc.router({
    getChatByConnectionId: getChatByConnectionId,
    getChatByChatId: getChatByChatId,
    getChatsByUserId: getChatsByUserId,
    deleteChat: deleteChat,
    getMessagesByChatId: getMessagesByChatId,
    getMessagesByUserId: getMessagesByUserId,
    createMessage: createMessage
});

export { 
    chatsRouter 
};
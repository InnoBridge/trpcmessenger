import { client } from '@/trpc/client/api';
import { chats } from '@innobridge/lexi';
import { PaginatedResult } from '@/models/pagination';
import { ChatMessagePair } from '@/models/chats';

const getChatByConnectionId = async (connectionId: number): Promise<chats.Chat | null> => {
    return await (client as any).chats.getChatByConnectionId.query({ connectionId });
};

const getChatByChatId = async (chatId: string): Promise<chats.Chat | null> => {
    return await (client as any).chats.getChatByChatId.query({ chatId });
};

const getChatsByUserId = async (
    userId: string,
    updatedAfter?: number,
    limit: number = 20,
    offset: number = 0
): Promise<PaginatedResult<chats.Chat>> => {
    return await (client as any).chats.getChatsByUserId.query({
        userId,
        updatedAfter,
        limit,
        offset
    });
};

const deleteChat = async (chatId: string): Promise<void> => {
    return await (client as any).chats.deleteChat.mutate({ chatId });
}

const getMessagesByChatId = async (
    chatId: string,
    createdAfter?: number,
    limit: number = 20,
    offset: number = 0
): Promise<PaginatedResult<chats.Message>> => {
    return await (client as any).chats.getMessagesByChatId.query({
        chatId,
        createdAfter,
        limit,
        offset
    });
};

const getMessagesByUserId = async (
    userId: string,
    createdAfter?: number,
    limit: number = 20,
    offset: number = 0
): Promise<PaginatedResult<chats.Message>> => {
    return await (client as any).chats.getMessagesByUserId.query({
        userId,
        createdAfter,
        limit,
        offset
    });
};

const createMessage = async (
    connectionId: number,
    senderId: string,
    content: string
): Promise<ChatMessagePair> => {
    return await (client as any).chats.createMessage.mutate({
        connectionId,
        senderId,
        content
    });
};

export {
    getChatByConnectionId,
    getChatByChatId,
    getChatsByUserId,
    deleteChat,
    getMessagesByChatId,
    getMessagesByUserId,
    createMessage
};
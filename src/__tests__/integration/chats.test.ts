import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient
} from '@/trpc/client/api';
import {
    createConnectionRequest,
    acceptConnectionRequest,
    deleteConnection,
    deleteConnectionRequest,
    getConnectionByUserIdsPair
} from '@/trpc/client/connections';
import {
    createMessage,
    getChatByConnectionId,
    getChatByChatId,
    getChatsByUserId,
    getMessagesByChatId,
    getMessagesByUserId,
    deleteChat
} from '@/trpc/client/chats';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;
const USER1 = process.env.USER1;
const USER2 = process.env.USER2;

const chatsTest = async (connectionId: number) => {
    console.log('Starting chats test...');

    try {
        // Creating Message
        const chatMessagePair = await createMessage(
            connectionId,
            USER1!,
            'Hello from USER1!'
        );
        console.log("chatMessagePair:", chatMessagePair);

        const chatId = chatMessagePair.chat.chatId;

        const chatByConnectionId = await getChatByConnectionId(connectionId);
        console.log("Chat by connection ID:", chatByConnectionId);

        const chatByUserId = await getChatByChatId(chatId);
        console.log("Chat by user ID:", chatByUserId);

        const chatsByUserId = await getChatsByUserId(USER1!);
        console.log("Chats by user ID:", chatsByUserId);

        const messagesByChatId = await getMessagesByChatId(chatId);
        console.log("Messages by chat ID:", messagesByChatId);

        const messagesByUserId = await getMessagesByUserId(USER1!);
        console.log("Messages by user ID:", messagesByUserId);
        // Chat will be deleted when we deleteConnection
        // deleteChat(chatMessagePair.chat.chatId);
    } catch (error) {
        console.error('Chats test failed:', error);
        throw error;
    }
};

(async function main() {
    let connection = null;
    let connectionRequest = null;
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);
        connectionRequest = await createConnectionRequest(USER1!, USER2!);
        await acceptConnectionRequest(connectionRequest.requestId, USER2!);
        connection = await getConnectionByUserIdsPair(USER1!, USER2!);
        
        await chatsTest(connection!.connectionId);

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
    } finally {
        // Cleanup
        if (connectionRequest) {
            console.log('🧹 Deleting connection request...');
            await deleteConnectionRequest(connectionRequest.requestId);
        }
        if (connection) {
            console.log('🧹 Deleting connection...');
            await deleteConnection(connection.connectionId);
        }
        process.exit(1);
    }
})();
import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient, 
} from '@/trpc/client/api';
import {
    publishMessage
} from '@/trpc/client/messages';
import { MessageEvent } from '@/models/events';
import { Message } from '@/models/messages';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;
const USER1 = process.env.USER1;
const USER2 = process.env.USER2;

const sendMessageTest = async (message: MessageEvent) => {
    console.log('Starting message publishing test...');

    const result = await publishMessage(message);
    console.log('Message published successfully', result);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(async function main() {
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        const message1: Message = {
            chatId: 'chat-123',
            messageId: 'message-123', // Keep same ID
            userIds: [USER1!, USER2!],
            senderId: '456',
            content: 'Hello15, published message1!',
            createdAt: new Date().getTime(),
        };

        const message2: Message = {
            chatId: 'chat-123',
            messageId: 'message-124', // Keep same ID
            userIds: [USER1!, USER2!],
            senderId: '456',
            content: 'Hello15, published message2!',
            createdAt: new Date().getTime(),
        };
        const messaggeEvent1: MessageEvent = {
            type: 'message',
            userIds: message1.userIds,
            message: message1,
        };
        const messaggeEvent2: MessageEvent = {
            type: 'message',
            userIds: message2.userIds,
            message: message2,
        };

        // await delay(2000);
        // await sendMessageTest(messaggeEvent1);
        // await delay(500); // Small delay between messages
        await sendMessageTest(messaggeEvent2);

        // await delay(5000); // Wait to receive
        // subscription.unsubscribe(); // Unsubscribe after tests

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    } finally {
        process.exit(1);
    }
})();
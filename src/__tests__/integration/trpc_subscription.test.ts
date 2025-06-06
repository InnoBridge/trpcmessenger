import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient, 
    publishMessage,
    subscribeToEvents
} from '@/trpc/client/api';
import { event } from '@innobridge/qatar';
import { MessageEvent } from '@/models/events';
import { Message } from '@/models/messages';
import { M } from 'vitest/dist/chunks/environment.d.Dmw5ulng.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;

const userId = process.argv[2] || 'default-user-123';

const subscribeToMessagesTest = async () => {
    console.log('Starting message subscription test...');
    const messages: Message[] = [];
    const subscription = await subscribeToEvents(userId, (event: event.BaseEvent) => {
        console.log('Received event:', JSON.stringify(event, null, 2));
        const message = event as MessageEvent;
        messages.push(message.message);
    });
    console.log("Read messages:", messages);
    console.log('Subscribed to messages for user:', userId);
    return subscription;
};

const sendMessageTest = (message: MessageEvent) => {
    console.log('Starting message publishing test...');

    publishMessage(message);
    console.log('Message published successfully');
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(async function main() {
        let subscription: any;
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // promise tests in order
        subscription = await subscribeToMessagesTest();

       // Wait for subscription to be established
        console.log('Waiting for subscription to be established...');
        console.log('Subscription result:', subscription);

        const message1: Message = {
            chatId: 'chat-123',
            messageId: 'message-123', // Keep same ID
            userIds: ['123', '456'],
            senderId: '456',
            content: 'Hello12, published message1!',
            createdAt: new Date().getTime(),
        };

        const message2: Message = {
            chatId: 'chat-123',
            messageId: 'message-124', // Keep same ID
            userIds: ['123', '456'],
            senderId: '456',
            content: 'Hello13, published message2!',
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
        sendMessageTest(messaggeEvent1);
        // await delay(500); // Small delay between messages
        sendMessageTest(messaggeEvent2);

        // await delay(5000); // Wait to receive
        // subscription.unsubscribe(); // Unsubscribe after tests

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    } finally {
        // Cleanup
        if (subscription) {
            console.log('🧹 Unsubscribing...');
            // subscription.unsubscribe();
        }
    }
})();
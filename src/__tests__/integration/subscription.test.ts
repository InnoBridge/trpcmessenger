import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient, 
    publishMessage,
    subscribeToEvents
} from '@/trpc/client/api';
import { event } from '@innobridge/qatar';
import { MessageEvent, ConnectionRequestEvent } from '@/models/events';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;

const USER1 = process.env.USER1;
const USER2 = process.env.USER2;
let userId = null;
let subscription: any = null; // Move outside to make it accessible to signal handlers

switch (process.argv[2]) {
    case '1':
        userId = USER1;
        break;
    case '2':
        userId = USER2;
        break;
    default:
        userId = USER1; // Default to USER1 if no argument is provided
};

const subscribeToEvent = async () => {
    console.log('Starting subscription test...');
    console.log('Using userId:', userId);
    const subscription = await subscribeToEvents(userId!, (event: event.BaseEvent, ack, nack) => {
        try {
            console.log('Received event:', event.type);
            switch (event.type) {
                case 'message':
                    const messageEvent = event as MessageEvent;
                    console.log('Message Event:', messageEvent);
                    break;
                case 'connectionRequest':
                    const connectionRequestEvent = event as ConnectionRequestEvent;
                    console.log('Connection Request Event:', connectionRequestEvent);
                    break;
                default:
                    console.warn('Unhandled event type:', event.type);
            }
            ack();
        } catch (error) {
            console.error('Error handling event:', error);
            if (nack) {
                nack(); // Notify RabbitMQ that the message was not processed successfully
            }
            throw new Error('tRPC Client Failed to process event');
        }
    });
    console.log('Subscribed to messages for user:', userId);
    return subscription;
};

// Cleanup function
const cleanup = async () => {
    if (subscription) {
        console.log('\n🧹 Cleaning up subscription...');
        try {
            subscription.unsubscribe();
            console.log('✅ Successfully unsubscribed');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }
    process.exit(0);
};

// Handle Ctrl+C (SIGINT)
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT (Ctrl+C), cleaning up...');
    cleanup();
});

// Handle termination (SIGTERM)
process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, cleaning up...');
    cleanup();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    cleanup();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    cleanup();
});

(async function main() {
        let subscription: any;
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // promise tests in order
        subscription = await subscribeToEvent();

       // Wait for subscription to be established
        console.log('Waiting for subscription to be established...');
        console.log('Subscription result:', subscription);

        console.log("🎉 All integration tests passed");
    } catch (err) {
       console.error("❌ Integration tests failed:", err);
        await cleanup();
        process.exit(1);
    }
})();
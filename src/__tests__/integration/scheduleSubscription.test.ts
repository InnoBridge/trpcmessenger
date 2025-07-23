import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient, 
    subscribeToEvents
} from '@/trpc/client/api';
import {
    bindSubscriberToSchedule,
    unbindSubscriberToSchedule
} from '@/trpc/client/schedule';
import { event } from '@innobridge/qatar';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;

interface Subscription {
    unsubscribe: () => void;
}

let subscription: Subscription | null = null; // Move outside to make it accessible to signal handlers

const providerId = process.argv[2] || 'default-user-123';

const subscriberId = process.argv[3] || 'default-subscriber-456';

const subscribeToScheduleEvent = async (providerId: string, subscriberId: string) => {
    console.log('Starting schedule subscription test...');
    console.log('Using providerId:', providerId);
    console.log('Using subscriberId:', subscriberId);
    subscription = await subscribeToEvents(subscriberId, (event: event.BaseEvent, ack, nack) => {
        try {
            console.log('Received schedule event:', event.type);
            switch (event.type) {
                case 'scheduleEvent':
                    console.log('Schedule Event:', event);
                    break;
                default:
                    console.warn('Unhandled schedule event type:', event.type);
            }
            ack();
        } catch (error) {
            console.error('Error handling schedule event:', error);
            if (nack) {
                nack(); // Notify RabbitMQ that the message was not processed successfully
            }
        }
    });
    await bindSubscriberToSchedule(providerId, subscriberId);
    console.log('Subscription established successfully');
    return subscription;
};

// Cleanup function
const cleanup = async () => {
    console.log('Cleaning up...');
    try {
        await unbindSubscriberToSchedule(providerId, subscriberId);
        console.log('Unbound subscriber from schedule');
    } catch (error) {
        console.error('Error unbinding subscriber from schedule:', error);
    }
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
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // promise tests in order
        await subscribeToScheduleEvent(
            providerId, 
            subscriberId
        );

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
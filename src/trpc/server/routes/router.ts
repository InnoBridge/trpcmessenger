import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import {
    queueApi,
} from '@innobridge/qatar';
import { EventEmitter } from 'events';
import { connectionsRouter } from '@/trpc/server/routes/connections';
import { chatsRouter } from '@/trpc/server/routes/chats';
import { usersRouter } from '@/trpc/server/routes/users';

const { subscribeUser, unsubscribeUser } = queueApi;

const subscribeToEvent = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .subscription(async function* ({ input, signal }) {
        console.log(`🔄 Setting up centralized event subscription for user: ${input.userId}`);
        
        const emitter = new EventEmitter();
        let hasSubscribed = false;
        let isConnectionClosed = false;
        const eventQueue: any[] = []; // Buffer events until we can yield them
        let isReady = false;

        try {
            // Listen for abort signal (when client disconnects)
            signal?.addEventListener('abort', () => {
                console.log(`🛑 Client disconnected: ${input.userId}`);
                isConnectionClosed = true;
                emitter.emit('close');
            });

            // SET UP EVENT LISTENER FIRST (before subscribing to RabbitMQ)
            emitter.on('event', (eventData) => {
                console.log(`📥 Event received on emitter for user ${input.userId}:`, eventData.type);
                
                if (isReady) {
                    // If we're ready, process immediately
                    // This won't work because we can't yield from here
                    // So we need to queue it
                    eventQueue.push(eventData);
                } else {
                    // Buffer events until ready
                    console.log(`⏳ Buffering event for user ${input.userId} - not ready yet`);
                    eventQueue.push(eventData);
                }
            });

            // Subscribe to user's unified event queue
            await subscribeUser(input.userId, (event, ack, nack) => {
                console.log(`📡 New event for user ${input.userId}:`, event.type);
                emitter.emit('event', {
                    ...event,
                    _ack: ack,
                    _nack: nack
                });
            });

            hasSubscribed = true;
            console.log(`✅ Successfully subscribed to event queue: ${input.userId}`);

            // Signal ready
            yield { type: 'ready', message: 'Subscription established and ready' };
            isReady = true;

            // Process any buffered events first
            console.log(`📤 Processing ${eventQueue.length} buffered events for user ${input.userId}`);
            while (eventQueue.length > 0) {
                const bufferedEvent = eventQueue.shift();
                const { _ack, _nack, ...event } = bufferedEvent;
                
                yield event;
                
                if (_ack) {
                    _ack();
                    console.log(`✅ ACKed buffered event for user ${input.userId}`);
                }
            }

            // Yield events as they arrive
          // Yield events as they arrive - SIMPLE VERSION
    while (!signal?.aborted) {
        // Check if we have events in the queue
        if (eventQueue.length > 0) {
            const eventData = eventQueue.shift();
            const { _ack, _nack, ...event } = eventData;
            
            yield event;
            
            if (_ack) {
                _ack();
            }
        } else {
            // Wait a bit and check again
            await new Promise(resolve => setTimeout(resolve, 10));
            
            if (isConnectionClosed) {
                break;
            }
        }
    }

        } catch (error) {
            if (!isConnectionClosed) {
                console.error(`❌ Error in event subscription ${input.userId}:`, error);
                throw error;
            }
        } finally {
            if (hasSubscribed) {
                console.log(`🧹 Cleaning up event subscription: ${input.userId}`);
                try {
                    await unsubscribeUser(input.userId);
                } catch (cleanupError) {
                    console.error(`⚠️ Error during cleanup for user ${input.userId}:`, cleanupError);
                }
            }
        }
    });

const eventsRouter = trpc.router({
    subscribeUser: subscribeToEvent,
})

const router = trpc.router({
    events: eventsRouter,
    chats: chatsRouter,
    connections: connectionsRouter,
    users: usersRouter,
});

export { router };
export type AppRouter = typeof router;
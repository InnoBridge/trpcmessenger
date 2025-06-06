import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import {
    queueApi,
} from '@innobridge/qatar';
import { EventEmitter } from 'events';

const { unsubscribeUser, subscribeUser } = queueApi;

const subscribeUserToEvents = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .subscription(async function* ({ input, signal }) {
        console.log(`🔄 Setting up centralized event subscription for user: ${input.userId}`);
        
        const emitter = new EventEmitter();
        let hasSubscribed = false;
        let isConnectionClosed = false;

        try {
            // Subscribe to user's unified event queue
            await subscribeUser(input.userId, (event) => {
                console.log(`📡 New event for user ${input.userId}:`, event.type);
                emitter.emit('event', event);
            });

            hasSubscribed = true;
            console.log(`✅ Successfully subscribed to event queue: ${input.userId}`);

            // Listen for abort signal (when client disconnects)
            signal?.addEventListener('abort', () => {
                console.log(`🛑 Client disconnected: ${input.userId}`);
                isConnectionClosed = true;
                emitter.emit('close');
            });

            // Yield events as they arrive
            while (!signal?.aborted) {
                const event = await new Promise<any>((resolve, reject) => {
                    const onEvent = (evt: any) => {
                        cleanup();
                        resolve(evt);
                    };
                    
                    const onClose = () => {
                        cleanup();
                        if (isConnectionClosed) {
                            resolve(null); // Signal end of stream
                        } else {
                            reject(new Error('Connection closed unexpectedly'));
                        }
                    };
                    
                    emitter.once('event', onEvent);
                    emitter.once('close', onClose);
                    
                    const cleanup = () => {
                        emitter.off('event', onEvent);
                        emitter.off('close', onClose);
                    };
                });

                if (event === null) {
                    console.log(`✅ Normal disconnect for user: ${input.userId}`);
                    break;
                }

                yield event;
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
    subscribeUser: subscribeUserToEvents,
});

export { eventsRouter };
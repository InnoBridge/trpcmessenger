import { trpc } from '@/trpc/server/trpc';
import {
    queueApi
} from '@innobridge/qatar';
import { MessageEventSchema } from '@/models/events';

const { publishEvent } = queueApi;

const publish = trpc.procedure
    .input(MessageEventSchema)
    .mutation(async ({ input }) => { 
        await publishEvent(input);
        return { success: true };
});

const messagesRouter = trpc.router({
    publish: publish,
});

export { messagesRouter };
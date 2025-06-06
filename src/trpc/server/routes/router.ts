import { trpc } from '@/trpc/server/trpc';
import { eventsRouter } from '@/trpc/server/routes/events';
import { messagesRouter } from '@/trpc/server/routes/messages';

const router = trpc.router({
    events: eventsRouter,
    messages: messagesRouter
});

export { router };
export type AppRouter = typeof router;
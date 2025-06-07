import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import { connectionsApi, connection } from '@innobridge/usermanagement';
import {
    queueApi
} from '@innobridge/qatar';

const {
    getConnectionRequestsByUserId,
    createConnectionRequest,
    // cancelConnectionRequest,
    // acceptConnectionRequest,
    // rejectConnectionRequest,
    deleteConnectionRequest,
    // getConnectionByUserIdsPair,
    // getConnectionsByUserId,
    // deleteConnectionById
} = connectionsApi;

const getRequests = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }): Promise<any> => {
        return await getConnectionRequestsByUserId(input.userId);
    });

const createRequest = trpc.procedure
    .input(z.object({
        requesterId: z.string(),
        receiverId: z.string(),
        greetingText: z.string().optional(),
    }))
    .mutation(async ({ input }): Promise<any> => {
        return await createConnectionRequest(
            input.requesterId,
            input.receiverId,
            input.greetingText
        );
    });

const deleteRequest = trpc.procedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input }): Promise<void> => {
        return await deleteConnectionRequest(input.requestId);
    });

const connectionsRouter = trpc.router({
    getRequests: getRequests,
    createRequest: createRequest,
    deleteRequest: deleteRequest,
});

export { 
    connectionsRouter
};
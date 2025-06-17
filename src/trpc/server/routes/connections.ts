import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import { connectionsApi } from '@innobridge/usermanagement';
import { chatsApi } from '@innobridge/lexi';
import {
    queueApi
} from '@innobridge/qatar';
import { ConnectionRequestEvent, ConnectionRequestAcceptedEvent, ConnectionDeletionEvent } from '@/models/events';

const { publishEvent } = queueApi;

const {
    getConnectionRequestsByUserId,
    createConnectionRequest,
    cancelConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    deleteConnectionRequest,
    deleteConnectionById
} = connectionsApi;
const { 
    getChatByConnectionId,
    deleteChat
} = chatsApi;


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
        try {
            const connectionRequest = await createConnectionRequest(
                input.requesterId,
                input.receiverId,
                input.greetingText
            );
            const connectionRequestEvent: ConnectionRequestEvent = {
                type: 'connectionRequest',
                userIds: [input.receiverId],
                connectionRequest: connectionRequest,
            };
            publishEvent(connectionRequestEvent);
            return connectionRequest;
        } catch (error) {
            console.error(`❌ Error creating connection request:`, error);
            if (error instanceof Error) {
                throw new Error(`Failed to create connection request: ${error.message}`);
            }
            throw new Error('Failed to create connection request');
        }
    });

const cancelRequest = trpc.procedure
    .input(z.object({ requestId: z.number(), requesterId: z.string() }))
    .mutation(async ({ input }): Promise<any> => {
        try {
            const connectionRequest = await cancelConnectionRequest(input.requestId, input.requesterId);
            if (!connectionRequest) {
                throw new Error("Connection request not found or already processed.");
            }
            const connectionRequestEvent: ConnectionRequestEvent = {
                type: 'connectionRequest',
                userIds: [connectionRequest.receiverId],
                connectionRequest: connectionRequest,
            };
            await publishEvent(connectionRequestEvent);
            return connectionRequest;
        } catch (error) {
            console.error(`❌ Error canceling connection request:`, error);            
            if (error instanceof Error && error.message.includes("Connection request not found")) {
                throw error;
            }            
            throw new Error('Failed to cancel connection request');
        }
    });

const acceptRequest = trpc.procedure
    .input(z.object({ requestId: z.number(), receiverId: z.string() }))
    .mutation(async ({ input }): Promise<any> => {
        try {
            const connectionRequest = await acceptConnectionRequest(input.requestId, input.receiverId);
            if (!connectionRequest) {
                throw new Error("Connection request not found or already processed.");
            }

            const connection = await connectionsApi.getConnectionByUserIdsPair(
                connectionRequest.requesterId, 
                connectionRequest.receiverId
            );

            if (!connection) {
                throw new Error("Connection not found for the accepted request.");
            }

            // Single event with both the connection request and the new connection
            const connectionRequestAcceptedEvent: ConnectionRequestAcceptedEvent  = {
                type: 'connectionRequestAccepted',
                userIds: [connectionRequest.requesterId, connectionRequest.receiverId],
                connectionRequest: connectionRequest,
                connection: connection, 
            };
            await publishEvent(connectionRequestAcceptedEvent);

            return connectionRequest;
        } catch (error) {
            console.error(`❌ Error accepting connection request:`, error);
            if (error instanceof Error && error.message.includes("Connection request not found")) {
                throw error;
            }
            throw new Error('Failed to accept connection request');
        }
    });

const rejectRequest = trpc.procedure
    .input(z.object({ requestId: z.number(), receiverId: z.string() }))
    .mutation(async ({ input }): Promise<any> => {
        try {
            const connectionRequest = await rejectConnectionRequest(input.requestId, input.receiverId);
            if (!connectionRequest) {
                throw new Error("Connection request not found or already processed.");
            }
            const connectionRequestEvent: ConnectionRequestEvent = {
                type: 'connectionRequest',
                userIds: [connectionRequest.requesterId],
                connectionRequest: connectionRequest,
            };
            await publishEvent(connectionRequestEvent);
            return connectionRequest;
        } catch (error) {
            console.error(`❌ Error rejecting connection request:`, error);
            if (error instanceof Error && error.message.includes("Connection request not found")) {
                throw error;
            }
            throw new Error('Failed to reject connection request');
        }
    });

const deleteRequest = trpc.procedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input }): Promise<void> => {
        try {
            await deleteConnectionRequest(input.requestId);
        } catch (error) {
            console.error(`❌ Error deleting connection request:`, error);
            throw new Error('Failed to delete connection request');
        }    
    });

const getConnectionByUserIdsPair = trpc.procedure
    .input(z.object({
        userId1: z.string(),
        userId2: z.string(),
    }))
    .query(async ({ input }): Promise<any> => {
        return await connectionsApi.getConnectionByUserIdsPair(input.userId1, input.userId2);
    });

const getConnectionsByUserId = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }): Promise<any> => {
        return await connectionsApi.getConnectionsByUserId(input.userId);
    });

const deleteConnection = trpc.procedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ input }): Promise<void> => {
        try {
            const connection = await connectionsApi.getConnectionById(input.connectionId);
            if (!connection) {
                throw new Error(`Connection not found for ID: ${input.connectionId}`);
            }
            await deleteConnectionById(input.connectionId);
            const chat = await getChatByConnectionId(input.connectionId);
            if (chat) {
                await deleteChat(chat.chatId);
            }
            const connectionDeletionEvent: ConnectionDeletionEvent = {
                type: 'connectionDeletion',
                userIds: [connection.userId1, connection.userId2],
                connectionId: input.connectionId,
            };
            await publishEvent(connectionDeletionEvent);
        } catch (error) {
            console.error(`❌ Error deleting connection:`, error);
            throw new Error('Failed to delete connection');
        }
    });

const connectionsRouter = trpc.router({
    getRequests: getRequests,
    createRequest: createRequest,
    cancelRequest: cancelRequest,
    acceptRequest: acceptRequest,
    rejectRequest: rejectRequest,
    deleteRequest: deleteRequest,
    getConnectionByUserIdsPair: getConnectionByUserIdsPair,
    getConnectionsByUserId: getConnectionsByUserId,
    deleteConnection: deleteConnection,
});

export { 
    connectionsRouter
};
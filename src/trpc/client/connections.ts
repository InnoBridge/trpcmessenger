import { client } from '@/trpc/client/api';
import { connection } from '@innobridge/usermanagement'

const getConnectionRequests = async (userId: string): Promise<connection.ConnectionRequest[]> => {
    return await client!.connections.getRequests.query({ userId });
};

const createConnectionRequest = async (
    requesterId: string,
    receiverId: string,
    greetingText?: string
): Promise<connection.ConnectionRequest> => {
    return await client!.connections.createRequest.mutate({
        requesterId,
        receiverId,
        greetingText
    });
};

const cancelConnectionRequest = async (
    requestId: number,
    requesterId: string
): Promise<connection.ConnectionRequest | null> => {
    return await client!.connections.cancelRequest.mutate({ requestId, requesterId });
};

const acceptConnectionRequest = async (
    requestId: number,
    receiverId: string
): Promise<connection.ConnectionRequest | null> => {
    return await client!.connections.acceptRequest.mutate({ requestId, receiverId });
}

const rejectConnectionRequest = async (
    requestId: number,
    receiverId: string
): Promise<connection.ConnectionRequest | null> => {
    return await client!.connections.rejectRequest.mutate({ requestId, receiverId });
}

const deleteConnectionRequest = async (requestId: number): Promise<void> => {
    return await client!.connections.deleteRequest.mutate({ requestId });
};

const getConnectionByUserIdsPair = async (
    userId1: string,
    userId2: string
): Promise<connection.Connection | null> => {
    return await client!.connections.getConnectionByUserIdsPair.query({ userId1, userId2 });
};

const getConnectionsByUserId = async (userId: string): Promise<connection.Connection[]> => {
    return await client!.connections.getConnectionsByUserId.query({ userId });
};

const deleteConnection = async (connectionId: number): Promise<void> => {
    return await client!.connections.deleteConnection.mutate({ connectionId });
};

export {
    getConnectionRequests,
    createConnectionRequest,
    cancelConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    deleteConnectionRequest,
    getConnectionByUserIdsPair,
    getConnectionsByUserId,
    deleteConnection
};
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

const deleteConnectionRequest = async (requestId: number): Promise<void> => {
    return await client!.connections.deleteRequest.mutate({ requestId });
};

export {
    getConnectionRequests,
    createConnectionRequest,
    deleteConnectionRequest
};
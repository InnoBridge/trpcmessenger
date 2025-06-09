import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient
} from '@/trpc/client/api';
import {
    getConnectionRequests,
    createConnectionRequest,
    cancelConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    deleteConnectionRequest,
    getConnectionByUserIdsPair,
    getConnectionsByUserId,
    deleteConnection
} from '@/trpc/client/connections';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;
const USER1 = process.env.USER1;
const USER2 = process.env.USER2;
const NON_EXISTENT_USER = process.env.NON_EXISTENT_USER;

const createConnectionRequestNonExistentUserTest = async () => {
    console.log('Starting createConnectionRequest with non-existent user test...');
    try {
        await createConnectionRequest(USER1!, NON_EXISTENT_USER!, 'Test message');
    } catch (error: any) {
        console.error('Expected error for non-existent user:', error.message);
    }
};

const createConnectionRequestTest = async () => {
    console.log('Starting createConnectionRequest test...');
    let connectionRequest;
    try {
        connectionRequest = await createConnectionRequest(USER1!, USER2!, 'Test message');
        console.log('Connection request created successfully:', connectionRequest);
        const connectionRequests = await getConnectionRequests(USER2!);
        console.log('Connection requests for user:', USER2, connectionRequests);
        console.log('Connection request test completed successfully');
    } catch (error) {
        console.error('Failed to create connection request:', error);
        throw error;
    } finally {
        if (connectionRequest) {
            await deleteConnectionRequest(connectionRequest.requestId);
        }
    }
};

const cancelConnectionRequestTest = async () => {
    console.log('Starting cancelConnectionRequest test...');
    let connectionRequest;
    try {
        connectionRequest = await createConnectionRequest(USER1!, USER2!, 'Test message');
        console.log('Connection request created successfully:', connectionRequest);
        const connectionRequests = await getConnectionRequests(USER2!);
        console.log('Connection requests for user:', USER2, connectionRequests);
        const cancelledRequest = await cancelConnectionRequest(connectionRequest.requestId, USER1!);
        console.log('Connection request cancelled successfully:', cancelledRequest);
        const connectionRequestsAfterCancellation = await getConnectionRequests(USER2!);
        console.log('Connection requests after cancellation for user:', USER2, connectionRequestsAfterCancellation);
        console.log('Cancel connection request test completed successfully');
    } catch (error) {
        console.error('Failed to cancel connection request:', error);
        throw error;
    } finally {
        if (connectionRequest) {
            await deleteConnectionRequest(connectionRequest.requestId);
        }
    }
};

const acceptConnectionRequestTest = async () => {
    console.log('Starting acceptConnectionRequest test...');
    let connectionRequest;
    try {
        connectionRequest = await createConnectionRequest(USER1!, USER2!, 'Test message');
        console.log('Connection request created successfully:', connectionRequest);
        const connectionRequests = await getConnectionRequests(USER2!);
        console.log('Connection requests for user:', USER2, connectionRequests);
        const cancelledRequest = await acceptConnectionRequest(connectionRequest.requestId, USER2!);
        console.log('Connection request accept successfully:', cancelledRequest);
        const connectionRequestsAfterCancellation = await getConnectionRequests(USER2!);
        console.log('Connection requests after accept for user:', USER2, connectionRequestsAfterCancellation);
        console.log('Accept connection request test completed successfully');
    } catch (error) {
        console.error('Failed to accept connection request:', error);
        throw error;
    } finally {
        const connection = await getConnectionByUserIdsPair(USER1!, USER2!);
        console.log ('Connection between users:', USER1, USER2, connection);
        const connections = await getConnectionsByUserId(USER1!);
        console.log ('Connections for user:', USER1, connections);
        if (connection) {
            await deleteConnection(connection.connectionId);
            console.log('Connection deleted successfully');
        }
        if (connectionRequest) {
            await deleteConnectionRequest(connectionRequest.requestId);
        }
    }
};
    
const rejectConnectionRequestTest = async () => {
    console.log('Starting rejectConnectionRequest test...');
    let connectionRequest;
    try {
        connectionRequest = await createConnectionRequest(USER1!, USER2!, 'Test message');
        console.log('Connection request created successfully:', connectionRequest);
        const connectionRequests = await getConnectionRequests(USER2!);
        console.log('Connection requests for user:', USER2, connectionRequests);
        await rejectConnectionRequest(connectionRequest.requestId, USER2!);
        const rejectedRequest = await getConnectionRequests(USER2!);
        console.log('Connection request rejected successfully:', rejectedRequest);
        console.log('Reject connection request test completed successfully');
    } catch (error) {
        console.error('Failed to reject connection request:', error);
        throw error;
    } finally {
        if (connectionRequest) {
            await deleteConnectionRequest(connectionRequest.requestId);
        }
    }
};

(async function main() {
        let subscription: any;
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // async tests in order
        await createConnectionRequestNonExistentUserTest();
        // await createConnectionRequestTest();
        // await cancelConnectionRequestTest();
        await acceptConnectionRequestTest();
        // await rejectConnectionRequestTest();

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    } finally {
        // Cleanup
        // if (subscription) {
        //     console.log('🧹 Unsubscribing...');
        //     // subscription.unsubscribe();
        // }
    }
})();